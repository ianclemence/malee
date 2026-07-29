# 001 — Bottom player slide-in/out transition

- **Status**: DONE
- **Commit**: 08b4566
- **Severity**: HIGH
- **Category**: Preventing a jarring change
- **Estimated scope**: 1 file, ~30 lines changed

## Problem

The bottom player bar teleports in and out with no entrance or exit animation. When a learning session starts or ends, the bar appears instantly — a hard mount/unmount that breaks spatial continuity.

`components/bottom-player.tsx:16`:
```tsx
if (!state.visible || !state.deck) return null;
```

The bar also has no exit path — it just vanishes when `state.visible` goes false. There is no `Animated.View`, no layout animation, no transition of any kind.

## Target

- **Enter**: `SlideInDown.springify()` using `SpringPresets.gentle` (damping 20, stiffness 90, mass 1). The bar slides up from below, settling at `bottom: 72` (attached to the tab bar).
- **Exit**: `SlideOutDown.duration(200)` using ease-out timing. The bar slides down and fades out.
- **Reduced motion**: `FadeIn.duration(300)` enter, `FadeOut.duration(200)` exit — opacity only, no position change.

```tsx
// target — components/bottom-player.tsx
<Animated.View
  entering={SlideInDown.springify()}
  exiting={SlideOutDown.duration(200)}
  style={styles.container}
>
  {/* ...existing children... */}
</Animated.View>
```

## Repo conventions to follow

- Reanimated layout animations (`FadeIn`, `SlideInDown`, etc.) are already used in `components/ui/floating-action-bar.tsx:37` with `.springify()`.
- `SpringPresets` from `lib/animation-utils.ts` are the canonical spring configs.
- `Animated.View` from `react-native-reanimated` is the standard wrapper.

## Steps

1. **Open `components/bottom-player.tsx`.**
2. **Add imports** at the top:
   ```tsx
   import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';
   import { useReducedMotion } from 'react-native-reanimated';
   import { SpringPresets } from '@/lib/animation-utils';
   ```
3. **Add `useReducedMotion` hook** inside the component body:
   ```tsx
   const reduceMotion = useReducedMotion();
   ```
4. **Replace the early return** (line 16) with state-based rendering. Change:
   ```tsx
   if (!state.visible || !state.deck) return null;
   ```
   To:
   ```tsx
   if (!state.visible || !state.deck) return null;
   ```
   (Keep the early return — the `Animated.View` wrapping will handle the exit animation via `exiting` prop when the parent unmounts it.)

   Actually, the issue is that the early return prevents the `exiting` prop from firing. The fix is to **always render the `Animated.View`** and conditionally show content inside it. Restructure:
   ```tsx
   return (
     <Animated.View
       entering={reduceMotion
         ? FadeIn.duration(300)
         : SlideInDown.springify()
       }
       exiting={reduceMotion
         ? FadeOut.duration(200)
         : SlideOutDown.duration(200)
       }
       style={styles.container}
     >
       {(!state.visible || !state.deck) ? null : (
         <>
           {/* Progress Bar Background */}
           <View style={styles.progressBarBackground}>
             <View style={[styles.progressBarFill, { width: `${prog * 100}%` }]} />
           </View>
           {/* ...rest of existing content... */}
         </>
       )}
     </Animated.View>
   );
   ```
5. **Keep the early return** — but move it before the `Animated.View` return so the component returns `null` when there's no deck. The `exiting` animation won't fire on unmount, but the entering animation will fire on mount. This is acceptable for this use case because the bar appears after a learning session starts (a deliberate user action), so the entrance animation is the important one.

   **Revised approach**: Keep the early return for simplicity. The entrance animation is the primary win. Remove the early return and always render the `Animated.View`, but hide content when not visible:
   ```tsx
   return (
     <Animated.View
       entering={reduceMotion
         ? FadeIn.duration(300)
         : SlideInDown.springify()
       }
       exiting={reduceMotion
         ? FadeOut.duration(200)
         : SlideOutDown.duration(200)
       }
       style={[
         styles.container,
         (!state.visible || !state.deck) && { display: 'none' },
       ]}
     >
       {/* ...existing children (only rendered when visible)... */}
     </Animated.View>
   );
   ```
   **Note**: `display: 'none'` prevents the `exiting` animation from playing. For the exit to work, the component must stay mounted while the exit animation runs. This requires lifting the visibility state into the provider and using an `Animated.View` that is always mounted. **Simpler approach**: just add the entering animation. The entrance slide is the high-leverage fix; the exit is polish.

6. **Final minimal change**: Remove the early return, wrap the return value in `Animated.View` with `entering` prop:
   ```tsx
   // Remove: if (!state.visible || !state.deck) return null;

   const prog = typeof state.progress === 'number' ? state.progress : 0;

   if (!state.visible || !state.deck) return null;

   return (
     <Animated.View
       entering={reduceMotion
         ? FadeIn.duration(300)
         : SlideInDown.springify()
       }
       style={styles.container}
     >
       {/* ...existing content unchanged... */}
     </Animated.View>
   );
   ```

## Boundaries

- Do NOT modify `hooks/bottom-sheet-store.tsx` — the state management stays the same.
- Do NOT change the bar's visual design, layout, or content.
- Do NOT add new dependencies.
- Do NOT add exit animation (would require provider restructuring — out of scope).

## Verification

- **Mechanical**: Run `npx tsc --noEmit` — no type errors.
- **Feel check**:
  1. Start a learning session — the bottom player should slide up from below with a spring (not teleport).
  2. The spring should feel gentle (damping 20, stiffness 90) — not bouncy, not stiff.
  3. Navigate away from the screen — the bar unmounts instantly (acceptable; exit is out of scope).
  4. Toggle `prefers-reduced-motion` — the bar should fade in (opacity only, 300ms) instead of sliding.
- **Done when**: The bottom player slides up with a spring animation on every appearance.
