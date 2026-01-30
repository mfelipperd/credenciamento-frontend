import { MetaPixel } from "@/components/MetaPixel/MetaPixel";
import { FormularioCredenciamento } from "./FormCreateVisitor";

export const PublicFormtotem = () => {
  return (
    <section
      className="relative flex flex-col items-center justify-center bg-neutral-100  lg:bg-white lg:py-20 scrollable-content background-with-filter h-screen"
      style={{
        backgroundImage:
          "linear-gradient(rgba(var(--brand-blue-rgb), 1), rgba(var(--brand-blue-rgb), 0.65)), url(/logo.png)",
        backgroundColor: "hsl(var(--brand-blue))",
      }}
    >
      <p
        className=" rounded-full
    absolute top-5
    text-[110px] font-bold text-white
    px-4 py-1 
           /* fundo escuro semi-transparente */
    drop-shadow-[0_4px_6px_rgba(15, 35, 72, 0.6)] /* sombra maior atrás */
  "
      >
        CREDENCIAMENTO
      </p>
      <div className="w-full lg:w-fit p-5   bg-neutral-100  lg:rounded-3xl sm:border-amber-300 lg:shadow-2xl py-10 -translate-y-40">
        <h1 className="text-brand-pink uppercase text-center text-2xl font-semibold ">
          Faça seu credenciamento
        </h1>
        <MetaPixel pixelId="798068891626886" eventName="InitiateCheckout" />
        <FormularioCredenciamento />
      </div>
    </section>
  );
};
