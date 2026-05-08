import { createBlog } from '@/app/admin/blogs/create/action';
import { dummyBlogs } from './blogs';
export const seedData = async () => {
  for (let i = 0; i < dummyBlogs.length - 1; i++) {
    await createBlog(dummyBlogs[i]);
  }
};
