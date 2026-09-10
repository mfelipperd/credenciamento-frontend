const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { EventEmitter } = require("node:events");
const { QueryClient, QueryObserver } = require("@tanstack/react-query");

const root = path.resolve(__dirname, "..");
const tick = () => new Promise(setImmediate);
function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

// Load production hooks with an HTTP stub. Query observers/cache below are real.
function loadModule(file, imports) {
  const source = fs.readFileSync(path.join(root, file), "utf8")
    .replaceAll("import.meta.env.VITE_API_BASE_URL", '"https://api.test"');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => {
      assert.ok(name in imports, `Unexpected dependency: ${name}`);
      return imports[name];
    },
    console,
  });
  return exports;
}

function queryHook(file, api) {
  return loadModule(file, {
    "@tanstack/react-query": { useQuery: (options) => options },
    "@/hooks/useAxio": { useAxio: () => api },
    "@/constants/AppEndpoints": { AppEndpoints: { STANDS: { AVAILABLE: "/stands/available" } } },
  });
}

function clientFor(t) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  t.after(() => client.clear());
  return client;
}

test("closed drawer does not fetch; drawer and selector share one request and fresh cache", async (t) => {
  const client = clientFor(t);
  let calls = 0;
  const pending = deferred();
  const { useAvailableStands } = queryHook("src/hooks/useAvailableStands.ts", {
    get: () => { calls++; return pending.promise; },
  });
  const drawer = new QueryObserver(client, useAvailableStands("fair-a", false));
  const stopDrawer = drawer.subscribe(() => {});
  assert.equal(calls, 0);
  drawer.setOptions(useAvailableStands("fair-a", true));
  const selector = new QueryObserver(client, useAvailableStands("fair-a"));
  const stopSelector = selector.subscribe(() => {});
  assert.equal(calls, 1);
  pending.resolve({ data: [{ id: "stand-1", standNumber: 1 }] });
  await tick();
  for (let i = 0; i < 5; i++) drawer.setOptions(useAvailableStands("fair-a", true));
  assert.equal(calls, 1, "rerenders must not refetch");
  stopDrawer();
  stopSelector();
  const reopened = new QueryObserver(client, useAvailableStands("fair-a"));
  const stopReopened = reopened.subscribe(() => {});
  assert.equal(calls, 1, "reopening uses fresh data");
  assert.equal(reopened.getCurrentResult().data[0].id, "stand-1");
  await client.invalidateQueries({ queryKey: ["stands", "fair-a"] });
  assert.equal(calls, 2, "a mutation can refresh availability");
  stopReopened();
});

test("in-flight dashboard request survives immediate unmount/remount without duplication", async (t) => {
  const client = clientFor(t);
  const pending = deferred();
  let calls = 0;
  const { useDashboardData } = queryHook("src/hooks/useDashboardData.ts", {
    get: () => { calls++; return pending.promise; },
  });
  const first = new QueryObserver(client, useDashboardData("/overview", "fair-a"));
  first.subscribe(() => {})();
  const second = new QueryObserver(client, useDashboardData("/overview", "fair-a"));
  const stop = second.subscribe(() => {});
  assert.equal(calls, 1);
  pending.resolve({ data: { totalVisitors: 10 } });
  await tick();
  assert.equal(second.getCurrentResult().data.totalVisitors, 10);
  stop();
});

test("dashboard isolates late responses by fair and day; missing fair makes no request", async (t) => {
  const client = clientFor(t);
  const requests = [];
  const { useDashboardData } = queryHook("src/hooks/useDashboardData.ts", {
    get: (_url, options) => {
      const pending = deferred();
      requests.push({ ...pending, params: options.params });
      return pending.promise;
    },
  });
  const observer = new QueryObserver(client, useDashboardData("/checkins", undefined));
  const stop = observer.subscribe(() => {});
  assert.equal(requests.length, 0);
  observer.setOptions(useDashboardData("/checkins", "fair-a", "2026-09-09"));
  observer.setOptions(useDashboardData("/checkins", "fair-b", "2026-09-10"));
  requests[1].resolve({ data: { fair: "b" } });
  await tick();
  requests[0].resolve({ data: { fair: "a" } });
  await tick();
  assert.equal(observer.getCurrentResult().data.fair, "b");
  assert.equal(requests[1].params.filterDay, "2026-09-10");
  stop();
});

function expressionFrom(file, predicate) {
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), "utf8"), ts.ScriptTarget.Latest, true);
  let found;
  function visit(node) {
    if (predicate(node, source)) found = node;
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(found, `Expression not found in ${file}`);
  return { found, source };
}

