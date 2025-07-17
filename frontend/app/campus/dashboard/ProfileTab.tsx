import React from 'react';
import { Upload } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PersonalData {
  vendorName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  address: string;
  profilePic: string;
}

interface ProfileData {
  panOrGst: string;
  accountNo: string;
  bankName: string;
  ifsc: string;
  branch: string;
  upiId: string;
}

interface ProfileTabProps {
  personalData: PersonalData;
  setPersonalData: (data: PersonalData) => void;
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  personalSubmitting: boolean;
  setPersonalSubmitting: (submitting: boolean) => void;
  personalSuccess: boolean;
  setPersonalSuccess: (success: boolean) => void;
  profileSubmitting: boolean;
  setProfileSubmitting: (submitting: boolean) => void;
  profileSuccess: boolean;
  setProfileSuccess: (success: boolean) => void;
  profilePicPreview: string;
  handleProfilePicUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  personalData,
  setPersonalData,
  profileData,
  setProfileData,
  personalSubmitting,
  setPersonalSubmitting,
  personalSuccess,
  setPersonalSuccess,
  profileSubmitting,
  setProfileSubmitting,
  profileSuccess,
  setProfileSuccess,
  profilePicPreview,
  handleProfilePicUpload,
}) => {
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
            setPersonalSuccess(true);
            setPersonalSubmitting(false);
          }}>
          <div className='flex items-center gap-8'>
            <div className='relative'>
              <img
                src={
                  profilePicPreview ||
                  personalData.profilePic ||
                  '/placeholder-user.jpg'
                }
                alt='Profile'
                className='w-24 h-24 rounded-full object-cover border border-gray-300'
              />
              <label className='absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700'>
                <input
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleProfilePicUpload}
                />
                <Upload className='w-4 h-4' />
              </label>
            </div>
            <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block font-medium mb-1 text-black'>
                  Vendor Name
                </label>
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                  placeholder='Enter vendor/canteen name'
                  value={personalData.vendorName}
                  onChange={(e) =>
                    setPersonalData({
                      ...personalData,
                      vendorName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className='block font-medium mb-1 text-black'>
                  Contact Person
                </label>
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                  placeholder='Enter contact person name'
                  value={personalData.contactPerson}
                  onChange={(e) =>
                    setPersonalData({
                      ...personalData,
                      contactPerson: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className='block font-medium mb-1 text-black'>
                  Mobile Number
                </label>
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                  placeholder='Enter mobile number'
                  value={personalData.mobileNumber}
                  onChange={(e) =>
                    setPersonalData({
                      ...personalData,
                      mobileNumber: e.target.value
                        .replace(/[^0-9]/g, '')
                        .slice(0, 10),
                    })
                  }
                  maxLength={10}
                />
              </div>
              <div>
                <label className='block font-medium mb-1 text-black'>
                  Email
                </label>
                <input
                  type='email'
                  className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                  placeholder='Enter email address'
                  value={personalData.email}
                  onChange={(e) =>
                    setPersonalData({
                      ...personalData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div>
            <label className='block font-medium mb-1 text-black'>Address</label>
            <textarea
              className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
              placeholder='Enter address'
              value={personalData.address}
              onChange={(e) =>
                setPersonalData({
                  ...personalData,
                  address: e.target.value,
                })
              }
            />
          </div>
          <button
            type='submit'
            className='w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2'
            disabled={personalSubmitting}>
            {personalSubmitting ? 'Saving...' : 'Save Personal Details'}
          </button>
          {personalSuccess && (
            <div className='text-green-600 text-center mt-2'>
              Personal details updated successfully!
            </div>
          )}
        </form>
      </div>

      <Separator className='mb-6 bg-gray-200' />

      {/* Bank/Payout Details Section */}
      <div>
        <h3 className='text-xl font-semibold text-gray-700 mb-4'>
          Bank / Payout Details
        </h3>
        <form
          className='space-y-4'
          onSubmit={async (e) => {
            e.preventDefault();
            setProfileSubmitting(true);
            setProfileSuccess(true);
            setProfileSubmitting(false);
          }}>
          <div>
            <label className='block font-medium mb-1 text-black'>
              PAN Card or GST No. <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
              placeholder='Enter PAN or GST number'
              value={profileData.panOrGst}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  panOrGst: e.target.value,
                })
              }
              required
            />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block font-medium mb-1'>Account Number</label>
              <input
                type='text'
                className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                placeholder='Enter account number'
                value={profileData.accountNo}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    accountNo: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className='block font-medium mb-1'>Bank Name</label>
              <input
                type='text'
                className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                placeholder='Enter bank name'
                value={profileData.bankName}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    bankName: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block font-medium mb-1'>IFSC Code</label>
              <input
                type='text'
                className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                placeholder='Enter IFSC code'
                value={profileData.ifsc}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    ifsc: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className='block font-medium mb-1'>Branch</label>
              <input
                type='text'
                className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
                placeholder='Enter branch name'
                value={profileData.branch}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    branch: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className='flex items-center my-2'>
            <span className='text-gray-500 mx-2'>OR</span>
          </div>
          <div>
            <label className='block font-medium mb-1 text-black'>UPI ID</label>
            <input
              type='text'
              className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white text-black'
              placeholder='Enter UPI ID (if applicable)'
              value={profileData.upiId}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  upiId: e.target.value,
                })
              }
            />
          </div>
          <button
            type='submit'
            className='w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2'
            disabled={profileSubmitting}>
            {profileSubmitting ? 'Saving...' : 'Save Bank Details'}
          </button>
          {profileSuccess && (
            <div className='text-green-600 text-center mt-2'>
              Bank details updated successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
