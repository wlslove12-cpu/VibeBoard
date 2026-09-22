import { promises as fs } from 'fs';
import path from 'path';
import { Post, CreatePostInput, UpdatePostInput } from '@/types';
import { Comment, CreateCommentInput } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // ignore
  }
}

async function readFile(filePath: string): Promise<any[]> {
  try {
    await ensureDataDir();
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

async function writeFile(filePath: string, data: any[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Posts
export async function getPosts(): Promise<Post[]> {
  const rows = await readFile(POSTS_FILE);
  return rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    author: row.author,
    tags: row.tags || [],
    viewCount: row.viewCount || 0,
    commentCount: row.commentCount || 0,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }));
}

export async function getPostById(id: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find(p => p.id === id) || null;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const rows = await readFile(POSTS_FILE);
  const now = new Date();
  const post = {
    id: Date.now().toString(),
    title: input.title,
    content: input.content,
    author: input.author,
    tags: input.tags || [],
    viewCount: 0,
    commentCount: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  rows.push(post);
  await writeFile(POSTS_FILE, rows);

  return {
    ...post,
    createdAt: new Date(post.createdAt),
    updatedAt: new Date(post.updatedAt),
  };
}

export async function updatePost(id: string, input: UpdatePostInput): Promise<Post | null> {
  const rows = await readFile(POSTS_FILE);
  const idx = rows.findIndex((r: any) => r.id === id);
  if (idx === -1) return null;

  rows[idx] = {
    ...rows[idx],
    ...(input.title && { title: input.title }),
    ...(input.content && { content: input.content }),
    ...(input.author && { author: input.author }),
    ...(input.tags !== undefined && { tags: input.tags }),
    updatedAt: new Date().toISOString(),
  };

  await writeFile(POSTS_FILE, rows);

  const updated = rows[idx];
  return {
    ...updated,
    createdAt: new Date(updated.createdAt),
    updatedAt: new Date(updated.updatedAt),
  };
}

export async function deletePost(id: string): Promise<boolean> {
  const rows = await readFile(POSTS_FILE);
  const idx = rows.findIndex((r: any) => r.id === id);
  if (idx === -1) return false;

  rows.splice(idx, 1);
  await writeFile(POSTS_FILE, rows);
  await deleteCommentsByPostId(id);

  return true;
}

export async function incrementPostViewCount(id: string): Promise<void> {
  const rows = await readFile(POSTS_FILE);
  const idx = rows.findIndex((r: any) => r.id === id);
  if (idx !== -1) {
    rows[idx].viewCount = (rows[idx].viewCount || 0) + 1;
    await writeFile(POSTS_FILE, rows);
  }
}

// Comments
export async function getComments(): Promise<Comment[]> {
  const rows = await readFile(COMMENTS_FILE);
  return rows.map((row: any) => ({
    id: row.id,
    postId: row.postId,
    author: row.author,
    content: row.content,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }));
}

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  const comments = await getComments();
  return comments.filter(c => c.postId === postId);
}

export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const rows = await readFile(COMMENTS_FILE);
  const now = new Date();
  const comment = {
    id: Date.now().toString(),
    postId: input.postId,
    author: input.author,
    content: input.content,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  rows.push(comment);
  await writeFile(COMMENTS_FILE, rows);

  // Update post comment count
  const posts = await readFile(POSTS_FILE);
  const pidx = posts.findIndex((p: any) => p.id === input.postId);
  if (pidx !== -1) {
    posts[pidx].commentCount = (posts[pidx].commentCount || 0) + 1;
    await writeFile(POSTS_FILE, posts);
  }

  return {
    ...comment,
    createdAt: new Date(comment.createdAt),
    updatedAt: new Date(comment.updatedAt),
  };
}

export async function deleteComment(id: string): Promise<boolean> {
  const rows = await readFile(COMMENTS_FILE);
  const idx = rows.findIndex((r: any) => r.id === id);
  if (idx === -1) return false;

  const postId = rows[idx].postId;
  rows.splice(idx, 1);
  await writeFile(COMMENTS_FILE, rows);

  // Update post comment count
  const posts = await readFile(POSTS_FILE);
  const pidx = posts.findIndex((p: any) => p.id === postId);
  if (pidx !== -1) {
    posts[pidx].commentCount = Math.max(0, (posts[pidx].commentCount || 0) - 1);
    await writeFile(POSTS_FILE, posts);
  }

  return true;
}

export async function deleteCommentsByPostId(postId: string): Promise<void> {
  const rows = await readFile(COMMENTS_FILE);
  const filtered = rows.filter((r: any) => r.postId !== postId);
  await writeFile(COMMENTS_FILE, filtered);
}

export async function searchPosts(query: string): Promise<Post[]> {
  const posts = await getPosts();
  const lower = query.toLowerCase();
  return posts.filter(p =>
    p.title.toLowerCase().includes(lower) ||
    p.content.toLowerCase().includes(lower) ||
    p.author.toLowerCase().includes(lower)
  );
}
