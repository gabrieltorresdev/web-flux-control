"use client";

import React, { memo, useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCategoryLoader } from "@/hooks/use-category-loader";
import {
  transactionSchema,
  type TransactionFormData,
} from "@/lib/validations/transaction";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Combobox } from "../ui/combobox";
import type { TransactionInput } from "@/types/transaction";

type TransactionFormProps = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionInput) => Promise<void>;
  initialData?: TransactionFormData;
};

const getDefaultValues = () => ({
  title: "",
  amount: 0,
  category: "",
  type: "expense" as const,
  date: new Date().toISOString().split("T")[0],
  time: new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }),
});

function TransactionFormComponent({
  isVisible,
  onClose,
  onSubmit,
  initialData,
}: TransactionFormProps) {
  const {
    categories,
    isLoading: isCategoriesLoading,
    loadCategories,
    updateSearch,
    updateType,
  } = useCategoryLoader();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData || getDefaultValues(),
  });

  const selectedType = form.watch("type");

  // Load categories when form becomes visible
  useEffect(() => {
    if (isVisible) {
      loadCategories(selectedType);
    }
  }, [isVisible, selectedType, loadCategories]);

  // Reset form when initialData changes or when form is closed
  useEffect(() => {
    if (!isVisible) {
      form.reset(getDefaultValues());
    } else if (initialData) {
      form.reset(initialData);
    }
  }, [isVisible, initialData, form.reset]);

  // Update category type when it changes
  useEffect(() => {
    updateType(selectedType);
  }, [selectedType, updateType]);

  const mappedCategories = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const handleSubmit = async (data: TransactionFormData) => {
    try {
      await onSubmit({
        amount: data.amount,
        categoryId: data.category,
        date: data.date,
        time: data.time,
        title: data.title,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl animate-slide-up max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {initialData ? "Editar" : "Nova"} Transação
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="p-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="income" id="type-income" />
                        <Label htmlFor="type-income">Entrada</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="expense" id="type-expense" />
                        <Label htmlFor="type-expense">Saída</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Combobox
                      options={mappedCategories}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={
                        selectedType
                          ? "Selecione uma categoria..."
                          : "Selecione o tipo primeiro"
                      }
                      searchPlaceholder="Buscar categoria..."
                      onSearch={updateSearch}
                      isLoading={isCategoriesLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export const TransactionForm = memo(TransactionFormComponent);
