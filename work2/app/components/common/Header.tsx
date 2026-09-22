'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            VibeBoard
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/posts" className="text-gray-600 hover:text-gray-900">
              게시판
            </Link>
            <Button asChild variant="default" size="sm">
              <Link href="/posts/create">글쓰기</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
