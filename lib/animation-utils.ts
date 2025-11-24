/**
 * Animation Utilities
 * Reusable animation configurations and helpers for consistent animations across the app
 */

import { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

/**
 * Predefined spring animation configurations
 */
export const SpringPresets = {
  /** Gentle, smooth spring animation */
  gentle: {
    damping: 20,
    stiffness: 90,
    mass: 1,
  } as WithSpringConfig,
  
  /** Bouncy, playful spring animation */
  bouncy: {
    damping: 8,
    stiffness: 100,
    mass: 0.8,
  } as WithSpringConfig,
  
  /** Stiff, responsive spring animation */
  stiff: {
    damping: 10,
    stiffness: 200,
    mass: 0.5,
  } as WithSpringConfig,
  
  /** Quick, snappy spring animation for buttons */
  quick: {
    damping: 15,
    stiffness: 150,
    mass: 0.6,
  } as WithSpringConfig,
};

/**
 * Predefined timing animation durations (in milliseconds)
 */
export const TimingPresets = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

/**
 * Predefined timing animation configurations
 */
export const TimingConfigs = {
  fast: {
    duration: TimingPresets.fast,
  } as WithTimingConfig,
  
  normal: {
    duration: TimingPresets.normal,
  } as WithTimingConfig,
  
  slow: {
    duration: TimingPresets.slow,
  } as WithTimingConfig,
};

/**
 * Calculate staggered delay for list animations
 * @param index - Item index in the list
 * @param baseDelay - Base delay between items (default: 50ms)
 * @returns Calculated delay in milliseconds
 */
export const getStaggerDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay;
};

/**
 * Animation scale values for press interactions
 */
export const PressScaleValues = {
  subtle: 0.98,
  normal: 0.96,
  strong: 0.94,
} as const;

/**
 * Common easing functions
 */
export const EasingPresets = {
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
} as const;
