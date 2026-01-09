"use client";

import { useState, useRef, useEffect } from "react";
import { I18N_LANGUAGES } from "@/i18n/config";
import { useLanguage } from "@/providers/i18n-provider";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { Flag } from "./flag";

interface LanguageDropDownProps {
  mobileMode?: boolean;
  onClose?: () => void;
}

export const LanguageDropDown = ({ mobileMode = false, onClose }: LanguageDropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    setIsOpen(false);
    onClose?.();
  };

  const getNativeName = (code: string) => {
    return I18N_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  // Se for mobile mode, mostra apenas a lista sem o botão toggle
  if (mobileMode) {
    return (
      <div className="py-1 max-h-60 overflow-y-auto">
        <div className="px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground dark:text-muted-foreground mb-2">
            {t('common.selectLanguage')}
          </p>
        </div>
        {I18N_LANGUAGES.map((lang) => {
          const nativeName = getNativeName(lang.code);
          const isCurrent = lang.code === language.code;

          return (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                flex w-full items-center gap-3 px-3 py-2.5 
                text-left text-sm transition-colors duration-150
                hover:bg-accent dark:hover:bg-accent
                active:bg-accent/50 dark:active:bg-accent/50
                ${isCurrent
                  ? 'text-primary dark:text-primary font-semibold bg-accent dark:bg-accent'
                  : 'text-foreground dark:text-foreground'
                }
              `}
            >
              <div className="shrink-0">
                <Flag language={lang} width={24} height={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {nativeName}
                </div>
                {lang.name && lang.shortName !== nativeName && (
                  <div className="text-xs text-muted-foreground dark:text-muted-foreground truncate">
                    {lang.name}
                  </div>
                )}
              </div>
              {isCurrent && (
                <svg
                  className="w-4 h-4 text-primary dark:text-primary shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="relative cursor-pointer outline-none"
      tabIndex={0}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          group
          bg-none border-none p-0 
          cursor-pointer relative 
          inline-flex touch-manipulation 
          transform-gpu -webkit-tap-highlight-transparent
          -webkit-touch-callout-none 
          select-none
          outline-none
          transition-filter duration-200
          hover:brightness-95
          active:brightness-90
        "
        aria-expanded={isOpen}
      >
        <span className="
          select-inherit
          text-[14px] md:text-[15px]
          font-bold 
          tracking-[0.8px] 
          uppercase
          text-foreground dark:text-foreground
          whitespace-nowrap
          flex items-center
          gap-1
          group-hover:text-primary dark:group-hover:text-primary
        ">
          {t('common.language')}: {getNativeName(language.code)}
          <svg
            className={`
              w-3 h-3 md:w-4 md:h-4 transition-transform duration-200 
              ${isOpen ? 'rotate-180' : ''}
              group-hover:translate-y-0.5
            `}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="
          absolute 
          right-0 
          mt-2 
          bg-popover dark:bg-popover
          rounded-xl 
          shadow-2xl 
          border 
          border-border dark:border-border
          z-50 
          w-56
          max-h-[80vh]
          overflow-hidden
          animate-in 
          fade-in 
          zoom-in-95 
          duration-150
        ">
          <div className="py-1 max-h-80 overflow-y-auto">
            <div className="px-4 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground dark:text-muted-foreground mb-2">
                {t('common.selectLanguage')}
              </p>
            </div>
            {I18N_LANGUAGES.map((lang) => {
              const nativeName = getNativeName(lang.code);
              const isCurrent = lang.code === language.code;

              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    flex w-full items-center gap-3 px-4 py-3 
                    text-left text-sm transition-colors duration-150
                    hover:bg-accent dark:hover:bg-accent
                    active:bg-accent/50 dark:active:bg-accent/50
                    ${isCurrent
                      ? 'text-primary dark:text-primary font-semibold bg-accent dark:bg-accent'
                      : 'text-foreground dark:text-foreground'
                    }
                  `}
                >
                  <div className="shrink-0">
                    <Flag language={lang} width={28} height={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">
                      {nativeName}
                    </div>
                    {lang.name && lang.shortName !== nativeName && (
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground truncate">
                        {lang.name}
                      </div>
                    )}
                  </div>
                  {isCurrent && (
                    <ChevronDown />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};