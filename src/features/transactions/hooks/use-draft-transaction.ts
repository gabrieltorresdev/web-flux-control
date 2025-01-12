import { parseISO } from "date-fns";
import { CreateTransactionInput } from "@/features/transactions/types";
import { useCallback, useEffect, useRef } from "react";
import {
  UseFormGetValues,
  UseFormReset,
  UseFormSetValue,
} from "react-hook-form";

const DRAFT_KEY = "transaction_draft";

interface DraftData {
  form: Partial<CreateTransactionInput>;
  transcript?: string;
  suggestedCategory?: string;
}

export function useDraftTransaction(
  setValue: UseFormSetValue<CreateTransactionInput>,
  reset: UseFormReset<CreateTransactionInput>,
  getValues: UseFormGetValues<CreateTransactionInput>
) {
  const isInitialLoad = useRef(true);

  // Carregar rascunho inicial
  useEffect(() => {
    if (!isInitialLoad.current) return;
    isInitialLoad.current = false;

    const draft = localStorage.getItem(DRAFT_KEY);
    if (!draft) return;

    try {
      const parsedDraft = JSON.parse(draft) as DraftData;
      if (parsedDraft.form) {
        Object.entries(parsedDraft.form).forEach(([key, value]) => {
          if (value !== undefined) {
            // Converter a string de data de volta para Date
            if (key === "dateTime" && typeof value === "string") {
              setValue(key as keyof CreateTransactionInput, parseISO(value), {
                shouldDirty: false,
                shouldTouch: false,
              });
            } else {
              setValue(key as keyof CreateTransactionInput, value, {
                shouldDirty: false,
                shouldTouch: false,
              });
            }
          }
        });
      }
    } catch (error) {
      console.error("Error loading draft:", error);
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [setValue]);

  const saveDraft = useCallback(
    (transcript?: string, suggestedCategory?: string) => {
      const formValues = getValues();
      const cleanData = Object.fromEntries(
        Object.entries(formValues).filter(([, value]) => value !== undefined)
      );

      // Garantir que a data seja serializada corretamente
      if (cleanData.dateTime instanceof Date) {
        cleanData.dateTime = cleanData.dateTime.toISOString();
      }

      const draftData: DraftData = {
        form: cleanData,
        transcript,
        suggestedCategory,
      };

      if (Object.keys(cleanData).length > 0 || transcript) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      }
    },
    [getValues]
  );

  const loadTranscript = useCallback((): string | undefined => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (!draft) return undefined;

    try {
      const parsedDraft = JSON.parse(draft) as DraftData;
      return parsedDraft.transcript;
    } catch {
      return undefined;
    }
  }, []);

  const loadSuggestedCategory = useCallback((): string | undefined => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (!draft) return undefined;

    try {
      const parsedDraft = JSON.parse(draft) as DraftData;
      return parsedDraft.suggestedCategory;
    } catch {
      return undefined;
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    reset();
  }, [reset]);

  return {
    saveDraft,
    clearDraft,
    loadTranscript,
    loadSuggestedCategory,
  };
}
