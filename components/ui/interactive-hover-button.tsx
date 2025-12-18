import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: React.ElementType;
  variant?: "primary" | "secondary" | "outline";
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", icon: Icon, className, variant = "primary", ...props }, ref) => {
  const variantStyles = {
    primary: "border-tron-cyan/30 bg-gradient-to-r from-tron-cyan to-tron-magenta text-white",
    secondary: "border-tron-grid bg-tron-dark/50 text-tron-text",
    outline: "border-tron-cyan/50 bg-transparent text-tron-cyan",
  };

  const hoverBgStyles = {
    primary: "bg-gradient-to-r from-tron-magenta to-tron-cyan",
    secondary: "bg-tron-cyan",
    outline: "bg-tron-cyan",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border-2 px-4 py-2.5 text-center font-semibold backdrop-blur-xl transition-all min-w-fit text-sm",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-2 translate-x-0 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {Icon && <Icon className="w-4 h-4" />}
        {text}
      </span>
      <div className="absolute top-0 left-0 z-10 flex h-full w-full translate-x-full items-center justify-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span>{text}</span>
        {Icon ? <Icon className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
      </div>
      <div className={cn(
        "absolute left-[20%] top-[40%] h-2 w-2 rounded-lg transition-all duration-300 group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:scale-150",
        hoverBgStyles[variant]
      )}></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
