"use client";

import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { CreateCategoryDialog } from "./create-category-dialog";
import { useState } from "react";

export function NewCategoryButton() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button size="lg" className="gap-2" onClick={() => setShowDialog(true)}>
        <Plus className="h-5 w-5" />
        Nova Categoria
      </Button>

      <CreateCategoryDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
}
