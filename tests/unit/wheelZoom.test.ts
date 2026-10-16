import { describe, expect, it } from "vitest";
import { wheelZoomDelta, WHEEL_ALONE_GAP_MS, WHEEL_NOTCH_DELTA } from "@/lib/wheelZoom";

const pixels = (deltaY: number, ctrlKey = false) => ({ deltaY, deltaMode: 0, ctrlKey });

describe("wheelZoomDelta (#331)", () => {
  it("counts a small step that stands alone as a notch of 100, in its direction", () => {
    expect(wheelZoomDelta(pixels(-12), 500)).toBe(-WHEEL_NOTCH_DELTA);
    expect(wheelZoomDelta(pixels(12), 500)).toBe(WHEEL_NOTCH_DELTA);
    expect(wheelZoomDelta(pixels(-12), WHEEL_ALONE_GAP_MS)).toBe(-WHEEL_NOTCH_DELTA);
  });

  it("leaves the steps of a stream alone, as a trackpad or a smooth wheel sends them", () => {
    expect(wheelZoomDelta(pixels(-3), 16)).toBe(-3);
    expect(wheelZoomDelta(pixels(7.5), WHEEL_ALONE_GAP_MS - 1)).toBe(7.5);
  });

  it("leaves a notch of 100 or more as it comes", () => {
    expect(wheelZoomDelta(pixels(100), 500)).toBe(100);
    expect(wheelZoomDelta(pixels(-240), 500)).toBe(-240);
  });

  it("leaves a pinch on a trackpad (Ctrl held) and a wheel counted in lines or pages alone", () => {
    expect(wheelZoomDelta(pixels(-4, true), 500)).toBe(-4);
    expect(wheelZoomDelta({ deltaY: -3, deltaMode: 1, ctrlKey: false }, 500)).toBe(-3);
    expect(wheelZoomDelta({ deltaY: -1, deltaMode: 2, ctrlKey: false }, 500)).toBe(-1);
  });

  it("does not turn a step of zero into a notch, and takes the first step ever as one that stands alone", () => {
    expect(wheelZoomDelta(pixels(0), 500)).toBe(0);
    expect(wheelZoomDelta(pixels(-12), Number.POSITIVE_INFINITY)).toBe(-WHEEL_NOTCH_DELTA);
  });
});
