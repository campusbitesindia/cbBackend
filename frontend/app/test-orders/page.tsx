'use client';

import { useState } from 'react';
import { Order } from '@/types';

// Sample API response data
const sampleApiResponse = {
  success: true,
  message: 'All Orders Fetched SuccessFully',
  data: [
    {
      _id: '6880ff0f6d8e0b52fd289ecf',
      OrderNumber: 'ORD-2551507B148E',
      student: {
        _id: '68762d217dcf0e396ba9561f',
        name: 'Ashwin',
      },
      canteen: {
        _id: '6879b625128117ac2e529b2e',
        name: "Anjali Sharma's Canteen",
      },
      items: [
        {
          item: '687e5f5a19b1966fa3b715e3',
          quantity: 2,
          nameAtPurchase: 'noodle',
          priceAtPurchase: 100,
          _id: '6880ff0f6d8e0b52fd289ed0',
        },
      ],
      total: 100,
      status: 'payment_pending',
      isDeleted: false,
      pickupTime: '2025-07-23T15:26:06.589Z',
      groupOrderId: '6880fee06d8e0b52fd289d56',
      createdAt: '2025-07-23T15:26:07.422Z',
      updatedAt: '2025-07-23T15:26:07.726Z',
      __v: 0,
    },
  ],
};

// Function to map API response to expected Order structure
const mapApiResponseToOrder = (apiOrder: any): Order => {
  return {
    _id: apiOrder._id,
    student: apiOrder.student?.name || 'Unknown Student',
    canteen: {
      _id: apiOrder.canteen?._id || '',
      name: apiOrder.canteen?.name || 'Unknown Canteen',
    },
    items: apiOrder.items.map((item: any) => ({
      _id: item._id,
      item: {
        _id: item.item || '',
        name: item.nameAtPurchase || 'Unknown Item',
        price: item.priceAtPurchase || 0,
        image: undefined, // API doesn't provide image in this response
      },
      quantity: item.quantity || 0,
    })),
    total: apiOrder.total || 0,
    status: apiOrder.status,
    payment: {
      method: 'cod', // Default to COD since API doesn't specify
      status: apiOrder.status === 'payment_pending' ? 'pending' : 'completed',
    },
    createdAt: apiOrder.createdAt,
    updatedAt: apiOrder.updatedAt,
  };
};

export default function TestOrdersPage() {
  const [mappedOrder, setMappedOrder] = useState<Order | null>(null);

  const handleTestMapping = () => {
    const order = mapApiResponseToOrder(sampleApiResponse.data[0]);
    setMappedOrder(order);
  };

  return (
    <div className='container mx-auto p-8'>
      <h1 className='text-3xl font-bold mb-6'>Order Data Mapping Test</h1>

      <button
        onClick={handleTestMapping}
        className='bg-blue-500 text-white px-4 py-2 rounded mb-6'>
        Test Mapping
      </button>

      {mappedOrder && (
        <div className='bg-gray-100 p-6 rounded-lg'>
          <h2 className='text-xl font-semibold mb-4'>Mapped Order Data:</h2>
          <pre className='bg-white p-4 rounded overflow-auto'>
            {JSON.stringify(mappedOrder, null, 2)}
          </pre>
        </div>
      )}

      <div className='mt-8'>
        <h2 className='text-xl font-semibold mb-4'>Original API Response:</h2>
        <pre className='bg-gray-100 p-4 rounded overflow-auto'>
          {JSON.stringify(sampleApiResponse, null, 2)}
        </pre>
      </div>
    </div>
  );
}
