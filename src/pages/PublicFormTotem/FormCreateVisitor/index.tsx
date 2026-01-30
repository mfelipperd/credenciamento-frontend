// src/pages/FormularioCredenciamento.tsx
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControlledInput } from "@/components/ControlledInput";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { usePublicFormService } from "@/service/publicform.service";
import { Loader2, Save } from "lucide-react";
import { credenciamentoSchema, type CredenciamentoFormData } from "./schema";
import { maskCNPJ, maskPhoneBR, unmaskString } from "@/utils/masks";
import { isValidCNPJ } from "@/utils/isValidCnpj";
import { toast } from "sonner";
import { ControlledNativeSelect } from "@/components/ControlledSelectV2";

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
  const { control, handleSubmit, watch, setValue, setError } =
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
  const navigate = useNavigate();

  const onSubmit = async (data: CredenciamentoFormData) => {
    if (!checkbox) {
      return toast.error("Aceite os termos!");
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

    const payload = {
      ...data,
      zipCode: unmaskString(data.zipCode),
      cnpj: unmaskString(data.cnpj || ""),
      phone: unmaskString(data.phone),
      ingresso: data.ingresso as "lojista" | "representante-comercial",

      fair_visitor: currentFairId,
    };
    const result = await create(payload);
    if (!result) return window.alert("Algo deu errado tente novamente");
    navigate("/sucess-totem");
  };

  const setoresSelecionados = watch("sectors") || [];
  const ingresso = watch("ingresso");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
                  setValue(
                    "ingresso",
                    val as "lojista" | "representante-comercial"
                  )
                }
                className="mt-2 w-full space-x-2.5 "
              >
                {(["lojista", "representante-comercial"] as const).map(
                  (opt) => (
                    <ToggleGroupItem
                      key={opt}
                      value={opt}
                      className={` rounded-full cursor-pointer text ${
                        field.value === opt
                          ? "bg-brand-pink text-white"
                          : "bg-white"
                      }`}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </ToggleGroupItem>
                  )
                )}
              </ToggleGroup>
              {fieldState.error && (
                <p className="text-sm text-red-600 mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
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
        <ControlledInput
          control={control}
          name="cnpj"
          label="CNPJ"
          placeholder="__.___.___/____-__"
          mask={maskCNPJ}
        />
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
            { value: "outro", label: "Outros" },
          ]}
        />
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">
            Setores que{" "}
            {ingresso === "representante-comercial"
              ? "tem interesse:"
              : "a empresa atua:"}
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
            className="text-brand-pink hover:underline"
          >
            termos e condições
          </a>
        </p>
      </div>
      <div className="flex justify-center pt-4">
        <Button
          disabled={!checkbox}
          type="submit"
          className="bg-brand-pink rounded-full w-[80%] hover:bg-brand-pink/90 text-white"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save />}
          Enviar
        </Button>
      </div>
    </form>
  );
};
