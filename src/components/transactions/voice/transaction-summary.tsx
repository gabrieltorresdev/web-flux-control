"use client";

import { memo } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TransactionInput } from "@/types/transaction";
import type { Category } from "@/types/category";

type TransactionSummaryProps = {
  transaction: TransactionInput;
  category?: Category;
  onConfirm: () => void;
  onCancel: () => void;
};

function TransactionSummaryComponent({
  transaction,
  category,
  onConfirm,
  onCancel,
}: TransactionSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Confirmar Transação</h3>

        <dl className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <dt className="text-muted-foreground">Valor:</dt>
            <dd className="font-medium">
              {formatCurrency(transaction.amount)}
            </dd>
          </div>

          <div className="flex justify-between py-2 border-b">
            <dt className="text-muted-foreground">Categoria:</dt>
            <dd className="font-medium">
              {category?.name} (
              {category?.type === "income" ? "Entrada" : "Saída"})
            </dd>
          </div>

          <div className="flex justify-between py-2 border-b">
            <dt className="text-muted-foreground">Data:</dt>
            <dd className="font-medium">
              {new Date(transaction.date).toLocaleDateString("pt-BR")}
            </dd>
          </div>

          <div className="flex justify-between py-2 border-b">
            <dt className="text-muted-foreground">Título:</dt>
            <dd className="font-medium">{transaction.title}</dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onConfirm}>
          <Check className="w-4 h-4 mr-2" />
          Confirmar
        </Button>
      </CardFooter>
    </Card>
  );
}

export const TransactionSummary = memo(TransactionSummaryComponent);
