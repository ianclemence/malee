import { DEFAULT_DECKS } from "@/data/decks";
import { CustomDeck, getCustomDecks, getFavorites, getMyDecks, setFavorite } from "@/lib/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ThemedText } from '@/components/themed-text';
import { Palette, Radii, Strokes, Shadows } from '@/constants/theme';

const ACCENT = Palette.primary;
const TEXT = Palette.black;
const BG = Palette.cream;
const PURPLE_BG = Palette.lavender;
const CARD_BG = Palette.pastelBeige;

export default function DecksScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [myDecks, setMyDecksState] = useState<{ [key: string]: boolean }>({});
  const [customDecks, setCustomDecks] = useState<CustomDeck[]>([]);
  const [view, setView] = useState<"all" | "my" | "favorites">("all");
  const [query, setQuery] = useState("");

  const loadData = async () => {
    const fav = await getFavorites();
    const mine = await getMyDecks();
    const custom = await getCustomDecks();
    setFavorites(fav);
    setMyDecksState(mine);
    setCustomDecks(custom);
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const allDecks = useMemo(() => {
    const defaults = DEFAULT_DECKS.map(d => ({ ...d, count: d.words.length, isCustom: false }));
    const customs = customDecks.map(d => ({ ...d, count: d.words.length, isCustom: true }));
    return [...defaults, ...customs];
  }, [customDecks]);

  const visibleDecks = allDecks
    .filter((d) => {
      if (view === "favorites") return !!favorites[d.slug];
      if (view === "my") return !!myDecks[d.slug] || d.isCustom; // Custom decks are always "mine"
      return true;
    })
    .filter((d) =>
      d.title.toLowerCase().includes(query.trim().toLowerCase())
    );

  return (
    <ScrollView
      style={{ backgroundColor: BG }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ThemedText type="title" style={styles.logo}>Malee</ThemedText>
        <Pressable onPress={() => router.push("/settings")}>
          <Image
            source={require("@/assets/images/react-logo.png")}
            style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "#E0E0E0" }}
          />
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={24} color={TEXT} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search decks..."
          placeholderTextColor="rgba(0,0,0,0.4)"
          style={styles.searchInput}
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} style={styles.searchClearBtn}>
            <MaterialIcons name="close" size={18} color={TEXT} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.tabsContainer}>
        {(["all", "my", "favorites"] as const).map((v) => (
          <Pressable
            key={v}
            style={[
              styles.tabBtn,
              view === v && styles.tabBtnActive,
            ]}
            onPress={() => setView(v)}
          >
            <Text
              style={[
                styles.tabText,
                view === v && styles.tabTextActive,
              ]}
            >
              {v === "all" ? "All" : v === "my" ? "My Decks" : "Favorites"}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.grid}>
        {visibleDecks.map((d, i) => (
          <Pressable
            key={d.slug}
            style={[styles.card, { backgroundColor: i % 2 === 0 ? PURPLE_BG : Palette.pastelGreen }]}
            onPress={() =>
              router.push({
                pathname: "/deck/[slug]",
                params: {
                  slug: d.slug,
                  title: d.title,
                  count: String(d.count),
                },
              })
            }
          >
            <View style={styles.cardIcon}>
              <MaterialIcons
                name={d.icon as any}
                size={32}
                color={TEXT}
              />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>{d.title}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.cardCount}>{d.count} words</Text>
                <Pressable
                  hitSlop={10}
                  onPress={async (e) => {
                    e.stopPropagation();
                    const next = !favorites[d.slug];
                    setFavorites((p) => ({ ...p, [d.slug]: next }));
                    await setFavorite(d.slug, next);
                  }}
                >
                  <MaterialIcons
                    name={favorites[d.slug] ? "favorite" : "favorite-border"}
                    size={20}
                    color={favorites[d.slug] ? "#FF4444" : TEXT}
                  />
                </Pressable>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      {visibleDecks.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No decks found</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    marginTop: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  logo: {
    color: TEXT,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "transparent", // cleaner look
  },
  searchIcon: {
    marginRight: 12,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    color: TEXT,
    fontSize: 18,
    fontWeight: "600",
  },
  searchClearBtn: {
    padding: 4,
    opacity: 0.5,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radii.button,
    backgroundColor: Palette.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  tabBtnActive: {
    backgroundColor: TEXT,
    borderColor: TEXT,
  },
  tabText: {
    fontSize: 16,
    color: TEXT,
    opacity: 0.6,
    fontFamily: 'Inter_700Bold',
  },
  tabTextActive: {
    color: ACCENT,
    opacity: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: "48%",
    minWidth: 160,
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: Radii.card,
    padding: 16,
    justifyContent: "space-between",
    marginBottom: 4,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  cardContent: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    color: TEXT,
    lineHeight: 22,
    fontFamily: 'Inter_700Bold',
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardCount: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT,
    opacity: 0.6,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: TEXT,
    opacity: 0.5,
    fontWeight: "600",
  },
});
