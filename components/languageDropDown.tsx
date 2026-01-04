"use client";

import { useState, useRef, useEffect } from "react";

import { I18N_LANGUAGES } from "@/i18n/config";
import { useLanguage } from "@/providers/i18n-provider";

import { Flag } from "./flag";

export const LanguageDropDown = () => {
  const [languagesShown, setLanguagesShown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, changeLanguage } = useLanguage();
  const [closingTimeout, setClosingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setLanguagesShown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closingTimeout) clearTimeout(closingTimeout);
    };
  }, [closingTimeout]);

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    setLanguagesShown(false);
  };

  const handleMouseLeave = () => {
    // Adiciona um pequeno delay antes de fechar
    const timeout = setTimeout(() => {
      setLanguagesShown(false);
    }, 300); // 300ms de delay
    setClosingTimeout(timeout);
  };

  const cancelClose = () => {
    if (closingTimeout) {
      clearTimeout(closingTimeout);
      setClosingTimeout(null);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="relative flex cursor-pointer items-center gap-2"
      onMouseEnter={() => {
        cancelClose();
        setLanguagesShown(true);
      }}
      onMouseLeave={handleMouseLeave}
      aria-haspopup={true}
      aria-expanded={languagesShown}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setLanguagesShown((isShown) => !isShown);
        }
        if (e.key === "Escape") {
          setLanguagesShown(false);
        }
      }}
    >
      <div className="flex items-center gap-2">
        <Flag language={language} width={36} height={36} />
        <span className="hidden text-sm font-medium text-foreground sm:block">
          {language.name}
        </span>
      </div>

      {languagesShown && (
        <div
          className="absolute left-1/2 top-full z-50 mt-2 w-48 -translate-x-1/2 transform rounded-lg border border-border bg-background shadow-lg sm:w-48"
          onMouseEnter={cancelClose}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-2">
            <div className="mb-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">
              Select Language
            </div>
            <ul className="space-y-1 max-h-60 overflow-y-auto">
              {I18N_LANGUAGES.map((lang) => (
                <li key={lang.code}>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      language.code === lang.code
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                    }`}
                    tabIndex={0}
                  >
                    <Flag language={lang} width={36} height={36}/>
                    <span className="flex-1 text-left">{lang.name}</span>
                    {language.code === lang.code && (
                      <span className="text-xs">✓</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
