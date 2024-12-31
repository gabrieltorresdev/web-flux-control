"use client";

import { useCallback, useEffect, memo, useState } from "react";
import { useVoiceRecognition } from "@/hooks/lib/use-voice-recognition";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
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
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { CreateTransactionInput } from "@/types/transaction";
import { AiTransactionService } from "@/services/ai/ai-transaction-service";
import { CategoryService } from "@/services/category-service";
import { TransactionForm } from "./transaction-form";
import {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormSetError,
} from "react-hook-form";
import { CreateCategoryDialog } from "@/components/category/create-category-dialog";
import { GoogleGenerativeAiService } from "@/services/ai/providers/google-generative-ai-service";
import { useDebounce } from "@/hooks/lib/use-debounce";

interface VoiceTransactionFormProps {
  onDataChange: (hasData: boolean) => void;
  register: UseFormRegister<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
  getValues: UseFormGetValues<CreateTransactionInput>;
  setValue: UseFormSetValue<CreateTransactionInput>;
  setError: UseFormSetError<CreateTransactionInput>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  saveDraft: (transcript?: string, suggestedCategory?: string) => void;
  loadTranscript: () => string | undefined;
  loadSuggestedCategory: () => string | undefined;
}

export const VoiceTransactionForm = memo(
  ({
    onDataChange,
    register,
    errors,
    getValues,
    setValue,
    setError,
    onSubmit,
    saveDraft,
    loadTranscript,
    loadSuggestedCategory,
  }: VoiceTransactionFormProps) => {
    const [transcript, setTranscript] = useState("");
    const [showCreateCategoryDialog, setShowCreateCategoryDialog] =
      useState(false);
    const [formVisible, setFormVisible] = useState(false);

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

    // Carregar transcript e categoria sugerida salvos
    useEffect(() => {
      const savedTranscript = loadTranscript();
      const savedSuggestedCategory = loadSuggestedCategory();
      if (savedTranscript) {
        setTranscript(savedTranscript);
      }
      if (savedSuggestedCategory) {
        setSuggestedCategory(savedSuggestedCategory);
      }
    }, [loadTranscript, loadSuggestedCategory, setSuggestedCategory]);

    // Salvar transcript e categoria sugerida com debounce
    const debouncedTranscript = useDebounce(transcript, 500);

    useEffect(() => {
      if (debouncedTranscript) {
        saveDraft(debouncedTranscript, suggestedCategory);
      }
    }, [debouncedTranscript, saveDraft, suggestedCategory]);

    useEffect(() => {
      if (currentTranscript && !listening) {
        const newTranscript = transcript
          ? `${transcript} ${currentTranscript}`
          : currentTranscript;
        setTranscript(newTranscript);
      }
    }, [currentTranscript, listening]);

    useEffect(() => {
      onDataChange(transcript.trim().length > 0);
    }, [transcript, onDataChange]);

    const handleCategoryCreated = useCallback(
      (categoryId: string, categoryName: string) => {
        setValue("categoryId", categoryId);
        // Se o nome da categoria foi modificado, salvar ambos os nomes
        if (categoryName !== suggestedCategory) {
          saveDraft(transcript, `${suggestedCategory}|${categoryName}`);
        } else {
          saveDraft(transcript, `${categoryName}|${categoryName}`);
        }
        setShowCreateCategoryDialog(false);
      },
      [setValue, saveDraft, transcript, suggestedCategory]
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
      convertTranscriptMutation.mutate(undefined, {
        onSuccess: () => setFormVisible(true),
      });
    }, [convertTranscriptMutation]);

    const handleBack = useCallback(() => {
      setFormVisible(false);
    }, []);

    return (
      <div className="relative">
        <div
          className={cn(
            "flex flex-col items-center gap-6 mt-4 transition-all duration-500",
            formVisible
              ? "-translate-x-full opacity-0 absolute inset-0"
              : "translate-x-0 opacity-100 static"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            {listening && <RecordingStatus />}
            {!listening && <RecordingInstruction />}
            <MicrophoneButton
              listening={listening}
              onClick={listening ? stopListening : startListening}
              disabled={!speechRecognitionSupported || !isMicrophoneAvailable}
            />
          </div>

          <Textarea
            className="text-center resize-none min-h-[100px] !text-xl"
            placeholder="A transcrição aparecerá aqui"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            readOnly={listening}
          />

          <Button
            className="w-full"
            onClick={handleConvertTranscript}
            disabled={
              !transcript.trim().length || convertTranscriptMutation.isPending
            }
          >
            {convertTranscriptMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <SendHorizonal className="h-4 w-4 mr-2" />
            )}
            Processar
          </Button>
        </div>

        <div
          className={cn(
            "transition-all duration-500 gap-3 flex flex-col",
            formVisible
              ? "translate-x-0 opacity-100 static"
              : "translate-x-full opacity-0 absolute inset-0"
          )}
        >
          {formVisible && (
            <>
              <Button
                variant="outline"
                onClick={handleBack}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>

              <TransactionForm
                onSubmit={onSubmit}
                register={register}
                errors={errors}
                getValues={getValues}
                setValue={setValue}
                setError={setError}
                isSubmitting={convertTranscriptMutation.isPending}
              />

              <SuggestedCategoryState />
            </>
          )}
        </div>

        <CreateCategoryDialog
          open={showCreateCategoryDialog}
          onOpenChange={setShowCreateCategoryDialog}
          onSuccess={handleCategoryCreated}
          defaultCategoryName={getSuggestedCategoryNames().original}
        />
      </div>
    );
  }
);

