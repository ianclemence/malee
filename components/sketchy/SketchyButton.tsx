import React, { useMemo } from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Svg from 'react-native-svg';
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
      seed: seed ?? defaults.seed,
    };
    const drawable = gen.rectangle(0, 0, width, height, opts);
    return gen.toPaths(drawable);
  }, [width, height, roughness, bowing, stroke, strokeWidth, fill, fillStyle, seed, defaults]);

  return (
    <Pressable
      style={({ pressed }) => [
        { width, height, opacity: pressed ? 0.8 : 1 },
        style,
      ]}
      {...pressableProps}
    >
      <Svg
        width={width}
        height={height}
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
        <React.Fragment>
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<any>, {
                  style: [
                    { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
                    (child as any).props?.style,
                  ],
                })
              : child
          )}
        </React.Fragment>
      )}
    </Pressable>
  );
}
