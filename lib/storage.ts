import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "malee:favorites";
const MYDECKS_KEY = "malee:myDecks";
const PROGRESS_PREFIX = "malee:progress:";
const DAILY_KEY = "malee:dailyInteractions";
const CURRENT_DECK_KEY = "malee:currentDeck";

export type BoolMap = { [key: string]: boolean };
export type WordStatus = "unknown" | "difficult" | "known";
export type DeckProgress = { [wordIndex: number]: WordStatus };
export type CurrentDeck = {
  slug: string;
  title: string;
  count: number;
  progress: number;
};

export async function getFavorites(): Promise<BoolMap> {
  const v = await AsyncStorage.getItem(FAVORITES_KEY);
  return v ? JSON.parse(v) : {};
}

export async function setFavorite(slug: string, liked: boolean): Promise<void> {
  const current = await getFavorites();
  const next = { ...current, [slug]: liked };
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
}

export async function getMyDecks(): Promise<BoolMap> {
  const v = await AsyncStorage.getItem(MYDECKS_KEY);
  return v ? JSON.parse(v) : {};
}

export async function setMyDeck(slug: string, added: boolean): Promise<void> {
  const current = await getMyDecks();
  const next = { ...current, [slug]: added };
  await AsyncStorage.setItem(MYDECKS_KEY, JSON.stringify(next));
}

export async function getDeckProgress(slug: string): Promise<DeckProgress> {
  const v = await AsyncStorage.getItem(PROGRESS_PREFIX + slug);
  return v ? JSON.parse(v) : {};
}

export async function setDeckWordStatus(
  slug: string,
  wordIndex: number,
  status: WordStatus
): Promise<void> {
  const current = await getDeckProgress(slug);
  const next = { ...current, [wordIndex]: status };
  await AsyncStorage.setItem(PROGRESS_PREFIX + slug, JSON.stringify(next));
}

export async function getDeckProgressStats(
  slug: string,
  totalWords: number
): Promise<{ interacted: number; known: number; progress: number }> {
  const p = await getDeckProgress(slug);
  const interacted = Object.keys(p).length;
  const known = Object.values(p).filter(
    (s) => s === "difficult" || s === "known"
  ).length;
  const progress = totalWords > 0 ? interacted / totalWords : 0;
  return { interacted, known, progress };
}

export async function getTodayInteractions(): Promise<number> {
  const v = await AsyncStorage.getItem(DAILY_KEY);
  const map = v ? (JSON.parse(v) as { [date: string]: number }) : {};
  const key = new Date().toISOString().slice(0, 10);
  return map[key] || 0;
}

export async function incTodayInteractions(delta: number = 1): Promise<number> {
  const v = await AsyncStorage.getItem(DAILY_KEY);
  const map = v ? (JSON.parse(v) as { [date: string]: number }) : {};
  const key = new Date().toISOString().slice(0, 10);
  const next = (map[key] || 0) + delta;
  map[key] = next;
  await AsyncStorage.setItem(DAILY_KEY, JSON.stringify(map));
  return next;
}

export async function getCurrentDeck(): Promise<CurrentDeck | null> {
  const v = await AsyncStorage.getItem(CURRENT_DECK_KEY);
  return v ? JSON.parse(v) : null;
}

export async function setCurrentDeck(deck: CurrentDeck): Promise<void> {
  await AsyncStorage.setItem(CURRENT_DECK_KEY, JSON.stringify(deck));
}
