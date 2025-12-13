/**
 * LOCAL PRONUNCIATION SERVICE
 *
 * This service uses purely local algorithms (Levenshtein Distance) to evaluate
 * pronunciation accuracy. It does NOT make calls to external AI APIs.
 *
 * Data is static and processing happens client-side.
 */

import * as Speech from 'expo-speech';
import { PronunciationResult } from '../types';

// Static data to simulate a rich API database
const VOCAB_DATA: Record<string, { ipa: string; syllables: string[] }> = {
  'carry-on': {
    ipa: '/ˈkæri ˌɒn/',
    syllables: ['Car', 'ry', 'on']
  },
  'itinerary': {
    ipa: '/aɪˈtɪnəˌreri/',
    syllables: ['I', 'tin', 'er', 'ar', 'y']
  },
  'turbulence': {
    ipa: '/ˈtɜːrbjələns/',
    syllables: ['Tur', 'bu', 'lence']
  },
  'immigration': {
    ipa: '/ˌɪmɪˈɡreɪʃn/',
    syllables: ['Im', 'mi', 'gra', 'tion']
  },
  'baggage claim': {
    ipa: '/ˈbæɡɪdʒ kleɪm/',
    syllables: ['Bag', 'gage', 'Claim']
  }
};

/**
 * Calculates the similarity between two strings using Levenshtein Distance
 * with additional heuristics for speech accuracy.
 * Returns a score between 0 and 100.
 */
/**
 * Calculates the similarity between two strings using Levenshtein Distance
 * with additional heuristics for speech accuracy.
 * Returns a score between 0 and 100.
 * 
 * NOTE: This function uses a sliding window (or "best substring") approach.
 * If the input (transcript) is much longer than the target, we try to find
 * the best matching segment within the input. This handles cases where
 * the user says the word multiple times (e.g. "Hello... Hello").
 */
const calculateSimilarity = (target: string, input: string): number => {
  const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanInput = input.toLowerCase().replace(/[^a-z0-9\s]/g, ''); // Keep spaces for splitting

  if (cleanTarget.length === 0) return 100;
  if (cleanInput.length === 0) return 0;

  // SHORTCUT: Exact Substring Match
  // If the target (e.g. "Com") exists exactly within the input (e.g. "Computer"), 
  // it's a 100% match. This solves issues where good syllables were marked bad.
  if (cleanInput.includes(cleanTarget) || cleanInput.replace(/\s/g, '').includes(cleanTarget)) {
      return 100;
  }

  // 1. Core Levenshtein Calculation
  const getLevenshteinScore = (a: string, b: string): number => {
    if (a.length === 0) return b.length === 0 ? 100 : 0;
    if (b.length === 0) return 0;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    const distance = matrix[b.length][a.length];
    const maxLength = Math.max(a.length, b.length);
    let similarity = (maxLength - distance) / maxLength;

    // Heuristics
    const lengthRatio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
    if (lengthRatio < 0.6) similarity *= 0.5;
    if (a[0] !== b[0]) similarity *= 0.9;

    return Math.round(Math.max(0, similarity * 100));
  };
    
  // 2. Tokenize inputs
  // If the input is just one long string without spaces (e.g. from cleaning), treat as single token
  // But usually speech input has spaces.
  const inputWords = cleanInput.split(/\s+/).filter(w => w.length > 0);
  
  // If input is short or single word, just compare directly (cleaned of spaces)
  if (inputWords.length <= 1) {
    return getLevenshteinScore(cleanTarget, cleanInput.replace(/\s/g, ''));
  }

  // 3. Sliding Window Strategy (Word-level)
  const targetNoSpaces = cleanTarget;
  let maxScore = 0;
  
  // Word-level sliding window
  for (let i = 0; i < inputWords.length; i++) {
      let currentPhrase = "";
      for (let j = i; j < inputWords.length; j++) {
          currentPhrase += (currentPhrase ? "" : "") + inputWords[j];
          if (currentPhrase.length > targetNoSpaces.length * 2.5) break; 
          const score = getLevenshteinScore(targetNoSpaces, currentPhrase);
          if (score > maxScore) maxScore = score;
      }
  }

  // 4. Character-level Sliding Window fallback
  // Use character scan for fuzzy matching of substrings (e.g. "Kum" in "Computer")
  if (maxScore < 80) {
      const cleanInputNoSpaces = cleanInput.replace(/\s/g, '');
      // Only run if input is reasonably longer than target but not massive
      if (cleanInputNoSpaces.length >= targetNoSpaces.length) {
          const tLen = targetNoSpaces.length;
          // We can optimize by only checking substrings of roughly target length (+- tolerance)
           // But simply checking all substrings of length target (+- 20%) is decent
          const minLen = Math.floor(tLen * 0.8);
          const maxLen = Math.ceil(tLen * 1.5);
          
          for (let len = minLen; len <= maxLen; len++) {
              if (len > cleanInputNoSpaces.length) break;
              if (len === 0) continue;

              for (let i = 0; i <= cleanInputNoSpaces.length - len; i++) {
                 // Use substring instead of deprecated substr
                 const sub = cleanInputNoSpaces.substring(i, i + len);
                 const score = getLevenshteinScore(targetNoSpaces, sub);
                 if (score > maxScore) maxScore = score;
                 if (maxScore >= 95) break; // Optimization
              }
              if (maxScore >= 95) break;
          }
      }
  }

  return maxScore;
};


