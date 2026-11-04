import { useSyncExternalStore } from "react";
import dayjs, { type Dayjs } from "dayjs";

const DATE_KEY_FORMAT = "YYYY-MM-DD";
const toDateKey = (day: Dayjs) => day.format(DATE_KEY_FORMAT);

export interface BoundStoreState {
  loggedIn: boolean;
  name: string;
  username: string;
  joinedAt: string;
  lessonsCompleted: number;
  xp: number;
  streak: number;
  gems: number;
  lingots: number;
  inventory: Record<string, number>;
  hearts: number;
  following: number;
  followers: number;
  language: string;
  /** Dias (YYYY-MM-DD) em que o usuário completou ao menos uma lição. */
  activeDays: string[];
  /** XP ganho por dia (chave YYYY-MM-DD). */
  xpByDate: Record<string, number>;
  /** Meta diária de XP. */
  goalXp: number;
  /** Segundos de estudo por dia (chave YYYY-MM-DD). */
  studySecondsByDate: Record<string, number>;
  /** Lições concluídas com sequência de acertos, por dia. */
  comboLessonsByDate: Record<string, number>;
  /** Total de respostas erradas (alimenta a coleção "Erros"). */
  mistakes: number;
  /** Quantas vezes cada som foi praticado (chave = id do som). */
  soundPractice: Record<string, number>;
}

export interface BoundStoreActions {
  isActiveDay: (day: Dayjs) => boolean;
  xpToday: () => number;
  xpThisWeek: () => number;
  minutesToday: () => number;
  comboLessonsToday: () => number;
  addStudyTime: (seconds: number) => void;
  recordComboLesson: () => void;
  recordMistake: () => void;
  practiceSound: (soundId: string) => void;
  setLoggedIn: (value: boolean) => void;
  setName: (value: string) => void;
  setUsername: (value: string) => void;
  setJoinedAt: (value: string) => void;
  setLanguage: (value: string) => void;
  increaseXp: (amount?: number) => void;
  increaseLessonsCompleted: (amount?: number) => void;
  addToday: (amount?: number) => void;
  jumpToUnit: (unit: number) => void;
  increaseLingots: (amount?: number) => void;
  increaseHearts: (amount?: number) => void;
  increaseFollowing: (amount?: number) => void;
  increaseFollowers: (amount?: number) => void;
  purchaseItem: (itemId: string, currency: "gems" | "lingots", cost: number) => boolean;
  resetProgress: () => void;
}

export type BoundStore = BoundStoreState & BoundStoreActions;

const initialState: BoundStoreState = {
  loggedIn: false,
  name: "",
  username: "",
  joinedAt: "",
  lessonsCompleted: 0,
  xp: 0,
  streak: 0,
  gems: 0,
  lingots: 0,
  inventory: {},
  hearts: 5,
  following: 0,
  followers: 0,
  language: "en",
  activeDays: [],
  xpByDate: {},
  goalXp: 20,
  studySecondsByDate: {},
  comboLessonsByDate: {},
  mistakes: 0,
  soundPractice: {},
};

const addToDay = (record: Record<string, number>, amount: number) => {
  const today = toDateKey(dayjs());
  return { ...record, [today]: (record[today] ?? 0) + amount };
};

let state: BoundStoreState = { ...initialState };
const listeners = new Set<() => void>();

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const setState = (updater: (previous: BoundStoreState) => BoundStoreState) => {
  state = updater(state);
  emitChange();
};

