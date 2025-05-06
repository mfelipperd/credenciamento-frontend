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
}

export function ControlledSelect<T extends FieldValues>({
  control,
  name,
  options,
  placeholder,
  label,
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
            onValueChange={field.onChange}
            value={field.value as unknown as string}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
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
