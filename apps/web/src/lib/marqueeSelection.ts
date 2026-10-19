/*
 * The selection frame (#430). By default it selects every body it touches, in whichever direction
 * it is dragged. With "the direction of the drag decides" switched on, it works as in SketchUp
 * and CAD programs: dragged from left to right it takes only what lies completely inside it,
 * dragged from right to left everything it touches.
 */

export type MarqueeMode = "touch" | "enclose";

export type ScreenBox = { minX: number; maxX: number; minY: number; maxY: number };
export type ScreenRect = { left: number; top: number; right: number; bottom: number };

/** What a frame dragged from startX to currentX selects. */
export function marqueeMode(frameByDirection: boolean, startX: number, currentX: number): MarqueeMode {
  return frameByDirection && currentX >= startX ? "enclose" : "touch";
}

/** Whether a body's screen frame lies completely inside the selection frame. */
export function boundsInsideRect(bounds: ScreenBox, rect: ScreenRect) {
  return bounds.minX >= rect.left && bounds.maxX <= rect.right && bounds.minY >= rect.top && bounds.maxY <= rect.bottom;
}
