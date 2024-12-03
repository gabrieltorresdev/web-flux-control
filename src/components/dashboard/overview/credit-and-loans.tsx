import { CreditCard, Landmark } from "lucide-react";

export function CreditAndLoans() {
  const creditCardLimit = 10000;
  const creditCardUsed = 3500;
  const loanTotal = 50000;
  const loanPaid = 20000;

  const availableCredit = creditCardLimit - creditCardUsed;
  const remainingLoan = loanTotal - loanPaid;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Cartão de Crédito</span>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            Limite: R$ {creditCardLimit.toLocaleString("pt-BR")}
          </p>
          <p className="text-sm font-medium">
            Disponível:{" "}
            <span className="text-blue-500">
              R$ {availableCredit.toLocaleString("pt-BR")}
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Landmark className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Empréstimo</span>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            Total: R$ {loanTotal.toLocaleString("pt-BR")}
          </p>
          <p className="text-sm font-medium">
            Restante: R$ {remainingLoan.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>
    </div>
  );
}
