import { PostForm } from '@/app/components/posts/PostForm';

export default function CreatePostPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">새 게시글 작성</h1>
      <PostForm />
    </div>
  );
}
