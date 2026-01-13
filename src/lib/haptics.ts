/**
 * Haptic feedback utilities for mobile devices
 * Provides tactile feedback for better UX on mobile
 */
export const haptics = {
  /**
   * Light haptic feedback (10ms)
   * Use for: Button taps, menu interactions
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium haptic feedback (20ms)
   * Use for: Important actions, confirmations
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  /**
   * Heavy haptic feedback (30ms)
   * Use for: Critical actions, errors
   */
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },

  /**
   * Success pattern haptic feedback
   * Use for: Successful operations, confirmations
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },

  /**
   * Error pattern haptic feedback
   * Use for: Errors, failures, warnings
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 50, 30]);
    }
  },
};
