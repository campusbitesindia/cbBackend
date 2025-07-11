"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Clock, MapPin, Filter, Heart, Plus, Minus, Utensils, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { Canteen, Item } from "@/types"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { API_ENDPOINTS } from "@/lib/constants"

const CanteenMenuPage = () => {
  const params = useParams()
  const { canteenId } = params
  const { toast } = useToast()
  
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart()

  const [canteen, setCanteen] = useState<Canteen | null>(null)
  const [menuItems, setMenuItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (canteenId) {
      const fetchCanteenDetails = async () => {
        try {
          const res = await fetch(`${API_ENDPOINTS.CANTEENS}/${canteenId}`)
          if (!res.ok) throw new Error("Failed to fetch canteen details")
          const data = await res.json()
          setCanteen(data.canteen) // Changed from data.data to data.canteen to match backend response
        } catch (error) {
          console.error(error)
          toast({ variant: "destructive", title: "Error", description: "Could not fetch canteen details." })
        }
      }

      const fetchMenuItems = async () => {
        try {
          const res = await fetch(`${API_ENDPOINTS.MENU}/${canteenId}`)
          if (!res.ok) throw new Error("Failed to fetch menu")
          const data = await res.json()
          setMenuItems(data.data || [])
        } catch (error) {
          console.error(error)
          toast({ variant: "destructive", title: "Error", description: "Could not fetch menu items." })
        }
      }
      
      Promise.all([fetchCanteenDetails(), fetchMenuItems()]).finally(() => setLoading(false))
    }
  }, [canteenId, toast])
  
  const categories = ["all", ...new Set(menuItems.map(item => item.category))]

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCartItemQuantity = (itemId: string) => cart.find(item => item.id === itemId)?.quantity || 0

  const handleAddToCart = (item: Item) => {
    addToCart({
      id: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image || "/placeholder.svg",
    });
    toast({ title: "Added to cart", description: `${item.name} was added.` });
  }

  const handleIncrement = (item: Item) => {
    updateQuantity(item._id, getCartItemQuantity(item._id) + 1);
  }

  const handleDecrement = (item: Item) => {
    const currentQuantity = getCartItemQuantity(item._id);
    if (currentQuantity === 1) {
      removeFromCart(item._id);
      toast({ title: "Removed from cart", description: `${item.name} was removed.` });
    } else {
      updateQuantity(item._id, currentQuantity - 1);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:bg-gray-950 transition-colors duration-500 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!canteen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:bg-gray-950 transition-colors duration-500 flex justify-center items-center">
        <div className="text-center py-10 text-gray-900 dark:text-white">Canteen not found.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:bg-gray-950 transition-colors duration-500">
      <header className="relative h-64 md:h-80">
        <Image src={canteen.image || "/placeholder.svg"} alt={canteen.name} layout="fill" objectFit="cover" className="opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
            <Link href="/menu" className="flex items-center gap-2 text-white mb-4 hover:underline transition-colors">
                <ArrowLeft size={16} /> Back to Restaurants
            </Link>
          <h1 className="text-5xl font-bold text-white drop-shadow-md">{canteen.name}</h1>
          <p className="text-lg text-gray-200 drop-shadow-sm">{canteen.cuisine}</p>
          <div className="flex items-center gap-4 mt-2 text-gray-200">
             <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>{canteen.rating}</span>
            </div>
            <div className="flex items-center gap-1">
                <Clock className="w-5 h-5" />
                <span>{canteen.deliveryTime}</span>
            </div>
             <div className="flex items-center gap-1">
                <MapPin className="w-5 h-5" />
                <span>{canteen.distance}</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <Card className="sticky top-24">
              <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'secondary' : 'ghost'}
                    onClick={() => setSelectedCategory(category)}
                    className="justify-start capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </aside>
          
          <main className="md:col-span-3">
             <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {filteredMenuItems.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMenuItems.map(item => {
                    const quantity = getCartItemQuantity(item._id);
                    return (
                    <Card key={item._id} className="flex flex-col">
                        <CardHeader>
                            {item.image && <Image src={item.image} alt={item.name} width={400} height={200} className="rounded-md mb-4" />}
                            <CardTitle>{item.name}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-end">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-lg">₹{item.price || "N/A"}</span>
                                <Badge variant={item.isVeg ? "default" : "destructive"}>{item.isVeg ? "Veg" : "Non-Veg"}</Badge>
                            </div>
                            {quantity === 0 ? (
                                <Button onClick={() => handleAddToCart(item)} className="w-full">
                                    <Plus size={16} className="mr-2" /> Add to cart
                                </Button>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <Button size="icon" onClick={() => handleDecrement(item)}><Minus size={16}/></Button>
                                    <span className="font-bold text-lg">{quantity}</span>
                                    <Button size="icon" onClick={() => handleIncrement(item)}><Plus size={16}/></Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    )
                })}
                </div>
            ) : (
                <p className="text-center py-10 text-gray-600 dark:text-gray-400">No menu items found.</p>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default CanteenMenuPage; 