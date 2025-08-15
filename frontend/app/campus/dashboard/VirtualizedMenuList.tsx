'use client';

import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { MenuItemCard } from './MenuItemCard';
import { MenuItem } from '@/services/menuService';

interface VirtualizedMenuListProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onToggleReady?: (itemId: string, isReady: boolean) => void;
  height?: number;
  itemHeight?: number;
}

const MemoizedMenuItemCard = memo(MenuItemCard);

const ItemRenderer = memo(
  ({
    index,
    style,
    data,
  }: {
    index: number;
    style: React.CSSProperties;
    data: {
      items: MenuItem[];
      onEdit: (item: MenuItem) => void;
      onDelete: (itemId: string) => void;
      onToggleReady?: (itemId: string, isReady: boolean) => void;
    };
  }) => {
    const item = data.items[index];

    return (
      <div style={style}>
        <div className='p-2'>
          <MemoizedMenuItemCard
            item={item}
            onEdit={data.onEdit}
            onDelete={data.onDelete}
            onToggleReady={data.onToggleReady}
          />
        </div>
      </div>
    );
  }
);

ItemRenderer.displayName = 'ItemRenderer';

export const VirtualizedMenuList: React.FC<VirtualizedMenuListProps> = memo(
  ({
    items,
    onEdit,
    onDelete,
    onToggleReady,
    height = 600,
    itemHeight = 200,
  }) => {
    const itemData = useMemo(
      () => ({
        items,
        onEdit,
        onDelete,
        onToggleReady,
      }),
      [items, onEdit, onDelete, onToggleReady]
    );

    // If there are fewer than 10 items, render normally to avoid virtualization overhead
    if (items.length < 10) {
      return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {items.map((item) => (
            <MemoizedMenuItemCard
              key={item._id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleReady={onToggleReady}
            />
          ))}
        </div>
      );
    }

    return (
      <div className='w-full'>
        <List
          height={height}
          itemCount={items.length}
          itemSize={itemHeight}
          itemData={itemData}
          width='100%'>
          {ItemRenderer}
        </List>
      </div>
    );
  }
);

VirtualizedMenuList.displayName = 'VirtualizedMenuList';

