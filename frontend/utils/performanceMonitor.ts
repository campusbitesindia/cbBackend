// Performance monitoring utilities for development
import React from 'react';

export const measurePerformance = (name: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  } else {
    fn();
  }
};

export const measureAsyncPerformance = async (
  name: string,
  fn: () => Promise<any>
) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  } else {
    return await fn();
  }
};

// Component render tracking
export const useRenderCount = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    const renderCount = React.useRef(0);
    renderCount.current += 1;
    console.log(`${componentName} rendered ${renderCount.current} times`);
  }
};

// Bundle size analyzer helper
export const logBundleInfo = () => {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Log performance metrics
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      console.log('Page Load Performance:', {
        'DOM Content Loaded':
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        'Load Complete': navigation.loadEventEnd - navigation.loadEventStart,
        'Total Load Time': navigation.loadEventEnd - navigation.fetchStart,
      });
    });
  }
};
