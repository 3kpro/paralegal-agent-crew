/**
 * CreativitySlider Component
 * 
 * Reusable slider component for adjusting content creativity/temperature level.
 * Handles accessibility and styling of range input for slider UI.
 */

import React, { memo, useCallback } from "react";
import { Zap } from "lucide-react";

interface CreativitySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  ariaLabel?: string;
}

/**
 * CreativitySlider - Memoized component to prevent unnecessary re-renders
 */
const CreativitySlider = memo<CreativitySliderProps>(
  ({
    value,
    onChange,
    min = 0,
    max = 1,
    step = 0.1,
    label = "Creativity",
    ariaLabel = "Creativity level",
  }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(parseFloat(e.target.value));
      },
      [onChange]
    );

    return (
      <div className="p-6 bg-gradient-to-br from-tron-dark/50 to-tron-dark/30 backdrop-blur-xl border-2 border-tron-cyan/30 rounded-2xl hover:border-tron-cyan/50 transition-all">
        {/* Header with label and value display */}
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="temperature-slider" className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-tron-cyan" />
            <span className="font-semibold text-tron-text">{label}</span>
          </label>
          <span
            className="text-tron-cyan font-mono text-lg font-bold"
            aria-live="polite"
            aria-label={`Current creativity level: ${value.toFixed(1)}`}
          >
            {value.toFixed(1)}
          </span>
        </div>

        {/* Slider input */}
        <div className="relative">
          <input
            id="temperature-slider"
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            aria-label={ariaLabel}
            title={`Adjust ${label.toLowerCase()} level from ${min} to ${max}`}
            className={`w-full h-2 bg-tron-grid/50 rounded-full appearance-none cursor-pointer 
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r 
                         [&::-webkit-slider-thumb]:from-tron-cyan [&::-webkit-slider-thumb]:to-tron-magenta
                         [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-tron-cyan/50
                         [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                         [&::-webkit-slider-thumb]:hover:scale-110
                         [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
                         [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r
                         [&::-moz-range-thumb]:from-tron-cyan [&::-moz-range-thumb]:to-tron-magenta
                         [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-tron-cyan/50
                         [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0`}
          />
        </div>

        {/* Helper text */}
        <div className="flex justify-between text-xs text-tron-text-muted mt-3">
          <span aria-hidden="true">Focused</span>
          <span aria-hidden="true">Creative</span>
        </div>
      </div>
    );
  }
);

CreativitySlider.displayName = "CreativitySlider";

export default CreativitySlider;