'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SearchBar } from '@/app/components/common/SearchBar';
import { PostList } from '@/app/components/posts/PostList';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">검색 결과</h1>
        {query && <p className="text-gray-600">'{query}'에 대한 검색 결과</p>}
        <div className="mt-4">
          <SearchBar />
        </div>
      </div>
      <PostList searchQuery={query} />
    </div>
  );
}
