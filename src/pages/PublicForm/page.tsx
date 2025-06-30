import { MetaPixel } from "@/components/MetaPixel/MetaPixel";
import { FormularioCredenciamento } from "./FormCreateVisitor";

export const PublicForm = () => {
  return (
    <section className="flex flex-col items-center justify-center bg-neutral-100  lg:bg-white lg:py-20 scrollable-content h-screen">
      <div className="w-full lg:w-fit p-5   bg-neutral-100  lg:rounded-3xl sm:border-amber-300 lg:shadow-md h-full ">
        <h1 className="text-pink-600 uppercase text-center text-2xl font-semibold ">
          Faça seu credenciamento
        </h1>
        <MetaPixel pixelId="798068891626886" eventName="InitiateCheckout" />
        <FormularioCredenciamento />
      </div>
    </section>
  );
};
