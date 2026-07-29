# 002 — Completion screen staggered entrance

- **Status**: TODO
- **Commit**: 08b4566
- **Severity**: HIGH
- **Category**: Delight
- **Estimated scope**: 1 file, ~40 lines changed

## Problem

When a deck review completes, the "All caught up!" screen appears instantly with confetti. The confetti animates, but the text and button teleport in at the same time — no staggered entrance that matches the celebratory moment.

`app/deck/learn.tsx:624-639`:
```tsx
<Confetti />
<Text style={{ fontSize: 64 }}>🎊</Text>
<Text
  style={[
    styles.doneText,
    { fontFamily: "PlayfairDisplay_600SemiBold" },
  ]}
>
  All caught up!
</Text>
<Text style={styles.doneSubText}>
  Come back later for more reviews.
</Text>
<Pressable style={styles.backBtn} onPress={() => router.back()}>
  <Text style={styles.backBtnText}>Back to Decks</Text>
</Pressable>
```

All five elements render simultaneously. The confetti is animated but everything else appears on frame 1.

## Target

Stagger the three content elements (emoji, title+subtitle, button) with delays that let the confetti start first:

- **🎊 emoji**: `FadeIn.duration(300)` — appears immediately, no delay.
- **"All caught up!"** (line 628): `FadeIn.delay(200).duration(300)` + `SlideInUp.delay(200).springify()` — slides up from `translateY(12)` with spring.
- **Subtitle** (line 634): `FadeIn.delay(350).duration(300)` — fades in below the title.
- **"Back to Decks" button** (line 637): `FadeIn.delay(500).duration(300)` — last to appear.

```tsx
// target — app/deck/learn.tsx
<Confetti />
<Animated.View entering={FadeIn.duration(300)}>
  <Text style={{ fontSize: 64 }}>🎊</Text>
</Animated.View>
<Animated.View entering={FadeIn.delay(200).duration(300).slideify().springify()}>
  <Text style={[styles.doneText, { fontFamily: "PlayfairDisplay_600SemiBold" }]}>
    All caught up!
  </Text>
</Animated.View>
<Animated.View entering={FadeIn.delay(350).duration(300)}>
  <Text style={styles.doneSubText}>
    Come back later for more reviews.
  </Text>
</Animated.View>
<Animated.View entering={FadeIn.delay(500).duration(300)}>
  <Pressable style={styles.backBtn} onPress={() => router.back()}>
    <Text style={styles.backBtnText}>Back to Decks</Text>
  </Pressable>
</Animated.View>
```

## Repo conventions to follow

- `FadeIn.delay(n).springify()` is used in `components/ui/deck-card.tsx:108` for staggered deck entry.
- `FadeInLeft.delay(index * 30).springify()` is used in `components/ui/word-card.tsx:23`.
- Reanimated's `Animated.View` with `entering` prop is the standard pattern.

## Steps

1. **Open `app/deck/learn.tsx`.**
2. **Verify imports** — `Animated`, `FadeIn`, `SlideInUp` from `react-native-reanimated` should already be imported. If `SlideInUp` is missing, add it.
3. **Wrap each content element** in `Animated.View` with staggered `entering` props. Replace lines 624-639 with:
   ```tsx
   <Confetti />
   <Animated.View entering={FadeIn.duration(300)}>
     <Text style={{ fontSize: 64 }}>🎊</Text>
   </Animated.View>
   <Animated.View entering={FadeIn.delay(200).duration(300).springify()}>
     <Text
       style={[
         styles.doneText,
         { fontFamily: "PlayfairDisplay_600SemiBold" },
       ]}
     >
       All caught up!
     </Text>
   </Animated.View>
   <Animated.View entering={FadeIn.delay(350).duration(300)}>
     <Text style={styles.doneSubText}>
       Come back later for more reviews.
     </Text>
   </Animated.View>
   <Animated.View entering={FadeIn.delay(500).duration(300)}>
     <Pressable style={styles.backBtn} onPress={() => router.back()}>
       <Text style={styles.backBtnText}>Back to Decks</Text>
     </Pressable>
   </Animated.View>
   ```

## Boundaries

- Do NOT modify the `Confetti` component — it already animates correctly.
- Do NOT change the text content, styles, or layout.
- Do NOT add exit animations — this screen is replaced by navigation, not dismissed.
- Do NOT touch any other screens in `learn.tsx`.

## Verification

- **Mechanical**: Run `npx tsc --noEmit` — no type errors.
- **Feel check**:
  1. Complete a deck review — confetti fires first, then the emoji fades in, then "All caught up!" slides up with a spring, then the subtitle fades in, then the button appears.
  2. The stagger should feel like a natural reveal, not a slow cascade — total animation time under 800ms.
  3. Toggle `prefers-reduced-motion` — all elements should fade in without the slide, same delays.
- **Done when**: The completion screen elements stagger in with a celebratory reveal matching the confetti.
