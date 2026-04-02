# 変更履歴：隕石を回避せよ ワームホールアドベンチャー

---

## v3.0.0 — 2026-04-03

### 機能追加

- **F-15: スマホ2本指タップでポーズ**
  - `touchStartHandler` に `e.touches.length >= 2` の判定を追加
  - ゲーム中に2本指でタップすると `togglePause()` が呼ばれポーズモーダルを表示
  - 1本指ドラッグ操作は変更なし

- **F-17: 色覚サポートモード**
  - 設定画面に「色覚サポート」トグルを追加（OFF/ON）
  - ONにすると通常隕石（茶→青 `#4488CC`）・高速隕石（赤→オレンジ `#FF8800`）に配色変更
  - `localStorage["colorblindMode"]` に保存。設定変更時リアルタイム反映・ゲーム開始時にも適用
  - 大型隕石・ボスは変更なし

- **F-20: 新武器2種追加**

  **🌀 ワープキャノン**（Rare / 銀×30/60/120/240/480）
  - 自機真上の隕石を自動消滅。隕石がいなければCDを消費しない
  - Lv5で全画面縦1列を消去（ボス2ダメ付き）
  - プレイヤー周囲に紫CDリングと縦ビームエフェクトを表示

  | Lv | 効果 | 燃料消費 |
  |---|---|---|
  | 1 | 真上60px以内消滅 / CD3秒 | 2 |
  | 2 | 真上100px以内 / CD2.5秒 | 2.5 |
  | 3 | 真上150px以内 / CD2秒 | 3 |
  | 4 | 真上200px以内 + ボス1ダメ / CD1.5秒 | 3.5 |
  | 5 | 全画面縦1列消去 + ボス2ダメ / CD1秒 | 5 |

  **💫 衝撃波**（Epic / 金×4/8/16/32/64）
  - 自機周囲の隕石を上方へ吹き飛ばす（破壊しない・スコア加算なし）
  - Lv5で2連射・射程円を薄く常時表示・白CDリングを表示

  | Lv | 効果 | 燃料消費 |
  |---|---|---|
  | 1 | 半径20% / CD6秒 | 4 |
  | 2 | 半径25% / CD5秒 | 5 |
  | 3 | 半径30% / CD4秒 | 6 |
  | 4 | 半径35% + 速度2倍 / CD3秒 | 7 |
  | 5 | 半径40% + ボス1ダメ + 2連射 / CD3秒 | 8 |

### バグ修正

- **ホーミング弾 `hb` に `width/height` を追加**
  - `homingBullets.push()` に `width: 8, height: 8` を追加
  - `checkCollision()` 等の関数に渡した際の `undefined` 参照を予防

### 実装詳細

- `storage-system.js`：`warp_cannon` / `shockwave` の定義（levelEffects・価格・unlockLevel）
- `storage-system.js`：`getEquippedWeaponEffect()` に warp/sw の extra 付加を追加
- `entities.js`：`Bullets.update()` に `_updateWarpCannon()` / `_updateShockwave()` の呼び出しを追加
- `entities.js`：`Bullets.reset()` に `warpLevel / warpLastTime / swLevel / swLastTime` のリセットを追加
- `entities.js`：`drawWarpCannon()` / `drawShockwave()` を新規追加
- `script.js`：`Game.draw()` に両武器の描画呼び出しを追加
- `script.js`：`startGameDirectly()` の Bullets 初期化に `warpLevel / swLevel = 0` を追加
- `script.js`：`setupColorblindSettings()` / `applyColorblindMode()` を `UI` オブジェクトに追加

---

## v2.9.1 — 2026-04-03

### バグ修正

- **ボタン音の2重再生修正**
  - `UI.setupButtonWithSound` / `TitleScreen.setupButtonWithSound` の両方に `touchFired` フラグを追加
  - スマホで `touchstart` → `click` の順に両イベントが発火することで音が2回鳴っていた問題を修正
  - `touchstart` 発火後は直後の `click` を1回スキップする方式で対処

- **ゲーム中の実績ボタンで音が鳴らない問題を修正**
  - `achievementsBtnFromGame` の登録を `setupButton` → `setupButtonWithSound("menuOpen")` に変更
  - `KeyA` ハンドラにも `SoundManager.play("menuOpen")` を追加

