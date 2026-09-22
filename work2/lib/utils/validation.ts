import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다').max(200, '제목은 200자 이하여야 합니다'),
  content: z.string().min(1, '내용은 필수입니다'),
  author: z.string().min(1, '작성자는 필수입니다').max(50, '작성자는 50자 이하여야 합니다'),
  tags: z.array(z.string()).optional().default([]),
});

export const commentSchema = z.object({
  content: z.string().min(1, '댓글 내용은 필수입니다').max(500, '댓글은 500자 이하여야 합니다'),
  author: z.string().min(1, '작성자는 필수입니다').max(50, '작성자는 50자 이하여야 합니다'),
  postId: z.string().min(1, '게시글 ID는 필수입니다'),
});

export type PostSchema = z.infer<typeof postSchema>;
export type CommentSchema = z.infer<typeof commentSchema>;
