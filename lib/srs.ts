export type SRSGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface SRSStats {
  interval: number; // Days until next review
  repetition: number; // Consecutive correct answers
  efactor: number; // Easiness factor (starts at 2.5)
  dueDate: number; // Timestamp of next review
}

export const INITIAL_STATS: SRSStats = {
  interval: 0,
  repetition: 0,
  efactor: 2.5,
  dueDate: 0,
};

/**
 * Calculates the next review schedule using the SM-2 algorithm.
 * @param current Current stats of the card
 * @param grade Performance rating (0-5). >= 3 is a pass.
 * @returns New stats
 */
export function calculateNextReview(current: SRSStats, grade: SRSGrade): SRSStats {
  let { interval, repetition, efactor } = current;

  if (grade >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  // Update E-Factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  efactor = efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (efactor < 1.3) efactor = 1.3;

  // Calculate due date
  const now = new Date();
  const dueDate = new Date(now.setDate(now.getDate() + interval)).getTime();

  return {
    interval,
    repetition,
    efactor,
    dueDate,
  };
}

/**
 * Maps our UI buttons to SM-2 grades
 */
export function mapRatingToGrade(rating: 'unknown' | 'difficult' | 'known'): SRSGrade {
  switch (rating) {
    case 'unknown': return 1; // Fail
    case 'difficult': return 3; // Pass, Hard
    case 'known': return 5; // Pass, Easy
  }
}
