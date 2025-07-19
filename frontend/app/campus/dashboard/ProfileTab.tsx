import React, { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { updateProfile, uploadProfileImage } from '@/services/userService';
import {
  getBankDetails,
  updateBankDetails,
  BankDetailsPayload,
  BankDetailsResponse,
} from '@/services/bankDetailsService';

interface PersonalData {
  vendorName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  address: string;
  profilePic: string;
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  upiId: string;
}

interface ProfileTabProps {
  personalData: PersonalData;
  setPersonalData: (data: PersonalData) => void;
  bankDetails: BankDetails;
  setBankDetails: (data: BankDetails) => void;
  personalSubmitting: boolean;
  setPersonalSubmitting: (submitting: boolean) => void;
  personalSuccess: boolean;
  setPersonalSuccess: (success: boolean) => void;
  bankSubmitting: boolean;
  setBankSubmitting: (submitting: boolean) => void;
  bankSuccess: boolean;
  setBankSuccess: (success: boolean) => void;
  profilePicPreview: string;
  handleProfilePicUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  personalData,
  setPersonalData,
  bankDetails,
  setBankDetails,
  personalSubmitting,
  setPersonalSubmitting,
  personalSuccess,
  setPersonalSuccess,
  bankSubmitting,
  setBankSubmitting,
  bankSuccess,
  setBankSuccess,
  profilePicPreview,
  handleProfilePicUpload,
}) => {
  const { toast } = useToast();
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
  const [existingBankDetails, setExistingBankDetails] =
    useState<BankDetailsResponse | null>(null);

  // Load existing bank details on component mount
  useEffect(() => {
    const loadBankDetails = async () => {
      setBankDetailsLoading(true);
      try {
        const response = await getBankDetails();
        if (response.success && response.data) {
          setExistingBankDetails(response.data);
          // Pre-fill the form with existing data
          // Note: Account number is masked in response, so we can't pre-fill it
          setBankDetails({
            accountHolderName: response.data.accountHolderName,
            accountNumber: '', // Can't pre-fill masked account number
            confirmAccountNumber: '', // Can't pre-fill masked account number
            ifscCode: response.data.ifscCode,
            bankName: response.data.bankName,
            branchName: response.data.branchName,
            upiId: response.data.upiId || '',
          });
        }
      } catch (error: any) {
        // If 404, it means no bank details exist yet - this is fine
        if (error.response?.status !== 404) {
          console.error('Error loading bank details:', error);
          toast({
            title: 'Error',
            description:
              error.response?.data?.message || 'Failed to load bank details',
            variant: 'destructive',
          });
        }
      } finally {
        setBankDetailsLoading(false);
      }
    };

    loadBankDetails();
  }, [toast]);

  const handleBankDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
      toast({
        title: 'Validation Error',
        description: 'Account numbers do not match',
        variant: 'destructive',
      });
      return;
    }

    setBankSubmitting(true);
    setBankSuccess(false);

    try {
      const bankData: BankDetailsPayload = {
        accountHolderName: bankDetails.accountHolderName,
        accountNumber: bankDetails.accountNumber,
        confirmAccountNumber: bankDetails.confirmAccountNumber,
        ifscCode: bankDetails.ifscCode,
        bankName: bankDetails.bankName,
        branchName: bankDetails.branchName,
        upiId: bankDetails.upiId || undefined,
      };

      const response = await updateBankDetails(bankData);

      if (response.success) {
        setBankSuccess(true);
        setExistingBankDetails(response.data);
        toast({
          title: 'Success',
          description: response.note || 'Bank details updated successfully!',
        });
      }
    } catch (error: any) {
      console.error('Error updating bank details:', error);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message ||
          error.message ||
          'Failed to update bank details',
        variant: 'destructive',
      });
    } finally {
      setBankSubmitting(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow-lg space-y-6 border border-gray-100'>
      <h2 className='text-2xl font-bold text-gray-800 mb-2'>Vendor Profile</h2>
      <Separator className='mb-6 bg-gray-200' />

      {/* Personal Details Section */}
      <div className='mb-6'>
        <h3 className='text-xl font-semibold text-gray-700 mb-4'>
          Personal Details
        </h3>
        <form
          className='space-y-4'
          onSubmit={async (e) => {
            e.preventDefault();
            setPersonalSubmitting(true);
            setPersonalSuccess(false);

            try {
              const token = localStorage.getItem('token') || '';
              await updateProfile(personalData, token);

              setPersonalSuccess(true);
              toast({
                title: 'Success',
                description: 'Personal details updated successfully!',
              });
            } catch (error) {
              console.error('Error updating personal details:', error);
              toast({
                title: 'Error',
                description:
                  error instanceof Error
                    ? error.message
                    : 'Failed to update personal details',
                variant: 'destructive',
              });
            } finally {
              setPersonalSubmitting(false);
            }
          }}>
          {/* Profile Picture Upload */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Profile Picture
            </label>
            <div className='flex items-center space-x-4'>
              <div className='w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200'>
                {profilePicPreview ? (
                  <img
                    src={profilePicPreview}
                    alt='Profile Preview'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                    <Upload className='w-8 h-8 text-gray-400' />
                  </div>
                )}
              </div>
              <div>
                <input
                  id='profilePic'
                  type='file'
                  accept='image/*'
                  onChange={handleProfilePicUpload}
                  className='hidden'
                />
                <label
                  htmlFor='profilePic'
                  className='cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block'>
                  Choose Image
                </label>
                <p className='text-xs text-gray-500 mt-1'>
                  JPG, PNG or WebP. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Vendor Name *
              </label>
              <input
                type='text'
                value={personalData.vendorName}
                onChange={(e) =>
                  setPersonalData({
                    ...personalData,
                    vendorName: e.target.value,
                  })
                }
                className='w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Contact Person *
              </label>
              <input
                type='text'
                value={personalData.contactPerson}
                onChange={(e) =>
                  setPersonalData({
                    ...personalData,
                    contactPerson: e.target.value,
                  })
                }
                className='w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Mobile Number *
              </label>
              <input
                type='tel'
                value={personalData.mobileNumber}
                onChange={(e) =>
                  setPersonalData({
                    ...personalData,
                    mobileNumber: e.target.value,
                  })
                }
                className='w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email Address *
              </label>
              <input
                type='email'
                value={personalData.email}
                onChange={(e) =>
                  setPersonalData({ ...personalData, email: e.target.value })
                }
                className='w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Business Address *
            </label>
            <textarea
              value={personalData.address}
              onChange={(e) =>
                setPersonalData({ ...personalData, address: e.target.value })
              }
              rows={3}
              className='w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required
            />
          </div>

          <button
            type='submit'
            disabled={personalSubmitting}
            className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
            {personalSubmitting ? 'Updating...' : 'Update Personal Details'}
          </button>

          {personalSuccess && (
            <div className='mt-2 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg'>
              Personal details updated successfully!
            </div>
          )}
        </form>
      </div>

      <Separator className='my-8 bg-gray-200' />

      {/* Bank/Payout Details Section */}
      <div className='mb-6'>
        <h3 className='text-xl font-semibold text-gray-700 mb-4'>
          Bank & Payout Details
        </h3>
        <form className='space-y-4' onSubmit={handleBankDetailsSubmit}>
          {bankDetailsLoading && (
            <div className='text-center py-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
              <p className='text-gray-600 mt-2'>Loading bank details...</p>
            </div>
          )}

          {existingBankDetails && (
            <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-blue-800'>
                    Verification Status:{' '}
                    {existingBankDetails.isVerified
                      ? 'Verified'
                      : 'Pending Verification'}
                  </p>
                  {existingBankDetails.verificationNotes && (
                    <p className='text-xs text-blue-600 mt-1'>
                      Notes: {existingBankDetails.verificationNotes}
                    </p>
                  )}
                  <p className='text-xs text-blue-600 mt-1'>
                    Note: For security reasons, you'll need to re-enter your
                    account number when updating.
                  </p>
                </div>
                {existingBankDetails.isVerified && (
                  <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Account Holder Name *
              </label>
              <input
                type='text'
                value={bankDetails.accountHolderName}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    accountHolderName: e.target.value,
                  })
                }
                className='w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Account Number *
              </label>
              <input
                type='text'
                value={bankDetails.accountNumber}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    accountNumber: e.target.value,
                  })
                }
                className='w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Confirm Account Number *
              </label>
              <input
                type='text'
                value={bankDetails.confirmAccountNumber}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    confirmAccountNumber: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 bg-white text-black border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  bankDetails.accountNumber &&
                  bankDetails.confirmAccountNumber &&
                  bankDetails.accountNumber !== bankDetails.confirmAccountNumber
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                required
              />
              {bankDetails.accountNumber &&
                bankDetails.confirmAccountNumber &&
                bankDetails.accountNumber !==
                  bankDetails.confirmAccountNumber && (
                  <p className='text-xs text-red-600 mt-1'>
                    Account numbers do not match
                  </p>
                )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Bank Name *
              </label>
              <input
                type='text'
                value={bankDetails.bankName}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    bankName: e.target.value,
                  })
                }
                className='w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                IFSC Code *
              </label>
              <input
                type='text'
                value={bankDetails.ifscCode}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    ifscCode: e.target.value.toUpperCase(),
                  })
                }
                className='w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                maxLength={11}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Branch Name *
              </label>
              <input
                type='text'
                value={bankDetails.branchName}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    branchName: e.target.value,
                  })
                }
                className='w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              UPI ID (Optional)
            </label>
            <input
              type='text'
              value={bankDetails.upiId}
              onChange={(e) =>
                setBankDetails({
                  ...bankDetails,
                  upiId: e.target.value,
                })
              }
              className='w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          <button
            type='submit'
            disabled={bankSubmitting}
            className='w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
            {bankSubmitting ? 'Updating...' : 'Update Bank Details'}
          </button>

          {bankSuccess && (
            <div className='mt-2 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg'>
              Bank details updated successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
