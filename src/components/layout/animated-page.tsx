"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
  skipAnimation?: boolean;
}

export function AnimatedPage({
  children,
  className,
  skipAnimation = false,
}: AnimatedPageProps) {
  if (skipAnimation) {
    return <div className={cn("w-full min-h-0", className)}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={cn("w-full min-h-0 flex flex-col", className)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="min-h-0 flex-1"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
