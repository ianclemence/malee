# 003 — Pronunciation score count-up animation

- **Status**: TODO
- **Commit**: 08b4566
- **Severity**: HIGH
- **Category**: Delight
- **Estimated scope**: 1 file, ~60 lines changed

## Problem

After recording pronunciation, the score percentage appears as a static number the instant scoring finishes. This is a high-emotion moment — the user just spoke a word and is waiting for feedback — but the reveal is instant and flat.

`app/deck/learn.tsx:774`:
```tsx
{Math.round(score.score)}%
```

The breakdown chips (lines 787-819) also appear all at once with no staggered entrance.

## Target

- **Score count-up**: Animate from 0 to `score.score` over 600ms using Reanimated `useSharedValue` + `withTiming` + `interpolate`. The displayed number updates each frame.
- **Breakdown chips stagger**: `FadeIn.delay(300 + index * 60).springify()` for each chip in the `.map()` at line 787.

```tsx
// target — app/deck/learn.tsx (score display section)
const animatedScore = useSharedValue(0);

useEffect(() => {
  if (score && !isScoring) {
    animatedScore.value = 0;
    animatedScore.value = withTiming(score.score, { duration: 600 });
  }
}, [score, isScoring]);

const displayScore = useAnimatedStyle(() => ({
  // Not used for display — use interpolate instead
}));

// In the render:
<Animated.Text
  style={[
    styles.scoreText,
    {
      fontSize: 64,
      lineHeight: 72,
      color: score.score >= 80
        ? Palette.success
        : score.score >= 60
        ? "#FF9500"
        : Palette.error,
    },
  ]}
>
  {`${Math.round(interpolate(animatedScore.value, [0, 100], [0, score.score]))}%`}
</Animated.Text>
```

## Repo conventions to follow

- `useSharedValue` + `withTiming` is used in `components/progress-ring.tsx` for SVG stroke animation.
- `interpolate` from `react-native-reanimated` is used in `app/deck/learn.tsx:57-62` for card flip.
- `FadeIn.delay(n).springify()` is the stagger pattern (see `components/ui/deck-card.tsx:108`).

## Steps

1. **Open `app/deck/learn.tsx`.**
2. **Verify imports** — ensure `useSharedValue`, `withTiming`, `interpolate`, `useAnimatedStyle` are imported from `react-native-reanimated`. They should already be present.
3. **Add state-driven animation** inside the score display block. Find the `{score && !isScoring && (` block (line 747). Add before it:
   ```tsx
   const animatedScore = useSharedValue(0);

   useEffect(() => {
     if (score && !isScoring) {
       animatedScore.value = 0;
       animatedScore.value = withTiming(score.score, { duration: 600 });
     }
   }, [score, isScoring]);
   ```
   **Note**: These hooks must be at the component's top level, not inside a conditional. Move them to the top of the `LearnScreen` component (or wherever the hooks live), and use the `score` state variable to gate the effect.

4. **Replace the score text** (line 774). Change:
   ```tsx
   {Math.round(score.score)}%
   ```
   To:
   ```tsx
   {`${Math.round(interpolate(animatedScore.value, [0, 100], [0, score.score]))}%`}
   ```

5. **Add stagger to breakdown chips** (line 787). Change:
   ```tsx
   {score.breakdown.map((part, i) => (
     <View
       key={i}
       style={{...}}
     >
   ```
   To:
   ```tsx
   {score.breakdown.map((part, i) => (
     <Animated.View
       key={i}
       entering={FadeIn.delay(300 + i * 60).springify()}
       style={{...}}
     >
   ```
   And close with `</Animated.View>` instead of `</View>`.

## Boundaries

- Do NOT modify the pronunciation scoring logic in `services/pronunciation.ts`.
- Do NOT change the score display layout or colors.
- Do NOT add exit animations for the score overlay.
- Do NOT touch the recording/microphone UI.

## Verification

- **Mechanical**: Run `npx tsc --noEmit` — no type errors.
- **Feel check**:
  1. Record a pronunciation — the score should count up from 0% to the final score over ~600ms.
  2. The count-up should feel rewarding, not slow — the number should be readable as it increases.
  3. The breakdown chips should stagger in after the score finishes counting up.
  4. Toggle `prefers-reduced-motion` — the score should appear immediately at its final value (no count-up), and chips should still stagger.
- **Done when**: The score animates from 0 to its final value with a smooth count-up, and chips stagger in.
