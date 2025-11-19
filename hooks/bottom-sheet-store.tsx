import React, { createContext, useContext, useMemo, useState } from 'react';

type DeckInfo = { slug: string; title: string; count: string };

type BottomSheetState = {
  visible: boolean;
  deck?: DeckInfo;
  progress?: number;
};

type BottomSheetContextType = {
  state: BottomSheetState;
  show: (deck: DeckInfo, progress?: number) => void;
  hide: () => void;
};

const BottomSheetContext = createContext<BottomSheetContextType | null>(null);

export function BottomSheetProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BottomSheetState>({ visible: false });

  const api = useMemo<BottomSheetContextType>(() => ({
    state,
    show: (deck, progress) => setState({ visible: true, deck, progress }),
    hide: () => setState({ visible: false }),
  }), [state]);

  return <BottomSheetContext.Provider value={api}>{children}</BottomSheetContext.Provider>;
}

export function useBottomSheet() {
  const ctx = useContext(BottomSheetContext);
  if (!ctx) throw new Error('useBottomSheet must be used within BottomSheetProvider');
  return ctx;
}