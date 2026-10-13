import { technicCellKey, technicLayer, type TechnicRecipe } from "./technicRecipe";

// One texel per allowed XY coordinate (-128..128). Fragment lookup can highlight
// a selected cell even on a large coplanar triangle spanning several joined cells.
export const TECHNIC_SELECTION_TEXTURE_SIZE = 257;
export const TECHNIC_PREVIEW_COLORS = { active: "#cf101b", selected: "#f2a43a", inactive: "#89929c" } as const;
export function technicSelectionMask(recipe: TechnicRecipe, layer: number, selection: readonly string[]) {
  const data = new Uint8Array(TECHNIC_SELECTION_TEXTURE_SIZE ** 2), keys = new Set(selection);
  for (const c of recipe.cells) if (technicLayer(c) === layer && keys.has(technicCellKey(c.x, c.y, layer))) {
    data[(c.y + 128) * TECHNIC_SELECTION_TEXTURE_SIZE + c.x + 128] = 255;
  }
  return data;
}
