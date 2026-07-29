import { ThemedText } from '@/components/themed-text';
import { Palette, Radii, Shadows, Strokes } from '@/constants/theme';
import { PressScaleValues, SpringPresets } from '@/lib/animation-utils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from 'react-native-reanimated';

type DeckCardProps = {
  title: string;
  icon: string;
  count: number;
  favorited?: boolean;
  onPress: () => void;
  onToggleFavorite?: (e?: any) => void;
  variant?: 'grid' | 'horizontal';
  size?: 'small' | 'medium' | 'large';
  backgroundColor?: string;
  style?: ViewStyle;
  index?: number;
};

export function DeckCard({
  title,
  icon,
  count,
  favorited,
  onPress,
  onToggleFavorite,
  variant = 'grid',
  size = 'medium',
  backgroundColor,
  style,
  index = 0,
}: DeckCardProps) {
  const TEXT = Palette.black;
  const scale = useSharedValue(1);
  const favoriteScale = useSharedValue(1);

  const baseStyle: ViewStyle = {
    borderRadius: Radii.card,
    padding: 16,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...(Shadows.brutalist as ViewStyle),
    justifyContent: 'space-between',
    backgroundColor: backgroundColor ?? Palette.white,
  };

  const getSizeStyle = (): ViewStyle => {
    if (variant === 'horizontal') {
      return { width: 160, height: 180 };
    }

    switch (size) {
      case 'large':
        return { width: '100%', minHeight: 180 };
      case 'small':
        return { width: '48%', aspectRatio: 1 };
      case 'medium':
      default:
        return { width: '48%', aspectRatio: 0.85 };
    }
  };

  const iconSize = size === 'large' ? 40 : size === 'small' ? 28 : 32;
  const iconBoxSize = size === 'large' ? 72 : size === 'small' ? 56 : 56;
  const titleSize = size === 'large' ? 22 : size === 'small' ? 14 : 18;

  const iconBoxOuter: ViewStyle = {
    width: iconBoxSize,
    height: iconBoxSize,
    borderRadius: iconBoxSize / 2,
    backgroundColor: '#D4CABC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Strokes.thin,
    borderColor: '#0D0D0D',
    shadowColor: '#0D0D0D',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
  };

  const iconBoxInner: ViewStyle = {
    width: iconBoxSize - 12,
    height: iconBoxSize - 12,
    borderRadius: (iconBoxSize - 12) / 2,
    backgroundColor: '#F5EFE3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B8AE9C',
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const favoriteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: favoriteScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(PressScaleValues.normal, SpringPresets.quick);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SpringPresets.quick);
  };

  const handleFavoritePress = (e?: any) => {
    if (onToggleFavorite) {
      favoriteScale.value = withSequence(
        withSpring(1.3, SpringPresets.bouncy),
        withSpring(1, SpringPresets.bouncy)
      );
      onToggleFavorite(e);
    }
  };

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).springify()}
      style={[
        baseStyle,
        getSizeStyle(),
        style,
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1, justifyContent: 'space-between' }}
      >
        <View style={iconBoxOuter}>
          <View style={iconBoxInner}>
            <Text style={{ fontSize: iconSize }}>{icon}</Text>
          </View>
        </View>

        {variant === 'grid' ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: titleSize, color: TEXT, lineHeight: titleSize + 4, fontFamily: 'Outfit_700Bold' }} numberOfLines={2}>
              {title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: TEXT, opacity: 0.6 }}>{count} words</Text>
              {onToggleFavorite && (
                <Pressable hitSlop={10} onPress={handleFavoritePress}>
                  <Animated.View style={favoriteAnimatedStyle}>
                    <MaterialIcons
                      name={favorited ? 'favorite' : 'favorite-border'}
                      size={18}
                      color={favorited ? '#FF4444' : TEXT}
                    />
                  </Animated.View>
                </Pressable>
              )}
            </View>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <ThemedText style={{ fontSize: 16, color: TEXT, fontFamily: 'Outfit_700Bold' }} numberOfLines={2}>
              {title}
            </ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <ThemedText style={{ fontSize: 12, color: TEXT, opacity: 0.6 }}>{count} words</ThemedText>
              {onToggleFavorite && (
                <Pressable onPress={handleFavoritePress}>
                  <Animated.View style={favoriteAnimatedStyle}>
                    <MaterialIcons
                      name={favorited ? 'favorite' : 'favorite-border'}
                      size={20}
                      color={favorited ? '#FF4444' : TEXT}
                    />
                  </Animated.View>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
