import React, { createContext, useContext } from 'react';
import { Palette } from '@/constants/theme';

export interface SketchyDefaults {
  roughness: number;
  bowing: number;
  stroke: string;
  strokeWidth: number;
  fill?: string;
  fillStyle?: string;
  hachureGap: number;
  seed: number;
}

const defaults: SketchyDefaults = {
  roughness: 3,
  bowing: 2,
  stroke: Palette.black,
  strokeWidth: 3,
  fillStyle: 'zigzag',
  hachureGap: 5,
  seed: 1,
};

const SketchyContext = createContext<SketchyDefaults>(defaults);

export function useSketchyDefaults() {
  return useContext(SketchyContext);
}

export function SketchyProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value?: Partial<SketchyDefaults>;
}) {
  return (
    <SketchyContext.Provider value={{ ...defaults, ...value }}>
      {children}
    </SketchyContext.Provider>
  );
}
