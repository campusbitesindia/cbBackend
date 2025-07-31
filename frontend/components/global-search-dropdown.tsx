import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  _id: string;
  name: string;
  type: 'item' | 'canteen' | 'dish';
  [key: string]: any;
}

interface Props {
  query: string;
  setQuery: (q: string) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  onSearch?: (query: string) => void;
}

export default function GlobalSearchDropdown({ query, setQuery, open, setOpen, onSearch }: Props) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ [type: string]: SearchResult[] }>({});
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter()

  // Debounce search
  useEffect(() => {
    if (!query) {
      setResults({});
      setError('');
      setOpen(false);
      return;
    }
    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await api.get<{ results: { [type: string]: SearchResult[] } }>(`/api/v1/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.results || {});
        setError('');
        setOpen(true);
      } catch {
        setError('Something went wrong.');
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [query, setOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, setOpen]);

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl px-5 py-2.5 shadow-lg">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          ref={inputRef}
          value={query}
          onChange={e => {
            setQuery(e.target.value); 
            setError('');
          }}
          placeholder="Search for items, dishes, or canteens..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-base"
          onFocus={() => query && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              // Try to find a matching result
              const allResults = Object.values(results).flat()
              const match = allResults.find(
                (item) => item.name.toLowerCase() === query.trim().toLowerCase()
              )
              if (match) {
                // Navigate to the matched item's page
                window.location.href = getResultLink(match)
                setOpen(false)
              } else {
                // Show DNE result
                setError('No such canteen found.')
                setOpen(true)
              }
            }
          }}
        />
      </div>
      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-50 max-h-80 overflow-y-auto"
        >
          <div className="p-4">
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
                  <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2 capitalize">{type}s</div>
                  <ul className="space-y-2">
                    {items.map(item => (
                      <li key={item._id}>
                        <div
                          className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white cursor-pointer"
                          onMouseDown={() => {
                            setQuery(item.name);
                            setOpen(false);
                            if (typeof window !== "undefined") {
                              window.dispatchEvent(new Event("closeMobileMenu"));
                            }
                            router.push(getResultLink(item)); // <-- This navigates immediately!
                          }}
                          >
                          {item.name}
                          {item.type === 'item' && item.price && (
                            <span className="ml-2 text-sm text-gray-400">₹{item.price}</span>
                          )}
                          {item.type === 'canteen' && item.location && (
                            <span className="ml-2 text-sm text-gray-400">{item.location}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getResultLink(item: SearchResult) {
  if (item.type === 'item' || item.type === 'dish') return `/menu/${item._id}`;
  if (item.type === 'canteen') return `/menu/${item._id}`;
  return '#';
} 