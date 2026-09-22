'use client';

import Link from 'next/link';
import { Post } from '@/types';
import { formatRelativeDate } from '@/lib/utils/date';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            작성자: {post.author}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {post.content}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex gap-4">
              <span>👁️ {post.viewCount}</span>
              <span>💬 {post.commentCount}</span>
            </div>
            <time>{formatRelativeDate(post.createdAt)}</time>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
