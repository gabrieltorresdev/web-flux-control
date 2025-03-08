'use client';

import { TrendingUp, ArrowUpRight, Info, ChevronDown, AlertTriangle, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
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

interface InsightCardProps {
  insight: Insight;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
}

function InsightCard({ insight, index, expanded, onToggleExpand }: InsightCardProps) {
  const variantStyles = {
    success: {
      bg: 'bg-success/10',
      sidebar: 'bg-success/20',
      text: 'text-success',
      hover: 'hover:bg-success/10 hover:text-success/80',
    },
    warning: {
      bg: 'bg-warning/10',
      sidebar: 'bg-warning/20',
      text: 'text-warning',
      hover: 'hover:bg-warning/10 hover:text-warning/80',
    },
    info: {
      bg: 'bg-info/10',
      sidebar: 'bg-info/20',
      text: 'text-info',
      hover: 'hover:bg-info/10 hover:text-info/80',
    },
    danger: {
      bg: 'bg-destructive/10',
      sidebar: 'bg-destructive/20',
      text: 'text-destructive',
      hover: 'hover:bg-destructive/10 hover:text-destructive/80',
    },
  };
  
  // Mapeia os tipos de insight para as variantes de alerta compatíveis
  const getAlertVariant = (type: Insight['type']) => {
    if (type === 'danger') return 'destructive';
    if (type === 'success') return 'success';
    if (type === 'warning') return 'warning';
    if (type === 'info') return 'info';
    return 'default';
  };
  
  // Renderiza o ícone baseado no tipo de insight
  const renderIcon = () => {
    switch (insight.type) {
      case 'success': return <TrendingUp className="h-4 w-4" />;
      case 'warning': return <ArrowUpRight className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      case 'danger': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Alert
          key={`${insight.category}-${index}`}
          variant={getAlertVariant(insight.type)}
          className={cn(
            "relative overflow-hidden min-h-[4.5rem] h-full group cursor-pointer",
            variantStyles[insight.type].bg
          )}
          onClick={onToggleExpand}
        >
          {renderIcon()}
          
          <div>
            <AlertTitle className="font-medium">
              {insight.title}
              {insight.metadata.actionUrl && (
                <Link 
                  href={insight.metadata.actionUrl} 
                  className="float-right"
                  onClick={(e) => e.stopPropagation()} // Impede que o clique no link acione o toggle
                >
                  <Button 
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-6 w-6",
                      variantStyles[insight.type].text,
                      variantStyles[insight.type].hover
                    )}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </AlertTitle>
            
            <AlertDescription className="text-xs">
              {expanded ? (
                <div>
                  {insight.description}
                </div>
              ) : (
                <div className="line-clamp-1">
                  {insight.description}
                </div>
              )}
            </AlertDescription>
          </div>
          
        </Alert>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {expanded ? 'Clique para recolher' : 'Clique para expandir'}
      </TooltipContent>
    </Tooltip>
  );
}

const carouselOptions = {
  loop: false,
  align: 'start',
  containScroll: 'trimSnaps',
  dragFree: true,
} as const;

function MobileCarousel({ insights, expanded, toggleExpandAll }: { 
  insights: Insight[];
  expanded: boolean;
  toggleExpandAll: () => void;
}) {
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
                index !== currentSlide && "opacity-70"
              )}
            >
              <InsightCard 
                insight={insight} 
                index={index} 
                expanded={expanded}
                onToggleExpand={toggleExpandAll}
              />
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
                ? "bg-primary w-5"
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
  const [areInsightsExpanded, setAreInsightsExpanded] = useState(false);
  
  const toggleExpandAll = () => {
    setAreInsightsExpanded(!areInsightsExpanded);
  };

  if (!insights?.length) {
    return (
      <div className="flex items-center justify-center py-6 px-4 border rounded-lg bg-card/50">
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
      <div className="space-y-4">
        {/* Mobile Carousel View */}
        <div className="sm:hidden">
          <MobileCarousel 
            insights={insights} 
            expanded={areInsightsExpanded}
            toggleExpandAll={toggleExpandAll}
          />
        </div>

        {/* Desktop Grid View */}
        <div className="hidden sm:grid gap-4 sm:grid-cols-2">
          {visibleInsights.map((insight, index) => (
            <InsightCard 
              key={index} 
              insight={insight} 
              index={index} 
              expanded={areInsightsExpanded}
              onToggleExpand={toggleExpandAll}
            />
          ))}
        </div>

        {/* Show More Button (Desktop Only) */}
        {hasMoreInsights && (
          <div className="hidden sm:flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-medium text-muted-foreground hover:text-foreground group w-40"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="flex items-center gap-2">
                {isExpanded ? 'Mostrar menos' : (
                  <>
                    Ver mais
                    <Badge 
                      variant="secondary"
                      className="bg-primary/10 text-primary ml-1"
                    >
                      +{insights.length - 2}
                    </Badge>
                  </>
                )}
              </span>
              <ChevronDown 
                className={cn(
                  "h-3.5 w-3.5 ml-1 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )} 
              />
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
} 