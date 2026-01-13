/**
 * PREMIUM DESIGN SYSTEM
 * Single Source of Truth for All Design Decisions
 *
 * This design system ensures consistency, beauty, and functionality
 * across the entire Ghana Emergency Response Platform.
 */

// PREMIUM COLOR PALETTE

export const colors = {
  // Primary - Emergency Red (Action, Urgency)
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Main red
    600: '#dc2626',  // Emergency red
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Secondary - Trust Blue (Professional, Reliable)
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Success - Life Saved Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Main green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning - Attention Orange
  warning: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // Main orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Neutral - Professional Gray
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Dark Mode - Command Center
  dark: {
    bg: '#0f172a',      // Deep navy
    surface: '#1e293b', // Card background
    border: '#334155',  // Borders
    text: '#f8fafc',    // Primary text
    textMuted: '#94a3b8', // Secondary text
  },
};

// TYPOGRAPHY SYSTEM

export const typography = {
  fonts: {
    sans: 'var(--font-inter)',
    mono: 'var(--font-mono)',
  },

  sizes: {
    // Display (Hero headings)
    display: {
      xl: '4.5rem',   // 72px
      lg: '3.75rem',  // 60px
      md: '3rem',     // 48px
      sm: '2.25rem',  // 36px
    },

    // Headings
    heading: {
      xl: '2rem',     // 32px
      lg: '1.5rem',  // 24px
      md: '1.25rem',  // 20px
      sm: '1.125rem', // 18px
      xs: '1rem',     // 16px
    },

    // Body
    body: {
      lg: '1.125rem', // 18px
      md: '1rem',     // 16px
      sm: '0.875rem', // 14px
      xs: '0.75rem',  // 12px
    },
  },

  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },

  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// SPACING SYSTEM (8px base)

export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
};

// SHADOWS (Depth hierarchy)

export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Colored shadows for emphasis
  primary: '0 10px 25px -5px rgba(239, 68, 68, 0.3)',
  success: '0 10px 25px -5px rgba(34, 197, 94, 0.3)',

  // Glow effects
  glow: '0 0 20px rgba(59, 130, 246, 0.5)',
  glowRed: '0 0 20px rgba(239, 68, 68, 0.5)',
};

// BORDER RADIUS

export const radius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',  // Circular
};

// TRANSITIONS

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',

  // Spring animations
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// Z-INDEX LAYERS

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  notification: 1070,
};

// BREAKPOINTS

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};
