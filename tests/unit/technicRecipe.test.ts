import { describe, expect, it } from "vitest";
import { initialTechnicRecipe, parseTechnicPattern, technicBounds, technicPattern, technicMeshFingerprint, technicCorners, validTechnicRecipe } from "@/lib/technicRecipe";
import { sceneShape } from "@/lib/shapeCatalog";
import { canonicalizeShape } from "@/lib/workplaneShapes";
import { projectShapesFingerprint } from "@/lib/editorHistory";
import { canEditTechnic, replaceTechnicShape } from "@/lib/technicBuilder";
import { Vector3 } from "three";
import { quaternionForShape } from "@/lib/editorBooleans";
import { DEFAULT_TECHNIC_MEASUREMENTS } from "@/lib/technicMeasurements";

describe("optional Lego Compatible recipes", () => {
  it.each([false, true])("preserves the 3D recipe origin when the lowest floor is removed (mirrorY=%s)", mirrorY => {
    const r: import("@/lib/technicRecipe").TechnicRecipe = { ...initialTechnicRecipe(), version: 2, layerCount: 2,
      cells: [{ x: 0, y: 0, kind: "solid", axis: "Z", roll: 0 }, { x: 0, y: 0, z: 1, kind: "solid", axis: "Z", roll: 0 }] };
    const previous = sceneShape({ id: "old", kind: "mesh", name: "test", color: "#f00", x: 30, z: -12, elevation: 4,
      width: 8, depth: 8, height: 16, rotation: 20, rotationX: 30, technicRecipe: r });
    previous.mirrorY = mirrorY;
    const next = sceneShape({ id: "new", kind: "mesh", name: "test", color: "#f00", width: 8, depth: 8, height: 8,
      technicRecipe: { ...r, cells: [r.cells[1]] } });
    const replaced = replaceTechnicShape(previous, next);
    const origin = (s: typeof previous) => {
      const b = technicBounds(s.technicRecipe!);
      return new Vector3(-b.centerX, -b.centerY * (s.mirrorY ? -1 : 1), -b.centerZ)
        .applyQuaternion(quaternionForShape(s)).add(new Vector3(s.x, (s.elevation ?? 0) + s.height / 2, s.z));
    };
    expect(origin(previous).distanceTo(origin(replaced))).toBeLessThan(1e-8);
  });
  it.each([false, true])("keeps the recipe's base origin when changing height on a tilted part (mirrorY=%s)", mirrorY => {
    const recipe = initialTechnicRecipe();
    const previous = sceneShape({ id: "old", kind: "mesh", name: "test", color: "#f00", x: 30, z: -12, elevation: 4,
      width: 56, depth: 40, height: 8, rotation: 20, rotationX: 30, technicRecipe: recipe });
    previous.mirrorY = mirrorY;
    const nextRecipe = { ...recipe, measurements: { ...DEFAULT_TECHNIC_MEASUREMENTS, height: 10 } };
    const next = sceneShape({ id: "new", kind: "mesh", name: "test", color: "#f00", width: 56, depth: 40, height: 10, technicRecipe: nextRecipe });
    const replaced = replaceTechnicShape(previous, next);
    const baseOrigin = (s: typeof previous) => {
      const b = technicBounds(s.technicRecipe!);
      return new Vector3(-b.centerX, -s.height / 2 * (s.mirrorY ? -1 : 1), -b.centerZ)
        .applyQuaternion(quaternionForShape(s)).add(new Vector3(s.x, (s.elevation ?? 0) + s.height / 2, s.z));
    };
    expect(baseOrigin(previous).distanceTo(baseOrigin(replaced))).toBeLessThan(1e-8);
  });
  it("supports individual choices and retains legacy rounding", () => {
    const r = initialTechnicRecipe(); r.cells = r.cells.map(c => ({ ...c, rounding: undefined, rounded: true }));
    expect(technicCorners(r)).toHaveLength(8);
    r.cells = r.cells.map(c => ({ ...c, rounding: "none" })); r.cells[0] = { ...r.cells[0], rounding: "outer" };
    expect(technicCorners(r).map(c => c.kind)).toEqual(["convex"]);
    expect(validTechnicRecipe({ ...r, cells: [{ ...r.cells[0], rounding: "invalid" }] })).toBe(false);
  });
  it("starts with a 7 × 5 frame and an empty 5 × 3 centre", () => {
    const r = initialTechnicRecipe();
    expect(validTechnicRecipe(r)).toBe(true);
    expect(r.cells).toHaveLength(20);
    expect(technicBounds(r)).toMatchObject({ width: 56, depth: 40 });
    expect(technicPattern(r).split("\n").map(row => row.trim().split(/\s+/).join(" "))).toEqual([
      "oz oy oz oy oz oy oz", "ox . . . . . ox", "ox . . . . . ox", "ox . . . . . ox", "oz oy oz oy oz oy oz",
    ]);
    expect(r.cornerRadius).toBe(4);
    expect(r.cells.every(c => c.rounding === "outer")).toBe(true);
    expect(technicCorners(r).map(c => c.kind)).toEqual(["convex", "convex", "convex", "convex"]);
    expect(parseTechnicPattern(technicPattern(r), "X", 45)).toEqual(r.cells.map(({ rounding: _rounding, ...c }) => c).sort((a, b) => b.y - a.y || a.x - b.x));
  });
  it("keeps sparse negative coordinates and uses exactly 8 mm spacing", () => {
    const r = { ...initialTechnicRecipe(), cells: [{ x: -3, y: 2, kind: "solid" as const, axis: "Z" as const, roll: 0 as const }, { x: 1, y: -1, kind: "solid" as const, axis: "Z" as const, roll: 0 as const }] };
    expect(validTechnicRecipe(r)).toBe(true);
    expect(technicBounds(r)).toMatchObject({ width: 40, depth: 32, centerX: -8, centerZ: -4 });
  });
  it("parses all three module types with top-view row orientation", () => {
    expect(parseTechnicPattern("#o\n.+", "X", 45)).toEqual([
      { x: 0, y: 1, kind: "solid", axis: "X", roll: 45 }, { x: 1, y: 1, kind: "pin", axis: "X", roll: 45 },
      { x: 1, y: 0, kind: "axle", axis: "X", roll: 45 },
    ]);
  });
  it("retains independently oriented bores and axle rolls when changing the brush", () => {
    const cells = parseTechnicPattern("ox oy oz\n+x +y45 +z45", "Y", 45)!;
    expect(cells.map(c => [c.kind, c.axis, c.roll])).toEqual([
      ["pin", "X", 0], ["pin", "Y", 0], ["pin", "Z", 0],
      ["axle", "X", 0], ["axle", "Y", 45], ["axle", "Z", 45],
    ]);
    const text = technicPattern({ ...initialTechnicRecipe(), cells });
    expect(text.split("\n")[0]).toBe("ox   oy   oz");
    expect(parseTechnicPattern(text, "Z", 0)).toEqual(cells);
  });
  it("mixes spaced or compact new tokens with legacy cells, including CRLF and uppercase axes", () => {
    expect(parseTechnicPattern("#oX+Y45\r\n. o +", "Z", 45)).toEqual([
      { x: 0, y: 1, kind: "solid", axis: "Z", roll: 45 }, { x: 1, y: 1, kind: "pin", axis: "X", roll: 0 },
      { x: 2, y: 1, kind: "axle", axis: "Y", roll: 45 }, { x: 1, y: 0, kind: "pin", axis: "Z", roll: 45 },
      { x: 2, y: 0, kind: "axle", axis: "Z", roll: 45 },
    ]);
  });
  it("counts cells rather than text characters for pattern limits", () => {
    const line = Array(32).fill("+x45").join(" ");
    expect(parseTechnicPattern(Array(8).fill(line).join("\n"), "Z", 0)).toHaveLength(256);
    expect(parseTechnicPattern(Array(9).fill(line).join("\n"), "Z", 0)).toBeNull();
    expect(parseTechnicPattern(Array(33).fill("ox").join(" "), "Z", 0)).toBeNull();
  });
  it.each(["ox oy\n+z", "ox90", "+z90", "o x", "ox\n\noy", "#x", "ox +y45 ?"])("rejects malformed oriented patterns: %s", text => {
    expect(parseTechnicPattern(text, "Z", 0)).toBeNull();
  });
  it.each(["", "..", "o\n##", "#?", "#".repeat(33), Array(17).fill("#".repeat(16)).join("\n")])("rejects invalid or oversized patterns: %s", text => {
    expect(parseTechnicPattern(text, "Z", 0)).toBeNull();
  });
  it("rejects duplicate cells, unsupported versions, nonfinite and oversized input", () => {
    const r = initialTechnicRecipe();
    for (const changed of [{ ...r, cornerRadius: NaN }, { ...r, cornerRadius: 4.1 }, { ...r, cells: [{ ...r.cells[0], rounded: "yes" }] },
      { ...r, version: 2 }, { ...r, pitch: 4 }, { ...r, holeAdjustment: NaN }, { ...r, holeAdjustment: 0.5 },
      { ...r, cells: [...r.cells, r.cells[0]] }, { ...r, cells: [{ ...r.cells[0], x: 129 }] }, { ...r, cells: [] }]) {
      expect(validTechnicRecipe(changed)).toBe(false);
    }
  });
  it("retains the recipe through shape hydration and tracks recipe-only history changes", () => {
    const positions = [0, 0, 0, 1, 0, 0, 0, 1, 0];
    const recipe = { ...initialTechnicRecipe(), meshFingerprint: technicMeshFingerprint(positions) };
    const shape = sceneShape({ id: "test", name: "test", kind: "mesh", color: "#f00", width: 56, depth: 40, height: 8, technicRecipe: recipe,
      importedMesh: { positions, baseWidth: 56, baseDepth: 40, baseHeight: 8, triangleCount: 1, sourceFormat: "json" } });
    expect(canonicalizeShape(shape).technicRecipe).toBe(recipe);
    expect(canEditTechnic(shape)).toBe(true);
    expect(projectShapesFingerprint([shape])).not.toBe(projectShapesFingerprint([{ ...shape, technicRecipe: { ...recipe, holeAdjustment: 0.1 } }]));
    expect(canEditTechnic({ ...shape, width: 60 })).toBe(false);
    expect(canEditTechnic({ ...shape, cadBrep: "modified" })).toBe(false);
    expect(canEditTechnic({ ...shape, locked: true })).toBe(false);
    expect(canEditTechnic({ ...shape, importedMesh: { ...shape.importedMesh!, positions: positions.map(v => v + 0.1) } })).toBe(false);
  });
  it("preserves the recipe origin, identity and pose when extending a rotated mirrored body", () => {
    const recipe = initialTechnicRecipe();
    const previous = sceneShape({ id: "original", name: "My part", kind: "mesh", color: "#abcd00", x: 30, z: -12, elevation: 4,
      width: 56, depth: 40, height: 8, rotation: 90, rotationX: 30, technicRecipe: recipe });
    previous.mirrorX = true;
    const nextRecipe = { ...recipe, cells: [...recipe.cells, { ...recipe.cells[0], x: -1 }] };
    const next = sceneShape({ id: "generated", name: "new", kind: "mesh", color: "#000", width: 64, depth: 40, height: 8, technicRecipe: nextRecipe });
    const replaced = replaceTechnicShape(previous, next);
    const offset = new Vector3(4, 0, 0).applyQuaternion(quaternionForShape(previous));
    expect(replaced.x).toBeCloseTo(previous.x + offset.x);
    expect(replaced.z).toBeCloseTo(previous.z + offset.z);
    expect(replaced.elevation).toBeCloseTo(4 + offset.y);
    expect(replaced).toMatchObject({ id: "original", name: "My part", color: "#abcd00", rotation: 90, rotationX: 30, mirrorX: true });
  });
});
