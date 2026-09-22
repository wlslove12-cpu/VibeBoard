'use client';

import { useEffect, useState } from 'react';
import { Post } from '@/types';
import { PostCard } from './PostCard';
import { PaginationComponent } from './Pagination';

interface PostListProps {
  searchQuery?: string;
}

export function PostList({ searchQuery }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10,
  });

  const fetchPosts = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const url = searchQuery
        ? `/api/search?q=${encodeURIComponent(searchQuery)}&page=${page}`
        : `/api/posts?page=${page}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('게시글을 불러올 수 없습니다');
      const data = await response.json();

      setPosts(data.data);
      setPagination({
        page: data.page,
        total: data.total,
        totalPages: data.totalPages,
        limit: data.limit,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [searchQuery]);

  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {searchQuery ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <PaginationComponent
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => fetchPosts(page)}
        />
      )}
    </div>
  );
}
