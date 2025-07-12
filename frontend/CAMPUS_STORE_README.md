# Campus Store - Food Vendors Directory

## Overview

The Campus Store feature provides a comprehensive directory of food vendors, canteens, and outlets on campus where students can discover and order food. This feature replaces the previous individual food items approach with a vendor-based system.

## Features

### For Students

- **Vendor Directory**: Browse all food vendors and outlets on campus
- **Search & Filter**: Find vendors by name, cuisine type, or specialties
- **Price Range Filtering**: Filter by budget, moderate, or premium pricing
- **Vendor Details**: View operating hours, location, ratings, and specialties
- **Contact Information**: Access phone numbers and email addresses
- **Real-time Status**: See which vendors are currently open or closed

### For Admins

- **Vendor Management**: Add, edit, and delete food vendors
- **Status Control**: Toggle vendor open/closed status
- **Information Management**: Update vendor details, specialties, and contact info
- **Image Management**: Upload and manage vendor images

## File Structure

```
frontend/
├── app/
│   ├── campus/
│   │   └── store/
│   │       └── page.tsx          # Student-facing vendor directory
│   └── admin/
│       └── store/
│           └── page.tsx          # Admin vendor management
├── services/
│   └── storeService.ts           # API service for vendor operations
└── components/
    └── ProductCard.tsx           # Vendor card component (legacy, may need update)
```

## Data Structure

### FoodVendor Interface

```typescript
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
```

## API Endpoints

### Vendor Management

- `GET /vendors` - Get all food vendors
- `GET /vendors/:id` - Get vendor by ID
- `GET /vendors?cuisine=:cuisine` - Filter by cuisine
- `GET /vendors?priceRange=:range` - Filter by price range
- `GET /vendors/search?q=:query` - Search vendors
- `POST /vendors` - Add new vendor (admin)
- `PUT /vendors/:id` - Update vendor (admin)
- `DELETE /vendors/:id` - Delete vendor (admin)
- `PATCH /vendors/:id/status` - Toggle vendor status

### Menu Items (Future)

- `GET /vendors/:id/menu` - Get vendor's menu items

## Sample Vendors

The system includes sample data for various campus food vendors:

1. **Spice Garden** - Authentic North Indian cuisine
2. **Pizza Corner** - Wood-fired pizzas and Italian food
3. **Healthy Bites** - Nutritious and health-conscious meals
4. **Wok & Roll** - Authentic Chinese cuisine
5. **Burger Junction** - Juicy burgers and fast food
6. **Coffee House** - Premium coffee and pastries
7. **Sweet Treats** - Artisanal desserts and pastries
8. **Global Kitchen** - Multi-cuisine restaurant

## Cuisine Types

- Indian
- Chinese
- Italian
- Continental
- Fast Food
- Beverages
- Desserts
- Multi-cuisine

## Price Ranges

- **Budget**: Affordable options for students
- **Moderate**: Mid-range pricing
- **Premium**: High-end dining options

## Usage

### For Students

1. Navigate to `/campus/store`
2. Browse available vendors
3. Use search and filters to find specific vendors
4. Click "Order Now" to proceed to vendor's menu (future feature)
5. View vendor details, operating hours, and contact information

### For Admins

1. Navigate to `/admin/store`
2. Add new vendors using the "Add New Vendor" button
3. Edit existing vendors by clicking the "Edit" button
4. Delete vendors using the "Delete" button
5. Toggle vendor open/closed status

## Future Enhancements

- **Menu Integration**: Connect vendors to their actual menu items
- **Ordering System**: Allow students to place orders directly through the platform
- **Reviews & Ratings**: Student feedback system for vendors
- **Real-time Updates**: Live status updates and wait times
- **Payment Integration**: In-app payment processing
- **Delivery Tracking**: Track order status and delivery progress
- **Vendor Analytics**: Sales reports and performance metrics for vendors
- **Mobile App**: Native mobile application for better user experience

## Technical Notes

- Built with Next.js 14 and TypeScript
- Uses shadcn/ui components for consistent design
- Implements responsive design for mobile and desktop
- Includes loading states and error handling
- Uses React hooks for state management
- Integrates with backend API through axios

## Setup

1. Ensure all dependencies are installed:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Access the store pages:
   - Student view: `http://localhost:3000/campus/store`
   - Admin view: `http://localhost:3000/admin/store`

## Contributing

When adding new features or modifying existing ones:

1. Update the TypeScript interfaces if needed
2. Add corresponding API endpoints
3. Update the service functions
4. Test both student and admin views
5. Update this documentation
