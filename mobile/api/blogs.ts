import { api } from './client';
export const getBlogs = async () => {
  const response = await api.get('/blogs');
  return response.data.data;
};

export const getSlugBlog = async (slug: string) => {
  console.log('slug', slug);
  const response = await api.get(`/blogs/${slug}`);
  return response.data.data;
};
