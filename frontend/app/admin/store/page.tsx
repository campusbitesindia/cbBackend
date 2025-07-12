'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Store,
  MapPin,
  Clock,
  Star,
  Phone,
  Mail,
  Search,
  Filter,
} from 'lucide-react';

interface FoodVendor {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  location: string;
  operatingHours: string;
  rating: number;
  image: string;
  phone: string;
  email: string;
  isOpen: boolean;
  specialties: string[];
  priceRange: 'Budget' | 'Moderate' | 'Premium';
}

export default function AdminStorePage() {
  const [vendors, setVendors] = useState<FoodVendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<FoodVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<FoodVendor | null>(null);
  const { toast } = useToast();

  const cuisines = [
    'indian',
    'chinese',
    'italian',
    'continental',
    'fast-food',
    'beverages',
    'desserts',
    'multi-cuisine',
  ];

  const priceRanges = ['Budget', 'Moderate', 'Premium'];

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    location: '',
    operatingHours: '',
    image: '',
    phone: '',
    email: '',
    isOpen: true,
    specialties: '',
    priceRange: 'Moderate' as 'Budget' | 'Moderate' | 'Premium',
  });

  useEffect(() => {
    async function fetchVendors() {
      try {
        setIsLoading(true);
        // Simulate API call - replace with actual API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Sample vendor data
        const sampleVendors: FoodVendor[] = [
          {
            id: 1,
            name: 'Spice Garden',
            description:
              'Authentic North Indian cuisine with fresh ingredients and traditional recipes. Famous for butter chicken and naan bread.',
            cuisine: 'indian',
            location: 'Block A, Student Center',
            operatingHours: '9:00 AM - 11:00 PM',
            rating: 4.5,
            image:
              'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
            phone: '+91 98765 43210',
            email: 'spicegarden@campus.edu',
            isOpen: true,
            specialties: ['Butter Chicken', 'Biryani', 'Naan Bread'],
            priceRange: 'Moderate',
          },
          {
            id: 2,
            name: 'Pizza Corner',
            description:
              'Wood-fired pizzas with fresh toppings and crispy crust. Perfect for quick meals and group orders.',
            cuisine: 'italian',
            location: 'Block B, Food Court',
            operatingHours: '11:00 AM - 12:00 AM',
            rating: 4.2,
            image:
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
            phone: '+91 98765 43211',
            email: 'pizzacorner@campus.edu',
            isOpen: true,
            specialties: [
              'Margherita Pizza',
              'Pepperoni Pizza',
              'Garlic Bread',
            ],
            priceRange: 'Budget',
          },
          {
            id: 3,
            name: 'Healthy Bites',
            description:
              'Nutritious and delicious meals focused on health-conscious students. Fresh salads and protein-rich options.',
            cuisine: 'continental',
            location: 'Block C, Health Center',
            operatingHours: '7:00 AM - 10:00 PM',
            rating: 4.7,
            image:
              'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
            phone: '+91 98765 43212',
            email: 'healthybites@campus.edu',
            isOpen: true,
            specialties: ['Quinoa Bowl', 'Grilled Chicken', 'Smoothies'],
            priceRange: 'Premium',
          },
          {
            id: 4,
            name: 'Wok & Roll',
            description:
              'Authentic Chinese cuisine with wok-fried dishes and traditional flavors. Quick service and generous portions.',
            cuisine: 'chinese',
            location: 'Block D, International Hub',
            operatingHours: '10:00 AM - 11:00 PM',
            rating: 4.3,
            image:
              'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
            phone: '+91 98765 43213',
            email: 'wokandroll@campus.edu',
            isOpen: false,
            specialties: ['Fried Rice', 'Noodles', 'Spring Rolls'],
            priceRange: 'Budget',
          },
          {
            id: 5,
            name: 'Burger Junction',
            description:
              'Juicy burgers with fresh buns and premium ingredients. Perfect for quick bites between classes.',
            cuisine: 'fast-food',
            location: 'Block E, Sports Complex',
            operatingHours: '10:00 AM - 11:00 PM',
            rating: 4.0,
            image:
              'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop',
            phone: '+91 98765 43214',
            email: 'burgerjunction@campus.edu',
            isOpen: true,
            specialties: ['Classic Burger', 'Chicken Burger', 'French Fries'],
            priceRange: 'Budget',
          },
        ];

        setVendors(sampleVendors);
        setFilteredVendors(sampleVendors);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load vendors',
          description: 'Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchVendors();
  }, [toast]);

  useEffect(() => {
    let filtered = vendors;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vendor.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by cuisine
    if (selectedCuisine !== 'all') {
      filtered = filtered.filter(
        (vendor) => vendor.cuisine === selectedCuisine
      );
    }

    setFilteredVendors(filtered);
  }, [vendors, searchQuery, selectedCuisine]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cuisine: '',
      location: '',
      operatingHours: '',
      image: '',
      phone: '',
      email: '',
      isOpen: true,
      specialties: '',
      priceRange: 'Moderate',
    });
  };

  const handleAddVendor = () => {
    if (!formData.name || !formData.description || !formData.cuisine) {
      toast({
        variant: 'destructive',
        title: 'Missing required fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    const newVendor: FoodVendor = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      cuisine: formData.cuisine,
      location: formData.location,
      operatingHours: formData.operatingHours,
      rating: 0,
      image:
        formData.image ||
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      phone: formData.phone,
      email: formData.email,
      isOpen: formData.isOpen,
      specialties: formData.specialties
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s),
      priceRange: formData.priceRange,
    };

    setVendors([...vendors, newVendor]);
    setIsAddDialogOpen(false);
    resetForm();
    toast({
      title: 'Vendor added successfully',
      description: `${newVendor.name} has been added to the campus vendors.`,
    });
  };

  const handleEditVendor = () => {
    if (
      !editingVendor ||
      !formData.name ||
      !formData.description ||
      !formData.cuisine
    ) {
      toast({
        variant: 'destructive',
        title: 'Missing required fields',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    const updatedVendor: FoodVendor = {
      ...editingVendor,
      name: formData.name,
      description: formData.description,
      cuisine: formData.cuisine,
      location: formData.location,
      operatingHours: formData.operatingHours,
      image: formData.image,
      phone: formData.phone,
      email: formData.email,
      isOpen: formData.isOpen,
      specialties: formData.specialties
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s),
      priceRange: formData.priceRange,
    };

    setVendors(
      vendors.map((v) => (v.id === editingVendor.id ? updatedVendor : v))
    );
    setIsEditDialogOpen(false);
    setEditingVendor(null);
    resetForm();
    toast({
      title: 'Vendor updated successfully',
      description: `${updatedVendor.name} has been updated.`,
    });
  };

  const handleDeleteVendor = (vendor: FoodVendor) => {
    setVendors(vendors.filter((v) => v.id !== vendor.id));
    toast({
      title: 'Vendor deleted successfully',
      description: `${vendor.name} has been removed from the campus vendors.`,
    });
  };

  const openEditDialog = (vendor: FoodVendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      description: vendor.description,
      cuisine: vendor.cuisine,
      location: vendor.location,
      operatingHours: vendor.operatingHours,
      image: vendor.image,
      phone: vendor.phone,
      email: vendor.email,
      isOpen: vendor.isOpen,
      specialties: vendor.specialties.join(', '),
      priceRange: vendor.priceRange,
    });
    setIsEditDialogOpen(true);
  };

  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange.toLowerCase()) {
      case 'budget':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Manage Campus Vendors
              </h1>
              <p className='text-gray-600 mt-1'>
                Add, edit, and manage food vendors and outlets on campus
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className='h-4 w-4 mr-2' />
                  Add New Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>Add New Food Vendor</DialogTitle>
                  <DialogDescription>
                    Add a new food vendor or outlet to the campus directory.
                  </DialogDescription>
                </DialogHeader>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Vendor Name *</Label>
                    <Input
                      id='name'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder='e.g., Spice Garden'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='cuisine'>Cuisine Type *</Label>
                    <Select
                      value={formData.cuisine}
                      onValueChange={(value) =>
                        setFormData({ ...formData, cuisine: value })
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder='Select cuisine' />
                      </SelectTrigger>
                      <SelectContent>
                        {cuisines.map((cuisine) => (
                          <SelectItem key={cuisine} value={cuisine}>
                            {cuisine
                              .split('-')
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='location'>Location</Label>
                    <Input
                      id='location'
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder='e.g., Block A, Student Center'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='operatingHours'>Operating Hours</Label>
                    <Input
                      id='operatingHours'
                      value={formData.operatingHours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          operatingHours: e.target.value,
                        })
                      }
                      placeholder='e.g., 9:00 AM - 11:00 PM'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='phone'>Phone Number</Label>
                    <Input
                      id='phone'
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder='e.g., +91 98765 43210'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      type='email'
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder='e.g., vendor@campus.edu'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='priceRange'>Price Range</Label>
                    <Select
                      value={formData.priceRange}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, priceRange: value })
                      }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priceRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='image'>Image URL</Label>
                    <Input
                      id='image'
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder='https://example.com/image.jpg'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='isOpen'>Currently Open</Label>
                    <div className='flex items-center space-x-2'>
                      <Switch
                        id='isOpen'
                        checked={formData.isOpen}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isOpen: checked })
                        }
                      />
                      <Label htmlFor='isOpen'>
                        {formData.isOpen ? 'Open' : 'Closed'}
                      </Label>
                    </div>
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='description'>Description *</Label>
                  <Textarea
                    id='description'
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder='Describe the vendor, their specialties, and what makes them unique...'
                    rows={3}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='specialties'>
                    Specialties (comma-separated)
                  </Label>
                  <Input
                    id='specialties'
                    value={formData.specialties}
                    onChange={(e) =>
                      setFormData({ ...formData, specialties: e.target.value })
                    }
                    placeholder='e.g., Butter Chicken, Biryani, Naan Bread'
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddVendor}>Add Vendor</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search vendors...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
              <SelectTrigger className='w-full sm:w-48'>
                <Filter className='h-4 w-4 mr-2' />
                <SelectValue placeholder='Filter by cuisine' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Cuisines</SelectItem>
                {cuisines.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine
                      .split('-')
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            <span className='ml-2 text-lg'>Loading vendors...</span>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className='text-center py-12'>
            <Store className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No vendors found
            </h3>
            <p className='text-gray-500'>
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'No vendors available. Add your first vendor to get started.'}
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredVendors.map((vendor) => (
              <Card
                key={vendor.id}
                className='hover:shadow-lg transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='relative aspect-video overflow-hidden rounded-lg'>
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      className='w-full h-full object-cover'
                    />
                    {!vendor.isOpen && (
                      <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                        <Badge variant='destructive'>Closed</Badge>
                      </div>
                    )}
                    <div className='absolute top-2 right-2'>
                      <Badge className={getPriceRangeColor(vendor.priceRange)}>
                        {vendor.priceRange}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className='flex items-start justify-between mb-2'>
                    <h3 className='font-semibold text-xl line-clamp-1'>
                      {vendor.name}
                    </h3>
                    <div className='flex items-center gap-1'>
                      <Star className='h-4 w-4 text-yellow-500 fill-current' />
                      <span className='text-sm font-medium'>
                        {vendor.rating}
                      </span>
                    </div>
                  </div>

                  <p className='text-sm text-gray-600 line-clamp-2 mb-3'>
                    {vendor.description}
                  </p>

                  <div className='flex items-center gap-2 mb-3'>
                    <MapPin className='h-4 w-4 text-gray-400' />
                    <span className='text-sm text-gray-600'>
                      {vendor.location}
                    </span>
                  </div>

                  <div className='flex items-center gap-2 mb-3'>
                    <Clock className='h-4 w-4 text-gray-400' />
                    <span className='text-sm text-gray-600'>
                      {vendor.operatingHours}
                    </span>
                  </div>

                  <div className='mb-4'>
                    <p className='text-sm font-medium text-gray-700 mb-1'>
                      Specialties:
                    </p>
                    <div className='flex flex-wrap gap-1'>
                      {vendor.specialties
                        .slice(0, 3)
                        .map((specialty, index) => (
                          <Badge
                            key={index}
                            variant='outline'
                            className='text-xs'>
                            {specialty}
                          </Badge>
                        ))}
                      {vendor.specialties.length > 3 && (
                        <Badge variant='outline' className='text-xs'>
                          +{vendor.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => openEditDialog(vendor)}
                      className='flex-1'>
                      <Edit className='h-4 w-4 mr-2' />
                      Edit
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => handleDeleteVendor(vendor)}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Edit Food Vendor</DialogTitle>
            <DialogDescription>
              Update the vendor information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-name'>Vendor Name *</Label>
              <Input
                id='edit-name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder='e.g., Spice Garden'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-cuisine'>Cuisine Type *</Label>
              <Select
                value={formData.cuisine}
                onValueChange={(value) =>
                  setFormData({ ...formData, cuisine: value })
                }>
                <SelectTrigger>
                  <SelectValue placeholder='Select cuisine' />
                </SelectTrigger>
                <SelectContent>
                  {cuisines.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine
                        .split('-')
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-location'>Location</Label>
              <Input
                id='edit-location'
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder='e.g., Block A, Student Center'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-operatingHours'>Operating Hours</Label>
              <Input
                id='edit-operatingHours'
                value={formData.operatingHours}
                onChange={(e) =>
                  setFormData({ ...formData, operatingHours: e.target.value })
                }
                placeholder='e.g., 9:00 AM - 11:00 PM'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-phone'>Phone Number</Label>
              <Input
                id='edit-phone'
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder='e.g., +91 98765 43210'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-email'>Email</Label>
              <Input
                id='edit-email'
                type='email'
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder='e.g., vendor@campus.edu'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-priceRange'>Price Range</Label>
              <Select
                value={formData.priceRange}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, priceRange: value })
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-image'>Image URL</Label>
              <Input
                id='edit-image'
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder='https://example.com/image.jpg'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-isOpen'>Currently Open</Label>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='edit-isOpen'
                  checked={formData.isOpen}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isOpen: checked })
                  }
                />
                <Label htmlFor='edit-isOpen'>
                  {formData.isOpen ? 'Open' : 'Closed'}
                </Label>
              </div>
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-description'>Description *</Label>
            <Textarea
              id='edit-description'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder='Describe the vendor, their specialties, and what makes them unique...'
              rows={3}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-specialties'>
              Specialties (comma-separated)
            </Label>
            <Input
              id='edit-specialties'
              value={formData.specialties}
              onChange={(e) =>
                setFormData({ ...formData, specialties: e.target.value })
              }
              placeholder='e.g., Butter Chicken, Biryani, Naan Bread'
            />
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditVendor}>Update Vendor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
