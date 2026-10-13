import { describe, expect, it } from "vitest";
import { initialTechnicRecipe, validTechnicRecipe, type TechnicRecipe } from "@/lib/technicRecipe";
import { appendTechnicLayer } from "@/lib/technicLayers";
import { transferTechnicSelection } from "@/lib/technicSelection";
import { TECHNIC_SELECTION_TEXTURE_SIZE, technicSelectionMask } from "@/lib/technicPreviewHighlight";

describe("transferring Lego selections between floors", () => {
  it("appends a new floor and copies only the selection with all cell settings", () => {
    const r = initialTechnicRecipe();
    r.cells[0] = { ...r.cells[0], kind: "axle", axis: "X", roll: 45, rounding: "inner", holeOffset: -0.1 };
    const result = transferTechnicSelection(r, ["0,0", "1,0"], "copy", 1)!;
    expect(validTechnicRecipe(result.recipe)).toBe(true);
    expect(result.recipe).toMatchObject({ version: 2, layerCount: 2 });
    expect(result.recipe.cells).toHaveLength(22);
    expect(result.recipe.cells.slice(0, 20)).toEqual(r.cells);
    expect(result.recipe.cells.at(-2)).toEqual({ ...r.cells[0], z: 1 });
    expect(result.selection).toEqual(["0,0,1", "1,0,1"]);
    expect(r.version).toBe(1); expect(r.cells).toHaveLength(20);
  });
  it("moves between existing floors, retaining XY and accepting occupied XY in other floors", () => {
    const r = appendTechnicLayer(initialTechnicRecipe())!;
    const next = transferTechnicSelection(r, ["0,0"], "move", 1)!;
    expect(next.recipe.cells).toHaveLength(20);
    expect(next.recipe.cells.find(c => c.x === 0 && c.y === 0 && !c.z)).toBeUndefined();
    const back = transferTechnicSelection(next.recipe, ["0,0,1"], "move", 0)!;
    expect(back.selection).toEqual(["0,0"]);
    expect(back.recipe.cells.at(-1)).toEqual({ ...r.cells[0], z: 0 });
    expect(validTechnicRecipe(back.recipe)).toBe(true);
  });
  it("refuses overlap atomically and preserves both source and target", () => {
    const r = appendTechnicLayer(initialTechnicRecipe(), 0)!, before = structuredClone(r);
    for (const kind of ["copy", "move"] as const) expect(transferTechnicSelection(r, ["0,0"], kind, 1)).toBeNull();
    expect(r).toEqual(before);
  });
  it("rejects same, mixed, missing and invalid floor targets without appending an empty floor", () => {
    const r = appendTechnicLayer(initialTechnicRecipe(), 0)!;
    for (const layer of [-1, 0, 3, 0.5, NaN]) expect(transferTechnicSelection(r, ["0,0"], "copy", layer)).toBeNull();
    expect(transferTechnicSelection(r, [], "move", 1)).toBeNull();
    expect(transferTechnicSelection(r, ["0,0", "0,0,1"], "move", 2)).toBeNull();
    expect(r.layerCount).toBe(2);
  });
  it("enforces floor and total-cell limits, allowing a move when a copy would exceed the limit", () => {
    const cell = initialTechnicRecipe().cells[0];
    const r: TechnicRecipe = { ...initialTechnicRecipe(), cells: Array.from({ length: 256 }, (_, x) => ({ ...cell, x: x - 128 })) };
    expect(transferTechnicSelection(r, ["0,0"], "copy", 1)).toBeNull();
    expect(r.version).toBe(1);
    const moved = transferTechnicSelection(r, ["0,0"], "move", 1)!;
    expect(moved.recipe.cells).toHaveLength(256); expect(validTechnicRecipe(moved.recipe)).toBe(true);
    expect(transferTechnicSelection({ ...moved.recipe, layerCount: 32 }, ["0,0,1"], "move", 32)).toBeNull();
    expect(transferTechnicSelection({ ...moved.recipe, layerCount: 32 }, ["0,0,1"], "move", 31)?.recipe.layerCount).toBe(32);
  });
});

describe("3D selection mask", () => {
  it("marks only existing selected cells in the active floor, including the coordinate extremes", () => {
    const cell = initialTechnicRecipe().cells[0];
    const r: TechnicRecipe = { ...initialTechnicRecipe(), version: 2, layerCount: 2, cells: [cell, { ...cell, z: 1 },
      { ...cell, x: -128, y: -128, z: 1 }, { ...cell, x: 128, y: 128, z: 1 }] };
    const mask = technicSelectionMask(r, 1, ["0,0", "-128,-128,1", "128,128,1", "1,1,1"]);
    expect(mask).toHaveLength(TECHNIC_SELECTION_TEXTURE_SIZE ** 2);
    expect(mask[0]).toBe(255); expect(mask.at(-1)).toBe(255);
    expect(mask[128 * TECHNIC_SELECTION_TEXTURE_SIZE + 128]).toBe(0);
    expect([...mask].filter(Boolean)).toHaveLength(2);
    expect(technicSelectionMask(r, 1, []).some(Boolean)).toBe(false);
  });
});
