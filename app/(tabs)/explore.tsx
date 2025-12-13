import { ThemedText } from "@/components/themed-text";
import { ChipGroup } from "@/components/ui/chip-group";
import { DeckCard } from "@/components/ui/deck-card";
import { SearchBar } from "@/components/ui/search-bar";
import { Palette, Strokes } from "@/constants/theme";
import { DEFAULT_DECKS } from "@/data/decks";
import {
  CustomDeck,
  getCustomDecks,
  getFavorites,
  getMyDecks,
  getSettings,
  setFavorite,
} from "@/lib/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const ACCENT = Palette.primary;
const TEXT = Palette.black;
const BG = Palette.cream;
const CARD_BG = Palette.pastelBeige;

export default function DecksScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [myDecks, setMyDecksState] = useState<{ [key: string]: boolean }>({});
  const [customDecks, setCustomDecks] = useState<CustomDeck[]>([]);
  const [view, setView] = useState<"all" | "my" | "favorites">("all");
  const [query, setQuery] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const loadData = async () => {
    const fav = await getFavorites();
    const mine = await getMyDecks();
    const custom = await getCustomDecks();
    setFavorites(fav);
    setMyDecksState(mine);
    setCustomDecks(custom);
    const s = await getSettings();
    setAvatarUri(s.avatarUri);
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
    const defaults = DEFAULT_DECKS.map((d) => ({
      ...d,
      count: d.words.length,
      isCustom: false,
    }));
    const customs = customDecks.map((d) => ({
      ...d,
      count: d.words.length,
      isCustom: true,
    }));
    return [...defaults, ...customs];
  }, [customDecks]);

  const visibleDecks = allDecks
    .filter((d) => {
      if (view === "favorites") return !!favorites[d.slug];
      if (view === "my") return !!myDecks[d.slug] || d.isCustom; // Custom decks are always "mine"
      return true;
    })
    .filter((d) => d.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <ScrollView
      style={{ backgroundColor: BG }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ThemedText type="title" style={styles.logo}>
          Malee
        </ThemedText>
        <Pressable onPress={() => router.push("/settings")}>
          <Pressable onPress={() => router.push("/settings")}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  borderWidth: Strokes.thin,
                  borderColor: Palette.black,
                }}
              />
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#E0E0E0",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: Strokes.thin,
                  borderColor: Palette.black,
                }}
              >
                <MaterialIcons name="person" size={24} color="#757575" />
              </View>
            )}
          </Pressable>
        </Pressable>
      </View>

      <SearchBar value={query} onChangeText={setQuery} />

      <ChipGroup
        options={[
          { label: "All", value: "all" },
          { label: "My Decks", value: "my" },
          { label: "Favorites", value: "favorites" },
        ]}
        value={view}
        onChange={(val) => setView(val as any)}
      />

      <View style={styles.grid}>
        {visibleDecks.map((d, i) => (
          <DeckCard
            key={d.slug}
            title={d.title}
            icon={d.icon as any}
            count={d.count}
            favorited={!!favorites[d.slug]}
            variant="grid"
            backgroundColor={d.bg}
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
            onToggleFavorite={async (e) => {
              e?.stopPropagation?.();
              const next = !favorites[d.slug];
              setFavorites((p) => ({ ...p, [d.slug]: next }));
              await setFavorite(d.slug, next);
            }}
          />
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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
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
