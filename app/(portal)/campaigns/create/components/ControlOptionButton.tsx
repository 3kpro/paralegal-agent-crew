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

    const baseClasses = `text-sm font-medium transition-all ${className}`;
    const selectedClasses =
      "bg-gradient-to-r from-tron-cyan to-tron-magenta text-white shadow-lg ring-2 ring-tron-cyan/20";
    const unselectedClasses =
      "bg-tron-grid/50 text-tron-text-muted hover:bg-tron-grid/70 hover:text-tron-text hover:border-tron-cyan/30";

    const layoutClasses = flex
      ? "flex-1 py-1.5 px-2 rounded-md"
      : "py-1.5 px-2 rounded-md text-center";

    return (
      <button
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