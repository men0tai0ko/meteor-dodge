# 引き継ぎドキュメント：隕石を回避せよ ワームホールアドベンチャー

**作成日**: 2026-03-30  
**対象バージョン**: v2.4.1（SNSシェア・NEW RECORD演出追加）  
**引き継ぎ元**: UI統一・機体選択・バフスロット・新武器・シェア機能実装セッション

> **このファイルの役割**: 次の開発セッションを始めるための「今すぐ使える状態の地図」。
> ゲーム仕様の詳細は `spec.md`、変更履歴は `changelog.md`、タスク一覧は `todo.md` を参照。

---

## 1. プロジェクト概要

ブラウザで動作するスマホファーストの宇宙船アクションゲーム。  
隕石を避けながら飛行距離を伸ばし、鉱石を採掘してアイテムを購入する。

---

## 2. ファイル構成（v2.4.1）

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
| `entities.js` | Domain | Obstacles + Wormholes + Bullets（新武器含む） + Resources |
| `player.js` | Domain | Player（機体別描画） |
| `script.js` | App + Entry | UI + TitleScreen + Game + main |

> **作業ルール**: アップロードされるファイルは古いバージョンの可能性がある。
> 作業は必ず `/mnt/user-data/outputs/` の最新版をベースにすること。

---

## 3. 現在の実装状態サマリー

### 格納庫タブ構成

| タブ | 内容 |
|---|---|
| ⚔️ 装備 | 武器スロット＋武器購入・レベルアップ |
| 🚀 機体 | 機体スロット＋機体購入（実績/鉱石） |
| ✨ バフ | バフスロット3枠＋バフアイテム購入 |

- 資源タブは廃止。鉱石残高は格納庫ヘッダーに常時表示。
- ショップ画面はタイトルから導線を削除（格納庫に統合）。

### 武器一覧（v2.4.0時点・計6種）

| 武器 | アイコン | レアリティ | 特性 |
|---|---|---|---|
| 連射弾 | 🔫 | Rare | 2〜4連射 |
| 強化弾 | 💥 | Epic | ボス高ダメージ |
| レーザー砲 | 🔆 | Epic | 照射型ビーム |
| チャージショット | ⚡ | Epic | 全画面衝撃波 |
| バリア砲 | 🛡️ | Epic | 前方バリア展開 |
| ホーミング弾 | 🎯 | Rare | 自動追尾 |

仕様詳細（Lvごとの数値）は `spec.md § 19` を参照。

### スコア計算（v2.2.0以降）

```
スコア = ワームホール(200) + シールド取得(100) + 資源取得(150)
       + 弾による破壊(10〜500) + シールドによる破壊(10〜30)
※ 飛行距離はスコアに含めない（独立指標として表示のみ）
```

### v2.4.1 追加実装（最新）

- **タイトル画面**: ベストスコア常時表示（`Game.maxScore` を復元して表示）
- **統計画面**: NEW RECORD演出（パルスアニメ）・前回ベスト表示
- **統計画面**: SNSシェアボタン（Web Share API + Twitter fallback）
- **統計画面**: ボタンを2行レイアウトに変更（狭い画面対応）

---

## 4. 実装メモ（次セッションで参照が必要な技術詳細）

### 新武器の状態管理

**チャージショット**
- `Bullets.chargeState`: `"charging"` | `"cooldown"`
- charging → タイマーが chargeMs 超過 → `_releaseCharge()` → cooldown
- cooldown → タイマーが chargeCooldownMs 超過 → charging
- `"ready"` 状態は即 charging に遷移（ゲーム開始時）

**バリア砲**
- `Bullets.barrierState`: `"active"` | `"cooldown"`
- 幅: `canvas.width * (0.25 + (barrierWidthMul - 1.5) * 0.1)`
- 高さ: `canvas.height * 0.10`
- 位置: 機体前方 `pb.height * 0.3` 上にオフセット

