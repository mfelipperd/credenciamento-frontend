import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMarketingService } from "@/service/marketing.service";
import type { SendMarketingEmailRequest } from "@/service/marketing.service";
import { useSearchParams } from "@/hooks/useSearchParams";
import { toast } from "sonner";
import { Mail, Send, Eye, Users } from "lucide-react";
import { LogoLoading } from "@/components/LogoLoading";

interface MarketingFormData {
  subject: string;
  htmlContent: string;
}

const DEFAULT_EMAIL_TEMPLATE = `<html>
<head>
  <meta charset='utf-8'>
  <title>ExpoMultiMix - Email Marketing</title>
</head>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>
  <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>
    <img src='https://static.wixstatic.com/media/88e022_551e4ef3cf61439fad4f84eca702a829~mv2.png/v1/crop/x_0,y_190,w_2084,h_1301/fill/w_536,h_340,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/EMM2024%20logo%20br_Prancheta%201.png' 
         alt='ExpoMultiMix' 
         style='max-width: 200px; height: auto; margin-bottom: 15px;'>
    <h1 style='margin: 0; font-size: 28px;'>🎪 ExpoMultiMix está acontecendo!</h1>
    <p style='margin: 10px 0 0 0; font-size: 18px;'>Venha nos visitar hoje!</p>
  </div>
  
  <div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
    <h2 style='color: #333; margin-top: 0;'>Olá! 👋</h2>
    <p style='font-size: 16px; margin-bottom: 20px;'>
      Você se registrou para a <strong>ExpoMultiMix</strong> e estamos ansiosos para recebê-lo! 
      A feira está acontecendo agora e há muito para você aproveitar:
    </p>
    
    <ul style='background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea;'>
      <li>🏢 <strong>Networking</strong> com empresários do setor</li>
      <li>🎯 <strong>Oportunidades</strong> de negócios únicos</li>
      <li>📚 <strong>Palestras</strong> e workshops exclusivos</li>
      <li>🎁 <strong>Brindes</strong> e sorteios especiais</li>
    </ul>
    
    <div style='background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #10B981; margin: 20px 0;'>
      <h3 style='margin-top: 0; color: #059669;'>📍 Informações do Evento:</h3>
      <p style='margin: 0; font-size: 16px;'><strong>⏰ Horário:</strong> 13h às 21h</p>
      <p style='margin: 10px 0 0 0; font-size: 16px;'>
        <strong>📍 Local:</strong> 
        <a href='https://maps.app.goo.gl/nUtWE5Cgdc2tpZTZ6' 
           style='color: #667eea; text-decoration: none; font-weight: bold;'>
          Estação das Docas
        </a>
      </p>
      <p style='margin: 5px 0 0 0; font-size: 14px; color: #666;'>
        Clique no link acima para ver a localização no Google Maps
      </p>
    </div>
    
    <div style='text-align: center; margin: 30px 0;'>
      <p style='font-size: 18px; color: #667eea; font-weight: bold; margin-bottom: 10px;'>
        🚀 Te esperamos na ExpoMultiMix!
      </p>
      <p style='font-size: 16px; color: #666;'>
        Traga seu documento de identidade para confirmar sua presença.
      </p>
    </div>
    
    <div style='background: #E3F2FD; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3; margin: 20px 0;'>
      <p style='margin: 0; font-size: 14px; color: #1976D2;'>
        💡 <strong>Dica:</strong> Chegue cedo para aproveitar todas as atividades e evitar filas!
      </p>
    </div>
    
    <p style='font-size: 14px; color: #666; text-align: center; 
              border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;'>
      Este é um email de lembrete sobre a ExpoMultiMix.<br>
      Equipe de Credenciamento - ExpoMultiMix
    </p>
  </div>
</body>
</html>`;

