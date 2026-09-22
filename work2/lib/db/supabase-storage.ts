import { supabase } from '@/lib/supabase/client';
import { Post, CreatePostInput, UpdatePostInput } from '@/types';
import { Comment, CreateCommentInput } from '@/types';

const checkSupabase = () => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }
};

// Posts Operations
export const getPosts = async (): Promise<Post[]> => {
  try {
    checkSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      author: row.author,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      viewCount: row.view_count || 0,
      commentCount: row.comment_count || 0,
      tags: row.tags || [],
    }));
  } catch (error) {
    console.error('Failed to read posts:', error);
    return [];
  }
};

export const getPostById = async (id: string): Promise<Post | null> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      author: data.author,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      viewCount: data.view_count || 0,
      commentCount: data.comment_count || 0,
      tags: data.tags || [],
    };
  } catch (error) {
    console.error('Failed to get post:', error);
    return null;
  }
};

export const createPost = async (input: CreatePostInput): Promise<Post> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title: input.title,
          content: input.content,
          author: input.author,
          tags: input.tags || [],
          view_count: 0,
          comment_count: 0,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      author: data.author,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      viewCount: data.view_count,
      commentCount: data.comment_count,
      tags: data.tags,
    };
  } catch (error) {
    console.error('Failed to create post:', error);
    throw error;
  }
};

export const updatePost = async (id: string, input: UpdatePostInput): Promise<Post | null> => {
  try {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.author !== undefined) updateData.author = input.author;
    if (input.tags !== undefined) updateData.tags = input.tags;

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      author: data.author,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      viewCount: data.view_count,
      commentCount: data.comment_count,
      tags: data.tags,
    };
  } catch (error) {
    console.error('Failed to update post:', error);
    return null;
  }
};

export const deletePost = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Delete associated comments
    await deleteCommentsByPostId(id);
    return true;
  } catch (error) {
    console.error('Failed to delete post:', error);
    return false;
  }
};

export const incrementPostViewCount = async (id: string): Promise<void> => {
  try {
    const { data: post } = await supabase
      .from('posts')
      .select('view_count')
      .eq('id', id)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ view_count: (post.view_count || 0) + 1 })
        .eq('id', id);
    }
  } catch (error) {
    console.error('Failed to increment view count:', error);
  }
};

// Comments Operations
export const getComments = async (): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      postId: row.post_id,
      author: row.author,
      content: row.content,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  } catch (error) {
    console.error('Failed to read comments:', error);
    return [];
  }
};

export const getCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      postId: row.post_id,
      author: row.author,
      content: row.content,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  } catch (error) {
    console.error('Failed to get comments by post id:', error);
    return [];
  }
};

export const createComment = async (input: CreateCommentInput): Promise<Comment> => {
  try {
    // Create comment
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: input.postId,
          author: input.author,
          content: input.content,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update post comment count
    const { data: post } = await supabase
      .from('posts')
      .select('comment_count')
      .eq('id', input.postId)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ comment_count: (post.comment_count || 0) + 1 })
        .eq('id', input.postId);
    }

    return {
      id: data.id,
      postId: data.post_id,
      author: data.author,
      content: data.content,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Failed to create comment:', error);
    throw error;
  }
};

export const deleteComment = async (id: string): Promise<boolean> => {
  try {
    // Get comment to find post_id
    const { data: comment } = await supabase
      .from('comments')
      .select('post_id')
      .eq('id', id)
      .single();

    if (!comment) return false;

    // Delete comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Update post comment count
    const { data: post } = await supabase
      .from('posts')
      .select('comment_count')
      .eq('id', comment.post_id)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ comment_count: Math.max(0, (post.comment_count || 0) - 1) })
        .eq('id', comment.post_id);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return false;
  }
};

export const deleteCommentsByPostId = async (postId: string): Promise<void> => {
  try {
    await supabase
      .from('comments')
      .delete()
      .eq('post_id', postId);
  } catch (error) {
    console.error('Failed to delete comments by post id:', error);
  }
};

// Search
export const searchPosts = async (query: string): Promise<Post[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,author.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      author: row.author,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      viewCount: row.view_count || 0,
      commentCount: row.comment_count || 0,
      tags: row.tags || [],
    }));
  } catch (error) {
    console.error('Failed to search posts:', error);
    return [];
  }
};
