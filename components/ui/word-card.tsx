import { ThemedText } from '@/components/themed-text';
import { PulseCircle } from '@/components/ui/pulse-circle';
import { FontSizes, Palette, Radii, Shadows, Strokes } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';

type WordCardProps = {
  en: string;
  th: string;
  learned?: boolean;
  onPlay?: () => void;
  isPlaying?: boolean;
  index?: number; // For staggered animations
};

export function WordCard({ en, th, learned, onPlay, isPlaying, index = 0 }: WordCardProps) {
  const TEXT = Palette.black;

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 30).springify()}
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
        <ThemedText style={{ fontSize: FontSizes.phrase, color: TEXT, marginBottom: 4, fontFamily: 'Outfit_700Bold' }}>{en}</ThemedText>
        <ThemedText style={{ fontSize: FontSizes.body, color: TEXT, opacity: 0.6, fontFamily: 'Outfit_400Regular' }}>{th}</ThemedText>
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
            backgroundColor: learned ? Palette.black : Palette.white,
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
    </Animated.View>
  );
}