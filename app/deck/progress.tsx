import { ThemedText } from '@/components/themed-text';
import { FloatingActionBar } from '@/components/ui/floating-action-bar';
import { HeaderBar } from '@/components/ui/header-bar';
import { FontSizes, Palette, Radii, Shadows, Strokes } from '@/constants/theme';
import { getDeckBySlug } from "@/data/decks";
import { DetailedStats, getDetailedDeckStats } from "@/lib/storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

const ACCENT = Palette.primary;
const TEXT = Palette.black;
const PAGE_BG = Palette.cream;

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
        <HeaderBar rightIconName="close" onRightPress={() => router.back()} />

        <View style={styles.illustrationHolder}>
          <ThemedText style={{ fontSize: 100 }}>{deck?.icon ?? "📚"}</ThemedText>
          <View style={styles.bubble}>
            <ThemedText style={styles.bubbleText}>Keep it up!</ThemedText>
          </View>
        </View>

        <ThemedText type="title" style={styles.titleText}>{deck?.title ?? title ?? "Deck"}</ThemedText>

        {/* Simple Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.mastered}</ThemedText>
            <ThemedText style={styles.statLabel}>Mastered</ThemedText>
          </View>
          <View style={styles.separator} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.review}</ThemedText>
            <ThemedText style={styles.statLabel}>Review</ThemedText>
          </View>
          <View style={styles.separator} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.learning}</ThemedText>
            <ThemedText style={styles.statLabel}>Learning</ThemedText>
          </View>
        </View>

        <View style={styles.totalRow}>
          <ThemedText style={styles.totalText}>{stats.new} New Cards Remaining</ThemedText>
        </View>

      </ScrollView>

      <FloatingActionBar
        label="Continue Learning"
        progress={stats.progress}
        onPress={() =>
          router.push({ pathname: '/deck/learn', params: { slug: slug ?? '', title: title ?? 'Deck', count: count ?? '0' } })
        }
      />
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
    borderRadius: Radii.button,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: Strokes.thin,
    borderColor: TEXT,
    ...Shadows.brutalist,
  },
  bubbleText: {
    color: TEXT,
    fontFamily: 'Inter_700Bold',
  },
  titleText: {
    fontSize: FontSizes.h1,
    color: TEXT,
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: -1,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 24,
    backgroundColor: Palette.white,
    padding: 20,
    borderRadius: Radii.card,
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  statItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  statValue: {
    fontSize: FontSizes.phrase,
    color: TEXT,
    fontFamily: 'PlayfairDisplay_500Medium',
  },
  statLabel: {
    color: TEXT,
    opacity: 0.6,
    fontSize: FontSizes.small,
    marginTop: 4,
    fontFamily: 'Inter_500Medium',
  },
  separator: {
    width: Strokes.thin,
    height: 40,
    backgroundColor: Palette.black,
  },
  totalRow: {
    alignItems: "center",
    marginBottom: 24,
  },
  totalText: {
    fontSize: FontSizes.body,
    color: TEXT,
    opacity: 0.6,
    fontFamily: 'Inter_500Medium',
  },

});

