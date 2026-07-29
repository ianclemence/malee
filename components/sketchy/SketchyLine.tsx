import React, { useMemo } from 'react';
import Svg from 'react-native-svg';
import { RoughGenerator } from 'roughjs/bin/generator';
import { Options } from 'roughjs/bin/core';
import { useSketchyDefaults } from './SketchyProvider';

interface SketchyLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughness?: number;
  bowing?: number;
  stroke?: string;
  strokeWidth?: number;
  seed?: number;
}

export function SketchyLine({
  x1,
  y1,
  x2,
  y2,
  roughness,
  bowing,
  stroke,
  strokeWidth,
  seed,
}: SketchyLineProps) {
  const defaults = useSketchyDefaults();

  const paths = useMemo(() => {
    const gen = new RoughGenerator();
    const opts: Options = {
      roughness: roughness ?? defaults.roughness,
      bowing: bowing ?? defaults.bowing,
      stroke: stroke ?? defaults.stroke,
      strokeWidth: strokeWidth ?? defaults.strokeWidth,
      seed: seed ?? defaults.seed,
    };
    const drawable = gen.line(x1, y1, x2, y2, opts);
    return gen.toPaths(drawable);
  }, [x1, y1, x2, y2, roughness, bowing, stroke, strokeWidth, seed, defaults]);

  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);

  return (
    <Svg
      width={width || 1}
      height={height || 1}
      style={{ position: 'absolute', left: minX, top: minY }}
    >
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
          fill="none"
        />
      ))}
    </Svg>
  );
}
