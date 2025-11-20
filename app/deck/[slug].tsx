import { ProgressRing } from "@/components/progress-ring";
import { getDeckBySlug } from "@/data/decks";
import {
  DeckProgress,
  deleteCustomDeck,
  getCustomDecks,
  getDeckProgress,
  getDeckProgressStats,
  getFavorites,
  getMyDecks,
  setFavorite,
  setMyDeck,
} from "@/lib/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
  const [deckStats, setDeckStats] = useState<DeckProgress>({});

  const [deck, setDeck] = useState<any>(getDeckBySlug(String(slug)));
  const [isCustom, setIsCustom] = useState(false);

  const wordCount = deck ? deck.words.length : Number(count ?? "0");
  const isFav = !!favorites[String(slug)];
  const isMine = !!myDecks[String(slug)];
  const [progress, setProgress] = useState(0);

  const loadData = async () => {
    const fav = await getFavorites();
    const mine = await getMyDecks();
    setFavorites(fav);
    setMyDecksState(mine);

    let d: any = getDeckBySlug(String(slug));
    let custom = false;
    if (!d) {
      const customDecks = await getCustomDecks();
      d = customDecks.find((cd) => cd.slug === slug);
      custom = !!d;
    }
    setDeck(d);
    setIsCustom(custom);

    if (d) {
      const stats = await getDeckProgressStats(String(slug), d.words.length);
      const dStats = await getDeckProgress(String(slug));
      setProgress(stats.progress);
      setDeckStats(dStats);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Deck", "Are you sure you want to delete this deck?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCustomDeck(String(slug));
          router.back();
        }
      }
    ]);
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
            style={[styles.actionBtn, isFav && styles.favBtnActive]}
            onPress={async () => {
              const next = !isFav;
              setFavorites((p) => ({ ...p, [String(slug)]: next }));
              await setFavorite(String(slug), next);
            }}
          >
            <MaterialIcons
              name={isFav ? "favorite" : "favorite-border"}
              size={20}
              color={isFav ? "#FFFFFF" : TEXT}
            />
            <Text style={[styles.actionBtnText, isFav && { color: "#FFFFFF" }]}>{isFav ? "Favorited" : "Favorite"}</Text>
          </Pressable>

          {isCustom ? (
            <Pressable
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={handleDelete}
            >
              <MaterialIcons name="delete-outline" size={20} color="#FF4444" />
              <Text style={[styles.actionBtnText, { color: "#FF4444" }]}>Delete Deck</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.actionBtn, isMine && styles.saveBtnActive]}
              onPress={async () => {
                const next = !isMine;
                setMyDecksState((p) => ({ ...p, [String(slug)]: next }));
                await setMyDeck(String(slug), next);
              }}
            >
              <MaterialIcons name={isMine ? "check" : "add"} size={20} color={isMine ? ACCENT : TEXT} />
              <Text style={[styles.actionBtnText, isMine && { color: ACCENT }]}>{isMine ? "Saved" : "Save Deck"}</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.wordsHeader}>
          <Text style={styles.sectionTitle}>Words</Text>
          <Text style={styles.wordCountBadge}>{deck?.words.length} words</Text>
        </View>
        {deck && (
          <View style={styles.wordsList}>
            {deck.words.map((w: any, i: number) => {
              const isLearned = deckStats[i] && deckStats[i].repetition > 0;
              return (
                <View key={`${deck.slug}-${i}`} style={styles.wordCard}>
                  <View style={styles.wordContent}>
                    <Text style={styles.wordEn}>{w.en}</Text>
                    <Text style={styles.wordTh}>{w.th}</Text>
                  </View>
                  <Pressable
                    style={[styles.wordAudioBtn, isLearned && styles.wordAudioBtnActive]}
                    disabled={!isLearned}
                  >
                    <MaterialIcons name="volume-up" size={20} color={isLearned ? ACCENT : TEXT} style={!isLearned && { opacity: 0.5 }} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Pressable
        style={styles.floatingLearnBar}
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
          {isMine || isCustom ? "Start Learning" : "Try this Deck"}
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
    paddingHorizontal: 16,
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
  favBtnActive: {
    backgroundColor: "#FF4444",
    borderColor: "#FF4444",
  },
  saveBtnActive: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  deleteBtn: {
    borderColor: "#FF4444",
    backgroundColor: "#FFF0F0",
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
  },
  wordsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT,
  },
  wordCountBadge: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
    opacity: 0.5,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  wordsList: {
    gap: 12,
  },
  wordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  wordContent: {
    flex: 1,
  },
  wordEn: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 4,
  },
  wordTh: {
    fontSize: 16,
    color: TEXT,
    opacity: 0.6,
  },
  wordAudioBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  wordAudioBtnActive: {
    backgroundColor: "#000000",
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
