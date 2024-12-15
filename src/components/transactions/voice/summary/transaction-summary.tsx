"use client";

import { memo, useCallback } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditableField } from "./editable-field";
import type { TransactionInput } from "@/types/transaction";
import type { Category } from "@/types/category";

type TransactionSummaryProps = {
  transaction: TransactionInput;
  category?: Category;
  onConfirm: () => void;
  onCancel: () => void;
  onUpdate: (field: keyof TransactionInput, value: string) => void;
};

function TransactionSummaryComponent({
  transaction,
  category,
  onConfirm,
  onCancel,
  onUpdate,
}: TransactionSummaryProps) {
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Confirmar Transação</h3>

        <dl className="space-y-2">
          <EditableField
            label="Valor"
            value={transaction.amount.toString()}
            type="number"
            onSave={(value) => onUpdate("amount", value)}
          />

          <div className="flex justify-between py-2 border-b">
            <dt className="text-muted-foreground">Categoria:</dt>
            <dd className="font-medium">
              {category?.name} ({category?.type === "income" ? "Entrada" : "Saída"})
            </dd>
          </div>

          <EditableField
            label="Data"
            value={transaction.date}
            type="date"
            onSave={(value) => onUpdate("date", value)}
          />

          <EditableField
            label="Hora"
            value={transaction.time}
            type="time"
            onSave={(value) => onUpdate("time", value)}
          />

          <EditableField
            label="Título"
            value={transaction.title}
            onSave={(value) => onUpdate("title", value)}
          />
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