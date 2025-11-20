import { getDeckBySlug } from "@/data/decks";
import { useBottomSheet } from "@/hooks/bottom-sheet-store";
import { calculateNextReview, INITIAL_STATS, mapRatingToGrade } from "@/lib/srs";
import {
  DeckProgress,
  getDeckProgress,
  getDeckProgressStats,
  getTodayInteractions,
  incTodayInteractions,
  saveWordStats,
  setCurrentDeck,
} from "@/lib/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Audio } from 'expo-av';
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

const ACCENT = "#F1FF00";
const TEXT = "#000000";
const PAGE_BG = "#EDE6D6";

type CardData = { front: string; back: string };

export default function LearnScreen() {
  const { title, count, slug } = useLocalSearchParams<{
    title?: string;
    count?: string;
    slug?: string;
  }>();
  const router = useRouter();
  const bottomSheet = useBottomSheet();
  const deck = useMemo(() => getDeckBySlug(String(slug)), [slug]);
  const cards: CardData[] = (deck?.words || []).map((w) => ({ front: w.en, back: w.th }));

  // Queue management
  const [queue, setQueue] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Index within the queue
  const [loading, setLoading] = useState(true);
  const [deckStats, setDeckStats] = useState<DeckProgress>({});

  const [flipped, setFlipped] = useState(false);
  const flip = useSharedValue(0);
  const scaleNext = useSharedValue(0.96);
  const [progress, setProgress] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [started, setStarted] = useState(false);

  // Audio Recording State
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'recorded' | 'playing'>('idle');

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

  // Load Queue
  useEffect(() => {
    (async () => {
      setLoading(true);
      const p = await getDeckProgress(String(slug));
      setDeckStats(p);

      const now = Date.now();
      const dueIndices: number[] = [];
      const newIndices: number[] = [];

      cards.forEach((_, i) => {
        const stats = p[i];
        if (!stats) {
          newIndices.push(i);
        } else if (stats.dueDate <= now) {
          dueIndices.push(i);
        }
      });

      // Prioritize Due cards, then New cards
      setQueue([...dueIndices, ...newIndices]);
      setLoading(false);

      // Update header stats
      const stats = await getDeckProgressStats(String(slug), cards.length);
      setProgress(stats.progress);
      await setCurrentDeck({ slug: String(slug), title: deck?.title || String(title || 'Deck'), count: cards.length, progress: stats.progress });
      const today = await getTodayInteractions();
      setTodayCount(today);
    })();
  }, [slug, cards.length]);

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
    Speech.speak(text, { language: 'en' });
  }

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === "granted") {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
        setRecordingStatus('recording');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setRecording(undefined as any);
    await recording?.stopAndUnloadAsync();
    const uri = recording?.getURI();
    setRecordingStatus('recorded');

    const { sound } = await Audio.Sound.createAsync({ uri: uri! });
    setSound(sound);
  }

  async function playRecording() {
    if (sound) {
      setRecordingStatus('playing');
      await sound.replayAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setRecordingStatus('recorded');
        }
      });
    }
  }

  function handleFlip() {
    const next = flipped ? 0 : 1;
    setFlipped(!flipped);
    flip.value = withTiming(next);
  }

  function goNext() {
    flip.value = 0;
    setFlipped(false);
    setRecordingStatus('idle');
    setSound(null);
    scaleNext.value = withTiming(0.96);

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // End of queue
      setCurrentIndex(prev => prev + 1); // To trigger empty state
    }
  }

  async function onAssess(rating: 'unknown' | 'difficult' | 'known') {
    const grade = mapRatingToGrade(rating);
    const currentStats = deckStats[activeCardIndex] || INITIAL_STATS;
    const newStats = calculateNextReview(currentStats, grade);

    await saveWordStats(String(slug), activeCardIndex, newStats);

    // Update local stats map so if we see this card again (e.g. in same session if we implemented learning steps) it's updated
    // For now, we just move to next card.

    const today = await incTodayInteractions(1);
    const stats = await getDeckProgressStats(String(slug), cards.length);
    setProgress(stats.progress);
    setTodayCount(today);
    await setCurrentDeck({ slug: String(slug), title: deck?.title || String(title || 'Deck'), count: cards.length, progress: stats.progress });

    goNext();
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
        <MaterialIcons name="check-circle" size={64} color={ACCENT} />
        <Text style={styles.doneText}>All caught up!</Text>
        <Text style={styles.doneSubText}>Come back later for more reviews.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back to Decks</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: PAGE_BG }} contentContainerStyle={styles.page}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.goalLabel}>Today's goal</Text>
          <View style={styles.goalCountRow}>
            <MaterialIcons name="style" size={20} color={TEXT} />
            <Text style={styles.goalCount}>{todayCount} / 50</Text>
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
          <MaterialIcons name={started ? "pause" : "play-arrow"} size={18} color={TEXT} />
          <Text style={styles.pauseText}>{started ? "Pause" : "Start"}</Text>
        </Pressable>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, Math.round((todayCount / 50) * 100))}%` }]} />
      </View>

      <View style={styles.cardArea}>
        {/* Next Card (Visual Only) */}
        {currentIndex + 1 < queue.length && (
          <Animated.View style={[styles.card, nextCardStyle]}>
            <View style={styles.cardFace}>
              <Text style={styles.cardText}>{cards[queue[currentIndex + 1]].front}</Text>
            </View>
          </Animated.View>
        )}

        {/* Active Card */}
        <Animated.View style={[styles.card, topCardStyle]}>
          <Pressable style={{ flex: 1 }} onPress={handleFlip}>
            {/* Front Face */}
            <Animated.View style={[styles.cardFace, styles.cardFaceFront, frontFaceStyle]}>
              <Text style={styles.cardText}>{activeCard.front}</Text>

              <View style={styles.controlsRow}>
                <Pressable style={styles.iconBtn} onPress={() => speak(activeCard.front)}>
                  <MaterialIcons name="volume-up" size={28} color={TEXT} />
                </Pressable>

                <Pressable
                  style={[styles.iconBtn, recordingStatus === 'recording' && styles.recordingBtn]}
                  onPress={recordingStatus === 'recording' ? stopRecording : (recordingStatus === 'recorded' || recordingStatus === 'playing' ? playRecording : startRecording)}
                >
                  <MaterialIcons
                    name={recordingStatus === 'recording' ? "stop" : (recordingStatus === 'playing' ? "volume-up" : "mic")}
                    size={28}
                    color={recordingStatus === 'recording' ? "#FFFFFF" : TEXT}
                  />
                </Pressable>
              </View>
            </Animated.View>

            {/* Back Face */}
            <Animated.View style={[styles.cardFace, styles.cardFaceBack, backFaceStyle]}>
              <Text style={styles.cardText}>{activeCard.back}</Text>
            </Animated.View>
          </Pressable>
        </Animated.View>

        {/* Static Hint Text */}
        <View style={styles.staticHintContainer}>
          <Text style={styles.tapHint}>Tap to flip</Text>
        </View>
      </View>

      <View style={styles.assessRow}>
        <Pressable
          style={[styles.assessBtn, !started && { opacity: 0.5 }]}
          disabled={!started}
          onPress={() => onAssess('unknown')}
        >
          <MaterialIcons name="replay" size={22} color={TEXT} />
          <Text style={styles.assessText}>Again</Text>
        </Pressable>
        <Pressable
          style={[styles.assessBtn, !started && { opacity: 0.5 }]}
          disabled={!started}
          onPress={() => onAssess('difficult')}
        >
          <MaterialIcons name="sentiment-neutral" size={22} color={TEXT} />
          <Text style={styles.assessText}>Hard</Text>
        </Pressable>
        <Pressable
          style={[styles.assessBtn, !started && { opacity: 0.5 }]}
          disabled={!started}
          onPress={() => onAssess('known')}
        >
          <MaterialIcons name="sentiment-satisfied" size={22} color={TEXT} />
          <Text style={styles.assessText}>Good</Text>
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
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 18,
    color: TEXT,
    opacity: 0.8,
  },
  goalCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  goalCount: {
    fontSize: 18,
    color: TEXT,
    fontWeight: "700",
  },
  pauseBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 2,
    borderColor: TEXT,
  },
  pauseText: {
    color: TEXT,
    fontWeight: "700",
  },
  progressTrack: {
    height: 12,
    backgroundColor: TEXT,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: TEXT,
  },
  progressFill: {
    height: "100%",
    backgroundColor: ACCENT,
  },
  cardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
  },
  card: {
    width: "90%",
    height: "60%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    position: "absolute",
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
    fontSize: 28,
    textAlign: "center",
    color: TEXT,
    fontWeight: "700",
    marginBottom: 24,
  },
  staticHintContainer: {
    position: "absolute",
    bottom: 40, // Adjust based on card height
    alignSelf: "center",
    zIndex: 20,
  },
  tapHint: {
    color: TEXT,
    opacity: 0.5,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
  },
  iconBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  recordingBtn: {
    backgroundColor: "#FF4444",
    borderColor: "#FF0000",
  },
  assessRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  assessBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: TEXT,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexDirection: "row",
  },
  assessText: {
    color: TEXT,
    fontWeight: "600",
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
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: ACCENT,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: TEXT,
  },
  backBtnText: {
    fontWeight: "700",
    color: TEXT,
  },
});
