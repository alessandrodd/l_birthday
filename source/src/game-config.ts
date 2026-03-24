export const GAME_TITLE = 'Fly Laura, Fly!';
export const PASSWORD_TARGET_SCORE = 26;
export const SECRET_PASSWORD = '26PointsToPopcorn';

export type DifficultyMode = 'normal' | 'hard';

interface IDifficultySettings {
  baseSpeedMultiplier: number;
  holeSizeMultiplier: number;
  minGapMultiplier: number;
  gravityMultiplier: number;
  jumpMultiplier: number;
}

const DIFFICULTY_SETTINGS: Record<DifficultyMode, IDifficultySettings> = {
  normal: {
    baseSpeedMultiplier: 1,
    holeSizeMultiplier: 1,
    minGapMultiplier: 1,
    gravityMultiplier: 1,
    jumpMultiplier: 1
  },
  hard: {
    baseSpeedMultiplier: 2,
    holeSizeMultiplier: 0.9,
    minGapMultiplier: 0.9,
    gravityMultiplier: 2,
    jumpMultiplier: 1.5
  }
};

let currentDifficulty: DifficultyMode = 'normal';

export function getDifficulty(): DifficultyMode {
  return currentDifficulty;
}

export function setDifficulty(mode: DifficultyMode): void {
  currentDifficulty = mode;
}

export function getDifficultySettings(): IDifficultySettings {
  return DIFFICULTY_SETTINGS[currentDifficulty];
}
