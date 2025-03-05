'use client';

import { TrendingUp, ArrowUpRight, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { cn } from '@/shared/utils';

interface InsightMetadata {
  actionUrl?: string;
  actionLabel?: string;
}

interface Insight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  category: string;
  metadata: InsightMetadata;
}

interface InsightsGridProps {
  insights: Insight[];
}

export function InsightsGrid({ insights }: InsightsGridProps) {
  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 border rounded-lg bg-card/50">
        <div className="text-center space-y-3">
          <Info className="h-12 w-12 text-muted-foreground/50 mx-auto" />
          <div>
            <p className="text-base font-medium">Nenhum insight disponível</p>
            <p className="text-sm text-muted-foreground mt-1">
              Volte mais tarde para ver seus insights financeiros personalizados
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {insights.map((insight, index) => (
        <div 
          key={`${insight.category}-${index}`}
          className={cn(
            "relative rounded-lg border p-6 transition-all hover:shadow-md",
            {
              'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-950/50': insight.type === 'success',
              'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-950/50': insight.type === 'warning',
              'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-950/50': insight.type === 'info'
            }
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "rounded-full p-2.5",
              {
                'bg-emerald-100 dark:bg-emerald-950/50': insight.type === 'success',
                'bg-amber-100 dark:bg-amber-950/50': insight.type === 'warning',
                'bg-blue-100 dark:bg-blue-950/50': insight.type === 'info'
              }
            )}>
              {insight.type === 'success' && <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              {insight.type === 'warning' && <ArrowUpRight className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
              {insight.type === 'info' && <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <h3 className="font-medium tracking-tight text-base">
                {insight.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {insight.description}
              </p>
              {insight.metadata.actionUrl && (
                <div className="pt-2">
                  <Link href={insight.metadata.actionUrl}>
                    <Button 
                      variant="link" 
                      className={cn(
                        "h-auto p-0 text-sm font-medium",
                        {
                          'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300': insight.type === 'success',
                          'text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300': insight.type === 'warning',
                          'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300': insight.type === 'info'
                        }
                      )}
                    >
                      {insight.metadata.actionLabel} <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 