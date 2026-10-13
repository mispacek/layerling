"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Redo2, Undo2, X } from "lucide-react";
import { t } from "@/lib/i18n";
import { EdgeModifierSlider } from "@/components/workplane/EdgeModifierPanel";
import { DEFAULT_WORKPLANE_WORKSPACE } from "@/lib/workplaneSettings";
import type { WorkplaneWorkspaceSettings } from "@/types/layerling";
import { DEFAULT_TECHNIC_CORNER_RADIUS, TECHNIC_CELL_LIMIT, TECHNIC_LAYER_LIMIT, technicLayer, technicLayerCount, technicLayerRecipe, parseTechnicPattern, technicBounds, technicCellKey, technicCorners, technicPattern, technicRounding, type TechnicCell, type TechnicRecipe, type TechnicRounding } from "@/lib/technicRecipe";
import { DEFAULT_TECHNIC_MEASUREMENTS, TECHNIC_MEASUREMENT_RANGES, technicMeasurements, loadTechnicProfiles, saveTechnicProfile, type TechnicMeasurements, type TechnicPrintProfile } from "@/lib/technicMeasurements";
import { technicRectangle, transformTechnicSelection, transferTechnicSelection } from "@/lib/technicSelection";
import { TECHNIC_TEMPLATES, technicTemplate, technicCalibration, type TechnicTemplate } from "@/lib/technicTemplates";
import { appendTechnicLayer, removeTechnicLayer } from "@/lib/technicLayers";
import { TechnicPreview } from "./TechnicPreview";
import { TechnicModuleIcon } from "./TechnicModuleIcon";
import { parseMeasurementInput } from "@/lib/measurementUnits";
import { selectWholeValue } from "@/lib/numberField";

type DraftSnapshot = { recipe: TechnicRecipe; layer: number };
type Mode = "select" | "add" | "remove" | "set";

function fittedGridView(recipe: TechnicRecipe, columns: number, rows: number) {
  if (!recipe.cells.length) return { x: -Math.floor(columns / 2), y: Math.floor(rows / 2) };
  const b = technicBounds(recipe);
  const marginX = Math.max(0, Math.min(2, Math.floor((columns - (b.maxX - b.minX + 1)) / 2)));
  const marginY = Math.max(0, Math.min(2, Math.floor((rows - (b.maxY - b.minY + 1)) / 2)));
  return { x: Math.max(-128, Math.min(129 - columns, b.minX - marginX)),
    y: Math.max(-129 + rows, Math.min(128, b.maxY + marginY)) };
}

/** Match the editor's measurement fields: comma, point and arithmetic; commit on blur/Enter. */
function TechnicNumberField({ value, min, max, step = 1, integer = false, disabled, onChange }: {
  value: number; min: number; max: number; step?: number; integer?: boolean; disabled?: boolean; onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value)), [editing, setEditing] = useState(false);
  useEffect(() => { if (!editing) setDraft(String(value)); }, [value, editing]);
  const commit = () => {
    if (!editing) return;
    const parsed = parseMeasurementInput(draft);
    const next = Math.max(min, Math.min(max, Number.isFinite(parsed) ? integer ? Math.round(parsed) : parsed : value));
    if (Math.abs(next - value) > 1e-9) onChange(next);
    setEditing(false); setDraft(String(next));
  };
  return <input type="text" inputMode={integer ? "numeric" : "decimal"} value={editing ? draft : String(value)} disabled={disabled}
    onFocus={e => { setDraft(String(value)); setEditing(true); selectWholeValue(e.currentTarget); }}
    onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={e => {
      if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); e.currentTarget.blur(); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setDraft(String(value)); setEditing(false); }
      else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault(); e.stopPropagation();
        const next = Math.max(min, Math.min(max, Number((value + (e.key === "ArrowUp" ? step : -step)).toFixed(4))));
        onChange(next); setDraft(String(next));
      }
    }} />;
}

