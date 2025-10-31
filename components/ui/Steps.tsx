interface StepsProps {
  current: number;
  steps: string[];
  onChange?: (step: number) => void;
}

export const Steps = ({ current, steps, onChange }: StepsProps) => {
  return (
    <div className="flex w-full justify-between">
      {steps.map((step: string, index: number) => (
        <div
          key={index}
          className={`
            relative flex items-center gap-2 
            ${index === current ? "text-primary" : "text-gray-500"}
            cursor-pointer
          `}
          onClick={() => onChange?.(index)}
        >
          <div
            className={`
              w-8 h-8 rounded-full border-2 flex items-center justify-center
              ${
                index === current
                  ? "border-primary bg-primary text-white"
                  : index < current
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-300 bg-transparent"
              }
            `}
          >
            {index < current ? "✓" : index + 1}
          </div>
          <span>{step}</span>
          {index < steps.length - 1 && (
            <div
              className={`
                absolute left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 w-[calc(200%-2rem)] h-0.5
                ${index < current ? "bg-primary" : "bg-gray-300"}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
};
