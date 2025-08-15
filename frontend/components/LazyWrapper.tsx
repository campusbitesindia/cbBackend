'use client';

import React, {
  Suspense,
  lazy,
  ComponentType,
  ErrorInfo,
  Component,
} from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

// Generic loading component
const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <div className='flex items-center justify-center py-8'>
    <div className='flex flex-col items-center gap-3'>
      <Loader2 className='h-8 w-8 animate-spin text-red-500' />
      <p className='text-sm text-gray-600 dark:text-gray-400'>{message}</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({
  message = 'Failed to load component',
}: {
  message?: string;
}) => (
  <div className='flex items-center justify-center py-8'>
    <div className='flex flex-col items-center gap-3'>
      <AlertCircle className='h-8 w-8 text-red-500' />
      <p className='text-sm text-red-600 dark:text-red-400'>{message}</p>
      <button
        onClick={() => window.location.reload()}
        className='text-xs text-blue-600 hover:text-blue-800 underline'>
        Reload page
      </button>
    </div>
  </div>
);

// Error boundary for lazy components
class LazyErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback />;
    }

    return this.props.children;
  }
}

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<P = {}>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode,
  errorFallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: P) {
    return (
      <LazyErrorBoundary fallback={errorFallback}>
        <Suspense fallback={fallback || <LoadingSpinner />}>
          <LazyComponent {...(props as any)} />
        </Suspense>
      </LazyErrorBoundary>
    );
  };
}

// Specific lazy-loaded components for heavy features
export const LazyItemReviewSelector = withLazyLoading(
  () => import('@/components/ItemReviewSelector'),
  <LoadingSpinner message='Loading review selector...' />
);

// Simple lazy loading for common use cases
export function createLazyComponent<P = {}>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallbackMessage?: string
) {
  return withLazyLoading(
    importFunc,
    <LoadingSpinner message={fallbackMessage} />
  );
}

// Example usage for future components
// export const LazyOrderDetailsDialog = createLazyComponent(
//   () => import('@/components/OrderDetailsDialog'),
//   'Loading order details...'
// );

// Utility for lazy loading with error boundary
export function createLazyComponentWithFallback<P = {}>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallbackComponent: ComponentType<P>,
  fallbackMessage?: string
) {
  return withLazyLoading(
    () =>
      importFunc().catch(() => Promise.resolve({ default: fallbackComponent })),
    <LoadingSpinner message={fallbackMessage} />
  );
}
