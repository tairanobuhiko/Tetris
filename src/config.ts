// 実行時トグル。ジェスチャでクラッシュする場合は false にして様子見。
export const ENABLE_GESTURES = false;

// BGM のプリセット定義。title を UI で表示する。
export type BgmTrackDefinition = {
  id: string;
  title: string;
  asset?: number | null;
  volume?: number;
  synth?: {
    frequency?: number;
    durationMs?: number;
    volume?: number;
    sampleRate?: number;
  };
  description?: string;
};

export const BGM_TRACKS: readonly BgmTrackDefinition[] = [
  {
    id: 'kirby',
    title: 'カービィのテーマ',
    asset: require('../assets/audio/bgm.caf'),
    volume: 1.00,
    description: 'カービィのテーマソング',
  },
  {
    id: 'remix_kirby',
    title: 'カービィのテーマ (リミックス)',
    asset: require('../assets/audio/Green_Greens_Remix.caf'),
    volume: 1.00,
    description: 'カービィのテーマソングのリミックス風アレンジ',
  },
  {
    id: 'house_beat',
    title: 'ハウスビート',
    asset: require('../assets/audio/house_beat.mp3'),
    volume: 1.00,
    description: 'Cover - Patrick Patrikios',
  },
];

export const DEFAULT_BGM_TRACK_ID = 'kirby';

// 効果音の差し替えが必要な場合は以下を編集
export const LINE_REQUIRE = require('../assets/audio/block_line.mp3');
export const OVER_REQUIRE = require('../assets/audio/over.mp3');

// export const LINE_REQUIRE: number | null = null;
// export const OVER_REQUIRE: number | null = null;
