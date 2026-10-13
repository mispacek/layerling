// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from "vitest";
import { initialTechnicRecipe, validTechnicRecipe, technicBounds } from "@/lib/technicRecipe";
import { technicRectangle, transformTechnicSelection } from "@/lib/technicSelection";
import { TECHNIC_TEMPLATES, technicTemplate, technicCalibration } from "@/lib/technicTemplates";
import { DEFAULT_TECHNIC_MEASUREMENTS, loadTechnicProfiles, saveTechnicProfile } from "@/lib/technicMeasurements";

beforeEach(() => localStorage.clear());
describe("Lego selection and reusable templates", () => {
  it("selects only occupied cells in a rectangle, in either drag direction", () => {
    const r = initialTechnicRecipe();
    expect(technicRectangle(r.cells, { x: 2, y: 2 }, { x: 0, y: 0 })).toEqual(["0,0", "1,0", "2,0", "0,1", "0,2"]);
  });
  it("moves and copies without overwriting other cells or losing sample/rounding settings", () => {
    const r = initialTechnicRecipe(); r.cells[0] = { ...r.cells[0], kind: "axle", axis: "X", roll: 45, rounding: "inner", holeOffset: 0.1 };
    expect(transformTechnicSelection(r, ["0,0"], { kind: "copy", dx: 1, dy: 0 })).toBeNull();
    const moved = transformTechnicSelection(r, ["0,0"], { kind: "move", dx: -1, dy: -1 })!;
    expect(moved.recipe.cells).toHaveLength(20); expect(moved.selection).toEqual(["-1,-1"]);
    expect(moved.recipe.cells.at(-1)).toEqual({ ...r.cells[0], x: -1, y: -1 });
    const copied = transformTechnicSelection(r, ["0,0"], { kind: "copy", dx: -1, dy: -1 })!;
    expect(copied.recipe.cells).toHaveLength(21); expect(r.cells).toHaveLength(20);
    expect(transformTechnicSelection(r, ["0,0"], { kind: "move", dx: -129, dy: 0 })).toBeNull();
  });
  it("mirrors within the selection bounds and keeps a 45° cross profile", () => {
    const r = initialTechnicRecipe(); r.cells[0] = { ...r.cells[0], kind: "axle", roll: 45 };
    const mirrored = transformTechnicSelection(r, ["0,0", "1,0", "2,0"], { kind: "mirrorX" })!;
    expect(mirrored.recipe.cells.find(c => c.x === 2 && c.y === 0)).toMatchObject({ kind: "axle", roll: 45 });
  });
  it.each(TECHNIC_TEMPLATES)("creates supported, fully editable %s templates", kind => {
    const r = { ...initialTechnicRecipe(), cells: technicTemplate(kind, 7, 5, "Y")! };
    expect(validTechnicRecipe(r)).toBe(true); expect(r.cells.every(c => c.axis === "Y")).toBe(true);
  });
  it("rejects oversized templates and too small frames", () => {
    expect(technicTemplate("frame", 2, 5, "Z")).toBeNull();
    expect(technicTemplate("plate", 32, 32, "Z")).toBeNull();
  });
  it("keeps six samples and individual corrections, with isolated horizontal bores", () => {
    for (const axis of ["X", "Y", "Z"] as const) {
      const r = technicCalibration(initialTechnicRecipe(), 0.1, axis)!;
      expect(validTechnicRecipe(r)).toBe(true);
      expect(r.cells.filter(c => c.kind !== "solid").map(c => c.holeOffset)).toEqual([-0.1, 0, 0.1, -0.1, 0, 0.1]);
      expect(r.cells.filter(c => c.kind === "pin")).toHaveLength(3);
      expect(r.cells.filter(c => c.kind === "axle")).toHaveLength(3);
    }
    expect(technicBounds(technicCalibration(initialTechnicRecipe(), 0.1, "Z")!)).toMatchObject({ width: 24, depth: 16 });
  });
});
describe("Lego print measurements and persistence", () => {
  it("keeps old recipe defaults and rejects unsafe custom dimensions", () => {
    const r = initialTechnicRecipe();
    expect(validTechnicRecipe(r)).toBe(true);
    expect(validTechnicRecipe({ ...r, measurements: { ...DEFAULT_TECHNIC_MEASUREMENTS, pinDiameter: NaN } })).toBe(false);
    expect(validTechnicRecipe({ ...r, measurements: { ...DEFAULT_TECHNIC_MEASUREMENTS, pinCorrection: 0.5 } })).toBe(false);
    expect(validTechnicRecipe({ ...r, measurements: { ...DEFAULT_TECHNIC_MEASUREMENTS, recessDiameter: 4 } })).toBe(false);
    expect(validTechnicRecipe({ ...r, cells: [{ ...r.cells[0], holeOffset: Infinity }] })).toBe(false);
    expect(technicBounds({ ...r, measurements: { ...DEFAULT_TECHNIC_MEASUREMENTS, pitch: 8.1, bodyInset: 0.1 } }).width).toBeCloseTo(56.5);
  });
  it("stores and replaces named profiles without mutating recipe measurements", () => {
    const measurements = { ...DEFAULT_TECHNIC_MEASUREMENTS, pinCorrection: 0.1 };
    saveTechnicProfile({ name: "PLA", measurements, holeAdjustment: 0.05 });
    measurements.pinCorrection = 0.2;
    expect(loadTechnicProfiles()[0].measurements.pinCorrection).toBe(0.1);
    saveTechnicProfile({ name: "PLA", measurements, holeAdjustment: 0 });
    expect(loadTechnicProfiles()).toHaveLength(1);
    localStorage.setItem("layerling.technic.printProfiles.v1", "broken JSON");
    expect(loadTechnicProfiles()).toEqual([]);
  });
});
