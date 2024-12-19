"use client";

import { useEffect, memo } from "react";
import { TransactionForm } from "./transaction-form";
import { CreateTransactionInput } from "@/src/types/transaction";
import {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

interface ManualTransactionFormProps {
  onDataChange: (hasData: boolean) => void;
  register: UseFormRegister<CreateTransactionInput>;
  errors: FieldErrors<CreateTransactionInput>;
  getValues: UseFormGetValues<CreateTransactionInput>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  setValue: UseFormSetValue<CreateTransactionInput>;
}

export const ManualTransactionForm = memo(
  ({
    onDataChange,
    register,
    errors,
    getValues,
    onSubmit,
    setValue,
  }: ManualTransactionFormProps) => {
    const formValues = getValues();

    useEffect(() => {
      const hasData = Object.values(formValues).some((value) => value);
      onDataChange(hasData);
    }, [formValues, onDataChange]);

    return (
      <div>
        <TransactionForm
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          getValues={getValues}
          setValue={setValue}
        />
      </div>
    );
  }
);

ManualTransactionForm.displayName = "ManualTransactionForm";
