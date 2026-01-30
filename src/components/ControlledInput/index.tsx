import React from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "@/components/ui/input";

type InputProps = Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  "name" | "value" | "onChange"
>;

interface ControlledInputProps<T extends FieldValues> extends InputProps {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  /**
   * Função que recebe o valor digitado e retorna a versão mascarada.
   * Exemplo: (val) => applyPhoneMask(val)
   */
  mask?: (value: string) => string;
}

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  label,
  mask,
  ...inputProps
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Valor a ser exibido: aplica máscara se fornecida
        const displayValue = mask
          ? mask(String(field.value ?? ""))
          : field.value;

        return (
          <>
            <Input
              {...inputProps}
              id={String(name)}
              value={displayValue}
              onChange={(e) => {
                const raw = e.target.value;
                const masked = mask ? mask(raw) : raw;
                // Atualiza o valor do RHF com a versão mascarada
                field.onChange(masked);
              }}
              onBlur={field.onBlur}
            />
            {fieldState.error && (
              <p className="text-sm text-red-600 mt-1">
                {fieldState.error.message}
              </p>
            )}
          </>
        );
      }}
    />
  );
}
