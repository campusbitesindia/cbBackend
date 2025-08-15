export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
  role: 'student' | 'campus_store' | 'admin';
  isVerified: boolean;
  isBanned?: boolean;
  is_verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Canteen {
  _id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  image: string;
  isOpen: boolean;
  is_verified?: boolean;
  isBanned?: boolean;
  owner: any;
  discount?: string;
  featured?: boolean;
  imageUrl?: string;
  fssaiLicense?: string;
}

export interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category: string;
  rating: number;
  isVeg: boolean;
  canteen: string;
  isReady: boolean;
}

export interface Order {
  _id: string;
  OrderNumber?: string;
  student: string | { _id: string; name: string };
  canteen: {
    _id: string;
    name: string;
  };
  items: Array<{
    _id: string;
    nameAtPurchase: string;
    priceAtPurchase: number;
    item: {
      _id: string;
      name: string;
      price: number;
      image?: string;
    };
    quantity: number;
  }>;
  total: number;
  status:
    | 'placed'
    | 'preparing'
    | 'ready'
    | 'completed'
    | 'cancelled'
    | 'payment_pending';
  payment?: {
    method: 'cod' | 'upi' | 'card';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    upiDetails?: {
      upiId: string;
      paymentApp: string;
    };
    cardDetails?: {
      lastFourDigits: string;
      cardType: string;
      holderName: string;
    };
    paidAt?: string;
  };
  createdAt: string;
  updatedAt: string;
  paymentStatus: string;
}

export interface Review {
  _id: string;
  student: {
    _id: string;
    name: string;
  };
  canteen: {
    _id: string;
    name: string;
  };
  item: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  rating: number;
  comment: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPayload {
  canteenId: string;
  itemId: string;
  rating: number;
  comment: string;
}

export interface ReviewsResponse {
  success: boolean;
  message: string;
  data: Review[];
}

export interface AverageRatingResponse {
  success: boolean;
  message: string;
  data: {
    item?: Item;
    canteen?: Canteen;
    AverageRating: number;
  };
}
