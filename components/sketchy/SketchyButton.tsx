import React, { useMemo } from 'react';
import { Pressable, PressableProps, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { RoughGenerator } from 'roughjs/bin/generator';
import { Options } from 'roughjs/bin/core';
import { useSketchyDefaults } from './SketchyProvider';

interface SketchyButtonProps extends PressableProps {
  children?: React.ReactNode;
  roughness?: number;
  bowing?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillStyle?: string;
  hachureGap?: number;
  seed?: number;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

export function SketchyButton({
  children,
  roughness,
  bowing,
  stroke,
  strokeWidth,
  fill,
  fillStyle,
  hachureGap,
  seed,
  width = 200,
  height = 56,
  style,
  ...pressableProps
}: SketchyButtonProps) {
  const defaults = useSketchyDefaults();

  const paths = useMemo(() => {
    const gen = new RoughGenerator();
    const opts: Options = {
      roughness: roughness ?? defaults.roughness,
      bowing: bowing ?? defaults.bowing,
      stroke: stroke ?? defaults.stroke,
      strokeWidth: strokeWidth ?? defaults.strokeWidth,
      fill: fill ?? defaults.fill,
      fillStyle: fillStyle ?? defaults.fillStyle,
      hachureGap: hachureGap ?? defaults.hachureGap,
      seed: seed ?? defaults.seed,
    };
    const drawable = gen.rectangle(0, 0, width, height, opts);
    return gen.toPaths(drawable);
  }, [width, height, roughness, bowing, stroke, strokeWidth, fill, fillStyle, hachureGap, seed, defaults]);

  const fillPaths = paths.filter((p) => p.fill && p.fill !== 'none');
  const strokePaths = paths.filter((p) => !p.fill || p.fill === 'none');

  return (
    <Pressable
      style={({ pressed }) => [
        { width, height, opacity: pressed ? 0.85 : 1 },
        style,
      ]}
      {...pressableProps}
    >
      <Svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {fillPaths.map((p, i) => (
          <Path
            key={`fill-${i}`}
            d={p.d}
            fill={p.fill}
            stroke="none"
          />
        ))}
        {strokePaths.map((p, i) => (
          <Path
            key={`stroke-${i}`}
            d={p.d}
            stroke={p.stroke}
            strokeWidth={p.strokeWidth}
            fill="none"
          />
        ))}
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </View>
    </Pressable>
  );
}
