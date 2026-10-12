"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_APP_THEME, getAppThemePreference, subscribeToAppTheme, type AppThemePreference } from "@/lib/appTheme";

export function useAppTheme(): AppThemePreference {
  return useSyncExternalStore(subscribeToAppTheme, getAppThemePreference, () => DEFAULT_APP_THEME);
}
