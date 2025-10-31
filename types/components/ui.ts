// UI Component Props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export interface StepsProps {
  steps: string[];
  current: number;
  onChange: (index: number) => void;
}

export interface WelcomeAnimationProps {
  onComplete?: () => void;
  skipEnabled?: boolean;
}