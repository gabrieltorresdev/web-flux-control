"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FinancialGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  type: "savings" | "debt";
};

export default function FinancialGoalTracker() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [type, setType] = useState<"savings" | "debt">("savings");

  const addGoal = () => {
    if (name && targetAmount && currentAmount && deadline) {
      setGoals([
        ...goals,
        {
          id: Date.now().toString(),
          name,
          targetAmount: parseFloat(targetAmount),
          currentAmount: parseFloat(currentAmount),
          deadline,
          type,
        },
      ]);
      setName("");
      setTargetAmount("");
      setCurrentAmount("");
      setDeadline("");
    }
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const updateGoalProgress = (id: string, newAmount: number) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, currentAmount: newAmount } : goal
      )
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Acompanhamento de Metas Financeiras</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Nome da meta"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Valor alvo"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Valor atual"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Data limite"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <Select
              value={type}
              onValueChange={(value: "savings" | "debt") => setType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de meta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Economia</SelectItem>
                <SelectItem value="debt">Redução de dívida</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addGoal}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Meta
            </Button>
          </div>
          <div className="space-y-4">
            {goals.map((goal) => (
              <Card key={goal.id} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{goal.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoal(goal.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p>
                  Tipo:{" "}
                  {goal.type === "savings" ? "Economia" : "Redução de dívida"}
                </p>
                <p>Meta: R$ {goal.targetAmount.toFixed(2)}</p>
                <p>Progresso: R$ {goal.currentAmount.toFixed(2)}</p>
                <p>
                  Data limite:{" "}
                  {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                </p>
                <Progress
                  value={(goal.currentAmount / goal.targetAmount) * 100}
                  className="mt-2"
                />
                <div className="mt-2">
                  <Input
                    type="number"
                    placeholder="Atualizar progresso"
                    onChange={(e) =>
                      updateGoalProgress(goal.id, parseFloat(e.target.value))
                    }
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
