'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { formatDate } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CommentForm } from '@/app/components/comments/CommentForm';
import { CommentList } from '@/app/components/comments/CommentList';

interface PostDetailPageProps {
  params: {
    id: string;
  };
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentRefresh, setCommentRefresh] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        if (!response.ok) throw new Error('게시글을 찾을 수 없습니다');
        const data = await response.json();
        setPost(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('게시글을 삭제할 수 없습니다');
      router.push('/posts');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="text-center py-8">로딩 중...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!post) return <div className="text-center py-8">게시글을 찾을 수 없습니다</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/posts" className="text-indigo-600 hover:text-indigo-800">
        ← 목록으로 돌아가기
      </Link>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>작성자: {post.author}</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex gap-2">
                <span>👁️ {post.viewCount}</span>
                <span>💬 {post.commentCount}</span>
              </div>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {post.content}
            </p>
          </div>
        </CardContent>

        <Separator />

        <div className="p-6 flex gap-2">
          <Button asChild variant="default">
            <Link href={`/posts/${post.id}/edit`}>수정</Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">삭제</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
              <div className="flex gap-2 justify-end">
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">댓글 ({post.commentCount})</h2>
        <CommentForm
          postId={params.id}
          onCommentAdded={() => setCommentRefresh(prev => prev + 1)}
        />
        <CommentList postId={params.id} refreshTrigger={commentRefresh} />
      </div>
    </div>
  );
}
