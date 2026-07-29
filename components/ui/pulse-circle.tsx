import { Palette } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

type PulseCircleProps = {
  delay?: number;
  color?: string;
  size?: number;
};

export const PulseCircle = ({ delay = 0, color = Palette.primary, size = 40 }: PulseCircleProps) => {
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

  // eslint-disable-next-line react-hooks/refs
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.5],
  });

  // eslint-disable-next-line react-hooks/refs
  const opacity = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ scale }],
        opacity,
        zIndex: -1,
      }}
    />
  );
};
