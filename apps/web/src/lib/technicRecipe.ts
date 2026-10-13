import { technicMeasurements, validTechnicMeasurements, type TechnicMeasurements } from "./technicMeasurements";
/** A sparse, editable construction recipe. Model axes are X/right, Y/back, Z/up. */
export type TechnicRounding = "none" | "outer" | "inner" | "both";
export type TechnicCell = { x: number; y: number; z?: number; kind: "solid" | "pin" | "axle"; axis: "X" | "Y" | "Z"; roll: 0 | 45; rounded?: boolean; rounding?: TechnicRounding; holeOffset?: number };
// pitch/height retain the legacy format marker. Actual dimensions are optional for old files.
export type TechnicRecipe = { version: 1 | 2; pitch: 8; height: 8; holeAdjustment: number; cells: TechnicCell[]; layerCount?: number; cornerRadius?: number; meshFingerprint?: string; measurements?: TechnicMeasurements };
export const DEFAULT_TECHNIC_CORNER_RADIUS = 1;
export const TECHNIC_CELL_LIMIT = 256;
export const TECHNIC_LAYER_LIMIT = 32;
export const technicLayer = (cell: Pick<TechnicCell, "z">) => cell.z ?? 0;
export const technicLayerCount = (recipe: TechnicRecipe) => recipe.layerCount ?? 1;
// Keep keys of legacy ground-floor cells unchanged.
export const technicCellKey = (x: number, y: number, z = 0) => z ? `${x},${y},${z}` : `${x},${y}`;
export function technicLayerRecipe(recipe: TechnicRecipe, layer: number): TechnicRecipe {
  return { ...recipe, version: 1, layerCount: undefined, meshFingerprint: undefined,
    cells: recipe.cells.filter(c => technicLayer(c) === layer).map(({ z: _z, ...c }) => c) };
}

export function validTechnicRecipe(value: unknown): value is TechnicRecipe {
  if (!value || typeof value !== "object") return false;
  const r = value as TechnicRecipe;
  if (![1, 2].includes(r.version) || r.pitch !== 8 || r.height !== 8 || !Number.isFinite(r.holeAdjustment)
    || Math.abs(r.holeAdjustment) > 0.4 || !Array.isArray(r.cells) || !r.cells.length || r.cells.length > TECHNIC_CELL_LIMIT
    || (r.meshFingerprint !== undefined && (typeof r.meshFingerprint !== "string" || r.meshFingerprint.length > 64 || !/^\d+:\d+:\d+$/.test(r.meshFingerprint)))
    || (r.measurements !== undefined && !validTechnicMeasurements(r.measurements))
    || (r.cornerRadius !== undefined && (!Number.isFinite(r.cornerRadius) || r.cornerRadius < 0.2 || r.cornerRadius > 4))) return false;
  if (r.version === 2 && (!Number.isInteger(r.layerCount) || r.layerCount! < 1 || r.layerCount! > TECHNIC_LAYER_LIMIT)) return false;
  if (r.version === 1 && r.layerCount !== undefined && r.layerCount !== 1) return false;
  const m = technicMeasurements(r), span = m.pitch - 2 * m.bodyInset;
  if ((r.cornerRadius ?? DEFAULT_TECHNIC_CORNER_RADIUS) > span / 2) return false;
  const keys = new Set<string>();
  for (const c of r.cells) {
    if (!c || !Number.isInteger(c.x) || !Number.isInteger(c.y) || Math.abs(c.x) > 128 || Math.abs(c.y) > 128
      || !["solid", "pin", "axle"].includes(c.kind) || !["X", "Y", "Z"].includes(c.axis) || ![0, 45].includes(c.roll)
      || (c.rounded !== undefined && typeof c.rounded !== "boolean")
      || (c.rounding !== undefined && !["none", "outer", "inner", "both"].includes(c.rounding))
      || (c.holeOffset !== undefined && (!Number.isFinite(c.holeOffset) || Math.abs(c.holeOffset) > 0.4))) return false;
    if ((c.z !== undefined && !Number.isInteger(c.z)) || technicLayer(c) < 0 || technicLayer(c) >= technicLayerCount(r)) return false;
    if (c.kind !== "solid") {
      const correction = r.holeAdjustment + (c.holeOffset ?? 0);
      const diameter = m.pinDiameter + correction + (c.kind === "pin" ? m.pinCorrection : m.axleCorrection);
      const recess = m.recessDiameter + correction + m.recessCorrection;
      const cross = m.axleWidth + correction + m.axleCorrection;
      const transverse = c.axis === "Z" ? span : Math.min(span, m.height);
      const axial = c.axis === "Z" ? m.height : span;
      if (diameter <= 0 || diameter >= transverse || (c.kind === "pin" && (recess < diameter || recess >= transverse || m.recessDepth * 2 >= axial))
        || (c.kind === "axle" && (cross <= 0 || cross >= diameter))) return false;
    }
    const key = technicCellKey(c.x, c.y, technicLayer(c));
    if (keys.has(key)) return false;
    keys.add(key);
  }
  return true;
}

