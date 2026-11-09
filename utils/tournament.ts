import dayjs, { type Dayjs } from "dayjs";
import {
  DEMOTION_SLOTS,
  getRankZone,
  isBottomLeague,
  isTopLeague,
  LEAGUES,
  PROMOTION_SLOTS,
  type RankZone,
} from "./leagues";

/**
 * Torneio semanal simulado no cliente. Os oponentes são gerados de forma
 * determinística a partir da semana + divisão, então o ranking é estável
 * e pode ser recalculado quando a semana termina.
 *
 * Para trocar por oponentes reais, substitua `getOpponents` por dados da API.
 */

export const TOURNAMENT_SIZE = 20;
/** Quem termina até esta posição ganha a poção de XP. */
export const REWARD_MAX_RANK = 3;
export const XP_POTION_MINUTES = 30;

export type TournamentPlayer = {
  id: string;
  name: string;
  xp: number;
  status: string | null;
  streakLabel: string | null;
  isCurrentUser: boolean;
};

export type TournamentResult = {
  weekKey: string;
  rank: number;
  outcome: "promoted" | "stayed" | "demoted";
  /** Divisão em que o torneio foi disputado. */
  leagueIndex: number;
  /** Divisão para a semana seguinte. */
  newLeagueIndex: number;
  stats: { xp: number; minutes: number; perfectLessons: number; lessons: number };
  reward: { type: "xp-potion"; minutes: number } | null;
};

/** Chave da semana (domingo que a inicia), no formato YYYY-MM-DD. */
export const getWeekKey = (day: Dayjs = dayjs()) => day.startOf("week").format("YYYY-MM-DD");

export const getWeekEnd = (weekKey: string) => dayjs(weekKey).endOf("week");

const sumInWeek = (record: Record<string, number>, weekKey: string) => {
  const start = dayjs(weekKey);
  const end = getWeekEnd(weekKey);
  return Object.entries(record).reduce((total, [day, value]) => {
    const date = dayjs(day);
    return date.isBefore(start) || date.isAfter(end) ? total : total + value;
  }, 0);
};

// --- Oponentes determinísticos -------------------------------------------

const NAMES = [
  "Ana Beatriz", "Carlos Eduardo", "Fernanda Lima", "Lucas Martins", "Patrícia Souza",
  "Rafael Costa", "Juliana Alves", "Bruno Ferreira", "Camila Rocha", "Diego Ribeiro",
  "Larissa Gomes", "Mateus Oliveira", "Gabriela Dias", "Thiago Barbosa", "Isabela Castro",
  "Felipe Araújo", "Mariana Pires", "Gustavo Mendes", "Letícia Nunes", "Vinícius Cardoso",
  "Beatriz Moreira", "Rodrigo Teixeira", "Aline Correia", "Eduardo Lopes", "Natália Freitas",
];
const STATUSES = ["😎", "🎉", "💪", "👀", "🍿", "🔥", "💯", "🏆", null, null, null, null];

const hashString = (value: string) =>
  Array.from(value).reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) | 0, 7);

/** PRNG simples e determinístico (mulberry32). */
const createRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const streakLabel = (random: () => number) => {
  const roll = random();
  if (roll < 0.15) return `Mais de ${1 + Math.floor(random() * 4)} ${roll < 0.05 ? "ano" : "anos"}`;
  if (roll < 0.35) return `${30 + Math.floor(random() * 300)} dias`;
  return null;
};

/**
 * Oponentes da semana. `elapsed` (0–1) é quanto da semana já passou:
 * o XP deles cresce ao longo da semana até o valor final.
 */
