import { ProgressRing } from '@/components/progress-ring';
import { ThemedText } from '@/components/themed-text';
import { FontSizes, Palette, Radii, Shadows, Strokes } from '@/constants/theme';
import { PressScaleValues, SpringPresets } from '@/lib/animation-utils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { SlideInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type FloatingActionBarProps = {
  label: string;
  onPress: () => void;
  progress?: number;
  leftIconName?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingActionBar({ label, onPress, progress, leftIconName = 'play-arrow' }: FloatingActionBarProps) {
  const ACCENT = Palette.primary;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(PressScaleValues.subtle, SpringPresets.quick);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SpringPresets.quick);
  };

  return (
    <AnimatedPressable
      entering={SlideInDown.springify()}
      style={[
        {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          backgroundColor: Palette.black,
          borderRadius: Radii.button,
          gap: 8,
          borderWidth: Strokes.regular,
          borderColor: Palette.black,
          ...(Shadows.brutalist as any),
          paddingHorizontal: 16,
        },
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={{ width: 40, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {progress && progress > 0 ? (
            <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
              <ProgressRing radius={18} stroke={3} progress={progress} color={ACCENT} />
            </View>
          ) : null}
          <MaterialIcons name={leftIconName as any} size={20} color={ACCENT} />
        </View>
      </View>
      <ThemedText style={{ color: ACCENT, fontFamily: 'Outfit_700Bold', fontSize: FontSizes.button, textAlign: 'center', flex: 1 }}>{label}</ThemedText>
      <View style={{ width: 40 }} />
    </AnimatedPressable>
  );
}