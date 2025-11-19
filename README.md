# Malee — Practical English Vocabulary for Thai Learners

Malee is a vocabulary learning app that helps Thai speakers learn practical English words and phrases using spaced repetition, flashcards, and self‑assessment. It focuses on Thai learners’ real needs, with pronunciation support and context‑based decks.

## Core Purpose

- Teach useful English vocabulary Thai people actually need and use
- Reduce pronunciation pain points and common Thai→English mistakes
- Build confidence through daily goals and clear progress tracking

## How It Works

- Spaced Repetition: schedules review at optimal times for retention
- Flashcards: Thai → English practice with contextual examples
- Self‑Assessment: “Don’t know”, “Know, but difficult”, “Know, and easy” to adapt scheduling
- Pronunciation Focus: audio and phonetic aids for every card

## Key Features

- Organized Decks by real‑life situations (travel, interviews, daily conversations, business, social)
- Daily Learning Goals with motivational streaks and progress bar
- Personal Dictionary for saved words and favorites
- Progress & Achievements with simple statistics
- Audio playback and pronunciation hints on card fronts

## Target Users

- Thai students and professionals improving practical English for travel, jobs, daily life, business, and social contexts

## App Overview (paths)

- Explore decks: `app/(tabs)/explore.tsx` — browse All / My Decks / Favorites, search, like decks
- Learn flow: `app/deck/learn.tsx` — stacked Tinder‑style cards, tap to flip, button‑only progression
- Shared UI: components in `components/` (e.g., bottom player)
- Routing: [Expo Router] with file‑based routes under `app/`

## Design Principles

- Simple, friendly, high‑contrast UI with consistent colors and typography
- Clear affordances for flipping, rating, and audio
- Mobile‑first interactions (no swipe to advance; buttons determine progression)

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
2. Run the app
   ```bash
   npx expo start
   ```
3. Open on device or emulator (Android emulator, iOS simulator, or Expo Go)

## Development Notes

- Tech: React Native, Expo, Expo Router, Reanimated
- State: local component state with UI‑driven animations (Reanimated)
- Audio: Material Icons for UI; plug in TTS or audio assets per deck

## Roadmap

- Persist favorites, goals, and progress across sessions
- Deck authoring tools and community‑driven contributions
- Enhanced pronunciation (IPA, slow playback, syllable emphasis)
- Rich analytics for mastery and streaks

## License

Proprietary. All rights reserved.
