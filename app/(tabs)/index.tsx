import { ProgressRing } from "@/components/progress-ring";
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { DeckCard } from '@/components/ui/deck-card';
import { FontSizes, Palette, Radii, Shadows, Strokes } from '@/constants/theme';
import { DEFAULT_DECKS } from "@/data/decks";
import { CurrentDeck, getAllDueCards, getCurrentDeck, getCustomDecks, getFavorites, getSettings, getTodayInteractions, setFavorite } from "@/lib/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const ACCENT = Palette.primary;
const BG = Palette.cream;
const TEXT = Palette.black;
const PURPLE_BG = Palette.lavender;

export default function HomeScreen() {
  const [todayCount, setTodayCount] = useState(0);
  const router = useRouter();
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [currentDeck, setCurrentDeck] = useState<CurrentDeck | null>(null);
  const [totalDue, setTotalDue] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(50);

  const loadData = async () => {
    const fav = await getFavorites();
    const t = await getTodayInteractions();
    const c = await getCurrentDeck();
    const s = await getSettings();

    const customDecks = await getCustomDecks();
    const allDecks = [...DEFAULT_DECKS, ...customDecks];
    const slugs = allDecks.map(d => d.slug);
    const sizes = allDecks.reduce((acc: any, d) => ({ ...acc, [d.slug]: d.words.length }), {});
    const due = await getAllDueCards(slugs, sizes);

    setFavorites(fav);
    setTodayCount(t);
    setCurrentDeck(c);
    setTotalDue(due);
    setDailyGoal(s.dailyGoal);
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const picked = useMemo(() => {
    const decks = DEFAULT_DECKS.map((d) => ({ ...d, count: d.words.length }));
    const shuffled = decks.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, []);

  const dailyProgress = Math.min(1, todayCount / dailyGoal);
  const greeting = todayCount === 0 ? "Good Morning!" : (todayCount >= dailyGoal ? "Goal Reached!" : "Keep it up!");

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

      {/* Hero / Daily Goal Section */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View>
            <ThemedText type="title" style={styles.heroGreeting}>{greeting}</ThemedText>
            <ThemedText style={styles.heroSubtext}>
              {todayCount >= dailyGoal ? "You're on fire!" : "Let's hit your daily goal."}
            </ThemedText>
            <Button
              onPress={() => {
                if (currentDeck) {
                  router.push({ pathname: '/deck/learn', params: { slug: currentDeck.slug, title: currentDeck.title, count: String(currentDeck.count) } });
                } else {
                  router.push('/(tabs)/explore');
                }
              }}
              title={todayCount === 0 ? "Start Learning" : "Continue"}
            />
          </View>

          <View style={styles.ringWrapper}>
            <ProgressRing radius={50} stroke={8} progress={dailyProgress} color={ACCENT} trackColor={Palette.black} />
            <View style={styles.ringInner}>
              <Text style={styles.ringCount}>{todayCount}</Text>
              <Text style={styles.ringLabel}>/ {dailyGoal} Daily XP</Text>
            </View>
          </View>
        </View>

        {/* Decorative Icon */}
        <MaterialIcons name="bolt" size={120} color="rgba(0,0,0,0.03)" style={styles.heroBgIcon} />
      </View>

      {/* Daily Review or Jump Back In */}
      {totalDue > 0 ? (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Daily Review</ThemedText>
          <Pressable
            style={styles.resumeCard}
            onPress={() => {
              if (currentDeck) {
                router.push({ pathname: '/deck/learn', params: { slug: currentDeck.slug, title: currentDeck.title, count: String(currentDeck.count) } });
              } else {
                router.push('/(tabs)/explore');
              }
            }}
          >
            <View style={styles.resumeContent}>
              <ThemedText style={styles.resumeTitle}>Review Session</ThemedText>
              <ThemedText style={styles.resumeSub}>{totalDue} cards due today</ThemedText>
            </View>
            <View style={styles.resumeAction}>
              <View style={[styles.resumePlayIcon, { position: 'relative' }]}>
                <MaterialIcons name="layers" size={24} color={TEXT} />
              </View>
            </View>
          </Pressable>
        </View>
      ) : currentDeck && (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Jump Back In</ThemedText>
          <Pressable
            style={styles.resumeCard}
            onPress={() => router.push({ pathname: '/deck/learn', params: { slug: currentDeck.slug, title: currentDeck.title, count: String(currentDeck.count) } })}
          >
            <View style={styles.resumeContent}>
              <ThemedText style={styles.resumeTitle}>{currentDeck.title}</ThemedText>
              <ThemedText style={styles.resumeSub}>{currentDeck.count} cards</ThemedText>
            </View>
            <View style={styles.resumeAction}>
              <ProgressRing radius={24} stroke={4} progress={currentDeck.progress} color={ACCENT} trackColor="#E0E0E0" />
              <View style={styles.resumePlayIcon}>
                <MaterialIcons name="play-arrow" size={24} color={TEXT} />
              </View>
            </View>
          </Pressable>
        </View>
      )}

      {/* Picked by Malee - Horizontal Scroll */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Picked by Malee</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {picked.map((d, i) => (
            <DeckCard
              key={d.slug}
              title={d.title}
              icon={d.icon as any}
              count={d.count}
              favorited={!!favorites[d.slug]}
              variant="horizontal"
              backgroundColor={i % 2 === 0 ? PURPLE_BG : '#EFEFEF'}
              onPress={() =>
                router.push({
                  pathname: '/deck/[slug]',
                  params: { slug: d.slug, title: d.title, count: String(d.count) },
                })
              }
              onToggleFavorite={(e) => {
                e?.stopPropagation?.();
                const next = !favorites[d.slug];
                setFavorites((p) => ({ ...p, [d.slug]: next }));
                setFavorite(d.slug, next);
              }}
            />
          ))}
        </ScrollView>
      </View>
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
  hero: {
    backgroundColor: TEXT,
    borderRadius: Radii.card,
    padding: 32,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  heroGreeting: {
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroSubtext: {
    fontSize: FontSizes.small,
    color: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 18,
  },

  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringCount: {
    fontSize: 20,
    fontWeight: '800',
    color: "#FFFFFF",
  },
  ringLabel: {
    fontSize: 10,
    color: "#FFFFFF",
    opacity: 0.6,
  },
  heroBgIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 0,
    transform: [{ rotate: '-15deg' }],
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: TEXT,
    marginBottom: 16,
    fontFamily: 'PlayfairDisplay_600SemiBold',
  },
  resumeCard: {
    backgroundColor: Palette.white,
    borderRadius: Radii.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  resumeContent: {
    flex: 1,
  },
  resumeTitle: {
    fontSize: 18,
    color: TEXT,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  resumeSub: {
    fontSize: 14,
    color: TEXT,
    opacity: 0.6,
  },
  resumeAction: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumePlayIcon: {
    position: 'absolute',
  },
  horizontalScroll: {
    paddingRight: 16,
    gap: 16,
  },

});
