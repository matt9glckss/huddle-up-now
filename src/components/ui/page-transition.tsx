import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

type PageTransitionProps = {
  children: ReactNode;
  className?: string;
};

export function PageTransition({ children, className }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { 
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
            when: 'beforeChildren',
            staggerChildren: 0.1
          },
        }}
        exit={{
          opacity: 0,
          y: -20,
          transition: { 
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
          },
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

export function FadeIn({ 
  children, 
  delay = 0, 
  className,
  as: Tag = 'div' 
}: FadeInProps) {
  const Component = motion[Tag as keyof typeof motion] as React.ComponentType<any>;
  
  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          delay,
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        },
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

type StaggerContainerProps = {
  children: ReactNode;
  className?: string;
  staggerChildren?: number;
  delayChildren?: number;
};

export function StaggerContainer({ 
  children, 
  className,
  staggerChildren = 0.1,
  delayChildren = 0.1
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

export function StaggerItem({ 
  children, 
  className,
  as: Tag = 'div' 
}: StaggerItemProps) {
  const Component = motion[Tag as keyof typeof motion] as React.ComponentType<any>;
  
  return (
    <Component
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </Component>
  );
}
