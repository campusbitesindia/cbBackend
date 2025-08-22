// Performance monitoring utilities
import { useEffect, useLayoutEffect } from 'react';

export class PerformanceMonitor {
  private static timers = new Map<string, number>();
  private static metrics = new Map<string, number[]>();

  // Start timing an operation
  static startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  // End timing and log result
  static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer '${label}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    // Store metric
    const existing = this.metrics.get(label) || [];
    existing.push(duration);
    this.metrics.set(label, existing);

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  // Get average time for a metric
  static getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  // Get all metrics
  static getAllMetrics(): Record<
    string,
    { average: number; count: number; latest: number }
  > {
    const result: Record<
      string,
      { average: number; count: number; latest: number }
    > = {};

    for (const [label, times] of this.metrics.entries()) {
      if (times.length > 0) {
        result[label] = {
          average: times.reduce((sum, time) => sum + time, 0) / times.length,
          count: times.length,
          latest: times[times.length - 1],
        };
      }
    }

    return result;
  }

  // Clear all metrics
  static clearMetrics(): void {
    this.metrics.clear();
    this.timers.clear();
  }

  // Log performance summary
  static logSummary(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const metrics = this.getAllMetrics();
    console.group('📊 Performance Summary');

    for (const [label, data] of Object.entries(metrics)) {
      console.log(
        `${label}: avg ${data.average.toFixed(2)}ms (${data.count} calls)`
      );
    }

    console.groupEnd();
  }
}

// Decorator for timing function execution
export function timed(label?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const timerLabel = label || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      PerformanceMonitor.startTimer(timerLabel);
      const result = originalMethod.apply(this, args);

      if (result instanceof Promise) {
        return result.finally(() => {
          PerformanceMonitor.endTimer(timerLabel);
        });
      } else {
        PerformanceMonitor.endTimer(timerLabel);
        return result;
      }
    };

    return descriptor;
  };
}

// Hook for measuring component render time
export function useRenderTime(componentName: string) {
  useEffect(() => {
    PerformanceMonitor.endTimer(`${componentName}-render`);
  });

  useLayoutEffect(() => {
    PerformanceMonitor.startTimer(`${componentName}-render`);
  });
}

// Debounce utility for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for frequent events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memory usage monitoring
export function logMemoryUsage(label: string = 'Memory Usage'): void {
  if (process.env.NODE_ENV !== 'development') return;

  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log(`🧠 ${label}:`, {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`,
    });
  }
}
