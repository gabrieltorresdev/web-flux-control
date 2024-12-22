import { CreateTransactionInput, Transaction } from "@/src/types/transaction";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { TransactionForm } from "./new-transaction/transaction-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/src/lib/validations/transaction";
import { useUpdateTransaction } from "@/src/hooks/use-transactions";
import { useToast } from "@/src/hooks/use-toast";

interface EditTransactionDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: EditTransactionDialogProps) {
  const { toast } = useToast();
  const updateTransaction = useUpdateTransaction();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: transaction.title,
      amount: transaction.amount,
      categoryId: transaction.category?.id,
      dateTime: new Date(transaction.dateTime),
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        ...data,
        dateTime: data.dateTime,
        categoryId: data.categoryId!,
      });
      onOpenChange(false);
      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar a transação.",
        variant: "destructive",
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>
            Edite os dados da transação e clique em salvar para atualizar.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          getValues={getValues}
          setValue={setValue}
          isSubmitting={updateTransaction.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
