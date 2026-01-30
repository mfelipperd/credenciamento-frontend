import React, { useState } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type InputProps = Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  "name" | "value" | "onChange" | "type"
>;

interface PasswordInputProps<T extends FieldValues> extends InputProps {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  /**
   * Função que recebe o valor digitado e retorna a versão mascarada.
   * Exemplo: (val) => applyPhoneMask(val)
   */
  mask?: (value: string) => string;
}

export function PasswordInput<T extends FieldValues>({
  control,
  name,
  label,
  mask,
  ...inputProps
}: PasswordInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

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
          <div className="relative w-full">
            <Input
              {...inputProps}
              id={String(name)}
              type={showPassword ? "text" : "password"}
              value={displayValue}
              onChange={(e) => {
                const raw = e.target.value;
                const masked = mask ? mask(raw) : raw;
                // Atualiza o valor do RHF com a versão mascarada
                field.onChange(masked);
              }}
              onBlur={field.onBlur}
              className={cn("pr-10", inputProps.className)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {fieldState.error && (
              <p className="text-sm text-red-600 mt-1">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
