import type { Variants, Transition } from 'framer-motion';

// ===========================================
// Page Transitions
// ===========================================

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const pageTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1], // Custom easing
};

// ===========================================
// Fade Animations
// ===========================================

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { opacity: 0, y: 20 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { opacity: 0 },
};

export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { opacity: 0, scale: 0.95 },
};

// ===========================================
// Hover & Interactive States
// ===========================================

export const scaleOnHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const cardHover: Variants = {
  initial: { y: 0, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' },
  hover: {
    y: -4,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

export const buttonPress = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: 'easeOut' },
};

// ===========================================
// Stagger Animations
// ===========================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

export const staggerItemScale: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// ===========================================
// Slide Animations
// ===========================================

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { opacity: 0, x: -30 },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { opacity: 0, x: 30 },
};

export const slideInBottom: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { opacity: 0, y: 30 },
};

// ===========================================
// Call Center Specific
// ===========================================

export const incomingCallShake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatDelay: 1,
    },
  },
};

export const pulseGlow: Variants = {
  initial: { scale: 1, boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.5)' },
  animate: {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 0 0 rgba(59, 130, 246, 0.5)',
      '0 0 0 10px rgba(59, 130, 246, 0)',
      '0 0 0 0 rgba(59, 130, 246, 0)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
    },
  },
};

export const statusDotPulse: Variants = {
  animate: {
    scale: [1, 1.3, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const liveIndicator: Variants = {
  animate: {
    scale: [1, 1.5, 1],
    opacity: [1, 0, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ===========================================
// Counter & Number Animations
// ===========================================

export const springCounter = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

export const counterAnimation: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.15, 1],
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const numberChange: Variants = {
  initial: { opacity: 0, y: -10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { opacity: 0, y: 10 },
};

// ===========================================
// Modal & Overlay Animations
// ===========================================

export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 }
  },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.15 }
  },
};

export const modalFormFields: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const modalFormField: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  },
};

// ===========================================
// Dropdown & Menu Animations
// ===========================================

export const dropdownVariants: Variants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.15 }
  },
};

export const menuItemVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
};

// ===========================================
// List & Table Animations
// ===========================================

export const listItemVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { opacity: 0, x: 20 },
};

export const tableRowVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { opacity: 0 },
};

// ===========================================
// Expand & Collapse
// ===========================================

export const expandVariants: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

// ===========================================
// Chart & Data Visualization
// ===========================================

export const chartReveal: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

export const barGrow: Variants = {
  initial: { scaleY: 0 },
  animate: {
    scaleY: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

export const lineDrawVariants: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1, ease: 'easeOut' }
  },
};

export const donutReveal: Variants = {
  initial: { rotate: -90, opacity: 0 },
  animate: {
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
};

// ===========================================
// Toast & Notification
// ===========================================

export const toastVariants: Variants = {
  initial: { opacity: 0, x: 50, scale: 0.95 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    }
  },
  exit: {
    opacity: 0,
    x: 50,
    scale: 0.95,
    transition: { duration: 0.2 }
  },
};

export const notificationBadge: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    }
  },
};

// ===========================================
// Success & Feedback
// ===========================================

export const successPop: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

export const checkmarkDraw: Variants = {
  initial: { pathLength: 0 },
  animate: {
    pathLength: 1,
    transition: { duration: 0.3, delay: 0.1 }
  },
};

export const errorShake: Variants = {
  animate: {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
};

// ===========================================
// Tab Transitions
// ===========================================

export const tabContent: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  },
};

export const tabIndicator: Variants = {
  initial: { scaleX: 0 },
  animate: {
    scaleX: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// ===========================================
// Heatmap & Grid
// ===========================================

export const heatmapPulse: Variants = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const gridItemReveal: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// ===========================================
// Skeleton & Loading
// ===========================================

export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spinnerRotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ===========================================
// Kanban & Drag
// ===========================================

export const kanbanCard: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { opacity: 0, scale: 0.95 },
};

export const dragIndicator: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// ===========================================
// Utility Transitions
// ===========================================

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

export const smoothTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
};

export const quickTransition: Transition = {
  duration: 0.15,
  ease: 'easeOut',
};

// ===========================================
// Enhanced Spring Configurations
// ===========================================

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 15,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

export const springStiff: Transition = {
  type: 'spring',
  stiffness: 600,
  damping: 35,
};

// ===========================================
// Premium Easing Curves
// ===========================================

export const easingSmooth = [0.4, 0, 0.2, 1];
export const easingEmphasized = [0.2, 0, 0, 1];
export const easingDecelerate = [0, 0, 0.2, 1];
export const easingAccelerate = [0.4, 0, 1, 1];

// ===========================================
// Scroll-Triggered Animations
// ===========================================

export const scrollReveal: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    }
  },
};

export const scrollRevealScale: Variants = {
  initial: { opacity: 0, y: 40, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }
  },
};

export const scrollRevealLeft: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }
  },
};

export const scrollRevealRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }
  },
};

// ===========================================
// Enhanced Card Animations
// ===========================================

