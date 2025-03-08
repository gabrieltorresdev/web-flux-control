import * as React from "react"

import { cn } from "@/shared/utils"

type InputType = React.HTMLInputTypeAttribute | "currency";

interface InputProps extends Omit<React.ComponentProps<"input">, "type"> {
  type?: InputType;
  currencyFormat?: Intl.NumberFormat;
}

const defaultCurrencyFormat = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function Input({ className, type = "text", currencyFormat, onChange, onFocus, ...props }: InputProps) {
  const isCurrency = type === "currency";
  const inputType = isCurrency ? "text" : type;

  const formatCurrency = (value: number) => {
    return (currencyFormat ?? defaultCurrencyFormat).format(value);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isCurrency) {
      const target = e.currentTarget;
      target.setSelectionRange(target.value.length, target.value.length);
    }
    onFocus?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCurrency) {
      const target = e.currentTarget;
      const numericValue = Number(target.value.replace(/\D/g, "")) / 100;
      target.value = formatCurrency(numericValue);
    }
    onChange?.(e);
  };

  return (
    <input
      type={inputType}
      data-slot="input"
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      maxLength={isCurrency ? 22 : undefined}
      onFocus={handleFocus}
      onChange={handleChange}
      {...props}
    />
  )
}

export { Input }
