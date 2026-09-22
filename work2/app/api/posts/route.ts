import { NextRequest, NextResponse } from 'next/server';
import { getPosts, createPost } from '@/lib/db/supabase-storage';
import { postSchema } from '@/lib/utils/validation';
import { paginate } from '@/lib/utils/pagination';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const allPosts = await getPosts();
    const sortedPosts = allPosts.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const paginationResult = paginate(sortedPosts, page, limit);

    return NextResponse.json(paginationResult, { status: 200 });
  } catch (error) {
    console.error('Failed to get posts:', error);
    return NextResponse.json(
      { error: '게시글을 불러올 수 없습니다' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = postSchema.parse(body);

    const post = await createPost(validated);
    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create post:', error);
    return NextResponse.json(
      { error: error.message || '게시글을 생성할 수 없습니다' },
      { status: 400 }
    );
  }
}
