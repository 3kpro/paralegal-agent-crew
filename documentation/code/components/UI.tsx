
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', children, ...props }, ref) => {
    const baseClasses = 'px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
      primary: 'text-white bg-gradient-to-r from-brand-accent-cyan to-brand-accent-pink hover:opacity-90 shadow-glow-cyan',
      secondary: 'bg-brand-surface-alt border border-brand-border text-brand-text-primary hover:bg-brand-border',
      ghost: 'bg-transparent text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-surface-alt',
    };
    return (
      <button ref={ref} className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-brand-surface border border-brand-border rounded-md px-3 py-2 text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent-cyan ${className}`}
        {...props}
      />
    );
  }
);

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full bg-brand-surface border border-brand-border rounded-md px-3 py-2 text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent-cyan ${className}`}
        {...props}
      />
    );
  }
);

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full bg-brand-surface border border-brand-border rounded-md px-3 py-2 text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent-cyan appearance-none bg-no-repeat bg-right pr-8 bg-[url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="%23A4A6C5" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6 8 4 4 4-4"/></svg>')] ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card = ({ children, className }: CardProps) => (
  <div className={`bg-brand-surface border border-brand-border rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

type ToggleChipProps = {
  children: React.ReactNode;
  selected: boolean;
  onSelected: () => void;
  className?: string;
};

export const ToggleChip = ({ children, selected, onSelected, className }: ToggleChipProps) => (
  <button
    onClick={onSelected}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      selected
        ? 'bg-brand-accent-cyan text-brand-bg'
        : 'bg-brand-surface-alt text-brand-text-secondary hover:bg-brand-border hover:text-brand-text-primary'
    } ${className}`}
  >
    {children}
  </button>
);

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const Checkbox = ({ label, checked, onChange }: CheckboxProps) => (
  <label className="flex items-center gap-2 cursor-pointer text-brand-text-primary">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="hidden"
    />
    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-brand-accent-cyan border-brand-accent-cyan' : 'border-brand-border bg-brand-surface'}`}>
      {checked && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0E1B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
    </div>
    {label}
  </label>
);

export const LoadingSpinner = () => (
    <div className="w-8 h-8 border-4 border-brand-accent-cyan border-t-transparent rounded-full animate-spin"></div>
);