- **`showScreen()` 内の余分な音再生を削除**
  - `showScreen("settingsScreen")` 時に `menuOpen` を再生するコードが残存しており、タイトルからの設定ボタン・`KeyS` キーで音が2回鳴る原因になっていた
  - 音の責務は各ボタンのイベントハンドラ側に統一

---

## v2.9.0 — 2026-04-03

### BGM改修

- **タイトル画面を無音化**
  - `ensureTitleBGM()` を BGM停止処理に変更
  - ユーザージェスチャーハンドラ・`attemptInitialBGM()` からの `mainTheme` 再生を削除

- **ゲーム開始ファンファーレ追加**（`audio.js`）
  - `BGMSequences.fanfare` を新規追加（BPM150・スクエア波+トライアングル波・約4秒・ループなし）
  - `startGameDirectly()` で `gameplay` の代わりに `fanfare` をワンフレーズ再生
  - `BGMManager.createBGMSequence()` でシーケンス側の `loop: false` を優先するよう修正
  - `scheduleNotes()` にループなし時の終了処理（`isPlaying` リセット）を追加

- **危険状態BGM廃止**
  - `checkDangerState()` の BGM切り替え処理を削除（効果音のみに統一）

### 設定画面改修

- **プルダウンデザインを統一**
  - `bgmToggle` / `soundToggle` に `.setting-select` クラスを追加（`miningSoundToggle` と同デザインに統一）

- **「採掘効果音」を「効果音」に統合**
  - `miningSoundToggle` の設定項目を削除（`soundToggle` のOFFで採掘音も含む全効果音が止まるため）

- **振動設定をスマホのみ表示**
  - 振動フィードバック・振動強度の2項目に `setting-item-mobile-only` クラスを付与
  - `@media (hover: none) and (pointer: coarse)` でタッチデバイスのみ表示

---

## v2.8.0 — 2026-04-03

### 機能追加

- **F-16: ポーズモーダル**
  - `ESC` キーでポーズモーダルを表示（ゲーム中のみ有効）
  - モーダルに「▶ プレイ再開」「🏠 タイトルへ」ボタンを配置
  - 「タイトルへ」は `gameOver()` 相当（保存処理 → 統計画面 → タイトル）
  - `reset()` 時にモーダルが残らないよう非表示処理を追加

- **キーボードショートカット追加**（ゲーム中のみ有効）

  | キー | 動作 |
  |---|---|
  | `Escape` | ポーズモーダル表示 |
  | `S` | 設定画面を開く（自動ポーズ） |
  | `A` | 実績画面を開く（自動ポーズ） |

### 仕様変更

- `Space` キーによるポーズを廃止
- `R` キーによるリセットを削除（フリーズバグの根本対応）

---

## v2.7.0 — 2026-04-02

### バグ修正

- **アイコンボタンラベルの改行修正**
  - `.icon-btn-label` に `white-space: nowrap` を追加
  - 狭い画面幅で「格納庫」「遊び方」のラベルが途中で改行していた問題を修正

### 機能追加

- **データバックアップ機能**（設定画面に追加）
  - 「書き出し」ボタン：全 `localStorage` データを日付付きJSONファイルとしてダウンロード
  - 「読み込み」ボタン：JSONファイルを選択してデータを復元（確認ダイアログ後にページリロード）
  - バックアップ対象キー：`gameStorage` / `equippedShip` / `ownedShips` / `buffSlots` / `equippedWeapon` / `weaponDistances` / `weaponUnlockNotified` / `gameCumulativeStats` / `totalCumulativeDistance` / `achievementsProgress` / `bgmSettings` / `soundSettings` / `vibrationSettings` / `miningSoundSettings`
  - ファイル名形式：`meteor-dodge-backup-YYYY-MM-DD.json`
  - 注意：JSONは平文のため内容は編集可能（サーバーレス構成のため改ざん完全防止は不可）
  - 新規 `localStorage` キーを追加した際は `script.js` 内の `BACKUP_KEYS` 配列にも追記すること

---

## v2.6.0 — 2026-04-02

### 機能追加

