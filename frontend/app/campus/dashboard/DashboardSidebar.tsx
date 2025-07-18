import React from 'react';
import {
  LayoutDashboard,
  Menu,
  ShoppingCart,
  BarChart3,
  Users,
  DollarSign, // Re-added since we have placeholder PayoutsTab
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.clear();
    if (typeof (useAuth as any).logout === 'function') {
      (useAuth as any).logout();
    }
    window.location.href = '/login';
  };

  const NavigationButton = ({
    id,
    icon: Icon,
    label,
    isActive,
  }: {
    id: string;
    icon: React.ElementType;
    label: string;
    isActive: boolean;
  }) => (
    <button
      className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
        isActive
          ? 'bg-blue-50 text-blue-600 font-semibold'
          : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition'
      }`}
      onClick={() => setActiveTab(id)}>
      <Icon className='w-5 h-5' />
      <span>{label}</span>
    </button>
  );

  return (
    <div className='w-64 h-screen bg-white border-r border-gray-200 flex flex-col overflow-y-auto shadow-lg px-0 py-0'>
      {/* Brand */}
      <div className='px-8 py-3'></div>

      {/* Overview Section */}
      <div className='px-8 mb-2'>
        <span className='text-xs font-semibold text-gray-400 tracking-widest'>
          OVERVIEW
        </span>
      </div>
      <nav className='flex flex-col gap-1 px-4'>
        <NavigationButton
          id='overview'
          icon={LayoutDashboard}
          label='Dashboard'
          isActive={activeTab === 'overview'}
        />
      </nav>

      <Separator className='my-4 bg-gray-200' />

      {/* Management Section */}
      <div className='px-8 mb-2'>
        <span className='text-xs font-semibold text-gray-400 tracking-widest'>
          MANAGEMENT
        </span>
      </div>
      <nav className='flex flex-col gap-1 px-4'>
        <NavigationButton
          id='orders'
          icon={ShoppingCart}
          label='Orders'
          isActive={activeTab === 'orders'}
        />
        <NavigationButton
          id='menu'
          icon={Menu}
          label='Menu Items'
          isActive={activeTab === 'menu'}
        />
        <NavigationButton
          id='analytics'
          icon={BarChart3}
          label='Analytics'
          isActive={activeTab === 'analytics'}
        />
      </nav>

      <Separator className='my-4 bg-gray-200' />

      {/* Profile Section */}
      <div className='px-8 mb-2'>
        <span className='text-xs font-semibold text-gray-400 tracking-widest'>
          PROFILE
        </span>
      </div>
      <nav className='flex flex-col gap-1 px-4 mb-6'>
        <NavigationButton
          id='profile'
          icon={Users}
          label='Profile'
          isActive={activeTab === 'profile'}
        />
        <NavigationButton
          id='payouts'
          icon={DollarSign}
          label='Payouts'
          isActive={activeTab === 'payouts'}
        />

        <button
          className='flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition mt-2'
          onClick={handleLogout}
          title='Logout'>
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1'
            />
          </svg>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};
