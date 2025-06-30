import { CardRoot } from "@/components/Card";
import { VisitorTable } from "./components/Table";
import { useTableVisitorsController } from "./tableVisitors.controller";

export const TabeleVisitors = () => {
  const controller = useTableVisitorsController();
  return (
    <div>
      <input
        type="text"
        placeholder="Pesquisar..."
        value={controller.search}
        onChange={(e) => controller.setSearch(e.target.value)}
        className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <CardRoot className="h-[50vh] scrollable-content relative ">
        <VisitorTable {...controller} />
      </CardRoot>
    </div>
  );
};
