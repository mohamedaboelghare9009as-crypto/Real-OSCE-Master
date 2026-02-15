/**
 * Animation utility library for Simulation Session UI
 * Optimized for medical education context with 300-400ms durations
 * and reduced motion support for accessibility
 */

import { Variants, Transition, Spring, Easing } from 'framer-motion';

// ============================================================================
// DURATION CONSTANTS
// ============================================================================

export const DURATIONS = {
  /** Instant feedback - 150ms */
  instant: 0.15,
  /** Quick feedback - 200ms */
  quick: 0.2,
  /** Standard transition - 300ms */
  standard: 0.3,
  /** Emphasis transition - 350ms */
  emphasis: 0.35,
  /** Relaxed transition - 400ms */
  relaxed: 0.4,
  /** Complex animations - 500ms */
  complex: 0.5,
  /** Stagger delay between items - 50ms */
  stagger: 0.05,
  /** Long stagger delay - 75ms */
  staggerLong: 0.075,
} as const;

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

export const EASINGS: Record<string, Easing> = {
  /** Standard ease-in-out for most transitions */
  standard: [0.4, 0, 0.2, 1],
  /** Entering elements - decelerate */
  enter: [0, 0, 0.2, 1],
  /** Exiting elements - accelerate */
  exit: [0.4, 0, 1, 1],
  /** Bouncy effect for emphasis */
  bouncy: [0.68, -0.55, 0.265, 1.55],
  /** Smooth deceleration */
  decelerate: [0, 0, 0.2, 1],
  /** Smooth acceleration */
  accelerate: [0.4, 0, 1, 1],
  /** Material Design standard */
  material: [0.4, 0, 0.2, 1],
} as const;

// ============================================================================
// SPRING CONFIGURATIONS
// ============================================================================

export const SPRINGS = {
  /** Gentle spring for subtle bounces */
  gentle: {
    stiffness: 120,
    damping: 14,
    mass: 1,
  },
  /** Snappy spring for quick responses */
  snappy: {
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  },
  /** Soft spring for smooth movements */
  soft: {
    stiffness: 100,
    damping: 20,
    mass: 1,
  },
  /** Bouncy spring for playful elements */
  bouncy: {
    stiffness: 300,
    damping: 10,
    mass: 1,
  },
  /** Stiff spring for precise movements */
  stiff: {
    stiffness: 500,
    damping: 50,
    mass: 1,
  },
} as const;

// ============================================================================
// STANDARD TRANSITION PRESETS
// ============================================================================

export const TRANSITIONS: Record<string, Transition> = {
  /** Standard fade transition */
  fade: {
    duration: DURATIONS.standard,
    ease: EASINGS.standard,
  },
  /** Quick fade for rapid feedback */
  fadeQuick: {
    duration: DURATIONS.quick,
    ease: EASINGS.standard,
  },
  /** Emphasis fade for important elements */
  fadeEmphasis: {
    duration: DURATIONS.emphasis,
    ease: EASINGS.standard,
  },
  /** Scale transition with fade */
  scale: {
    duration: DURATIONS.standard,
    ease: EASINGS.standard,
  },
  /** Slide transition */
  slide: {
    duration: DURATIONS.standard,
    ease: EASINGS.standard,
  },
  /** Layout transition for position changes */
  layout: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  },
} as const;

// ============================================================================
// PAGE/STAGE TRANSITION VARIANTS
// ============================================================================

/**
 * Fade transition with scale - ideal for stage changes
 */
export const fadeScaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: DURATIONS.standard,
      ease: EASINGS.standard,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -8,
    transition: {
      duration: DURATIONS.standard,
      ease: EASINGS.standard,
    },
  },
};

/**
 * Slide transition variants - direction aware
 */
export const slideVariants = {
  /** Slide from right to left (forward navigation) */
  slideRight: {
    initial: { opacity: 0, x: 40 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: DURATIONS.standard, ease: EASINGS.standard },
    },
    exit: {
      opacity: 0,
      x: -40,
      transition: { duration: DURATIONS.standard, ease: EASINGS.standard },
    },
  } as Variants,

  /** Slide from left to right (backward navigation) */
  slideLeft: {
    initial: { opacity: 0, x: -40 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: DURATIONS.standard, ease: EASINGS.standard },
    },
    exit: {
      opacity: 0,
      x: 40,
      transition: { duration: DURATIONS.standard, ease: EASINGS.standard },
    },
  } as Variants,

  /** Slide up from bottom */
  slideUp: {
    initial: { opacity: 0, y: 40 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATIONS.standard, ease: EASINGS.standard },
    },
    exit: {
      opacity: 0,
      y: -40,
      transition: { duration: DURATIONS.standard, ease: EASINGS.standard },
    },
  } as Variants,

  /** Slide down from top */
  slideDown: {
    initial: { opacity: 0, y: -40 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATIONS.standard, ease: EASINGS.standard },
    },
    exit: {
      opacity: 0,
      y: 40,
      transition: { duration: DURATIONS.standard, ease: EASINGS.standard },
    },
  } as Variants,
};

/**
 * Stage transition for History → Examination → Investigations → Management
 * Uses directional slide based on stage order
 */
export const stageTransitionVariants = {
  History: slideVariants.slideRight,
  Examination: slideVariants.slideRight,
  Investigations: slideVariants.slideRight,
  Management: slideVariants.slideRight,
} as const;

