
// ============================================================
// powerups.js
// PowerUps — シールド・パワーアップ
// ============================================================
const PowerUps = {
    powerups: [],
    activeShield: false,
    shieldEndTime: 0,
    shieldTimeout: null, // 追加: タイムアウトIDを追跡
    SHIELD_DURATION: 5000, // 5秒間

    // ゲーム設定
    POWERUP_SPAWN_RATE: 0.01,

    init() {
        this.powerups = [];
        this.activeShield = false;
        this.shieldEndTime = 0;
    },

    reset() {
        this.powerups = [];
        this.activeShield = false;
        this.shieldEndTime = 0;

        // 🔥 重要: 基本シールド時間はリセットしない（ゲーム中は延長効果を保持）

        // タイムアウトをクリア
        if (this.shieldTimeout) {
            clearTimeout(this.shieldTimeout);
            this.shieldTimeout = null;
        }

        window.UI.updateShieldStatus(false);
        window.UI.hideShieldEffect();

        // バリアエフェクトも削除
        this.removePlayerBarrier();
    },

    spawn(canvas) {
        // サイズをcanvas幅の7〜10%に比例
        const size = canvas.width * (Math.random() * 0.03 + 0.07);
        const speed = canvas.height * (Math.random() * 0.004 + 0.002);
        const powerup = {
            x: Math.random() * (canvas.width - size),
            y: -size,
            width: size,
            height: size,
            speed,
            type: "shield"
        };
        this.powerups.push(powerup);
    },

    update(canvas, playerBounds) {
        // シールド状態の更新
        if (this.activeShield && Date.now() > this.shieldEndTime) {
            this.deactivateShield();
        }

        // パワーアップアイテムの更新
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            this.powerups[i].y += this.powerups[i].speed;

            // 衝突判定
            if (window.Obstacles.checkCollision(playerBounds, this.powerups[i])) {
                this.collectPowerup(this.powerups[i]);
                this.powerups.splice(i, 1);
                continue;
            }

            // 画面外のパワーアップを削除
            if (this.powerups[i].y > canvas.height * 0.85) {
                this.powerups.splice(i, 1);
            }
        }

        this.updateShieldCooldown();
    },

    collectPowerup(powerup) {
        switch (powerup.type) {
            case "shield":
                this.activateShield();

                if (window.Game.gameRunning && !powerup.collected) {
                    window.Game.scoreBreakdown.shield += window.Game.SHIELD_SCORE;
                    window.Game.shieldCollectCount++;
                    window.Game.totalShieldCollectCount++;
                    window.Game.saveCumulativeStats(); // 即時保存
                    powerup.collected = true;
                }

                this.showCollectText("シールド取得！", powerup.x, powerup.y, "#00ffff", powerup);
                window.SoundManager.play("powerup");
                break;
        }

        window.Particles.createEffect(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, "#00ffff");
    },

    // シールド衝突時の採掘処理
    handleShieldMining(collisionX, collisionY, obstacleSize = null) {
        // 採掘試行回数を記録
        this.recordMiningAttempt();

        // 採掘確率判定（基本確率 + ボーナス）
        const baseRate = this.getEffectiveMiningRate(); // 変更: ブースト効果を反映した確率を使用
        const bonusRate = this.calculateMiningBonus(obstacleSize);
        const totalRate = Math.min(baseRate + bonusRate, 0.9);

        if (Math.random() < totalRate) {
            // 採掘成功を記録
            this.recordSuccessfulMining();

            // コンボシステム更新
            this.updateMiningCombo();

            // 鉱石の種類を決定（コンボボーナス適用）
            const oreType = this.determineOreTypeWithBonus();
            const oreConfig = Game.ORE_TYPES[oreType];

            // 採掘量の計算（コンボボーナス適用）
            const baseAmount =
                Math.floor(Math.random() * (oreConfig.maxAmount - oreConfig.minAmount + 1)) + oreConfig.minAmount;
            const finalAmount = this.applyComboBonus(baseAmount);
            const totalValue = finalAmount * oreConfig.value;

            // ▼▼▼ 格納庫への鉱石追加 ▼▼▼
            if (window.StorageSystem && window.StorageSystem.addResource) {
                const resourceType = oreType.toLowerCase();
                window.StorageSystem.addResource(resourceType, finalAmount);


                // ゲーム中のUI通知
                if (window.UI && window.UI.showFloatingText) {
                    window.UI.showFloatingText(`+${finalAmount} ${oreConfig.name}`, collisionX, collisionY, oreConfig.color);
                }
            }
            // ▲▲▲ 追加終了 ▲▲▲

            // 鉱石数の更新（既存の処理）
            this.updateOreCounts(oreType, finalAmount, totalValue);

            // 詳細な統計を更新
            this.updateDetailedStats(oreType, finalAmount, totalValue);

            // 累積データを保存
            window.Game.saveCumulativeStats();


            // 採掘エフェクト
            this.showMiningEffect(collisionX, collisionY, finalAmount, oreType, oreConfig);

            // 採掘効果音を再生
            this.playMiningSound(oreType, finalAmount, oreConfig);

            // 触覚フィードバック
            this.triggerMiningVibration(oreType, finalAmount);

            // 種類別のアイコン点滅
            if (window.UI && window.UI.blinkOreByType) {
                window.UI.blinkOreByType(oreType);
            }

            // 実績システムを更新
            if (window.Achievements && window.Achievements.update) {
                window.Achievements.update(window.Achievements.getGameState());
            }

            return {
                type: oreType,
                amount: finalAmount,
                value: totalValue,
                config: oreConfig,
                combo: window.Game.miningCombo,
                bonusRate: bonusRate,
                efficiency: this.getMiningEfficiency()
            };
        } else {
            // 採掘失敗時もコンボをリセット
            this.resetMiningCombo();
            return null;
        }
    },

    // 効果的な採掘確率を計算
    getEffectiveMiningRate() {
        let baseRate = window.Game.MINING_DROP_RATE;

        // 採掘ブーストアイテム効果を適用
        if (window.Game.activeEffects && window.Game.activeEffects.mining_boost) {
            const boostEffect = Game.activeEffects.mining_boost;
            const boostMultiplier = 1 + (boostEffect.effect?.miningRate || 0.1);
            baseRate *= boostMultiplier;
        }

        return Math.min(baseRate, 0.9); // 最大90%に制限
    },

    // 採掘試行記録
    recordMiningAttempt() {
        window.Game.currentSessionStats.miningAttempts++;
        window.Game.miningStats.totalMiningAttempts++;

        // 時間間隔の記録
        const currentTime = Date.now();
        if (window.Game.lastMiningAttemptTime > 0) {
            const interval = currentTime - Game.lastMiningAttemptTime;
            // 平均間隔を更新（移動平均）
            if (window.Game.miningStats.miningTimeStats.averageMiningInterval === 0) {
                window.Game.miningStats.miningTimeStats.averageMiningInterval = interval;
            } else {
                window.Game.miningStats.miningTimeStats.averageMiningInterval =
                    window.Game.miningStats.miningTimeStats.averageMiningInterval * 0.9 + interval * 0.1;
            }
        }
        window.Game.lastMiningAttemptTime = currentTime;
    },

    // 採掘成功記録
    recordSuccessfulMining() {
        window.Game.currentSessionStats.successfulMining++;
        window.Game.miningStats.totalSuccessfulMining++;

        // 効率の更新
        this.updateMiningEfficiency();
    },

    // 採掘効率計算
    updateMiningEfficiency() {
        if (window.Game.miningStats.totalMiningAttempts > 0) {
            window.Game.miningStats.miningEfficiency =
                (window.Game.miningStats.totalSuccessfulMining / window.Game.miningStats.totalMiningAttempts) * 100;
        }
    },

    // 採掘効率取得
    getMiningEfficiency() {
        return window.Game.miningStats.miningEfficiency.toFixed(1);
    },

    // 詳細統計更新
    updateDetailedStats(oreType, amount, totalValue) {
        // 鉱石分布の更新
        switch (oreType) {
            case "COMMON":
                window.Game.miningStats.oreDistribution.common += amount;
                break;
            case "RARE":
                window.Game.miningStats.oreDistribution.rare += amount;
                break;
            case "EPIC":
                window.Game.miningStats.oreDistribution.epic += amount;
                break;
        }

        // コンボ履歴の記録
        window.Game.currentSessionStats.comboHistory.push(window.Game.miningCombo);
        if (window.Game.currentSessionStats.comboHistory.length > 50) {
            window.Game.currentSessionStats.comboHistory.shift(); // 古い記録を削除
        }

        // ベストコンボの更新
        if (window.Game.miningCombo > window.Game.miningStats.bestCombo) {
            window.Game.miningStats.bestCombo = window.Game.miningCombo;
        }
    },

    // 採掘ボーナス計算
    calculateMiningBonus(obstacleSize) {
        let totalBonus = 0;

        // 1. 距離ボーナス
        const distanceBonus = Math.floor(Game.distance / Game.DISTANCE_BONUS_INTERVAL) * Game.DISTANCE_BONUS_RATE;
        totalBonus += distanceBonus;

        // 2. シールド時間ボーナス
        if (PowerUps.isShieldActive()) {
            const remainingTime = PowerUps.getRemainingShieldTime();
            const shieldBonus = (remainingTime / 1000) * Game.SHIELD_TIME_BONUS_RATE;
            totalBonus += shieldBonus;
        }

        // 3. 大型隕石ボーナス
        if (obstacleSize && obstacleSize >= window.Game.LARGE_ASTEROID_BONUS.sizeThreshold) {
            totalBonus += window.Game.LARGE_ASTEROID_BONUS.bonusRate;
        }

        // 4. アップグレードボーナス
        const miningUpgrade = Game.SHOP_SYSTEM.UPGRADES.miningEfficiency;
        if (miningUpgrade.level > 0) {
            const upgradeBonus = miningUpgrade.effect[miningUpgrade.level - 1];
            totalBonus += upgradeBonus;
        }

        // 5. 採掘ブーストボーナス
        if (window.Game.activeEffects && window.Game.activeEffects.mining_boost) {
            const boostBonus = Game.activeEffects.mining_boost.effect?.miningRate || 0.1;
            totalBonus += boostBonus;
        }


        return totalBonus;
    },

    // コンボボーナス適用
    applyComboBonus(baseAmount) {
        if (window.Game.miningCombo > 1) {
            const comboBonus = 1 + Game.miningCombo * Game.MINING_COMBO_BONUS;
            return Math.floor(baseAmount * comboBonus);
        }
        return baseAmount;
    },

    // コンボシステム更新
    updateMiningCombo() {
        const currentTime = Date.now();

        // コンボタイムアウトチェック
        if (currentTime - window.Game.lastMiningTime > window.Game.MINING_COMBO_TIMEOUT) {
            window.Game.miningCombo = 0;
        }

        // コンボを増加
        const oldCombo = Game.miningCombo;
        window.Game.miningCombo++;
        window.Game.maxMiningCombo = Math.max(window.Game.maxMiningCombo, window.Game.miningCombo);
        window.Game.lastMiningTime = currentTime;

        // ▼▼▼ コンボ更新時の効果音 ▼▼▼
        if (window.Game.miningCombo > oldCombo && window.Game.miningCombo > 1) {
            if (window.UI && window.UI.onComboUpdated) {
                window.UI.onComboUpdated();
            }
        }
        // ▲▲▲ 追加終了 ▲▲▲

        // コンボ表示
        this.showComboText();
    },

    // コンボリセット
    resetMiningCombo() {
        window.Game.miningCombo = 0;
        window.Game.lastMiningTime = 0;
    },

    // コンボ表示
    showComboText() {
        if (window.Game.miningCombo <= 1) return;

        const gameArea = document.querySelector(".game-area");
        if (!gameArea) return;

        const comboElement = document.createElement("div");
        comboElement.className = "mining-combo";
        comboElement.textContent = `コンボ ${window.Game.miningCombo}!`;
        comboElement.style.cssText = `
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 24px;
        font-weight: bold;
        color: #FFD700;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
        z-index: 1000;
        animation: comboPop 1s ease-out;
    `;

        gameArea.appendChild(comboElement);

        setTimeout(() => {
            if (comboElement.parentNode) {
                comboElement.parentNode.removeChild(comboElement);
            }
        }, 1000);
    },

    // 新しいメソッド: コンボボーナスを適用した鉱石種類決定
    determineOreTypeWithBonus() {
        const baseType = this.determineOreType();

        // コンボが高いほど高品質な鉱石が出やすくなる
        if (window.Game.miningCombo >= 5 && Math.random() < 0.3) {
            // コンボ5以上で30%の確率で1段階品質アップ
            switch (baseType) {
                case "COMMON":
                    return "RARE";
                case "RARE":
                    return "EPIC";
                default:
                    return baseType;
            }
        }

        return baseType;
    },

    // 新しいメソッド: 鉱石の種類を決定
    determineOreType() {
        const rand = Math.random();
        let accumulatedRate = 0;

        const types = ["COMMON", "RARE", "EPIC"];
        for (const type of types) {
            accumulatedRate += window.Game.ORE_TYPES[type].dropRate;
            if (rand <= accumulatedRate) {
                return type;
            }
        }

        return "COMMON"; // フォールバック
    },

    // 新しいメソッド: 鉱石カウントを更新
    updateOreCounts(oreType, amount, totalValue) {
        // セッションカウント更新
        switch (oreType) {
            case "COMMON":
                window.Game.sessionCommonOres += amount;
                window.Game.totalCommonOres += amount;
                break;
            case "RARE":
                window.Game.sessionRareOres += amount;
                window.Game.totalRareOres += amount;
                break;
            case "EPIC":
                window.Game.sessionEpicOres += amount;
                window.Game.totalEpicOres += amount;
                break;
        }

        // 総合カウントも更新（互換性維持）
        window.Game.sessionOres += totalValue;
        window.Game.totalOres += totalValue;
        window.Game.sessionMiningCount++;
        window.Game.totalMiningCount++;

        // レアドロップカウント（EPICのみ）
        if (oreType === "EPIC") {
            window.Game.rareMiningCount++;
        }
    },

    // 採掘時の振動
    triggerMiningVibration(oreType, amount) {
        if (!window.Game.supportsVibration()) return;

        try {
            switch (oreType) {
                case "EPIC":
                    window.Game.vibrate([150, 50, 150, 50, 200]); // 強いパルス振動
                    break;
                case "RARE":
                    window.Game.vibrate([100, 30, 100]); // 中程度のパルス振動
                    break;
                default:
                    const baseDuration = Game.VIBRATION_MIN_DURATION;
                    const bonusDuration = Math.min(
                        window.Game.VIBRATION_MAX_DURATION - window.Game.VIBRATION_MIN_DURATION,
                        amount * 10
                    );
                    window.Game.vibrate(baseDuration + bonusDuration);
            }
        } catch (error) {
        }
    },

    // 採掘効果音再生
    playMiningSound(oreType, amount, oreConfig) {
        if (!window.SoundManager.enabled || !this.isMiningSoundEnabled()) return;

        try {
            switch (oreType) {
                case "EPIC":
                    // エピック鉱石：特別な音のシーケンス
                    window.SoundManager.play("miningRare");
                    setTimeout(() => {
                        if (this.isMiningSoundEnabled()) {
                            window.SoundManager.play("epicOreGet");
                        }
                    }, 200);
                    setTimeout(() => {
                        if (this.isMiningSoundEnabled()) {
                            window.SoundManager.play("miningCollect");
                        }
                    }, 500);
                    break;

                case "RARE":
                    // レア鉱石：特別音
                    window.SoundManager.play("miningRare");
                    setTimeout(() => {
                        if (this.isMiningSoundEnabled()) {
                            window.SoundManager.play("rareOreGet");
                        }
                    }, 150);
                    break;

                default:
                    // 通常鉱石：基本音
                    window.SoundManager.play("mining");
            }

            // スクリーンリーダー通知
            if (window.announceToScreenReader) {
                const message = `${oreConfig.name}を${amount}個獲得`;
                announceToScreenReader(message);
            }
        } catch (error) {
        }
    },

    // 採掘効果音が有効かチェック
    isMiningSoundEnabled() {
        // UIモジュールから設定を読み込む
        if (window.UI && window.UI.loadMiningSoundSetting) {
            return window.UI.loadMiningSoundSetting();
        }
        return true; // デフォルトで有効
    },

    // 採掘エフェクト表示
    showMiningEffect(x, y, amount, oreType, oreConfig) {

        // 鉱石の種類に応じたエフェクトタイプ
        const effectType = `mining${oreType}`;
        const effectColor = oreConfig.color;

        // パーティクルエフェクトを生成
        window.Particles.createEffect(x, y, effectColor, effectType);

        // フローティングテキストを表示
        this.showMiningText(amount, x, y, oreType, oreConfig);

        // レアドロップ時の特別エフェクト
        if (oreType === "RARE" || oreType === "EPIC") {
            this.showRareMiningEffect(oreType, oreConfig);
        }
    },

    // 新しいメソッド: レアドロップ特別エフェクト
    showRareMiningEffect(oreType, oreConfig) {
        const gameArea = document.querySelector(".game-area");
        if (!gameArea) return;

        // 画面フラッシュ効果
        const flash = document.createElement("div");
        flash.className = `mining-flash mining-flash-${oreType.toLowerCase()}`;
        flash.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999;
    `;

        // 鉱石の種類に応じたフラッシュ色
        if (oreType === "RARE") {
            flash.style.background = "radial-gradient(circle, rgba(192,192,192,0.2) 0%, rgba(0,0,0,0) 70%)";
        } else if (oreType === "EPIC") {
            flash.style.background = "radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(0,0,0,0) 70%)";
        }

        gameArea.appendChild(flash);

        // アニメーション適用
        setTimeout(() => {
            flash.style.opacity = "1";
            flash.style.transform = "scale(1)";
        }, 10);

        // エフェクト終了後に削除
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 1000);

        // ▼▼▼ 追加の視覚効果（エピックのみ）▼▼▼
        if (oreType === "EPIC") {
            this.showEpicSpecialEffects();
        }
        // ▲▲▲ 追加終了 ▲▲▲
    },

    // 新しいメソッド: エピック鉱石用の特別効果
    showEpicSpecialEffects() {
        const gameArea = document.querySelector(".game-area");
        if (!gameArea) return;

        // 1. 光の輪エフェクト
        this.createLightRing();

        // 2. 画面シェイク
        this.addEpicScreenShake();

        // 3. 星屑エフェクト
        this.createStarBurst();
    },

    // 新しいメソッド: 光の輪エフェクト
    createLightRing() {
        const gameArea = document.querySelector(".game-area");
        const lightRing = document.createElement("div");
        lightRing.className = "epic-light-ring";
        lightRing.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        margin: -50px 0 0 -50px;
        border: 3px solid #FFD700;
        border-radius: 50%;
        pointer-events: none;
        z-index: 998;
        box-shadow: 0 0 30px #FFD700;
    `;

        gameArea.appendChild(lightRing);

        // アニメーション
        setTimeout(() => {
            lightRing.style.transform = "scale(3)";
            lightRing.style.opacity = "0";
        }, 10);

        setTimeout(() => {
            if (lightRing.parentNode) {
                lightRing.parentNode.removeChild(lightRing);
            }
        }, 1000);
    },

    // 新しいメソッド: エピック画面シェイク
    addEpicScreenShake() {
        const gameArea = document.querySelector(".game-area");
        if (!gameArea) return;

        gameArea.classList.add("epic-screen-shake");

        setTimeout(() => {
            gameArea.classList.remove("epic-screen-shake");
        }, 500);
    },

    // 新しいメソッド: 星屑エフェクト
    createStarBurst() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // 金色の星屑を多数生成
        for (let i = 0; i < 8; i++) {
            setTimeout(window.Particles.createEffect.bind(window.Particles, centerX, centerY, "#FFD700", "starBurst"), i * 100);
        }
    },

    // フローティングテキスト表示
    showMiningText(amount, x, y, oreType, oreConfig) {
        const gameArea = document.querySelector(".game-area");
        if (!gameArea) return;

        const textElement = document.createElement("div");
        textElement.className = `mining-text mining-${oreType.toLowerCase()}`;
        textElement.textContent = `+${amount} ${oreConfig.name}`;
        textElement.style.left = x + "px";
        textElement.style.top = y + "px";
        textElement.style.color = oreConfig.color;

        gameArea.appendChild(textElement);

        setTimeout(() => {
            if (textElement.parentNode) {
                textElement.parentNode.removeChild(textElement);
            }
        }, 2000);
    },

    // DOM要素プール
    textElementPool: [],
    showCollectText(text, x, y, color, powerup) {
        let textElement;

        // プールから再利用または新規作成
        if (this.textElementPool.length > 0) {
            textElement = this.textElementPool.pop();
        } else {
            textElement = document.createElement("div");
            textElement.className = `item-collect-text ${powerup.type}-collect`;
        }

        // プロパティ設定
        textElement.textContent = text;
        textElement.style.left = x + "px";
        textElement.style.top = y + "px";
        textElement.style.color = color;

        document.querySelector(".game-area").appendChild(textElement);

        setTimeout(() => {
            if (textElement.parentNode) {
                textElement.parentNode.removeChild(textElement);
                // プールに戻す
                this.textElementPool.push(textElement);
            }
        }, 1500);
    },

    // シールドアクティベート時の初期化
    activateShield() {

        // 既存のシールド状態を完全にクリア
        if (this.activeShield) {
            this.deactivateShield();
        }

        this.activeShield = true;
        this.shieldEndTime = Date.now() + this.SHIELD_DURATION; // 現在の基本時間を使用

        // UIを即時更新
        window.UI.updateShieldStatus(true, this.SHIELD_DURATION);
        window.UI.showShieldEffect();

        // プレイヤー周囲のバリアエフェクトを追加
        this.createPlayerBarrier();

        // 即時かつ継続的なバリア位置更新
        setTimeout(() => {
            const playerBounds = Player.getBounds();
            if (playerBounds) {
                this.updateBarrierPosition(playerBounds);
            }
        }, 16);


        // シールド終了タイマーを設定
        if (this.shieldTimeout) {
            clearTimeout(this.shieldTimeout);
        }

        this.shieldTimeout = setTimeout(() => {
            if (this.activeShield) {
                this.deactivateShield();
            }
        }, this.SHIELD_DURATION);

        return true;
    },

    // バリア位置の継続的更新
    updateBarrierContinuously() {
        if (this.activeShield && this.gameRunning) {
            const playerBounds = Player.getBounds();
            if (playerBounds) {
                this.updateBarrierPosition(playerBounds);
            }
            // 次のフレームでも継続的に更新
            requestAnimationFrame(() => this.updateBarrierContinuously());
        }
    },

    // プレイヤー周囲のバリアエフェクト作成
    createPlayerBarrier() {
        const playerBounds = Player.getBounds();
        const gameArea = document.querySelector(".game-area");

        if (!gameArea || !playerBounds) {
            return;
        }

        // 既存のバリアをクリア
        this.removePlayerBarrier();

        // 新しいバリア要素を作成
        const barrier = document.createElement("div");
        barrier.className = "player-shield-barrier";
        barrier.id = "playerShieldBarrier";

        // CSSスタイルを確実に適用
        barrier.style.cssText = `
        position: absolute;
        border: 2px solid #00ffff;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%);
        box-shadow: 0 0 20px #00ffff, inset 0 0 20px rgba(0, 255, 255, 0.1);
        pointer-events: none;
        z-index: 10;
        animation: shieldPulse 2s infinite;
    `;

        gameArea.appendChild(barrier);

        // 位置を即時更新
        this.updateBarrierPosition(playerBounds);

    },

    // バリア位置更新関数を追加
    updateBarrierPosition(playerBounds) {
        const barrier = document.getElementById("playerShieldBarrier");
        if (barrier && playerBounds) {
            // より正確な位置計算
            const barrierSize = 80; // バリアのサイズ（プレイヤーより大きめ）
            const offset = (barrierSize - playerBounds.width) / 2;

            barrier.style.left = playerBounds.x - offset + "px";
            barrier.style.top = playerBounds.y - offset + "px";
            barrier.style.width = barrierSize + "px";
            barrier.style.height = barrierSize + "px";

            // デバッグ用
            // if (this.debugMode) {
            //     console.log("🛡️ バリア位置更新:", {
            //         playerX: playerBounds.x,
            //         playerY: playerBounds.y,
            //         barrierLeft: barrier.style.left,
            //         barrierTop: barrier.style.top
            //     });
            // }
        } else if (!barrier && this.activeShield) {
            // バリアが存在しないがシールドがアクティブな場合は再作成
            this.createPlayerBarrier();
        }
    },

    // バリア削除関数を追加
    removePlayerBarrier() {
        const existingBarrier = document.getElementById("playerShieldBarrier");
        if (existingBarrier) {
            existingBarrier.remove();
        }
    },

    deactivateShield() {
        this.activeShield = false;
        this.shieldEndTime = 0;

        // 🔧 修正: タイムアウトの確実なクリア
        if (this.shieldTimeout) {
            clearTimeout(this.shieldTimeout);
            this.shieldTimeout = null;
        }

        window.UI.updateShieldStatus(false);
        window.UI.hideShieldEffect();

        // バリアエフェクトも削除
        this.removePlayerBarrier();

    },

    ensureBarrierSync() {
        if (this.activeShield) {
            const playerBounds = Player.getBounds();
            if (playerBounds && !document.getElementById("playerShieldBarrier")) {
                this.createPlayerBarrier();
                this.updateBarrierPosition(playerBounds);
            }
        }
    },

    // シールド状態取得
    isShieldActive() {
        return this.activeShield;
    },

    // 残り時間を正確に計算する関数を改善
    getRemainingShieldTime() {
        if (!this.activeShield || this.shieldEndTime === 0) return 0;
        const remaining = this.shieldEndTime - Date.now();
        return Math.max(0, remaining); // 0未満にならないように
    },

    draw(ctx) {
        for (const powerup of this.powerups) {
            switch (powerup.type) {
                case "shield":
                    this.drawShieldPowerup(ctx, powerup);
                    break;
            }
        }
    },

    // シールドパワーアップの描画
    drawShieldPowerup(ctx, powerup) {
        const centerX = powerup.x + powerup.width / 2;
        const centerY = powerup.y + powerup.height / 2;
        const radius = powerup.width / 2;

        // 時間に基づくアニメーション
        const time = Date.now() * 0.01;

        // 外側の光る円
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // 内側の円
        ctx.fillStyle = "#0088ff";
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // シールドのアイコン（シンプルな十字）
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();

        // 縦線
        ctx.moveTo(centerX, centerY - radius * 0.4);
        ctx.lineTo(centerX, centerY + radius * 0.4);

        // 横線
        ctx.moveTo(centerX - radius * 0.4, centerY);
        ctx.lineTo(centerX + radius * 0.4, centerY);

        ctx.stroke();

        // 回転する外側のリング
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 3, time % (Math.PI * 2), (time + Math.PI) % (Math.PI * 2));
        ctx.stroke();

        // 点滅効果
        const pulse = Math.sin(time * 0.5) * 0.3 + 0.7;
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulse})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 1, 0, Math.PI * 2);
        ctx.stroke();
    },

    // クールダウン表示の実装
    updateShieldCooldown() {
        const cooldownElement = document.getElementById("shieldCooldown");
        if (!cooldownElement) return;

        if (this.activeShield) {
            const remaining = this.getRemainingShieldTime();
            const seconds = Math.ceil(remaining / 1000);
            cooldownElement.textContent = `シールド: ${seconds}s`;
            cooldownElement.className = "item-cooldown cooldown-active";
        } else {
            cooldownElement.textContent = "";
            cooldownElement.className = "item-cooldown";
        }
    },
    // アイテム出現予告エフェクト
    spawnWarning(canvas) {
        const size = 60;
        const warning = {
            x: Math.random() * (canvas.width - size),
            y: -10, // 画面上部少し上
            width: size,
            height: size,
            duration: 60 // フレーム数
        };

        // 警告エフェクトの表示
        this.showSpawnWarning(warning.x, warning.y, warning.width);

        // 警告後に実際のアイテムを出現
        setTimeout(() => {
            this.spawn(canvas);
        }, 1000);
    },

    showSpawnWarning(x, y, size) {
        const warningElement = document.createElement("div");
        warningElement.className = "item-spawn-warning";
        warningElement.style.left = x + "px";
        warningElement.style.top = y + "px";
        warningElement.style.width = size + "px";
        warningElement.style.height = size + "px";

        document.querySelector(".game-area").appendChild(warningElement);

        // アニメーション終了後に要素を削除
        setTimeout(() => {
            warningElement.remove();
        }, 1000);
    }
};

window.PowerUps = PowerUps;

PowerUps.extendShieldDuration = function (additionalTime) {
    if (this.activeShield && this.shieldEndTime > 0) {
        this.shieldEndTime += additionalTime;
        if (this.shieldTimeout) {
            clearTimeout(this.shieldTimeout);
        }
        const remainingTime = this.shieldEndTime - Date.now();
        this.shieldTimeout = setTimeout(() => {
            if (this.activeShield) {
                this.deactivateShield();
            }
        }, remainingTime);
    } else {
        this.SHIELD_DURATION += additionalTime;
    }
    if (window.UI && UI.updateShieldStatus) {
        window.UI.updateShieldStatus(this.activeShield, this.getRemainingShieldTime());
    }
    return true;
};
