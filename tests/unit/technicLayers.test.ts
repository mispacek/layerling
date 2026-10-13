import { describe, expect, it } from "vitest";
import { appendTechnicLayer, removeTechnicLayer } from "@/lib/technicLayers";
import { initialTechnicRecipe, technicBounds, technicCorners, technicLayerRecipe, technicPattern, validTechnicRecipe } from "@/lib/technicRecipe";
import { technicRectangle, transformTechnicSelection } from "@/lib/technicSelection";

describe("multi-floor Lego recipes", () => {
  it("reads old recipes without modifying their coordinates or dimensions", () => {
    const r = initialTechnicRecipe();
    expect(validTechnicRecipe(r)).toBe(true);
    expect(technicBounds(r)).toMatchObject({ height: 8, baseY: 0, minLayer: 0, maxLayer: 0 });
    expect(technicLayerRecipe(r, 0).cells).toEqual(r.cells);
  });
  it("duplicates a floor with its types, orientations, tolerances and individual rounding", () => {
    const r = initialTechnicRecipe(); r.cells[0] = { ...r.cells[0], axis: "X", rounding: "outer", holeOffset: 0.1 };
    const next = appendTechnicLayer(r, 0)!;
    expect(validTechnicRecipe(next)).toBe(true); expect(next.version).toBe(2); expect(next.layerCount).toBe(2);
    expect(next.cells).toHaveLength(40);
    expect(next.cells[20]).toEqual({ ...r.cells[0], z: 1 });
    expect(r.cells).toHaveLength(20);
    expect(technicBounds(next)).toMatchObject({ height: 16, centerY: 8 });
    expect(technicPattern(technicLayerRecipe(next, 1))).toBe(technicPattern(r));
  });
  it("keeps empty floors, permits equal XY on different floors, and lowers only higher floors on removal", () => {
    const r = appendTechnicLayer(appendTechnicLayer(initialTechnicRecipe())!, 0)!;
    expect(r.layerCount).toBe(3); expect(r.cells[20].z).toBe(2);
    const next = removeTechnicLayer(r, 1)!;
    expect(next.layerCount).toBe(2); expect(next.cells[20].z).toBe(1); expect(next.cells[0]).toEqual(r.cells[0]);
    expect(technicBounds(next).height).toBe(16);
  });
  it("rejects missing layer count, invalid floor coordinates, duplicates and excessive counts", () => {
    const r = appendTechnicLayer(initialTechnicRecipe(), 0)!;
    for (const invalid of [{ ...r, version: 3 }, { ...r, layerCount: undefined }, { ...r, layerCount: 33 },
      { ...r, version: 1 }, { ...r, cells: [...r.cells, r.cells[0]] },
      ...[-1, 2, 0.5, NaN, null].map(z => ({ ...r, cells: [{ ...r.cells[0], z }] }))]) expect(validTechnicRecipe(invalid)).toBe(false);
    expect(appendTechnicLayer({ ...r, layerCount: 32 })).toBeNull();
    expect(appendTechnicLayer({ ...r, cells: Array.from({ length: 256 }, (_, x) => ({ ...r.cells[0], x: x - 128 })) }, 0)).toBeNull();
    expect(removeTechnicLayer(initialTechnicRecipe(), 0)).toBeNull();
  });
  it("selects, moves and copies only cells in the active floor, including positions occupied below", () => {
    const r = appendTechnicLayer(initialTechnicRecipe(), 0)!;
    expect(technicRectangle(r.cells, { x: 0, y: 0 }, { x: 1, y: 0 }, 1)).toEqual(["0,0,1", "1,0,1"]);
    const moved = transformTechnicSelection(r, ["0,0,1"], { kind: "move", dx: 1, dy: 1 })!;
    expect(moved.recipe.cells.find(c => c.x === 0 && c.y === 0 && !c.z)).toEqual(r.cells[0]);
    expect(moved.recipe.cells.at(-1)).toMatchObject({ x: 1, y: 1, z: 1 });
  });
  it("counts corners independently for different outlines on neighbouring floors", () => {
    const r = appendTechnicLayer(initialTechnicRecipe(), 0)!;
    r.cells = r.cells.map(c => ({ ...c, kind: "solid", rounding: c.z ? "inner" : "outer" }));
    const corners = technicCorners(r);
    expect(corners.filter(c => c.z === 0 && c.kind === "convex")).toHaveLength(4);
    expect(corners.filter(c => c.z === 1 && c.kind === "concave")).toHaveLength(4);
  });
});
