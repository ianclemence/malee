import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Palette, Strokes, Shadows } from '@/constants/theme';

type IconButtonProps = {
  icon: string;
  onPress?: () => void;
  size?: number;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
  iconColor?: string;
  bgColor?: string;
  style?: ViewStyle;
};

export function IconButton({ icon, onPress, size = 40, disabled, variant = 'default', iconColor, bgColor, style }: IconButtonProps) {
  const baseBg = bgColor ?? (variant === 'primary' ? '#000000' : variant === 'danger' ? Palette.error : Palette.white);
  const color = iconColor ?? (variant === 'primary' ? Palette.primary : Palette.black);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: baseBg,
          borderWidth: Strokes.thin,
          borderColor: Palette.black,
          ...(Shadows.brutalist as ViewStyle),
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <MaterialIcons name={icon as any} size={Math.max(20, Math.round(size * 0.5))} color={color} />
    </Pressable>
  );
}