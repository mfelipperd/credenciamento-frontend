import { MetaPixel } from "@/components/MetaPixel/MetaPixel";
import { FormularioCredenciamento } from "./FormCreateVisitor";

export const PublicForm = () => {
  return (
    <section
      className="flex flex-col items-center justify-center bg-brand-blue min-h-screen py-10 lg:py-20 scrollable-content relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-cyan/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="w-full max-w-7xl px-4 lg:px-8 relative z-10 h-full flex flex-col items-center gap-12">
        <div className="text-center space-y-4">
          <img src="/logo2.png" alt="Logo" className="h-16 lg:h-24 w-auto mx-auto drop-shadow-2xl" />
          <h1 className="text-white uppercase text-4xl lg:text-6xl font-black tracking-tighter">
            Credenciamento <br /> <span className="text-brand-pink">Expo Multi Mix</span>
          </h1>
          <div className="h-2 w-24 bg-brand-cyan mx-auto rounded-full" />
        </div>

        <div className="w-full glass-card p-8 lg:p-14 rounded-[40px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
          <MetaPixel pixelId="798068891626886" eventName="InitiateCheckout" />
          <FormularioCredenciamento />
        </div>
      </div>
    </section>
  );
};
