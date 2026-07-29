import { Palette, Shadows, Strokes } from '@/constants/theme';
import { PressScaleValues, SpringPresets } from '@/lib/animation-utils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IconButton({ icon, onPress, size = 40, disabled, variant = 'default', iconColor, bgColor, style }: IconButtonProps) {
  const baseBg = bgColor ?? (variant === 'primary' ? Palette.black : variant === 'danger' ? Palette.error : Palette.white);
  const color = iconColor ?? (variant === 'primary' ? Palette.primary : Palette.black);
  
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(PressScaleValues.subtle, SpringPresets.quick);
    rotate.value = withSpring(-3, SpringPresets.quick);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SpringPresets.quick);
    rotate.value = withSpring(0, SpringPresets.quick);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
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
          opacity: disabled ? 0.6 : 1,
        },
        style,
        animatedStyle,
      ]}
    >
      <MaterialIcons name={icon as any} size={Math.max(20, Math.round(size * 0.5))} color={color} />
    </AnimatedPressable>
  );
}