"use client";

import { forwardRef } from "react";
import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MotionCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "hover" | "interactive";
  children: ReactNode;
}

const VARIANT_CLASSNAMES: Record<NonNullable<MotionCardProps["variant"]>, string> = {
  default: "",
  hover: "cursor-pointer",
  interactive: "cursor-pointer",
};

const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ variant = "default", className, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn("rounded-2xl border border-white/10 bg-white/5 p-4", VARIANT_CLASSNAMES[variant], className)}
      whileHover={variant === "default" ? undefined : { y: -2, scale: 1.01 }}
      whileTap={variant === "interactive" ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  ),
);

MotionCard.displayName = "MotionCard";

export default MotionCard;
