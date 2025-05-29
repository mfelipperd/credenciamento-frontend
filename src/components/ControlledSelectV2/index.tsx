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
  label?: string;
  className?: string;
}

export function ControlledNativeSelect<T extends FieldValues>({
  control,
  name,
  options,
  placeholder,
  label,
  className,
}: ControlledSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="mb-4 relative">
          {label && (
            <label
              htmlFor={String(name)}
              className="block mb-1 text-sm font-medium"
            >
              {label}
            </label>
          )}

          <div className="relative">
            <select
              id={String(name)}
              className={cn(
                "w-full appearance-none border rounded-md px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-black",
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
