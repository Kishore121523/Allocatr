// lib/animation-config.ts

import { gsap } from 'gsap';

export const ANIMATION_CONFIG = {
  // Page transition animations only - slower and smoother animation when navigating between pages
  pageTransitions: {
    enabled: true, // Enable page transitions
    duration: 0.4, // Longer, smoother duration
    ease: "power2.out", // Smoother, more pronounced easing
    stagger: 0.12, // More noticeable stagger between elements
    delay: 0.1, // Slight delay for better effect
    transform: {
      x: -25, // More noticeable slide movement
      opacity: 0 // Start from complete transparency for smoother fade
    }
  },
  
  // Component animations (always enabled - not affected by page transition setting)
  components: {
    enabled: true, // Keep component animations working
    tabs: {
      duration: 0.3,
      ease: "power2.out"
    },
    collapse: {
      duration: 0.3,
      ease: "power2.out"
    },
    hover: {
      duration: 0.2,
      scale: 1.05
    }
  }
};

// Helper function to check if PAGE TRANSITIONS should run (only affects page entrance animations)
export const shouldAnimatePageTransitions = () => {
  return ANIMATION_CONFIG.pageTransitions.enabled;
};

// Helper function to check if component animations should run (always true)
export const shouldAnimateComponents = () => {
  return ANIMATION_CONFIG.components.enabled;
};

// Helper function to run GSAP animation only if page transitions are enabled
export const conditionalPageGsap = {
  set: (targets: any, vars: any) => {
    if (!shouldAnimatePageTransitions()) return;
    return gsap.set(targets, vars);
  },
  
  to: (targets: any, vars: any) => {
    if (!shouldAnimatePageTransitions()) return;
    return gsap.to(targets, vars);
  },
  
  fromTo: (targets: any, fromVars: any, toVars: any) => {
    if (!shouldAnimatePageTransitions()) return;
    return gsap.fromTo(targets, fromVars, toVars);
  },
  
  timeline: () => {
    if (!shouldAnimatePageTransitions()) {
      // Return a chainable mock timeline object when animations are disabled
      const mockTimeline = {
        to: () => mockTimeline,
        set: () => mockTimeline,
        fromTo: () => mockTimeline,
        delay: () => mockTimeline,
        duration: () => mockTimeline
      };
      return mockTimeline;
    }
    return gsap.timeline();
  }
};

// Export gsap for component animations (always work)
export { gsap };
