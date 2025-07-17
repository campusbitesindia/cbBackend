'use client';

import React, { useState, useRef } from 'react';
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
    daysOfOperation: z
      .array(z.string())
      .min(1, 'Please select at least one day'),
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

const colleges = [
  'Anna University',
  'IIT Madras',
  'VIT University',
  'SRM University',
  'Loyola College',
  'Presidency College',
  'Madras Christian College',
  'Stella Maris College',
  'Ethiraj College',
  "Women's Christian College",
];

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

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function VendorOnboardingForm() {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Section refs for scrolling
  const basicInfoRef = useRef<HTMLDivElement>(null);
  const businessRef = useRef<HTMLDivElement>(null);
  const operationsRef = useRef<HTMLDivElement>(null);
  const docsRef = useRef<HTMLDivElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control, // <-- add this
  } = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      daysOfOperation: [],
      termsAccepted: false,
      adhaarNumber: '',
      panNumber: '',
      gstNumber: '',
      fssaiLicense: '',
    },
  });

  const handleDayToggle = (day: string) => {
    const updatedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(updatedDays);
    setValue('daysOfOperation', updatedDays);
  };

  const onSubmit = async (data: any) => {
    console.log('Form submission started...');
    console.log('Form data:', data);
    setIsSubmitting(true);

    // Process form immediately
    console.log('Form processing complete, redirecting...');
    setIsSubmitting(false);
    setSubmitSuccess(true);
    router.push('/campus/dashboard');
  };

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center py-8 px-2 md:px-8 text-gray-700'>
      {/* Success Modal */}
      <Dialog
        open={false}
        onOpenChange={(open) => {
          if (!open && submitSuccess) {
            router.push('/campus/dashboard');
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registration Complete!</DialogTitle>
            <DialogDescription>
              Your registration has been received.
              <br />
              You can now view your details in the dashboard.
              <br />
              Once approved, you’ll be able to manage your shop and receive
              orders.
              <br />
              Thank you for joining CampusBites!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder=''
                    {...register('password')}
                    className='bg-white'
                  />
                  <button
                    type='button'
                    tabIndex={-1}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? (
                      <EyeOff className='w-5 h-5' />
                    ) : (
                      <Eye className='w-5 h-5' />
                    )}
                  </button>
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder=''
                    {...register('confirmPassword')}
                    className='bg-white'
                  />
                  <button
                    type='button'
                    tabIndex={-1}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    onClick={() => setShowConfirmPassword((prev) => !prev)}>
                    {showConfirmPassword ? (
                      <EyeOff className='w-5 h-5' />
                    ) : (
                      <Eye className='w-5 h-5' />
                    )}
                  </button>
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
                  <SelectValue placeholder='Select college' />
                </SelectTrigger>
                <SelectContent className='bg-white  text-black'>
                  {colleges.map((college) => (
                    <SelectItem key={college} value={college}>
                      {college}
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
                  <SelectContent className='bg-white  text-black'>
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
              <Label className='text-base font-medium'>
                Days of Operation *
              </Label>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mt-2'>
                {daysOfWeek.map((day) => (
                  <div key={day} className='flex items-center space-x-2 '>
                    <Checkbox
                      className='bg-gray-200'
                      id={day}
                      checked={selectedDays.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label htmlFor={day} className='text-sm'>
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.daysOfOperation && (
                <p className='text-sm text-red-500 mt-1'>
                  {errors.daysOfOperation.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card className='bg-gray-50 shadow-sm border border-gray-100'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center text-black'>
              <FileText className='h-5 w-5 mr-2 ' /> Documentation Details
            </CardTitle>
            <CardDescription>Enter required document numbers</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 pt-0 text-gray-700'>
            <div>
              <Label htmlFor='adhaarNumber'>Aadhar Number *</Label>
              <Input
                id='adhaarNumber'
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
              <Label htmlFor='fssaiLicense'>
                FSSAI License Number (Optional)
              </Label>
              <Input
                id='fssaiLicense'
                placeholder='Enter 14-digit FSSAI license number'
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
                Enter your 14-digit FSSAI license number (leave blank if not
                available)
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
            <div className='flex items-start space-x-3'>
              <Controller
                name='termsAccepted'
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id='termsAccepted'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={errors.termsAccepted ? 'border-red-500' : ''}
                  />
                )}
              />
              <div className='flex-1'>
                <Label htmlFor='termsAccepted' className='text-sm'>
                  I agree to the{' '}
                  <a href='#' className='text-orange-600 hover:underline'>
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
            className='w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-700'
            disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className='text-center mt-8 text-sm text-gray-500'>
          <p>
            Already have an account?{' '}
            <a href='/login' className='text-orange-600 hover:underline'>
              Sign In
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
