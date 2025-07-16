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
  Bell,
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
import { useNotificationToast } from '@/hooks/use-notification';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
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
  const [orderDetails, setOrderDetails] = useState<any | null>(null);

  // Add state for profile form
  const [profileData, setProfileData] = useState({
    panOrGst: '',
    accountNo: '',
    bankName: '',
    ifsc: '',
    branch: '',
    upiId: '',
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Personal details state
  const [personalData, setPersonalData] = useState({
    vendorName: '',
    contactPerson: '',
    mobileNumber: '',
    email: '',
    address: '',
    profilePic: '',
  });
  const [personalSubmitting, setPersonalSubmitting] = useState(false);
  const [personalSuccess, setPersonalSuccess] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');

  // Handle profile picture upload
  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
        setPersonalData((prev) => ({
          ...prev,
          profilePic: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);

      console.log(user, 'user');
      // Get canteen ID from authenticated user
      if (!isAuthenticated || !user || user?.role !== 'canteen') {
        toast({
          title: 'Error',
          description: 'You must be logged in as a canteen user',
          variant: 'destructive',
        });
        return;
      }

      // Use the specific canteen ID provided
      const canteenId = user.id;
      console.log(canteenId, 'canteenId');

      // Validate canteen ID
      if (!canteenId) {
        console.error('No canteen ID found in user object');
        toast({
          title: 'Error',
          description: 'Canteen ID not found. Please logout and login again.',
          variant: 'destructive',
        });
        return;
      }

      const token = localStorage.getItem('token') || '';
      console.log(token, 'token');

      // Call each API independently and set data individually
      try {
        const menuData = await axios.get(`/api/v1/menu/${canteenId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log(menuData, 'menuData');
        const menuItemsToSet = Array.isArray(menuData.data)
          ? menuData.data
          : [];
        setMenuItems(menuItemsToSet);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      }

      try {
        const ordersData = await getCanteenOrders(canteenId, token);
        const ordersToSet = Array.isArray(ordersData?.data)
          ? ordersData.data
          : [];
        setOrders(ordersToSet);
      } catch (error) {
        console.error('Error fetching orders data:', error);
      }

      try {
        const statsData = await getCanteenStats(canteenId, token);
        const statsToSet = statsData?.data || null;
        setCanteenStats(statsToSet);
      } catch (error) {
        console.error('Error fetching stats data:', error);
      }
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
      if (!isAuthenticated || !user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to access this feature',
          variant: 'destructive',
        });
        return;
      }

      let imageUrl = formData.image;
      if (selectedImage) {
        const uploadedImage = await uploadImage(selectedImage);
        imageUrl = uploadedImage.url;
      }

      // Validate that we have a valid canteen ID
      if (!user.id) {
        toast({
          title: 'Error',
          description: 'User ID not found. Please logout and login again.',
          variant: 'destructive',
        });
        return;
      }

      const itemData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        canteen: user.id,
        isVeg: formData.isVeg,
        image: imageUrl,
      };

      if (editingItem) {
        await updateMenuItem(editingItem._id, {
          name: itemData.name,
          price: itemData.price,
          description: itemData.description,
          category: itemData.category,
          isVeg: itemData.isVeg,
        });
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

  useNotificationToast();

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <div className='w-64 h-screen bg-white border-r border-gray-200 flex flex-col overflow-y-auto shadow-lg px-0 py-0'>
        {/* Brand */}
        <div className='px-8 py-3 '></div>
        {/* Overview Section */}
        <div className='px-8 mb-2'>
          <span className='text-xs font-semibold text-gray-400 tracking-widest'>
            OVERVIEW
          </span>
        </div>
        <nav className='flex flex-col gap-1 px-4'>
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
        <Separator className='my-4 bg-gray-200' />
        {/* Management Section */}
        <div className='px-8 mb-2'>
          <span className='text-xs font-semibold text-gray-400 tracking-widest'>
            MANAGEMENT
          </span>
        </div>
        <nav className='flex flex-col gap-1 px-4'>
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
        <Separator className='my-4 bg-gray-200' />
        {/* Profile Section */}
        <div className='px-8 mb-2'>
          <span className='text-xs font-semibold text-gray-400 tracking-widest'>
            PROFILE
          </span>
        </div>
        <nav className='flex flex-col gap-1 px-4 mb-6'>
          <button
            className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
              activeTab === 'profile'
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition'
            }`}
            onClick={() => setActiveTab('profile')}>
            <Users className='w-5 h-5' />
            <span>Profile</span>
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
              activeTab === 'payouts'
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition'
            }`}
            onClick={() => setActiveTab('payouts')}>
            <DollarSign className='w-5 h-5' />
            <span>Payouts</span>
          </button>
          <button
            className='flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition mt-2'
            onClick={() => {
              localStorage.clear();
              if (typeof (useAuth as any).logout === 'function') {
                (useAuth as any).logout();
              }
              window.location.href = '/login';
            }}
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

      {/* Main Content */}
      <div className='flex-1 overflow-auto'>
        <div className='p-8 max-w-7xl mx-auto'>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className='space-y-10'>
              <div className='mb-6'>
                <h2 className='text-3xl font-bold text-blue-900 mb-2'>
                  Campus Vendor Partner
                </h2>
                <Separator className='mb-4 bg-gray-200' />
                <h1 className='text-2xl font-bold text-gray-800 mb-1'>
                  Dashboard Overview
                </h1>
                <p className='text-gray-600'>
                  Welcome back! Here's what's happening with your canteen today.
                </p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                <Card className='bg-white shadow-md transition-transform duration-200 hover:shadow-lg hover:scale-105 border-gray-200'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-gray-600'>
                      Total Orders
                    </CardTitle>
                    <ShoppingCart className='h-4 w-4 text-gray-400' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-gray-800'>
                      {canteenStats?.totalOrders ?? 0}
                    </div>
                    <p className='text-xs text-gray-600'>All time orders</p>
                  </CardContent>
                </Card>

                <Card className='bg-white shadow-md transition-transform duration-200 hover:shadow-lg hover:scale-105 border-gray-200'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-gray-600'>
                      Revenue
                    </CardTitle>
                    <DollarSign className='h-4 w-4 text-gray-400' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-gray-800'>
                      ₹{canteenStats?.totalRevenue ?? 0}
                    </div>
                    <p className='text-xs text-gray-600'>Total revenue</p>
                  </CardContent>
                </Card>

                <Card className='bg-white shadow-md transition-transform duration-200 hover:shadow-lg hover:scale-105 border-gray-200'>
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

                <Card className='bg-white shadow-md transition-transform duration-200 hover:shadow-lg hover:scale-105 border-gray-200'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-gray-600'>
                      Pending Orders
                    </CardTitle>
                    <Clock className='h-4 w-4 text-gray-400' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-gray-800'>
                      {canteenStats?.pendingOrders ?? 0}
                    </div>
                    <p className='text-xs text-gray-600'>Need attention</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Menu Items Tab */}
          {activeTab === 'menu' && (
            <div className='space-y-10'>
              <div className='flex justify-between items-end mb-6'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-800 mb-1'>
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
              <Separator className='mb-6 bg-gray-200' />
              {/* Search bar above menu items */}
              <div className='flex flex-col md:flex-row md:items-center md:space-x-4 mb-8 gap-4'>
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

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
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
            <div className='space-y-10'>
              <div className='flex justify-between items-end mb-6'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-800 mb-1'>
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
              <Separator className='mb-6 bg-gray-200' />
              <div className='space-y-8'>
                {orders.map((order: any) => (
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
                      {order.items.map((item: any, idx: any) => (
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
              {/* <Separator className='my-10' /> */}
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
            <div className='space-y-10'>
              <div className='mb-6'>
                <h1 className='text-2xl font-bold text-gray-800 mb-1'>
                  Analytics
                </h1>
                <p className='text-gray-600'>
                  Detailed insights about your business performance
                </p>
              </div>
              <Separator className='mb-6 bg-gray-200' />
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
                      <Card className='bg-blue-50 border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105'>
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

                      <Card className='bg-blue-50 border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105'>
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

                    <Card className='bg-blue-50 border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105'>
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

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className='max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow-lg space-y-6 border border-gray-100'>
              <h2 className='text-2xl font-bold text-gray-800 mb-2'>
                Vendor Profile
              </h2>
              <Separator className='mb-6 bg-gray-200' />
              {/* Personal Details Section */}
              <div className='mb-6'>
                <h3 className='text-xl font-semibold text-gray-700 mb-4'>
                  Personal Details
                </h3>
                <form
                  className='space-y-4'
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setPersonalSubmitting(true);
                    await new Promise((res) => setTimeout(res, 1200));
                    setPersonalSuccess(true);
                    setTimeout(() => setPersonalSuccess(false), 2000);
                    setPersonalSubmitting(false);
                  }}>
                  <div className='flex items-center gap-8'>
                    <div className='relative'>
                      <img
                        src={
                          profilePicPreview ||
                          personalData.profilePic ||
                          '/placeholder-user.jpg'
                        }
                        alt='Profile'
                        className='w-24 h-24 rounded-full object-cover border border-gray-300'
                      />
                      <label className='absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700'>
                        <input
                          type='file'
                          accept='image/*'
                          className='hidden'
                          onChange={handleProfilePicUpload}
                        />
                        <Upload className='w-4 h-4' />
                      </label>
                    </div>
                    <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block font-medium mb-1 text-black'>
                          Vendor Name
                        </label>
                        <input
                          type='text'
                          className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                          placeholder='Enter vendor/canteen name'
                          value={personalData.vendorName}
                          onChange={(e) =>
                            setPersonalData({
                              ...personalData,
                              vendorName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className='block font-medium mb-1 text-black'>
                          Contact Person
                        </label>
                        <input
                          type='text'
                          className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                          placeholder='Enter contact person name'
                          value={personalData.contactPerson}
                          onChange={(e) =>
                            setPersonalData({
                              ...personalData,
                              contactPerson: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className='block font-medium mb-1 text-black'>
                          Mobile Number
                        </label>
                        <input
                          type='text'
                          className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                          placeholder='Enter mobile number'
                          value={personalData.mobileNumber}
                          onChange={(e) =>
                            setPersonalData({
                              ...personalData,
                              mobileNumber: e.target.value
                                .replace(/[^0-9]/g, '')
                                .slice(0, 10),
                            })
                          }
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <label className='block font-medium mb-1 text-black'>
                          Email
                        </label>
                        <input
                          type='email'
                          className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                          placeholder='Enter email address'
                          value={personalData.email}
                          onChange={(e) =>
                            setPersonalData({
                              ...personalData,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className='block font-medium mb-1 text-black'>
                      Address
                    </label>
                    <textarea
                      className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                      placeholder='Enter address'
                      value={personalData.address}
                      onChange={(e) =>
                        setPersonalData({
                          ...personalData,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button
                    type='submit'
                    className='w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2'
                    disabled={personalSubmitting}>
                    {personalSubmitting ? 'Saving...' : 'Save Personal Details'}
                  </button>
                  {personalSuccess && (
                    <div className='text-green-600 text-center mt-2'>
                      Personal details updated successfully!
                    </div>
                  )}
                </form>
              </div>
              <Separator className='mb-6 bg-gray-200' />
              {/* Bank/Payout Details Section */}
              <div>
                <h3 className='text-xl font-semibold text-gray-700 mb-4'>
                  Bank / Payout Details
                </h3>
                <form
                  className='space-y-4'
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setProfileSubmitting(true);
                    await new Promise((res) => setTimeout(res, 1200));
                    setProfileSuccess(true);
                    setTimeout(() => setProfileSuccess(false), 2000);
                    setProfileSubmitting(false);
                  }}>
                  <div>
                    <label className='block font-medium mb-1 text-black'>
                      PAN Card or GST No.{' '}
                      <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                      placeholder='Enter PAN or GST number'
                      value={profileData.panOrGst}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          panOrGst: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block font-medium mb-1'>
                        Account Number
                      </label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                        placeholder='Enter account number'
                        value={profileData.accountNo}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            accountNo: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block font-medium mb-1'>
                        Bank Name
                      </label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                        placeholder='Enter bank name'
                        value={profileData.bankName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bankName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block font-medium mb-1'>
                        IFSC Code
                      </label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                        placeholder='Enter IFSC code'
                        value={profileData.ifsc}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            ifsc: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className='block font-medium mb-1'>Branch</label>
                      <input
                        type='text'
                        className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                        placeholder='Enter branch name'
                        value={profileData.branch}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            branch: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className='flex items-center my-2'>
                    <span className='text-gray-500 mx-2'>OR</span>
                  </div>
                  <div>
                    <label className='block font-medium mb-1 text-black'>
                      UPI ID
                    </label>
                    <input
                      type='text'
                      className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                      placeholder='Enter UPI ID (if applicable)'
                      value={profileData.upiId}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          upiId: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button
                    type='submit'
                    className='w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2'
                    disabled={profileSubmitting}>
                    {profileSubmitting ? 'Saving...' : 'Save Bank Details'}
                  </button>
                  {profileSuccess && (
                    <div className='text-green-600 text-center mt-2'>
                      Bank details updated successfully!
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* Payouts Tab */}
          {activeTab === 'payouts' && (
            <div className='space-y-10'>
              <div className='mb-6'>
                <h1 className='text-2xl font-bold text-gray-800 mb-1'>
                  Payouts & Earnings
                </h1>
                <p className='text-gray-600'>
                  Track your earnings and manage payout requests
                </p>
              </div>
              <Separator className='mb-6 bg-gray-200' />

              {/* Payout Summary Cards */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <Card className='bg-gradient-to-r from-green-50 to-green-100 border border-green-200 shadow-md'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-green-700'>
                      Total Earnings
                    </CardTitle>
                    <TrendingUp className='h-4 w-4 text-green-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-green-800'>
                      ₹{canteenStats?.totalRevenue || 0}
                    </div>
                    <p className='text-xs text-green-600'>All time earnings</p>
                  </CardContent>
                </Card>

                <Card className='bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-md'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-blue-700'>
                      Available Balance
                    </CardTitle>
                    <DollarSign className='h-4 w-4 text-blue-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-blue-800'>
                      ₹{((canteenStats?.totalRevenue || 0) * 0.85).toFixed(0)}
                    </div>
                    <p className='text-xs text-blue-600'>Ready for payout</p>
                  </CardContent>
                </Card>

                <Card className='bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 shadow-md'>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium text-orange-700'>
                      Pending Payouts
                    </CardTitle>
                    <Clock className='h-4 w-4 text-orange-600' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-orange-800'>₹0</div>
                    <p className='text-xs text-orange-600'>Processing</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className='flex flex-col sm:flex-row gap-4'>
                <Button className='bg-green-600 hover:bg-green-700 text-white flex items-center'>
                  <DollarSign className='w-4 h-4 mr-2' />
                  Request Payout
                </Button>
                <Button
                  variant='outline'
                  className='border-gray-300 text-gray-700 hover:bg-gray-50'>
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Refresh Balance
                </Button>
              </div>

              {/* Payout History */}
              <Card className='bg-white border border-gray-200 shadow-md'>
                <CardHeader>
                  <CardTitle className='text-gray-800'>
                    Payout History
                  </CardTitle>
                  <CardDescription className='text-gray-600'>
                    Your recent payout transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {/* Sample payout entries */}
                    <div className='flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                          <CheckCircle className='w-5 h-5 text-green-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-800'>
                            Payout #1234
                          </h4>
                          <p className='text-sm text-gray-600'>
                            Completed on Dec 15, 2024
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold text-gray-800'>₹0</p>
                        <p className='text-sm text-green-600'>Completed</p>
                      </div>
                    </div>

                    <div className='flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center'>
                          <Clock className='w-5 h-5 text-orange-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-800'>
                            Payout #1235
                          </h4>
                          <p className='text-sm text-gray-600'>
                            Requested on Dec 18, 2024
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold text-gray-800'>₹0</p>
                        <p className='text-sm text-orange-600'>Processing</p>
                      </div>
                    </div>

                    <div className='flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                          <CheckCircle className='w-5 h-5 text-green-600' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-gray-800'>
                            Payout #1233
                          </h4>
                          <p className='text-sm text-gray-600'>
                            Completed on Dec 10, 2024
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold text-gray-800'>₹0</p>
                        <p className='text-sm text-green-600'>Completed</p>
                      </div>
                    </div>
                  </div>

                  {/* Empty state fallback */}
                  {orders.length === 0 && (
                    <div className='text-center py-8 text-gray-500'>
                      <DollarSign className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                      <p className='text-lg font-medium'>No payouts yet</p>
                      <p className='text-sm'>
                        Your payout history will appear here once you start
                        receiving payments
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payout Information */}
              <Card className='bg-blue-50 border border-blue-200 shadow-md'>
                <CardHeader>
                  <CardTitle className='text-blue-800 flex items-center'>
                    <Bell className='w-5 h-5 mr-2' />
                    Payout Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-blue-700'>
                  <div className='flex items-start space-x-2'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
                    <p className='text-sm'>
                      Payouts are processed every Monday and Thursday
                    </p>
                  </div>
                  <div className='flex items-start space-x-2'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
                    <p className='text-sm'>Minimum payout amount is ₹500</p>
                  </div>
                  <div className='flex items-start space-x-2'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
                    <p className='text-sm'>
                      Platform fee of 15% is deducted from earnings
                    </p>
                  </div>
                  <div className='flex items-start space-x-2'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full mt-2'></div>
                    <p className='text-sm'>
                      Payments are made to your registered bank account
                    </p>
                  </div>
                </CardContent>
              </Card>
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
                {orderDetails.items.map((item: any, idx: any) => (
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