- **F-10: 難易度選択（EASY / NORMAL / HARD）**
  - タイトル画面のゲームスタートボタン直下にプルダウンメニューを追加
  - 選択した難易度は `startGameDirectly()` 冒頭で読み取り、各パラメーターへ即時反映

  | 難易度 | 隕石出現率 | スコア倍率 | ボスHP係数 |
  |:---:|:---:|:---:|:---:|
  | EASY | ×0.7 | ×0.8 | ×0.7（最低1） |
  | NORMAL | ×1.0 | ×1.0 | ×1.0 |
  | HARD | ×1.4 | ×1.3 | ×1.5 |

- **F-21: 難易度別ボスHP**（F-10と同時実装）
  - `entities.js` の `spawnBoss()` に `bossDifficultyMul` を乗算
  - `Math.max(1, Math.round(...))` で最低HP=1を保証

### UI改善

- **タイトル画面ボタンをアイコン表示に変更**
  - ゲームスタートボタン以外の4ボタン（格納庫・遊び方・設定・実績）をアイコン＋ラベルの小型ボタンに変更し横並び配置
  - アイコン: 📦 格納庫 / ❓ 遊び方 / ⚙️ 設定 / 🏆 実績
  - 既存ボタンID（`storageBtn` / `howToPlayBtn` / `settingsBtn` / `achievementsBtn`）は変更なし

### 実装詳細

- `script.js`: `Game` オブジェクトに `difficulty: "normal"` / `scoreMultiplier: 1.0` / `bossDifficultyMul: 1.0` プロパティを追加
- `script.js`: score再計算3箇所に `* (this.scoreMultiplier || 1)` + `Math.round()` を適用
- `entities.js`: score再計算5箇所に `* (window.Game.scoreMultiplier || 1)` + `Math.round()` を適用
- `style.css`: `.difficulty-row` / `.difficulty-select` / `.icon-buttons` / `.icon-btn` / `.icon-btn-icon` / `.icon-btn-label` を追加（既存クラス変更なし）

### 設計メモ

- `scoreBreakdown` の内訳値は倍率前の生値で保持。スコア倍率は総合スコア（`Game.score`）の最終計算時のみ乗算する
- 統計画面のスコア内訳合計と総合スコアが EASY/HARD では一致しない（仕様）

---

## v2.5.0 — 2026-03-31

### 機能追加（F-25 / F-26）

- **全6武器にLv4/5を追加**：`storage-system.js` の全武器定義を `maxLevel: 3 → 5` に変更
- **Lv4/5価格設計**：既存Lv1〜3の倍率を踏襲（例：連射弾 Lv4=銀×160 / Lv5=銀×320）
- **解放条件**：武器別累積飛行距離（Lv4: 500,000km / Lv5: 1,500,000km）で解放
- **累積距離カウント**：装備中のみ加算。ゲームオーバー時・タイトル戻り時に `localStorage["weaponDistances"]` へ一括保存
- **解放通知**：`UI.showToast()` を新規追加、解放時にトースト表示
- **格納庫UIにロック表示・進捗バー追加**：未解放Lv4/5の強化ボタンに 🔒 と距離バーを表示
- **Lv4/5 弾動作実装**（`entities.js`）：
  - 貫通弾（piercing）: 隕石を貫通して後続にも当たる
  - 爆発弾（explode）: 着弾位置80px以内の隣接隕石にも追加ダメージ（`_applyExplosion`）
  - 分裂照射（splitBeam）: レーザーが中央＋斜め±60pxの計3本に分裂（描画・当たり判定両対応）
  - 連続爆発（doubleBlast）: 発射0.5秒後に追撃チャージ（`doubleBlastPending` フラグで管理）
  - 反射バリア（reflect）: 隕石を破壊せず上方へ反転（`_barrierReflect`）
  - 連鎖ホーミング（chain）: 撃破後に次ターゲットへ速度ベクトルをリセットして転移

### バグ修正（5件）

| # | 修正内容 | 修正ファイル |
|---|---|---|
| B-4 | `saveWeaponDistance` の毎km localStorage書き込み → ゲームオーバー・リセット時一括保存に変更 | `script.js` |
| B-3 | タイトルへ戻る（`Game.reset()`）時にセッション距離が未保存だった | `script.js` |
| B-2 | 反射バリアで反転直後の隕石にプレイヤーが即衝突する問題 → `reflectFrames=10` で10フレーム猶予付与 | `entities.js` |
| E-3 | 反射隕石が `obstacles[]` に残り続けるメモリリーク → `Obstacles.update()` に上方除去チェック追加 | `entities.js` |
| L-2 | 連鎖ホーミングで `hit=false` 再代入後に配列インデックスがズレる問題 → `break` のみに修正 | `entities.js` |

