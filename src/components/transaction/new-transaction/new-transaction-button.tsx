"use client";

import { Button } from "../../ui/button";
import { Plus } from "lucide-react";
import { NewTransactionDialog } from "./new-transaction-dialog";

export function NewTransactionButton() {
  return (
    <div className="fixed bottom-6 right-6 z-30">
      <NewTransactionDialog>
        <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </NewTransactionDialog>
    </div>
  );
}