const RecordingStatus = memo(() => (
  <div className="flex items-center gap-1.5 h-8">
    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    <span className="text-sm text-muted-foreground">Ouvindo...</span>
  </div>
));

const ResetButton = memo(
  ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-8"
      disabled={disabled}
    >
      <RefreshCw className="h-4 w-4 mr-1.5" />
      Limpar
    </Button>
  )
);

const RecordingInstruction = memo(() => (
  <div className="flex items-center gap-1.5 h-8">
    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
    <span className="text-sm text-muted-foreground">Clique para gravar</span>
  </div>
));

const MicrophoneButton = memo(
  ({
    listening,
    onClick,
    disabled,
  }: {
    listening: boolean;
    onClick: () => void;
    disabled: boolean;
  }) => (
    <div
      className={cn(
        "overflow-hidden rounded-full h-20 w-20",
        listening && "animate-pulse"
      )}
    >
      <Button
        variant={listening ? "destructive" : "default"}
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className="w-full h-full"
      >
        {listening ? (
          <MicOff className="h-8 w-8" />
        ) : (
          <Mic className="h-8 w-8" />
        )}
      </Button>
    </div>
  )
);

const useTranscriptConversion = (
  transcript: string,
  setValue: UseFormSetValue<CreateTransactionInput>,
  loadSuggestedCategory: () => string | undefined
) => {
  const [suggestedCategory, setSuggestedCategory] = useState<string>("");

  const aiService = new AiTransactionService(new GoogleGenerativeAiService());
  const categoryService = new CategoryService();

  const convertTranscriptMutation = useMutation({
    mutationFn: async (): Promise<CreateTransactionInput> => {
      // Verificar se já existe um rascunho com o mesmo transcript
      const draft = localStorage.getItem("transaction_draft");
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft) as {
            form: CreateTransactionInput;
            transcript?: string;
            suggestedCategory?: string;
          };
          // Só reutilizar o draft se o transcript for exatamente igual e houver dados do formulário
          if (
            parsedDraft.transcript === transcript &&
            parsedDraft.form &&
            Object.keys(parsedDraft.form).length > 0
          ) {
            if (parsedDraft.suggestedCategory) {
              setSuggestedCategory(parsedDraft.suggestedCategory);
            }
            return parsedDraft.form;
          }
        } catch (error) {
          console.error("Error parsing draft:", error);
        }
      }

      // Se não houver rascunho válido, converter o transcript
      const aiTransaction = await aiService.convertTranscriptToNewTransaction(
        transcript
      );

      let categoryId = "";
      try {
        const categoryResponse = await categoryService.findByName(
          aiTransaction.category
        );
        categoryId = categoryResponse?.data?.id;
        setSuggestedCategory("");
      } catch {
        setSuggestedCategory(aiTransaction.category);
      }

      return { ...aiTransaction, categoryId };
    },
    onSuccess(transaction) {
      setValue("dateTime", transaction.dateTime);
      setValue("title", transaction.title);
      setValue("amount", transaction.amount);
      setValue("categoryId", transaction.categoryId);
    },
  });

  // Carregar categoria sugerida salva ao montar o componente
  useEffect(() => {
    const savedCategory = loadSuggestedCategory();
    if (savedCategory) {
      setSuggestedCategory(savedCategory);
    }
  }, [loadSuggestedCategory]);

  return { convertTranscriptMutation, suggestedCategory, setSuggestedCategory };
};

// Definindo displayNames para melhor debugging
RecordingStatus.displayName = "RecordingStatus";
ResetButton.displayName = "ResetButton";
RecordingInstruction.displayName = "RecordingInstruction";
MicrophoneButton.displayName = "MicrophoneButton";
VoiceTransactionForm.displayName = "VoiceTransactionForm";
