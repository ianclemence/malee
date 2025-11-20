import { ProgressRing } from "@/components/progress-ring";
import { getDeckBySlug } from "@/data/decks";
import {
  getDeckProgressStats,
  getFavorites,
  getMyDecks,
  setFavorite,
  setMyDeck,
} from "@/lib/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const ACCENT = "#F1FF00";
const TEXT = "#000000";
const BG = "#FFFFFF";
const PURPLE_BG = "#D9D4F6";

export default function DeckScreen() {
  const { title, count, slug } = useLocalSearchParams<{
    title?: string;
    count?: string;
    slug?: string;
  }>();
  const router = useRouter();
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [myDecks, setMyDecksState] = useState<{ [key: string]: boolean }>({});

  const deck = useMemo(() => getDeckBySlug(String(slug)), [slug]);
  const wordCount = deck ? deck.words.length : Number(count ?? "0");
  const isFav = !!favorites[String(slug)];
  const isMine = !!myDecks[String(slug)];
  const [progress, setProgress] = useState(0);

  const loadData = async () => {
    const fav = await getFavorites();
    const mine = await getMyDecks();
    setFavorites(fav);
    setMyDecksState(mine);
    const stats = await getDeckProgressStats(String(slug), wordCount);
    setProgress(stats.progress);
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [slug, wordCount])
  );

  // Ring Progress Calculation
  const ringProg = Math.max(0, Math.min(1, progress));
  const showRing = ringProg > 0;

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={24} color={TEXT} />
          </Pressable>
          <Pressable onPress={() => router.push("/settings")} style={styles.iconButton}>
            <MaterialIcons name="more-horiz" size={24} color={TEXT} />
          </Pressable>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <MaterialIcons name={deck?.icon as any ?? "style"} size={64} color={TEXT} />
          </View>
          <Text style={styles.titleText}>{deck?.title ?? title ?? "Deck"}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{wordCount} words</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{Math.round(progress * 100)}% learned</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionBtn, isFav && styles.actionBtnActive]}
            onPress={async () => {
              const next = !isFav;
              setFavorites((p) => ({ ...p, [String(slug)]: next }));
              await setFavorite(String(slug), next);
            }}
          >
            <MaterialIcons
              name={isFav ? "favorite" : "favorite-border"}
              size={20}
              color={isFav ? "#FF4444" : TEXT}
            />
            <Text style={styles.actionBtnText}>{isFav ? "Favorited" : "Favorite"}</Text>
          </Pressable>

          <Pressable
            style={[styles.actionBtn, isMine && styles.actionBtnActive]}
            onPress={async () => {
              const next = !isMine;
              setMyDecksState((p) => ({ ...p, [String(slug)]: next }));
              await setMyDeck(String(slug), next);
            }}
          >
            <MaterialIcons name={isMine ? "check" : "add"} size={20} color={TEXT} />
            <Text style={styles.actionBtnText}>{isMine ? "Saved" : "Save Deck"}</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Words</Text>
        {deck && (
          <View style={styles.wordsList}>
            {deck.words.map((w, i) => (
              <View key={`${deck.slug}-${i}`} style={styles.wordCard}>
                <View style={styles.wordContent}>
                  <Text style={styles.wordEn}>{w.en}</Text>
                  <Text style={styles.wordTh}>{w.th}</Text>
                </View>
                <Pressable style={styles.wordAudioBtn}>
                  <MaterialIcons name="volume-up" size={20} color={TEXT} style={{ opacity: 0.5 }} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Pressable
        style={[
          styles.floatingLearnBar,
          !isMine && { opacity: 0.9 }, // Less opacity change, just style change
        ]}
        onPress={() => {
          if (!isMine) {
            // Auto-add to my decks if starting learn? Or just let them learn.
            // For now, just push.
          }
          router.push({
            pathname: "/deck/learn",
            params: {
              slug: String(slug) ?? "",
              title: deck?.title ?? String(title) ?? "Deck",
              count: String(wordCount),
            },
          });
        }}
      >
        <View style={styles.btnSide}>
          <View style={styles.playWrapper}>
            {showRing && (
              <View style={styles.ringContainer}>
                <ProgressRing radius={18} stroke={3} progress={progress} color={ACCENT} />
              </View>
            )}
            <MaterialIcons name="play-arrow" size={20} color={ACCENT} />
          </View>
        </View>
        <Text style={styles.learnText}>
          {isMine ? "Start Learning" : "Try this Deck"}
        </Text>
        <View style={styles.btnSide} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    marginTop: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PURPLE_BG,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "900",
    color: TEXT,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 16,
    color: TEXT,
    opacity: 0.6,
    fontWeight: "600",
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: TEXT,
    opacity: 0.3,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "transparent",
  },
  actionBtnActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E0E0E0",
    borderWidth: 2,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 16,
  },
  wordsList: {
    gap: 12,
  },
  wordCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
    paddingVertical: 16,
  },
  wordContent: {
    gap: 4,
  },
  wordEn: {
    color: TEXT,
    fontWeight: "700",
    fontSize: 18,
  },
  wordTh: {
    color: TEXT,
    opacity: 0.6,
    fontSize: 16,
  },
  wordAudioBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 20,
  },
  floatingLearnBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    backgroundColor: "#000000",
    borderRadius: 20,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    paddingHorizontal: 16,
  },
  learnText: {
    color: ACCENT,
    fontWeight: "700",
    fontSize: 20,
    textAlign: "center",
    flex: 1,
  },
  btnSide: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  playWrapper: {
    width: 36,
    height: 36,
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
