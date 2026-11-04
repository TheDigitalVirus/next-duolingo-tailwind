export type TileType =
  | "star"
  | "book"
  | "dumbbell"
  | "fast-forward"
  | "treasure"
  | "trophy";

export type Tile =
  | {
      type: "star" | "book" | "dumbbell" | "fast-forward";
      description: string;
    }
  | { type: "trophy"; description: string }
  | { type: "treasure" };

export interface Unit {
  /** Número global da unidade (1, 2, 3...). */
  unitNumber: number;
  /** Seção do curso à qual a unidade pertence. */
  section: number;
  /** Posição da unidade dentro da seção. */
  unitInSection: number;
  title: string;
  description: string;
  backgroundColor: `bg-${string}`;
  borderColor: `border-${string}`;
  textColor: `text-${string}`;
  tiles: Tile[];
}

/** Cada tile (exceto o baú) equivale a este número de lições. */
export const LESSONS_PER_TILE = 4;

/** Unidade em que está o próximo tile a fazer (a última, se o curso acabou). */
export const getCurrentUnit = (lessonsCompleted: number): Unit => {
  let tilesLeft = Math.floor(lessonsCompleted / LESSONS_PER_TILE);
  for (const unit of units) {
    if (tilesLeft < unit.tiles.length) return unit;
    tilesLeft -= unit.tiles.length;
  }
  return units[units.length - 1];
};

export const units: Unit[] = [
  {
    unitNumber: 1,
    section: 1,
    unitInSection: 1,
    title: "Fundamentos",
    description: "Saudações e frases básicas",
    backgroundColor: "bg-[#58CC02]",
    borderColor: "border-[#46A302]",
    textColor: "text-[#58CC02]",
    tiles: [
      { type: "star", description: "Saudações" },
      { type: "book", description: "Apresentações" },
      { type: "star", description: "Frases básicas" },
      { type: "treasure" },
      { type: "dumbbell", description: "Prática personalizada" },
      { type: "star", description: "Números" },
      { type: "trophy", description: "Revisão da unidade 1" },
    ],
  },
  {
    unitNumber: 2,
    section: 1,
    unitInSection: 2,
    title: "Conversação",
    description: "Perguntas e respostas do dia a dia",
    backgroundColor: "bg-[#CE82FF]",
    borderColor: "border-[#A568CC]",
    textColor: "text-[#CE82FF]",
    tiles: [
      { type: "fast-forward", description: "Fazer perguntas" },
      { type: "book", description: "No café" },
      { type: "star", description: "Rotina" },
      { type: "treasure" },
      { type: "dumbbell", description: "Prática personalizada" },
      { type: "star", description: "Família" },
      { type: "trophy", description: "Revisão da unidade 2" },
    ],
  },
  {
    unitNumber: 3,
    section: 2,
    unitInSection: 1,
    title: "Intermediário",
    description: "Vocabulário para situações reais",
    backgroundColor: "bg-[#00CD9C]",
    borderColor: "border-[#00A47D]",
    textColor: "text-[#00CD9C]",
    tiles: [
      { type: "fast-forward", description: "Viagens" },
      { type: "book", description: "No aeroporto" },
      { type: "star", description: "Direções" },
      { type: "treasure" },
      { type: "dumbbell", description: "Prática personalizada" },
      { type: "star", description: "Compras" },
      { type: "trophy", description: "Revisão da unidade 3" },
    ],
  },
];