const actions: BoundStoreActions = {
  isActiveDay: (day) => state.activeDays.includes(toDateKey(day)),
  xpToday: () => state.xpByDate[toDateKey(dayjs())] ?? 0,
  minutesToday: () => Math.floor((state.studySecondsByDate[toDateKey(dayjs())] ?? 0) / 60),
  comboLessonsToday: () => state.comboLessonsByDate[toDateKey(dayjs())] ?? 0,
  addStudyTime: (seconds) =>
    setState((previous) => ({
      ...previous,
      studySecondsByDate: addToDay(previous.studySecondsByDate, Math.max(0, Math.round(seconds))),
    })),
  recordComboLesson: () =>
    setState((previous) => ({
      ...previous,
      comboLessonsByDate: addToDay(previous.comboLessonsByDate, 1),
    })),
  recordMistake: () => setState((previous) => ({ ...previous, mistakes: previous.mistakes + 1 })),
  practiceSound: (soundId) =>
    setState((previous) => ({
      ...previous,
      soundPractice: {
        ...previous.soundPractice,
        [soundId]: (previous.soundPractice[soundId] ?? 0) + 1,
      },
    })),
  xpThisWeek: () => {
    const startOfWeek = dayjs().startOf("week");
    return Object.entries(state.xpByDate).reduce(
      (total, [date, xp]) =>
        dayjs(date).isBefore(startOfWeek) ? total : total + xp,
      0,
    );
  },
  setLoggedIn: (value) => setState((previous) => ({ ...previous, loggedIn: value })),
  setName: (value) => setState((previous) => ({ ...previous, name: value })),
  setUsername: (value) => setState((previous) => ({ ...previous, username: value })),
  setJoinedAt: (value) => setState((previous) => ({ ...previous, joinedAt: value })),
  setLanguage: (value) => setState((previous) => ({ ...previous, language: value })),
  increaseXp: (amount = 1) =>
    setState((previous) => {
      const today = toDateKey(dayjs());
      return {
        ...previous,
        xp: previous.xp + amount,
        xpByDate: { ...previous.xpByDate, [today]: (previous.xpByDate[today] ?? 0) + amount },
      };
    }),
  increaseLessonsCompleted: (amount = 1) =>
    setState((previous) => ({ ...previous, lessonsCompleted: previous.lessonsCompleted + amount })),
  addToday: (amount = 1) =>
    setState((previous) => {
      const today = toDateKey(dayjs());
      return {
        ...previous,
        streak: previous.streak + amount,
        activeDays: previous.activeDays.includes(today)
          ? previous.activeDays
          : [...previous.activeDays, today],
      };
    }),
  jumpToUnit: (unit) => setState((previous) => ({ ...previous, lessonsCompleted: Math.max(0, unit) })),
  increaseLingots: (amount = 1) =>
    setState((previous) => ({ ...previous, lingots: previous.lingots + amount, gems: previous.gems + amount })),
  increaseHearts: (amount = 1) => setState((previous) => ({ ...previous, hearts: previous.hearts + amount })),
  increaseFollowing: (amount = 1) =>
    setState((previous) => ({ ...previous, following: previous.following + amount })),
  increaseFollowers: (amount = 1) =>
    setState((previous) => ({ ...previous, followers: previous.followers + amount })),
  purchaseItem: (itemId, currency, cost) => {
    if (state[currency] < cost) {
      return false;
    }

    setState((previous) => ({
      ...previous,
      [currency]: previous[currency] - cost,
      inventory: {
        ...previous.inventory,
        [itemId]: (previous.inventory[itemId] ?? 0) + 1,
      },
    }));

    return true;
  },
  resetProgress: () =>
    setState((previous) => ({
      ...previous,
      lessonsCompleted: initialState.lessonsCompleted,
      xp: initialState.xp,
      streak: initialState.streak,
      gems: initialState.gems,
      hearts: initialState.hearts,
      lingots: initialState.lingots,
      inventory: initialState.inventory,
      activeDays: initialState.activeDays,
      xpByDate: initialState.xpByDate,
      studySecondsByDate: initialState.studySecondsByDate,
      comboLessonsByDate: initialState.comboLessonsByDate,
      mistakes: initialState.mistakes,
      soundPractice: initialState.soundPractice,
    })),
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getBoundStoreState = (): BoundStore => ({ ...state, ...actions });

export const useBoundStore = <T>(selector: (store: BoundStore) => T): T =>
  useSyncExternalStore(subscribe, () => selector(getBoundStoreState()), () => selector(getBoundStoreState()));

export const resetBoundStore = () => {
  state = { ...initialState };
  emitChange();
};
