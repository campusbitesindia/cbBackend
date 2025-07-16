"use client"

import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Loader2, Utensils, Store } from 'lucide-react';
import api from '@/lib/axios';

interface SearchResult {
  _id: string;
  name: string;
  type: 'item' | 'canteen' | 'dish';
  [key: string]: any;
}

export default function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ [type: string]: SearchResult[] }>({});
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  React.useEffect(() => {
    if (!query) {
      setResults({});
      setError('');
      return;
    }
    setLoading(true);
    const handler = setTimeout(() => {
      api.get(`/api/v1/search?q=${encodeURIComponent(query)}`)
        .then(res => {
          setResults(res.data.results || {});
          setError('');
        })
        .catch(() => setError('Something went wrong.'))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  React.useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full p-0 overflow-hidden">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-t-2xl border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for items, dishes, or canteens..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg"
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : query && Object.keys(results).length === 0 ? (
            <div className="text-center text-gray-400 py-8">No results found.</div>
          ) : (
            Object.entries(results).map(([type, items]) => (
              <div key={type} className="mb-6">
                <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2 capitalize flex items-center gap-2">{type === 'canteen' ? <Store className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}{type}s</div>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item._id}>
                      <a
                        href={getResultLink(item)}
                        className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white"
                        onClick={() => onOpenChange(false)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          {item.type === 'canteen' && item.location && (
                            <span className="text-sm text-gray-400">{item.location}</span>
                          )}
                        </div>
                        {item.type === 'item' && item.price && (
                          <span className="text-sm font-semibold text-gray-500 dark:text-gray-300">₹{item.price}</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getResultLink(item: SearchResult) {
  if (item.type === 'item' || item.type === 'dish') return `/menu/${item._id}`;
  if (item.type === 'canteen') return `/menu/${item._id}`;
  return '#';
} 