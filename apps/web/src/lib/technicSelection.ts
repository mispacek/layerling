import { TECHNIC_CELL_LIMIT, technicCellKey, technicLayer, technicLayerCount, type TechnicCell, type TechnicRecipe } from "./technicRecipe";
import { appendTechnicLayer } from "./technicLayers";

export function technicRectangle(cells: TechnicCell[], a: { x: number; y: number }, b: { x: number; y: number }, layer = 0) {
  return cells.filter(c => technicLayer(c) === layer && c.x >= Math.min(a.x, b.x) && c.x <= Math.max(a.x, b.x)
    && c.y >= Math.min(a.y, b.y) && c.y <= Math.max(a.y, b.y)).map(c => technicCellKey(c.x, c.y, technicLayer(c)));
}
export type TechnicTransform = { kind: "move" | "copy"; dx: number; dy: number; layer?: number } | { kind: "mirrorX" } | { kind: "mirrorY" };
/** Reject overlap rather than overwrite unselected material. Mirror includes axle roll handedness. */
export function transformTechnicSelection(recipe: TechnicRecipe, selection: string[], operation: TechnicTransform): { recipe: TechnicRecipe; selection: string[] } | null {
  const keys = new Set(selection);
  const selected = recipe.cells.filter(c => keys.has(technicCellKey(c.x, c.y, technicLayer(c))));
  if (!selected.length) return null;
  if ((operation.kind === "move" || operation.kind === "copy") && operation.layer !== undefined
    && (!Number.isInteger(operation.layer) || operation.layer < 0 || operation.layer >= technicLayerCount(recipe))) return null;
  const minX = Math.min(...selected.map(c => c.x)), maxX = Math.max(...selected.map(c => c.x));
  const minY = Math.min(...selected.map(c => c.y)), maxY = Math.max(...selected.map(c => c.y));
  const moved = selected.map(c => operation.kind === "mirrorX" ? { ...c, x: minX + maxX - c.x }
    : operation.kind === "mirrorY" ? { ...c, y: minY + maxY - c.y }
    : { ...c, x: c.x + operation.dx, y: c.y + operation.dy, ...(operation.layer !== undefined ? { z: operation.layer } : {}) });
  // A symmetric cross at 0/45 degrees is invariant under reflection in X or Y.
  const remaining = operation.kind === "copy" ? recipe.cells : recipe.cells.filter(c => !keys.has(technicCellKey(c.x, c.y, technicLayer(c))));
  const occupied = new Set(remaining.map(c => technicCellKey(c.x, c.y, technicLayer(c))));
  if (remaining.length + moved.length > TECHNIC_CELL_LIMIT || moved.some(c => Math.abs(c.x) > 128 || Math.abs(c.y) > 128
    || occupied.has(technicCellKey(c.x, c.y, technicLayer(c))))) return null;
  return { recipe: { ...recipe, cells: [...remaining, ...moved] }, selection: moved.map(c => technicCellKey(c.x, c.y, technicLayer(c))) };
}

/** Transfer one floor's selection at unchanged XY, optionally appending a new floor atomically. */
export function transferTechnicSelection(recipe: TechnicRecipe, selection: string[], kind: "move" | "copy", layer: number) {
  const selected = recipe.cells.filter(c => selection.includes(technicCellKey(c.x, c.y, technicLayer(c))));
  if (!selected.length || new Set(selected.map(technicLayer)).size !== 1 || technicLayer(selected[0]) === layer
    || !Number.isInteger(layer) || layer < 0 || layer > technicLayerCount(recipe)) return null;
  const draft = layer === technicLayerCount(recipe) ? appendTechnicLayer(recipe) : recipe;
  return draft ? transformTechnicSelection(draft, selection, { kind, dx: 0, dy: 0, layer }) : null;
}
