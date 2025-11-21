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

// --- Custom Decks ---

const CUSTOM_DECKS_KEY = "malee:customDecks";

export type CustomDeck = {
  slug: string;
  title: string;
  icon: string;
  bg: string;
  words: { en: string; th: string; example?: string }[];
  createdAt: number;
};

export async function getCustomDecks(): Promise<CustomDeck[]> {
  const v = await AsyncStorage.getItem(CUSTOM_DECKS_KEY);
  return v ? JSON.parse(v) : [];
}

export async function saveCustomDeck(deck: CustomDeck): Promise<void> {
  const current = await getCustomDecks();
  const existingIndex = current.findIndex((d) => d.slug === deck.slug);

  let next;
  if (existingIndex >= 0) {
    next = [...current];
    next[existingIndex] = deck;
  } else {
    next = [...current, deck];
  }

  await AsyncStorage.setItem(CUSTOM_DECKS_KEY, JSON.stringify(next));
}

export async function deleteCustomDeck(slug: string): Promise<void> {
  const decks = await getCustomDecks();
  const newDecks = decks.filter(d => d.slug !== slug);
  await AsyncStorage.setItem(CUSTOM_DECKS_KEY, JSON.stringify(newDecks));
}

export async function addWordToCustomDeck(deckSlug: string, word: { en: string; th: string; example?: string }): Promise<void> {
  const decks = await getCustomDecks();
  const deckIndex = decks.findIndex(d => d.slug === deckSlug);

  if (deckIndex >= 0) {
    const deck = decks[deckIndex];
    // Check if word already exists to avoid duplicates
    if (!deck.words.some(w => w.en.toLowerCase() === word.en.toLowerCase())) {
      deck.words.push(word);
      await saveCustomDeck(deck);
    }
  }
}

// --- Settings ---

const SETTINGS_KEY = "malee:settings";

export type AppSettings = {
  dailyReminders: boolean;
  soundEffects: boolean;
  dailyGoal: number; // New: Configurable daily goal
  textSize: number; // New: Font size multiplier (0.8, 1, 1.2)
  name: string;
  avatarUri: string | null;
};

const DEFAULT_SETTINGS: AppSettings = {
  dailyReminders: true,
  soundEffects: true,
  dailyGoal: 50,
  textSize: 1,
  name: "Guest User",
  avatarUri: null,
};

export async function getSettings(): Promise<AppSettings> {
  const v = await AsyncStorage.getItem(SETTINGS_KEY);
  return v ? { ...DEFAULT_SETTINGS, ...JSON.parse(v) } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// --- Advanced Stats ---

export async function getHeatmapData(): Promise<{ [date: string]: number }> {
  const v = await AsyncStorage.getItem(DAILY_KEY);
  return v ? JSON.parse(v) : {};
}

export async function getStreak(): Promise<number> {
  const v = await AsyncStorage.getItem(DAILY_KEY);
  const map = v ? (JSON.parse(v) as { [date: string]: number }) : {};

  const dates = Object.keys(map).sort().reverse(); // Newest first
  if (dates.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // If no activity today or yesterday, streak is broken (unless we count today as 0 but streak kept from yesterday? 
  // Usually streak implies contiguous days up to now. If I practiced yesterday but not today, streak is X. If I practice today, it becomes X+1.
  // If I missed yesterday, streak is 0 (or 1 if I practiced today).

  let streak = 0;
  let currentCheck = today;

  // Check if we have activity today
  if (map[today]) {
    streak++;
    currentCheck = yesterday;
  } else if (map[yesterday]) {
    // If not today, but yesterday, streak is still valid but doesn't include today yet
    currentCheck = yesterday;
  } else {
    return 0;
  }

  // Count backwards
  while (true) {
    if (map[currentCheck]) {
      if (currentCheck !== today) { // Don't double count today if we started there
        streak++;
      }
      // Move to previous day
      const d = new Date(currentCheck);
      d.setDate(d.getDate() - 1);
      currentCheck = d.toISOString().slice(0, 10);
    } else {
      break;
    }
  }

  return streak;
}

export async function getTotalLearned(allDeckSlugs: string[]): Promise<number> {
  let total = 0;
  for (const slug of allDeckSlugs) {
    const p = await getDeckProgress(slug);
    // Count words with repetition > 0 (meaning they've been successfully reviewed at least once)
    total += Object.values(p).filter(s => s.repetition > 0).length;
  }
  return total;
}

export async function getAllDueCards(allDeckSlugs: string[], deckSizes: { [slug: string]: number }): Promise<number> {
  let totalDue = 0;
  const now = Date.now();

  for (const slug of allDeckSlugs) {
    const p = await getDeckProgress(slug);
    const size = deckSizes[slug] || 0;

    // Check existing cards
    for (let i = 0; i < size; i++) {
      const stats = p[i];
      if (stats) {
        if (stats.dueDate <= now) {
          totalDue++;
        }
      } else {
        // New card - technically "due" to be learned, but usually we separate "Review" from "New".
        // Let's count only Reviews for "Due".
      }
    }
  }
  return totalDue;
}

export async function resetProgress(): Promise<void> {
  // 1. Clear Daily Interactions
  await AsyncStorage.removeItem(DAILY_KEY);

  // 2. Clear Current Deck (Resume state)
  await AsyncStorage.removeItem(CURRENT_DECK_KEY);

  // 3. Clear Custom Decks
  await AsyncStorage.removeItem(CUSTOM_DECKS_KEY);

  // 4. Clear Favorites/My Decks
  await AsyncStorage.removeItem(MYDECKS_KEY);
  await AsyncStorage.removeItem(FAVORITES_KEY);

  // 5. Clear Deck Progress (This is harder because keys are dynamic)
  // We need to find all keys starting with PROGRESS_PREFIX
  const keys = await AsyncStorage.getAllKeys();
  const progressKeys = keys.filter((k) => k.startsWith(PROGRESS_PREFIX));
  if (progressKeys.length > 0) {
    await AsyncStorage.multiRemove(progressKeys);
  }
}
