"use client";

import { useEffect, memo } from "react";
import { TransactionForm } from "./transaction-form";
import { CreateTransactionInput } from "@/types/transaction";
import {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormSetError,
} from "react-hook-form";
import { useDebounce } from "@/hooks/lib/use-debounce";

interface ManualTransactionFormProps {
  onDataChange: (hasData: boolean) => void;
  register: UseFormRegister<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
  getValues: UseFormGetValues<CreateTransactionInput>;
  setValue: UseFormSetValue<CreateTransactionInput>;
  setError: UseFormSetError<CreateTransactionInput>;
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
    setError,
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
          setError={setError}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }
);

ManualTransactionForm.displayName = "ManualTransactionForm";
