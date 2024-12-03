"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
};

export function FinancialGoals() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      name: "Emergency Fund",
      targetAmount: 10000,
      currentAmount: 5000,
    },
    { id: "2", name: "Vacation", targetAmount: 5000, currentAmount: 2000 },
  ]);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  const addGoal = () => {
    if (newGoalName && newGoalTarget) {
      const newGoal: Goal = {
        id: Date.now().toString(),
        name: newGoalName,
        targetAmount: parseFloat(newGoalTarget),
        currentAmount: 0,
      };
      setGoals([...goals, newGoal]);
      setNewGoalName("");
      setNewGoalTarget("");
    }
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[200px] pr-4">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{goal.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeGoal(goal.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={(goal.currentAmount / goal.targetAmount) * 100} />
            <div className="text-sm text-muted-foreground">
              R$ {goal.currentAmount.toLocaleString("pt-BR")} / R${" "}
              {goal.targetAmount.toLocaleString("pt-BR")}
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="flex space-x-2">
        <Input
          placeholder="Goal name"
          value={newGoalName}
          onChange={(e) => setNewGoalName(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Target amount"
          value={newGoalTarget}
          onChange={(e) => setNewGoalTarget(e.target.value)}
        />
      </div>
      <Button onClick={addGoal} className="w-full">
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Goal
      </Button>
    </div>
  );
}
