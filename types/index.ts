export interface PronunciationResult {
  score: number;
  transcription: string;
  isCorrect: boolean;
  feedback: string;
  breakdown: Array<{
    part: string;
    status: 'good' | 'bad';
  }>;
}