'use client';

import { useEffect, useRef, FC } from 'react';
import Link from 'next/link';
import {
  motion,
  useInView,
  animate,
  Variants,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Star,
  Zap,
  Truck,
  Heart,
  GraduationCap,
  Search,
  ArrowRight,
  Utensils,
  Users,
  Smile,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

interface CounterProps {
  to: number;
  isPlus?: boolean;
  suffix?: string;
}

const Counter: FC<CounterProps> = ({ to, isPlus = false, suffix = '' }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inViewRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(inViewRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView && nodeRef.current) {
      const node = nodeRef.current;
      const controls = animate(0, to, {
        duration: 2,
        ease: 'easeOut',
        onUpdate(value) {
          if (node) {
            node.textContent = String(Math.round(value));
          }
        },
      });
      return () => controls.stop();
    }
  }, [isInView, to]);

  return (
    <span ref={inViewRef}>
      <span ref={nodeRef}>0</span>
      {isPlus && '+'}
      {suffix}
    </span>
  );
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function LandingPageClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const pathname = usePathname();
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);
  const router = useRouter();
  const { user } = useAuth();
  console.log(user);
  const handleMouseMove = (event: React.MouseEvent) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      mouseX.set(event.clientX - rect.left - rect.width / 2);
      mouseY.set(event.clientY - rect.top - rect.height / 2);
    }
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    if (user?.role === 'canteen' && pathname === '/') {
      router.push('/campus/dashboard');
    }
  }, [user?.role, pathname, router]);

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-[#0a192f] dark:via-[#1e3a5f] dark:to-[#0f172a] text-gray-900 dark:text-white overflow-hidden transition-all duration-500'
      suppressHydrationWarning>
      {/* Professional Hero Section */}
      <motion.section
        className='relative min-h-screen flex items-center justify-center overflow-hidden'
        initial='hidden'
        animate='visible'
        variants={sectionVariants}
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: '1000px' }}>
        {/* Subtle Animated Background */}
        <div className='absolute inset-0 z-0'>
          {/* Light mode background */}
          <div className='absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/50 to-purple-50/30 dark:opacity-0 opacity-100 transition-opacity duration-500'></div>
          {/* Dark mode background */}
          <div className='absolute inset-0 bg-gradient-to-br from-[#0a192f]/50 via-[#1e3a5f]/30 to-[#0f172a]/50 opacity-0 dark:opacity-100 transition-opacity duration-500'></div>

          {/* Light mode floating elements */}
          <div className='absolute top-0 left-0 w-96 h-96 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl animate-pulse transition-colors duration-500'></div>
          <div className='absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-red-500/10 rounded-full blur-3xl animate-pulse transition-colors duration-500'></div>
          <div className='absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 dark:bg-white/5 rounded-full blur-2xl animate-pulse transition-colors duration-500'></div>

          {/* Floating burger moved farther right so it doesn't collide with hero copy */}
          <motion.div
            className='absolute top-16 right-[26%] text-5xl opacity-80 hidden xl:block'
            style={{ textShadow: '0 0 15px rgba(255, 165, 0, 0.4)' }}
            animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}>
            🍔
          </motion.div>
          <motion.div
            className='absolute bottom-1/4 right-1/4 text-5xl hidden lg:block'
            style={{ textShadow: '0 0 15px rgba(255, 215, 0, 0.5)' }}
            animate={{ y: [0, 20, 0], rotate: [0, 15, -15, 0] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}>
            🍕
          </motion.div>
        </div>

        <div className='container mx-auto px-4 py-20 relative z-10'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            {/* Left Content */}
            <div className='text-center lg:text-left'>
              <motion.div
                className='inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 mb-6'
                variants={itemVariants}>
                <Star className='w-5 h-5 text-red-400' />
                <span className='text-red-400 dark:text-red-300 font-medium'>
                  #1 Campus Food Delivery
                </span>
              </motion.div>

              <motion.h1
                className='text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8'
                variants={itemVariants}>
                <span className='block text-gray-900 dark:text-white'>
                  Ready for the
                </span>
                <span className='block bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent'>
                  Feast Fest?
                </span>
              </motion.h1>

              <motion.p
                className='text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0'
                variants={itemVariants}>
                Don't let hunger slow you down. Get your favorite meals
                delivered fast,
                <span className='text-red-500 dark:text-red-400 font-semibold'>
                  {' '}
                  24/7
                </span>
                , right to your hostel room.
              </motion.p>

              <motion.div
                className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12'
                variants={itemVariants}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    size='lg'
                    className='bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 text-lg rounded-full shadow-lg shadow-red-500/20 transition-all duration-300'>
                    <Link href='/menu'>
                      Order Now <ArrowRight className='w-5 h-5 ml-2' />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  <Button
                    asChild
                    size='lg'
                    variant='outline'
                    className='border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 hover:text-red-700 dark:hover:text-white backdrop-blur-sm font-semibold px-8 py-6 text-lg rounded-full transition-all duration-300'>
                    <Link href='#demo'>
                      <span className='mr-2 play-icon'>▶</span>
                      Watch Demo
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* ------------------------------------------------- */
              /*  Stats / Analytics Strip                       */
              /* ------------------------------------------------- */}
              <motion.div
                className='flex flex-wrap justify-center lg:justify-start gap-8 mt-6'
                variants={itemVariants}>
                {/* Restaurants */}
                <motion.div
                  variants={itemVariants}
                  className='flex flex-col items-center'>
                  <div className='bg-red-500/20 p-4 rounded-full mb-2'>
                    <Utensils className='w-6 h-6 text-red-400' />
                  </div>
                  <span className='text-4xl font-extrabold text-gray-900 dark:text-white'>
                    <Counter to={100} isPlus />
                  </span>
                  <p className='text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide mt-1'>
                    Restaurants
                  </p>
                </motion.div>

                {/* Happy Customers */}
                <motion.div
                  variants={itemVariants}
                  className='flex flex-col items-center'>
                  <div className='bg-red-500/20 p-4 rounded-full mb-2'>
                    <Users className='w-6 h-6 text-red-400' />
                  </div>
                  <span className='text-4xl font-extrabold text-gray-900 dark:text-white'>
                    <Counter to={1} suffix='k+' />
                  </span>
                  <p className='text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide mt-1'>
                    Customers
                  </p>
                </motion.div>

                {/* Satisfaction */}
                <motion.div
                  variants={itemVariants}
                  className='flex flex-col items-center'>
                  <div className='bg-red-500/20 p-4 rounded-full mb-2'>
                    <Smile className='w-6 h-6 text-red-400' />
                  </div>
                  <span className='text-4xl font-extrabold text-gray-900 dark:text-white'>
                    <Counter to={98} suffix='%' />
                  </span>
                  <p className='text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide mt-1'>
                    Satisfaction
                  </p>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Content - CB Logo */}
            <motion.div
              className='relative hidden lg:flex items-center justify-center'
              style={{ rotateX, rotateY }}>
              <div
                className='relative w-96 h-96'
                style={{ transformStyle: 'preserve-3d' }}>
                {/* CB Logo with Enhanced Glowing Effect */}
                <motion.div
                  className='absolute top-1/2 left-1/2 w-44 h-44 bg-gradient-to-br from-red-600 via-rose-600 to-red-700 rounded-full shadow-2xl'
                  style={{
                    x: '-50%',
                    y: '-50%',
                    transform: 'translateZ(50px)',
                    zIndex: 10,
                  }}
                  animate={{
                    scale: [1, 1.08, 1],
                    boxShadow: [
                      '0 0 30px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.4)',
                      '0 0 50px rgba(239, 68, 68, 0.8), 0 0 100px rgba(239, 68, 68, 0.6)',
                      '0 0 70px rgba(239, 68, 68, 1), 0 0 140px rgba(239, 68, 68, 0.8)',
                      '0 0 50px rgba(239, 68, 68, 0.8), 0 0 100px rgba(239, 68, 68, 0.6)',
                      '0 0 30px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.4)',
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}>
                  <div className='absolute inset-0 rounded-full opacity-30 bg-black' />
                  <motion.div
                    className='absolute top-1/2 left-1/2 text-7xl font-black text-white select-none'
                    style={{ x: '-50%', y: '-50%', zIndex: 20 }}
                    animate={{
                      textShadow: [
                        '0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(255, 255, 255, 0.6)',
                        '0 0 30px rgba(255, 255, 255, 1), 0 0 60px rgba(255, 255, 255, 0.8)',
                        '0 0 40px rgba(255, 255, 255, 0.9), 0 0 80px rgba(255, 255, 255, 0.6)',
                        '0 0 30px rgba(255, 255, 255, 1), 0 0 60px rgba(255, 255, 255, 0.8)',
                        '0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(255, 255, 255, 0.6)',
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}>
                    CB
                  </motion.div>
                </motion.div>

                {/* Orbiting Food Items */}
                {/* First Ring - Closer orbit */}
                <motion.div
                  className='absolute w-full h-full'
                  style={{ transform: 'translateZ(20px)' }}
                  animate={{ rotate: 360 }}
                  transition={{
                    ease: 'linear',
                    duration: 10,
                    repeat: Infinity,
                  }}>
                  <motion.div
                    className='absolute top-1/2 left-1/2'
                    style={{ x: '-50%', y: '-50%' }}
                    animate={{
                      rotate: -360,
                      x: '10rem',
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 10,
                      ease: 'linear',
                    }}>
                    <span className='text-4xl drop-shadow-lg'>🍔</span>
                  </motion.div>
                </motion.div>

                <motion.div
                  className='absolute w-full h-full'
                  style={{ transform: 'translateZ(20px)' }}
                  animate={{ rotate: 360 }}
                  transition={{
                    ease: 'linear',
                    duration: 10,
                    repeat: Infinity,
                    delay: 2.5,
                  }}>
                  <motion.div
                    className='absolute top-1/2 left-1/2'
                    style={{ x: '-50%', y: '-50%' }}
                    animate={{
                      rotate: -360,
                      x: '10rem',
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 10,
                      ease: 'linear',
                      delay: 2.5,
                    }}>
                    <span className='text-4xl drop-shadow-lg'>🍕</span>
                  </motion.div>
                </motion.div>

                <motion.div
                  className='absolute w-full h-full'
                  style={{ transform: 'translateZ(20px)' }}
                  animate={{ rotate: 360 }}
                  transition={{
                    ease: 'linear',
                    duration: 10,
                    repeat: Infinity,
                    delay: 5,
                  }}>
                  <motion.div
                    className='absolute top-1/2 left-1/2'
                    style={{ x: '-50%', y: '-50%' }}
                    animate={{
                      rotate: -360,
                      x: '10rem',
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 10,
                      ease: 'linear',
                      delay: 5,
                    }}>
                    <span className='text-4xl drop-shadow-lg'>🌮</span>
                  </motion.div>
                </motion.div>

                <motion.div
                  className='absolute w-full h-full'
                  style={{ transform: 'translateZ(20px)' }}
                  animate={{ rotate: 360 }}
                  transition={{
                    ease: 'linear',
                    duration: 10,
                    repeat: Infinity,
                    delay: 7.5,
                  }}>
                  <motion.div
                    className='absolute top-1/2 left-1/2'
                    style={{ x: '-50%', y: '-50%' }}
                    animate={{
                      rotate: -360,
                      x: '10rem',
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 10,
                      ease: 'linear',
                      delay: 7.5,
                    }}>
                    <span className='text-4xl drop-shadow-lg'>🍜</span>
                  </motion.div>
                </motion.div>

                {/* Second Ring - Farther orbit */}
                <motion.div
                  className='absolute w-full h-full'
                  style={{ transform: 'translateZ(-10px)' }}
                  animate={{ rotate: -360 }}
                  transition={{
                    ease: 'linear',
                    duration: 15,
                    repeat: Infinity,
                  }}>
                  <motion.div
                    className='absolute top-1/2 left-1/2'
                    style={{ x: '-50%', y: '-50%' }}
                    animate={{
                      rotate: 360,
                      x: '14rem',
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 15,
                      ease: 'linear',
                    }}>
                    <span className='text-3xl drop-shadow-lg'>🍟</span>
                  </motion.div>
                </motion.div>

                <motion.div
                  className='absolute w-full h-full'
                  style={{ transform: 'translateZ(-10px)' }}
                  animate={{ rotate: -360 }}
                  transition={{
                    ease: 'linear',
                    duration: 15,
                    repeat: Infinity,
                    delay: 3.75,
                  }}>
                  <motion.div
                    className='absolute top-1/2 left-1/2'
                    style={{ x: '-50%', y: '-50%' }}
                    animate={{
                      rotate: 360,
                      x: '14rem',
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 15,
                      ease: 'linear',
                      delay: 3.75,
                    }}>
                    <span className='text-3xl drop-shadow-lg'>🥤</span>
                  </motion.div>
                </motion.div>

                <motion.div
                  className='absolute w-full h-full'
                  style={{ transform: 'translateZ(-10px)' }}
                  animate={{ rotate: -360 }}
                  transition={{
                    ease: 'linear',
                    duration: 15,
                    repeat: Infinity,
                    delay: 7.5,
                  }}>
                  <motion.div
                    className='absolute top-1/2 left-1/2'
                    style={{ x: '-50%', y: '-50%' }}
                    animate={{
                      rotate: 360,
                      x: '14rem',
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 15,
                      ease: 'linear',
                      delay: 7.5,
                    }}>
                    <span className='text-3xl drop-shadow-lg'>🍰</span>
                  </motion.div>
                </motion.div>

                <motion.div
                  className='absolute w-full h-full'
                  style={{ transform: 'translateZ(-10px)' }}
                  animate={{ rotate: -360 }}
                  transition={{
                    ease: 'linear',
                    duration: 15,
                    repeat: Infinity,
                    delay: 11.25,
                  }}>
                  <motion.div
                    className='absolute top-1/2 left-1/2'
                    style={{ x: '-50%', y: '-50%' }}
                    animate={{
                      rotate: 360,
                      x: '14rem',
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 15,
                      ease: 'linear',
                      delay: 11.25,
                    }}>
                    <span className='text-3xl drop-shadow-lg'>☕</span>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className='py-28 bg-gray-100/50 dark:bg-gray-900/50 transition-colors duration-500'
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}>
        <div className='container mx-auto px-4'>
          <motion.div className='text-center mb-12' variants={itemVariants}>
            <h2 className='text-4xl font-bold mb-4 text-gray-900 dark:text-white'>
              Why <span className='text-red-500'>CampusBites</span>?
            </h2>
            <p className='text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
              We're not just another food app. We're built by students, for
              students, with features that matter to you.
            </p>
          </motion.div>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {[
              {
                icon: <Heart className='w-10 h-10 text-red-400' />,
                title: 'Curated for You',
                description:
                  'Discover exclusive deals and combos from your favorite campus canteens.',
              },
              {
                icon: <Truck className='w-10 h-10 text-red-400' />,
                title: 'Real-Time Tracking',
                description:
                  'Know exactly where your order is, from the kitchen to your doorstep.',
              },
              {
                icon: <GraduationCap className='w-10 h-10 text-red-400' />,
                title: 'Student-Friendly Prices',
                description:
                  "Enjoy delicious meals that won't break the bank. Pocket-friendly is our promise.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className='bg-white/60 dark:bg-gray-800/40 p-8 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-red-500/50 hover:bg-white/80 dark:hover:bg-gray-800/60 transition-all duration-300 shadow-lg dark:shadow-none'
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}>
                <div className='flex items-center justify-center bg-red-500/10 rounded-full w-20 h-20 mb-6'>
                  {feature.icon}
                </div>
                <h3 className='text-2xl font-bold mb-3 text-gray-900 dark:text-white'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        className='py-24 transition-colors duration-500'
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}>
        <div className='container mx-auto px-4'>
          <motion.h2
            className='text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white'
            variants={itemVariants}>
            Get Started in <span className='text-red-500'>3 Easy Steps</span>
          </motion.h2>
          <div className='relative'>
            <div className='absolute left-1/2 top-0 h-full w-0.5 bg-gray-300 dark:bg-gray-700 hidden md:block transition-colors duration-500' />

            {/* Step 1 */}
            <motion.div
              className='md:grid md:grid-cols-2 md:gap-12 items-center mb-16'
              variants={itemVariants}>
              <div className='text-center md:text-left mb-8 md:mb-0'>
                <h3 className='text-3xl font-bold mb-3 text-red-500'>
                  1. Browse & Select
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  Explore menus from all campus canteens in one place. Find your
                  favorite dish or try something new!
                </p>
              </div>
              <div className='relative flex justify-center items-center'>
                <div className='absolute w-8 h-8 bg-red-500 rounded-full left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 border-4 border-white dark:border-black hidden md:block transition-colors duration-500' />
                <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-500'>
                  <p className='text-gray-600 dark:text-gray-300'>
                    Browse Screen Mockup
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className='md:grid md:grid-cols-2 md:gap-12 items-center mb-16'
              variants={itemVariants}>
              <div className='relative flex justify-center items-center md:order-2'>
                <div className='absolute w-8 h-8 bg-red-500 rounded-full left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 border-4 border-white dark:border-black hidden md:block transition-colors duration-500' />
                <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-500'>
                  <p className='text-gray-600 dark:text-gray-300'>
                    Cart/Checkout Mockup
                  </p>
                </div>
              </div>
              <div className='text-center md:text-right mt-8 md:mt-0 md:order-1'>
                <h3 className='text-3xl font-bold mb-3 text-red-500'>
                  2. Place Your Order
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  Add items to your cart, choose your payment method, and
                  confirm your order in a few taps.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className='md:grid md:grid-cols-2 md:gap-12 items-center'
              variants={itemVariants}>
              <div className='text-center md:text-left mb-8 md:mb-0'>
                <h3 className='text-3xl font-bold mb-3 text-red-500'>
                  3. Track & Enjoy
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  Follow your order in real-time and get notified when it's
                  arriving. Hot and fresh, right at your door!
                </p>
              </div>
              <div className='relative flex justify-center items-center'>
                <div className='absolute w-8 h-8 bg-red-500 rounded-full left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 border-4 border-white dark:border-black hidden md:block transition-colors duration-500' />
                <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-500'>
                  <p className='text-gray-600 dark:text-gray-300'>
                    Tracking Screen Mockup
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
