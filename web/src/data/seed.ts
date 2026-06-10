import { createBlog, findSlug } from '@/app/admin/blogs/create/action';
import { dummyBlogs } from './blogs';
export const seedData = async () => {
  for (let i = 0; i < dummyBlogs.length - 1; i++) {
    const { available } = await findSlug(dummyBlogs[i].slug);

    if (!available) {
      continue;
    }

    await createBlog(dummyBlogs[i]);
  }
};
