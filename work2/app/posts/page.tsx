import { SearchBar } from '@/app/components/common/SearchBar';
import { PostList } from '@/app/components/posts/PostList';

export default function PostsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">게시판</h1>
        <SearchBar />
      </div>
      <PostList />
    </div>
  );
}
