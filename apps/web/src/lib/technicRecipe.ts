/** A sparse, editable construction recipe. Model axes are X/right, Y/back, Z/up. */
export type TechnicCell = { x: number; y: number; kind: "solid" | "pin" | "axle"; axis: "X" | "Y" | "Z"; roll: 0 | 45 };
export type TechnicRecipe = { version: 1; pitch: 8; height: 8; holeAdjustment: number; cells: TechnicCell[]; meshFingerprint?: string };
export const TECHNIC_CELL_LIMIT = 256;
export const technicCellKey = (x: number, y: number) => `${x},${y}`;

export function validTechnicRecipe(value: unknown): value is TechnicRecipe {
  if (!value || typeof value !== "object") return false;
  const r = value as TechnicRecipe;
  if (r.version !== 1 || r.pitch !== 8 || r.height !== 8 || !Number.isFinite(r.holeAdjustment)
    || Math.abs(r.holeAdjustment) > 0.4 || !Array.isArray(r.cells) || !r.cells.length || r.cells.length > TECHNIC_CELL_LIMIT
    || (r.meshFingerprint !== undefined && (typeof r.meshFingerprint !== "string" || r.meshFingerprint.length > 64 || !/^\d+:\d+:\d+$/.test(r.meshFingerprint)))) return false;
  const keys = new Set<string>();
  for (const c of r.cells) {
    if (!c || !Number.isInteger(c.x) || !Number.isInteger(c.y) || Math.abs(c.x) > 128 || Math.abs(c.y) > 128
      || !["solid", "pin", "axle"].includes(c.kind) || !["X", "Y", "Z"].includes(c.axis) || ![0, 45].includes(c.roll)) return false;
    const key = technicCellKey(c.x, c.y);
    if (keys.has(key)) return false;
    keys.add(key);
  }
  return true;
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
  const xs = recipe.cells.map(c => c.x), ys = recipe.cells.map(c => c.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  return { minX, maxX, minY, maxY, width: (maxX - minX + 1) * 8, depth: (maxY - minY + 1) * 8,
    centerX: (minX + maxX) * 4, centerZ: -(minY + maxY) * 4 };
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
