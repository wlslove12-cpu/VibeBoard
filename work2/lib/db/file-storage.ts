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
    console.error('Failed to create data directory:', error);
  }
};

const ensureFile = async (filePath: string, defaultData: any = []) => {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
  }
};

// Posts Operations
export const getPosts = async (): Promise<Post[]> => {
  try {
    await ensureDataDir();
    await ensureFile(POSTS_FILE, []);
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read posts:', error);
    return [];
  }
};

export const getPostById = async (id: string): Promise<Post | null> => {
  const posts = await getPosts();
  return posts.find(post => post.id === id) || null;
};

export const createPost = async (input: CreatePostInput): Promise<Post> => {
  const posts = await getPosts();
  const newPost: Post = {
    ...input,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 0,
    commentCount: 0,
  };
  posts.push(newPost);
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
  return newPost;
};

export const updatePost = async (id: string, input: UpdatePostInput): Promise<Post | null> => {
  const posts = await getPosts();
  const postIndex = posts.findIndex(post => post.id === id);
  if (postIndex === -1) return null;

  posts[postIndex] = {
    ...posts[postIndex],
    ...input,
    updatedAt: new Date(),
  };
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
  return posts[postIndex];
};

export const deletePost = async (id: string): Promise<boolean> => {
  const posts = await getPosts();
  const filteredPosts = posts.filter(post => post.id !== id);
  if (filteredPosts.length === posts.length) return false;

  await fs.writeFile(POSTS_FILE, JSON.stringify(filteredPosts, null, 2));
  // Also delete associated comments
  await deleteCommentsByPostId(id);
  return true;
};

export const incrementPostViewCount = async (id: string): Promise<void> => {
  const posts = await getPosts();
  const postIndex = posts.findIndex(post => post.id === id);
  if (postIndex !== -1) {
    posts[postIndex].viewCount += 1;
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
  }
};

// Comments Operations
export const getComments = async (): Promise<Comment[]> => {
  try {
    await ensureDataDir();
    await ensureFile(COMMENTS_FILE, []);
    const data = await fs.readFile(COMMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read comments:', error);
    return [];
  }
};

export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  const comments = await getComments();
  return comments.filter(comment => comment.postId === postId);
};

export const createComment = async (input: CreateCommentInput): Promise<Comment> => {
  const comments = await getComments();
  const newComment: Comment = {
    ...input,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  comments.push(newComment);

  // Update post comment count
  const posts = await getPosts();
  const postIndex = posts.findIndex(post => post.id === input.postId);
  if (postIndex !== -1) {
    posts[postIndex].commentCount += 1;
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
  }

  await fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2));
  return newComment;
};

export const deleteComment = async (id: string): Promise<boolean> => {
  const comments = await getComments();
  const commentIndex = comments.findIndex(c => c.id === id);
  if (commentIndex === -1) return false;

  const postId = comments[commentIndex].postId;
  const filteredComments = comments.filter(c => c.id !== id);
  await fs.writeFile(COMMENTS_FILE, JSON.stringify(filteredComments, null, 2));

  // Update post comment count
  const posts = await getPosts();
  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex !== -1) {
    posts[postIndex].commentCount = Math.max(0, posts[postIndex].commentCount - 1);
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
  }

  return true;
};

export const deleteCommentsByPostId = async (postId: string): Promise<void> => {
  const comments = await getComments();
  const filteredComments = comments.filter(c => c.postId !== postId);
  await fs.writeFile(COMMENTS_FILE, JSON.stringify(filteredComments, null, 2));
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