// ============================================================================
// MESSAGE/TRANSCRIPT VARIANTS
// ============================================================================

/**
 * Individual message animation variants
 */
export const messageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATIONS.quick,
      ease: EASINGS.enter,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: DURATIONS.instant,
      ease: EASINGS.exit,
    },
  },
};

/**
 * Message variants with slide based on role
 */
export const messageSlideVariants = {
  user: {
    initial: { opacity: 0, x: 20, scale: 0.98 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: DURATIONS.quick, ease: EASINGS.enter },
    },
    exit: {
      opacity: 0,
      x: 10,
      transition: { duration: DURATIONS.instant, ease: EASINGS.exit },
    },
  } as Variants,
  model: {
    initial: { opacity: 0, x: -20, scale: 0.98 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: DURATIONS.quick, ease: EASINGS.enter },
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: { duration: DURATIONS.instant, ease: EASINGS.exit },
    },
  } as Variants,
  nurse: {
    initial: { opacity: 0, x: -20, scale: 0.98, y: 5 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      y: 0,
      transition: { duration: DURATIONS.quick, ease: EASINGS.enter },
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: { duration: DURATIONS.instant, ease: EASINGS.exit },
    },
  } as Variants,
};

/**
 * Container for staggered message animations
 */
export const messageContainerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: DURATIONS.stagger,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: DURATIONS.stagger,
      staggerDirection: -1,
    },
  },
};

// ============================================================================
// CARD/CONTENT VARIANTS
// ============================================================================

/**
 * Card entrance animation with subtle scale
 */
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.97,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATIONS.standard,
      ease: EASINGS.standard,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: DURATIONS.quick,
      ease: EASINGS.exit,
    },
  },
  hover: {
    y: -2,
    scale: 1.01,
    transition: {
      duration: DURATIONS.instant,
      ease: EASINGS.standard,
    },
  },
};

/**
 * Staggered card container for grids and lists
 */
export const cardContainerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: DURATIONS.staggerLong,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: DURATIONS.stagger,
      staggerDirection: -1,
    },
  },
};

/**
 * Investigation card variants with abnormal state emphasis
 */
export const investigationCardVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: DURATIONS.standard,
      ease: EASINGS.enter,
    },
  },
  abnormal: {
    scale: [1, 1.02, 1],
    transition: {
      duration: DURATIONS.complex,
      ease: EASINGS.bouncy,
      times: [0, 0.5, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: DURATIONS.quick,
      ease: EASINGS.exit,
    },
  },
};

// ============================================================================
// LOADING STATE VARIANTS
// ============================================================================

/**
 * Loading spinner/pulse animation
 */
export const loadingPulseVariants: Variants = {
  initial: {
    opacity: 0.4,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

/**
 * Thinking indicator animation
 */
export const thinkingDotsVariants: Variants = {
  initial: {
    opacity: 0,
    y: 5,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export const thinkingDotVariants: Variants = {
  initial: {
    opacity: 0.3,
    y: 0,
  },
  animate: {
    opacity: [0.3, 1, 0.3],
    y: [0, -4, 0],
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

/**
 * Skeleton loading animation
 */
export const skeletonVariants: Variants = {
  initial: {
    opacity: 0.4,
    backgroundPosition: '-200% 0',
  },
  animate: {
    opacity: 0.7,
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

// ============================================================================
// UI FEEDBACK VARIANTS
// ============================================================================

/**
 * Button press feedback
 */
export const buttonTapVariants: Variants = {
  initial: { scale: 1 },
  tap: { scale: 0.97 },
  hover: { scale: 1.02 },
};

/**
 * Status indicator animation
 */
export const statusPulseVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  animate: {
    scale: [1, 1.15, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

/**
 * Microphone listening animation
 */
export const listeningWaveVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 0.5,
  },
  animate: {
    scale: [1, 1.3, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

// ============================================================================
// REDUCED MOTION SUPPORT
// ============================================================================

/**
 * Checks if user prefers reduced motion
 * @returns {boolean}
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Returns transition based on motion preference
 * @param transition - The normal transition
 * @returns Transition object respecting reduced motion
 */
export const getAccessibleTransition = (transition: Transition): Transition => {
  if (prefersReducedMotion()) {
    return {
      ...transition,
      duration: 0.01,
    };
  }
  return transition;
};

/**
 * No-animation variants for accessibility
 */
export const reducedMotionVariants: Variants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create custom stagger delay based on index
 * @param index - Item index
 * @param baseDelay - Base delay in seconds (default: 0.05)
 * @returns Delay in seconds
 */
export const getStaggerDelay = (index: number, baseDelay: number = 0.05): number => {
  return index * baseDelay;
};

/**
 * Create direction-aware slide variants
 * @param direction - 'forward' | 'backward'
 * @returns Variants object
 */
export const getDirectionalSlide = (
  direction: 'forward' | 'backward'
): Variants => {
  return direction === 'forward'
    ? slideVariants.slideRight
    : slideVariants.slideLeft;
};

/**
 * Create emphasis animation for important elements
 * @returns Variants object
 */
export const createEmphasisVariants = (): Variants => ({
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: DURATIONS.emphasis,
      ease: EASINGS.bouncy,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: DURATIONS.standard,
      ease: EASINGS.exit,
    },
  },
});
