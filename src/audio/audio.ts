import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import { BGM_REQUIRE, LINE_REQUIRE, OVER_REQUIRE } from '../config';
import { synthWavBase64 } from './synth';

// シンプルなサウンド管理（ローカル生成 WAV を一時ファイルへ保存して再生）

const files = {
  bgm: FileSystem.cacheDirectory + 'tetris_bgm.wav',
  line: FileSystem.cacheDirectory + 'tetris_line.wav',
  over: FileSystem.cacheDirectory + 'tetris_over.wav',
};

let bgmSound: Audio.Sound | null = null;
let fxLine: Audio.Sound | null = null;
let fxOver: Audio.Sound | null = null;

async function ensureFiles() {
  // 既に存在するならスキップ
  const infos = await Promise.all(
    Object.values(files).map((p) => FileSystem.getInfoAsync(p))
  );
  const exists = (idx: number) => (infos[idx] as FileSystem.FileInfo).exists;

  if (!exists(0)) {
    // BGM は少し長め
    const base = synthWavBase64({ frequency: 220, durationMs: 800, volume: 0.12 });
    await FileSystem.writeAsStringAsync(files.bgm, base, { encoding: FileSystem.EncodingType.Base64 });
  }
  if (!exists(1)) {
    const base = synthWavBase64({ frequency: 880, durationMs: 120, volume: 0.3 });
    await FileSystem.writeAsStringAsync(files.line, base, { encoding: FileSystem.EncodingType.Base64 });
  }
  if (!exists(2)) {
    const base = synthWavBase64({ frequency: 180, durationMs: 400, volume: 0.25 });
    await FileSystem.writeAsStringAsync(files.over, base, { encoding: FileSystem.EncodingType.Base64 });
  }
}

export async function initAudio() {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  await ensureFiles();
}

let musicStarted = false;
let musicLoading = false;

export async function playMusic(loop = true) {
  await initAudio();
  if (bgmSound) {
    try {
      const st = await bgmSound.getStatusAsync();
      if (!(st as any).isLoaded) {
        // まれにunloadedなら再ロード
        if (BGM_REQUIRE) await bgmSound.loadAsync(BGM_REQUIRE);
        else await bgmSound.loadAsync({ uri: files.bgm });
      }
      await bgmSound.setIsLoopingAsync(loop);
      if (!(st as any).isPlaying) await bgmSound.playAsync();
      musicStarted = true;
    } catch {}
    return;
  }
  if (musicLoading) return;
  musicLoading = true;
  try {
    const snd = new Audio.Sound();
    if (BGM_REQUIRE) {
      await snd.loadAsync(BGM_REQUIRE);
    } else {
      await snd.loadAsync({ uri: files.bgm });
    }
    await snd.setIsLoopingAsync(loop);
    await snd.setVolumeAsync(0.25);
    await snd.playAsync();
    bgmSound = snd;
    musicStarted = true;
  } finally {
    musicLoading = false;
  }
}

export async function pauseMusic() {
  if (bgmSound) await bgmSound.pauseAsync();
}

export async function resumeMusic() {
  if (bgmSound) await bgmSound.playAsync();
}

export async function stopMusic() {
  if (bgmSound) {
    await bgmSound.stopAsync();
    await bgmSound.unloadAsync();
    bgmSound = null;
    musicStarted = false;
    musicLoading = false;
  }
}

export async function playLineClear() {
  await initAudio();
  if (!fxLine) {
    fxLine = new Audio.Sound();
    if (LINE_REQUIRE) await fxLine.loadAsync(LINE_REQUIRE);
    else await fxLine.loadAsync({ uri: files.line });
  }
  await fxLine.replayAsync();
}

export async function playGameOver() {
  await initAudio();
  await stopMusic();
  if (!fxOver) {
    fxOver = new Audio.Sound();
    if (OVER_REQUIRE) await fxOver.loadAsync(OVER_REQUIRE);
    else await fxOver.loadAsync({ uri: files.over });
  }
  await fxOver.replayAsync();
}

export async function stopFxOver() {
  if (fxOver) {
    try {
      await fxOver.stopAsync();
    } catch {}
    try {
      await fxOver.unloadAsync();
    } catch {}
    fxOver = null;
  }
}

export async function stopAllSounds() {
  await stopMusic();
  if (fxLine) {
    try { await fxLine.stopAsync(); } catch {}
    try { await fxLine.unloadAsync(); } catch {}
    fxLine = null;
  }
  await stopFxOver();
}
