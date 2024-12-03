import { DashboardOverviewBalanceInfoCard } from "@/components/dashboard/overview/balance-info-card";
import { DashboardOverviewRecentTransactions } from "@/components/dashboard/overview/recent-transactions";
import { DashboardOverviewSpendingByCategoryChart } from "@/components/dashboard/overview/spending-by-category-chart";

type DayTransactions = {
  date: string;
  transactions: {
    description: string;
    time: string;
    amount: string;
    type: "income" | "expense";
    category: {
      name: string;
      color: string;
    };
  }[];
};

const transactionsByDay: DayTransactions[] = [
  {
    date: "2024-11-29",
    transactions: [
      {
        description: "Salário",
        time: "13:40",
        amount: "5000.00",
        type: "income",
        category: {
          name: "Receita",
          color: "hsl(120, 70%, 40%)",
        },
      },
    ],
  },
  {
    date: "2024-11-28",
    transactions: [
      {
        description: "Compra em Mercado Extra",
        time: "16:40",
        amount: "-467.49",
        type: "expense",
        category: {
          name: "Alimentação",
          color: "hsl(200, 80%, 50%)",
        },
      },
      {
        description: "Pagamento Aluguel",
        time: "12:20",
        amount: "-830.00",
        type: "expense",
        category: {
          name: "Moradia",
          color: "hsl(20, 60%, 45%)",
        },
      },
    ],
  },
];

const spendingData = [
  { category: "Alimentação", amount: 467.49, fill: "hsl(200, 80%, 50%)" },
  { category: "Moradia", amount: 830.0, fill: "hsl(20, 60%, 45%)" },
];

export default function Dashboard() {
  return (
    <div className="flex p-4 md:p-12">
      <div className="flex flex-col gap-6 w-full">
        <DashboardOverviewHeader />
        <div className="grid md:grid-cols-3 gap-4">
          <DashboardOverviewBalanceInfoCard
            title="Saldo Atual"
            amount="R$3500,00"
            difference="- R$50,00 se comparado ao mês anterior"
            differenceColor="text-red-600"
          />
          <DashboardOverviewBalanceInfoCard
            title="Entradas"
            amount="R$5000,00"
            difference="+ R$100,30 se comparado ao mês anterior"
            differenceColor="text-green-600"
          />
          <DashboardOverviewBalanceInfoCard
            title="Despesas"
            amount="R$1500,00"
            amountColor="text-red-600"
            difference="- R$560,00 se comparado ao mês anterior"
            differenceColor="text-green-600"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <DashboardOverviewRecentTransactions
              transactions={transactionsByDay}
            />
          </div>
          <DashboardOverviewSpendingByCategoryChart data={spendingData} />
        </div>
      </div>
    </div>
  );
}
