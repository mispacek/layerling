/**
 * What one mouse-wheel notch counts for in the zoom (#331).
 *
 * OrbitControls scales the camera distance by how far the browser says the wheel has turned. That
 * number differs: Chrome on Windows sends 100 for a notch, Safari on a Mac with a plain mouse sent
 * 12, so a notch there zoomed an eighth as much, with the zoom speed at its top. A step that
 * arrives alone and is smaller than a notch is a notch of a mouse and counts as one. A trackpad or
 * a smooth wheel sends many small steps in a row; those stay as they come, and so does a pinch
 * on a trackpad (Ctrl held).
 */
export const WHEEL_NOTCH_DELTA = 100;

/** A step this long after the one before it stands alone: a notch, not a stream of a trackpad. */
export const WHEEL_ALONE_GAP_MS = 80;

export function wheelZoomDelta(event: { deltaY: number; deltaMode: number; ctrlKey: boolean }, msSinceLastWheel: number): number {
  if (event.ctrlKey || event.deltaMode !== 0) return event.deltaY;
  const size = Math.abs(event.deltaY);
  if (size === 0 || size >= WHEEL_NOTCH_DELTA) return event.deltaY;
  if (!(msSinceLastWheel >= WHEEL_ALONE_GAP_MS)) return event.deltaY;
  return Math.sign(event.deltaY) * WHEEL_NOTCH_DELTA;
}
