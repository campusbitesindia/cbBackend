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
    const storedId = localStorage.getItem('canteenId');
    if (storedId) setCanteenId(storedId);
  }, []);
  // Fixed Socket Connection Effect
  useEffect(() => {
    if (!canteenId) return;
  
    connectSocket();
    const socket = getSocket();
  
    if (!socket) {
      console.error("Socket not available");
      return;
    }
  
    socket.emit("Join_Room", canteenId);
  
    const handleNewOrder = (data: Order) => {
      if (!data?._id) return;
  
      const transformedOrder: Order = {
        ...data,
        status: data.status ?? "pending",
        createdAt: data.createdAt ?? new Date().toISOString(),
      };
  
      setOrders((prev) => {
        if (prev.some((o) => o._id === transformedOrder._id)) return prev;
        return [transformedOrder, ...prev]; // latest first
      });
  
      toast({
        title: "New Order Received!",
        description: `Order #${data._id.slice(-6)} has been placed.`,
      });
    };
  
    socket.on("New_Order", handleNewOrder);
  
    return () => {
      socket.off("New_Order", handleNewOrder);
      disconnectSocket();
    };
  }, [canteenId, toast, connectSocket, disconnectSocket, getSocket]);
  

  type BreadcrumbItem = {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ComponentType<any>;
  };
  
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const base: BreadcrumbItem[] = [
      {
        label: "Dashboard",
        href: "#",
        onClick: () => setActiveTab("overview"),
        icon: Home,
      },
    ];
  
    const tabLabels: Record<string, string> = {
      menu: "Menu Items",
      orders: "Orders",
      analytics: "Analytics",
      profile: "Profile",
      payouts: "Payouts",
    };
  
    // If overview tab, just return base
    if (activeTab === "overview") return base;
  
    const breadcrumbs: BreadcrumbItem[] = [
      ...base,
      {
        label: tabLabels[activeTab] || activeTab,
        href: "#",
      },
    ];
  
    if (activeTab === "menu") {
      if (isAddItemOpen) {
        breadcrumbs.push({
          label: "Add New Item",
          href: "#",
          onClick: () => {
            setIsAddItemOpen(false);
            resetForm();
          },
        });
      } else if (isEditItemOpen && editingItem) {
        breadcrumbs.push({
          label: `Edit ${editingItem.name}`,
          href: "#",
          onClick: () => {
            setIsEditItemOpen(false);
            setEditingItem(null);
            resetForm();
          },
        });
      }
    }
  
    if (activeTab === "orders" && orderDetails) {
      breadcrumbs.push({
        label: `Order #${orderDetails._id?.slice(-6) || "Details"}`,
        href: "#",
        onClick: () => setOrderDetails(null),
      });
    }
  
    return breadcrumbs;
  };

  const handleProfilePicUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setProfilePicFile(file);
  
    // Immediate preview (faster than FileReader for images)
    const previewUrl = URL.createObjectURL(file);
    setProfilePicPreview(previewUrl);
  
    try {
      const token = localStorage.getItem("token") || "";
      const { uploadProfileImage } = await import("@/services/userService");
      const { imageUrl } = await uploadProfileImage(file, token);
  
      setPersonalData((prev) =>
        prev.profilePic === imageUrl ? prev : { ...prev, profilePic: imageUrl }
      );
  
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully!",
      });
    } catch (err) {
      console.error("Profile picture upload error:", err);
  
      toast({
        title: "Upload Failed",
        description:
          err instanceof Error
            ? err.message
            : "Failed to upload profile picture",
        variant: "destructive",
      });
  
      // Fallback: keep local preview
      setPersonalData((prev) => ({
        ...prev,
        profilePic: previewUrl,
      }));
    }
  };
  

  // Additional useEffect to refetch data when canteenId changes
  useEffect(() => {
    if (!canteenId || !isAuthenticated) return;
  
    console.log("canteenId changed:", canteenId);
    console.log("Fetching data due to canteenId change...");
    fetchData(canteenId);
    
    // Only re-run when the canteen ID or authentication status changes
  }, [canteenId, isAuthenticated]);

  // Fetch all dashboard data (menu items, orders, stats) using dynamic canteenId
 const fetchData = async (currentCanteenId?: string) => {
  const token = localStorage.getItem("token") || "";

  // Early auth check
  if (!isAuthenticated || !user) {
    toast({
      title: "Error",
      description: "You must be logged in to access this feature",
      variant: "destructive",
    });
    return;
  }

  const canteenIdToUse = currentCanteenId || canteenId;
  if (!canteenIdToUse) {
    toast({
      title: "Error",
      description: "Canteen ID not found. Please refresh the page.",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  console.log("fetchData called with:", {
    currentCanteenId,
    stateCanteenId: canteenId,
    canteenIdToUse,
    userRole: user?.role,
    userId: user?.id,
  });

  const handleNotApproved = (error: any) => {
    if (
      error?.response?.status === 403 &&
      error?.response?.data?.message?.toLowerCase().includes("not approved")
    ) {
      setNotApprovedDialog(true);
      return true;
    }
    return false;
  };

  const normalizeMenuData = (data: any) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    console.warn("Unexpected menu data structure:", data);
    return [];
  };

  try {
    // Start menu fetch first (needs separate loader for UI)
    setMenuLoading(true);
    const menuPromise = axios
      .get(
        `https://campusbites-mxpe.onrender.com/api/v1/items/getItems/${canteenIdToUse}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => normalizeMenuData(res.data))
      .catch((err) => {
        if (handleNotApproved(err)) throw err;
        toast({ title: "Error", description: "Failed to fetch menu items", variant: "destructive" });
        return [];
      })
      .finally(() => setMenuLoading(false));

    // Fetch orders & stats in parallel
    const ordersPromise = getCanteenOrders(canteenIdToUse, token)
      .then((res) => (Array.isArray(res?.data) ? res.data : []))
      .catch((err) => {
        if (handleNotApproved(err)) throw err;
        toast({ title: "Error", description: "Failed to fetch orders", variant: "destructive" });
        return [];
      });

    const statsPromise = getCanteenStats(canteenIdToUse, token)
      .then((res) => res?.data || null)
      .catch((err) => {
        if (handleNotApproved(err)) throw err;
        toast({ title: "Error", description: "Failed to fetch statistics", variant: "destructive" });
        return null;
      });

    // Run all fetches in parallel
    const [menuItemsArray, ordersArray, statsData] = await Promise.all([
      menuPromise,
      ordersPromise,
      statsPromise,
    ]);

    // Set state in minimal updates
    setMenuItems(menuItemsArray);
    setOrders(ordersArray);
    setCanteenStats(statsData);

  } catch (error) {
    console.error("Error fetching data:", error);
    if (!handleNotApproved(error)) {
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
    }
  } finally {
    setLoading(false);
  }
};

const handleImageUpload = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setImageUploading(true);

  try {
    // Validate image
    validateImage(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    // Update states in one go to avoid multiple renders
    setSelectedImage(file);
    setImagePreview(previewUrl);
    setFormData(prev => ({ ...prev, image: '' })); // Image will be uploaded later

    toast({
      title: 'Success',
      description: 'Image selected successfully!',
    });
  } catch (err) {
    console.error('Image validation error:', err);

    // Reset states
    setSelectedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));

    toast({
      title: 'Invalid Image',
      description:
        err instanceof Error ? err.message : 'Please select a valid image file',
      variant: 'destructive',
    });
  } finally {
    setImageUploading(false);
  }
};


  // Handle form submission for creating/updating menu items using dynamic canteenId
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (imageUploading) {
      return toast({
        title: 'Please wait',
        description: 'Image is still uploading. Please wait a moment.',
        variant: 'destructive',
      });
    }
  
    if (!isAuthenticated || !user) {
      return toast({
        title: 'Error',
        description: 'You must be logged in to access this feature',
        variant: 'destructive',
      });
    }
  
    if (!canteenId) {
      console.error('No canteenId available for form submission');
      return toast({
        title: 'Error',
        description: 'Canteen ID not found. Please refresh the page.',
        variant: 'destructive',
      });
    }
  
    try {
      console.log('Submitting menu item with canteenId:', canteenId);
  
      const getBase64FromFile = (file: File | Blob) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
  
      // Determine image data
      let imageData: string | undefined;
      if (formData.image?.startsWith('data:')) {
        imageData = formData.image;
      } else if (formData.image?.startsWith('blob:')) {
        const blob = await (await fetch(formData.image)).blob();
        imageData = await getBase64FromFile(blob);
      } else if (selectedImage) {
        imageData = await getBase64FromFile(selectedImage);
      }
  
      const itemData = {
        name: formData.name,
        price: parseFloat(formData.price),
        canteenId,
        description: formData.description,
        category: formData.category,
        canteen: canteenId,
        isVeg: formData.isVeg,
        available: formData.available,
        portion: formData.portion,
        quantity: formData.quantity,
        image: imageData,
      };
  
      console.log('Submitting item data:', itemData);
  
      if (editingItem) {
        await updateMenuItem(editingItem._id, itemData);
        toast({ title: 'Success', description: 'Menu item updated successfully' });
      } else {
        await createMenuItem(itemData);
        toast({ title: 'Success', description: 'Menu item added successfully' });
      }
  
      // Cleanup
      setIsAddItemOpen(false);
      setIsEditItemOpen(false);
      setEditingItem(null);
      resetForm();
  
      // Refresh menu data
      await fetchData(canteenId);
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
  
    setImagePreview(image);
    setIsEditItemOpen(true);
  };
  

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
  
    try {
      await deleteMenuItem(itemId);
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      });
  
      // Ensure latest data after deletion
      await fetchData();
    } catch (error) {
      console.error('Delete menu item error:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete menu item',
        variant: 'destructive',
      });
    }
  };
  

  const handleToggleReady = (itemId: string, isReady: boolean) => {
    setMenuItems(prev =>
      prev.map(item =>
        item._id === itemId ? { ...item, isReady } : item
      )
    );
  };
  

  const resetForm = () => {
    // Revoke object URL if it exists to prevent memory leaks
    if (imagePreview?.startsWith('blob:')) {
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
      const token = localStorage.getItem('token') ?? '';
      const { data } = await getOrderById(orderId, token);
      setOrderDetails(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: 'Error',
        description:
          (error as any)?.response?.data?.message || 'Failed to fetch order details',
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
