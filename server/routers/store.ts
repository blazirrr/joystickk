import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products, orders, orderItems } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const storeRouter = router({
  // Get all products
  getProducts: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const whereCondition = input?.category ? eq(products.categoryId, parseInt(input.category)) : undefined;
      const query = whereCondition 
        ? db.select().from(products).where(whereCondition).orderBy(desc(products.createdAt)).limit(input?.limit || 20).offset(input?.offset || 0)
        : db.select().from(products).orderBy(desc(products.createdAt)).limit(input?.limit || 20).offset(input?.offset || 0);
      return query;
    }),

  // Get single product
  getProduct: publicProcedure
    .input(z.string())
    .query(async ({ input: slug }) => {
      const db = await getDb();
      if (!db) return null;

      const product = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
      return product.length > 0 ? product[0] : null;
    }),

  // Create checkout session
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().min(1),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get product details
      const productIds = input.items.map((item) => item.productId);
      const productList = await db.select().from(products).where(eq(products.id, productIds[0]));

      if (!productList.length) {
        throw new Error("Products not found");
      }

      // Create line items for Stripe
      const lineItems = input.items.map((item) => {
        const product = productList.find((p) => p.id === item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: product.imageUrl ? [product.imageUrl] : undefined,
            },
            unit_amount: Math.round(product.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        };
      });

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
        },
        success_url: `${ctx.req.headers.origin}/checkout?success=true`,
        cancel_url: `${ctx.req.headers.origin}/cart`,
        allow_promotion_codes: true,
      });

      return { sessionUrl: session.url };
    }),

  // Get user orders
  getOrders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const userOrders = await db.select().from(orders).where(eq(orders.userId, ctx.user.id)).orderBy(desc(orders.createdAt));
    return userOrders;
  }),

  // Get order details
  getOrder: protectedProcedure
    .input(z.number())
    .query(async ({ input: orderId, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (!order.length || order[0].userId !== ctx.user.id) {
        throw new Error("Order not found");
      }

      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      return { ...order[0], items };
    }),
});
