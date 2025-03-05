"use client";

import { Button } from "@/shared/components/ui/button";
import { CheckSquare } from "lucide-react";
import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils";

interface SelectionModeButtonProps {
  onEnableSelectionMode: () => void;
}

export const SelectionModeButton = memo(function SelectionModeButton({
  onEnableSelectionMode
}: SelectionModeButtonProps) {
  const handleClick = useCallback(() => {
    onEnableSelectionMode();
  }, [onEnableSelectionMode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "h-9 px-3 gap-1.5 text-xs rounded-lg group relative overflow-hidden",
          "border-muted-foreground/20 hover:border-primary/30 hover:bg-primary/5",
          "transition-all duration-300 shadow-sm hover:shadow"
        )}
        onClick={handleClick}
      >
        <span className="relative z-10 flex items-center gap-1.5">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className="text-primary"
          >
            <CheckSquare className="h-4 w-4" />
          </motion.div>
          <span className="font-medium relative text-foreground/90">
            Selecionar
            <motion.span 
              className="absolute bottom-0 left-0 h-[1px] bg-primary"
              initial={{ width: 0 }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </span>
        </span>
        <motion.span 
          className="absolute inset-0 bg-primary/5"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          style={{ originX: 0 }}
        />
      </Button>
    </motion.div>
  );
}); 