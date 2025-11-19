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

  const prog = typeof state.progress === 'number' ? state.progress : 0.6;
  const ringProg = Math.max(0, Math.min(1, prog));
  const ringColors = {
    borderTopColor: ringProg > 0 ? ACCENT : 'transparent',
    borderRightColor: ringProg >= 0.25 ? ACCENT : 'transparent',
    borderBottomColor: ringProg >= 0.5 ? ACCENT : 'transparent',
    borderLeftColor: ringProg >= 0.75 ? ACCENT : 'transparent',
  } as const;

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
          <Pressable style={[styles.play, ringColors]} onPress={onResume}>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: "center",
    justifyContent: "center",
  },
});
