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
        className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-all duration-200 group relative ${
          isActive
            ? 'bg-blue-50 text-blue-600 font-semibold border-r-2 border-blue-600'
            : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
        } ${collapsed ? 'justify-center px-2' : ''}`}
        onClick={() => {
          setActiveTab(id);
          if (onClick) onClick();
        }}>
        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
        {!collapsed && <span className='font-medium'>{label}</span>}
      </button>
    );

    if (collapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent side='right' className='bg-gray-900 text-white'>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return buttonContent;
  };

  return (
    <>
      {/* Overlay for mobile: clicking it closes the sidebar */}
      {isMobile && onClose && (
        <div
          className='fixed inset-0 z-40'
          style={{ left: '256px' }} // 256px = w-64
          onClick={onClose}
          aria-label='Close sidebar overlay'
        />
      )}
      {/* Sidebar */}
      <div
        className={`h-full bg-white border-r border-gray-200 flex flex-col overflow-y-auto overflow-x-hidden z-50 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-16' : 'w-64'
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent overlay click from bubbling
      >
        {/* Mobile Close Button */}
        {isMobile && onClose && (
          <button
            className='absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 z-30 md:hidden'
            onClick={onClose}
            aria-label='Close sidebar'>
            <X className='w-5 h-5 text-gray-600' />
          </button>
        )}

        {/* Collapse/Expand Button */}
        <button
          className={`absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 p-2 rounded-full bg-white border border-gray-200 transition-all duration-200 z-20 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isMobile ? 'hidden' : ''
          }`}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? (
            <ChevronRight className='w-4 h-4 text-gray-600' />
          ) : (
            <ChevronLeft className='w-4 h-4 text-gray-600' />
          )}
        </button>

        {/* Brand */}
        <div
          className={`flex items-center px-4 py-4 border-b border-gray-100 ${
            collapsed ? 'justify-center' : ''
          } ${isMobile ? 'pt-12' : ''}`}>
          {!collapsed && (
            <span className='font-bold text-xl text-blue-900'>CampusBites</span>
          )}
          {collapsed && (
            <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-sm'>C</span>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className='flex-1 flex flex-col gap-1 py-4'>
          {sections.map((section, idx) => (
            <React.Fragment key={section}>
              {/* Section Header */}
              {!collapsed && (
                <div className='px-4 mb-2'>
                  <span className='text-xs font-semibold text-gray-400 tracking-widest uppercase'>
                    {section}
                  </span>
                </div>
              )}

              {/* Navigation Items */}
              <nav className='flex flex-col gap-1 px-2'>
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

              {/* Separator after MANAGEMENT section */}
              {section === 'MANAGEMENT' &&
                idx !== sections.length - 1 &&
                !collapsed && <Separator className='my-3 mx-4 bg-gray-200' />}
            </React.Fragment>
          ))}
        </div>

        {/* Logout Button */}
        <div
          className={`p-2 border-t border-gray-100 ${
            collapsed ? 'flex justify-center' : ''
          }`}>
          {collapsed ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className='flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group'
                    onClick={handleLogout}
                    aria-label='Logout'>
                    <LogOut className='w-5 h-5' />
                  </button>
                </TooltipTrigger>
                <TooltipContent side='right' className='bg-gray-900 text-white'>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <button
              className='flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full group'
              onClick={handleLogout}>
              <LogOut className='w-5 h-5' />
              <span className='font-medium'>Logout</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
