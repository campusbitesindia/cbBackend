import api from '@/lib/axios';

export interface Campus {
  _id: string;
  name: string;
  code: string;
  city: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampusResponse {
  campuses: Campus[];
}

export const getAllCampuses = async (): Promise<CampusResponse> => {
  const response = await api.get('/api/campuses/');
  return response.data;
}; 