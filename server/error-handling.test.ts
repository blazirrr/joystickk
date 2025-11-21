import { describe, it, expect } from "vitest";
import { parseValidationError, getAllValidationErrors } from "../client/src/lib/errorParser";

describe("Error Parser - parseValidationError", () => {
  it("handles null/undefined errors gracefully", () => {
    expect(parseValidationError(null)).toBe("An error occurred");
    expect(parseValidationError(undefined)).toBe("An error occurred");
  });

  it("extracts field errors from tRPC validation error", () => {
    const error = {
      cause: {
        fieldErrors: {
          title: ["String must contain at least 3 characters"],
        },
      },
    };
    const result = parseValidationError(error);
    expect(result).toContain("Title");
    expect(result).toMatch(/3|too short/);
  });

  it("handles 'too short' validation errors", () => {
    const error = {
      cause: {
        fieldErrors: {
          content: ["String must contain at least 10 characters"],
        },
      },
    };
    const result = parseValidationError(error);
    expect(result).toMatch(/too short|minimum/);
    expect(result).toMatch(/10/);
  });

  it("handles 'too long' validation errors", () => {
    const error = {
      cause: {
        fieldErrors: {
          title: ["String must contain at most 200 characters"],
        },
      },
    };
    const result = parseValidationError(error);
    expect(result).toMatch(/too long|maximum/);
    expect(result).toMatch(/200/);
  });

  it("handles 'required' validation errors", () => {
    const error = {
      cause: {
        fieldErrors: {
          name: ["Required"],
        },
      },
    };
    const result = parseValidationError(error);
    expect(result).toContain("required");
  });

  it("handles 'expected number' validation errors", () => {
    const error = {
      cause: {
        fieldErrors: {
          price: ["Expected number"],
        },
      },
    };
    const result = parseValidationError(error);
    expect(result).toContain("number");
  });

  it("formats camelCase field names to readable format", () => {
    const error = {
      cause: {
        fieldErrors: {
          postTitle: ["String must contain at least 3 characters"],
        },
      },
    };
    const result = parseValidationError(error);
    expect(result).toContain("Post Title");
  });

  it("handles direct error messages", () => {
    const error = {
      message: "Custom error message",
    };
    const result = parseValidationError(error);
    expect(result).toBe("Custom error message");
  });

  it("returns generic error message for unknown errors", () => {
    const error = {};
    const result = parseValidationError(error);
    expect(result).toContain("Validation failed");
  });
});

describe("Error Parser - getAllValidationErrors", () => {
  it("returns empty object when no errors", () => {
    const result = getAllValidationErrors(null);
    expect(result).toEqual({});
  });

  it("extracts multiple field errors", () => {
    const error = {
      cause: {
        fieldErrors: {
          title: ["String must contain at least 3 characters"],
          content: ["String must contain at least 10 characters"],
          communityId: ["Required"],
        },
      },
    };
    const result = getAllValidationErrors(error);
    expect(Object.keys(result)).toHaveLength(3);
    expect(result.title).toContain("too short");
    expect(result.content).toContain("too short");
    expect(result.communityId).toContain("required");
  });

  it("handles partial field errors", () => {
    const error = {
      cause: {
        fieldErrors: {
          title: ["String must contain at least 3 characters"],
          content: [],
        },
      },
    };
    const result = getAllValidationErrors(error);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result.title).toBeDefined();
    expect(result.content).toBeUndefined();
  });
});

describe("Validation Error Messages - Post Creation", () => {
  it("displays error for post title too short", () => {
    const error = {
      cause: {
        fieldErrors: {
          title: ["String must contain at least 3 characters"],
        },
      },
    };
    const result = parseValidationError(error);
    expect(result).toMatch(/title/i);
    expect(result).toMatch(/3/);
  });

  it("displays error for post content too short", () => {
    const error = {
      cause: {
        fieldErrors: {
          content: ["String must contain at least 10 characters"],
        },
      },
    };
    const result = parseValidationError(error);
    expect(result).toMatch(/content/i);
    expect(result).toMatch(/10/);
  });

  it("displays error for missing community", () => {
    const error = {
      cause: {
        fieldErrors: {
          communityId: ["Required"],
        },
      },
    };
    const result = parseValidationError(error);
    expect(result).toMatch(/community/i);
    expect(result).toMatch(/required/i);
  });
});

describe("Validation Error Messages - Comment Creation", () => {
  it("displays error for comment too short", () => {
    const error = {
      cause: {
        fieldErrors: {
          content: ["String must contain at least 1 characters"],
        },
      },
    };
    const result = parseValidationError(error);
    expect(result).toMatch(/content/i);
  });

  it("displays error for comment too long", () => {
    const error = {
      cause: {
        fieldErrors: {
          content: ["String must contain at most 5000 characters"],
        },
      },
    };
    const result = parseValidationError(error);
    expect(result).toMatch(/content/i);
    expect(result).toMatch(/5000/);
  });
});

describe("Validation Error Messages - Product Management", () => {
  it("displays error for product name required", () => {
    const error = {
      cause: {
        fieldErrors: {
          name: ["Required"],
        },
      },
    };
    const result = parseValidationError(error);
    expect(result).toMatch(/name/i);
    expect(result).toMatch(/required/i);
  });

  it("displays error for invalid price", () => {
    const error = {
      cause: {
        fieldErrors: {
          price: ["Expected number"],
        },
      },
    };
    const result = parseValidationError(error);
    expect(result).toMatch(/price/i);
    expect(result).toMatch(/number/i);
  });
});
