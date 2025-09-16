import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import { BGM_TRACKS, DEFAULT_BGM_TRACK_ID, LINE_REQUIRE, OVER_REQUIRE, type BgmTrackDefinition } from '../config';
import { synthWavBase64 } from './synth';

// サウンドファイルのパス管理
const files = {
  line: FileSystem.cacheDirectory + 'tetris_line.wav',
  over: FileSystem.cacheDirectory + 'tetris_over.wav',
};

const synthBgmCache = new Map<string, string>();
const trackMap = new Map<string, BgmTrackDefinition>(BGM_TRACKS.map((track) => [track.id, track]));

const resolveDefaultTrack = (): BgmTrackDefinition => {
  const fallback = trackMap.get(DEFAULT_BGM_TRACK_ID) ?? BGM_TRACKS[0];
  if (!fallback) {
    throw new Error('BGM プリセットが定義されていません');
  }
  return fallback;
};

let currentTrack = resolveDefaultTrack();
let bgmSound: Audio.Sound | null = null;
let bgmSoundTrackId: string | null = null;
let fxLine: Audio.Sound | null = null;
let fxOver: Audio.Sound | null = null;
let musicStarted = false;
let musicLoading = false;

type SoundSource = Parameters<typeof Audio.Sound.createAsync>[0];

async function ensureFxFiles() {
  const infos = await Promise.all(
    Object.values(files).map((p) => FileSystem.getInfoAsync(p))
  );
  const exists = (idx: number) => (infos[idx] as FileSystem.FileInfo).exists;

  if (!exists(0)) {
    const base = synthWavBase64({ frequency: 880, durationMs: 120, volume: 0.3 });
    await FileSystem.writeAsStringAsync(files.line, base, { encoding: FileSystem.EncodingType.Base64 });
  }
  if (!exists(1)) {
    const base = synthWavBase64({ frequency: 180, durationMs: 400, volume: 0.25 });
    await FileSystem.writeAsStringAsync(files.over, base, { encoding: FileSystem.EncodingType.Base64 });
  }
}

async function ensureSynthTrack(track: BgmTrackDefinition): Promise<string | null> {
  if (!track.synth) return null;
  const cachePath = synthBgmCache.get(track.id);
  if (cachePath) return cachePath;
  const target = FileSystem.cacheDirectory + `tetris_bgm_${track.id}.wav`;
  const info = await FileSystem.getInfoAsync(target);
  if (!info.exists) {
    const base = synthWavBase64(track.synth);
    await FileSystem.writeAsStringAsync(target, base, { encoding: FileSystem.EncodingType.Base64 });
  }
  synthBgmCache.set(track.id, target);
  return target;
}

function resolveTrack(id: string): BgmTrackDefinition {
  return trackMap.get(id) ?? resolveDefaultTrack();
}

function isSilentTrack(track: BgmTrackDefinition): boolean {
  return track.asset === null;
}

async function loadSourceForTrack(track: BgmTrackDefinition): Promise<SoundSource | null> {
  if (isSilentTrack(track)) return null;
  if (typeof track.asset === 'number') return track.asset;
  const synthPath = await ensureSynthTrack(track);
  if (synthPath) return { uri: synthPath } as SoundSource;
  return null;
}

export async function initAudio() {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  await ensureFxFiles();
}

export async function playMusic(loop = true) {
  await initAudio();
  const track = currentTrack;
  const source = await loadSourceForTrack(track);

  if (!source) {
    // サイレント設定なので既存サウンドを停止
    if (bgmSound) await stopMusic();
    musicStarted = true;
    return;
  }

  if (bgmSound && bgmSoundTrackId === track.id) {
    try {
      const st = await bgmSound.getStatusAsync();
      if (!(st as any).isLoaded) {
        await bgmSound.loadAsync(source);
      }
      await bgmSound.setIsLoopingAsync(loop);
      if (!(st as any).isPlaying) await bgmSound.playAsync();
      musicStarted = true;
    } catch {
      await stopMusic();
      await playMusic(loop);
    }
    return;
  }

  if (musicLoading) return;
  musicLoading = true;
  try {
    if (bgmSound) {
      try { await bgmSound.stopAsync(); } catch {}
      try { await bgmSound.unloadAsync(); } catch {}
    }
    const snd = new Audio.Sound();
    await snd.loadAsync(source);
    await snd.setIsLoopingAsync(loop);
    await snd.setVolumeAsync(track.volume ?? 0.25);
    await snd.playAsync();
    bgmSound = snd;
    bgmSoundTrackId = track.id;
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
  else if (!isSilentTrack(currentTrack)) await playMusic(true);
}

export async function stopMusic() {
  if (bgmSound) {
    try { await bgmSound.stopAsync(); } catch {}
    try { await bgmSound.unloadAsync(); } catch {}
    bgmSound = null;
  }
  bgmSoundTrackId = null;
  musicStarted = false;
  musicLoading = false;
}

export async function selectBgmTrack(id: string) {
  const nextTrack = resolveTrack(id);
  if (nextTrack.id === currentTrack.id) return;
  const wasPlaying = musicStarted && !isSilentTrack(currentTrack);
  await stopMusic();
  currentTrack = nextTrack;
  if (wasPlaying) {
    await playMusic(true);
  } else if (isSilentTrack(nextTrack)) {
    musicStarted = true;
  }
}

export function getCurrentBgmTrackId(): string {
  return currentTrack.id;
}

export function getBgmTracks(): readonly BgmTrackDefinition[] {
  return BGM_TRACKS;
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
