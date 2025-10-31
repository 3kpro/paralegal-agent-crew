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
      "bg-blue-600 hover:bg-blue-700 text-white shadow-lg focus:ring-cyan-500",
    secondary:
      "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-cyan-500",
    outline:
      "border-2 border-gray-300 text-gray-700 hover:border-cyan-400 hover:text-cyan-600 focus:ring-cyan-500",
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
        boxShadow: "0 0 10px #00ffff",
        y: -2,
        transition: { duration: 0.3, ease: transitionTiming },
      }}
      whileTap={{
        boxShadow: "0 0 20px #00ffff, inset 0 0 5px rgba(0,255,255,0.3)",
        scale: 0.98,
        transition: { duration: 0.2, ease: transitionTiming },
      }}
      transition={{ duration: 0.3, ease: transitionTiming }}
    >
      {children}
    </motion.button>
  );
};
