# 004 — Chip group press feedback

- **Status**: TODO
- **Commit**: 08b4566
- **Severity**: MEDIUM
- **Category**: Feedback
- **Estimated scope**: 1 file, ~30 lines changed

## Problem

The filter chips ("All", "My Decks", "Favorites") in `chip-group.tsx` have no press feedback. Tapping a chip swaps its background color on release with zero visual response on press — the interaction feels dead.

`components/ui/chip-group.tsx:21-46`:
```tsx
<Pressable
  key={opt.value}
  onPress={() => onChange(opt.value)}
  style={{
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radii.button,
    backgroundColor: active ? TEXT : Palette.white,
    // ...no onPressIn/onPressOut, no animation
  }}
>
```

## Target

- **Press in**: Scale to `PressScaleValues.subtle` (0.98) with `SpringPresets.quick` (damping 15, stiffness 150, mass 0.6).
- **Press out**: Spring back to scale 1.0 with the same spring.
- **Reduced motion**: Opacity 0.8 on press-in instead of scale.

```tsx
// target — components/ui/chip-group.tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { PressScaleValues, SpringPresets } from '@/lib/animation-utils';

// Inside the component:
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

// On each chip Pressable:
<Pressable
  key={opt.value}
  onPress={() => onChange(opt.value)}
  onPressIn={() => { scale.value = withSpring(PressScaleValues.subtle, SpringPresets.quick); }}
  onPressOut={() => { scale.value = withSpring(1, SpringPresets.quick); }}
>
  <Animated.View style={[{ /* existing chip styles */ }, animatedStyle]}>
    <Text style={/* existing text styles */}>{opt.label}</Text>
  </Animated.View>
</Pressable>
```

## Repo conventions to follow

- `useSharedValue` + `withSpring` + `PressScaleValues` is the exact pattern used in `components/ui/button.tsx:25,29` and `components/ui/icon-button.tsx:36-43`.
- `SpringPresets.quick` is the canonical spring for press feedback.
- `PressScaleValues.subtle` (0.98) is used for less prominent pressables (e.g., `icon-button.tsx:36`).

## Steps

1. **Open `components/ui/chip-group.tsx`.**
2. **Add imports**:
   ```tsx
   import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
   import { PressScaleValues, SpringPresets } from '@/lib/animation-utils';
   ```
3. **Refactor the chip rendering** to use `Animated.View` for the scale animation. The `Pressable` wraps an `Animated.View` that receives the scale style. Each chip needs its own `useSharedValue` — since chips are rendered in a `.map()`, create a custom hook or inline the shared value per chip:

   **Approach**: Extract a `Chip` sub-component that owns its own `useSharedValue`:
   ```tsx
   function Chip({
     opt,
     active,
     onPress,
   }: {
     opt: Option;
     active: boolean;
     onPress: () => void;
   }) {
     const scale = useSharedValue(1);

     const animatedStyle = useAnimatedStyle(() => ({
       transform: [{ scale: scale.value }],
     }));

     return (
       <Pressable
         onPress={onPress}
         onPressIn={() => {
           'worklet';
           scale.value = withSpring(PressScaleValues.subtle, SpringPresets.quick);
         }}
         onPressOut={() => {
           'worklet';
           scale.value = withSpring(1, SpringPresets.quick);
         }}
         style={{ flex: 1 }}
       >
         <Animated.View
           style={[
             {
               paddingVertical: 12,
               borderRadius: Radii.button,
               backgroundColor: active ? TEXT : Palette.white,
               alignItems: 'center',
               justifyContent: 'center',
               borderWidth: Strokes.thin,
               borderColor: active ? TEXT : Palette.black,
               ...(Shadows.brutalist as any),
             },
             animatedStyle,
           ]}
         >
           <Text
             style={{
               fontSize: 16,
               color: active ? Palette.primary : TEXT,
               opacity: active ? 1 : 0.6,
               fontFamily: 'Inter_700Bold',
             }}
           >
             {opt.label}
           </Text>
         </Animated.View>
       </Pressable>
     );
   }
   ```
4. **Update the `ChipGroup` component** to use the `Chip` sub-component:
   ```tsx
   export function ChipGroup({ options, value, onChange }: ChipGroupProps) {
     const TEXT = Palette.black;
     return (
       <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
         {options.map((opt) => (
           <Chip
             key={opt.value}
             opt={opt}
             active={value === opt.value}
             onPress={() => onChange(opt.value)}
           />
         ))}
       </View>
     );
   }
   ```

## Boundaries

- Do NOT change the chip's visual design, colors, or layout.
- Do NOT add hover effects — this is a mobile app.
- Do NOT modify other components that use `ChipGroup`.
- Do NOT add new dependencies.

## Verification

- **Mechanical**: Run `npx tsc --noEmit` — no type errors.
- **Feel check**:
  1. Tap a chip — it should shrink to 0.98 scale on press and spring back on release.
  2. The spring should feel snappy (quick preset) — not bouncy.
  3. Spam-tap chips — the spring should retarget smoothly, not restart.
  4. Toggle `prefers-reduced-motion` — chips should show opacity 0.8 on press instead of scale (if the reduced-motion branch is implemented; otherwise scale is acceptable since it's already subtle at 0.98).
- **Done when**: Chips have a subtle, snappy press animation that confirms the tap.
