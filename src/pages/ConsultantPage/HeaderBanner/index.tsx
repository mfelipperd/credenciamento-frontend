import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Globe, Instagram, LogOut } from "lucide-react";

/**
 * Header banner component for ExpoMultiMix - Landing page for exhibitors
 * Commercial header with logo, CTAs and contact information - Fully responsive
 */
export const HeaderBanner = () => {
  const auth = useAuth();

  return (
    <>
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .text-shadow {
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
        `}
      </style>
      <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-xl z-[1000] min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] xl:min-h-[140px]">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 h-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6 h-full">
            
            {/* Seção Principal - Logo e Título */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 flex-shrink-0 min-w-0">
              <img
                src="/logo.png"
                alt="Expo MultiMix Logo"
                className="w-12 h-auto sm:w-16 lg:w-20 xl:w-24 drop-shadow-lg flex-shrink-0"
              />
              <div className="text-white min-w-0 flex-1">
                <h1 className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold leading-tight text-shadow truncate">
                  🎪 ExpoMultiMix 2025
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-white/90 font-medium hidden sm:block truncate">
                  💼 Dados Exclusivos para Expositores
                </p>
              </div>
            </div>
            
            {/* Seção CTAs e Controles */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-2 sm:gap-3 lg:gap-4 w-full lg:w-auto">
              
              {/* CTAs Principais */}
              <div className="flex flex-wrap items-center gap-2 order-2 sm:order-1">
                {/* Info Badge - apenas em telas maiores */}
                <div className="hidden xl:flex items-center gap-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white font-semibold text-xs">🎪 Seja um Expositor</span>
                  </div>
                </div>

                {/* Buttons */}
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                >
                  <a
                    href="https://api.whatsapp.com/send?phone=91982836424&text=🎪%20Olá!%20Quero%20informações%20sobre%20como%20ser%20expositor%20na%20ExpoMultiMix%202025"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="hidden sm:inline">💼 Quero Ser Expositor</span>
                    <span className="sm:hidden">💼 Expositor</span>
                  </a>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/40 text-white hover:bg-white/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full backdrop-blur-sm text-xs sm:text-sm"
                >
                  <a
                    href="https://api.whatsapp.com/send?phone=91982836424&text=Preciso%20de%20mais%20informações%20sobre%20os%20stands%20da%20ExpoMultiMix"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="hidden sm:inline">📞 Mais Info</span>
                    <span className="sm:hidden">📞 Info</span>
                  </a>
                </Button>
              </div>
              
              {/* Controles do Usuario e Links Sociais */}
              <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">
                {/* Links Sociais - apenas em telas maiores */}
                <div className="hidden md:flex flex-col gap-1 text-right">
                  <a
                    href="https://www.expomultimix.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-white font-medium text-xs hover:text-white/80 transition-colors"
                  >
                    <Globe size={14} className="mr-1" />
                    expomultimix.com.br
                  </a>
                  <a
                    href="https://instagram.com/expomultimix"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-white font-medium text-xs hover:text-white/80 transition-colors"
                  >
                    <Instagram size={14} className="mr-1" />
                    @expomultimix
                  </a>
                </div>

                {/* Botão de Sair */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full backdrop-blur-sm text-xs sm:text-sm"
                  onClick={() => auth.signOut()}
                >
                  <LogOut size={14} className="mr-1" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
