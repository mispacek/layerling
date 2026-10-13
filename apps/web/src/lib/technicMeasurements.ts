/** Stored with each recipe; printer presets never silently alter existing parts. All values are mm. */
export const DEFAULT_TECHNIC_MEASUREMENTS = {
  pitch: 8, height: 8, bodyInset: 0, pinDiameter: 4.95, recessDiameter: 6.4,
  recessDepth: 0.89, axleWidth: 2.02, pinCorrection: 0, axleCorrection: 0, recessCorrection: 0,
};
export type TechnicMeasurements = typeof DEFAULT_TECHNIC_MEASUREMENTS;
export const TECHNIC_MEASUREMENT_RANGES: Record<keyof TechnicMeasurements, [number, number, number]> = {
  pitch: [7.6, 8.4, 0.01], height: [4, 16, 0.01], bodyInset: [0, 0.3, 0.01],
  pinDiameter: [3, 6, 0.01], recessDiameter: [4, 7.6, 0.01], recessDepth: [0, 2, 0.01],
  axleWidth: [1, 3, 0.01], pinCorrection: [-0.4, 0.4, 0.01], axleCorrection: [-0.4, 0.4, 0.01], recessCorrection: [-0.4, 0.4, 0.01],
};
export function validTechnicMeasurements(value: unknown): value is TechnicMeasurements {
  if (!value || typeof value !== "object") return false;
  const m = value as TechnicMeasurements;
  return (Object.keys(TECHNIC_MEASUREMENT_RANGES) as (keyof TechnicMeasurements)[]).every(key => {
    const [min, max] = TECHNIC_MEASUREMENT_RANGES[key];
    return Number.isFinite(m[key]) && m[key] >= min && m[key] <= max;
  });
}
export const technicMeasurements = (recipe: { measurements?: TechnicMeasurements }) => recipe.measurements ?? DEFAULT_TECHNIC_MEASUREMENTS;

export type TechnicPrintProfile = { name: string; measurements: TechnicMeasurements; holeAdjustment: number };
const STORAGE_KEY = "layerling.technic.printProfiles.v1";
function validProfile(p: unknown): p is TechnicPrintProfile {
  if (!p || typeof p !== "object") return false;
  const v = p as TechnicPrintProfile;
  return typeof v.name === "string" && v.name.trim().length > 0 && v.name.length <= 80
    && validTechnicMeasurements(v.measurements) && Number.isFinite(v.holeAdjustment) && Math.abs(v.holeAdjustment) <= 0.4;
}
export function loadTechnicProfiles(): TechnicPrintProfile[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter(validProfile).slice(0, 20) : [];
  } catch { return []; }
}
export function saveTechnicProfile(profile: TechnicPrintProfile): TechnicPrintProfile[] {
  if (!validProfile(profile)) throw new Error("technic.error.profile");
  const profiles = loadTechnicProfiles().filter(p => p.name !== profile.name);
  // A full collection must not report a successfully saved profile that was dropped.
  if (profiles.length >= 20) throw new Error("technic.error.profile");
  profiles.push(structuredClone(profile));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  return profiles;
}