export const cardRefined: Variants = {
  initial: {
    y: 0,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 8px 16px -8px rgba(0, 0, 0, 0.08)',
  },
  hover: {
    y: -4,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.04), 0 16px 32px -8px rgba(0, 0, 0, 0.12)',
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  tap: {
    y: -2,
    scale: 0.99,
    transition: {
      duration: 0.1,
    }
  },
};

export const cardFloat: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  },
};

// ===========================================
// Enhanced Button Animations
// ===========================================

export const buttonRipple: Variants = {
  initial: { scale: 0, opacity: 0.5 },
  animate: {
    scale: 4,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    }
  },
};

export const buttonGlow: Variants = {
  initial: {
    boxShadow: '0 0 0 0 rgba(139, 126, 255, 0)',
  },
  hover: {
    boxShadow: '0 0 20px 5px rgba(139, 126, 255, 0.3)',
    transition: {
      duration: 0.3,
    }
  },
};

export const buttonSuccess: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    }
  },
};

// ===========================================
// Enhanced Input Animations
// ===========================================

export const inputFocus: Variants = {
  initial: {
    boxShadow: '0 0 0 0 rgba(139, 126, 255, 0)',
  },
  focus: {
    boxShadow: '0 0 0 3px rgba(139, 126, 255, 0.15)',
    transition: {
      duration: 0.2,
    }
  },
};

export const floatingLabel: Variants = {
  initial: {
    y: 0,
    scale: 1,
    color: 'rgb(156, 163, 175)',
  },
  float: {
    y: -24,
    scale: 0.85,
    color: 'rgb(139, 126, 255)',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    }
  },
};

export const validationIcon: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    }
  },
};

// ===========================================
// Enhanced Data Visualization
// ===========================================

export const chartBarStagger: Variants = {
  initial: { scaleY: 0, opacity: 0 },
  animate: {
    scaleY: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    }
  },
};

export const chartLineReveal: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.5, ease: 'easeInOut' },
      opacity: { duration: 0.3 },
    }
  },
};

export const chartDonutSegment: Variants = {
  initial: { pathLength: 0 },
  animate: {
    pathLength: 1,
    transition: {
      duration: 1,
      ease: [0.4, 0, 0.2, 1],
    }
  },
};

export const metricPop: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    }
  },
};

export const trendArrow: Variants = {
  initial: { y: 10, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      delay: 0.2,
    }
  },
};

// ===========================================
// Enhanced Loading States
// ===========================================

export const shimmerWave: Variants = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    }
  },
};

export const pulseSubtle: Variants = {
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  },
};

export const loadingDots: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  },
};

// ===========================================
// Enhanced Feedback Animations
// ===========================================

export const successCheckmark: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        delay: 0.2,
        duration: 0.4,
        ease: 'easeOut',
      },
      opacity: { duration: 0.1 },
    }
  },
};

export const errorBounce: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    }
  },
};

export const warningPulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  },
};

// ===========================================
// Enhanced Table Animations
// ===========================================

export const tableRowEnter: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
    }
  },
};

export const tableSortIndicator: Variants = {
  initial: { opacity: 0, y: -5 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    }
  },
  exit: {
    opacity: 0,
    y: 5,
    transition: {
      duration: 0.15,
    }
  },
};

export const tableRowSelect: Variants = {
  initial: { backgroundColor: 'rgba(139, 126, 255, 0)' },
  selected: {
    backgroundColor: 'rgba(139, 126, 255, 0.08)',
    transition: {
      duration: 0.2,
    }
  },
};

// ===========================================
// Enhanced Navigation Animations
// ===========================================

export const navIndicator: Variants = {
  initial: { scaleY: 0, opacity: 0 },
  animate: {
    scaleY: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    }
  },
};

export const sidebarSlide: Variants = {
  initial: { x: -280, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  exit: {
    x: -280,
    opacity: 0,
    transition: {
      duration: 0.2,
    }
  },
};

export const breadcrumbItem: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
    }
  },
};

// ===========================================
// Enhanced Modal Animations
// ===========================================

export const modalSlideUp: Variants = {
  initial: { opacity: 0, y: 100 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    }
  },
  exit: {
    opacity: 0,
    y: 50,
    transition: {
      duration: 0.2,
    }
  },
};

export const drawerSlide: Variants = {
  initial: { x: '100%' },
  animate: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 35,
    }
  },
  exit: {
    x: '100%',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    }
  },
};

// ===========================================
// Stagger Configurations
// ===========================================

export const staggerContainerDelayed: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerContainerGrid: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// ===========================================
// Presence Animations
// ===========================================

export const presenceOnline: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    }
  },
};

export const presencePulse: Variants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  },
};

// ===========================================
// Micro-interactions
// ===========================================

export const hoverLift = {
  y: -2,
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const tapShrink = {
  scale: 0.95,
  transition: { duration: 0.1 },
};

export const focusGlow = {
  boxShadow: '0 0 0 3px rgba(139, 126, 255, 0.2)',
  transition: { duration: 0.15 },
};
