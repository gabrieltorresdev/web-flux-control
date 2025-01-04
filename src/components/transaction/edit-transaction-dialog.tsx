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
      const result = await updateTransaction(transaction.id, data);

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
