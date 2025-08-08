'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  MenuItem,
} from '@/services/menuService';
import {
  getCanteenOrders,
  getCanteenStats,
  CanteenStats,
  getCanteenByOwner,
} from '@/services/canteenOrderService';
import { Order } from '@/types';
import {
  uploadImage,
  validateImage,
  createImagePreview,
} from '@/services/imageService';
import { useAuth } from '@/context/auth-context';
import { CampusOnlyRoute } from '@/components/RouteProtection';
import { getOrderById } from '@/services/orderService';
import axios from 'axios';
import { DashboardSidebar } from '@/app/campus/dashboard/DashboardSidebar';
import { OverviewTab } from '@/app/campus/dashboard/OverviewTab';
import { MenuTab } from '@/app/campus/dashboard/MenuTab';
import { OrdersTab } from '@/app/campus/dashboard/OrdersTab';
import { AnalyticsTab } from '@/app/campus/dashboard/AnalyticsTab';
import { ProfileTab } from '@/app/campus/dashboard/ProfileTab';
import { PayoutsTab } from '@/app/campus/dashboard/PayoutsTab';
import { OrderDetailsDialog } from '@/app/campus/dashboard/OrderDetailsDialog';
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  CheckCircle,
  Clock,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from '@/components/ui/sheet';
