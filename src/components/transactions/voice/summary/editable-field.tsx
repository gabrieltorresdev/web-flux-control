"use client";

import { useState, useCallback } from "react";
import { Check, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type EditableFieldProps = {
  label: string;
  value: string;
  type?: "text" | "number" | "date" | "time";
  onSave: (value: string) => void;
};

export function EditableField({ label, value, type = "text", onSave }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = useCallback(() => {
    onSave(editValue);
    setIsEditing(false);
  }, [editValue, onSave]);

  if (isEditing) {
    return (
      <div className="flex justify-between items-center py-2 border-b">
        <dt className="text-muted-foreground">{label}:</dt>
        <div className="flex items-center gap-2">
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-40 h-8"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleSave}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center py-2 border-b group">
      <dt className="text-muted-foreground">{label}:</dt>
      <div className="flex items-center gap-2">
        <dd className="font-medium">{value}</dd>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}