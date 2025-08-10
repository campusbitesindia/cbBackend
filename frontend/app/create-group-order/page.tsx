'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image'; // For displaying the QR code

interface Canteen {
  _id: string;
  name: string;
  // Add other canteen properties if needed
}

export default function CreateGroupOrderPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [selectedCanteen, setSelectedCanteen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newGroupOrderDetails, setNewGroupOrderDetails] = useState<{
    groupLink: string;
    qrCodeUrl: string;
    groupOrderId: string;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    fetchCanteens();
  }, [isAuthenticated, router]);

  const fetchCanteens = async () => {
    try {
      const res = await fetch("https://campusbites-mxpe.onrender.com/api/v1/canteens", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch canteens');
      }
      const data = await res.json();
      setCanteens(data.canteens || []);
      if (data.canteens.length > 0 && !selectedCanteen) {
        setSelectedCanteen(data.canteens[0]._id); // Select first canteen by default
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as Error).message,
      });
    }
  };

  const handleCreateGroupOrder = async () => {
    if (!selectedCanteen) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a canteen to create a group order.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("https://campusbites-mxpe.onrender.com/api/v1/groupOrder/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ canteen: selectedCanteen }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create group order');
      }

      const data = await res.json();
      setNewGroupOrderDetails(data.data);
      toast({
        title: 'Group Order Created!',
        description: 'Share the link or QR code with your friends.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating group order',
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center py-12 px-4'>
      <Card className='w-full max-w-md border border-gray-700 bg-gray-800 shadow-xl'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-2xl font-bold text-center bg-gradient-to-r from-red-500 to-red-500 bg-clip-text text-transparent'>
            Start a New Group Order
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {!newGroupOrderDetails ? (
            <div className='space-y-6'>
              <div>
                <Label
                  htmlFor='canteen-select'
                  className='mb-2 block text-gray-300'>
                  Select Canteen
                </Label>
                <Select
                  value={selectedCanteen || ''}
                  onValueChange={setSelectedCanteen}>
                  <SelectTrigger
                    id='canteen-select'
                    className='w-full bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent'>
                    <SelectValue
                      placeholder='Choose a Canteen'
                      className='text-gray-200'
                    />
                  </SelectTrigger>
                  <SelectContent className='bg-gray-800 border-gray-700 text-gray-200'>
                    {canteens.map((canteen) => (
                      <SelectItem
                        key={canteen._id}
                        value={canteen._id}
                        className='hover:bg-gray-700 focus:bg-gray-700'>
                        {canteen.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreateGroupOrder}
                disabled={isLoading || !selectedCanteen}
                className='w-full bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-semibold py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5'>
                {isLoading ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Group Order'
                )}
              </Button>
            </div>
          ) : (
            <div className='space-y-6 text-center'>
              <h2 className='text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent'>
                Group Order Created! 🎉
              </h2>
              <p className='text-gray-300'>
                Share this with your friends to join:
              </p>

              {newGroupOrderDetails.qrCodeUrl && (
                <div className='mt-4 flex flex-col items-center'>
                  <div className='p-4 bg-white rounded-lg shadow-lg'>
                    <Image
                      src={newGroupOrderDetails.qrCodeUrl}
                      alt='Group Order QR Code'
                      width={200}
                      height={200}
                      className='rounded'
                    />
                  </div>
                  <p className='text-sm text-gray-400 mt-3'>
                    Scan QR code to join
                  </p>
                </div>
              )}

              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 break-words">
                <Label className="block text-gray-300 text-sm font-medium mb-2">Group Link:</Label>
                <div className="bg-gray-800 p-3 rounded border border-gray-600 mb-3">
                  <p className="text-red-400 font-mono text-sm break-all">
                    {`https://campusbites-mxpe.onrender.com/group-order?link=${newGroupOrderDetails.groupLink}`}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://campusbites-mxpe.onrender.com/group-order?link=${newGroupOrderDetails.groupLink}`);
                    toast({ 
                      description: "Link copied to clipboard!",
                      className: "bg-green-600 text-white border-0"
                    });
                  }}
                  variant='outline'
                  size='sm'
                  className='w-full border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white transition-colors'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-2'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3'
                    />
                  </svg>
                  Copy Link
                </Button>
              </div>

              <Button
                onClick={() =>
                  router.push(
                    `/group-order?link=${newGroupOrderDetails.groupLink}`
                  )
                }
                className='w-full bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-semibold py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5'>
                Go to Group Order Page
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 ml-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 8l4 4m0 0l-4 4m4-4H3'
                  />
                </svg>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
