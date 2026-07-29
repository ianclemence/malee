# 🌴 Malee

> _Practical English vocabulary for Thai learners._

**Malee** is a React Native vocabulary learning app built for Thai speakers who want to learn practical English words and phrases. It uses spaced repetition, flashcards, and self-assessment to help learners build real-world vocabulary — with pronunciation support and context-based decks tailored to everyday situations.

---

## What We Do

Malee focuses on the English vocabulary Thai people actually need — travel, interviews, daily conversations, business, and social contexts. It reduces pronunciation pain points, builds confidence through daily goals, and tracks progress with clear visuals.

---

## Features

- **🗂️ Organized Decks** — Curated vocabulary decks by real-life situations (travel, interviews, daily conversations, business, social).
- **🔄 Spaced Repetition** — Schedules reviews at optimal times for long-term retention.
- **🃏 Flashcards** — Thai → English practice with tap-to-flip cards and contextual examples.
- **🎤 Pronunciation Focus** — Audio playback and speech recognition for self-assessment on every card.
- **📊 Daily Goals & Streaks** — Motivational progress tracking with daily XP targets.
- **❤️ Favorites & Personal Dictionary** — Save words and decks for quick access.
- **🏆 Progress & Achievements** — Simple statistics, badges, and mastery tracking.

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (Preferred) or [Node.js](https://nodejs.org/) (v20+ or v22+ recommended)
- [Expo CLI](https://docs.expo.dev/)
- [Expo Go Mobile App](https://docs.expo.dev/get-started/set-up-your-environment/) _(for local development)_
- [Android Studio](https://developer.android.com/studio) _(for Android emulator)_
- [Xcode](https://developer.apple.com/xcode/) _(for iOS simulator, macOS only)_

### Local Development

1. **Clone the repository:**

    ```bash
    git clone https://github.com/ianclemence/malee.git
    cd malee
    ```

2. **Install dependencies:**

    ```bash
    bun install
    # or
    npm install
    ```

3. **Start the Expo development server:**

    ```bash
    bunx expo start
    # or
    npx expo start
    ```

4. **Run directly on a connected Android device:**

    ```bash
    bunx expo run:android --variant release
    ```

---

## Build & Deployment

### Local builds (EAS)

Build for production using **Expo Application Services (EAS)**:

1. **Configure EAS Builds:**

    ```bash
    bunx eas build:configure

    # Android
    bunx eas build --platform android

    # iOS
    bunx eas build --platform ios
    ```

2. **Build for Preview:**

    ```bash
    # Android
    eas build --platform android --profile preview

    # iOS
    eas build --platform ios --profile preview
    ```

3. **Build for Production:**

    ```bash
    # Android
    eas build --platform android --profile production

    # iOS
    eas build --platform ios --profile production
    ```

4. **OTA Updates:**

    ```bash
    # Push OTA update to staging channel
    eas update --channel staging --message "Testing new feature"

    # Or target a specific branch
    eas update --branch preview --message "Fix vocabulary card rendering"

    # Channel can be: development, preview, or production
    # depending on the build type of the app
    eas update --channel production --message "Bug fix release"
    ```

---

## Tech Stack

- **Framework:** React Native + Expo (SDK 56)
- **Routing:** Expo Router (file-based)
- **Animations:** React Native Reanimated
- **State:** Local component state + AsyncStorage
- **Audio:** expo-audio + expo-speech
- **Speech Recognition:** expo-speech-recognition

---

_Malee makes learning English feel natural for Thai speakers — one card at a time._
