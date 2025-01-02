"use client";

import { Button } from "../../ui/button";
import { Plus } from "lucide-react";
import { NewTransactionDialog } from "./new-transaction-dialog";
import { useState } from "react";

export function NewTransactionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <Button
        size="icon"
        className="rounded-full h-14 w-14 shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <NewTransactionDialog open={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
