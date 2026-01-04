"use client";

import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { DirectionProvider as RadixDirectionProvider } from "@radix-ui/react-direction";
import { I18N_LANGUAGES } from "@/i18n/config";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enTranslations from "@/i18n/messages/en.json";
import arTranslations from "@/i18n/messages/ar.json";
import esTranslations from "@/i18n/messages/es.json";
import deTranslations from "@/i18n/messages/de.json";
import chTranslations from "@/i18n/messages/ch.json";
import brTranslations from "@/i18n/messages/br.json";

interface I18nProviderProps {
  children: ReactNode;
}
const createI18nInstance = () => {
  const instance = i18n.createInstance();

  const resources = {
    en: { translation: enTranslations },
    ar: { translation: arTranslations },
    es: { translation: esTranslations },
    de: { translation: deTranslations },
    ch: { translation: chTranslations },
    br: { translation: brTranslations },
  };

  instance
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "br",
      debug: process.env.NODE_ENV === "development",

      interpolation: {
        escapeValue: false, // React already does escaping
      },

      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
        lookupLocalStorage: "language",
      },

      react: {
        useSuspense: false, // Important for Next.js SSR
      },
    })
  return instance;
}

const i18nInstance = createI18nInstance();

function I18nProvider({ children }: I18nProviderProps) {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    // Initialize i18n only on client side

    if (!i18nInstance.isInitialized) {
      i18nInstance.init().then(() => {
        setIsI18nInitialized(true);
      });
    } else {
      setIsI18nInitialized(true);
    }
    // Update document direction when language changes
    const handleLanguageChange = (lng: string) => {
      const language = I18N_LANGUAGES.find((lang) => lang.code === lng);
      if (language?.direction) {
        document.documentElement.setAttribute("dir", language.direction);
      }
    };

    // Set initial direction
    if (i18nInstance.language) {
      handleLanguageChange(i18nInstance.language);
    }

    // Listen for language changes
    i18nInstance.on("languageChanged", handleLanguageChange);

    return () => {
      i18nInstance.off("languageChanged", handleLanguageChange);
    };
  }, []);

  // Get current language for direction
  const currentLanguage =
    I18N_LANGUAGES.find((lang) => lang.code === (i18nInstance.language || "br")) ||
    I18N_LANGUAGES[0];

  // Don't render until i18n is initialized
  if (!isI18nInitialized) {
    return (
      <RadixDirectionProvider dir="ltr">{children}</RadixDirectionProvider>
    );
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      <RadixDirectionProvider dir={currentLanguage.direction}>
        {children}
      </RadixDirectionProvider>
    </I18nextProvider>
  );
}

const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState(
    I18N_LANGUAGES.find((lang) => lang.code === i18nInstance.language) ||
    I18N_LANGUAGES[0],
  );

  useEffect(() => {
    const handleLanguageChanged = () => {
      const newLang =
        I18N_LANGUAGES.find((lang) => lang.code === i18nInstance.language) ||
        I18N_LANGUAGES[0];
      setCurrentLanguage(newLang);
    };

    i18nInstance.on("languageChanged", handleLanguageChanged);
    return () => {
      i18nInstance.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  const changeLanguage = (code: string) => {
    i18nInstance.changeLanguage(code);
  };

  return {
    languageCode: i18nInstance.language,
    language: currentLanguage,
    changeLanguage,
  };
};

export { I18nProvider, useLanguage };
