export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCommentInput = Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCommentInput = Partial<Omit<CreateCommentInput, 'postId'>>;
