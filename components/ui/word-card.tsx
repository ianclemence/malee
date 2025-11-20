import React from 'react';
import { View, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Palette, Radii, Strokes, Shadows, FontSizes } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';

type WordCardProps = {
  en: string;
  th: string;
  learned?: boolean;
  onPlay?: () => void;
};

export function WordCard({ en, th, learned, onPlay }: WordCardProps) {
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
        }}
      >
        <MaterialIcons name="volume-up" size={20} color={learned ? Palette.primary : TEXT} style={!learned ? { opacity: 0.5 } : undefined} />
      </Pressable>
    </View>
  );
}