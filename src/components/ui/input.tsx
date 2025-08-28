import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  variant?: 'default' | 'filled' | 'outline' | 'underline';
  size?: InputSize;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    leftIcon,
    rightIcon,
    containerClassName,
    labelClassName,
    errorClassName,
    variant = 'outline',
    size = 'md',
    fullWidth = false,
    id,
    placeholder,
    value,
    onFocus,
    onBlur,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const inputId = id || React.useId();

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Size classes
    const sizeClasses = {
      sm: 'h-8 text-xs px-2.5 py-1.5',
      md: 'h-10 text-sm px-3 py-2',
      lg: 'h-12 text-base px-4 py-3',
    }[size];

    // Variant classes
    const variantClasses = {
      default: 'bg-background border border-input hover:border-primary/50',
      filled: 'bg-muted/50 border border-transparent hover:bg-muted/70',
      outline: 'bg-transparent border border-input hover:border-primary/50',
      underline: 'bg-transparent border-b border-input rounded-none hover:border-primary/50',
    }[variant];

    const focusClasses = isFocused 
      ? 'ring-2 ring-ring/30 ring-offset-2 ring-offset-background border-primary/70 outline-none'
      : '';

    const errorClasses = error 
      ? 'border-destructive/70 hover:border-destructive/90 focus:border-destructive/90 focus:ring-destructive/20'
      : '';

    const inputClasses = cn(
      'flex w-full rounded-md font-medium ring-offset-background transition-colors',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-muted-foreground/60',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'transition-all duration-200 ease-in-out',
      variantClasses,
      sizeClasses,
      focusClasses,
      errorClasses,
      {
        'pl-10': leftIcon,
        'pr-10': rightIcon,
        'w-full': fullWidth,
      },
      className
    );

    return (
      <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-3 px-1 -top-2.5 bg-background text-xs font-medium text-foreground/80 transition-all duration-200',
              'peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:top-2.5',
              'peer-placeholder-shown:left-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:font-normal',
              isFocused && 'text-primary',
              error && 'text-destructive',
              size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs',
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center justify-center text-muted-foreground">
              {React.cloneElement(leftIcon as React.ReactElement, {
                className: cn(
                  'h-4 w-4',
                  isFocused && 'text-primary',
                  error && 'text-destructive',
                  (leftIcon as React.ReactElement).props.className
                ),
              })}
            </div>
          )}
          
          <motion.input
            type={type}
            id={inputId}
            ref={ref}
            className={inputClasses}
            placeholder={placeholder}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 flex items-center justify-center text-muted-foreground">
              {React.cloneElement(rightIcon as React.ReactElement, {
                className: cn(
                  'h-4 w-4',
                  isFocused && 'text-primary',
                  error && 'text-destructive',
                  (rightIcon as React.ReactElement).props.className
                ),
              })}
            </div>
          )}
        </div>
        
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-1.5 text-xs text-destructive',
              errorClassName
            )}
          >
            {error}
          </motion.p>
        )}
        
        {/* Animated underline for underline variant */}
        {variant === 'underline' && (
          <motion.div 
            className="absolute bottom-0 left-0 h-0.5 bg-primary origin-left"
            initial={{ scaleX: 0 }}
            animate={{ 
              scaleX: isFocused ? 1 : 0,
              backgroundColor: error ? 'hsl(0, 84.2%, 60.2%)' : 'hsl(221.2, 83.2%, 53.3%)'
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          />
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
