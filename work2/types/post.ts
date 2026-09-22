export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  commentCount: number;
  tags?: string[];
}

export type CreatePostInput = Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'commentCount'>;
export type UpdatePostInput = Partial<CreatePostInput>;
