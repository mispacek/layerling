import type * as THREE from "three";

type FrameAxes = { xAxis: THREE.Vector3; zAxis: THREE.Vector3 };
type Signs = { x: number; z: number };

/**
 * The numbers on the edges of a body count along the workplane; its fields (width, depth) count along
 * its own sides. With a workplane on a face, and a body turned by a quarter, the two differ: the number
 * on the long edge belongs to the field called depth, not width (#419). Returns the field a mark stands
 * for and how a held edge (the signs of the handle, in the workplane's frame) reads in the body's own
 * frame - or null when the body does not lie along the workplane's axes, where the mark is only the box
 * round it and belongs to no single side.
 */
export function ownSideForMark(markFrame: FrameAxes, ownFrame: FrameAxes, markAxis: "width" | "depth") {
  const along = markAxis === "width" ? markFrame.xAxis : markFrame.zAxis;
  const alongWidth = Math.abs(along.dot(ownFrame.xAxis));
  const alongDepth = Math.abs(along.dot(ownFrame.zAxis));
  if (Math.max(alongWidth, alongDepth) < 0.98) return null;
  // The mark's axis runs along the body's own width or depth: that side is the one it stands for.
  const axis: "width" | "depth" = alongWidth > alongDepth ? "width" : "depth";
  const convertSigns = (signs: Signs): Signs => {
    const direction = markFrame.xAxis.clone().multiplyScalar(signs.x).addScaledVector(markFrame.zAxis, signs.z);
    const x = direction.dot(ownFrame.xAxis);
    const z = direction.dot(ownFrame.zAxis);
    return { x: Math.abs(x) > 0.5 ? Math.sign(x) : 0, z: Math.abs(z) > 0.5 ? Math.sign(z) : 0 };
  };
  return { axis, convertSigns };
}
