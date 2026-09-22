import { NextRequest, NextResponse } from 'next/server';
import { getCommentsByPostId, createComment } from '@/lib/db/file-storage';
import { commentSchema } from '@/lib/utils/validation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'postId 파라미터가 필요합니다' },
        { status: 400 }
      );
    }

    const comments = await getCommentsByPostId(postId);
    const sortedComments = comments.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(sortedComments, { status: 200 });
  } catch (error) {
    console.error('Failed to get comments:', error);
    return NextResponse.json(
      { error: '댓글을 불러올 수 없습니다' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = commentSchema.parse(body);

    const comment = await createComment(validated);
    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create comment:', error);
    return NextResponse.json(
      { error: error.message || '댓글을 생성할 수 없습니다' },
      { status: 400 }
    );
  }
}
