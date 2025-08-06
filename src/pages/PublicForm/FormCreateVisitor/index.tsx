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
import { Loader2, Save, Trash } from "lucide-react";
import { credenciamentoSchema, type CredenciamentoFormData } from "./schema";
import { maskCNPJ, maskPhoneBR, unmaskString } from "@/utils/masks";
import { isValidCNPJ } from "@/utils/isValidCnpj";
import { toast } from "sonner";
import { ControlledNativeSelect } from "@/components/ControlledSelectV2";
import { Input } from "@/components/ui/input";

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
        visitors: [],
      },
    });

  const { fairId } = useParams<{ fairId: string }>();
  const { create, loading } = usePublicFormService();
  const currentFairId = fairId;
  const navigate = useNavigate();

  const [visitors, setVisitors] = useState<string[]>([]);

  const addVisitor = () => setVisitors((prev) => [...prev, ""]);

  const updateVisitor = (idx: number, value: string) => {
    setVisitors((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  const removeVisitor = (idx: number) => {
    setVisitors((prev) => prev.filter((_, i) => i !== idx));
  };

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

    const allNames = [data.name, ...visitors];

    try {
      for (const nome of allNames) {
        const payload = {
          ingresso: data.ingresso,
          name: nome,
          company: data.company,
          email: data.email,
          phone: unmaskString(data.phone),
          zipCode: unmaskString(data.zipCode),
          howDidYouKnow: data.howDidYouKnow,
          category:
            data.ingresso === "representante-comercial"
              ? "Representante Comercial"
              : "Lojista",
          cnpj: unmaskString(data.cnpj || ""),
          sectors: data.sectors,
          fair_visitor: currentFairId || "",
          visitors: [],
        };
        const result = await create(payload);
        if (!result) {
          window.alert(`Falha ao cadastrar: ${nome}`);
          return;
        }
      }

      navigate("/sucess");
    } catch (err) {
      console.error(err);
      window.alert("Algo deu errado, tente novamente");
    }
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
                          ? "bg-pink-600 text-white"
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
      <div className="w-full flex items-center justify-center mb-4 gap-4">
        <Button type="button" onClick={addVisitor}>
          + Adicionar acompanhante
        </Button>
      </div>
      {visitors.length > 0 && (
        <div className="max-h-[5rem] overflow-auto space-y-2 p-2  rounded flex flex-col   items-center w-full">
          {visitors.map((name, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                defaultValue={name}
                placeholder="Nome do acompanhante"
                onChange={(e) => updateVisitor(idx, e.target.value)}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeVisitor(idx)}
              >
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
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
          disabled={!checkbox}
          type="submit"
          className="bg-pink-600 rounded-full w-[80%] hover:bg-pink-700 text-white"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save />}
          Enviar
        </Button>
      </div>
    </form>
  );
};
