# START HERE ― 隕石を回避せよ ワームホールアドベンチャー

> **このファイルを最初に読む。** 次に読む順番・現在の状態・やるべきことがすべてここにある。

---

## プロジェクト概要

ブラウザで動作するスマホファーストの宇宙船アクションゲーム。サーバー不要・`index.html` を開くだけで動く。  
隕石を避けながら飛行距離を伸ばし、鉱石を採掘してアイテム・武器・機体を強化する。  
GitHub Pages でホスト済み: **https://men0tai0ko.github.io/meteor-dodge/**

現在 **v2.6.0**。F-10（難易度選択 EASY/NORMAL/HARD）・F-21（難易度別ボスHP）の実装が完了。

---

## 読む順番

| 順 | ファイル | 目的 |
|:---:|---|---|
| 1 | `START_HERE.md`（本ファイル） | 全体把握・作業開始 |
| 2 | `handover.md` | 実装状態・技術メモ・作業ルール |
| 3 | `todo.md` | 未着手タスク一覧 |
| 4 | `spec.md` | 仕様の詳細確認（必要時のみ） |
| 5 | `changelog.md` | 過去の変更経緯（必要時のみ） |

> **コードを触る前に必ず `handover.md § 5` の注意点とチェックリストを確認すること。**

---

## プロジェクト構成

```
リポジトリルート/
├── index.html          # エントリーポイント（全画面HTML）
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

**最重要ルール：**
`/mnt/user-data/uploads/` のファイルは旧バージョンの可能性がある。  
**作業は必ず `/mnt/user-data/outputs/` の最新版をベースにすること。**

---

## 現在の状態（v2.6.0）

### 実装済み

| カテゴリ | 内容 |
|---|---|
| ゲームコア | 隕石回避・ライフ・燃料・ワームホール・ボス（1500mごと）・3種の隕石 |
| 難易度 | EASY / NORMAL / HARD（タイトル画面プルダウン）・出現率/スコア倍率/ボスHP係数を変更 |
| 採掘 | シールド中の体当たりで鉱石（鉄/銀/金）採掘・コンボシステム |
| 武器 | 6種・**最大Lv5**（Lv4/5は累積飛行距離で解放） |
| 武器Lv4効果 | 連射弾: 拡散角+15° / 強化弾: 弾速上昇 / レーザー: 幅拡大+ダメ+1 / チャージ: 溜め短縮+ボス6ダメ / バリア: 幅拡大+燃料削減 / ホーミング: 追尾4発+精度向上 |
| 武器Lv5効果 | 連射弾: 貫通弾 / 強化弾: 爆発弾 / レーザー: 分裂照射3本 / チャージ: 連続爆発(0.5秒追撃) / バリア: 反射バリア / ホーミング: 連鎖ホーミング |
| 武器解放条件 | 武器別累積飛行距離（Lv4: 500,000km / Lv5: 1,500,000km）装備中のみカウント |
| 機体 | 6種（実績/鉱石で解放）・形状と弾が変化 |
| バフ | スロット3枠・ゲーム開始時自動適用 |
| 実績 | 16種・最大Lv10 |
| 格納庫 | 装備/機体/バフの3タブ・Lv4/5ロック表示・進捗バー |
| SNSシェア | Web Share API（モバイル）+ Twitter fallback（PC）・本番URL設定済み |
| NEW RECORD | ゲームオーバー後にパルスアニメ演出・前回ベスト表示 |
| タイトル | ベストスコア常時表示・アイコンボタン（格納庫/遊び方/設定/実績） |
| デプロイ | GitHub Pages 稼働中 |

### 未実装（todo.mdを参照）

| 優先度 | タスク |
|:---:|---|
| 🟡 | D-1/D-2: spec.md への Lv4/5仕様・localStorageキー追記 |
| 🟢 | F-15〜F-20: 長押し操作・リプレイ・アクセシビリティ等 |
| 🟢 | D-3: 統計画面に難易度補正の補足表示 |

---

## 直近の変更内容（v2.6.0 / 本セッション）

### 機能追加（F-10 / F-21）

- **難易度選択プルダウン**をタイトル画面に追加（ゲームスタートボタン直下）
- **難易度別パラメーター**を `startGameDirectly()` 冒頭で適用

  | 難易度 | 隕石出現率 | スコア倍率 | ボスHP係数 |
  |:---:|:---:|:---:|:---:|
  | EASY | ×0.7 | ×0.8 | ×0.7（最低1） |
  | NORMAL | ×1.0 | ×1.0 | ×1.0 |
  | HARD | ×1.4 | ×1.3 | ×1.5 |

- **スコア倍率**を `Game.scoreMultiplier` で管理。score再計算の全8箇所（script.js 3箇所・entities.js 5箇所）に適用
- **ボスHP**を `Game.bossDifficultyMul` で管理。`Obstacles.spawnBoss()` 内で乗算

### UI改善

- タイトル画面の4ボタンをアイコン＋ラベルの小型ボタンに変更し横並び配置
  - 📦 格納庫 / ❓ 遊び方 / ⚙️ 設定 / 🏆 実績
  - ボタンID・イベントリスナーは変更なし

---

## 既知の問題

| 重要度 | 内容 | 状態 |
|:---:|---|---|
| 🟡 | GitHub Pagesに最新ファイルが反映されるまで1〜2分かかる | 仕様（CDN遅延） |
| 🟡 | `file://` 環境でSNSシェアボタンはTwitter fallbackのみ動作 | 仕様 |
| 🟢 | EASY/HARDでスコア内訳合計≠総合スコアになる | 仕様（D-3で補足表示を検討） |
| 🟢 | ブラウザ強制終了時に当セッションの武器距離が消失 | 既知・許容範囲（maxScoreと同等） |
| 🟢 | ホーミング弾 `hb` に `width/height` がなく `handleBulletHit` 内で `undefined` が発生する可能性 | 既存継続問題・軽微 |
| 🟢 | 解放通知トーストがゲームオーバー時のタイミングで統計画面と重なる可能性 | 軽微 |

