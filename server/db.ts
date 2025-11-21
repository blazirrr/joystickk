import { eq, desc, gte, lte, like, or, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, products, cartItems, orders, orderItems, communities, posts, comments, InsertCategory, InsertProduct, InsertCartItem, InsertOrder, InsertOrderItem, InsertCommunity, InsertPost, InsertComment } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user last signed in:", error);
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values(user);
  return result;
}

// Category operations
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(category);
  return result;
}

// Product operations
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getFeaturedProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.featured, true)).limit(6);
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.categoryId, categoryId));
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product);
  return result;
}

export async function updateProduct(id: number, updates: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(products).set(updates).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(products).where(eq(products.id, id));
}

// Search and filter operations
export async function searchProducts({
  query,
  minPrice,
  maxPrice,
  categoryId,
  featured,
}: {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  featured?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];

  if (query) {
    const searchTerm = `%${query}%`;
    conditions.push(
      or(
        like(products.name, searchTerm),
        like(products.description, searchTerm),
        like(products.slug, searchTerm)
      )
    );
  }

  if (minPrice !== undefined) {
    conditions.push(gte(products.price, minPrice));
  }

  if (maxPrice !== undefined) {
    conditions.push(lte(products.price, maxPrice));
  }

  if (categoryId !== undefined) {
    conditions.push(eq(products.categoryId, categoryId));
  }

  if (featured !== undefined) {
    conditions.push(eq(products.featured, featured));
  }

  let query_obj: any = db.select().from(products);
  if (conditions.length > 0) {
    query_obj = query_obj.where(and(...conditions));
  }

  return query_obj.orderBy(desc(products.createdAt));
}

export async function searchPosts({
  query,
  communityId,
  authorId,
  sortBy = "recent",
}: {
  query?: string;
  communityId?: number;
  authorId?: number;
  sortBy?: "recent" | "trending" | "top";
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];

  if (query) {
    const searchTerm = `%${query}%`;
    conditions.push(
      or(
        like(posts.title, searchTerm),
        like(posts.content, searchTerm)
      )
    );
  }

  if (communityId !== undefined) {
    conditions.push(eq(posts.communityId, communityId));
  }

  if (authorId !== undefined) {
    conditions.push(eq(posts.authorId, authorId));
  }

  let query_obj: any = db.select().from(posts);
  if (conditions.length > 0) {
    query_obj = query_obj.where(and(...conditions));
  }

  // Sort by the specified criteria
  if (sortBy === "trending") {
    return query_obj.orderBy(desc(posts.upvotes), desc(posts.createdAt));
  } else if (sortBy === "top") {
    return query_obj.orderBy(desc(posts.upvotes));
  } else {
    return query_obj.orderBy(desc(posts.createdAt));
  }
}

export async function searchCommunities({
  query,
}: {
  query?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  if (!query) {
    return db.select().from(communities).orderBy(desc(communities.memberCount));
  }

  const searchTerm = `%${query}%`;
  return db
    .select()
    .from(communities)
    .where(
      or(
        like(communities.name, searchTerm),
        like(communities.description, searchTerm),
        like(communities.slug, searchTerm)
      )
    )
    .orderBy(desc(communities.memberCount));
}

// Cart operations
export async function getCartByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      product: products,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));
  
  return result;
}

export async function addToCart(item: InsertCartItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if item already exists in cart
  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId)))
    .limit(1);
  
  if (existing.length > 0) {
    // Update quantity
    return db
      .update(cartItems)
      .set({ quantity: sql`${cartItems.quantity} + ${item.quantity}` })
      .where(eq(cartItems.id, existing[0]!.id));
  } else {
    // Insert new item
    return db.insert(cartItems).values(item);
  }
}

export async function updateCartItemQuantity(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (quantity <= 0) {
    return db.delete(cartItems).where(eq(cartItems.id, id));
  }
  
  return db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
}

export async function removeFromCart(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// Order operations
export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  return result;
}

export async function createOrderItem(item: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orderItems).values(item);
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function updateOrderStatus(id: number, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set({ status }).where(eq(orders.id, id));
}

// Forum Community operations
export async function getAllCommunities() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(communities).orderBy(desc(communities.createdAt));
}

export async function getCommunityBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(communities).where(eq(communities.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCommunity(community: InsertCommunity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(communities).values(community);
}

// Forum Post operations
export async function getPostsByCommunity(communityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(posts).where(eq(posts.communityId, communityId)).orderBy(desc(posts.createdAt));
}

export async function getForumPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createForumPost(post: InsertPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(posts).values(post);
}

export async function updateForumPost(id: number, updates: Partial<InsertPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(posts).set(updates).where(eq(posts.id, id));
}

export async function deleteForumPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(posts).where(eq(posts.id, id));
}

// Forum Comment operations
export async function getCommentsByPost(postId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
}

export async function createForumComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(comments).values(comment);
}

export async function updateForumComment(id: number, updates: Partial<InsertComment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(comments).set(updates).where(eq(comments.id, id));
}

export async function deleteForumComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(comments).where(eq(comments.id, id));
}

// Autocomplete functions
export async function autocompleteProducts(query: string, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  if (!query || query.length < 1) return [];

  const searchTerm = `${query}%`;
  const results: any = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
    })
    .from(products)
    .where(like(products.name, searchTerm))
    .limit(limit);

  return results;
}

export async function autocompletePosts(query: string, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  if (!query || query.length < 1) return [];

  const searchTerm = `${query}%`;
  const results: any = await db
    .select({
      id: posts.id,
      title: posts.title,
      communityId: posts.communityId,
      upvotes: posts.upvotes,
    })
    .from(posts)
    .where(like(posts.title, searchTerm))
    .limit(limit);

  return results;
}

export async function autocompleteCommunities(query: string, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  if (!query || query.length < 1) return [];

  const searchTerm = `${query}%`;
  const results: any = await db
    .select({
      id: communities.id,
      name: communities.name,
      slug: communities.slug,
      memberCount: communities.memberCount,
    })
    .from(communities)
    .where(like(communities.name, searchTerm))
    .limit(limit);

  return results;
}
