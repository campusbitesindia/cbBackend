'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  GraduationCap,
  User,
  MapPin,
} from 'lucide-react';
import Image from 'next/image';
import { getAllCampuses, Campus } from '@/services/campusService';
import { useAuth } from '@/context/auth-context';

const registerSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
    role: z.enum(['student', 'canteen'], {
      message: 'Please select a valid role',
    }),
    campus: z.string().min(1, { message: 'Please select a campus' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(true);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'canteen',
      campus: '',
    },
  });

  // Fetch campuses on component mount
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        setIsLoadingCampuses(true);
        const response = await getAllCampuses();
        setCampuses(response.campuses);
      } catch (error) {
        console.error('Error fetching campuses:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load campuses. Please refresh the page.',
        });
      } finally {
        setIsLoadingCampuses(false);
      }
    };

    fetchCampuses();
  }, [toast]);

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        campus: values.campus,
      });

      toast({
        title: 'Account created! 🎉',
        description:
          'Welcome to Campus Bites! You can now start managing your canteen.',
      });

      // Redirect based on role
      if (values.role === 'student') {
        router.push('/student/dashboard');
      } else if (values.role === 'canteen') {
        router.push('/campus/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message || 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center relative overflow-hidden'>
      {/* Background Elements */}
      <div className='absolute inset-0'>
        <div className='absolute top-20 left-20 w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center animate-float'>
          <span className='text-2xl'>🎓</span>
        </div>
        <div className='absolute top-40 right-32 w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center animate-float-delayed'>
          <span className='text-xl'>📚</span>
        </div>
        <div className='absolute bottom-32 left-16 w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center animate-bounce-slow'>
          <span className='text-xl'>🍕</span>
        </div>

        <div className='absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-full blur-2xl animate-pulse delay-1000'></div>
      </div>

      <div className='flex w-full max-w-6xl mx-auto relative z-10'>
        {/* Left Side - Branding */}
        <div className='hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative'>
          <div className='text-center animate-slide-in-left'>
            <div className='mb-12'>
              <div className='w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle shadow-2xl'>
                <Image
                  src='/placeholder.svg?height=80&width=80'
                  alt='Campus Bites Logo'
                  width={80}
                  height={80}
                  className='rounded-full'
                />
              </div>
              <h1 className='text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3'>
                Join Campus Bites
              </h1>
              <p className='text-gray-400 text-lg'>
                Start your food journey today
              </p>
            </div>

            <div className='space-y-8'>
              <div className='flex items-center gap-6 text-left group hover:scale-105 transition-transform duration-300'>
                <div className='w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg'>
                  <GraduationCap className='w-8 h-8 text-white' />
                </div>
                <div>
                  <h3 className='text-white font-bold text-lg'>
                    Student Perks
                  </h3>
                  <p className='text-gray-400'>Special discounts and offers</p>
                </div>
              </div>

              <div className='flex items-center gap-6 text-left group hover:scale-105 transition-transform duration-300'>
                <div className='w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg'>
                  <span className='text-2xl'>⚡</span>
                </div>
                <div>
                  <h3 className='text-white font-bold text-lg'>
                    Fast Delivery
                  </h3>
                  <p className='text-gray-400'>
                    Get food delivered in 15 minutes
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-6 text-left group hover:scale-105 transition-transform duration-300'>
                <div className='w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg'>
                  <span className='text-2xl'>🍽️</span>
                </div>
                <div>
                  <h3 className='text-white font-bold text-lg'>Quality Food</h3>
                  <p className='text-gray-400'>
                    From the best campus restaurants
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
          <div className='w-full max-w-md'>
            <div className='bg-gray-800/30 backdrop-blur-2xl border border-gray-700/30 rounded-3xl p-10 shadow-2xl animate-slide-in-right'>
              <div className='text-center mb-10'>
                <h2 className='text-4xl font-bold text-white mb-3'>
                  Create Account
                </h2>
                <p className='text-gray-400 text-lg'>
                  Already have an account?{' '}
                  <Link
                    href='/login'
                    className='text-blue-400 hover:text-blue-300 font-semibold transition-colors hover:underline'>
                    Sign in here
                  </Link>
                </p>
              </div>

              {/* Google Registration for Students */}
              <div className='mb-8'>
                <a
                  href='http://localhost:8080/api/auth/google?role=student'
                  className='block w-full'>
                  <Button
                    type='button'
                    className='w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg border-2 border-transparent hover:border-blue-200'>
                    <svg className='mr-3 h-6 w-6' viewBox='0 0 48 48'>
                      <path
                        fill='#FFC107'
                        d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
                  c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
                  s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'
                      />
                      <path
                        fill='#FF3D00'
                        d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
                  C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'
                      />
                      <path
                        fill='#4CAF50'
                        d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
                  c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'
                      />
                      <path
                        fill='#1976D2'
                        d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238
                  C43.021,36.697,44,34.0,44,30C44,22.659,43.862,21.35,43.611,20.083z'
                      />
                    </svg>
                    Sign up with Google
                  </Button>
                </a>

                <div className='relative my-6'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-gray-600'></div>
                  </div>
                  <div className='relative flex justify-center text-sm'>
                    <span className='bg-gray-800 px-4 text-gray-400'>
                      Or create account with email
                    </span>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-300 text-lg font-semibold'>
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <User className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                            <Input
                              placeholder='Enter your full name'
                              className='pl-12 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-12 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
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
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-300 text-lg font-semibold'>
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                            <Input
                              placeholder='Enter your email'
                              type='email'
                              autoComplete='email'
                              className='pl-12 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-12 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
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
                    name='role'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-300 text-lg font-semibold'>
                          Role
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className='bg-gray-700/50 border-gray-600 text-white rounded-xl h-12 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'>
                              <SelectValue placeholder='Select your role' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='bg-gray-800 border-gray-600'>
                            <SelectItem
                              value='canteen'
                              className='text-white hover:bg-gray-700'>
                              Canteen Owner
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className='text-red-400' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='campus'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-300 text-lg font-semibold'>
                          Select Campus
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoadingCampuses}>
                          <FormControl>
                            <SelectTrigger className='bg-gray-700/50 border-gray-600 text-white rounded-xl h-12 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'>
                              <SelectValue
                                placeholder={
                                  isLoadingCampuses
                                    ? 'Loading campuses...'
                                    : 'Select your campus'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='bg-gray-800 border-gray-600 max-h-60'>
                            {campuses.map((campus) => (
                              <SelectItem
                                key={campus._id}
                                value={campus._id}
                                className='text-white hover:bg-gray-700'>
                                <div className='flex items-center gap-2'>
                                  <MapPin className='w-4 h-4' />
                                  <span>{campus.name}</span>
                                  {campus.city && (
                                    <span className='text-gray-400 text-sm'>
                                      ({campus.city})
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className='text-red-400' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-300 text-lg font-semibold'>
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                            <Input
                              placeholder='Create a password'
                              type={showPassword ? 'text' : 'password'}
                              autoComplete='new-password'
                              className='pl-12 pr-12 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-12 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                              {...field}
                            />
                            <button
                              type='button'
                              onClick={() => setShowPassword(!showPassword)}
                              className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors'>
                              {showPassword ? (
                                <EyeOff className='w-5 h-5' />
                              ) : (
                                <Eye className='w-5 h-5' />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className='text-red-400' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-gray-300 text-lg font-semibold'>
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                            <Input
                              placeholder='Confirm your password'
                              type={showConfirmPassword ? 'text' : 'password'}
                              autoComplete='new-password'
                              className='pl-12 pr-12 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-12 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                              {...field}
                            />
                            <button
                              type='button'
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors'>
                              {showConfirmPassword ? (
                                <EyeOff className='w-5 h-5' />
                              ) : (
                                <Eye className='w-5 h-5' />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className='text-red-400' />
                      </FormItem>
                    )}
                  />

                  <Button
                    type='submit'
                    disabled={isLoading || isLoadingCampuses}
                    className='w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg text-lg group disabled:opacity-50 disabled:cursor-not-allowed'>
                    {isLoading ? (
                      <div className='flex items-center gap-3'>
                        <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                        Creating Account...
                      </div>
                    ) : (
                      <div className='flex items-center gap-3'>
                        Create Account
                        <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
