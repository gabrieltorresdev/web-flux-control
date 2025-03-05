import { Suspense } from 'react';
import { AlertCircle } from 'lucide-react';
import { getInsights } from '@/features/dashboard/actions/insights';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { AnimatedPage } from '@/shared/components/layout/animated-page';
import { MonthFilter } from '@/features/transactions/components/month-filter';
import { auth } from "@/features/auth/lib/auth";
import { Card } from '@/shared/components/ui/card';
import { InsightsGrid } from '@/features/dashboard/components/insights-grid';

type SearchParams = {
  month?: string;
  year?: string;
};

interface DashboardPageProps {
  searchParams: Promise<SearchParams>;
}

async function DashboardContent({ month, year }: SearchParams) {
  const session = await auth();
  const user = session?.user;
  
  let insights;
  let error = null;

  try {
    insights = await getInsights({ month, year });
  } catch (err) {
    error = err;
    console.error('Failed to fetch insights:', err);
  }

  if (error || !insights) {
    return (
      <div className="max-w-7xl mx-auto px-3 py-6">
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
      <div className="max-w-7xl mx-auto flex flex-col gap-3 px-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-muted-foreground text-sm font-medium">
            Olá, <strong className="text-primary">{user?.name}</strong>
          </h1>
          <MonthFilter initialMonth={month} initialYear={year} />
        </div>

        <InsightsGrid insights={insights.data} />
      </div>
    </AnimatedPage>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { month, year } = await searchParams;

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-sm text-muted-foreground">Carregando insights...</div>
      </div>
    }>
      <DashboardContent month={month} year={year} />
    </Suspense>
  );
}
