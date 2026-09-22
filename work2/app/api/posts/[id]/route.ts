import { NextRequest, NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost, incrementPostViewCount } from '@/lib/db/file-storage';
import { postSchema } from '@/lib/utils/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // Increment view count
    await incrementPostViewCount(id);
    const updatedPost = await getPostById(id);

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error('Failed to get post:', error);
    return NextResponse.json(
      { error: '게시글을 불러올 수 없습니다' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate only the fields being updated
    const partialSchema = postSchema.partial();
    const validated = partialSchema.parse(body);

    const post = await updatePost(id, validated);

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error: any) {
    console.error('Failed to update post:', error);
    return NextResponse.json(
      { error: error.message || '게시글을 수정할 수 없습니다' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const success = await deletePost(id);

    if (!success) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: '게시글이 삭제되었습니다' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json(
      { error: '게시글을 삭제할 수 없습니다' },
      { status: 500 }
    );
  }
}
