import * as THREE from "three";
import type { WorkplaneShape } from "@/types/layerling";
import { createLocalId } from "@/lib/localIds";
import { getManifoldRuntime, type ManifoldSolid } from "@/lib/editorMeshCore";
import { disposeManifold, quaternionForShape } from "@/lib/editorBooleans";
import { shapeHasShapeDeform } from "@/lib/workplaneShapes";
import { technicBounds, technicCellKey, technicMeshFingerprint, validTechnicRecipe, type TechnicRecipe } from "@/lib/technicRecipe";

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
    for (const c of recipe.cells) {
      if (c.kind === "solid") continue;
      const diameter = PIN_DIAMETER + recipe.holeAdjustment;
      // The kernel's cylinder axis is local Z. Only axial overrun avoids thin skins;
      // cross-section dimensions are never padded.
      let bore = keep(runtime.Manifold.cylinder(8.04, diameter / 2, diameter / 2, SIDES, true));
      if (c.kind === "axle") {
        const arm = AXLE_ARM_WIDTH + recipe.holeAdjustment;
        const a = keep(runtime.Manifold.cube([diameter, arm, 8.04], true));
        const b = keep(runtime.Manifold.cube([arm, diameter, 8.04], true));
        const cross = keep(runtime.Manifold.union([a, b]));
        bore = keep(bore.intersect(cross));
        if (c.roll) bore = keep(bore.rotate([0, 0, c.roll]));
      }
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
