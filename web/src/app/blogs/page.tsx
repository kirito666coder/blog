import { getBlogs } from './action';
import BlogsClient from './BlogsClient';

export default async function BlogsPage() {
  const res = await getBlogs();
  console.log(res, 'res');
  return <BlogsClient initialBlogs={res.data ?? []} />;
}
