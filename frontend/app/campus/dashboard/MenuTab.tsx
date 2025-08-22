import React, { memo, useCallback, useMemo } from 'react';
import { Plus, RefreshCw, Menu, XCircle, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { MenuItemCard } from './MenuItemCard';
import { MenuItemFilters } from './MenuItemFilters';
import { MenuItem } from '@/services/menuService';
import { MenuItemForm } from './MenuItemForm';

interface MenuItemFormData {
  name: string;
  price: string;
  description: string;
  category: string;
  isVeg: boolean;
  available: boolean;
  image: string;
  portion: string;
  quantity: string;
}

interface MenuTabProps {
  menuItems: MenuItem[];
  filteredItems: MenuItem[];
  categories: string[];
  menuLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  readyFilter: string;
  setReadyFilter: (ready: string) => void;
  isAddItemOpen: boolean;
  setIsAddItemOpen: (open: boolean) => void;
  isEditItemOpen: boolean;
  setIsEditItemOpen: (open: boolean) => void;
  formData: MenuItemFormData;
  setFormData: React.Dispatch<React.SetStateAction<MenuItemFormData>>;
  imageUploading: boolean;
  imagePreview: string;
  editingItem: MenuItem | null;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
  resetForm: () => void;
  canteenId: string | null;
  onToggleReady?: (itemId: string, isReady: boolean) => void;
}

const MenuTabComponent: React.FC<MenuTabProps> = memo(
  ({
    menuItems,
    filteredItems,
    categories,
    menuLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    readyFilter,
    setReadyFilter,
    isAddItemOpen,
    setIsAddItemOpen,
    isEditItemOpen,
    setIsEditItemOpen,
    formData,
    setFormData,
    imageUploading,
    imagePreview,
    editingItem,
    onSubmit,
    onEdit,
    onDelete,
    onImageUpload,
    onRefresh,
    resetForm,
    canteenId,
    onToggleReady,
  }) => {
    // Memoize callbacks to prevent unnecessary re-renders
    const handleAddItemClick = useCallback(() => {
      resetForm();
      setIsAddItemOpen(true);
    }, [resetForm, setIsAddItemOpen]);

    const handleClearFilters = useCallback(() => {
      setSearchTerm('');
      setStatusFilter('all');
      setCategoryFilter('all');
      setReadyFilter('all');
    }, [setSearchTerm, setStatusFilter, setCategoryFilter, setReadyFilter]);

    // Memoize computed values
    const hasFiltersApplied = useMemo(() => {
      return (
        searchTerm ||
        statusFilter !== 'all' ||
        categoryFilter !== 'all' ||
        readyFilter !== 'all'
      );
    }, [searchTerm, statusFilter, categoryFilter, readyFilter]);

    const hasMenuItems = useMemo(() => {
      return menuItems && menuItems.length > 0;
    }, [menuItems]);

    const hasFilteredItems = useMemo(() => {
      return filteredItems.length > 0;
    }, [filteredItems]);

    // Memoize empty state content based on conditions
    const emptyStateContent = useMemo(() => {
      if (!hasMenuItems) {
        return {
          title: 'Welcome to Your Menu!',
          description:
            'Start building your amazing menu by adding your first delicious item. Your customers are waiting to discover what you have to offer!',
          showAddButton: true,
        };
      }
      if (hasFiltersApplied) {
        return {
          title: 'No Items Found',
          description:
            "No items match your current search criteria. Try adjusting your filters or search terms to find what you're looking for.",
          showAddButton: false,
        };
      }
      return {
        title: 'No Items Found',
        description:
          'Your menu is currently empty. Add some items to get started.',
        showAddButton: true,
      };
    }, [hasMenuItems, hasFiltersApplied]);

    // Loading state component
    const LoadingState = memo(() => (
      <div className='flex flex-col items-center justify-center py-24'>
        <div className='relative'>
          <div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-200'></div>
          <div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0'></div>
        </div>
        <div className='text-center mt-8 space-y-3'>
          <h3 className='text-xl font-semibold text-gray-800'>
            Loading Your Menu Items
          </h3>
          <p className='text-gray-600 max-w-md mx-auto'>
            Please wait while we fetch your delicious menu items and prepare
            everything for you.
          </p>
        </div>
      </div>
    ));

    // Empty state component
    const EmptyState = memo(() => (
      <div className='flex flex-col items-center justify-center py-24'>
        <div className='bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-12 max-w-2xl mx-auto text-center'>
          <div className='relative mb-8'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20'></div>
            <Menu className='w-20 h-20 mx-auto text-gray-400 relative z-10' />
          </div>

          <h3 className='text-2xl font-bold text-gray-800 mb-4'>
            {emptyStateContent.title}
          </h3>
          <p className='text-gray-600 mb-8 text-lg leading-relaxed'>
            {emptyStateContent.description}
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            {emptyStateContent.showAddButton ? (
              <>
                <Button
                  onClick={handleAddItemClick}
                  className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 rounded-xl font-semibold text-lg'>
                  <Plus className='w-5 h-5 mr-2' />
                  {!hasMenuItems ? 'Add Your First Item' : 'Add New Item'}
                </Button>
                <Button
                  onClick={onRefresh}
                  className='bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 rounded-xl font-semibold text-lg'
                  disabled={!canteenId}>
                  <RefreshCw className='w-5 h-5 mr-2' />
                  Refresh Data
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleClearFilters}
                  className='bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 shadow-md hover:shadow-lg transition-all duration-200 px-6 py-3 rounded-xl font-semibold'>
                  <XCircle className='w-5 h-5 mr-2' />
                  Clear All Filters
                </Button>
                <Button
                  onClick={onRefresh}
                  className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl font-semibold'
                  disabled={!canteenId}>
                  <RefreshCw className='w-5 h-5 mr-2' />
                  Refresh Menu
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    ));

    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20'>
        {/* Header Section */}
        <div className='bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10'>
          <div className='max-w-7xl mx-auto px-6 py-8'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
              <div className='space-y-2'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg'>
                    <Menu className='w-6 h-6 text-white' />
                  </div>
                  <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent'>
                    Menu Management
                  </h1>
                </div>
                <p className='text-gray-600 text-lg font-medium'>
                  Create and manage your delicious menu items
                </p>
              </div>

              <div className='flex items-center gap-3'>
                <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={handleAddItemClick}
                      className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-2.5 rounded-xl font-semibold'>
                      <Plus className='w-4 h-4 mr-2' />
                      Add New Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-lg bg-white border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide rounded-2xl'>
                    <DialogHeader className='space-y-3 pb-6'>
                      <DialogClose asChild>
                        <button
                          className='absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200'
                          aria-label='Close'>
                          <X className='w-5 h-5 text-gray-500' />
                        </button>
                      </DialogClose>
                      <DialogTitle className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                        <Sparkles className='w-6 h-6 text-blue-600' />
                        Add New Menu Item
                      </DialogTitle>
                      <DialogDescription className='text-gray-600 text-base'>
                        Create a delicious new menu item with detailed
                        information and appetizing images.
                      </DialogDescription>
                    </DialogHeader>
                    <MenuItemForm
                      formData={formData}
                      setFormData={setFormData}
                      onSubmit={onSubmit}
                      isEditing={false}
                      onImageUpload={onImageUpload}
                    />
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={onRefresh}
                  className='bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-md hover:shadow-lg transition-all duration-200 px-4 py-2.5 rounded-xl font-semibold'
                  title='Refresh menu items'
                  disabled={!canteenId}>
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className='max-w-7xl mx-auto px-6 py-6'>
          <div className='bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6'>
            <MenuItemFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              menuItems={menuItems}
              categories={categories}
              readyFilter={readyFilter}
              setReadyFilter={setReadyFilter}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className='max-w-7xl mx-auto px-6 pb-12'>
          {menuLoading ? (
            <LoadingState />
          ) : hasFilteredItems ? (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'>
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleReady={onToggleReady}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Edit Item Dialog */}
        <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
          <DialogContent className='max-w-lg bg-white border border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide rounded-2xl'>
            <DialogHeader className='space-y-3 pb-6'>
              <DialogClose asChild>
                <button
                  className='absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200'
                  aria-label='Close'>
                  <X className='w-5 h-5 text-gray-500' />
                </button>
              </DialogClose>
              <DialogTitle className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                <Sparkles className='w-6 h-6 text-purple-600' />
                Edit Menu Item
              </DialogTitle>
              <DialogDescription className='text-gray-600 text-base'>
                Update your menu item details to keep your offerings fresh and
                accurate.
              </DialogDescription>
            </DialogHeader>
            <MenuItemForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={onSubmit}
              isEditing={true}
              onImageUpload={onImageUpload}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

MenuTabComponent.displayName = 'MenuTab';

export { MenuTabComponent as MenuTab };
export default MenuTabComponent;
