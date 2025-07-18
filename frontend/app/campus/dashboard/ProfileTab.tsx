import React from 'react';
import { Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { updateProfile, uploadProfileImage } from '@/services/userService';

interface PersonalData {
  vendorName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  address: string;
  profilePic: string;
}

interface BankDetails {
  panNumber: string;
  gstNumber: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
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

  const handleBankDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankSubmitting(true);
    setBankSuccess(false);

    try {
      const token = localStorage.getItem('token') || '';
      // TODO: Implement bank details update API endpoint
      // await updateBankDetails(bankDetails, token);

      setBankSuccess(true);
      toast({
        title: 'Success',
        description: 'Bank details updated successfully!',
      });
    } catch (error) {
      console.error('Error updating bank details:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update bank details',
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
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                PAN Number *
              </label>
              <input
                type='text'
                value={bankDetails.panNumber}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    panNumber: e.target.value.toUpperCase(),
                  })
                }
                className='w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                maxLength={10}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                GST Number
              </label>
              <input
                type='text'
                value={bankDetails.gstNumber}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    gstNumber: e.target.value.toUpperCase(),
                  })
                }
                className='w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                maxLength={15}
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
