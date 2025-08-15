'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Star,
  Truck,
  Heart,
  GraduationCap,
  ArrowRight,
  Utensils,
  Users,
  Smile,
  Search,
  ShoppingCart,
  MapPin,
  Clock,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { motion } from 'framer-motion';

// Counter with animation
interface CounterProps {
  to: number;
  isPlus?: boolean;
  suffix?: string;
}

const Counter = ({ to, isPlus = false, suffix = '' }: CounterProps) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = to;
    const duration = 1500;
    const stepTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [to]);

  return (
    <span>
      {count}
      {isPlus && '+'}
      {suffix}
    </span>
  );
};

export default function LandingPageClient() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'canteen' && pathname === '/') {
      router.push('/campus/dashboard');
    }
  }, [user?.role, pathname, router]);

  const features = [
    {
      icon: <Heart className='w-10 h-10 text-red-600' />,
      title: 'Curated for You',
      description:
        'Discover exclusive deals and combos from your favorite campus canteens.',
    },
    {
      icon: <Truck className='w-10 h-10 text-red-600' />,
      title: 'Real-Time Tracking',
      description:
        'Know exactly where your order is, from the kitchen to your doorstep.',
    },
    {
      icon: <GraduationCap className='w-10 h-10 text-red-600' />,
      title: 'Student-Friendly Prices',
      description:
        "Enjoy delicious meals that won't break the bank. Pocket-friendly is our promise.",
    },
  ];

  return (
    <div
      className='min-h-screen bg-white text-gray-900 dark:bg-[#0a192f] dark:text-white transition-all duration-500'
      style={{
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}>
      {/* Hero Section */}
      <section className='relative min-h-[80vh] flex items-center justify-center bg-white dark:bg-[#0a192f]'>
        <div className='container mx-auto px-4 py-20 relative z-10'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            {/* Left Content */}
            <div className='text-center lg:text-left'>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className='inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-full px-4 py-2 mb-6'>
                <Star className='w-5 h-5 text-red-600' />
                <span className='text-red-600 font-medium'>
                  #1 Campus Food Ordering
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className='text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8'>
                <span className='block text-gray-900 dark:text-white'>
                  Ready for the
                </span>
                <span className='block bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent'>
                  Feast Fest?
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className='text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-xl mx-auto lg:mx-0'>
                Don't let hunger slow you down. Get your favorite meals
                delivered fast,
                <span className='text-red-600 font-semibold'> 24/7</span>, right
                on your fingertips.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12'>
                <Button
                  asChild
                  size='lg'
                  className='bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 text-lg rounded-full transition-all duration-300'>
                  <Link href='/menu'>
                    Order Now <ArrowRight className='w-5 h-5 ml-2' />
                  </Link>
                </Button>

                <Button
                  asChild
                  size='lg'
                  variant='outline'
                  className='border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-700 dark:hover:text-white font-semibold px-8 py-6 text-lg rounded-full transition-all duration-300'>
                  <Link href='#demo'>
                    <span className='mr-2'>▶</span>
                    Watch Demo
                  </Link>
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className='flex flex-wrap justify-center lg:justify-start gap-8 mt-6'>
                {[
                  {
                    icon: Utensils,
                    value: 100,
                    plus: true,
                    label: 'Restaurants',
                  },
                  { icon: Users, value: 1, suffix: 'k+', label: 'Customers' },
                  {
                    icon: Smile,
                    value: 98,
                    suffix: '%',
                    label: 'Satisfaction',
                  },
                ].map((stat, i) => (
                  <div key={i} className='flex flex-col items-center'>
                    <div className='bg-red-100 p-4 rounded-full mb-2'>
                      <stat.icon className='w-6 h-6 text-red-600' />
                    </div>
                    <span className='text-4xl font-extrabold text-gray-900 dark:text-white'>
                      <Counter
                        to={stat.value}
                        isPlus={stat.plus}
                        suffix={stat.suffix}
                      />
                    </span>
                    <p className='text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide mt-1'>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Content - Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className='hidden lg:flex items-center justify-center'>
              <div className='relative w-96 h-96'>
                <div className='absolute top-1/2 left-1/2 w-44 h-44 animated-bg rounded-full shadow-2xl'>
                  <div
                    className='absolute top-1/2 left-1/2 text-7xl font-black text-white select-none'
                    style={{ transform: 'translate(-50%, -50%)' }}>
                    CB
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-28 bg-gray-100 dark:bg-gray-900 transition-colors duration-500'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl font-bold mb-4 text-gray-900 dark:text-white'>
              Why <span className='text-red-600'>CampusBites</span>?
            </h2>
            <p className='text-gray-700 dark:text-gray-400 max-w-2xl mx-auto'>
              We're not just another food app. We're built by students, for
              students, with features that matter to you.
            </p>
          </div>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
                }}
                className='bg-white p-8 rounded-2xl border border-gray-200 transition-all duration-300 dark:bg-gray-800 dark:border-gray-700'>
                <div className='flex items-center justify-center bg-red-100 rounded-full w-20 h-20 mb-6'>
                  {feature.icon}
                </div>
                <h3 className='text-2xl font-bold mb-3 text-gray-900 dark:text-white'>
                  {feature.title}
                </h3>
                <p className='text-gray-700 dark:text-gray-400'>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className='relative py-24 transition-colors duration-500 overflow-hidden'>
        {/* Background image */}
        <div
          className='absolute inset-0 bg-cover bg-center filter blur-sm opacity-40'
          style={{ backgroundImage: "url('/canteen-bg.jpg')" }}></div>

        {/* Gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/90'></div>

        <div className='relative container mx-auto px-4'>
          <h2 className='text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white'>
            Get Started in <span className='text-red-600'>3 Easy Steps</span>
          </h2>

          <div className='relative space-y-12 justify-center'>
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className='bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg hover:shadow-xl transition-all p-8 md:grid md:grid-cols-2 md:gap-12 items-center backdrop-blur-sm'>
              <div className='text-center md:text-left'>
                <h3 className='text-3xl font-bold mb-3 text-red-600'>
                  1. Browse & Select
                </h3>
                <p className='text-gray-700 dark:text-gray-300'>
                  Explore menus from all campus canteens in one place. Find your
                  favorite dish or try something new!
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
  initial={{ opacity: 0, x: 50 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
  className='bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg hover:shadow-xl transition-all p-8 md:grid md:grid-cols-2 md:gap-12 items-center backdrop-blur-sm'
>
  <div className='text-center md:text-left'>
    <h3 className='text-3xl font-bold mb-3 text-red-600'>
      2. Place Your Order
    </h3>
    <p className='text-gray-700 dark:text-gray-300'>
      Add items to your cart, choose your payment method, and
      confirm your order in a few taps.
    </p>
  </div>
</motion.div>



            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className='bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg hover:shadow-xl transition-all p-8 md:grid md:grid-cols-2 md:gap-12 items-center backdrop-blur-sm'>
              <div className='text-center md:text-left'>
                <h3 className='text-3xl font-bold mb-3 text-red-600'>
                  3. Track & Enjoy
                </h3>
                <p className='text-gray-700 dark:text-gray-300'>
                  Follow your order in real-time and get notified when it's
                  arriving. Hot and fresh, right at your door!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CSS for animated background */}
      <style jsx global>{`
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animated-bg {
          background: linear-gradient(
            -45deg,
            #ff4b2b,
            #ff416c,
            #ff4b2b,
            #ff416c
          );
          background-size: 400% 400%;
          animation: gradientMove 15s ease infinite;
        }
      `}</style>
    </div>
  );
}
