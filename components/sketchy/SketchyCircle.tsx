import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import Svg from 'react-native-svg';
import { RoughGenerator } from 'roughjs/bin/generator';
import { Options } from 'roughjs/bin/core';
import { useSketchyDefaults } from './SketchyProvider';

interface SketchyCircleProps {
  children?: React.ReactNode;
  roughness?: number;
  bowing?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillStyle?: string;
  seed?: number;
  diameter: number;
  style?: ViewStyle;
}

export function SketchyCircle({
  children,
  roughness,
  bowing,
  stroke,
  strokeWidth,
  fill,
  fillStyle,
  seed,
  diameter,
  style,
}: SketchyCircleProps) {
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
      seed: seed ?? defaults.seed,
    };
    const drawable = gen.circle(diameter / 2, diameter / 2, diameter, opts);
    return gen.toPaths(drawable);
  }, [diameter, roughness, bowing, stroke, strokeWidth, fill, fillStyle, seed, defaults]);

  return (
    <View style={[{ width: diameter, height: diameter }, style]}>
      <Svg
        width={diameter}
        height={diameter}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            stroke={p.stroke}
            strokeWidth={p.strokeWidth}
            fill={p.fill || 'none'}
          />
        ))}
      </Svg>
      {children && (
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
      )}
    </View>
  );
}