import { Menu as MenuIcon } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useSocket } from '@/context/socket-context';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function DashboardContent() {
  // Move all hooks to the top
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Check for tab parameter in URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (
      tabParam &&
      [
        'overview',
        'orders',
        'menu',
        'analytics',
        'profile',
        'payouts',
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [canteenStats, setCanteenStats] = useState<CanteenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [notApprovedDialog, setNotApprovedDialog] = useState(false);

  const [canteenId, setCanteenId] = useState('');
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    isVeg: false,
    available: true,
    image: '',
    portion: '',
    quantity: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [readyFilter, setReadyFilter] = useState('all');
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
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
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    upiId: '',
  });
  const [bankSubmitting, setBankSubmitting] = useState(false);
  const [bankSuccess, setBankSuccess] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const { getSocket, connectSocket, disconnectSocket } = useSocket();

  useEffect(() => {
    const canteenId = localStorage.getItem('canteenId');
    if (canteenId) {
      setCanteenId(canteenId);
    }
  }, []);

  // Fixed Socket Connection Effect
  useEffect(() => {
    if (!canteenId) {
      return;
    }

    connectSocket();
    const socket = getSocket();

    if (!socket) {
      console.error('Socket not available');
      return;
    }

    // Join the canteen room
    socket.emit('Join_Room', canteenId);

    // Handle new orders
    const handleNewOrder = (data: any) => {
      // Validate order data
      if (!data || !data._id) {
        return;
      }

      // Transform the data if needed to match your Order type
      const transformedOrder = {
        ...data,
        status: data.status || 'pending',
        createdAt: data.createdAt || new Date().toISOString(),
      };

      setOrders((prevOrders) => {
        // Check for duplicates
        const orderExists = prevOrders.some((order) => order._id === data._id);
        if (orderExists) {
          return prevOrders;
        }

        const newOrders = [transformedOrder, ...prevOrders]; // Add to beginning for latest first

        return newOrders;
      });

      // Show toast notification
      toast({
        title: 'New Order Received!',
        description: `Order #${data._id?.slice(-6)} has been placed.`,
      });
    };

    socket.on('New_Order', handleNewOrder);

    // Cleanup function
    return () => {
      socket.off('New_Order', handleNewOrder);
      disconnectSocket();
    };
  }, [canteenId, toast, connectSocket, disconnectSocket, getSocket]);

  // Type for breadcrumb items
  type BreadcrumbItem = {
    label: string;
    href: string;
    onClick: (() => void) | null;
    icon: React.ComponentType<any> | undefined;
  };

  // Breadcrumb configuration
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const baseItems: BreadcrumbItem[] = [
      {
        label: 'Dashboard',
        href: '#',
        onClick: () => setActiveTab('overview'),
        icon: Home,
      },
    ];

    if (activeTab === 'overview') {
      return baseItems;
    }

    const tabLabels: { [key: string]: string } = {
      menu: 'Menu Items',
      orders: 'Orders',
      analytics: 'Analytics',
      profile: 'Profile',
      payouts: 'Payouts',
    };

    // Add sub-navigation for specific tabs
    const breadcrumbItems: BreadcrumbItem[] = [
      ...baseItems,
      {
        label: tabLabels[activeTab] || activeTab,
        href: '#',
        onClick: null, // Current page, no click action
        icon: undefined,
      },
    ];

    // Add sub-navigation for menu items
    if (activeTab === 'menu') {
      if (isAddItemOpen) {
        breadcrumbItems.push({
          label: 'Add New Item',
          href: '#',
          onClick: () => {
            setIsAddItemOpen(false);
            resetForm();
          },
          icon: undefined,
        });
      } else if (isEditItemOpen && editingItem) {
        breadcrumbItems.push({
          label: `Edit ${editingItem.name}`,
          href: '#',
          onClick: () => {
            setIsEditItemOpen(false);
            setEditingItem(null);
            resetForm();
          },
          icon: undefined,
        });
      }
    }

    // Add sub-navigation for orders
    if (activeTab === 'orders' && orderDetails) {
      breadcrumbItems.push({
        label: `Order #${orderDetails._id?.slice(-6) || 'Details'}`,
        href: '#',
        onClick: () => setOrderDetails(null),
        icon: undefined,
      });
    }

    return breadcrumbItems;
  };

  // Handle profile picture upload
  const handleProfilePicUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);

      // Create immediate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        // Upload to server
        const token = localStorage.getItem('token') || '';
        const { uploadProfileImage } = await import('@/services/userService');
        const uploadResult = await uploadProfileImage(file, token);

        // Update with uploaded URL
        setPersonalData((prev) => ({
          ...prev,
          profilePic: uploadResult.imageUrl,
        }));

        toast({
          title: 'Success',
          description: 'Profile picture uploaded successfully!',
        });
      } catch (error) {
        console.error('Profile picture upload error:', error);
        toast({
          title: 'Upload Failed',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to upload profile picture',
          variant: 'destructive',
        });

        // Keep local preview but mark as not uploaded
        setPersonalData((prev) => ({
          ...prev,
          profilePic: reader.result as string,
        }));
      }
    }
  };

  // Additional useEffect to refetch data when canteenId changes
  useEffect(() => {
    console.log('canteenId changed:', canteenId);
    if (canteenId && isAuthenticated && user) {
      console.log('Fetching data due to canteenId change...');
      fetchData(canteenId);
    }
  }, [canteenId, isAuthenticated, user]);

  // Fetch all dashboard data (menu items, orders, stats) using dynamic canteenId
  const fetchData = async (currentCanteenId?: string) => {
    try {
      setLoading(true);
      if (!isAuthenticated || !user) {
        setLoading(false);
        toast({
          title: 'Error',
          description: 'You must be logged in to access this feature',
          variant: 'destructive',
        });
        return;
      }

      // Use the passed canteenId parameter or fallback to state canteenId
      const canteenIdToUse = currentCanteenId || canteenId;

      console.log('fetchData called with:', {
        currentCanteenId,
        stateCanteenId: canteenId,
        canteenIdToUse,
        userRole: user?.role,
        userId: user?.id,
      });

      if (!canteenIdToUse) {
        console.error('No canteen ID available for fetching data');
        setLoading(false);
        toast({
          title: 'Error',
          description: 'Canteen ID not found. Please refresh the page.',
          variant: 'destructive',
        });
        return;
      }

      const token = localStorage.getItem('token') || '';

      // Fetch menu items using dynamic canteenId
      try {
        setMenuLoading(true);
        console.log(`Fetching menu items for canteen: ${canteenIdToUse}`);
        const menuData = await axios.get(
          `https://campusbites-mxpe.onrender.com/api/v1/items/getItems/${canteenIdToUse}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Menu API response:', menuData.data);

        // Handle different response structures
        let menuItemsArray = [];
        if (Array.isArray(menuData.data)) {
          menuItemsArray = menuData.data;
        } else if (menuData.data && Array.isArray(menuData.data.data)) {
          menuItemsArray = menuData.data.data;
        } else if (menuData.data && Array.isArray(menuData.data.items)) {
          menuItemsArray = menuData.data.items;
        } else {
          console.warn('Unexpected menu data structure:', menuData.data);
          menuItemsArray = [];
        }

        console.log(
          `Setting ${menuItemsArray.length} menu items:`,
          menuItemsArray
        );
        setMenuItems(menuItemsArray);
      } catch (error: any) {
        console.error('Error fetching menu data:', error);

        // Check for canteen not approved error
        if (
          error?.response?.status === 403 &&
          error?.response?.data?.message?.toLowerCase().includes('not approved')
        ) {
          setNotApprovedDialog(true);
          setLoading(false); // Stop loading when showing dialog
          return; // Exit early to prevent other error handling
        }

        setMenuItems([]); // Clear menu items on error
        toast({
          title: 'Error',
          description: 'Failed to fetch menu items',
          variant: 'destructive',
        });
      } finally {
        setMenuLoading(false);
      }

      // Fetch orders using dynamic canteenId
      try {
        const ordersData = await getCanteenOrders(canteenIdToUse, token);
        const ordersToSet = Array.isArray(ordersData?.data)
          ? ordersData.data
          : [];
        setOrders(ordersToSet);
      } catch (error: any) {
        console.error('Error fetching orders data:', error);

        // Check for canteen not approved error
        if (
          error?.response?.status === 403 &&
          error?.response?.data?.message?.toLowerCase().includes('not approved')
        ) {
          setNotApprovedDialog(true);
          setLoading(false); // Stop loading when showing dialog
          return; // Exit early to prevent other error handling
        }

        toast({
          title: 'Error',
          description: 'Failed to fetch orders',
          variant: 'destructive',
        });
      }

      // Fetch statistics using dynamic canteenId
      try {
        const statsData = await getCanteenStats(canteenIdToUse, token);
        const statsToSet = statsData?.data || null;
        setCanteenStats(statsToSet);
      } catch (error: any) {
        console.error('Error fetching stats data:', error);

        // Check for canteen not approved error
        if (
          error?.response?.status === 403 &&
          error?.response?.data?.message?.toLowerCase().includes('not approved')
        ) {
          setNotApprovedDialog(true);
          setLoading(false); // Stop loading when showing dialog
          return; // Exit early to prevent other error handling
        }

        toast({
          title: 'Error',
          description: 'Failed to fetch statistics',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);

      // Check for canteen not approved error
      if (
        error?.response?.status === 403 &&
        error?.response?.data?.message?.toLowerCase().includes('not approved')
      ) {
        setNotApprovedDialog(true);
        setLoading(false); // Stop loading when showing dialog
        return;
      }

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
        setImageUploading(true);

        // Validate the image first
        validateImage(file);
        setSelectedImage(file);

        // Create a preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        // Store the file for later use in form submission
        // The image will be uploaded when the form is submitted

        toast({
          title: 'Success',
          description: 'Image selected successfully!',
        });
      } catch (validationError) {
        console.error('Image validation error:', validationError);
        setSelectedImage(null);
        setImagePreview('');
        setFormData({ ...formData, image: '' });

        toast({
          title: 'Invalid Image',
          description:
            validationError instanceof Error
              ? validationError.message
              : 'Please select a valid image file',
          variant: 'destructive',
        });
      } finally {
        setImageUploading(false);
      }
    }
  };

  // Handle form submission for creating/updating menu items using dynamic canteenId
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission while image is uploading
    if (imageUploading) {
      toast({
        title: 'Please wait',
        description: 'Image is still uploading. Please wait a moment.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (!isAuthenticated || !user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to access this feature',
          variant: 'destructive',
        });
        return;
      }

      // Ensure canteenId is available before proceeding
      if (!canteenId) {
        console.error('No canteenId available for form submission');
        toast({
          title: 'Error',
          description: 'Canteen ID not found. Please refresh the page.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Submitting menu item with canteenId:', canteenId);

      // Handle image data - pass base64 data directly
      let imageData = null;

      if (formData.image) {
        if (formData.image.startsWith('data:')) {
          // Pass base64 data URL directly
          imageData = formData.image;
        } else if (formData.image.startsWith('blob:')) {
          // Convert blob URL to base64
          const response = await fetch(formData.image);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          imageData = base64;
        } else if (selectedImage) {
          // Convert File to base64
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(selectedImage);
          });
          imageData = base64;
        }
      }

      // Create menu item data with dynamic canteenId
      const itemData = {
        name: formData.name,
        price: parseFloat(formData.price),
        canteenId: canteenId,
        description: formData.description,
        category: formData.category,
        canteen: canteenId, // Using dynamic canteenId
        isVeg: formData.isVeg,
        available: formData.available,
        portion: formData.portion,
        quantity: formData.quantity,
        image: imageData || undefined,
      };

      console.log('Submitting item data:', itemData);

      if (editingItem) {
        await updateMenuItem(editingItem._id, itemData);
        console.log('Menu item updated successfully');
        toast({
          title: 'Success',
          description: 'Menu item updated successfully',
        });
      } else {
        const newItem = await createMenuItem(itemData);
        console.log('New menu item created:', newItem);
        toast({
          title: 'Success',
          description: 'Menu item added successfully',
        });
      }

      setIsAddItemOpen(false);
      setIsEditItemOpen(false);
      setEditingItem(null);
      resetForm();

      // Force refresh with the current canteenId
      console.log('Refreshing menu data after form submission...');
      if (canteenId) {
        await fetchData(canteenId);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: 'Error',
        description: `Failed to save menu item: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
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
      category: item.category || '',
      isVeg: item.isVeg || false,
      available: item.available !== false,
      image: item.image || '',
      portion: item.portion || '',
      quantity: item.quantity || '',
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

  const handleToggleReady = (itemId: string, isReady: boolean) => {
    // Update the menu item in the local state
    setMenuItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId ? { ...item, isReady } : item
      )
    );
  };

  const resetForm = () => {
    // Clear any object URLs to prevent memory leaks
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      isVeg: false,
      available: true,
      image: '',
      portion: '',
      quantity: '',
    });
    setSelectedImage(null);
    setImagePreview('');
    setImageUploading(false);
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await getOrderById(orderId, token);
      setOrderDetails(response.data);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to fetch order details',
        variant: 'destructive',
      });
    }
  };

  const handleOrderStatusUpdate = (orderId: string, newStatus: string) => {
    // Update the order in the local state
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId
          ? { ...order, status: newStatus as Order['status'] }
          : order
      )
    );

    // Refresh the data to get updated statistics
    if (canteenId) {
      fetchData(canteenId);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, user, router]);

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

  // Redirect handled by useEffect above
  if (!isAuthenticated || !user) {
    return null; // Show nothing while redirecting
  }

  // Filter items by search term (case-insensitive)
  console.log('Current menuItems before filtering:', menuItems);
  console.log('Current search filters:', {
    searchTerm,
    statusFilter,
    categoryFilter,
  });

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

    // Ready filter
    const matchesReady =
      readyFilter === 'all' ||
      (readyFilter === 'ready' && item.isReady === true) ||
      (readyFilter === 'not-ready' && item.isReady === false);

    return matchesSearch && matchesStatus && matchesCategory && matchesReady;
  });

  console.log('Filtered items for rendering:', filteredItems);

  const categories = Array.from(
    new Set(menuItems.map((item) => item.category?.toLowerCase() || ''))
  ).filter(Boolean);

  return (
    <div className='flex flex-col md:flex-row h-screen bg-gray-50 w-full'>
      {/* Mobile: Hamburger + Drawer */}
      {isMobile && (
        <div className='flex md:hidden items-center p-2 bg-white border-b border-gray-200'>
          <button
            className='p-2 rounded-md text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
            onClick={() => setDrawerOpen(true)}
            aria-label='Open sidebar menu'>
            <MenuIcon className='w-6 h-6' />
          </button>
          <span className='ml-3 font-bold text-lg text-blue-900'>
            CampusBites
          </span>
        </div>
      )}
      {/* Sidebar: Always render both, hide one with display:none */}
      <div style={{ display: isMobile ? 'block' : 'none' }}>
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent
            side='left'
            className='fixed z-50 inset-y-0 left-0 h-full w-full max-w-xs bg-transparent shadow-none border-none p-0 [&>button]:hidden'>
            <DashboardSidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setDrawerOpen(false); // Close drawer on tab select
              }}
              onClose={() => setDrawerOpen(false)}
              isMobile={true}
            />
          </SheetContent>
        </Sheet>
      </div>
      <div style={{ display: isMobile ? 'none' : 'block' }}>
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      {/* Main Content */}
      <div className='flex-1 overflow-auto scrollbar-hide w-full'>
        <div className='p-4 sm:p-8 max-w-7xl mx-auto w-full'>
          {/* Breadcrumb Navigation */}
          <div className='mb-6'>
            <div className='flex items-center justify-between'>
              <Breadcrumb>
                <BreadcrumbList className='text-sm'>
                  {getBreadcrumbItems().map((item, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {item.onClick ? (
                          <BreadcrumbLink
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault();
                              item.onClick?.();
                            }}
                            className='flex items-center gap-2 hover:text-blue-600 transition-colors font-medium text-gray-600 dark:text-gray-400'>
                            {item.icon && <item.icon className='w-4 h-4' />}
                            {item.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className='flex items-center gap-2 font-semibold text-gray-600 dark:text-gray-400'>
                            {item.icon && <item.icon className='w-4 h-4' />}
                            {item.label}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < getBreadcrumbItems().length - 1 && (
                        <BreadcrumbSeparator className='text-gray-600 dark:text-gray-400' />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>

              {/* Quick Navigation */}
              {activeTab !== 'overview' && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setActiveTab('overview')}
                  className='text-gray-600 hover:text-blue-600 transition-colors'>
                  <Home className='w-4 h-4 mr-2' />
                  Back to Overview
                </Button>
              )}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <OverviewTab canteenStats={canteenStats} menuItems={menuItems} />
          )}

          {/* Menu Items Tab */}
          {activeTab === 'menu' && (
            <MenuTab
              menuItems={menuItems}
              filteredItems={filteredItems}
              categories={categories}
              menuLoading={menuLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              readyFilter={readyFilter}
              setReadyFilter={setReadyFilter}
              isAddItemOpen={isAddItemOpen}
              setIsAddItemOpen={setIsAddItemOpen}
              isEditItemOpen={isEditItemOpen}
              setIsEditItemOpen={setIsEditItemOpen}
              formData={formData}
              setFormData={setFormData}
              imageUploading={imageUploading}
              imagePreview={imagePreview}
              editingItem={editingItem}
              onSubmit={handleSubmit}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onImageUpload={handleImageUpload}
              onRefresh={() => canteenId && fetchData(canteenId)}
              resetForm={resetForm}
              canteenId={canteenId}
              onToggleReady={handleToggleReady}
            />
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              onRefresh={() => canteenId && fetchData(canteenId)}
              onOrderClick={fetchOrderDetails}
              onStatusUpdate={handleOrderStatusUpdate}
              canteenId={canteenId}
            />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && canteenId && (
            <AnalyticsTab canteenId={canteenId} />
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <ProfileTab
              personalData={personalData}
              setPersonalData={setPersonalData}
              bankDetails={bankDetails}
              setBankDetails={setBankDetails}
              personalSubmitting={personalSubmitting}
              setPersonalSubmitting={setPersonalSubmitting}
              personalSuccess={personalSuccess}
              setPersonalSuccess={setPersonalSuccess}
              bankSubmitting={bankSubmitting}
              setBankSubmitting={setBankSubmitting}
              bankSuccess={bankSuccess}
              setBankSuccess={setBankSuccess}
              profilePicPreview={profilePicPreview}
              handleProfilePicUpload={handleProfilePicUpload}
            />
          )}

          {/* Payouts Tab */}
          {activeTab === 'payouts' && (
            <PayoutsTab
              canteenStats={canteenStats}
              orders={orders}
              onRefresh={() => canteenId && fetchData(canteenId)}
              canteenId={canteenId}
            />
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {orderDetails && (
        <OrderDetailsDialog
          orderDetails={orderDetails}
          setOrderDetails={setOrderDetails}
          onStatusUpdate={handleOrderStatusUpdate}
        />
      )}

      {/* Not Approved Dialog */}
      <Dialog
        open={notApprovedDialog}
        onOpenChange={(open) => {
          if (!open) setNotApprovedDialog(false);
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Canteen Not Approved</DialogTitle>
            <DialogDescription>
              Your canteen is not approved yet. Please wait for admin approval.
              You can still view your dashboard, but some features may be
              limited until approval.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className='w-full bg-orange-600 hover:bg-orange-700'
              onClick={() => {
                setNotApprovedDialog(false);
              }}>
              Continue to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Dashboard() {
  return (
    <CampusOnlyRoute>
      <DashboardContent />
    </CampusOnlyRoute>
  );
}
