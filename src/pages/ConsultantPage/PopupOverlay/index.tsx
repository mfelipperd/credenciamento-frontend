import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MessageCircleMore, TimerReset } from "lucide-react";

interface PopupOverlayProps {
  onClose?: () => void;
}

// Código esperado de reserva (ajuste conforme necessário)
const EXPECTED_RESERVATION_CODE = "ABC1523";

export const PopupOverlay = ({ onClose }: PopupOverlayProps) => {
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
    <Dialog open={visible} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto remove-x">
        <DialogHeader className="flex flex-col items-center">
          <DialogTitle className="text-xl font-bold text-center">
            Reserve seu stand para o próximo ano!
          </DialogTitle>
          <DialogDescription>
            <p className="text-center">Entre em contato agora:</p>
          </DialogDescription>
        </DialogHeader>

        {/* Botão de e-mail central */}
        <div className="flex justify-center my-4">
          <Button
            onClick={() => {
              window.open(
                `https://mail.google.com/mail/?view=cm&fs=1&to=expomultimix@gmail.com&su=${encodeURIComponent(
                  "Reserva 2026 - PL"
                )}&body=${encodeURIComponent(
                  "Gostaria de reservar um stand para 2026, é possível?"
                )}`,
                "_blank"
              );
              setError("");
            }}
            className="mr-2 bg-blue-400 text-white"
          >
            Reservar stand
          </Button>
        </div>

        {/* Checkbox e input para quem já reservou */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="reserved"
            checked={reservedChecked}
            onChange={() => {
              setReservedChecked((prev) => !prev);
              setError("");
            }}
            className="mr-2"
          />
          <label htmlFor="reserved">Já reservei meu stand</label>
        </div>

        {reservedChecked && (
          <div className="mb-4">
            <Input
              placeholder="Código de reserva"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <Button
              onClick={handleValidate}
              disabled={codeInput.length === 0}
              className="mt-2 w-full"
            >
              Validar código
            </Button>
          </div>
        )}

        {/* Footer com botão WhatsApp e botão de fechar */}
        <DialogFooter className="flex justify-between items-center">
          <Button
            asChild
            className="bg-green-500 text-white px-6 py-2 flex-1 mr-2"
          >
            <a
              href="https://api.whatsapp.com/send?phone=91982836424&text=Olá,%20quero%20reservar%20meu%20stand%20para%20o%20próximo%20ano"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              WhatsApp <MessageCircleMore size={16} />
            </a>
          </Button>
          <Button
            onClick={() => handleOpenChange(false)}
            disabled={timer > 0 || reservedChecked}
            variant="outline"
            className="px-4 py-2 flex items-center justify-center gap-2"
          >
            {timer > 0 ? (
              `Lembrar-me mais tarde em ${timer}s`
            ) : (
              <div className="flex items-center gap-2">
                "Lembrar-me mais tarde" <TimerReset size={16} />
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
