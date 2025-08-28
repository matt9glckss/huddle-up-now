import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { motion, Transition } from "framer-motion"

const spinnerVariants = cva(
  "text-muted-foreground animate-spin",
  {
    variants: {
      size: {
        default: "h-5 w-5",
        sm: "h-4 w-4",
        lg: "h-6 w-6",
        xl: "h-8 w-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string
}

export function Spinner({ className, size }: SpinnerProps) {
  return (
    <Loader2 className={cn(spinnerVariants({ size, className }))} />
  )
}

const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const loadingDotVariants = {
  start: {
    y: "0%",
  },
  end: {
    y: "100%",
  },
}

const loadingDotTransition: Transition = {
  duration: 0.5,
  repeat: Infinity,
  repeatType: "reverse",
  ease: "easeInOut",
}

interface LoadingDotsProps {
  className?: string
  dotClassName?: string
  count?: number
}

export function LoadingDots({
  className,
  dotClassName,
  count = 3,
}: LoadingDotsProps) {
  return (
    <motion.div
      className={cn("flex items-center justify-center gap-1.5", className)}
      variants={loadingContainerVariants}
      initial="start"
      animate="end"
    >
      {[...Array(count)].map((_, i) => (
        <motion.span
          key={i}
          className={cn(
            "h-2 w-2 rounded-full bg-muted-foreground/50",
            dotClassName
          )}
          variants={loadingDotVariants}
          transition={loadingDotTransition}
        />
      ))}
    </motion.div>
  )
}

const skeletonVariants = cva(
  "animate-pulse rounded-md bg-muted",
  {
    variants: {
      variant: {
        default: "h-4 w-full",
        text: "h-4 w-full rounded",
        circle: "rounded-full h-10 w-10",
        rect: "h-24 w-full rounded-lg",
        avatar: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface SkeletonProps extends VariantProps<typeof skeletonVariants> {
  className?: string
}

export function Skeleton({ className, variant }: SkeletonProps) {
  return (
    <div className={cn(skeletonVariants({ variant, className }))} />
  )
}

interface PageLoaderProps {
  className?: string
  text?: string
  showSpinner?: boolean
  showDots?: boolean
}

export function PageLoader({
  className,
  text = "Loading...",
  showSpinner = true,
  showDots = false,
}: PageLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 p-8", className)}>
      {showSpinner && (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop",
          }}
          className="text-primary"
        >
          <Spinner size="xl" />
        </motion.div>
      )}
      
      {showDots ? (
        <LoadingDots className="mt-4" />
      ) : (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

export function ContentLoader({
  className,
  rows = 3,
}: {
  className?: string
  rows?: number
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function ButtonLoading() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Spinner size="sm" />
      <span>Loading...</span>
    </div>
  )
}

export function CardLoading({
  className,
  withImage = false,
}: {
  className?: string
  withImage?: boolean
}) {
  return (
    <div className={cn("space-y-4 p-4", className)}>
      {withImage && <Skeleton variant="rect" className="h-40 w-full" />}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-6 w-3/4" />
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-5/6" />
        <Skeleton variant="text" className="h-4 w-4/6" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="text" className="h-4 w-20" />
        <Skeleton variant="text" className="h-8 w-24 rounded-full" />
      </div>
    </div>
  )
}
