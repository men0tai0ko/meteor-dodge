# 引き継ぎドキュメント：隕石を回避せよ ワームホールアドベンチャー

**作成日**: 2026-03-31
**対象バージョン**: v2.5.0
**引き継ぎ元**: F-25/F-26実装・バグ修正5件セッション

> **このファイルの役割**: 次の開発セッションを始めるための「今すぐ使える状態の地図」。
> ゲーム仕様の詳細は `spec.md`、変更履歴は `changelog.md`、タスク一覧は `todo.md` を参照。

---

## 1. プロジェクト概要

ブラウザで動作するスマホファーストの宇宙船アクションゲーム。
隕石を避けながら飛行距離を伸ばし、鉱石を採掘してアイテムを購入する。

---

## 2. ファイル構成（v2.5.0）

| ファイル | 層 | 内容 |
|---------|-----|------|
| `index.html` | — | 全画面HTML・script読み込み定義 |
| `style.css` | — | 全スタイル |
| `effects.js` | Infrastructure | DebugLogger + Particles |
| `audio.js` | Infrastructure | SoundManager + BGMSequences + BGMManager |
| `storage-system.js` | Domain | StorageSystem（格納庫・装備・機体・バフスロット・武器定義） |
| `achievements.js` | Domain | Achievements |
| `shop-manager.js` | Domain | ShopManager |
| `powerups.js` | Domain | PowerUps |
| `entities.js` | Domain | Obstacles + Wormholes + Bullets（Lv4/5含む）+ Resources |
| `player.js` | Domain | Player（機体別描画） |
| `script.js` | App + Entry | UI + TitleScreen + Game + main |

> **作業ルール**: `uploads/` は古い可能性あり。作業は必ず `/mnt/user-data/outputs/` から。

---

## 3. 現在の実装状態サマリー

### 格納庫タブ構成

| タブ | 内容 |
|---|---|
| ⚔️ 装備 | 武器スロット＋武器購入・レベルアップ（Lv1〜5）・ロック/進捗バー表示 |
| 🚀 機体 | 機体スロット＋機体購入（実績/鉱石） |
| ✨ バフ | バフスロット3枠＋バフアイテム購入 |

### 武器一覧（v2.5.0 / 全6種・最大Lv5）

| 武器 | アイコン | レアリティ | Lv4効果 | Lv5固有効果 |
|---|---|---|---|---|
| 連射弾 | 🔫 | Rare | 拡散角+15° | 貫通弾化 |
| 強化弾 | 💥 | Epic | 弾速上昇 | 爆発弾（周囲1体追加ダメ） |
| レーザー砲 | 🔆 | Epic | 幅拡大+ダメ+1 | 分裂照射（計3本） |
| チャージショット | ⚡ | Epic | 溜め短縮+ボス6ダメ | 連続爆発（0.5秒追撃） |
| バリア砲 | 🛡️ | Epic | 幅拡大+燃料削減 | 反射バリア |
| ホーミング弾 | 🎯 | Rare | 追尾4発+精度向上 | 連鎖ホーミング |

### 武器解放条件

- Lv4: 当該武器を装備した状態で累積飛行距離 **500,000 km** 到達
- Lv5: 当該武器を装備した状態で累積飛行距離 **1,500,000 km** 到達
- 距離はゲームオーバー時・タイトル戻り時に `localStorage["weaponDistances"]` へ一括保存

### スコア計算（v2.2.0以降・変更なし）

```
スコア = ワームホール(200) + シールド取得(100) + 資源取得(150)
       + 弾による破壊(10〜500) + シールドによる破壊(10〜30)
※ 飛行距離はスコアに含めない（独立指標として表示のみ）
```

---

## 4. 実装メモ（次セッションで参照が必要な技術詳細）

### Lv4/5 固有フラグ（`Bullets` オブジェクト）

