import { Confetti } from "@/components/confetti";
import { getDeckBySlug } from "@/data/decks";
import { useBottomSheet } from "@/hooks/bottom-sheet-store";
import { calculateNextReview, INITIAL_STATS, mapRatingToGrade, SRSStats } from "@/lib/srs";
import {
  AppSettings,
  DeckProgress,
  getCustomDecks,
  getDeckProgress,
  getDeckProgressStats,
  getSettings,
  getTodayInteractions,
  incTodayInteractions,
  saveWordStats,
  setCurrentDeck
} from "@/lib/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAudioPlayer, useAudioRecorder } from 'expo-audio';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

const ACCENT = "#F1FF00";
const TEXT = "#000000";
const PAGE_BG = "#FFFFFF";

type CardData = { front: string; back: string; example?: string };

export default function LearnScreen() {
  const { title, count, slug } = useLocalSearchParams<{
    title?: string;
    count?: string;
    slug?: string;
  }>();
  const router = useRouter();
  const bottomSheet = useBottomSheet();

  const [deck, setDeck] = useState<any>(getDeckBySlug(String(slug)));
  const [cards, setCards] = useState<CardData[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ dailyReminders: true, soundEffects: true, dailyGoal: 50, textSize: 1 });

  // Queue management
  const [queue, setQueue] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Index within the queue
  const [loading, setLoading] = useState(true);
  const [deckStats, setDeckStats] = useState<DeckProgress>({});
  const [history, setHistory] = useState<Array<{ index: number; stats: SRSStats }>>([]);
  const [learnedWordsCount, setLearnedWordsCount] = useState(0); // Track learned words

  const [flipped, setFlipped] = useState(false);
  const flip = useSharedValue(0);
  const scaleNext = useSharedValue(0.96);
  const [progress, setProgress] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [started, setStarted] = useState(false);

  // Audio Recording State
  const recorder = useAudioRecorder({
    extension: 'm4a',
    numberOfChannels: 1,
    sampleRate: 44100,
    bitRate: 128000,
    android: {
      extension: 'm4a',
      outputFormat: 'mpeg4' as any,
      audioEncoder: 'aac' as any,
    },
    ios: {
      extension: 'm4a',
      outputFormat: 'mpeg4AAC',
      audioQuality: 127,
    },
  });
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const player = useAudioPlayer(recordedUri);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeCardIndex = queue[currentIndex];
  const activeCard = cards[activeCardIndex];

  const topCardStyle = useAnimatedStyle(() => ({
    zIndex: 10,
    transform: [
      { perspective: 1000 },
      { rotateY: `${flip.value * 180}deg` },
    ],
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    zIndex: 1,
    transform: [
      { scale: scaleNext.value },
      { translateY: interpolate(scaleNext.value, [0.96, 1], [20, 0]) } // Move up as it scales up
    ],
    opacity: interpolate(flip.value, [0, 0.5], [1, 0]), // Fade out quickly when flipping starts
  }));

  const frontFaceStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${-flip.value * 180}deg` }],
    opacity: interpolate(flip.value, [0.5, 0.51], [1, 0]), // Hide halfway
  }));

  const backFaceStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${180 - flip.value * 180}deg` }],
    opacity: interpolate(flip.value, [0.5, 0.51], [0, 1]), // Show halfway
  }));

  // Load Queue & Data
  useEffect(() => {
    (async () => {
      setLoading(true);

      // Load Settings
      const s = await getSettings();
      setSettings(s);

      // Load Deck (Default or Custom)
      let d: any = getDeckBySlug(String(slug));
      if (!d) {
        const customDecks = await getCustomDecks();
        d = customDecks.find((cd) => cd.slug === slug);
      }
      setDeck(d);

      if (!d) {
        setLoading(false);
        return;
      }

      const currentCards = d.words.map((w: any) => ({ front: w.en, back: w.th, example: w.example }));
      setCards(currentCards);

      const p = await getDeckProgress(String(slug));
      setDeckStats(p);

      const now = Date.now();
      const dueIndices: number[] = [];
      const newIndices: number[] = [];

      // Count how many words have been learned (have stats)
      let learnedCount = 0;
      currentCards.forEach((_: any, i: number) => {
        const stats = p[i];
        if (!stats) {
          newIndices.push(i);
        } else {
          learnedCount++; // This word has been interacted with
          if (stats.dueDate <= now) {
            dueIndices.push(i);
          }
        }
      });

      setLearnedWordsCount(learnedCount);

      // Prioritize Due cards, then New cards
      setQueue([...dueIndices, ...newIndices]);
      setLoading(false);

      // Update header stats
      const stats = await getDeckProgressStats(String(slug), currentCards.length);
      setProgress(stats.progress);
      await setCurrentDeck({ slug: String(slug), title: d.title || String(title || 'Deck'), count: currentCards.length, progress: stats.progress });
      const today = await getTodayInteractions();
      setTodayCount(today);
    })();
  }, [slug]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (started) {
          bottomSheet.show({ slug: String(slug), title: deck?.title || String(title || 'Deck'), count: String(cards.length) }, progress);
        }
      };
    }, [started, slug, deck?.title, cards.length, progress])
  );

  // Audio Functions
  async function speak(text: string) {
    if (settings.soundEffects) {
      Speech.speak(text, { language: 'en' });
    }
  }

  async function startRecording() {
    try {
      // Request permissions first on mobile
      const { granted } = await Audio.getPermissionsAsync();
      if (!granted) {
        const { granted: newGranted } = await Audio.requestPermissionsAsync();
        if (!newGranted) {
          console.log('Microphone permission denied');
          return;
        }
      }

      if (recorder.isRecording) {
        await recorder.stop();
        setIsRecording(false);
      } else {
        await recorder.record();
        setIsRecording(true);
      }
    } catch (err) {
      console.error('Failed to toggle recording', err);
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    if (recorder.isRecording) {
      await recorder.stop();
      setIsRecording(false);
      // Wait a bit for file to be ready
      setTimeout(() => {
        setRecordedUri(recorder.uri);
      }, 100);
    }
  }

  async function playRecording() {
    if (player && !player.playing) {
      setIsPlaying(true);
      player.play();
      // Reset playing state after duration (approximate or listen to event if available)
      // For now, just toggle visually
      setTimeout(() => setIsPlaying(false), (player.duration || 1) * 1000);
    } else if (player) {
      player.pause();
      setIsPlaying(false);
    }
  }

  function handleFlip() {
    Haptics.selectionAsync();
    const next = flipped ? 0 : 1;
    setFlipped(!flipped);
    flip.value = withTiming(next);
  }

  function goNext() {
    flip.value = 0;
    setFlipped(false);
    setRecordedUri(null);
    setIsRecording(false);
    setIsPlaying(false);
    scaleNext.value = withTiming(0.96);

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // End of queue
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCurrentIndex(prev => prev + 1); // To trigger empty state
    }
  }

  async function onAssess(rating: 'difficult' | 'known') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const grade = mapRatingToGrade(rating);
    const currentStats = deckStats[activeCardIndex] || INITIAL_STATS;
    const wasNew = !deckStats[activeCardIndex]; // Track if this was a new word

    // Save history for Undo
    setHistory(prev => [...prev, { index: activeCardIndex, stats: currentStats }]);

    const newStats = calculateNextReview(currentStats, grade);
    await saveWordStats(String(slug), activeCardIndex, newStats);

    // Update local stats immediately
    setDeckStats(prev => ({ ...prev, [activeCardIndex]: newStats }));

    // If this was a new word, increment learned count
    if (wasNew) {
      setLearnedWordsCount(prev => prev + 1);
    }

    const today = await incTodayInteractions(1);
    const stats = await getDeckProgressStats(String(slug), cards.length);
    setProgress(stats.progress);
    setTodayCount(today);
    await setCurrentDeck({ slug: String(slug), title: deck?.title || String(title || 'Deck'), count: cards.length, progress: stats.progress });

    goNext();
  }

  async function onUndo() {
    if (history.length === 0) return;

    const last = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    // Check if this was a newly learned word (had no stats before)
    const wasNew = !last.stats || last.stats.repetition === 0;

    // Restore stats
    await saveWordStats(String(slug), last.index, last.stats);
    setDeckStats(prev => ({ ...prev, [last.index]: last.stats }));

    // If this was a new word, decrement learned count
    if (wasNew && last.stats.repetition === 0) {
      setLearnedWordsCount(prev => Math.max(0, prev - 1));
    }

    // Go back
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      flip.value = 0; // Reset flip
      setFlipped(false);
    }

    // Decrement today count to fix duplication
    const today = await incTodayInteractions(-1);
    setTodayCount(today);

    const stats = await getDeckProgressStats(String(slug), cards.length);
    setProgress(stats.progress);
  }

  if (loading) {
    return (
      <View style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={TEXT} />
      </View>
    );
  }

  if (currentIndex >= queue.length) {
    return (
      <View style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <Confetti />
        <MaterialIcons name="check-circle" size={64} color={ACCENT} />
        <Text style={styles.doneText}>All caught up!</Text>
        <Text style={styles.doneSubText}>Come back later for more reviews.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back to Decks</Text>
        </Pressable>
      </View>
    );
  }

  const textSizeMultiplier = settings.textSize || 1;

  return (
    <ScrollView style={{ backgroundColor: PAGE_BG }} contentContainerStyle={styles.page}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.goalLabel}>{deck?.title || title || "Deck"}</Text>
          <View style={styles.goalCountRow}>
            <MaterialIcons name="style" size={20} color={TEXT} />
            <Text style={styles.goalCount}>{learnedWordsCount} / {cards.length}</Text>
          </View>
        </View>
        <Pressable style={styles.pauseBtn} onPress={() => {
          if (!started) {
            setStarted(true);
            bottomSheet.hide();
            setCurrentDeck({ slug: String(slug), title: deck?.title || String(title || 'Deck'), count: cards.length, progress });
          } else {
            bottomSheet.show({ slug: String(slug), title: deck?.title || String(title || 'Deck'), count: String(cards.length) }, progress);
            router.back();
          }
        }}>
          <Text style={styles.pauseText}>{started ? "Pause" : "Start"}</Text>
          <MaterialIcons name={started ? "pause" : "play-arrow"} size={20} color={ACCENT} />
        </Pressable>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, Math.round((learnedWordsCount / cards.length) * 100))}%` }]} />
      </View>

      <View style={styles.cardArea}>
        {/* Next Card (Visual Only) */}
        {currentIndex + 1 < queue.length && (
          <Animated.View style={[styles.card, nextCardStyle]}>
            <View style={styles.cardFace}>
              <Text style={[styles.cardText, { fontSize: 32 * textSizeMultiplier }]}>{cards[queue[currentIndex + 1]].front}</Text>
            </View>
          </Animated.View>
        )}

        {/* Active Card */}
        <Animated.View style={[styles.card, topCardStyle]}>
          <View style={{ flex: 1 }}>
            {/* Front Face */}
            <Animated.View style={[styles.cardFace, styles.cardFaceFront, frontFaceStyle]}>
              <Text style={[styles.cardText, { fontSize: 32 * textSizeMultiplier }]}>{activeCard.front}</Text>

              {/* Controls Row: Stop Propagation by handling press */}
              <View style={[styles.controlsRow, !started && { opacity: 0.5 }]}>
                <Pressable
                  style={styles.iconBtn}
                  disabled={!started}
                  onPress={() => speak(activeCard.front)}
                >
                  <MaterialIcons name="volume-up" size={28} color={TEXT} />
                </Pressable>

                <Pressable
                  style={[styles.iconBtn, isRecording && styles.recordingBtn]}
                  disabled={!started}
                  onPress={() => {
                    if (isRecording) stopRecording();
                    else if (recordedUri) playRecording();
                    else startRecording();
                  }}
                >
                  <MaterialIcons
                    name={isRecording ? "stop" : (recordedUri ? (isPlaying ? "volume-up" : "play-arrow") : "mic")}
                    size={28}
                    color={isRecording ? "#FFFFFF" : TEXT}
                  />
                </Pressable>
              </View>
            </Animated.View>

            {/* Back Face */}
            <Animated.View style={[styles.cardFace, styles.cardFaceBack, backFaceStyle]}>
              <Text style={[styles.cardText, { fontSize: 32 * textSizeMultiplier }]}>{activeCard.back}</Text>
              {activeCard.example && (
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleLabel}>Example:</Text>
                  <Text style={[styles.exampleText, { fontSize: 18 * textSizeMultiplier }]}>"{activeCard.example}"</Text>
                </View>
              )}
            </Animated.View>
          </View>
        </Animated.View>

        {/* Static Hint Text - NOW CLICKABLE */}
        <Pressable style={styles.staticHintContainer} onPress={handleFlip}>
          <Text style={styles.tapHint}>Tap to flip</Text>
        </Pressable>
      </View>

      <View style={styles.assessRow}>
        <Pressable
          style={[styles.assessBtn, (!started || history.length === 0) && { opacity: 0.5 }]}
          disabled={!started || history.length === 0}
          onPress={onUndo}
        >
          <MaterialIcons name="undo" size={22} color={TEXT} />
          <Text style={styles.assessText}>Undo</Text>
        </Pressable>
        <Pressable
          style={[styles.assessBtn, styles.assessBtnGood, !started && { opacity: 0.5 }]}
          disabled={!started}
          onPress={() => onAssess('known')}
        >
          <MaterialIcons name="sentiment-satisfied" size={22} color="#1E8E3E" />
          <Text style={[styles.assessText, styles.assessTextGood]}>Good</Text>
        </Pressable>
        <Pressable
          style={[styles.assessBtn, styles.assessBtnHard, !started && { opacity: 0.5 }]}
          disabled={!started}
          onPress={() => onAssess('difficult')}
        >
          <MaterialIcons name="sentiment-neutral" size={22} color="#D93025" />
          <Text style={[styles.assessText, styles.assessTextHard]}>Hard</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: PAGE_BG,
    paddingHorizontal: 16,
    paddingBottom: 32,
    marginTop: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 14,
    color: TEXT,
    opacity: 0.6,
    fontWeight: "600",
  },
  goalCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  goalCount: {
    fontSize: 24,
    color: TEXT,
    fontWeight: "800",
  },
  pauseBtn: {
    backgroundColor: "#000000",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  pauseText: {
    color: ACCENT,
    fontWeight: "700",
    fontSize: 16,
  },
  progressTrack: {
    height: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 32,
  },
  progressFill: {
    height: "100%",
    backgroundColor: ACCENT,
    borderRadius: 6,
  },
  cardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
    minHeight: 400,
  },
  card: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    position: "absolute",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  nextCard: {
    // Initial state handled by animated style
  },
  cardFace: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  cardFaceFront: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: "hidden",
  },
  cardFaceBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: "hidden",
    transform: [{ rotateY: "180deg" }],
  },
  cardText: {
    fontSize: 32,
    textAlign: "center",
    color: TEXT,
    fontWeight: "800",
    marginBottom: 32,
  },
  staticHintContainer: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    zIndex: 20,
    padding: 20,
  },
  tapHint: {
    color: TEXT,
    opacity: 0.4,
    fontWeight: "600",
  },
  controlsRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
  },
  iconBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  recordingBtn: {
    backgroundColor: "#FF4444",
  },
  assessRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
  },
  assessBtn: {
    flex: 1,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  assessText: {
    color: TEXT,
    fontWeight: "700",
    fontSize: 16,
  },
  assessBtnGood: {
    backgroundColor: "#E6F4EA",
    borderColor: "#34A853",
  },
  assessTextGood: {
    color: "#1E8E3E",
  },
  assessBtnHard: {
    backgroundColor: "#FCE8E6",
    borderColor: "#EA4335",
  },
  assessTextHard: {
    color: "#D93025",
  },
  doneText: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT,
    marginTop: 16,
  },
  doneSubText: {
    fontSize: 16,
    color: TEXT,
    opacity: 0.6,
    marginTop: 8,
  },
  backBtn: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: ACCENT,
    borderRadius: 16,
  },
  backBtnText: {
    fontWeight: "700",
    color: TEXT,
    fontSize: 18,
  },
  exampleContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    width: "100%",
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT,
    opacity: 0.5,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  exampleText: {
    fontSize: 18,
    color: TEXT,
    fontStyle: "italic",
    lineHeight: 24,
  },
});
