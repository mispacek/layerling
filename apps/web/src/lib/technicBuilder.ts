import * as THREE from "three";
import type { WorkplaneShape } from "@/types/layerling";
import { createLocalId } from "@/lib/localIds";
import { getManifoldRuntime, type ManifoldSolid } from "@/lib/editorMeshCore";
import { disposeManifold, quaternionForShape } from "@/lib/editorBooleans";
import { shapeHasShapeDeform } from "@/lib/workplaneShapes";
import { DEFAULT_TECHNIC_CORNER_RADIUS, technicBounds, technicCellKey, technicCorners, technicMeshFingerprint, validTechnicRecipe, type TechnicRecipe } from "@/lib/technicRecipe";

// Reference dimensions: marian42/partdesigner/src/measurements.ts (MIT).
// These are modelling defaults, not a guarantee of a particular printer's fit.
const PIN_DIAMETER = 4.95;
const RECESS_DIAMETER = 6.4;
const RECESS_DEPTH = 0.89;
const AXLE_ARM_WIDTH = 2.02;
const SIDES = 96;

/** Ordinary geometry changes must not be overwritten by regenerating an old recipe. */
export function canEditTechnic(shape: WorkplaneShape): boolean {
  if (!validTechnicRecipe(shape.technicRecipe) || shape.locked || shape.hole || shape.cadBrep
    || shape.edgeTreatments?.length || shape.edgeTreatmentHistory?.length || shape.groupedShapes?.length
    || shapeHasShapeDeform(shape)) return false;
  if (!shape.importedMesh || shape.technicRecipe.meshFingerprint !== technicMeshFingerprint(shape.importedMesh.positions)) return false;
  const b = technicBounds(shape.technicRecipe);
  return Math.abs(shape.width - b.width) < 1e-6 && Math.abs(shape.depth - b.depth) < 1e-6 && Math.abs(shape.height - 8) < 1e-6;
}

