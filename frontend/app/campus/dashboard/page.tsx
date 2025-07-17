'use client';
import React, { useState, useEffect } from 'react';
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
import { getOrderById } from '@/services/orderService';
import { useNotificationToast } from '@/hooks/use-notification';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
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
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [canteenId, setCanteenId] = useState<string | null>(null);

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
    console.log('useEffect triggered:', {
      isAuthenticated,
      user: user?.id,
      activeTab,
    });
    if (isAuthenticated && user) {
      console.log('Starting fetchCanteenData...');
      fetchCanteenData();
    } else {
      console.log('Not authenticated or no user, setting loading to false');
      setLoading(false);
    }
  }, [activeTab, isAuthenticated, user]);

  // Additional useEffect to refetch data when canteenId changes
  useEffect(() => {
    console.log('canteenId changed:', canteenId);
    if (canteenId && isAuthenticated && user) {
      console.log('Fetching data due to canteenId change...');
      fetchData(canteenId);
    }
  }, [canteenId]);

  // Fetch canteen data associated with the current user
  const fetchCanteenData = async () => {
    try {
      console.log('fetchCanteenData called for user:', user?.id);

      if (!user?.id) {
        console.error('No user ID available');
        setLoading(false); // Add this line to stop loading
        toast({
          title: 'Error',
          description: 'User session invalid. Please login again.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Fetching canteen data for user:', user.id);
      const canteenData = await getCanteenByOwner(user.id);
      console.log('Canteen data received:', canteenData);

      if (canteenData && canteenData._id) {
        const dynamicCanteenId = canteenData._id;
        console.log('Setting canteenId to:', dynamicCanteenId);
        setCanteenId(dynamicCanteenId);

        // Don't call fetchData here since the useEffect will handle it
        console.log('Canteen ID set, useEffect will trigger data fetch');
      } else {
        console.error('No canteen data received:', canteenData);
        setLoading(false); // Add this line to stop loading
        toast({
          title: 'Error',
          description:
            'No canteen associated with your account. Please contact support.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching canteen data:', error);
      setLoading(false); // Add this line to stop loading
      toast({
        title: 'Error',
        description: 'Failed to fetch canteen information',
        variant: 'destructive',
      });
    }
  };

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

      // Temporarily allow any authenticated user for testing (role check removed)
      // if (user?.role !== 'canteen') {
      //   setLoading(false);
      //   toast({
      //     title: 'Error',
      //     description: 'You must be logged in as a canteen user',
      //     variant: 'destructive',
      //   });
      //   return;
      // }

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
          `http://localhost:8080/api/v1/menu/${canteenIdToUse}`,
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
      } catch (error) {
        console.error('Error fetching menu data:', error);
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
      } catch (error) {
        console.error('Error fetching orders data:', error);
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
      } catch (error) {
        console.error('Error fetching stats data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch statistics',
          variant: 'destructive',
        });
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

  const [imageUploading, setImageUploading] = useState(false);

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

        try {
          // Attempt to upload the image to the server
          const uploadResult = await uploadImage(file);

          // Update form data with the uploaded image URL
          setFormData({ ...formData, image: uploadResult.url });

          toast({
            title: 'Success',
            description: 'Image uploaded successfully!',
          });
        } catch (uploadError) {
          console.warn('Image upload failed, using fallback:', uploadError);

          // If upload fails, create a data URL as fallback
          try {
            const dataUrl = await createImagePreview(file);
            setFormData({ ...formData, image: dataUrl });

            toast({
              title: 'Upload Failed',
              description:
                'Using local image preview. Image may not be saved permanently.',
              variant: 'destructive',
            });
          } catch (previewError) {
            // If both upload and preview fail, use placeholder
            setFormData({ ...formData, image: '/placeholder.svg' });

            toast({
              title: 'Error',
              description:
                'Failed to process image. Using placeholder instead.',
              variant: 'destructive',
            });
          }
        }
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

      // Use the image URL from formData.image (could be uploaded URL, data URL, or placeholder)
      const imageUrl = formData.image || '/placeholder.svg';

      // Log image source type for debugging
      if (imageUrl.startsWith('data:')) {
        console.log('Using local image data URL (upload may have failed)');
      } else if (imageUrl.startsWith('http')) {
        console.log('Using uploaded image URL');
      } else {
        console.log('Using placeholder image');
      }

      // Create menu item data with dynamic canteenId
      const itemData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        canteen: canteenId, // Using dynamic canteenId
        isVeg: formData.isVeg,
        image: imageUrl,
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
      image: '',
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
    } catch (error) {
      // handle error (show toast, etc.)
    }
  };

  // Debug: Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn(
          'Dashboard loading timeout reached - setting loading to false'
        );
        setLoading(false);
        toast({
          title: 'Loading Timeout',
          description:
            'Dashboard took too long to load. Please refresh the page.',
          variant: 'destructive',
        });
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading, toast]);

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

    return matchesSearch && matchesStatus && matchesCategory;
  });

  console.log('Filtered items for rendering:', filteredItems);

  const categories = Array.from(
    new Set(menuItems.map((item) => item.category?.toLowerCase() || ''))
  ).filter(Boolean);

  useNotificationToast();

  return (
    <div className='flex h-screen bg-gray-50'>
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className='flex-1 overflow-auto'>
        <div className='p-8 max-w-7xl mx-auto'>
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
            />
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              onRefresh={() => canteenId && fetchData(canteenId)}
              onOrderClick={fetchOrderDetails}
              canteenId={canteenId}
            />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && <AnalyticsTab orders={orders} />}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <ProfileTab
              personalData={personalData}
              setPersonalData={setPersonalData}
              profileData={profileData}
              setProfileData={setProfileData}
              personalSubmitting={personalSubmitting}
              setPersonalSubmitting={setPersonalSubmitting}
              personalSuccess={personalSuccess}
              setPersonalSuccess={setPersonalSuccess}
              profileSubmitting={profileSubmitting}
              setProfileSubmitting={setProfileSubmitting}
              profileSuccess={profileSuccess}
              setProfileSuccess={setProfileSuccess}
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

      <OrderDetailsDialog
        orderDetails={orderDetails}
        setOrderDetails={setOrderDetails}
      />
    </div>
  );
}
