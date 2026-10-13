"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildTechnicShape } from "@/lib/technicBuilder";
import { type TechnicRecipe } from "@/lib/technicRecipe";
import { t } from "@/lib/i18n";

/** Read-only preview of the same geometry used by Done/STL, with the editor's mouse bindings. */
export function TechnicPreview({ recipe, triangleLimit }: { recipe: TechnicRecipe; triangleLimit: number }) {
  const stage = useRef<HTMLDivElement>(null);
  const update = useRef<((positions: number[], height: number) => void) | null>(null);
  const fit = useRef<() => void>(() => {});
  const [status, setStatus] = useState<"technic.building" | "technic.previewUnavailable" | "technic.error.recipe" | "technic.error.geometry" | "">("technic.building");
  useEffect(() => {
    const host = stage.current!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { setStatus("technic.previewUnavailable"); return; }
    const canvas = renderer.domElement;
    host.prepend(canvas);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10000);
    const controls = new OrbitControls(camera, canvas);
    controls.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE };
    controls.enableDamping = false;
    controls.zoomToCursor = true;
    const pan = (event: PointerEvent) => { controls.mouseButtons.LEFT = event.ctrlKey || event.metaKey ? THREE.MOUSE.PAN : null; };
    canvas.addEventListener("pointerdown", pan, { capture: true });
    const light = new THREE.DirectionalLight(0xffffff, 2.2);
    light.position.set(1, 2, 3); camera.add(light);
    scene.add(camera, new THREE.AmbientLight(0xffffff, 1.5));
    const material = new THREE.MeshStandardMaterial({ color: "#cf101b", roughness: 0.7 });
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
    scene.add(mesh);
    let fitted = false;
    const draw = () => renderer.render(scene, camera);
    fit.current = () => {
      const sphere = mesh.geometry.boundingSphere;
      if (!sphere || sphere.radius <= 0) return;
      controls.target.copy(sphere.center);
      camera.position.copy(sphere.center).add(new THREE.Vector3(sphere.radius * 2, sphere.radius * 2, sphere.radius * 2.6));
      controls.update(); fitted = true; draw();
    };
    update.current = (positions, height) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.computeVertexNormals(); geometry.computeBoundingSphere();
      mesh.geometry.dispose(); mesh.geometry = geometry;
      if (!fitted) fit.current();
      draw();
    };
    controls.addEventListener("change", draw);
    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width < 2 || height < 2) return;
      renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); draw();
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    return () => {
      update.current = null; fit.current = () => {}; observer.disconnect(); controls.dispose();
      canvas.removeEventListener("pointerdown", pan, { capture: true });
      mesh.geometry.dispose(); material.dispose(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    setStatus("technic.building");
    const timer = window.setTimeout(() => {
      if (!update.current) { setStatus("technic.previewUnavailable"); return; }
      if (!recipe.cells.length) { update.current([], 8); setStatus(""); return; }
      void buildTechnicShape(recipe, triangleLimit).then(shape => {
        if (cancelled) return;
        update.current?.(shape.importedMesh!.positions, shape.height); setStatus("");
      }).catch(error => { if (!cancelled) { update.current?.([], 8); setStatus(error instanceof Error && error.message === "technic.error.recipe" ? "technic.error.recipe" : "technic.error.geometry"); } });
    }, 450);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [recipe, triangleLimit]);
  return <div className="technic-preview" aria-label={t("technic.preview")}>
    <div className="technic-preview-stage" ref={stage} />
    <button className="technic-preview-fit" onClick={() => fit.current()}>{t("technic.fitPreview")}</button>
    {status ? <p className="technic-preview-status" role="status">{t(status)}</p> : null}
    <p className="technic-muted">{t("technic.previewHelp")}</p>
  </div>;
}
