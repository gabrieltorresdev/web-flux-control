import { BudgetSummary } from "@/src/components/budget/budget-summary";
import { BudgetList } from "@/src/components/budget/budget-list";
import { Button } from "@/src/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/ui/sheet";
import { BudgetForm } from "@/src/components/budget/budget-form";
import { Separator } from "@/src/components/ui/separator";

export default function BudgetPage() {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-3">
      <div className="text-muted-foreground text-sm md:text-base text-center">
        Gerencie seus <strong>orçamentos</strong> e acompanhe seus gastos
      </div>

      <div className="flex flex-col gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full">Novo Orçamento</Button>
          </SheetTrigger>
          <SheetContent className="w-[400px]">
            <SheetHeader>
              <SheetTitle>Novo Orçamento</SheetTitle>
              <SheetDescription>
                Crie um novo orçamento para controlar seus gastos
              </SheetDescription>
            </SheetHeader>
            <div className="mt-8">
              <BudgetForm />
            </div>
          </SheetContent>
        </Sheet>

        <BudgetSummary />
        <Separator />
        <BudgetList />
      </div>
    </div>
  );
}
