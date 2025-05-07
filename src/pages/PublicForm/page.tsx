import { FormularioCredenciamento } from "./FormCreateVisitor";

export const PublicForm = () => {
  return (
    <section className="h-full flex flex-col items-center justify-center bg-white py-20 overflow-hidden">
      <div className="w-fit  bg-neutral-100 p-5 rounded-3xl shadow-md ">
        <h1 className="text-pink-700 uppercase text-center text-2xl font-semibold ">
          Faça seu credenciamento
        </h1>
        <FormularioCredenciamento />
      </div>
    </section>
  );
};