/**
 * Simple heuristic to split a word into syllable-like chunks.
 * This is not perfect but better than showing the whole word.
 */
const syllabify = (word: string): string[] => {
  const clean = word.replace(/[^a-zA-Z]/g, '');
  if (clean.length <= 4) return [word];
  
  // Split based on vowel groups roughly
  const syllableRegex = /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi;
  const parts = clean.match(syllableRegex) || [word];
  
  // Capitalize first letter of each part for display
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
};

export const evaluatePronunciation = async (
  targetWord: string,
  transcript: string
): Promise<PronunciationResult> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 600));

  const score = calculateSimilarity(targetWord, transcript);
  
  // Try to find exact match in VOCAB_DATA (handling case and spaces)
  const normalizedTarget = targetWord.toLowerCase().trim();
  const data = VOCAB_DATA[normalizedTarget] || {
    ipa: `/${normalizedTarget}/`,
    syllables: syllabify(targetWord) // Use dynamic splitting
  };

  // Determine which parts are "good" based on the score.
  // We distribute the "correctness" across the syllables.
  // If score is 100, all good. If score is 0, all bad.
  // If score is 50, roughly half represent good attempts.
  
  // IMPROVED LOGIC: Score each syllable individually against the transcript
  // This handles specific part errors (e.g. "Meeting" vs "Parting" -> "Mee"(Bad) "ting"(Good))
  const breakdown = data.syllables.map((part) => {
    // Check this specific syllable against the full transcript
    // The calculateSimilarity function uses a sliding window, so it will find if 'part' exists in 'transcript'
    const partScore = calculateSimilarity(part, transcript);
    return {
      part: part,
      // Threshold for individual syllables: 60% match
      status: (partScore >= 60 ? 'good' : 'bad') as 'good' | 'bad'
    };
  });

  let feedback = "";
  let isCorrect = false;

  if (score >= 90) {
    feedback = "Perfect! You sounded just like a native speaker.";
    isCorrect = true;
  } else if (score >= 70) {
    feedback = "Good job! You are very close, just keep practicing.";
    isCorrect = true;
  } else if (score >= 40) {
    feedback = `I heard "${transcript}". Try to focus on the sounds in ${targetWord}.`;
    isCorrect = false;
  } else {
    feedback = transcript
      ? `I heard "${transcript}", which is quite different.`
      : "I couldn't hear you clearly. Please try again.";
    isCorrect = false;
  }

  return {
    score,
    transcription: data.ipa,
    isCorrect,
    feedback,
    breakdown
  };
};

export const generateReferenceAudio = async (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Cancel any ongoing speech
    Speech.stop();
    
    // Use Expo Speech API directly
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9, // Slightly slower for learning
      onDone: () => resolve(),
      onError: (error: Error) => reject(error)
    });
  });
};