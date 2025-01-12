"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Transaction,
  CreateTransactionInput,
} from "@/features/transactions/types";
import { transactionSchema } from "@/shared/utils/validations/transaction";
import { useToast } from "@/shared/hooks/use-toast";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/shared/components/ui/responsive-modal";
import { updateTransaction } from "@/features/transactions/actions/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/get-query-client";
import { useState } from "react";

interface EditTransactionDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EditTransactionFormData = CreateTransactionInput;

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: EditTransactionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    setError,
    watch,
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: transaction.title,
      amount: transaction.amount,
      categoryId: transaction.category?.id,
      dateTime: new Date(transaction.dateTime),
    },
  });

  const onSubmit = handleSubmit(async (data: EditTransactionFormData) => {
    let result;
    try {
      setIsSubmitting(true);
      result = await updateTransaction(transaction.id, data);

      if (result.error) {
        if (
          result.error.code === "VALIDATION_ERROR" &&
          result.error.validationErrors
        ) {
          Object.entries(result.error.validationErrors).forEach(
            ([field, messages]) => {
              setError(field as keyof EditTransactionFormData, {
                message: messages[0],
              });
            }
          );
          return;
        }

        toast({
          title: "Erro ao atualizar transação",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      onOpenChange(false);
      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro ao atualizar transação",
        description: "Ocorreu um erro inesperado ao atualizar a transação.",
        variant: "destructive",
      });
    } finally {
      if (result?.error) {
        setIsSubmitting(false);
      } else {
        setTimeout(() => {
          setIsSubmitting(false);
        }, 300);
      }
    }
  });

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Editar Transação</ResponsiveModalTitle>
          <ResponsiveModalDescription />
        </ResponsiveModalHeader>

        <TransactionForm
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          getValues={getValues}
          setValue={setValue}
          watch={watch}
          isSubmitting={isSubmitting}
        />
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
