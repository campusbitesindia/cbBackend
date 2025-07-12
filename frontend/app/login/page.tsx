'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Users,
  GraduationCap,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['student', 'campus'], { message: 'Please select your role' }),
});

type UserRole = 'student' | 'campus';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: undefined,
    },
  });

  const selectedRole = form.watch('role');

  // Handle OAuth token from URL and show session expiration message
  useEffect(() => {
    const token = searchParams.get('token');
    const redirect = searchParams.get('redirect');
    const message = searchParams.get('message');

    if (message) {
      toast({
        variant: 'destructive',
        title: 'Session Expired',
        description: message,
      });
    }

    if (token) {
      loginWithToken(token);
      // Clean up URL and navigate
      if (redirect) {
        router.replace(redirect);
      } else {
        router.replace('/');
      }
    }
  }, [searchParams, loginWithToken, router, toast]);

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      const { token, user1 } = await response.json();
      localStorage.setItem('userDetails', JSON.stringify(user1));
      loginWithToken(token);

      toast({
        title: 'Welcome back! 🎉',
        description: `Successfully logged in as ${values.role}`,
      });

      // Role-based routing
      switch (values.role) {
        case 'student':
          router.push('/student/dashboard');
          break;
        case 'campus':
          router.push('/campus/dashboard');
          break;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description:
          error instanceof Error
            ? error.message
            : 'Please check your credentials and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student':
        return <GraduationCap className='w-5 h-5' />;
      case 'campus':
        return <Users className='w-5 h-5' />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'student':
        return 'from-blue-500 to-purple-600';
      case 'campus':
        return 'from-green-500 to-emerald-600';
    }
  };

  return (
    <div
      suppressHydrationWarning
      className='min-h-screen bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#0f172a] flex items-center justify-center relative overflow-hidden'>
      {/* Professional Navy Background */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {/* Animated Background Elements */}
        <div className='absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000'></div>
        <div className='absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse delay-2000'></div>

        {/* Floating Food Icons */}
        <div className='absolute top-20 left-20 w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center animate-float'>
          <span className='text-2xl'>🍕</span>
        </div>
        <div className='absolute top-40 right-32 w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center animate-float-delayed'>
          <span className='text-xl'>🍔</span>
        </div>
        <div className='absolute bottom-32 left-16 w-14 h-14 bg-yellow-500/10 rounded-full flex items-center justify-center animate-bounce-slow'>
          <span className='text-xl'>🌮</span>
        </div>
      </div>

      <div className='flex w-full max-w-7xl mx-auto relative z-10'>
        {/* Left Side - Enhanced Branding */}
        <div className='hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative'>
          <div className='text-center animate-slide-in-left'>
            {/* Logo with Enhanced Animation */}
            <div className='mb-12'>
              <div className='relative'>
                <div className='w-32 h-32 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle shadow-2xl relative overflow-hidden'>
                  <div className='absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-spin-slow opacity-20'></div>
                  <Image
                    src='/placeholder.svg?height=80&width=80'
                    alt='Campus Bites Logo'
                    width={80}
                    height={80}
                    className='rounded-full relative z-10'
                  />
                </div>
                {/* Orbiting Elements */}
                <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-4 h-4 bg-yellow-400 rounded-full animate-orbit'></div>
                <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 w-3 h-3 bg-green-400 rounded-full animate-orbit-reverse'></div>
              </div>
              <h1 className='text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent mb-3'>
                Campus Bites
              </h1>
              <p className='text-gray-400 text-lg'>
                Your premium campus food experience
              </p>
            </div>

            {/* Role-Based Features */}
            <div className='space-y-8'>
              <div className='flex items-center gap-6 text-left group hover:scale-105 transition-transform duration-300'>
                <div className='w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25'>
                  <GraduationCap className='w-8 h-8 text-white' />
                </div>
                <div>
                  <h3 className='text-white font-bold text-lg'>Students</h3>
                  <p className='text-gray-400'>
                    Order your favorite meals instantly
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-6 text-left group hover:scale-105 transition-transform duration-300'>
                <div className='w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25'>
                  <Users className='w-8 h-8 text-white' />
                </div>
                <div>
                  <h3 className='text-white font-bold text-lg'>
                    Campus Partners
                  </h3>
                  <p className='text-gray-400'>
                    Manage your restaurant & orders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Enhanced Login Form */}
        <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
          <div className='w-full max-w-md'>
            <div className='bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 shadow-2xl animate-slide-in-right relative overflow-hidden'>
              {/* Animated Background Pattern */}
              <div className='absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5 rounded-3xl'></div>

              <div className='relative z-10'>
                <div className='text-center mb-10'>
                  <h2 className='text-4xl font-bold text-white mb-3'>
                    Welcome Back!
                  </h2>
                  <p className='text-slate-300 text-lg'>
                    New to Campus Bites?{' '}
                    <Link
                      href='/register'
                      className='text-red-400 hover:text-red-300 font-semibold transition-colors hover:underline'>
                      Join us here
                    </Link>
                  </p>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-8'>
                    {/* Role Selection */}
                    <FormField
                      control={form.control}
                      name='role'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-slate-300 text-lg font-semibold'>
                            I am a
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger
                                suppressHydrationWarning
                                className='bg-white/10 border-white/20 text-white rounded-xl h-14 text-lg focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm'>
                                <SelectValue placeholder='Select your role' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className='bg-slate-800/90 backdrop-blur-xl border-white/20'>
                              <SelectItem
                                value='student'
                                className='text-white hover:bg-gray-700 cursor-pointer'>
                                <div className='flex items-center gap-3'>
                                  <GraduationCap className='w-5 h-5 text-blue-400' />
                                  <span>Student</span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                value='campus'
                                className='text-white hover:bg-gray-700 cursor-pointer'>
                                <div className='flex items-center gap-3'>
                                  <Users className='w-5 h-5 text-green-400' />
                                  <span>Campus Partner</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-slate-300 text-lg font-semibold'>
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6' />
                              <Input
                                suppressHydrationWarning
                                placeholder='Enter your email'
                                type='email'
                                autoComplete='email'
                                className='pl-12 bg-white/10 border-white/20 text-white placeholder-slate-400 rounded-xl h-14 text-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all backdrop-blur-sm'
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className='text-red-400' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='password'
                      render={({ field }) => (
                        <FormItem>
                          <div className='flex items-center justify-between'>
                            <FormLabel className='text-slate-300 text-lg font-semibold'>
                              Password
                            </FormLabel>
                            <Link
                              href='/forgot-password'
                              className='text-sm text-red-400 hover:text-red-300 transition-colors hover:underline'>
                              Forgot password?
                            </Link>
                          </div>
                          <FormControl>
                            <div className='relative'>
                              <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6' />
                              <Input
                                suppressHydrationWarning
                                placeholder='Enter your password'
                                type={showPassword ? 'text' : 'password'}
                                autoComplete='current-password'
                                className='pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder-slate-400 rounded-xl h-14 text-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all backdrop-blur-sm'
                                {...field}
                              />
                              <button
                                suppressHydrationWarning
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors'>
                                {showPassword ? (
                                  <EyeOff className='w-6 h-6' />
                                ) : (
                                  <Eye className='w-6 h-6' />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className='text-red-400' />
                        </FormItem>
                      )}
                    />

                    <Button
                      suppressHydrationWarning
                      type='submit'
                      disabled={isLoading}
                      className={`w-full ${
                        selectedRole
                          ? `bg-gradient-to-r ${getRoleColor(selectedRole)}`
                          : 'bg-gradient-to-r from-red-500 to-rose-500'
                      } hover:scale-105 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg text-lg group`}>
                      {isLoading ? (
                        <div className='flex items-center gap-3'>
                          <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                          Signing in...
                        </div>
                      ) : (
                        <div className='flex items-center gap-3'>
                          {selectedRole && getRoleIcon(selectedRole)}
                          Sign In
                          <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>

                {/* Role-Specific Login Options */}
                {selectedRole === 'student' && (
                  <>
                    <div className='relative my-6'>
                      <div className='absolute inset-0 flex items-center'>
                        <span className='w-full border-t border-white/20' />
                      </div>
                      <div className='relative flex justify-center text-xs uppercase'>
                        <span className='bg-white/10 backdrop-blur-xl px-2 text-slate-400'>
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      suppressHydrationWarning
                      type='button'
                      variant='outline'
                      className='w-full bg-white/10 border-white/20 hover:bg-white/20 text-white rounded-xl h-14 text-lg backdrop-blur-sm transition-all'
                      onClick={() =>
                        (window.location.href =
                          'http://localhost:8080/api/auth/google')
                      }>
                      <svg className='w-6 h-6 mr-3' viewBox='0 0 48 48'>
                        <path
                          fill='#FFC107'
                          d='M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 12.04C34.553 7.784 29.577 5 24 5C13.522 5 5 13.522 5 24s8.522 19 19 19s19-8.522 19-19c0-1.332-.136-2.626-.389-3.917z'
                        />
                        <path
                          fill='#FF3D00'
                          d='M6.306 14.691c-1.321 2.355-2.071 5.12-2.071 8.003s.75 5.648 2.071 8.003l-5.362 4.152C1.528 31.979 0 28.182 0 24s1.528-7.979 4.02-11.832L6.306 14.691z'
                        />
                        <path
                          fill='#4CAF50'
                          d='M24 44c5.166 0 9.773-1.789 13.04-4.788l-5.362-4.152c-1.921 1.284-4.322 2.04-6.914 2.04c-5.022 0-9.284-3.473-10.825-8.125l-5.378 4.162C8.751 39.528 15.827 44 24 44z'
                        />
                        <path
                          fill='#1976D2'
                          d='M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.16-4.082 5.584l5.362 4.152c3.354-3.109 5.419-7.587 5.419-12.735c0-1.332-.136-2.626-.389-3.917z'
                        />
                      </svg>
                      Sign in with Google
                    </Button>
                  </>
                )}

                {/* Campus Registration CTA */}
                <div className='mt-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl'>
                  <div className='text-center'>
                    <h3 className='text-white font-semibold mb-2'>
                      Want to partner with us?
                    </h3>
                    <p className='text-gray-400 text-sm mb-4'>
                      Join as a campus restaurant partner
                    </p>
                    <Button
                      suppressHydrationWarning
                      asChild
                      variant='outline'
                      className='border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300 transition-all duration-300 bg-transparent'>
                      <Link href='/campus/register'>
                        Register Your Restaurant
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
