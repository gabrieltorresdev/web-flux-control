'use client';

import { TrendingUp, ArrowUpRight, Info, ChevronDown, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/shared/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import Link from 'next/link';
import { cn } from '@/shared/utils';
import { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Badge } from '@/shared/components/ui/badge';

interface InsightMetadata {
  actionUrl?: string;
  actionLabel?: string;
}

interface Insight {
  type: 'success' | 'warning' | 'info' | 'danger';
  title: string;
  description: string;
  category: string;
  metadata: InsightMetadata;
}

interface InsightsGridProps {
  insights: Insight[];
}

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  return (
    <Alert
      key={`${insight.category}-${index}`}
      variant={insight.type === 'danger' ? 'destructive' : insight.type}
      className={cn(
        "relative overflow-hidden pl-12 pr-4 py-3 min-h-[5rem] h-full",
        {
          'bg-success/10 dark:bg-success/10': insight.type === 'success',
          'bg-warning/10 dark:bg-warning/10': insight.type === 'warning',
          'bg-info/10 dark:bg-info/10': insight.type === 'info',
          'bg-destructive/10 dark:bg-destructive/10': insight.type === 'danger'
        }
      )}
    >
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center",
        {
          'bg-success/20 dark:bg-success/20': insight.type === 'success',
          'bg-warning/20 dark:bg-warning/20': insight.type === 'warning',
          'bg-info/20 dark:bg-info/20': insight.type === 'info',
          'bg-destructive/20 dark:bg-destructive/20': insight.type === 'danger'
        }
      )}>
        {insight.type === 'success' && <TrendingUp className="h-5 w-5" />}
        {insight.type === 'warning' && <ArrowUpRight className="h-5 w-5" />}
        {insight.type === 'info' && <Info className="h-5 w-5" />}
        {insight.type === 'danger' && <AlertTriangle className="h-5 w-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <AlertTitle className="text-sm font-medium">
            {insight.title}
          </AlertTitle>
          {insight.metadata.actionUrl && (
            <Link href={insight.metadata.actionUrl}>
              <Button 
                size="icon"
                variant="ghost"
                className={cn(
                  "h-6 w-6",
                  {
                    'text-success hover:text-success/80 hover:bg-success/10': insight.type === 'success',
                    'text-warning hover:text-warning/80 hover:bg-warning/10': insight.type === 'warning',
                    'text-info hover:text-info/80 hover:bg-info/10': insight.type === 'info',
                    'text-destructive hover:text-destructive/80 hover:bg-destructive/10': insight.type === 'danger'
                  }
                )}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDescription className="text-xs text-muted-foreground line-clamp-2 mt-1 flex items-center">
              {insight.description}
            </AlertDescription>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[300px]">
            <p className="text-xs">{insight.description}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </Alert>
  );
}

const carouselOptions = {
  loop: false,
  align: 'start',
  containScroll: 'trimSnaps',
  dragFree: true,
} as const;

function MobileCarousel({ insights }: { insights: Insight[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(carouselOptions);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('select', () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    });

    // Cleanup
    return () => {
      emblaApi.destroy();
    };
  }, [emblaApi]);

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden -mx-4">
        <div className="flex touch-pan-y pl-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className={cn(
                "flex-[0_0_90%] min-w-0 relative pr-4 transition-opacity duration-300",
                index !== currentSlide && "opacity-50"
              )}
            >
              <InsightCard insight={insight} index={index} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Minimal Progress Indicator */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
        {insights.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-0.5 rounded-full transition-all duration-300",
              currentSlide === index
                ? "bg-primary/60 w-8"
                : "bg-primary/20 w-4"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function InsightsGrid({ insights }: InsightsGridProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!insights?.length) {
    return (
      <div className="flex items-center justify-center py-6 px-4 border rounded-lg bg-muted/10">
        <div className="text-center">
          <Info className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-medium">Nenhum insight disponível</p>
        </div>
      </div>
    );
  }

  const visibleInsights = isExpanded ? insights : insights.slice(0, 2);
  const hasMoreInsights = insights.length > 2;

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Mobile Carousel View */}
        <div className="sm:hidden">
          <MobileCarousel insights={insights} />
        </div>

        {/* Desktop Grid View */}
        <div className="hidden sm:grid gap-3 sm:grid-cols-2">
          {visibleInsights.map((insight, index) => (
            <InsightCard key={index} insight={insight} index={index} />
          ))}
        </div>

        {/* Show More Button (Desktop Only) */}
        {hasMoreInsights && (
          <div className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs font-medium text-muted-foreground hover:text-foreground group"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="flex items-center gap-2">
                {isExpanded ? 'Mostrar menos' : (
                  <>
                    Ver mais
                    <Badge 
                      variant="secondary"
                      className="bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    >
                      +{insights.length - 2}
                    </Badge>
                    insights
                  </>
                )}
              </span>
              <ChevronDown 
                className={cn(
                  "ml-1 h-3 w-3 transition-transform duration-200",
                  {
                    "rotate-180": isExpanded,
                    "group-hover:translate-y-1": !isExpanded
                  }
                )} 
              />
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
} 