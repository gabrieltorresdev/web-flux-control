"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
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
  { name: "01/05", receitas: 4000, despesas: 2400, saldo: 1600 },
  { name: "08/05", receitas: 3000, despesas: 1398, saldo: 1602 },
  { name: "15/05", receitas: 2000, despesas: 9800, saldo: -7800 },
  { name: "22/05", receitas: 2780, despesas: 3908, saldo: -1128 },
  { name: "29/05", receitas: 1890, despesas: 4800, saldo: -2910 },
];

export function BalanceEvolutionChart() {
  const [timeInterval, setTimeInterval] = useState("weekly");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Evolução do Saldo</CardTitle>
        <Select value={timeInterval} onValueChange={setTimeInterval}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Intervalo de tempo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
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
            <Line
              type="monotone"
              dataKey="receitas"
              stroke="#82ca9d"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="despesas"
              stroke="#ff7300"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
