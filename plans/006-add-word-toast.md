# 006 — Add-word success toast

- **Status**: TODO
- **Commit**: 08b4566
- **Severity**: MEDIUM
- **Category**: Delight
- **Estimated scope**: 1 file, ~20 lines changed

## Problem

After adding a word to a deck, success is communicated via a native `Alert.alert` — a system dialog that blocks interaction and feels disconnected from the app's design language. The app already has a `Toast` component with `FadeInUp`/`FadeOutUp` animations, but it's never used here.

`app/(tabs)/add-word.tsx:100-119`:
```tsx
Alert.alert("Success", "Word added to deck!", [
  {
    text: "Add Another",
    onPress: () => {
      setWord("");
      setTranslation("");
      setNewDeckName("");
    }
  },
  {
    text: "Done",
    onPress: () => {
      setWord("");
      setTranslation("");
      setNewDeckName("");
      router.back();
    }
  }
]);
```

## Target

Replace `Alert.alert` with the existing `Toast` component showing "Word added!" with a success type. The toast auto-dismisses after 3s. After the toast appears, clear the inputs and keep the user on the screen (the "Add Another" flow is the default — no dialog needed).

```tsx
// target — app/(tabs)/add-word.tsx
const { showToast } = useToast();

// In the submit handler:
await addWordToCustomDeck(targetSlug, {
  en: word,
  th: translation,
});

showToast("Word added!", "success");
setWord("");
setTranslation("");
setNewDeckName("");
```

## Repo conventions to follow

- `useToast()` from `components/ui/toast-context.tsx` is the standard way to show toasts.
- `ToastProvider` is already wrapping the app in `app/_layout.tsx`.
- The `Toast` component auto-dismisses after 3000ms (`components/ui/toast.tsx:16`).

## Steps

1. **Open `app/(tabs)/add-word.tsx`.**
2. **Add import** for the toast hook:
   ```tsx
   import { useToast } from '@/components/ui/toast-context';
   ```
3. **Add the hook** inside the component body:
   ```tsx
   const { showToast } = useToast();
   ```
4. **Replace the `Alert.alert` call** (lines 100-119) with:
   ```tsx
   showToast("Word added!", "success");
   setWord("");
   setTranslation("");
   setNewDeckName("");
   ```
   This removes the "Add Another" / "Done" choice — the user stays on the screen and can add another word or navigate back manually. This is the natural flow for a mobile form.

5. **Remove the `Alert` import** if it's no longer used elsewhere in the file. Check for other `Alert.alert` calls first.

## Boundaries

- Do NOT modify the `Toast` component or its animations.
- Do NOT change the word-adding logic (`addWordToCustomDeck`).
- Do NOT add confirmation dialogs or undo functionality.
- Do NOT change the form layout or input fields.

## Verification

- **Mechanical**: Run `npx tsc --noEmit` — no type errors.
- **Feel check**:
  1. Add a word to a deck — a success toast should slide in from the top with `FadeInUp.springify()`.
  2. The toast should auto-dismiss after 3s with `FadeOutUp`.
  3. The inputs should clear immediately after the toast appears.
  4. No system dialog should appear.
  5. Toggle `prefers-reduced-motion` — toast should still appear (it uses layout animations which respect reduced motion by default in Reanimated).
- **Done when**: Adding a word shows an animated toast instead of a system dialog.
