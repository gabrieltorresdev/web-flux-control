"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface AddTransactionDialogProps {
  onAddTransaction: (transaction: {
    description: string;
    amount: string;
    type: "income" | "expense";
    category: {
      name: string;
      color: string;
    };
  }) => void;
}

export function AddTransactionDialog({
  onAddTransaction,
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Outro");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryColors: Record<string, string> = {
      Receita: "hsl(120, 70%, 40%)",
      Alimentação: "hsl(200, 80%, 50%)",
      Moradia: "hsl(20, 60%, 45%)",
      Outro: "hsl(0, 0%, 50%)",
    };
    onAddTransaction({
      description,
      amount: type === "income" ? amount : `-${amount}`,
      type,
      category: {
        name: category,
        color: categoryColors[category],
      },
    });
    setOpen(false);
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("Outro");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Input
            type="number"
            placeholder="Valor"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            step="0.01"
          />
          <Select
            value={type}
            onValueChange={(value: "income" | "expense") => setType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Receita">Receita</SelectItem>
              <SelectItem value="Alimentação">Alimentação</SelectItem>
              <SelectItem value="Moradia">Moradia</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full">
            Adicionar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
