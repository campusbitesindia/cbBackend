'use client';

import { useEffect, useRef, FC } from 'react';
import Link from 'next/link';
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
  const counterRef = useRef<HTMLSpanElement>(null);
  const observerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && counterRef.current) {
          try {
            const anime = (await import('animejs')).default;
            
            anime({
              targets: { value: 0 },
              value: to,
              duration: 2000,
              easing: 'easeOutQuart',
              update: function(anim: any) {
                if (counterRef.current) {
                  counterRef.current.textContent = Math.round(anim.animatables[0].target.value).toString();
                }
              }
            });
          } catch (error) {
            console.error('Failed to load anime.js for counter:', error);
            if (counterRef.current) {
              counterRef.current.textContent = to.toString();
            }
          }
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [to]);
  return (
    <span ref={observerRef}>
      <span ref={counterRef}>0</span>
      {isPlus && '+'}
      {suffix}
    </span>
  );
};

export default function LandingPageClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const orbitsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  
  console.log(user);

  const handleMouseMove = async (event: React.MouseEvent) => {
    if (heroRef.current && logoRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
      
      try {
        const animeModule = await import('animejs/lib/anime.es.js');
        const anime = animeModule.default;
        
        anime({
          targets: logoRef.current,
          rotateY: x * 15,
          rotateX: -y * 15,
          duration: 1000,
          easing: 'easeOutQuart'
        });
      } catch (error) {
        console.error('Failed to load anime.js for mouse move:', error);
      }
    }
  };

  const handleMouseLeave = async () => {
    try {
      const animeModule = await import('animejs/lib/anime.es.js');
      const anime = animeModule.default;
      
      anime({
        targets: logoRef.current,
        rotateY: 0,
        rotateX: 0,
        duration: 1000,
        easing: 'easeOutQuart'
      });
    } catch (error) {
      console.error('Failed to load anime.js for mouse leave:', error);
    }
  };

  useEffect(() => {
    if (user?.role === 'canteen' && pathname === '/') {
      router.push('/campus/dashboard');
    }
  }, [user?.role, pathname, router]);

  // Main animations setup
  useEffect(() => {
    const loadAnime = async () => {
      try {
        const animeModule = await import('animejs/lib/anime.es.js');
        const anime = animeModule.default;

        // Hero section animations
        anime.timeline({
          easing: 'easeOutExpo',
          duration: 1000
        })
        .add({
          targets: '.hero-badge',
          opacity: [0, 1],
          translateY: [50, 0],
          duration: 800
        })
        .add({
          targets: '.hero-title',
          opacity: [0, 1],
          translateY: [50, 0],
          duration: 1000
        }, '-=600')
        .add({
          targets: '.hero-subtitle',
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 800
        }, '-=800')
        .add({
          targets: '.hero-buttons',
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 800
        }, '-=600')
        .add({
          targets: '.hero-stats',
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 800
        }, '-=600');

        // Logo glow animation
        anime({
          targets: '.logo-glow',
          scale: [1, 1.08, 1],
          boxShadow: [
            '0 0 30px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.4)',
            '0 0 50px rgba(239, 68, 68, 0.8), 0 0 100px rgba(239, 68, 68, 0.6)',
            '0 0 70px rgba(239, 68, 68, 1), 0 0 140px rgba(239, 68, 68, 0.8)',
            '0 0 50px rgba(239, 68, 68, 0.8), 0 0 100px rgba(239, 68, 68, 0.6)',
            '0 0 30px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.4)',
          ],
          duration: 4000,
          loop: true,
          easing: 'easeInOutSine'
        });

        // Logo text glow animation
        anime({
          targets: '.logo-text',
          textShadow: [
            '0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(255, 255, 255, 0.6)',
            '0 0 30px rgba(255, 255, 255, 1), 0 0 60px rgba(255, 255, 255, 0.8)',
            '0 0 40px rgba(255, 255, 255, 0.9), 0 0 80px rgba(255, 255, 255, 0.6)',
            '0 0 30px rgba(255, 255, 255, 1), 0 0 60px rgba(255, 255, 255, 0.8)',
            '0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(255, 255, 255, 0.6)',
          ],
          duration: 4000,
          loop: true,
          easing: 'easeInOutSine'
        });

        // First orbit ring animation
        anime({
          targets: '.orbit-1',
          rotate: 360,
          duration: 10000,
          loop: true,
          easing: 'linear'
        });

        // Counter-rotate orbit items
        anime({
          targets: '.orbit-1 .orbit-item',
          rotate: -360,
          duration: 10000,
          loop: true,
          easing: 'linear'
        });

        // Second orbit ring animation (reverse direction)
        anime({
          targets: '.orbit-2',
          rotate: -360,
          duration: 15000,
          loop: true,
          easing: 'linear'
        });

        // Counter-rotate second orbit items
        anime({
          targets: '.orbit-2 .orbit-item',
          rotate: 360,
          duration: 15000,
          loop: true,
          easing: 'linear'
        });

        // Floating background elements
        anime({
          targets: '.bg-float-1',
          translateY: [-20, 20],
          scale: [1, 1.05, 1],
          duration: 10000,
          loop: true,
          direction: 'alternate',
          easing: 'easeInOutSine'
        });

        anime({
          targets: '.bg-float-2',
          translateY: [20, -20],
          rotate: [0, 15, -15, 0],
          duration: 10000,
          loop: true,
          direction: 'alternate',
          easing: 'easeInOutSine',
          delay: 2000
        });

        anime({
          targets: '.bg-float-3',
          translateY: [0, -20, 0],
          scale: [1, 1.05, 1],
          duration: 10000,
          loop: true,
          easing: 'easeInOutSine',
          delay: 5000
        });

      } catch (error) {
        console.error('Failed to load anime.js:', error);
      }
    };

    loadAnime();
  }, []);

  // Intersection observer for section animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2, // Slightly lower threshold for better visibility
      rootMargin: '-50px'
    };

    const featuresObserver = new IntersectionObserver(async ([entry]) => {
      if (entry.isIntersecting) {
        try {
          const animeModule = await import('animejs/lib/anime.es.js');
          const anime = animeModule.default;
          
          anime.timeline({
            easing: 'easeOutExpo'
          })
          .add({
            targets: '.features-title',
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 800
          })
          .add({
            targets: '.feature-card',
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 800,
            delay: anime.stagger(200)
          }, '-=400');
        } catch (error) {
          console.error('Failed to load anime.js for features:', error);
        }
      }
    }, observerOptions);

    const stepsObserver = new IntersectionObserver(async ([entry]) => {
      if (entry.isIntersecting) {
        try {
          const animeModule = await import('animejs/lib/anime.es.js');
          const anime = animeModule.default;
          
          anime.timeline({
            easing: 'easeOutExpo'
          })
          .add({
            targets: '.steps-title',
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 800
          })
          .add({
            targets: '.step-item',
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 800,
            delay: anime.stagger(300)
          }, '-=400');
        } catch (error) {
          console.error('Failed to load anime.js for steps:', error);
        }
      }
    }, { ...observerOptions, threshold: 0.1 }); // Lower threshold for steps section

    if (featuresRef.current) featuresObserver.observe(featuresRef.current);
    if (stepsRef.current) stepsObserver.observe(stepsRef.current);

    return () => {
      featuresObserver.disconnect();
      stepsObserver.disconnect();
    };
  }, []);

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-[#0a192f] dark:via-[#1e3a5f] dark:to-[#0f172a] text-gray-900 dark:text-white overflow-hidden transition-all duration-500'
      suppressHydrationWarning>
      {/* Professional Hero Section */}
      <section
        className='relative min-h-screen flex items-center justify-center overflow-hidden'
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

        
        </div>

        <div className='container mx-auto px-4 py-20 relative z-10'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            {/* Left Content */}
            <div className='text-center lg:text-left'>
              <div
                className='inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 mb-6 hero-badge opacity-0'>
                <Star className='w-5 h-5 text-red-400' />
                <span className='text-red-400 dark:text-red-300 font-medium'>
                  #1 Campus Food Delivery
                </span>
              </div>

              <h1
                className='text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 hero-title opacity-0'>
                <span className='block text-gray-900 dark:text-white'>
                  Ready for the
                </span>
                <span className='block bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent'>
                  Feast Fest?
                </span>
              </h1>

              <p
                className='text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 hero-subtitle opacity-0'>
                Don't let hunger slow you down. Get your favorite meals
                delivered fast,
                <span className='text-red-500 dark:text-red-400 font-semibold'>
                  {' '}
                  24/7
                </span>
                , right to your hostel room.
              </p>

              <div
                className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12 hero-buttons opacity-0'>
                <div className='hover-scale'>
                  <Button
                    asChild
                    size='lg'
                    className='bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 text-lg rounded-full shadow-lg shadow-red-500/20 transition-all duration-300'>
                    <Link href='/menu'>
                      Order Now <ArrowRight className='w-5 h-5 ml-2' />
                    </Link>
                  </Button>
                </div>
                <div className='hover-scale'>
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
                </div>
              </div>

              {/* ------------------------------------------------- */
              /*  Stats / Analytics Strip                       */
              /* ------------------------------------------------- */}
              <div
                className='flex flex-wrap justify-center lg:justify-start gap-8 mt-6 hero-stats opacity-0'>
                {/* Restaurants */}
                <div
                  className='flex flex-col items-center stat-item'>
                  <div className='bg-red-500/20 p-4 rounded-full mb-2'>
                    <Utensils className='w-6 h-6 text-red-400' />
                  </div>
                  <span className='text-4xl font-extrabold text-gray-900 dark:text-white'>
                    <Counter to={100} isPlus />
                  </span>
                  <p className='text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide mt-1'>
                    Restaurants
                  </p>
                </div>

                {/* Happy Customers */}
                <div
                  className='flex flex-col items-center stat-item'>
                  <div className='bg-red-500/20 p-4 rounded-full mb-2'>
                    <Users className='w-6 h-6 text-red-400' />
                  </div>
                  <span className='text-4xl font-extrabold text-gray-900 dark:text-white'>
                    <Counter to={1} suffix='k+' />
                  </span>
                  <p className='text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide mt-1'>
                    Customers
                  </p>
                </div>

                {/* Satisfaction */}
                <div
                  className='flex flex-col items-center stat-item'>
                  <div className='bg-red-500/20 p-4 rounded-full mb-2'>
                    <Smile className='w-6 h-6 text-red-400' />
                  </div>
                  <span className='text-4xl font-extrabold text-gray-900 dark:text-white'>
                    <Counter to={98} suffix='%' />
                  </span>
                  <p className='text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide mt-1'>
                    Satisfaction
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - CB Logo */}
            <div
              className='relative hidden lg:flex items-center justify-center'
              ref={logoRef}>
              <div
                className='relative w-96 h-96'
                ref={orbitsRef}
                style={{ transformStyle: 'preserve-3d' }}>
                {/* CB Logo with Enhanced Glowing Effect */}
                <div
                  className='absolute top-1/2 left-1/2 w-44 h-44 bg-gradient-to-br from-red-600 via-rose-600 to-red-700 rounded-full shadow-2xl logo-glow'
                  style={{
                    transform: 'translate(-50%, -50%) translateZ(50px)',
                    zIndex: 10,
                  }}>
                  <div className='absolute inset-0 rounded-full opacity-30 bg-black' />
                  <div
                    className='absolute top-1/2 left-1/2 text-7xl font-black text-white select-none logo-text'
                    style={{ transform: 'translate(-50%, -50%)', zIndex: 20 }}>
                    CB
                  </div>
                </div>

                {/* Orbiting Food Items */}
                {/* First Ring - Closer orbit */}
                <div
                  className='absolute w-full h-full orbit-1'
                  style={{ transform: 'translateZ(20px)' }}>
                  <div
                    className='absolute top-1/2 left-1/2 orbit-item'
                    style={{ transform: 'translate(-50%, -50%) translateX(10rem)' }}>
                    <span className='text-4xl drop-shadow-lg'>🍔</span>
                  </div>
                </div>

                <div
                  className='absolute w-full h-full orbit-1'
                  style={{ transform: 'translateZ(20px) rotate(90deg)' }}>
                  <div
                    className='absolute top-1/2 left-1/2 orbit-item'
                    style={{ transform: 'translate(-50%, -50%) translateX(10rem) rotate(-90deg)' }}>
                    <span className='text-4xl drop-shadow-lg'>🍕</span>
                  </div>
                </div>

                <div
                  className='absolute w-full h-full orbit-1'
                  style={{ transform: 'translateZ(20px) rotate(180deg)' }}>
                  <div
                    className='absolute top-1/2 left-1/2 orbit-item'
                    style={{ transform: 'translate(-50%, -50%) translateX(10rem) rotate(-180deg)' }}>
                    <span className='text-4xl drop-shadow-lg'>🌮</span>
                  </div>
                </div>

                <div
                  className='absolute w-full h-full orbit-1'
                  style={{ transform: 'translateZ(20px) rotate(270deg)' }}>
                  <div
                    className='absolute top-1/2 left-1/2 orbit-item'
                    style={{ transform: 'translate(-50%, -50%) translateX(10rem) rotate(-270deg)' }}>
                    <span className='text-4xl drop-shadow-lg'>🍜</span>
                  </div>
                </div>

                {/* Second Ring - Farther orbit */}
                <div
                  className='absolute w-full h-full orbit-2'
                  style={{ transform: 'translateZ(-10px)' }}>
                  <div
                    className='absolute top-1/2 left-1/2 orbit-item'
                    style={{ transform: 'translate(-50%, -50%) translateX(14rem)' }}>
                    <span className='text-3xl drop-shadow-lg'>🍟</span>
                  </div>
                </div>

                <div
                  className='absolute w-full h-full orbit-2'
                  style={{ transform: 'translateZ(-10px) rotate(90deg)' }}>
                  <div
                    className='absolute top-1/2 left-1/2 orbit-item'
                    style={{ transform: 'translate(-50%, -50%) translateX(14rem) rotate(-90deg)' }}>
                    <span className='text-3xl drop-shadow-lg'>🥤</span>
                  </div>
                </div>

                <div
                  className='absolute w-full h-full orbit-2'
                  style={{ transform: 'translateZ(-10px) rotate(180deg)' }}>
                  <div
                    className='absolute top-1/2 left-1/2 orbit-item'
                    style={{ transform: 'translate(-50%, -50%) translateX(14rem) rotate(-180deg)' }}>
                    <span className='text-3xl drop-shadow-lg'>🍰</span>
                  </div>
                </div>

                <div
                  className='absolute w-full h-full orbit-2'
                  style={{ transform: 'translateZ(-10px) rotate(270deg)' }}>
                  <div
                    className='absolute top-1/2 left-1/2 orbit-item'
                    style={{ transform: 'translate(-50%, -50%) translateX(14rem) rotate(-270deg)' }}>
                    <span className='text-3xl drop-shadow-lg'>☕</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className='py-28 bg-gray-100/50 dark:bg-gray-900/50 transition-colors duration-500'
        ref={featuresRef}>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12 features-title opacity-0'>
            <h2 className='text-4xl font-bold mb-4 text-gray-900 dark:text-white'>
              Why <span className='text-red-500'>CampusBites</span>?
            </h2>
            <p className='text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
              We're not just another food app. We're built by students, for
              students, with features that matter to you.
            </p>
          </div>
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
              <div
                key={i}
                className='bg-white/60 dark:bg-gray-800/40 p-8 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-red-500/50 hover:bg-white/80 dark:hover:bg-gray-800/60 transition-all duration-300 shadow-lg dark:shadow-none feature-card opacity-0 hover:scale-105 hover:-translate-y-2'>
                <div className='flex items-center justify-center bg-red-500/10 rounded-full w-20 h-20 mb-6'>
                  {feature.icon}
                </div>
                <h3 className='text-2xl font-bold mb-3 text-gray-900 dark:text-white'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        className='py-24 transition-colors duration-500'
        ref={stepsRef}>
        <div className='container mx-auto px-4'>
          <h2
            className='text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white steps-title opacity-0'>
            Get Started in <span className='text-red-500'>3 Easy Steps</span>
          </h2>
          <div className='relative'>
            <div className='absolute left-1/2 top-0 h-full w-0.5 bg-gray-300 dark:bg-gray-700 hidden md:block transition-colors duration-500' />

            {/* Step 1 */}
            <div
              className='md:grid md:grid-cols-2 md:gap-12 items-center mb-16 step-item opacity-0'>
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
            </div>

            {/* Step 2 */}
            <div
              className='md:grid md:grid-cols-2 md:gap-12 items-center mb-16 step-item opacity-0'>
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
            </div>

            {/* Step 3 */}
            <div
              className='md:grid md:grid-cols-2 md:gap-12 items-center step-item opacity-0'>
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}