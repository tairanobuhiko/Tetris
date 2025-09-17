import * as FileSystem from 'expo-file-system/legacy';

const STORAGE_DIR = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
const STORAGE_PATH = STORAGE_DIR ? `${STORAGE_DIR}tetris_highscore.json` : '';

type HighScorePayload = {
  highScore: number;
  updatedAt: number;
};

export async function loadHighScore(): Promise<number> {
  try {
    if (!STORAGE_PATH) return 0;
    const info = await FileSystem.getInfoAsync(STORAGE_PATH);
    if (!info.exists) {
      return 0;
    }
    const raw = await FileSystem.readAsStringAsync(STORAGE_PATH, { encoding: FileSystem.EncodingType.UTF8 });
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as Partial<HighScorePayload>;
    const value = typeof parsed.highScore === 'number' ? parsed.highScore : 0;
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

export async function saveHighScore(score: number): Promise<void> {
  if (!Number.isFinite(score)) return;
  if (!STORAGE_PATH) return;
  const payload: HighScorePayload = {
    highScore: Math.max(0, Math.floor(score)),
    updatedAt: Date.now(),
  };
  try {
    await FileSystem.writeAsStringAsync(STORAGE_PATH, JSON.stringify(payload), {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch {
    // 保存失敗時は黙ってスキップ
  }
}
