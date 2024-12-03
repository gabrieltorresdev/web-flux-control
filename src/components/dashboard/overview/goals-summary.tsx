import { Progress } from "@/components/ui/progress";

export default function GoalsSummary() {
  const goalProgress = 65; // Este valor deve vir de uma API ou estado global

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-2">
        Resumo de Metas Financeiras
      </p>
      <Progress value={goalProgress} className="w-full" />
      <p className="text-sm mt-2">
        Você já economizou {goalProgress}% da sua meta deste mês!
      </p>
    </div>
  );
}
