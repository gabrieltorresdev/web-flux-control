'use client';

import { TrendingUp, ArrowUpRight, Info, ChevronDown, AlertTriangle, ExternalLink, ChevronRight } from 'lucide-react';
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
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Alert
      key={`${insight.category}-${index}`}
      variant={insight.type === 'danger' ? 'destructive' : insight.type}
      className={cn(
        "relative overflow-hidden pl-10 pr-3 py-2.5 min-h-[4.5rem] h-full",
        {
          'bg-success/10 dark:bg-success/10': insight.type === 'success',
          'bg-warning/10 dark:bg-warning/10': insight.type === 'warning',
          'bg-info/10 dark:bg-info/10': insight.type === 'info',
          'bg-destructive/10 dark:bg-destructive/10': insight.type === 'danger'
        }
      )}
    >
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center",
        {
          'bg-success/20 dark:bg-success/20': insight.type === 'success',
          'bg-warning/20 dark:bg-warning/20': insight.type === 'warning',
          'bg-info/20 dark:bg-info/20': insight.type === 'info',
          'bg-destructive/20 dark:bg-destructive/20': insight.type === 'danger'
        }
      )}>
        {insight.type === 'success' && <TrendingUp className="h-4 w-4" />}
        {insight.type === 'warning' && <ArrowUpRight className="h-4 w-4" />}
        {insight.type === 'info' && <Info className="h-4 w-4" />}
        {insight.type === 'danger' && <AlertTriangle className="h-4 w-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <AlertTitle className="text-sm font-medium line-clamp-1">
            {insight.title}
          </AlertTitle>
          <div className="flex items-center space-x-1">
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
        </div>
        
        <div className="text-xs text-muted-foreground mt-1 relative">
          {expanded ? (
            <AlertDescription className="text-xs text-muted-foreground">
              {insight.description}
            </AlertDescription>
          ) : (
            <div className="flex items-center">
              <span className="line-clamp-1 flex-1">{insight.description}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 ml-1"
                onClick={() => setExpanded(true)}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {expanded && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] px-1.5 py-0 h-5 mt-1 opacity-60 hover:opacity-100"
              onClick={() => setExpanded(false)}
            >
              <ChevronDown className="h-3 w-3 rotate-180 mr-1" />
              <span>Menos</span>
            </Button>
          )}
        </div>
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
    <div className="relative pb-5">
      <div ref={emblaRef} className="overflow-hidden -mx-4">
        <div className="flex touch-pan-y pl-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className={cn(
                "flex-[0_0_95%] min-w-0 relative pr-4 transition-opacity duration-300",
                index !== currentSlide && "opacity-60"
              )}
            >
              <InsightCard insight={insight} index={index} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Minimal Progress Indicator */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
        {insights.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              currentSlide === index
                ? "bg-primary/80 w-5"
                : "bg-primary/20 w-2.5"
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