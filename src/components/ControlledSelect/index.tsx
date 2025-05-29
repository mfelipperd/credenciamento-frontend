import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

export function ControlledSelect<T extends FieldValues>({
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
        <div className="mb-4">
          {label && (
            <label
              htmlFor={String(name)}
              className="block mb-1 text-sm font-medium"
            >
              {label}
            </label>
          )}
          <Select
            key={field.name} // importante para manter a instância sincronizada
            onValueChange={(val) => {
              field.onChange(val);
              // NÃO desmonte imediatamente aqui
            }}
            value={(field.value ?? "") as string} // previne undefined
          >
            <SelectTrigger className={cn("w-ful", className)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent
              className={`
            
          border-none
          data-[state=open]:animate-fadeIn
          data-[state=closed]:animate-fadeOut
        `}
            >
              {options.map((opt, index) => (
                <SelectItem
                  key={opt.value + index}
                  value={opt.value}
                  className="hover:bg-gray-100"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