| フラグ | 型 | 武器 | 効果 |
|---|---|---|---|
| `piercing` | bool | 連射弾Lv5 | 弾が隕石を貫通して後続にも当たる |
| `spreadExtra` | number | 連射弾Lv4 | 基本拡散角に加算する角度(15°) |
| `splitBeam` | bool | レーザーLv5 | 左右±60pxの斜めビームを追加描画・当たり判定 |
| `doubleBlast` | bool | チャージLv5 | 発射後0.5秒で追撃チャージを自動実行 |
| `doubleBlastPending` | bool | — | 追撃待ち状態フラグ（`Bullets.reset()`でリセット） |
| `reflect` | bool | バリアLv5 | 隕石を破壊せず速度反転（`ob.speed = -(abs+1)`） |
| `chainHoming` | bool | ホーミングLv5 | 撃破後に次ターゲットへ速度ベクトルをリセットして転移 |
| `explode` | bool | 強化弾Lv5 | 着弾後`_applyExplosion()`で80px以内1体に追加ダメ |
| `bulletSpeedBonus` | number | 強化弾Lv4 | `fire()`内で `baseSpeed += bulletSpeedBonus` |

### 反射バリア（reflect）の実装詳細

- `_barrierReflect()` で接触した隕石の `speed` を反転・`reflectFrames = 10` を付与
- `Obstacles.update()` で `reflectFrames > 0` の間は衝突判定をスキップしてカウントダウン
- `speed < 0` かつ `y + height < 0` になった隕石は `update()` 内で除去（メモリリーク防止）
- 既存隕石（`reflectFrames` 未定義）は `undefined > 0 = false` で安全

### 武器別累積距離の保存設計

```
ゲームループ:
  this._sessionWeaponDistance += 1  ← メモリ累積のみ

gameOver():
  StorageSystem.saveWeaponDistance(id, this._sessionWeaponDistance)
  this._sessionWeaponDistance = 0

Game.reset() ← タイトルへ戻る時:
  StorageSystem.saveWeaponDistance(id, this._sessionWeaponDistance)
  this._sessionWeaponDistance = 0

startGameDirectly():
  this._sessionWeaponDistance = 0  ← リセット
```

### 新記録判定の実装

```js
// gameOver() 先頭で確定（非同期保存より前）
const isNewRecord = this.score > 0 && this.score === this.maxScore;
window.UI._isNewRecord   = isNewRecord;
window.UI._prevBestScore = this.maxScore;
```

### localStorage キー一覧（v2.5.0 完全版）

| キー | 内容 |
|---|---|
| `gameCumulativeStats` | 累積プレイデータ（シールド取得数・鉱石数・弾破壊数・maxScoreなど） |
| `gameStorage` | 格納庫データ（鉱石・アイテム・装備） |
| `gamePendingEffects` | 次ゲームに持ち越す効果キュー |
| `achievementsProgress` | 実績の進捗・レベル |
| `totalCumulativeDistance` | 累積飛行距離 |
| `shopData` | ショップのアップグレード状態 |
| `equippedShip` | 装備中機体ID |
| `ownedShips` | 所有機体リスト |
| `buffSlots` | バフスロット設定 |
| `equippedWeapon` | 装備中武器（`{id, level}` 形式） |
| `weaponDistances` | 武器別累積飛行距離（`{weaponId: km}` 形式）← **v2.5.0新規** |
| `weaponUnlockNotified` | 解放通知済みフラグ（`{weaponId_lv4: true}` 形式）← **v2.5.0新規** |
| `bgmSettings` | BGM設定 |
| `soundSettings` | 効果音設定 |
| `vibrationSettings` | 振動強度設定 |
| `miningSoundSettings` | 採掘効果音設定 |

---

## 5. 作業上の注意点

### CSS修正時の必須チェック

```python
style = open('style.css', encoding='utf-8').read()
depth = sum(1 if c=='{' else -1 if c=='}' else 0 for c in style)
print("depth:", depth)  # 必ず 0 であること
```

### 修正完了チェックリスト（Python）

`START_HERE.md` の「作業開始前チェックリスト」を参照。

---

## 6. 参照ドキュメント

| ファイル | 役割 | 参照タイミング |
|---------|------|--------------|
| `spec.md` | ゲーム仕様の詳細（§18のlocalStorageキー一覧はv2.5.0時点で未更新） | 仕様確認・新機能設計時 |
| `changelog.md` | バージョン別変更履歴 | 過去の変更経緯を確認する時 |
| `todo.md` | バグ・機能・タスク一覧（未着手のみ） | 次の作業を選ぶ時 |
