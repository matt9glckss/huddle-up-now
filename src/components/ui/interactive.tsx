import * as React from "react";
import { cn } from "@/lib/utils";

export interface InteractiveProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'subtle' | 'lift' | 'glow' | 'card';
  disabled?: boolean;
}

const Interactive = React.forwardRef<HTMLDivElement, InteractiveProps>(
  ({ className, variant = 'subtle', disabled = false, children, ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'subtle':
          return 'hover:bg-muted/50 hover:scale-[1.01]';
        case 'lift':
          return 'hover:shadow-lg hover:-translate-y-1';
        case 'glow':
          return 'hover:shadow-glow hover:shadow-primary/20';
        case 'card':
          return 'hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30';
        default:
          return '';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-300 ease-out',
          !disabled && 'cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && getVariantClasses(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Interactive.displayName = "Interactive";

export interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'destructive';
}

const InteractiveButton = React.forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'default':
          return 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]';
        case 'subtle':
          return 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]';
        case 'destructive':
          return 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]';
        default:
          return '';
      }
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          getVariantClasses(),
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

InteractiveButton.displayName = "InteractiveButton";

export interface FloatingElementProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const FloatingElement = React.forwardRef<HTMLDivElement, FloatingElementProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-float',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FloatingElement.displayName = "FloatingElement";

export { Interactive, InteractiveButton, FloatingElement };