**ホーミング弾**
- `Bullets.homingBullets[]` に別管理
- ターゲット優先: ボス > 大型 > 最近傍
- `_findHomingTarget()` 毎フレーム更新

### 装備効果の適用タイミング

`startGameDirectly()` の先頭で毎ゲーム設定:

```js
window.Bullets.chargeLevel = 0;
window.Bullets.barrierLevel = 0;
window.Bullets.homingLevel = 0;
window.Bullets.homingBullets = [];
// StorageSystem.getEquippedWeaponEffect() で効果取得
```

### 新記録判定の実装

```js
// gameOver() 先頭で確定（非同期保存より前）
const isNewRecord = this.score > 0 && this.score === this.maxScore;
window.UI._isNewRecord   = isNewRecord;
window.UI._prevBestScore = this.maxScore;
```

### localStorageキー一覧（主要）

| キー | 内容 |
|---|---|
| `equippedShip` | 装備中機体ID |
| `ownedShips` | 所有機体リスト |
| `buffSlots` | バフスロット設定 |
| その他は `spec.md § 15` を参照 | |

---

## 5. 作業上の注意点

### CSS修正時の必須チェック

```python
style = open('style.css', encoding='utf-8').read()
depth = sum(1 if c=='{' else -1 if c=='}' else 0 for c in style)
print("depth:", depth)  # 必ず 0 であること
```

### ブラウザ確認手順（Edge / file://）

```javascript
// CSS適用確認
const btn = document.querySelector('.equip-btn');
console.log('padding:', getComputedStyle(btn).padding);

// file://ではcssRulesアクセス不可のため注入で確認
const s = document.createElement('style');
s.textContent = '.target { background: red !important; }';
document.head.appendChild(s);
```

### 修正完了チェックリスト（Python）

```python
import re, os

files = ['effects.js','audio.js','storage-system.js','achievements.js',
         'shop-manager.js','powerups.js','entities.js','player.js']

with open('script.js',        encoding='utf-8') as f: js = f.read()
with open('entities.js',      encoding='utf-8') as f: ent = f.read()
with open('storage-system.js',encoding='utf-8') as f: ss = f.read()

style = open('style.css', encoding='utf-8').read()
depth = sum(1 if c=='{' else -1 if c=='}' else 0 for c in style)

checks = [
    ("全分割ファイル存在",          all(os.path.exists(f) for f in files)),
    ("CSS depth==0",                 depth == 0),
    ("_pausedBySettings",            "_pausedBySettings = true" in js),
    ("animateScoreUpdate廃止",       "animateScoreUpdate(gameAreaScore" not in js),
    ("scoreガード",                  "Math.max(0, score)" in js),
    ("startGameDirectly装備適用",    "getEquippedWeaponEffect" in js and "startGameDirectly" in js),
    ("Bullets.chargeLevel",          "chargeLevel" in ent),
    ("Bullets.barrierLevel",         "barrierLevel" in ent),
    ("Bullets.homingLevel",          "homingLevel" in ent),
    ("Obstacles.TYPES",              "TYPES:" in ent),
    ("spawnBoss",                    "spawnBoss(" in ent),
    ("charge_shot定義",              "charge_shot:" in ss),
    ("barrier_cannon定義",           "barrier_cannon:" in ss),
    ("homing_shot定義",              "homing_shot:" in ss),
    ("SHIPS定義",                    "SHIPS:" in ss),
    ("buffSlots定義",                "buffSlots:" in ss),
]
for k, v in checks:
    print(f'{"✅" if v else "❌ 要確認"} {k}')
```

---

## 6. 参照ドキュメント

| ファイル | 役割 | 参照タイミング |
|---------|------|--------------|
| `spec.md` | ゲーム仕様の詳細（システム・数値・画面構成） | 仕様確認・新機能設計時 |
| `changelog.md` | バージョン別変更履歴 | 過去の変更経緯を確認する時 |
| `todo.md` | バグ・機能・タスク一覧（未着手のみ） | 次の作業を選ぶ時 |
