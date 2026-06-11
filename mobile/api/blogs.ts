import { api } from './client';
export const getBlogs = async () => {
  const response = await api.get('/blogs');
  return response.data.data;
};
