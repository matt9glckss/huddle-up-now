import { Variants } from 'framer-motion';

export const fadeIn = (direction: 'up' | 'down' | 'left' | 'right' = 'up', delay = 0): Variants => ({
  hidden: {
    y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
    x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
    opacity: 0,
  },
  show: {
    y: 0,
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
      delay,
    },
  },
  exit: {
    y: direction === 'up' ? -20 : direction === 'down' ? 20 : 0,
    x: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
    opacity: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
});

export const scaleIn = (scale = 0.9, delay = 0): Variants => ({
  hidden: {
    scale,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 100,
      delay,
    },
  },
  exit: {
    scale,
    opacity: 0,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 100,
    },
  },
});

export const slideIn = (direction: 'top' | 'bottom' | 'left' | 'right') => {
  const distance = 20;
  return {
    hidden: {
      [direction === 'left' || direction === 'right' ? 'x' : 'y']:
        direction === 'left' || direction === 'top' ? -distance : distance,
      opacity: 0,
    },
    show: {
      [direction === 'left' || direction === 'right' ? 'x' : 'y']: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };
};

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0.1): Variants => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const hoverTap = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export const hoverTapLift = {
  hover: { y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
  tap: { y: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
};

export const whileHover = {
  scale: 1.02,
  transition: { type: 'spring', stiffness: 300, damping: 15 },
};

export const whileTap = {
  scale: 0.98,
  transition: { type: 'spring', stiffness: 300, damping: 15 },
};

export const cardHover = {
  initial: { y: 0, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' },
  hover: {
    y: -4,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    transition: { type: 'spring', stiffness: 300, damping: 15 },
  },
};

export const textVariant = (delay = 0) => ({
  hidden: {
    y: 20,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      duration: 1.25,
      delay,
    },
  },
});

export const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const fadeInDown = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const fadeInLeft = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const fadeInRight = {
  hidden: { x: 20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export const springTransition = {
  type: 'spring',
  damping: 20,
  stiffness: 100,
};

export const quickSpring = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

export const gentleSpring = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
};

export const microInteractions = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', stiffness: 400, damping: 10 },
};

export const subtleGlow = {
  initial: { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)' },
  hover: {
    boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.1)',
    transition: { duration: 0.3 },
  },
};

export const rotate = {
  hidden: { rotate: -10, opacity: 0 },
  visible: {
    rotate: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 100,
    },
  },
};

export const staggerText = (staggerChildren = 0.1) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren,
    },
  },
});

export const letterAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 100,
    },
  },
};
