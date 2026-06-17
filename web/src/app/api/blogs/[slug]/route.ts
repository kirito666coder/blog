import { getBlogBySlug } from '@/app/blogs/[slug]/action';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const blog = await getBlogBySlug(slug);

    return NextResponse.json({
      success: true,
      data: blog.data,
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
