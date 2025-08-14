'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  Upload,
  Store,
  User,
  Clock,
  FileText,
  CheckCircle,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getAllCampuses, Campus } from '@/services/campusService';
import { useAuth } from '@/context/auth-context';
import {
  createCanteen,
  updateCanteen,
  getMyCanteen,
} from '@/services/canteenService';
import { register as registerUser } from '@/services/authService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


// Validation schema
const vendorSchema = z
  .object({
    vendorName: z
      .string()
      .min(2, 'Vendor name must be at least 2 characters')
      .regex(
        /^[A-Za-z .]+$/,
        'Vendor name must only contain letters, spaces, and dots'
      ),
    contactPerson: z
      .string()
      .min(2, 'Contact person name must be at least 2 characters')
      .regex(
        /^[A-Za-z .]+$/,
        'Contact person name must only contain letters, spaces, and dots'
      ),
    mobileNumber: z
      .string()
      .regex(
        /^[1-9][0-9]{9}$/,
        'Mobile number must be 10 digits and not start with 0'
      ),
    email: z.string().email('Invalid email address'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string(),
    collegeName: z.string().min(1, 'Please select a college'),
    openingHours: z.string().min(1, 'Please select opening hours'),
    closingHours: z.string().min(1, 'Please select closing hours'),
    operatingDays: z
      .array(z.string())
      .min(1, 'Please select at least one operating day'),
    adhaarNumber: z
      .string()
      .regex(
        /^[2-9][0-9]{11}$/,
        'Aadhar number must be 12 digits and cannot start with 0 or 1'
      ),
    panNumber: z
      .string()
      .regex(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        'PAN number must be in format: ABCDE1234F (5 letters, 4 digits, 1 letter)'
      ),
    gstNumber: z
      .string()
      .regex(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        'GST number must be 15 characters in valid GST format'
      ),
      fssaiLicense: z
      .string()
      .regex(/^[0-9]{14}$/, 'FSSAI license must be 14 digits')
      .optional()
      .or(z.literal('')),
    
    termsAccepted: z
      .boolean()
      .refine(
        (val) => val === true,
        'You must accept the terms and conditions'
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const timeSlots = [
  '06:00 AM',
  '06:30 AM',
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
  '08:30 PM',
  '09:00 PM',
  '09:30 PM',
  '10:00 PM',
];

export default function VendorOnboardingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(true);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingUserDialog, setExistingUserDialog] = useState<{
    open: boolean;
    message: string;
    suggestions: string[];
    userInfo?: {
      hasGoogleAuth: boolean;
      isVerified: boolean;
      registrationMethod: string;
    };
  }>({
    open: false,
    message: '',
    suggestions: [],
  });
  const [notApprovedDialog, setNotApprovedDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Section refs for scrolling
  const basicInfoRef = useRef<HTMLDivElement>(null);
  const businessRef = useRef<HTMLDivElement>(null);
  const operationsRef = useRef<HTMLDivElement>(null);
  const docsRef = useRef<HTMLDivElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { toast } = useToast();
  const { loginWithToken } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      termsAccepted: false,
      adhaarNumber: '',
      panNumber: '',
      gstNumber: '',
      fssaiLicense: '',
    },
  });

  // Fetch campuses on component mount
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        setIsLoadingCampuses(true);
        const response = await getAllCampuses();
        setCampuses(response.campuses);
      } catch (error) {
        console.error('Error fetching campuses:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load campuses. Please refresh the page.',
        });
      } finally {
        setIsLoadingCampuses(false);
      }
    };

    fetchCampuses();
  }, [toast]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length > 3) {
      toast({
        variant: 'destructive',
        title: 'Too many images',
        description: 'Maximum 3 images allowed.',
      });
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload only JPEG, PNG, or WebP images.',
      });
      return;
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Each image must be less than 5MB.',
      });
      return;
    }

    setSelectedImages(files);

    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(urls);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newUrls = imagePreviewUrls.filter((_, i) => i !== index);

    setSelectedImages(newImages);
    setImagePreviewUrls(newUrls);

    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index]);
  };

  const onSubmit = async (data: any) => {
    // Validate that at least one image is selected
    if (selectedImages.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Images Required',
        description: 'Please upload at least 1 image of your canteen.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Register the user (role: canteen)
      const userRegistrationPayload = {
        name: data.contactPerson, // Contact person name
        email: data.email,
        password: data.password,
        role: 'canteen' as const,
        campus: data.collegeName, // Campus ID
      };

      const userResponse = await registerUser(userRegistrationPayload);

      if (!userResponse.success || !userResponse.token) {
        throw new Error(userResponse.message || 'User registration failed');
      }

      // Store token in localStorage and context for subsequent requests
      localStorage.setItem('token', userResponse.token);
      if (userResponse.token) {
        loginWithToken(userResponse.token);
      }

      // Step 2: Create the canteen with all business details and images
      const canteenPayload = {
        name: data.vendorName,
        campus: data.collegeName,
        adhaarNumber: data.adhaarNumber,
        panNumber: data.panNumber,
        gstNumber: data.gstNumber,
        fssaiLicense: data.fssaiLicense || undefined,
        contactPersonName: data.contactPerson,
        mobile: data.mobileNumber,
        email: data.email,
        address: data.address,
        openingHours: data.openingHours,
        closingHours: data.closingHours,
        operatingDays: data.operatingDays,
        images: selectedImages,
      };

      // Map payload to backend expected fields
      const backendPayload: any = {
        name: canteenPayload.name,
        campus: canteenPayload.campus,
        adhaarNumber: canteenPayload.adhaarNumber,
        panNumber: canteenPayload.panNumber,
        gstNumber: canteenPayload.gstNumber,
        fssaiLicense: canteenPayload.fssaiLicense,
        contactPersonName: canteenPayload.contactPersonName,
        mobile: canteenPayload.mobile,
        email: canteenPayload.email,
        address: canteenPayload.address,
        openingHours: canteenPayload.openingHours,
        closingHours: canteenPayload.closingHours,
        operatingDays: canteenPayload.operatingDays,
        images: canteenPayload.images,
      };

      const canteenResponse = await createCanteen(backendPayload);

      if (!canteenResponse.success) {
        // Check for not approved error from backend - treat as success for new registrations
        if (
          canteenResponse.message &&
          canteenResponse.message.toLowerCase().includes('not approved')
        ) {
          // Show success message for new registration pending approval
          toast({
            title: 'Registration Successful! 🎉',
            description:
              'Your vendor account has been created successfully! Your canteen is now pending admin approval and will be verified within 24 hours.',
          });

          setSuccessMessage(
            'Registration successful! Your canteen is pending admin approval and will be verified within 24 hours.'
          );
          setSubmitSuccess(true);

          // Show success popup for 3 seconds, then redirect
          setTimeout(() => {
            setSubmitSuccess(false);
            router.push('/campus/dashboard');
          }, 3000);
          return;
        }
        throw new Error(canteenResponse.message || 'Canteen creation failed');
      }

      toast({
        title: 'Registration Successful! 🎉',
        description:
          'Your vendor account and canteen have been created and are pending admin approval. Business details will be verified during the approval process.',
      });

      setSuccessMessage(null); // Use default message
      setSubmitSuccess(true);

      // Show a popup for 2 seconds, then redirect
      setTimeout(() => {
        setSubmitSuccess(false);
        router.push('/campus/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);

      // Improved 409 Conflict (user exists) handling
      let isUserExists = false;
      let message = 'An account with this email or mobile already exists.';
      let suggestions: string[] = [
        'Try signing in instead.',
        'Use a different email/mobile to register.',
      ];
      let userInfo;

      // Check for 409 status in error response (axios or fetch)
      if (error?.response?.status === 409) {
        isUserExists = true;
        if (error.response.data?.message) message = error.response.data.message;
        if (error.response.data?.suggestions)
          suggestions = error.response.data.suggestions;
        if (error.response.data?.userInfo)
          userInfo = error.response.data.userInfo;
      } else if (error?.response?.status === 403) {
        // Handle forbidden as registration success but pending approval
        setSuccessMessage(
          'Registration successful! Please wait for your canteen to be approved. It will be verified within 24 hours.'
        );
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          router.push('/campus/dashboard');
        }, 2000);
        return;
      } else if (error.message) {
        // Try to parse JSON error message
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.userExists) {
            isUserExists = true;
            message = errorData.message || message;
            suggestions = errorData.suggestions || suggestions;
            userInfo = errorData.userInfo;
          }
        } catch {
          // Not a JSON error, fall through
        }
      }

      if (isUserExists) {
        setExistingUserDialog({
          open: true,
          message,
          suggestions,
          userInfo,
        });
        return;
      }

      // Regular error handling
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description:
          error.message ||
          'An error occurred during registration. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToSignIn = () => {
    setExistingUserDialog((prev) => ({ ...prev, open: false }));
    router.push('/campus/dashboard');
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center py-8 px-2 md:px-8 text-gray-700'>
      {/* Existing User Dialog */}
      <Dialog
        open={existingUserDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setExistingUserDialog((prev) => ({ ...prev, open: false }));
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Already Exists</DialogTitle>
            <DialogDescription>
              {existingUserDialog.message}
              {existingUserDialog.suggestions.length > 0 && (
                <div className='mt-4'>
                  <p className='font-medium mb-2'>Suggestions:</p>
                  <ul className='list-disc list-inside space-y-1'>
                    {existingUserDialog.suggestions.map((suggestion, index) => (
                      <li key={index} className='text-sm'>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              aria-label='Go to Dashboard'
              className='w-full bg-orange-600 hover:bg-orange-700'
              onClick={handleGoToSignIn}>
              Go to dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Not Approved Dialog */}
      <Dialog
        open={notApprovedDialog}
        onOpenChange={(open) => {
          if (!open) setNotApprovedDialog(false);
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Canteen Not Approved</DialogTitle>
            <DialogDescription>
              Your canteen is not approved yet. Please wait for admin approval.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              aria-label='Go to Dashboard'
              className='w-full bg-orange-600 hover:bg-orange-700'
              onClick={() => {
                setNotApprovedDialog(false);
                router.push('/campus/dashboard');
              }}>
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog
        open={submitSuccess}
        onOpenChange={(open) => {
          if (!open && submitSuccess) {
            router.push('/campus/dashboard');
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registration Complete!</DialogTitle>
            <DialogDescription>
              {successMessage ||
                'Registration successful! Please wait for 24 hours for admin\n              verification.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
            aria-label='Go to Dashboard'
              className='w-full bg-orange-600 hover:bg-orange-700'
              onClick={() => {
                router.push('/campus/dashboard');
              }}>
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='w-full max-w-4xl mx-auto flex flex-col gap-8'>
        {/* Greeting Header */}
        <div className='text-center mb-2'>
          <h2 className='text-3xl font-extrabold text-orange-700 mb-1'>
            Vendor Onboarding
          </h2>
          <p className='text-md text-gray-700'>
            Welcome! Please fill out the form below to join our network of
            campus food vendors.
          </p>
        </div>

        {/* Basic Information */}
        <Card className='bg-gray-50 shadow-sm border border-orange-100'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center text-black'>
              <User className='h-5 w-5 mr-2' /> Basic Information
            </CardTitle>
            <CardDescription>
              Please provide your basic contact details
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 pt-0 text-gray-700'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='vendorName'>Vendor Name / Canteen Name *</Label>
                <Input
                  id='vendorName'
                  aria-label='Write Vendor Name or Canteen name'
                  placeholder=''
                  {...register('vendorName')}
                  className='bg-white'
                />
                {errors.vendorName && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.vendorName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor='contactPerson'>Contact Person Name *</Label>
                <Input
                  id='contactPerson'
                  aria-label='Enter contact person name'
                  placeholder=''
                  {...register('contactPerson')}
                  className='bg-white'
                />
                {errors.contactPerson && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.contactPerson.message}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='mobileNumber'>Mobile Number *</Label>
                <Input
                  id='mobileNumber'
                  arial-label='enter mobile number'
                  placeholder=''
                  {...register('mobileNumber')}
                  className='bg-white'
                  maxLength={10}
                  inputMode='numeric'
                  pattern='\d*'
                  onInput={(e) => {
                    // @ts-ignore
                    e.target.value = e.target.value
                      .replace(/[^0-9]/g, '')
                      .slice(0, 10);
                  }}
                />
                {errors.mobileNumber && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.mobileNumber.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor='email'>Email Address *</Label>
                <Input
                  id='email'
                  aria-label='enter email address'
                  placeholder=''
                  {...register('email')}
                  className='bg-white'
                />
                {errors.email && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor='address'>Address (Block / Building) *</Label>
              <Textarea
                id='address'
                placeholder=''
                {...register('address')}
                className='bg-white'
              />
              {errors.address && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='password'>Password *</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    aria-label='enter password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder=''
                    {...register('password')}
                    className='bg-white'
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type='button'
                          tabIndex={-1}
                          aria-label='show password'
                          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                          onClick={() => setShowPassword((prev) => !prev)}>
                          {showPassword ? (
                            <EyeOff className='w-5 h-5' />
                          ) : (
                            <Eye className='w-5 h-5' />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Show/Hide Password
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {errors.password && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor='confirmPassword'>Confirm Password *</Label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    aria-label='enter confirm password'
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder=''
                    {...register('confirmPassword')}
                    className='bg-white'
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type='button'
                          aria-label='show confirm password'
                          tabIndex={-1}
                          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                          onClick={() => setShowConfirmPassword((prev) => !prev)}>
                          {showConfirmPassword ? (
                            <EyeOff className='w-5 h-5' />
                          ) : (
                            <Eye className='w-5 h-5' />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Show/Hide Password
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {errors.confirmPassword && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business & College Details */}
        <Card className='bg-gray-50 shadow-sm border border-gray-200'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center text-black'>
              <Store className='h-5 w-5 mr-2' /> Business & College Details
            </CardTitle>
            <CardDescription>
              Select the college where you'll be operating
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-0 text-gray-700'>
            <div>
              <Label htmlFor='collegeName'>Name of College *</Label>
              <Select onValueChange={(value) => setValue('collegeName', value)}>
                <SelectTrigger
                  className={
                    errors.collegeName
                      ? 'border-red-500 bg-white text-black'
                      : 'bg-white text-black'
                  }>
                  <SelectValue
                    placeholder={
                      isLoadingCampuses
                        ? 'Loading campuses...'
                        : 'Select college'
                    }
                  />
                </SelectTrigger>
                <SelectContent className='bg-white text-black'>
                  {campuses.map((campus) => (
                    <SelectItem key={campus._id} value={campus._id}>
                      {campus.name} - {campus.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.collegeName && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.collegeName.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Operations Detail */}
        <Card className='bg-gray-50 shadow-sm border border-gray-200'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center text-black'>
              <Clock className='h-5 w-5 mr-2' /> Operations Details
            </CardTitle>
            <CardDescription>Set your operating hours and days</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 pt-0 text-gray-700'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='openingHours'>Opening Hours *</Label>
                <Select
                  onValueChange={(value) => setValue('openingHours', value)}>
                  <SelectTrigger
                    className={
                      errors.openingHours
                        ? 'border-red-500 bg-white text-gray-700'
                        : 'bg-white text-gray-700'
                    }>
                    <SelectValue placeholder='Select opening time' />
                  </SelectTrigger>
                  <SelectContent className='bg-white text-black'>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.openingHours && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.openingHours.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor='closingHours'>Closing Hours *</Label>
                <Select
                  onValueChange={(value) => setValue('closingHours', value)}>
                  <SelectTrigger
                    className={
                      errors.closingHours
                        ? 'border-red-500 bg-white text-gray-700'
                        : 'bg-white text-gray-700'
                    }>
                    <SelectValue placeholder='Select closing time' />
                  </SelectTrigger>
                  <SelectContent className='bg-white text-black'>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.closingHours && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.closingHours.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Operating Days *</Label>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-2'>
                {[
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                  'Sunday',
                ].map((day) => (
                  <div key={day} className='flex items-center space-x-2'>
                    <Controller
                      name='operatingDays'
                      control={control}
                      defaultValue={[
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                      ]}
                      render={({ field }) => (
                        <Checkbox
                          id={day}
                          checked={field.value?.includes(day)}
                          onCheckedChange={(checked) => {
                            const currentDays = field.value || [];
                            if (checked) {
                              field.onChange([...currentDays, day]);
                            } else {
                              field.onChange(
                                currentDays.filter((d) => d !== day)
                              );
                            }
                          }}
                          className='border-black data-[state=checked]:bg-white data-[state=checked]:border-black data-[state=checked]:text-black'
                        />
                      )}
                    />
                    <Label htmlFor={day} className='text-sm font-normal'>
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.operatingDays && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.operatingDays.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Canteen Images */}
        <Card className='bg-gray-50 shadow-sm border border-gray-100'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center text-black'>
              <Upload className='h-5 w-5 mr-2' /> Canteen Images *
            </CardTitle>
            <CardDescription>
              Upload images of your canteen (required for approval)
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 pt-0 text-gray-700'>
            <div>
              <Label htmlFor='images'>Canteen Images</Label>
              <div className='mt-2'>
                <input
                  ref={fileInputRef}
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='hidden'
                />
                <Button
                  type='button'
                  variant='outline'
                  aria-label='choose image'
                  onClick={() => fileInputRef.current?.click()}
                  className='w-full border-dashed border-2 border-gray-300 hover:border-gray-400'>
                  <Upload className='h-4 w-4 mr-2 text-foreground' />
                  <div className='text-foreground'>
                    Choose Images (Max 3)
                  </div>
                </Button>
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                Upload 1-3 images of your canteen (optional). Supported formats:
                JPEG, PNG, WebP. Max size: 5MB each.
              </p>
            </div>

            {/* Image Previews */}
            {imagePreviewUrls.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className='relative group'>
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className='w-full h-32 object-cover rounded-lg border'
                    />
                    <button
                      type='button'
                      aria-label='remove image'
                      onClick={() => removeImage(index)}
                      className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card className='bg-gray-50 shadow-sm border border-gray-100'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center text-black'>
              <FileText className='h-5 w-5 mr-2 ' /> Documentation Details
            </CardTitle>
            <CardDescription>
              Enter required document numbers (will be verified during approval)
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 pt-0 text-gray-700'>
            <div>
              <Label htmlFor='adhaarNumber'>Aadhar Number *</Label>
              <Input
                id='adhaarNumber'
                aria-label='enter your adhaar number'
                placeholder='Enter 12-digit Aadhar number'
                {...register('adhaarNumber')}
                className='bg-white'
                maxLength={12}
                inputMode='numeric'
                pattern='\d*'
                onInput={(e) => {
                  // @ts-ignore
                  e.target.value = e.target.value
                    .replace(/[^0-9]/g, '')
                    .slice(0, 12);
                }}
              />
              <p className='text-xs text-gray-500 mt-1'>
                Enter your 12-digit Aadhar number (without spaces or dashes)
              </p>
              {errors.adhaarNumber && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.adhaarNumber.message}
                </p>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='panNumber'>PAN Number *</Label>
                <Input
                  id='panNumber'
                  aria-label='enter your PAN number'
                  placeholder='ABCDE1234F'
                  {...register('panNumber')}
                  className='bg-white'
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
                  onInput={(e) => {
                    // @ts-ignore
                    e.target.value = e.target.value
                      .replace(/[^A-Za-z0-9]/g, '')
                      .toUpperCase()
                      .slice(0, 10);
                  }}
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
                </p>
                {errors.panNumber && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.panNumber.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor='gstNumber'>GST Number *</Label>
                <Input
                  id='gstNumber'
                  aria-label='enter GST number'
                  placeholder='22ABCDE1234F1Z5'
                  {...register('gstNumber')}
                  className='bg-white'
                  maxLength={15}
                  style={{ textTransform: 'uppercase' }}
                  onInput={(e) => {
                    // @ts-ignore
                    e.target.value = e.target.value
                      .replace(/[^A-Za-z0-9]/g, '')
                      .toUpperCase()
                      .slice(0, 15);
                  }}
                />
                <p className='text-xs text-gray-500 mt-1'>
                  15-character GST number (e.g., 22ABCDE1234F1Z5)
                </p>
                {errors.gstNumber && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.gstNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor='fssaiLicense'>FSSAI License (Optional)</Label>
              <Input
                id='fssaiLicense'
                placeholder='12345678901234'
                {...register('fssaiLicense')}
                className='bg-white'
                maxLength={14}
                inputMode='numeric'
                pattern='\d*'
                onInput={(e) => {
                  // @ts-ignore
                  e.target.value = e.target.value
                    .replace(/[^0-9]/g, '')
                    .slice(0, 14);
                }}
              />
              <p className='text-xs text-gray-500 mt-1'>
                Enter your 14-digit FSSAI license number (optional for small
                food businesses)
              </p>
              {errors.fssaiLicense && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.fssaiLicense.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card className='bg-gray-50 shadow-sm border border-gray-100'>
          <CardContent className='pt-6 text-gray-700'>
            <div className='flex items-center space-x-3'>
              <Controller
                name='termsAccepted'
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id='termsAccepted'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={`mt-0.5 bg-white ${
                      errors.termsAccepted ? 'border-red-500' : 'border-black'
                    } data-[state=checked]:bg-white data-[state=checked]:border-black data-[state=checked]:text-black`}
                  />
                )}
              />
              <div className='flex-1'>
                <Label
                  htmlFor='termsAccepted'
                  className='text-sm leading-relaxed'>
                  I agree to the{' '}
                  <a href='/termsconditions' className='text-orange-600 hover:underline'>
                    Terms and Conditions
                  </a>{' '}
                  of CampusBites *
                </Label>
                {errors.termsAccepted && (
                  <p className='text-sm text-red-500 mt-1'>
                    {errors.termsAccepted.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className='flex justify-center'>
          <Button
            type='submit'
            size='lg'
            aria-label='Register'
            className='w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-700'
            disabled={
              isSubmitting || isLoadingCampuses || selectedImages.length === 0
            }>
            {isSubmitting ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                Submitting...
              </>
            ) : selectedImages.length === 0 ? (
              'Upload Images to Continue'
            ) : (
              'Submit Application'
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className='text-center mt-8 text-sm text-gray-500'>
          <p>
            Already have an account?{' '}
            <a href='/login' aria-label='sigin here' className='text-orange-600 hover:underline'>
              Sign In
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
