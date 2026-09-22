import { NextRequest, NextResponse } from 'next/server';
import { searchPosts } from '@/lib/db/supabase-storage';
import { paginate } from '@/lib/utils/pagination';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!query) {
      return NextResponse.json(
        { error: '검색어를 입력해주세요' },
        { status: 400 }
      );
    }

    const results = await searchPosts(query);
    const sortedResults = results.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const paginationResult = paginate(sortedResults, page, limit);

    return NextResponse.json(paginationResult, { status: 200 });
  } catch (error) {
    console.error('Failed to search posts:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
