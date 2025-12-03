/**
 * LOCAL PRONUNCIATION SERVICE
 *
 * This service uses purely local algorithms (Levenshtein Distance) to evaluate
 * pronunciation accuracy. It does NOT make calls to external AI APIs.
 *
 * Data is static and processing happens client-side.
 */

import { PronunciationResult } from '../types';
import * as Speech from 'expo-speech';

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
const calculateSimilarity = (target: string, input: string): number => {
  const a = target.toLowerCase().replace(/[^a-z0-9]/g, '');
  const b = input.toLowerCase().replace(/[^a-z0-9]/g, '');
  
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
  
  // Base similarity
  let similarity = (maxLength - distance) / maxLength;
  
  // --- HEURISTICS ---

  // 1. Length Penalty: If the spoken word is significantly shorter or longer
  // (e.g. "book" vs "carry-on"), apply a heavy penalty.
  const lengthRatio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
  if (lengthRatio < 0.6) {
      similarity *= 0.5;
  }

  // 2. Start/End Penalty: The first sound is usually the most important anchor.
  if (a[0] !== b[0]) {
      similarity *= 0.9;
  }

  return Math.round(Math.max(0, similarity * 100));
};

export const evaluatePronunciation = async (
  targetWord: string,
  transcript: string
): Promise<PronunciationResult> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 600));

  const score = calculateSimilarity(targetWord, transcript);
  const data = VOCAB_DATA[targetWord.toLowerCase()] || {
    ipa: `/${targetWord.toLowerCase()}/`,
    syllables: [targetWord]
  };

  // Determine which parts are "good" based on the score.
  // We distribute the "correctness" across the syllables.
  // If score is 100, all good. If score is 0, all bad.
  // If score is 50, roughly half represent good attempts.
  
  const totalParts = data.syllables.length;
  
  // Stricter threshold: If score is very low (< 40), everything is bad.
  // Otherwise, calculate how many parts "passed" based on the score percentage.
  let passedPartsCount = 0;
  
  if (score >= 90) {
      passedPartsCount = totalParts;
  } else if (score < 40) {
      passedPartsCount = 0;
  } else {
      passedPartsCount = Math.floor((score / 100) * totalParts);
  }

  const breakdown = data.syllables.map((part, index) => ({
    part: part,
    status: (index < passedPartsCount ? 'good' : 'bad') as 'good' | 'bad'
  }));

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
    
    const utterance = new Speech.SynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for learning
    
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    Speech.speak(utterance);
  });
};