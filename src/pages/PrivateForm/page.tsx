import { FormularioCredenciamento } from "./FormCreateVisitor";
import { FormErrorBoundary } from "@/components/FormErrorBoundary";

export const PrivateForm = () => {
  return (
    <FormErrorBoundary>
      <section
        className="flex flex-col items-center justify-center bg-neutral-100  lg:bg-white lg:py-20 scrollable-content background-with-filter"
        style={{
          backgroundImage:
            "linear-gradient(rgba(var(--brand-blue-rgb), 0.65), rgba(var(--brand-blue-rgb), 1)), url(/logo.png)",
          backgroundColor: "hsl(var(--brand-blue))",
        }}
      >
        <div className="w-full lg:w-fit p-5   bg-neutral-100  lg:rounded-3xl sm:border-amber-300 lg:shadow-2xl h-full ">
          <h1 className="text-brand-pink uppercase text-center text-2xl font-semibold ">
            Faça seu credenciamento
          </h1>
          <FormularioCredenciamento />
        </div>
      </section>
    </FormErrorBoundary>
  );
};
