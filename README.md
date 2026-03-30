# 隕石を回避せよ：ワームホールアドベンチャー

宇宙船を操作して隕石を避け、飛行距離を伸ばすブラウザゲーム。  
採掘した鉱石でアイテム・機体・武器を強化し、スコアを競う。

**サーバー不要。`index.html` をブラウザで開くだけで動く。**

---

## 主な機能

- 🚀 **6種の機体** — 実績解放で見た目・弾が変化
- ⚔️ **6種の装備武器** — レーザー・ホーミング・チャージショットなど
- ✨ **バフスロット** — ゲーム開始前にバフを3枠まで自動適用
- ⛏️ **採掘システム** — シールド中に隕石に体当たりして鉱石を取得
- 🏆 **16種の実績** — 累積プレイで段階解放
- 📊 **ゲームオーバー後の統計** — スコア内訳・採掘サマリー・NEW RECORD演出
- 📢 **SNSシェア** — Web Share API（モバイル）/ X(Twitter)（PC）対応

---

## セットアップ

インストール不要。外部依存ライブラリなし。

```
1. このリポジトリをクローンまたはZIPでダウンロード
2. index.html をブラウザで開く
```

> **PC**: Chrome / Edge / Firefox 最新版推奨  
> **スマホ**: iOS Safari / Android Chrome 対応。画面下部の操作エリアを指でドラッグして操作。

### デプロイする場合

HTMLファイルをそのままホスティングサービス（GitHub Pages / Cloudflare Pages など）に配置するだけで動く。  
SNSシェア機能を使う場合は `script.js` 内の `SHARE_URL` を本番URLに変更すること。

```js
// script.js 内
const SHARE_URL = "https://your-url.com/"; // ← ここを変更
```

---

## ファイル構成

```
├── index.html          # エントリーポイント（全画面のHTML定義）
├── style.css           # 全スタイル
├── script.js           # メインロジック（UI・ゲームループ・状態管理）
├── storage-system.js   # 格納庫・装備・機体・バフ・武器定義
├── entities.js         # 隕石・ワームホール・弾・資源
├── player.js           # 宇宙船（機体別描画・燃料）
├── achievements.js     # 実績システム
├── powerups.js         # シールドアイテム・採掘処理
├── audio.js            # BGM・効果音
├── effects.js          # パーティクル・デバッグログ
└── shop-manager.js     # ショップUI・購入処理
```

データはすべて `localStorage` に保存。ネットワーク通信なし。

---

## ドキュメント

| ファイル | 内容 | 読むタイミング |
|---------|------|--------------|
| [`docs/spec.md`](docs/spec.md) | ゲーム仕様・ルール・数値の正式定義 | 仕様を確認したいとき |
| [`docs/handover.md`](docs/handover.md) | 実装状態・技術メモ・作業ルール | 開発を引き継ぐとき |
| [`docs/todo.md`](docs/todo.md) | 未着手タスク一覧 | 次の作業を選ぶとき |
| [`docs/changelog.md`](docs/changelog.md) | バージョン別変更履歴 | 変更経緯を調べるとき |

---

## 開発について

**新機能を追加する場合**

1. `docs/todo.md` で未着手タスクを確認
2. `docs/spec.md` で関連仕様を確認
3. `docs/handover.md` の「作業上の注意点」と「修正完了チェックリスト」を実行

**バグを修正する場合**

- ゲームロジック → `script.js` の `Game` オブジェクト
- 武器・弾 → `entities.js` の `Bullets`
- 装備・機体定義 → `storage-system.js`
- CSS修正後は必ずブレース整合チェックを実行（手順は `docs/handover.md` 参照）

---

## 注意事項

- `localStorage` が使えない環境（プライベートブラウジング等）ではデータが保存されない
- `file://` で開いた場合、SNSシェアボタンはX(Twitter)へのフォールバック動作になる
- スマホでのダブルタップ拡大はviewport設定で無効化済み
