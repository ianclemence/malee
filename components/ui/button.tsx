import { FontSizes, Palette, Radii, Shadows, Strokes } from '@/constants/theme';
import { PressScaleValues, SpringPresets } from '@/lib/animation-utils';
import React from 'react';
import { Pressable, Text, TextStyle, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ title, onPress, style, textStyle, disabled }: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(PressScaleValues.normal, SpringPresets.quick);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SpringPresets.quick);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        {
          backgroundColor: Palette.primary,
          borderColor: Palette.black,
          borderWidth: Strokes.regular,
          borderRadius: Radii.button,
          paddingVertical: 14,
          paddingHorizontal: 20,
          alignItems: 'center',
          justifyContent: 'center',
          ...(Shadows.brutalist as ViewStyle),
        },
        style,
        animatedStyle,
      ]}
    >
      <Text
        style={[
          {
            color: Palette.black,
            fontFamily: 'Inter_700Bold',
            fontSize: FontSizes.button,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}