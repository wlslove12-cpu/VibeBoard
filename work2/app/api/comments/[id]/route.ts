import { NextRequest, NextResponse } from 'next/server';
import { deleteComment } from '@/lib/db/supabase-storage';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const success = await deleteComment(id);

    if (!success) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: '댓글이 삭제되었습니다' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return NextResponse.json(
      { error: '댓글을 삭제할 수 없습니다' },
      { status: 500 }
    );
  }
}
