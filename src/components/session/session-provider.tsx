import { useSessionManager } from "@/hooks/use-session-manager";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

interface SessionProviderProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ["/login", "/register"];

export function SessionProvider({ children }: SessionProviderProps) {
  const { isLoading } = useSessionManager();
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Mostra loading state apenas em rotas protegidas
  if (isLoading && !isPublicRoute) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
