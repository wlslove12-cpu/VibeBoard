'use client';

import { useEffect, useState } from 'react';
import { Comment } from '@/types';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  postId: string;
  refreshTrigger?: number;
}

export function CommentList({ postId, refreshTrigger = 0 }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (!response.ok) throw new Error('댓글을 불러올 수 없습니다');
      const data = await response.json();
      setComments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, refreshTrigger]);

  if (isLoading) return <div className="text-center py-8">댓글 로드 중...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      {comments.length === 0 ? (
        <p className="text-center text-gray-500 py-8">아직 댓글이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDeleted={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
