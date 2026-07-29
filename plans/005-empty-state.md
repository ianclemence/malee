# 005 — Empty state animation

- **Status**: TODO
- **Commit**: 08b4566
- **Severity**: MEDIUM
- **Category**: Delight
- **Estimated scope**: 1 file, ~25 lines changed

## Problem

The "No decks found" empty state in the explore screen is bare text with reduced opacity — no visual personality, no animation. This is a rare moment that could inject character into the app.

`app/(tabs)/explore.tsx:157-161`:
```tsx
{visibleDecks.length === 0 && (
  <View style={styles.emptyState}>
    <Text style={styles.emptyText}>No decks found</Text>
  </View>
)}
```

## Target

Replace with a centered layout featuring a large icon and animated entrance:

- **Icon**: `MaterialIcons "search-off"` at 48px, color `Palette.black` at 0.3 opacity.
- **Text**: "No decks found" below the icon, same muted styling.
- **Animation**: Icon enters with `FadeIn.duration(400)` + `scale(0.9→1.0)` via spring. Text enters with `FadeIn.delay(200).duration(400)`.

```tsx
// target — app/(tabs)/explore.tsx
{visibleDecks.length === 0 && (
  <View style={styles.emptyState}>
    <Animated.View entering={FadeIn.duration(400).springify()}>
      <MaterialIcons
        name="search-off"
        size={48}
        color={Palette.black}
        style={{ opacity: 0.3 }}
      />
    </Animated.View>
    <Animated.View entering={FadeIn.delay(200).duration(400)}>
      <Text style={styles.emptyText}>No decks found</Text>
    </Animated.View>
  </View>
)}
```

## Repo conventions to follow

- `FadeIn.duration(n).springify()` is used throughout the codebase for entrance animations.
- `MaterialIcons` from `@expo/vector-icons` is already imported in many files.
- `Palette` from `@/constants/theme` is the standard color token source.

## Steps

1. **Open `app/(tabs)/explore.tsx`.**
2. **Verify imports** — ensure `Animated`, `FadeIn` from `react-native-reanimated` and `MaterialIcons` from `@expo/vector-icons/MaterialIcons` are imported. Add if missing.
3. **Replace the empty state block** (lines 157-161) with:
   ```tsx
   {visibleDecks.length === 0 && (
     <View style={styles.emptyState}>
       <Animated.View entering={FadeIn.duration(400).springify()}>
         <MaterialIcons
           name="search-off"
           size={48}
           color={Palette.black}
           style={{ opacity: 0.3, alignSelf: 'center' }}
         />
       </Animated.View>
       <Animated.View entering={FadeIn.delay(200).duration(400)}>
         <Text style={styles.emptyText}>No decks found</Text>
       </Animated.View>
     </View>
   )}
   ```
4. **Verify the `emptyState` style** includes `alignItems: 'center'` and appropriate padding. Check `styles.emptyState` around line 175+.

## Boundaries

- Do NOT change the explore screen's deck list rendering.
- Do NOT add interactive elements to the empty state.
- Do NOT modify the search/filter logic.
- Do NOT add new dependencies.

## Verification

- **Mechanical**: Run `npx tsc --noEmit` — no type errors.
- **Feel check**:
  1. Navigate to the explore screen with a search term that matches no decks.
  2. The magnifying glass icon should fade in with a subtle spring (scale 0.9→1.0), then the text should fade in 200ms later.
  3. The entrance should feel gentle and non-blocking — total animation under 600ms.
  4. Toggle `prefers-reduced-motion` — elements should fade in without scale, same delays.
- **Done when**: The empty state has a personality-matched entrance animation that makes "no results" feel less dead.
