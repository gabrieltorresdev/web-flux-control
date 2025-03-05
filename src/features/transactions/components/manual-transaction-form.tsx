"use client";

import { useEffect, memo } from "react";
import { TransactionForm } from "./transaction-form";
import { CreateTransactionInput } from "@/features/transactions/types";
import {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useDebounce } from "@/shared/hooks/use-debounce";

interface ManualTransactionFormProps {
  register: UseFormRegister<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
  getValues: UseFormGetValues<CreateTransactionInput>;
  setValue: UseFormSetValue<CreateTransactionInput>;
  watch: UseFormWatch<CreateTransactionInput>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting?: boolean;
  onDataChanged: () => void;
}

export const ManualTransactionForm = memo(
  ({
    register,
    errors,
    getValues,
    setValue,
    watch,
    onSubmit,
    isSubmitting = false,
    onDataChanged,
  }: ManualTransactionFormProps) => {
    const formValues = watch();
    const debouncedFormValues = useDebounce(formValues, 500);

    useEffect(() => {
      const hasData = 
        (formValues.title && formValues.title.trim() !== "") || 
        formValues.amount > 0 || 
        (formValues.categoryId && formValues.categoryId.trim() !== "");
        
      if (hasData) {
        onDataChanged();
      }
    }, [formValues, onDataChanged]);

    return (
      <div>
        <TransactionForm
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          getValues={getValues}
          setValue={setValue}
          watch={watch}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }
);

ManualTransactionForm.displayName = "ManualTransactionForm";
