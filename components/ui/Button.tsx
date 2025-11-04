import React from "react";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseClasses =
    "font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-coral-500 hover:bg-coral-600 text-white shadow-xl border-2 border-transparent hover:border-coral-400/50 focus:ring-coral-500",
    secondary:
      "bg-transparent border-2 border-gray-600 text-white hover:border-coral-500/50 focus:ring-coral-500",
    outline:
      "border-2 border-gray-700/70 text-white hover:border-coral-500/50 focus:ring-coral-500",
  };

  const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-4 px-8 text-lg",
  };

  // Tron-inspired animation settings
  const transitionTiming: [number, number, number, number] = [
    0.25, 0.46, 0.45, 0.94,
  ];

  return (
    <motion.button
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      whileHover={{
        boxShadow: "0 0 20px rgba(238, 139, 114, 0.2)",
        y: -2,
        transition: { duration: 0.3, ease: transitionTiming },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.2, ease: transitionTiming },
      }}
      transition={{ duration: 0.3, ease: transitionTiming }}
    >
      {children}
    </motion.button>
  );
};
