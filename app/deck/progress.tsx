import { ProgressRing } from "@/components/progress-ring";
import { getDeckBySlug } from "@/data/decks";
import { DetailedStats, getDetailedDeckStats } from "@/lib/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const ACCENT = "#F1FF00";
const TEXT = "#000000";
const PAGE_BG = "#EDE6D6"; // Match Learn screen background

export default function DeckProgressScreen() {
  const { title, count, slug } = useLocalSearchParams<{
    title?: string;
    count?: string;
    slug?: string;
  }>();
  const router = useRouter();
  const deck = useMemo(() => getDeckBySlug(String(slug)), [slug]);
  const total = deck ? deck.words.length : Number(count ?? "0");

  const [stats, setStats] = useState<DetailedStats>({
    new: total,
    learning: 0,
    review: 0,
    mastered: 0,
    total: total,
    progress: 0,
  });

  const loadStats = async () => {
    const s = await getDetailedDeckStats(String(slug), total);
    setStats(s);
  };

  useEffect(() => {
    loadStats();
  }, [slug, total]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [slug, total])
  );

  // Ring Progress Calculation
  const showRing = stats.progress > 0;

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="close" size={24} color={TEXT} />
          </Pressable>
        </View>

        <View style={styles.illustrationHolder}>
          <Image
            source={require("@/assets/images/react-logo.png")}
            style={styles.illustration}
          />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Keep it up!</Text>
          </View>
        </View>

        <Text style={styles.titleText}>{deck?.title ?? title ?? "Deck"}</Text>

        {/* Simple Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.mastered}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.review}</Text>
            <Text style={styles.statLabel}>Review</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.learning}</Text>
            <Text style={styles.statLabel}>Learning</Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalText}>{stats.new} New Cards Remaining</Text>
        </View>

      </ScrollView>

      <Pressable
        style={styles.floatingLearnBar}
        onPress={() =>
          router.push({
            pathname: "/deck/learn",
            params: {
              slug: slug ?? "",
              title: title ?? "Deck",
              count: count ?? "0",
            },
          })
        }
      >
        <View style={styles.btnSide}>
          <View style={styles.playWrapper}>
            {showRing && (
              <View style={styles.ringContainer}>
                <ProgressRing radius={18} stroke={3} progress={stats.progress} color={ACCENT} />
              </View>
            )}
            <MaterialIcons name="play-arrow" size={20} color={ACCENT} />
          </View>
        </View>
        <Text style={styles.learnText}>Continue Learning</Text>
        <View style={styles.btnSide} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    marginTop: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationHolder: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
    minHeight: 280,
  },
  illustration: {
    width: 200,
    height: 200,
  },
  bubble: {
    position: "absolute",
    right: 32,
    top: 12,
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: TEXT,
  },
  bubbleText: {
    color: TEXT,
    fontWeight: "700",
  },
  titleText: {
    fontSize: 32,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 24,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  statItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT,
  },
  statLabel: {
    color: TEXT,
    opacity: 0.6,
    fontSize: 14,
    marginTop: 4,
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
  },
  totalRow: {
    alignItems: "center",
    marginBottom: 24,
  },
  totalText: {
    fontSize: 16,
    color: TEXT,
    opacity: 0.6,
    fontWeight: "600",
  },
  floatingLearnBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    backgroundColor: "#000000",
    borderRadius: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    paddingHorizontal: 12,
  },
  learnText: {
    color: ACCENT,
    fontWeight: "700",
    fontSize: 18,
    textAlign: "center",
    flex: 1,
  },
  btnSide: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  playWrapper: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
  },
  ringContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
