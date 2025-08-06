// src/pages/FormularioCredenciamento.tsx
import React, { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControlledInput } from "@/components/ControlledInput";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { usePublicFormService } from "@/service/publicform.service";
import { Loader2, Save } from "lucide-react";
import {
  credenciamentoSchema,
  defaultVisitorCnpj,
  type CredenciamentoFormData,
} from "./schema";
import { maskCEP, maskCNPJ, maskPhoneBR, unmaskString } from "@/utils/masks";
import { isValidCNPJ } from "@/utils/isValidCnpj";
import { toast } from "sonner";
import { ControlledNativeSelect } from "@/components/ControlledSelectV2";
import type { Visitor as IVisistor } from "@/interfaces/visitors";
import { useVisitorsService } from "@/service/visitors.service";

const setoresOpcoes = [
  "Brinquedos",
  "Utilidades domésticas",
  "Decoração",
  "Presentes",
  "Puericultura",
  "Artigos de Festas",
  "Descartáveis",
  "Outro",
];

export const FormularioCredenciamento: React.FC = () => {
  const [checkbox, setCheckbox] = useState<boolean>(false);
  const [isRep, setIsRep] = useState<boolean>(false);
  const [resgister, setRegistrationCode] = useState<IVisistor>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchParams] = useSearchParams();

  const { getVisitorById, visitor, checkinVisitor } = useVisitorsService();
  const fairId = searchParams.get("fairId") || "";
  const { create, loading } = usePublicFormService();
  const currentFairId = fairId;
  const [generatedUrl, setGeneratedUrl] = useState("");
  console.log(generatedUrl);
  const { control, handleSubmit, watch, setValue, setError } =
    useForm<CredenciamentoFormData>({
      resolver: zodResolver(credenciamentoSchema),
      defaultValues: {
        ingresso: "lojista",
        sectors: [],
        howDidYouKnow: "",
      },
    });

  const handlePrint = useCallback(() => {
    if (!visitor || !visitor.name || !visitor.company) {
      toast.error(
        "Dados do visitante não carregados completamente. Aguarde..."
      );
      return;
    }

    try {
      const printWindow = window.open("", "PRINT", "width=400,height=300");
      if (!printWindow) {
        toast.error(
          "Não foi possível abrir a janela de impressão. Verifique se popups estão habilitados."
        );
        return;
      }

      const { name, company, category } = visitor;

      // Aguarda um pequeno delay para garantir que a janela foi criada
      setTimeout(() => {
        if (printWindow.closed) {
          toast.error("Janela de impressão foi fechada. Tente novamente.");
          return;
        }

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

        // Aguarda o documento carregar antes de imprimir
        setTimeout(() => {
          try {
            printWindow.print();
            printWindow.close();
          } catch (error) {
            console.error("Erro durante impressão:", error);
            toast.error("Erro durante a impressão. Tente novamente.");
          }
        }, 100);
      }, 50);
    } catch (error) {
      console.error("Erro ao preparar impressão:", error);
      toast.error("Erro ao preparar impressão. Tente novamente.");
    }
  }, [visitor]);

  const onSubmit = async (data: CredenciamentoFormData) => {
    if (isSubmitting) return; // Previne múltiplas submissões

    if (!checkbox) {
      return toast.error("Aceite os termos!");
    }

    if (!fairId) {
      return toast.error("ID da feira não encontrado. Recarregue a página.");
    }

    if (data.ingresso === "lojista") {
      if (!data.cnpj) {
        setError("cnpj", {
          type: "manual",
          message: "CNPJ é obrigatório para lojistas",
        });
        return;
      }
      if (!isValidCNPJ(data.cnpj)) {
        setError("cnpj", {
          type: "manual",
          message: "CNPJ inválido segundo algoritmo",
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        zipCode: unmaskString(data.zipCode),
        cnpj:
          data.ingresso === "visitante"
            ? defaultVisitorCnpj
            : unmaskString(data.cnpj || ""),
        phone: unmaskString(data.phone),
        category: isRep ? "representante comercial" : data.ingresso,
        fair_visitor: currentFairId,
        ingresso: isRep
          ? "representante-comercial"
          : ("lojista" as "lojista" | "representante-comercial"),
      };

      const result = await create(payload);

      if (!result) {
        toast.error(
          "Erro ao criar cadastro. Verifique sua conexão com a internet e tente novamente."
        );
        return;
      }

      // Aguarda um pequeno delay antes de atualizar o estado para evitar conflitos de DOM
      setTimeout(() => {
        setRegistrationCode(result);
      }, 100);
    } catch (error) {
      console.error("Erro durante o cadastro:", error);
      toast.error("Erro inesperado durante o cadastro. Tente novamente.");
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 200);
    }
  };

  const handleCheckin = useCallback(() => {
    if (!resgister?.registrationCode || !fairId) {
      toast.error(
        "Dados necessários não estão disponíveis. Verifique se possui conexão com a internet."
      );
      return;
    }

    if (!visitor || !visitor.name || !visitor.company) {
      toast.error(
        "Dados do visitante não carregados. Aguarde o carregamento completo."
      );
      return;
    }

    checkinVisitor(resgister?.registrationCode, fairId)
      .then(() => {
        const url = `${window.location.origin}/visitor/checkin${resgister?.registrationCode}?fairId=${fairId}`;
        setGeneratedUrl(url);

        // Aguarda um delay antes de tentar imprimir
        setTimeout(() => {
          handlePrint();
        }, 200);
      })
      .catch((error) => {
        console.error("Error during check-in:", error);
        toast.error(
          "Erro ao realizar check-in. Verifique sua conexão e tente novamente."
        );
      });
  }, [
    resgister?.registrationCode,
    fairId,
    visitor,
    checkinVisitor,
    handlePrint,
  ]);

  const setoresSelecionados = watch("sectors") || [];
  const ingresso = watch("ingresso");

  useEffect(() => {
    // Adiciona uma verificação para evitar chamadas desnecessárias
    if (resgister?.registrationCode && fairId && !visitor?.name) {
      const timeoutId = setTimeout(() => {
        getVisitorById(resgister?.registrationCode, fairId);
        const url = `${window.location.origin}/visitor/checkin${resgister?.registrationCode}?fairId=${fairId}`;
        setGeneratedUrl(url);
      }, 50); // Pequeno delay para evitar conflitos de DOM

      return () => clearTimeout(timeoutId);
    }
  }, [resgister?.registrationCode, fairId, getVisitorById, visitor?.name]);

  // Validação inicial do fairId - após todos os hooks
  if (!fairId) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 text-lg">
          ID da feira não encontrado na URL. Verifique o link e tente novamente.
        </p>
      </div>
    );
  }

  if (resgister) {
    return (
      <div className="text-2xl font-bold text-gray-800 text-center  flex items-center justify-center">
        <div className="max-w-md mx-auto p-8">
          {resgister?.name && resgister?.company ? (
            <>
              <p className="mb-2">{resgister.name}</p>
              <p className="mb-6">
                <span className="font-semibold">Empresa:</span>{" "}
                {resgister.company}
              </p>

              <Button
                onClick={handleCheckin}
                disabled={!visitor || !visitor.name || !visitor.company}
                className="mt-4 px-8 rounded-full bg-orange-400 hover:bg-orange-500 text-xl text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!visitor || !visitor.name || !visitor.company
                  ? "Carregando dados..."
                  : "Imprimir Etiqueta"}
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2" />
              <p>Carregando dados do visitante...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} key={`form-${fairId}`}>
      <div>
        <Controller
          control={control}
          name="ingresso"
          render={({ field, fieldState }) => (
            <div className="mb-4 flex flex-col items-center">
              <label className="block mb-1  text-center text-xl font-normal text-gray-400">
                Tipo de ingresso
              </label>
              <ToggleGroup
                type="single"
                value={field.value}
                onValueChange={(val) =>
                  setValue("ingresso", val as "lojista" | "visitante")
                }
                className="mt-2 w-full space-x-2.5 "
              >
                {(["lojista", "visitante"] as const).map((opt) => (
                  <ToggleGroupItem
                    key={opt}
                    value={opt}
                    className={` rounded-full cursor-pointer text ${
                      field.value === opt
                        ? "bg-pink-600 text-white"
                        : "bg-white"
                    }`}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {fieldState.error && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
        {ingresso === "visitante" && (
          <div className="w-full flex items-center justify-center mb-4 gap-4">
            <Checkbox
              checked={isRep}
              onCheckedChange={() => setIsRep((prev) => !prev)}
            ></Checkbox>
            Representante Comercial
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          <ControlledInput
            control={control}
            name="name"
            label="Nome completo"
            placeholder="Digite seu nome"
          />
          <ControlledInput
            control={control}
            name="company"
            label="Nome da Empresa"
            placeholder="Digite o nome da empresa"
          />
          <ControlledInput
            control={control}
            name="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
          />{" "}
          {ingresso === "lojista" && (
            <ControlledInput
              control={control}
              name="cnpj"
              label="CNPJ"
              placeholder="__.___.___/____-__"
              mask={maskCNPJ}
            />
          )}
          <ControlledInput
            control={control}
            name="phone"
            label="Telefone"
            placeholder="(00)00000-0000"
            mask={maskPhoneBR}
          />
          <ControlledInput
            control={control}
            name="zipCode"
            label="CEP"
            placeholder="00000000"
            mask={maskCEP}
          />
          <ControlledNativeSelect
            className="bg-white w-full border-none rounded-full"
            control={control}
            name="howDidYouKnow"
            label="Como soube da feira?"
            placeholder="Selecione uma opção"
            options={[
              { value: "facebook", label: "Facebook" },
              { value: "instagram", label: "Instagram" },
              { value: "google", label: "Google" },
              { value: "outdoor", label: "Outdoor" },
              { value: "busdoor", label: "Busdoor" },
              { value: "tv", label: "Televisão" },
              { value: "indicação", label: "Indicação" },
              { value: "representante", label: "Indicação de Representante" },
            ]}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">
            Setores que{" "}
            {ingresso === "visitante" ? "tem interesse:" : "a empresa atua:"}
          </label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {setoresOpcoes.map((setor) => (
              <label key={setor} className="flex items-center space-x-2">
                <Checkbox
                  checked={setoresSelecionados.includes(setor)}
                  onCheckedChange={(checked) => {
                    const novos = checked
                      ? [...setoresSelecionados, setor]
                      : setoresSelecionados.filter((s) => s !== setor);
                    setValue("sectors", novos);
                  }}
                />
                <span>{setor}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className=" w-full flex items-center justify-center mt-4 gap-4">
        <Checkbox
          checked={checkbox}
          onCheckedChange={() => setCheckbox((prev) => !prev)}
        />{" "}
        <p>
          Aceito os{" "}
          <a
            href="https://www.expomultimix.com/politica-de-privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 hover:underline"
          >
            termos e condições
          </a>
        </p>
      </div>
      <div className="flex justify-center pt-4">
        <Button
          disabled={!checkbox || loading || isSubmitting}
          type="submit"
          className="bg-pink-600 rounded-full w-[80%] hover:bg-pink-700 text-white disabled:opacity-50"
        >
          {loading || isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Processando...
            </>
          ) : (
            <>
              <Save className="mr-2" />
              Enviar
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
