import { cn } from "@/shared/utils";
import { X, Smile } from "lucide-react";
import { useTheme } from "next-themes";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import dynamic from 'next/dynamic';
import { useState, useCallback } from "react";

// Importação dinâmica sem SSR com tratamento de propriedades
const EmojiPicker = dynamic(
  () => import('emoji-picker-react').then((mod) => {
    // Usado para evitar problemas de tipagem
    const EmojiPickerComponent = (props: any) => {
      const Component = mod.default;
      return <Component {...props} />;
    };
    return {
      default: EmojiPickerComponent
    };
  }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="space-y-2 w-full">
          <Skeleton className="h-8 w-full" />
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }
);

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const { resolvedTheme } = useTheme();
  const isEmojiSelected = value?.startsWith("emoji:");
  const selectedEmoji = isEmojiSelected && value ? value.replace("emoji:", "") : null;
  const [open, setOpen] = useState(false);

  const handleEmojiClick = useCallback((emojiData: { emoji: string }) => {
    onChange(`emoji:${emojiData.emoji}`);
    setOpen(false); // Fechar o popover após selecionar um emoji
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={cn(
              "w-full justify-start text-left font-normal h-12",
              !selectedEmoji && "text-muted-foreground"
            )}
          >
            {selectedEmoji ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedEmoji}</span>
                <span>Emoji selecionado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Smile className="h-5 w-5" />
                <span>Selecione um emoji</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-full p-0" 
          align="start" 
          side="bottom"
          sideOffset={4}
          style={{ maxHeight: "none" }}
        >
          {selectedEmoji && (
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedEmoji}</span>
                <span className="text-sm text-muted-foreground">Emoji selecionado</span>
              </div>
              <button 
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="rounded-full p-1 hover:bg-muted"
                title="Remover emoji"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
            <EmojiPicker
                onEmojiClick={handleEmojiClick}
                searchDisabled={false}
                width="100%"
                height={400}
                previewConfig={{ showPreview: false }}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                lazyLoadEmojis
                searchPlaceholder="Pesquisar emoji..."
                className="!bg-transparent"
                lang="pt-BR"
            />
        </PopoverContent>
      </Popover>
    </div>
  );
} 