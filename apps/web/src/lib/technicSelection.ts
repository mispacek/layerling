import { TECHNIC_CELL_LIMIT, technicCellKey, type TechnicCell, type TechnicRecipe } from "./technicRecipe";

export function technicRectangle(cells: TechnicCell[], a: { x: number; y: number }, b: { x: number; y: number }) {
  return cells.filter(c => c.x >= Math.min(a.x, b.x) && c.x <= Math.max(a.x, b.x)
    && c.y >= Math.min(a.y, b.y) && c.y <= Math.max(a.y, b.y)).map(c => technicCellKey(c.x, c.y));
}
export type TechnicTransform = { kind: "move" | "copy"; dx: number; dy: number } | { kind: "mirrorX" } | { kind: "mirrorY" };
/** Reject overlap rather than overwrite unselected material. Mirror includes axle roll handedness. */
export function transformTechnicSelection(recipe: TechnicRecipe, selection: string[], operation: TechnicTransform): { recipe: TechnicRecipe; selection: string[] } | null {
  const keys = new Set(selection);
  const selected = recipe.cells.filter(c => keys.has(technicCellKey(c.x, c.y)));
  if (!selected.length) return null;
  const minX = Math.min(...selected.map(c => c.x)), maxX = Math.max(...selected.map(c => c.x));
  const minY = Math.min(...selected.map(c => c.y)), maxY = Math.max(...selected.map(c => c.y));
  const moved = selected.map(c => operation.kind === "mirrorX" ? { ...c, x: minX + maxX - c.x }
    : operation.kind === "mirrorY" ? { ...c, y: minY + maxY - c.y }
    : { ...c, x: c.x + operation.dx, y: c.y + operation.dy });
  // A symmetric cross at 0/45 degrees is invariant under reflection in X or Y.
  const remaining = operation.kind === "copy" ? recipe.cells : recipe.cells.filter(c => !keys.has(technicCellKey(c.x, c.y)));
  const occupied = new Set(remaining.map(c => technicCellKey(c.x, c.y)));
  if (remaining.length + moved.length > TECHNIC_CELL_LIMIT || moved.some(c => Math.abs(c.x) > 128 || Math.abs(c.y) > 128
    || occupied.has(technicCellKey(c.x, c.y)))) return null;
  return { recipe: { ...recipe, cells: [...remaining, ...moved] }, selection: moved.map(c => technicCellKey(c.x, c.y)) };
}
