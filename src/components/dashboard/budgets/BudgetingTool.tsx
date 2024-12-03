"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type CategoriaOrcamento = {
  id: string;
  nome: string;
  valor: number;
};

export default function BudgetingTool() {
  const [categorias, setCategorias] = useState<CategoriaOrcamento[]>([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoValor, setNovoValor] = useState("");

  const adicionarCategoria = () => {
    if (novaCategoria && novoValor) {
      setCategorias([
        ...categorias,
        {
          id: Date.now().toString(),
          nome: novaCategoria,
          valor: parseFloat(novoValor),
        },
      ]);
      setNovaCategoria("");
      setNovoValor("");
    }
  };

  const removerCategoria = (id: string) => {
    setCategorias(categorias.filter((categoria) => categoria.id !== id));
  };

  const orcamentoTotal = categorias.reduce(
    (soma, categoria) => soma + categoria.valor,
    0
  );

  const CORES = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ferramenta de Orçamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4">
              Adicionar Nova Categoria
            </h3>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Nome da categoria"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Valor"
                value={novoValor}
                onChange={(e) => setNovoValor(e.target.value)}
              />
              <Button onClick={adicionarCategoria}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className="flex items-center justify-between bg-secondary p-2 rounded"
                >
                  <span>
                    {categoria.nome}: R$ {categoria.valor.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removerCategoria(categoria.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4">
              Alocação do Orçamento
            </h3>
            {categorias.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorias}
                    dataKey="valor"
                    nameKey="nome"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {categorias.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CORES[index % CORES.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">
                Adicione categorias para ver a alocação do seu orçamento
              </p>
            )}
            <p className="text-center mt-4 font-semibold">
              Orçamento Total: R$ {orcamentoTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