---

## 注意点（触ると壊れやすい箇所）

| 箇所 | 理由 | 対策 |
|---|---|---|
| `style.css` の修正 | `@keyframes` の括弧閉じ漏れで以降のCSSが全て無効になる | 修正後に必ず depth チェック（depth==0） |
| `script.js` の Python 書き込み | 日本語文字列の改行が生LFとして混入することがある | 書き込み後 `node --check script.js` |
| `index.html` ベースファイルの選択 | `uploads/` は旧バージョン。`outputs/` を必ず使うこと | 毎回 `outputs/` からコピー |
| `setupButtonWithSound()` | 対象DOMが存在しないと500ms毎に無限リトライが走る | HTML側に対応IDが存在することを確認してから登録 |
| `saveCumulativeStats()` | 非同期キュー保存（最大2秒遅延）のため即時保存が保証されない | `gameOver()` 内のタイミングで記録する設計を守る |
| `_sessionWeaponDistance` | ゲームループ内ではメモリ累積のみ。`gameOver()` と `reset()` の**両方**で `saveWeaponDistance()` を呼ぶ設計になっている | 片方だけ修正しないこと |
| `scoreMultiplier` 適用箇所 | score再計算は合計8箇所に分散している。新たにscore再計算を追加する場合は必ず `* (scoreMultiplier \|\| 1)` を乗算すること | 漏れると難易度間でスコアが不整合になる |
| `reflectFrames` | 反射バリアで反転した隕石オブジェクトに付与するフィールド。既存スポーン時は `undefined` だが `undefined > 0` = `false` で安全 | 衝突判定の条件を変えないこと |
| `UI.setupButtonWithSound` と `TitleScreen.setupButtonWithSound` | 同名だが差分がある（TitleScreenのみ非同期リトライあり）。統合禁止 | 変更しない |

---

## 作業開始前チェックリスト