---

## v2.4.2 — 2026-03-30

### バグ修正・機能復元

- **DOM消失の修正（遊び方画面更新の副作用）**
  - 遊び方画面更新時に旧バージョン(v2.4.0)のindex.htmlをベースにしたため、v2.4.1で追加したDOM要素が消失していた
  - `id="titleBestScore"` / `id="titleBestScoreValue"`（タイトル画面ベスト表示）を復元
  - `id="shareBtn"` + 2行ボタンレイアウト（statsScreen）を復元
  - CSS（`.title-best-score` / `.share-btn` / `.stats-new-record` / `.stats-prev-best` / `@keyframes newRecordPulse`）を復元

- **`_handleShare()` の SyntaxError修正（生LF混入）**
  - `const text` 変数内に生の改行コードが埋め込まれていたため `\n` エスケープに修正

- **SNSシェアのURLを本番URLに設定**
  - `SHARE_URL: null` → `"https://men0tai0ko.github.io/meteor-dodge/"`

### バランス調整

- **ワームホール出現頻度の削減**
  - `WORMHOLE_SPAWN_RATE`: `0.001` → `0.0003`（旧比30%）
  - `Wormholes.spawn()` に同時出現数上限を追加（最大1個）
  - 理由：頻発する距離ボーナスでボスが過剰出現していた

### コード品質

- **未使用関数の削除（script.js: 372行削減 / 5,467行 → 5,095行）**
  - `animateScoreUpdate` / `showScoreUpdateEffect`（v2.1.1廃止済み）
  - `showDetailedMiningStats`（呼び出し元なし）
  - `showPreGamePreparation` 関連9関数（v2.4.0廃止済みモーダル）
  - `addDebugEffect` / `debugBulletStats`（デバッグ専用・未使用）

### UX改善

- **「遊び方」画面をv2.4.1仕様に全面更新**
  - 追加セクション: 燃料システム / 採掘システム / ボス隕石 / 格納庫の説明
  - スコア説明の誤記修正:「飛行距離が長いほど高得点」→「飛行距離はスコアに含まれない」

### ドキュメント整備

- `spec.md` を v2.0 → v2.4.1 に全面更新（§11〜19 再構成、廃止仕様に注記追加）
- `handover.md` / `todo.md` / `README.md` を新体制に再構成

---

## v2.4.0 — 2026-03-30

### バグ修正

- **B-34: startGameDirectly の scoreBreakdown.shield_destroy リセット漏れ**
  - `scoreBreakdown` 再定義に `shield_destroy: 0` を追加
  - 前ゲームのシールド破壊スコアが次ゲームに持ち越されていた問題を修正

- **B-35: startGameDirectly のセッション破壊数リセット漏れ**
  - `sessionDestroyedByType` / `sessionBossDestroyed` / `sessionShieldDestroyedByType` を追加
  - 統計画面の種類別破壊数が2ゲーム目以降に累積表示されていた問題を修正

- **スタックオーバーフロー修正**
  - `update()` 内で `isScoreUpdating` フラグ中に `this.gameLoop()` を直接呼んでいた再帰バグを修正
  - 単純な `return` に変更

- **CSS @keyframes 未閉じ括弧修正**
  - `fuelBlink` / `fuelConsumptionFlash` の閉じ括弧欠落により `.equip-btn` 以降のCSSルールが全て無効化されていた
  - 括弧を補完し、以降のCSS全ルールが正常適用されるよう修正

- **CSS 重複セレクタ整理**
  - `style.css` 全体の重複セレクタ20件を整理（マージ・前者削除・意図的な保持の3パターンで対応）
  - `.meteors::after` の閉じ括弧欠落も修正

### 機能追加：機体選択システム（F-22）

