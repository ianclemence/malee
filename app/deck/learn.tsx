import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useBottomSheet } from "@/hooks/bottom-sheet-store";
import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
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
  const cards: CardData[] = [
    {
      front: "In my opinion, based on my experience…",
      back: "На мой взгляд, исходя из моего опыта…",
    },
    {
      front: "Could you clarify what you mean?",
      back: "Не могли бы вы уточнить, что вы имеете в виду?",
    },
    {
      front: "I am always seeking opportunities to learn and grow.",
      back: "Я всегда ищу возможности учиться и расти.",
    },
  ];

  const index = useSharedValue(0);
  const flipped = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scaleNext = useSharedValue(0.96);

  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateY: `${flipped.value * 180}deg` },
    ],
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleNext.value }],
  }));

  function goNext() {
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    flipped.value = 0;
    scaleNext.value = withTiming(0.96);
    index.value = Math.min(index.value + 1, cards.length - 1);
  }

  function onAssess() {
    goNext();
  }

  function onPanGesture(event: any) {
    translateX.value = event.translationX;
    translateY.value = event.translationY;
  }

  function onPanEnd(event: any) {
    const dx = event.translationX;
    const dy = event.translationY;
    if (Math.abs(dx) > 120 || Math.abs(dy) > 120) {
      translateX.value = withTiming(
        dx > 0 ? 400 : -400,
        { duration: 200 },
        () => {
          translateX.value = 0;
          translateY.value = 0;
        }
      );
      onAssess();
    } else {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    }
  }

  return (
      <ScrollView style={{ backgroundColor: PAGE_BG }} contentContainerStyle={styles.page}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.goalLabel}>Today's goal</Text>
          <View style={styles.goalCountRow}>
            <MaterialIcons name="style" size={20} color={TEXT} />
            <Text style={styles.goalCount}>13 / 50</Text>
          </View>
        </View>
        <Pressable style={styles.pauseBtn} onPress={() => {
          bottomSheet.show({ slug: (slug as string) || '', title: (title as string) || 'Deck', count: (count as string) || '0' });
          router.back();
        }}>
          <MaterialIcons name="pause" size={18} color={TEXT} />
          <Text style={styles.pauseText}>Pause</Text>
        </Pressable>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: "26%" }]} />
      </View>

      <View style={styles.cardArea}>
        {index.value < cards.length - 1 && (
          <Animated.View style={[styles.card, styles.nextCard, nextCardStyle]}>
            <Text style={styles.cardText}>{cards[index.value + 1].front}</Text>
          </Animated.View>
        )}
        <PanGestureHandler
          onGestureEvent={onPanGesture as any}
          onEnded={onPanEnd as any}
        >
          <Animated.View style={[styles.card, topCardStyle]}>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => (flipped.value = flipped.value ? 0 : 1)}
            >
              <View style={styles.cardFace}>
                <Text style={styles.cardText}>
                  {flipped.value
                    ? cards[index.value].back
                    : cards[index.value].front}
                </Text>
                {!flipped.value && (
                  <View style={styles.tapHintRow}>
                    <Text style={styles.tapHint}>Tap to flip</Text>
                  </View>
                )}
                {flipped.value === 1 ? (
                  <View style={styles.speakerRow}>
                    <MaterialIcons name="volume-up" size={24} color={TEXT} />
                  </View>
                ) : null}
              </View>
            </Pressable>
          </Animated.View>
        </PanGestureHandler>
      </View>

      <View style={styles.assessRow}>
        <Pressable
          style={styles.assessBtn}
          disabled={!flipped.value}
          onPress={onAssess}
        >
          <MaterialIcons name="thumb-down" size={22} color={TEXT} />
          <Text style={styles.assessText}>Don't know</Text>
        </Pressable>
        <Pressable
          style={styles.assessBtn}
          disabled={!flipped.value}
          onPress={onAssess}
        >
          <MaterialIcons name="thumbs-up-down" size={22} color={TEXT} />
          <Text style={styles.assessText}>Know, but difficult</Text>
        </Pressable>
        <Pressable
          style={styles.assessBtn}
          disabled={!flipped.value}
          onPress={onAssess}
        >
          <MaterialIcons name="thumb-up" size={22} color={TEXT} />
          <Text style={styles.assessText}>Know, and easy</Text>
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
    top: 20,
  },
  cardFace: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  cardText: {
    fontSize: 22,
    textAlign: "center",
    color: TEXT,
  },
  tapHintRow: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
  },
  tapHint: {
    color: TEXT,
    opacity: 0.5,
  },
  speakerRow: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
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
});