export const MarketingPage: React.FC = () => {
  const { sendMarketingEmailToAbsentVisitors } = useMarketingService();
  const [, , fairId] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MarketingFormData>({
    defaultValues: {
      subject:
        "ExpoMultiMix está acontecendo agora - Venha para a Estação das Docas!",
      htmlContent: DEFAULT_EMAIL_TEMPLATE,
    },
  });

  const watchedContent = watch("htmlContent");
  const watchedSubject = watch("subject");

  const onSubmit = async (data: MarketingFormData) => {
    if (!fairId) {
      toast.error("ID da feira não encontrado");
      return;
    }

    setLoading(true);
    try {
      const payload: SendMarketingEmailRequest = {
        subject: data.subject,
        htmlContent: data.htmlContent,
        fairId,
      };

      const response = await sendMarketingEmailToAbsentVisitors(payload);

      if (response?.success) {
        // Nova resposta com processamento em background
        toast.success(
          `Processamento iniciado! ${response.totalAbsent} email(s) serão enviados em background para visitantes ausentes.`,
          {
            duration: 5000,
            description: `Status: ${response.status}`,
          }
        );

        // Exibe lista de visitantes que receberão o email
        console.log(
          "📧 Visitantes que receberão o email:",
          response.absentVisitors
        );

        // Toast adicional com detalhes
        setTimeout(() => {
          toast.info(
            `✅ Emails sendo processados em lotes de 10. Tempo estimado: ~${Math.ceil(
              response.totalAbsent / 300
            )} minutos`,
            { duration: 4000 }
          );
        }, 1000);
      } else {
        toast.error("Erro ao iniciar processamento de emails");
      }
    } catch (error) {
      toast.error("Erro ao enviar email de marketing");
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = () => {
    setValue("htmlContent", DEFAULT_EMAIL_TEMPLATE);
    toast.success("Template carregado com sucesso!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Mail className="h-8 w-8 text-blue-600" />
          Marketing por Email
        </h1>
        <p className="text-gray-600">
          Sistema de envio em massa com processamento em background para todos
          os visitantes ausentes da feira
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor de Email */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Composer Email
            </CardTitle>
            <CardDescription>
              Personalize o assunto e conteúdo do email de marketing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="subject">Assunto do Email</Label>
                <Input
                  id="subject"
                  {...register("subject", {
                    required: "Assunto é obrigatório",
                  })}
                  placeholder="Digite o assunto do email..."
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="htmlContent">Conteúdo HTML</Label>
                <textarea
                  id="htmlContent"
                  {...register("htmlContent", {
                    required: "Conteúdo é obrigatório",
                  })}
                  rows={15}
                  className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
                  placeholder="Digite o conteúdo HTML do email..."
                />
                {errors.htmlContent && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.htmlContent.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadTemplate}
                  className="flex-1"
                >
                  📝 Carregar Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? "Ocultar" : "Visualizar"}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <LogoLoading size={16} minimal className="mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Iniciar Envio em Massa
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview do Email */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Pré-visualização
              </CardTitle>
              <CardDescription>
                Como o email aparecerá para os destinatários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="mb-4 p-2 bg-white rounded border-l-4 border-blue-500">
                  <strong>Assunto:</strong> {watchedSubject || "Sem assunto"}
                </div>
                <div
                  className="bg-white rounded border min-h-[400px] p-4"
                  dangerouslySetInnerHTML={{ __html: watchedContent }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Informações sobre o sistema */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">
            🚀 Sistema de Envio em Massa - Processamento em Background
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🎯 Público-alvo:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Todos os visitantes ausentes da feira específica</li>
                <li>Que se registraram mas não fizeram check-in</li>
                <li>Com email válido no cadastro</li>
                <li>
                  <strong>Envio real para todos os ausentes</strong>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">⚡ Performance:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>
                  Processamento em <strong>background</strong>
                </li>
                <li>Lotes de 10 emails por vez</li>
                <li>2 segundos entre lotes (rate limit)</li>
                <li>3 tentativas automáticas por email</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              💡 Como funciona:
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                <strong>1. Resposta instantânea:</strong> API retorna
                imediatamente após iniciar o processamento
              </p>
              <p>
                <strong>2. Processamento em lotes:</strong> Emails enviados em
                grupos de 10 para evitar sobrecarga
              </p>
              <p>
                <strong>3. Retry inteligente:</strong> Falhas temporárias são
                reprocessadas automaticamente
              </p>
              <p>
                <strong>4. Tempo estimado:</strong> ~300 emails por minuto
                (respeitando limites SMTP)
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">
              ⚠️ ATENÇÃO - Sistema de Produção:
            </h4>
            <p className="text-sm text-yellow-700">
              <strong>Este sistema envia emails reais</strong> para todos os
              visitantes ausentes da feira selecionada. Certifique-se de que o
              conteúdo esteja correto antes de enviar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
