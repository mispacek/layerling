import { describe, expect, it, vi } from "vitest";
import { hasStoredAppTheme } from "@/lib/appTheme";
import { fetchServerDefaultTheme, parseDefaultTheme, serverDefaultsFromEnvironment } from "@/lib/serverDefaults";

/*
 * LAYERLING_DEFAULT_THEME (#278): what a server suggests to people who have not chosen a theme.
 */
describe("the default theme a server suggests", () => {
  it("knows the four themes, however the operator wrote them", () => {
    expect(parseDefaultTheme("dark")).toBe("dark");
    expect(parseDefaultTheme(" Graphite ")).toBe("graphite");
    expect(parseDefaultTheme("LIGHT")).toBe("light");
    expect(parseDefaultTheme("system")).toBe("system");
  });

  it("suggests nothing for an empty setting or a theme that does not exist", () => {
    expect(parseDefaultTheme(undefined)).toBeNull();
    expect(parseDefaultTheme("")).toBeNull();
    expect(parseDefaultTheme("purple")).toBeNull();
    expect(parseDefaultTheme(3)).toBeNull();
  });

  it("reads the setting from the environment", () => {
    expect(serverDefaultsFromEnvironment({ LAYERLING_DEFAULT_THEME: "graphite" })).toEqual({ theme: "graphite" });
    expect(serverDefaultsFromEnvironment({})).toEqual({ theme: null });
  });

  it("takes the server's answer, and nothing from a failure", async () => {
    const answer = (body: unknown, ok = true) => vi.fn(async () => ({ ok, json: async () => body }) as unknown as Response) as unknown as typeof fetch;
    expect(await fetchServerDefaultTheme(answer({ theme: "dark" }))).toBe("dark");
    expect(await fetchServerDefaultTheme(answer({ theme: null }))).toBeNull();
    expect(await fetchServerDefaultTheme(answer({ theme: "purple" }))).toBeNull();
    expect(await fetchServerDefaultTheme(answer(null))).toBeNull();
    expect(await fetchServerDefaultTheme(answer({}, false))).toBeNull();
    expect(await fetchServerDefaultTheme((async () => { throw new Error("offline"); }) as typeof fetch)).toBeNull();
  });
});

describe("a theme on record", () => {
  it("is there once something is stored, even 'system'", () => {
    const store = (value: string | null) => ({ getItem: () => value });
    expect(hasStoredAppTheme(store(null))).toBe(false);
    expect(hasStoredAppTheme(store("system"))).toBe(true);
    expect(hasStoredAppTheme(store("dark"))).toBe(true);
    expect(hasStoredAppTheme(null)).toBe(false);
    expect(hasStoredAppTheme({ getItem: () => { throw new Error("blocked"); } })).toBe(true);
  });
});
