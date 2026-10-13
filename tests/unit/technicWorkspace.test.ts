// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TechnicWorkspace } from "@/components/TechnicWorkspace";
import { initialTechnicRecipe, type TechnicRecipe } from "@/lib/technicRecipe";
import { t } from "@/lib/i18n";

let host: HTMLDivElement, root: Root;
const initial = initialTechnicRecipe();
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
async function click(selector: string) {
  const node = host.querySelector<HTMLButtonElement>(selector)!;
  expect(node).not.toBeNull();
  await act(async () => node.click());
}
async function button(text: string) {
  const node = [...host.querySelectorAll<HTMLButtonElement>("button")].find(n => n.textContent?.trim().endsWith(text))!;
  expect(node).not.toBeUndefined();
  await act(async () => node.click());
}
async function render(onApply = vi.fn(async (_recipe: TechnicRecipe) => {}), onCancel = vi.fn()) {
  await act(async () => root.render(createElement(TechnicWorkspace, { initial, onApply, onCancel })));
  return { onApply, onCancel };
}
describe("construction workspace draft", () => {
  it("samples and stamps orientation and rounding while preserving cell types and empty space", async () => {
    const { onApply } = await render();
    await click('[data-cell="0,0"]'); await button(t("technic.axle")); await button("X"); await button("45°");
    await act(async () => { const select = host.querySelector<HTMLSelectElement>('.technic-rounding select')!; select.value = "outer"; select.dispatchEvent(new Event("change", { bubbles: true })); });
    await button(t("technic.mode.set")); await click('[data-cell="1,0"]'); await click('[data-cell="-1,0"]');
    await button(t("technic.done"));
    const result = onApply.mock.calls[0][0];
    expect(result.cells).toHaveLength(20);
    expect(result.cells.find(c => c.x === 1 && c.y === 0)).toMatchObject({ kind: "pin", axis: "X", roll: 45, rounding: "outer" });
    expect(result.cells.find(c => c.x === -1)).toBeUndefined();
  });
  it("does not move cells under a held pointer when painting at the visible boundary", async () => {
    await render(); await button(t("technic.mode.add"));
    const before = host.querySelector(".technic-cell")!.getAttribute("data-cell");
    const boundary = host.querySelector('[data-cell="-2,0"]')!;
    await act(async () => boundary.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0, buttons: 1 })));
    expect(host.querySelector(".technic-cell")!.getAttribute("data-cell")).toBe(before);
    expect(host.querySelectorAll(".technic-cell.filled")).toHaveLength(21);
    await act(async () => boundary.dispatchEvent(new MouseEvent("pointerup", { bubbles: true, button: 0, buttons: 0 })));
    expect(host.querySelector(".technic-cell")!.getAttribute("data-cell")).toBe("-3,6");
    expect(host.querySelectorAll(".technic-cell.filled")).toHaveLength(21);
  });
  it("selection does not paint; adds outside all four sides; undo and redo restore the draft", async () => {
    const { onApply } = await render();
    await click('[data-cell="-1,0"]');
    expect(host.querySelectorAll(".technic-cell.filled")).toHaveLength(20);
    await button(t("technic.mode.add")); await button(t("technic.solid"));
    for (const cell of ["-1,0", "7,0", "0,-1", "0,5"]) await click(`[data-cell="${cell}"]`);
    expect(host.querySelectorAll(".technic-cell.filled")).toHaveLength(24);
    await click(`button[aria-label="${t("editor.tool.undo")}"]`);
    expect(host.querySelectorAll(".technic-cell.filled")).toHaveLength(23);
    await click(`button[aria-label="${t("editor.tool.redo")}"]`);
    await button(t("technic.done"));
    expect(onApply).toHaveBeenCalledOnce();
    const recipe = onApply.mock.calls[0][0];
    expect(recipe.cells).toHaveLength(24);
    expect(recipe.cells.filter(c => c.kind === "solid")).toHaveLength(4);
    expect(initial.cells).toHaveLength(20);
  });
  it("edits only the selected cell, retains direction and roll, and cancels without committing", async () => {
    const { onApply, onCancel } = await render();
    await click('[data-cell="0,0"]'); await button(t("technic.axle")); await button("X"); await button("45°");
    expect(host.querySelector('[data-cell="0,0"]')?.className).toContain("axle");
    expect(host.querySelector('[data-cell="0,0"] small')?.textContent).toBe("X");
    expect(host.querySelectorAll(".technic-cell.axle")).toHaveLength(1);
    await act(async () => host.querySelector(".technic-workspace")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(onCancel).toHaveBeenCalledOnce(); expect(onApply).not.toHaveBeenCalled();
  });
  it("keeps the draft open after a failed build and permits correcting it", async () => {
    const onApply = vi.fn(async (_recipe: TechnicRecipe) => { throw new Error("Failed build"); });
    await render(onApply);
    await button(t("technic.done"));
    expect(host.querySelector('[role="alert"]')?.textContent).toBe("Failed build");
    await button(t("technic.mode.remove")); await click('[data-cell="0,0"]');
    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(host.querySelectorAll(".technic-cell.filled")).toHaveLength(19);
  });
});
