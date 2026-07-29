import { Confetti } from "@/components/confetti";
import { ThemedText } from "@/components/themed-text";
import { IconButton } from "@/components/ui/icon-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PulseCircle } from "@/components/ui/pulse-circle";
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
  incTodayInteractions,
  incTotalTime,
  saveWordStats,
  setCurrentDeck,
} from "@/lib/storage";
import { evaluatePronunciation } from "@/services/pronunciation";
import { PronunciationResult } from "@/types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  AudioModule,
  AudioQuality,
  IOSOutputFormat,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import {
  AudioEncodingAndroid,
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const ACCENT = Palette.primary;
const TEXT = Palette.black;
const PAGE_BG = Palette.cream;

// Custom recording preset optimized for speech recognition
const SPEECH_RECORDING_OPTIONS = {
  extension: ".wav",
  sampleRate: 16000, // Google Speech-to-Text recommends 16kHz for speech
  numberOfChannels: 1, // Mono
  bitRate: 128000,
  android: {
    outputFormat: "mpeg4" as const,
    audioEncoder: "aac" as const,
  },
  ios: {
    outputFormat: IOSOutputFormat.LINEARPCM, // True WAV format
    audioQuality: AudioQuality.HIGH,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/wav",
    bitsPerSecond: 128000,
  },
};

type CardData = { front: string; back: string; example?: string };

export default function LearnScreen() {
  const { title, slug } = useLocalSearchParams<{
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
  const [started, setStarted] = useState(false);

  // Speech recognition state
  const [score, setScore] = useState<PronunciationResult | null>(null);
  const [isScoring, setIsScoring] = useState(false);

  // Audio Recording State - using expo-audio
  const audioRecorder = useAudioRecorder(SPEECH_RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const player = useAudioPlayer(recordedUri);

  useEffect(() => {
    if (player) {
      const listener = player.addListener("playbackStatusUpdate", (status) => {
        // Check if playing and not at the end
        const playing = !player.paused && player.playing;
        setIsPlaying(playing);

        // If playback finished (reached the end), ensure we're not showing as playing
        if (!player.playing && !player.paused) {
          setIsPlaying(false);
        }
      });
      return () => listener.remove();
    }
  }, [player]);

  // Ensure player doesn't auto-play when recordedUri is set
  useEffect(() => {
    if (player && recordedUri) {
      // Pause the player when a new recording is available
      // This prevents auto-play after recording stops
      player.pause();
    }
  }, [player, recordedUri]);

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

  // Speech recognition event handlers
  useSpeechRecognitionEvent("result", async (ev) => {
    const transcript = ev.results[0]?.transcript || "";
    console.log(
      "Speech recognition result:",
      transcript,
      "isFinal:",
      ev.isFinal
    );

    if (transcript && ev.isFinal) {
      try {
        console.log(
          "Evaluating pronunciation for:",
          activeCard?.front,
          "vs",
          transcript
        );
        const scoreResult = await evaluatePronunciation(
          activeCard?.front || "",
          transcript
        );
        console.log("Pronunciation score:", scoreResult);
        setScore(scoreResult);
      } catch (error) {
        console.error("Error evaluating pronunciation:", error);
        Alert.alert("Scoring Error", "Could not evaluate pronunciation.");
      }
      setIsScoring(false);
    }
  });

  useSpeechRecognitionEvent("error", (ev) => {
    console.error("Speech recognition error:", ev.error, ev.message);
    Alert.alert(
      "Recognition Error",
      ev.message || "Could not recognize speech. Please try again."
    );
    setIsScoring(false);
  });

  useSpeechRecognitionEvent("end", () => {
    console.log("Speech recognition ended");
    // Only set isScoring false if we didn't get a result
    // The result handler will set it false when done
  });

  // Load Queue & Data
  useEffect(() => {
    (async () => {
      // Configure Audio Session for Mobile (iOS/Android)
      try {
        await AudioModule.setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionModeAndroid: "duckOthers",
          shouldRouteThroughEarpiece: false,
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
      setDeck(d);
      if (!d) {
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
    console.log(
      "Attempting to speak:",
      text,
      "Sound effects enabled:",
      settings.soundEffects
    );
    if (settings.soundEffects) {
      try {
        // Stop any previous speech
        Speech.stop();
        setIsSpeaking(false);

        // Small delay to ensure previous speech is stopped
        await new Promise((resolve) => setTimeout(resolve, 50));

        Speech.speak(text, {
          language: "en",
          rate: 0.75,
          onStart: () => setIsSpeaking(true),
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      } catch (e) {
        setIsSpeaking(false);
        Alert.alert("TTS Error", String(e));
      }
    } else {
      // Ensure isSpeaking is false if sound effects are disabled
      setIsSpeaking(false);
    }
  }

  async function startRecording() {
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow microphone access to record your pronunciation."
        );
        return;
      }

      console.log("Starting recording with expo-audio...");
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Recording Error", String(err));
    }
  }

  async function stopRecording() {
    console.log("Stopping recording...");
    try {
      await audioRecorder.stop();
      const recordingUri = audioRecorder.uri;
      console.log("Recording stopped. File saved at:", recordingUri);

      if (recordingUri) {
        setRecordedUri(recordingUri);
        setIsScoring(true);
        setScore(null);

        // Start speech recognition on the recorded audio file
        console.log("Starting speech recognition on file:", recordingUri);
        ExpoSpeechRecognitionModule.start({
          lang: "en-US",
          interimResults: false,
          requiresOnDeviceRecognition: false, // Use network recognition for better accuracy
          audioSource: {
            uri: recordingUri,
            audioChannels: 1,
            audioEncoding: AudioEncodingAndroid.ENCODING_PCM_16BIT,
            sampleRate: 16000,
          },
        });
      }
    } catch (e) {
      console.error("Error stopping recording:", e);
      Alert.alert("Error", "Failed to stop recording cleanly.");
      setIsScoring(false);
    }
  }

  async function playRecording() {
    if (!recordedUri || !player) return;

    try {
      if (player.paused) {
        console.log("Playing recording:", recordedUri);
        player.play();
      } else {
        console.log("Pausing recording:", recordedUri);
        player.pause();
      }
    } catch (error) {
      console.error("Failed to play/pause recording", error);
      Alert.alert("Playback Error", "Could not play the recording.");
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
    setScore(null);
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

    await incTodayInteractions(1);
    const stats = await getDeckProgressStats(String(slug), cards.length);
    setProgress(stats.progress);
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
    await incTodayInteractions(-1);

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
        <Text
          style={[
            styles.doneText,
            { fontFamily: "PlayfairDisplay_600SemiBold" },
          ]}
        >
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
                <View
                  style={{
                    position: "absolute",
                    top: 80,
                    left: 0,
                    right: 0,
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  <ActivityIndicator size="large" color="#000000" />
                  <ThemedText
                    style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}
                  >
                    Analyzing pronunciation...
                  </ThemedText>
                </View>
              )}

              {score && !isScoring && (
                <View
                  style={{
                    position: "absolute",
                    top: 80,
                    left: 0,
                    right: 0,
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  <ThemedText
                    type="phrase"
                    style={[
                      styles.scoreText,
                      {
                        fontSize: 64, // Increased size
                        lineHeight: 72,
                        color:
                          score.score >= 80
                            ? Palette.success
                            : score.score >= 60
                            ? "#FF9500"
                            : Palette.error,
                      },
                    ]}
                  >
                    {Math.round(score.score)}%
                  </ThemedText>
                  {score.breakdown && (
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 8,
                        marginTop: 16,
                        paddingHorizontal: 16,
                      }}
                    >
                      {score.breakdown.map((part, i) => (
                        <View
                          key={i}
                          style={{
                            alignItems: "center",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 999,
                            borderWidth: 2,
                            borderColor:
                              part.status === "good"
                                ? Palette.success
                                : Palette.error,
                            backgroundColor:
                              part.status === "good"
                                ? `${Palette.success}20` // 20% opacity hex
                                : `${Palette.error}20`, // 20% opacity hex
                          }}
                        >
                          <ThemedText
                            style={{
                              color:
                                part.status === "good"
                                  ? Palette.success // Darker green for text if needed, but Palette.success for now to match border
                                  : Palette.error,
                              fontWeight: "700",
                              fontSize: 18,
                            }}
                          >
                            {part.part}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  )}
                  <ThemedText
                    style={{ marginTop: 8, fontSize: 12, opacity: 0.6 }}
                  >
                    {score.feedback}
                  </ThemedText>
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
                <View
                  style={{
                    position: "relative",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSpeaking && (
                    <>
                      <PulseCircle delay={0} size={64} />
                      <PulseCircle delay={600} size={64} />
                      <PulseCircle delay={1200} size={64} />
                    </>
                  )}
                  <IconButton
                    icon="volume-up"
                    size={64}
                    onPress={() => speak(activeCard.front)}
                    disabled={!started}
                  />
                </View>
                <View
                  style={{
                    position: "relative",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isPlaying && (
                    <>
                      <PulseCircle delay={0} size={64} color={Palette.error} />
                      <PulseCircle
                        delay={600}
                        size={64}
                        color={Palette.error}
                      />
                      <PulseCircle
                        delay={1200}
                        size={64}
                        color={Palette.error}
                      />
                    </>
                  )}
                  <IconButton
                    icon={
                      recorderState.isRecording
                        ? "stop"
                        : recordedUri
                        ? isPlaying
                          ? "pause"
                          : "play-arrow"
                        : "mic"
                    }
                    size={64}
                    variant={recorderState.isRecording ? "danger" : "default"}
                    bgColor={
                      recorderState.isRecording
                        ? Palette.error
                        : isPlaying || recordedUri
                        ? Palette.success
                        : undefined
                    }
                    iconColor={
                      recorderState.isRecording || isPlaying || recordedUri
                        ? "#FFFFFF"
                        : TEXT
                    }
                    onPress={() => {
                      if (recorderState.isRecording) stopRecording();
                      else if (recordedUri) playRecording();
                      else startRecording();
                    }}
                    disabled={!started}
                  />
                </View>
              </View>

              {/* Try Again Text - Only show when there's a recording */}
              {recordedUri && (
                <Pressable
                  onPress={() => {
                    setRecordedUri(null);
                    setIsPlaying(false);
                  }}
                  disabled={!started}
                >
                  <ThemedText style={styles.tryAgainHint}>Try again</ThemedText>
                </Pressable>
              )}
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
                      &ldquo;{activeCard.example}&rdquo;
                    </ThemedText>
                  </View>
                )}
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Static Hint Text - NOW CLICKABLE */}
        <Pressable
          style={styles.staticHintContainer}
          onPress={handleFlip}
          disabled={!started}
        >
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
  tryAgainHint: {
    color: TEXT,
    opacity: 0.4,
    fontWeight: "600",
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: TEXT,
    textAlign: "center",
    marginTop: 8,
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
