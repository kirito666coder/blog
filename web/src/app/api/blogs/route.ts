import { getBlogs } from '@/app/blogs/action';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const blogs = await getBlogs();

    return NextResponse.json({
      success: true,
      data: blogs.data,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: err,
        },
      },
      {
        status: 500,
      }
    );
  }
}
