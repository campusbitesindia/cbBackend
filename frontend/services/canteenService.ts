import api from '@/lib/axios';

export interface CanteenBusinessDetails {
  adhaarNumber: string;
  panNumber: string;
  gstNumber: string;
  fssaiLicense?: string;
  contactPersonName: string;
  contactPhone?: string;
  description?: string;
  operatingHours?: {
    open: string;
    close: string;
  };
}

export interface CreateCanteenPayload {
  name: string;
  campus: string; // campus ID
  adhaarNumber: string;
  panNumber: string;
  gstNumber: string;
  fssaiLicense?: string;
  contactPersonName: string;
  contactPhone?: string;
  description?: string;
  operatingHours?: {
    open: string;
    close: string;
  };
  images?: File[];
}

export interface Canteen {
  _id: string;
  name: string;
  campus: {
    _id: string;
    name: string;
    code: string;
    city: string;
  };
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  isOpen: boolean;
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  images: string[];
  adminRatings: Array<{
    rating: number;
    feedback: string;
    date: Date;
  }>;
  adhaarNumber: string;
  panNumber: string;
  gstNumber: string;
  fssaiLicense?: string;
  contactPersonName: string;
  contactPhone?: string;
  description?: string;
  operatingHours?: {
    open: string;
    close: string;
  };
  totalEarnings: number;
  availableBalance: number;
  totalPayouts: number;
  createdAt: string;
  updatedAt: string;
}

export interface CanteenResponse {
  success: boolean;
  message: string;
  canteen?: Canteen;
  nextSteps?: string[];
}

// Create a new canteen with business details
export const createCanteen = async (
  payload: CreateCanteenPayload
): Promise<CanteenResponse> => {
  const formData = new FormData();

  // Add basic fields
  formData.append('name', payload.name);
  formData.append('campus', payload.campus);
  formData.append('adhaarNumber', payload.adhaarNumber);
  formData.append('panNumber', payload.panNumber);
  formData.append('gstNumber', payload.gstNumber);
  if (payload.fssaiLicense) {
    formData.append('fssaiLicense', payload.fssaiLicense);
  }
  formData.append('contactPersonName', payload.contactPersonName);

  if (payload.contactPhone) {
    formData.append('contactPhone', payload.contactPhone);
  }

  if (payload.description) {
    formData.append('description', payload.description);
  }

  // Add operating hours if provided
  if (payload.operatingHours) {
    formData.append('operatingHours', JSON.stringify(payload.operatingHours));
  }

  // Add images if provided
  if (payload.images && payload.images.length > 0) {
    payload.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  const response = await api.post('/api/v1/canteens/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Get all canteens
export const getAllCanteens = async (
  campus?: string,
  includeUnapproved = false
): Promise<{
  success: boolean;
  canteens: Canteen[];
  count: number;
  message: string;
}> => {
  const params = new URLSearchParams();
  if (campus) {
    params.append('campus', campus);
  }
  if (includeUnapproved) {
    params.append('includeUnapproved', 'true');
  }

  const response = await api.get(`/api/v1/canteens?${params.toString()}`);
  return response.data;
};

// Get canteen by ID
export const getCanteenById = async (
  id: string
): Promise<{
  success: boolean;
  canteen: Canteen;
}> => {
  const response = await api.get(`/api/v1/canteens/${id}`);
  return response.data;
};

// Get current user's canteen
export const getMyCanteen = async (): Promise<{
  success: boolean;
  canteen: Canteen;
  approvalStatus: {
    isApproved: boolean;
    status: string;
    canOperate: boolean;
    message: string;
  };
}> => {
  const response = await api.get('/api/v1/canteens/my-canteen');
  return response.data;
};

// Update canteen
export const updateCanteen = async (
  id: string,
  updates: {
    name?: string;
    isOpen?: boolean;
    clearImages?: boolean;
    images?: File[];
  }
): Promise<{
  success: boolean;
  message: string;
  canteen: {
    id: string;
    name: string;
    isOpen: boolean;
    images: string[];
    imageCount: number;
    approvalStatus: string;
  };
}> => {
  const formData = new FormData();

  if (updates.name) {
    formData.append('name', updates.name);
  }

  if (updates.isOpen !== undefined) {
    formData.append('isOpen', updates.isOpen.toString());
  }

  if (updates.clearImages) {
    formData.append('clearImages', 'true');
  }

  if (updates.images && updates.images.length > 0) {
    updates.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  const response = await api.put(`/api/v1/canteens/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Delete canteen
export const deleteCanteen = async (
  id: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await api.delete(`/api/v1/canteens/${id}`);
  return response.data;
};
