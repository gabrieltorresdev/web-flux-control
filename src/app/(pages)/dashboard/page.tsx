import { Suspense } from 'react';
import { AlertCircle } from 'lucide-react';
import { getInsights } from '@/features/dashboard/actions/insights';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { AnimatedPage } from '@/shared/components/layout/animated-page';
import { MonthFilter } from '@/features/transactions/components/month-filter';
import { auth } from "@/features/auth/lib/auth";
import { InsightsGrid } from '@/features/dashboard/components/insights-grid';
import { InsightsSkeleton } from '@/features/dashboard/components/insights-skeleton';
import { Skeleton } from '@/shared/components/ui/skeleton';

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
      <div className="max-w-7xl mx-auto px-4 py-6">
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
      <div className="max-w-7xl mx-auto flex flex-col gap-4 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-foreground text-base font-medium">
            Olá, <span className="text-primary font-semibold">{user?.name}</span>
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
      <div className="max-w-7xl mx-auto flex flex-col gap-4 px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
        <InsightsSkeleton />
      </div>
    }>
      <DashboardContent month={month} year={year} />
    </Suspense>
  );
}
