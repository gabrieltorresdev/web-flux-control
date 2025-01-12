"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { BudgetService } from "@/features/budget/services/budget-service";
import { CreateBudgetInput } from "@/features/budget/types";
import { useToast } from "@/shared/hooks/use-toast";
import { ControllerRenderProps } from "react-hook-form";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  amount: z.string().min(1, "Valor é obrigatório"),
  categoryId: z.string().optional(),
  startDate: z.string().min(1, "Data inicial é obrigatória"),
  endDate: z.string().min(1, "Data final é obrigatória"),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.enum(["monthly", "yearly"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type TextFieldProps = {
  field: Omit<
    ControllerRenderProps<
      FormValues,
      "name" | "amount" | "startDate" | "endDate"
    >,
    "value"
  > & {
    value: string;
  };
};

type SelectFieldProps = {
  field: Omit<
    ControllerRenderProps<FormValues, "categoryId" | "recurringPeriod">,
    "value"
  > & {
    value: string | undefined;
  };
};

type CheckboxFieldProps = {
  field: Omit<ControllerRenderProps<FormValues, "isRecurring">, "value"> & {
    value: boolean;
  };
};

export function BudgetForm() {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isRecurring: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const budgetService = new BudgetService();
      const input: CreateBudgetInput = {
        name: values.name,
        amount: parseFloat(values.amount),
        categoryId: values.categoryId,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        isRecurring: values.isRecurring,
        recurringPeriod: values.recurringPeriod,
      };

      await budgetService.create(input);

      toast({
        title: "Orçamento criado",
        description: "O orçamento foi criado com sucesso!",
      });

      form.reset();
    } catch {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o orçamento.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }: TextFieldProps) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do orçamento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }: TextFieldProps) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }: SelectFieldProps) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Alimentação</SelectItem>
                  <SelectItem value="2">Lazer</SelectItem>
                  <SelectItem value="3">Transporte</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }: TextFieldProps) => (
              <FormItem>
                <FormLabel>Data Inicial</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }: TextFieldProps) => (
              <FormItem>
                <FormLabel>Data Final</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }: CheckboxFieldProps) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Orçamento Recorrente</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {form.watch("isRecurring") && (
          <FormField
            control={form.control}
            name="recurringPeriod"
            render={({ field }: SelectFieldProps) => (
              <FormItem>
                <FormLabel>Período de Recorrência</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit">Criar Orçamento</Button>
      </form>
    </Form>
  );
}
