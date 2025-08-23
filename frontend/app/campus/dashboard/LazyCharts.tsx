'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Define the expected data shape for charts
interface ChartData {
  name: string;
  value: number;
}

// Define props for Pie component
interface PieProps {
  data: ChartData[];
  cx?: string | number;
  cy?: string | number;
  labelLine?: boolean;
  label?: (props: { name: string; percent: number }) => string;
  outerRadius?: number;
  fill?: string;
  dataKey: string;
}

// Define props for Bar component
interface BarProps {
  dataKey: string;
  fill?: string;
}

// Lazy load the heavy chart library components
const ResponsiveContainer = lazy(() =>
  import('recharts').then((module) => ({ default: module.ResponsiveContainer }))
);
const PieChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.PieChart }))
);
const Pie = lazy(() =>
  import('recharts').then((module) => ({ default: module.Pie as unknown as ComponentType<PieProps> }))
);
const Cell = lazy(() =>
  import('recharts').then((module) => ({ default: module.Cell }))
);
const Tooltip = lazy(() =>
  import('recharts').then((module) => ({ default: module.Tooltip }))
);
const LineChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.LineChart }))
);
const Line = lazy(() =>
  import('recharts').then((module) => ({ default: module.Line }))
);
const XAxis = lazy(() =>
  import('recharts').then((module) => ({ default: module.XAxis }))
);
const YAxis = lazy(() =>
  import('recharts').then((module) => ({ default: module.YAxis }))
);
const CartesianGrid = lazy(() =>
  import('recharts').then((module) => ({ default: module.CartesianGrid }))
);
const BarChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.BarChart }))
);
const Bar = lazy(() =>
  import('recharts').then((module) => ({ default: module.Bar as unknown as ComponentType<BarProps> }))
);
const Legend = lazy(() =>
  import('recharts').then((module) => ({ default: module.Legend }))
);

// Chart loading component
const ChartLoadingSpinner = () => (
  <div className='flex items-center justify-center h-64'>
    <div className='flex flex-col items-center gap-3'>
      <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
      <p className='text-sm text-gray-600'>Loading chart...</p>
    </div>
  </div>
);

// Lazy-loaded PieChart component
export const LazyPieChart = ({
  data,
  colors,
  height = 300,
}: {
  data: ChartData[];
  colors: string[];
  height?: number;
}) => (
  <Suspense fallback={<ChartLoadingSpinner />}>
    <ResponsiveContainer width='100%' height={height}>
      <PieChart>
        <Pie
          data={data}
          cx='50%'
          cy='50%'
          labelLine={false}
          label={({ name, percent }: { name: string; percent: number }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill='#8884d8'
          dataKey='value'
        />
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </Suspense>
);

// Lazy-loaded LineChart component
export const LazyLineChart = ({
  data,
  dataKey,
  height = 300,
}: {
  data: any[];
  dataKey: string;
  height?: number;
}) => (
  <Suspense fallback={<ChartLoadingSpinner />}>
    <ResponsiveContainer width='100%' height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='name' />
        <YAxis />
        <Tooltip />
        <Line
          type='monotone'
          dataKey={dataKey}
          stroke='#8884d8'
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  </Suspense>
);

// Lazy-loaded BarChart component
export const LazyBarChart = ({
  data,
  dataKey,
  height = 300,
  fill = '#8884d8',
}: {
  data: ChartData[];
  dataKey: string;
  height?: number;
  fill?: string;
}) => (
  <Suspense fallback={<ChartLoadingSpinner />}>
    <ResponsiveContainer width='100%' height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='name' />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={fill} />
      </BarChart>
    </ResponsiveContainer>
  </Suspense>
);

export { ChartLoadingSpinner };