- **格納庫「🚀 機体」タブを新設**
- **6種の機体を実装**

  | 機体 | レアリティ | 解放条件 |
  |---|---|---|
  | スタンダード | コモン | 最初から所持 |
  | エクスプローラー | アンコモン | 鉄×500購入 |
  | ファイター | レア | ace_shooter Lv5 |
  | ステルス | エピック | space_traveler Lv7 |
  | クラシック | レジェンド | wormhole_master Lv8 |
  | ネビュラ | シークレット | lucky_miner Lv10 |

- 機体ごとに機体形状・エンジン炎の色・弾の色と形状が変化
- 実績レベル達成で自動解放（タブを開いたときに判定）
- 装備中機体は `localStorage["equippedShip"]` に保存

### 機能追加：バフスロットシステム（F-23）

- **ゲーム開始前モーダルを廃止**し、バフスロット自動適用方式に移行
- **格納庫「✨ バフ」タブを新設**（旧「消耗品」タブを統合・刷新）
- バフスロット3枠（同時装備3種まで）
- 各バフは1プレイにつき1個消費・重ね掛けなし
- 在庫切れのスロットは自動クリア
- バフアイテムをタブ内で直接購入可能（全アイテム maxStack:99 に変更）
- タイトル画面のショップボタンを削除（格納庫に統合）

### 機能追加：新武器3種（F-24）

**⚡ チャージショット**（Epic / 金×3/6/12）／**🛡️ バリア砲**（Epic / 金×3/6/12）／**🎯 ホーミング弾**（Rare / 銀×20/40/80）

### UI改善

- **格納庫画面をスティッキーレイアウトに再設計**
- **資源常時表示バー**を格納庫ヘッダーに追加（資源タブを廃止）
- **ダブルタップ拡大防止**

---

## v2.3.0 — 2026-03-23

### 機能追加：隕石の種類追加（F-13）

- **3種類の隕石**を実装。距離ベースの確定出現方式
  - `normal`（茶色）：常時出現
  - `fast`（赤）：500kmごとに出現。小さく速い。弾破壊+20点
  - `large`（灰色）：1000kmごとに出現。大きく遅い。弾破壊+30点

### 機能追加：ボス隕石（F-14）

- 1500kmごとにボスが出現（canvas幅40%の大型隕石）
- HP：5発（距離が増えるごとに最大10発まで増加）
- HPバー表示・ヒット時白フラッシュ演出

### 機能追加：着脱式装備システム

- 格納庫に装備スロット（同時装備1つ）を追加
- **🔫 連射弾**（Rare・銀20/40/80）／**💥 強化弾**（Epic・金2/4/8）／**🔆 レーザー砲**（Epic・金3/6/12）

### アーキテクチャ（モジュール化 M-1〜M-6）

最終ファイル構成（JSファイル9本）に分割完了

---

## v2.2.0 — 2026-03-22

### 仕様変更

- **飛行距離をスコア計算から除外**（独立指標化）

### UI改善

- ゲーム終了統計画面を3セクション構成に再設計

### バグ修正

- `Particles.createEffect` の TypeError 修正

---

## v2.1.1 — 2026-03-22

### バグ修正

- スコア表示がマイナスになる・下がって見えるバグ修正
  - `animateScoreUpdate` を廃止し `Math.max(0, score)` の直接代入に変更

---

## v2.1.0 — 2026-03-22

### バグ修正

- 所有アイテム使用後にゲームスタートで静止するバグ修正
  - `confirm()` をカスタムモーダル `showItemUseModal()` に置き換え

---

## v2.0.0 — 2026-03-21

### バグ修正

- ポーズ静止バグ（根本解消）
- 格納庫アイテム使用後のゲーム静止バグ修正
- タッチ操作の瞬間移動バグ修正
- リサイズ時の連続エラー修正
- `Player.reset()` 無限ループ防止
- データ整合性チェックの誤検知修正

### パフォーマンス改善

- `console.log` / `console.warn` / `console.info` を全削除

### 機能追加

- 振動強度スライダーを設定画面に追加

---

## v1.9.0 — 2026-03-21

### レイアウト改善（スマホ対応）

- スマホ操作エリアを設置（画面下部15%）
- オブジェクトサイズをcanvas比率に変更
- 弾発射間隔をfps非依存に変更

---

## v1.0.0〜v1.8.0 — 2026-02-28〜2026-03-21

初回実装〜各種UI改善・バグ修正・格納庫/ショップ/実績システム実装
