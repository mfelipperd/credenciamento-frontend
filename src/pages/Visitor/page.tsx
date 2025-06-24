import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useCheckinId } from "@/hooks/useCheckinId";
import { useVisitorsService } from "@/service/visitors.service";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export const Visitor = () => {
  const checkinId = useCheckinId();
  const [params] = useSearchParams();
  const fairId = params.get("fairId");

  const { getVisitorById, visitor } = useVisitorsService();
  const [isMobile, setIsMobile] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");

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
            }
            .company {
              font-size: 18pt;
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

  const handleSendToWhatsapp = () => {
    if (!generatedUrl) return;
    const message = `Clique aqui no computador para imprimir a etiqueta:\n\n${generatedUrl}`;
    const encoded = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/?text=${encoded}`;
    window.open(whatsappLink, "_blank");
  };

  return (
    <Card className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
      <CardTitle>Visitor Page</CardTitle>
      <div className="text-2xl font-bold text-gray-800 text-center">
        {visitor?.name && (
          <>
            <p>{visitor.name}</p>
            <p>
              <span className="font-semibold">Empresa:</span> {visitor.company}
            </p>

            {isMobile ? (
              <Button onClick={handleSendToWhatsapp} className="mt-4">
                Enviar link para meu WhatsApp
              </Button>
            ) : (
              <Button onClick={handlePrint} className="mt-4">
                Imprimir Etiqueta
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
