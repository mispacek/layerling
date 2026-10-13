import { TECHNIC_CELL_LIMIT, TECHNIC_LAYER_LIMIT, technicLayer, technicLayerCount, type TechnicRecipe } from "./technicRecipe";

/** Append an empty floor, or a copy of the active floor, without moving existing cells. */
export function appendTechnicLayer(recipe: TechnicRecipe, source?: number): TechnicRecipe | null {
  const count = technicLayerCount(recipe);
  if (count >= TECHNIC_LAYER_LIMIT) return null;
  const copied = source === undefined ? [] : recipe.cells.filter(c => technicLayer(c) === source).map(c => ({ ...c, z: count }));
  if (recipe.cells.length + copied.length > TECHNIC_CELL_LIMIT) return null;
  return { ...recipe, version: 2, layerCount: count + 1, cells: [...recipe.cells, ...copied] };
}

/** Removing a floor deliberately lowers all floors above it by one; undo restores the whole recipe. */
export function removeTechnicLayer(recipe: TechnicRecipe, layer: number): TechnicRecipe | null {
  const count = technicLayerCount(recipe);
  if (count <= 1 || layer < 0 || layer >= count) return null;
  return { ...recipe, version: 2, layerCount: count - 1, cells: recipe.cells.filter(c => technicLayer(c) !== layer)
    .map(c => technicLayer(c) > layer ? { ...c, z: technicLayer(c) - 1 } : c) };
}
