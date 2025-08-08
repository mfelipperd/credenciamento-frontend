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
              className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
            >
              {label}
            </label>
          )}
          <Select
            onValueChange={(val) => {
              field.onChange(val);
            }}
            value={field.value ? String(field.value) : ""}
          >
            <SelectTrigger className={cn("w-full", className)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="border-none overflow-y-auto max-h-60 ">
              {options.map((opt) => (
                <SelectItem
                  key={opt.value}
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
