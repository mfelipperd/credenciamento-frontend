import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { MessageCircleMore, TimerReset } from "lucide-react";

interface PopupOverlayProps {
  onClose?: () => void;
}

// Código esperado de reserva (ajuste conforme necessário)
const EXPECTED_RESERVATION_CODE = "ABC1523";

// Função para obter o próximo ano automaticamente
const getNextYear = () => {
  return new Date().getFullYear() + 1;
};

export const PopupOverlay = ({ onClose }: PopupOverlayProps) => {
  const nextYear = getNextYear();
  
  // Verifica localStorage para não reexibir o popup após sucesso
  const [visible, setVisible] = useState(() => {
    const stored = localStorage.getItem("reservationCode");
    return stored !== EXPECTED_RESERVATION_CODE;
  });
  const [timer, setTimer] = useState(5); // segundos para fechar
  const [reservedChecked, setReservedChecked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState("");

  // Contagem regressiva do timer
  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timer]);

  // Valida o código inserido
  const handleValidate = () => {
    if (codeInput === EXPECTED_RESERVATION_CODE) {
      localStorage.setItem("reservationCode", codeInput);
      setVisible(false);
      onClose?.();
    } else {
      setError("Código inválido. Verifique e tente novamente.");
    }
  };

  // Controle de fechamento: só permite fechar via botão quando timer chega a zero
  const handleOpenChange = (open: boolean) => {
    if (!open && timer <= 0 && !reservedChecked) {
      setVisible(false);
      onClose?.();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem("reservationCode");
      if (stored !== EXPECTED_RESERVATION_CODE) {
        setVisible(true);
        setTimer(5);
        setReservedChecked(false);
        setError("");
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>
        {`
          [data-radix-dialog-overlay],
          [data-radix-dialog-content] {
            z-index: 9999 !important;
          }
        `}
      </style>
      <Dialog open={visible} onOpenChange={handleOpenChange}>
        <DialogContent 
          className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-0 rounded-2xl shadow-2xl max-w-md mx-auto remove-x border-2 border-purple-200 overflow-hidden max-h-[90vh]"
          style={{ zIndex: 9999 }}
        >
          {/* Header com gradiente compacto */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            
            <div className="relative z-10 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-amber-400 text-purple-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  🎪 ÚLTIMAS VAGAS {nextYear}!
                </div>
              </div>
              <h2 className="text-xl font-bold mb-1 leading-tight">
                🚀 Reserve Seu Stand
              </h2>
              <p className="text-purple-100 text-sm">
                <strong>Multiplique seus negócios!</strong>
              </p>
            </div>
          </div>

          {/* Body compacto com scroll */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {/* Benefícios em grid 2x2 compacto */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 rounded-lg border border-green-200 text-center">
                <div className="text-green-600 text-base">💰</div>
                <div className="text-xs font-semibold text-green-800">ROI Alto</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 rounded-lg border border-blue-200 text-center">
                <div className="text-blue-600 text-base">📊</div>
                <div className="text-xs font-semibold text-blue-800">+2.500 Leads</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 rounded-lg border border-orange-200 text-center">
                <div className="text-orange-600 text-base">🎯</div>
                <div className="text-xs font-semibold text-orange-800">Networking</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 rounded-lg border border-purple-200 text-center">
                <div className="text-purple-600 text-base">🏆</div>
                <div className="text-xs font-semibold text-purple-800">Destaque</div>
              </div>
            </div>

            {/* Urgência compacta */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 p-3 mb-4 rounded-r-lg">
              <div className="flex items-start gap-2">
                <div className="text-red-500 text-sm">⚡</div>
                <div>
                  <h4 className="font-bold text-red-800 text-xs mb-1">🔥 Movimento intenso!</h4>
                  <p className="text-red-700 text-xs">
                    Outros expositores estão reservando agora. <strong>Garante o seu desconto!</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs compactos */}
            <div className="space-y-2 mb-3">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              >
                <a
                  href={`https://api.whatsapp.com/send?phone=91982836424&text=🎪%20Olá!%20Quero%20reservar%20meu%20stand%20na%20ExpoMultiMix%20${nextYear}%20e%20garantir%20o%20desconto%20early%20bird!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircleMore size={16} />
                  💰 RESERVAR NO WhatsApp
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50 py-2 rounded-xl font-semibold text-sm"
              >
                <a
                  href={`mailto:expomultimix@gmail.com?subject=Reserva%20Stand%20ExpoMultiMix%20${nextYear}&body=Olá!%20Gostaria%20de%20informações%20sobre%20os%20stands%20disponíveis%20para%20a%20ExpoMultiMix%20${nextYear}.%20%0A%0AMinha%20empresa:%20%0ATelefone:%20%0A%0AObrigado!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  📧 Solicitar Proposta
                </a>
              </Button>
            </div>

            {/* Seção compacta para quem já reservou */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="reserved"
                  checked={reservedChecked}
                  onChange={() => {
                    setReservedChecked((prev) => !prev);
                    setError("");
                  }}
                  className="mr-2 text-purple-600"
                />
                <label htmlFor="reserved" className="text-xs text-gray-600 cursor-pointer">
                  ✅ Já reservei meu stand
                </label>
              </div>

              {reservedChecked && (
                <div className="space-y-2">
                  <Input
                    placeholder="Código de reserva"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    className="border-purple-300 focus:ring-purple-500 focus:border-purple-500 text-sm py-2"
                  />
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <Button
                    onClick={handleValidate}
                    disabled={codeInput.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-sm"
                  >
                    ✅ Validar Código
                  </Button>
                </div>
              )}
            </div>

            {/* Footer compacto */}
            <div className="flex justify-center pt-2 border-t border-gray-100 mt-3">
              <Button
                onClick={() => handleOpenChange(false)}
                disabled={timer > 0 || reservedChecked}
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 text-xs px-3 py-1 flex items-center gap-1"
              >
                {timer > 0 ? (
                  <>
                    <TimerReset size={12} />
                    Aguarde {timer}s
                  </>
                ) : (
                  <>
                    <TimerReset size={12} />
                    Lembrar depois
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
