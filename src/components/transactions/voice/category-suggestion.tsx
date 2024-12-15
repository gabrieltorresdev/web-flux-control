"use client";

import { memo } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types/category";

type CategorySuggestionProps = {
  spokenCategory: string;
  suggestedCategory?: Category;
  onAcceptSuggestion: (category: Category) => void;
  onCreateCategory: () => void;
};

function CategorySuggestionComponent({
  spokenCategory,
  suggestedCategory,
  onAcceptSuggestion,
  onCreateCategory,
}: CategorySuggestionProps) {
  return (
    <Alert variant="default" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Categoria não encontrada</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          A categoria &quot;{spokenCategory}&quot; não foi encontrada.
          {suggestedCategory && (
            <>
              <br />
              Você quis dizer:{" "}
              <Button
                variant="link"
                className="px-0 text-primary"
                onClick={() => onAcceptSuggestion(suggestedCategory)}
              >
                {suggestedCategory.name}
              </Button>
              ?
            </>
          )}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateCategory}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export const CategorySuggestion = memo(CategorySuggestionComponent);
