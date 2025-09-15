// 実行時トグル。ジェスチャでクラッシュする場合は false にして様子見。
export const ENABLE_GESTURES = false;

// 日本語: 好みのBGM/効果音を使う場合は、下記の require 行を有効化し、
// assets/audio/ にファイルを配置してください（mp3/caf 推奨）。
// 例:
export const BGM_REQUIRE = require('../assets/audio/bgm.caf');
// export const LINE_REQUIRE = require('../assets/audio/line.caf');
// export const OVER_REQUIRE = require('../assets/audio/over.mp3');

// export const BGM_REQUIRE: number | null = null;
export const LINE_REQUIRE: number | null = null;
export const OVER_REQUIRE: number | null = null;
