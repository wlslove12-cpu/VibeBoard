import { promises as fs } from 'fs';
import path from 'path';
import { Post, CreatePostInput, UpdatePostInput } from '@/types';
import { Comment, CreateCommentInput } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

const ensureDataDir = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
};

const readPosts = async (): Promise<any[]> => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writePosts = async (posts: any[]) => {
  await ensureDataDir();
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
};

const readComments = async (): Promise<any[]> => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(COMMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeComments = async (comments: any[]) => {
  await ensureDataDir();
  await fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2));
};

const convertToPost = (row: any): Post => ({
  id: row.id,
  title: row.title,
  content: row.content,
  author: row.author,
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
  viewCount: row.viewCount || 0,
  commentCount: row.commentCount || 0,
  tags: row.tags || [],
});

const convertToComment = (row: any): Comment => ({
  id: row.id,
  postId: row.postId,
  author: row.author,
  content: row.content,
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
});

const convertPostForStorage = (post: Post) => ({
  id: post.id,
  title: post.title,
  content: post.content,
  author: post.author,
  tags: post.tags,
  viewCount: post.viewCount,
  commentCount: post.commentCount,
  createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
  updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : post.updatedAt,
});

const convertCommentForStorage = (comment: Comment) => ({
  id: comment.id,
  postId: comment.postId,
  author: comment.author,
  content: comment.content,
  createdAt: comment.createdAt instanceof Date ? comment.createdAt.toISOString() : comment.createdAt,
  updatedAt: comment.updatedAt instanceof Date ? comment.updatedAt.toISOString() : comment.updatedAt,
});

// Posts Operations
export const getPosts = async (): Promise<Post[]> => {
  const rows = await readPosts();
  return rows.map(convertToPost);
};

export const getPostById = async (id: string): Promise<Post | null> => {
  const posts = await getPosts();
  const post = posts.find(p => p.id === id);
  return post || null;
};

export const createPost = async (input: CreatePostInput): Promise<Post> => {
  const posts = await readPosts();
  const now = new Date();
  const newPost: Post = {
    id: Date.now().toString(),
    title: input.title,
    content: input.content,
    author: input.author,
    tags: input.tags || [],
    viewCount: 0,
    commentCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  posts.push(convertPostForStorage(newPost));
  await writePosts(posts);
  return newPost;
};

export const updatePost = async (id: string, input: UpdatePostInput): Promise<Post | null> => {
  const posts = await readPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updatedPost = {
    ...posts[index],
    ...(input.title !== undefined && { title: input.title }),
    ...(input.content !== undefined && { content: input.content }),
    ...(input.author !== undefined && { author: input.author }),
    ...(input.tags !== undefined && { tags: input.tags }),
    updatedAt: new Date().toISOString(),
  };

  posts[index] = updatedPost;
  await writePosts(posts);
  return convertToPost(updatedPost);
};

export const deletePost = async (id: string): Promise<boolean> => {
  const posts = await readPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return false;

  posts.splice(index, 1);
  await writePosts(posts);
  await deleteCommentsByPostId(id);
  return true;
};

export const incrementPostViewCount = async (id: string): Promise<void> => {
  const posts = await readPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index !== -1) {
    posts[index].viewCount = (posts[index].viewCount || 0) + 1;
    await writePosts(posts);
  }
};

// Comments Operations
export const getComments = async (): Promise<Comment[]> => {
  const rows = await readComments();
  return rows.map(convertToComment);
};

export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  const comments = await getComments();
  return comments.filter(c => c.postId === postId);
};

export const createComment = async (input: CreateCommentInput): Promise<Comment> => {
  const comments = await readComments();
  const now = new Date();
  const newComment: Comment = {
    id: Date.now().toString(),
    postId: input.postId,
    author: input.author,
    content: input.content,
    createdAt: now,
    updatedAt: now,
  };

  comments.push(convertCommentForStorage(newComment));
  await writeComments(comments);

  // Update post comment count
  const posts = await readPosts();
  const postIndex = posts.findIndex(p => p.id === input.postId);
  if (postIndex !== -1) {
    posts[postIndex].commentCount = (posts[postIndex].commentCount || 0) + 1;
    await writePosts(posts);
  }

  return newComment;
};

export const deleteComment = async (id: string): Promise<boolean> => {
  const comments = await readComments();
  const index = comments.findIndex(c => c.id === id);
  if (index === -1) return false;

  const postId = comments[index].postId;
  comments.splice(index, 1);
  await writeComments(comments);

  // Update post comment count
  const posts = await readPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex !== -1) {
    posts[postIndex].commentCount = Math.max(0, (posts[postIndex].commentCount || 0) - 1);
    await writePosts(posts);
  }

  return true;
};

export const deleteCommentsByPostId = async (postId: string): Promise<void> => {
  const comments = await readComments();
  const filtered = comments.filter(c => c.postId !== postId);
  await writeComments(filtered);
};

// Search
export const searchPosts = async (query: string): Promise<Post[]> => {
  const posts = await getPosts();
  const lowerQuery = query.toLowerCase();
  return posts.filter(post =>
    post.title.toLowerCase().includes(lowerQuery) ||
    post.content.toLowerCase().includes(lowerQuery) ||
    post.author.toLowerCase().includes(lowerQuery)
  );
};
