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
}

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  label,
  ...inputProps
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="mb-4">
          {label && (
            <label
              htmlFor={String(name)}
              className="block mb-1 text-sm font-medium text-neutral-400"
            >
              {label}
            </label>
          )}
          <Input {...inputProps} {...field} id={String(name)} />
          {fieldState.error && (
            <p className="text-sm text-red-600 mt-1">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
