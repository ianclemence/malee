import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useBottomSheet } from "@/hooks/bottom-sheet-store";
import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
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

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const flip = useSharedValue(0);
  const scaleNext = useSharedValue(0.96);

  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${flip.value * 180}deg` },
    ],
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleNext.value }],
  }));

  function goNext() {
    flip.value = 0;
    setFlipped(false);
    scaleNext.value = withTiming(0.96);
    setIndex((prev) => Math.min(prev + 1, cards.length - 1));
  }

  function onAssess() {
    goNext();
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
        {index + 2 < cards.length && (
          <Animated.View style={[styles.card, styles.thirdCard]}>
            <View style={styles.cardFace}
            >
              <Text style={styles.cardText}>{cards[index + 2].front}</Text>
            </View>
          </Animated.View>
        )}
        {index + 1 < cards.length && (
          <Animated.View style={[styles.card, styles.nextCard, nextCardStyle]}>
            <View style={styles.cardFace}
            >
              <Text style={styles.cardText}>{cards[index + 1].front}</Text>
            </View>
          </Animated.View>
        )}
        <Animated.View style={[styles.card, topCardStyle]}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              const next = flipped ? 0 : 1;
              setFlipped(!flipped);
              flip.value = withTiming(next);
            }}
          >
            <View style={[styles.cardFace, styles.cardFaceFront]}>
              <Text style={styles.cardText}>{cards[index].front}</Text>
              <View style={styles.speakerRowFront}>
                <MaterialIcons name="volume-up" size={24} color={TEXT} />
              </View>
              <View style={styles.tapHintRow}>
                <Text style={styles.tapHint}>Tap to flip</Text>
              </View>
            </View>
            <View style={[styles.cardFace, styles.cardFaceBack]}>
              <Text style={styles.cardText}>{cards[index].back}</Text>
              <View style={styles.tapHintRow}>
                <Text style={styles.tapHint}>Tap to flip</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </View>

      <View style={styles.assessRow}>
        <Pressable
          style={styles.assessBtn}
          disabled={!flipped}
          onPress={onAssess}
        >
          <MaterialIcons name="thumb-down" size={22} color={TEXT} />
          <Text style={styles.assessText}>Don't know</Text>
        </Pressable>
        <Pressable
          style={styles.assessBtn}
          disabled={!flipped}
          onPress={onAssess}
        >
          <MaterialIcons name="thumbs-up-down" size={22} color={TEXT} />
          <Text style={styles.assessText}>Know, but difficult</Text>
        </Pressable>
        <Pressable
          style={styles.assessBtn}
          disabled={!flipped}
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
    transform: [{ scale: 0.96 }],
  },
  thirdCard: {
    top: 40,
    transform: [{ scale: 0.92 }],
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
  speakerRowFront: {
    position: "absolute",
    bottom: 40,
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
