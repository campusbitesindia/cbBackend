import React, { memo } from 'react';
import {
  ShoppingCart,
  DollarSign,
  Menu,
  Clock,
  TrendingUp,
  Users,
  Star,
} from 'lucide-react';
import { CanteenStats } from '@/services/canteenOrderService';
import { MenuItem } from '@/services/menuService';

interface OverviewTabProps {
  canteenStats: CanteenStats | null;
  menuItems: MenuItem[];
}

// Memoized stat card component for better performance
const StatCard = memo(({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  bgColor, 
  iconColor, 
  trend 
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  trend?: React.ReactNode;
}) => (
  <div className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 sm:p-3 ${bgColor} rounded-lg shadow-sm`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${iconColor}`} />
        </div>
        {trend}
      </div>
      <div className="space-y-1">
        <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

// Memoized quick action component
const QuickAction = memo(({ 
  title, 
  description, 
  icon: Icon, 
  bgColor, 
  iconBg,
  onClick 
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  bgColor: string;
  iconBg: string;
  onClick?: () => void;
}) => (
  <div 
    className={`group p-4 sm:p-6 ${bgColor} rounded-lg border border-opacity-50 hover:border-opacity-100 transition-all duration-200 cursor-pointer hover:shadow-md active:scale-95`}
    onClick={onClick}
  >
    <div className="flex items-center space-x-3 sm:space-x-4">
      <div className={`p-2 sm:p-3 ${iconBg} rounded-lg group-hover:scale-105 transition-transform duration-200`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  </div>
));

QuickAction.displayName = 'QuickAction';

// Wave component for better performance
const WaveBackground = memo(() => (
  <div className="absolute bottom-0 left-0 right-0">
    <svg 
      viewBox="0 0 1440 120" 
      className="w-full h-auto"
      preserveAspectRatio="none"
    >
      <path
        fill="rgb(248 250 252)"
        d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
      />
    </svg>
  </div>
));

WaveBackground.displayName = 'WaveBackground';

export const OverviewTab: React.FC<OverviewTabProps> = memo(({
  canteenStats,
  menuItems,
}) => {
  const stats = [
    {
      title: "Total Orders",
      value: canteenStats?.totalOrders ?? 0,
      subtitle: "All time orders",
      icon: ShoppingCart,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: <TrendingUp className="w-4 h-4 text-green-500" />
    },
    {
      title: "Total Revenue",
      value: `₹${(canteenStats?.totalRevenue ?? 0).toLocaleString()}`,
      subtitle: "Lifetime earnings",
      icon: DollarSign,
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
      trend: <TrendingUp className="w-4 h-4 text-green-500" />
    },
    {
      title: "Menu Items",
      value: menuItems.length,
      subtitle: "Active items",
      icon: Menu,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: <Users className="w-4 h-4 text-blue-500" />
    },
    {
      title: "Pending Orders",
      value: canteenStats?.pendingOrders ?? 0,
      subtitle: "Need attention",
      icon: Clock,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
      trend: (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-amber-600">Active</span>
        </div>
      )
    }
  ];

  const quickActions = [
    {
      title: "Manage Menu",
      description: "Add or edit menu items",
      icon: Menu,
      bgColor: "bg-blue-50 hover:bg-blue-100",
      iconBg: "bg-blue-500 hover:bg-blue-600",
      onClick: () => console.log('Navigate to menu')
    },
    {
      title: "View Orders",
      description: "Process pending orders",
      icon: ShoppingCart,
      bgColor: "bg-green-50 hover:bg-green-100",
      iconBg: "bg-green-500 hover:bg-green-600",
      onClick: () => console.log('Navigate to orders')
    },
    {
      title: "View Payouts",
      description: "Check earnings & payouts",
      icon: DollarSign,
      bgColor: "bg-purple-50 hover:bg-purple-100",
      iconBg: "bg-purple-500 hover:bg-purple-600",
      onClick: () => console.log('Navigate to payouts')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-8 sm:py-12 lg:py-16 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Campus Vendor Partner
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed px-4">
                Welcome back! Here's a comprehensive view of your canteen's performance and key metrics.
              </p>
            </div>
          </div>
        </div>
        <WaveBackground />
      </div>

      {/* Main Content */}
      <div className="relative -mt-4 sm:-mt-8 px-4 sm:px-6 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Quick Actions Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Quick Actions
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your canteen efficiently with these shortcuts
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {quickActions.map((action, index) => (
                <QuickAction key={index} {...action} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

OverviewTab.displayName = 'OverviewTab';