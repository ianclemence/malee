import { ProgressRing } from "@/components/progress-ring";
import { useBottomSheet } from "@/hooks/bottom-sheet-store";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const ACCENT = "#F1FF00";
const TEXT = "#000000";

export default function BottomPlayer({ inline = false }: { inline?: boolean }) {
  const { state, hide } = useBottomSheet();
  const router = useRouter();
  const translateY = useSharedValue(100);

  useEffect(() => {
    translateY.value = withSpring(state.visible ? 0 : 100);
  }, [state.visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

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

  // Only show ring if progress > 0
  const showRing = prog > 0;

  if (!state.visible || !state.deck) return null;

  return (
    <PanGestureHandler
      onGestureEvent={({ nativeEvent }) =>
        (translateY.value = nativeEvent.translationY)
      }
      onEnded={({ nativeEvent }) => {
        if (nativeEvent.translationY > 60) hide();
        else translateY.value = withSpring(0);
      }}
    >
      <Animated.View style={[inline ? styles.inline : styles.container, sheetStyle]}>
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            flex: 1,
          }}
          onPress={onOpenProgress}
        >
          <MaterialIcons name="list-alt" size={20} color={TEXT} />
          <Text style={styles.title}>{state.deck.title}</Text>
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <MaterialIcons name="style" size={18} color={TEXT} />
            <Text style={styles.count}>{state.deck.count}</Text>
          </View>
          <Pressable style={styles.play} onPress={onResume}>
            {showRing && (
              <View style={styles.ringContainer}>
                <ProgressRing radius={22} stroke={3} progress={prog} color={ACCENT} />
              </View>
            )}
            <MaterialIcons name="play-arrow" size={20} color={ACCENT} />
          </Pressable>
          <Pressable onPress={hide}>
            <MaterialIcons name="close" size={20} color={TEXT} />
          </Pressable>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  inline: {
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: TEXT,
    fontWeight: "600",
  },
  count: {
    color: TEXT,
    fontWeight: "700",
  },
  play: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
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
