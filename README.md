# RN Tetris (iOS ローカル向け)

モバイル(iOS)で自宅 Wi‑Fi 下だけで遊べるテトリスのサンプル。Expo + React Native + TypeScript。UI はモダンな見た目を意識し、ジェスチャ入力、1 秒 tick、行消去/スコア等の機能を導入しています。

## セットアップ
- Node 18+ 推奨、Xcode と iOS シミュレータを用意。
- 依存を導入: `npm install`
- 開発起動: `npm run start`（Expo Dev Tools）。
- iOS 実行: `npm run ios`（シミュレータ）。

## テスト
- 単体: `npm test`
- Lint/Format: `npm run lint` / `npm run format`, 型チェック: `npm run typecheck`

## ディレクトリ
- `src/game/` コアロジック（盤生成・衝突・回転・行消去・スコア）。
- `src/components/` `Board`, `Cell`, `HUD`, `GameScreen`。
- `src/hooks/` `useGameLoop`, `useInput`（左右/回転/ソフトドロップ）。

## セキュリティ
- 秘密情報は `.env` に置き VCS へコミット禁止。外部通信やトラッキングは実装していません。

> 既知の制限: ゴースト/ハードドロップ、7 バッグ、保留ホールドは未実装（今後追加検討）。

## 操作方法
  - タップ: 回転
  - 左右スワイプ: 左右移動
  - 下スワイプ: ソフトドロップ（速い）
  - 2本指タップ: ポーズ/再開
  - 画面下のボタン: それぞれ同機能（← ⟳ → ↓）
  - 1分ごとに落下速度が上がります（下限200ms）