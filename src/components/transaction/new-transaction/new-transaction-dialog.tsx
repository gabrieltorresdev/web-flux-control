"use client";

import { useState, useCallback, useEffect, ReactNode } from "react";
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "../../ui/responsive-modal";
import { Button } from "../../ui/button";
import { Plus, Mic, Keyboard } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/src/lib/validations/transaction";
import { CreateTransactionInput } from "@/src/types/transaction";
import { useCreateTransaction } from "@/src/hooks/use-transactions";
import { toast } from "@/src/hooks/use-toast";
import { useDraftTransaction } from "@/src/hooks/use-draft-transaction";

interface NewTransactionDialogProps {
  initialDate?: Date;
  children?: ReactNode;
}

export function NewTransactionDialog({
  initialDate,
  children,
}: NewTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"manual" | "voice">("manual");
  const [showAlert, setShowAlert] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState<
    "manual" | "voice" | null
  >(null);
  const [hasVoiceData, setHasVoiceData] = useState(false);
  const [hasManualData, setHasManualData] = useState(false);

  const createTransaction = useCreateTransaction();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    reset,
    watch,
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      dateTime: initialDate ?? new Date(),
    },
  });

  const { saveDraft, loadTranscript, loadSuggestedCategory, clearDraft } =
    useDraftTransaction(setValue, reset, getValues);

  // Salvar rascunho quando houver mudanças no formulário
  useEffect(() => {
    const subscription = watch(() => {
      if (hasManualData || hasVoiceData) {
        // Preservar o transcript ao salvar o rascunho
        const currentTranscript = loadTranscript();
        const currentSuggestedCategory = loadSuggestedCategory();
        saveDraft(currentTranscript, currentSuggestedCategory);
      }
    });
    return () => subscription.unsubscribe();
  }, [
    watch,
    saveDraft,
    hasManualData,
    hasVoiceData,
    loadTranscript,
    loadSuggestedCategory,
  ]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createTransaction.mutateAsync(data);
      clearDraft();
      reset();
      setHasVoiceData(false);
      setHasManualData(false);
      setOpen(false);
      toast({
        title: "Transação criada",
        description: "A transação foi criada com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao criar a transação",
        description: "Ocorreu um erro ao criar a transação.",
        variant: "destructive",
      });
    }
  });

  const handleTabChange = useCallback(
    (value: "manual" | "voice") => {
      if (value !== currentTab) {
        const shouldShowAlert =
          (currentTab === "voice" && hasVoiceData && value === "manual") ||
          (currentTab === "manual" && hasManualData && value === "voice");

        if (shouldShowAlert) {
          setShowAlert(true);
          setPendingTabChange(value);
        } else {
          setCurrentTab(value);
        }
      }
    },
    [currentTab, hasVoiceData, hasManualData]
  );

  const confirmTabChange = useCallback(() => {
    if (pendingTabChange) {
      setCurrentTab(pendingTabChange);
      setPendingTabChange(null);
      setShowAlert(false);
      if (pendingTabChange === "voice") {
        setHasManualData(false);
      } else {
        setHasVoiceData(false);
      }
    }
  }, [pendingTabChange]);

  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <ResponsiveModalTrigger asChild>
        {children || (
          <Button
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Nova transação</span>
          </Button>
        )}
      </ResponsiveModalTrigger>

      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Nova transação</ResponsiveModalTitle>
          <ResponsiveModalDescription></ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <Tabs
          value={currentTab}
          onValueChange={(value: string) => {
            if (value === "manual" || value === "voice") {
              handleTabChange(value);
            }
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="manual" className="gap-2">
              <Keyboard className="h-4 w-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="h-4 w-4" />
              Por voz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="mt-0">
            <ManualTransactionForm
              onSubmit={onSubmit}
              register={register}
              errors={errors}
              getValues={getValues}
              setValue={setValue}
              saveDraft={saveDraft}
              isSubmitting={createTransaction.isPending}
              onDataChange={setHasManualData}
            />
          </TabsContent>

          <TabsContent value="voice" className="mt-0">
            <VoiceTransactionForm
              onSubmit={onSubmit}
              register={register}
              errors={errors}
              getValues={getValues}
              setValue={setValue}
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
              Você tem alterações não salvas. Deseja realmente trocar o método
              de entrada? Suas alterações serão perdidas.
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
    </ResponsiveModal>
  );
}
