"use client";

import { useCallback, useEffect, memo, useState } from "react";
import { useVoiceRecognition } from "@/src/hooks/lib/use-voice-recognition";
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
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { CreateTransactionInput } from "@/src/types/transaction";
import { AiTransactionService } from "@/src/services/ai/ai-transaction-service";
import { CategoryService } from "@/src/services/category-service";
import { TransactionForm } from "./transaction-form";
import {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormReset,
} from "react-hook-form";
import { CreateCategoryDialog } from "@/src/components/category/create-category-dialog";
import { GoogleGenerativeAiService } from "@/src/services/ai/providers/google-generative-ai-service";

interface VoiceTransactionFormProps {
  onDataChange: (hasData: boolean) => void;
  register: UseFormRegister<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
  getValues: UseFormGetValues<CreateTransactionInput>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  setValue: UseFormSetValue<CreateTransactionInput>;
  reset: UseFormReset<CreateTransactionInput>;
  isSubmitting?: boolean;
}

export const VoiceTransactionForm = memo(
  ({
    onDataChange,
    register,
    errors,
    getValues,
    onSubmit,
    setValue,
    reset,
    isSubmitting,
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
      resetTranscript,
      speechRecognitionSupported,
      isMicrophoneAvailable,
    } = useVoiceRecognition();

    const {
      convertTranscriptMutation,
      suggestedCategory,
      setSuggestedCategory,
    } = useTranscriptConversion(transcript, setValue);

    useEffect(() => {
      if (currentTranscript && !listening) {
        setTranscript((prev) =>
          prev ? `${prev} ${currentTranscript}` : currentTranscript
        );
      }
    }, [currentTranscript, listening]);

    useEffect(() => {
      onDataChange(transcript.trim().length > 0);
    }, [transcript, onDataChange]);

    const handleCategoryCreated = useCallback(
      (categoryId: string) => {
        setValue("categoryId", categoryId);
        setSuggestedCategory("");
        setShowCreateCategoryDialog(false);
      },
      [setValue]
    );

    const handleConvertTranscript = useCallback(() => {
      convertTranscriptMutation.mutate(undefined, {
        onSuccess: () => setFormVisible(true),
      });
    }, [convertTranscriptMutation]);

    const handleReset = useCallback(() => {
      setTranscript("");
      resetTranscript();
    }, [resetTranscript]);

    const handleBack = useCallback(() => {
      setFormVisible(false);
      reset();
    }, [reset]);

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
            {!listening && transcript.length > 0 && (
              <ResetButton onClick={handleReset} disabled={!transcript} />
            )}
            {!listening && !transcript && <RecordingInstruction />}
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
            <TransactionForm
              setValue={setValue}
              onSubmit={onSubmit}
              register={register}
              errors={errors}
              getValues={getValues}
              suggestedCategory={suggestedCategory}
              onCreateCategory={setSuggestedCategory}
              isSubmitting={isSubmitting}
            />
          )}
          <Button variant="outline" onClick={handleBack} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <CreateCategoryDialog
          open={showCreateCategoryDialog}
          onOpenChange={setShowCreateCategoryDialog}
          onSuccess={handleCategoryCreated}
          defaultCategoryName={suggestedCategory}
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
  setValue: UseFormSetValue<CreateTransactionInput>
) => {
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState("");
  const [suggestedCategory, setSuggestedCategory] = useState<string>("");

  const aiService = new AiTransactionService(new GoogleGenerativeAiService());
  const categoryService = new CategoryService();

  const convertTranscriptMutation = useMutation({
    mutationFn: async (): Promise<CreateTransactionInput> => {
      if (
        transcript === lastProcessedTranscript &&
        convertTranscriptMutation.data
      ) {
        return convertTranscriptMutation.data;
      }

      setLastProcessedTranscript(transcript);
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

  return { convertTranscriptMutation, suggestedCategory, setSuggestedCategory };
};

// Definindo displayNames para melhor debugging
RecordingStatus.displayName = "RecordingStatus";
ResetButton.displayName = "ResetButton";
RecordingInstruction.displayName = "RecordingInstruction";
MicrophoneButton.displayName = "MicrophoneButton";
VoiceTransactionForm.displayName = "VoiceTransactionForm";
