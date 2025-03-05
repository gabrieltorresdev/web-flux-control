"use client";

import { useCallback, useEffect, memo, useState, useRef } from "react";
import { useVoiceRecognition } from "@/shared/hooks/use-voice-recognition";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Loader2,
  RefreshCw,
  MousePointerClick,
  MicOff,
  Mic,
  SendHorizonal,
  ArrowLeft,
  Check,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTransactionInput } from "@/features/transactions/types";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { CreateCategoryDialog } from "@/features/categories/components/create-category-dialog";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { processAiTransaction } from "@/features/transactions/actions/transactions";
import { motion, AnimatePresence } from "framer-motion";
import { queryKeys } from "@/shared/lib/get-query-client";
import { useDraftTransaction } from "@/features/transactions/hooks/use-draft-transaction";

interface VoiceTransactionFormProps {
  register: UseFormRegister<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
  getValues: UseFormGetValues<CreateTransactionInput>;
  setValue: UseFormSetValue<CreateTransactionInput>;
  watch: UseFormWatch<CreateTransactionInput>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting?: boolean;
  onDataChanged: () => void;
}

export const VoiceTransactionForm = memo(
  ({
    register,
    errors,
    getValues,
    setValue,
    watch,
    onSubmit,
    isSubmitting = false,
    onDataChanged,
  }: VoiceTransactionFormProps) => {
    const [transcript, setTranscript] = useState("");
    const lastProcessedTranscript = useRef("");
    const [showCreateCategoryDialog, setShowCreateCategoryDialog] =
      useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const queryClient = useQueryClient();
    const { loadTranscript, loadSuggestedCategory, saveDraft } = useDraftTransaction(setValue, () => {}, getValues);

    // Load saved transcript and suggested category on mount
    useEffect(() => {
      const savedTranscript = loadTranscript();
      if (savedTranscript) {
        setTranscript(savedTranscript);
        setFormVisible(!!getValues("title")); // Show form if we have a title
      }
    }, [loadTranscript, getValues]);

    const {
      listening,
      transcript: currentTranscript,
      startListening,
      stopListening,
      speechRecognitionSupported,
      isMicrophoneAvailable,
    } = useVoiceRecognition();

    const {
      convertTranscriptMutation,
      suggestedCategory,
      setSuggestedCategory,
    } = useTranscriptConversion(transcript, setValue, loadSuggestedCategory);

    // Save transcript with debounce
    const debouncedTranscript = useDebounce(transcript, 500);

    useEffect(() => {
      if (debouncedTranscript) {
        saveDraft(debouncedTranscript, suggestedCategory);
      }
    }, [debouncedTranscript, saveDraft, suggestedCategory]);

    useEffect(() => {
      if (currentTranscript && !listening) {
        const trimmedCurrent = currentTranscript.trim();
        if (
          trimmedCurrent &&
          trimmedCurrent !== lastProcessedTranscript.current
        ) {
          const newTranscript = transcript
            ? `${transcript.trim()} ${trimmedCurrent}`
            : trimmedCurrent;

          lastProcessedTranscript.current = trimmedCurrent;
          setTranscript(newTranscript);
        }
      }
    }, [currentTranscript, listening, transcript]);

    useEffect(() => {
      if (transcript.trim().length > 0) {
        onDataChanged();
      }
    }, [transcript, onDataChanged]);

    const handleCategoryCreated = useCallback(
      async (categoryId: string, categoryName: string) => {
        setValue("categoryId", categoryId);
        // Se o nome da categoria foi modificado, salvar ambos os nomes
        if (categoryName !== suggestedCategory) {
          saveDraft(transcript, `${suggestedCategory}|${categoryName}`);
        } else {
          saveDraft(transcript, `${categoryName}|${categoryName}`);
        }
        setShowCreateCategoryDialog(false);

        // Revalidar o cache das categorias
        await queryClient.invalidateQueries({
          queryKey: queryKeys.categories.all,
        });
      },
      [setValue, saveDraft, transcript, suggestedCategory, queryClient]
    );

    // Função para verificar se a categoria sugerida já foi criada
    const isSuggestedCategoryCreated = useCallback(() => {
      const categoryId = getValues("categoryId");
      return categoryId && categoryId.length > 0;
    }, [getValues]);

    // Função para extrair os nomes da categoria do draft
    const getSuggestedCategoryNames = useCallback(() => {
      if (!suggestedCategory) return { original: "", created: "" };
      const [original, created] = suggestedCategory.split("|");
      return { original, created: created || original };
    }, [suggestedCategory]);

    // Renderiza o estado da categoria sugerida
    const SuggestedCategoryState = useCallback(() => {
      if (!suggestedCategory) return null;

      const { original, created } = getSuggestedCategoryNames();
      const wasModified = original !== created;
      const isCreated = isSuggestedCategoryCreated();

      return (
        <div className="mt-4 rounded-lg border bg-muted p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2">
              {isCreated ? (
                <Check className="h-4 w-4 text-green-500 mt-1 sm:mt-0" />
              ) : (
                <MousePointerClick className="h-4 w-4 mt-1 sm:mt-0" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">
                  Categoria sugerida pela IA: <strong>{original}</strong>
                </p>
                {wasModified && isCreated && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    <p className="text-xs text-muted-foreground">
                      Modificada para: <strong>{created}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
            {!isCreated && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setShowCreateCategoryDialog(true)}
              >
                Criar categoria
              </Button>
            )}
          </div>
        </div>
      );
    }, [
      suggestedCategory,
      getSuggestedCategoryNames,
      isSuggestedCategoryCreated,
    ]);

    const handleConvertTranscript = useCallback(() => {
      if (!transcript.trim()) return;

      convertTranscriptMutation.mutate(undefined, {
        onSuccess: () => {
          setFormVisible(true);
        },
        onError: (error) => {
          console.error("Failed to process transcript:", error);
          setFormVisible(false);
        },
      });
    }, [convertTranscriptMutation, transcript]);

    const handleBack = useCallback(() => {
      setFormVisible(false);
    }, []);

    const handleClear = useCallback(() => {
      setTranscript("");
      lastProcessedTranscript.current = "";
    }, []);

    return (
      <div className="relative overflow-hidden p-0.5">
        <AnimatePresence mode="wait">
          {(!formVisible || convertTranscriptMutation.isPending) && (
            <motion.div
              key="recording"
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col items-center gap-6 mt-4"
            >
              {/* Status e Instruções */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="text-lg font-medium mb-2">
                  {listening ? "Ouvindo..." : "Nova Transação por Voz"}
                </div>
                <div className="text-sm text-muted-foreground max-w-md">
                  {speechRecognitionSupported
                    ? "Descreva sua transação naturalmente, por exemplo: 'Gastei 50 reais em comida ontem'"
                    : "Seu navegador não suporta reconhecimento de voz. Use o modo manual."}
                </div>
              </div>

              {/* Indicador de Gravação */}
              <div
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center border-8 transition-all",
                  listening
                    ? "border-red-500 animate-pulse"
                    : "border-muted-foreground/20"
                )}
              >
                {listening ? (
                  <Mic
                    className={cn(
                      "h-12 w-12 text-red-500 animate-pulse",
                      listening && "animate-pulse"
                    )}
                  />
                ) : (
                  <MicOff className="h-12 w-12 text-muted-foreground/50" />
                )}
              </div>

              {/* Controles de Gravação */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className={cn(
                    "border-2",
                    listening
                      ? "border-red-500 text-red-500 hover:bg-red-500/10"
                      : ""
                  )}
                  onClick={listening ? stopListening : startListening}
                  disabled={!speechRecognitionSupported || !isMicrophoneAvailable}
                >
                  {listening ? "Parar" : "Iniciar Gravação"}
                </Button>
              </div>

              {/* Text Area para Visualizar/Editar */}
              <div className="w-full space-y-2">
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="O que você disse aparecerá aqui..."
                  className="min-h-[120px]"
                  disabled={listening}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    disabled={!transcript.trim() || listening}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConvertTranscript}
                    disabled={
                      !transcript.trim() ||
                      listening ||
                      convertTranscriptMutation.isPending
                    }
                    size="sm"
                  >
                    {convertTranscriptMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <SendHorizonal className="h-4 w-4 mr-2" />
                        Continuar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {formVisible && !convertTranscriptMutation.isPending && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col"
            >
              <div className="flex items-center mb-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </div>

              <SuggestedCategoryState />

              <div className="mt-4">
                <TransactionForm
                  onSubmit={onSubmit}
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  getValues={getValues}
                  isSubmitting={isSubmitting}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {suggestedCategory && (
          <CreateCategoryDialog
            open={showCreateCategoryDialog}
            onOpenChange={setShowCreateCategoryDialog}
            defaultCategoryName={getSuggestedCategoryNames().original}
            onSuccess={handleCategoryCreated}
          />
        )}
      </div>
    );
  }
);

VoiceTransactionForm.displayName = "VoiceTransactionForm";

// Custom hook to handle transcript conversion
const useTranscriptConversion = (
  transcript: string,
  setValue: UseFormSetValue<CreateTransactionInput>,
  loadSuggestedCategory: () => string | undefined
) => {
  const [suggestedCategory, setSuggestedCategory] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const savedSuggestedCategory = loadSuggestedCategory();
    if (savedSuggestedCategory) {
      setSuggestedCategory(savedSuggestedCategory);
    }
  }, [loadSuggestedCategory]);

  const convertTranscriptMutation = useMutation({
    mutationFn: async () => {
      if (!transcript.trim()) {
        throw new Error("Transcrição vazia");
      }
      
      const result = await processAiTransaction(transcript);
      return result;
    },
    onSuccess(transaction) {
      if (transaction.error) {
        console.error("Error processing transaction:", transaction.error);
        return;
      }

      if (transaction.data) {
        setValue("title", transaction.data.title);
        setValue("amount", transaction.data.amount || 0);
        
        if (transaction.data.dateTime) {
          setValue("dateTime", new Date(transaction.data.dateTime));
        }
        
        // If categoryId is empty, use the title as a suggested category
        if (!transaction.data.categoryId && transaction.data.title) {
          setSuggestedCategory(transaction.data.title);
        }
      }
    }
  });

  return { convertTranscriptMutation, suggestedCategory, setSuggestedCategory };
};
