"use client";

import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { CreateCategoryDialog } from "./create-category-dialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/get-query-client";

export function NewCategoryButton() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleSuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.categories.all,
    });
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <Button
        size="icon"
        className="rounded-full h-14 w-14 shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <CreateCategoryDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
