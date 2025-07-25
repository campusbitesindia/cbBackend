'use client';

import { memo } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Menu,
  ShoppingCart,
  Home,
  UtensilsCrossed,
  Package,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import GlobalSearchDropdown from './global-search-dropdown';

function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Outlets', href: '/menu', icon: UtensilsCrossed },
    { name: 'Orders', href: '/orders', icon: Package },
  ];

  const hideNavbar =
    pathname === '/campus/register' || pathname === '/campus/dashboard';

  if (hideNavbar) {
    return (
      <header className='fixed top-0 z-50 w-full bg-white/80 dark:bg-gradient-to-r dark:from-[#0a192f] dark:to-[#1e3a5f] backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-white/10 transition-all duration-500'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex h-20 items-center justify-between'>
            {/* Logo */}
            <Link
              href={`${
                pathname === '/campus/dashboard' ? '/campus/dashboard' : '/'
              }`}
              className='flex items-center group'>
              <div className='flex items-center space-x-3'>
                <Image
                  src='/logo.png'
                  alt='Campus Bites Logo'
                  width={50}
                  height={50}
                  priority
                  className='transition-all duration-300 group-hover:brightness-110'
                />
                <div className='flex flex-col'>
                  <span className='text-xl font-bold text-gray-900 dark:text-white tracking-wide group-hover:text-red-500 transition-colors duration-300'>
                    Campus Bites
                  </span>
                  <span className='text-xs text-gray-600 dark:text-gray-300 font-medium tracking-wider'>
                    Fast • Fresh • Delicious
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className='fixed top-0 z-50 w-full bg-white/80 dark:bg-gradient-to-r dark:from-[#0a192f] dark:to-[#1e3a5f] backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-white/10 transition-all duration-500 overflow-x-hidden'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-x-hidden'>
        <div className='flex h-20 items-center justify-between w-full max-w-full'>
          {/* Logo */}
          <Link href='/' className='flex items-center group'>
            <div className='flex items-center space-x-3'>
              <Image
                src='/logo.png'
                alt='Campus Bites Logo'
                width={50}
                height={50}
                priority
                className='transition-all duration-300 group-hover:brightness-110'
              />
              <div className='flex flex-col'>
                <span className='text-xl font-bold text-gray-900 dark:text-white tracking-wide group-hover:text-red-500 transition-colors duration-300'>
                  Campus Bites
                </span>
                <span className='text-xs text-gray-600 dark:text-gray-300 font-medium tracking-wider'>
                  Fast • Fresh • Delicious
                </span>
              </div>
            </div>
          </Link>

          {/* Global Search Bar (Desktop) - now left of nav */}
          <div className='hidden md:block relative w-72 mr-6'>
            <GlobalSearchDropdown
              query={searchQuery}
              setQuery={setSearchQuery}
              open={searchDropdownOpen}
              setOpen={setSearchDropdownOpen}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex'>
            <div className='relative flex items-center bg-gray-100/70 dark:bg-gray-900/50 backdrop-blur-lg rounded-full p-1 border border-gray-300/50 dark:border-white/10'>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-6 py-2 text-sm font-medium transition-colors duration-300 rounded-full ${
                    pathname === item.href
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}>
                  <span className='relative z-10'>{item.name}</span>
                  {pathname === item.href && (
                    <motion.div
                      layoutId='activeNav'
                      className='absolute inset-0 z-0 rounded-full bg-red-600'
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right side actions */}
          <div className='flex items-center space-x-4'>
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart */}
            <Link href='/cart' className='relative group'>
              <div className='relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100/70 dark:bg-gray-900/50 border border-gray-300/50 dark:border-white/10 hover:bg-gray-200/70 dark:hover:bg-gray-800/70 transition-colors duration-300'>
                <ShoppingCart className='w-5 h-5 text-gray-700 dark:text-white' />
                {cartItemsCount > 0 && (
                  <Badge className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs font-bold rounded-full border-2 border-white dark:border-black/50'>
                    {cartItemsCount}
                  </Badge>
                )}
              </div>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className='md:hidden'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full'>
                  <Menu className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent
                side='right'
                className='w-full max-w-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur-lg border-l border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white p-0'>
                <div className='flex flex-col h-full'>
                  <div className='flex items-center justify-between p-6 border-b border-white/10'>
                    <Link
                      href='/'
                      className='flex items-center space-x-3'
                      onClick={() => setIsMenuOpen(false)}>
                      <div className='w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center'>
                        <UtensilsCrossed className='w-4 h-4 text-white' />
                      </div>
                      <span className='font-semibold text-lg text-white'>
                        Campus Bites
                      </span>
                    </Link>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => setIsMenuOpen(false)}
                      className='rounded-full text-white hover:bg-white/10'>
                      <X className='h-5 w-5' />
                    </Button>
                  </div>

                  <nav className='flex-1 p-6 space-y-2'>
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-all duration-300 text-lg ${
                          pathname === item.href
                            ? 'bg-red-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800/80'
                        }`}>
                        <item.icon className='h-6 w-6' />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </nav>

                  {!isAuthenticated && (
                    <div className='p-6 border-t border-white/10 space-y-4'>
                      <Button
                        asChild
                        variant='outline'
                        className='w-full h-12 rounded-xl border-white/20 text-lg text-white hover:bg-white/10 hover:text-white'>
                        <Link
                          href='/login'
                          onClick={() => setIsMenuOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className='w-full h-12 bg-red-600 hover:bg-red-700 rounded-xl text-lg'>
                        <Link
                          href='/register'
                          onClick={() => setIsMenuOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export default memo(Navbar);
