import { FormularioCredenciamento } from "./FormCreateVisitor";

export const PublicForm = () => {
  return (
    <section className="h-[80vh] translate-y-20  md:h-[80vh] md:translate-y-20 sm:h-[80vh]   sm flex flex-col items-center justify-center bg-white py-20 overflow-hidden">
      <div className="w-fit  bg-neutral-100 p-5 rounded-3xl shadow-md ">
        <h1 className="text-pink-600 uppercase text-center text-2xl font-semibold ">
          Faça seu credenciamento
        </h1>
        <FormularioCredenciamento />
      </div>
    </section>
  );
};
