'use client';

import { useState } from 'react';
import { Comment } from '@/types';
import { formatDate } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CommentItemProps {
  comment: Comment;
  onDeleted?: () => void;
}

export function CommentItem({ comment, onDeleted }: CommentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!confirm('이 댓글을 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '댓글을 삭제할 수 없습니다');
      }

      onDeleted?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-sm">{comment.author}</p>
            <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
