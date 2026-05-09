import { useSyncExternalStore } from "react";

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
}

export interface BoundStoreActions {
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
  setLoggedIn: (value) => setState((previous) => ({ ...previous, loggedIn: value })),
  setName: (value) => setState((previous) => ({ ...previous, name: value })),
  setUsername: (value) => setState((previous) => ({ ...previous, username: value })),
  setJoinedAt: (value) => setState((previous) => ({ ...previous, joinedAt: value })),
  setLanguage: (value) => setState((previous) => ({ ...previous, language: value })),
  increaseXp: (amount = 1) => setState((previous) => ({ ...previous, xp: previous.xp + amount })),
  increaseLessonsCompleted: (amount = 1) =>
    setState((previous) => ({ ...previous, lessonsCompleted: previous.lessonsCompleted + amount })),
  addToday: (amount = 1) => setState((previous) => ({ ...previous, streak: previous.streak + amount })),
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
