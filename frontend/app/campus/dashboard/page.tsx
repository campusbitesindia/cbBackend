'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Menu,
  ShoppingCart,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  RefreshCw,
  Leaf,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  getMenuByCanteenId,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  MenuItem,
} from '@/services/menuService';
import {
  getCanteenOrders,
  getCanteenStats,
  updateCanteenOrderStatus,
  CanteenStats,
} from '@/services/canteenOrderService';
import { Order } from '@/types';
import { uploadImage, validateImage } from '@/services/imageService';
import { useAuth } from '@/context/auth-context';
import { getOrderById } from '@/services/orderService';

// Real data will be calculated from orders and menu items

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function CampusDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [canteenStats, setCanteenStats] = useState<CanteenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  console.log(user, 'userDetails');
  const UserDetails: any = JSON.parse(localStorage.getItem('userDetails') || '{}');

  // Form state for new/edit item
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    isVeg: false,
    image: '',
  });

  // Add search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // State for order details modal
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);

  useEffect(() => {
    fetchData();

    // Set up real-time order refresh every 30 seconds
    const interval = setInterval(() => {
      if (activeTab === 'orders' || activeTab === 'overview') {
        fetchData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  console.log(user);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get canteen ID from authenticated user
      if (!isAuthenticated || !UserDetails || user?.role !== 'canteen') {
        toast({
          title: 'Error',
          description: 'You must be logged in as a canteen user',
          variant: 'destructive',
        });
        return;
      }

      // Use the specific canteen ID provided
      const canteenId = UserDetails.canteenId;
      console.log('Using canteen ID:', canteenId);

      const token = localStorage.getItem('token') || '';
      const [menuData, ordersData, statsData] = await Promise.all([
        getMenuByCanteenId(canteenId),
        getCanteenOrders(canteenId, token),
        getCanteenStats(canteenId, token),
      ]);

      console.log('Menu data:', menuData);
      console.log('Orders data:', ordersData);
      console.log('Stats data:', statsData);

      setMenuItems(menuData || []);
      setOrders(ordersData.data || []);
      setCanteenStats(statsData.data || null);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        validateImage(file);
        setSelectedImage(file);
        // Use a placeholder image URL instead of uploading
        const placeholderUrl = '/placeholder.svg';
        setImagePreview(placeholderUrl);
        setFormData({ ...formData, image: placeholderUrl });
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to upload image',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Temporarily allow any authenticated user for testing
      if (!isAuthenticated || !UserDetails) {
        console.log('Authentication check failed');
        toast({
          title: 'Error',
          description: 'You must be logged in to access this feature',
          variant: 'destructive',
        });
        return;
      }

      const itemData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        canteen: UserDetails.canteenId,
        isVeg: formData.isVeg,
        image: imagePreview || formData.image,
      };

      console.log('Item data to submit:', itemData);

      if (editingItem) {
        await updateMenuItem(editingItem._id, itemData);
        toast({
          title: 'Success',
          description: 'Menu item updated successfully',
        });
      } else {
        await createMenuItem(itemData);
        toast({
          title: 'Success',
          description: 'Menu item added successfully',
        });
      }

      setIsAddItemOpen(false);
      setIsEditItemOpen(false);
      setEditingItem(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save menu item',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      description: item.description || '',
      category: item.category,
      isVeg: item.isVeg,
      image: item.image || '',
    });
    setImagePreview(item.image || '');
    setIsEditItemOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(itemId);
        toast({
          title: 'Success',
          description: 'Menu item deleted successfully',
        });
        fetchData();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete menu item',
          variant: 'destructive',
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      isVeg: false,
      image: '',
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleOrderStatusUpdate = async (
    orderId: string,
    status: Order['status']
  ) => {
    try {
      if (!user?.canteenId) {
        toast({
          title: 'Error',
          description: 'Canteen ID not found',
          variant: 'destructive',
        });
        return;
      }

      // Show message about backend limitation
      toast({
        title: 'Feature Not Available',
        description:
          'Order status updates require backend API support. This feature is currently disabled.',
        variant: 'destructive',
      });

      // Note: In a real implementation, you would call the API here
      // await updateCanteenOrderStatus(orderId, status, localStorage.getItem('token') || '');

      // For now, just refresh the data
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed':
        return <Clock className='w-4 h-4' />;
      case 'preparing':
        return <Package className='w-4 h-4' />;
      case 'ready':
        return <CheckCircle className='w-4 h-4' />;
      case 'completed':
        return <CheckCircle className='w-4 h-4' />;
      case 'cancelled':
        return <XCircle className='w-4 h-4' />;
      default:
        return <Clock className='w-4 h-4' />;
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await getOrderById(orderId, token);
      setOrderDetails(response.data);
    } catch (error) {
      // handle error (show toast, etc.)
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-white'>
        <svg
          className='animate-spin h-10 w-10 text-blue-600'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'>
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'></circle>
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'></path>
        </svg>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // return (
    //   <div className='flex items-center justify-center min-h-screen bg-white'>
    //     <div className='text-gray-600'>
    //       Please log in to access the dashboard
    //     </div>
    //   </div>
    // );
  }

  // Temporarily allow any authenticated user for testing
  // if (user.role !== 'canteen') {
  //   return (
  //     <div className='flex items-center justify-center min-h-screen bg-white'>
  //       <div className='text-gray-600'>
  //         Access denied. Only canteen users can access this dashboard.
  //       </div>
  //     </div>
  //   );
  // }

  // Filter items by search term (case-insensitive)
  const filteredItems = menuItems.filter((item: MenuItem) => {
    // Search filter
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Status filter
    const isActive = 'available' in item ? item.available : true;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'inactive' && !isActive);

    // Category filter
    const matchesCategory =
      categoryFilter === 'all' ||
      (item.category && item.category.toLowerCase() === categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(
    new Set(menuItems.map((item) => item.category?.toLowerCase() || ''))
  ).filter(Boolean);

  return (
    <div className='flex h-screen bg-white'>
      {/* Sidebar */}
      <div className='w-64 h-screen bg-white border-r border-gray-200 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full'>
        {/* Brand */}
        <div className='px-6 py-6'>
          <span className='text-2xl font-bold text-gray-900'>Campus Bites</span>
        </div>
        {/* Overview Section */}
        <div className='px-6 mb-2'>
          <span className='text-xs font-semibold text-gray-400 tracking-widest'>
            OVERVIEW
          </span>
        </div>
        <nav className='flex flex-col gap-1 px-2'>
          <button
            className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
              activeTab === 'overview'
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition'
            }`}
            onClick={() => setActiveTab('overview')}>
            <LayoutDashboard className='w-5 h-5 text-blue-500' />
            <span>Dashboard</span>
          </button>
        </nav>
        {/* Management Section */}
        <div className='px-6 mt-6 mb-2'>
          <span className='text-xs font-semibold text-gray-400 tracking-widest'>
            MANAGEMENT
          </span>
        </div>
        <nav className='flex flex-col gap-1 px-2'>
          <button
            className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
              activeTab === 'orders'
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition'
            }`}
            onClick={() => setActiveTab('orders')}>
            <ShoppingCart className='w-5 h-5' />
            <span>Orders</span>
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
              activeTab === 'menu'
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition'
            }`}
            onClick={() => setActiveTab('menu')}>
            <Menu className='w-5 h-5' />
            <span>Menu Items</span>
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
              activeTab === 'analytics'
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition'
            }`}
            onClick={() => setActiveTab('analytics')}>
            <BarChart3 className='w-5 h-5' />
            <span>Analytics</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className='flex-1 overflow-auto'>
        <div className='p-6'>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              {/* Add heading at the top of the overview */}
              <div>
                <h2 className='text-3xl font-bold text-blue-900 mb-4'>
                  Campus Vendor Partner
                </h2>
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gray-800 mb-2'>
                  Dashboard Overview
                </h1>
                <p className='text-gray-600'>
                  Welcome back! Here's what's happening with your canteen today.
                </p>
              </div>

              {/* Stats Cards with hover effect */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 '>
                <Card className='bg-white shadow-md transition-transform duration-200 hover:shadow-lg hover:scale-105'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-gray-600'>
                      Total Orders
                    </CardTitle>
                    <ShoppingCart className='h-4 w-4 text-gray-400' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-gray-800'>
                      {canteenStats?.totalOrders || orders.length}
                    </div>
                    <p className='text-xs text-gray-600'>All time orders</p>
                  </CardContent>
                </Card>

                <Card className='bg-white shadow-md transition-transform duration-200 hover:shadow-lg hover:scale-105'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-gray-600'>
                      Revenue
                    </CardTitle>
                    <DollarSign className='h-4 w-4 text-gray-400' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-gray-800'>
                      ₹
                      {canteenStats?.totalRevenue ||
                        orders.reduce(
                          (sum: number, order: Order) => sum + order.total,
                          0
                        )}
                    </div>
                    <p className='text-xs text-gray-600'>Total revenue</p>
                  </CardContent>
                </Card>

                <Card className='bg-white shadow-md transition-transform duration-200 hover:shadow-lg hover:scale-105'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-gray-600'>
                      Menu Items
                    </CardTitle>
                    <Menu className='h-4 w-4 text-gray-400' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-gray-800'>
                      {menuItems.length}
                    </div>
                    <p className='text-xs text-gray-600'>Active items</p>
                  </CardContent>
                </Card>

                <Card className='bg-white shadow-md transition-transform duration-200 hover:shadow-lg hover:scale-105'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-gray-600'>
                      Pending Orders
                    </CardTitle>
                    <Clock className='h-4 w-4 text-gray-400' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-gray-800'>
                      {canteenStats?.pendingOrders ||
                        orders.filter(
                          (order: Order) =>
                            order.status === 'placed' ||
                            order.status === 'preparing'
                        ).length}
                    </div>
                    <p className='text-xs text-gray-600'>Need attention</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Menu Items Tab */}
          {activeTab === 'menu' && (
            <div className='space-y-6'>
              <div className='flex justify-between items-center'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-800 mb-2'>
                    Menu Items
                  </h1>
                  <p className='text-gray-600'>
                    Manage your menu items and categories
                  </p>
                </div>
                <div className='flex items-center space-x-2'>
                  <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => resetForm()}
                        className='bg-white text-black border border-gray-200 hover:border-gray-400 transition-colors flex items-center h-10'>
                        <Plus className='w-4 h-4 mr-2' />
                        Add New Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-md bg-white text-black'>
                      <DialogHeader>
                        <DialogTitle>Add New Menu Item</DialogTitle>
                        <DialogDescription>
                          Add a new item to your menu with details and image.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={handleSubmit}
                        className='space-y-4 text-black'>
                        <div>
                          <Label htmlFor='name'>Item Name</Label>
                          <Input
                            id='name'
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                            className='bg-white text-black placeholder:text-black'
                          />
                        </div>
                        <div>
                          <Label htmlFor='price'>Price (₹)</Label>
                          <Input
                            id='price'
                            type='number'
                            step='0.01'
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              })
                            }
                            required
                            className='bg-white text-black placeholder:text-black'
                          />
                        </div>
                        <div>
                          <Label htmlFor='description'>Description</Label>
                          <Textarea
                            id='description'
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            className='bg-white text-black placeholder:text-black'
                          />
                        </div>
                        <div>
                          <Label htmlFor='category'>Category</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) =>
                              setFormData({ ...formData, category: value })
                            }>
                            <SelectTrigger className='bg-white text-black'>
                              <SelectValue
                                placeholder='Select category'
                                className='text-black'
                              />
                            </SelectTrigger>
                            <SelectContent className='bg-white text-black'>
                              <SelectItem value='appetizers'>
                                Appetizers
                              </SelectItem>
                              <SelectItem value='main-course'>
                                Main Course
                              </SelectItem>
                              <SelectItem value='desserts'>Desserts</SelectItem>
                              <SelectItem value='beverages'>
                                Beverages
                              </SelectItem>
                              <SelectItem value='snacks'>Snacks</SelectItem>
                              <SelectItem value='salads'>Salads</SelectItem>
                              <SelectItem value='soups'>Soups</SelectItem>
                              <SelectItem value='breads'>Breads</SelectItem>
                              <SelectItem value='rice'>Rice</SelectItem>
                              <SelectItem value='others'>Others</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor='image'>Image</Label>
                          <Input
                            id='image'
                            type='file'
                            accept='image/*'
                            onChange={handleImageUpload}
                            className='bg-white text-black placeholder:text-black'
                          />
                          {imagePreview && (
                            <div className='mt-2'>
                              <img
                                src={imagePreview}
                                alt='Preview'
                                className='w-20 h-20 object-cover rounded'
                              />
                            </div>
                          )}
                        </div>
                        {/* Remove the Vegetarian checkbox from Add Menu Item form */}
                        {/* <div className='flex items-center space-x-2'>
                          <input
                            type='checkbox'
                            id='isVeg'
                            checked={formData.isVeg}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                isVeg: e.target.checked,
                              })
                            }
                            className='bg-white'
                          />
                          <Label htmlFor='isVeg'>Vegetarian</Label>
                        </div> */}
                        <Button type='submit' className='w-full'>
                          Add Item
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    onClick={fetchData}
                    className='bg-white text-black border border-gray-200 hover:border-gray-400 transition-colors flex items-center h-10'
                    title='Refresh menu items'>
                    <RefreshCw className='w-4 h-4 mr-1' />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Search bar above menu items */}
              <div className='flex flex-col md:flex-row md:items-center md:space-x-4 mb-6'>
                {/* Search */}
                <div className='relative w-full md:w-1/3 mb-2 md:mb-0'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                    <svg
                      width='18'
                      height='18'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      viewBox='0 0 24 24'>
                      <circle cx='11' cy='11' r='8' />
                      <path d='M21 21l-4.35-4.35' />
                    </svg>
                  </span>
                  <input
                    type='text'
                    placeholder='Search menu items by name...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700'
                  />
                </div>
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='rounded-lg border border-gray-200 bg-white shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700 mr-2'>
                  <option value='all'>All Items ({menuItems.length})</option>
                  <option value='active'>
                    Active Items (
                    {
                      menuItems.filter((i) =>
                        'available' in i ? i.available : true
                      ).length
                    }
                    )
                  </option>
                  <option value='inactive'>
                    Inactive Items (
                    {
                      menuItems.filter((i) =>
                        'available' in i ? !i.available : false
                      ).length
                    }
                    )
                  </option>
                </select>
                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className='rounded-lg border border-gray-200 bg-white shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700'>
                  <option value='all'>All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                  <option value='snacks'>Snacks</option>
                  <option value='salads'>Salads</option>
                  <option value='soups'>Soups</option>
                  <option value='breads'>Breads</option>

                  <option value='beverages'>Beverages</option>
                  <option value='desserts'>Desserts</option>
                  <option value='others'>Others</option>
                </select>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredItems.map((item) => (
                  <Card
                    key={item._id}
                    className='flex flex-col h-full bg-white border-2 border-white shadow-md rounded-xl transition-all duration-200 hover:shadow-xl hover:outline hover:outline-2 hover:outline-white'>
                    <div className='relative bg-white rounded-t-xl'>
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className='w-full h-40 object-cover rounded-t-xl bg-white'
                      />
                      <span className='absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full'>
                        Active
                      </span>
                      {item.isVeg ? (
                        <span className='absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center'>
                          <Leaf className='w-3 h-3 mr-1' /> VEG
                        </span>
                      ) : (
                        <span className='absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center'>
                          <Leaf className='w-3 h-3 mr-1 rotate-180' /> NON-VEG
                        </span>
                      )}
                    </div>
                    <CardContent className='flex-1 flex flex-col p-4 bg-white'>
                      <h3 className='font-semibold text-gray-800'>
                        {item.name}
                      </h3>
                      <p className='text-xs text-gray-500 mb-2'>
                        {item.description || 'No description available'}
                      </p>
                      <div className='mb-2'>
                        <span className='text-lg font-bold text-gray-800'>
                          ₹{item.price}
                        </span>
                        {/* If you want to show a strikethrough price, add here: */}
                        {/* <span className='text-sm text-gray-400 line-through ml-2'>₹{item.originalPrice}</span> */}
                      </div>
                      <p className='text-xs text-gray-500 capitalize'>
                        {item.category}
                      </p>
                      <div className='flex space-x-4 mt-auto'>
                        <Button
                          size='sm'
                          variant='outline'
                          className='bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 flex items-center px-4'
                          onClick={() => handleEdit(item)}>
                          <Edit className='w-4 h-4 mr-1' /> Edit
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          className='bg-red-50 text-red-700 border-none hover:bg-red-100 flex items-center px-4'
                          onClick={() => handleDelete(item._id)}>
                          <span className='w-2 h-2 bg-red-500 rounded-full mr-2 inline-block'></span>
                          Deactivate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className='space-y-6'>
              <div className='flex justify-between items-center'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-800 mb-2'>
                    Orders
                  </h1>
                  <p className='text-gray-600'>
                    Manage and track all orders in real-time
                  </p>
                </div>
                <Button
                  variant='outline'
                  onClick={fetchData}
                  className='bg-white text-black border border-gray-200 hover:border-gray-400 flex items-center space-x-2'>
                  <RefreshCw className='w-4 h-4' />
                  <span>Refresh</span>
                </Button>
              </div>

              <div className='space-y-6'>
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className='bg-white rounded-xl shadow p-6 flex flex-col space-y-4'
                    onClick={() => fetchOrderDetails(order._id)}
                    style={{ cursor: 'pointer' }}>
                    {/* Header: Order number, status, date, total */}
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center space-x-3'>
                        <span className='font-bold text-lg'>
                          Order #{order._id.slice(-4)}
                        </span>
                        <span className='bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-semibold'>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <span className='font-bold text-xl'>
                        ₹{order.total.toFixed(2)}
                      </span>
                    </div>
                    <div className='text-sm text-gray-500'>
                      Order Date: {new Date(order.createdAt).toLocaleString()}
                    </div>
                    <hr className='my-2' />
                    {/* Customer Details and Address */}
                    <div className='flex flex-col md:flex-row md:justify-between md:items-start gap-4'>
                      <div>
                        <div className='font-semibold'>Customer Details</div>
                        <div>{order.customerName || 'N/A'}</div>
                        <div>{order.customerPhone || 'N/A'}</div>
                      </div>
                      <div className='text-right text-blue-900'>
                        {order.customerAddress || 'N/A'}
                      </div>
                    </div>
                    {/* Order Items */}
                    <div>
                      <div className='font-semibold mt-4'>Order Items</div>
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className='flex justify-between text-sm mt-1'>
                          <span>
                            <span className='font-semibold'>
                              {item.item.name}
                            </span>
                            <span className='ml-2 text-gray-500'>
                              Quantity: {item.quantity}
                            </span>
                          </span>
                          <span className='text-right'>
                            ₹{(item.item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Status Update */}
                    <div className='mt-4 pt-4 border-t border-gray-200'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          <span className='text-sm font-medium text-gray-700'>
                            Status:
                          </span>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className='ml-1'>
                              {order.status.toUpperCase()}
                            </span>
                          </Badge>
                        </div>
                        <div className='flex space-x-2'>
                          <div className='text-xs text-gray-500 italic'>
                            Status updates require backend API support
                          </div>
                          {/* Disabled buttons with tooltips */}
                          {order.status === 'placed' && (
                            <Button
                              size='sm'
                              disabled
                              title='Backend API support required for status updates'
                              className='bg-gray-300 text-gray-500 cursor-not-allowed'>
                              Start Preparing
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button
                              size='sm'
                              disabled
                              title='Backend API support required for status updates'
                              className='bg-gray-300 text-gray-500 cursor-not-allowed'>
                              Mark Ready
                            </Button>
                          )}
                          {order.status === 'ready' && (
                            <Button
                              size='sm'
                              disabled
                              title='Backend API support required for status updates'
                              className='bg-gray-300 text-gray-500 cursor-not-allowed'>
                              Complete Order
                            </Button>
                          )}
                          {(order.status === 'placed' ||
                            order.status === 'preparing') && (
                            <Button
                              size='sm'
                              variant='outline'
                              disabled
                              title='Backend API support required for status updates'
                              className='border-gray-300 text-gray-500 cursor-not-allowed'>
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Orders Section (now at the bottom) */}
              <div className='mt-10'>
                <span className='text-xs font-semibold text-gray-400 tracking-widest'>
                  RECENT ORDERS
                </span>
                <div className='mt-3 flex flex-col gap-2'>
                  {orders && orders.length > 0 ? (
                    orders
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .slice(0, 5)
                      .map((order) => (
                        <div
                          key={order._id}
                          className='flex flex-col bg-gray-50 rounded-lg p-2 border border-gray-100 hover:bg-blue-50 transition cursor-pointer mb-1'>
                          <div className='flex items-center justify-between'>
                            <span className='font-semibold text-sm text-gray-800'>
                              #{order._id.slice(-4)}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                                order.status
                              )}`}
                              style={{ minWidth: 70, textAlign: 'center' }}>
                              {getStatusIcon(order.status)}
                              <span className='ml-1'>
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </span>
                            </span>
                          </div>
                          <div className='flex items-center justify-between mt-1'>
                            <span className='text-xs text-gray-500'>
                              ₹{order.total.toFixed(2)}
                            </span>
                            <span className='text-xs text-gray-400'>
                              {new Date(order.createdAt).toLocaleTimeString(
                                [],
                                { hour: '2-digit', minute: '2-digit' }
                              )}
                            </span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className='text-xs text-gray-400 mt-2'>
                      No recent orders
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className='space-y-6'>
              <div>
                <h1 className='text-2xl font-bold text-gray-800 mb-2'>
                  Analytics
                </h1>
                <p className='text-gray-600'>
                  Detailed insights about your business performance
                </p>
              </div>

              {/* Calculate real analytics data */}
              {(() => {
                // Calculate order status distribution
                const statusData = [
                  {
                    name: 'Completed',
                    value: orders.filter((o) => o.status === 'completed')
                      .length,
                  },
                  {
                    name: 'Preparing',
                    value: orders.filter((o) => o.status === 'preparing')
                      .length,
                  },
                  {
                    name: 'Placed',
                    value: orders.filter((o) => o.status === 'placed').length,
                  },
                  {
                    name: 'Cancelled',
                    value: orders.filter((o) => o.status === 'cancelled')
                      .length,
                  },
                ];

                // Calculate popular items from actual orders
                const itemStats = new Map<
                  string,
                  { orders: number; revenue: number }
                >();

                orders.forEach((order) => {
                  order.items.forEach((orderItem) => {
                    const itemName = orderItem.item.name;
                    const quantity = orderItem.quantity;
                    const price = orderItem.item.price;
                    const revenue = quantity * price;

                    if (itemStats.has(itemName)) {
                      const existing = itemStats.get(itemName)!;
                      existing.orders += quantity;
                      existing.revenue += revenue;
                    } else {
                      itemStats.set(itemName, { orders: quantity, revenue });
                    }
                  });
                });

                const popularItems = Array.from(itemStats.entries())
                  .map(([name, stats]) => ({
                    name,
                    orders: stats.orders,
                    revenue: stats.revenue,
                  }))
                  .sort((a, b) => b.orders - a.orders)
                  .slice(0, 5);

                return (
                  <>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                      <Card className='bg-blue-50'>
                        <CardHeader>
                          <CardTitle className='text-gray-800'>
                            Revenue Trend (Last 7 Days)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className='flex items-center justify-center h-[300px] text-gray-500'>
                            <div className='text-center'>
                              <p className='text-lg font-medium'>
                                No Revenue Data
                              </p>
                              <p className='text-sm'>
                                Revenue trends will appear here once orders are
                                placed
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className='bg-blue-50'>
                        <CardHeader>
                          <CardTitle className='text-gray-800'>
                            Order Status Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width='100%' height={300}>
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx='50%'
                                cy='50%'
                                labelLine={false}
                                label={({ name, percent }) =>
                                  `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill='#8884d8'
                                dataKey='value'>
                                {statusData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className='bg-blue-50'>
                      <CardHeader>
                        <CardTitle className='text-gray-800'>
                          Top Performing Items
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-4'>
                          {popularItems.length > 0 ? (
                            popularItems.map((item, index) => (
                              <div
                                key={index}
                                className='flex items-center justify-between p-4 border rounded-lg'>
                                <div className='flex items-center space-x-4'>
                                  <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                                    <span className='text-sm font-semibold text-blue-600'>
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className='font-semibold text-gray-800'>
                                      {item.name}
                                    </h4>
                                    <p className='text-sm text-gray-600'>
                                      {item.orders} orders
                                    </p>
                                  </div>
                                </div>
                                <div className='text-right'>
                                  <p className='font-semibold text-gray-800'>
                                    ₹{item.revenue.toFixed(2)}
                                  </p>
                                  <p className='text-sm text-gray-600'>
                                    Revenue
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className='text-center py-8 text-gray-500'>
                              <p>No order data available yet</p>
                              <p className='text-sm'>
                                Orders will appear here once customers start
                                ordering
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
        <DialogContent className='max-w-md bg-white border border-gray-200 text-black'>
          <DialogHeader>
            <DialogTitle className='text-black'>Edit Menu Item</DialogTitle>
            <DialogDescription className='text-black'>
              Update the details of your menu item.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4 text-black'>
            <div>
              <Label htmlFor='edit-name' className='text-black'>
                Item Name
              </Label>
              <Input
                id='edit-name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className='bg-white text-black placeholder:text-black'
              />
            </div>
            <div>
              <Label htmlFor='edit-price' className='text-black'>
                Price (₹)
              </Label>
              <Input
                id='edit-price'
                type='number'
                step='0.01'
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                className='bg-white text-black placeholder:text-black'
              />
            </div>
            <div>
              <Label htmlFor='edit-description' className='text-black'>
                Description
              </Label>
              <Textarea
                id='edit-description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className='bg-white text-black placeholder:text-black'
              />
            </div>
            <div>
              <Label htmlFor='edit-category' className='text-black'>
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }>
                <SelectTrigger className='bg-white text-black'>
                  <SelectValue
                    placeholder='Select category'
                    className='text-black'
                  />
                </SelectTrigger>
                <SelectContent className='bg-white text-black'>
                  <SelectItem value='appetizers' className='text-black'>
                    Appetizers
                  </SelectItem>
                  <SelectItem value='main-course' className='text-black'>
                    Main Course
                  </SelectItem>
                  <SelectItem value='desserts' className='text-black'>
                    Desserts
                  </SelectItem>
                  <SelectItem value='beverages' className='text-black'>
                    Beverages
                  </SelectItem>
                  <SelectItem value='snacks' className='text-black'>
                    Snacks
                  </SelectItem>
                  <SelectItem value='salads' className='text-black'>
                    Salads
                  </SelectItem>
                  <SelectItem value='soups' className='text-black'>
                    Soups
                  </SelectItem>
                  <SelectItem value='breads' className='text-black'>
                    Breads
                  </SelectItem>
                  <SelectItem value='rice' className='text-black'>
                    Rice
                  </SelectItem>
                  <SelectItem value='others' className='text-black'>
                    Others
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='edit-image' className='text-black'>
                Image
              </Label>
              <Input
                id='edit-image'
                type='file'
                accept='image/*'
                onChange={handleImageUpload}
                className='bg-white text-black placeholder:text-black'
              />
              {imagePreview && (
                <div className='mt-2'>
                  <img
                    src={imagePreview}
                    alt='Preview'
                    className='w-20 h-20 object-cover rounded'
                  />
                </div>
              )}
            </div>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='edit-isVeg'
                  checked={formData.isVeg}
                  onChange={(e) =>
                    setFormData({ ...formData, isVeg: e.target.checked })
                  }
                  className='bg-white text-black'
                />
                <Label htmlFor='edit-isVeg' className='text-black'>
                  Vegetarian
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='edit-isNonVeg'
                  checked={!formData.isVeg}
                  onChange={(e) =>
                    setFormData({ ...formData, isVeg: !e.target.checked })
                  }
                  className='bg-white text-black'
                />
                <Label htmlFor='edit-isNonVeg' className='text-black'>
                  Non-Vegetarian
                </Label>
              </div>
            </div>
            <Button type='submit' className='w-full'>
              Update Item
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      {orderDetails && (
        <Dialog
          open={!!orderDetails}
          onOpenChange={() => setOrderDetails(null)}>
          <DialogContent className='max-w-lg bg-white border border-gray-200 text-black'>
            <DialogHeader>
              <DialogTitle className='text-black'>Order Details</DialogTitle>
              <DialogDescription className='text-black'>
                Detailed information for Order #{orderDetails._id.slice(-4)}
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='font-semibold'>Order ID:</span>
                <span>{orderDetails._id}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-semibold'>Status:</span>
                <span>{orderDetails.status}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-semibold'>Total:</span>
                <span>₹{orderDetails.total.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-semibold'>Order Date:</span>
                <span>{new Date(orderDetails.createdAt).toLocaleString()}</span>
              </div>
              <div className='font-semibold mt-2'>Customer Details</div>
              <div>Name: {orderDetails.customerName || 'N/A'}</div>
              <div>Phone: {orderDetails.customerPhone || 'N/A'}</div>
              <div>Address: {orderDetails.customerAddress || 'N/A'}</div>
              <div className='font-semibold mt-2'>Order Items</div>
              <div className='space-y-1'>
                {orderDetails.items.map((item, idx) => (
                  <div key={idx} className='flex justify-between'>
                    <span>
                      {item.item.name} x {item.quantity}
                    </span>
                    <span>₹{(item.item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setOrderDetails(null)}
              className='w-full mt-4'>
              Close
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
