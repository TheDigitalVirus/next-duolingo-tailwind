export type TileStatus = "locked" | "available" | "completed";

export interface Tile {
  id: string;
  title: string;
  description: string;
  status: TileStatus;
  href: string;
  type: "lesson" | "practice" | "fast-forward";
}

export interface Unit {
  number: number;
  title: string;
  description: string;
  tiles: Tile[];
}

const LESSONS_PER_UNIT = 3;

const baseUnits: Omit<Unit, "tiles">[] = [
  { number: 1, title: "Fundamentos", description: "Saudações e frases básicas" },
  { number: 2, title: "Conversação", description: "Perguntas e respostas do dia a dia" },
  { number: 3, title: "Intermediário", description: "Vocabulário para situações reais" },
];

export const getTileStatus = (
  lessonsCompleted: number,
  unitNumber: number,
  tileIndex: number,
): TileStatus => {
  const tileAbsoluteIndex = (unitNumber - 1) * LESSONS_PER_UNIT + tileIndex;

  if (tileAbsoluteIndex < lessonsCompleted) return "completed";
  if (tileAbsoluteIndex === lessonsCompleted) return "available";
  return "locked";
};

export const buildUnits = (lessonsCompleted: number): Unit[] =>
  baseUnits.map((unit) => {
    const lessonTiles: Tile[] = Array.from({ length: LESSONS_PER_UNIT }).map((_, tileIndex) => ({
      id: `unit-${unit.number}-lesson-${tileIndex + 1}`,
      title: `Lição ${tileIndex + 1}`,
      description: "Lição principal",
      status: getTileStatus(lessonsCompleted, unit.number, tileIndex),
      href: "/lesson",
      type: "lesson",
    }));

    const practiceTile: Tile = {
      id: `unit-${unit.number}-practice`,
      title: "Prática",
      description: "Reforço personalizado",
      status: lessonsCompleted >= unit.number * LESSONS_PER_UNIT ? "available" : "locked",
      href: "/lesson?practice",
      type: "practice",
    };

    const fastForwardTile: Tile = {
      id: `unit-${unit.number}-fast-forward`,
      title: "Avanço rápido",
      description: "Teste para pular unidade",
      status: lessonsCompleted >= (unit.number - 1) * LESSONS_PER_UNIT ? "available" : "locked",
      href: `/lesson?fast-forward=${unit.number}`,
      type: "fast-forward",
    };

    return {
      ...unit,
      tiles: [...lessonTiles, practiceTile, fastForwardTile],
    };
  });
