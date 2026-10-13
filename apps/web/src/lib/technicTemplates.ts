import { type TechnicCell, type TechnicRecipe, TECHNIC_CELL_LIMIT } from "./technicRecipe";

// Curated families inspired by PartDesigner Catalog.ts (MIT); deliberately no unsupported connectors.
export const TECHNIC_TEMPLATES = ["beam", "mixedBeam", "l", "t", "frame", "i", "plate"] as const;
export type TechnicTemplate = typeof TECHNIC_TEMPLATES[number];
export function technicTemplate(kind: TechnicTemplate, width: number, depth: number, axis: TechnicCell["axis"]): TechnicCell[] | null {
  if (!Number.isInteger(width) || !Number.isInteger(depth) || width < 1 || depth < 1 || width > 32 || depth > 32) return null;
  if ((kind === "frame" && (width < 3 || depth < 3)) || (kind === "i" && (width < 3 || depth < 3))) return null;
  const cells: TechnicCell[] = [];
  const rows = kind === "beam" || kind === "mixedBeam" ? 1 : depth;
  for (let y = 0; y < rows; y++) for (let x = 0; x < width; x++) {
    const include = kind === "l" ? x === 0 || y === 0 : kind === "t" ? y === depth - 1 || x === Math.floor(width / 2)
      : kind === "frame" ? x === 0 || x === width - 1 || y === 0 || y === depth - 1
      : kind === "i" ? y === 0 || y === depth - 1 || x === Math.floor(width / 2) : true;
    if (include) cells.push({ x, y, kind: kind === "plate" ? "solid" : kind === "mixedBeam" && (x === 0 || x === width - 1) ? "axle" : "pin", axis, roll: 0, rounding: kind === "plate" ? "none" : "outer" });
  }
  return cells.length <= TECHNIC_CELL_LIMIT ? cells : null;
}
/** Six samples. Reading left to right: -step, nominal, +step; pin row at back, axle at front. */
export function technicCalibration(recipe: TechnicRecipe, step: number, axis: TechnicCell["axis"]): TechnicRecipe | null {
  if (!Number.isFinite(step) || step < 0.01 || step > 0.4) return null;
  const cells: TechnicCell[] = [];
  for (let y = 0; y < 2; y++) for (let x = 0; x < 3; x++) cells.push({ x, y, kind: y === 1 ? "pin" : "axle", axis, roll: 0, holeOffset: (x - 1) * step });
  // Horizontal bores need exposed faces on both ends. Separate the two rows and
  // connect them beside the samples, never across their openings.
  if (axis !== "Z") {
    cells.forEach(c => { c.y *= 2; });
    for (let y = 0; y < 3; y++) cells.push({ x: 3, y, kind: "solid", axis, roll: 0 });
  }
  return { ...recipe, cells: axis === "X" ? cells.map(c => ({ ...c, x: c.y, y: c.x })) : cells, meshFingerprint: undefined };
}
