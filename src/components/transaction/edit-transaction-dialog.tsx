"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Transaction, CreateTransactionInput } from "@/types/transaction";
import { transactionSchema } from "@/lib/validations/transaction";
import { useToast } from "@/hooks/use-toast";
import { TransactionForm } from "./new-transaction/transaction-form";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "../ui/responsive-modal";
import { updateTransaction } from "@/app/actions/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/get-query-client";

interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    setError,
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
    try {
      await updateTransaction(transaction.id, data);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.all,
      });
      onOpenChange(false);
      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso.",
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "status" in error) {
        const apiError = error as ApiError;
        if (apiError.status === 422 && apiError.errors) {
          Object.entries(apiError.errors).forEach(([field, messages]) => {
            setError(field as keyof EditTransactionFormData, {
              message: messages[0],
            });
          });
          return;
        }
      }

      if (error instanceof Error) {
        setError("dateTime", {
          message: error.message,
        });
        return;
      }

      toast({
        title: "Erro ao atualizar transação",
        description: "Ocorreu um erro ao atualizar a transação.",
        variant: "destructive",
      });
    }
  });

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Editar transação</ResponsiveModalTitle>
          <ResponsiveModalDescription />
        </ResponsiveModalHeader>

        <TransactionForm
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          getValues={getValues}
          setValue={setValue}
          isSubmitting={false}
        />
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
