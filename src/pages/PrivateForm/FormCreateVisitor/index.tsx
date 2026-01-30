import React, { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControlledInput } from "@/components/ControlledInput";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "@/hooks/useSearchParams";
import { usePublicFormService } from "@/service/publicform.service";
import { CheckCircle2, Loader2, Save } from "lucide-react";
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
  const [, , fairId] = useSearchParams();

  const { getVisitorById, visitor, checkinVisitor } = useVisitorsService();
  const { create, loading } = usePublicFormService();
  const currentFairId = fairId;
  const [currentStep, setCurrentStep] = useState<number>(1);
  const { control, handleSubmit, watch, setValue, setError, trigger } =
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
      }, 1000);
    } catch (error) {
      console.error("Erro durante o cadastro:", error);
      toast.error("Erro inesperado durante o cadastro. Tente novamente.");
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ["ingresso"];
    if (currentStep === 2) {
      fieldsToValidate = ["name", "email", "company", "phone", "zipCode", "howDidYouKnow"];
      if (watch("ingresso") === "lojista") fieldsToValidate.push("cnpj");
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

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
      }, 50); // Pequeno delay para evitar conflitos de DOM

      return () => clearTimeout(timeoutId);
    }
  }, [resgister?.registrationCode, fairId, visitor?.name]);

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
      <div className="min-h-[400px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-700">
        <div className="relative group w-full max-w-xl">
          <div className="absolute -inset-1 bg-linear-to-r from-brand-cyan/20 to-brand-pink/20 rounded-[40px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative glass-card p-12 rounded-[40px] border border-white/10 shadow-2xl flex flex-col items-center text-center space-y-8">
            <div className="w-24 h-24 bg-brand-cyan/10 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-brand-cyan shadow-[0_0_30px_rgba(0,188,212,0.4)]" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Cadastro Realizado!</h2>
              <p className="text-white/50 text-xs font-bold uppercase tracking-[0.2em]">Bem-vindo à Expo Multi Mix</p>
            </div>

            <div className="w-full h-px bg-white/5" />

            <div className="space-y-4 w-full">
              <div className="space-y-1">
                <p className="text-sm font-bold text-white uppercase tracking-tight">{resgister.name}</p>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-none">
                  {resgister.company}
                </p>
              </div>

              <div className="pt-4 flex flex-col items-center gap-4">
                <Button
                  onClick={handleCheckin}
                  disabled={!visitor || !visitor.name || !visitor.company}
                  className="w-full h-16 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-sm font-black text-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
                >
                  {!visitor || !visitor.name || !visitor.company ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Carregando dados...
                    </>
                  ) : (
                    <>
                      <span>Imprimir Etiqueta</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </>
                  )}
                </Button>
                
                <p className="text-[9px] text-white/20 font-medium uppercase tracking-widest">
                  O check-in será realizado automaticamente ao imprimir
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} key={`form-${fairId}`} className="space-y-8">
      {/* STEP INDICATOR COMPACT */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500",
              currentStep === s 
                ? "bg-brand-pink text-white shadow-[0_0_15px_rgba(233,30,99,0.4)] scale-110" 
                : currentStep > s ? "bg-brand-cyan text-white" : "bg-white/5 text-white/20 border border-white/5"
            )}>
              {currentStep > s ? "✓" : s}
            </div>
            {s < 3 && <div className={cn("w-12 h-px transition-colors duration-500", currentStep > s ? "bg-brand-cyan" : "bg-white/5")} />}
          </div>
        ))}
      </div>

      {currentStep === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-500">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-brand-pink/10 to-brand-cyan/10 rounded-[32px] blur opacity-25"></div>
            <div className="relative glass-card p-8 rounded-[32px] border border-white/10 shadow-xl overflow-hidden">
              <Controller
                control={control}
                name="ingresso"
                render={({ field, fieldState }) => (
                  <div className="flex flex-col items-center gap-6">
                    <div className="text-center space-y-1">
                      <span className="text-brand-pink font-black text-[10px] uppercase tracking-[0.4em]">Passo 01</span>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Categoria de Acesso</h3>
                    </div>

                    <ToggleGroup
                      type="single"
                      value={field.value}
                      onValueChange={(val) => {
                        if (val) setValue("ingresso", val as "lojista" | "visitante");
                      }}
                      className="bg-black/40 p-1.5 rounded-2xl w-full max-w-xl border border-white/5"
                    >
                      {(["lojista", "visitante"] as const).map((opt) => (
                        <ToggleGroupItem
                          key={opt}
                          value={opt}
                          className={cn(
                            "flex-1 h-14 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
                            field.value === opt
                              ? "bg-linear-to-r from-brand-pink to-brand-pink/80 text-white shadow-xl shadow-brand-pink/20 scale-[1.02]"
                              : "text-white/20 hover:text-white/50 hover:bg-white/5"
                          )}
                        >
                          {opt === "lojista" ? "🛒 Lojista" : "👤 Visitante"}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    
                    {ingresso === "visitante" && (
                      <label className="flex items-center gap-4 px-8 py-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-2xl cursor-pointer hover:bg-brand-cyan/10 transition-all group">
                        <Checkbox
                          checked={isRep}
                          onCheckedChange={() => setIsRep((prev) => !prev)}
                          className="border-brand-cyan/40 data-[state=checked]:bg-brand-cyan data-[state=checked]:border-brand-cyan"
                        />
                        <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest group-hover:text-white transition-colors">
                          Atuar como Representante Comercial
                        </span>
                      </label>
                    )}

                    {fieldState.error && (
                      <p className="text-[10px] text-red-400 font-black uppercase tracking-widest animate-bounce">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-500 space-y-6">
          <div className="glass-card p-8 rounded-[32px] border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
               <span className="text-brand-cyan font-black text-[10px] uppercase tracking-[0.4em]">Passo 02</span>
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Pessoais & Empresa</h3>
            </div>

            <div className="grid grid-cols-12 gap-x-6 gap-y-6">
              <div className="col-span-12 lg:col-span-6 flex flex-col gap-1.5">
                <label className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">Nome Completo</label>
                <ControlledInput control={control} name="name" placeholder="Ex: João Silva" />
              </div>

              <div className="col-span-12 lg:col-span-6 flex flex-col gap-1.5">
                <label className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">E-mail Profissional</label>
                <ControlledInput control={control} name="email" type="email" placeholder="nome@empresa.com" />
              </div>

              {ingresso === "lojista" ? (
                <>
                  <div className="col-span-12 lg:col-span-8 flex flex-col gap-1.5">
                    <label className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">Nome da Empresa</label>
                    <ControlledInput control={control} name="company" placeholder="Razão Social" />
                  </div>
                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-4 duration-500">
                    <label className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">CNPJ Ativo</label>
                    <ControlledInput control={control} name="cnpj" placeholder="00.000.000/0000-00" mask={maskCNPJ} />
                  </div>
                </>
              ) : (
                <div className="col-span-12 lg:col-span-12 flex flex-col gap-1.5">
                  <label className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">Nome da Empresa</label>
                  <ControlledInput control={control} name="company" placeholder="Razão Social" />
                </div>
              )}

              <div className="col-span-12 lg:col-span-4 flex flex-col gap-1.5">
                <label className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">WhatsApp</label>
                <ControlledInput control={control} name="phone" placeholder="(00) 0 0000-0000" mask={maskPhoneBR} />
              </div>

              <div className="col-span-12 lg:col-span-4 flex flex-col gap-1.5">
                <label className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">CEP</label>
                <ControlledInput control={control} name="zipCode" placeholder="00000-000" mask={maskCEP} />
              </div>

              <div className="col-span-12 lg:col-span-4 flex flex-col gap-1.5">
                <label className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">Como nos conheceu?</label>
                <ControlledNativeSelect
                  control={control}
                  name="howDidYouKnow"
                  placeholder="Selecione uma opção"
                  options={[
                    { value: "facebook", label: "Facebook" },
                    { value: "instagram", label: "Instagram" },
                    { value: "google", label: "Google Search" },
                    { value: "outdoor", label: "Outdoor / Placas" },
                    { value: "busdoor", label: "Busdoor (Ônibus)" },
                    { value: "tv", label: "Televisão / Rádio" },
                    { value: "indicação", label: "Indicação de Amigos" },
                    { value: "representante", label: "Indicação de Representante" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="glass-card p-8 rounded-[32px] border border-white/10 shadow-xl space-y-8">
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="text-brand-orange font-black text-[10px] uppercase tracking-[0.4em]">Passo 03</span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Segmentos de Interesse</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-medium">
                Selecione os departamentos que {ingresso === "visitante" ? "deseja visitar" : "sua empresa representa"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {setoresOpcoes.map((setor) => {
                const isSelected = setoresSelecionados.includes(setor);
                return (
                  <label
                    key={setor}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 p-6 rounded-[24px] border transition-all duration-500 cursor-pointer select-none group relative overflow-hidden h-32 text-center",
                      isSelected 
                        ? "bg-brand-cyan/10 border-brand-cyan/40 shadow-[0_0_30px_rgba(0,188,212,0.15)] ring-1 ring-brand-cyan/20 scale-[1.02]" 
                        : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10 hover:scale-[1.01]"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                      isSelected ? "border-brand-cyan bg-brand-cyan" : "border-white/20"
                    )}>
                      {isSelected && <span className="text-white text-[10px] font-black">✓</span>}
                    </div>
                    
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const novos = checked
                          ? [...setoresSelecionados, setor]
                          : setoresSelecionados.filter((s) => s !== setor);
                        setValue("sectors", novos);
                      }}
                      className="hidden"
                    />
                    
                    <span className={cn(
                      "text-xs font-black uppercase tracking-widest transition-colors duration-500",
                      isSelected ? "text-brand-cyan" : "text-white/30 group-hover:text-white/60"
                    )}>
                      {setor}
                    </span>

                    {/* Subtle glow background for active */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-linear-to-b from-brand-cyan/5 to-transparent pointer-events-none" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="p-8 bg-white/2 border border-white/5 rounded-[32px] flex items-start gap-6 cursor-pointer hover:bg-white/5 transition-all group">
            <Checkbox
              checked={checkbox}
              onCheckedChange={() => setCheckbox((prev) => !prev)}
              className="mt-1 w-6 h-6 border-white/20 data-[state=checked]:bg-brand-orange data-[state=checked]:border-brand-orange"
            />
            <div className="space-y-1">
              <p className="text-[11px] text-white/50 leading-relaxed font-bold uppercase tracking-tight group-hover:text-white/80 transition-colors">
                Confirmo que as informações são verídicas e aceito a <a href="https://www.expomultimix.com/politica-de-privacidade" target="_blank" className="text-brand-cyan hover:underline underline-offset-4 decoration-brand-cyan/30">política de privacidade</a> (LGPD).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <Button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1 || loading || isSubmitting}
          className={cn(
            "h-14 px-10 rounded-xl font-black uppercase tracking-widest transition-all",
            currentStep === 1 ? "opacity-0 pointer-events-none" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/10"
          )}
        >
          Anterior
        </Button>

        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="h-14 px-10 rounded-xl bg-brand-cyan text-white font-black uppercase tracking-widest shadow-lg shadow-brand-cyan/20 hover:bg-brand-cyan/90 transition-all hover:scale-105 active:scale-95"
          >
            Próximo Passo
          </Button>
        ) : (
          <Button
            disabled={!checkbox || loading || isSubmitting}
            type="submit"
            className="h-14 px-10 rounded-xl bg-brand-pink text-white font-black uppercase tracking-widest shadow-lg shadow-brand-pink/20 hover:bg-brand-pink/90 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            {loading || isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Finalizar Cadastro
          </Button>
        )}
      </div>
    </form>
  );
};
