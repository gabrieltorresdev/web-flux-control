"use client";

import { useEffect, memo } from "react";
import { TransactionForm } from "./transaction-form";
import { CreateTransactionInput } from "@/features/transactions/types";
import {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormSetError,
  UseFormWatch,
} from "react-hook-form";
import { useDebounce } from "@/shared/hooks/use-debounce";

interface ManualTransactionFormProps {
  onDataChange: (hasData: boolean) => void;
  register: UseFormRegister<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
  getValues: UseFormGetValues<CreateTransactionInput>;
  setValue: UseFormSetValue<CreateTransactionInput>;
  setError: UseFormSetError<CreateTransactionInput>;
  watch: UseFormWatch<CreateTransactionInput>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting?: boolean;
  saveDraft: () => void;
}

export const ManualTransactionForm = memo(
  ({
    onDataChange,
    register,
    errors,
    getValues,
    setValue,
    watch,
    onSubmit,
    isSubmitting = false,
    saveDraft,
  }: ManualTransactionFormProps) => {
    const formValues = getValues();
    const debouncedFormValues = useDebounce(formValues, 500);

    useEffect(() => {
      const hasData = Object.values(formValues).some((value) => value);
      onDataChange(hasData);
    }, [formValues, onDataChange]);

    useEffect(() => {
      if (Object.values(debouncedFormValues).some((value) => value)) {
        saveDraft();
      }
    }, [debouncedFormValues, saveDraft]);

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
