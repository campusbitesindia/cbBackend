'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useAuth } from './auth-context';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  canteenId: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem, onCanteenConflict?: () => void) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
  clearUserCart?: () => void; // Optional function to clear user-specific cart
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate cart key based on user ID or use global cart for non-authenticated users
  const getCartKey = () => {
    return user?.id ? `cart_${user.id}` : 'cart_guest';
  };

  // Load cart from localStorage when component mounts or user changes
  useEffect(() => {
    const loadCart = () => {
      try {
        const cartKey = getCartKey();
        const storedCart = localStorage.getItem(cartKey);

        if (storedCart && storedCart !== 'undefined' && storedCart !== 'null') {
          const parsedCart = JSON.parse(storedCart);
          if (Array.isArray(parsedCart)) {
            // Validate cart items have required properties
            const validCart = parsedCart.filter(
              (item) =>
                item &&
                typeof item.id === 'string' &&
                typeof item.name === 'string' &&
                typeof item.price === 'number' &&
                typeof item.quantity === 'number'
            );
            setCart(validCart);
            console.log(`Loaded ${validCart.length} items from ${cartKey}`);
          } else {
            console.warn(`Invalid cart format in ${cartKey}, resetting`);
            setCart([]);
          }
        } else {
          setCart([]);
          console.log(`No cart found for ${cartKey}, starting with empty cart`);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCart([]);
        // Clear corrupted data
        try {
          localStorage.removeItem(getCartKey());
        } catch (clearError) {
          console.error('Error clearing corrupted cart:', clearError);
        }
      } finally {
        setIsLoaded(true);
      }
    };

    loadCart();
  }, [user?.id]); // Reload cart when user changes

  // Calculate total price and save to localStorage whenever cart changes (but only after initial load)
  useEffect(() => {
    if (!isLoaded) return; // Don't save until we've loaded from localStorage

    // Calculate total price
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);

    // Save cart to localStorage with user-specific key
    try {
      const cartKey = getCartKey();
      const cartData = JSON.stringify(cart);
      localStorage.setItem(cartKey, cartData);
      console.log(`Saved ${cart.length} items to ${cartKey}`);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      // If localStorage is full or unavailable, at least log the issue
      if (error instanceof Error) {
        console.error('Storage error details:', error.message);
      }
    }
  }, [cart, user?.id, isLoaded]);

  const addToCart = (item: CartItem, onCanteenConflict?: () => void) => {
    setCart((prevCart) => {
      // Check if cart is empty - if so, add item directly
      if (prevCart.length === 0) {
        return [item];
      }

      // Check if item is from same canteen as existing items
      const currentCanteenId = prevCart[0].canteenId;
      if (item.canteenId !== currentCanteenId) {
        // Call conflict callback if provided
        if (onCanteenConflict) {
          onCanteenConflict();
        }
        // Return current cart unchanged
        return prevCart;
      }

      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);

      if (existingItem) {
        // Map through and update the quantity of the existing item
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }

      // Item not in cart, add it to the list
      return [...prevCart, item];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Function to clear user-specific cart from localStorage
  const clearUserCart = () => {
    try {
      const cartKey = getCartKey();
      localStorage.removeItem(cartKey);
      setCart([]);
    } catch (error) {
      console.error('Error clearing user cart:', error);
    }
  };

  // Function to migrate guest cart to user cart when user logs in
  const migrateGuestCartToUser = () => {
    if (!user?.id) return;

    try {
      const guestCart = localStorage.getItem('cart_guest');
      if (guestCart) {
        const parsedGuestCart = JSON.parse(guestCart);
        if (Array.isArray(parsedGuestCart) && parsedGuestCart.length > 0) {
          // Check if user already has a cart
          const userCartKey = `cart_${user.id}`;
          const existingUserCart = localStorage.getItem(userCartKey);

          if (!existingUserCart || JSON.parse(existingUserCart).length === 0) {
            // Transfer guest cart to user cart
            localStorage.setItem(userCartKey, guestCart);
            setCart(parsedGuestCart);
          }

          // Clear guest cart after migration
          localStorage.removeItem('cart_guest');
        }
      }
    } catch (error) {
      console.error('Error migrating guest cart:', error);
    }
  };

  // Migrate guest cart when user logs in
  useEffect(() => {
    if (user?.id && isLoaded) {
      migrateGuestCartToUser();
    }
  }, [user?.id, isLoaded]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        clearUserCart,
        totalPrice,
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
