/**
 * ControlOptionButton Component
 * 
 * Reusable button component for selecting control options (Tone, Length, Audience, Focus, CTA).
 * Supports both full-width and flex layouts with consistent styling.
 */

import React, { memo, useCallback } from "react";

interface ControlOptionButtonProps {
  id: string;
  label: string;
  isSelected: boolean;
  onClick: (id: string) => void;
  flex?: boolean;
  className?: string;
}

/**
 * ControlOptionButton - Memoized button for control options
 */
const ControlOptionButton = memo<ControlOptionButtonProps>(
  ({
    id,
    label,
    isSelected,
    onClick,
    flex = false,
    className = "",
  }) => {
    const handleClick = useCallback(() => {
      onClick(id);
    }, [id, onClick]);

    const baseClasses = `text-sm font-medium transition-all duration-200 active:scale-[0.97] ${className}`;
    const selectedClasses =
      "bg-white text-black shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] border-white border-2 scale-[1.02]";
    const unselectedClasses =
      "bg-white/5 text-gray-400 border border-white/10 hover:border-white/30 hover:bg-white/10 hover:text-white";

    const layoutClasses = flex
      ? "flex-1 py-2.5 px-4 rounded-xl"
      : "py-2.5 px-4 rounded-xl text-center";

    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isSelected}
        title={`Select ${label}`}
        className={`${baseClasses} ${layoutClasses} ${
          isSelected ? selectedClasses : unselectedClasses
        }`}
      >
        {label}
      </button>
    );
  }
);

ControlOptionButton.displayName = "ControlOptionButton";

export default ControlOptionButton;