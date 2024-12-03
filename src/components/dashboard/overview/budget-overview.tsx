import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type BudgetCategory = {
  name: string;
  budget: number;
  spent: number;
  subcategories: {
    name: string;
    spent: number;
  }[];
};

const budgetData: BudgetCategory[] = [
  {
    name: "Alimentação",
    budget: 1000,
    spent: 800,
    subcategories: [
      { name: "Supermercado", spent: 500 },
      { name: "Restaurantes", spent: 200 },
      { name: "Lanches", spent: 100 },
    ],
  },
  {
    name: "Transporte",
    budget: 500,
    spent: 450,
    subcategories: [
      { name: "Combustível", spent: 300 },
      { name: "Transporte Público", spent: 150 },
    ],
  },
  // Adicione mais categorias conforme necessário
];

export function BudgetOverview() {
  return (
    <div className="space-y-6">
      {budgetData.map((category) => (
        <div key={category.name} className="space-y-2">
          <h3 className="font-semibold text-sm sm:text-base">
            {category.name}
          </h3>
          <Progress value={(category.spent / category.budget) * 100} />
          <div className="flex justify-between text-xs sm:text-sm">
            <span>
              R$ {category.spent.toLocaleString("pt-BR")} / R${" "}
              {category.budget.toLocaleString("pt-BR")}
            </span>
            <span>{Math.round((category.spent / category.budget) * 100)}%</span>
          </div>
          {category.spent > category.budget * 0.9 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">Atenção</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                Você já utilizou{" "}
                {Math.round((category.spent / category.budget) * 100)}% do
                orçamento de {category.name}.
              </AlertDescription>
            </Alert>
          )}
          <div className="pl-4 space-y-1">
            {category.subcategories.map((subcategory) => (
              <div
                key={subcategory.name}
                className="flex justify-between text-xs sm:text-sm"
              >
                <span>{subcategory.name}</span>
                <span>R$ {subcategory.spent.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
