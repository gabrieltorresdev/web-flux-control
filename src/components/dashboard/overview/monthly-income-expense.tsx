import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export function MonthlyIncomeExpense() {
  const income = 10000; // Este valor deve vir de uma API ou estado global
  const expense = 7000; // Este valor deve vir de uma API ou estado global

  return (
    <div className="flex justify-between">
      <div className="flex items-center space-x-2">
        <ArrowUpCircle className="h-5 w-5 text-green-500" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Receitas do Mês
          </p>
          <p className="text-lg font-semibold text-green-600">
            R$ {income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <ArrowDownCircle className="h-5 w-5 text-red-500" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Despesas do Mês
          </p>
          <p className="text-lg font-semibold text-red-600">
            R$ {expense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
