import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircleMore, Globe, Instagram, LogOut } from "lucide-react";

/**
 * Header banner component to thank attendees and invite to reserve a stand next year.
 * This header is fixed at the top of the viewport.
 */
export const HeaderBanner = () => {
  const headerHeight = 140; // altura do header fixo
  const auth = useAuth();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: `${headerHeight}px`,
        backgroundImage: "linear-gradient(to right, #5a448b, #6b46c1, #805ad5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img
            src="/logo.png"
            alt="Expo MultiMix Logo"
            style={{ width: "9rem", height: "auto" }}
          />
          <div style={{ color: "#fff" }}>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
              Obrigado por participar da Expo MultiMix!
            </h1>
            <p style={{ margin: 0 }}>
              Foi um prazer tê-lo conosco. Garanta seu stand para a próxima
              edição!
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center w-full gap-4">
          <p className="2xl animate-pulse: font-semibold text-white">
            Reserve seu stand:
          </p>

          <Button
            asChild
            className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium"
          >
            <a
              href="https://api.whatsapp.com/send?phone=91982836424&text=Olá,%20gostaria%20de%20reservar%20meu%20stand%20para%20o%20próximo%20ano"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp <MessageCircleMore size={16} />
            </a>
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <Button
          variant="ghost"
          className="text-white hover:bg-transparent"
          onClick={() => auth.signOut()}
        >
          <LogOut size={20} /> Sair
        </Button>

        <a
          href="https://www.expomultimix.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            color: "#fff",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          <Globe size={20} style={{ marginRight: "0.25rem" }} />
          expomultimix.com.br
        </a>
        <a
          href="https://instagram.com/expomultimix"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            color: "#fff",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          <Instagram size={20} style={{ marginRight: "0.25rem" }} />
          @expomultimix
        </a>
      </div>
    </header>
  );
};
