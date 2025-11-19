import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { getDeckBySlug } from "@/data/decks";
import { getDeckProgressStats } from "@/lib/storage";

const ACCENT = "#F1FF00";
const ACCENT_DIM = "rgba(241,255,0,0.4)";
const TEXT = "#000000";
const PAGE_BG = "#EFEFEF";

export default function DeckProgressScreen() {
  const { title, count, slug, progress } = useLocalSearchParams<{
    title?: string;
    count?: string;
    slug?: string;
    progress?: string;
  }>();
  const router = useRouter();
  const deck = useMemo(() => getDeckBySlug(String(slug)), [slug]);
  const total = deck ? deck.words.length : Number(count ?? "0");
  const [known, setKnown] = useState(0);
  const [prog, setProg] = useState(0);
  useEffect(() => {
    (async () => {
      const stats = await getDeckProgressStats(String(slug), total);
      setKnown(stats.known);
      setProg(stats.progress);
    })();
  }, [slug, total]);
  const ringProg = 0.6;
  const ringColors = {
    borderTopColor: ACCENT,
    borderRightColor: ringProg >= 0.3 ? ACCENT : 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  } as const;

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
            <Text style={styles.bubbleText}>Well, well, well</Text>
          </View>
        </View>

        <Text style={styles.titleText}>{deck?.title ?? title ?? "Deck"}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{String(known)}</Text>
            <Text style={styles.statLabel}>Known words</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{String(total)}</Text>
            <Text style={styles.statLabel}>Words in deck</Text>
          </View>
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
          <View style={[styles.playProgress, ringColors]}>
            <MaterialIcons name="play-arrow" size={20} color={ACCENT} />
          </View>
        </View>
        <Text style={styles.learnText}>Learn</Text>
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
    minHeight: 340,
  },
  illustration: {
    width: 280,
    height: 280,
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
    fontSize: 36,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 12,
    marginTop: 24,
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 48,
    marginTop: 16,
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 30,
    fontWeight: "700",
    color: TEXT,
  },
  statLabel: {
    color: TEXT,
    opacity: 0.7,
    fontSize: 18,
  },
  separator: {
    height: 1,
    backgroundColor: TEXT,
    opacity: 0.2,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 12,
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
    fontSize: 22,
    textAlign: "center",
    flex: 1,
  },
  btnSide: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  playProgress: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
});
