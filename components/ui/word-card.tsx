import { ThemedText } from '@/components/themed-text';
import { FontSizes, Palette, Radii, Shadows, Strokes } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';

type WordCardProps = {
  en: string;
  th: string;
  learned?: boolean;
  onPlay?: () => void;
  isPlaying?: boolean;
};

const PulseCircle = ({ delay }: { delay: number }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Palette.primary,
        transform: [{ scale }],
        opacity,
        zIndex: -1,
      }}
    />
  );
};

export function WordCard({ en, th, learned, onPlay, isPlaying }: WordCardProps) {
  const TEXT = Palette.black;

  return (
    <View
      style={{
        backgroundColor: Palette.white,
        borderRadius: Radii.card,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: Strokes.thin,
        borderColor: Palette.black,
        ...(Shadows.brutalist as any),
      }}
    >
      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontSize: FontSizes.phrase, color: TEXT, marginBottom: 4, fontFamily: 'Inter_700Bold' }}>{en}</ThemedText>
        <ThemedText style={{ fontSize: FontSizes.body, color: TEXT, opacity: 0.6, fontFamily: 'Inter_400Regular' }}>{th}</ThemedText>
      </View>
      <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        {isPlaying && (
          <>
            <PulseCircle delay={0} />
            <PulseCircle delay={600} />
            <PulseCircle delay={1200} />
          </>
        )}
        <Pressable
          onPress={onPlay}
          disabled={!learned}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: learned ? '#000000' : Palette.white,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: Strokes.thin,
            borderColor: Palette.black,
            ...(Shadows.brutalist as any),
            zIndex: 1,
          }}
        >
          <MaterialIcons name="volume-up" size={20} color={learned ? Palette.primary : TEXT} style={!learned ? { opacity: 0.5 } : undefined} />
        </Pressable>
      </View>
    </View>
  );
}