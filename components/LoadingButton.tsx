import { ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export default function LoadingButton({
  loading = false,
  loadingText = "Loading...",
  children,
  variant = "primary",
  size = "md",
  disabled,
  className = "",
  ...props
}: LoadingButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-700 focus:ring-cyan-500 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 focus:ring-cyan-500 text-white",
    outline:
      "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-cyan-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-base rounded-lg",
    lg: "px-6 py-3 text-lg rounded-lg",
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  // Tron-inspired animation settings
  const transitionTiming: [number, number, number, number] = [
    0.25, 0.46, 0.45, 0.94,
  ];

  // Spinner animation
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "linear" as const,
      },
    },
  };

  // Glow animation
  const glowVariants = {
    animate: {
      boxShadow: ["0 0 5px #00ffff", "0 0 15px #00ffff", "0 0 5px #00ffff"],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.button
      type={props.type}
      onClick={props.onClick}
      disabled={disabled || loading}
      className={combinedClasses}
      whileHover={
        !disabled && !loading
          ? {
              boxShadow: "0 0 10px #00ffff",
              y: -2,
            }
          : undefined
      }
      whileTap={
        !disabled && !loading
          ? {
              scale: 0.98,
              boxShadow: "0 0 20px #00ffff, inset 0 0 5px rgba(0,255,255,0.3)",
            }
          : undefined
      }
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      animate={loading ? "animate" : undefined}
      variants={loading ? glowVariants : undefined}
    >
      {loading && (
        <motion.svg
          className="h-4 w-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          variants={spinnerVariants}
          animate="animate"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </motion.svg>
      )}
      {loading ? loadingText : children}
    </motion.button>
  );
}
