
// ============================================================
// achievements.js
// Achievements — 実績システム
// ============================================================
const Achievements = {
    DEBUG_MODE: false,
    achievements: [],
    unlockedLevels: new Map(), // 各実績の現在のレベルを記録
    progress: new Map(),

    init() {
        // グローバルなGameオブジェクトからDEBUG_MODEを取得
        this.DEBUG_MODE = window.Game ? window.Game.DEBUG_MODE : false;

        this.loadAchievements();
        this.loadProgress();
        this.debugLog("✅ 実績システム初期化完了");
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

    // 実績の定義（ランク制）
    loadAchievements() {
        this.achievements = [
            {
                id: "space_traveler",
                title: "宇宙の旅人",
                baseIcon: "🚀",
                levels: [
                    { threshold: 10000, description: "10,000m飛行する", icon: "🚀" },
                    { threshold: 20000, description: "20,000m飛行する", icon: "🚀" },
                    { threshold: 50000, description: "50,000m飛行する", icon: "🚀" },
                    { threshold: 100000, description: "100,000m飛行する", icon: "🚀" },
                    { threshold: 200000, description: "200,000m飛行する", icon: "🚀" },
                    { threshold: 500000, description: "500,000m飛行する", icon: "🚀" },
                    { threshold: 1000000, description: "1,000,000m飛行する", icon: "🚀" },
                    { threshold: 2000000, description: "2,000,000m飛行する", icon: "🚀" },
                    { threshold: 5000000, description: "5,000,000m飛行する", icon: "🚀" },
                    { threshold: 10000000, description: "10,000,000m飛行する", icon: "🚀" }
                ],
                getCurrentValue: (gameState) => gameState.distance,
                getDisplayValue: (value) => `${Math.floor(value).toLocaleString()}m`
            },
            {
                id: "invincible_warrior",
                title: "無敵戦士",
                baseIcon: "🛡️",
                levels: [
                    { threshold: 10, description: "シールドを10回取得する", icon: "🛡️" },
                    { threshold: 25, description: "シールドを25回取得する", icon: "🛡️" },
                    { threshold: 50, description: "シールドを50回取得する", icon: "🛡️" },
                    { threshold: 100, description: "シールドを100回取得する", icon: "🛡️" },
                    { threshold: 200, description: "シールドを200回取得する", icon: "🛡️" },
                    { threshold: 500, description: "シールドを500回取得する", icon: "🛡️" },
                    { threshold: 1000, description: "シールドを1,000回取得する", icon: "🛡️" },
                    { threshold: 2000, description: "シールドを2,000回取得する", icon: "🛡️" },
                    { threshold: 5000, description: "シールドを5,000回取得する", icon: "🛡️" },
                    { threshold: 10000, description: "シールドを10,000回取得する", icon: "🛡️" }
                ],
                getCurrentValue: (gameState) => gameState.shieldCollectCount,
                getDisplayValue: (value) => `${Math.floor(value)}回`
            },
            {
                id: "wormhole_master",
                title: "ワームホールマスター",
                baseIcon: "🌀",
                levels: [
                    { threshold: 10, description: "ワームホールを10回通過する", icon: "🌀" },
                    { threshold: 25, description: "ワームホールを25回通過する", icon: "🌀" },
                    { threshold: 50, description: "ワームホールを50回通過する", icon: "🌀" },
                    { threshold: 100, description: "ワームホールを100回通過する", icon: "🌀" },
                    { threshold: 200, description: "ワームホールを200回通過する", icon: "🌀" },
                    { threshold: 500, description: "ワームホールを500回通過する", icon: "🌀" },
                    { threshold: 1000, description: "ワームホールを1,000回通過する", icon: "🌀" },
                    { threshold: 2000, description: "ワームホールを2,000回通過する", icon: "🌀" },
                    { threshold: 5000, description: "ワームホールを5,000回通過する", icon: "🌀" },
                    { threshold: 10000, description: "ワームホールを10,000回通過する", icon: "🌀" }
                ],
                getCurrentValue: (gameState) => gameState.wormholeCount,
                getDisplayValue: (value) => `${Math.floor(value)}回`
            },
            // 燃料補給の達人
            {
                id: "fuel_master",
                title: "燃料補給のプロ",
                baseIcon: "⛽",
                levels: [
                    { threshold: 10, description: "燃料を10回補給する", icon: "⛽" },
                    { threshold: 25, description: "燃料を25回補給する", icon: "⛽" },
                    { threshold: 50, description: "燃料を50回補給する", icon: "⛽" },
                    { threshold: 100, description: "燃料を100回補給する", icon: "⛽" },
                    { threshold: 200, description: "燃料を200回補給する", icon: "⛽" },
                    { threshold: 500, description: "燃料を500回補給する", icon: "⛽" },
                    { threshold: 1000, description: "燃料を1,000回補給する", icon: "⛽" },
                    { threshold: 2000, description: "燃料を2,000回補給する", icon: "⛽" },
                    { threshold: 5000, description: "燃料を5,000回補給する", icon: "⛽" },
                    { threshold: 10000, description: "燃料を10,000回補給する", icon: "⛽" }
                ],
                getCurrentValue: (gameState) => gameState.resourceCollectCount,
                getDisplayValue: (value) => `${Math.floor(value)}回`
            },
            {
                id: "fuel_manager",
                title: "燃料管理の達人",
                baseIcon: "🚨",
                levels: [
                    { threshold: 100, description: "燃料20%以下の状態で隕石を100回回避する", icon: "🚨" },
                    { threshold: 250, description: "燃料20%以下の状態で隕石を250回回避する", icon: "🚨" },
                    { threshold: 500, description: "燃料20%以下の状態で隕石を500回回避する", icon: "🚨" },
                    { threshold: 1000, description: "燃料20%以下の状態で隕石を1,000回回避する", icon: "🚨" },
                    { threshold: 2000, description: "燃料20%以下の状態で隕石を2,000回回避する", icon: "🚨" }
                ],
                getCurrentValue: (gameState) => gameState.lowFuelDodges || 0,
                getDisplayValue: (value) => `${Math.floor(value)}回`
            },
            {
                id: "dodge_master",
                title: "回避の名手",
                baseIcon: "🥷",
                levels: [
                    { threshold: 500, description: "隕石を500回回避する", icon: "🥷" },
                    { threshold: 2000, description: "隕石を2,000回回避する", icon: "🥷" },
                    { threshold: 5000, description: "隕石を5,000回回避する", icon: "🥷" },
                    { threshold: 10000, description: "隕石を10,000回回避する", icon: "🥷" },
                    { threshold: 20000, description: "隕石を20,000回回避する", icon: "🥷" },
                    { threshold: 50000, description: "隕石を50,000回回避する", icon: "🥷" },
                    { threshold: 100000, description: "隕石を100,000回回避する", icon: "🥷" },
                    { threshold: 200000, description: "隕石を200,000回回避する", icon: "🥷" },
                    { threshold: 500000, description: "隕石を500,000回回避する", icon: "🥷" },
                    { threshold: 1000000, description: "隕石を1,000,000回回避する", icon: "🥷" }
                ],
                getCurrentValue: (gameState) => gameState.dodgeCount || 0,
                getDisplayValue: (value) => `${Math.floor(value)}回`
            },

            {
                id: "score_master",
                title: "スコアマスター",
                baseIcon: "🏆",
                levels: [
                    { threshold: 100000, description: "スコア100,000点を達成", icon: "🏆" },
                    { threshold: 250000, description: "スコア250,000点を達成", icon: "🏆" },
                    { threshold: 500000, description: "スコア500,000点を達成", icon: "🏆" },
                    { threshold: 1000000, description: "スコア1,000,000点を達成", icon: "🏆" },
                    { threshold: 2000000, description: "スコア2,000,000点を達成", icon: "🏆" },
                    { threshold: 5000000, description: "スコア5,000,000点を達成", icon: "🏆" },
                    { threshold: 10000000, description: "スコア10,000,000点を達成", icon: "🏆" },
                    { threshold: 20000000, description: "スコア20,000,000点を達成", icon: "🏆" },
                    { threshold: 50000000, description: "スコア50,000,000点を達成", icon: "🏆" },
                    { threshold: 100000000, description: "スコア100,000,000点を達成", icon: "🏆" }
                ],
                getCurrentValue: (gameState) => gameState.maxScore || 0,
                getDisplayValue: (value) => `${Math.floor(value).toLocaleString()}点`
            },
            {
                id: "shield_crusher",
                title: "シールドクラッシャー",
                baseIcon: "💥",
                levels: [
                    { threshold: 1000, description: "シールドで隕石を1,000回破壊する", icon: "💥" },
                    { threshold: 2500, description: "シールドで隕石を2,500回破壊する", icon: "💥" },
                    { threshold: 5000, description: "シールドで隕石を5,000回破壊する", icon: "💥" },
                    { threshold: 10000, description: "シールドで隕石を10,000回破壊する", icon: "💥" },
                    { threshold: 20000, description: "シールドで隕石を20,000回破壊する", icon: "💥" },
                    { threshold: 50000, description: "シールドで隕石を50,000回破壊する", icon: "💥" },
                    { threshold: 100000, description: "シールドで隕石を100,000回破壊する", icon: "💥" },
                    { threshold: 200000, description: "シールドで隕石を200,000回破壊する", icon: "💥" },
                    { threshold: 500000, description: "シールドで隕石を500,000回破壊する", icon: "💥" },
                    { threshold: 1000000, description: "シールドで隕石を1,000,000回破壊する", icon: "💥" }
                ],
                getCurrentValue: (gameState) => gameState.shieldCrashCount,
                getDisplayValue: (value) => `${Math.floor(value)}回`
            },

            {
                id: "ace_shooter",
                title: "エースシューター",
                baseIcon: "🎯",
                levels: [
                    { threshold: 100, description: "弾で隕石を100回破壊する", icon: "🎯" },
                    { threshold: 500, description: "弾で隕石を500回破壊する", icon: "🎯" },
                    { threshold: 1000, description: "弾で隕石を1,000回破壊する", icon: "🎯" },
                    { threshold: 2500, description: "弾で隕石を2,500回破壊する", icon: "🎯" },
                    { threshold: 5000, description: "弾で隕石を5,000回破壊する", icon: "🎯" },
                    { threshold: 10000, description: "弾で隕石を10,000回破壊する", icon: "🎯" },
                    { threshold: 25000, description: "弾で隕石を25,000回破壊する", icon: "🎯" },
                    { threshold: 50000, description: "弾で隕石を50,000回破壊する", icon: "🎯" },
                    { threshold: 100000, description: "弾で隕石を100,000回破壊する", icon: "🎯" },
                    { threshold: 200000, description: "弾で隕石を200,000回破壊する", icon: "🎯" }
                ],
                getCurrentValue: (gameState) => gameState.bulletDestructionCount || 0,
                getDisplayValue: (value) => `${Math.floor(value)}回`
            },

            {
                id: "precision_shooter",
                title: "精密射撃",
                baseIcon: "💫",
                levels: [
                    { threshold: 10, description: "最も近い隕石を10回破壊する", icon: "💫" },
                    { threshold: 100, description: "最も近い隕石を100回破壊する", icon: "💫" },
                    { threshold: 250, description: "最も近い隕石を250回破壊する", icon: "💫" },
                    { threshold: 500, description: "最も近い隕石を500回破壊する", icon: "💫" },
                    { threshold: 1000, description: "最も近い隕石を1,000回破壊する", icon: "💫" },
                    { threshold: 2000, description: "最も近い隕石を2,000回破壊する", icon: "💫" },
                    { threshold: 5000, description: "最も近い隕石を5,000回破壊する", icon: "💫" },
                    { threshold: 10000, description: "最も近い隕石を10,000回破壊する", icon: "💫" }
                ],
                getCurrentValue: (gameState) => gameState.closestObstacleDestructionCount || 0,
                getDisplayValue: (value) => `${Math.floor(value)}回`
            },

            {
                id: "resource_manager",
                title: "リソースマネージャー",
                baseIcon: "💼",
                levels: [
                    { threshold: 10, description: "最大ライフで資源を10回取得する", icon: "💼" },
                    { threshold: 25, description: "最大ライフで資源を25回取得する", icon: "💼" },
                    { threshold: 50, description: "最大ライフで資源を50回取得する", icon: "💼" },
                    { threshold: 100, description: "最大ライフで資源を100回取得する", icon: "💼" },
                    { threshold: 200, description: "最大ライフで資源を200回取得する", icon: "💼" },
                    { threshold: 500, description: "最大ライフで資源を500回取得する", icon: "💼" },
                    { threshold: 1000, description: "最大ライフで資源を1,000回取得する", icon: "💼" },
                    { threshold: 2000, description: "最大ライフで資源を2,000回取得する", icon: "💼" },
                    { threshold: 5000, description: "最大ライフで資源を5,000回取得する", icon: "💼" },
                    { threshold: 10000, description: "最大ライフで資源を10,000回取得する", icon: "💼" }
                ],
                getCurrentValue: (gameState) => gameState.resourceManagerCount || 0,
                getDisplayValue: (value) => `${Math.floor(value)}回`
            },
            {
                id: "risk_taker",
                title: "リスクテイカー",
                baseIcon: "☠️",
                levels: [
                    { threshold: 5, description: "残りライフ1でワームホールを5回通過する", icon: "☠️" },
                    { threshold: 15, description: "残りライフ1でワームホールを15回通過する", icon: "☠️" },
                    { threshold: 30, description: "残りライフ1でワームホールを30回通過する", icon: "☠️" },
                    { threshold: 50, description: "残りライフ1でワームホールを50回通過する", icon: "☠️" },
                    { threshold: 100, description: "残りライフ1でワームホールを100回通過する", icon: "☠️" },
                    { threshold: 200, description: "残りライフ1でワームホールを200回通過する", icon: "☠️" },
                    { threshold: 500, description: "残りライフ1でワームホールを500回通過する", icon: "☠️" },
                    { threshold: 1000, description: "残りライフ1でワームホールを1,000回通過する", icon: "☠️" },
                    { threshold: 2000, description: "残りライフ1でワームホールを2,000回通過する", icon: "☠️" },
                    { threshold: 5000, description: "残りライフ1でワームホールを5,000回通過する", icon: "☠️" }
                ],
                getCurrentValue: (gameState) => gameState.riskTakerCount || 0,
                getDisplayValue: (value) => `${Math.floor(value)}回`
            },
            {
                id: "miner_apprentice",
                title: "鉱石採掘師",
                baseIcon: "⛏️",
                levels: [
                    { threshold: 100, description: "鉱石を100個採掘する", icon: "⛏️" },
                    { threshold: 500, description: "鉱石を500個採掘する", icon: "⛏️" },
                    { threshold: 1000, description: "鉱石を1,000個採掘する", icon: "⛏️" },
                    { threshold: 2500, description: "鉱石を2,500個採掘する", icon: "⛏️" },
                    { threshold: 5000, description: "鉱石を5,000個採掘する", icon: "⛏️" },
                    { threshold: 10000, description: "鉱石を10,000個採掘する", icon: "⛏️" },
                    { threshold: 25000, description: "鉱石を25,000個採掘する", icon: "⛏️" },
                    { threshold: 50000, description: "鉱石を50,000個採掘する", icon: "⛏️" },
                    { threshold: 100000, description: "鉱石を100,000個採掘する", icon: "⛏️" },
                    { threshold: 200000, description: "鉱石を200,000個採掘する", icon: "⛏️" }
                ],
                getCurrentValue: (gameState) => gameState.totalOres,
                getDisplayValue: (value) => `${Math.floor(value)}個`
            },

            {
                id: "mining_master",
                title: "熟練採掘師",
                baseIcon: "💎",
                levels: [
                    { threshold: 100, description: "採掘を100回成功させる", icon: "💎" },
                    { threshold: 250, description: "採掘を250回成功させる", icon: "💎" },
                    { threshold: 500, description: "採掘を500回成功させる", icon: "💎" },
                    { threshold: 1000, description: "採掘を1,000回成功させる", icon: "💎" },
                    { threshold: 2000, description: "採掘を2,000回成功させる", icon: "💎" },
                    { threshold: 5000, description: "採掘を5,000回成功させる", icon: "💎" },
                    { threshold: 10000, description: "採掘を10,000回成功させる", icon: "💎" },
                    { threshold: 20000, description: "採掘を20,000回成功させる", icon: "💎" },
                    { threshold: 50000, description: "採掘を50,000回成功させる", icon: "💎" },
                    { threshold: 100000, description: "採掘を100,000回成功させる", icon: "💎" }
                ],
                getCurrentValue: (gameState) => gameState.totalMiningCount,
                getDisplayValue: (value) => `${Math.floor(value)}回`
            },
            {
                id: "rare_ore_collector",
                title: "レア鉱石コレクター",
                baseIcon: "💠",
                levels: [
                    { threshold: 100, description: "金鉱石を100個採掘する", icon: "💠" },
                    { threshold: 250, description: "金鉱石を250個採掘する", icon: "💠" },
                    { threshold: 500, description: "金鉱石を500個採掘する", icon: "💠" },
                    { threshold: 1000, description: "金鉱石を1,000個採掘する", icon: "💠" },
                    { threshold: 2000, description: "金鉱石を2,000個採掘する", icon: "💠" }
                ],
                getCurrentValue: (gameState) => gameState.totalEpicOres || 0,
                getDisplayValue: (value) => `${Math.floor(value)}個`
            },

            {
                id: "lucky_miner",
                title: "幸運の採掘者",
                baseIcon: "🍀",
                levels: [
                    { threshold: 10, description: "レアドロップを10回発生させる", icon: "🍀" },
                    { threshold: 50, description: "レアドロップを50回発生させる", icon: "🍀" },
                    { threshold: 150, description: "レアドロップを150回発生させる", icon: "🍀" },
                    { threshold: 300, description: "レアドロップを300回発生させる", icon: "🍀" },
                    { threshold: 500, description: "レアドロップを500回発生させる", icon: "🍀" },
                    { threshold: 1000, description: "レアドロップを1,000回発生させる", icon: "🍀" },
                    { threshold: 2000, description: "レアドロップを2,000回発生させる", icon: "🍀" },
                    { threshold: 5000, description: "レアドロップを5,000回発生させる", icon: "🍀" },
                    { threshold: 10000, description: "レアドロップを10,000回発生させる", icon: "🍀" },
                    { threshold: 20000, description: "レアドロップを20,000回発生させる", icon: "🍀" }
                ],
                getCurrentValue: (gameState) => gameState.rareMiningCount,
                getDisplayValue: (value) => `${Math.floor(value)}回`
            }
        ];
    },

    // 進捗の読み込み（修正）
    loadProgress() {
        try {
            const saved = localStorage.getItem("achievementsProgress");
            if (saved) {
                const data = JSON.parse(saved);
                this.unlockedLevels = new Map(Object.entries(data.unlockedLevels || {}));
                this.progress = new Map(Object.entries(data.progress || {}));
                this.debugLog("✅ 実績進捗を読み込み");
            } else {
                this.debugLog("📊 実績進捗データなし、新規作成");
                this.unlockedLevels = new Map();
                this.progress = new Map();
            }
        } catch (error) {
            this.debugWarn("❌ 実績進捗の読み込みに失敗:", error);
            this.unlockedLevels = new Map();
            this.progress = new Map();
        }

        // 初期化されていない実績を0レベルで設定
        this.achievements.forEach((achievement) => {
            if (!this.unlockedLevels.has(achievement.id)) {
                this.unlockedLevels.set(achievement.id, 0);
            }
        });
    },

    // 進捗の保存
    saveProgress() {
        const data = {
            unlockedLevels: Object.fromEntries(this.unlockedLevels),
            progress: Object.fromEntries(this.progress)
        };
        localStorage.setItem("achievementsProgress", JSON.stringify(data));
    },

    // ゲーム状態の更新
    update(gameState) {
        let newlyUnlocked = [];

        this.achievements.forEach((achievement) => {
            const currentLevel = this.unlockedLevels.get(achievement.id) || 0;
            const currentValue = achievement.getCurrentValue(gameState);

            // 達成可能な最大レベルを計算
            let achievedLevel = 0;
            for (let i = 0; i < achievement.levels.length; i++) {
                if (currentValue >= achievement.levels[i].threshold) {
                    achievedLevel = i + 1;
                } else {
                    break;
                }
            }

            // 新しいレベルに達したかチェック
            if (achievedLevel > currentLevel) {
                for (let level = currentLevel + 1; level <= achievedLevel; level++) {
                    newlyUnlocked.push({
                        achievement: achievement,
                        level: level,
                        levelInfo: achievement.levels[level - 1]
                    });
                    this.onAchievementLevelUp(achievement, level);
                }
                this.unlockedLevels.set(achievement.id, achievedLevel);
            }

            // 進捗計算
            const progress = this.calculateProgress(achievement, achievedLevel, currentValue);
            this.progress.set(achievement.id, progress);
        });

        this.saveProgress();

        if (newlyUnlocked.length > 0) {
            this.showLevelUpNotification(newlyUnlocked);
        }

        this.refreshAchievementsDisplay();
    },

    // 進捗計算を完全に再定義
    calculateProgress(achievement, currentLevel, currentValue) {
        // 現在のレベルが0の場合（まだ一度も達成していない）
        if (currentLevel === 0) {
            const firstThreshold = achievement.levels[0].threshold;
            return Math.min(currentValue / firstThreshold, 1);
        }

        // 最大レベル達成の場合
        if (currentLevel >= achievement.levels.length) {
            return 1;
        }

        // 中間レベルの場合
        const currentThreshold = achievement.levels[currentLevel - 1].threshold; // 現在のレベルの閾値
        const nextThreshold = achievement.levels[currentLevel].threshold; // 次のレベルの閾値

        // 現在値が現在のレベル閾値以上であることを保証
        const effectiveValue = Math.max(currentValue, currentThreshold);

        // 進捗計算（現在のレベル閾値から次のレベル閾値まで）
        return Math.min((effectiveValue - currentThreshold) / (nextThreshold - currentThreshold), 1);
    },

    // レベルアップ時の処理
    onAchievementLevelUp(achievement, newLevel) {
        const levelInfo = achievement.levels[newLevel - 1];
        this.debugLog(`🎉 実績レベルアップ: ${achievement.title} Lv${newLevel} - ${levelInfo.description}`);

        // サウンド再生
        window.SoundManager.play("achievementUnlock");

        // スクリーンリーダー通知
        if (window.announceToScreenReader) {
            announceToScreenReader(`${achievement.title} がレベル${newLevel}に上がりました`);
        }

        // パーティクルエフェクト
        if (window.Game.gameRunning && window.Particles && window.Particles.createEffect) {
            window.Particles.createEffect(window.Game.canvas.width / 2, window.Game.canvas.height / 2, "#FFD700", "achievement");
        }
    },

    // レベルアップ通知の表示
    showLevelUpNotification(levelUps) {
        levelUps.forEach((levelUp, index) => {
            setTimeout(() => {
                const notification = document.createElement("div");
                notification.className = "achievement-notification";
                notification.innerHTML = `
                    <div class="achievement-notification-content">
                        <div class="achievement-notification-icon">${levelUp.levelInfo.icon}</div>
                        <div class="achievement-notification-text">
                            <div class="achievement-notification-title">レベルアップ！</div>
                            <div class="achievement-notification-name">${levelUp.achievement.title} Lv${levelUp.level}</div>
                            <div class="achievement-notification-desc">${levelUp.levelInfo.description}</div>
                        </div>
                    </div>
                `;

                // スタイルの適用
                notification.style.cssText = `
                    position: fixed;
                    top: ${20 + index * 120}px;
                    right: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px;
                    border-radius: 10px;
                    border: 2px solid #FFD700;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                    z-index: 10000;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    max-width: 300px;
                `;

                document.body.appendChild(notification);

                // アニメーション
                setTimeout(() => {
                    notification.style.transform = "translateX(0)";
                }, 100);

                // 自動で非表示
                setTimeout(() => {
                    notification.style.transform = "translateX(400px)";
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }, 3000);
            }, index * 300); // 複数の通知を少しずつずらして表示
        });
    },

    // 実績画面の表示を更新
    refreshAchievementsDisplay() {
        const achievementsContent = document.querySelector(".achievements-content");
        if (!achievementsContent) {
            this.debugLog("❌ 実績コンテンツ要素が見つかりません");
            return;
        }

        if (window.TitleScreen.currentScreen !== "achievementsScreen") {
            if (window.Game && Game.DEBUG_MODE) {
                this.debugLog("ℹ️ 実績画面が表示されていないため更新スキップ");
            }
            return;
        }

        this.debugLog("🔄 実績表示を更新します");
        this.renderAchievements(achievementsContent);

        // デバッグ: 現在の実績状態を表示
        const gameState = this.getGameState();
        this.debugLog("📊 現在の実績状態:", {
            riskTaker: gameState.riskTakerCount,
            resourceManager: gameState.resourceManagerCount
        });
    },

    // 実績のレンダリング
    renderAchievements(container) {
        // 統計情報を計算（オプションで表示可能）
        const stats = this.getStats();

        container.innerHTML = `
        ${
            this.showStats
                ? `
            <div class="achievements-stats">
                <div class="stat-item">
                    <span class="stat-label">総合進捗:</span>
                    <span class="stat-value">${stats.completionRate}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">達成レベル:</span>
                    <span class="stat-value">${stats.currentLevels}/${stats.totalLevels}</span>
                </div>
            </div>
        `
                : ""
        }
        <div class="achievements-grid">
            ${this.achievements
                .map((achievement) => {
                    const currentLevel = this.unlockedLevels.get(achievement.id) || 0;
                    const progress = this.progress.get(achievement.id) || 0;
                    const progressPercent = Math.round(progress * 100);
                    const currentValue = achievement.getCurrentValue(this.getGameState());

                    // 現在のレベル情報
                    const currentLevelInfo = currentLevel > 0 ? achievement.levels[currentLevel - 1] : null;
                    const nextLevelInfo =
                        currentLevel < achievement.levels.length ? achievement.levels[currentLevel] : null;

                    // 表示内容の決定
                    const displayIcon = currentLevelInfo?.icon || achievement.baseIcon;
                    let displayDescription, displayStats;

                    if (nextLevelInfo) {
                        displayDescription = `Lv${currentLevel + 1}: ${nextLevelInfo.description}`;
                        displayStats = `
                        <div class="achievement-stats">
                            <span class="current-value">${achievement.getDisplayValue(currentValue)}</span>
                            <span class="next-target">${achievement.getDisplayValue(nextLevelInfo.threshold)}</span>
                        </div>
                    `;
                    } else if (currentLevelInfo) {
                        displayDescription = `最大レベル達成`;
                        displayStats = `
                        <div class="achievement-stats">
                            <span class="current-value">${achievement.getDisplayValue(currentValue)}</span>
                        </div>
                    `;
                    } else {
                        displayDescription = achievement.levels[0].description;
                        displayStats = `
                        <div class="achievement-stats">
                            <span class="current-value">${achievement.getDisplayValue(currentValue)}</span>
                            <span class="next-target">${achievement.getDisplayValue(achievement.levels[0].threshold)}</span>
                        </div>
                    `;
                    }

                    return `
                    <div class="achievement ${currentLevel > 0 ? "unlocked" : "locked"} ${this.compactMode ? "compact" : ""}">
                        <div class="achievement-icon">${displayIcon}</div>
                        <div class="achievement-info">
                            <div class="achievement-header">
                                <h3>${achievement.title}</h3>
                                <span class="achievement-level">Lv.${currentLevel}</span>
                            </div>
                            <p class="achievement-description">${displayDescription}</p>
                            ${displayStats}
                            ${
                                nextLevelInfo
                                    ? `
                                <div class="achievement-progress">
                                    <div class="progress-info">
                                        <span>進捗</span>
                                        <span class="progress-text">${progressPercent}%</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                                    </div>
                                </div>
                            `
                                    : ""
                            }
                        </div>
                        ${
                            currentLevel >= achievement.levels.length
                                ? '<div class="achievement-badge max-level">MAX</div>'
                                : currentLevel > 0
                                  ? '<div class="achievement-badge">Lv.' + currentLevel + "</div>"
                                  : ""
                        }
                    </div>
                `;
                })
                .join("")}
        </div>
    `;
    },

    // ゲーム状態の取得（修正）
    getGameState() {
        // 累積距離をローカルストレージから直接取得
        let totalDistance = 0;
        try {
            const saved = localStorage.getItem("totalCumulativeDistance");
            if (saved) {
                totalDistance = parseInt(saved) || 0;
            }
        } catch (error) {
            this.debugWarn("❌ 累積距離の読み込みに失敗:", error);
        }

        // 現在のゲーム距離を加算（ゲーム実行中の場合）
        if (window.Game && window.Game.gameRunning && window.Game.distance) {
            totalDistance += window.Game.distance;
        }

        return {
            distance: totalDistance,
            shieldCollectCount: window.Game.totalShieldCollectCount || 0,
            wormholeCount: window.Game.totalWormholePassCount || 0,
            resourceCollectCount: window.Game.totalResourceCollectCount || 0,
            dodgeCount: window.Game.totalDodgeCount || 0,
            shieldCrashCount: window.Game.totalShieldCrashCount || 0,
            resourceManagerCount: window.Game.totalResourceManagerCount || 0,
            riskTakerCount: window.Game.totalRiskTakerCount || 0,
            maxScore: window.Game.maxScore || 0,
            // 採掘データ
            totalOres: window.Game.totalOres || 0,
            totalMiningCount: window.Game.totalMiningCount || 0,
            rareMiningCount: window.Game.rareMiningCount || 0,
            totalEpicOres: window.Game.totalEpicOres || 0,
            // 弾破壊カウント
            bulletDestructionCount: window.Game.totalBulletDestructionCount || 0,
            // 至近距離破壊カウント
            closestObstacleDestructionCount: window.Game.totalClosestObstacleDestructionCount || 0,
            // 燃料20%以下の状態で隕石を回避
            lowFuelDodges: window.Game.totalLowFuelDodges || 0
        };
    },

    // 累積飛行距離を計算するメソッド（循環参照を避けるため分離）
    calculateTotalDistance() {
        try {
            const saved = localStorage.getItem("totalCumulativeDistance");
            if (saved) {
                return parseInt(saved) || 0;
            }
        } catch (error) {
        }
        return 0;
    },

    // 累積飛行距離を保存するメソッドを追加
    saveTotalDistance(distance) {
        try {
            if (distance > 0) {
                const currentTotal = this.calculateTotalDistance();
                const newTotal = currentTotal + distance;
                localStorage.setItem("totalCumulativeDistance", newTotal.toString());
                this.debugLog("💾 累積距離を保存:", { currentTotal, distance, newTotal });
            }
        } catch (error) {
            console.error("❌ 累積距離の保存に失敗:", error);
        }
    },

    // 実績画面を開いた時の処理（修正）
    onAchievementsScreenOpen() {
        // 確実に最新の累積データを読み込む
        if (window.Game && window.Game.loadCumulativeStats) {
            window.Game.loadCumulativeStats();
        }

        this.update(this.getGameState());
        const container = document.querySelector(".achievements-content");
        if (container) {
            this.renderAchievements(container);
        }
    },

    // タイトル画面表示時にも呼び出せるメソッドを追加
    refreshOnScreenOpen() {
        if (window.Game && window.Game.loadCumulativeStats) {
            window.Game.loadCumulativeStats();
        }
        this.update(this.getGameState());
        this.refreshAchievementsDisplay();
    },

    // 統計情報の取得
    getStats() {
        const totalPossibleLevels = this.achievements.reduce((sum, a) => sum + a.levels.length, 0);
        const currentLevels = Array.from(this.unlockedLevels.values()).reduce((sum, level) => sum + level, 0);
        const completionRate = Math.round((currentLevels / totalPossibleLevels) * 100);

        return {
            totalAchievements: this.achievements.length,
            totalLevels: totalPossibleLevels,
            currentLevels: currentLevels,
            completionRate: completionRate
        };
    },

    // 実績リセット（デバッグ用）
    reset() {
        this.unlockedLevels = new Map();
        this.progress = new Map();
        this.achievements.forEach((achievement) => {
            this.unlockedLevels.set(achievement.id, 0);
        });
        this.saveProgress();
        this.debugLog("🔄 実績をリセットしました");
    }
};


window.Achievements = Achievements;