export type TechnicCorner = { x: number; y: number; z: number; sx: -1 | 1; sy: -1 | 1; kind: "convex" | "concave" };
/** Keep previously saved rounded:true cells unchanged, unless explicitly overridden. */
export const technicRounding = (cell: Pick<TechnicCell, "rounding" | "rounded">): TechnicRounding => cell.rounding ?? (cell.rounded ? "both" : "none");
/** Only corners of the UNITED outline are rounded; shared cell faces remain straight. */
export function technicCorners(recipe: TechnicRecipe): TechnicCorner[] {
  const { pitch, bodyInset } = technicMeasurements(recipe);
  const occupied = new Set(recipe.cells.map(c => technicCellKey(c.x, c.y, technicLayer(c))));
  const corners: TechnicCorner[] = [];
  for (const cell of recipe.cells) {
    const rounding = technicRounding(cell);
    if (rounding === "none") continue;
    for (const sx of [-1, 1] as const) for (const sy of [-1, 1] as const) {
      const z = technicLayer(cell);
      const beside = occupied.has(technicCellKey(cell.x + sx, cell.y, z));
      const above = occupied.has(technicCellKey(cell.x, cell.y + sy, z));
      const diagonal = occupied.has(technicCellKey(cell.x + sx, cell.y + sy, z));
      const kind = !beside && !above ? "convex" : beside && above && !diagonal ? "concave" : null;
      if (kind && (rounding === "both" || rounding === (kind === "convex" ? "outer" : "inner"))) corners.push({ x: cell.x * pitch + sx * (pitch / 2 - bodyInset), y: cell.y * pitch + sy * (pitch / 2 - bodyInset), z, sx, sy, kind });
    }
  }
  return corners;
}

const meshFingerprints = new WeakMap<readonly number[], string>();
/** An accidental-change guard, not a security hash. Mesh arrays are immutable, as in editorHistory. */
export function technicMeshFingerprint(positions: readonly number[]) {
  const cached = meshFingerprints.get(positions);
  if (cached) return cached;
  let a = 2166136261, b = 5381;
  for (const value of positions) for (const char of value.toPrecision(12)) {
    a = Math.imul(a ^ char.charCodeAt(0), 16777619); b = Math.imul(b, 33) ^ char.charCodeAt(0);
  }
  const result = `${positions.length}:${a >>> 0}:${b >>> 0}`;
  meshFingerprints.set(positions, result);
  return result;
}

export function technicBounds(recipe: TechnicRecipe) {
  const { pitch, height: layerHeight, bodyInset } = technicMeasurements(recipe);
  const xs = recipe.cells.map(c => c.x), ys = recipe.cells.map(c => c.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const levels = recipe.cells.map(technicLayer), minLayer = Math.min(...levels), maxLayer = Math.max(...levels);
  const height = (maxLayer - minLayer + 1) * layerHeight;
  return { minX, maxX, minY, maxY, width: (maxX - minX + 1) * pitch - 2 * bodyInset, depth: (maxY - minY + 1) * pitch - 2 * bodyInset,
    centerX: (minX + maxX) * pitch / 2, centerZ: -(minY + maxY) * pitch / 2,
    minLayer, maxLayer, baseY: minLayer * layerHeight, height, centerY: minLayer * layerHeight + height / 2 };
}

export function initialTechnicRecipe(): TechnicRecipe {
  const cells: TechnicCell[] = [];
  for (let y = 0; y < 5; y++) for (let x = 0; x < 7; x++) {
    if (x === 0 || x === 6 || y === 0 || y === 4) cells.push({ x, y, kind: "pin", axis: "Z", roll: 0 });
  }
  return { version: 1, pitch: 8, height: 8, holeAdjustment: 0, cells };
}

/** Pattern rows run from back to front, like the top-view editor. */
export function parseTechnicPattern(text: string, axis: TechnicCell["axis"], roll: TechnicCell["roll"]): TechnicCell[] | null {
  const rows = text.trim().split(/\r?\n/).map(row => row.trim());
  if (!rows.length || rows.length > 32 || !rows[0].length || rows[0].length > 32
    || rows.some(row => row.length !== rows[0].length || /[^#o+.]/.test(row))) return null;
  const cells: TechnicCell[] = [];
  rows.forEach((row, y) => [...row].forEach((char, x) => {
    if (char !== ".") cells.push({ x, y: rows.length - 1 - y, kind: char === "#" ? "solid" : char === "o" ? "pin" : "axle", axis, roll });
  }));
  return cells.length && cells.length <= TECHNIC_CELL_LIMIT ? cells : null;
}

export function technicPattern(recipe: TechnicRecipe) {
  if (!recipe.cells.length) return "";
  const b = technicBounds(recipe);
  if (b.maxX - b.minX >= 32 || b.maxY - b.minY >= 32) return "";
  const cells = new Map(recipe.cells.map(c => [technicCellKey(c.x, c.y), c]));
  return Array.from({ length: b.maxY - b.minY + 1 }, (_, row) =>
    Array.from({ length: b.maxX - b.minX + 1 }, (_, col) => {
      const c = cells.get(technicCellKey(b.minX + col, b.maxY - row));
      return !c ? "." : c.kind === "solid" ? "#" : c.kind === "pin" ? "o" : "+";
    }).join("")).join("\n");
}
