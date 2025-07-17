import React from 'react';
import { MenuItem } from '@/services/menuService';

interface MenuItemFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  menuItems: MenuItem[];
  categories: string[];
}

export const MenuItemFilters: React.FC<MenuItemFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  menuItems,
  categories,
}) => {
  return (
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
            menuItems.filter((i) => ('available' in i ? i.available : true))
              .length
          }
          )
        </option>
        <option value='inactive'>
          Inactive Items (
          {
            menuItems.filter((i) => ('available' in i ? !i.available : false))
              .length
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
  );
};
