"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Redo2, Undo2, X } from "lucide-react";
import { t } from "@/lib/i18n";
import { EdgeModifierSlider } from "@/components/workplane/EdgeModifierPanel";
import { DEFAULT_WORKPLANE_WORKSPACE } from "@/lib/workplaneSettings";
import type { WorkplaneWorkspaceSettings } from "@/types/layerling";
import { DEFAULT_TECHNIC_CORNER_RADIUS, TECHNIC_CELL_LIMIT, parseTechnicPattern, technicBounds, technicCellKey, technicCorners, technicPattern, type TechnicCell, type TechnicRecipe } from "@/lib/technicRecipe";

type Mode = "select" | "add" | "remove" | "set";

/** Top-view convention: a Z bore exposes its profile; horizontal bores are hidden lines with direction arrows. */
function TechnicHolePreview({ cell, adjustment }: { cell: TechnicCell; adjustment: number }) {
  const radius = (4.95 + adjustment) * 2.5;
  const arm = (2.02 + adjustment) * 2.5;
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
      <circle className="technic-recess" cx="20" cy="20" r={(6.4 + adjustment) * 2.5} />
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
  const [past, setPast] = useState<TechnicRecipe[]>([]);
  const [future, setFuture] = useState<TechnicRecipe[]>([]);
  const [mode, setMode] = useState<Mode>("select");
  const [roundingOpen, setRoundingOpen] = useState(initialRoundingOpen);
  const [brush, setBrush] = useState<Omit<TechnicCell, "x" | "y">>({ kind: "pin", axis: "Z", roll: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState(() => { const b = technicBounds(initial); return { x: b.minX - 2, y: b.maxY + 2 }; });
  const [size, setSize] = useState({ columns: 12, rows: 10 });
  const [pattern, setPattern] = useState(() => technicPattern(initial));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const pendingPan = useRef({ x: 0, y: 0 });
  const cell = recipe.cells.find(c => technicCellKey(c.x, c.y) === selected);
  const settings = mode === "select" && cell ? cell : brush;
  const bounds = recipe.cells.length ? technicBounds(recipe) : null;
  const corners = useMemo(() => technicCorners(recipe), [recipe]);
  const radius = recipe.cornerRadius ?? DEFAULT_TECHNIC_CORNER_RADIUS;
  const allRounded = recipe.cells.length > 0 && recipe.cells.every(c => c.rounded);

  useEffect(() => { root.current?.focus(); }, []);
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSize({ columns: Math.max(3, Math.min(24, Math.floor((width - 16) / 44))), rows: Math.max(4, Math.min(24, Math.floor((height - 16) / 44))) });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function commit(next: TechnicRecipe) {
    if (JSON.stringify(next) === JSON.stringify(recipeRef.current)) return;
    const previous = recipeRef.current;
    setPast(p => [...p.slice(-99), previous]);
    setFuture([]);
    recipeRef.current = next;
    setRecipe(next);
    setPattern(technicPattern(next));
    setError("");
  }
  function undo() {
    if (busy || !past.length) return;
    const previous = past[past.length - 1];
    const current = recipeRef.current;
    setFuture(f => [current, ...f]);
    setPast(p => p.slice(0, -1));
    recipeRef.current = previous; setRecipe(previous); setPattern(technicPattern(previous)); setError("");
  }
  function redo() {
    if (busy || !future.length) return;
    const next = future[0];
    const current = recipeRef.current;
    setPast(p => [...p, current]); setFuture(f => f.slice(1));
    recipeRef.current = next; setRecipe(next); setPattern(technicPattern(next)); setError("");
  }
  function paint(x: number, y: number) {
    if (busy) return;
    if (Math.abs(x) > 128 || Math.abs(y) > 128) { setError(t("technic.error.recipe")); return; }
    const key = technicCellKey(x, y);
    const current = recipeRef.current;
    const target = current.cells.find(c => technicCellKey(c.x, c.y) === key);
    if (mode === "set" && !target) return;
    setSelected(key);
    if (mode === "select") {
      if (target) { const { x: _x, y: _y, ...sample } = target; setBrush(sample); }
      return;
    }
    if (mode === "set") {
      commit({ ...current, cells: current.cells.map(c => c === target ? { ...c, axis: brush.axis, roll: brush.roll,
        ...(brush.rounded !== undefined || c.rounded !== undefined ? { rounded: brush.rounded ?? false } : {}) } : c) });
      pendingPan.current = { x: 0, y: 0 };
      return;
    }
    const remaining = current.cells.filter(c => technicCellKey(c.x, c.y) !== key);
    if (mode === "add") {
      if (remaining.length >= TECHNIC_CELL_LIMIT) { setError(t("technic.error.limit")); return; }
      remaining.push({ x, y, ...brush });
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
    if (mode === "select" && cell) commit({ ...recipeRef.current, cells: recipeRef.current.cells.map(c => technicCellKey(c.x, c.y) === selected ? { ...c, ...patch } : c) });
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
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") event.preventDefault();
    if (event.key === "Escape") { event.preventDefault(); onCancel(); }
    else if ((event.ctrlKey || event.metaKey) && ["z", "y"].includes(event.key.toLowerCase())
      && !(event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement)) {
      event.preventDefault(); if (event.key.toLowerCase() === "y" || event.shiftKey) redo(); else undo();
    }
  }}>
    <section className="technic-drawing" aria-label={t("technic.canvas")}>
      <div className="technic-view-tools">
        <strong>{t("technic.topView")}</strong><span>{t("technic.pitch")}</span>
        <button title={t("editor.tool.undo")} aria-label={t("editor.tool.undo")} disabled={busy || !past.length} onClick={undo}><Undo2 size={17} /></button>
        <button title={t("editor.tool.redo")} aria-label={t("editor.tool.redo")} disabled={busy || !future.length} onClick={redo}><Redo2 size={17} /></button>
        <button title={t("technic.panLeft")} aria-label={t("technic.panLeft")} disabled={busy} onClick={() => pan(-4, 0)}><ArrowLeft size={17} /></button>
        <button title={t("technic.panRight")} aria-label={t("technic.panRight")} disabled={busy} onClick={() => pan(4, 0)}><ArrowRight size={17} /></button>
        <button title={t("technic.panUp")} aria-label={t("technic.panUp")} disabled={busy} onClick={() => pan(0, 4)}><ArrowUp size={17} /></button>
        <button title={t("technic.panDown")} aria-label={t("technic.panDown")} disabled={busy} onClick={() => pan(0, -4)}><ArrowDown size={17} /></button>
      </div>
      <div className="technic-canvas" ref={canvas}>
        <div className="technic-grid" style={{ gridTemplateColumns: `repeat(${size.columns}, 44px)` }} onPointerUp={() => {
          pan(pendingPan.current.x, pendingPan.current.y); pendingPan.current = { x: 0, y: 0 };
        }}>
          {Array.from({ length: size.columns * size.rows }, (_, index) => {
            const x = view.x + index % size.columns, y = view.y - Math.floor(index / size.columns);
            const key = technicCellKey(x, y), c = recipe.cells.find(c => c.x === x && c.y === y);
            return <button type="button" key={key} disabled={busy || Math.abs(x) > 128 || Math.abs(y) > 128} data-cell={key}
              className={`technic-cell ${c ? `filled ${c.kind}` : ""} ${selected === key ? "selected" : ""}`}
              title={`X ${x * 8} mm, Y ${y * 8} mm${c ? ` · ${t(`technic.${c.kind}`)} · ${c.axis}` : ""}`}
              aria-label={`X ${x * 8}, Y ${y * 8}: ${c ? t(`technic.${c.kind}`) : t("technic.empty")}${c && c.kind !== "solid" ? ` · ${t("technic.axis")}: ${c.axis}${c.kind === "axle" ? ` · ${c.roll}°` : ""}` : ""}`}
              onPointerDown={e => { if (e.button === 0) { e.preventDefault(); paint(x, y); } }}
              onPointerEnter={e => { if (e.buttons === 1 && mode !== "select") paint(x, y); }}
              onClick={e => { if (e.detail === 0) paint(x, y); }}>
              {c ? <>{c.kind !== "solid" ? <TechnicHolePreview cell={c} adjustment={recipe.holeAdjustment} /> : null}
                {c.kind !== "solid" ? <small>{c.axis}</small> : null}</> : x === 0 && y === 0 ? <small>0,0</small> : null}
            </button>;
          })}
          <svg className="technic-corner-overlay" aria-hidden="true" viewBox={`0 0 ${size.columns * 44} ${size.rows * 44}`}>
            {corners.map((corner, index) => {
              const px = (corner.x / 8 - view.x + 0.5) * 44, py = (view.y - corner.y / 8 + 0.5) * 44;
              const r = radius * 44 / 8, convex = corner.kind === "convex";
              return <path key={index} className={convex ? "technic-corner-cut" : "technic-corner-fill"}
                transform={`translate(${px} ${py}) scale(${convex ? -corner.sx : corner.sx} ${convex ? corner.sy : -corner.sy})`}
                d={`M 0 0 H ${r} A ${r} ${r} 0 0 0 0 ${r} Z`} />;
            })}
          </svg>
        </div>
      </div>
      <p className="technic-caption">{t(`technic.hint.${mode}`)} · X → · Y ↑ · Z ⊙
        <span className="technic-preview-legend">{t("technic.holeLegend")}</span></p>
    </section>
    <aside className="technic-panel" aria-label="Lego Compatible">
      <header><div><strong>Lego Compatible</strong><p className="technic-muted">{t("technic.stats", { count: recipe.cells.length, width: bounds?.width ?? 0, depth: bounds?.depth ?? 0 })}</p></div><button aria-label={t("common.cancel")} onClick={onCancel}><X size={18} /></button></header>
      <div className="technic-panel-content">
        <div className="technic-mode-buttons technic-edit-modes">{(["select", "add", "remove", "set"] as const).map(value =>
          <button key={value} disabled={busy} aria-pressed={mode === value} onClick={() => setMode(value)}>{t(`technic.mode.${value}`)}</button>)}</div>
        <p className="technic-muted">{mode === "select" && cell ? t("technic.selection", { x: cell.x, y: cell.y }) : t(mode === "set" ? "technic.stampSettings" : "technic.brush")}</p>
        {mode === "set" ? <p className="technic-muted">{t("technic.stampHelp")}</p> : null}
        <div className="technic-module-list">{(["solid", "pin", "axle"] as const).map(kind =>
          <button key={kind} disabled={busy || mode === "remove" || mode === "set"} aria-pressed={settings.kind === kind} onClick={() => change({ kind })}>
            <span className="technic-module-icon" aria-hidden="true">{kind === "solid" ? "■" : kind === "pin" ? "⊙" : "⊞"}</span>{t(`technic.${kind}`)}</button>)}</div>
        <label>{t("technic.axis")}</label>
        <div className="technic-mode-buttons">{(["X", "Y", "Z"] as const).map(axis =>
          <button key={axis} disabled={busy || settings.kind === "solid" || mode === "remove"} aria-pressed={settings.axis === axis} onClick={() => change({ axis })}>{axis}</button>)}</div>
        <label>{t("technic.roll")}</label>
        <div className="technic-mode-buttons">{([0, 45] as const).map(roll =>
          <button key={roll} disabled={busy || settings.kind !== "axle" || mode === "remove"} aria-pressed={settings.roll === roll} onClick={() => change({ roll })}>{roll}°</button>)}</div>
        <details className="technic-rounding" open={roundingOpen} onToggle={e => setRoundingOpen(e.currentTarget.open)}>
          <summary>{t("technic.rounding")}</summary>
          <label className="technic-check"><input type="checkbox" checked={Boolean(settings.rounded)} disabled={busy || mode === "remove"}
            onChange={e => change({ rounded: e.target.checked })} />{t("technic.roundCell")}</label>
          <EdgeModifierSlider label={t("technic.cornerRadius")} value={radius} min={0.2} max={4} step={0.1}
            workspace={workspace} disabled={busy} onChange={value => commit({ ...recipe, cornerRadius: value })} />
          <button disabled={busy || !recipe.cells.length} onClick={() => {
            setBrush(b => ({ ...b, rounded: !allRounded }));
            commit({ ...recipe, cells: recipe.cells.map(c => ({ ...c, rounded: !allRounded })) });
          }}>{t(allRounded ? "technic.unroundAll" : "technic.roundAll")}</button>
          <p className="technic-muted">{t("technic.roundHelp")}</p>
        </details>
        <details><summary>{t("technic.pattern")}</summary>
          <p className="technic-muted">{t("technic.patternHelp")}</p>
          <textarea aria-label={t("technic.pattern")} value={pattern} disabled={busy} spellCheck={false} onChange={e => setPattern(e.target.value)} />
          <button disabled={busy} onClick={() => {
            const cells = parseTechnicPattern(pattern, brush.axis, brush.roll);
            if (!cells) { setError(t("technic.error.pattern")); return; }
            const b = recipe.cells.length ? technicBounds(recipe) : { minX: 0, minY: 0 };
            const shifted = cells.map(c => ({ ...c, x: c.x + b.minX, y: c.y + b.minY,
              ...(brush.rounded ? { rounded: true } : {}) }));
            if (shifted.some(c => Math.abs(c.x) > 128 || Math.abs(c.y) > 128)) { setError(t("technic.error.recipe")); return; }
            commit({ ...recipe, cells: shifted }); setSelected(null); setView({ x: b.minX - 2, y: b.minY + cells.reduce((max, c) => Math.max(max, c.y), 0) + 2 });
          }}>{t("technic.applyPattern")}</button>
        </details>
        <details><summary>{t("technic.print")}</summary>
          <EdgeModifierSlider label={t("technic.adjustment")} value={recipe.holeAdjustment} min={-0.4} max={0.4} step={0.05}
            workspace={workspace} disabled={busy} onChange={value => commit({ ...recipe, holeAdjustment: value })} />
          <p className="technic-muted">{t("technic.printHelp")}</p>
        </details>
        <p className="technic-muted">{t("technic.editHelp")}</p>
        {error ? <p className="technic-error" role="alert">{error}</p> : null}
      </div>
      <footer><button onClick={onCancel}>{t("common.cancel")}</button>
        <button className="technic-done" disabled={busy || !recipe.cells.length} onClick={() => void apply()}>{t(busy ? "technic.building" : "technic.done")}</button></footer>
    </aside>
  </div>;
}
