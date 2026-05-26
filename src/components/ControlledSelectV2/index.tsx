import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
        <div className="space-y-1.5">
          {label && (
            <label className="text-white/30 font-black text-[9px] uppercase tracking-widest ml-1">
              {label}
            </label>
          )}

          <Select value={field.value ?? ""} onValueChange={field.onChange}>
            <SelectTrigger
              className={cn(
                "w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:ring-4 focus:ring-brand-pink/20 transition-all",
                !field.value && "text-white/30",
                className
              )}
            >
              <SelectValue placeholder={placeholder || "Selecione"} />
            </SelectTrigger>
            <SelectContent className="bg-brand-blue border-white/10 text-white z-200">
              {options.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-sm font-bold text-white/80 focus:bg-white/10 focus:text-white cursor-pointer"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {fieldState.error && (
            <p className="text-sm text-red-400 mt-1">
              {fieldState.error.message as string}
            </p>
          )}
        </div>
      )}
    />
  );
}
