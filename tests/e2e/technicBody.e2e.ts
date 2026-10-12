import { beforeAll, describe, expect, it, vi } from "vitest";
import manifoldModule from "manifold-3d";
import { rememberManifoldRuntime } from "@/lib/manifoldHandle";
import { buildTechnicShape } from "@/lib/technicBuilder";
import { initialTechnicRecipe, type TechnicCell, type TechnicRecipe } from "@/lib/technicRecipe";
import { disposeManifold, shapeToManifoldSolid } from "@/lib/editorBooleans";
import { getManifoldRuntime, meshForShape, type ManifoldSolid } from "@/lib/editorMeshCore";
import { exportMeshesToStl } from "@/lib/stlExport";
import { importedShapeFromStl } from "@/lib/stlImport";
import { exportLylProject, importLylProject } from "@/lib/lylProject";
import { editorHistoryEntry } from "@/lib/editorHistory";
import { DEFAULT_SNAP_GRID, DEFAULT_WORKPLANE_WORKSPACE } from "@/lib/workplaneSettings";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

const kernel = vi.hoisted(() => ({ runtime: null as Promise<unknown> | null }));
vi.mock("@/lib/editorMeshCore", async original => ({ ...(await original<typeof import("@/lib/editorMeshCore")>()), getManifoldRuntime: () => kernel.runtime }));
beforeAll(async () => {
  kernel.runtime = manifoldModule().then(runtime => { runtime.setup(); rememberManifoldRuntime(runtime); return runtime; });
  await kernel.runtime;
});
const recipe = (cells: TechnicCell[]): TechnicRecipe => ({ version: 1, pitch: 8, height: 8, holeAdjustment: 0, cells });
const cell = (kind: TechnicCell["kind"], axis: TechnicCell["axis"] = "Z", x = 0, y = 0, roll: 0 | 45 = 0): TechnicCell => ({ kind, axis, x, y, roll });
const circleArea = (diameter: number) => 48 * (diameter / 2) ** 2 * Math.sin(2 * Math.PI / 96);
const boreVolume = circleArea(4.95) * 8 + (circleArea(6.4) - circleArea(4.95)) * 2 * 0.89;
async function bodyFor(r: TechnicRecipe) {
  const shape = await buildTechnicShape(r, 300_000);
  const created: ManifoldSolid[] = [];
  const body = shapeToManifoldSolid(await getManifoldRuntime(), shape, created)!;
  return { shape, body, dispose: () => [...new Set([...created, body])].reverse().forEach(disposeManifold) };
}
describe("real Lego Compatible bodies", () => {
  it("unites touching material without gaps or internal walls", async () => {
    const { body, shape, dispose } = await bodyFor(recipe([cell("solid"), cell("solid", "Z", 1)]));
    try {
      expect(body.status()).toBe("NoError"); expect(body.volume()).toBeCloseTo(1024, 4);
      expect(shape).toMatchObject({ width: 16, depth: 8, height: 8 });
      const components = body.decompose(); expect(components).toHaveLength(1); components.forEach(disposeManifold);
    } finally { dispose(); }
  });
  it.each(["X", "Y", "Z"] as const)("cuts a through pin hole in direction %s, without changing its diameter", async axis => {
    const { body, dispose } = await bodyFor(recipe([cell("pin", axis)]));
    try {
      expect(body.volume()).toBeCloseTo(512 - boreVolume, 3);
      const rays = { X: [[-10, 4, 0], [10, 4, 0]], Y: [[0, 4, -10], [0, 4, 10]], Z: [[0, -10, 0], [0, 15, 0]] } as const;
      expect(body.rayCast([...rays[axis][0]], [...rays[axis][1]])).toHaveLength(0);
      const other = axis === "X" ? "Y" : "X";
      expect(body.rayCast([...rays[other][0]], [...rays[other][1]]).length).toBeGreaterThan(0);
    } finally { dispose(); }
  });
  it("omits recesses on joined faces and continues holes across two cells", async () => {
    const { body, dispose } = await bodyFor(recipe([cell("pin", "X"), cell("pin", "X", 1)]));
    try {
      const removed = circleArea(4.95) * 16 + (circleArea(6.4) - circleArea(4.95)) * 2 * 0.89;
      expect(body.volume()).toBeCloseTo(1024 - removed, 3);
      expect(body.rayCast([-20, 4, 0], [20, 4, 0])).toHaveLength(0);
      expect(body.rayCast([0, -10, 2.8], [0, 15, 2.8]).length).toBeGreaterThan(0);
    } finally { dispose(); }
  });
  it.each(["X", "Y", "Z"] as const)("rotates the cross profile 45° around hole axis %s", async axis => {
    const a = await bodyFor(recipe([cell("axle", axis)]));
    const b = await bodyFor(recipe([cell("axle", axis, 0, 0, 45)]));
    try {
      expect(a.body.volume()).toBeCloseTo(b.body.volume(), 3);
      expect(a.shape.importedMesh!.positions).not.toEqual(b.shape.importedMesh!.positions);
      const rays = { X: [[-10, 4, 0], [10, 4, 0]], Y: [[0, 4, -10], [0, 4, 10]], Z: [[0, -10, 0], [0, 15, 0]] } as const;
      expect(b.body.rayCast([...rays[axis][0]], [...rays[axis][1]])).toHaveLength(0);
      const offAxis = { X: [[-10, 5.7, 0], [10, 5.7, 0]], Y: [[1.7, 4, -10], [1.7, 4, 10]], Z: [[1.7, -10, 0], [1.7, 15, 0]] } as const;
      expect(a.body.rayCast([...offAxis[axis][0]], [...offAxis[axis][1]])).toHaveLength(0);
      expect(b.body.rayCast([...offAxis[axis][0]], [...offAxis[axis][1]]).length).toBeGreaterThan(0);
    } finally { a.dispose(); b.dispose(); }
  });
  it("generates a closed frame with a truly empty centre", async () => {
    const { body, shape, dispose } = await bodyFor(initialTechnicRecipe());
    try {
      expect(body.status()).toBe("NoError"); expect(shape).toMatchObject({ width: 56, depth: 40, height: 8 });
      expect(body.volume()).toBeCloseTo(20 * (512 - boreVolume), 2);
      expect(body.rayCast([0, -10, 0], [0, 15, 0])).toHaveLength(0);
      const components = body.decompose(); expect(components).toHaveLength(1); components.forEach(disposeManifold);
    } finally { dispose(); }
  });
  it("enlarges holes using a diameter correction and rejects the triangle limit", async () => {
    const r = recipe([cell("pin")]);
    const a = await bodyFor(r), b = await bodyFor({ ...r, holeAdjustment: 0.2 });
    try { expect(b.body.volume()).toBeLessThan(a.body.volume()); } finally { a.dispose(); b.dispose(); }
    await expect(buildTechnicShape(r, 10)).rejects.toThrow("technic.error.geometry");
  });
  it("round-trips real geometry, recipe and history in .lyl and rejects malformed metadata", async () => {
    const shape = await buildTechnicShape(recipe([cell("pin", "X", -1), cell("axle", "Y", 0, 0, 45)]), 300_000);
    const bytes = await exportLylProject({ projectName: "Technic", createdAt: 1_700_000_000_000, modifiedAt: 1_700_000_000_000,
      shapes: [shape], history: [editorHistoryEntry([], []), editorHistoryEntry([shape], [shape.id])], historyIndex: 1,
      assets: [], workspace: DEFAULT_WORKPLANE_WORKSPACE, snapGrid: DEFAULT_SNAP_GRID, placementElevation: 0 });
    const restored = await importLylProject(bytes);
    expect(restored.shapes[0].technicRecipe).toEqual(shape.technicRecipe);
    expect(restored.shapes[0].importedMesh).toEqual(shape.importedMesh);
    expect(restored.history[1].shapes[0].technicRecipe).toEqual(shape.technicRecipe);
    const files = unzipSync(bytes), doc = JSON.parse(strFromU8(files["project.json"]));
    for (const node of doc.states.flatMap((state: { nodes: unknown[] }) => state.nodes) as { definition: Record<string, unknown> }[]) {
      if (node.definition?.technicRecipe) node.definition.technicRecipe = { ...shape.technicRecipe, pitch: 4 };
    }
    files["project.json"] = strToU8(JSON.stringify(doc));
    await expect(importLylProject(zipSync(files))).rejects.toThrow(/invalid Lego Compatible recipe/);
  });
  it("exports through the normal STL path and reimports with unchanged dimensions and volume", async () => {
    const shape = await buildTechnicShape(initialTechnicRecipe(), 300_000);
    const bytes = exportMeshesToStl([meshForShape(shape)]);
    const restored = importedShapeFromStl("technic-frame.stl", bytes);
    expect(bytes.byteLength).toBe(84 + shape.importedMesh!.triangleCount * 50);
    expect(restored.width).toBeCloseTo(56, 4); expect(restored.depth).toBeCloseTo(40, 4); expect(restored.height).toBeCloseTo(8, 4);
    const created: ManifoldSolid[] = [];
    const solid = shapeToManifoldSolid(await getManifoldRuntime(), restored, created)!;
    try { expect(solid.status()).toBe("NoError"); expect(solid.volume()).toBeCloseTo(20 * (512 - boreVolume), 2); }
    finally { [...new Set([...created, solid])].reverse().forEach(disposeManifold); }
  });
});
