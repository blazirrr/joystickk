import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { posts, comments, postVotes, communities, users } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const forumRouter = router({
  // Get all posts with related data
  getPosts: publicProcedure
    .input(z.object({ communityId: z.number().optional(), limit: z.number().default(20) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(input?.limit || 20);
      
      // Enrich posts with related data
      const enrichedPosts = await Promise.all(
        allPosts.map(async (post) => {
          const author = await db.select().from(users).where(eq(users.id, post.authorId)).limit(1);
          const community = await db.select().from(communities).where(eq(communities.id, post.communityId)).limit(1);
          const postComments = await db.select().from(comments).where(eq(comments.postId, post.id));
          const votes = await db.select().from(postVotes).where(eq(postVotes.postId, post.id));
          const upvotes = votes.filter(v => v.voteType === "upvote").length;
          const downvotes = votes.filter(v => v.voteType === "downvote").length;

          return {
            ...post,
            author: author[0] || null,
            community: community[0] || null,
            commentCount: postComments.length,
            upvotes,
            downvotes,
          };
        })
      );

      return enrichedPosts;
    }),

  // Get single post with comments
  getPost: publicProcedure
    .input(z.number())
    .query(async ({ input: postId }) => {
      const db = await getDb();
      if (!db) return null;

      const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
      if (!post.length) return null;

      const author = await db.select().from(users).where(eq(users.id, post[0].authorId)).limit(1);
      const community = await db.select().from(communities).where(eq(communities.id, post[0].communityId)).limit(1);
      const postComments = await db.select().from(comments).where(eq(comments.postId, postId));
      const votes = await db.select().from(postVotes).where(eq(postVotes.postId, postId));

      return {
        ...post[0],
        author: author[0] || null,
        community: community[0] || null,
        comments: postComments,
        upvotes: votes.filter(v => v.voteType === "upvote").length,
        downvotes: votes.filter(v => v.voteType === "downvote").length,
      };
    }),

  // Create post
  createPost: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(200),
        content: z.string().min(10).max(5000),
        communityId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(posts).values({
        title: input.title,
        content: input.content,
        communityId: input.communityId,
        authorId: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true };
    }),

  // Create comment
  createComment: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1).max(2000),
        parentCommentId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(comments).values({
        postId: input.postId,
        authorId: ctx.user.id,
        content: input.content,
        parentCommentId: input.parentCommentId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true };
    }),

  // Vote on post
  votePost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        voteType: z.enum(["upvote", "downvote"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if user already voted
      const existingVote = await db
        .select()
        .from(postVotes)
        .where(
          and(
            eq(postVotes.postId, input.postId),
            eq(postVotes.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existingVote.length > 0) {
        // Update existing vote - just delete and recreate
        await db
          .delete(postVotes)
          .where(
            and(
              eq(postVotes.postId, input.postId),
              eq(postVotes.userId, ctx.user.id)
            )
          );
      }

      // Create new vote
      await db.insert(postVotes).values({
        postId: input.postId,
        userId: ctx.user.id,
        voteType: input.voteType,
        createdAt: new Date(),
      });

      return { success: true };
    }),

  // Get post votes
  getPostVotes: publicProcedure
    .input(z.number())
    .query(async ({ input: postId }) => {
      const db = await getDb();
      if (!db) return { upvotes: 0, downvotes: 0 };

      const allVotes = await db.select().from(postVotes).where(eq(postVotes.postId, postId));
      const upvotes = allVotes.filter((v) => v.voteType === "upvote").length;
      const downvotes = allVotes.filter((v) => v.voteType === "downvote").length;

      return { upvotes, downvotes };
    }),

  // Get post comments with author info
  getPostComments: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const allComments = await db.select().from(comments).where(eq(comments.postId, input.postId));
      
      const enrichedComments = await Promise.all(
        allComments.map(async (comment) => {
          const author = await db.select().from(users).where(eq(users.id, comment.authorId)).limit(1);
          return {
            ...comment,
            author: author[0] || null,
          };
        })
      );

      return enrichedComments;
    }),

  // Get communities
  getCommunities: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(communities);
  }),

  // Get single community
  getCommunity: publicProcedure
    .input(z.string())
    .query(async ({ input: slug }) => {
      const db = await getDb();
      if (!db) return null;
      const community = await db.select().from(communities).where(eq(communities.slug, slug)).limit(1);
      return community.length > 0 ? community[0] : null;
    }),

  // Get community posts
  getCommunityPosts: publicProcedure
    .input(z.string())
    .query(async ({ input: slug }) => {
      const db = await getDb();
      if (!db) return [];

      const community = await db.select().from(communities).where(eq(communities.slug, slug)).limit(1);
      if (!community.length) return [];

      const communityPosts = await db
        .select()
        .from(posts)
        .where(eq(posts.communityId, community[0].id))
        .orderBy(desc(posts.createdAt));

      const enrichedPosts = await Promise.all(
        communityPosts.map(async (post) => {
          const author = await db.select().from(users).where(eq(users.id, post.authorId)).limit(1);
          const postComments = await db.select().from(comments).where(eq(comments.postId, post.id));
          const votes = await db.select().from(postVotes).where(eq(postVotes.postId, post.id));

          return {
            ...post,
            author: author[0] || null,
            community: community[0],
            commentCount: postComments.length,
            upvotes: votes.filter(v => v.voteType === "upvote").length,
            downvotes: votes.filter(v => v.voteType === "downvote").length,
          };
        })
      );

      return enrichedPosts;
    }),

  // Update post
  updatePost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        title: z.string().min(3).max(200),
        content: z.string().min(10).max(5000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if user is the author
      const post = await db.select().from(posts).where(eq(posts.id, input.postId)).limit(1);
      if (!post.length || post[0].authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own posts' });
      }

      await db.update(posts).set({
        title: input.title,
        content: input.content,
        updatedAt: new Date(),
      }).where(eq(posts.id, input.postId));

      return { success: true };
    }),

  // Delete post
  deletePost: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: postId, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if user is the author
      const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
      if (!post.length || post[0].authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own posts' });
      }

      // Delete all comments first
      await db.delete(comments).where(eq(comments.postId, postId));
      // Delete all votes
      await db.delete(postVotes).where(eq(postVotes.postId, postId));
      // Delete the post
      await db.delete(posts).where(eq(posts.id, postId));

      return { success: true };
    }),

  // Update comment
  updateComment: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        content: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if user is the author
      const comment = await db.select().from(comments).where(eq(comments.id, input.commentId)).limit(1);
      if (!comment.length || comment[0].authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own comments' });
      }

      await db.update(comments).set({
        content: input.content,
        updatedAt: new Date(),
      }).where(eq(comments.id, input.commentId));

      return { success: true };
    }),

  // Delete comment
  deleteComment: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: commentId, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if user is the author
      const comment = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
      if (!comment.length || comment[0].authorId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own comments' });
      }

      await db.delete(comments).where(eq(comments.id, commentId));

      return { success: true };
    }),

  // Vote on comment
  voteComment: protectedProcedure
    .input(
      z.object({
        commentId: z.number(),
        voteType: z.enum(["upvote", "downvote"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if comment exists
      const comment = await db.select().from(comments).where(eq(comments.id, input.commentId)).limit(1);
      if (!comment.length) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Comment not found' });
      }

      // For now, just update the vote counts on the comment
      // In a real app, you'd track individual votes
      if (input.voteType === 'upvote') {
        await db.update(comments).set({
          upvotes: comment[0].upvotes + 1,
        }).where(eq(comments.id, input.commentId));
      } else {
        await db.update(comments).set({
          downvotes: comment[0].downvotes + 1,
        }).where(eq(comments.id, input.commentId));
      }

      return { success: true };
    }),

  // Create community
  createCommunity: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(50),
        slug: z.string().min(3).max(50),
        description: z.string().max(500),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if slug already exists
      const existing = await db.select().from(communities).where(eq(communities.slug, input.slug)).limit(1);
      if (existing.length > 0) {
        throw new Error("Community slug already exists");
      }

      await db.insert(communities).values({
        name: input.name,
        slug: input.slug,
        description: input.description,
        creatorId: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true };
    }),
});
