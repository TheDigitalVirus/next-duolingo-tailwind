"use client";

import { useState, useRef, useEffect } from "react";
import { I18N_LANGUAGES } from "@/i18n/config";
import { useLanguage } from "@/providers/i18n-provider";
import { useTranslation } from "react-i18next";
import { ChevronDown, Check } from "lucide-react";
import { Flag } from "./flag";

interface LanguageDropDownProps {
  variant?: 'desktop' | 'mobile-list' | 'mobile-flag';
  onClose?: () => void;
}

export const LanguageDropDown = ({ 
  variant = 'desktop', 
  onClose 
}: LanguageDropDownProps) => {
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

  // Renderizar apenas a flag (para header mobile)
  if (variant === 'mobile-flag') {
    const currentLang = I18N_LANGUAGES.find(lang => lang.code === language.code);
    
    return (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center p-2 hover:opacity-80 transition-opacity"
          aria-label="Alterar idioma"
        >
          {currentLang && (
            <div className="relative">
              <Flag language={currentLang} width={24} height={24} />
              {isOpen && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#1cb0f6] rounded-full" />
              )}
            </div>
          )}
        </button>

        {isOpen && (
          <div className="
            fixed 
            top-17.5 
            left-0 
            right-0 
            bg-white
            shadow-2xl 
            border-t 
            border-gray-200
            z-50 
            max-h-[calc(100vh-70px)]
            overflow-y-auto
            animate-in 
            slide-in-from-top-5
            duration-200
          ">
            <LanguageList onSelect={handleLanguageChange} currentLanguage={language.code} />
          </div>
        )}
      </div>
    );
  }

  // Renderizar desktop padrão
  return (
    <div
      ref={dropdownRef}
      className="relative"
      tabIndex={0}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="
          text-[15px]
          font-bold 
          tracking-[0.8px] 
          uppercase
          text-[#afafaf]
          whitespace-nowrap
          flex items-center
          gap-1.5
          hover:text-[#1cb0f6] transition-colors duration-200
        ">
          {t('common.language')}: {getNativeName(language.code)}
        </span>
        <ChevronDown className={`size-4 text-[#afafaf] group-hover:text-[#1cb0f6] transition-colors duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="
          absolute 
          right-0 
          mt-2 
          bg-white
          rounded-xl 
          shadow-2xl 
          border 
          border-gray-200
          z-50 
          w-64
          max-h-[70vh]
          overflow-hidden
          animate-in 
          fade-in 
          zoom-in-95 
          duration-150
        ">
          <LanguageList onSelect={handleLanguageChange} currentLanguage={language.code} />
        </div>
      )}
    </div>
  );
};

// Componente de lista reutilizável
interface LanguageListProps {
  onSelect: (languageCode: string) => void;
  currentLanguage: string;
}

const LanguageList = ({ onSelect, currentLanguage }: LanguageListProps) => {
  const { t } = useTranslation();

  const getNativeName = (code: string) => {
    return I18N_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  return (
    <div className="py-2">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#afafaf]">
          {t('common.selectLanguage')}
        </p>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {I18N_LANGUAGES.map((lang) => {
          const nativeName = getNativeName(lang.code);
          const isCurrent = lang.code === currentLanguage;

          return (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className={`
                flex w-full items-center gap-3 px-4 py-3 
                text-left text-sm transition-colors duration-150
                hover:bg-gray-50
                ${isCurrent
                  ? 'text-[#1cb0f6] bg-gray-50'
                  : 'text-gray-800'
                }
              `}
            >
              <div className="shrink-0">
                <Flag language={lang} width={24} height={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">
                  {nativeName}
                </div>
                {lang.name && lang.shortName !== nativeName && (
                  <div className="text-xs text-gray-500 truncate">
                    {lang.name}
                  </div>
                )}
              </div>
              {isCurrent && (
                <Check className="w-4 h-4 text-[#1cb0f6]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};