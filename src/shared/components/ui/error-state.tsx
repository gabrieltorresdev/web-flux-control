import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Erro ao carregar dados",
  description = "Ocorreu um erro ao carregar os dados. Por favor, tente novamente.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <Card className={className}>
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-2">
            Tentar novamente
          </Button>
        )}
      </div>
    </Card>
  );
}
