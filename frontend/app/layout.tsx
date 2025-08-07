import { Providers } from '@/components/providers';
import type React from 'react';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { GlobalRouteProtection } from '@/components/GlobalRouteProtection';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Campus Bites',
  description: 'Order delicious food from campus outlets',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <Providers>
            <GlobalRouteProtection>
              <div className='relative z-10 flex flex-col'>
                <div className='absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out -z-10'>
                  {/* Light mode background - Clean and bright */}
                  <div className='absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:opacity-0 opacity-100 transition-opacity duration-1000'>
                    <div className='absolute top-0 -left-4 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob'></div>
                    <div className='absolute top-0 -right-4 w-72 h-72 bg-yellow-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000'></div>
                    <div className='absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000'></div>
                  </div>
                  {/* Dark mode background - Navy gradient */}
                  <div className='absolute inset-0 bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#2d4a6b] opacity-0 dark:opacity-100 transition-opacity duration-1000 overflow-x-hidden'>
                    <div className='absolute top-0 left-0 w-60 h-60 sm:left-1/4 sm:w-96 sm:h-96 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse'></div>
                    <div
                      className='absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl animate-pulse'
                      style={{ animationDelay: '1s' }}></div>
                    <div
                      className='absolute top-1/2 left-0 w-64 h-64 bg-cyan-600/10 rounded-full filter blur-2xl animate-pulse'
                      style={{ animationDelay: '2s' }}></div>
                  </div>
                </div>
                <Navbar />
                <main className='flex-1 pt-20'>{children}</main>
                <Footer />
              </div>
            </GlobalRouteProtection>
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
