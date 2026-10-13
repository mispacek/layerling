"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LANGUAGES, LANGUAGE_NAMES, setLanguage, t, type Language } from "@/lib/i18n";
import { useLanguage } from "@/lib/useLanguage";

/**
 * The language list sits at the top right, where one looks for it on a web page - on the start
 * page as in the editor. It is a list that opens, like the theme's next to it, so any number of
 * languages fit; each is named in its own language, as a person who cannot read the interface
 * yet has to find theirs. A language that is not built in is fetched when chosen; the list
 * shows the choice at once and the interface follows when its sentences have arrived.
 */
function LanguageFlag({ language }: { language: Language }) {
  if (language === "cs") {
    return (
      <svg viewBox="0 0 6 4" aria-hidden="true">
        <rect width="6" height="2" fill="#ffffff" />
        <rect width="6" height="2" y="2" fill="#d7141a" />
        <path d="M0 0 3 2 0 4Z" fill="#11457e" />
      </svg>
    );
  }
  if (language === "de") {
    return (
      <svg viewBox="0 0 5 3" aria-hidden="true">
        <rect width="5" height="1" y="0" fill="#000000" />
        <rect width="5" height="1" y="1" fill="#dd0000" />
        <rect width="5" height="1" y="2" fill="#ffce00" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 60 36" aria-hidden="true">
      <rect width="60" height="36" fill="#012169" />
      <path d="M0 0 60 36M60 0 0 36" stroke="#ffffff" strokeWidth="7" />
      <path d="M0 0 60 36M60 0 0 36" stroke="#c8102e" strokeWidth="4" />
      <path d="M30 0V36M0 18H60" stroke="#ffffff" strokeWidth="12" />
      <path d="M30 0V36M0 18H60" stroke="#c8102e" strokeWidth="7" />
    </svg>
  );
}


export function LanguageSwitch() {
  const language = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shown = choice ?? language;

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="theme-switch language-switch" ref={containerRef}>
      <button
        type="button"
        className={`theme-switch-button${isOpen ? " active" : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={t("common.language")}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title={`${t("common.language")}: ${LANGUAGE_NAMES[language]}`}
      >
        <span className="language-flag"><LanguageFlag language={language} /></span>
        <span className="theme-switch-label">{language.toUpperCase()}</span>
        <ChevronDown size={11} className={`theme-chevron${isOpen ? " open" : ""}`} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="theme-dropdown-menu language-dropdown-menu" role="menu" aria-label={t("common.language")}>
          {LANGUAGES.map((option) => {
            const isSelected = option === shown;
            return (
              <button
                key={option}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                lang={option}
                className={`theme-dropdown-item${isSelected ? " active" : ""}`}
                onClick={() => {
                  setChoice(option);
                  setIsOpen(false);
                  void setLanguage(option).finally(() => setChoice(null));
                }}
              >
                <span className="theme-item-label">{LANGUAGE_NAMES[option]}</span>
                {isSelected ? <Check size={13} className="theme-check" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
