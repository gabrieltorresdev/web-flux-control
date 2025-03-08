"use client";

import { useState, useCallback, useEffect, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTransactionInput } from "@/features/transactions/types";
import { transactionSchema } from "@/shared/utils/validations/transaction";
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/shared/components/ui/responsive-modal";
import { Mic, Keyboard } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";
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
} from "@/shared/components/ui/alert-dialog";
import { useDraftTransaction } from "@/features/transactions/hooks/use-draft-transaction";
import { createTransaction } from "@/features/transactions/actions/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/get-query-client";
import { useCategoryStore } from "@/features/categories/stores/category-store";
import { useQueryParams } from "@/shared/hooks/use-search-params";
import { TransactionFilters } from "@/features/transactions/types";
import { toast } from "sonner";
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

  const queryClient = useQueryClient();
  const loadCategories = useCategoryStore((state) => state.loadCategories);
  const { getParams } = useQueryParams<TransactionFilters>();

  // Get month and year from URL query parameters
  const getInitialDateFromQueryParams = useCallback(() => {
    const params = getParams();
    let date = initialDate ?? new Date();
    
    const monthParam = params.month ? parseInt(params.month) : null;
    const yearParam = params.year ? parseInt(params.year) : null;
    
    if (monthParam !== null && yearParam !== null) {
      // Create a new date with the first day of the month from URL params
      date = new Date(yearParam, monthParam - 1, 1);
      
      // Keep the current time from today
      const now = new Date();
      date.setHours(now.getHours());
      date.setMinutes(now.getMinutes());
      date.setSeconds(0);
      date.setMilliseconds(0);
      
      // If the day is in the future, use the current day of the month
      if (date > now) {
        date = new Date();
        date.setMonth(monthParam - 1);
        date.setFullYear(yearParam);
      }
    }
    
    return date;
  }, [getParams, initialDate]);

  // Load categories when dialog opens
  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open, loadCategories]);

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
      dateTime: getInitialDateFromQueryParams(),
      categoryId: "",
    },
  });

  const { saveDraft, loadTranscript, loadSuggestedCategory, clearDraft } =
    useDraftTransaction(setValue, reset, getValues);

  // Reset form with the correct date when dialog opens
  useEffect(() => {
    if (open) {
      const currentValues = getValues();
      reset({
        ...currentValues,
        dateTime: getInitialDateFromQueryParams(),
        amount: 0 // Reset amount to empty
      });
    }
  }, [open, getInitialDateFromQueryParams, getValues, reset]);

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

        toast.error("Erro ao criar transação", {
          description: result.error.message,
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      clearDraft();
      onClose();
      toast.success("Transação criada", {
        description: "A transação foi criada com sucesso.",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Erro ao criar transação", {
        description: "Ocorreu um erro inesperado ao criar a transação.",
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
            reset({
              title: "",
              amount: 0,
              dateTime: getInitialDateFromQueryParams(),
              categoryId: "",
            });
            setCurrentTab(value as "manual" | "voice");
          }
        }
      }
    },
    [currentTab, hasVoiceData, hasManualData, getValues, clearDraft, reset, getInitialDateFromQueryParams]
  );

  const confirmTabChange = useCallback(() => {
    if (pendingTabChange) {
      setCurrentTab(pendingTabChange);
      setPendingTabChange(null);
      setShowAlert(false);
      clearDraft();
      reset({
        title: "",
        amount: 0,
        dateTime: getInitialDateFromQueryParams(),
        categoryId: "",
      });
      if (pendingTabChange === "voice") {
        setHasManualData(false);
      } else {
        setHasVoiceData(false);
      }
    }
  }, [pendingTabChange, clearDraft, reset, getInitialDateFromQueryParams]);

  return (
    <ResponsiveModal open={open} onOpenChange={onClose}>
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>

      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Nova Transação</ResponsiveModalTitle>
          <ResponsiveModalDescription />
        </ResponsiveModalHeader>

        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <Keyboard className="mr-2 h-4 w-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="voice">
              <Mic className="mr-2 h-4 w-4" />
              Por voz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-3">
            <ManualTransactionForm
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
              getValues={getValues}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              onDataChanged={() => setHasManualData(true)}
            />
          </TabsContent>

          <TabsContent value="voice" className="mt-3">
            <VoiceTransactionForm
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
              getValues={getValues}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              onDataChanged={() => setHasVoiceData(true)}
            />
          </TabsContent>
        </Tabs>

        <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Alternar modo de inserção</AlertDialogTitle>
              <AlertDialogDescription>
                Você tem dados não salvos. Mudar o modo de inserção irá
                descartar estas alterações. Deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmTabChange}>
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
