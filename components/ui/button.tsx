import React from 'react';
import { Pressable, Text, ViewStyle, TextStyle } from 'react-native';
import { Palette, Radii, Spacing, Strokes, Shadows, FontSizes } from '@/constants/theme';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export function Button({ title, onPress, style, textStyle, disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
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
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        style,
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
    </Pressable>
  );
}