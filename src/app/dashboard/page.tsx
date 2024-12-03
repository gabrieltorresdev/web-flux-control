import { FinancialOverview } from "@/components/dashboard/overview/financial-overview";
import GraphsAndAnalysis from "@/components/dashboard/overview/graphs-and-analysis";

const spendingData = [
  { category: "Alimentação", amount: 467.49, fill: "hsl(200, 80%, 50%)" },
  { category: "Moradia", amount: 830.0, fill: "hsl(20, 60%, 45%)" },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col p-4 md:p-12 gap-4 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col md:flex-row items-baseline justify-between">
          {/* <h1 className="font-semibold leading-none tracking-tight text-xl w-full">
            Análise do período
          </h1> */}
          <div className="flex items-baseline justify-between md:justify-end gap-4 w-full">
            <span className="text-xs">
              01 de jul. de 2024 – 30 de jul. de 2024
            </span>
            <div className="rounded p-2 bg-background border flex gap-2">
              <button className="text-xs text-purple-700 font-medium">
                1m
              </button>
              <button className="text-xs opacity-50">3m</button>
              <button className="text-xs opacity-50">6m</button>
              <button className="text-xs opacity-50">12m</button>
            </div>
          </div>
        </div>
        <div className="">
          <FinancialOverview />
        </div>
        <div className="grid grid-cols-1 space-y-6 lg:grid-cols-12 lg:space-y-0 lg:space-x-6 xl:grid-cols-12">
          <div className="col-span-12">
            <GraphsAndAnalysis />
          </div>
        </div>
      </div>
    </div>
  );
}
