import { HandCoins, Wallet } from "lucide-react";

export function CurrentBalance() {
  const balance = 5000; // Este valor deve vir de uma API ou estado global
  const extraBalance = 6500; // Soma do crédito disponível e outros saldos extras

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div className="flex items-center gap-4">
        <Wallet className="h-10 w-10 text-primary" />
        <div>
          <p className="text-base font-medium text-muted-foreground">
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
      <div className="flex items-center md:justify-end md:flex-row-reverse gap-4">
        <HandCoins className="h-10 w-10 text-primary" />
        <div className="md:text-right">
          <p className="text-base font-medium text-muted-foreground">
            Saldo Extra
          </p>
          <p className="text-2xl font-bold text-blue-600">
            R${" "}
            {extraBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
