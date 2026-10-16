import { describe, expect, it } from "vitest";
import { visibleGridStep, snapShapeFootprintToVisibleGrid } from "@/lib/gridSnap";
import { DEFAULT_WORKPLANE_WORKSPACE, normalizeWorkspaceSettings, customSnapGridSize } from "@/lib/workplaneSettings";
import { workplaneGridLayout, workplaneGridDisplayLayout, workplaneGridLines, workplaneGridBandWidths, workplaneGridBandVisibility } from "@/lib/workplaneGrid";
import type { GridSize, WorkplaneShape } from "@/types/layerling";

describe("visible grid follows snap resolution", () => {
  it("enables old projects by default, preserves a manual opt-out and rejects malformed flags", () => {
    expect(normalizeWorkspaceSettings({ gridBlockSize: 10 }).gridFollowSnap).toBe(true);
    expect(normalizeWorkspaceSettings({ gridFollowSnap: false }).gridFollowSnap).toBe(false);
    expect(normalizeWorkspaceSettings({ gridFollowSnap: "no" }).gridFollowSnap).toBe(true);
    const settings = normalizeWorkspaceSettings({ gridFollowSnap: false, gridBlockSize: 10 });
    expect(normalizeWorkspaceSettings(JSON.parse(JSON.stringify(settings)))).toEqual(settings);
    expect(visibleGridStep(settings, "Brick")).toBe(10);
    expect(visibleGridStep(DEFAULT_WORKPLANE_WORKSPACE, "Off")).toBe(5);
    expect(visibleGridStep(DEFAULT_WORKPLANE_WORKSPACE)).toBe(5);
  });
  it.each([["0.1 mm", 0.1], ["0.25 mm", 0.25], ["0.5 mm", 0.5], ["1.0 mm", 1], ["5.0 mm", 5], ["Brick", 8], ["1/64 in", 25.4 / 64]] as [GridSize, number][])("uses the exact %s step in millimetres", (snap, step) => {
    expect(visibleGridStep(DEFAULT_WORKPLANE_WORKSPACE, snap)).toBeCloseTo(step, 10);
    expect(workplaneGridLayout(DEFAULT_WORKPLANE_WORKSPACE, step).step).toBeCloseTo(step, 10);
  });
  it("supports quarter-custom steps and measures larger than the old fixed-grid maximum", () => {
    expect(visibleGridStep(DEFAULT_WORKPLANE_WORKSPACE, customSnapGridSize(0.01, 4))).toBe(0.0025);
    expect(visibleGridStep(DEFAULT_WORKPLANE_WORKSPACE, customSnapGridSize(1000, 1))).toBe(1000);
  });
  it("aligns footprints to the same origin-based lattice as the drawn fine grid", () => {
    const shape = { id: "s", x: 10, z: 0 } as WorkplaneShape;
    const bounds = { minX: 7.1, maxX: 13.1, minZ: -3.1, maxZ: 3.1 };
    const lego = snapShapeFootprintToVisibleGrid(shape, bounds, DEFAULT_WORKPLANE_WORKSPACE, "Brick");
    expect(lego.x).toBeCloseTo(10.9, 6); expect(lego.z).toBeCloseTo(3.1, 6);
    const fine = snapShapeFootprintToVisibleGrid(shape, bounds, DEFAULT_WORKPLANE_WORKSPACE, "0.25 mm");
    expect(fine.x).toBeCloseTo(9.9, 6); expect(fine.z).toBeCloseTo(0.1, 6);
  });
});

describe("readable grid density", () => {
  it("omits subpixel bands while retaining readable major bands and restoring both on zoom", () => {
    expect(workplaneGridBandVisibility(1, 0.2)).toEqual({ minor: false, major: false });
    expect(workplaneGridBandVisibility(1, 0.075)).toEqual({ minor: false, major: true });
    expect(workplaneGridBandVisibility(1, 0.025)).toEqual({ minor: true, major: true });
    expect(workplaneGridBandVisibility(0.1, 0.02)).toEqual({ minor: false, major: false });
    expect(workplaneGridBandVisibility(0.1, 0.002)).toEqual({ minor: true, major: true });
    expect(workplaneGridBandVisibility(8, 0.2)).toEqual({ minor: true, major: true });
  });
  it("restores the exact fine step when zoomed in and draws only lattice multiples when zoomed out", () => {
    const layout = workplaneGridLayout(DEFAULT_WORKPLANE_WORKSPACE, 0.25);
    expect(workplaneGridDisplayLayout(layout, 0.05, 200)).toEqual(layout);
    const distant = workplaneGridDisplayLayout(layout, 1, 200);
    expect(distant.step).toBe(4);
    const lines = workplaneGridLines(200, distant);
    expect(lines.find(l => l.kind === "axis")?.coordinate).toBe(0);
    expect(lines.every(l => Number.isInteger(l.coordinate / layout.step))).toBe(true);
    expect(lines.filter(l => l.kind === "major").every(l => Number.isInteger(l.coordinate / (layout.step * layout.majorInterval)))).toBe(true);
  });
  it("keeps whole-inch major lines when thinning an imperial grid", () => {
    const layout = workplaneGridLayout({ gridBlockSize: 5, units: "Imperial" }, 25.4 / 64);
    const distant = workplaneGridDisplayLayout(layout, 1, 200);
    expect(distant.majorInterval).toBe(4);
    expect(distant.step * distant.majorInterval).toBeCloseTo(25.4, 10);
  });
  it("bounds the geometry size for a large plate with a very fine custom snap step", () => {
    const layout = workplaneGridDisplayLayout({ step: 0.0025, majorInterval: 5 }, 0.01, 2000);
    expect(workplaneGridLines(2000, layout).length).toBeLessThanOrEqual(2000);
    expect(Number.isInteger(layout.step / 0.0025)).toBe(true);
  });
  it("keeps submillimetre bands narrower than the cells instead of covering the plane", () => {
    expect(workplaneGridBandWidths(0.1, true).minor).toBeCloseTo(0.005, 10);
    expect(workplaneGridBandWidths(0.1, true).major).toBeCloseTo(0.01, 10);
    expect(workplaneGridBandWidths(0.0025, true).major).toBeLessThan(0.0025);
  });
});
