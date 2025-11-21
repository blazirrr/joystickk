import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { forumRouter } from "./routers/forum";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Forum procedures (merged with search)
  forum: router({
    // Original forum procedures
    getPosts: forumRouter.getPosts,
    getPost: forumRouter.getPost,
    createPost: forumRouter.createPost,
    createComment: forumRouter.createComment,
    votePost: forumRouter.votePost,
    getPostVotes: forumRouter.getPostVotes,
    getPostComments: forumRouter.getPostComments,
    getCommunities: forumRouter.getCommunities,
    getCommunity: forumRouter.getCommunity,
    getCommunityPosts: forumRouter.getCommunityPosts,
    updatePost: forumRouter.updatePost,
    deletePost: forumRouter.deletePost,
    updateComment: forumRouter.updateComment,
    deleteComment: forumRouter.deleteComment,
    voteComment: forumRouter.voteComment,
    createCommunity: forumRouter.createCommunity,
    // New search procedures
    searchPosts: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
          communityId: z.number().optional(),
          authorId: z.number().optional(),
          sortBy: z.enum(["recent", "trending", "top"]).optional(),
        })
      )
      .query(async ({ input }) => {
        return db.searchPosts({
          query: input.query,
          communityId: input.communityId,
          authorId: input.authorId,
          sortBy: input.sortBy || "recent",
        });
      }),
    searchCommunities: publicProcedure
      .input(z.object({ query: z.string().optional() }))
      .query(async ({ input }) => {
        return db.searchCommunities({ query: input.query });
      }),
    autocompletePosts: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.autocompletePosts(input.query, input.limit || 10);
      }),
    autocompleteCommunities: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.autocompleteCommunities(input.query, input.limit || 10);
      }),
  }),

  // Store procedures
  store: router({
    // Products
    getFeaturedProducts: publicProcedure.query(async () => {
      return db.getFeaturedProducts();
    }),

    getAllProducts: publicProcedure.query(async () => {
      return db.getAllProducts();
    }),

    getProductBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getProductBySlug(input.slug);
      }),

    getProductsByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return db.getProductsByCategory(input.categoryId);
      }),

    getCategories: publicProcedure.query(async () => {
      return db.getAllCategories();
    }),

    searchProducts: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          categoryId: z.number().optional(),
          featured: z.boolean().optional(),
        })
      )
      .query(async ({ input }) => {
        const results = await db.searchProducts(input);
        return results;
      }),

    autocompleteProducts: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.autocompleteProducts(input.query, input.limit || 10);
      }),

    // Cart
    getCart: protectedProcedure.query(async ({ ctx }) => {
      return db.getCartByUserId(ctx.user.id);
    }),

    addToCart: protectedProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().min(1) }))
      .mutation(async ({ ctx, input }) => {
        return db.addToCart({
          userId: ctx.user.id,
          productId: input.productId,
          quantity: input.quantity,
        });
      }),

    updateCartItem: protectedProcedure
      .input(z.object({ cartItemId: z.number(), quantity: z.number().min(0) }))
      .mutation(async ({ input }) => {
        return db.updateCartItemQuantity(input.cartItemId, input.quantity);
      }),

    removeFromCart: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input }) => {
        return db.removeFromCart(input.cartItemId);
      }),

    clearCart: protectedProcedure.mutation(async ({ ctx }) => {
      const result = await db.clearCart(ctx.user.id);
      return result;
    }),

    // Orders
    createOrder: protectedProcedure
      .input(z.object({ totalAmount: z.number(), shippingAddress: z.string(), customerName: z.string(), customerEmail: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return db.createOrder({
          userId: ctx.user.id,
          totalAmount: input.totalAmount,
          shippingAddress: input.shippingAddress,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
        });
      }),

    getOrders: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrdersByUserId(ctx.user.id);
    }),

    // Admin procedures
    createProduct: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
          price: z.number().positive(),
          stock: z.number().nonnegative(),
          featured: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can create products");
        }
        return db.createProduct(input);
      }),

    updateProduct: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          price: z.number().optional(),
          stock: z.number().optional(),
          featured: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can update products");
        }
        const { id, ...updates } = input;
        return db.updateProduct(id, updates);
      }),

    deleteProduct: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input: productId }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can delete products");
        }
        return db.deleteProduct(productId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
