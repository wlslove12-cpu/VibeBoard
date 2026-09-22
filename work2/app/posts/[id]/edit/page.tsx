'use client';

import { useEffect, useState } from 'react';
import { Post } from '@/types';
import { PostForm } from '@/app/components/posts/PostForm';

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">게시글 수정</h1>
      <PostForm initialData={post || undefined} isLoading={isLoading} />
    </div>
  );
}
