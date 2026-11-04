export type SoundItem = {
  /** Identificador único, usado para guardar o progresso. */
  id: string;
  /** Símbolo exibido no card (IPA, kana...). */
  symbol: string;
  /** Palavra de exemplo exibida abaixo do símbolo. */
  example: string;
  /** Texto enviado ao sintetizador de voz ao clicar no card. */
  speak: string;
};

export type SoundSection = {
  id: string;
  title: string;
  items: SoundItem[];
};

export type SoundCourse = {
  /** Idioma para o sintetizador de voz (BCP 47). */
  speechLang: string;
  title: string;
  subtitle: string;
  sections: SoundSection[];
};

/** Quantas vezes um som precisa ser praticado para encher a barra. */
export const SOUND_PRACTICE_GOAL = 5;

const word = (lang: string, symbol: string, example: string): SoundItem => ({
  id: `${lang}-${symbol}`,
  symbol,
  example,
  speak: example,
});

const kana = (symbol: string, example: string): SoundItem => ({
  id: `ja-${symbol}`,
  symbol,
  example,
  speak: symbol,
});

export const soundCourses: Record<string, SoundCourse> = {
  en: {
    speechLang: "en-US",
    title: "Vamos aprender os sons em inglês!",
    subtitle: "Treine o ouvido e aprenda a pronunciar estes sons.",
    sections: [
      {
        id: "vogais",
        title: "Vogais",
        items: [
          word("en", "ɑ", "hot"),
          word("en", "æ", "cat"),
          word("en", "ʌ", "but"),
          word("en", "ɛ", "bed"),
          word("en", "eɪ", "say"),
          word("en", "ɝ", "bird"),
          word("en", "ɪ", "ship"),
          word("en", "i", "sheep"),
          word("en", "ə", "about"),
          word("en", "oʊ", "boat"),
          word("en", "ʊ", "foot"),
          word("en", "u", "food"),
          word("en", "aʊ", "cow"),
          word("en", "aɪ", "time"),
          word("en", "ɔɪ", "boy"),
        ],
      },
      {
        id: "consoantes",
        title: "Consoantes",
        items: [
          word("en", "b", "book"),
          word("en", "tʃ", "chair"),
          word("en", "d", "day"),
          word("en", "f", "fish"),
          word("en", "g", "go"),
          word("en", "h", "home"),
          word("en", "dʒ", "job"),
          word("en", "k", "key"),
          word("en", "l", "lion"),
          word("en", "m", "moon"),
          word("en", "n", "nose"),
          word("en", "ŋ", "sing"),
          word("en", "p", "pig"),
          word("en", "r", "red"),
          word("en", "s", "sun"),
          word("en", "ʃ", "shoe"),
          word("en", "t", "top"),
          word("en", "θ", "think"),
          word("en", "ð", "this"),
          word("en", "v", "van"),
          word("en", "w", "we"),
          word("en", "j", "yes"),
          word("en", "z", "zoo"),
          word("en", "ʒ", "vision"),
        ],
      },
    ],
  },
  ja: {
    speechLang: "ja-JP",
    title: "Vamos aprender os caracteres em japonês!",
    subtitle: "Ouça cada caractere e aprenda a reconhecê-lo.",
    sections: [
      {
        id: "vogais",
        title: "Vogais",
        items: [
          kana("あ", "a"),
          kana("い", "i"),
          kana("う", "u"),
          kana("え", "e"),
          kana("お", "o"),
        ],
      },
      {
        id: "consoantes",
        title: "Consoantes",
        items: [
          kana("か", "ka"),
          kana("さ", "sa"),
          kana("た", "ta"),
          kana("な", "na"),
          kana("は", "ha"),
          kana("ま", "ma"),
        ],
      },
    ],
  },
};

/** Conteúdo de sons do curso; cai para inglês se o idioma não tiver dados. */
export const getSoundCourse = (language?: string | null): SoundCourse =>
  soundCourses[language?.split("-")[0] ?? ""] ?? soundCourses.en;
