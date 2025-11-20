import AsyncStorage from "@react-native-async-storage/async-storage";
import { SRSStats } from "./srs";

const FAVORITES_KEY = "malee:favorites";
const MYDECKS_KEY = "malee:myDecks";
const PROGRESS_PREFIX = "malee:progress:v2:"; // Changed prefix to reset/migrate
const DAILY_KEY = "malee:dailyInteractions";
const CURRENT_DECK_KEY = "malee:currentDeck";

export type BoolMap = { [key: string]: boolean };
export type DeckProgress = { [wordIndex: number]: SRSStats };
export type CurrentDeck = {
  slug: string;
  title: string;
  count: number;
  progress: number;
};

export type DetailedStats = {
  new: number;
  learning: number;
  review: number;
  mastered: number;
  total: number;
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

export async function saveWordStats(
  slug: string,
  wordIndex: number,
  stats: SRSStats
): Promise<void> {
  const current = await getDeckProgress(slug);
  const next = { ...current, [wordIndex]: stats };
  await AsyncStorage.setItem(PROGRESS_PREFIX + slug, JSON.stringify(next));
}

export async function getDeckProgressStats(
  slug: string,
  totalWords: number
): Promise<{ interacted: number; known: number; progress: number }> {
  const p = await getDeckProgress(slug);
  const interacted = Object.keys(p).length;
  // Consider "known" if repetition > 0 (passed at least once)
  const known = Object.values(p).filter((s) => s.repetition > 0).length;
  const progress = totalWords > 0 ? known / totalWords : 0;
  return { interacted, known, progress };
}

export async function getDetailedDeckStats(
  slug: string,
  totalWords: number
): Promise<DetailedStats> {
  const p = await getDeckProgress(slug);
  const now = Date.now();

  let newCards = 0;
  let learning = 0;
  let review = 0;
  let mastered = 0;

  // We iterate up to totalWords because p might be sparse or incomplete if totalWords changed
  for (let i = 0; i < totalWords; i++) {
    const stats = p[i];
    if (!stats) {
      newCards++;
    } else {
      // Logic for categorization:
      // Mastered: Interval > 21 days
      // Review: Due date is past (or close)
      // Learning: Interval <= 21 days

      if (stats.interval > 21) {
        mastered++;
      } else if (stats.dueDate <= now) {
        review++;
      } else {
        learning++;
      }
    }
  }

  const progress = totalWords > 0 ? (mastered + learning) / totalWords : 0;

  return {
    new: newCards,
    learning,
    review,
    mastered,
    total: totalWords,
    progress,
  };
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
