"use client";

import { useMemo } from "react";

export function useCurrencyFormatter() {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    []
  );

  const formatCurrency = useMemo(
    () => (value: number) => {
      const isNegative = value < 0;
      return `${isNegative ? "-" : ""}${formatter.format(Math.abs(value))}`;
    },
    [formatter]
  );

  return formatCurrency;
}
