import { LoginForm } from "./components/LoginForm";

export const Login = () => {
  return (
    <section className="flex flex-col items-center justify-center bg-neutral-100 h-[100vh] lg:bg-white lg:py-40 scrollable-content">
      <div className="w-full lg:w-fit p-5 flex flex-col gap-6 items-center   bg-neutral-100  lg:rounded-3xl sm:border-amber-300 lg:shadow-md ">
        <img src="/logo.png" className="w-3xs animate-pulse" />
        <h1 className="text-blue-950 uppercase text-center text-2xl font-bold w-96 animate-pulse">
          Login{" "}
        </h1>
        <LoginForm />
      </div>
    </section>
  );
};
