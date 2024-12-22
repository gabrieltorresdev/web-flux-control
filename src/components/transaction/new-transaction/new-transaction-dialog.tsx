"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
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
import { Label } from "../../ui/label";

export function NewTransactionDialog() {
  const [currentTab, setCurrentTab] = useState("voice");
  const [showAlert, setShowAlert] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState<string | null>(null);
  const [hasVoiceData, setHasVoiceData] = useState(false);
  const [hasManualData, setHasManualData] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(transactionSchema),
  });

  const createTransaction = useCreateTransaction();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createTransaction.mutateAsync(data);
      reset();
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
    (value: string) => {
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
      reset();
      if (pendingTabChange === "voice") {
        setHasManualData(false);
      } else {
        setHasVoiceData(false);
      }
    }
  }, [pendingTabChange, reset]);

  const cancelTabChange = useCallback(() => {
    setPendingTabChange(null);
    setShowAlert(false);
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Adicionar Transação</Label>

          <Button
            size="sm"
            className="gap-2 h-8 w-8 rounded-full p-0 pointer-events-none"
            variant="outline"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Escolha como deseja adicionar sua transação
          </DialogDescription>
        </DialogHeader>
        <AlertDialog open={showAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Ao trocar o método de entrada, você perderá os dados já
                preenchidos no formulário.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelTabChange}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmTabChange}>
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="w-full overflow-hidden p-6 pt-0"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="h-4 w-4" />
              Por Voz
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <Keyboard className="h-4 w-4" />
              Manual
            </TabsTrigger>
          </TabsList>
          <TabsContent value="voice">
            <VoiceTransactionForm
              setValue={setValue}
              onDataChange={setHasVoiceData}
              register={register}
              errors={errors}
              getValues={getValues}
              onSubmit={onSubmit}
              reset={reset}
            />
          </TabsContent>
          <TabsContent value="manual">
            <ManualTransactionForm
              onDataChange={setHasManualData}
              register={register}
              errors={errors}
              getValues={getValues}
              onSubmit={onSubmit}
              setValue={setValue}
              isSubmitting={createTransaction.isPending}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