function evaluate(expression, context) {
  const code = ts.transpileModule(`(${expression})`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return vm.runInNewContext(code, context);
}

test("prospect list caches each filter/page separately and never displays a late previous search", async (t) => {
  const client = clientFor(t);
  const { found, source } = expressionFrom("src/pages/Marketing/ProspectsTab.tsx", (node) =>
    ts.isVariableDeclaration(node) && node.name.getText() === "listQuery");
  const pending = [];
  function options(search, page) {
    return evaluate(found.initializer.getText(source), {
      useQuery: (value) => value,
      fairId: "fair-a", page, LIMIT: 15, filterType: "ALL", filterStatus: "ALL", debouncedSearch: search,
      getProspects: (_id, params) => {
        const request = deferred();
        pending.push({ ...request, params });
        return request.promise;
      },
    });
  }
  const observer = new QueryObserver(client, options("old", 3));
  const stop = observer.subscribe(() => {});
  observer.setOptions(options("new", 1));
  assert.equal(pending.length, 2);
  assert.equal(pending[1].params.page, 1);
  pending[1].resolve({ data: [{ id: "new" }] });
  await tick();
  pending[0].resolve({ data: [{ id: "old" }] });
  await tick();
  assert.equal(observer.getCurrentResult().data.data[0].id, "new");
  observer.setOptions(options("old", 3));
  assert.equal(pending.length, 2, "returning to a fresh search uses cache");
  stop();
});

function timers() {
  let id = 0;
  const jobs = new Map();
  return {
    setTimeout: (fn) => { jobs.set(++id, fn); return id; },
    clearTimeout: (key) => jobs.delete(key),
    flush: () => { const batch = [...jobs.values()]; jobs.clear(); batch.forEach((fn) => fn()); },
  };
}

test("fair list starts only after login, needs no fairId and is shared by header and pages", async (t) => {
  const client = clientFor(t);
  let auth = { isAuthenticated: false, user: null };
  let calls = 0;
  const { useFairs } = loadModule("src/hooks/useFairs.ts", {
    "@tanstack/react-query": { useQuery: (options) => options },
    "@/service/fair.service": {},
    "@/hooks/useAuth": { useAuth: () => auth },
    "@/hooks/useAxio": { useAxio: () => ({ get: async (url, options) => {
      calls++;
      assert.equal(url, "/fairs");
      assert.equal(options.params, undefined);
      return { data: [{ id: `fair-${auth.user.id}` }] };
    } }) },
    "@/constants/AppEndpoints": { AppEndpoints: { FAIRS: { BASE: "/fairs" } } },
  });
  const header = new QueryObserver(client, { ...useFairs(), staleTime: 300_000 });
  const stopHeader = header.subscribe(() => {});
  assert.equal(calls, 0);
  auth = { isAuthenticated: true, user: { id: "user-a" } };
  header.setOptions({ ...useFairs(), staleTime: 300_000 });
  await tick();
  assert.equal(calls, 1);
  const page = new QueryObserver(client, { ...useFairs(), staleTime: 300_000 });
  const stopPage = page.subscribe(() => {});
  assert.equal(calls, 1);
  assert.equal(page.getCurrentResult().data[0].id, "fair-user-a");
  stopPage();
  auth = { isAuthenticated: true, user: { id: "user-b" } };
  header.setOptions({ ...useFairs(), staleTime: 300_000 });
  await tick();
  assert.equal(calls, 2);
  assert.equal(header.getCurrentResult().data[0].id, "fair-user-b");
  stopHeader();
});

test("failed fair list remains an error and can be retried instead of caching an empty success", async (t) => {
  const client = clientFor(t);
  let fail = true;
  const { useFairs } = loadModule("src/hooks/useFairs.ts", {
    "@tanstack/react-query": { useQuery: (options) => options },
    "@/service/fair.service": {},
    "@/hooks/useAuth": { useAuth: () => ({ isAuthenticated: true, user: { id: "user" } }) },
    "@/hooks/useAxio": { useAxio: () => ({ get: async () => {
      if (fail) throw new Error("offline");
      return { data: [{ id: "fair-a" }] };
    } }) },
    "@/constants/AppEndpoints": { AppEndpoints: { FAIRS: { BASE: "/fairs" } } },
  });
  const observer = new QueryObserver(client, useFairs());
  const stop = observer.subscribe(() => {});
  await tick();
  assert.equal(observer.getCurrentResult().isError, true);
  assert.equal(observer.getCurrentResult().data, undefined);
  fail = false;
  await observer.refetch();
  assert.equal(observer.getCurrentResult().data[0].id, "fair-a");
  stop();
});

test("header selects a valid fair and repairs URL without discarding existing filters", () => {
  const file = "src/components/Layout/mainLayout.tsx";
  const selection = expressionFrom(file, (node) =>
    ts.isVariableDeclaration(node) && node.name.getText() === "getInitialFairId");
  const sync = expressionFrom(file, (node) =>
    ts.isCallExpression(node) && node.expression.getText() === "useEffect");
  const context = {
    URLSearchParams,
    availableFairs: [{ id: "fair-a" }, { id: "fair-b" }],
    searchParams: new URLSearchParams("fairId=invalid&search=visitor&page=2"),
    savedFairId: "fair-b",
  };
  const selectedId = evaluate(selection.found.initializer.getText(selection.source), context)();
  assert.equal(selectedId, "fair-b");
  let navigations = 0;
  const runSync = () => evaluate(sync.found.arguments[0].getText(sync.source), {
    ...context, selectedId, loading: false, fairsError: false,
    setSearchParams: (params) => { context.searchParams = params; navigations++; },
  })();
  runSync();
  runSync();
  assert.equal(navigations, 1);
  assert.equal(context.searchParams.get("fairId"), "fair-b");
  assert.equal(context.searchParams.get("search"), "visitor");
  assert.equal(context.searchParams.get("page"), "2");
  context.searchParams = new URLSearchParams("fairId=fair-a");
  assert.equal(evaluate(selection.found.initializer.getText(selection.source), context)(), "fair-a");
  context.searchParams = new URLSearchParams();
  context.savedFairId = "unavailable";
  assert.equal(evaluate(selection.found.initializer.getText(selection.source), context)(), "fair-a");
});

test("prospect typing commits only the final search and resets page together", () => {
  const { found, source } = expressionFrom("src/pages/Marketing/ProspectsTab.tsx", (node) =>
    ts.isCallExpression(node) && node.expression.getText() === "useEffect");
  const clock = timers();
  const searches = [];
  const pages = [];
  const initialCleanup = evaluate(found.arguments[0].getText(source), {
    ...clock, search: "", debouncedSearch: "",
    setDebouncedSearch: (v) => searches.push(v), setPage: (v) => pages.push(v),
  })();
  clock.flush();
  assert.equal(initialCleanup, undefined);
  assert.equal(pages.length, 0, "mounting must not schedule a later pagination reset");
  let cleanup;
  for (const search of ["a", "ab", "abc"]) {
    cleanup?.();
    cleanup = evaluate(found.arguments[0].getText(source), {
      ...clock, search, debouncedSearch: "", setDebouncedSearch: (v) => searches.push(v), setPage: (v) => pages.push(v),
    })();
  }
  assert.equal(searches.length, 0);
  clock.flush();
  assert.deepEqual(searches, ["abc"]);
  assert.deepEqual(pages, [1]);
  cleanup();
});

test("CEP debounce avoids superseded requests and ignores an aborted response", async () => {
  const { found, source } = expressionFrom("src/pages/PrivateForm/FormCreateVisitor/index.tsx", (node, source) =>
    ts.isCallExpression(node) && node.expression.getText() === "useEffect" && node.getText(source).includes("viacep"));
  const clock = timers();
  const requests = [];
  const values = {};
  const run = (zipCode) => evaluate(found.arguments[0].getText(source), {
    ...clock, zipCode, AbortController, setIsFetchingCep: () => {},
    setValue: (key, value) => { values[key] = value; },
    fetch: (url, options) => {
      const pending = deferred();
      requests.push({ ...pending, url, signal: options.signal });
      return pending.promise;
    },
  })();
  run("11111111")();
  clock.flush();
  assert.equal(requests.length, 0);
  const cleanOld = run("22222222");
  clock.flush();
  cleanOld();
  const cleanNew = run("33333333");
  clock.flush();
  assert.equal(requests[0].signal.aborted, true);
  requests[1].resolve({ json: async () => ({ localidade: "New" }) });
  await tick();
  requests[0].resolve({ json: async () => ({ localidade: "Old" }) });
  await tick();
  assert.equal(values.city, "New");
  cleanNew();
});

test("socket cleanup removes its own listeners and disconnects only the last subscriber", () => {
  const cleanups = [];
  const sockets = [];
  const { useCheckinSocket } = loadModule("src/service/checkin.socket.ts", {
    react: { useEffect: (setup) => cleanups.push(setup()) },
    "socket.io-client": () => {
      const socket = new EventEmitter();
      socket.disconnects = 0;
      socket.disconnect = () => { socket.disconnects++; };
      sockets.push(socket);
      return socket;
    },
  });
  let deliveries = 0;
  useCheckinSocket(() => { deliveries++; });
  useCheckinSocket(() => { deliveries++; });
  assert.equal(sockets.length, 1);
  cleanups[0]();
  sockets[0].emit("checkinConfirmed", {});
  assert.equal(deliveries, 1);
  assert.equal(sockets[0].disconnects, 0);
  cleanups[1]();
  assert.equal(sockets[0].listenerCount("checkinConfirmed"), 0);
  assert.equal(sockets[0].listenerCount("connect"), 0);
  assert.equal(sockets[0].listenerCount("disconnect"), 0);
  assert.equal(sockets[0].disconnects, 1);
});
