import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardHover, hoverTap, subtleGlow } from '@/lib/animations';

type MotionComponentProps = HTMLMotionProps<'div'> & {
  [key: string]: any;
};

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hoverEffect?: 'elevate' | 'glow' | 'scale' | 'none';
    borderEffect?: boolean;
    as?: keyof JSX.IntrinsicElements;
  }
>(({ className, hoverEffect = 'elevate', borderEffect = false, as: Component = 'div', ...props }, ref) => {
  const motionProps = React.useMemo(() => {
    if (hoverEffect === 'elevate') {
      return {
        initial: 'initial',
        whileHover: 'hover',
        variants: cardHover,
      };
    } else if (hoverEffect === 'glow') {
      return {
        initial: 'initial',
        whileHover: 'hover',
        variants: subtleGlow,
      };
    } else if (hoverEffect === 'scale') {
      return {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
      };
    }
    return {};
  }, [hoverEffect]);

  const MotionComponent = Component === 'div' 
    ? motion.div 
    : motion[Component as keyof typeof motion] as React.ComponentType<MotionComponentProps>;

  return (
    <MotionComponent
      ref={ref}
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden',
        'transition-all duration-300 ease-out',
        borderEffect && 'border-border/50 hover:border-primary/50',
        hoverEffect !== 'none' && 'cursor-pointer',
        className
      )}
      {...motionProps}
      {...props}
    >
      {props.children}
    </MotionComponent>
  );
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
>(({ className, as: Tag = 'h3', ...props }, ref) => (
  <Tag
    ref={ref as any}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
