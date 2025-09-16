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
    volume: 0.28,
    description: '彩度を落としたシンセで静かに駆け抜ける定番BGM',
  },
  {
    id: 'lofi-spark',
    title: 'ローファイスパーク',
    synth: { frequency: 196, durationMs: 1400, volume: 0.22 },
    description: 'シンプルな低音ビート。静かな集中プレイ向け',
  },
  {
    id: 'silent',
    title: 'サイレント',
    asset: null,
    description: 'BGM を再生しません',
  },
];

export const DEFAULT_BGM_TRACK_ID = 'kirby';

// 効果音の差し替えが必要な場合は以下を編集
export const LINE_REQUIRE = require('../assets/audio/line.mp3');
export const OVER_REQUIRE = require('../assets/audio/over.mp3');

// export const LINE_REQUIRE: number | null = null;
// export const OVER_REQUIRE: number | null = null;
