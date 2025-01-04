"use client";

import { useState, useCallback, useEffect, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTransactionInput } from "@/types/transaction";
import { transactionSchema } from "@/lib/validations/transaction";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "../../ui/responsive-modal";
import { Mic, Keyboard } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import { VoiceTransactionForm } from "./voice-transaction-form";
import { ManualTransactionForm } from "./manual-transaction-form";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../ui/alert-dialog";
import { useDraftTransaction } from "@/hooks/use-draft-transaction";
import { createTransaction } from "@/app/actions/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/get-query-client";

interface NewTransactionDialogProps {
  initialDate?: Date;
  onClose: () => void;
  open: boolean;
  children?: ReactNode;
}

type NewTransactionFormData = CreateTransactionInput;

export function NewTransactionDialog({
  initialDate,
  onClose,
  open,
  children,
}: NewTransactionDialogProps) {
  const [currentTab, setCurrentTab] = useState<"manual" | "voice">("manual");
  const [showAlert, setShowAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState<
    "manual" | "voice" | null
  >(null);
  const [hasVoiceData, setHasVoiceData] = useState(false);
  const [hasManualData, setHasManualData] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = useForm<NewTransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: "",
      amount: 0,
      dateTime: initialDate ?? new Date(),
      categoryId: "",
    },
  });

  const { saveDraft, loadTranscript, loadSuggestedCategory, clearDraft } =
    useDraftTransaction(setValue, reset, getValues);

  // Salvar rascunho quando houver mudanças no formulário
  useEffect(() => {
    let unsubscribe: () => void;
    const subscription = watch(() => {
      if (hasManualData || hasVoiceData) {
        // Preservar o transcript ao salvar o rascunho
        const currentTranscript = loadTranscript();
        const currentSuggestedCategory = loadSuggestedCategory();
        saveDraft(currentTranscript, currentSuggestedCategory);
      }
    });
    if (typeof subscription === "function") {
      unsubscribe = subscription;
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [
    watch,
    saveDraft,
    hasManualData,
    hasVoiceData,
    loadTranscript,
    loadSuggestedCategory,
  ]);

  const onSubmit = handleSubmit(async (data: NewTransactionFormData) => {
    let result;
    try {
      setIsSubmitting(true);
      result = await createTransaction(data);

      if (result.error) {
        if (
          result.error.code === "VALIDATION_ERROR" &&
          result.error.validationErrors
        ) {
          Object.entries(result.error.validationErrors).forEach(
            ([field, messages]) => {
              setError(field as keyof NewTransactionFormData, {
                message: messages[0],
              });
            }
          );
          return;
        }

        toast({
          title: "Erro ao criar transação",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      clearDraft();
      onClose();
      toast({
        title: "Transação criada",
        description: "A transação foi criada com sucesso.",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro ao criar transação",
        description: "Ocorreu um erro inesperado ao criar a transação.",
        variant: "destructive",
      });
    } finally {
      if (result?.error) {
        setIsSubmitting(false);
      } else {
        // Aguarda a animação do modal fechar antes de resetar o estado
        setTimeout(() => {
          setIsSubmitting(false);
        }, 300);
      }
    }
  });

  const handleTabChange = useCallback(
    (value: string) => {
      if (value === "manual" || value === "voice") {
        if (value !== currentTab) {
          // Verifica se há dados reais no formulário
          const formValues = getValues();
          const hasFormData =
            formValues.title.trim() !== "" ||
            formValues.amount !== 0 ||
            formValues.categoryId !== "";

          const shouldShowAlert =
            ((currentTab === "voice" && hasVoiceData && value === "manual") ||
              (currentTab === "manual" &&
                hasManualData &&
                value === "voice")) &&
            hasFormData;

          if (shouldShowAlert) {
            setShowAlert(true);
            setPendingTabChange(value as "manual" | "voice");
          } else {
            // Se não tiver dados, limpa e muda direto
            if (value === "voice") {
              setHasManualData(false);
            } else {
              setHasVoiceData(false);
            }
            clearDraft();
            reset();
            setCurrentTab(value as "manual" | "voice");
          }
        }
      }
    },
    [currentTab, hasVoiceData, hasManualData, getValues, clearDraft, reset]
  );

  const confirmTabChange = useCallback(() => {
    if (pendingTabChange) {
      setCurrentTab(pendingTabChange);
      setPendingTabChange(null);
      setShowAlert(false);
      clearDraft();
      reset();
      if (pendingTabChange === "voice") {
        setHasManualData(false);
      } else {
        setHasVoiceData(false);
      }
    }
  }, [pendingTabChange, clearDraft, reset]);

  return (
    <ResponsiveModal open={open} onOpenChange={onClose}>
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>

      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Nova Transação</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Adicione uma nova transação manualmente ou por voz.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <Keyboard className="mr-2 h-4 w-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="voice">
              <Mic className="mr-2 h-4 w-4" />
              Voz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <ManualTransactionForm
              onDataChange={setHasManualData}
              register={register}
              errors={errors}
              getValues={getValues}
              setValue={setValue}
              setError={setError}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              saveDraft={saveDraft}
            />
          </TabsContent>

          <TabsContent value="voice">
            <VoiceTransactionForm
              onSubmit={onSubmit}
              register={register}
              errors={errors}
              getValues={getValues}
              setValue={setValue}
              setError={setError}
              onDataChange={setHasVoiceData}
              saveDraft={saveDraft}
              loadTranscript={loadTranscript}
              loadSuggestedCategory={loadSuggestedCategory}
            />
          </TabsContent>
        </Tabs>
      </ResponsiveModalContent>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Deseja descartá-las?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTabChange}>
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ResponsiveModal>
  );
}
