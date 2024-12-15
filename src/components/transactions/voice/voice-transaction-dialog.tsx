"use client";

import React, { useState, useCallback, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVoiceSteps } from "./steps/use-voice-steps";
import { TransactionSummary } from "./summary/transaction-summary";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { CategoryService } from "@/services/category-service";
import { useIsMobile } from "@/hooks/use-mobile";
import type { TransactionInput } from "@/types/transaction";

type VoiceTransactionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionInput) => Promise<void>;
};

export function VoiceTransactionDialog({
  isOpen,
  onClose,
  onSubmit,
}: VoiceTransactionDialogProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [showSummary, setShowSummary] = useState(false);
  const categoryService = useMemo(() => new CategoryService(), []);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  const {
    step,
    steps,
    formData,
    updateField,
    nextStep,
    previousStep,
    resetSteps,
  } = useVoiceSteps(categories);

  const handleClose = useCallback(() => {
    resetSteps();
    setShowSummary(false);
    onClose();
  }, [resetSteps, onClose]);

  const handleConfirm = useCallback(async () => {
    try {
      if (!formData.title || !formData.categoryId || !formData.amount) {
        throw new Error("Dados incompletos");
      }

      await onSubmit(formData as TransactionInput);
      toast({
        title: "Transação criada",
        description: "A transação foi criada com sucesso.",
      });
      handleClose();
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível criar a transação.",
        variant: "destructive",
      });
    }
  }, [formData, onSubmit, toast, handleClose]);

  const handleStepComplete = useCallback((data: Record<string, any>) => {
    Object.entries(data).forEach(([key, value]) => {
      updateField(key, value);
    });

    const hasMoreSteps = nextStep();
    if (!hasMoreSteps) {
      setShowSummary(true);
    }
  }, [updateField, nextStep]);

  const handleBack = useCallback(() => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    previousStep();
  }, [showSummary, previousStep]);

  const handleUpdateField = useCallback((field: keyof TransactionInput, value: string) => {
    if (field === "amount") {
      updateField(field, parseFloat(value));
    } else {
      updateField(field, value);
    }
  }, [updateField]);

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  const renderContent = () => {
    if (showSummary) {
      return (
        <TransactionSummary
          transaction={formData as TransactionInput}
          category={selectedCategory}
          onConfirm={handleConfirm}
          onCancel={handleBack}
          onUpdate={handleUpdateField}
        />
      );
    }

    const CurrentStepComponent = steps[step].component;

    return (
      <>
        {renderStepProgress()}
        {renderStepSummary()}

        <div className="space-y-4">
          <p className="text-lg font-medium">{steps[step].question}</p>

          <CurrentStepComponent
            onNext={handleStepComplete}
            onCancel={handleClose}
            onBack={step > 0 ? handleBack : undefined}
            categories={categories}
            selectedCategory={formData.categoryId}
          />
        </div>
      </>
    );
  };

  const renderStepProgress = () => (
    <div className="flex items-center justify-center gap-1 mb-4">
      {steps.map((_, index) => (
        <div
          key={index}
          className={`h-2 w-2 rounded-full transition-colors ${
            index === step ? "bg-primary" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );

  const renderStepSummary = () => {
    if (!formData.title) return null;

    return (
      <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-2">
        <h3 className="font-medium text-sm text-muted-foreground">
          Dados informados:
        </h3>
        <div className="space-y-1 text-sm">
          {formData.title && (
            <p>
              <span className="text-muted-foreground">Título:</span>{" "}
              {formData.title}
            </p>
          )}
          {selectedCategory && (
            <p>
              <span className="text-muted-foreground">Categoria:</span>{" "}
              {selectedCategory.name}
            </p>
          )}
          {formData.amount && (
            <p>
              <span className="text-muted-foreground">Valor:</span>{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(formData.amount)}
            </p>
          )}
          {formData.date && (
            <p>
              <span className="text-muted-foreground">Data:</span>{" "}
              {new Date(formData.date).toLocaleDateString("pt-BR")}
            </p>
          )}
          {formData.time && (
            <p>
              <span className="text-muted-foreground">Hora:</span>{" "}
              {formData.time}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader>
            <DrawerTitle>Nova Transação por Voz</DrawerTitle>
          </DrawerHeader>
          <div className="mt-4">{renderContent()}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Transação por Voz</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}