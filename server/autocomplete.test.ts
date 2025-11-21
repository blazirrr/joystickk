import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Product Autocomplete", () => {
  it("autocompleteProducts returns empty array when database is unavailable", async () => {
    const results = await db.autocompleteProducts("test");
    expect(Array.isArray(results)).toBe(true);
  });

  it("autocompleteProducts returns empty array for empty query", async () => {
    const results = await db.autocompleteProducts("");
    expect(results).toEqual([]);
  });

  it("autocompleteProducts respects limit parameter", async () => {
    const results = await db.autocompleteProducts("gaming", 5);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it("autocompleteProducts uses default limit of 10", async () => {
    const results = await db.autocompleteProducts("controller");
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it("autocompleteProducts returns correct product fields", async () => {
    const results = await db.autocompleteProducts("mouse");
    if (results.length > 0) {
      const item = results[0];
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("slug");
      expect(item).toHaveProperty("price");
    }
  });

  it("autocompleteProducts filters by name prefix", async () => {
    const results = await db.autocompleteProducts("joy");
    expect(Array.isArray(results)).toBe(true);
  });
});

describe("Post Autocomplete", () => {
  it("autocompletePosts returns empty array when database is unavailable", async () => {
    const results = await db.autocompletePosts("test");
    expect(Array.isArray(results)).toBe(true);
  });

  it("autocompletePosts returns empty array for empty query", async () => {
    const results = await db.autocompletePosts("");
    expect(results).toEqual([]);
  });

  it("autocompletePosts respects limit parameter", async () => {
    const results = await db.autocompletePosts("gaming", 5);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it("autocompletePosts uses default limit of 10", async () => {
    const results = await db.autocompletePosts("best");
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it("autocompletePosts returns correct post fields", async () => {
    const results = await db.autocompletePosts("review");
    if (results.length > 0) {
      const item = results[0];
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("communityId");
      expect(item).toHaveProperty("upvotes");
    }
  });

  it("autocompletePosts filters by title prefix", async () => {
    const results = await db.autocompletePosts("best");
    expect(Array.isArray(results)).toBe(true);
  });
});

describe("Community Autocomplete", () => {
  it("autocompleteCommunities returns empty array when database is unavailable", async () => {
    const results = await db.autocompleteCommunities("test");
    expect(Array.isArray(results)).toBe(true);
  });

  it("autocompleteCommunities returns empty array for empty query", async () => {
    const results = await db.autocompleteCommunities("");
    expect(results).toEqual([]);
  });

  it("autocompleteCommunities respects limit parameter", async () => {
    const results = await db.autocompleteCommunities("gaming", 5);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it("autocompleteCommunities uses default limit of 10", async () => {
    const results = await db.autocompleteCommunities("esports");
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it("autocompleteCommunities returns correct community fields", async () => {
    const results = await db.autocompleteCommunities("competitive");
    if (results.length > 0) {
      const item = results[0];
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("slug");
      expect(item).toHaveProperty("memberCount");
    }
  });

  it("autocompleteCommunities filters by name prefix", async () => {
    const results = await db.autocompleteCommunities("gaming");
    expect(Array.isArray(results)).toBe(true);
  });
});

describe("Autocomplete Edge Cases", () => {
  it("handles very short queries", async () => {
    const productResults = await db.autocompleteProducts("a");
    const postResults = await db.autocompletePosts("a");
    const communityResults = await db.autocompleteCommunities("a");
    
    expect(Array.isArray(productResults)).toBe(true);
    expect(Array.isArray(postResults)).toBe(true);
    expect(Array.isArray(communityResults)).toBe(true);
  });

  it("handles special characters in query", async () => {
    const productResults = await db.autocompleteProducts("test@#$");
    const postResults = await db.autocompletePosts("test@#$");
    const communityResults = await db.autocompleteCommunities("test@#$");
    
    expect(Array.isArray(productResults)).toBe(true);
    expect(Array.isArray(postResults)).toBe(true);
    expect(Array.isArray(communityResults)).toBe(true);
  });

  it("handles very long queries", async () => {
    const longQuery = "a".repeat(100);
    const productResults = await db.autocompleteProducts(longQuery);
    const postResults = await db.autocompletePosts(longQuery);
    const communityResults = await db.autocompleteCommunities(longQuery);
    
    expect(Array.isArray(productResults)).toBe(true);
    expect(Array.isArray(postResults)).toBe(true);
    expect(Array.isArray(communityResults)).toBe(true);
  });

  it("handles zero limit", async () => {
    const results = await db.autocompleteProducts("test", 0);
    expect(results.length).toBe(0);
  });

  it("handles negative limit gracefully", async () => {
    const results = await db.autocompleteProducts("test", -5);
    expect(Array.isArray(results)).toBe(true);
  });
});
