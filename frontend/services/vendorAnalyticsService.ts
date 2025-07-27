import api from '@/lib/axios';

// Basic Dashboard Types
export interface BasicDashboardData {
  totalOrders: number;
  totalEarnings: number;
  totalPayouts: number;
  availableBalance: number;
  activeItems: number;
  averageRating: string;
}

// Financial Overview Types
export interface SalesDataPoint {
  _id: {
    year: number;
    month: number;
    day: number;
  };
  dailyTotal: number;
  count: number;
}

export interface FinancialOverviewData {
  totalEarnings: number;
  totalPayouts: number;
  availableBalance: number;
  salesData: SalesDataPoint[];
}

// Order Performance Types
export interface OrderPerformanceData {
  statusCounts: Record<string, number>;
  averageCompletionTimeMinutes: string;
  ordersByHour: Array<{
    _id: number;
    count: number;
  }>;
}

// Item Sales Analysis Types
export interface ItemSalesData {
  itemId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  salesPercentage: string;
}

export interface ItemSalesAnalysisData {
  allItems: ItemSalesData[];
  top5Items: ItemSalesData[];
}

// Operating Metrics Types
export interface OperatingMetricsData {
  operatingDays: string[];
  ordersByDay: Record<string, number>;
  ordersByHour: Array<{
    _id: number;
    count: number;
  }>;
  operatingHours: {
    opening: string;
    closing: string;
  };
}

// Response wrapper type
interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Get basic dashboard info
export const getBasicDashboard = async (
  canteenId: string
): Promise<BasicDashboardData> => {
  const response = await api.get<AnalyticsResponse<BasicDashboardData>>(
    `/api/v1/vendorAnalytics/${canteenId}/basic`
  );
  return response.data.data;
};

// Get financial overview
export const getFinancialOverview = async (
  canteenId: string
): Promise<FinancialOverviewData> => {
  const response = await api.get<AnalyticsResponse<FinancialOverviewData>>(
    `/api/v1/vendorAnalytics/${canteenId}/finance`
  );
  return response.data.data;
};

// Get order performance
export const getOrderPerformance = async (
  canteenId: string
): Promise<OrderPerformanceData> => {
  const response = await api.get<AnalyticsResponse<OrderPerformanceData>>(
    `/api/v1/vendorAnalytics/${canteenId}/orders`
  );
  return response.data.data;
};

// Get item sales analysis
export const getItemSalesAnalysis = async (
  canteenId: string
): Promise<ItemSalesAnalysisData> => {
  const response = await api.get<AnalyticsResponse<ItemSalesAnalysisData>>(
    `/api/v1/vendorAnalytics/${canteenId}/items`
  );
  return response.data.data;
};

// Get operating metrics
export const getOperatingMetrics = async (
  canteenId: string
): Promise<OperatingMetricsData> => {
  const response = await api.get<AnalyticsResponse<OperatingMetricsData>>(
    `/api/v1/vendorAnalytics/${canteenId}/operating`
  );
  return response.data.data;
};

// Get all analytics data at once
export const getAllAnalytics = async (canteenId: string) => {
  const [basic, financial, orders, items, operating] = await Promise.all([
    getBasicDashboard(canteenId),
    getFinancialOverview(canteenId),
    getOrderPerformance(canteenId),
    getItemSalesAnalysis(canteenId),
    getOperatingMetrics(canteenId),
  ]);

  return {
    basic,
    financial,
    orders,
    items,
    operating,
  };
};
