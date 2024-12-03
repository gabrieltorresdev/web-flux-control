import { Wallet } from "lucide-react";

export function CurrentBalance() {
  const balance = 5000; // Este valor deve vir de uma API ou estado global
  const extraBalance = 6500; // Soma do crédito disponível e outros saldos extras

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center space-x-4">
        <Wallet className="h-10 w-10 text-primary" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Saldo Atual
          </p>
          <p
            className={`text-2xl font-bold ${
              balance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Saldo Extra</p>
        <p className="text-xl font-semibold text-blue-500">
          R${" "}
          {extraBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}
