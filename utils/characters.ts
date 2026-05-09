export type CharacterItem = {
  symbol: string;
  example: string;
  progress: number;
};

export type CharacterSection = {
  id: string;
  title: string;
  items: CharacterItem[];
};

export const charactersDataset: CharacterSection[] = [
  {
    id: "vogais",
    title: "Vogais",
    items: [
      { symbol: "あ", example: "asa (manhã)", progress: 85 },
      { symbol: "い", example: "inu (cachorro)", progress: 60 },
      { symbol: "う", example: "umi (mar)", progress: 45 },
      { symbol: "え", example: "eki (estação)", progress: 70 },
      { symbol: "お", example: "otoko (homem)", progress: 30 },
    ],
  },
  {
    id: "consoantes",
    title: "Consoantes",
    items: [
      { symbol: "か", example: "kasa (guarda-chuva)", progress: 75 },
      { symbol: "さ", example: "sakura (cerejeira)", progress: 50 },
      { symbol: "た", example: "taberu (comer)", progress: 40 },
      { symbol: "な", example: "neko (gato)", progress: 55 },
      { symbol: "は", example: "hana (flor)", progress: 65 },
      { symbol: "ま", example: "mizu (água)", progress: 20 },
    ],
  },
];
