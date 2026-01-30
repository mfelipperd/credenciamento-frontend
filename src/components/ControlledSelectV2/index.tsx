import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";

interface SelectOption {
  label: string;
  value: string;
}

interface ControlledSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  label?: string;
}

export function ControlledNativeSelect<T extends FieldValues>({
  control,
  name,
  options,
  placeholder,
  className,
  label,
}: ControlledSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="relative space-y-1.5">
          {label && (
            <label className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">
              {label}
            </label>
          )}

          <div className="relative">
            <select
              id={String(name)}
              className={cn(
                "w-full h-12 appearance-none bg-white/5 border border-white/10 rounded-xl px-4 text-base text-white pr-10 focus:outline-none focus:ring-4 focus:ring-brand-pink/20 transition-all font-bold placeholder:text-white/20 md:text-sm shadow-inner",
                className
              )}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
            >
              <option value="" disabled>
                {placeholder || "Selecione"}
              </option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Ícone Chevron customizado */}
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {fieldState.error && (
            <p className="text-sm text-red-600 mt-1">
              {fieldState.error.message as string}
            </p>
          )}
          </div>
      )}
    />
  );
}
