'use client';

import { useState, useEffect, useRef } from 'react';
import { RouteProtection } from '@/components/RouteProtection';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Camera,
  Save,
  X,
  Shield,
  Bell,
  CreditCard,
  Settings,
  ArrowLeft,
  Check,
  AlertCircle,
  Upload,
  Building,
  GraduationCap,
  Users,
  Store,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/lib/constants';
import axios from '@/lib/axios';
import { DatePicker } from '@/components/ui/date-picker';

interface Campus {
  _id: string;
  name: string;
  code: string;
  city: string;
}

interface Canteen {
  _id: string;
  name: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'canteen' | 'campus';
  campus?: Campus;
  canteenId?: Canteen;
  profileImage?: string;
  phone?: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
  googleId?: string;
  isDeleted: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  // Security information
  securityScore?: number;
  devices?: Array<{
    deviceId: string;
    deviceName: string;
    lastUsed: string;
    isTrusted: boolean;
  }>;
  securityEvents?: Array<{
    type: string;
    description: string;
    timestamp: string;
    severity: string;
  }>;
}

interface JWTUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  exp?: number;
  iat?: number;
}

const getRoleInfo = (role: string) => {
  switch (role) {
    case 'student':
      return {
        icon: <GraduationCap className='w-5 h-5' />,
        label: 'Student',
        color: 'bg-blue-500',
        description: 'Campus Student Account',
      };
    case 'canteen':
      return {
        icon: <Store className='w-5 h-5' />,
        label: 'Canteen Partner',
        color: 'bg-green-500',
        description: 'Food Service Provider',
      };
    case 'campus':
      return {
        icon: <Users className='w-5 h-5' />,
        label: 'Campus Admin',
        color: 'bg-purple-500',
        description: 'Campus Administration',
      };
    default:
      return {
        icon: <User className='w-5 h-5' />,
        label: 'User',
        color: 'bg-gray-500',
        description: 'System User',
      };
  }
};

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect campus partners to their dashboard profile tab
  // Allow all authenticated users to access the profile page
  // Campus partners and students can both edit their profiles here
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [jwtUserData, setJwtUserData] = useState<JWTUserData | null>(null);
  const [securityData, setSecurityData] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    bio: '',
    address: '',
    dateOfBirth: '',
  });
  const [profileImage, setProfileImage] = useState('/placeholder-user.jpg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract JWT data when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      setJwtUserData({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        exp: user.exp,
        iat: user.iat,
      });
    }
  }, [isAuthenticated, user]);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_ENDPOINTS.USER_PROFILE);

      if (response.data.success && response.data.user) {
        const user = response.data.user;
        setUserData(user);
        setProfileData({
          name: user.name || '',
          phone: user.phone || '',
          bio: user.bio || '',
          address: user.address || '',
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        });
        setProfileImage(user.profileImage || '/placeholder-user.jpg');

        // Set security data if available
        if (
          user.securityScore !== undefined ||
          user.devices ||
          user.securityEvents
        ) {
          setSecurityData({
            score: user.securityScore || 0,
            devices: user.devices || [],
            events: user.securityEvents || [],
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load profile data. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile data
  const handleSave = async () => {
    try {
      setIsUpdating(true);
      const response = await axios.put(API_ENDPOINTS.USER_PROFILE, profileData);

      if (response.data.success) {
        setUserData(response.data.user);
        setIsEditing(false);
        toast({
          title: 'Success! 🎉',
          description: 'Your profile has been updated successfully.',
        });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description:
          error.response?.data?.message ||
          'Failed to update profile. Please try again.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please select a valid image file (JPG, PNG, GIF, etc.)',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Please select an image smaller than 5MB.',
      });
      return;
    }

    try {
      setIsUploadingImage(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await axios.post(
        API_ENDPOINTS.USER_PROFILE_IMAGE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.data.success) {
        setProfileImage(response.data.imageUrl);
        setUserData(response.data.user);
        toast({
          title: 'Image Updated! 📸',
          description: 'Your profile image has been updated successfully.',
        });
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Failed to upload image. Please try again.';

      if (error.code === 'ECONNABORTED') {
        errorMessage =
          'Upload timed out. Please check your connection and try again.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large. Please select a smaller image.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: errorMessage,
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith('image/'));

    if (imageFile) {
      handleImageUpload(imageFile);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please drop a valid image file.',
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center'>
        <Card className='w-full max-w-md mx-4 shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl'>
          <CardContent className='pt-12 pb-8 px-8 text-center'>
            <div className='w-20 h-20 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
              <User className='w-10 h-10 text-white' />
            </div>
            <CardTitle className='text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200'>
              Please Sign In
            </CardTitle>
            <CardDescription className='text-slate-600 dark:text-slate-400 mb-8 text-lg'>
              You need to be logged in to view your profile.
            </CardDescription>
            <Button
              asChild
              className='w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg'>
              <Link href='/login'>Sign In to Continue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className='text-center'>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className='w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4'
          />
          <p className='text-slate-700 dark:text-slate-300 text-xl font-medium'>
            Loading your profile...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center'>
        <Card className='w-full max-w-md mx-4 shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl'>
          <CardContent className='pt-12 pb-8 px-8 text-center'>
            <AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
            <CardTitle className='text-xl font-bold mb-4 text-slate-800 dark:text-slate-200'>
              Profile Not Found
            </CardTitle>
            <CardDescription className='text-slate-600 dark:text-slate-400 mb-6'>
              Unable to load your profile data.
            </CardDescription>
            <Button
              onClick={fetchUserProfile}
              className='bg-red-500 hover:bg-red-600'>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleInfo = getRoleInfo(userData.role);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'>
      {/* Background Elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className='absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-r from-red-500/5 via-rose-500/5 to-pink-500/5 rounded-full blur-3xl'
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className='absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-full blur-3xl'
        />
      </div>

      {/* Header */}
      <div className='bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            {/* Top row: Back button (full width on mobile) */}
            <div className='flex items-center justify-between w-full sm:w-auto'>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  variant='ghost'
                  className='text-slate-900 dark:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-xl px-2 py-1 text-sm sm:text-base'>
                  <Link href='/menu'>
                    <ArrowLeft className='w-5 h-5 mr-1' />
                    <span className='hidden xs:inline'>Back to Menu</span>
                  </Link>
                </Button>
              </motion.div>
              {/* Edit button on mobile, only show here on mobile */}
              <div className='sm:hidden'>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={isUpdating}
                    size='icon'
                    className={`ml-2 rounded-full p-2 ${
                      isEditing
                        ? 'bg-slate-500 hover:bg-slate-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}>
                    {isEditing ? (
                      <X className='w-4 h-4' />
                    ) : (
                      <Edit3 className='w-4 h-4' />
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
            {/* Title and description */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full'>
              <div className='flex items-center gap-2'>
                <h1 className='text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100'>
                  My Profile
                </h1>
                {/* Edit button on desktop */}
                <div className='hidden sm:block'>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      disabled={isUpdating}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                        isEditing
                          ? 'bg-slate-500 hover:bg-slate-600 text-white'
                          : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                      }`}>
                      {isEditing ? (
                        <>
                          <X className='w-4 h-4 mr-2' />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit3 className='w-4 h-4 mr-2' />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
              <p className='text-slate-600 dark:text-slate-400 mt-1 sm:mt-0'>
                Manage your account information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-6 py-8 relative z-10'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Profile Card */}
          <div className='lg:col-span-1'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}>
              <Card className='bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-2xl'>
                <CardContent className='pt-8 pb-6 text-center'>
                  {/* Profile Image */}
                  <div className='relative w-32 h-32 mx-auto mb-6'>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className='relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 flex items-center justify-center cursor-pointer group border-2 border-dashed border-transparent hover:border-red-300 dark:hover:border-red-500 transition-all duration-300'
                      onClick={() => fileInputRef.current?.click()}>
                      {profileImage &&
                      profileImage !== '/placeholder-user.jpg' ? (
                        <Image
                          src={profileImage}
                          alt='Profile'
                          width={128}
                          height={128}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='flex flex-col items-center justify-center text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'>
                          <User className='w-12 h-12 mb-2' />
                          <span className='text-xs text-center'>
                            Click or drag
                            <br />
                            to upload
                          </span>
                        </div>
                      )}

                      {/* Upload Overlay */}
                      {isUploadingImage && (
                        <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-full'>
                          <Loader2 className='w-8 h-8 text-white animate-spin' />
                        </div>
                      )}
                    </motion.div>

                    {/* Camera Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      disabled={isUploadingImage}
                      className='absolute bottom-2 right-2 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors disabled:opacity-50 border-2 border-white dark:border-slate-800'>
                      {isUploadingImage ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <Camera className='w-4 h-4' />
                      )}
                    </motion.button>

                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleFileInputChange}
                      className='hidden'
                    />
                  </div>

                  {/* User Info */}
                  <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2'>
                    {userData.name}
                  </h2>
                  <p className='text-slate-600 dark:text-slate-400 mb-4'>
                    {userData.email}
                  </p>

                  {/* Role Badge */}
                  <div className='flex justify-center mb-4'>
                    <Badge
                      className={`${roleInfo.color} text-white px-4 py-2 text-sm font-medium flex items-center gap-2`}>
                      {roleInfo.icon}
                      {roleInfo.label}
                    </Badge>
                  </div>

                  {/* Account Status */}
                  <div className='space-y-2'>
                    {userData.googleId && (
                      <Badge
                        variant='outline'
                        className='bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'>
                        <svg className='w-4 h-4 mr-2' viewBox='0 0 24 24'>
                          <path
                            fill='currentColor'
                            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                          />
                          <path
                            fill='currentColor'
                            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                          />
                          <path
                            fill='currentColor'
                            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                          />
                          <path
                            fill='currentColor'
                            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                          />
                        </svg>
                        Google Account
                      </Badge>
                    )}
                  </div>

                  {/* Campus/Canteen Info */}
                  {userData.campus && (
                    <div className='mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl'>
                      <div className='flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-2'>
                        <Building className='w-4 h-4' />
                        <span className='font-medium'>Campus</span>
                      </div>
                      <p className='text-slate-900 dark:text-slate-100 font-semibold'>
                        {userData.campus.name}
                      </p>
                      <p className='text-sm text-slate-600 dark:text-slate-400'>
                        {userData.campus.code} • {userData.campus.city}
                      </p>
                    </div>
                  )}

                  {userData.canteenId && (
                    <div className='mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl'>
                      <div className='flex items-center gap-2 text-green-700 dark:text-green-300 mb-2'>
                        <Store className='w-4 h-4' />
                        <span className='font-medium'>Canteen</span>
                      </div>
                      <p className='text-green-900 dark:text-green-100 font-semibold'>
                        {userData.canteenId.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Profile Details */}
          <div className='lg:col-span-2'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}>
              <Card className='bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-2xl'>
                <CardHeader>
                  <CardTitle className='text-2xl text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                    <Settings className='w-6 h-6' />
                    Profile Information
                  </CardTitle>
                  <CardDescription className='text-slate-600 dark:text-slate-400'>
                    {isEditing
                      ? 'Update your personal information'
                      : 'Your personal details and preferences'}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Name */}
                  <div className='space-y-2'>
                    <Label
                      htmlFor='name'
                      className='text-slate-700 dark:text-slate-300 font-medium'>
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id='name'
                        value={profileData.name}
                        onChange={(e) =>
                          handleInputChange('name', e.target.value)
                        }
                        className='bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                        placeholder='Enter your full name'
                      />
                    ) : (
                      <div className='flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg'>
                        <User className='w-5 h-5 text-slate-500 dark:text-slate-400' />
                        <span className='text-slate-900 dark:text-slate-100'>
                          {userData.name || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div className='space-y-2'>
                    <Label className='text-slate-700 dark:text-slate-300 font-medium'>
                      Email Address
                    </Label>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        <Mail className='w-5 h-5 text-slate-500 dark:text-slate-400' />
                        <span className='text-slate-900 dark:text-slate-100 break-all text-sm sm:text-base'>
                          {userData.email}
                        </span>
                      </div>
                      <Badge
                        variant='outline'
                        className='mt-1 sm:mt-0 sm:ml-auto text-xs px-2 py-0.5'>
                        Read-only
                      </Badge>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className='space-y-2'>
                    <Label
                      htmlFor='phone'
                      className='text-slate-700 dark:text-slate-300 font-medium'>
                      Phone Number
                    </Label>
                    {isEditing ? (
                      <Input
                        id='phone'
                        value={profileData.phone}
                        onChange={(e) =>
                          handleInputChange('phone', e.target.value)
                        }
                        className='bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                        placeholder='Enter your phone number'
                        type='tel'
                      />
                    ) : (
                      <div className='flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg'>
                        <Phone className='w-5 h-5 text-slate-500 dark:text-slate-400' />
                        <span className='text-slate-900 dark:text-slate-100'>
                          {userData.phone || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div className='space-y-2'>
                    <Label
                      htmlFor='bio'
                      className='text-slate-700 dark:text-slate-300 font-medium'>
                      Bio
                    </Label>
                    {isEditing ? (
                      <Textarea
                        id='bio'
                        value={profileData.bio}
                        onChange={(e) =>
                          handleInputChange('bio', e.target.value)
                        }
                        className='bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 min-h-[100px]'
                        placeholder='Tell us about yourself...'
                        rows={4}
                      />
                    ) : (
                      <div className='p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg'>
                        <p className='text-slate-900 dark:text-slate-100'>
                          {userData.bio || 'No bio provided'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className='space-y-2'>
                    <Label
                      htmlFor='address'
                      className='text-slate-700 dark:text-slate-300 font-medium'>
                      Address
                    </Label>
                    {isEditing ? (
                      <Textarea
                        id='address'
                        value={profileData.address}
                        onChange={(e) =>
                          handleInputChange('address', e.target.value)
                        }
                        className='bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                        placeholder='Enter your address'
                        rows={3}
                      />
                    ) : (
                      <div className='flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg'>
                        <MapPin className='w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5' />
                        <span className='text-slate-900 dark:text-slate-100'>
                          {userData.address || 'No address provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className='space-y-2'>
                    <Label
                      htmlFor='dateOfBirth'
                      className='text-slate-700 dark:text-slate-300 font-medium'>
                      Date of Birth
                    </Label>
                    {isEditing ? (
                      <DatePicker
                        date={
                          profileData.dateOfBirth
                            ? new Date(profileData.dateOfBirth + 'T00:00:00')
                            : undefined
                        }
                        onDateChange={(date) => {
                          if (date) {
                            // Format date properly to avoid timezone issues
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(
                              2,
                              '0'
                            );
                            const day = String(date.getDate()).padStart(2, '0');
                            handleInputChange(
                              'dateOfBirth',
                              `${year}-${month}-${day}`
                            );
                          } else {
                            handleInputChange('dateOfBirth', '');
                          }
                        }}
                        placeholder='Select your date of birth'
                        className='w-full'
                      />
                    ) : (
                      <div className='flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg'>
                        <Calendar className='w-5 h-5 text-slate-500 dark:text-slate-400' />
                        <span className='text-slate-900 dark:text-slate-100'>
                          {userData.dateOfBirth
                            ? new Date(userData.dateOfBirth).toLocaleDateString(
                                'en-US',
                                {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                }
                              )
                            : 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='flex gap-4 pt-4'>
                      <Button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className='bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-8 py-3 rounded-xl font-semibold'>
                        {isUpdating ? (
                          <>
                            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className='w-4 h-4 mr-2' />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setProfileData({
                            name: userData.name || '',
                            phone: userData.phone || '',
                            bio: userData.bio || '',
                            address: userData.address || '',
                            dateOfBirth: userData.dateOfBirth
                              ? new Date(userData.dateOfBirth)
                                  .toISOString()
                                  .split('T')[0]
                              : '',
                          });
                        }}
                        variant='outline'
                        disabled={isUpdating}
                        className='px-6 py-3 rounded-xl font-semibold'>
                        <X className='w-4 h-4 mr-2' />
                        Cancel
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* JWT & Security Information */}
            {(jwtUserData || securityData) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className='mt-8'>
                <Card className='bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-2xl'>
                  <CardHeader>
                    <CardTitle className='text-2xl text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                      <Shield className='w-6 h-6' />
                      Authentication & Security
                    </CardTitle>
                    <CardDescription className='text-slate-600 dark:text-slate-400'>
                      Login session information and account security details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    {/* JWT Session Information */}
                    {jwtUserData && (
                      <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800'>
                        <div className='flex items-center gap-2 mb-3'>
                          <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
                          <h4 className='font-semibold text-blue-900 dark:text-blue-100'>
                            Current Login Session
                          </h4>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                          <div>
                            <span className='text-blue-700 dark:text-blue-300 font-medium'>
                              Logged in as:
                            </span>
                            <p className='text-blue-900 dark:text-blue-100 mt-1'>
                              {jwtUserData.email}
                            </p>
                          </div>
                          <div>
                            <span className='text-blue-700 dark:text-blue-300 font-medium'>
                              Session Role:
                            </span>
                            <p className='text-blue-900 dark:text-blue-100 mt-1 capitalize'>
                              {jwtUserData.role}
                            </p>
                          </div>
                          <div>
                            <span className='text-blue-700 dark:text-blue-300 font-medium'>
                              User ID:
                            </span>
                            <p className='text-blue-900 dark:text-blue-100 mt-1 font-mono text-xs'>
                              {jwtUserData.id}
                            </p>
                          </div>
                          <div>
                            <span className='text-blue-700 dark:text-blue-300 font-medium'>
                              Session Expires:
                            </span>
                            <p className='text-blue-900 dark:text-blue-100 mt-1'>
                              {jwtUserData.exp
                                ? new Date(
                                    jwtUserData.exp * 1000
                                  ).toLocaleString()
                                : 'Unknown'}
                            </p>
                          </div>
                        </div>

                        {/* Email Discrepancy Alert */}
                        {jwtUserData.email !== userData?.email && (
                          <Alert className='mt-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'>
                            <AlertCircle className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                            <AlertDescription className='text-amber-800 dark:text-amber-200'>
                              <strong>Data Discrepancy Detected:</strong>
                              <br />
                              Your login session email ({jwtUserData.email})
                              differs from your profile email ({userData?.email}
                              ). This could indicate you're logged in with a
                              different account or there's a data sync issue.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}

                    {/* Security Score */}
                    {securityData && (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl'>
                          <div className='flex items-center justify-between mb-3'>
                            <h4 className='font-semibold text-slate-900 dark:text-slate-100'>
                              Security Score
                            </h4>
                            <Badge
                              className={`${
                                securityData.score >= 80
                                  ? 'bg-green-500'
                                  : securityData.score >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              } text-white`}>
                              {securityData.score}/100
                            </Badge>
                          </div>
                          <div className='w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 mb-2'>
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${
                                securityData.score >= 80
                                  ? 'bg-green-500'
                                  : securityData.score >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${securityData.score}%` }}></div>
                          </div>
                          <p className='text-sm text-slate-600 dark:text-slate-400'>
                            {securityData.score >= 80
                              ? 'Excellent security'
                              : securityData.score >= 60
                              ? 'Good security'
                              : 'Needs improvement'}
                          </p>
                        </div>

                        {/* Device Information */}
                        <div className='p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl'>
                          <h4 className='font-semibold text-slate-900 dark:text-slate-100 mb-3'>
                            Trusted Devices
                          </h4>
                          {securityData.devices &&
                          securityData.devices.length > 0 ? (
                            <div className='space-y-2'>
                              {securityData.devices
                                .slice(0, 3)
                                .map((device: any, index: number) => (
                                  <div
                                    key={index}
                                    className='flex items-center justify-between text-sm'>
                                    <span className='text-slate-700 dark:text-slate-300'>
                                      {device.deviceName}
                                    </span>
                                    <Badge
                                      variant={
                                        device.isTrusted
                                          ? 'default'
                                          : 'secondary'
                                      }
                                      className='text-xs'>
                                      {device.isTrusted
                                        ? 'Trusted'
                                        : 'Unverified'}
                                    </Badge>
                                  </div>
                                ))}
                              {securityData.devices.length > 3 && (
                                <p className='text-xs text-slate-500 dark:text-slate-400'>
                                  +{securityData.devices.length - 3} more
                                  devices
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className='text-sm text-slate-600 dark:text-slate-400'>
                              No devices registered
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recent Security Events */}
                    {securityData?.events && securityData.events.length > 0 && (
                      <div className='p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl'>
                        <h4 className='font-semibold text-slate-900 dark:text-slate-100 mb-3'>
                          Recent Security Activity
                        </h4>
                        <div className='space-y-2 max-h-40 overflow-y-auto'>
                          {securityData.events
                            .slice(0, 5)
                            .map((event: any, index: number) => (
                              <div
                                key={index}
                                className='flex items-start gap-3 text-sm p-2 bg-white dark:bg-slate-800 rounded-lg'>
                                <div
                                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                    event.severity === 'high'
                                      ? 'bg-red-500'
                                      : event.severity === 'medium'
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`}></div>
                                <div className='flex-1'>
                                  <p className='text-slate-900 dark:text-slate-100'>
                                    {event.description}
                                  </p>
                                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                                    {new Date(event.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Account Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='mt-8'>
              <Card className='bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-2xl'>
                <CardHeader>
                  <CardTitle className='text-2xl text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                    <Shield className='w-6 h-6' />
                    Account Information
                  </CardTitle>
                  <CardDescription className='text-slate-600 dark:text-slate-400'>
                    Account details and security information
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <Label className='text-slate-700 dark:text-slate-300 font-medium'>
                        Account Role
                      </Label>
                      <div className='mt-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg'>
                        <div className='flex items-center gap-2'>
                          {roleInfo.icon}
                          <span className='text-slate-900 dark:text-slate-100 font-medium'>
                            {roleInfo.label}
                          </span>
                        </div>
                        <p className='text-sm text-slate-600 dark:text-slate-400 mt-1'>
                          {roleInfo.description}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className='text-slate-700 dark:text-slate-300 font-medium'>
                        Member Since
                      </Label>
                      <div className='mt-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg'>
                        <p className='text-slate-900 dark:text-slate-100'>
                          {new Date(userData.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
