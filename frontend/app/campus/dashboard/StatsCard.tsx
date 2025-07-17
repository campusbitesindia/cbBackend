import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  className?: string;
  iconColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  className = '',
  iconColor = 'text-gray-400',
}) => {
  return (
    <Card
      className={`bg-white shadow-md transition-transform duration-200 hover:shadow-lg hover:scale-105 border-gray-200 ${className}`}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-gray-600'>
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold text-gray-800'>{value}</div>
        <p className='text-xs text-gray-600'>{description}</p>
      </CardContent>
    </Card>
  );
};
