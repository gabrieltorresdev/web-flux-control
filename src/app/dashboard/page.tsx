import FinancialDashboard from "@/components/dashboard/FinancialDashboard";

export default function DashboardPage() {
  // For demonstration purposes, we'll use dummy data
  const dummyTransactions = [
    {
      id: "1",
      description: "Salário",
      amount: 5000,
      date: "2023-05-01",
      category: "Renda",
      type: "income" as const,
    },
    {
      id: "2",
      description: "Aluguel",
      amount: 1500,
      date: "2023-05-05",
      category: "Moradia",
      type: "expense" as const,
    },
    {
      id: "3",
      description: "Supermercado",
      amount: 500,
      date: "2023-05-10",
      category: "Alimentação",
      type: "expense" as const,
    },
    {
      id: "4",
      description: "Freelance",
      amount: 1000,
      date: "2023-05-15",
      category: "Renda",
      type: "income" as const,
    },
  ];

  return (
    <div>
      <FinancialDashboard transactions={dummyTransactions} />
    </div>
  );
}
