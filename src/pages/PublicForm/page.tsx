import { FormularioCredenciamento } from "./FormCreateVisitor";

export const PublicForm = () => {
  return (
    <section className="flex flex-col items-center justify-center bg-neutral-100  lg:bg-white lg:py-20 scrollable-content">
      <div className="w-full lg:w-fit p-5   bg-neutral-100  lg:rounded-3xl sm:border-amber-300 lg:shadow-md ">
        <h1 className="text-pink-600 uppercase text-center text-2xl font-semibold ">
          Faça seu credenciamento
        </h1>
        <FormularioCredenciamento />
      </div>
    </section>
  );
};
