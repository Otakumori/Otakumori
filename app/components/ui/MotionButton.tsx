"use client";

import { forwardRef } from "react";
import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MotionButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSNAMES: Record<NonNullable<MotionButtonProps["variant"]>, string> = {
  primary: "glass-button text-white",
  secondary: "glass-panel text-white",
  ghost: "text-white/80 hover:bg-white/5 hover:text-white",
};

const SIZE_CLASSNAMES: Record<NonNullable<MotionButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ variant = "primary", size = "md", disabled = false, className, children, ...props }, ref) => {
    const motionProps: any = {
      ref,
      className: cn(
        "rounded-xl font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-black",
        VARIANT_CLASSNAMES[variant],
        SIZE_CLASSNAMES[size],
        disabled && "cursor-not-allowed opacity-50",
        className,
      ),
      disabled,
    };
    if (!disabled) {
      motionProps.whileHover = { scale: 1.02 };
      motionProps.whileTap = { scale: 0.98 };
    }
    // Filter undefined from props
    Object.entries(props).forEach(([key, value]) => {
      if (value !== undefined) motionProps[key] = value;
    });
    return (
      <motion.button {...motionProps}>
        {children}
      </motion.button>
    );
  },
);

MotionButton.displayName = "MotionButton";

export default MotionButton;
