import { Palette } from "@/constants/theme";
import { useBottomSheet } from "@/hooks/bottom-sheet-store";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  useReducedMotion,
} from "react-native-reanimated";

const ACCENT = Palette.primary; // Yellow
const TEXT_COLOR = "#FFFFFF";
const BG_COLOR = "#212121"; // Dark Grey

export default function BottomPlayer({ inline = false }: { inline?: boolean }) {
  const { state, hide } = useBottomSheet();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  if (!state.visible || !state.deck) return null;

  function onResume() {
    if (state.deck) {
      router.push({
        pathname: "/deck/learn",
        params: {
          slug: state.deck.slug,
          title: state.deck.title,
          count: state.deck.count,
        },
      });
    }
  }

  function onOpenProgress() {
    if (state.deck) {
      router.push({
        pathname: "/deck/progress",
        params: {
          slug: state.deck.slug,
          title: state.deck.title,
          count: state.deck.count,
          progress: state.progress ? String(state.progress) : "0",
        },
      });
    }
  }

  const prog = typeof state.progress === 'number' ? state.progress : 0;

  return (
    <Animated.View
      entering={reduceMotion ? FadeIn.duration(300) : SlideInDown.springify()}
      exiting={reduceMotion ? FadeOut.duration(200) : FadeOut.duration(200)}
      style={styles.container}
    >
      {/* Progress Bar Background */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${prog * 100}%` }]} />
      </View>

      <Pressable
        style={styles.contentContainer}
        onPress={onOpenProgress}
      >
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{state.deck.title}</Text>
          <Text style={styles.subtitle}>{state.deck.count} words</Text>
        </View>
      </Pressable>

      <View style={styles.controls}>
        <Pressable onPress={onResume} hitSlop={10}>
          <MaterialIcons name="play-arrow" size={32} color={ACCENT} />
        </Pressable>
        <Pressable onPress={hide} hitSlop={10}>
          <MaterialIcons name="close" size={24} color={TEXT_COLOR} style={{ opacity: 0.7 }} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 72, // Attached to the top of the 72px tab bar
    backgroundColor: BG_COLOR,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 60, // Slightly taller for better touch area
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 }, // Shadow upwards
    elevation: 5,
    // zIndex removed to let it sit behind the floating Plus button if needed
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textContainer: {
    gap: 2,
  },
  title: {
    color: TEXT_COLOR,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  subtitle: {
    color: TEXT_COLOR,
    fontSize: 12,
    opacity: 0.6,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingLeft: 16,
  },
  progressBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ACCENT,
  },
});