export async function buildTechnicShape(recipe: TechnicRecipe, triangleLimit: number): Promise<WorkplaneShape> {
  if (!validTechnicRecipe(recipe)) throw new Error("technic.error.recipe");
  const runtime = await getManifoldRuntime();
  const created: ManifoldSolid[] = [];
  const keep = (s: ManifoldSolid) => { created.push(s); return s; };
  try {
    const occupied = new Set(recipe.cells.map(c => technicCellKey(c.x, c.y)));
    const blocks = recipe.cells.map(c => keep(keep(runtime.Manifold.cube([8, 8, 8], true)).translate([c.x * 8, 4, -c.y * 8])));
    let body = keep(runtime.Manifold.union(blocks));
    const cutters: ManifoldSolid[] = [];
    const additions: ManifoldSolid[] = [];
    const corners = technicCorners(recipe);
    const radius = recipe.cornerRadius ?? DEFAULT_TECHNIC_CORNER_RADIUS;
    for (const corner of corners) {
      const direction = corner.kind === "convex" ? -1 : 1;
      const dx = corner.sx * direction, dy = corner.sy * direction;
      // A square minus a quarter cylinder removes a convex tip or fills a concave pocket.
      // Convex cutters overrun vertically; added material has exactly the body's height.
      const height = corner.kind === "convex" ? 8.04 : 8;
      const square = keep(keep(runtime.Manifold.cube([radius, height, radius], true))
        .translate([corner.x + dx * radius / 2, 4, -(corner.y + dy * radius / 2)]));
      const circle = keep(keep(keep(runtime.Manifold.cylinder(8.08, radius, radius, SIDES, true))
        .rotate([-90, 0, 0])).translate([corner.x + dx * radius, 4, -(corner.y + dy * radius)]));
      const wedge = keep(square.subtract(circle));
      (corner.kind === "convex" ? cutters : additions).push(wedge);
    }
    if (additions.length) body = keep(runtime.Manifold.union([body, ...additions]));
    const hasConcaveCorners = additions.length > 0;
    for (const c of recipe.cells) {
      if (c.kind === "solid") continue;
      const diameter = PIN_DIAMETER + recipe.holeAdjustment;
      // The kernel's cylinder axis is local Z. Only axial overrun avoids thin skins;
      // cross-section dimensions are never padded.
      // Inner fillets can add material just outside an exposed cell face. Continue the
      // bore through that pocket, but never drill into a neighbouring solid cell.
      const axisStep = c.axis === "X" ? [1, 0] : [0, 1];
      const extension = (sign: number) => c.axis !== "Z" && hasConcaveCorners
        && !occupied.has(technicCellKey(c.x + axisStep[0] * sign, c.y + axisStep[1] * sign)) ? radius : 0;
      const before = extension(-1), after = extension(1), length = 8.04 + before + after;
      let bore = keep(runtime.Manifold.cylinder(length, diameter / 2, diameter / 2, SIDES, true));
      if (c.kind === "axle") {
        const arm = AXLE_ARM_WIDTH + recipe.holeAdjustment;
        const a = keep(runtime.Manifold.cube([diameter, arm, length], true));
        const b = keep(runtime.Manifold.cube([arm, diameter, length], true));
        const cross = keep(runtime.Manifold.union([a, b]));
        bore = keep(bore.intersect(cross));
        if (c.roll) bore = keep(bore.rotate([0, 0, c.roll]));
      }
      if (before !== after) bore = keep(bore.translate([0, 0, (after - before) / 2]));
      const orient = (s: ManifoldSolid) => keep(keep(s.rotate(c.axis === "X" ? [0, 90, 0] : c.axis === "Y" ? [0, 180, 0] : [-90, 0, 0])).translate([c.x * 8, 4, -c.y * 8]));
      cutters.push(orient(bore));
      if (c.kind === "pin") {
        for (const sign of [-1, 1]) {
          const neighbour = c.axis === "X" ? technicCellKey(c.x + sign, c.y) : technicCellKey(c.x, c.y + sign);
          if (c.axis !== "Z" && occupied.has(neighbour)) continue;
          const recess = keep(keep(runtime.Manifold.cylinder(RECESS_DEPTH + 0.02, (RECESS_DIAMETER + recipe.holeAdjustment) / 2, undefined, SIDES, true))
            .translate([0, 0, sign * (4 - RECESS_DEPTH / 2 + 0.01)]));
          cutters.push(orient(recess));
        }
      }
    }
    if (cutters.length) body = keep(body.subtract(keep(runtime.Manifold.union(cutters))));
    if (body.status() !== "NoError" || body.numTri() < 1 || body.numTri() > triangleLimit) throw new Error("technic.error.geometry");
    const mesh = body.getMesh();
    const b = technicBounds(recipe);
    const positions: number[] = [];
    for (const vertex of mesh.triVerts) {
      const offset = vertex * mesh.numProp;
      positions.push(mesh.vertProperties[offset] - b.centerX, mesh.vertProperties[offset + 1], mesh.vertProperties[offset + 2] - b.centerZ);
    }
    return { id: createLocalId("technic"), name: "Lego Compatible", kind: "mesh", color: "#cf101b", x: 0, z: 0, elevation: 0,
      width: b.width, depth: b.depth, height: 8, size: Math.max(b.width, b.depth), rotation: 0, locked: false, hidden: false,
      importedMesh: { positions, baseWidth: b.width, baseDepth: b.depth, baseHeight: 8, triangleCount: body.numTri(), sourceFormat: "json" },
      technicRecipe: { ...structuredClone(recipe), meshFingerprint: technicMeshFingerprint(positions) } };
  } finally {
    [...new Set(created)].reverse().forEach(disposeManifold);
  }
}

/** Preserve the world position of cell (0,0), even when the footprint grows on one side. */
export function replaceTechnicShape(previous: WorkplaneShape, generated: WorkplaneShape): WorkplaneShape {
  const before = technicBounds(previous.technicRecipe!), after = technicBounds(generated.technicRecipe!);
  const delta = new THREE.Vector3((after.centerX - before.centerX) * (previous.mirrorX ? -1 : 1), 0,
    (after.centerZ - before.centerZ) * (previous.mirrorZ ? -1 : 1)).applyQuaternion(quaternionForShape(previous));
  return { ...generated, id: previous.id, name: previous.name, color: previous.color, hidden: previous.hidden,
    transparent: previous.transparent, formulas: previous.formulas,
    rotationPivot: previous.rotationPivot ? [
      (previous.rotationPivot[0] * previous.width - (after.centerX - before.centerX)) / generated.width,
      previous.rotationPivot[1],
      (previous.rotationPivot[2] * previous.depth - (after.centerZ - before.centerZ)) / generated.depth,
    ] : undefined,
    rotation: previous.rotation, rotationX: previous.rotationX, rotationZ: previous.rotationZ,
    mirrorX: previous.mirrorX, mirrorY: previous.mirrorY, mirrorZ: previous.mirrorZ,
    x: previous.x + delta.x, z: previous.z + delta.z, elevation: (previous.elevation ?? 0) + delta.y };
}
