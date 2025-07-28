import React, { useEffect, useState } from 'react';
import {
  Upload,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>
            Vendor Profile
          </h1>
          <p className='text-slate-600'>
            Manage your business profile and payment details
          </p>
        </div>

        <div className='grid gap-8 lg:grid-cols-1'>
          {/* Personal Details Section */}
          <div className='bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden'>
            <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6'>
              <div className='flex items-center space-x-3'>
                <div className='p-2 bg-white/20 rounded-lg'>
                  <User className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-white'>
                    Personal Details
                  </h2>
                  <p className='text-blue-100'>
                    Update your business information
                  </p>
                </div>
              </div>
            </div>

            <div className='p-8'>
              <form
                className='space-y-6'
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
                <div className='bg-slate-50 rounded-xl p-6 border border-slate-200'>
                  <label className='block text-sm font-semibold text-slate-700 mb-4'>
                    Profile Picture
                  </label>
                  <div className='flex items-center space-x-6'>
                    <div className='relative'>
                      <div className='w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg'>
                        {profilePicPreview ? (
                          <img
                            src={profilePicPreview}
                            alt='Profile Preview'
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center'>
                            <User className='w-10 h-10 text-slate-400' />
                          </div>
                        )}
                      </div>
                      <div className='absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-full shadow-lg'>
                        <Upload className='w-4 h-4 text-white' />
                      </div>
                    </div>
                    <div className='flex-1'>
                      <input
                        id='profilePic'
                        type='file'
                        accept='image/*'
                        onChange={handleProfilePicUpload}
                        className='hidden'
                      />
                      <label
                        htmlFor='profilePic'
                        className='inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer shadow-md hover:shadow-lg'>
                        <Upload className='w-4 h-4 mr-2' />
                        Choose Image
                      </label>
                      <p className='text-sm text-slate-500 mt-2'>
                        JPG, PNG or WebP. Max 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <label className='flex items-center text-sm font-semibold text-slate-700 mb-2'>
                      <Building2 className='w-4 h-4 mr-2 text-slate-500' />
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
                      className='w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400'
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='flex items-center text-sm font-semibold text-slate-700 mb-2'>
                      <User className='w-4 h-4 mr-2 text-slate-500' />
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
                      className='w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400'
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='flex items-center text-sm font-semibold text-slate-700 mb-2'>
                      <Phone className='w-4 h-4 mr-2 text-slate-500' />
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
                      className='w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400'
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='flex items-center text-sm font-semibold text-slate-700 mb-2'>
                      <Mail className='w-4 h-4 mr-2 text-slate-500' />
                      Email Address *
                    </label>
                    <input
                      type='email'
                      value={personalData.email}
                      onChange={(e) =>
                        setPersonalData({
                          ...personalData,
                          email: e.target.value,
                        })
                      }
                      className='w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='flex items-center text-sm font-semibold text-slate-700 mb-2'>
                    <MapPin className='w-4 h-4 mr-2 text-slate-500' />
                    Business Address *
                  </label>
                  <textarea
                    value={personalData.address}
                    onChange={(e) =>
                      setPersonalData({
                        ...personalData,
                        address: e.target.value,
                      })
                    }
                    rows={3}
                    className='w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400 resize-none'
                    required
                  />
                </div>

                <div className='flex items-center space-x-4 pt-4'>
                  <button
                    type='submit'
                    disabled={personalSubmitting}
                    className='flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl'>
                    {personalSubmitting ? (
                      <>
                        <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className='w-5 h-5 mr-2' />
                        Update Personal Details
                      </>
                    )}
                  </button>
                </div>

                {personalSuccess && (
                  <div className='flex items-center p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl'>
                    <CheckCircle className='w-5 h-5 mr-3 text-emerald-600' />
                    <span className='font-medium'>
                      Personal details updated successfully!
                    </span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Bank/Payout Details Section */}
          <div className='bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden'>
            <div className='bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6'>
              <div className='flex items-center space-x-3'>
                <div className='p-2 bg-white/20 rounded-lg'>
                  <CreditCard className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-white'>
                    Bank & Payout Details
                  </h2>
                  <p className='text-emerald-100'>Secure payment information</p>
                </div>
              </div>
            </div>

            <div className='p-8'>
              <form className='space-y-6' onSubmit={handleBankDetailsSubmit}>
                {bankDetailsLoading && (
                  <div className='flex flex-col items-center justify-center py-12 space-y-4'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
                    <p className='text-slate-600 font-medium'>
                      Loading bank details...
                    </p>
                  </div>
                )}

                {existingBankDetails && !bankDetailsLoading && (
                  <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start space-x-3'>
                        <div className='p-2 bg-blue-100 rounded-lg'>
                          <Shield className='w-5 h-5 text-blue-600' />
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-2 mb-2'>
                            <h4 className='font-semibold text-slate-900'>
                              Verification Status
                            </h4>
                            {existingBankDetails.isVerified ? (
                              <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800'>
                                <CheckCircle className='w-3 h-3 mr-1' />
                                Verified
                              </span>
                            ) : (
                              <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800'>
                                <AlertCircle className='w-3 h-3 mr-1' />
                                Pending
                              </span>
                            )}
                          </div>
                          {existingBankDetails.verificationNotes && (
                            <p className='text-sm text-slate-600 mb-2'>
                              <span className='font-medium'>Notes:</span>{' '}
                              {existingBankDetails.verificationNotes}
                            </p>
                          )}
                          <p className='text-sm text-slate-600'>
                            <span className='font-medium'>
                              Security Notice:
                            </span>{' '}
                            For security reasons, you'll need to re-enter your
                            account number when updating.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!bankDetailsLoading && (
                  <>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                      <div className='space-y-2'>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
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
                          className='w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-slate-400'
                          required
                        />
                      </div>

                      <div className='space-y-2'>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
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
                          className='w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-slate-400'
                          required
                        />
                      </div>

                      <div className='space-y-2'>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
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
                          className='w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-slate-400'
                          required
                        />
                      </div>

                      <div className='space-y-2'>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
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
                          className={`w-full px-4 py-3 bg-white text-slate-900 border rounded-xl focus:ring-2 transition-all duration-200 hover:border-slate-400 ${
                            bankDetails.accountNumber &&
                            bankDetails.confirmAccountNumber &&
                            bankDetails.accountNumber !==
                              bankDetails.confirmAccountNumber
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-slate-300 focus:ring-emerald-500 focus:border-emerald-500'
                          }`}
                          required
                        />
                        {bankDetails.accountNumber &&
                          bankDetails.confirmAccountNumber &&
                          bankDetails.accountNumber !==
                            bankDetails.confirmAccountNumber && (
                            <div className='flex items-center space-x-2 mt-2'>
                              <AlertCircle className='w-4 h-4 text-red-500' />
                              <p className='text-sm text-red-600 font-medium'>
                                Account numbers do not match
                              </p>
                            </div>
                          )}
                      </div>

                      <div className='space-y-2'>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
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
                          className='w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-slate-400'
                          maxLength={11}
                          required
                        />
                      </div>

                      <div className='space-y-2'>
                        <label className='block text-sm font-semibold text-slate-700 mb-2'>
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
                          className='w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-slate-400'
                          required
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <label className='block text-sm font-semibold text-slate-700 mb-2'>
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
                        className='w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 hover:border-slate-400'
                        placeholder='example@upi'
                      />
                    </div>

                    <div className='flex items-center space-x-4 pt-4'>
                      <button
                        type='submit'
                        disabled={bankSubmitting}
                        className='flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl'>
                        {bankSubmitting ? (
                          <>
                            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Shield className='w-5 h-5 mr-2' />
                            Update Bank Details
                          </>
                        )}
                      </button>
                    </div>

                    {bankSuccess && (
                      <div className='flex items-center p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl'>
                        <CheckCircle className='w-5 h-5 mr-3 text-emerald-600' />
                        <span className='font-medium'>
                          Bank details updated successfully!
                        </span>
                      </div>
                    )}
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
