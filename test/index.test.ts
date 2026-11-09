import { describe, expect, it } from "vitest";
import * as index from "../src/index.js";

describe("index exports", () => {
  it("exports all public functions and classes", () => {
    expect(typeof index.parseEntries).toBe("function");
    expect(typeof index.unreadCount).toBe("function");
    expect(typeof index.renderWidget).toBe("function");
    expect(typeof index.createWidgetState).toBe("function");
    expect(typeof index.WidgetError).toBe("function");
  });
});