/** Top-view convention: a Z bore exposes its profile; horizontal bores are hidden lines with direction arrows. */
function TechnicHolePreview({ cell, recipe }: { cell: TechnicCell; recipe: TechnicRecipe }) {
  const m = technicMeasurements(recipe), scale = 20 / m.pitch;
  const adjustment = recipe.holeAdjustment + (cell.holeOffset ?? 0);
  const correction = cell.kind === "pin" ? m.pinCorrection : m.axleCorrection;
  const radius = Math.max(0.1, m.pinDiameter + adjustment + correction) * scale;
  const arm = Math.min(radius, Math.max(0.1, m.axleWidth + adjustment + correction) * scale);
  const end = Math.sqrt(radius * radius - arm * arm);
  // Rounded cross ends follow the same circle/strip intersection as the body builder.
  const cross = `M ${end} ${-arm} A ${radius} ${radius} 0 0 1 ${end} ${arm} L ${arm} ${arm} L ${arm} ${end} A ${radius} ${radius} 0 0 1 ${-arm} ${end} L ${-arm} ${arm} L ${-end} ${arm} A ${radius} ${radius} 0 0 1 ${-end} ${-arm} L ${-arm} ${-arm} L ${-arm} ${-end} A ${radius} ${radius} 0 0 1 ${arm} ${-end} L ${arm} ${-arm} Z`;
  const horizontal = cell.axis !== "Z";
  const extent = cell.kind === "axle" && cell.roll === 45 ? (end + arm) / Math.sqrt(2) : radius;
  return <svg className="technic-hole-preview" viewBox="0 0 40 40" aria-hidden="true"
    data-axis={cell.axis} data-profile={cell.kind} data-roll={cell.kind === "axle" ? cell.roll : 0}>
    {horizontal ? <g transform={cell.axis === "Y" ? "rotate(-90 20 20)" : undefined}>
      <rect className="technic-hidden-bore" x="0" y={20 - extent} width="40" height={extent * 2} />
      <path className="technic-bore-direction" d="M 3 20 H 37 M 8 15 L 3 20 L 8 25 M 32 15 L 37 20 L 32 25" />
    </g> : cell.kind === "pin" ? <>
      {m.recessDepth ? <circle className="technic-recess" cx="20" cy="20" r={(m.recessDiameter + adjustment + m.recessCorrection) * scale} /> : null}
      <circle className="technic-open-bore" cx="20" cy="20" r={radius} />
    </> : null}
    {cell.kind === "axle" ? <g transform={`translate(20 20) rotate(${-cell.roll})${horizontal ? " scale(0.45)" : ""}`}>
      <path className="technic-open-bore" d={cross} />
    </g> : null}
  </svg>;
}

