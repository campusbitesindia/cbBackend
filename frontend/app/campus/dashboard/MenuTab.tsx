import React from 'react';
import { Plus, RefreshCw, Menu, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MenuItemCard } from './MenuItemCard';
import { MenuItemForm } from './MenuItemForm';
import { MenuItemFilters } from './MenuItemFilters';
import { MenuItem } from '@/services/menuService';

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
}

export const MenuTab: React.FC<MenuTabProps> = ({
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
}) => {
  return (
    <div className='space-y-10'>
      <div className='flex justify-between items-end mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800 mb-1'>Menu Items</h1>
          <p className='text-gray-600'>Manage your menu items and categories</p>
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
            <DialogContent className='max-w-md bg-white text-black max-h-[90vh] overflow-y-auto scrollbar-hide'>
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your menu with details and image.
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
            className='bg-white text-black border border-gray-200 hover:border-gray-400 transition-colors flex items-center h-10'
            title='Refresh menu items'
            disabled={!canteenId}>
            <RefreshCw className='w-4 h-4 mr-1' />
            Refresh
          </Button>
        </div>
      </div>

      <Separator className='mb-6 bg-gray-200' />

      <MenuItemFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        menuItems={menuItems}
        categories={categories}
      />

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {menuLoading ? (
          <div className='col-span-full flex flex-col items-center justify-center py-16 px-4'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>
                Loading Menu Items...
              </h3>
              <p className='text-gray-500'>
                Please wait while we fetch your menu items.
              </p>
            </div>
          </div>
        ) : menuItems && menuItems.length > 0 && filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className='col-span-full flex flex-col items-center justify-center py-16 px-4'>
            <div className='text-center max-w-md'>
              <Menu className='w-16 h-16 mx-auto mb-6 text-gray-300' />
              <h3 className='text-xl font-semibold text-gray-700 mb-2'>
                No Menu Items Found
              </h3>
              <p className='text-gray-500 mb-6'>
                {!menuItems || menuItems.length === 0
                  ? "You haven't added any menu items yet. Start by adding your first menu item."
                  : searchTerm ||
                    statusFilter !== 'all' ||
                    categoryFilter !== 'all'
                  ? 'No items match your current filters. Try adjusting your search or filter criteria.'
                  : 'No menu items available.'}
              </p>

              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                {!menuItems || menuItems.length === 0 ? (
                  <>
                    <Button
                      onClick={() => {
                        resetForm();
                        setIsAddItemOpen(true);
                      }}
                      className='bg-blue-600 hover:bg-blue-700 text-white'>
                      <Plus className='w-4 h-4 mr-2' />
                      Add Your First Item
                    </Button>
                    <Button
                      onClick={onRefresh}
                      className='bg-green-600 hover:bg-green-700 text-white'
                      disabled={!canteenId}>
                      <RefreshCw className='w-4 h-4 mr-2' />
                      Refresh Data
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setCategoryFilter('all');
                      }}
                      className='border-gray-300 text-gray-700 hover:bg-gray-50'>
                      <XCircle className='w-4 h-4 mr-2' />
                      Clear Filters
                    </Button>
                    <Button
                      onClick={onRefresh}
                      className='bg-blue-600 hover:bg-blue-700 text-white'
                      disabled={!canteenId}>
                      <RefreshCw className='w-4 h-4 mr-2' />
                      Refresh
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
        <DialogContent className='max-w-md bg-white border border-gray-200 text-black max-h-[90vh] overflow-y-auto scrollbar-hide'>
          <DialogHeader>
            <DialogTitle className='text-black'>Edit Menu Item</DialogTitle>
            <DialogDescription className='text-black'>
              Update the details of your menu item.
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
};