export const getOpponents = (
  weekKey: string,
  leagueIndex: number,
  elapsed: number,
): TournamentPlayer[] => {
  const random = createRandom(hashString(`${weekKey}:${leagueIndex}`));
  const baseXp = 80 + leagueIndex * 45;
  const names = [...NAMES].sort(() => random() - 0.5).slice(0, TOURNAMENT_SIZE - 1);

  return names.map((name, i) => {
    const finalXp = Math.round(baseXp * (0.25 + random() * 2.2));
    const pace = 0.7 + random() * 0.6;
    return {
      id: `opponent-${weekKey}-${i}`,
      name,
      xp: Math.round(finalXp * Math.min(1, elapsed * pace)),
      status: STATUSES[Math.floor(random() * STATUSES.length)],
      streakLabel: streakLabel(random),
      isCurrentUser: false,
    };
  });
};

export const getWeekElapsed = (weekKey: string, now: Dayjs = dayjs()) => {
  const start = dayjs(weekKey);
  return Math.min(1, Math.max(0, now.diff(start) / getWeekEnd(weekKey).diff(start)));
};

/** Ranking ordenado (empate: o usuário fica na frente). */
export const buildStandings = (
  opponents: TournamentPlayer[],
  user: TournamentPlayer,
): TournamentPlayer[] =>
  [...opponents, user].sort(
    (a, b) => b.xp - a.xp || Number(b.isCurrentUser) - Number(a.isCurrentUser),
  );

type History = {
  xpByDate: Record<string, number>;
  studySecondsByDate: Record<string, number>;
  comboLessonsByDate: Record<string, number>;
  lessonsByDate: Record<string, number>;
};

/** Resultado final de uma semana já encerrada (null se o usuário não pontuou). */
export const computeTournamentResult = (
  weekKey: string,
  leagueIndex: number,
  history: History,
): TournamentResult | null => {
  const xp = sumInWeek(history.xpByDate, weekKey);
  if (xp <= 0) return null;

  const standings = buildStandings(getOpponents(weekKey, leagueIndex, 1), {
    id: "me",
    name: "",
    xp,
    status: null,
    streakLabel: null,
    isCurrentUser: true,
  });
  const rank = standings.findIndex((player) => player.isCurrentUser) + 1;
  const zone: RankZone = getRankZone(rank, standings.length, leagueIndex);

  const newLeagueIndex =
    zone === "promotion" && !isTopLeague(leagueIndex)
      ? leagueIndex + 1
      : zone === "demotion" && !isBottomLeague(leagueIndex)
        ? leagueIndex - 1
        : leagueIndex;

  return {
    weekKey,
    rank,
    leagueIndex,
    newLeagueIndex,
    outcome:
      newLeagueIndex > leagueIndex ? "promoted" : newLeagueIndex < leagueIndex ? "demoted" : "stayed",
    stats: {
      xp,
      minutes: Math.floor(sumInWeek(history.studySecondsByDate, weekKey) / 60),
      perfectLessons: sumInWeek(history.comboLessonsByDate, weekKey),
      lessons: sumInWeek(history.lessonsByDate, weekKey),
    },
    reward: rank <= REWARD_MAX_RANK ? { type: "xp-potion", minutes: XP_POTION_MINUTES } : null,
  };
};

/**
 * Resultados de exemplo para ver os modais em desenvolvimento:
 * /leaderboard?torneio=rebaixado | promovido | manteve
 */
export const getDemoTournamentResult = (kind: string): TournamentResult => {
  const top = LEAGUES.length - 1;
  const stats = { xp: 183, minutes: 12, perfectLessons: 6, lessons: 8 };
  const potion = { type: "xp-potion" as const, minutes: XP_POTION_MINUTES };

  if (kind === "rebaixado") {
    return { weekKey: "demo", rank: 14, outcome: "demoted", leagueIndex: top, newLeagueIndex: top - 1, stats, reward: null };
  }
  if (kind === "promovido") {
    return { weekKey: "demo", rank: 2, outcome: "promoted", leagueIndex: top - 1, newLeagueIndex: top, stats, reward: potion };
  }
  return { weekKey: "demo", rank: 3, outcome: "stayed", leagueIndex: top, newLeagueIndex: top, stats, reward: potion };
};

export { PROMOTION_SLOTS, DEMOTION_SLOTS };
