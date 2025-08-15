import React, { useState } from 'react';
import {
  LayoutDashboard,
  Menu,
  ShoppingCart,
  BarChart3,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  onClose,
  isMobile = false,
}) => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();

    // Call logout function if available
    if (logout) {
      logout();
    }

    // Redirect to login page
    router.push('/login');
  };

  const navItems = [
    {
      id: 'overview',
      icon: LayoutDashboard,
      label: 'Dashboard',
      section: 'OVERVIEW',
    },
    {
      id: 'orders',
      icon: ShoppingCart,
      label: 'Orders',
      section: 'MANAGEMENT',
    },
    {
      id: 'menu',
      icon: Menu,
      label: 'Menu Items',
      section: 'MANAGEMENT',
    },
    {
      id: 'analytics',
      icon: BarChart3,
      label: 'Analytics',
      section: 'MANAGEMENT',
    },
    {
      id: 'profile',
      icon: Users,
      label: 'Profile',
      section: 'PROFILE',
    },
    {
      id: 'payouts',
      icon: DollarSign,
      label: 'Payouts',
      section: 'PROFILE',
    },
  ];

  const sections = ['OVERVIEW', 'MANAGEMENT', 'PROFILE'];

  const NavigationButton = ({
    id,
    icon: Icon,
    label,
    isActive,
    onClick,
  }: {
    id: string;
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick?: () => void;
  }) => {
    const buttonContent = (
      <button
        className={`relative flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-all duration-300 group overflow-hidden ${
          isActive
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transform scale-105'
            : 'text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-md hover:scale-102 hover:translate-x-1'
        } ${collapsed ? 'justify-center px-3' : ''}`}
        onClick={() => {
          setActiveTab(id);
          if (onClick) onClick();
        }}>
        {/* Background gradient overlay for active state */}
        {isActive && (
          <div className='absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        )}

        {/* Icon with enhanced styling */}
        <div
          className={`relative z-10 p-1 rounded-lg transition-all duration-300 ${
            isActive
              ? 'bg-white/20 backdrop-blur-sm'
              : 'group-hover:bg-blue-100 group-hover:shadow-sm'
          }`}>
          <Icon
            className={`w-5 h-5 transition-all duration-300 ${
              isActive
                ? 'text-white'
                : 'text-slate-600 group-hover:text-blue-600'
            }`}
          />
        </div>

        {!collapsed && (
          <span
            className={`relative z-10 font-semibold transition-all duration-300 ${
              isActive
                ? 'text-white'
                : 'text-slate-700 group-hover:text-blue-700'
            }`}>
            {label}
          </span>
        )}

        {/* Active indicator */}
        {isActive && !collapsed && (
          <div className='absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full shadow-lg' />
        )}
      </button>
    );

    if (collapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent
              side='right'
              className='bg-slate-900 text-white border-slate-700 shadow-xl backdrop-blur-sm'>
              <p className='font-medium'>{label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return buttonContent;
  };

  return (
    <>
      {/* Enhanced Overlay for mobile */}
      {isMobile && onClose && (
        <div
          className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
          style={{ left: collapsed ? '64px' : '256px' }}
          onClick={onClose}
          aria-label='Close sidebar overlay'
        />
      )}

      {/* Enhanced Sidebar */}
      <div
        className={`h-full bg-gradient-to-br from-white via-slate-50 to-blue-50/30 border-r border-slate-200/60 backdrop-blur-xl flex flex-col scrollbar-hide z-50 transition-all duration-500 ease-in-out shadow-xl ${
          collapsed ? 'w-16' : 'w-64'
        }`}
        onClick={(e) => e.stopPropagation()}>
        {/* Enhanced Mobile Close Button */}
        {isMobile && onClose && (
          <button
            className='absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-200/50 z-30 md:hidden group'
            onClick={onClose}
            aria-label='Close sidebar'>
            <X className='w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors duration-200' />
          </button>
        )}

        {/* Enhanced Brand Section */}
        <div
          className={`flex items-center px-6 py-6 border-b border-slate-200/60 ${
            collapsed ? 'justify-center px-4' : ''
          } ${isMobile ? 'pt-16' : ''}`}>
          {!collapsed && (
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25'>
                <span className='text-white font-bold text-lg'>CB</span>
              </div>
              <div>
                <span className='font-bold text-xl bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent'>
                  CampusBites
                </span>
                <p className='text-xs text-slate-500 font-medium'>
                  Vendor Dashboard
                </p>
              </div>
            </div>
          )}
          {collapsed && (
             <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105'>
             <span className='text-white font-bold text-xl tracking-wide'>CB</span>
           </div>
          )}
        </div>

        {/* Enhanced Navigation Sections */}
        <div className={`flex-1 flex flex-col gap-2 py-6 overflow-y-auto ${collapsed ? '' : 'scrollbar-hide'}`}>
          {sections.map((section, idx) => (
            <React.Fragment key={section}>
              {/* Enhanced Section Header */}
              {!collapsed && (
                <div className='px-6 mb-3'>
                  <span className='text-xs font-bold text-slate-400 tracking-wider uppercase bg-gradient-to-r from-slate-400 to-slate-500 bg-clip-text text-transparent'>
                    {section}
                  </span>
                  <div className='w-8 h-0.5 bg-gradient-to-r from-blue-400 to-transparent mt-1 rounded-full' />
                </div>
              )}

              {/* Enhanced Navigation Items */}
              <nav className='flex flex-col gap-2 px-3'>
                {navItems
                  .filter((item) => item.section === section)
                  .map((item) => (
                    <NavigationButton
                      key={item.id}
                      id={item.id}
                      icon={item.icon}
                      label={item.label}
                      isActive={activeTab === item.id}
                    />
                  ))}
              </nav>

              {/* Enhanced Separator */}
              {section === 'MANAGEMENT' &&
                idx !== sections.length - 1 &&
                !collapsed && (
                  <div className='mx-6 my-4'>
                    <Separator className='bg-gradient-to-r from-transparent via-slate-200 to-transparent' />
                  </div>
                )}
            </React.Fragment>
          ))}
        </div>

        {/* Enhanced Collapse/Expand Button - Moved to bottom before logout */}
        {!isMobile && (
          <div className={`px-3 pb-3 ${collapsed ? 'flex justify-center' : ''}`}>
            {collapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className='p-2 rounded-full bg-white border-2 border-slate-200 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 group'
                      onClick={() => setCollapsed((c) => !c)}
                      aria-label='Expand sidebar'>
                      <ChevronRight className='w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110' />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side='right'
                    className='bg-slate-900 text-white border-slate-700 shadow-xl backdrop-blur-sm'>
                    <p className='font-medium'>Expand Sidebar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button
                className='flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 w-full group hover:shadow-md hover:scale-102 border border-transparent hover:border-blue-200'
                onClick={() => setCollapsed((c) => !c)}
                aria-label='Collapse sidebar'>
                <div className='p-1 rounded-lg group-hover:bg-blue-100 transition-all duration-300'>
                  <ChevronLeft className='w-4 h-4 transition-all duration-300 group-hover:scale-110' />
                </div>
                <span className='font-semibold transition-all duration-300'>
                  Collapse
                </span>
              </button>
            )}
          </div>
        )}

        {/* Enhanced Logout Button */}
        <div
          className={`p-3 border-t border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-transparent ${
            collapsed ? 'flex justify-center' : ''
          }`}>
          {collapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className='flex items-center justify-center w-12 h-12 rounded-xl text-slate-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-300 group hover:shadow-lg hover:scale-105 border border-transparent hover:border-red-200'
                    onClick={handleLogout}
                    aria-label='Logout'>
                    <LogOut className='w-5 h-5 transition-transform duration-300 group-hover:scale-110' />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side='right'
                  className='bg-slate-900 text-white border-slate-700 shadow-xl backdrop-blur-sm'>
                  <p className='font-medium'>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <button
              className='flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 transition-all duration-300 w-full group hover:shadow-lg hover:scale-102 border border-transparent hover:border-red-200'
              onClick={handleLogout}>
              <div className='p-1 rounded-lg group-hover:bg-red-100 transition-all duration-300'>
                <LogOut className='w-5 h-5 transition-transform duration-300 group-hover:scale-110' />
              </div>
              <span className='font-semibold transition-all duration-300'>
                Logout
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};