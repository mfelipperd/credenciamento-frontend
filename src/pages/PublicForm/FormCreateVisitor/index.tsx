// src/pages/FormularioCredenciamento.tsx
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControlledInput } from "@/components/ControlledInput";
import { ControlledSelect } from "@/components/ControlledSelect";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { usePublicFormService } from "@/service/publicform.service";
import { Loader2, Save } from "lucide-react";
import {
  credenciamentoSchema,
  defaultVisitorCnpj,
  type CredenciamentoFormData,
} from "./schema";
import { maskCNPJ, unmaskString } from "@/utils/masks";

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
  const { control, handleSubmit, watch, setValue } =
    useForm<CredenciamentoFormData>({
      resolver: zodResolver(credenciamentoSchema),
      defaultValues: {
        ingresso: "lojista",
        sectors: [],
        howDidYouKnow: "",
      },
    });
  const { fairId } = useParams<{ fairId: string }>();
  const { create, loading } = usePublicFormService();
  const currentFairId = fairId;

  const onSubmit = async (data: CredenciamentoFormData) => {
    const payload = {
      ...data,
      zipCode: unmaskString(data.zipCode),
      cnpj: unmaskString(data.cnpj),
      phone: unmaskString(data.phone),
      category: data.ingresso,
      fair_visitor: currentFairId,
    };
    const result = await create(payload);
    if (!result) return window.alert("Algo deu errado tente novamente");
    window.alert("Inscrição relaizada com sucesso!");
  };

  const setoresSelecionados = watch("sectors") || [];
  const ingresso = watch("ingresso");

  useEffect(() => {
    if (ingresso === "visitante") setValue("cnpj", defaultVisitorCnpj);
  }, [ingresso]);
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md p-6 bg-neutral-100 rounded-lg "
    >
      <div className="h-[60vh] scrollable-content">
        {/* Tipo de ingresso */}
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
                className="mt-2 w-full"
              >
                {(["lojista", "visitante"] as const).map((opt) => (
                  <ToggleGroupItem
                    key={opt}
                    value={opt}
                    className={` rounded-full cursor-pointer ${
                      field.value === opt
                        ? "bg-gray-400 text-white"
                        : "bg-transparent"
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
        {/* Campos de texto alinhados ao DTO */}
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
            placeholder="00000000000000"
            mask={maskCNPJ}
          />
        )}
        <ControlledInput
          control={control}
          name="phone"
          label="Telefone"
          placeholder="(00)00000-0000"
        />
        <ControlledInput
          control={control}
          name="zipCode"
          label="CEP"
          placeholder="00000000"
        />
        {/* Setores */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">
            Setores que a empresa atua
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
        {/* Como nos conheceu */}
        <ControlledSelect
          className="bg-white border-none rounded-full"
          control={control}
          name="howDidYouKnow"
          label="Como nos conheceu"
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
            { value: "outro", label: "Outro" },
          ]}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="bg-pink-600 hover:bg-pink-700 text-white"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save />}
          Enviar
        </Button>
      </div>
    </form>
  );
};
