import { CreateTransactionInput, Transaction } from "@/types/transaction";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "../ui/responsive-modal";
import { TransactionForm } from "./new-transaction/transaction-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/lib/validations/transaction";
import { useUpdateTransaction } from "@/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";
import { ValidationError } from "@/lib/api/error-handler";

interface EditTransactionDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EditTransactionFormData = {
  title: string;
  amount: number;
  dateTime: Date;
  categoryId: string;
};

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
      await updateTransaction.mutateAsync({
        id: transaction.id,
        ...data,
      });
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ValidationError) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          setError(field as keyof EditTransactionFormData, {
            message: messages[0],
          });
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
          <ResponsiveModalTitle>Editar Transação</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Edite os dados da transação e clique em salvar para atualizar.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <TransactionForm
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          getValues={getValues}
          setValue={setValue}
          setError={setError}
          isSubmitting={updateTransaction.isPending}
        />
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
