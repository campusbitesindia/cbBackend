"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image: string,
  canteenId:string
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  updateQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }
  }, [])

  useEffect(() => {
    // Calculate total price whenever cart changes
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotalPrice(total)

    // Save cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

const addToCart = (item: CartItem) => {
  setCart((prevCart) => {
    const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)

    if (existingItem) {
      // Map through and update the quantity of the existing item
      return prevCart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
          : cartItem
      )
    }

    // Item not in cart, add it to the list
    return [...prevCart, item]
  })
}


  const updateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
