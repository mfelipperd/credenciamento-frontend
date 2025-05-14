import { LoginForm } from "./components/LoginForm";

export const Login = () => {
  return (
    <section className="flex flex-col items-center justify-center bg-neutral-100  lg:bg-white lg:py-20 scrollable-content">
      <div className="w-full lg:w-fit p-5   bg-neutral-100  lg:rounded-3xl sm:border-amber-300 lg:shadow-md ">
        <LoginForm />
      </div>
    </section>
  );
};
