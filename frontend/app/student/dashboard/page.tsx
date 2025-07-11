"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Star, Clock, MapPin, Filter, Heart, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Canteen } from "@/types"
import { useCart } from "@/context/cart-context"

export default function StudentDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [restaurants, setRestaurants] = useState<Canteen[]>([])
  const { cart } = useCart()

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    const fetchCanteens = async () => {
      try {
        const response = await fetch("/api/v1/canteens")
        if (!response.ok) {
          throw new Error("Failed to fetch canteens")
        }
        const data = await response.json()
        setRestaurants(data.data)
      } catch (error) {
        console.error("Error fetching canteens:", error)
      }
    }

    fetchCanteens()
  }, [])

  const categories = [
    { id: "all", name: "All", icon: "🍽️" },
    { id: "indian", name: "Indian", icon: "🍛" },
    { id: "italian", name: "Italian", icon: "🍕" },
    { id: "healthy", name: "Healthy", icon: "🥗" },
    { id: "american", name: "American", icon: "🍔" },
    { id: "chinese", name: "Chinese", icon: "🥡" },
  ]

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || restaurant.cuisine.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-20 w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center animate-float">
          <span className="text-2xl">🍕</span>
        </div>
        <div className="absolute top-40 right-32 w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center animate-float-delayed">
          <span className="text-xl">🍔</span>
        </div>
        <div className="absolute bottom-32 left-16 w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center animate-bounce-slow">
          <span className="text-xl">🌮</span>
        </div>

        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Hey there,{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Student!
                  </span>
                </h1>
                <p className="text-gray-400 text-lg">What are you craving today?</p>
              </div>
              <Link href="/cart">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart ({cartItemsCount})
                </Button>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input
                type="text"
                placeholder="Search for restaurants, cuisines, or dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-16 py-4 bg-gray-800/50 border-gray-700 rounded-2xl text-white placeholder-gray-400 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl px-4">
                <Filter className="w-5 h-5" />
              </Button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : "border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                  } rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 font-semibold`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              Featured Restaurants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants
                .filter((restaurant) => restaurant.featured)
                .map((restaurant) => (
                  <Card
                    key={restaurant._id}
                    className="bg-gray-800/30 border-gray-700/30 backdrop-blur-xl hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 group overflow-hidden"
                  >
                    <div className="relative">
                      <Image
                        src={restaurant.image || "/placeholder.svg"}
                        alt={restaurant.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {restaurant.discount && (
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-3 py-1">
                          {restaurant.discount}
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-3 right-3 border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      {!restaurant.isOpen && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Badge variant="destructive" className="text-lg px-4 py-2">
                            Closed
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-white mb-1">{restaurant.name}</CardTitle>
                          <CardDescription className="text-gray-400">{restaurant.cuisine}</CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white font-semibold">{restaurant.rating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{restaurant.deliveryTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{restaurant.distance}</span>
                        </div>
                      </div>
                      <Link href={`/menu/${restaurant._id}`}>
                        <Button
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 rounded-xl transition-all duration-300"
                          disabled={!restaurant.isOpen}
                        >
                          {restaurant.isOpen ? "Order Now" : "Closed"}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* All Restaurants */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">All Restaurants</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <Card
                  key={restaurant._id}
                  className="bg-gray-800/30 border-gray-700/30 backdrop-blur-xl hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 group overflow-hidden"
                >
                  <div className="relative">
                    <Image
                      src={restaurant.image || "/placeholder.svg"}
                      alt={restaurant.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {restaurant.discount && (
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-3 py-1">
                        {restaurant.discount}
                      </Badge>
                    )}
                    {restaurant.featured && (
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-3 py-1">
                        ⭐ Featured
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute bottom-3 right-3 border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    {!restaurant.isOpen && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="destructive" className="text-lg px-4 py-2">
                          Closed
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-white mb-1">{restaurant.name}</CardTitle>
                        <CardDescription className="text-gray-400">{restaurant.cuisine}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white font-semibold text-sm">{restaurant.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{restaurant.distance}</span>
                      </div>
                    </div>
                    <Link href={`/menu/${restaurant._id}`}>
                      <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 rounded-xl transition-all duration-300"
                        disabled={!restaurant.isOpen}
                      >
                        {restaurant.isOpen ? "Order Now" : "Closed"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredRestaurants.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No restaurants found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
