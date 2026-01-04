// src/config/languages.ts
export interface Language {
  code: string;
  name: string;
  shortName: string;
  direction: "ltr" | "rtl";
  flag: string;
}

export const I18N_LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    shortName: "EN",
    direction: "ltr",
    flag: "united-states.svg",
  },
  {
    code: "ar",
    name: "Arabic",
    shortName: "AR",
    direction: "rtl",
    flag: "saudi-arabia.svg",
  },
  {
    code: "es",
    name: "Spanish",
    shortName: "ES",
    direction: "ltr",
    flag: "spain.svg",
  },
  {
    code: "de",
    name: "German",
    shortName: "DE",
    direction: "ltr",
    flag: "germany.svg",
  },
  {
    code: "ch",
    name: "Chinese",
    shortName: "CH",
    direction: "ltr",
    flag: "china.svg",
  },
  {
    code: "br",
    name: "Portuguese",
    shortName: "BR",
    direction: "ltr",
    flag: "brazil.svg",
  },
];
