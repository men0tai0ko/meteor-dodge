// ============================================================
// meteorite - 統合JSファイル
// 自動生成: 全17ファイルを統合
// ============================================================


// ============================================================
// storage-system.js
// StorageSystem — 格納庫・アイテム管理
// ============================================================
const StorageSystem = {
        DEBUG_MODE: false,
    equippedWeapon: null,  // { id, level } または null
    equippedShip: "standard",   // 装備中機体ID
    ownedShips: ["standard"],   // 所持済み機体IDリスト

    // バフスロット（3枠）: null or itemId
    buffSlots: [null, null, null],

    // ─────────────────────────────────────────
    // 機体マスタデータ
    // ─────────────────────────────────────────
    SHIPS: {
        standard: {
            id: "standard",
            name: "スタンダード",
            rarity: "common",
            rarityLabel: "コモン",
            description: "初期装備の標準型機体。青い三角形と赤炎が特徴。",
            unlockType: "default",   // 最初から所持
            bulletColor: "#FFFF00",
            bulletShape: "rect",
            engineColor: "#FF4500",
            bodyColor: "#1E90FF",
            bodyHighlight: "#87CEEB",
        },
        explorer: {
            id: "explorer",
            name: "エクスプローラー",
            rarity: "uncommon",
            rarityLabel: "アンコモン",
            description: "採掘に特化した探査型。広い六翼が特徴。",
            unlockType: "purchase",
            unlockPrice: { common: 500, rare: 0, epic: 0 },
            bulletColor: "#00FF88",
            bulletShape: "diamond",
            engineColor: "#97C459",
            bodyColor: "#1D9E75",
            bodyHighlight: "#9FE1CB",
        },
        fighter: {
            id: "fighter",
            name: "ファイター",
            rarity: "rare",
            rarityLabel: "レア",
            description: "戦闘特化の10角形。鋭いシルエットと橙炎が目を引く。",
            unlockType: "achievement",
            unlockAchievement: "ace_shooter",
            unlockLevel: 5,
            unlockHint: "実績「エースシューター」Lv5達成",
            bulletColor: "#FF8800",
            bulletShape: "diamond",
            engineColor: "#FAC775",
            bodyColor: "#D85A30",
            bodyHighlight: "#FAECE7",
        },
        stealth: {
            id: "stealth",
            name: "ステルス",
            rarity: "epic",
            rarityLabel: "エピック",
            description: "紫のダイヤ形機体。コアが光るミステリアスな外観。",
            unlockType: "achievement",
            unlockAchievement: "space_traveler",
            unlockLevel: 7,
            unlockHint: "実績「宇宙の旅人」Lv7達成",
            bulletColor: "#CC88FF",
            bulletShape: "hexagon",
            engineColor: "#AFA9EC",
            bodyColor: "#7F77DD",
            bodyHighlight: "#EEEDFE",
        },
        classic: {
            id: "classic",
            name: "クラシック",
            rarity: "legendary",
            rarityLabel: "レジェンド",
            description: "UFO型の円盤機体。古代宇宙文明をモチーフにした特殊形状。",
            unlockType: "achievement",
            unlockAchievement: "wormhole_master",
            unlockLevel: 8,
            unlockHint: "実績「ワームホールマスター」Lv8達成",
            bulletColor: "#FFD700",
            bulletShape: "star",
            engineColor: "#EF9F27",
            bodyColor: "#BA7517",
            bodyHighlight: "#FAC775",
        },
        nebula: {
            id: "nebula",
            name: "ネビュラ",
            rarity: "secret",
            rarityLabel: "シークレット",
            description: "星型コアを持つピンクの隠し機体。特殊な条件で解放される。",
            unlockType: "achievement",
            unlockAchievement: "lucky_miner",
            unlockLevel: 10,
            unlockHint: "実績「幸運の採掘者」Lv10達成",
            bulletColor: "#FF88CC",
            bulletShape: "star",
            engineColor: "#F4C0D1",
            bodyColor: "#D4537E",
            bodyHighlight: "#FBEAF0",
        },
    },

    // 基本リソース
    resources: {
        common: 0, // 鉄鉱石
        rare: 0, // 銀鉱石
        epic: 0 // 金鉱石
    },

    // 所有アイテム
    items: [],

    // セキュリティ設定
    security: {
        autoLockRare: true, // レア以上を自動ロック
        requirePassword: false, // パスワード要求
        lockNewItems: false // 新規獲得アイテムをロック
    },

    // アイテムマスタデータの定義
    shopItems: {
        upgrades: {
            mining_boost: {
                id: "mining_boost",
                name: "採掘ブースト",
                type: "upgrade",
                rarity: "rare",
                icon: "⛏️",
                description: "次のゲームで採掘確率+10%",
                price: { common: 150, rare: 0, epic: 0 },
                effect: { miningRate: 0.1 },
                usage: "pre_game",
                maxStack: 99
            },
            shield_extension: {
                id: "shield_extension",
                name: "シールド延長",
                type: "upgrade",
                rarity: "rare",
                icon: "🛡️",
                description: "次のゲームでシールド時間+2秒",
                price: { common: 0, rare: 15, epic: 0 },
                effect: { shieldDuration: 2000 },
                usage: "pre_game",
                maxStack: 99
            },
            rapid_fire: {
                id: "rapid_fire",
                name: "連射弾",
                type: "weapon",
                rarity: "rare",
                icon: "🔫",
                description: "同時に複数発射。レベルアップで増加",
                price: { common: 0, rare: 20, epic: 0 },
                levelPrices: [
                    { common: 0, rare: 20, epic: 0 },
                    { common: 0, rare: 40, epic: 0 },
                    { common: 0, rare: 80, epic: 0 }
                ],
                levelEffects: [
                    { burstCount: 2, fireFuelCost: 0.3, desc: "2連射" },
                    { burstCount: 3, fireFuelCost: 0.5, desc: "3連射" },
                    { burstCount: 4, fireFuelCost: 0.8, desc: "4連射" }
                ],
                maxLevel: 3,
                usage: "equip"
            },
            laser_cannon: {
                id: "laser_cannon",
                name: "レーザー砲",
                type: "weapon",
                rarity: "epic",
                icon: "🔆",
                description: "照射中は通常弾なし。CD中に弾を撃つサイクル型",
                price: { common: 0, rare: 0, epic: 3 },
                levelPrices: [
                    { common: 0, rare: 0, epic: 3 },
                    { common: 0, rare: 0, epic: 6 },
                    { common: 0, rare: 0, epic: 12 }
                ],
                levelEffects: [
                    { laserLevel: 1, fireDurationMs: 2000, cooldownMs: 3000, damagePerFrame: 1, laserFuelCost: 2, desc: "細い光線・2秒照射" },
                    { laserLevel: 2, fireDurationMs: 3000, cooldownMs: 2000, damagePerFrame: 2, laserFuelCost: 3, desc: "太いビーム・3秒照射" },
                    { laserLevel: 3, fireDurationMs: 4000, cooldownMs: 2000, damagePerFrame: 3, laserFuelCost: 5, desc: "3本束ビーム・4秒照射" }
                ],
                maxLevel: 3,
                usage: "equip"
            },
            charge_shot: {
                id: "charge_shot",
                name: "チャージショット",
                type: "weapon",
                rarity: "epic",
                icon: "⚡",
                description: "溜め撃ちで全画面衝撃波。全隕石・ボスに一括ダメージ",
                price: { common: 0, rare: 0, epic: 3 },
                levelPrices: [
                    { common: 0, rare: 0, epic: 3 },
                    { common: 0, rare: 0, epic: 6 },
                    { common: 0, rare: 0, epic: 12 }
                ],
                levelEffects: [
                    { chargeMs: 2000, cooldownMs: 4000, damage: 1, bossDamage: 2, fuelCost: 3, desc: "全隕石1ダメ / 溜め2秒 / CD4秒" },
                    { chargeMs: 1500, cooldownMs: 3000, damage: 2, bossDamage: 3, fuelCost: 4, desc: "全隕石2ダメ / 溜め1.5秒 / CD3秒" },
                    { chargeMs: 1000, cooldownMs: 2000, damage: 3, bossDamage: 5, fuelCost: 5, desc: "全隕石3ダメ・ボス5ダメ / 溜め1秒 / CD2秒" }
                ],
                maxLevel: 3,
                usage: "equip"
            },
            barrier_cannon: {
                id: "barrier_cannon",
                name: "バリア砲",
                type: "weapon",
                rarity: "epic",
                icon: "🛡️",
                description: "前方バリアを常時展開。接触した隕石を即破壊",
                price: { common: 0, rare: 0, epic: 3 },
                levelPrices: [
                    { common: 0, rare: 0, epic: 3 },
                    { common: 0, rare: 0, epic: 6 },
                    { common: 0, rare: 0, epic: 12 }
                ],
                levelEffects: [
                    { widthMul: 1.5, heightMul: 0.6, fireMs: 3000, cooldownMs: 5000, fuelPerSec: 1.5, desc: "幅1.5倍 / 展開3秒 / CD5秒" },
                    { widthMul: 2.0, heightMul: 0.8, fireMs: 4000, cooldownMs: 4000, fuelPerSec: 2.0, desc: "幅2.0倍 / 展開4秒 / CD4秒" },
                    { widthMul: 2.5, heightMul: 1.0, fireMs: 5000, cooldownMs: 3000, fuelPerSec: 2.5, desc: "幅2.5倍 / 展開5秒 / CD3秒" }
                ],
                maxLevel: 3,
                usage: "equip"
            },
            homing_shot: {
                id: "homing_shot",
                name: "ホーミング弾",
                type: "weapon",
                rarity: "rare",
                icon: "🎯",
                description: "ボス・大型優先で自動追尾。外れにくい安定火力",
                price: { common: 0, rare: 20, epic: 0 },
                levelPrices: [
                    { common: 0, rare: 20, epic: 0 },
                    { common: 0, rare: 40, epic: 0 },
                    { common: 0, rare: 80, epic: 0 }
                ],
                levelEffects: [
                    { homingCount: 1, intervalMs: 1500, angleRange: 30, fuelCost: 0, desc: "追尾1発 / 1.5秒間隔" },
                    { homingCount: 2, intervalMs: 1500, angleRange: 45, fuelCost: 0, desc: "追尾2発 / 1.5秒間隔" },
                    { homingCount: 3, intervalMs: 1200, angleRange: 60, fuelCost: 0.2, desc: "追尾3発 / 1.2秒間隔" }
                ],
                maxLevel: 3,
                usage: "equip"
            },
            piercing_shot: {
                id: "piercing_shot",
                name: "強化弾",
                type: "weapon",
                rarity: "epic",
                icon: "💥",
                description: "ボスへのダメージ増加。レベルアップで強化",
                price: { common: 0, rare: 0, epic: 2 },
                levelPrices: [
                    { common: 0, rare: 0, epic: 2 },
                    { common: 0, rare: 0, epic: 4 },
                    { common: 0, rare: 0, epic: 8 }
                ],
                levelEffects: [
                    { bossDamage: 2, fireFuelCost: 0.2, desc: "ボスに2ダメージ/発" },
                    { bossDamage: 3, fireFuelCost: 0.4, desc: "ボスに3ダメージ/発" },
                    { bossDamage: 5, fireFuelCost: 0.7, desc: "ボスに5ダメージ/発" }
                ],
                maxLevel: 3,
                usage: "equip"
            }
        },
        consumables: {
            extra_life: {
                id: "extra_life",
                name: "追加ライフ",
                type: "consumable",
                rarity: "epic",
                icon: "💖",
                description: "次のゲームをライフ+1で開始",
                price: { common: 0, rare: 0, epic: 1 },
                effect: { startingLives: 1 },
                usage: "pre_game",
                maxStack: 99
            },
            instant_shield: {
                id: "instant_shield",
                name: "即時シールド",
                type: "consumable",
                rarity: "rare",
                icon: "⚡",
                description: "次のゲーム開始時シールド発動",
                price: { common: 0, rare: 10, epic: 0 },
                effect: { startingShield: true },
                usage: "pre_game",
                maxStack: 99
            }
        }
    },

    // デバッグログ用のユーティリティメソッド
    debugLog(message, data = null) {
        if (this.DEBUG_MODE) {
            if (data) {
            } else {
            }
        }
    },

    debugWarn(message, data = null) {
        if (this.DEBUG_MODE) {
            if (data) {
            } else {
            }
        }
    },

    // 重大なエラー（常に表示）
    criticalError(message, error = null) {
        if (error) {
            console.error(`❌ ${message}:`, error);
        } else {
            console.error(`❌ ${message}`);
        }
    },

    // デバッグ用エラー（DEBUG_MODE時のみ）
    debugError(message, error = null) {
        if (this.DEBUG_MODE) {
            if (error) {
                console.error(`🐛 ${message}:`, error);
            } else {
                console.error(`🐛 ${message}`);
            }
        }
    },

    // 新しいメソッド追加
    // 装備アイテムの購入 or レベルアップ
    purchaseWeapon(itemId) {
        const weapon = this.shopItems.upgrades[itemId];
        if (!weapon || weapon.usage !== "equip") return { success: false, reason: "不明なアイテム" };

        const owned = this.items.find(i => i.id === itemId);
        const currentLevel = owned ? (owned.level || 1) : 0;

        if (currentLevel >= weapon.maxLevel) return { success: false, reason: "最大レベル到達済み" };

        const price = weapon.levelPrices[currentLevel];

        if (this.resources.common < (price.common || 0) ||
            this.resources.rare   < (price.rare   || 0) ||
            this.resources.epic   < (price.epic   || 0)) {
            return { success: false, reason: "素材不足" };
        }

        // 素材消費
        this.resources.common -= (price.common || 0);
        this.resources.rare   -= (price.rare   || 0);
        this.resources.epic   -= (price.epic   || 0);

        const newLevel = currentLevel + 1;
        if (owned) {
            owned.level = newLevel;
        } else {
            this.items.push({
                id: itemId,
                name: weapon.name,
                icon: weapon.icon,
                level: newLevel,
                quantity: 1,
                usage: "equip",   // クリーンアップで除去されないよう明示
                rarity: weapon.rarity
            });
        }

        // 装備中なら装備レベルも更新
        if (this.equippedWeapon && this.equippedWeapon.id === itemId) {
            this.equippedWeapon.level = newLevel;
            this.saveEquippedWeapon();
        }

        this.saveStorage();
        return { success: true, newLevel };
    },

    // 装備を付ける
    equipWeapon(itemId) {
        const weapon = this.shopItems.upgrades[itemId];
        if (!weapon || weapon.usage !== "equip") return false;
        const owned = this.items.find(i => i.id === itemId);
        if (!owned) return false;
        this.equippedWeapon = { id: itemId, level: owned.level || 1 };
        this.saveEquippedWeapon();
        return true;
    },

    // 装備を外す
    unequipWeapon() {
        this.equippedWeapon = null;
        this.saveEquippedWeapon();
    },

    // 装備情報を保存
    saveEquippedWeapon() {
        try {
            localStorage.setItem("equippedWeapon", JSON.stringify(this.equippedWeapon));
        } catch(e) {}
    },

    // 装備情報をロード
    loadEquippedWeapon() {
        try {
            const data = localStorage.getItem("equippedWeapon");
            this.equippedWeapon = data ? JSON.parse(data) : null;
        } catch(e) {
            this.equippedWeapon = null;
        }
    },

    // 装備中武器の効果を取得
    getEquippedWeaponEffect() {
        if (!this.equippedWeapon) return null;
        const weapon = this.shopItems.upgrades[this.equippedWeapon.id];
        if (!weapon) return null;
        const lv = Math.min(this.equippedWeapon.level, weapon.maxLevel) - 1;
        const base = weapon.levelEffects[lv];
        // 武器種別にレベル情報を付加
        const extra = {};
        if (weapon.id === "charge_shot")   extra.chargeLevel  = lv + 1;
        if (weapon.id === "barrier_cannon") extra.barrierLevel = lv + 1;
        if (weapon.id === "homing_shot")   extra.homingLevel  = lv + 1;
        // bossDamage2 はチャージショットのボスダメージ（bossDamageと名前衝突回避）
        if (weapon.id === "charge_shot")   extra.bossDamage2  = base.bossDamage;
        return { id: this.equippedWeapon.id, ...base, ...extra };
    },

    getAllShopItems() {
        const allItems = {};

        this.debugLog("🛒 ショップアイテム一覧を構築:");

        // アップグレードアイテムを追加
        Object.keys(this.shopItems.upgrades).forEach((key) => {
            const item = this.shopItems.upgrades[key];
            allItems[item.id] = item;
            this.debugLog(`  📦 アップグレード: ${item.name} (${item.id})`);
        });

        // 消費アイテムを追加
        Object.keys(this.shopItems.consumables).forEach((key) => {
            const item = this.shopItems.consumables[key];
            allItems[item.id] = item;
            this.debugLog(`  📦 消費アイテム: ${item.name} (${item.id})`);
        });

        this.debugLog(`✅ 合計 ${Object.keys(allItems).length} 個のアイテムを読み込み`);
        return allItems;
    },

    getShopItem(itemId) {
        const allItems = this.getAllShopItems();
        const item = allItems[itemId];

        if (!item) {
            this.debugError(`❌ ショップアイテムが見つかりません: ${itemId}`);
            this.debugLog(`🔍 利用可能なアイテム:`, Object.keys(allItems));
        } else {
            this.debugLog(`✅ ショップアイテム取得: ${item.name} (${itemId})`);
        }

        return item;
    },

    // アイテム追加メソッド（拡張）
    addShopItem(itemId) {
        const shopItem = this.getShopItem(itemId);
        if (!shopItem) {
            console.error(`❌ ショップアイテムが見つかりません: ${itemId}`);
            return false;
        }
        // weapon は purchaseWeapon で管理するためここでは弾く
        if (shopItem.usage === "equip") {
            console.error(`❌ weapon タイプは purchaseWeapon を使用してください: ${itemId}`);
            return false;
        }

        const newItem = {
            id: shopItem.id,
            name: shopItem.name,
            type: shopItem.type,
            rarity: shopItem.rarity,
            icon: shopItem.icon,
            description: shopItem.description,
            effect: shopItem.effect,
            usage: shopItem.usage,
            quantity: 1,
            acquiredAt: Date.now(),
            locked: false
        };

        // 既存アイテムチェック（スタック可能な場合）
        const existingItem = this.items.find((item) => item.id === itemId);
        if (existingItem && shopItem.maxStack) {
            if (existingItem.quantity >= shopItem.maxStack) {
                return false;
            }
            existingItem.quantity++;
        } else {
            this.items.push(newItem);
        }

        this.saveStorage();
        return true;
    },

    // 初期化
    init() {
        this.loadStorage();
        this.loadEquippedWeapon();

        // 後方互換: level があるが usage/name/icon がない weapon エントリを修復
        const weaponIds = Object.keys(this.shopItems.upgrades);
        this.items = this.items.map(item => {
            if (item && weaponIds.includes(item.id) && !item.usage) {
                const w = this.shopItems.upgrades[item.id];
                return { ...item, usage: "equip", name: w.name, icon: w.icon, rarity: w.rarity };
            }
            return item;
        });

        // 不正なアイテムをクリーンアップ
        this.items = this.items.filter(item => {
            if (!item || item.id === undefined) return false;
            // 装備アイテムは name/icon チェックをスキップ（消耗品は必須）
            if (item.usage === "equip") return true;
            return item.name !== undefined && item.icon !== undefined;
        });

        this.debugLog("📦 初期化 - 格納庫状態:", this.resources);

        // Gameオブジェクトがある場合は単純に同期
        if (window.Game && typeof window.Game === "object") {
            this.syncWithGameData(); // 🔥 常に格納庫→ゲームの同期
        }

        this.setupEventListeners();
        this.debugLog("✅ 格納庫システム初期化完了");
    },

    // アイテム追加
    addItem(itemData) {
        const newItem = {
            id: itemData.id || "item_" + Date.now(),
            name: itemData.name,
            type: itemData.type || "misc",
            rarity: itemData.rarity || "common",
            quantity: itemData.quantity || 1,
            locked: itemData.locked !== undefined ? itemData.locked : this.shouldAutoLock(itemData.rarity),
            icon: itemData.icon || "📦",
            acquiredAt: Date.now(),
            description: itemData.description || ""
        };

        this.items.push(newItem);
        this.saveStorage();

        // UI更新
        if (this.isStorageScreenOpen()) {
            this.renderItems();
        }

        return newItem;
    },

    // リソース追加
    addResource(type, amount) {
        if (this.resources[type] !== undefined) {
            this.resources[type] += amount;

            // ▼▼▼ Gameのデータとも同期 ▼▼▼
            this.syncWithGameData();
            // ▲▲▲ 追加終了 ▲▲▲

            this.saveStorage();

            // 獲得履歴を記録
            this.recordAcquisition("mining", amount, type);

            // UI更新
            if (this.isStorageScreenOpen()) {
                this.updateResourceDisplay();
                this.animateResourceIncrease(type, amount);
            }

            this.debugLog(`📦 ${type}を${amount}個追加: 合計${this.resources[type]}個`);
            return true;
        }
        return false;
    },

    // Gameデータと同期するメソッドを追加
    syncWithGameData() {
        // Gameオブジェクトの存在確認を強化
        if (
            window.Game &&
            typeof window.Game === "object" &&
            window.Game.totalCommonOres !== undefined &&
            window.Game.totalRareOres !== undefined &&
            window.Game.totalEpicOres !== undefined
        ) {
            // 格納庫 → Game への同期
            window.Game.totalCommonOres = this.resources.common;
            window.Game.totalRareOres = this.resources.rare;
            window.Game.totalEpicOres = this.resources.epic;
            window.Game.totalOres = this.resources.common + this.resources.rare + this.resources.epic;

            this.debugLog("🔄 ゲームデータと格納庫を同期:", this.resources);
        } else {
            this.debugWarn("⚠️ Gameオブジェクトが利用できないため、同期をスキップします", {
                GameExists: !!window.Game,
                GameType: typeof window.Game,
                totalCommonOres: window.Game ? Game.totalCommonOres : "N/A"
            });
        }
    },

    // ゲームデータから読み込むメソッドを追加
    loadFromGameData() {
        // Gameオブジェクトの存在確認
        if (window.Game && typeof window.Game === "object") {

            // 🔥 重要: 格納庫データが0で、ゲームデータが0より大きい場合のみ読み込み
            const storageTotal = this.resources.common + this.resources.rare + this.resources.epic;
            const gameTotal = (Game.totalCommonOres || 0) + (Game.totalRareOres || 0) + (Game.totalEpicOres || 0);

            if (storageTotal === 0 && gameTotal > 0) {
                // 格納庫が空でゲームにデータがある場合のみ読み込み
                this.resources.common = window.Game.totalCommonOres || 0;
                this.resources.rare = window.Game.totalRareOres || 0;
                this.resources.epic = window.Game.totalEpicOres || 0;
                return true;
            } else {
                // それ以外は格納庫データを維持
                return false;
            }
        }
        return false;
    },

    // リソース増加アニメーション
    animateResourceIncrease(resourceType, amount) {
        const resourceElement = document.getElementById(resourceType + "Ores");
        if (resourceElement) {
            resourceElement.classList.add("resource-increasing");
            setTimeout(() => {
                resourceElement.classList.remove("resource-increasing");
            }, 600);
        }
    },

    // 獲得履歴を記録
    recordAcquisition(source, amount, itemType) {
        const historyEntry = {
            source: source,
            amount: amount,
            itemType: itemType,
            timestamp: Date.now()
        };

        // 簡易的な履歴管理（必要に応じて拡張）
        if (!this.acquisitionHistory) {
            this.acquisitionHistory = [];
        }

        this.acquisitionHistory.push(historyEntry);

        // 最新20件のみ保持
        if (this.acquisitionHistory.length > 20) {
            this.acquisitionHistory = this.acquisitionHistory.slice(-20);
        }
    },

    // 採掘統計の取得
    getMiningStats() {
        const miningHistory = this.acquisitionHistory?.filter((entry) => entry.source === "mining") || [];
        const totalMined = miningHistory.reduce((sum, entry) => sum + entry.amount, 0);

        return {
            totalMiningSessions: miningHistory.length,
            totalResourcesMined: totalMined,
            averagePerSession: miningHistory.length > 0 ? totalMined / miningHistory.length : 0,
            lastMined: miningHistory.length > 0 ? miningHistory[miningHistory.length - 1] : null
        };
    },

    // 自動ロック判定
    shouldAutoLock(rarity) {
        if (!this.security.autoLockRare) return false;
        return rarity === "epic" || rarity === "legendary";
    },

    // アイテムロック切り替え
    toggleItemLock(itemId) {
        const item = this.items.find((i) => i.id === itemId);
        if (item) {
            item.locked = !item.locked;
            this.saveStorage();

            // UI更新
            if (this.isStorageScreenOpen()) {
                this.renderItems();
            }

            return item.locked;
        }
        return false;
    },

    // ロック済みアイテムの一括解除
    unlockAllItems() {
        let unlockedCount = 0;
        this.items.forEach((item) => {
            if (item.locked) {
                item.locked = false;
                unlockedCount++;
            }
        });

        this.saveStorage();

        // UI更新
        if (this.isStorageScreenOpen()) {
            this.renderItems();
        }

        return unlockedCount;
    },

    // レア以上アイテムをロック
    lockRareItems() {
        let lockedCount = 0;
        this.items.forEach((item) => {
            if ((item.rarity === "rare" || item.rarity === "epic" || item.rarity === "legendary") && !item.locked) {
                item.locked = true;
                lockedCount++;
            }
        });

        this.saveStorage();

        // UI更新
        if (this.isStorageScreenOpen()) {
            this.renderItems();
        }

        return lockedCount;
    },

    // アイテム使用（ロックチェック付き）
    useItem(itemId) {
        this.debugLog(`🎯 アイテム使用試行: ${itemId}`);

        // ショップアイテムかどうかを判定
        const shopItem = this.getShopItem(itemId);
        if (shopItem) {
            return this.useShopItem(itemId);
        }

        // 通常アイテムの処理（既存のロジック）
        const item = this.items.find((i) => i.id === itemId);
        if (!item) {
            return false;
        }

        if (item.locked) {
            this.showLockedWarning(item);
            return false;
        }


        if (item.quantity > 1) {
            item.quantity--;
        } else {
            this.items = this.items.filter((i) => i.id !== itemId);
        }

        this.saveStorage();

        // UI更新
        if (this.isStorageScreenOpen()) {
            this.renderItems();
        }

        return true;
    },

    // ロック警告表示
    showLockedWarning(item) {

        // UI通知
        if (window.showNotification) {
            window.showNotification(`🔒 ${item.name}はロックされています`, "warning");
        }

        // 効果音
        if (window.SoundManager && window.SoundManager.play) {
            window.SoundManager.play("error");
        }
    },

    // イベントリスナー設定
    setupEventListeners() {
        // セキュリティ設定の変更
        document.addEventListener("change", (e) => {
            if (e.target.id === "autoLockRare") {
                this.security.autoLockRare = e.target.checked;
                this.saveStorage();
            } else if (e.target.id === "lockNewItems") {
                this.security.lockNewItems = e.target.checked;
                this.saveStorage();
            }
        });

        // 一括操作ボタン
        document.addEventListener("click", (e) => {
            if (e.target.id === "unlockAllBtn") {
                this.unlockAllItems();
            } else if (e.target.id === "lockRareBtn") {
                this.lockRareItems();
            }
        });
    },

    // 格納庫画面が開いているかチェック
    isStorageScreenOpen() {
        return document.getElementById("storageScreen")?.classList.contains("active");
    },

    // UIレンダリング
    renderItems() {
        const grid = document.getElementById("itemsGrid");
        if (!grid) return;

        grid.innerHTML = "";

        // weapon タイプは装備タブで管理するため消耗品タブから除外
        this.items.filter(item => item.usage !== "equip").forEach((item) => {
            const tile = document.createElement("div");
            tile.className = `storage-tile item-tile item-rarity-${item.rarity} ${item.locked ? "item-locked" : ""}`;
            tile.innerHTML = `
            ${item.locked ? '<div class="lock-indicator">🔒</div>' : ""}
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            ${item.quantity > 1 ? `<div class="item-quantity">${item.quantity}</div>` : ""}
            ${item.locked ? '<div class="locked-overlay"></div>' : ""}
        `;

            // ロックされていない場合のみクリックで使用可能
            if (!item.locked) {
                tile.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.debugLog(`🖱️ タイルクリック: ${item.id}`);

                    // Gameオブジェクトの可用性を確認
                    if (!window.Game || typeof window.Game !== "object") {
                        console.error("❌ 使用ボタン: Gameオブジェクトが利用できません");
                        if (window.showNotification) {
                            window.showNotification("ゲームが準備できていません", "error");
                        }
                        return;
                    }

                    this.useItem(item.id);
                });
            }

            // 右クリックでコンテキストメニュー（ロック/ロック解除）
            tile.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                this.showContextMenu(e, item);
            });

            grid.appendChild(tile);
        });

        // 空きスロットの処理（既存のまま）
        const emptySlots = Math.max(0, 10 - this.items.length);
        for (let i = 0; i < emptySlots; i++) {
            const emptyTile = document.createElement("div");
            emptyTile.className = "storage-tile empty-tile";
            emptyTile.innerHTML = '<div class="empty-label">空き</div>';
            grid.appendChild(emptyTile);
        }
    },

    // リソース表示更新
    updateResourceDisplay() {
        // 旧資源タブの要素（残存している場合）
        const commonOres = document.getElementById("commonOres");
        const rareOres   = document.getElementById("rareOres");
        const epicOres   = document.getElementById("epicOres");
        if (commonOres) commonOres.textContent = this.resources.common;
        if (rareOres)   rareOres.textContent   = this.resources.rare;
        if (epicOres)   epicOres.textContent   = this.resources.epic;

        // 格納庫常時表示バー
        const barCommon = document.getElementById("resBarCommon");
        const barRare   = document.getElementById("resBarRare");
        const barEpic   = document.getElementById("resBarEpic");
        if (barCommon) barCommon.textContent = this.resources.common;
        if (barRare)   barRare.textContent   = this.resources.rare;
        if (barEpic)   barEpic.textContent   = this.resources.epic;

        // ショップ残高（ショップ画面が残っている場合）
        const balCommon = document.getElementById("balanceCommon");
        const balRare   = document.getElementById("balanceRare");
        const balEpic   = document.getElementById("balanceEpic");
        if (balCommon) balCommon.textContent = this.resources.common;
        if (balRare)   balRare.textContent   = this.resources.rare;
        if (balEpic)   balEpic.textContent   = this.resources.epic;
    },

    // コンテキストメニュー表示
    showContextMenu(event, item) {
        // 既存のメニューを削除
        const existingMenu = document.querySelector(".tile-context-menu");
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement("div");
        menu.className = "tile-context-menu";
        menu.style.left = event.pageX + "px";
        menu.style.top = event.pageY + "px";

        // 使用可能な場合のみ使用ボタンを表示 - 修正版
        const useButton = !item.locked
            ? `
            <div class="context-menu-item use-action" onclick="StorageSystem.useItem('${item.id}')">
                <span>🎯</span>使用する
            </div>
        `
            : "";

        menu.innerHTML = `
        ${useButton}
        <div class="context-menu-item lock-action" onclick="StorageSystem.toggleItemLock('${item.id}')">
            <span>${item.locked ? "🔓" : "🔒"}</span>
            ${item.locked ? "ロック解除" : "ロックする"}
        </div>
        <div class="context-menu-item" onclick="StorageSystem.showItemDetails('${item.id}')">
            <span>📋</span>詳細表示
        </div>
    `;

        document.body.appendChild(menu);

        // メニュー外クリックで閉じる
        setTimeout(() => {
            const closeMenu = () => {
                menu.remove();
                document.removeEventListener("click", closeMenu);
            };
            document.addEventListener("click", closeMenu);
        }, 100);
    },

    // アイテム詳細表示
    showItemDetails(itemId) {
        const item = this.items.find((i) => i.id === itemId);
        if (!item) return;

        const detailHtml = `
            <div class="item-detail-modal">
                <h3>${item.icon} ${item.name}</h3>
                <p>レアリティ: ${item.rarity}</p>
                <p>種類: ${item.type}</p>
                <p>数量: ${item.quantity}</p>
                <p>状態: ${item.locked ? "🔒 ロック中" : "🔓 未ロック"}</p>
                ${item.description ? `<p>説明: ${item.description}</p>` : ""}
            </div>
        `;

        // モーダル表示の実装（既存のUIシステムを使用）
        if (window.showModal) {
            window.showModal(detailHtml);
        } else {
        }
    },

    // 格納庫画面を開いた時の処理
    // ─────────────────────────────────────────
    // 機体管理メソッド
    // ─────────────────────────────────────────

    // 機体タブを開いたときに呼ぶ：実績解放チェック＋UI描画
    // ─────────────────────────────────────────
    // バフスロット管理
    // ─────────────────────────────────────────

    // バフマスタ（pre_game アイテムの定義）
    get BUFF_ITEMS() {
        return Object.values(this.shopItems.upgrades)
            .concat(Object.values(this.shopItems.consumables || {}))
            .filter(item => item.usage === "pre_game");
    },

    // バフタブを開いたとき
    onBuffTabOpen() {
        this.renderBuffTab();
    },

    // スロットにバフをセット（同じアイテムは1スロットのみ）
    setBuffSlot(slotIndex, itemId) {
        if (slotIndex < 0 || slotIndex > 2) return false;
        // 同一アイテムが他スロットにある場合は外す
        this.buffSlots = this.buffSlots.map((s, i) =>
            i !== slotIndex && s === itemId ? null : s
        );
        this.buffSlots[slotIndex] = itemId;
        this.saveStorage();
        return true;
    },

    // スロットからバフを外す
    clearBuffSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex > 2) return;
        this.buffSlots[slotIndex] = null;
        this.saveStorage();
    },

    // 在庫切れのスロットを自動クリア
    cleanBuffSlots() {
        let changed = false;
        this.buffSlots = this.buffSlots.map(itemId => {
            if (!itemId) return null;
            const owned = this.items.find(i => i.id === itemId);
            if (!owned || (owned.quantity || 0) <= 0) {
                changed = true;
                return null;
            }
            return itemId;
        });
        if (changed) this.saveStorage();
    },

    // ゲーム開始時：バフスロットの効果を適用して消費
    applyBuffSlots() {
        this.cleanBuffSlots();
        const applied = [];
        this.buffSlots.forEach(itemId => {
            if (!itemId) return;
            const owned = this.items.find(i => i.id === itemId);
            if (!owned || (owned.quantity || 0) <= 0) return;
            const def = this.getShopItem(itemId);
            if (!def) return;
            // 消費
            owned.quantity -= 1;
            applied.push({ itemId, effect: def.effect, name: def.name, icon: def.icon });
        });
        this.cleanBuffSlots();
        this.saveStorage();
        return applied;
    },

    // バフアイテムを格納庫から直接購入
    purchaseBuffItem(itemId) {
        const item = this.getShopItem(itemId);
        if (!item || item.usage !== "pre_game") return { success: false, reason: "購入不可のアイテムです" };
        const price = item.price;
        if (this.resources.common < (price.common || 0) ||
            this.resources.rare   < (price.rare   || 0) ||
            this.resources.epic   < (price.epic   || 0)) {
            return { success: false, reason: "鉱石が不足しています" };
        }
        this.resources.common -= (price.common || 0);
        this.resources.rare   -= (price.rare   || 0);
        this.resources.epic   -= (price.epic   || 0);
        this.addShopItem(itemId);
        this.saveStorage();
        return { success: true };
    },

    // バフタブのHTML描画
    renderBuffTab() {
        const container = document.getElementById("tab-buffs");
        if (!container) return;

        this.cleanBuffSlots();

        const buffItems = this.BUFF_ITEMS;
        const slotHTML = this.buffSlots.map((itemId, i) => {
            const def    = itemId ? this.getShopItem(itemId) : null;
            const owned  = itemId ? this.items.find(it => it.id === itemId) : null;
            const qty    = owned ? (owned.quantity || 0) : 0;
            const filled = def && qty > 0;
            return `
            <div class="buff-slot ${filled ? "filled" : "empty"}" data-slot="${i}">
                <div class="buff-slot-label">スロット ${i + 1}</div>
                ${filled ? `
                    <div class="buff-slot-icon">${def.icon}</div>
                    <div class="buff-slot-name">${def.name}</div>
                    <div class="buff-slot-qty">残り ${qty}個</div>
                    <button class="equip-btn equip-btn-remove buff-remove-btn" data-slot="${i}" style="touch-action:manipulation;">外す</button>
                ` : `
                    <div class="buff-slot-empty-icon">＋</div>
                    <div class="buff-slot-empty-text">未セット</div>
                `}
            </div>`;
        }).join("");

        const itemsHTML = buffItems.map(item => {
            const owned    = this.items.find(i => i.id === item.id);
            const qty      = owned ? (owned.quantity || 0) : 0;
            const inSlot   = this.buffSlots.includes(item.id);
            const price    = item.price;
            const canAfford = this.resources.common >= (price.common || 0) &&
                              this.resources.rare   >= (price.rare   || 0) &&
                              this.resources.epic   >= (price.epic   || 0);
            const priceHTML = (price.common ? `<span class="equip-price-item">⚙️${price.common}</span>` : "") +
                              (price.rare   ? `<span class="equip-price-item">🔗${price.rare}</span>`   : "") +
                              (price.epic   ? `<span class="equip-price-item">💎${price.epic}</span>`   : "");
            const rarityColor = item.rarity === "epic" ? "#EF9F27" : item.rarity === "rare" ? "#378ADD" : "#aaa";

            return `
            <div class="equip-item-card ${inSlot ? "equip-active" : ""}" style="border-color:${inSlot ? "rgba(0,255,180,0.5)" : "rgba(60,120,180,0.35)"};">
                <div class="equip-card-name-row">
                    <span class="equip-card-icon">${item.icon}</span>
                    <span class="equip-card-name">${item.name}</span>
                    <span class="equip-card-level" style="color:${rarityColor};border-color:${rarityColor};">${item.rarity === "epic" ? "エピック" : item.rarity === "rare" ? "レア" : "ノーマル"}</span>
                </div>
                <div class="equip-card-desc">${item.description}</div>
                <div class="equip-card-price-row">${priceHTML}</div>
                <div class="buff-item-qty equip-card-desc">所持: <strong>${qty}個</strong></div>
                <div class="equip-card-btns">
                    ${inSlot
                        ? `<button class="equip-btn equip-btn-remove buff-unset-btn" data-item-id="${item.id}" style="touch-action:manipulation;">スロットから外す</button>`
                        : `<button class="equip-btn equip-btn-equip buff-set-btn" data-item-id="${item.id}" ${qty <= 0 ? "disabled" : ""} style="touch-action:manipulation;">${qty > 0 ? "スロットにセット" : "未所持"}</button>`
                    }
                    <button class="equip-btn equip-btn-buy buff-buy-btn ${canAfford ? "" : "disabled"}" data-item-id="${item.id}" ${canAfford ? "" : "disabled"} style="touch-action:manipulation;">${canAfford ? "購入する" : "鉱石不足"}</button>
                </div>
            </div>`;
        }).join("");

        container.innerHTML = `
            <div class="category-header category-equipment" style="margin-bottom:14px;">
                <div class="category-icon">✨</div>
                <div class="category-title">バフスロット</div>
            </div>
            <div class="buff-slots-grid">${slotHTML}</div>
            <div class="equip-list-label" style="margin-top:18px;">▸ バフアイテム</div>
            <div class="equip-cards-grid">${itemsHTML}</div>
        `;

        // イベント登録
        container.querySelectorAll(".buff-remove-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const slot = parseInt(btn.dataset.slot);
                this.clearBuffSlot(slot);
                this.renderBuffTab();
            });
        });
        container.querySelectorAll(".buff-set-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                // 空きスロットを探してセット
                const itemId = btn.dataset.itemId;
                const emptySlot = this.buffSlots.indexOf(null);
                if (emptySlot === -1) {
                    btn.textContent = "スロット満杯";
                    setTimeout(() => this.renderBuffTab(), 1200);
                    return;
                }
                this.setBuffSlot(emptySlot, itemId);
                this.renderBuffTab();
            });
        });
        container.querySelectorAll(".buff-unset-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const itemId = btn.dataset.itemId;
                const slotIdx = this.buffSlots.indexOf(itemId);
                if (slotIdx !== -1) this.clearBuffSlot(slotIdx);
                this.renderBuffTab();
            });
        });
        container.querySelectorAll(".buff-buy-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const itemId = btn.dataset.itemId;
                const result = this.purchaseBuffItem(itemId);
                if (!result.success) {
                    btn.textContent = result.reason;
                    setTimeout(() => this.renderBuffTab(), 1200);
                    return;
                }
                this.renderBuffTab();
                if (this.updateResourceDisplay) this.updateResourceDisplay();
            });
        });
    },


    onShipTabOpen() {
        this.checkShipUnlocks();
        this.renderShipTab();
    },

    // 実績条件を満たしていれば自動解放
    checkShipUnlocks() {
        if (!window.Achievements) return;
        const changed = [];
        Object.values(this.SHIPS).forEach(ship => {
            if (ship.unlockType !== "achievement") return;
            if (this.ownedShips.includes(ship.id)) return;
            const level = window.Achievements.unlockedLevels.get(ship.unlockAchievement) || 0;
            if (level >= ship.unlockLevel) {
                this.ownedShips.push(ship.id);
                changed.push(ship);
            }
        });
        if (changed.length > 0) {
            this.saveStorage();
            changed.forEach(ship => {
                if (window.UI && window.UI.showFloatingText) {
                    // 通知はゲーム外なので showNotification を使う
                }
                // 簡易通知
                const notif = document.createElement("div");
                notif.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,20,40,0.95);border:1px solid rgba(0,200,255,0.5);color:#00cfff;padding:10px 18px;border-radius:10px;font-size:14px;z-index:99999;pointer-events:none;";
                notif.textContent = "🚀 新機体「" + ship.name + "」を解放しました！";
                document.body.appendChild(notif);
                setTimeout(() => notif.remove(), 3000);
            });
        }
    },

    // 鉱石購入で機体を入手
    purchaseShip(shipId) {
        const ship = this.SHIPS[shipId];
        if (!ship || ship.unlockType !== "purchase") return { success: false, reason: "購入不可の機体です" };
        if (this.ownedShips.includes(shipId)) return { success: false, reason: "既に所持しています" };
        const price = ship.unlockPrice;
        if (this.resources.common < (price.common || 0) ||
            this.resources.rare  < (price.rare  || 0) ||
            this.resources.epic  < (price.epic  || 0)) {
            return { success: false, reason: "鉱石が不足しています" };
        }
        this.resources.common -= (price.common || 0);
        this.resources.rare   -= (price.rare   || 0);
        this.resources.epic   -= (price.epic   || 0);
        this.ownedShips.push(shipId);
        this.saveStorage();
        return { success: true };
    },

    // 機体を装備
    equipShip(shipId) {
        if (!this.ownedShips.includes(shipId)) return false;
        this.equippedShip = shipId;
        this.saveStorage();
        return true;
    },

    // 装備中機体のデータを取得
    getEquippedShipData() {
        return this.SHIPS[this.equippedShip || "standard"] || this.SHIPS.standard;
    },

    // 機体タブのHTMLを描画
    renderShipTab() {
        const grid = document.getElementById("shipCardsGrid");
        if (!grid) return;
        grid.innerHTML = "";
        // グリッドを装備タブと同じ2列に統一
        grid.style.cssText = "display:grid;grid-template-columns:repeat(2,1fr);gap:10px;width:100%;box-sizing:border-box;padding:2px;";

        const rarityBorder = {
            common:    "rgba(180,180,180,0.4)",
            uncommon:  "rgba(53,138,221,0.5)",
            rare:      "rgba(29,158,117,0.5)",
            epic:      "rgba(127,119,221,0.5)",
            legendary: "rgba(239,159,39,0.5)",
            secret:    "rgba(212,83,126,0.5)",
        };
        const rarityGlow = {
            common:    "rgba(180,180,180,0.1)",
            uncommon:  "rgba(53,138,221,0.1)",
            rare:      "rgba(29,158,117,0.1)",
            epic:      "rgba(127,119,221,0.15)",
            legendary: "rgba(239,159,39,0.15)",
            secret:    "rgba(212,83,126,0.15)",
        };
        const rarityLabel = {
            common:    "#aaa",
            uncommon:  "#378ADD",
            rare:      "#1D9E75",
            epic:      "#7F77DD",
            legendary: "#EF9F27",
            secret:    "#D4537E",
        };

        Object.values(this.SHIPS).forEach(ship => {
            const owned    = this.ownedShips.includes(ship.id);
            const equipped = this.equippedShip === ship.id;
            const border   = rarityBorder[ship.rarity] || rarityBorder.common;
            const glow     = rarityGlow[ship.rarity]   || rarityGlow.common;
            const lcolor   = rarityLabel[ship.rarity]  || rarityLabel.common;

            // ── カード外枠（equip-item-card と同じクラス＋インライン境界色）──
            const card = document.createElement("div");
            card.className = "equip-item-card" + (equipped ? " equip-active" : "");
            card.style.cssText = [
                equipped
                    ? "border:1.5px solid " + border + ";box-shadow:0 0 18px " + glow + ",0 2px 10px rgba(0,0,0,0.5)"
                    : owned
                        ? "border:1.5px solid " + border
                        : "border:1.5px solid rgba(50,60,80,0.3);opacity:0.65"
            ].join(";");

            // ── プレビューcanvas（equip-card-icon と同サイズ感：56px）──
            const cvs = document.createElement("canvas");
            cvs.width = 56; cvs.height = 56;
            cvs.className = "equip-card-icon";
            cvs.style.cssText = "width:56px;height:56px;border-radius:6px;";
            this._drawShipPreview(cvs, ship, owned);

            // ── 装備中バッジ ──
            const badge = document.createElement("div");
            badge.className = "equip-equipped-badge";
            badge.style.display = equipped ? "" : "none";
            badge.textContent = "▶ 装備中";

            // ── 機体名 ──
            const nameEl = document.createElement("div");
            nameEl.className = "equip-card-name";
            nameEl.textContent = ship.name;

            // ── レアリティ（equip-card-level 流用・色だけ変更）──
            const rarityEl = document.createElement("div");
            rarityEl.className = "equip-card-level";
            rarityEl.style.cssText = "color:" + lcolor + ";border-color:" + lcolor + ";border-width:1px;border-style:solid;background:transparent;opacity:1;";
            rarityEl.textContent = ship.rarityLabel;

            // ── 説明文 ──
            const descEl = document.createElement("div");
            descEl.className = "equip-card-desc";
            descEl.textContent = ship.description;

            // ── 価格 or ロック説明 ──
            const priceRow = document.createElement("div");
            priceRow.className = "equip-card-price-row";
            if (!owned && ship.unlockType === "purchase") {
                const price = ship.unlockPrice;
                priceRow.innerHTML =
                    (price.common ? `<span class="equip-price-item">⚙️${price.common}</span>` : "") +
                    (price.rare   ? `<span class="equip-price-item">🔗${price.rare}</span>`   : "") +
                    (price.epic   ? `<span class="equip-price-item">💎${price.epic}</span>`   : "");
            } else if (!owned) {
                priceRow.innerHTML = `<div class="equip-card-unowned">🔒 ${ship.unlockHint || "条件未達"}</div>`;
            }

            // ── ボタン（equip-btn クラスで統一）──
            const btnsEl = document.createElement("div");
            btnsEl.className = "equip-card-btns";

            if (equipped) {
                const btn = document.createElement("button");
                btn.className = "equip-btn equip-btn-remove";
                btn.style.cssText = "touch-action:manipulation;";
                btn.textContent = "外す";
                btn.onclick = () => { this.unequipWeapon && this.unequipWeapon(); this.equipShip("standard"); this.renderShipTab(); };
                // 機体の「外す」= スタンダードに戻す
                btn.onclick = () => { this.equippedShip = "standard"; this.saveStorage(); this.renderShipTab(); };
                btnsEl.appendChild(btn);
            } else if (owned) {
                const btn = document.createElement("button");
                btn.className = "equip-btn equip-btn-equip";
                btn.style.cssText = "touch-action:manipulation;";
                btn.textContent = "装備する";
                btn.onclick = () => { this.equipShip(ship.id); this.renderShipTab(); };
                btnsEl.appendChild(btn);
            } else if (ship.unlockType === "purchase") {
                const price = ship.unlockPrice;
                const canAfford = this.resources.common >= (price.common || 0) &&
                                  this.resources.rare   >= (price.rare   || 0) &&
                                  this.resources.epic   >= (price.epic   || 0);
                const btn = document.createElement("button");
                btn.className = "equip-btn equip-btn-buy" + (canAfford ? "" : " disabled");
                btn.style.cssText = "touch-action:manipulation;";
                btn.disabled = !canAfford;
                btn.textContent = canAfford ? "購入する" : "鉱石不足";
                btn.onclick = () => {
                    const result = this.purchaseShip(ship.id);
                    if (result.success) {
                        this.renderShipTab();
                    } else {
                        btn.textContent = result.reason;
                        setTimeout(() => this.renderShipTab(), 1200);
                    }
                };
                btnsEl.appendChild(btn);
            }

            // ── 組み立て ──
            card.appendChild(cvs);
            card.appendChild(badge);
            card.appendChild(nameEl);
            card.appendChild(rarityEl);
            card.appendChild(descEl);
            card.appendChild(priceRow);
            card.appendChild(btnsEl);

            grid.appendChild(card);
        });

        if (this.updateResourceDisplay) this.updateResourceDisplay();
    },

    // 機体プレビューをcanvasに描画
    _drawShipPreview(canvas, ship, owned) {
        const ctx = canvas.getContext("2d");
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        if (!owned) {
            // ロック表示
            ctx.fillStyle = "rgba(80,100,130,0.3)";
            ctx.beginPath();
            ctx.arc(W/2, H/2, W*0.38, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "rgba(150,170,200,0.6)";
            ctx.font = "bold " + Math.floor(W*0.45) + "px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🔒", W/2, H/2);
            return;
        }

        const color  = ship.bodyColor;
        const hilite = ship.bodyHighlight;
        const flame  = ship.engineColor;
        const cx = W/2, cy = H/2;

        ctx.save();
        switch (ship.id) {
            case "standard":
                // 三角形
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(cx, cy - H*0.38);
                ctx.lineTo(cx + W*0.4, cy + H*0.3);
                ctx.lineTo(cx - W*0.4, cy + H*0.3);
                ctx.closePath();
                ctx.fill();
                // エンジン炎
                ctx.fillStyle = flame;
                ctx.beginPath();
                ctx.moveTo(cx, cy + H*0.3);
                ctx.lineTo(cx - W*0.12, cy + H*0.5);
                ctx.lineTo(cx + W*0.12, cy + H*0.5);
                ctx.closePath();
                ctx.fill();
                break;

            case "explorer":
                // 六翼形
                ctx.fillStyle = color;
                const hex6 = 6;
                ctx.beginPath();
                for (let k = 0; k < hex6; k++) {
                    const a = (k / hex6) * Math.PI * 2 - Math.PI/2;
                    const r = k % 2 === 0 ? W*0.42 : W*0.25;
                    k === 0 ? ctx.moveTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r)
                            : ctx.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
                }
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = flame;
                ctx.beginPath();
                ctx.moveTo(cx, cy + H*0.25);
                ctx.lineTo(cx - W*0.1, cy + H*0.48);
                ctx.lineTo(cx + W*0.1, cy + H*0.48);
                ctx.closePath();
                ctx.fill();
                break;

            case "fighter":
                // 10角形
                ctx.fillStyle = color;
                ctx.beginPath();
                for (let k = 0; k < 10; k++) {
                    const a = (k / 10) * Math.PI * 2 - Math.PI/2;
                    const r = k % 2 === 0 ? W*0.42 : W*0.28;
                    k === 0 ? ctx.moveTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r)
                            : ctx.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
                }
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = flame;
                ctx.beginPath();
                ctx.moveTo(cx, cy + H*0.28);
                ctx.lineTo(cx - W*0.1, cy + H*0.5);
                ctx.lineTo(cx + W*0.1, cy + H*0.5);
                ctx.closePath();
                ctx.fill();
                break;

            case "stealth":
                // ダイヤ形
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(cx, cy - H*0.42);
                ctx.lineTo(cx + W*0.38, cy);
                ctx.lineTo(cx, cy + H*0.32);
                ctx.lineTo(cx - W*0.38, cy);
                ctx.closePath();
                ctx.fill();
                // コア
                ctx.fillStyle = hilite;
                ctx.globalAlpha = 0.85;
                ctx.beginPath();
                ctx.arc(cx, cy - H*0.05, W*0.14, 0, Math.PI*2);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.fillStyle = flame;
                ctx.beginPath();
                ctx.moveTo(cx, cy + H*0.32);
                ctx.lineTo(cx - W*0.09, cy + H*0.52);
                ctx.lineTo(cx + W*0.09, cy + H*0.52);
                ctx.closePath();
                ctx.fill();
                break;

            case "classic":
                // UFO円盤
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.ellipse(cx, cy + H*0.08, W*0.42, H*0.2, 0, 0, Math.PI*2);
                ctx.fill();
                // ドーム
                ctx.fillStyle = hilite;
                ctx.beginPath();
                ctx.ellipse(cx, cy - H*0.05, W*0.22, H*0.18, 0, Math.PI, Math.PI*2);
                ctx.fill();
                // 炎（下方向）
                ctx.fillStyle = flame;
                ctx.beginPath();
                ctx.moveTo(cx - W*0.15, cy + H*0.28);
                ctx.lineTo(cx - W*0.22, cy + H*0.48);
                ctx.lineTo(cx - W*0.08, cy + H*0.28);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(cx + W*0.15, cy + H*0.28);
                ctx.lineTo(cx + W*0.22, cy + H*0.48);
                ctx.lineTo(cx + W*0.08, cy + H*0.28);
                ctx.closePath();
                ctx.fill();
                break;

            case "nebula":
                // 星型
                ctx.fillStyle = color;
                ctx.beginPath();
                for (let k = 0; k < 10; k++) {
                    const a = (k / 10) * Math.PI * 2 - Math.PI/2;
                    const r = k % 2 === 0 ? W*0.42 : W*0.18;
                    k === 0 ? ctx.moveTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r)
                            : ctx.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
                }
                ctx.closePath();
                ctx.fill();
                // 中心コア
                ctx.fillStyle = hilite;
                ctx.globalAlpha = 0.9;
                ctx.beginPath();
                ctx.arc(cx, cy, W*0.15, 0, Math.PI*2);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.fillStyle = flame;
                ctx.beginPath();
                ctx.moveTo(cx, cy + H*0.3);
                ctx.lineTo(cx - W*0.09, cy + H*0.5);
                ctx.lineTo(cx + W*0.09, cy + H*0.5);
                ctx.closePath();
                ctx.fill();
                break;
        }
        ctx.restore();
    },


    onStorageScreenOpen() {
        this.updateResourceDisplay();
        this.renderItems();
        this.loadSecuritySettings();
        this.setupScrollIndicator();
        this.setupStorageTabs();
        this.renderEquipTab();
    },

    // 格納庫タブの切り替え処理
    setupStorageTabs() {
        const screen = document.getElementById("storageScreen");
        if (!screen) return;
        const tabs = screen.querySelectorAll(".storage-tab");
        tabs.forEach(tab => {
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                document.querySelectorAll(".storage-tab-content").forEach(c => c.style.display = "none");
                const target = document.getElementById("tab-" + tab.dataset.tab);
                if (target) target.style.display = "block";
                // 機体タブを開いたとき：解放チェック＋描画
                if (tab.dataset.tab === "ships") this.onShipTabOpen();
            };
        });
        // 初期表示：装備タブ（ボタンのアクティブ状態もリセット）
        document.querySelectorAll(".storage-tab-content").forEach(c => c.style.display = "none");
        tabs.forEach(t => t.classList.remove("active"));
        const equipTabBtn = screen.querySelector('.storage-tab[data-tab="equipment"]');
        if (equipTabBtn) equipTabBtn.classList.add("active");
        const equipTab = document.getElementById("tab-equipment");
        if (equipTab) equipTab.style.display = "block";
    },

    // 装備タブの描画
    renderEquipTab() {
        this.renderEquipSlot();
        this.renderEquipItems();
    },

    // 装備スロット表示
    renderEquipSlot() {
        const slotEl = document.getElementById("equipSlot");
        if (!slotEl) return;

        if (!this.equippedWeapon) {
            // 未装備状態
            slotEl.innerHTML = "";
            slotEl.style.cssText = [
                "display:flex","align-items:center","gap:12px",
                "padding:14px 16px","border-radius:14px","min-height:64px",
                "border:1.5px dashed rgba(100,150,180,0.3)",
                "background:rgba(5,15,30,0.6)",
                "color:#334455","font-size:0.85rem","letter-spacing:0.08em"
            ].join(";");
            slotEl.innerHTML = `<span style="font-size:1.6rem;opacity:0.3">🔩</span><span>未装備</span>`;
        } else {
            const weapon = this.shopItems.upgrades[this.equippedWeapon.id];
            if (!weapon) return;
            const lv = Math.min(this.equippedWeapon.level, weapon.maxLevel) - 1;
            const effect = weapon.levelEffects[lv];

            slotEl.innerHTML = "";
            slotEl.style.cssText = [
                "display:flex","align-items:center","gap:14px",
                "padding:14px 16px","border-radius:14px","min-height:64px",
                "border:1.5px solid rgba(0,255,180,0.5)",
                "background:linear-gradient(120deg,rgba(0,25,45,0.95),rgba(0,45,38,0.85))",
                "box-shadow:0 0 20px rgba(0,255,180,0.1)",
                "position:relative","overflow:hidden"
            ].join(";");

            // 光彩ライン
            const glow = document.createElement("div");
            glow.style.cssText = "position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(0,255,200,0.7),transparent);pointer-events:none";
            slotEl.appendChild(glow);

            // アイコン
            const iconEl = document.createElement("div");
            iconEl.style.cssText = "font-size:2.4rem;filter:drop-shadow(0 0 10px rgba(0,255,200,0.7));flex-shrink:0";
            iconEl.textContent = weapon.icon;
            slotEl.appendChild(iconEl);

            // 情報
            const info = document.createElement("div");
            info.style.cssText = "flex:1;min-width:0";
            info.innerHTML =
                `<div style="font-weight:700;color:#00ffcc;font-size:1rem;text-shadow:0 0 10px rgba(0,255,180,0.5)">${weapon.name} <span style="font-size:0.75rem;color:#FFD700">Lv.${this.equippedWeapon.level}</span></div>` +
                `<div style="font-size:0.78rem;color:#66aa88;margin-top:3px">${effect.desc}</div>`;
            slotEl.appendChild(info);

            // 外すボタン
            const btn = document.createElement("button");
            btn.textContent = "外す";
            btn.style.cssText = "flex-shrink:0;padding:12px 20px;background:rgba(200,50,50,0.15);border:1px solid rgba(200,80,80,0.5);border-radius:10px;color:#ff9090;font-size:0.92rem;font-weight:600;cursor:pointer;min-height:44px;touch-action:manipulation;";
            btn.onclick = () => { this.unequipWeapon(); this.renderEquipSlot(); this.renderEquipItems(); };
            slotEl.appendChild(btn);
        }
    },

    // 所持装備アイテム一覧
    renderEquipItems() {
        const grid = document.getElementById("equipItemsGrid");
        if (!grid) return;
        grid.innerHTML = "";
        // グリッドレイアウトをインラインスタイルで強制設定（CSS読み込み失敗の保険）
        grid.style.cssText = "display:grid;grid-template-columns:repeat(2,1fr);gap:12px;width:100%;box-sizing:border-box;";

        const weapons = Object.values(this.shopItems.upgrades)
            .filter(w => w.usage === "equip");

        weapons.forEach(weapon => {
            const owned = this.items.find(i => i.id === weapon.id);
            const currentLevel = owned ? (owned.level || 1) : 0;
            const isEquipped = this.equippedWeapon?.id === weapon.id;
            const nextLevel = currentLevel + 1;
            const canLevelUp = currentLevel < weapon.maxLevel;
            const price = canLevelUp ? weapon.levelPrices[currentLevel] : null;
            const canAfford = price &&
                this.resources.common >= (price.common || 0) &&
                this.resources.rare   >= (price.rare   || 0) &&
                this.resources.epic   >= (price.epic   || 0);

            const card = document.createElement("div");
            card.className = "equip-item-card" + (isEquipped ? " equip-active" : "");
            // フレックスレイアウトをインラインスタイルで強制設定
            card.style.cssText = [
                "display:flex",
                "flex-direction:column",
                "align-items:center",
                "gap:8px",
                "padding:18px 14px 16px",
                "border-radius:14px",
                "text-align:center",
                "box-sizing:border-box",
                "position:relative",
                "overflow:hidden",
                isEquipped
                    ? "border:1.5px solid rgba(0,255,180,0.6);background:linear-gradient(170deg,rgba(0,50,45,0.95),rgba(0,60,55,0.85));box-shadow:0 0 18px rgba(0,255,180,0.15)"
                    : "border:1.5px solid rgba(60,120,180,0.35);background:linear-gradient(170deg,rgba(5,18,38,0.95),rgba(8,25,55,0.85))"
            ].join(";");
            const priceStr = weapon.levelPrices[0].rare  > 0 ? `🔗${weapon.levelPrices[0].rare}` : ""
                           + weapon.levelPrices[0].epic  > 0 ? `💎${weapon.levelPrices[0].epic}` : "";
            const upgradePriceStr = canLevelUp
                ? (price.rare > 0 ? `🔗${price.rare}` : "") + (price.epic > 0 ? `💎${price.epic}` : "")
                : "";

            // ── カード表示内容の組み立て ──

            // レベル表示
            const lvText  = currentLevel > 0 ? `Lv ${currentLevel}` : `Lv 1`;
            const lvClass = "equip-card-level";

            // 状態バッジ（非表示）
            const stateBadge = "";

            // 効果説明（所持済みなら現レベルの効果、未所持なら次レベルの効果）
            const effectDesc = currentLevel > 0
                ? weapon.levelEffects[currentLevel - 1].desc
                : weapon.levelEffects[0].desc;

            // 価格表示（未所持: Lv1価格、所持済み: 次レベル価格 or MAX）
            const priceToShow = currentLevel === 0
                ? weapon.levelPrices[0]
                : (canLevelUp ? weapon.levelPrices[currentLevel] : null);
            const priceHtml = priceToShow
                ? (priceToShow.rare  > 0 ? `<span class="equip-price-item">🔗${priceToShow.rare}</span>` : "") +
                  (priceToShow.epic  > 0 ? `<span class="equip-price-item">💎${priceToShow.epic}</span>` : "") +
                  (priceToShow.common> 0 ? `<span class="equip-price-item">⚙️${priceToShow.common}</span>` : "")
                : (currentLevel > 0 ? `<div class="equip-max-badge">MAX</div>` : "");

            // アクションボタン
            let actionHtml = "";
            if (currentLevel === 0) {
                // 未所持 → 購入ボタン
                actionHtml = `<button class="equip-btn equip-btn-buy${canAfford ? "" : " disabled"}"${canAfford ? "" : " disabled"}>購入</button>`;
            } else if (isEquipped) {
                // 装備中 → 外す＋レベルアップ
                actionHtml = `<button class="equip-btn equip-btn-remove">外す</button>`;
                if (canLevelUp) {
                    actionHtml += `<button class="equip-btn equip-btn-upgrade${canAfford ? "" : " disabled"}"${canAfford ? "" : " disabled"}>強化</button>`;
                }
            } else {
                // 所持・未装備 → 装備＋レベルアップ
                actionHtml = `<button class="equip-btn equip-btn-equip">装備</button>`;
                if (canLevelUp) {
                    actionHtml += `<button class="equip-btn equip-btn-upgrade${canAfford ? "" : " disabled"}"${canAfford ? "" : " disabled"}>強化</button>`;
                }
            }

            card.innerHTML =
                `<div class="equip-card-icon">${weapon.icon}</div>` +
                `<div class="equip-card-name-row"><span class="equip-card-name">${weapon.name}</span><span class="${lvClass}">${lvText}</span></div>` +
                `<div class="equip-card-desc">${effectDesc}</div>` +
                `<div class="equip-card-price-row">${priceHtml}</div>` +
                `<div class="equip-card-btns">${actionHtml}</div>`;

            // ボタンイベント
            const equipBtn   = card.querySelector(".equip-btn-equip");
            const removeBtn  = card.querySelector(".equip-btn-remove");
            const upgradeBtn = card.querySelector(".equip-btn-upgrade");
            const buyBtn     = card.querySelector(".equip-btn-buy");

            if (equipBtn)   equipBtn.onclick   = () => { this.equipWeapon(weapon.id);        this.renderEquipTab(); };
            if (removeBtn)  removeBtn.onclick  = () => { this.unequipWeapon();                this.renderEquipTab(); };
            if (upgradeBtn) upgradeBtn.onclick = () => { const r = this.purchaseWeapon(weapon.id); if (r.success) { this.updateResourceDisplay(); this.renderEquipTab(); } };
            if (buyBtn)     buyBtn.onclick     = () => { const r = this.purchaseWeapon(weapon.id); if (r.success) { this.updateResourceDisplay(); this.renderEquipTab(); } };

            grid.appendChild(card);
        });
    },

    // セキュリティ設定をUIに反映
    loadSecuritySettings() {
        const autoLockCheckbox = document.getElementById("autoLockRare");
        const lockNewCheckbox = document.getElementById("lockNewItems");

        if (autoLockCheckbox) autoLockCheckbox.checked = this.security.autoLockRare;
        if (lockNewCheckbox) lockNewCheckbox.checked = this.security.lockNewItems;
    },

    // データ保存
    saveStorage() {
        const data = {
            resources: this.resources,
            items: this.items,
            security: this.security,
            version: "1.0",
            lastUpdated: Date.now()
        };
        try {
            localStorage.setItem("gameStorage", JSON.stringify(data));
        } catch (error) {
            this.criticalError("❌ 格納庫データの保存に失敗:", error);
        }
        // 機体データを別キーで保存
        try {
            localStorage.setItem("equippedShip", this.equippedShip || "standard");
            localStorage.setItem("ownedShips", JSON.stringify(this.ownedShips || ["standard"]));
        } catch (error) {
            this.criticalError("❌ 機体データの保存に失敗:", error);
        }
        // バフスロットを保存
        try {
            localStorage.setItem("buffSlots", JSON.stringify(this.buffSlots || [null, null, null]));
        } catch (error) {
            this.criticalError("❌ バフスロットの保存に失敗:", error);
        }
    },

    // データ読み込み
    loadStorage() {
        try {
            const saved = localStorage.getItem("gameStorage");
            if (saved) {
                const data = JSON.parse(saved);
                this.resources = data.resources || this.resources;
                this.items = data.items || this.items;
                this.security = data.security || this.security;
                // ゲームデータとマージ
                this.mergeWithGameData();
            }
        } catch (error) {
            this.criticalError("❌ 格納庫データの読み込みに失敗:", error);
        }
        // 機体データ読み込み
        try {
            this.equippedShip = localStorage.getItem("equippedShip") || "standard";
            const ownedRaw = localStorage.getItem("ownedShips");
            this.ownedShips = ownedRaw ? JSON.parse(ownedRaw) : ["standard"];
            if (!this.ownedShips.includes("standard")) this.ownedShips.unshift("standard");
        } catch (error) {
            this.equippedShip = "standard";
            this.ownedShips = ["standard"];
        }
        // バフスロット読み込み
        try {
            const buffRaw = localStorage.getItem("buffSlots");
            this.buffSlots = buffRaw ? JSON.parse(buffRaw) : [null, null, null];
            if (!Array.isArray(this.buffSlots) || this.buffSlots.length !== 3) {
                this.buffSlots = [null, null, null];
            }
        } catch (error) {
            this.buffSlots = [null, null, null];
        }
    },

    // ゲームデータとマージするメソッド
    mergeWithGameData() {
        // 基本的に格納庫データを優先するので、このメソッドはほぼ不要
        return false;
    },

    // デバッグ用
    debug() {
    },

    // スクロールインジケーターの制御
    setupScrollIndicator() {
        const container = document.querySelector(".storage-container");
        const indicator = document.getElementById("scrollIndicator");

        if (!container || !indicator) return;

        container.addEventListener("scroll", () => {
            const scrollableHeight = container.scrollHeight - container.clientHeight;
            const currentScroll = container.scrollTop;

            // スクロールが下部近くになったらインジケーターを非表示
            if (currentScroll > scrollableHeight - 50) {
                indicator.style.opacity = "0";
            } else {
                indicator.style.opacity = "1";
            }
        });

        // 初期状態でスクロールが必要かチェック
        setTimeout(() => {
            const needsScroll = container.scrollHeight > container.clientHeight;
            indicator.style.display = needsScroll ? "block" : "none";
        }, 100);
    },

    // データ整合性チェック
    checkDataConsistency() {
        if (!window.Game || typeof window.Game !== "object") return;

        const gameTotal    = (Game.totalCommonOres || 0) + (Game.totalRareOres || 0) + (Game.totalEpicOres || 0);
        const storageTotal = this.resources.common + this.resources.rare + this.resources.epic;
        const diff = Math.abs(gameTotal - storageTotal);

        const TOLERANCE = Game.gameRunning ? 10 : 0;
        if (diff <= TOLERANCE) return;

        if (gameTotal >= storageTotal) {
            this.resources.common = window.Game.totalCommonOres || 0;
            this.resources.rare   = window.Game.totalRareOres   || 0;
            this.resources.epic   = window.Game.totalEpicOres   || 0;
        } else {
            this.syncWithGameData();
        }
        this.saveStorage();
        if (typeof window.Game.saveCumulativeStats === "function") window.Game.saveCumulativeStats();
    },

    // 定期的な整合性チェック
    startConsistencyCheck() {
        setInterval(() => {
            this.checkDataConsistency();
        }, 30000); // 30秒ごとにチェック
    },

    // ゲーム終了時の最終データ整合性チェック
    finalDataConsistencyCheck() {
        // Gameオブジェクトの存在確認を強化
        if (!window.Game || typeof window.Game !== "object") {
            return;
        }


        // 格納庫データが正しいことを確認
        const storageTotal = this.resources.common + this.resources.rare + this.resources.epic;

        // ゲームデータの累積数量を格納庫データで上書き（完全同期）
        window.Game.totalCommonOres = this.resources.common;
        window.Game.totalRareOres = this.resources.rare;
        window.Game.totalEpicOres = this.resources.epic;
        window.Game.totalOres = storageTotal;


        // 両方のデータを保存
        this.saveStorage();
        if (window.Game.saveCumulativeStats && typeof window.Game.saveCumulativeStats === "function") {
            window.Game.saveCumulativeStats();
        }
    },

    // ゲーム終了時の処理を更新
    onGameOver() {

        // 最終データ整合性チェック
        this.finalDataConsistencyCheck();

        // 統計用データを更新
        this.updateGameStats();
    },

    // ゲーム統計を更新
    updateGameStats() {
        if (!window.Game) return;

        // セッション獲得量を記録
        const sessionStats = {
            common: window.Game.sessionCommonOres || 0,
            rare: window.Game.sessionRareOres || 0,
            epic: window.Game.sessionEpicOres || 0,
            total: window.Game.sessionOres || 0,
            timestamp: Date.now()
        };

        // セッション履歴を保存（必要に応じて）
        if (!this.sessionHistory) {
            this.sessionHistory = [];
        }
        this.sessionHistory.push(sessionStats);

        // 最新10セッションのみ保持
        if (this.sessionHistory.length > 10) {
            this.sessionHistory = this.sessionHistory.slice(-10);
        }

    },

    // 統計表示用の強制同期
    forceSyncForStats() {

        // Gameオブジェクトの利用可能性をチェック
        if (!window.Game || typeof window.Game !== "object") {
            return;
        }

        try {
            // 1. 格納庫データをゲームデータに強制反映
            window.Game.totalCommonOres = this.resources.common;
            window.Game.totalRareOres = this.resources.rare;
            window.Game.totalEpicOres = this.resources.epic;
            window.Game.totalOres = this.resources.common + this.resources.rare + this.resources.epic;

            // 2. 両方のデータを保存
            this.saveStorage();
            if (window.Game.saveCumulativeStats && typeof window.Game.saveCumulativeStats === "function") {
                window.Game.saveCumulativeStats();
            }

        } catch (error) {
            console.error("❌ 強制同期中にエラーが発生:", error);
        }
    },

    // ショップアイテムを使用するメソッド
    useShopItem(itemId) {

        const shopItem = this.getShopItem(itemId);
        if (!shopItem) {
            console.error(`❌ アイテムが見つかりません: ${itemId}`);
            if (window.showNotification) {
                window.showNotification("アイテムが見つかりません", "error");
            }
            return false;
        }

        // 🔧 修正: 所有アイテムの検索を強化
        const ownedItemIndex = this.items.findIndex((item) => item.id === itemId);
        if (ownedItemIndex === -1) {
            console.error(`❌ アイテムを所持していません: ${shopItem.name}`);
            if (window.showNotification) {
                window.showNotification(`${shopItem.name}を所持していません`, "error");
            }
            return false;
        }

        const ownedItem = this.items[ownedItemIndex];
        if (ownedItem.quantity <= 0) {
            console.error(`❌ アイテムの数量が0です: ${shopItem.name}`);
            if (window.showNotification) {
                window.showNotification(`${shopItem.name}の数量が不足しています`, "error");
            }
            return false;
        }

        if (ownedItem.locked) {
            this.showLockedWarning(ownedItem);
            return false;
        }

        // 確認ダイアログを表示
        if (!confirm(`${shopItem.icon} ${shopItem.name}を使用しますか？\n\n${shopItem.description}`)) {
            return false;
        }

        // 🔧 修正: 効果適用を先に行い、成功したらのみ消費する
        if (this.applyItemEffect(shopItem, ownedItem)) {

            // 消費処理
            if (ownedItem.quantity > 1) {
                ownedItem.quantity--;
            } else {
                // 数量が1の場合はアイテムを完全に削除
                this.items.splice(ownedItemIndex, 1);
            }

            // データ保存
            this.saveStorage();

            // 成功通知
            if (window.showNotification) {
                window.showNotification(`${shopItem.icon} ${shopItem.name}を使用しました`, "success");
            }

            // UI更新
            if (this.isStorageScreenOpen()) {
                this.renderItems();
            }

            return true;
        } else {
            console.error(`❌ 効果適用に失敗したため、アイテムを消費しません: ${shopItem.name}`);
            if (window.showNotification) {
                window.showNotification(`${shopItem.name}の使用に失敗しました`, "error");
            }
            return false;
        }
    },

    // ✅ 追加: アイテム消費専用メソッド（確認ダイアログなし）
    consumeShopItem(itemId) {

        const ownedItemIndex = this.items.findIndex((item) => item.id === itemId);
        if (ownedItemIndex === -1) {
            console.error(`❌ 消費対象のアイテムが見つかりません: ${itemId}`);
            return false;
        }

        const ownedItem = this.items[ownedItemIndex];

        if (ownedItem.quantity > 1) {
            ownedItem.quantity--;
        } else {
            // 数量が1の場合はアイテムを完全に削除
            this.items.splice(ownedItemIndex, 1);
        }

        // データ保存
        this.saveStorage();

        // UI更新
        if (this.isStorageScreenOpen()) {
            this.renderItems();
        }

        return true;
    },

    // アイテム効果を適用するメソッド
    applyItemEffect(shopItem, ownedItem) {
        try {

            // 🔧 修正: 複数の方法でGameオブジェクトを確実に取得
            let game = window.Game;

            // 方法1: 直接windowから取得
            if (!game || typeof game !== "object") {

                // 方法2: グローバルスコープから探す
                if (typeof window.Game !== "undefined") {
                    game = window.Game;
                }

                // 方法3: タイトルスクリーン経由で取得
                if (!game && window.TitleScreen && TitleScreen.window.Game) {
                    game = window.TitleScreen.window.Game;
                }
            }

            // 最終チェック
            if (!game || typeof game !== "object") {
                console.error("❌ Gameオブジェクトが利用できません", {
                    windowGame: !!window.Game,
                    globalGame: typeof window.Game,
                    titleScreenGame: !!(window.TitleScreen && TitleScreen.window.Game),
                    gameType: typeof game
                });

                // ユーザーへのフィードバック
                if (window.showNotification) {
                    window.showNotification("ゲームシステムが準備できていません", "error");
                }
                return false;
            }


            // 効果キューシステムの初期化確認
            if (!game.pendingEffects) {
                game.pendingEffects = {
                    upgrades: [],
                    consumables: []
                };
            }

            // 効果データの構築
            const effectData = {
                itemId: shopItem.id,
                name: shopItem.name,
                effect: shopItem.effect,
                type: shopItem.type,
                usage: shopItem.usage,
                applied: false,
                enabled: true
            };


            // アイテムタイプに基づいて効果をキューに追加
            switch (shopItem.type) {
                case "upgrade":
                    if (!Array.isArray(game.pendingEffects.upgrades)) {
                        game.pendingEffects.upgrades = [];
                    }
                    game.pendingEffects.upgrades.push(effectData);
                    break;

                case "consumable":
                    if (!Array.isArray(game.pendingEffects.consumables)) {
                        game.pendingEffects.consumables = [];
                    }
                    game.pendingEffects.consumables.push(effectData);
                    break;

                default:
                    return false;
            }

            // 🔥 重要: 効果キューの状態を保存
            if (game.savePendingEffects && typeof game.savePendingEffects === "function") {
                game.savePendingEffects();
            } else {
                // 代替手段: 直接localStorageに保存
                try {
                    const data = {
                        pendingEffects: game.pendingEffects,
                        savedAt: Date.now()
                    };
                    localStorage.setItem("gamePendingEffects", JSON.stringify(data));
                } catch (error) {
                    console.error("❌ 代替保存も失敗:", error);
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error("❌ アイテム効果の適用に失敗:", error);
            return false;
        }
    },

    // アイテム使用前の確認ダイアログ
    showUseConfirmation(shopItem) {
        return new Promise((resolve) => {
            if (window.confirm(`${shopItem.icon} ${shopItem.name}を使用しますか？\n\n${shopItem.description}`)) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    },

    // デバッグ用状態確認関数
    debugItemUsage(itemId) {
    },

    // ✅ 追加: 詳細な状態確認関数
    checkGameObjectAvailability() {

        const checks = {
            windowGame: !!window.Game,
            windowGameType: typeof window.Game,
            globalGame: typeof window.Game !== "undefined",
            gameObject: window.Game
                ? {
                      pendingEffects: !!window.Game.pendingEffects,
                      savePendingEffects: typeof window.Game.savePendingEffects,
                      loadPendingEffects: typeof window.Game.loadPendingEffects
                  }
                : "N/A"
        };


        return checks.windowGame && checks.windowGameType === "object";
    }
};

window.StorageSystem = StorageSystem;
window.debugStorageItem = (itemId) => StorageSystem.debugItemUsage(itemId);
window.checkGameAvailability = () => StorageSystem.checkGameObjectAvailability();
