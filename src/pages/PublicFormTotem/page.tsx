import { MetaPixel } from "@/components/MetaPixel/MetaPixel";
import { FormularioCredenciamento } from "./FormCreateVisitor";

export const PublicFormtotem = () => {
  return (
    <section
      className="flex flex-col items-center justify-center bg-neutral-100  lg:bg-white lg:py-20 scrollable-content background-with-filter h-[100vh]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 35, 72, 0.65), rgba(15, 35, 72, 1)), url(/logo.png)",
        backgroundColor: "#0f2348",
      }}
    >
      <div className="w-full lg:w-fit p-5   bg-neutral-100  lg:rounded-3xl sm:border-amber-300 lg:shadow-2xl py-10 ">
        <h1 className="text-pink-600 uppercase text-center text-2xl font-semibold ">
          Faça seu credenciamento
        </h1>
        <MetaPixel pixelId="798068891626886" eventName="InitiateCheckout" />
        <FormularioCredenciamento />
      </div>
    </section>
  );
};
