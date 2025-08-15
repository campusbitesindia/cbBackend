'use client';
import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from 'react';
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

// Lazy load heavy components to improve initial load time
const MenuTab = lazy(() => import('@/app/campus/dashboard/MenuTab'));
const OrdersTab = lazy(() =>
  import('@/app/campus/dashboard/OrdersTab').then((module) => ({
    default: module.OrdersTab,
  }))
);
const AnalyticsTab = lazy(() =>
  import('@/app/campus/dashboard/AnalyticsTab').then((module) => ({
    default: module.AnalyticsTab,
  }))
);
const ProfileTab = lazy(() =>
  import('@/app/campus/dashboard/ProfileTab').then((module) => ({
    default: module.ProfileTab,
  }))
);
const PayoutsTab = lazy(() =>
  import('@/app/campus/dashboard/PayoutsTab').then((module) => ({
    default: module.PayoutsTab,
  }))
);
const OrderDetailsDialog = lazy(() =>
  import('@/app/campus/dashboard/OrderDetailsDialog').then((module) => ({
    default: module.OrderDetailsDialog,
  }))
);
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
  Loader2,
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

// Debounce utility
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Loading component for lazy-loaded tabs
const TabLoadingSpinner = ({
  message = 'Loading...',
}: {
  message?: string;
}) => (
  <div className='flex items-center justify-center py-12'>
    <div className='flex flex-col items-center gap-3'>
      <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
      <p className='text-sm text-gray-600'>{message}</p>
    </div>
  </div>
);

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

  // State consolidation - group related states
  const [dataState, setDataState] = useState({
    menuItems: [] as MenuItem[],
    orders: [] as Order[],
    canteenStats: null as CanteenStats | null,
    canteenId: '',
  });

  const [loadingState, setLoadingState] = useState({
    loading: true,
    menuLoading: false,
    imageUploading: false,
    personalSubmitting: false,
    bankSubmitting: false,
  });

  const [dialogState, setDialogState] = useState({
    isAddItemOpen: false,
    isEditItemOpen: false,
    notApprovedDialog: false,
    personalSuccess: false,
    bankSuccess: false,
  });

  const [imageState, setImageState] = useState({
    selectedImage: null as File | null,
    imagePreview: '',
    profilePicFile: null as File | null,
    profilePicPreview: '',
  });

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);

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

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [readyFilter, setReadyFilter] = useState('all');

  // Debounce search term to reduce filtering operations
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [personalData, setPersonalData] = useState({
    vendorName: '',
    contactPerson: '',
    mobileNumber: '',
    email: '',
    address: '',
    profilePic: '',
  });

  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    upiId: '',
  });

  const { getSocket, connectSocket, disconnectSocket } = useSocket();
  const storedId = localStorage.getItem('canteenId');

  // Initialize canteenId from localStorage
  useEffect(() => {
    if (storedId) {
      setDataState((prev) => ({ ...prev, canteenId: storedId }));
    }
  }, [storedId]);

  // Memoized filtered items to prevent unnecessary recalculations
  const filteredItems = useMemo(() => {
    return dataState.menuItems.filter((item: MenuItem) => {
      // Search filter
      const matchesSearch = item.name
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());

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
  }, [
    dataState.menuItems,
    debouncedSearchTerm,
    statusFilter,
    categoryFilter,
    readyFilter,
  ]);

  // Memoized categories to prevent recalculation
  const categories = useMemo(() => {
    return Array.from(
      new Set(
        dataState.menuItems.map((item) => item.category?.toLowerCase() || '')
      )
    ).filter(Boolean);
  }, [dataState.menuItems]);

  // Optimized Socket Connection Effect - memoized to prevent unnecessary reconnections
  const socketEffectDeps = useMemo(
    () => [dataState.canteenId],
    [dataState.canteenId]
  );

  useEffect(() => {
    if (!dataState.canteenId) return;

    connectSocket();
    const socket = getSocket();

    if (!socket) {
      console.error('Socket not available');
      return;
    }

    socket.emit('Join_Room', dataState.canteenId);

    const handleNewOrder = (data: Order) => {
      if (!data?._id) return;

      const transformedOrder: Order = {
        ...data,
        status: data.status ?? 'pending',
        createdAt: data.createdAt ?? new Date().toISOString(),
      };

      setDataState((prev) => {
        if (prev.orders.some((o) => o._id === transformedOrder._id))
          return prev;
        return {
          ...prev,
          orders: [transformedOrder, ...prev.orders],
        };
      });

      toast({
        title: 'New Order Received!',
        description: `Order #${data._id.slice(-6)} has been placed.`,
      });
    };

    socket.on('New_Order', handleNewOrder);

    return () => {
      socket.off('New_Order', handleNewOrder);
      disconnectSocket();
    };
  }, [...socketEffectDeps, toast, connectSocket, disconnectSocket, getSocket]);

  // Memoized breadcrumb items
  const breadcrumbItems = useMemo(() => {
    type BreadcrumbItem = {
      label: string;
      href?: string;
      onClick?: () => void;
      icon?: React.ComponentType<any>;
    };

    const base: BreadcrumbItem[] = [
      {
        label: 'Dashboard',
        href: '#',
        onClick: () => setActiveTab('overview'),
        icon: Home,
      },
    ];

    const tabLabels: Record<string, string> = {
      menu: 'Menu Items',
      orders: 'Orders',
      analytics: 'Analytics',
      profile: 'Profile',
      payouts: 'Payouts',
    };

    if (activeTab === 'overview') return base;

    const breadcrumbs: BreadcrumbItem[] = [
      ...base,
      {
        label: tabLabels[activeTab] || activeTab,
        href: '#',
      },
    ];

    if (activeTab === 'menu') {
      if (dialogState.isAddItemOpen) {
        breadcrumbs.push({
          label: 'Add New Item',
          href: '#',
          onClick: () => {
            setDialogState((prev) => ({ ...prev, isAddItemOpen: false }));
            resetForm();
          },
        });
      } else if (dialogState.isEditItemOpen && editingItem) {
        breadcrumbs.push({
          label: `Edit ${editingItem.name}`,
          href: '#',
          onClick: () => {
            setDialogState((prev) => ({ ...prev, isEditItemOpen: false }));
            setEditingItem(null);
            resetForm();
          },
        });
      }
    }

    if (activeTab === 'orders' && orderDetails) {
      breadcrumbs.push({
        label: `Order #${orderDetails._id?.slice(-6) || 'Details'}`,
        href: '#',
        onClick: () => setOrderDetails(null),
      });
    }

    return breadcrumbs;
  }, [
    activeTab,
    dialogState.isAddItemOpen,
    dialogState.isEditItemOpen,
    editingItem,
    orderDetails,
  ]);

  // Optimized profile picture upload with useCallback
  const handleProfilePicUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImageState((prev) => ({
        ...prev,
        profilePicFile: file,
        profilePicPreview: URL.createObjectURL(file),
      }));

      try {
        const token = localStorage.getItem('token') || '';
        const { uploadProfileImage } = await import('@/services/userService');
        const { imageUrl } = await uploadProfileImage(file, token);

        setPersonalData((prev) =>
          prev.profilePic === imageUrl
            ? prev
            : { ...prev, profilePic: imageUrl }
        );

        toast({
          title: 'Success',
          description: 'Profile picture uploaded successfully!',
        });
      } catch (err) {
        console.error('Profile picture upload error:', err);
        toast({
          title: 'Upload Failed',
          description:
            err instanceof Error
              ? err.message
              : 'Failed to upload profile picture',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  // Single data fetching function with proper error handling
  const fetchData = useCallback(
    async (currentCanteenId?: string) => {
      const token = localStorage.getItem('token') || '';

      if (!isAuthenticated || !user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to access this feature',
          variant: 'destructive',
        });
        return;
      }

      const canteenIdToUse = currentCanteenId || dataState.canteenId;
      if (!canteenIdToUse) {
        toast({
          title: 'Error',
          description: 'Canteen ID not found. Please refresh the page.',
          variant: 'destructive',
        });
        return;
      }

      setLoadingState((prev) => ({
        ...prev,
        loading: true,
        menuLoading: true,
      }));

      const handleNotApproved = (error: any) => {
        if (
          error?.response?.status === 403 &&
          error?.response?.data?.message?.toLowerCase().includes('not approved')
        ) {
          setDialogState((prev) => ({ ...prev, notApprovedDialog: true }));
          return true;
        }
        return false;
      };

      const normalizeMenuData = (data: any) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.items)) return data.items;
        console.warn('Unexpected menu data structure:', data);
        return [];
      };

      try {
        // Fetch all data in parallel for better performance
        const [menuResponse, ordersResponse, statsResponse] =
          await Promise.allSettled([
            axios
              .get(
                `https://campusbites-mxpe.onrender.com/api/v1/items/getItems/${canteenIdToUse}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .then((res) => normalizeMenuData(res.data)),

            getCanteenOrders(canteenIdToUse, token).then((res) =>
              Array.isArray(res?.data) ? res.data : []
            ),

            getCanteenStats(canteenIdToUse, token).then(
              (res) => res?.data || null
            ),
          ]);

        // Process results
        const menuItems =
          menuResponse.status === 'fulfilled' ? menuResponse.value : [];
        const orders =
          ordersResponse.status === 'fulfilled' ? ordersResponse.value : [];
        const canteenStats =
          statsResponse.status === 'fulfilled' ? statsResponse.value : null;

        // Handle errors
        [menuResponse, ordersResponse, statsResponse].forEach(
          (result, index) => {
            if (result.status === 'rejected') {
              const errorNames = ['menu items', 'orders', 'statistics'];
              if (!handleNotApproved(result.reason)) {
                toast({
                  title: 'Error',
                  description: `Failed to fetch ${errorNames[index]}`,
                  variant: 'destructive',
                });
              }
            }
          }
        );

        // Update state in a single operation
        setDataState((prev) => ({
          ...prev,
          menuItems,
          orders,
          canteenStats,
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
        if (!handleNotApproved(error)) {
          toast({
            title: 'Error',
            description: 'Failed to fetch data',
            variant: 'destructive',
          });
        }
      } finally {
        setLoadingState((prev) => ({
          ...prev,
          loading: false,
          menuLoading: false,
        }));
      }
    },
    [dataState.canteenId, isAuthenticated, user, toast]
  );

  // Remove console.log for production performance;

  // Effect to fetch data when canteenId changes
  useEffect(() => {
    if (!dataState.canteenId || !isAuthenticated) return;
    fetchData(dataState.canteenId);
  }, [dataState.canteenId, isAuthenticated, fetchData]);

  // Optimized image upload handler
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setLoadingState((prev) => ({ ...prev, imageUploading: true }));

      try {
        validateImage(file);
        const previewUrl = URL.createObjectURL(file);

        setImageState((prev) => ({
          ...prev,
          selectedImage: file,
          imagePreview: previewUrl,
        }));

        setFormData((prev) => ({ ...prev, image: '' }));

        toast({
          title: 'Success',
          description: 'Image selected successfully!',
        });
      } catch (err) {
        console.error('Image validation error:', err);

        setImageState((prev) => ({
          ...prev,
          selectedImage: null,
          imagePreview: '',
        }));
        setFormData((prev) => ({ ...prev, image: '' }));

        toast({
          title: 'Invalid Image',
          description:
            err instanceof Error
              ? err.message
              : 'Please select a valid image file',
          variant: 'destructive',
        });
      } finally {
        setLoadingState((prev) => ({ ...prev, imageUploading: false }));
      }
    },
    [toast]
  );

  // Optimized form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (loadingState.imageUploading) {
        return toast({
          title: 'Please wait',
          description: 'Image is still uploading. Please wait a moment.',
          variant: 'destructive',
        });
      }

      if (!isAuthenticated || !user || !dataState.canteenId) {
        return toast({
          title: 'Error',
          description: 'Authentication or canteen ID missing',
          variant: 'destructive',
        });
      }

      try {
        const getBase64FromFile = (file: File | Blob) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });

        let imageData: string | undefined;
        if (formData.image?.startsWith('data:')) {
          imageData = formData.image;
        } else if (formData.image?.startsWith('blob:')) {
          const blob = await (await fetch(formData.image)).blob();
          imageData = await getBase64FromFile(blob);
        } else if (imageState.selectedImage) {
          imageData = await getBase64FromFile(imageState.selectedImage);
        }

        const itemData = {
          name: formData.name,
          price: parseFloat(formData.price),
          canteenId: dataState.canteenId,
          description: formData.description,
          category: formData.category,
          canteen: dataState.canteenId,
          isVeg: formData.isVeg,
          available: formData.available,
          portion: formData.portion,
          quantity: formData.quantity,
          image: imageData,
        };

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

        // Reset states
        setDialogState((prev) => ({
          ...prev,
          isAddItemOpen: false,
          isEditItemOpen: false,
        }));
        setEditingItem(null);
        resetForm();

        // Refresh data
        await fetchData(dataState.canteenId);
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
    },
    [
      loadingState.imageUploading,
      isAuthenticated,
      user,
      dataState.canteenId,
      formData,
      imageState.selectedImage,
      editingItem,
      toast,
      fetchData,
    ]
  );

  // Optimized edit handler
  const handleEdit = useCallback((item: MenuItem) => {
    setEditingItem(item);

    const {
      name,
      price,
      description = '',
      category = '',
      isVeg = false,
      available = true,
      image = '',
      portion = '',
      quantity = '',
    } = item;

    setFormData({
      name,
      price: price.toString(),
      description,
      category,
      isVeg,
      available,
      image,
      portion,
      quantity,
    });

    setImageState((prev) => ({ ...prev, imagePreview: image }));
    setDialogState((prev) => ({ ...prev, isEditItemOpen: true }));
  }, []);

  // Optimized delete handler
  const handleDelete = useCallback(
    async (itemId: string) => {
      if (!confirm('Are you sure you want to delete this item?')) return;

      try {
        await deleteMenuItem(itemId);
        toast({
          title: 'Success',
          description: 'Menu item deleted successfully',
        });

        await fetchData();
      } catch (error) {
        console.error('Delete menu item error:', error);
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to delete menu item',
          variant: 'destructive',
        });
      }
    },
    [toast, fetchData]
  );

  // Optimized toggle ready handler
  const handleToggleReady = useCallback((itemId: string, isReady: boolean) => {
    setDataState((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item) =>
        item._id === itemId ? { ...item, isReady } : item
      ),
    }));
  }, []);

  // Optimized reset form
  const resetForm = useCallback(() => {
    if (imageState.imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imageState.imagePreview);
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

    setImageState({
      selectedImage: null,
      imagePreview: '',
      profilePicFile: null,
      profilePicPreview: imageState.profilePicPreview,
    });

    setLoadingState((prev) => ({ ...prev, imageUploading: false }));
  }, [imageState.imagePreview, imageState.profilePicPreview]);

  // Optimized fetch order details
  const fetchOrderDetails = useCallback(
    async (orderId: string) => {
      try {
        const token = localStorage.getItem('token') ?? '';
        const { data } = await getOrderById(orderId, token);
        setOrderDetails(data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          title: 'Error',
          description:
            (error as any)?.response?.data?.message ||
            'Failed to fetch order details',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  // Optimized order status update
  const handleOrderStatusUpdate = useCallback(
    (orderId: string, newStatus: string) => {
      setDataState((prev) => ({
        ...prev,
        orders: prev.orders.map((order) =>
          order._id === orderId
            ? { ...order, status: newStatus as Order['status'] }
            : order
        ),
      }));

      if (dataState.canteenId) {
        fetchData(dataState.canteenId);
      }
    },
    [dataState.canteenId, fetchData]
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Early returns for better performance
  if (loadingState.loading) {
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

  // Remove console.log for production performance;

  if (!isAuthenticated || !user) {
    // User not authenticated
    return null;
  }

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

      {/* Sidebar */}
      <div style={{ display: isMobile ? 'block' : 'none' }}>
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent
            side='left'
            className='fixed z-50 inset-y-0 left-0 h-full w-full max-w-xs bg-transparent shadow-none border-none p-0 [&>button]:hidden'>
            <DashboardSidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setDrawerOpen(false);
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
                  {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {item.onClick ? (
                          <BreadcrumbLink
                            href={item.href || '#'}
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
                      {index < breadcrumbItems.length - 1 && (
                        <BreadcrumbSeparator className='text-gray-600 dark:text-gray-400' />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>

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

          {/* Tab Content - Only render active tab with lazy loading */}
          {activeTab === 'overview' && (
            <OverviewTab
              canteenStats={dataState.canteenStats}
              menuItems={dataState.menuItems}
            />
          )}

          {activeTab === 'menu' && (
            <Suspense
              fallback={
                <TabLoadingSpinner message='Loading menu management...' />
              }>
              <MenuTab
                menuItems={dataState.menuItems}
                filteredItems={filteredItems}
                categories={categories}
                menuLoading={loadingState.menuLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                readyFilter={readyFilter}
                setReadyFilter={setReadyFilter}
                isAddItemOpen={dialogState.isAddItemOpen}
                setIsAddItemOpen={(open) =>
                  setDialogState((prev) => ({ ...prev, isAddItemOpen: open }))
                }
                isEditItemOpen={dialogState.isEditItemOpen}
                setIsEditItemOpen={(open) =>
                  setDialogState((prev) => ({ ...prev, isEditItemOpen: open }))
                }
                formData={formData}
                setFormData={setFormData}
                imageUploading={loadingState.imageUploading}
                imagePreview={imageState.imagePreview}
                editingItem={editingItem}
                onSubmit={handleSubmit}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onImageUpload={handleImageUpload}
                onRefresh={() =>
                  dataState.canteenId && fetchData(dataState.canteenId)
                }
                resetForm={resetForm}
                canteenId={dataState.canteenId}
                onToggleReady={handleToggleReady}
              />
            </Suspense>
          )}

          {activeTab === 'orders' && (
            <Suspense
              fallback={<TabLoadingSpinner message='Loading orders...' />}>
              <OrdersTab
                orders={dataState.orders}
                onRefresh={() =>
                  dataState.canteenId && fetchData(dataState.canteenId)
                }
                onOrderClick={fetchOrderDetails}
                onStatusUpdate={handleOrderStatusUpdate}
                canteenId={dataState.canteenId}
              />
            </Suspense>
          )}

          {activeTab === 'analytics' && dataState.canteenId && (
            <Suspense
              fallback={<TabLoadingSpinner message='Loading analytics...' />}>
              <AnalyticsTab canteenId={dataState.canteenId} />
            </Suspense>
          )}

          {activeTab === 'profile' && (
            <Suspense
              fallback={<TabLoadingSpinner message='Loading profile...' />}>
              <ProfileTab
                personalData={personalData}
                setPersonalData={setPersonalData}
                bankDetails={bankDetails}
                setBankDetails={setBankDetails}
                personalSubmitting={loadingState.personalSubmitting}
                setPersonalSubmitting={(submitting: boolean) =>
                  setLoadingState((prev) => ({
                    ...prev,
                    personalSubmitting: submitting,
                  }))
                }
                personalSuccess={dialogState.personalSuccess}
                setPersonalSuccess={(success: boolean) =>
                  setDialogState((prev) => ({
                    ...prev,
                    personalSuccess: success,
                  }))
                }
                bankSubmitting={loadingState.bankSubmitting}
                setBankSubmitting={(submitting: boolean) =>
                  setLoadingState((prev) => ({
                    ...prev,
                    bankSubmitting: submitting,
                  }))
                }
                bankSuccess={dialogState.bankSuccess}
                setBankSuccess={(success: boolean) =>
                  setDialogState((prev) => ({ ...prev, bankSuccess: success }))
                }
                profilePicPreview={imageState.profilePicPreview}
                handleProfilePicUpload={handleProfilePicUpload}
              />
            </Suspense>
          )}

          {activeTab === 'payouts' && (
            <Suspense
              fallback={<TabLoadingSpinner message='Loading payouts...' />}>
              <PayoutsTab
                canteenStats={dataState.canteenStats}
                orders={dataState.orders}
                onRefresh={() =>
                  dataState.canteenId && fetchData(dataState.canteenId)
                }
                canteenId={dataState.canteenId}
              />
            </Suspense>
          )}
        </div>
      </div>

      {/* Order Details Modal - Lazy loaded */}
      {orderDetails && (
        <Suspense
          fallback={<TabLoadingSpinner message='Loading order details...' />}>
          <OrderDetailsDialog
            orderDetails={orderDetails}
            setOrderDetails={setOrderDetails}
            onStatusUpdate={handleOrderStatusUpdate}
          />
        </Suspense>
      )}

      {/* Not Approved Dialog */}
      <Dialog
        open={dialogState.notApprovedDialog}
        onOpenChange={(open: boolean) => {
          if (!open)
            setDialogState((prev) => ({ ...prev, notApprovedDialog: false }));
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
                setDialogState((prev) => ({
                  ...prev,
                  notApprovedDialog: false,
                }));
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