```python
# outputs/ で実行
import os, re

files = ['effects.js','audio.js','storage-system.js','achievements.js',
         'shop-manager.js','powerups.js','entities.js','player.js']

with open('script.js',        encoding='utf-8') as f: js  = f.read()
with open('entities.js',      encoding='utf-8') as f: ent = f.read()
with open('storage-system.js',encoding='utf-8') as f: ss  = f.read()
css = open('style.css', encoding='utf-8').read()
depth = sum(1 if c=='{' else -1 if c=='}' else 0 for c in css)

loop_area = js[js.find('this.distance += 1')-20:js.find('this.distance += 1')+200]
sw_calls  = len(re.findall(r'saveWeaponDistance\(', js))
score_mul_js  = js.count('scoreMultiplier || 1')
score_mul_ent = ent.count('scoreMultiplier || 1')

checks = [
    ("全分割ファイル存在",              all(os.path.exists(f) for f in files)),
    ("CSS depth==0",                    depth == 0),
    ("WORMHOLE_SPAWN_RATE 0.0003",      "WORMHOLE_SPAWN_RATE: 0.0003" in js),
    ("Wormholes同時出現数制限",          "wormholes.length >= 1" in ent),
    ("SHARE_URL 本番URL",               "men0tai0ko.github.io" in js),
    ("titleBestScore JS実装",           "updateTitleBestScore" in js),
    ("startGameDirectly装備適用",       "getEquippedWeaponEffect" in js),
    ("未使用関数削除済み",               "animateScoreUpdate" not in js),
    ("maxLevel:5 全6武器",              ss.count("maxLevel: 5") == 6),
    ("unlockLevel定義",                 "unlockLevel:" in ss),
    ("saveWeaponDistance定義",          "saveWeaponDistance" in ss),
    ("B-4: ループ内直接呼出なし",        "saveWeaponDistance" not in loop_area),
    ("B-4: 呼出2箇所(reset+gameOver)",  sw_calls == 2),
    ("B-2: reflectFrames付与",          "reflectFrames = 10" in ent),
    ("E-3: 上方除去チェック",            "speed < 0 && this.obstacles[i].y" in ent),
    ("L-2: chainHoming hit=false廃止",  "hit = false" not in ent.replace("let hit = false","").replace("let hit=false","")),
    ("doubleBlastPending reset",         "doubleBlastPending = false" in ent),
    ("showToast in script",             "showToast" in js),
    ("F-10: difficulty プロパティ",     'difficulty: "normal"' in js),
    ("F-10: DIFFICULTY_CONFIG定義",     "DIFFICULTY_CONFIG" in js),
    ("F-10: scoreMultiplier script.js", score_mul_js >= 3),
    ("F-10: scoreMultiplier entities",  score_mul_ent >= 5),
    ("F-21: bossDifficultyMul entities","bossDifficultyMul" in ent),
    ("F-10: difficultySelect HTML",     "difficultySelect" in open('index.html',encoding='utf-8').read()),
    ("F-10: icon-btn HTML",             open('index.html',encoding='utf-8').read().count('icon-btn') >= 4),
]
for k, v in checks:
    print(f'{"✅" if v else "❌ 要確認"} {k}')
```

---

## 次チャット用プロンプト

```
あなたはシニアフロントエンドエンジニアです。
以下のプロジェクトの開発を引き継いで継続してください。

【プロジェクト】
「隕石を回避せよ ワームホールアドベンチャー」
- ブラウザで動作するスマホファーストの宇宙船アクションゲーム
- デプロイ先: https://men0tai0ko.github.io/meteor-dodge/
- 現在バージョン: v2.6.0
- 言語: Vanilla JS / HTML / CSS（サーバー不要）

【引き継ぎファイル】
添付の START_HERE.md を最初に読んでください。
その後 handover.md → todo.md の順で読み、開発状態を把握してください。

【作業ルール】
- /mnt/user-data/uploads/ のファイルは旧バージョンの可能性あり
- 作業は必ず /mnt/user-data/outputs/ の最新版をベースにすること
- CSS修正後は必ず depth チェック（depth==0 であること）
- JS書き込み後は node --check で構文確認
- 実装前に必ず確認を取り、独断で仕様変更しないこと

【次にやること】
todo.md の未着手タスクを確認してください。
直近の優先タスクは D-1/D-2（spec.md への仕様追記）です。
```
