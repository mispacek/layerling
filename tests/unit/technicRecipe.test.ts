import { describe, expect, it } from "vitest";
import { initialTechnicRecipe, parseTechnicPattern, technicBounds, technicPattern, technicMeshFingerprint, validTechnicRecipe } from "@/lib/technicRecipe";
import { sceneShape } from "@/lib/shapeCatalog";
import { canonicalizeShape } from "@/lib/workplaneShapes";
import { projectShapesFingerprint } from "@/lib/editorHistory";
import { canEditTechnic, replaceTechnicShape } from "@/lib/technicBuilder";
import { Vector3 } from "three";
import { quaternionForShape } from "@/lib/editorBooleans";

describe("optional Lego Compatible recipes", () => {
  it("starts with a 7 × 5 frame and an empty 5 × 3 centre", () => {
    const r = initialTechnicRecipe();
    expect(validTechnicRecipe(r)).toBe(true);
    expect(r.cells).toHaveLength(20);
    expect(technicBounds(r)).toMatchObject({ width: 56, depth: 40 });
    expect(technicPattern(r)).toBe("ooooooo\no.....o\no.....o\no.....o\nooooooo");
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
