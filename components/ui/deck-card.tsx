import { ThemedText } from '@/components/themed-text';
import { Palette, Radii, Shadows, Strokes } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';

type DeckCardProps = {
  title: string;
  icon: string;
  count: number;
  favorited?: boolean;
  onPress: () => void;
  onToggleFavorite?: (e?: any) => void;
  variant?: 'grid' | 'horizontal';
  backgroundColor?: string;
  style?: ViewStyle;
};

export function DeckCard({
  title,
  icon,
  count,
  favorited,
  onPress,
  onToggleFavorite,
  variant = 'grid',
  backgroundColor,
  style,
}: DeckCardProps) {
  const TEXT = Palette.black;

  const baseStyle: ViewStyle = {
    borderRadius: Radii.card,
    padding: 16,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...(Shadows.brutalist as ViewStyle),
    justifyContent: 'space-between',
    backgroundColor: backgroundColor ?? Palette.white,
  };

  const gridSize: ViewStyle = {
    width: '48%',
    minWidth: 160,
    flex: 1,
    aspectRatio: 0.85,
    marginBottom: 4,
  };

  const horizontalSize: ViewStyle = {
    width: 160,
    height: 180,
  };

  const iconBox: ViewStyle = {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...(Shadows.brutalist as ViewStyle),
  };

  return (
    <Pressable
      style={[
        baseStyle,
        variant === 'grid' ? gridSize : horizontalSize,
        style,
      ]}
      onPress={onPress}
    >
      <View style={iconBox}>
        <Text style={{ fontSize: 28 }}>{icon}</Text>
      </View>

      {variant === 'grid' ? (
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 18, color: TEXT, lineHeight: 22, fontFamily: 'Inter_700Bold' }} numberOfLines={2}>
            {title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: TEXT, opacity: 0.6 }}>{count} words</Text>
            {onToggleFavorite && (
              <Pressable hitSlop={10} onPress={onToggleFavorite}>
                <MaterialIcons
                  name={favorited ? 'favorite' : 'favorite-border'}
                  size={20}
                  color={favorited ? '#FF4444' : TEXT}
                />
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <ThemedText style={{ fontSize: 16, color: TEXT, fontFamily: 'Inter_700Bold' }} numberOfLines={2}>
            {title}
          </ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <ThemedText style={{ fontSize: 12, color: TEXT, opacity: 0.6 }}>{count} words</ThemedText>
            {onToggleFavorite && (
              <Pressable onPress={onToggleFavorite}>
                <MaterialIcons
                  name={favorited ? 'favorite' : 'favorite-border'}
                  size={20}
                  color={favorited ? '#FF4444' : TEXT}
                />
              </Pressable>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}