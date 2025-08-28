import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98] active:shadow-inner",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98] active:shadow-inner",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent/50 hover:text-accent-foreground active:scale-[0.98] active:shadow-inner",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:scale-[0.98] active:shadow-inner",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline active:scale-[0.98]",
        gradient: "bg-gradient-primary text-primary-foreground shadow-lg hover:shadow-glow active:scale-[0.98] transition-all duration-300",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 active:scale-[0.98] transition-all duration-200",
        modern: "bg-card/80 backdrop-blur-sm border border-border/50 text-foreground hover:bg-card hover:border-primary/30 hover:shadow-md active:scale-[0.98] transition-all duration-300"
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 px-3 text-xs rounded-md",
        lg: "h-11 px-8 text-base rounded-xl", 
        xl: "h-14 px-10 text-lg rounded-2xl",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full"
      },
      isLoading: {
        true: "relative text-transparent hover:text-transparent cursor-wait"
      }
    },
    compoundVariants: [
      {
        variant: ["default", "destructive", "secondary", "gradient", "glass", "modern"],
        className: "shadow-sm"
      },
      {
        variant: ["outline", "ghost"],
        className: "shadow-none"
      },
      {
        isLoading: true,
        className: "[&>*]:invisible"
      }
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      isLoading: false
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const showLoader = loading
    const showLeftIcon = leftIcon && !showLoader
    const showRightIcon = rightIcon && !showLoader
    
    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant, 
            size, 
            className,
            isLoading: showLoader,
          })
        )}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {showLoader && (
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText && <span>{loadingText}</span>}
          </div>
        )}
        
        {!showLoader && showLeftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        
        {children}
        
        {!showLoader && showRightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
