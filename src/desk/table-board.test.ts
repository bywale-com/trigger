import { describe, expect, it } from "vitest";
import { COLUMN_BASE, columnLimit } from "./TableView.tsx";

describe("columnLimit", () => {
  it("holds the designed width", () => {
    expect(columnLimit(COLUMN_BASE.name, COLUMN_BASE.name)).toBe(220);
    expect(columnLimit(COLUMN_BASE.updated, COLUMN_BASE.updated)).toBe(84);
  });

  it("allows only a small drag past the designed width", () => {
    expect(columnLimit(220, 400)).toBe(253);
    expect(columnLimit(220, 10)).toBe(187);
    expect(columnLimit(84, 200)).toBe(97);
    expect(columnLimit(84, 1)).toBe(71);
  });
});