export function TechnicWorkspace({ initial, initialRoundingOpen = false, workspace = DEFAULT_WORKPLANE_WORKSPACE, onApply, onCancel }: {
  initial: TechnicRecipe; initialRoundingOpen?: boolean; workspace?: WorkplaneWorkspaceSettings; onApply: (recipe: TechnicRecipe) => Promise<void>; onCancel: () => void;
}) {
  const [recipe, setRecipe] = useState(() => structuredClone(initial));
  const recipeRef = useRef(recipe);
  const [layer, setLayer] = useState(() => Math.min(...initial.cells.map(technicLayer)));
  const activeLayer = Math.min(layer, technicLayerCount(recipe) - 1);
  const activeLayerRef = useRef(activeLayer); activeLayerRef.current = activeLayer;
  const layerCount = technicLayerCount(recipe);
  const layerRecipe = useMemo(() => technicLayerRecipe(recipe, activeLayer), [recipe, activeLayer]);
  const [neighbours, setNeighbours] = useState(true);
  const [past, setPast] = useState<DraftSnapshot[]>([]);
  const [future, setFuture] = useState<DraftSnapshot[]>([]);
  const [mode, setMode] = useState<Mode>("select");
  const [roundingOpen, setRoundingOpen] = useState(initialRoundingOpen);
  const [brush, setBrush] = useState<Omit<TechnicCell, "x" | "y" | "z">>({ kind: "pin", axis: "Z", roll: 0 });
  const [selected, setSelected] = useState<string[]>([]);
  const [placement, setPlacement] = useState<"move" | "copy" | null>(null);
  const [transferLayer, setTransferLayer] = useState<number | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const selectionStroke = useRef<{ start: { x: number; y: number }; base: string[] } | null>(null);
  const paintStroke = useRef<DraftSnapshot | null>(null);
  const finishRef = useRef<() => void>(() => {});
  const [preview, setPreview] = useState(false);
  const [profiles, setProfiles] = useState<TechnicPrintProfile[]>([]);
  const [profileName, setProfileName] = useState("");
  const [profileNotice, setProfileNotice] = useState("");
  const [template, setTemplate] = useState<TechnicTemplate>("beam");
  const [templateWidth, setTemplateWidth] = useState(7);
  const [templateDepth, setTemplateDepth] = useState(5);
  const [calibrationStep, setCalibrationStep] = useState(0.1);
  const [calibrationAxis, setCalibrationAxis] = useState<TechnicCell["axis"]>("Z");
  const [view, setView] = useState(() => fittedGridView(technicLayerRecipe(initial, activeLayer), 12, 10));
  const [size, setSize] = useState({ columns: 12, rows: 10 });
  const [pattern, setPattern] = useState(() => technicPattern(technicLayerRecipe(initial, activeLayer)));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const pendingPan = useRef({ x: 0, y: 0 });
  const selectedCells = recipe.cells.filter(c => selected.includes(technicCellKey(c.x, c.y, technicLayer(c))));
  const defaultTarget = activeLayer + 1 < layerCount ? activeLayer + 1 : layerCount < TECHNIC_LAYER_LIMIT ? layerCount : activeLayer - 1;
  const transferTarget = transferLayer !== null && transferLayer !== activeLayer && transferLayer <= layerCount ? transferLayer : defaultTarget;
  const cell = selectedCells[0];
  const settings = mode === "select" && cell ? cell : brush;
  const bounds = recipe.cells.length ? technicBounds(recipe) : null;
  const corners = useMemo(() => technicCorners(layerRecipe), [layerRecipe]);
  const radius = recipe.cornerRadius ?? DEFAULT_TECHNIC_CORNER_RADIUS;
  const rounding = technicRounding(settings);
  const anyRounded = layerRecipe.cells.some(c => technicRounding(c) !== "none");
  const measurements = technicMeasurements(recipe);
  const ghost = placement && hover ? transformTechnicSelection(recipe, selected, { kind: placement,
    dx: hover.x - Math.min(...selectedCells.map(c => c.x)), dy: hover.y - Math.min(...selectedCells.map(c => c.y)) })?.selection : null;

  useEffect(() => {
    root.current?.focus(); setProfiles(loadTechnicProfiles());
    const finish = () => finishRef.current();
    window.addEventListener("pointerup", finish); window.addEventListener("pointercancel", finish);
    return () => { window.removeEventListener("pointerup", finish); window.removeEventListener("pointercancel", finish); };
  }, []);
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      const columns = Math.max(3, Math.min(24, Math.floor((width - 16) / 44)));
      const rows = Math.max(4, Math.min(24, Math.floor((height - 16) / 44)));
      setSize({ columns, rows });
      const slice = technicLayerRecipe(recipeRef.current, activeLayerRef.current);
      setView(fittedGridView(slice.cells.length ? slice : recipeRef.current, columns, rows));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function commit(next: TechnicRecipe) {
    if (JSON.stringify(next) === JSON.stringify(recipeRef.current)) return;
    const previous = recipeRef.current;
    if (!paintStroke.current) setPast(p => [...p.slice(-99), { recipe: previous, layer: activeLayer }]);
    setFuture([]);
    recipeRef.current = next;
    setRecipe(next);
    setPattern(technicPattern(technicLayerRecipe(next, Math.min(activeLayer, technicLayerCount(next) - 1))));
    setError("");
  }
  function undo() {
    if (busy || paintStroke.current || !past.length) return;
    const previous = past[past.length - 1];
    const current = recipeRef.current;
    setFuture(f => [{ recipe: current, layer: activeLayer }, ...f]);
    setPast(p => p.slice(0, -1));
    recipeRef.current = previous.recipe; setRecipe(previous.recipe); chooseLayer(previous.layer, previous.recipe); setError("");
  }
  function redo() {
    if (busy || paintStroke.current || !future.length) return;
    const next = future[0];
    const current = recipeRef.current;
    setPast(p => [...p, { recipe: current, layer: activeLayer }]); setFuture(f => f.slice(1));
    recipeRef.current = next.recipe; setRecipe(next.recipe); chooseLayer(next.layer, next.recipe); setError("");
  }
  function finishStroke() {
    selectionStroke.current = null;
    const start = paintStroke.current; paintStroke.current = null;
    if (start && start.recipe !== recipeRef.current) setPast(p => [...p.slice(-99), start]);
    pan(pendingPan.current.x, pendingPan.current.y); pendingPan.current = { x: 0, y: 0 };
  }
  finishRef.current = finishStroke;
  function paint(x: number, y: number, shift = false) {
    if (busy) return;
    if (Math.abs(x) > 128 || Math.abs(y) > 128) { setError(t("technic.error.recipe")); return; }
    const key = technicCellKey(x, y, activeLayer);
    const current = recipeRef.current;
    const target = current.cells.find(c => technicCellKey(c.x, c.y, technicLayer(c)) === key);
    if (mode === "set" && !target) return;
    if (mode === "select") {
      setError("");
      if (placement) {
        const result = transformTechnicSelection(current, selected, { kind: placement,
          dx: x - Math.min(...selectedCells.map(c => c.x)), dy: y - Math.min(...selectedCells.map(c => c.y)) });
        if (!result) { setError(t("technic.error.overlap")); return; }
        commit(result.recipe); setSelected(result.selection); setPlacement(null); return;
      }
      setSelected(s => shift ? target ? s.includes(key) ? s.filter(k => k !== key) : [...s, key] : s : target ? [key] : []);
      if (target) { const { x: _x, y: _y, z: _z, ...sample } = target; setBrush(sample); }
      return;
    }
    if (mode === "set") {
      commit({ ...current, cells: current.cells.map(c => c === target ? { ...c, axis: brush.axis, roll: brush.roll,
        holeOffset: brush.holeOffset, rounded: undefined, rounding: technicRounding(brush) } : c) });
      pendingPan.current = { x: 0, y: 0 };
      return;
    }
    const remaining = current.cells.filter(c => technicCellKey(c.x, c.y, technicLayer(c)) !== key);
    if (mode === "add") {
      if (remaining.length >= TECHNIC_CELL_LIMIT) { setError(t("technic.error.limit")); return; }
      remaining.push({ x, y, ...(activeLayer ? { z: activeLayer } : {}), ...brush });
    }
    commit({ ...current, cells: remaining });
    // Pan only AFTER pointer-up: moving cells under a held pointer would paint
    // extra rows through pointer-enter events, without another intentional stroke.
    pendingPan.current = mode === "add" ? {
      x: x === view.x ? -1 : x === view.x + size.columns - 1 ? 1 : 0,
      y: y === view.y ? 1 : y === view.y - size.rows + 1 ? -1 : 0,
    } : { x: 0, y: 0 };
  }
  function change(patch: Partial<typeof brush>) {
    setBrush(b => ({ ...b, ...patch }));
    if (mode === "select" && cell) commit({ ...recipeRef.current, cells: recipeRef.current.cells.map(c => selected.includes(technicCellKey(c.x, c.y, technicLayer(c))) ? { ...c, ...patch } : c) });
  }
  function chooseLayer(next: number, draft = recipeRef.current) {
    finishStroke();
    const z = Math.max(0, Math.min(technicLayerCount(draft) - 1, next));
    setLayer(z); activeLayerRef.current = z;
    setSelected([]); setPlacement(null); setHover(null); setTransferLayer(null);
    setError("");
    const slice = technicLayerRecipe(draft, z);
    setPattern(technicPattern(slice));
    setView(fittedGridView(slice.cells.length ? slice : draft, size.columns, size.rows));
  }
  function appendLayer(copy = false) {
    const next = appendTechnicLayer(recipeRef.current, copy ? activeLayer : undefined);
    if (!next) { setError(t("technic.error.layerLimit")); return; }
    commit(next); chooseLayer(technicLayerCount(next) - 1, next); setPreview(true);
  }
  function replaceDraft(next: TechnicRecipe) {
    const cells = [...recipeRef.current.cells.filter(c => technicLayer(c) !== activeLayer),
      ...next.cells.map(c => ({ ...c, ...(activeLayer ? { z: activeLayer } : {}) }))];
    if (cells.length > TECHNIC_CELL_LIMIT) { setError(t("technic.error.limit")); return; }
    const combined = { ...recipeRef.current, cells };
    commit(combined); chooseLayer(activeLayer, combined);
    // On a narrow screen the panel is below the drawing. Show the result after
    // replacing a pattern instead of leaving the pupil at the bottom of its controls.
    root.current?.scrollTo?.({ top: 0 });
  }
  function mirror(kind: "mirrorX" | "mirrorY") {
    const result = transformTechnicSelection(recipeRef.current, selected, { kind });
    if (!result) { setError(t("technic.error.overlap")); return; }
    commit(result.recipe); setSelected(result.selection);
  }
  function transfer(kind: "move" | "copy") {
    const result = transferTechnicSelection(recipeRef.current, selected, kind, transferTarget);
    if (!result) { setError(t("technic.error.overlap")); return; }
    commit(result.recipe); chooseLayer(transferTarget, result.recipe); setSelected(result.selection); setPreview(true);
    root.current?.scrollTo?.({ top: 0 });
  }
  function pan(x: number, y: number) {
    setView(v => ({ x: Math.max(-128, Math.min(129 - size.columns, v.x + x)), y: Math.max(-129 + size.rows, Math.min(128, v.y + y)) }));
  }
  async function apply() {
    setBusy(true); setError("");
    try { await onApply(recipeRef.current); }
    catch (e) { setError(e instanceof Error ? e.message : t("technic.error.geometry")); setBusy(false); }
  }

  return <div className="technic-workspace" ref={root} tabIndex={-1} onKeyDown={event => {
    // Draft shortcuts stay here; the project's history is untouched until Done.
    event.stopPropagation();
    const editing = event.target instanceof Element && !!event.target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])");
    const key = event.key.toLowerCase();
    if (!busy && !editing && !event.nativeEvent.isComposing && !event.ctrlKey && !event.metaKey && !event.altKey
      && ["x", "y", "z"].includes(key) && mode !== "remove" && settings.kind !== "solid") {
      event.preventDefault(); change({ axis: key.toUpperCase() as TechnicCell["axis"] }); return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") event.preventDefault();
    if (event.key === "Escape") { event.preventDefault(); if (placement) setPlacement(null); else onCancel(); }
    else if ((event.ctrlKey || event.metaKey) && ["z", "y"].includes(event.key.toLowerCase())
      && !editing) {
      event.preventDefault(); if (event.key.toLowerCase() === "y" || event.shiftKey) redo(); else undo();
    }
  }}>
    <section className="technic-drawing" aria-label={t("technic.canvas")}>
      <div className="technic-view-tools">
        <strong>{t("technic.topView")}</strong><span>{t("technic.pitchValue", { pitch: measurements.pitch })}</span>
        <button className="technic-preview-toggle" aria-pressed={preview} disabled={busy} onClick={() => setPreview(p => !p)}>{t("technic.preview")}</button>
        <button title={t("editor.tool.undo")} aria-label={t("editor.tool.undo")} disabled={busy || !past.length} onClick={undo}><Undo2 size={17} /></button>
        <button title={t("editor.tool.redo")} aria-label={t("editor.tool.redo")} disabled={busy || !future.length} onClick={redo}><Redo2 size={17} /></button>
        <button title={t("technic.panLeft")} aria-label={t("technic.panLeft")} disabled={busy} onClick={() => pan(-4, 0)}><ArrowLeft size={17} /></button>
        <button title={t("technic.panRight")} aria-label={t("technic.panRight")} disabled={busy} onClick={() => pan(4, 0)}><ArrowRight size={17} /></button>
        <button title={t("technic.panUp")} aria-label={t("technic.panUp")} disabled={busy} onClick={() => pan(0, 4)}><ArrowUp size={17} /></button>
        <button title={t("technic.panDown")} aria-label={t("technic.panDown")} disabled={busy} onClick={() => pan(0, -4)}><ArrowDown size={17} /></button>
      </div>
      <div className="technic-layer-bar" aria-label={t("technic.layers")}>
        <button disabled={busy || activeLayer === 0} aria-label={t("technic.layerDown")} onClick={() => chooseLayer(activeLayer - 1)}><ArrowDown size={16} /></button>
        <label>{t("technic.activeLayer")}<select aria-label={t("technic.activeLayer")} disabled={busy} value={activeLayer} onChange={e => chooseLayer(Number(e.target.value))}>
          {Array.from({ length: layerCount }, (_, z) => <option key={z} value={z}>{t("technic.layerOption", { layer: z + 1, height: Number((z * measurements.height).toFixed(2)), count: recipe.cells.filter(c => technicLayer(c) === z).length })}</option>)}
        </select></label>
        <button disabled={busy || activeLayer === layerCount - 1} aria-label={t("technic.layerUp")} onClick={() => chooseLayer(activeLayer + 1)}><ArrowUp size={16} /></button>
        <button disabled={busy || layerCount >= TECHNIC_LAYER_LIMIT} onClick={() => appendLayer()}>{t("technic.addLayer")}</button>
        <label className="technic-neighbours"><input type="checkbox" checked={neighbours} onChange={e => setNeighbours(e.target.checked)} />{t("technic.neighbourLayers")}</label>
      </div>
      <div className="technic-views">
      <div className="technic-canvas" ref={canvas}>
        <div className="technic-grid" style={{ gridTemplateColumns: `repeat(${size.columns}, 44px)` }}>
          {Array.from({ length: size.columns * size.rows }, (_, index) => {
            const x = view.x + index % size.columns, y = view.y - Math.floor(index / size.columns);
            const key = technicCellKey(x, y, activeLayer), c = recipe.cells.find(c => c.x === x && c.y === y && technicLayer(c) === activeLayer);
            const below = neighbours ? recipe.cells.find(c => c.x === x && c.y === y && technicLayer(c) === activeLayer - 1) : undefined;
            const above = neighbours ? recipe.cells.find(c => c.x === x && c.y === y && technicLayer(c) === activeLayer + 1) : undefined;
            const neighbour = above ?? below;
            return <button type="button" key={key} disabled={busy || Math.abs(x) > 128 || Math.abs(y) > 128} data-cell={key}
              className={`technic-cell ${c ? `filled ${c.kind}` : ""} ${!c && below ? "layer-below" : ""} ${!c && above ? "layer-above" : ""} ${selected.includes(key) ? "selected" : ""} ${ghost?.includes(key) ? "technic-ghost" : ""}`}
              title={`X ${Number((x * measurements.pitch).toFixed(2))} mm, Y ${Number((y * measurements.pitch).toFixed(2))} mm${c ? ` · ${t(`technic.${c.kind}`)} · ${c.axis}` : ""}${c?.holeOffset !== undefined ? ` · Δ ${c.holeOffset.toFixed(2)} mm` : ""}`}
              aria-label={`X ${Number((x * measurements.pitch).toFixed(2))}, Y ${Number((y * measurements.pitch).toFixed(2))}: ${c ? t(`technic.${c.kind}`) : t("technic.empty")}${c && c.kind !== "solid" ? ` · ${t("technic.axis")}: ${c.axis}${c.kind === "axle" ? ` · ${c.roll}°` : ""}` : ""}`}
              onPointerDown={e => { if (e.button === 0) {
                e.preventDefault();
                root.current?.focus({ preventScroll: true });
                if (mode === "select" && !placement) selectionStroke.current = { start: { x, y }, base: e.shiftKey ? selected : [] };
                else if (mode !== "select") paintStroke.current = { recipe: recipeRef.current, layer: activeLayer };
                paint(x, y, e.shiftKey);
              } }}
              onPointerEnter={e => {
                setHover({ x, y });
                if (e.buttons !== 1) return;
                if (mode !== "select") paint(x, y);
                else if (selectionStroke.current) setSelected([...new Set([...selectionStroke.current.base,
                  ...technicRectangle(recipeRef.current.cells, selectionStroke.current.start, { x, y }, activeLayer)])]);
              }}
              onClick={e => { if (e.detail === 0) paint(x, y, e.shiftKey); }}>
              {c ? <>{c.kind !== "solid" ? <TechnicHolePreview cell={c} recipe={recipe} /> : null}
                {c.kind !== "solid" ? <small>{c.axis}</small> : null}</> : x === 0 && y === 0 ? <small>0,0</small> : null}
              {c?.holeOffset !== undefined ? <span className="technic-sample">{c.holeOffset > 0 ? "+" : ""}{c.holeOffset.toFixed(2)}</span> : null}
              {!c && neighbour ? <span className="technic-neighbour-preview" aria-hidden="true">{neighbour.kind === "solid" ? "■" : <TechnicHolePreview cell={neighbour} recipe={recipe} />}</span> : null}
              {!c && (above || below) ? <span className="technic-layer-ghost-label" aria-hidden="true">{below ? "↓" : ""}{above ? "↑" : ""}</span> : null}
            </button>;
          })}
          <svg className="technic-corner-overlay" aria-hidden="true" viewBox={`0 0 ${size.columns * 44} ${size.rows * 44}`}>
            {corners.map((corner, index) => {
              const px = (corner.x / measurements.pitch - view.x + 0.5) * 44, py = (view.y - corner.y / measurements.pitch + 0.5) * 44;
              const r = radius * 44 / measurements.pitch, convex = corner.kind === "convex";
              return <path key={index} className={convex ? "technic-corner-cut" : "technic-corner-fill"}
                transform={`translate(${px} ${py}) scale(${convex ? -corner.sx : corner.sx} ${convex ? corner.sy : -corner.sy})`}
                d={`M 0 0 H ${r} A ${r} ${r} 0 0 0 0 ${r} Z`} />;
            })}
          </svg>
        </div>
      </div>
      {preview ? <TechnicPreview recipe={recipe} activeLayer={activeLayer} selection={selected} triangleLimit={workspace.booleanTriangleLimit} /> : null}
      </div>
      <p className="technic-caption">{t("technic.editLayerOnly", { layer: activeLayer + 1 })}<br />{t(placement ? "technic.placeSelection" : `technic.hint.${mode}`)} · X → · Y ↑ · Z ⊙
        <span className="technic-preview-legend">{t("technic.holeLegend")}</span></p>
    </section>
    <aside className="technic-panel" aria-label="Lego Compatible">
      <header><div><strong>Lego Compatible</strong><p className="technic-muted">{t("technic.stats", { count: recipe.cells.length, width: Number((bounds?.width ?? 0).toFixed(2)), depth: Number((bounds?.depth ?? 0).toFixed(2)), height: bounds?.height ?? 0 })}</p></div><button aria-label={t("common.cancel")} onClick={onCancel}><X size={18} /></button></header>
      <div className="technic-panel-content">
        <div className="technic-layer-actions">
          <button disabled={busy || !layerRecipe.cells.length || layerCount >= TECHNIC_LAYER_LIMIT} onClick={() => appendLayer(true)}>{t("technic.duplicateLayer")}</button>
          <button disabled={busy || layerCount <= 1} onClick={() => {
            const next = removeTechnicLayer(recipeRef.current, activeLayer);
            if (next) { commit(next); chooseLayer(Math.min(activeLayer, technicLayerCount(next) - 1), next); }
          }}>{t("technic.removeLayer")}</button>
        </div>
        <p className="technic-muted">{t("technic.layersHelp")}</p>
        <div className="technic-mode-buttons technic-edit-modes">{(["select", "add", "remove", "set"] as const).map(value =>
          <button key={value} disabled={busy} aria-pressed={mode === value} onClick={() => { setMode(value); setPlacement(null); }}>{t(`technic.mode.${value}`)}</button>)}</div>
        <p className="technic-muted">{mode === "select" && cell ? selectedCells.length > 1 ? t("technic.selectionCount", { count: selectedCells.length }) : t("technic.selection", { x: cell.x, y: cell.y }) : t(mode === "set" ? "technic.stampSettings" : "technic.brush")}</p>
        {mode === "select" && selectedCells.length ? <div className="technic-selection-tools" aria-label={t("technic.selectionTools")}>
          <button disabled={busy} aria-pressed={placement === "copy"} onClick={() => setPlacement("copy")}>{t("technic.copy")}</button>
          <button disabled={busy} aria-pressed={placement === "move"} onClick={() => setPlacement("move")}>{t("technic.move")}</button>
          <button disabled={busy} onClick={() => mirror("mirrorX")}>{t("technic.mirrorX")}</button>
          <button disabled={busy} onClick={() => mirror("mirrorY")}>{t("technic.mirrorY")}</button>
          <button disabled={busy} onClick={() => { commit({ ...recipe, cells: recipe.cells.filter(c => !selected.includes(technicCellKey(c.x, c.y, technicLayer(c)))) }); setSelected([]); setPlacement(null); }}>{t("technic.deleteSelection")}</button>
        </div> : null}
        {mode === "select" && selectedCells.length ? <div className="technic-transfer-tools">
          <label>{t("technic.toLayer")}<select aria-label={t("technic.toLayer")} disabled={busy} value={transferTarget} onChange={e => { setTransferLayer(Number(e.target.value)); setError(""); }}>
            {Array.from({ length: layerCount }, (_, z) => z !== activeLayer ? <option key={z} value={z}>{t("technic.targetLayer", { layer: z + 1, height: Number((z * measurements.height).toFixed(2)) })}</option> : null)}
            {layerCount < TECHNIC_LAYER_LIMIT ? <option value={layerCount}>{t("technic.newTargetLayer", { layer: layerCount + 1 })}</option> : null}
          </select></label>
          <div><button disabled={busy || recipe.cells.length + selectedCells.length > TECHNIC_CELL_LIMIT} onClick={() => transfer("copy")}>{t("technic.copyToLayer")}</button>
            <button disabled={busy} onClick={() => transfer("move")}>{t("technic.moveToLayer")}</button></div>
          <p className="technic-muted">{t("technic.transferHelp")}</p>
          {error ? <p className="technic-error" role="alert">{error}</p> : null}
        </div> : null}
        {mode === "set" ? <p className="technic-muted">{t("technic.stampHelp")}</p> : null}
        <div className="technic-module-list">{(["solid", "pin", "axle"] as const).map(kind =>
          <button key={kind} disabled={busy || mode === "remove" || mode === "set"} aria-pressed={settings.kind === kind} onClick={() => change({ kind })}>
            <TechnicModuleIcon className="technic-module-icon" kind={kind} />{t(`technic.${kind}`)}</button>)}</div>
        <label>{t("technic.axis")} <span className="technic-key-hint">{t("technic.axisKeys")}</span></label>
        <div className="technic-mode-buttons">{(["X", "Y", "Z"] as const).map(axis =>
          <button key={axis} disabled={busy || settings.kind === "solid" || mode === "remove"} aria-pressed={settings.axis === axis} onClick={() => change({ axis })}>{axis}</button>)}</div>
        <label>{t("technic.roll")}</label>
        <div className="technic-mode-buttons">{([0, 45] as const).map(roll =>
          <button key={roll} disabled={busy || settings.kind !== "axle" || mode === "remove"} aria-pressed={settings.roll === roll} onClick={() => change({ roll })}>{roll}°</button>)}</div>
        <details className="technic-rounding" open={roundingOpen} onToggle={e => setRoundingOpen(e.currentTarget.open)}>
          <summary>{t("technic.rounding")}</summary>
          <label>{t("technic.roundCell")}<select aria-label={t("technic.roundCell")} value={rounding} disabled={busy || mode === "remove"}
            onChange={e => change({ rounded: undefined, rounding: e.target.value as TechnicRounding })}>
            {(["none", "outer", "inner", "both"] as const).map(value => <option key={value} value={value}>{t(`technic.round.${value}`)}</option>)}
          </select></label>
          <EdgeModifierSlider label={t("technic.cornerRadius")} value={radius} min={0.2} max={Math.min(4, measurements.pitch / 2 - measurements.bodyInset)} step={0.1}
            workspace={workspace} disabled={busy} onChange={value => commit({ ...recipe, cornerRadius: value })} />
          <button disabled={busy || !layerRecipe.cells.length || rounding === "none"} onClick={() => {
            commit({ ...recipe, cells: recipe.cells.map(c => technicLayer(c) === activeLayer ? { ...c, rounded: undefined, rounding } : c) });
          }}>{t("technic.roundLayer")}</button>
          {anyRounded ? <button disabled={busy} onClick={() => {
            setBrush(b => ({ ...b, rounded: undefined, rounding: "none" }));
            commit({ ...recipe, cells: recipe.cells.map(c => technicLayer(c) === activeLayer ? { ...c, rounded: undefined, rounding: "none" } : c) });
          }}>{t("technic.unroundLayer")}</button> : null}
          <p className="technic-muted">{t("technic.roundHelp")}</p>
        </details>
        <details><summary>{t("technic.catalog")}</summary>
          <p className="technic-muted">{t("technic.catalogHelp")}</p>
          <div className="technic-template-list">{TECHNIC_TEMPLATES.map(kind => {
            const sample = technicTemplate(kind, 5, 3, "Z")!;
            return <button key={kind} disabled={busy} aria-pressed={template === kind} onClick={() => setTemplate(kind)}>
              <svg viewBox="-1 -1 52 32" aria-hidden="true">{sample.map(c => <g key={technicCellKey(c.x, c.y, technicLayer(c))}>
                <rect x={c.x * 10} y={(2 - c.y) * 10} width="9" height="9" rx={kind === "plate" ? 0 : 2} />
                {c.kind === "pin" ? <circle cx={c.x * 10 + 4.5} cy={(2 - c.y) * 10 + 4.5} r="2" />
                  : c.kind === "axle" ? <path d={`M ${c.x * 10 + 2} ${(2 - c.y) * 10 + 4.5} h 5 M ${c.x * 10 + 4.5} ${(2 - c.y) * 10 + 2} v 5`} /> : null}
              </g>)}</svg>{t(`technic.template.${kind}`)}</button>;
          })}</div>
          <div className="technic-field-pair">
            <label>{t("technic.templateWidth")}<TechnicNumberField min={1} max={32} integer value={templateWidth} disabled={busy} onChange={setTemplateWidth} /></label>
            <label>{t("technic.templateDepth")}<TechnicNumberField min={1} max={32} integer value={templateDepth} disabled={busy || template === "beam" || template === "mixedBeam"} onChange={setTemplateDepth} /></label>
          </div>
          <button disabled={busy} onClick={() => {
            const cells = technicTemplate(template, templateWidth, templateDepth, brush.axis);
            if (!cells) { setError(t("technic.error.template")); return; }
            replaceDraft({ ...recipe, cells });
          }}>{t("technic.useTemplate")}</button>
          <p className="technic-muted">{t("technic.replaceHelp")}</p>
        </details>
        <details><summary>{t("technic.pattern")}</summary>
          <p className="technic-muted">{t("technic.patternHelp")}</p>
          <textarea aria-label={t("technic.pattern")} value={pattern} disabled={busy} spellCheck={false} onChange={e => setPattern(e.target.value)} />
          <button disabled={busy} onClick={() => {
            const cells = parseTechnicPattern(pattern, brush.axis, brush.roll);
            if (!cells) { setError(t("technic.error.pattern")); return; }
            const b = layerRecipe.cells.length ? technicBounds(layerRecipe) : recipe.cells.length ? technicBounds(recipe) : { minX: 0, minY: 0 };
            const shifted = cells.map(c => ({ ...c, x: c.x + b.minX, y: c.y + b.minY,
              rounding: technicRounding(brush) }));
            if (shifted.some(c => Math.abs(c.x) > 128 || Math.abs(c.y) > 128)) { setError(t("technic.error.recipe")); return; }
            replaceDraft({ ...recipe, cells: shifted });
          }}>{t("technic.applyPattern")}</button>
        </details>
        <details><summary>{t("technic.print")}</summary>
          <EdgeModifierSlider label={t("technic.adjustment")} value={recipe.holeAdjustment} min={-0.4} max={0.4} step={0.05}
            workspace={workspace} disabled={busy} onChange={value => commit({ ...recipe, holeAdjustment: value })} />
          <p className="technic-muted">{t("technic.printHelp")}</p>
          <div className="technic-measurements">{(Object.keys(TECHNIC_MEASUREMENT_RANGES) as (keyof TechnicMeasurements)[]).map(key => {
            const [min, max, step] = TECHNIC_MEASUREMENT_RANGES[key];
            return <label key={key}>{t(`technic.measure.${key}`)}<TechnicNumberField min={min} max={max} step={step} value={measurements[key]} disabled={busy} onChange={value => {
              const m = { ...measurements, [key]: value };
              commit({ ...recipe, measurements: m, cornerRadius: Math.min(radius, 4, m.pitch / 2 - m.bodyInset) });
              setProfileNotice("");
            }} /></label>;
          })}</div>
          <EdgeModifierSlider label={t("technic.sampleOffset")} value={settings.holeOffset ?? 0} min={-0.4} max={0.4} step={0.01}
            workspace={workspace} disabled={busy || mode === "remove" || settings.kind === "solid"} onChange={value => change({ holeOffset: value })} />
          <label>{t("technic.profile")}<select disabled={busy} value="" onChange={e => {
            const p = profiles[Number(e.target.value)]; if (!p) return;
            commit({ ...recipe, measurements: structuredClone(p.measurements), holeAdjustment: p.holeAdjustment,
              cornerRadius: Math.min(radius, 4, p.measurements.pitch / 2 - p.measurements.bodyInset) });
            setProfileName(p.name); setProfileNotice("");
          }}><option value="">{t("technic.chooseProfile")}</option>{profiles.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}</select></label>
          <label>{t("technic.profileName")}<input value={profileName} maxLength={80} disabled={busy} onChange={e => setProfileName(e.target.value)} /></label>
          <button disabled={busy || !profileName.trim()} onClick={() => {
            try { setProfiles(saveTechnicProfile({ name: profileName.trim(), measurements, holeAdjustment: recipe.holeAdjustment })); setProfileNotice(t("technic.profileSaved")); }
            catch { setError(t("technic.error.profile")); }
          }}>{t("technic.saveProfile")}</button>
          <button disabled={busy} onClick={() => { commit({ ...recipe, measurements: { ...DEFAULT_TECHNIC_MEASUREMENTS }, holeAdjustment: 0 }); setProfileNotice(""); }}>{t("technic.resetMeasurements")}</button>
          {profileNotice ? <p className="technic-muted" role="status">{profileNotice}</p> : null}
          <p className="technic-muted">{t("technic.measureHelp")}</p>
        </details>
        <details><summary>{t("technic.calibration")}</summary>
          <p className="technic-muted">{t("technic.calibrationHelp")}</p>
          <label>{t("technic.calibrationStep")}<TechnicNumberField min={0.01} max={0.4} step={0.01} value={calibrationStep} disabled={busy} onChange={setCalibrationStep} /></label>
          <label>{t("technic.axis")}<select value={calibrationAxis} disabled={busy} onChange={e => setCalibrationAxis(e.target.value as TechnicCell["axis"])}>{(["X", "Y", "Z"] as const).map(axis => <option key={axis}>{axis}</option>)}</select></label>
          <button disabled={busy} onClick={() => {
            const next = technicCalibration(layerRecipe, calibrationStep, calibrationAxis);
            if (!next) { setError(t("technic.error.recipe")); return; }
            replaceDraft(next);
          }}>{t("technic.makeCalibration")}</button>
          <p className="technic-muted">{t("technic.replaceHelp")}</p>
        </details>
        <p className="technic-muted">{t("technic.editHelp")}</p>
        {error && !(mode === "select" && selectedCells.length) ? <p className="technic-error" role="alert">{error}</p> : null}
      </div>
      <footer><button onClick={onCancel}>{t("common.cancel")}</button>
        <button className="technic-done" disabled={busy || !recipe.cells.length} onClick={() => void apply()}>{t(busy ? "technic.building" : "technic.done")}</button></footer>
    </aside>
  </div>;
}
