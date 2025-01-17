"use client";

import { QuickAction } from "../types";
import { Button } from "@/shared/components/ui/button";

interface AiAssistantQuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
  disabled?: boolean;
}

export function AiAssistantQuickActions({
  actions,
  onActionClick,
  disabled
}: AiAssistantQuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.action}
          variant="outline"
          size="sm"
          onClick={() => onActionClick(action)}
          disabled={disabled}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
} 