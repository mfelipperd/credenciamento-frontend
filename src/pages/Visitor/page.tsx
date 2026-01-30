import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useCheckinId } from "@/hooks/useCheckinId";
import { useCheckinSocket } from "@/service/checkin.socket";
import { useVisitorsService } from "@/service/visitors.service";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "@/hooks/useSearchParams";

function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export const Visitor = () => {
  const checkinId = useCheckinId();
  const [, , fairId] = useSearchParams();
  const { getVisitorById, visitor, checkinVisitor, setVisitor } =
    useVisitorsService();
  const [isMobile, setIsMobile] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");


  useCheckinSocket((socketVisitor) => {
    setVisitor(socketVisitor);
  });

  useEffect(() => {
    if (checkinId && fairId) {
      getVisitorById(checkinId, fairId);
      const url = `${window.location.origin}/visitor/checkin${checkinId}?fairId=${fairId}`;
      setGeneratedUrl(url);
    }

    setIsMobile(isMobileDevice());
  }, [checkinId, fairId]);

  const handlePrint = useCallback(() => {
    if (!visitor) return;

    const printWindow = window.open("", "PRINT", "width=400,height=300");
    if (!printWindow) return;

    const { name, company, category } = visitor;

    printWindow.document.write(`
      <html>
        <head>
          <title>Etiqueta</title>
          <style>
            @page {
              size: 90mm 29mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: Arial, sans-serif;
            }
            .label {
              width: 90mm;
              height: 29mm;
              padding: 5mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              box-sizing: border-box;
              text-align: center;
              
            }
            .label div {
              margin: 0;
              line-height: 1.2;
            }
           .name {
                font-size: 22pt;
                font-weight: bold;
                white-space: nowrap;      
                overflow: hidden;        
                text-overflow: clip;      
                max-width: 100%;          
}
            .company {
              font-size: 16pt;
                white-space: nowrap;      
                overflow: hidden;        
                text-overflow: clip;      
                max-width: 100%;
            }
            .category {
              font-size: 10pt;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="name">${name}</div>
            <div class="company">${company}</div>
            <div class="category">${category || ""}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, [visitor]);

  const handleCheckin = () => {
    if (!checkinId || !fairId) return;

    checkinVisitor(checkinId, fairId)
      .then(() => {
        const url = `${window.location.origin}/visitor/checkin${checkinId}?fairId=${fairId}`;
        setGeneratedUrl(url);
      })
      .catch((error) => {
        console.error("Error during check-in:", error);
      });
    handlePrint();
  };

  const handleSendToWhatsapp = () => {
    if (!generatedUrl) return;
    const message = `Clique aqui no computador para imprimir a etiqueta:\n\n${generatedUrl}`;
    const encoded = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/?text=${encoded}`;
    window.open(whatsappLink, "_blank");
  };

  return (
    <Card className="w-full h-full flex flex-col items-center justify-center gap-10 p-10 bg-brand-blue border-white/5 glass-card rounded-[40px] shadow-2xl">
      <CardTitle className="text-white/40 font-black uppercase tracking-[0.4em] text-xs">
        Portal do Visitante
      </CardTitle>
      
      <div className="flex flex-col items-center gap-8 text-center max-w-xl">
        {visitor?.name && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter">
                {visitor.name}
              </h2>
              <p className="text-brand-cyan font-black uppercase tracking-[0.2em] text-sm">
                Check-in Confirmado
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-white/30 font-black uppercase tracking-widest block">Empresa</span>
              <p className="text-xl font-bold text-white uppercase tracking-tight">
                {visitor.company}
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {isMobile ? (
                <>
                  <Button
                    onClick={handleSendToWhatsapp}
                    className="h-16 rounded-2xl bg-linear-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-black uppercase tracking-widest shadow-xl shadow-green-500/20 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Enviar Link para Impressão
                  </Button>
                  <Button
                    onClick={handleCheckin}
                    className="h-16 rounded-2xl bg-brand-pink hover:bg-brand-pink/90 text-white font-black uppercase tracking-widest shadow-xl shadow-brand-pink/20 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Imprimir Etiqueta
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleCheckin}
                  className="h-20 rounded-2xl bg-brand-pink hover:bg-brand-pink/90 text-white text-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-pink/30 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Imprimir Etiqueta
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
