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
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

// Map voiced to unvoiced and vice-versa for low penalty swaps
const VOICED_UNVOICED_PAIRS: Record<string, string> = {
  'b': 'p', 'p': 'b',
  'd': 't', 't': 'd',
  'g': 'k', 'k': 'g',
  'v': 'f', 'f': 'v',
  'z': 's', 's': 'z',
  'j': 'ch', 'ch': 'j', // approximants
};

/**
 * Normalizes text to a simplified phonetic representation.
 * Handles common English orthography oddities.
 */
const normalizePhonetics = (text: string): string => {
  let res = text.toUpperCase();

  // Common mappings
  res = res.replace(/PH/g, 'F');
  res = res.replace(/CK/g, 'K');

  // Start of word anomalies
  if (res.startsWith('KN')) res = 'N' + res.slice(2);
  if (res.startsWith('WR')) res = 'R' + res.slice(2);
  if (res.startsWith('WH')) res = 'W' + res.slice(2);

  // Endings
  if (res.endsWith('ING')) res = res.slice(0, -3) + 'IN';

  res = res.replace(/QU/g, 'KW');
  res = res.replace(/X/g, 'KS');
  res = res.replace(/C(?=[EIY])/g, 'S'); // Soft C
  res = res.replace(/C/g, 'K');          // Hard C catch-all

  return res.toLowerCase(); // Return to lower for comparison
};

/**
 * Calculates substitution cost between two characters.
 * 0.0 = match
 * 0.3 = voiced/unvoiced swap (b/p)
 * 0.4 = vowel mismatch (a/e)
 * 1.0 = full error
 */
const getSubstitutionCost = (charA: string, charB: string): number => {
  if (charA === charB) return 0;

  // Voiced/Unvoiced check
  if (VOICED_UNVOICED_PAIRS[charA] === charB) return 0.3;

  // Vowel check
  const isVowelA = VOWELS.has(charA);
  const isVowelB = VOWELS.has(charB);

  if (isVowelA && isVowelB) return 0.4; // Vowel to vowel error
  if (!isVowelA && !isVowelB) return 1.0; // Consonant to mismatched consonant

  return 1.0; // Vowel/Consonant swap (major error)
};

/**
 * Calculates similarity using Weighted Levenshtein Distance
 */
const calculateSimilarity = (target: string, input: string): number => {
  // Normalize both strings phonetically
  const normTarget = normalizePhonetics(target.replace(/[^a-zA-Z]/g, ''));
  const normInputRaw = input.toLowerCase().replace(/[^a-zA-Z\s]/g, ''); // Keep spaces for word splitting

  if (normTarget.length === 0) return 100;
  if (normInputRaw.replace(/\s/g, '').length === 0) return 0;

  // Shortcut for exact phonetic substring
  const inputNoSpaces = normInputRaw.replace(/\s/g, '');
  const normInput = normalizePhonetics(inputNoSpaces);

  if (normInput.includes(normTarget)) return 100;

  // Weighted Levenshtein Function
  const getWeightedScore = (a: string, b: string): number => {
    if (a.length === 0) return b.length === 0 ? 100 : 0;
    if (b.length === 0) return 0;

    const row = new Array(a.length + 1).fill(0);
    // Initialize first row (deletion costs - standard weight 1.0 per char)
    for (let j = 0; j <= a.length; j++) row[j] = j;

    let prevRow = [...row];

    for (let i = 1; i <= b.length; i++) {
        row[0] = i; // Insertion cost
        const charB = b[i - 1];

        for (let j = 1; j <= a.length; j++) {
            const charA = a[j - 1];

            const costReplace = prevRow[j - 1] + getSubstitutionCost(charA, charB);
            const costInsert = prevRow[j] + 1; // Standard insertion cost
            const costDelete = row[j - 1] + 1; // Standard deletion cost

            row[j] = Math.min(costReplace, costInsert, costDelete);
        }
        prevRow = [...row];
    }

    const distance = prevRow[a.length];
    const maxLength = Math.max(a.length, b.length);

    // Calculate similarity
    let similarity = Math.max(0, (maxLength - distance) / maxLength);

    return Math.round(similarity * 100);
  };

  // Tokenize & Sliding Window (using phonetic chunks)
  // We split the raw input by spaces to get words, then normalize each phrase
  const inputWords = normInputRaw.split(/\s+/).filter(w => w.length > 0);

  // If single word/short input, compare directly
  if (inputWords.length <= 1) {
    return getWeightedScore(normTarget, normalizePhonetics(normInputRaw));
  }

  let maxScore = 0;

  // Word-level sliding window
  for (let i = 0; i < inputWords.length; i++) {
      let currentPhraseRaw = "";
      // Construct phrase from words
      for (let j = i; j < inputWords.length; j++) {
          currentPhraseRaw += (currentPhraseRaw ? "" : "") + inputWords[j];

          const currentPhraseNorm = normalizePhonetics(currentPhraseRaw);

          if (currentPhraseNorm.length > normTarget.length * 2.5) break;

          const score = getWeightedScore(normTarget, currentPhraseNorm);
          if (score > maxScore) maxScore = score;
      }
  }

  // Character-level fallback (on the full normalized string)
  if (maxScore < 80) {
      if (normInput.length >= normTarget.length) {
          const tLen = normTarget.length;
          const minLen = Math.floor(tLen * 0.8);
          const maxLen = Math.ceil(tLen * 1.5);

          for (let len = minLen; len <= maxLen; len++) {
              if (len > normInput.length) break;
              if (len === 0) continue;

              for (let i = 0; i <= normInput.length - len; i++) {
                 const sub = normInput.substring(i, i + len);
                 const score = getWeightedScore(normTarget, sub);
                 if (score > maxScore) maxScore = score;
                 if (maxScore >= 95) break;
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