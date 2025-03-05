import { Suspense } from 'react';
import { TrendingUp, ArrowUpRight, AlertCircle, ArrowRight, Info } from 'lucide-react';
import { getInsights } from '@/features/dashboard/actions/insights';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { AnimatedPage } from '@/shared/components/layout/animated-page';
import { Button } from '@/shared/components/ui/button';
import { MonthFilter } from '@/features/transactions/components/month-filter';
import Link from 'next/link';
import { cn } from '@/shared/utils';

interface DashboardPageProps {
  searchParams: {
    month?: string;
    year?: string;
  };
}

async function DashboardContent({ searchParams }: DashboardPageProps) {
  let insights;
  let error = null;

  try {
    insights = await getInsights(searchParams);
  } catch (err) {
    error = err;
    console.error('Failed to fetch insights:', err);
  }

  if (error || !insights) {
    return (
      <div className="px-4 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Falha ao carregar os insights. Por favor, tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AnimatedPage>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="border-b pb-5 px-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <MonthFilter 
                initialMonth={searchParams.month}
                initialYear={searchParams.year}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Acompanhe seus dados financeiros
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 space-y-6">
          {/* Insights Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium tracking-tight">
                Insights Financeiros
              </h2>
            </div>

            <div className="space-y-4">
              {insights.data.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">Nenhum insight disponível no momento.</p>
                  <p className="text-xs mt-1">Volte mais tarde para ver seus insights financeiros personalizados.</p>
                </div>
              ) : (
                insights.data.map((insight, index) => (
                  <div 
                    key={`${insight.category}-${index}`}
                    className="relative rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "rounded-full p-1.5 sm:p-2",
                        {
                          'bg-emerald-50 dark:bg-emerald-950/50': insight.type === 'success',
                          'bg-amber-50 dark:bg-amber-950/50': insight.type === 'warning',
                          'bg-blue-50 dark:bg-blue-950/50': insight.type === 'info'
                        }
                      )}>
                        {insight.type === 'success' && <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />}
                        {insight.type === 'warning' && <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />}
                        {insight.type === 'info' && <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="font-medium leading-none tracking-tight text-sm sm:text-base">
                          {insight.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {insight.description}
                        </p>
                        {insight.metadata.actionUrl && (
                          <div className="pt-1.5">
                            <Link href={insight.metadata.actionUrl}>
                              <Button 
                                variant="link" 
                                className={cn(
                                  "h-auto p-0 text-xs sm:text-sm",
                                  {
                                    'text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400': insight.type === 'success',
                                    'text-amber-500 hover:text-amber-600 dark:hover:text-amber-400': insight.type === 'warning',
                                    'text-blue-500 hover:text-blue-600 dark:hover:text-blue-400': insight.type === 'info'
                                  }
                                )}
                              >
                                {insight.metadata.actionLabel} <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
              Insights gerados com base em seu histórico financeiro
            </p>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-sm text-muted-foreground">Carregando insights...</div>
      </div>
    }>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
