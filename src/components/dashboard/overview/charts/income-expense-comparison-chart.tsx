"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const data = [
  { name: "Jan", receitas: 4000, despesas: 2400 },
  { name: "Fev", receitas: 3000, despesas: 1398 },
  { name: "Mar", receitas: 2000, despesas: 9800 },
  { name: "Abr", receitas: 2780, despesas: 3908 },
  { name: "Mai", receitas: 1890, despesas: 4800 },
  { name: "Jun", receitas: 2390, despesas: 3800 },
];

export function IncomeExpenseComparisonChart() {
  const [expenseType, setExpenseType] = useState("all");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Comparação Receitas vs. Despesas
        </CardTitle>
        <Select value={expenseType} onValueChange={setExpenseType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de despesa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as despesas</SelectItem>
            <SelectItem value="fixed">Despesas fixas</SelectItem>
            <SelectItem value="variable">Despesas variáveis</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value}`} />
            <Legend />
            <Bar dataKey="receitas" fill="#82ca9d" />
            <Bar dataKey="despesas" fill="#ff7300" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
