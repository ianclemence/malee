import { Confetti } from "@/components/confetti";
import { ThemedText } from "@/components/themed-text";
import { IconButton } from "@/components/ui/icon-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FontSizes, Palette, Radii, Shadows, Strokes } from "@/constants/theme";
import { getDeckBySlug } from "@/data/decks";
import { useBottomSheet } from "@/hooks/bottom-sheet-store";
import {
  calculateNextReview,
  INITIAL_STATS,
  mapRatingToGrade,
  SRSStats,
} from "@/lib/srs";
import {
  AppSettings,
  DeckProgress,
  getCustomDecks,
  getDeckProgress,
  getDeckProgressStats,
  getSettings,
  getTodayInteractions,
  incTodayInteractions,
  incTotalTime,
  saveWordStats,
  setCurrentDeck,
} from "@/lib/storage";
import { FluentMeService, ScoreResult } from "@/services/fluent-me";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AudioModule } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  OutputFormatAndroidType,
} from "react-native-audio-recorder-player";
import RNFS from "react-native-fs";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const ACCENT = Palette.primary;
const TEXT = Palette.black;
const PAGE_BG = Palette.cream;

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
  const [settings, setSettings] = useState<AppSettings>({
    dailyReminders: true,
    soundEffects: true,
    dailyGoal: 50,
    textSize: 1,
    name: "User",
    avatarUri: null,
  });

  // Queue management
  const [queue, setQueue] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Index within the queue
  const [loading, setLoading] = useState(true);
  const [deckStats, setDeckStats] = useState<DeckProgress>({});
  const [history, setHistory] = useState<{ index: number; stats: SRSStats }[]>(
    []
  );
  const [learnedWordsCount, setLearnedWordsCount] = useState(0); // Track learned words

  const [flipped, setFlipped] = useState(false);
  const flip = useSharedValue(0);
  const scaleNext = useSharedValue(0.96);
  const [progress, setProgress] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [started, setStarted] = useState(false);

  const [score, setScore] = useState<ScoreResult | null>(null);
  const [isScoring, setIsScoring] = useState(false);

  // Audio Recording State
  // AudioRecorderPlayer is a singleton instance, so we use it directly or via ref without 'new'
  const audioRecorderPlayer = useRef(AudioRecorderPlayer).current;
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeCardIndex = queue[currentIndex];
  const activeCard = cards[activeCardIndex];

  const topCardStyle = useAnimatedStyle(() => ({
    zIndex: 10,
    transform: [{ perspective: 1000 }, { rotateY: `${flip.value * 180}deg` }],
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    zIndex: 1,
    transform: [
      { scale: scaleNext.value },
      { translateY: interpolate(scaleNext.value, [0.96, 1], [20, 0]) }, // Move up as it scales up
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
      // Configure Audio Session for Mobile (iOS/Android)
      try {
        await AudioModule.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.error("Failed to set audio mode", e);
      }

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
      setDeck(d); if (!d) {
        setLoading(false);
        return;
      }

      const currentCards = d.words.map((w: any) => ({
        front: w.en,
        back: w.th,
        example: w.example,
      }));
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
      const stats = await getDeckProgressStats(
        String(slug),
        currentCards.length
      );
      setProgress(stats.progress);
      await setCurrentDeck({
        slug: String(slug),
        title: d.title || String(title || "Deck"),
        count: currentCards.length,
        progress: stats.progress,
      });
      const today = await getTodayInteractions();
      setTodayCount(today);
    })();
  }, [slug]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (started) {
          bottomSheet.show(
            {
              slug: String(slug),
              title: deck?.title || String(title || "Deck"),
              count: String(cards.length),
            },
            progress
          );
        }
      };
    }, [started, slug, deck?.title, cards.length, progress])
  );

  // Timer Logic
  const startTimeRef = useRef<number | null>(null);
  const appState = useRef(AppState.currentState);

  // Save accumulated time
  const saveTime = async () => {
    if (startTimeRef.current !== null) {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      if (elapsed > 0) {
        await incTotalTime(elapsed);
      }
      startTimeRef.current = null; // Reset start time
    }
  };

  // Handle App State changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // Going to background -> Pause timer
        if (started) {
          saveTime();
        }
      } else if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // Coming to foreground -> Resume timer if started
        if (started) {
          startTimeRef.current = Date.now();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [started]);

  // Handle Start/Pause/Unmount
  useEffect(() => {
    if (started) {
      startTimeRef.current = Date.now();
    } else {
      saveTime();
    }

    return () => {
      saveTime(); // Save on unmount
    };
  }, [started]);

  // Audio Functions
  async function speak(text: string) {
    console.log("Attempting to speak:", text, "Sound effects enabled:", settings.soundEffects);
    if (settings.soundEffects) {
      try {
        Speech.speak(text, { language: "en", rate: 0.75 });
      } catch (e) {
        Alert.alert("TTS Error", String(e));
      }
    }
  }

  async function startRecording() {
    try {
      console.log("Requesting permissions..");
      if (Platform.OS === "android") {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        console.log("Permissions grants:", grants);

        if (
          grants["android.permission.RECORD_AUDIO"] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log("Permissions granted");
        } else {
          console.log("All required permissions not granted");
          Alert.alert("Permission Denied", "Microphone permission is required.");
          return;
        }
      }

      const dirs = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.CachesDirectoryPath;
      const path = Platform.select({
        ios: `${dirs}/recording_${Date.now()}.m4a`,
        android: `${dirs}/recording_${Date.now()}.mp4`,
      });

      const audioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVModeIOS: 'measurement',
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVFormatIDKeyIOS: 'aac',
        OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
      };

      console.log("Starting recording at path:", path);
      const result = await audioRecorderPlayer.startRecorder(path, audioSet);
      audioRecorderPlayer.addRecordBackListener((e: any) => {
        // console.log('Recording . . . ', e.currentPosition);
        return;
      });
      console.log("Recording started:", result);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Recording Error", String(err));
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording...");
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      console.log("Recording stopped. File saved at:", result);

      // Verify file exists
      const exists = await RNFS.exists(result);
      console.log("File exists check:", exists);

      if (result) {
        setRecordedUri(result);

        // Start Scoring
        setIsScoring(true);
        setScore(null);

        const postId = await FluentMeService.createPost(
          `Practice: ${activeCard.front.substring(0, 20)}`,
          activeCard.front
        );

        if (postId) {
          console.log("Created Post ID:", postId);
          const resultUri = Platform.OS === 'android' ? result : result; // Ensure correct format
          const scoreResult = await FluentMeService.scoreRecording(postId, resultUri);
          if (scoreResult) {
            console.log("Scoring Result:", scoreResult);
            setScore(scoreResult);
          } else {
            Alert.alert("Scoring Failed", "Could not get a score from the API.");
          }
        } else {
          Alert.alert("Error", "Failed to initialize scoring session.");
        }
        setIsScoring(false);
      }
    } catch (e) {
      console.error("Error stopping recording:", e);
      Alert.alert("Error", "Failed to stop recording cleanly.");
      setIsRecording(false);
    }
  }

  async function playRecording() {
    console.log("Attempting to play recording. URI:", recordedUri);
    if (isPlaying) {
      console.log("Pausing playback...");
      await audioRecorderPlayer.pausePlayer();
      setIsPlaying(false);
      return;
    }

    if (recordedUri) {
      console.log("Playing/Resuming...");
      setIsPlaying(true);

      // Start player (this works for both first play and resume after pause)
      await audioRecorderPlayer.startPlayer(recordedUri);

      audioRecorderPlayer.addPlayBackListener((e: any) => {
        if (e.currentPosition === e.duration) {
          console.log("Playback finished");
          audioRecorderPlayer.stopPlayer();
          audioRecorderPlayer.removePlayBackListener();
          setIsPlaying(false);
        }
      });
    } else {
      console.log("No URI to play");
    }
  }

  function handleFlip() {
    if (!started) return;
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
      setCurrentIndex((prev) => prev + 1);
    } else {
      // End of queue
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCurrentIndex((prev) => prev + 1); // To trigger empty state
    }
  }

  async function onAssess(rating: "difficult" | "known") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const grade = mapRatingToGrade(rating);
    const currentStats = deckStats[activeCardIndex] || INITIAL_STATS;
    const wasNew = !deckStats[activeCardIndex]; // Track if this was a new word

    // Save history for Undo
    setHistory((prev) => [
      ...prev,
      { index: activeCardIndex, stats: currentStats },
    ]);

    const newStats = calculateNextReview(currentStats, grade);
    await saveWordStats(String(slug), activeCardIndex, newStats);

    // Update local stats immediately
    setDeckStats((prev) => ({ ...prev, [activeCardIndex]: newStats }));

    // If this was a new word, increment learned count
    if (wasNew) {
      setLearnedWordsCount((prev) => prev + 1);
    }

    const today = await incTodayInteractions(1);
    const stats = await getDeckProgressStats(String(slug), cards.length);
    setProgress(stats.progress);
    setTodayCount(today);
    await setCurrentDeck({
      slug: String(slug),
      title: deck?.title || String(title || "Deck"),
      count: cards.length,
      progress: stats.progress,
    });

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
    setDeckStats((prev) => ({ ...prev, [last.index]: last.stats }));

    // If this was a new word, decrement learned count
    if (wasNew && last.stats.repetition === 0) {
      setLearnedWordsCount((prev) => Math.max(0, prev - 1));
    }

    // Go back
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
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
      <View
        style={[
          styles.page,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={TEXT} />
      </View>
    );
  }
  if (currentIndex >= queue.length) {
    return (
      <View
        style={[
          styles.page,
          {
            justifyContent: "center",
            alignItems: "center",
            marginTop: 0,
            paddingHorizontal: 0,
            paddingBottom: 0,
          },
        ]}
      >
        <Confetti />
        <Text style={{ fontSize: 64 }}>🎊</Text>
        <Text style={[styles.doneText, { fontFamily: "PlayfairDisplay_600SemiBold" }]}>
          All caught up!
        </Text>
        <Text style={styles.doneSubText}>
          Come back later for more reviews.
        </Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back to Decks</Text>
        </Pressable>
      </View>
    );
  }

  const textSizeMultiplier = settings.textSize || 1;

  return (
    <ScrollView
      style={{ backgroundColor: PAGE_BG }}
      contentContainerStyle={styles.page}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.goalLabel}>{deck?.title || title || "Deck"}</Text>
          <View style={styles.goalCountRow}>
            <MaterialIcons name="style" size={20} color={TEXT} />
            <ThemedText type="title" style={styles.goalCount}>
              {learnedWordsCount} / {cards.length}
            </ThemedText>
          </View>
        </View>
        <Pressable
          style={styles.pauseBtn}
          onPress={() => {
            if (!started) {
              setStarted(true);
              bottomSheet.hide();
              setCurrentDeck({
                slug: String(slug),
                title: deck?.title || String(title || "Deck"),
                count: cards.length,
                progress,
              });
            } else {
              bottomSheet.show(
                {
                  slug: String(slug),
                  title: deck?.title || String(title || "Deck"),
                  count: String(cards.length),
                },
                progress
              );
              router.back();
            }
          }}
        >
          <Text style={styles.pauseText}>{started ? "Pause" : "Start"}</Text>
          <MaterialIcons
            name={started ? "pause" : "play-arrow"}
            size={20}
            color={ACCENT}
          />
        </Pressable>
      </View>

      <ProgressBar
        progress={cards.length ? learnedWordsCount / cards.length : 0}
        style={{ marginBottom: 32 }}
      />

      <View style={styles.cardArea}>
        {/* Next Card (Visual Only) */}
        {currentIndex + 1 < queue.length && (
          <Animated.View style={[styles.card, nextCardStyle]}>
            <View style={styles.cardFace}>
              <ThemedText
                type="phrase"
                style={[
                  styles.cardText,
                  { fontSize: FontSizes.phrase * textSizeMultiplier },
                ]}
              >
                {cards[queue[currentIndex + 1]].front}
              </ThemedText>
            </View>
          </Animated.View>
        )}

        {/* Active Card */}
        <Animated.View style={[styles.card, topCardStyle]}>
          <View style={{ flex: 1 }}>
            {/* Front Face */}
            <Animated.View
              style={[styles.cardFace, styles.cardFaceFront, frontFaceStyle]}
              pointerEvents={flipped ? "none" : "auto"}
            >
              {/* Scoring Display - At very top */}
              {isScoring && (
                <View style={{ position: 'absolute', top: 60, left: 0, right: 0, alignItems: "center", zIndex: 10 }}>
                  <ActivityIndicator color={ACCENT} />
                  <ThemedText style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
                    Analyzing pronunciation...
                  </ThemedText>
                </View>
              )}

              {score && !isScoring && (
                <View style={{ position: 'absolute', top: 80, left: 0, right: 0, alignItems: "center", zIndex: 10 }}>
                  <ThemedText type="phrase" style={[styles.scoreText, { color: score.overall_points >= 80 ? Palette.success : Palette.primary }]}>
                    {Math.round(score.overall_points)}%
                  </ThemedText>
                  {score.word_result_data && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 8, paddingHorizontal: 16 }}>
                      {score.word_result_data.map((w, i) => (
                        <View key={i} style={{ alignItems: 'center' }}>
                          <ThemedText style={{
                            color: w.points >= 80 ? Palette.success : w.points >= 50 ? Palette.primary : Palette.error,
                            fontWeight: 'bold'
                          }}>
                            {w.word}
                          </ThemedText>
                          <ThemedText style={{ fontSize: 10, opacity: 0.6 }}>{Math.round(w.points)}%</ThemedText>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              <ThemedText
                type="phrase"
                style={[
                  styles.cardText,
                  { fontSize: FontSizes.phrase * textSizeMultiplier },
                ]}
              >
                {activeCard.front}
              </ThemedText>

              {/* Controls Row */}
              <View style={[styles.controlsRow, !started && { opacity: 0.5 }]}>
                <IconButton
                  icon="volume-up"
                  size={64}
                  onPress={() => speak(activeCard.front)}
                />
                <IconButton
                  icon={
                    isRecording
                      ? "stop"
                      : recordedUri
                        ? isPlaying
                          ? "pause"
                          : "play-arrow"
                        : "mic"
                  }
                  size={64}
                  variant={isRecording ? "danger" : "default"}
                  iconColor={isRecording ? "#FFFFFF" : TEXT}
                  onPress={() => {
                    if (isRecording) stopRecording();
                    else if (recordedUri) playRecording();
                    else startRecording();
                  }}
                />
              </View>
            </Animated.View>

            {/* Back Face */}
            <Animated.View
              style={[styles.cardFace, styles.cardFaceBack, backFaceStyle]}
              pointerEvents={flipped ? "auto" : "none"}
            >
              <View style={styles.backContent}>
                <ThemedText
                  type="phrase"
                  style={[
                    styles.cardText,
                    { fontSize: FontSizes.phrase * textSizeMultiplier },
                  ]}
                >
                  {activeCard.back}
                </ThemedText>
                {activeCard.example && (
                  <View style={styles.exampleContainer}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.exampleLabel}
                    >
                      Example:
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.exampleText,
                        { fontSize: 18 * textSizeMultiplier },
                      ]}
                    >
                      "{activeCard.example}"
                    </ThemedText>
                  </View>
                )}
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Static Hint Text - NOW CLICKABLE */}
        <Pressable style={styles.staticHintContainer} onPress={handleFlip} disabled={!started}>
          <ThemedText style={styles.tapHint}>Tap to flip</ThemedText>
        </Pressable>
      </View>

      <View style={styles.assessRow}>
        <IconButton
          icon="undo"
          size={64}
          disabled={!started || history.length === 0}
          onPress={onUndo}
        />
        <IconButton
          icon="thumb-up"
          size={64}
          disabled={!started}
          onPress={() => onAssess("known")}
          iconColor={Palette.success}
        />
        <IconButton
          icon="thumb-down"
          size={64}
          disabled={!started}
          onPress={() => onAssess("difficult")}
          iconColor={Palette.error}
        />
      </View>
    </ScrollView >
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
    color: TEXT,
  },
  pauseBtn: {
    backgroundColor: "#000000",
    borderRadius: Radii.button,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...Shadows.brutalist,
  },
  pauseText: {
    color: ACCENT,
    fontFamily: "Inter_700Bold",
    fontSize: FontSizes.body,
  },
  cardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 400,
  },
  card: {
    width: "100%",
    height: "100%",
    backgroundColor: Palette.white,
    borderRadius: Radii.card,
    ...Shadows.brutalist,
    position: "absolute",
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
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
  backContent: {
    transform: [{ rotateY: "180deg" }],
  },
  cardText: {
    textAlign: "center",
    color: TEXT,
    marginBottom: 32,
  },
  scoreText: {
    fontSize: 72,
    textAlign: "center",
    fontFamily: 'PlayfairDisplay_600SemiBold',
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
  assessRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
  },
  doneText: {
    fontSize: FontSizes.phrase,
    color: TEXT,
    marginTop: 16,
  },
  doneSubText: {
    fontSize: FontSizes.body,
    color: TEXT,
    opacity: 0.6,
    marginTop: 8,
  },
  backBtn: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: ACCENT,
    borderRadius: Radii.button,
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  backBtnText: {
    fontFamily: "Inter_700Bold",
    color: TEXT,
    fontSize: FontSizes.button,
  },
  exampleContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Palette.white,
    borderRadius: 12,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
    width: "100%",
  },
  exampleLabel: {
    fontSize: 12,
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
