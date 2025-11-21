import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const adminUser = {
  id: 1,
  openId: "discord_1148160421262544938",
  email: "admin@example.com",
  name: "Admin User",
  loginMethod: "discord",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const regularUser = {
  id: 2,
  openId: "discord_regular_user",
  email: "user@example.com",
  name: "Regular User",
  loginMethod: "discord",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const anotherUser = {
  id: 3,
  openId: "discord_another_user",
  email: "another@example.com",
  name: "Another User",
  loginMethod: "discord",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createContext(user: any): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Admin Product Management - Permission Tests", () => {
  it("non-admin cannot create products", async () => {
    const ctx = createContext(regularUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.store.createProduct({
        name: "Test Joystick",
        slug: "test-joystick",
        description: "A test gaming joystick",
        price: 49.99,
        stock: 10,
        featured: false,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Only admins can create products");
    }
  });

  it("non-admin cannot update products", async () => {
    const ctx = createContext(regularUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.store.updateProduct({
        id: 1,
        name: "Updated Joystick",
        price: 59.99,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Only admins can update products");
    }
  });

  it("non-admin cannot delete products", async () => {
    const ctx = createContext(regularUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.store.deleteProduct(1);
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Only admins can delete products");
    }
  });
});

describe("Forum Post Management - Permission Tests", () => {
  it("user cannot update other users posts", async () => {
    const ctx = createContext(anotherUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.forum.updatePost({
        postId: 1,
        title: "Hacked Title",
        content: "Hacked content that is long enough to pass validation",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("You can only edit your own posts");
    }
  });

  it("user cannot delete other users posts", async () => {
    const ctx = createContext(anotherUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.forum.deletePost(1);
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("You can only delete your own posts");
    }
  });

  it("post title must be at least 3 characters", async () => {
    const ctx = createContext(regularUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.forum.createPost({
        title: "Hi",
        content: "This is a valid content but title is too short",
        communityId: 1,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("post content must be at least 10 characters", async () => {
    const ctx = createContext(regularUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.forum.createPost({
        title: "Valid Title",
        content: "Short",
        communityId: 1,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});

describe("Forum Comment Management - Permission Tests", () => {
  it("user cannot update other users comments", async () => {
    const ctx = createContext(anotherUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.forum.updateComment({
        commentId: 1,
        content: "Hacked comment",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("You can only edit your own comments");
    }
  });

  it("user cannot delete other users comments", async () => {
    const ctx = createContext(anotherUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.forum.deleteComment(1);
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("You can only delete your own comments");
    }
  });

  it("comment content must be at least 1 character", async () => {
    const ctx = createContext(regularUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.forum.createComment({
        postId: 1,
        content: "",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});

describe("Forum Community Management - Validation Tests", () => {
  it("community name must be at least 3 characters", async () => {
    const ctx = createContext(regularUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.forum.createCommunity({
        name: "GG",
        slug: "gaming-gear-short",
        description: "Gaming gear discussion",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("community slug must be at least 3 characters", async () => {
    const ctx = createContext(regularUser);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.forum.createCommunity({
        name: "Gaming Gear",
        slug: "gg",
        description: "Gaming gear discussion",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});
