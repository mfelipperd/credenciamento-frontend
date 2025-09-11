import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFairPartnerFinancialSummary } from "@/hooks/useFairPartners";
import { PartnerView } from "./components/PartnerView";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import { useCookie } from "@/hooks/useCookie";

export function PartnerDashboard() {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const [savedFairId] = useCookie("selectedFairId", "", { days: 30 });
  
  // Usar fairId da URL ou do cookie como fallback
  const fairId = searchParams.get("fairId") || savedFairId || "";
  
  // Debug
  // Buscar dados financeiros do sócio na feira selecionada
  const { data: financialSummary, isLoading: isLoadingFinancial } = useFairPartnerFinancialSummary(fairId, auth?.user?.id?.toString() || "");

  if (isLoadingFinancial) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!fairId) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Nenhuma feira selecionada
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Selecione uma feira no header para visualizar seus dados.
        </p>
      </div>
    );
  }

  if (!financialSummary) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Não associado a esta feira
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Você não está associado à feira selecionada.
        </p>
      </div>
    );
  }

  // Criar um objeto partner baseado nos dados financeiros e do usuário
  const partnerData = {
    id: `partner-${auth?.user?.id}`,
    fairId: fairId,
    partnerId: auth?.user?.id?.toString() || "",
    percentage: financialSummary.percentage,
    totalEarnings: financialSummary.totalEarnings,
    totalWithdrawn: financialSummary.totalWithdrawn,
    availableBalance: financialSummary.availableBalance,
    isActive: true,
    partnerName: auth?.user?.name || "Nome não disponível",
    partnerEmail: auth?.user?.email || "Email não disponível",
    partnerCpf: "CPF não disponível", // Pode ser adicionado ao user se necessário
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return (
    <PartnerView
      partner={partnerData}
      fairId={fairId}
      isAdminView={false}
    />
  );
}
