import * as React from 'react';
import { motion, HTMLMotionProps, Variants, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { hoverTap, subtleGlow, cardHover } from '@/lib/animations';

type AnimationType = 'scale' | 'lift' | 'glow' | 'card' | 'none';

interface InteractiveProps extends Omit<HTMLMotionProps<'div'>, 'onDrag'> {
  as?: keyof JSX.IntrinsicElements;
  animationType?: AnimationType;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * A div with built-in hover and tap animations
 */
export const Interactive = React.forwardRef<HTMLDivElement, InteractiveProps>(
  ({
    as: Component = 'div',
    animationType = 'scale',
    children,
    className,
    disabled = false,
    ...props
  }, ref) => {
    const MotionComponent = motion[Component as keyof typeof motion] as React.ComponentType<MotionProps>;

    const getAnimationProps = (): MotionProps => {
      if (disabled) return {};
      
      switch (animationType) {
        case 'scale':
          return {
            whileHover: { scale: 1.02 },
            whileTap: { scale: 0.98 },
          };
        case 'lift':
          return {
            initial: 'initial',
            whileHover: 'hover',
            whileTap: 'tap',
            variants: hoverTap,
          };
        case 'glow':
          return {
            initial: 'initial',
            whileHover: 'hover',
            variants: subtleGlow,
          };
        case 'card':
          return {
            initial: 'initial',
            whileHover: 'hover',
            variants: cardHover,
          };
        default:
          return {};
      }
    };

    return (
      <MotionComponent
        ref={ref}
        className={cn(
          'transition-all duration-200 ease-out',
          !disabled && 'cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...getAnimationProps()}
        {...props}
      >
        {children}
      </MotionComponent>
    );
  }
);

Interactive.displayName = 'Interactive';

/**
 * A button with consistent hover and tap animations
 */
export const InteractiveButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
  }
>(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  fullWidth = false,
  ...props
}, ref) => {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <motion.button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      whileHover={!disabled && !isLoading ? { 
        scale: 1.03,
        transition: { type: 'spring', stiffness: 400, damping: 10 }
      } : undefined}
      whileTap={!disabled && !isLoading ? { 
        scale: 0.98,
        transition: { type: 'spring', stiffness: 400, damping: 10 }
      } : undefined}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center">
          <motion.span
            className="h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          {children}
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
});

InteractiveButton.displayName = 'InteractiveButton';

/**
 * A card with consistent hover and tap animations
 */
export const InteractiveCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hoverEffect?: 'elevate' | 'glow' | 'none';
  }
>(({ className, hoverEffect = 'elevate', ...props }, ref) => {
  const variants: Variants = {
    initial: { 
      y: 0, 
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
    },
    hover: hoverEffect === 'elevate' ? { 
      y: -4, 
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      transition: { type: 'spring', stiffness: 300, damping: 15 }
    } : {
      boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)',
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden',
        'transition-all duration-300 ease-out',
        hoverEffect !== 'none' && 'cursor-pointer',
        className
      )}
      initial="initial"
      whileHover={hoverEffect !== 'none' ? 'hover' : undefined}
      variants={hoverEffect !== 'none' ? variants : undefined}
      {...props}
    />
  );
});

InteractiveCard.displayName = 'InteractiveCard';

export default Interactive;
