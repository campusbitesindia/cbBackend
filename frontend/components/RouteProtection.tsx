'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RouteProtectionProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export function RouteProtection({
  children,
  allowedRoles = [],
  requireAuth = true,
}: RouteProtectionProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/campus/register',
    '/auth/callback',
    '/forgot-password',
    '/verify-email',
    '/termsconditions',
    '/privacypolicy'
    
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    // If route doesn't require auth and it's a public route, allow access
    if (!requireAuth || isPublicRoute) {
      return;
    }

    // If user is not authenticated and route requires auth, redirect to login
    if (!isAuthenticated) {
      const currentPath = encodeURIComponent(pathname);
      router.push(`/login?redirect=${currentPath}`);
      return;
    }

    // Redirect campus partners away from student-only routes
    const studentOnlyRoutes = [
      '/profile',
      '/orders',
      '/quickbite',
      '/student/dashboard',
    ];
    if (
      user &&
      (user.role === 'campus' || user.role === 'canteen') &&
      studentOnlyRoutes.some((route) => pathname.startsWith(route))
    ) {
      router.push('/campus/dashboard');
      return;
    }

    // If user is authenticated but doesn't have required role
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user role
      switch (user.role) {
        case 'student':
          router.push('/student/dashboard');
          break;
        case 'campus':
        case 'canteen':
          router.push('/campus/dashboard');
          break;
        case 'admin':
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/');
          break;
      }
      return;
    }

    // Additional check: redirect authenticated users away from auth pages
    if (
      isAuthenticated &&
      (pathname === '/login' || pathname === '/register')
    ) {
      // Redirect based on user role
      switch (user?.role) {
        case 'student':
          router.push('/student/dashboard');
          break;
        case 'campus':
        case 'canteen':
          router.push('/campus/dashboard');
          break;
        case 'admin':
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/');
          break;
      }
      return;
    }
  }, [
    isAuthenticated,
    user,
    pathname,
    router,
    mounted,
    isLoading,
    allowedRoles,
    requireAuth,
    isPublicRoute,
  ]);

  // Show loading while checking authentication
  if (isLoading || !mounted) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  // If route requires auth but user is not authenticated, show nothing (will redirect)
  if (requireAuth && !isAuthenticated && !isPublicRoute) {
    return null;
  }

  // If user doesn't have required role, show nothing (will redirect)
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

// Convenience components for role-based routes
export function StudentOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteProtection allowedRoles={['student']}>{children}</RouteProtection>
  );
}

export function CampusOnlyRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteProtection allowedRoles={['campus', 'canteen']}>
      {children}
    </RouteProtection>
  );
}

export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  return <RouteProtection allowedRoles={['admin']}>{children}</RouteProtection>;
}
