
// ============================================================
// ui.js
// UI — UI表示・統計
// ============================================================
const UI = {
    init() {
        // ゲーム画面のボタンイベントの設定
        // 設定・実績ボタンはTitleScreen.setupEventListeners()で登録するためここでは登録しない

        this.setupButtonWithSound(
            "restartBtn",
            () => {
                window.Game.restart();
                // ゲームコントロールを表示状態に戻す
                this.showGameControls();
            },
            "menuOpen"
        );

        this.setupButtonWithSound(
            "backToTitle",
            () => {
                window.Game.reset();
                window.TitleScreen.showScreen("titleScreen");
                // ゲームコントロールを表示状態に戻す
                this.showGameControls();
            },
            "menuOpen"
        );

        // 実績システムの初期化
        window.Achievements.init();

        // ゲームエリア内の統計表示をセットアップ
        this.setupGameAreaStats();

        // サウンド設定のセットアップ
        this.setupSoundSettings();

        // BGMコントロールの設定
        this.setupBGMControls();

        // 採掘効果音設定の読み込み
        this.loadMiningSoundSetting();

        // 燃料表示
        setTimeout(() => {
            try {
                this.setupFuelDisplay();
                // 初期状態を表示（Playerが初期化されるまで待機）
                setTimeout(() => {
                    if (window.Player && typeof window.Player.getFuelPercent === "function") {
                        const fuelPercent = Player.getFuelPercent();
                        const isLowFuel = Player.isLowFuel;
                        this.updateFuelDisplay(fuelPercent, isLowFuel);
                    } else {
                        // フォールバック
                        this.updateFuelDisplay(100, false);
                    }
                }, 200);
            } catch (error) {
                console.error("❌ 燃料表示初期化エラー:", error);
            }
        }, 100);

    },

    // ui.js に詳細統計表示メソッドを追加
    showDetailedMiningStats() {
        const stats = Game.miningStats;
        const session = Game.currentSessionStats;

        const efficiency = stats.miningEfficiency.toFixed(1);
        const avgInterval = (stats.miningTimeStats.averageMiningInterval / 1000).toFixed(1);

        return `
        <div class="stats-section">
            <h3>採掘統計</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">採掘効率</span>
                    <span class="stat-value">${efficiency}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">総試行回数</span>
                    <span class="stat-value">${stats.totalMiningAttempts}回</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">平均間隔</span>
                    <span class="stat-value">${avgInterval}秒</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">ベストコンボ</span>
                    <span class="stat-value">${stats.bestCombo}連続</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">今セッション</span>
                    <span class="stat-value">
                        ${session.successfulMining}/${session.miningAttempts}回成功
                        (${session.miningAttempts > 0 ? ((session.successfulMining / session.miningAttempts) * 100).toFixed(1) : 0}%)
                    </span>
                </div>
            </div>
        </div>
    `;
    },

    // ゲームエリア内の統計表示をセットアップ
    setupGameAreaStats() {
        const gameArea = document.querySelector(".game-area");
        if (gameArea && !document.querySelector(".game-area-stats")) {
            const statsContainer = document.createElement("div");
            statsContainer.className = "game-area-stats";
            statsContainer.id = "gameAreaStats";

            statsContainer.innerHTML = `
            <div class="game-area-stat">
                <span class="label">飛行距離:</span>
                <span class="value" id="gameAreaDistance">0 km</span>
            </div>
            <div class="game-area-stat">
                <span class="label">スコア:</span>
                <span class="value" id="gameAreaScore">0</span>
            </div>
            <div class="game-area-stat">
                <span class="label">ライフ:</span>
                <span class="value" id="gameAreaLives">💖💖💖</span>
            </div>
            <!-- ▼▼▼ 燃料表示を追加 ▼▼▼ -->
            <div class="game-area-stat fuel-stat">
                <span class="label">⛽燃料:</span>
                <span class="value" id="gameAreaFuel">
                    <span class="fuel-value">100%</span>
                    <span class="fuel-bar-mini">
                        <span class="fuel-fill-mini" style="width: 100%"></span>
                    </span>
                </span>
            </div>
            <!-- 鉱石表示 -->
            <div class="game-area-stat mining-stats">
                <span class="label">⛏️鉱石:</span>
                <span class="value" id="gameAreaOres">
                    <!--
                    <span class="ore-count">${window.Game.totalOres || 0}</span>
                    <span class="ore-breakdown">
                        (<span class="ore-common">${window.Game.totalCommonOres || 0}</span>|
                        <span class="ore-rare">${window.Game.totalRareOres || 0}</span>|
                        <span class="ore-epic">${window.Game.totalEpicOres || 0}</span>)
                    </span>
                    -->
                    <span class="ore-common" title="鉄鉱石">0</span>/
                    <span class="ore-rare" title="銀鉱石">0</span>/
                    <span class="ore-epic" title="金鉱石">0</span>
                </span>
            </div>
        `;

            gameArea.appendChild(statsContainer);
        }
    },

    // ゲームエリア統計表示を非表示にする
    hideGameAreaStats() {
        const gameAreaStats = document.getElementById("gameAreaStats");
        if (gameAreaStats) {
            gameAreaStats.style.display = "none";
        }
    },

    // ゲームエリア統計表示を表示する
    showGameAreaStats() {
        const gameAreaStats = document.getElementById("gameAreaStats");
        if (gameAreaStats) {
            gameAreaStats.style.display = "block";

            // 表示時の初期アニメーション
            const oreIcon = document.querySelector(".mining-stats .label");
            if (oreIcon) {
                setTimeout(() => {
                    oreIcon.classList.add("ore-icon-blink");
                    setTimeout(() => {
                        oreIcon.classList.remove("ore-icon-blink");
                    }, 1000);
                }, 500);
            }

        } else {
        }
    },

    // ライフ表示のセットアップ（従来の表示用 - 非表示になる）
    setupLivesDisplay() {
        const gameStats = document.querySelector(".game-stats");
        if (gameStats && !document.getElementById("livesDisplay")) {
            const livesElement = document.createElement("div");
            livesElement.id = "livesDisplay";
            livesElement.innerHTML = 'ライフ: <span id="livesCount">3</span>';
            livesElement.style.order = "-1"; // 先頭に表示
            livesElement.style.fontWeight = "bold";
            gameStats.insertBefore(livesElement, gameStats.firstChild);

        } else if (document.getElementById("livesDisplay")) {
            // 既に存在する場合は内容を更新
            const livesCount = document.getElementById("livesCount");
            if (livesCount) {
                livesCount.textContent = "♡♡♡";
                livesCount.style.color = "#ffffff";
            }
        }
    },

    // ライフ表示の更新（両方の表示を更新）
    updateLives(currentLives, maxLives) {
        // 従来の表示（非表示になる）
        const livesCount = document.getElementById("livesCount");
        if (livesCount) {
            const fullHearts = "💖".repeat(currentLives);
            const emptyHearts = "🤍".repeat(maxLives - currentLives);
            livesCount.textContent = fullHearts + emptyHearts;

            if (currentLives === 1) {
                livesCount.style.color = "#ff4444";
            } else if (currentLives === 2) {
                livesCount.style.color = "#ffaa00";
            } else {
                livesCount.style.color = "#ffffff";
            }
        }

        // ゲームエリア内の表示
        const gameAreaLives = document.getElementById("gameAreaLives");
        if (gameAreaLives) {
            const fullHearts = "💖".repeat(currentLives);
            const emptyHearts = "🤍".repeat(maxLives - currentLives);
            gameAreaLives.textContent = fullHearts + emptyHearts;

            if (currentLives === 1) {
                gameAreaLives.style.color = "#ff4444";
            } else if (currentLives === 2) {
                gameAreaLives.style.color = "#ffaa00";
            } else {
                gameAreaLives.style.color = "#ffffff";
            }
        }
    },

    // ゲーム開始時に統計を表示
    updateStats(distance, score, wormholeCount) {
        // 既存の表示
        const distanceElement = document.getElementById("distance");
        const scoreElement = document.getElementById("score");
        const wormholeCountElement = document.getElementById("wormholeCount");

        if (distanceElement) distanceElement.textContent = distance;
        if (scoreElement) scoreElement.textContent = Math.max(0, score);
        if (wormholeCountElement) wormholeCountElement.textContent = wormholeCount;

        // ゲームエリア内の表示
        const gameAreaDistance = document.getElementById("gameAreaDistance");
        const gameAreaScore = document.getElementById("gameAreaScore");
        const gameAreaOres = document.getElementById("gameAreaOres");

        if (gameAreaDistance) gameAreaDistance.textContent = distance + " km";
        if (gameAreaScore) {
            gameAreaScore.textContent = Math.max(0, score);
        }

        if (gameAreaOres) {
            // 格納庫データを使用して表示
            const common = StorageSystem ? StorageSystem.resources.common : Game.totalCommonOres;
            const rare = StorageSystem ? StorageSystem.resources.rare : Game.totalRareOres;
            const epic = StorageSystem ? StorageSystem.resources.epic : Game.totalEpicOres;

            gameAreaOres.innerHTML = `
            <span class="ore-common" title="鉄鉱石">${common}</span>/
            <span class="ore-rare" title="銀鉱石">${rare}</span>/
            <span class="ore-epic" title="金鉱石">${epic}</span>
        `;

            // 鉱石数が増加した時の効果
            const total = common + rare + epic;
            if (total > (this.lastOreCount || 0)) {
                this.onOreCountUpdated();
            }
        }

        // 前回の鉱石数を記録
        this.lastOreCount = window.StorageSystem
            ? window.StorageSystem.resources.common + window.StorageSystem.resources.rare + window.StorageSystem.resources.epic
            : window.Game.totalOres;

        // ライフ表示も更新
        if (window.Game.lives !== undefined) {
            this.updateLives(window.Game.lives, window.Game.maxLives);
        }

        // 燃料表示更新
        if (window.Player && window.Player.getFuelPercent) {
            const fuelPercent = Player.getFuelPercent();
            const isLowFuel = Player.isLowFuel;
            this.updateFuelDisplay(fuelPercent, isLowFuel);
        }
    },

    // スコア更新時のアニメーションを追加
    animateScoreUpdate(element, oldScore, newScore) {
        if (!element) return;

        const duration = 300; // アニメーション時間（ms）
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // イージング関数を使用して滑らかに変化
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.max(0, Math.floor(oldScore + (newScore - oldScore) * easeOut));

            element.textContent = currentValue;

            // アニメーション効果
            element.style.transform = `scale(${1 + 0.1 * easeOut})`;
            element.style.color = `rgb(255, ${255 - Math.floor(100 * easeOut)}, ${255 - Math.floor(100 * easeOut)})`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // アニメーション終了
                element.textContent = newScore;
                element.style.transform = "scale(1)";
                element.style.color = "";

                // 完了効果
                this.showScoreUpdateEffect(element);
            }
        };

        requestAnimationFrame(animate);
    },

    // スコア更新完了時の効果
    showScoreUpdateEffect(element) {
        if (!element) return;

        // 一時的な点滅効果
        element.classList.add("score-update-effect");
        setTimeout(() => {
            element.classList.remove("score-update-effect");
        }, 500);
    },

    // 鉱石数更新時の処理
    onOreCountUpdated() {
        // 効果音再生（既存のoreUpdate音）
        if (window.SoundManager.enabled) {
            window.SoundManager.play("oreUpdate");
        }

        // アイコンの点滅効果
        this.blinkOreIcon();

    },

    // 新しいメソッド: コンボ更新時の効果音
    onComboUpdated() {
        if (window.SoundManager.enabled && window.Game.miningCombo > 1) {
            // コンボ数に応じて音の高さを変化
            const comboSound = Object.create(SoundManager.presetSounds.comboUpdate);
            comboSound.frequency = 523.25 + window.Game.miningCombo * 50; // コンボごとに高く

            window.SoundManager.play("comboUpdate", {
                playbackRate: 1 + window.Game.miningCombo * 0.1 // コンボごとに速く
            });
        }
    },

    // ui.js に鉱石アイコンの点滅メソッドを追加
    blinkOreIcon() {
        const oreCommon = document.querySelector(".ore-common");
        const oreRare = document.querySelector(".ore-rare");
        const oreEpic = document.querySelector(".ore-epic");

        // すべての鉱石要素に点滅効果を適用
        [oreCommon, oreRare, oreEpic].forEach((oreElement) => {
            if (oreElement) {
                oreElement.classList.remove(
                    "ore-icon-blink",
                    "ore-blink-common",
                    "ore-blink-rare",
                    "ore-blink-epic",
                    "ore-pulse"
                );
                void oreElement.offsetWidth; // 強制リフロー
                oreElement.classList.add("ore-icon-blink");
            }
        });

        setTimeout(() => {
            [oreCommon, oreRare, oreEpic].forEach((oreElement) => {
                if (oreElement) {
                    oreElement.classList.remove("ore-icon-blink");
                    this.addConstantOrePulse();
                }
            });
        }, 600);
    },

    // 新しいメソッド: 常時点滅効果（獲得後しばらく）
    addConstantOrePulse() {
        const oreIcon = document.querySelector(".mining-stats .label");
        const oreCount = document.querySelector(".mining-stats .ore-count");

        if (oreIcon && oreCount) {
            // 5秒間の常時点滅
            oreIcon.classList.add("ore-pulse");
            oreCount.classList.add("ore-pulse");

            setTimeout(() => {
                oreIcon.classList.remove("ore-pulse");
                oreCount.classList.remove("ore-pulse");
            }, 5000);
        }
    },

    // 新しいメソッド: 鉱石種類に応じた点滅
    blinkOreByType(oreType) {
        const oreCommon = document.querySelector(".ore-common");
        const oreRare = document.querySelector(".ore-rare");
        const oreEpic = document.querySelector(".ore-epic");

        // 対象となる鉱石要素を決定
        let targetOre = null;
        switch (oreType) {
            case "COMMON":
                targetOre = oreCommon;
                break;
            case "RARE":
                targetOre = oreRare;
                break;
            case "EPIC":
                targetOre = oreEpic;
                break;
        }

        if (targetOre) {
            // 既存のアニメーションをクリア
            const classes = ["ore-icon-blink", "ore-blink-common", "ore-blink-rare", "ore-blink-epic", "ore-pulse"];
            classes.forEach((className) => {
                targetOre.classList.remove(className);
            });

            // 強制リフロー
            void targetOre.offsetWidth;

            // 種類に応じたアニメーションを適用
            let blinkClass = "ore-blink-common";
            switch (oreType) {
                case "RARE":
                    blinkClass = "ore-blink-rare";
                    break;
                case "EPIC":
                    blinkClass = "ore-blink-epic";
                    break;
            }

            targetOre.classList.add(blinkClass);

            // 一時的な点滅後に常時点滅に移行
            setTimeout(() => {
                targetOre.classList.remove(blinkClass);
                targetOre.classList.add("ore-pulse");

                // 10秒後に点滅を終了
                setTimeout(() => {
                    targetOre.classList.remove("ore-pulse");
                }, 10000);
            }, 1000);
        }
    },

    // 以下は既存のメソッドを維持...
    updateShieldStatus(isActive, remainingTime = 0) {
        // 既存の実装を維持
        const shieldStatus = document.getElementById("shieldStatus");

        if (!shieldStatus) {
            console.error("❌ shieldStatus 要素が見つかりません");
            return;
        }

        if (isActive) {
            const seconds = Math.ceil(remainingTime / 1000);
            shieldStatus.textContent = `残り ${seconds}秒`;
            shieldStatus.style.color = "#00ffff";
            shieldStatus.style.fontWeight = "bold";
        } else {
            shieldStatus.textContent = "なし";
            shieldStatus.style.color = "";
            shieldStatus.style.fontWeight = "";
        }
    },

    showWormholeEffect() {
        const effect = document.getElementById("wormholeEffect");
        effect.style.opacity = "1";

        setTimeout(() => {
            effect.style.opacity = "0";
        }, 1000);
    },

    showShieldEffect() {
        const effect = document.getElementById("shieldEffect");
        effect.style.opacity = "0.7";
        effect.classList.add("shield-active");
    },

    hideShieldEffect() {
        const effect = document.getElementById("shieldEffect");
        effect.style.opacity = "0";
        effect.classList.remove("shield-active");
    },

    // ゲームオーバー表示
    showGameOver(distance, score) {

        // データ同期を確実に実行
        if (window.StorageSystem && window.StorageSystem.onGameOver) {
            window.StorageSystem.onGameOver();
        }

        // ゲームエリア統計を非表示
        this.hideGameAreaStats();

        // 統計画面を表示
        this.showStatsScreen(distance, score);

        // 効果音再生
        if (window.SoundManager.enabled) {
            setTimeout(() => {
                window.SoundManager.play("menuOpen");
            }, 500);
        }
    },

    // 統計画面表示
    showStatsScreen(distance, score) {

        // ▼▼▼ データ同期を確実に実行 ▼▼▼
        if (window.StorageSystem && window.StorageSystem.finalDataConsistencyCheck) {
            window.StorageSystem.finalDataConsistencyCheck();
        }

        // 統計データを準備して表示
        this.prepareStatsData(distance, score);

        // 統計画面を表示
        window.TitleScreen.showScreen("statsScreen");

    },

    // 統計データの準備と表示
    prepareStatsData(distance, score) {

        const scoreBreakdown = Game.scoreBreakdown;

        // 飛行距離はスコアに含めないため flightScore は使用しない

        // 各アイテムの獲得数を計算
        const wormholeCount = Math.floor(scoreBreakdown.wormhole / Game.WORMHOLE_SCORE);
        const shieldCount = Math.floor(scoreBreakdown.shield / Game.SHIELD_SCORE);
        const resourceCount = Math.floor(scoreBreakdown.resource / Game.RESOURCE_SCORE);
        const bulletDestructionCount = Math.floor(scoreBreakdown.bullet / Game.BULLET_DESTRUCTION_SCORE);

        // デバッグ: すべてのデータソースを確認

        // 格納庫データが利用可能か確認
        if (!window.StorageSystem) {
            console.error("❌ 格納庫システムが利用できません");
            // フォールバック: ゲームデータを使用
            var commonOres = window.Game.totalCommonOres;
            var rareOres = window.Game.totalRareOres;
            var epicOres = window.Game.totalEpicOres;
        } else {
            // メイン: 格納庫データを使用
            var commonOres = window.StorageSystem.resources.common;
            var rareOres = window.StorageSystem.resources.rare;
            var epicOres = window.StorageSystem.resources.epic;
        }

        const totalOres = commonOres + rareOres + epicOres;

        // セッション獲得量（ゲームデータから）
        const sessionCommon = Game.sessionCommonOres || 0;
        const sessionRare = Game.sessionRareOres || 0;
        const sessionEpic = Game.sessionEpicOres || 0;
        const sessionTotal = sessionCommon + sessionRare + sessionEpic;


        // 採掘サマリー用の比率計算（sessionCommon/Rare/Epic/totalは上で定義済み）
        const miningHTML = sessionTotal === 0
            ? '<div class="mining-empty">今回の採掘なし</div>'
            : `<div class="mining-ore-list">
                ${sessionCommon > 0 ? `<div class="mining-ore-row">
                    <span class="mining-ore-label">⚙️ 鉄</span>
                    <div class="mining-bar-wrap"><div class="mining-bar mining-bar-common" style="width:${Math.round(sessionCommon/sessionTotal*100)}%"></div></div>
                    <span class="mining-ore-value">+${sessionCommon}</span>
                    <span class="mining-ore-accum">(累積${commonOres})</span>
                </div>` : ""}
                ${sessionRare > 0 ? `<div class="mining-ore-row">
                    <span class="mining-ore-label">🔗 銀</span>
                    <div class="mining-bar-wrap"><div class="mining-bar mining-bar-rare" style="width:${Math.round(sessionRare/sessionTotal*100)}%"></div></div>
                    <span class="mining-ore-value">+${sessionRare}</span>
                    <span class="mining-ore-accum">(累積${rareOres})</span>
                </div>` : ""}
                ${sessionEpic > 0 ? `<div class="mining-ore-row">
                    <span class="mining-ore-label">💎 金</span>
                    <div class="mining-bar-wrap"><div class="mining-bar mining-bar-epic" style="width:${Math.round(sessionEpic/sessionTotal*100)}%"></div></div>
                    <span class="mining-ore-value">+${sessionEpic}</span>
                    <span class="mining-ore-accum">(累積${epicOres})</span>
                </div>` : ""}
            </div>`;

        // スコア内訳の得点と回数
        const wormholeScore   = scoreBreakdown.wormhole;
        const shieldItemScore = scoreBreakdown.shield;
        const resourceScore   = scoreBreakdown.resource;
        const bulletScore     = scoreBreakdown.bullet;

        // 種類別破壊カウント（弾）
        const byType      = Game.sessionDestroyedByType || { normal: 0, fast: 0, large: 0 };
        const bossCount   = Game.sessionBossDestroyed   || 0;
        const totalDestroyed = (byType.normal || 0) + (byType.fast || 0) + (byType.large || 0) + bossCount;

        // シールドによる破壊カウントと種類別内訳
        const shieldCrashCount  = Game.shieldCrashCount || 0;
        const shieldScore       = Game.scoreBreakdown.shield_destroy || 0;
        const byShield          = Game.sessionShieldDestroyedByType || { normal:0, fast:0, large:0 };

        // [A1] 新記録バッジHTML（テンプレートリテラル外で組み立て・構文エラー回避）
        const isNewRecord   = !!(window.UI && window.UI._isNewRecord);
        const prevBestScore = (window.UI && window.UI._prevBestScore > 0)
            ? window.UI._prevBestScore.toLocaleString()
            : null;
        const recordBadgeHTML = isNewRecord
            ? '<div class="stats-new-record">🎉 NEW RECORD！</div>'
            : (prevBestScore
                ? '<div class="stats-prev-best">前回ベスト: ' + prevBestScore + ' 点</div>'
                : '');

        const statsHTML = `
        <div class="stats-new-layout">

            <!-- 飛行距離 -->
            <div class="stats-row-header">
                <span class="stats-row-title">🚀 飛行距離</span>
                <span class="stats-row-total">${distance} km</span>
            </div>

            <!-- スコア -->
            <div class="stats-row-header" style="margin-top:18px;">
                <span class="stats-row-title">🏆 スコア</span>
                <span class="stats-row-total">${score} 点</span>
            </div>
            ${recordBadgeHTML}
            <table class="stats-score-table">
                <tr>
                    <td class="stats-score-icon">🌀</td>
                    <td class="stats-score-label">ワームホール</td>
                    <td class="stats-score-pts">${wormholeScore}点</td>
                    <td class="stats-score-count">(${wormholeCount}回)</td>
                </tr>
                <tr>
                    <td class="stats-score-icon">🛡️</td>
                    <td class="stats-score-label">シールド取得</td>
                    <td class="stats-score-pts">${shieldItemScore}点</td>
                    <td class="stats-score-count">(${shieldCount}個)</td>
                </tr>
                <tr>
                    <td class="stats-score-icon">⬡</td>
                    <td class="stats-score-label">資源取得</td>
                    <td class="stats-score-pts">${resourceScore}点</td>
                    <td class="stats-score-count">(${resourceCount}個)</td>
                </tr>
                <tr>
                    <td class="stats-score-icon">🔫</td>
                    <td class="stats-score-label">隕石破壊（合計）</td>
                    <td class="stats-score-pts">${bulletScore}点</td>
                    <td class="stats-score-count">(${totalDestroyed}個)</td>
                </tr>
                ${byType.normal > 0 ? `<tr>
                    <td class="stats-score-icon" style="font-size:0.75em;color:var(--color-text-secondary)">└</td>
                    <td class="stats-score-label" style="color:var(--color-text-secondary)">通常</td>
                    <td class="stats-score-pts" style="color:var(--color-text-secondary)">${byType.normal * 10}点</td>
                    <td class="stats-score-count">(${byType.normal}個)</td>
                </tr>` : ""}
                ${byType.fast > 0 ? `<tr>
                    <td class="stats-score-icon" style="font-size:0.75em;color:#FF6B6B">└</td>
                    <td class="stats-score-label" style="color:#FF6B6B">高速</td>
                    <td class="stats-score-pts" style="color:#FF6B6B">${byType.fast * 20}点</td>
                    <td class="stats-score-count">(${byType.fast}個)</td>
                </tr>` : ""}
                ${byType.large > 0 ? `<tr>
                    <td class="stats-score-icon" style="font-size:0.75em;color:#A8A8A8">└</td>
                    <td class="stats-score-label" style="color:#A8A8A8">大型</td>
                    <td class="stats-score-pts" style="color:#A8A8A8">${byType.large * 30}点</td>
                    <td class="stats-score-count">(${byType.large}個)</td>
                </tr>` : ""}
                ${bossCount > 0 ? `<tr>
                    <td class="stats-score-icon" style="font-size:0.75em;color:#FF8800">└</td>
                    <td class="stats-score-label" style="color:#FF8800">ボス</td>
                    <td class="stats-score-pts" style="color:#FF8800">${bossCount * 500}点</td>
                    <td class="stats-score-count">(${bossCount}体)</td>
                </tr>` : ""}
                <tr>
                    <td class="stats-score-icon">🛡️</td>
                    <td class="stats-score-label">シールドで破壊</td>
                    <td class="stats-score-pts">${shieldScore}点</td>
                    <td class="stats-score-count">(${shieldCrashCount}個)</td>
                </tr>
                ${byShield.normal > 0 ? `<tr>
                    <td class="stats-score-icon" style="font-size:0.75em;color:var(--color-text-secondary)">└</td>
                    <td class="stats-score-label" style="color:var(--color-text-secondary)">通常</td>
                    <td class="stats-score-pts" style="color:var(--color-text-secondary)">${byShield.normal * 10}点</td>
                    <td class="stats-score-count">(${byShield.normal}個)</td>
                </tr>` : ""}
                ${byShield.fast > 0 ? `<tr>
                    <td class="stats-score-icon" style="font-size:0.75em;color:#FF6B6B">└</td>
                    <td class="stats-score-label" style="color:#FF6B6B">高速</td>
                    <td class="stats-score-pts" style="color:#FF6B6B">${byShield.fast * 20}点</td>
                    <td class="stats-score-count">(${byShield.fast}個)</td>
                </tr>` : ""}
                ${byShield.large > 0 ? `<tr>
                    <td class="stats-score-icon" style="font-size:0.75em;color:#A8A8A8">└</td>
                    <td class="stats-score-label" style="color:#A8A8A8">大型</td>
                    <td class="stats-score-pts" style="color:#A8A8A8">${byShield.large * 30}点</td>
                    <td class="stats-score-count">(${byShield.large}個)</td>
                </tr>` : ""}
            </table>

            <!-- 採掘 -->
            <div class="stats-row-header" style="margin-top:18px;">
                <span class="stats-row-title">⛏️ 採掘</span>
                <span class="stats-row-total">${sessionTotal}個<span class="stats-row-accum">（累積: ${totalOres}個）</span></span>
            </div>
            ${sessionTotal === 0
                ? '<div class="mining-empty" style="padding-left:8px;margin-top:4px;">今回の採掘なし</div>'
                : `<table class="stats-mining-table">
                    ${sessionCommon > 0 ? `<tr>
                        <td class="stats-mining-icon">⚙️</td>
                        <td class="stats-mining-name">鉄</td>
                        <td class="stats-mining-val">${sessionCommon}個</td>
                        <td class="stats-mining-accum">（累積${commonOres}個）</td>
                    </tr>` : ""}
                    ${sessionRare > 0 ? `<tr>
                        <td class="stats-mining-icon">🔗</td>
                        <td class="stats-mining-name">銀</td>
                        <td class="stats-mining-val">${sessionRare}個</td>
                        <td class="stats-mining-accum">（累積${rareOres}個）</td>
                    </tr>` : ""}
                    ${sessionEpic > 0 ? `<tr>
                        <td class="stats-mining-icon">💎</td>
                        <td class="stats-mining-name">金</td>
                        <td class="stats-mining-val">${sessionEpic}個</td>
                        <td class="stats-mining-accum">（累積${epicOres}個）</td>
                    </tr>` : ""}
                </table>`
            }

        </div>
    `;
        const statsContent = document.getElementById("statsContent");
        if (statsContent) {
            statsContent.innerHTML = statsHTML;
        } else {
            console.error("❌ 統計コンテンツ要素が見つかりません");
        }
    },

    // ゲームオーバーコントロールを表示
    showGameOverControls() {
        const gameOverControls = document.getElementById("gameOverControls");
        const gameControls = document.getElementById("gameControls");

        if (gameOverControls) {
            gameOverControls.style.display = "flex";
        }
        if (gameControls) {
            gameControls.style.display = "none";
        }
    },

    // ゲームコントロールを表示
    showGameControls() {
        const gameOverControls = document.getElementById("gameOverControls");
        const gameControls = document.getElementById("gameControls");

        if (gameOverControls) {
            gameOverControls.style.display = "none";
        }
        if (gameControls) {
            gameControls.style.display = "flex";
        }

        // ゲームエリア統計も表示する
        this.showGameAreaStats();
    },

    hideGameOver() {
        const gameOverElement = document.getElementById("gameOver");
        if (gameOverElement) {
            gameOverElement.style.display = "none";
        }

        // コントロール表示を通常に戻す
        this.showGameControls();

        // ゲームオーバー画面が閉じられたら統計を再表示
        this.showGameAreaStats();
    },

    // ワームホールアクティブエフェクト
    showWormholeActiveEffect() {
        const effect = document.getElementById("wormholeEffect");
        effect.classList.add("enhanced");
        effect.style.opacity = "0.9";
        effect.classList.add("wormhole-active");

        // スピードラインエフェクトを生成
        this.createSpeedLines();

        setTimeout(() => {
            effect.style.opacity = "0";
            effect.classList.remove("wormhole-active", "enhanced");
        }, 2000);
    },

    createSpeedLines() {
        const gameArea = document.querySelector(".game-area");
        const linesContainer = document.createElement("div");
        linesContainer.className = "speed-lines";

        // 10本のスピードラインを生成
        for (let i = 0; i < 10; i++) {
            const line = document.createElement("div");
            line.className = "speed-line";
            line.style.left = Math.random() * 100 + "%";
            line.style.animationDelay = Math.random() * 0.5 + "s";
            linesContainer.appendChild(line);
        }

        gameArea.appendChild(linesContainer);

        // エフェクト終了後にクリーンアップ
        setTimeout(() => {
            linesContainer.remove();
        }, 1000);
    },

    showShieldHitEffect() {
        const shieldEffect = document.getElementById("shieldEffect");
        if (shieldEffect) {
            // 一時的に強く光らせる
            shieldEffect.style.opacity = "1";
            shieldEffect.style.background = "radial-gradient(circle, rgba(0,255,255,0.9) 0%, rgba(0,0,0,0) 70%)";

            // ヒットエフェクトを追加
            this.createShieldHitPulse();

            setTimeout(() => {
                if (window.PowerUps.isShieldActive()) {
                    shieldEffect.style.opacity = "0.7";
                    shieldEffect.style.background = "";
                }
            }, 300);
        }
    },

    createShieldHitPulse() {
        const gameArea = document.querySelector(".game-area");
        if (!gameArea) return;

        const hitEffect = document.createElement("div");
        hitEffect.className = "shield-hit-effect shield-hit-active";

        // 衝突位置にエフェクトを配置（簡易版）
        const lastObstacle = Obstacles.getLastCollided();
        if (lastObstacle) {
            hitEffect.style.setProperty("--mouse-x", `${lastObstacle.x}px`);
            hitEffect.style.setProperty("--mouse-y", `${lastObstacle.y}px`);
        }

        gameArea.appendChild(hitEffect);

        // エフェクト終了後に削除
        setTimeout(() => {
            hitEffect.remove();
        }, 500);
    },
    // ボタンクリックサウンド用のラッパー関数
    setupButtonWithSound(buttonId, clickHandler, soundName = "buttonClick") {
        const button = document.getElementById(buttonId);
        if (button) {
            // 既存のイベントリスナーをクリア（二重登録防止）
            button.replaceWith(button.cloneNode(true));
            const newButton = document.getElementById(buttonId);

            newButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.SoundManager.play(soundName);
                clickHandler();
            });

            newButton.addEventListener(
                "touchstart",
                (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.SoundManager.play(soundName);
                    clickHandler();
                },
                { passive: false }
            );
        }
    },

    // サウンド設定のセットアップ
    setupSoundSettings() {
        const soundToggle = document.getElementById("soundToggle");
        const soundVolume = document.getElementById("soundVolume");
        const volumeValue = document.getElementById("volumeValue");

        // 効果音ON/OFFトグル
        if (soundToggle) {
            // 初期状態を設定
            soundToggle.value = window.SoundManager.enabled ? "on" : "off";

            soundToggle.addEventListener("change", (e) => {
                const enabled = e.target.value === "on";
                window.SoundManager.setEnabled(enabled);

                // 設定変更時にテストサウンドを再生
                if (enabled) {
                    window.SoundManager.play("buttonClick");
                }


                // スクリーンリーダー通知
                if (window.announceToScreenReader) {
                    announceToScreenReader(`効果音を${enabled ? "有効" : "無効"}にしました`);
                }
            });
        }

        // 音量スライダー
        if (soundVolume && volumeValue) {
            // 初期状態を設定
            const initialVolume = Math.round(SoundManager.volume * 100);
            soundVolume.value = initialVolume;
            volumeValue.textContent = `${initialVolume}%`;

            soundVolume.addEventListener("input", (e) => {
                const volume = e.target.value / 100;
                window.SoundManager.setVolume(volume);

                // 音量表示を更新
                volumeValue.textContent = `${e.target.value}%`;

                // 音量変更時にテストサウンドを再生
                if (window.SoundManager.enabled) {
                    window.SoundManager.play("buttonClick", { volume: volume });
                }

            });
        }

        // 採掘効果音設定
        this.setupMiningSoundSettings();

        // 触覚フィードバック設定
        this.setupVibrationSettings();

    },

    // 触覚フィードバック設定
    setupVibrationSettings() {
        const vibrationToggle = document.getElementById("vibrationToggle");

        if (vibrationToggle) {
            // 初期状態を設定
            const savedSetting = this.loadVibrationSetting();
            vibrationToggle.value = savedSetting ? "on" : "off";

            // 振動がサポートされていない場合は無効化
            if (!this.supportsVibration()) {
                vibrationToggle.disabled = true;
                vibrationToggle.title = "お使いのデバイスは振動機能をサポートしていません";
            }

            vibrationToggle.addEventListener("change", (e) => {
                const enabled = e.target.value === "on";

                // 設定を保存
                this.saveVibrationSetting(enabled);

                // 設定変更時にテスト振動
                if (enabled && this.supportsVibration()) {
                    window.Game.vibrate(100);
                }


                // スクリーンリーダー通知
                if (window.announceToScreenReader) {
                    announceToScreenReader(`触覚フィードバックを${enabled ? "有効" : "無効"}にしました`);
                }
            });
        }
    },

    // 振動設定の保存
    saveVibrationSetting(enabled) {
        try {
            const settings = {
                enabled: enabled
            };
            localStorage.setItem("vibrationSettings", JSON.stringify(settings));

            // Gameの設定も更新
            window.Game.VIBRATION_ENABLED = enabled;
        } catch (error) {
        }
    },

    // 振動設定の読み込み
    loadVibrationSetting() {
        try {
            const saved = localStorage.getItem("vibrationSettings");
            if (saved) {
                const settings = JSON.parse(saved);
                // Gameの設定も更新
                window.Game.VIBRATION_ENABLED = settings.enabled !== false;
                return settings.enabled !== false;
            }
        } catch (error) {
        }

        // デフォルトでON、かつUI要素の初期値と一致させる
        const vibrationToggle = document.getElementById("vibrationToggle");
        if (vibrationToggle) {
            vibrationToggle.value = "on";
        }
        window.Game.VIBRATION_ENABLED = true;
        return true;
    },

    // 振動サポートチェック
    supportsVibration() {
        return "vibrate" in navigator;
    },

    // 採掘効果音設定
    setupMiningSoundSettings() {
        try {
            const soundSettings = document.querySelector(".sound-settings");
            if (!soundSettings) {
                //  console.warn("⚠️ サウンド設定コンテナが見つかりません");
                return;
            }

            // 既に採掘設定があるかチェック
            if (document.getElementById("miningSoundToggle")) {
                // 既存の要素がある場合はイベントリスナーのみ再設定
                this.setupExistingMiningSoundToggle();
                return;
            }

            const miningSoundHTML = `
                <div class="setting-item">
                    <label for="miningSoundToggle">採掘効果音:</label>
                    <select id="miningSoundToggle" class="setting-select">
                        <option value="on">ON</option>
                        <option value="off">OFF</option>
                    </select>
                </div>
            `;

            // 既存の設定項目の後に追加
            soundSettings.insertAdjacentHTML("beforeend", miningSoundHTML);

            // 安全にイベントリスナー設定
            this.setupExistingMiningSoundToggle();
        } catch (error) {
            // エラーを握りつぶさず、情報として記録
        }
    },

    // ヘルパーメソッドを追加
    setupExistingMiningSoundToggle() {
        const miningSoundToggle = document.getElementById("miningSoundToggle");

        if (!miningSoundToggle) {
            return;
        }

        // 初期状態を設定
        const savedSetting = this.loadMiningSoundSetting();
        miningSoundToggle.value = savedSetting ? "on" : "off";

        miningSoundToggle.addEventListener("change", (e) => {
            const enabled = e.target.value === "on";

            // 設定を保存
            this.saveMiningSoundSetting(enabled);

            // 設定変更時にテストサウンドを再生
            if (enabled && window.SoundManager.enabled) {
                window.SoundManager.play("mining");
            }


            // スクリーンリーダー通知
            if (window.announceToScreenReader) {
                announceToScreenReader(`採掘効果音を${enabled ? "有効" : "無効"}にしました`);
            }
        });
    },

    // 採掘効果音設定の保存
    saveMiningSoundSetting(enabled) {
        try {
            const settings = {
                enabled: enabled
                // 他の設定もここに追加可能
            };
            localStorage.setItem("miningSoundSettings", JSON.stringify(settings));
        } catch (error) {
        }
    },

    // 採掘効果音設定の読み込み
    loadMiningSoundSetting() {
        try {
            const miningSoundToggle = document.getElementById("miningSoundToggle");

            // nullチェック
            if (!miningSoundToggle) {
                return true; // デフォルト値を返す
            }

            const saved = localStorage.getItem("miningSoundSettings");
            if (saved) {
                const settings = JSON.parse(saved);
                const enabled = settings.enabled !== false; // デフォルトtrue

                // トグルの状態を設定
                miningSoundToggle.value = enabled ? "on" : "off";
                return enabled;
            }

            // デフォルトでON、かつUI要素の初期値と一致させる
            miningSoundToggle.value = "on";
            return true;
        } catch (error) {

            // エラー時はデフォルト値を返す
            const miningSoundToggle = document.getElementById("miningSoundToggle");
            if (miningSoundToggle) {
                miningSoundToggle.value = "on";
            }
            return true;
        }
    },

    // 燃料表示

    fuelDisplayInitialized: false,
    setupFuelDisplay() {
        if (this.fuelDisplayInitialized) {
            return; // 既に初期化済みならスキップ
        }

        const gameStats = document.querySelector(".game-stats");
        if (!gameStats) {
            console.error("❌ .game-stats 要素が見つかりません");
            return;
        }

        // 既存の燃料表示を削除（重複防止）
        const existingFuelDisplay = document.getElementById("fuelDisplay");
        if (existingFuelDisplay) {
            existingFuelDisplay.remove();
        }

        const fuelElement = document.createElement("div");
        fuelElement.id = "fuelDisplay";
        fuelElement.className = "fuel-display";
        fuelElement.innerHTML = `
        <span class="fuel-icon">⛽</span>
        <div class="fuel-bar-container">
            <div class="fuel-bar">
                <div class="fuel-fill" style="width: 100%"></div>
            </div>
        </div>
        <span class="fuel-percent">100%</span>
    `;

        try {
            const livesDisplay = document.getElementById("livesDisplay");
            if (livesDisplay && livesDisplay.parentNode) {
                livesDisplay.parentNode.insertBefore(fuelElement, livesDisplay.nextSibling);
            } else {
                gameStats.appendChild(fuelElement);
            }

            this.fuelDisplayInitialized = true;
        } catch (error) {
            console.error("❌ 燃料表示の初期化に失敗:", error);
        }
    },

    updateFuelDisplay(fuelPercent, isLowFuel = false) {
        try {
            // 燃料表示が存在するか確認
            if (!this.ensureFuelDisplay()) {
                return; // 初期化に失敗した場合は終了
            }

            const fuelDisplay = document.getElementById("fuelDisplay");
            const gameAreaFuel = document.getElementById("gameAreaFuel");

            // ゲームエリアの燃料表示を更新
            this.updateGameAreaFuelDisplay(fuelPercent, isLowFuel);

            const fuelFill = fuelDisplay.querySelector(".fuel-fill");
            const fuelPercentText = fuelDisplay.querySelector(".fuel-percent");
            const fuelIcon = fuelDisplay.querySelector(".fuel-icon");

            if (fuelFill && fuelPercentText && fuelIcon) {
                // アニメーションを適用
                fuelFill.classList.remove("fuel-consumption-effect", "fuel-gain-effect");
                void fuelFill.offsetWidth; // リフローを強制

                // 燃料消費/獲得に応じたアニメーション
                const previousPercent = parseFloat(fuelFill.style.width) || 100;
                if (fuelPercent < previousPercent) {
                    fuelFill.classList.add("fuel-consumption-effect");
                } else if (fuelPercent > previousPercent) {
                    fuelFill.classList.add("fuel-gain-effect");
                }

                fuelFill.style.width = `${fuelPercent}%`;
                fuelPercentText.textContent = `${Math.round(fuelPercent)}%`;

                // 色の更新
                this.updateFuelColors(fuelDisplay, fuelPercent, isLowFuel);
                // 警告状態の更新
                this.updateFuelWarningState(fuelDisplay, fuelPercent, isLowFuel);
            }
        } catch (error) {
            console.error("❌ 燃料表示更新中にエラー:", error);
        }
    },

    // 燃料表示の存在確認と初期化メソッド
    ensureFuelDisplay() {
        const fuelDisplay = document.getElementById("fuelDisplay");
        const gameAreaFuel = document.getElementById("gameAreaFuel");

        // どちらかの要素がなければ再初期化
        if (!fuelDisplay || !gameAreaFuel) {
            this.setupFuelDisplay();
            return false;
        }
        return true;
    },

    // 燃料消費時のエフェクトを追加
    showFuelConsumptionEffect() {
        const fuelDisplay = document.getElementById("fuelDisplay");
        if (fuelDisplay) {
            fuelDisplay.classList.add("fuel-consumption-effect");
            setTimeout(() => {
                fuelDisplay.classList.remove("fuel-consumption-effect");
            }, 300);
        }
    },

    // 燃料獲得時のエフェクトを追加
    showFuelGainEffect() {
        const fuelDisplay = document.getElementById("fuelDisplay");
        if (fuelDisplay) {
            fuelDisplay.classList.add("fuel-gain-effect");
            setTimeout(() => {
                fuelDisplay.classList.remove("fuel-gain-effect");
            }, 500);
        }
    },

    // 燃料切れ時のエフェクトを追加
    showFuelDepletionEffect() {
        const fuelDisplay = document.getElementById("fuelDisplay");
        if (fuelDisplay) {
            fuelDisplay.classList.add("fuel-depletion-effect");
            setTimeout(() => {
                fuelDisplay.classList.remove("fuel-depletion-effect");
            }, 800);
        }
    },

    // 燃料状態の更新メソッドを強化
    updateFuelWarningState(fuelDisplay, fuelPercent, isLowFuel) {
        const fuelIcon = fuelDisplay.querySelector(".fuel-icon");

        if (fuelIcon) {
            // 警告状態のクラスを更新
            fuelDisplay.classList.toggle("fuel-warning", fuelPercent <= 40 && fuelPercent > 20);
            fuelDisplay.classList.toggle("fuel-critical", fuelPercent <= 20);

            // 点滅アニメーション
            if (fuelPercent <= 20) {
                fuelIcon.classList.add("fuel-blink");
                fuelDisplay.classList.add("fuel-blink");

                // 危険状態のパルスアニメーション
                if (fuelPercent <= 10) {
                    fuelDisplay.style.animation = "fuelCriticalPulse 2s infinite";
                } else {
                    fuelDisplay.style.animation = "";
                }
            } else {
                fuelIcon.classList.remove("fuel-blink");
                fuelDisplay.classList.remove("fuel-blink");
                fuelDisplay.style.animation = "";
            }
        }
    },

    updateFuelColors(fuelDisplay, fuelPercent, isLowFuel) {
        const fuelFill = fuelDisplay.querySelector(".fuel-fill");
        const fuelPercentText = fuelDisplay.querySelector(".fuel-percent");
        const fuelIcon = fuelDisplay.querySelector(".fuel-icon");

        if (!fuelFill) {
            console.error("❌ fuel-fill要素が見つかりません");
            return;
        }

        // クラスをリセット
        fuelDisplay.classList.remove("fuel-warning", "fuel-critical");

        // 状態に応じたクラスを追加
        if (fuelPercent <= 20) {
            fuelDisplay.classList.add("fuel-critical");
        } else if (fuelPercent <= 40) {
            fuelDisplay.classList.add("fuel-warning");
        }

        // インラインスタイルで確実に色を設定（クラスが適用されない場合のフォールバック）
        if (fuelPercent <= 20) {
            // 赤: 危険状態 (20%以下)
            fuelFill.style.background = "linear-gradient(90deg, #ff4444 0%, #ff6666 30%, #ff8888 70%, #ff4444 100%)";
            fuelFill.style.boxShadow = "0 0 10px rgba(255, 68, 68, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.3)";
            if (fuelPercentText) fuelPercentText.style.color = "#ff4444";
            if (fuelIcon) fuelIcon.style.color = "#ff4444";
        } else if (fuelPercent <= 40) {
            // 黄: 警告状態 (21-40%)
            fuelFill.style.background = "linear-gradient(90deg, #ffaa00 0%, #ffbb33 30%, #ffcc44 70%, #ffaa00 100%)";
            fuelFill.style.boxShadow = "0 0 8px rgba(255, 170, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)";
            if (fuelPercentText) fuelPercentText.style.color = "#ffaa00";
            if (fuelIcon) fuelIcon.style.color = "#ffaa00";
        } else {
            // 緑: 正常状態 (41%以上)
            fuelFill.style.background = "linear-gradient(90deg, #44ff44 0%, #66ff66 30%, #88ff88 70%, #44ff44 100%)";
            fuelFill.style.boxShadow = "0 0 8px rgba(68, 255, 68, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)";
            if (fuelPercentText) fuelPercentText.style.color = "#ffffff";
            if (fuelIcon) fuelIcon.style.color = "#ffffff";
        }
    },

    lightenColor(color, percent) {
        // シンプルな色明るくする関数
        return color; // 実際の実装では色変換ロジックを追加
    },

    // 設定画面を開いた時に現在の設定を反映
    refreshSoundSettings() {
        const soundToggle = document.getElementById("soundToggle");
        const soundVolume = document.getElementById("soundVolume");
        const volumeValue = document.getElementById("volumeValue");

        if (soundToggle) {
            soundToggle.value = window.SoundManager.enabled ? "on" : "off";
        }

        if (soundVolume && volumeValue) {
            const volumePercent = Math.round(SoundManager.volume * 100);
            soundVolume.value = volumePercent;
            volumeValue.textContent = `${volumePercent}%`;
        }
    },

    setupBGMControls() {
        // 設定画面のBGMコントロール
        const bgmToggle = document.getElementById("bgmToggle");
        const bgmVolume = document.getElementById("bgmVolume");
        const bgmVolumeValue = document.getElementById("bgmVolumeValue");

        if (bgmToggle) {
            bgmToggle.value = window.BGMManager.enabled ? "on" : "off";
            bgmToggle.addEventListener("change", (e) => {
                window.BGMManager.setEnabled(e.target.value === "on");
            });
        }

        if (bgmVolume) {
            bgmVolume.value = window.BGMManager.volume * 100;
            bgmVolumeValue.textContent = `${bgmVolume.value}%`;

            bgmVolume.addEventListener("input", (e) => {
                const volume = e.target.value / 100;
                window.BGMManager.setVolume(volume);
                bgmVolumeValue.textContent = `${e.target.value}%`;
            });
        }

        // クイックコントロール
        const bgmToggleQuick = document.getElementById("bgmToggleQuick");
        const bgmVolumeQuick = document.getElementById("bgmVolumeQuick");

        if (bgmToggleQuick) {
            bgmToggleQuick.addEventListener("click", () => {
                const newState = !BGMManager.enabled;
                window.BGMManager.setEnabled(newState);
                bgmToggleQuick.classList.toggle("muted", !newState);
            });
        }

        if (bgmVolumeQuick) {
            bgmVolumeQuick.value = window.BGMManager.volume * 100;
            bgmVolumeQuick.addEventListener("input", (e) => {
                const volume = e.target.value / 100;
                window.BGMManager.setVolume(volume);
            });
        }
    },

    // フローティングテキスト表示
    showFloatingText(text, x, y, color = "#ffffff") {
        const gameArea = document.querySelector(".game-area");
        if (!gameArea) return;

        const floatingText = document.createElement("div");
        floatingText.className = "floating-text";
        floatingText.textContent = text;
        floatingText.style.left = x + "px";
        floatingText.style.top = y + "px";
        floatingText.style.color = color;

        gameArea.appendChild(floatingText);

        // アニメーション終了後に削除
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, 1500);
    },

    // 採掘獲得通知
    showMiningAcquisition(amount, oreType, oreConfig) {
        const message = `+${amount} ${oreConfig.name}`;

        // フローティングテキスト表示
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        this.showFloatingText(message, centerX, centerY, oreConfig.color);

        // 効果音
        if (window.SoundManager && window.SoundManager.play) {
            window.SoundManager.play("miningCollect");
        }

    },

    updateGameAreaFuelDisplay(fuelPercent, isLowFuel = false) {
        const gameAreaFuel = document.getElementById("gameAreaFuel");
        if (!gameAreaFuel) return;

        const fuelValue = gameAreaFuel.querySelector(".fuel-value");
        const fuelFillMini = gameAreaFuel.querySelector(".fuel-fill-mini");
        const fuelStat = document.querySelector(".fuel-stat");

        if (fuelValue) {
            fuelValue.textContent = `${Math.round(fuelPercent)}%`;
        }

        if (fuelFillMini) {
            fuelFillMini.style.width = `${fuelPercent}%`;
        }

        // 色の更新
        this.updateGameAreaFuelColors(fuelStat, fuelPercent, isLowFuel);
    },

    updateGameAreaFuelColors(fuelStat, fuelPercent, isLowFuel) {
        if (!fuelStat) return;

        const fuelFillMini = fuelStat.querySelector(".fuel-fill-mini");
        const fuelValue = fuelStat.querySelector(".fuel-value");

        // 色の設定
        let fillColor, textColor;

        if (fuelPercent <= 20) {
            fillColor = "#ff4444";
            textColor = "#ff4444";
        } else if (fuelPercent <= 40) {
            fillColor = "#ffaa00";
            textColor = "#ffaa00";
        } else {
            fillColor = "#44ff44";
            textColor = "#ffffff";
        }

        if (fuelFillMini) {
            fuelFillMini.style.backgroundColor = fillColor;
        }

        if (fuelValue) {
            fuelValue.style.color = textColor;
        }

        // 警告状態のクラスを更新
        fuelStat.classList.toggle("fuel-warning", fuelPercent <= 20);
        fuelStat.classList.toggle("fuel-critical", fuelPercent <= 10);
    }
};


// タイトル画面関連の機能
window.UI = UI;

// ============================================================
// titlescreen.js
// TitleScreen — 画面遷移・ポーズ制御
// ============================================================
const TitleScreen = {
    currentScreen: "titleScreen",
    previousScreen: "titleScreen",
    initialized: false,
    wasGamePaused: false,
    Game: null,

    init() {
        if (this.initialized) return;


        // 🔧 追加: Gameオブジェクト参照を設定
        if (window.Game) {
            this.Game = window.Game;
        }

        this.wasGamePaused = false;

        // DOMが完全に読み込まれるのを待つ
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                this.initializeScreen();
            });
        } else {
            this.initializeScreen();
        }

        this.initialized = true;
    },

    // 初期化時にオブザーバーを起動
    initializeScreen() {
        this.showScreen("titleScreen");
        this.setupEventListeners();

        // 統計画面オブザーバーを初期化
        this.initStatsScreenObserver();

    },

    setupEventListeners() {

        // タイトル画面ボタン
        this.setupButtonWithSound(
            "startBtnTitle",
            () => {
                this.showScreen("gameScreen");

                // ゲーム画面が完全に表示された後に初期化と開始を実行
                setTimeout(() => {
                    // 初回のみGame.initを実行
                    if (!window.Game.canvas) {
                        window.Game.init();
                    } else {
                        window.Game.reset();
                    }

                    // ゲーム開始前に少し遅延を入れて確実に描画
                    setTimeout(() => {
                        window.Game.start();
                    }, 100);
                }, 50);
            },
            "menuOpen"
        );

        this.setupButtonWithSound(
            "howToPlayBtn",
            () => {
                this.showScreen("howToPlayScreen");
            },
            "menuOpen"
        );

        this.setupButtonWithSound(
            "backFromHowToPlay",
            () => {
                this.showScreen("titleScreen");
            },
            "menuOpen"
        );

        // 格納庫ボタンの設定
        this.setupButtonWithSound(
            "storageBtn",
            () => {
                this.showScreen("storageScreen");

                // 格納庫画面を開いた時の処理
                setTimeout(() => {
                    if (window.StorageSystem && window.StorageSystem.onStorageScreenOpen) {
                        window.StorageSystem.onStorageScreenOpen();
                    }
                }, 100);
                // タブイベント登録（機体・バフ）
                setTimeout(() => {
                    const shipTabBtn = document.querySelector('.storage-tab[data-tab="ships"]');
                    if (shipTabBtn && !shipTabBtn._shipTabBound) {
                        shipTabBtn._shipTabBound = true;
                        shipTabBtn.addEventListener("click", () => {
                            if (window.StorageSystem && window.StorageSystem.onShipTabOpen) {
                                window.StorageSystem.onShipTabOpen();
                            }
                        });
                    }
                    const buffTabBtn = document.querySelector('.storage-tab[data-tab="buffs"]');
                    if (buffTabBtn && !buffTabBtn._buffTabBound) {
                        buffTabBtn._buffTabBound = true;
                        buffTabBtn.addEventListener("click", () => {
                            if (window.StorageSystem && window.StorageSystem.onBuffTabOpen) {
                                window.StorageSystem.onBuffTabOpen();
                            }
                        });
                    }
                }, 120);
            },
            "menuOpen"
        );

        this.setupButtonWithSound(
            "backFromStorage",
            () => {
                this.showScreen("titleScreen");
            },
            "menuOpen"
        );

        // ショップボタン
        this.setupButtonWithSound(
            "shopBtn",
            () => {
                this.showScreen("shopScreen");

                // ショップ画面を開いた時の処理
                setTimeout(() => {
                    if (window.ShopManager && window.ShopManager.updateShopUI) {
                        window.ShopManager.updateShopUI();
                    }
                }, 100);
            },
            "menuOpen"
        );

        // 戻るボタンも追加
        this.setupButtonWithSound(
            "backFromShop",
            () => {
                this.showScreen(this.previousScreen);
            },
            "menuOpen"
        );

        this.setupButtonWithSound(
            "shopToStorage",
            () => {
                // 格納庫の戻り先をタイトル画面に固定してループを防ぐ
                this.previousScreen = "titleScreen";
                this.showScreen("storageScreen");
                setTimeout(() => {
                    if (window.StorageSystem && window.StorageSystem.onStorageScreenOpen) {
                        window.StorageSystem.onStorageScreenOpen();
                    }
                }, 100);
            },
            "menuOpen"
        );

        this.setupButtonWithSound(
            "settingsBtn",
            () => {
                this.showScreen("settingsScreen");
            },
            "menuOpen"
        );

        this.setupButton("settingsBtnFromGame", () => {
            this._pausedBySettings = false;
            if (window.Game.gameRunning && !window.Game.gamePaused) {
                window.Game.togglePause();
                this._pausedBySettings = true;
            }
            this.showScreen("settingsScreen");
        });

        this.setupButton("achievementsBtnFromGame", () => {
            this._pausedByAchievements = false;
            if (window.Game.gameRunning && !window.Game.gamePaused) {
                window.Game.togglePause();
                this._pausedByAchievements = true;
            }
            this.showScreen("achievementsScreen");
            setTimeout(() => { window.Achievements.onAchievementsScreenOpen(); }, 100);
        });

        this.setupButtonWithSound(
            "achievementsBtn",
            () => {
                this.showScreen("achievementsScreen");

                // 実績画面を開いた時の処理 - 確実に最新データを表示
                setTimeout(() => {
                    if (window.Achievements && window.Achievements.refreshOnScreenOpen) {
                        window.Achievements.refreshOnScreenOpen();
                    } else if (window.Achievements && window.Achievements.onAchievementsScreenOpen) {
                        window.Achievements.onAchievementsScreenOpen();
                    } else {
                        // フォールバック: 直接更新
                        window.Achievements.update(window.Achievements.getGameState());
                        window.Achievements.refreshAchievementsDisplay();
                    }
                }, 100);
            },
            "menuOpen"
        );

        // 設定から戻るボタン
        // 設定から戻るボタンも同様に修正（既存のコードを修正）
        this.setupButtonWithSound(
            "backFromSettings",
            () => {
                const previous = this.previousScreen;
                this.showScreen(previous);
                if (previous === "gameScreen" && this._pausedBySettings) {
                    this._pausedBySettings = false;
                    setTimeout(() => {
                        if (window.Game.gameRunning && window.Game.gamePaused) {
                            window.Game.togglePause();
                        }
                    }, 100);
                }
            },
            "menuOpen"
        );

        this.setupButtonWithSound(
            "backFromAchievements",
            () => {
                const previous = this.previousScreen;
                this.showScreen(previous);
                if (previous === "gameScreen" && this._pausedByAchievements) {
                    this._pausedByAchievements = false;
                    setTimeout(() => {
                        if (window.Game.gameRunning && window.Game.gamePaused) {
                            window.Game.togglePause();
                        }
                    }, 100);
                }
            },
            "menuOpen"
        );

        // ゲーム画面の戻るボタン
        this.setupButton("backToTitle", () => {
            window.Game.reset();
            this.showScreen("titleScreen");
        });

        // 統計画面のボタンイベントを追加
        this.setupButtonWithSound(
            "restartFromStats",
            () => {
                this.showScreen("gameScreen");
                window.Game.restart();
            },
            "menuOpen"
        );

        this.setupButtonWithSound(
            "backToTitleFromStats",
            () => {
                window.Game.reset();
                this.showScreen("titleScreen");
            },
            "menuOpen"
        );

        // [A1] シェアボタン
        this.setupButtonWithSound(
            "shareBtn",
            () => { this._handleShare(); },
            "buttonClick"
        );

    },

    // [A1] SNSシェア処理
    _handleShare() {
        const score    = (window.Game && window.Game.score)    || 0;
        const distance = (window.Game && window.Game.distance) || 0;
        const isNew    = !!(window.UI && window.UI._isNewRecord);

        const prefix = isNew ? "🎉 NEW RECORD！" : "🚀";
        const text =
            prefix + " 隕石を回避せよ ワームホールアドベンチャー\n" +
            "スコア: " + score.toLocaleString() + "点 / 飛行距離: " + distance + "km\n" +
            "#隕石を回避せよ #ワームホールアドベンチャー";

        // [LOGIC-1] シェアURL
        // 本番デプロイ後は SHARE_URL を実際のURLに変更すること
        // 例: const SHARE_URL = "https://example.com/game/";
        const SHARE_URL = null; // null の場合は現在のURLを使用（開発中はfile://になる）
        const shareUrl  = SHARE_URL || location.href.split("?")[0];

        if (navigator.share) {
            // Web Share API（モバイル対応）
            navigator.share({ text: text, url: shareUrl }).catch(function() {
                // キャンセル時は何もしない
            });
        } else {
            // フォールバック: X(Twitter)
            const twitterUrl =
                "https://twitter.com/intent/tweet" +
                "?text=" + encodeURIComponent(text) +
                "&url="  + encodeURIComponent(shareUrl);
            window.open(twitterUrl, "_blank", "noopener,noreferrer");
        }
    },

    // 統計画面表示時の自動同期
    initStatsScreenObserver() {
        // DOMが完全に読み込まれてから実行
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                this.setupStatsScreenObserver();
            });
        } else {
            this.setupStatsScreenObserver();
        }
    },

    setupStatsScreenObserver() {
        const statsScreen = document.getElementById("statsScreen");
        if (statsScreen) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === "attributes" && mutation.attributeName === "class") {
                        if (statsScreen.classList.contains("active")) {
                            this.onStatsScreenOpen();
                        }
                    }
                });
            });

            observer.observe(statsScreen, {
                attributes: true,
                attributeFilter: ["class"]
            });

        } else {
        }
    },

    // 統計画面が開いた時の処理
    onStatsScreenOpen() {
        if (window.StorageSystem && window.StorageSystem.forceSyncForStats) {
            setTimeout(() => {
                window.StorageSystem.forceSyncForStats();
                // 統計表示を更新（ゲームデータがあれば）
                // [BUG-3修正] score/distanceが0の場合は再描画しない
                //   → NEW RECORDアニメーションの途中リセットを防ぐ
                if (window.UI && window.UI.prepareStatsData && window.Game) {
                    const d = window.Game.distance || 0;
                    const s = window.Game.score    || 0;
                    if (d > 0 || s > 0) {
                        window.UI.prepareStatsData(d, s);
                    }
                }
            }, 100);
        }
    },

    setupButton(buttonId, clickHandler) {
        const button = document.getElementById(buttonId);
        if (button) {
            // 既存のイベントリスナーをクリア
            button.replaceWith(button.cloneNode(true));
            const newButton = document.getElementById(buttonId);

            newButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                clickHandler();
            });

            // タッチイベントも追加（モバイル対応）
            newButton.addEventListener(
                "touchstart",
                (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clickHandler();
                },
                { passive: false }
            );

        } else {

            // ボタンが見つからない場合、定期的に再試行
            setTimeout(() => {
                this.setupButton(buttonId, clickHandler);
            }, 500);
        }
    },

    showScreen(screenId) {

        // 残存モーダルを必ずクリア
        ["preGameModal", "itemUseModal"].forEach(id => {
            const m = document.getElementById(id);
            if (m) m.remove();
        });
        document.querySelectorAll(".pre-game-modal").forEach(m => m.remove());
        const gc = document.getElementById("gameControls");
        if (gc) gc.style.visibility = "";

        // 現在の画面を直前の画面として記憶（同じ画面への遷移は除く）
        if (this.currentScreen !== screenId) {
            this.previousScreen = this.currentScreen;
        }

        // すべての画面を非表示
        const screens = document.querySelectorAll(".screen");
        screens.forEach((screen) => {
            screen.classList.remove("active");
        });

        // 指定された画面を表示
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add("active");
            this.currentScreen = screenId;

            // ▼▼▼ 設定画面表示時の効果音 ▼▼▼
            if (screenId === "settingsScreen" && window.SoundManager.enabled) {
                setTimeout(() => {
                    window.SoundManager.play("menuOpen");
                }, 100);
            }
            // ▲▲▲ 追加終了 ▲▲▲

            // タイトル画面に戻った時にBGMを確認・ベストスコア表示を更新
            if (screenId === "titleScreen") {
                this.ensureTitleBGM();
                this.updateTitleBestScore(); // [A2]
            }
        } else {
        }
    },

    // [A2] タイトル画面のベストスコア表示を更新
    updateTitleBestScore() {
        const el  = document.getElementById('titleBestScore');
        const val = document.getElementById('titleBestScoreValue');
        if (!el || !val) return;

        // Game.maxScoreはloadCumulativeStats()で復元済み
        const best = (window.Game && window.Game.maxScore > 0)
            ? window.Game.maxScore
            : 0;

        if (best > 0) {
            val.textContent = best.toLocaleString();
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    },

    // titlescreen.js の ensureTitleBGM() メソッドを修正
    ensureTitleBGM() {
        // console.log("🎵 タイトル画面BGM確認", {
        //     enabled: BGMManager.enabled,
        //     audioContext: !!BGMManager.audioContext,
        //     userGesture: BGMManager.userGestureOccurred,
        //     isPlaying: BGMManager.isPlaying,
        //     currentBGM: BGMManager.currentBGM?.sequence?.name
        // });

        // AudioContextが存在し、ユーザージェスチャーが行われている場合のみ
        if (window.BGMManager.enabled && window.BGMManager.audioContext && window.BGMManager.userGestureOccurred) {
            const currentBGMName = BGMManager.currentBGM?.sequence?.name;

            if (!window.BGMManager.isPlaying || currentBGMName !== "mainTheme") {
                // 少し遅延を入れて確実に再生
                setTimeout(() => {
                    window.BGMManager.play("mainTheme");
                }, 100);
            } else {
            }
        } else {
        }
    },

    showGameOver() {
        this.showScreen("gameScreen");
    },

    getCurrentScreen() {
        return this.currentScreen;
    },

    setupButtonWithSound(buttonId, clickHandler, soundName = "buttonClick") {
        const button = document.getElementById(buttonId);
        if (button) {
            // 既存のイベントリスナーをクリア
            button.replaceWith(button.cloneNode(true));
            const newButton = document.getElementById(buttonId);

            newButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.SoundManager.play(soundName);
                clickHandler();
            });

            newButton.addEventListener(
                "touchstart",
                (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.SoundManager.play(soundName);
                    clickHandler();
                },
                { passive: false }
            );

        } else {
            setTimeout(() => {
                this.setupButtonWithSound(buttonId, clickHandler, soundName);
            }, 500);
        }
    }
};


// ゲームのメインロジック
window.TitleScreen = TitleScreen;

// ============================================================
// game.js
// Game — ゲームループ・スコア
// ============================================================
const Game = {
    // デバッグモードフラグ
    DEBUG_MODE: false, // 本番環境ではfalseに設定

    // プールシステム
    DOM_EFFECT_POOL: {
        elements: [],
        getElement() {
            return this.elements.pop() || document.createElement("div");
        },
        returnElement(element) {
            element.style.display = "none";
            this.elements.push(element);
        }
    },

    canvas: null,
    ctx: null,
    gameRunning: false,
    gamePaused: false,
    animationId: null,
    isResettingShieldExtensions: false,

    // 燃料システム統合
    fuelSystemEnabled: true, // 燃料システム有効フラグ
    lastFuelUpdateTime: 0,
    FUEL_UPDATE_INTERVAL: 100, // 100msごとに更新

    // ゲーム状態
    distance: 0,
    score: 0,
    lives: 3, // ライフ
    maxLives: 3,

    // ゲーム設定
    BASE_OBSTACLE_SPAWN_RATE: 5, // 障害物
    BASE_WORMHOLE_SPAWN_RATE: 0.0001, // ワームホール
    POWERUP_SPAWN_RATE: 0.001, // パワーアップ
    RESOURCE_SPAWN_RATE: 0.0001, // 資源（新しいアイテム）

    // 現在の設定（変更可能）
    OBSTACLE_SPAWN_RATE: 0.005,
    WORMHOLE_SPAWN_RATE: 0.001,

    WORMHOLE_BONUS: 500,
    BOSS_INTERVAL: 1500,   // ボス出現距離間隔（1500mごと）
    BOSS_SCORE: 500,       // ボス撃破スコア（entities側で付与）
    SCORE_MULTIPLIER: 10,
    // 触覚フィードバック設定
    VIBRATION_ENABLED: true,
    VIBRATION_MIN_DURATION: 50, // 最小振動時間（ms）
    VIBRATION_MAX_DURATION: 200, // 最大振動時間（ms）
    // 採掘パラメータ
    MINING_DROP_RATE: 0.00005, // 0.005%の確率で鉱石ドロップ
    MINING_MIN_AMOUNT: 1, // 最小取得量
    MINING_MAX_AMOUNT: 5, // 最大取得量
    MINING_RARE_RATE: 0.000001, // 0.0001%の確率でレアドロップ
    MINING_RARE_MULTIPLIER: 3, // レアドロップ時の倍率
    // アイテム獲得スコア
    WORMHOLE_SCORE: 200, // ワームホール獲得スコア
    SHIELD_SCORE: 100, // シールド獲得スコア
    RESOURCE_SCORE: 150, // 資源獲得スコア
    BULLET_DESTRUCTION_SCORE: 10, // 弾1破壊あたりのスコア

    // 鉱石種類
    ORE_TYPES: {
        COMMON: {
            name: "鉄鉱石",
            color: "#888888",
            value: 1,
            dropRate: 0.7, // 70%の確率で出現
            minAmount: 1,
            maxAmount: 3
        },
        RARE: {
            name: "銀鉱石",
            color: "#C0C0C0",
            value: 3,
            dropRate: 0.25, // 25%の確率で出現
            minAmount: 1,
            maxAmount: 2
        },
        EPIC: {
            name: "金鉱石",
            color: "#FFD700",
            value: 10,
            dropRate: 0.05, // 5%の確率で出現
            minAmount: 1,
            maxAmount: 1
        }
    },

    // コンボ採掘システム
    miningCombo: 0,
    maxMiningCombo: 0,
    MINING_COMBO_BONUS: 0.1, // コンボ1ごとに10%のボーナス
    MINING_COMBO_TIMEOUT: 3000, // コンボ継続時間（ms）
    lastMiningTime: 0,

    // 距離ボーナス
    DISTANCE_BONUS_INTERVAL: 1000, // 1000mごとにボーナス
    DISTANCE_BONUS_RATE: 0.05, // 5%の出現率上昇

    // シールド時間ボーナス
    SHIELD_TIME_BONUS_RATE: 0.02, // シールド残り時間1秒ごとに2%のボーナス
    SHIELD_EXTENSION_AMOUNT: 0, // 現在のシールド延長量（ms）

    // 大型隕石ボーナス
    LARGE_ASTEROID_BONUS: {
        sizeThreshold: 40, // サイズ40以上の隕石
        bonusRate: 0.3 // 30%のボーナス確率
    },

    // 各スコア
    scoreBreakdown: {
        flight: 0,
        wormhole: 0,
        shield: 0,
        resource: 0,
        bullet: 0
    },

    // 実績用の累積統計（デフォルト値を設定）
    totalShieldCollectCount: 0,
    totalWormholePassCount: 0,
    totalResourceCollectCount: 0,
    totalDodgeCount: 0,
    totalShieldCrashCount: 0,
    totalResourceManagerCount: 0, // 追加: リソースマネージャー用
    totalRiskTakerCount: 0, // 追加: リスクテイカー用
    maxScore: 0,
    totalCommonOres: 0,
    totalRareOres: 0,
    totalEpicOres: 0,
    // 鉱石関連累積統計
    totalOres: 0, // 総取得鉱石数
    totalMiningCount: 0, // 総採掘回数
    rareMiningCount: 0, // レア採掘回数
    // 詳細な採掘統計
    miningStats: {
        totalSessions: 0,
        totalMiningAttempts: 0,
        totalSuccessfulMining: 0,
        miningEfficiency: 0, // 成功率
        bestCombo: 0,
        bestSessionOres: 0,
        averageOresPerSession: 0,
        miningTimeStats: {
            sessionStartTime: 0,
            totalMiningTime: 0,
            averageMiningInterval: 0
        },
        oreDistribution: {
            common: 0,
            rare: 0,
            epic: 0
        }
    },
    // 弾で隕石破壊回数
    totalBulletDestructionCount: 0,

    // 現在のゲームセッション用
    shieldCollectCount: 0,
    wormholeCount: 0,
    dodgeCount: 0, // 現回避回数
    shieldCrashCount: 0,
    resourceManagerCount: 0, // 追加: 現在のゲームセッション用
    riskTakerCount: 0, // 追加: 現在のゲームセッション用
    sessionOres: 0, // 現在のゲームセッションでの取得数
    sessionMiningCount: 0, // 現在のセッションでの採掘回数
    sessionCommonOres: 0,
    sessionRareOres: 0,
    sessionEpicOres: 0,
    // セッション統計
    currentSessionStats: {
        startTime: 0,
        miningAttempts: 0,
        successfulMining: 0,
        comboHistory: []
    },
    // 弾で隕石破壊回数
    sessionBulletDestructionCount: 0,

    // 至近距離で破壊した数
    closestObstacleDestructionCount: 0,
    totalClosestObstacleDestructionCount: 0,

    // 燃料20%以下の状態で隕石を回避した数
    lowFuelDodges: 0,
    totalLowFuelDodges: 0,

    // 時間追跡用
    lastMiningAttemptTime: 0,

    // ショップシステムの基本設定
    SHOP_SYSTEM: {
        // 交換レート（将来的に調整可能）
        EXCHANGE_RATES: {
            COMMON_TO_RARE: 10, // 鉄10個 → 銀1個
            RARE_TO_EPIC: 5, // 銀5個 → 金1個
            COMMON_TO_EPIC: 50 // 鉄50個 → 金1個
        },

        // アイテム価格（仮設定）
        ITEM_PRICES: {
            EXTRA_LIFE: 100, // 追加ライフ
            SHIELD_EXTENSION: 50, // シールド時間延長
            MINING_BOOST: 80 // 採掘効率アップ
        },

        // アップグレードシステム（将来的な拡張用）
        UPGRADES: {
            miningEfficiency: {
                level: 0,
                maxLevel: 5,
                cost: [100, 200, 400, 800, 1600],
                effect: [0.05, 0.1, 0.15, 0.2, 0.25] // 採掘確率ボーナス
            },
            shieldDuration: {
                level: 0,
                maxLevel: 3,
                cost: [150, 300, 600],
                effect: [1000, 2000, 3000] // シールド時間延長（ms）
            }
        }
    },

    // 消費履歴（デバッグ用）
    shopTransactions: [],

    // 保存キュー
    saveQueue: {
        data: null,
        timeout: null,
        lastSave: 0,
        SAVE_INTERVAL: 2000 // 2秒間隔
    },

    // パフォーマンス監視
    performance: {
        frameCount: 0,
        lastTime: 0,
        currentFPS: 60,
        lowFPSWarningShown: false,
        MAX_PARTICLES: 50, // 基本制限
        qualityLevel: "high" // 'high', 'medium', 'low'
    },

    // パフォーマンス監視メソッド
    monitorPerformance() {
        this.performance.frameCount++;
        const currentTime = performance.now();

        if (currentTime - this.performance.lastTime >= 1000) {
            this.performance.currentFPS = Math.round(
                (this.performance.frameCount * 1000) / (currentTime - this.performance.lastTime)
            );

            // FPSに基づいて自動調整
            this.autoAdjustQuality();

            this.performance.frameCount = 0;
            this.performance.lastTime = currentTime;

            if (this.DEBUG_MODE) {
            }
        }
    },

    // 品質自動調整メソッド
    autoAdjustQuality() {
        const fps = this.performance.currentFPS;

        if (fps < 25 && this.performance.qualityLevel !== "low") {
            this.setQualityLevel("low");
        } else if (fps < 40 && this.performance.qualityLevel === "high") {
            this.setQualityLevel("medium");
        } else if (fps > 50 && this.performance.qualityLevel !== "high") {
            this.setQualityLevel("high");
        }
    },

    // 品質レベル設定メソッド
    setQualityLevel(level) {
        if (this.performance.qualityLevel === level) return;

        const previousLevel = this.performance.qualityLevel;
        this.performance.qualityLevel = level;

        switch (level) {
            case "high":
                this.performance.MAX_PARTICLES = 50;
                this.VIBRATION_ENABLED = true;
                window.Particles.setMaxParticles(50);
                break;
            case "medium":
                this.performance.MAX_PARTICLES = 25;
                this.VIBRATION_ENABLED = false;
                window.Particles.setMaxParticles(25);
                break;
            case "low":
                this.performance.MAX_PARTICLES = 15;
                this.VIBRATION_ENABLED = false;
                window.Particles.setMaxParticles(15);
                // 描画間引きを導入
                this.renderThrottling = 2;
                break;
        }

    },

    // 仮想通貨残高取得メソッド
    getCurrencyBalance() {
        return {
            common: this.totalCommonOres,
            rare: this.totalRareOres,
            epic: this.totalEpicOres,
            totalValue: this.totalOres
        };
    },

    // 効果キューシステム
    pendingEffects: {
        upgrades: [], // アップグレード効果
        consumables: [] // 消費アイテム効果
    },

    activeEffects: {}, // 現在適用中の効果

    init() {
        // グローバル登録を確実にする
        if (!window.Game) {
            window.Game = this;
        }

        this.canvas = document.getElementById("gameCanvas");

        if (!this.canvas) {
            console.error("❌ gameCanvas が見つかりません");
            return;
        }

        this.ctx = this.canvas.getContext("2d");

        // 効果システムの初期化を最優先で実行

        this.initializeEffectSystem();

        // キャンバスサイズ設定
        const ensureCanvasSize = () => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;

            if (this.canvas.width === 0 || this.canvas.height === 0) {
                setTimeout(ensureCanvasSize, 100);
                return;
            }

            // キャンバスサイズ確定後にプレイヤーを初期化
            window.Player.init(this.canvas);

            // 初期描画を実行
            this.draw();
        };
        this.loadCumulativeStats();

        // 効果キューは既に初期化済みなので読み込みのみ
        this.loadPendingEffects();

        // 各モジュールの初期化

        window.Obstacles.init();
        window.Wormholes.init();
        window.Particles.init();
        window.PowerUps.init();
        window.Resources.init();
        window.UI.init();

        // イベントリスナーの設定
        this.setupEventListeners();

        // 燃料システムの初期化
        this.initializeFuelSystem();

        // 初期化時に燃料状態を確実にリセット
        this.resetFuelSystem();

        // 定期的な状態チェック（デバッグ用）
        if (this.DEBUG_MODE) {
            setInterval(() => {
                if (!this.gameRunning && window.Player.fuel < 100) {
                    this.resetFuelSystem(); // 自動修正
                }
            }, 5000);
        }

        // 新しいデバッグシステムの初期化
        if (typeof window.DebugLogger !== "undefined") {
            if (this.DEBUG_MODE) {
                window.DebugLogger.setLevel("DEBUG");
                window.DebugLogger.info("GAME", "デバッグモード有効");
            }
        }

        if (window.DebugLogger) {
            // DebugLoggerにデバッグモードを設定（依存逆転）
            window.DebugLogger.setDebugMode(this.DEBUG_MODE);
            window.DebugLogger.info("GAME", "Game.init完了");
        }

        ensureCanvasSize();

        window.Bullets.init();
    },

    // 燃料システムの初期化
    initializeFuelSystem() {

        // Playerオブジェクトが燃料プロパティを持っているか確認
        if (window.Player && window.Player.FUEL_SYSTEM) {
        } else {
        }
    },

    // 効果システムの初期化
    initializeEffectSystem() {

        // 効果キューの確実な初期化
        if (!this.pendingEffects) {
            this.pendingEffects = {
                upgrades: [],
                consumables: []
            };
        }

        if (!this.activeEffects) {
            this.activeEffects = {};
        }

        if (!this.effectCleanup) {
            this.effectCleanup = [];
        }

        // 保留中の効果を読み込み
        this.loadPendingEffects();

        if (this.DEBUG_MODE) {
        }
    },

    // ゲーム初期化時に効果キューを読み込む
    loadPendingEffects() {
        try {
            const saved = localStorage.getItem("gamePendingEffects");
            if (saved) {
                const data = JSON.parse(saved);

                // 🔧 修正: 完全な後方互換性と安全な初期化
                this.pendingEffects = {
                    upgrades: Array.isArray(data.pendingEffects?.upgrades) ? data.pendingEffects.upgrades : [],
                    consumables: Array.isArray(data.pendingEffects?.consumables) ? data.pendingEffects.consumables : []
                };

                if (this.DEBUG_MODE) {
                }
            } else {

                this.pendingEffects = {
                    upgrades: [],
                    consumables: []
                };
            }
        } catch (error) {
            if (this.DEBUG_MODE) {
                console.error("❌ 効果キューの読み込みに失敗:", error);
            }

            // 🔧 修正: 確実な初期化とエラー回復
            this.pendingEffects = {
                upgrades: [],
                consumables: []
            };
            // 破損データを削除
            localStorage.removeItem("gamePendingEffects");
        }
    },

    // 効果キューを保存する
    savePendingEffects() {
        try {
            const data = {
                pendingEffects: this.pendingEffects,
                savedAt: Date.now()
            };
            localStorage.setItem("gamePendingEffects", JSON.stringify(data));

            if (this.DEBUG_MODE) {
            }
        } catch (error) {
            if (this.DEBUG_MODE) {
                console.error("❌ 効果キューの保存に失敗:", error);
            }
        }
    },

    // 保留中の効果を適用する
    applyPendingEffects(applyConsumables = true) {

        // 効果キューの存在確認
        if (!this.pendingEffects) {
            this.pendingEffects = {
                upgrades: [],
                consumables: []
            };
            return [];
        }

        let appliedItems = []; // 🔧 変更: 適用したアイテムIDを記録

        // アップグレード効果の適用（常に適用）
        this.pendingEffects.upgrades.forEach((effect, index) => {
            if (!effect.applied && effect.enabled !== false) {

                if (this.applyUpgradeEffect(effect)) {
                    this.pendingEffects.upgrades[index].applied = true;
                    appliedItems.push(effect.itemId);
                    this.showEffectAppliedNotification(effect);
                }
            }
        });

        // 🔧 修正: 消費アイテム効果の適用（条件付き）
        if (applyConsumables) {
            this.pendingEffects.consumables.forEach((effect, index) => {
                if (!effect.applied) {

                    if (this.applyConsumableEffect(effect)) {
                        this.pendingEffects.consumables[index].applied = true;
                        appliedItems.push(effect.itemId);
                        this.showEffectAppliedNotification(effect);
                    }
                }
            });
        }

        // 適用済みアイテムのクリーンアップ
        this.pendingEffects.consumables = this.pendingEffects.consumables?.filter((effect) => !effect.applied) || [];
        this.pendingEffects.upgrades = this.pendingEffects.upgrades?.filter((effect) => !effect.applied) || [];

        // 効果を保存
        this.savePendingEffects();


        return appliedItems; // 🔧 変更: 適用したアイテムIDを返す
    },

    // 効果適用通知を表示
    showEffectAppliedNotification(effect) {
        const messages = {
            extra_life: "💖 追加ライフで開始！",
            instant_shield: "🛡️ 開始時シールド発動！",
            mining_boost: "⛏️ 採掘ブースト効果適用！",
            shield_extension: "⚡ シールド時間延長！"
        };

        const message = messages[effect.itemId] || `🎯 ${effect.name}効果適用！`;

        if (window.showNotification) {
            window.showNotification(message, "success");
        }

        // スクリーンリーダー通知
        if (window.announceToScreenReader) {
            announceToScreenReader(message);
        }
    },

    // 消費アイテム効果を適用
    applyConsumableEffect(effect) {
        try {

            switch (effect.itemId) {
                case "extra_life":
                    // 追加ライフ効果 - 直接Gameの設定を変更
                    this.maxLives += effect.effect.startingLives || 1;
                    this.lives = this.maxLives;

                    if (window.UI && window.UI.updateLives) {
                        window.UI.updateLives(this.lives, this.maxLives);
                    }


                    return true;

                case "instant_shield":
                    // 開始時シールド効果 - フラグを設定（確実に適用されるように）
                    this.startWithShield = true;


                    // 即時適用を試みる
                    if (this.gameRunning) {

                        this.applyStartingShield();
                    }

                    return true;

                default:

                    return false;
            }
        } catch (error) {
            if (this.DEBUG_MODE) {
                console.error(`❌ 消費アイテム効果の適用に失敗 (${effect.name}):`, error);
            }

            return false;
        }
    },

    // アップグレード効果を適用
    applyUpgradeEffect(effect) {
        try {

            let applied = false;

            switch (effect.itemId) {
                case "mining_boost":
                    // 採掘ブースト効果 - 直接Gameの設定を変更
                    const originalRate = this.MINING_DROP_RATE;
                    this.MINING_DROP_RATE = originalRate * (1 + (effect.effect.miningRate || 0.1));

                    // クリーンアップ登録
                    if (!this.effectCleanup) this.effectCleanup = [];
                    this.effectCleanup.push(() => {
                        this.MINING_DROP_RATE = originalRate;
                    });


                    applied = true;
                    break;

                case "shield_extension":
                    applied = this.applyShieldExtension(effect);
                    break;

                default:
                    applied = false;
            }

            if (applied) {
                // アクティブ効果の確実な登録
                if (!this.activeEffects) this.activeEffects = {};
                this.activeEffects[effect.itemId] = {
                    ...effect,
                    appliedAt: Date.now(),
                    // 適用時間を記録（デバッグ用）
                    appliedTime: new Date().toISOString()
                };
            }

            return applied;
        } catch (error) {
            if (this.DEBUG_MODE) {
                console.error(`❌ アップグレード効果の適用に失敗 (${effect.name}):`, error);
            }

            return false;
        }
    },

    // シールド延長効果を適用する専用メソッド
    applyShieldExtension(effect) {
        const additionalTime = effect.effect?.shieldDuration || 2000;


        // 累積延長時間を記録
        this.SHIELD_EXTENSION_AMOUNT += additionalTime;

        // 現在の基本シールド時間を計算（ベース5000ms + 延長）
        const newBaseDuration = 5000 + this.SHIELD_EXTENSION_AMOUNT;

        // PowerUpsの基本時間を更新
        if (window.PowerUps && window.PowerUps.SHIELD_DURATION !== undefined) {
            window.PowerUps.SHIELD_DURATION = newBaseDuration;

        }

        // 現在アクティブなシールドがあれば即時延長
        if (window.PowerUps.isShieldActive()) {
            this.extendActiveShield(additionalTime);
        }

        // 視覚効果
        this.showShieldExtensionEffect(additionalTime);

        return true;
    },

    // アクティブなシールドを延長する専用メソッド
    extendActiveShield(additionalTime) {
        if (!window.PowerUps.activeShield || window.PowerUps.shieldEndTime === 0) return false;


        // 終了時間を延長
        window.PowerUps.shieldEndTime += additionalTime;

        // タイムアウトを再設定
        if (window.PowerUps.shieldTimeout) {
            clearTimeout(window.PowerUps.shieldTimeout);
        }

        const remainingTime = PowerUps.shieldEndTime - Date.now();
        window.PowerUps.shieldTimeout = setTimeout(() => {
            if (window.PowerUps.activeShield) {
                window.PowerUps.deactivateShield();
            }
        }, remainingTime);

        // UI更新
        if (window.UI && window.UI.updateShieldStatus) {
            window.UI.updateShieldStatus(true, remainingTime);
        }


        return true;
    },

    // シールド延長の視覚効果
    showShieldExtensionEffect(additionalTime) {
        const gameArea = document.querySelector(".game-area");
        if (!gameArea) return;

        // プールから要素を取得
        const effectElement = this.DOM_EFFECT_POOL.getElement();
        effectElement.className = "shield-extension-effect";
        effectElement.innerHTML = `🛡️ +${additionalTime / 1000}秒`;
        effectElement.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            font-weight: bold;
            color: #00ffff;
            text-shadow: 0 0 10px #00ffff;
            z-index: 1000;
            animation: shieldExtensionPop 1.5s ease-out;
            pointer-events: none;
        `;

        gameArea.appendChild(effectElement);

        setTimeout(() => {
            if (effectElement.parentNode) {
                effectElement.parentNode.removeChild(effectElement);
            }
            // プールに戻す
            this.DOM_EFFECT_POOL.returnElement(effectElement);
        }, 1500);
    },

    // 効果クリーンアップの修正（ゲーム終了時のみシールド延長をリセット）
    clearActiveEffects() {

        // ゲーム終了時のみ各種効果をリセット
        if (!this.gameRunning) {
            this.resetShieldExtensionEffects();
            this.resetExtraLifeEffects(); // 追加: ライフ効果もリセット
            this.resetGameSettings(); // 他のゲーム設定もリセット
        }

        // クリーンアップ関数を実行
        if (this.effectCleanup) {
            this.effectCleanup.forEach((cleanupFn) => {
                try {
                    cleanupFn();
                } catch (error) {
                    console.error("❌ 効果クリーンアップに失敗:", error);
                }
            });
            this.effectCleanup = [];
        }

        // アップグレード効果をリセット（適用済みを削除）
        this.pendingEffects.upgrades = this.pendingEffects.upgrades.filter((effect) => !effect.applied);

        // 消費アイテム効果は完全に削除（1回限り）
        this.pendingEffects.consumables = this.pendingEffects.consumables.filter((effect) => !effect.applied);

        // アクティブ効果をクリア（ゲーム中は保持）
        if (!this.gameRunning) {
            this.activeEffects = {};
        }

        this.savePendingEffects();

        if (this.DEBUG_MODE) {
        }
    },

    // 追加ライフ効果をリセットする
    resetExtraLifeEffects() {

        // 基本ライフ数をデフォルトに戻す
        this.maxLives = 3;

        // 現在のライフ数も調整（最大値を超えないように）
        this.lives = Math.min(this.lives, this.maxLives);

        // UIを更新
        if (window.UI && window.UI.updateLives) {
            window.UI.updateLives(this.lives, this.maxLives);
        }

        // アクティブな追加ライフ効果を削除
        if (this.activeEffects && this.activeEffects.extra_life) {
            delete this.activeEffects.extra_life;
        }

    },

    // シールド延長効果を明示的にリセット
    resetShieldExtensionEffects() {

        // 延長量をリセット
        this.SHIELD_EXTENSION_AMOUNT = 0;

        // 基本シールド時間をデフォルトに戻す
        if (window.PowerUps && window.PowerUps.SHIELD_DURATION !== undefined) {
            window.PowerUps.SHIELD_DURATION = 5000;

        }

        // グローバル変数もリセット
        if (window.SHIELD_DURATION_BASE !== undefined) {
            window.SHIELD_DURATION_BASE = 5000;
        }

        // アクティブなシールド延長効果を削除
        if (this.activeEffects && this.activeEffects.shield_extension) {
            delete this.activeEffects.shield_extension;
        }
    },

    // ゲーム設定をデフォルトにリセット
    resetGameSettings() {
        // デフォルト値（必要に応じて調整）
        const defaultSettings = {
            MAX_LIVES: 3,
            MINING_DROP_RATE: 0.3
            // 他のデフォルト設定...
        };

        // 設定をリセット（maxLivesは resetExtraLifeEffects で処理するのでここでは行わない）
        this.MINING_DROP_RATE = defaultSettings.MINING_DROP_RATE;

    },

    // 触覚フィードバックのサポートチェック
    supportsVibration() {
        return "vibrate" in navigator;
    },

    // 振動実行メソッド
    vibrate(duration, pattern = null) {
        if (!this.VIBRATION_ENABLED || !this.supportsVibration()) return;

        try {
            if (pattern) {
                navigator.vibrate(pattern);
            } else {
                navigator.vibrate(duration);
            }
        } catch (error) {
        }
    },

    // 累積統計の読み込み
    loadCumulativeStats() {
        try {
            const saved = localStorage.getItem("gameCumulativeStats");
            if (saved) {
                const data = JSON.parse(saved);

                // 実績関連の統計のみ読み込み
                this.totalShieldCollectCount = parseInt(data.totalShieldCollectCount) || 0;
                this.totalWormholePassCount = parseInt(data.totalWormholePassCount) || 0;
                // 弾破壊カウント
                this.totalBulletDestructionCount = parseInt(data.totalBulletDestructionCount) || 0;

                // 鉱石データは格納庫から読み込む
                if (window.StorageSystem && window.StorageSystem.resources) {
                    this.totalCommonOres = window.StorageSystem.resources.common || 0;
                    this.totalRareOres = window.StorageSystem.resources.rare || 0;
                    this.totalEpicOres = window.StorageSystem.resources.epic || 0;
                    this.totalOres = this.totalCommonOres + this.totalRareOres + this.totalEpicOres;
                } else {
                    // 格納庫がない場合のみ古いデータを使用
                    this.totalCommonOres = parseInt(data.totalCommonOres) || 0;
                    this.totalRareOres = parseInt(data.totalRareOres) || 0;
                    this.totalEpicOres = parseInt(data.totalEpicOres) || 0;
                    this.totalOres = this.totalCommonOres + this.totalRareOres + this.totalEpicOres;
                }
                // 燃料20%以下の状態で隕石を回避
                this.totalLowFuelDodges = parseInt(data.totalLowFuelDodges) || 0;

                // ベストスコアを復元（起動時に前回記録を引き継ぐ）
                this.maxScore = parseInt(data.maxScore) || 0;

            }
        } catch (error) {
            console.error("❌ 累積統計の読み込みに失敗:", error);
            this.initializeDefaultStats();
        }
    },

    // デフォルト統計初期化メソッドを追加
    initializeDefaultStats() {
        this.totalShieldCollectCount = 0;
        this.totalWormholePassCount = 0;
        this.totalResourceCollectCount = 0;
        this.totalDodgeCount = 0;
        this.totalShieldCrashCount = 0;
        this.totalResourceManagerCount = 0;
        this.totalRiskTakerCount = 0;
        this.maxScore = 0;
        this.totalOres = 0;
        this.totalMiningCount = 0;
        this.rareMiningCount = 0;
        this.totalCommonOres = 0;
        this.totalRareOres = 0;
        this.totalEpicOres = 0;
        // 弾破壊カウント
        this.totalBulletDestructionCount = 0;
        this.totalLowFuelDodges = 0;
    },

    // 累積統計の保存
    saveCumulativeStats() {
        try {
            // 即時保存が必要なデータを準備
            const data = {
                totalShieldCollectCount: this.totalShieldCollectCount,
                totalWormholePassCount: this.totalWormholePassCount,
                totalResourceCollectCount: this.totalResourceCollectCount,
                totalDodgeCount: this.totalDodgeCount,
                totalShieldCrashCount: this.totalShieldCrashCount,
                totalResourceManagerCount: this.totalResourceManagerCount,
                totalRiskTakerCount: this.totalRiskTakerCount,
                maxScore: this.maxScore,
                totalOres: this.totalOres,
                totalMiningCount: this.totalMiningCount,
                rareMiningCount: this.rareMiningCount,
                totalCommonOres: this.totalCommonOres,
                totalRareOres: this.totalRareOres,
                totalEpicOres: this.totalEpicOres,
                miningStats: this.miningStats,
                currentSessionStats: this.currentSessionStats,
                // 弾破壊カウント
                totalBulletDestructionCount: this.totalBulletDestructionCount,
                totalLowFuelDodges: this.totalLowFuelDodges,

                savedAt: Date.now()
            };

            // キューに保存
            this.queueSave(data);
        } catch (error) {
            console.error("❌ 累積統計の保存に失敗:", error);
        }
    },

    // キュー保存メソッド
    queueSave(data) {
        this.saveQueue.data = data;

        // 既存のタイムアウトをクリア
        if (this.saveQueue.timeout) {
            clearTimeout(this.saveQueue.timeout);
        }

        // 最後の保存から一定時間経過していたら即時保存
        const now = Date.now();
        if (now - this.saveQueue.lastSave > this.saveQueue.SAVE_INTERVAL) {
            this.executeSave();
        } else {
            // 次の保存機会まで遅延
            this.saveQueue.timeout = setTimeout(
                () => {
                    this.executeSave();
                },
                this.saveQueue.SAVE_INTERVAL - (now - this.saveQueue.lastSave)
            );
        }
    },

    // 実際の保存実行
    executeSave() {
        if (!this.saveQueue.data) return;

        try {
            localStorage.setItem("gameCumulativeStats", JSON.stringify(this.saveQueue.data));
            this.saveQueue.lastSave = Date.now();

        } catch (error) {
            console.error("❌ データ保存失敗:", error);
            // ストレージ容量不足時の処理
            this.handleStorageFull();
        } finally {
            this.saveQueue.data = null;
            this.saveQueue.timeout = null;
        }
    },

    // ストレージ容量不足処理
    handleStorageFull() {
        // 古いデータをクリーンアップ
        try {
            const keysToKeep = ["gameCumulativeStats", "gamePendingEffects", "achievementData"];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!keysToKeep.includes(key)) {
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.error("❌ ストレージクリーンアップ失敗:", error);
        }
    },

    eventListeners: {}, // 既存のイベントリスナーを保持するプロパティ
    setupEventListeners() {
        // 既存のリスナーをクリーンアップ
        this.cleanupEventListeners();

        const moveHandler = (e) => Player.move(e, this.canvas);

        // タッチ操作: 指の移動量で宇宙船を動かすドラッグ追従方式
        // → タップ位置への瞬間移動を防ぐ
        let lastTouchX = null;
        const touchStartHandler = (e) => {
            e.preventDefault();
            lastTouchX = e.touches[0].clientX; // 指の開始X座標を記録するのみ
        };
        const touchMoveHandler = (e) => {
            e.preventDefault();
            if (lastTouchX === null) return;
            const currentX = e.touches[0].clientX;
            const deltaX = currentX - lastTouchX; // 移動量
            lastTouchX = currentX;
            window.Player.moveByDelta(deltaX, this.canvas); // 移動量で更新
        };
        const touchEndHandler = () => {
            lastTouchX = null; // 指を離したらリセット
        };

        this.canvas.addEventListener("mousemove", moveHandler);
        this.canvas.addEventListener("touchstart", touchStartHandler, { passive: false });
        this.canvas.addEventListener("touchmove",  touchMoveHandler,  { passive: false });
        this.canvas.addEventListener("touchend",   touchEndHandler);

        // 参照を保持
        this.eventListeners.mousemove   = moveHandler;
        this.eventListeners.touchstart  = touchStartHandler;
        this.eventListeners.touchmove   = touchMoveHandler;
        this.eventListeners.touchend    = touchEndHandler;

        // リサイズリスナー
        let resizeTimer = null;
        const resizeHandler = () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const w = this.canvas.offsetWidth;
                const h = this.canvas.offsetHeight;
                if (w === 0 || h === 0) return;
                this.canvas.width  = w;
                this.canvas.height = h;
                window.Player.handleResize(this.canvas);
                if (this.gameRunning && !this.gamePaused) this.draw();
            }, 150);
        };
        window.addEventListener("resize", resizeHandler);
        this.eventListeners.resize = resizeHandler;
    },

    cleanupEventListeners() {
        // すべてのイベントリスナーを削除
        Object.entries(this.eventListeners).forEach(([event, handler]) => {
            if (event === "resize") {
                window.removeEventListener(event, handler);
            } else {
                this.canvas.removeEventListener(event, handler);
            }
        });
        this.eventListeners = {};
    },

    // ゲーム開始時に累積データを確認
    start() {
        if (this.gameRunning) return;
        // バフスロットの効果を自動適用（モーダルなし）
        this.startGameDirectly();
    },

    // 新しいメソッドを追加：回避カウントの更新
    incrementDodgeCount() {
        if (this.gameRunning && !this.gamePaused) {
            this.dodgeCount = (this.dodgeCount || 0) + 1;
            this.totalDodgeCount = (this.totalDodgeCount || 0) + 1;

            // console.log(`⚡ 回避成功: 現在${this.dodgeCount}回, 累積${this.totalDodgeCount}回`);

            // 10回ごとに保存（頻繁な保存を避ける）
            if (this.dodgeCount % 10 === 0) {
                this.saveCumulativeStats();
            }

            // 実績システムの更新をトリガー
            if (this.distance % 50 === 0) {
                // 50mごとに更新
                window.Achievements.update(this.getAchievementState());
            }
        }
    },

    togglePause() {
        if (!this.gameRunning) return;

        this.gamePaused = !this.gamePaused;

        if (this.gamePaused) {
            cancelAnimationFrame(this.animationId);
        } else {
            this.gameLoop();
        }
    },

    reset() {
        // まずゲーム状態を確実に停止
        this.gameRunning = false;
        this.gamePaused = false;

        // アニメーションフレームを確実にキャンセル
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // セーブキューをクリア
        if (this.saveQueue.timeout) {
            clearTimeout(this.saveQueue.timeout);
            this.saveQueue.timeout = null;
        }

        // 燃料関連のタイマーをクリア
        this.clearFuelTimers();

        // 効果のクリーンアップ（シールド延長を保持）
        this.clearActiveEffects(true); // シールド延長を保持するフラグ

        // シールド状態をリセット（基本時間は保持）
        if (window.PowerUps && typeof window.PowerUps.reset === "function") {
            window.PowerUps.reset(true); // シールド延長を保持するフラグ
        }

        this.startWithShield = false;

        // ライフを確実にリセット
        this.lives = this.maxLives;

        // 燃料を完全にリセット
        this.resetFuelSystem();

        // セッションデータのみリセット
        this.distance = 0;
        this.score = 0;
        this.wormholeCount = 0;
        this.nextBossDistance = 1500;
        this.sessionDestroyedByType = { normal: 0, fast: 0, large: 0 };
        this.sessionBossDestroyed = 0;
        this.sessionShieldDestroyedByType = { normal: 0, fast: 0, large: 0 };
        this.scoreBreakdown.shield_destroy = 0;
        this.shieldCollectCount = 0;
        this.dodgeCount = 0;
        this.shieldCrashCount = 0;
        this.resourceManagerCount = 0;
        this.riskTakerCount = 0;
        this.sessionBulletDestructionCount = 0;
        this.closestObstacleDestructionCount = 0;
        this.lowFuelDodges = 0;

        // 採掘システム用 - セッションのみリセット
        this.sessionOres = 0;
        this.sessionMiningCount = 0;
        this.sessionCommonOres = 0;
        this.sessionRareOres = 0;
        this.sessionEpicOres = 0;

        this.currentSessionStats = {
            startTime: Date.now(),
            miningAttempts: 0,
            successfulMining: 0,
            comboHistory: []
        };
        this.lastMiningAttemptTime = 0;
        this.miningCombo = 0;
        this.maxMiningCombo = 0;

        // スコア内訳リセット
        this.scoreBreakdown = {
            flight: 0,
            wormhole: 0,
            shield: 0,
            resource: 0,
            bullet: 0,
            shield_destroy: 0
        };

        // 各モジュールのリセット
        if (this.canvas) {
            window.Player.reset(this.canvas);
        }

        window.Obstacles.reset();
        window.Wormholes.reset();
        window.Particles.reset();
        window.PowerUps.reset();
        window.Resources.reset();
        window.Bullets.reset();

        // UIのリセット
        window.UI.hideGameOver();
        window.UI.showGameControls();
        window.UI.updateStats(0, 0, 0);
        window.UI.updateShieldStatus(false);
        window.UI.updateLives(this.lives, this.maxLives);

        // 燃料表示の再初期化
        setTimeout(() => {
            if (window.UI && UI.setupFuelDisplay && UI.updateFuelDisplay) {
                window.UI.setupFuelDisplay();
                window.UI.updateFuelDisplay(100, false);
            }
        }, 150);

        // キャンバスのクリア
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw();
        }

        // イベントリスナーを再設定
        if (this.canvas) {
            this.setupEventListeners();
        }
    },

    // 燃料システムの完全リセットメソッドを追加
    resetFuelSystem() {

        if (window.DebugLogger) {
            window.DebugLogger.info("GAME", "燃料システムを完全リセット");
        }

        // Playerの燃料状態をリセット
        if (window.Player && typeof window.Player.reset === "function") {
            window.Player.reset(this.canvas);
        } else {
            // 直接リセット
            window.Player.fuel = window.Player.maxFuel;
            window.Player.isLowFuel = false;
        }

        // 燃料消費関連のフラグをリセット
        this.fuelUpdateActive = false;
        this.lastFuelUpdateTime = 0;

        // UIの燃料表示を確実に更新
        setTimeout(() => {
            if (window.UI && UI.updateFuelDisplay) {
                window.UI.updateFuelDisplay(100, false);
            }
        }, 200);
    },

    // 燃料タイマーをクリアするメソッドを追加
    clearFuelTimers() {
        // 燃料更新に関連する可能性のあるタイマーをすべてクリア
        if (this.fuelUpdateTimer) {
            clearTimeout(this.fuelUpdateTimer);
            this.fuelUpdateTimer = null;
        }

        if (this.fuelConsumptionTimer) {
            clearInterval(this.fuelConsumptionTimer);
            this.fuelConsumptionTimer = null;
        }
    },

    restart() {
        this.reset();
        this.start();
    },

    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;

        this.update();
        this.draw();

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    },

    // 更新処理
    isScoreUpdating: false, // スコア計算の競合を防ぐためのフラグを追加
    lastUpdateTime: 0,
    update() {
        // ゲームが実行中でない場合は即時リターン
        if (!this.gameRunning || this.gamePaused) {
            return;
        }

        const currentTime = performance.now();
        let deltaTime = this.lastUpdateTime ? (currentTime - this.lastUpdateTime) / 1000 : 0.016;

        // 安全な範囲に制限
        deltaTime = Math.min(deltaTime, 0.1);
        deltaTime = Math.max(deltaTime, 0.001);

        this.lastUpdateTime = currentTime;

        // 距離の更新
        this.distance += 1;

        // スコア更新の競合防止（再帰呼び出し禁止・スキップのみ）
        if (this.isScoreUpdating) {
            return;
        }

        // 燃料消費処理（時間ベース）
        if (this.gameRunning && !this.gamePaused && this.fuelSystemEnabled) {
            this.updateFuelConsumption(deltaTime);
        }

        // 飛行距離はスコアに含めない（距離は別指標として表示のみ）
        // const newFlightScore = Math.floor(this.distance / this.SCORE_MULTIPLIER);
        // if (newFlightScore > this.scoreBreakdown.flight) {
        //     this.scoreBreakdown.flight = newFlightScore;
        // }

        // 総合スコア = ワームホール + シールド + 資源 + 弾破壊 + シールド破壊（飛行距離を除く）
        this.score =
            this.scoreBreakdown.wormhole +
            this.scoreBreakdown.shield +
            this.scoreBreakdown.resource +
            this.scoreBreakdown.bullet +
            (this.scoreBreakdown.shield_destroy || 0);


        // 最大スコアを追跡（ここに追加）
        if (this.score > this.maxScore) {
            this.maxScore = this.score;
        }

        window.UI.updateStats(this.distance, this.score, this.wormholeCount);

        // 距離に応じた出現率調整
        // アイテムごとに異なる増加率
        const obstacleMultiplier = 1 + this.distance / 800;
        const wormholeMultiplier = 1 + this.distance / 1500;
        const powerupMultiplier = 1 + this.distance / 1200;

        // スポーン判定
        // 隕石
        if (Math.random() < this.OBSTACLE_SPAWN_RATE * Math.min(obstacleMultiplier, 6)) {
            window.Obstacles.spawn(this.canvas);
        }
        // ワームホール
        if (Math.random() < this.WORMHOLE_SPAWN_RATE * Math.min(wormholeMultiplier, 2)) {
            window.Wormholes.spawn(this.canvas);
        }
        // アイテム：シールド
        if (this.distance > 100 && Math.random() < this.POWERUP_SPAWN_RATE * Math.min(powerupMultiplier, 3)) {
            window.PowerUps.spawn(this.canvas);
        }
        // アイテム：資源
        if (this.distance > 100 && Math.random() < this.RESOURCE_SPAWN_RATE * Math.min(powerupMultiplier, 3)) {
            window.Resources.spawn(this.canvas);
        }

        // ボス出現判定
        if (this.distance >= this.nextBossDistance && !window.Obstacles.boss) {
            window.Obstacles.spawnBoss(this.canvas);
            this.nextBossDistance += this.BOSS_INTERVAL;
            // 警告表示
            if (window.UI && window.UI.showFloatingText) {
                window.UI.showFloatingText(
                    "⚠ BOSS ⚠",
                    this.canvas.width / 2 - 40,
                    this.canvas.height * 0.3,
                    "#FF4400", "bold", "24px"
                );
            }
        }

        // ボス更新・衝突判定
        if (window.Obstacles.boss) {
            const playerBounds = window.Player.getBounds();
            const bossCollision = window.Obstacles.updateBoss(this.canvas, playerBounds);
            if (bossCollision) {
                this.handlePlayerDamage();
                window.Obstacles.boss = null; // ボスは1回衝突で消える
            }
        }

        // シールド状態の更新
        if (window.PowerUps.isShieldActive()) {
            // 毎フレーム確実にバリア位置を更新
            const playerBounds = Player.getBounds();
            if (playerBounds) {
                window.PowerUps.updateBarrierPosition(playerBounds);
            }

            // UI更新
            window.UI.updateShieldStatus(true, window.PowerUps.getRemainingShieldTime());

            // 状態の整合性チェック
            if (!document.getElementById("playerShieldBarrier") && this.gameRunning) {
                window.PowerUps.createPlayerBarrier();
            }
        } else {
            // シールド非アクティブ時のクリーンアップ
            window.PowerUps.removePlayerBarrier();
        }

        // 実績システムの更新（毎フレームではなく間隔を空けて）
        if (this.distance % 100 === 0) {
            // 100mごとに更新
            window.Achievements.update(this.getAchievementState());
        }

        // 障害物の更新
        const obstacleCollision = Obstacles.update(this.canvas, Player.getBounds());

        // 衝突があった場合のみ処理
        if (obstacleCollision) {
            // console.log("🎯 衝突を検出、処理を開始");

            if (window.PowerUps.isShieldActive()) {
                // console.log("🛡️ シールド衝突処理を実行");
                this.handleShieldCollision();
            } else if (!this.isInvincible) {
                // console.log("🔥 通常衝突処理を実行");
                this.handlePlayerDamage();
            } else {
                // console.log("✨ 無敵時間中の衝突は無視");
            }
        }

        // ワームホールの更新と衝突判定
        if (window.Wormholes.update(this.canvas, window.Player.getBounds())) {
            // ワームホールボーナスを距離に加算
            const wormholeBonus = this.WORMHOLE_BONUS * (1 + this.wormholeCount * 0.1);
            this.distance += wormholeBonus;
            this.wormholeCount++;

            // 累積ワームホール通過回数を更新
            this.totalWormholePassCount++;
            this.saveCumulativeStats(); // 即時保存


            // ワームホール獲得スコア
            const lastWormhole = Wormholes.getLastCollided();
            if (lastWormhole && !lastWormhole.scored) {
                this.scoreBreakdown.wormhole += this.WORMHOLE_SCORE;
                lastWormhole.scored = true;
            }

            window.UI.showWormholeEffect();

            if (lastWormhole) {
                window.Particles.createEffect(
                    lastWormhole.x + lastWormhole.width / 2,
                    lastWormhole.y + lastWormhole.height / 2,
                    "#DA70D6",
                    "wormhole"
                );
            }
        }

        // 定期的な実績更新（格納庫状態も含む）
        if (this.distance % 200 === 0) {
            if (window.Achievements && window.Achievements.update) {
                window.Achievements.update(window.Achievements.getGameState());
            }
        }

        // パワーアップの更新
        window.PowerUps.update(this.canvas, window.Player.getBounds());

        // 資源の更新
        window.Resources.update(this.canvas, window.Player.getBounds());

        // パーティクルの更新
        window.Particles.update();

        // 弾の更新（ゲーム実行中かつポーズ中でない場合のみ）
        if (this.gameRunning && !this.gamePaused) {
            window.Bullets.update(this.canvas);
        }

        setTimeout(() => {
            if (window.UI && UI.checkFuelDisplayStatus) {
                window.UI.checkFuelDisplayStatus();
            }
        }, 500);
    },

    // 燃料消費更新メソッドに安全性チェックを追加
    updateFuelConsumption(deltaTime) {
        // ゲーム状態のダブルチェック
        if (!this.gameRunning || this.gamePaused || !this.fuelSystemEnabled) {
            return;
        }

        try {
            const now = Date.now();

            // 前回の更新から一定時間経過したかチェック
            if (now - this.lastFuelUpdateTime < this.FUEL_UPDATE_INTERVAL) {
                return;
            }

            this.lastFuelUpdateTime = now;

            if (!window.Player || typeof window.Player.consumeFuel !== "function") {
                return;
            }

            // 基本消費量
            const baseConsumption = Player.FUEL_SYSTEM.BASE_CONSUMPTION * (this.FUEL_UPDATE_INTERVAL / 1000);

            // シールド使用時の倍率適用
            let finalConsumption = baseConsumption;
            const isShieldActive = PowerUps && PowerUps.isShieldActive && PowerUps.isShieldActive();

            if (isShieldActive) {
                finalConsumption *= window.Player.FUEL_SYSTEM.SHIELD_MULTIPLIER; // 30倍
            }

            // 修正: finalConsumption を適用
            window.Player.consumeFuel(finalConsumption);

            // 燃料切れチェック
            if (window.Player.isFuelEmpty()) {
                this.handleFuelDepletion();
            }
        } catch (error) {
            console.error("❌ 燃料消費更新エラー:", error);
        }
    },

    // 弾破壊時のスコア加算メソッドを追加
    addBulletDestructionScore() {
        if (!this.gameRunning) return;

        // スコア更新フラグを設定
        this.isScoreUpdating = true;

        try {
            // 弾破壊ボーナススコアを追加（既にhandleBulletHitで加算済みなのでUI更新のみ）
            // 総合スコアを再計算（飛行距離は含めない）
            this.score =
                this.scoreBreakdown.wormhole +
                this.scoreBreakdown.shield +
                this.scoreBreakdown.resource +
                this.scoreBreakdown.bullet +
                (this.scoreBreakdown.shield_destroy || 0);


            // UIを即時更新
            window.UI.updateStats(this.distance, this.score, this.wormholeCount);

        } finally {
            // フラグをリセット（次のフレームで距離ベースの計算を再開）
            setTimeout(() => {
                this.isScoreUpdating = false;
            }, 0);
        }
    },

    // 燃料切れ処理
    handleFuelDepletion() {

        // 燃料切れエフェクト
        this.showFuelDepletionEffect();

        // ゲームオーバー処理（既存のライフ切れ処理と同様）
        this.gameOver();

        // スクリーンリーダー通知
        if (window.announceToScreenReader) {
            announceToScreenReader("燃料切れです。ゲームオーバー");
        }
    },

    showFuelDepletionEffect() {
        // 画面フラッシュ効果
        const gameArea = document.querySelector(".game-area");
        if (gameArea) {
            gameArea.style.backgroundColor = "rgba(255, 100, 0, 0.3)";
            setTimeout(() => {
                gameArea.style.backgroundColor = "";
            }, 500);
        }

        // パーティクルエフェクト
        window.Particles.createEffect(window.Player.x + window.Player.width / 2, window.Player.y + window.Player.height / 2, "#ff6600", "fuelDepletion");

        // 効果音
        window.SoundManager.play("gameOver");
    },

    // 実績用の状態取得（修正）
    getAchievementState() {
        const state = {
            distance: this.distance,
            shieldCollectCount: this.totalShieldCollectCount,
            wormholeCount: this.totalWormholePassCount,
            resourceCollectCount: this.totalResourceCollectCount,
            dodgeCount: this.totalDodgeCount || 0,
            shieldCrashCount: this.totalShieldCrashCount || 0,
            resourceManagerCount: this.totalResourceManagerCount || 0,
            riskTakerCount: this.totalRiskTakerCount || 0,
            maxScore: this.maxScore || 0,
            // 弾破壊カウント
            bulletDestructionCount: this.totalBulletDestructionCount || 0,
            // 弾破壊スコアを追加
            bulletScore: this.scoreBreakdown.bullet || 0
        };

        return state;
    },

    // 衝突処理メソッド
    handleObstacleCollision() {
        // console.log("🎯 衝突処理開始");

        // シールドが有効な場合
        if (window.PowerUps.isShieldActive()) {

            this.handleShieldCollision();
            return;
        }

        // 無敵時間中の場合は無視
        if (this.isInvincible) {

            return;
        }

        // 通常の衝突処理

        this.handlePlayerDamage();
    },

    // 衝突処理
    handleCollision() {

        // シールドが有効な場合は隕石破壊エフェクト
        if (window.PowerUps.isShieldActive()) {
            // console.log("🛡️ シールドで隕石を破壊");
            this.handleShieldCollision();
            return; // ライフ減少なし
        }

        // シールドなしの場合、自機燃焼エフェクト
        // console.log("🔥 自機が燃えるエフェクト");
        this.handlePlayerDamage();

        // ライフを減少（0未満にならないように）
        this.lives = Math.max(0, this.lives - 1);

        // UIのライフ表示を更新
        window.UI.updateLives(this.lives, this.maxLives);

        // 画面フラッシュ効果
        const gameArea = document.querySelector(".game-area");
        if (gameArea) {
            gameArea.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
            setTimeout(() => {
                gameArea.style.backgroundColor = "";
            }, 200);
        }

        // 衝突時の燃料消費
        if (this.fuelSystemEnabled && window.Player && typeof window.Player.consumeFuel === "function") {
            // シールドなしの衝突時のみ燃料消費
            if (!window.PowerUps.isShieldActive() && !this.isInvincible) {
                const collisionCost = Player.FUEL_SYSTEM.COLLISION_COST * Player.maxFuel;
                window.Player.consumeFuel(collisionCost);

                // 燃料消費エフェクト
                window.Particles.createEffect(
                    window.Player.x + window.Player.width / 2,
                    window.Player.y + window.Player.height / 2,
                    "#ff4444",
                    "fuelCollision"
                );
            }
        }

        // 衝突エフェクト
        window.Particles.createEffect(window.Player.x + window.Player.width / 2, window.Player.y + window.Player.height / 2, "#ff4444");

        // スクリーンリーダーに通知
        if (window.announceToScreenReader) {
            announceToScreenReader(`衝突！残りライフ: ${this.lives}`);
        }

        // ライフが0になったらゲームオーバー
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // 無敵時間の実装
            this.addInvincibility();
        }
    },

    // ワームホール通過時の燃料消費処理
    handleWormholeFuelConsumption() {
        if (this.fuelSystemEnabled && window.Player && typeof window.Player.consumeFuel === "function") {
            const wormholeCost = Player.FUEL_SYSTEM.WORMHOLE_COST * Player.maxFuel;
            window.Player.consumeFuel(wormholeCost);
        }
    },

    // シールド衝突処理
    handleShieldCollision() {
        const lastObstacle = Obstacles.getLastCollided();

        // シールド衝突時は燃料消費なし（但しシールド消費倍率は適用）
        // console.log("🛡️ シールド衝突 - 燃料消費なし");

        // シールド破壊カウントを増加
        if (Game.gameRunning) {
            Game.shieldCrashCount++;
            Game.totalShieldCrashCount++;
            Game.saveCumulativeStats();

            // 種類別カウント
            const obsType = (lastObstacle && lastObstacle.type) || "normal";
            Game.sessionShieldDestroyedByType = Game.sessionShieldDestroyedByType || { normal:0, fast:0, large:0 };
            Game.sessionShieldDestroyedByType[obsType] = (Game.sessionShieldDestroyedByType[obsType] || 0) + 1;

            // 種類別スコア加算（弾と同倍率）
            const typeMultiplier = obsType === "fast" ? 2 : obsType === "large" ? 3 : 1;
            const shieldScore = Game.BULLET_DESTRUCTION_SCORE * typeMultiplier;
            Game.scoreBreakdown.shield_destroy = (Game.scoreBreakdown.shield_destroy || 0) + shieldScore;
            Game.score =
                Game.scoreBreakdown.wormhole +
                Game.scoreBreakdown.shield +
                Game.scoreBreakdown.resource +
                Game.scoreBreakdown.bullet +
                (Game.scoreBreakdown.shield_destroy || 0);
            if (typeof Game.addBulletDestructionScore === "function") Game.addBulletDestructionScore();
        }

        // シールド衝突時の採掘処理を実行
        const centerX = lastObstacle.x + lastObstacle.width / 2;
        const centerY = lastObstacle.y + lastObstacle.height / 2;
        const obstacleSize = lastObstacle.width; // 隕石サイズを取得
        window.PowerUps.handleShieldMining(centerX, centerY, obstacleSize);

        if (lastObstacle) {

            // 青系のパーティクルエフェクト
            window.Particles.createEffect(
                lastObstacle.x + lastObstacle.width / 2,
                lastObstacle.y + lastObstacle.height / 2,
                "#00ffff",
                "shieldBreak"
            );

            // 追加エフェクト
            setTimeout(() => {
                window.Particles.createEffect(
                    lastObstacle.x + lastObstacle.width / 2,
                    lastObstacle.y + lastObstacle.height / 2,
                    "#00aaff",
                    "shieldBreak"
                );
            }, 50);
        }

        // シールドヒートエフェクト
        window.UI.showShieldHitEffect();

        // 画面シェイク
        this.addShieldShake();

        // シールド衝突サウンド
        window.SoundManager.play("shieldHit");

        // スクリーンリーダー通知
        if (window.announceToScreenReader) {
            announceToScreenReader("シールドで隕石を破壊");
        }

    },

    // シールド衝突時の採掘処理
    handleShieldMining(collisionX, collisionY, obstacleSize = null) {
        // 採掘試行回数を記録
        this.recordMiningAttempt();

        // 採掘確率判定（基本確率 + ボーナス）
        const baseRate = Game.MINING_DROP_RATE;
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


                // 通知表示
                if (window.showNotification) {
                    window.showNotification(`⛏️ ${finalAmount}個の${oreConfig.name}を獲得！`, "success");
                }
            }
            // ▲▲▲ 追加終了 ▲▲▲

            // 鉱石数の更新（既存の処理）
            this.updateOreCounts(oreType, finalAmount, totalValue);

            // 詳細な統計を更新
            this.updateDetailedStats(oreType, finalAmount, totalValue);

            // 累積データを保存
            Game.saveCumulativeStats();

            if (this.DEBUG_MODE) {
            }

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
                combo: Game.miningCombo,
                bonusRate: bonusRate,
                efficiency: this.getMiningEfficiency()
            };
        } else {
            // 採掘失敗時もコンボをリセット
            this.resetMiningCombo();
            return null;
        }
    },

    // リソース追加時に必ず同期
    addResource(type, amount) {
        if (this.resources[type] !== undefined) {
            this.resources[type] += amount;

            // 即時同期
            this.syncWithGameData();
            this.saveStorage();

            return true;
        }
        return false;
    },

    // 鉱石カウントを更新するメソッドを修正
    updateOreCounts(oreType, amount, totalValue) {
        // セッションカウントのみ更新（累積は格納庫が管理）
        switch (oreType) {
            case "COMMON":
                Game.sessionCommonOres += amount;
                break;
            case "RARE":
                Game.sessionRareOres += amount;
                break;
            case "EPIC":
                Game.sessionEpicOres += amount;
                break;
        }

        // 総合セッションカウント
        Game.sessionOres += totalValue;
        Game.sessionMiningCount++;

        // レアドロップカウント（EPICのみ）
        if (oreType === "EPIC") {
            Game.rareMiningCount++;
        }

        // 累積データは格納庫が管理するため、Gameの累積データは更新しない
        // 格納庫への追加は handleShieldMining で既に行われている
    },

    // シールド衝突時の画面シェイク
    addShieldShake() {
        const gameArea = document.querySelector(".game-area");
        if (gameArea) {
            gameArea.classList.add("shield-shake");
            setTimeout(() => {
                gameArea.classList.remove("shield-shake");
            }, 300);
        }
    },

    // プレイヤーダメージ処理
    handlePlayerDamage() {

        // ライフ減少
        this.lives = Math.max(0, this.lives - 1);
        window.UI.updateLives(this.lives, this.maxLives);

        // 燃焼エフェクト
        window.Particles.createEffect(window.Player.x + window.Player.width / 2, window.Player.y + window.Player.height / 2, "#ff4444", "playerBurn");

        // 画面フラッシュ
        const gameArea = document.querySelector(".game-area");
        if (gameArea) {
            gameArea.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
            setTimeout(() => {
                gameArea.style.backgroundColor = "";
            }, 200);
        }

        // 点滅エフェクト
        this.addPlayerBlinkEffect();

        // ダメージサウンド
        window.SoundManager.play("playerDamage");

        // スクリーンリーダー通知
        if (window.announceToScreenReader) {
            announceToScreenReader(`衝突！残りライフ: ${this.lives}`);
        }

        // ゲームオーバーチェック
        if (this.lives <= 0) {

            this.gameOver();
        } else {
            // 無敵時間を設定
            this.addInvincibility();
        }
    },

    addPlayerBlinkEffect() {
        const playerElement = document.querySelector(".game-area");
        if (playerElement) {
            let blinkCount = 0;
            const blinkInterval = setInterval(() => {
                playerElement.style.opacity = playerElement.style.opacity === "0.5" ? "1" : "0.5";
                blinkCount++;
                if (blinkCount >= 6) {
                    // 3回点滅
                    clearInterval(blinkInterval);
                    playerElement.style.opacity = "1";
                }
            }, 200);
        }
    },

    // 無敵時間の追加（オプション）
    addInvincibility() {
        // 衝突後の一時的な無敵時間を実装
        this.isInvincible = true;
        setTimeout(() => {
            this.isInvincible = false;
            // console.log("🛡️ 無敵時間終了");
        }, 1000); // 1秒間の無敵時間
    },

    frameSkipCounter: 0, // フレームスキップカウンター
    FRAME_SKIP_INTERVAL: 2, // 2フレームに1回描画
    draw() {
        if (!this.canvas || this.canvas.width === 0 || this.canvas.height === 0) return;

        // フレームスキップ（低パフォーマンス時）
        this.frameSkipCounter++;
        if (this.frameSkipCounter % this.FRAME_SKIP_INTERVAL !== 0 && this.performance.qualityLevel === "low") {
            return;
        }

        // 背景の描画
        this.ctx.fillStyle = "rgba(0, 10, 20, 0.7)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 星の描画
        this.drawStars();

        // ゲームオブジェクトの描画
        window.Obstacles.draw(this.ctx);
        window.Obstacles.drawBoss(this.ctx);
        if (window.Bullets) window.Bullets.drawLaser(this.ctx, this.canvas);
        if (window.Bullets) window.Bullets.drawBarrier(this.ctx);
        if (window.Bullets) window.Bullets.drawCharge(this.ctx);
        window.Wormholes.draw(this.ctx);
        window.PowerUps.draw(this.ctx);
        window.Resources.draw(this.ctx);
        window.Particles.draw(this.ctx);
        window.Player.draw(this.ctx);
        window.Bullets.draw(this.ctx);
        if (window.Bullets) window.Bullets.drawHoming(this.ctx);

        // コントロールゾーンの描画（下部15%: タッチ操作エリアを視覚的に分離）
        this.drawControlZone();
    },

    drawControlZone() {
        const h = this.canvas.height;
        const w = this.canvas.width;
        const zoneTop = h * 0.85;

        // 半透明の区切り線
        this.ctx.strokeStyle = "rgba(0, 255, 255, 0.25)";
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([6, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, zoneTop);
        this.ctx.lineTo(w, zoneTop);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // コントロールゾーン背景（薄暗く）
        this.ctx.fillStyle = "rgba(0, 5, 20, 0.35)";
        this.ctx.fillRect(0, zoneTop, w, h - zoneTop);

        // 操作ガイドテキスト
        this.ctx.fillStyle = "rgba(0, 200, 255, 0.4)";
        this.ctx.font = `${Math.max(10, w * 0.03)}px Arial`;
        this.ctx.textAlign = "center";
        this.ctx.fillText("← 操作エリア →", w / 2, zoneTop + (h - zoneTop) * 0.55);
        this.ctx.textAlign = "left";
    },

    drawStars() {
        this.ctx.fillStyle = "white";
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 2;
            this.ctx.fillRect(x, y, size, size);
        }
    },

    gameOver() {

        // [A1] 新記録判定: maxScoreはゲームループ中に更新済みのため
        //      ここで確定値を取得（非同期保存より前なので競合なし）
        const prevBest = this.maxScore;  // score比較前の最大値
        // maxScoreはgameLoop内で既にscore > maxScoreなら更新済み
        // よってscore === maxScoreなら今回が新記録
        const isNewRecord = this.score > 0 && this.score === this.maxScore;
        window.UI._isNewRecord   = isNewRecord;
        window.UI._prevBestScore = isNewRecord ? prevBest : this.maxScore;

        // ゲーム実行状態を先にfalseに設定
        this.gameRunning = false;
        this.gamePaused = false;

        // すべてのタイマーをクリア
        this.clearFuelTimers();

        // アニメーションフレームをキャンセル
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // 効果のクリーンアップ
        this.clearActiveEffects();

        // データ同期を確実に実行
        this.saveCumulativeStats();

        if (window.StorageSystem && window.StorageSystem.syncWithGameData) {
            window.StorageSystem.syncWithGameData();
            window.StorageSystem.saveStorage();
        }

        // 燃料を完全にリセット
        this.resetFuelSystem();

        // UIの統計画面表示
        window.UI.showGameOver(this.distance, this.score);

        // スクリーンリーダーに通知
        if (window.announceToScreenReader) {
            announceToScreenReader(`ゲームオーバー。飛行距離: ${this.distance}km、スコア: ${this.score}`);
        }

        // ゲームオーバーサウンド
        window.SoundManager.play("gameOver");

        // 3. 累積飛行距離を保存
        if (window.Achievements && window.Achievements.saveTotalDistance) {
            window.Achievements.saveTotalDistance(this.distance);
        }

    },

    syncWithGameData() {
        if (window.Game && typeof window.Game === "object") {
            // 🔥 常に格納庫 → ゲーム の方向で同期
            Game.totalCommonOres = this.resources.common;
            Game.totalRareOres = this.resources.rare;
            Game.totalEpicOres = this.resources.epic;
            Game.totalOres = this.resources.common + this.resources.rare + this.resources.epic;

        }
    },

    // 危険状態のBGM切り替え（ライフが少ない時など）
    checkDangerState() {
        if (this.lives === 1 && !this.dangerBGMPlaying) {
            window.BGMManager.play("danger");
            this.dangerBGMPlaying = true;
        } else if (this.lives > 1 && this.dangerBGMPlaying) {
            window.BGMManager.play("gameplay");
            this.dangerBGMPlaying = false;
        }
    },

    // レスポンシブデザイン
    handleResponsive() {
        const canvas = this.canvas;
        const gameArea = document.querySelector(".game-area");

        if (window.innerWidth <= 768) {
            // モバイル用の調整
            canvas.style.maxWidth = "100%";
            canvas.style.height = "auto";

            // ゲーム設定の調整
            // モバイル: 基本値の0.8倍
            this.OBSTACLE_SPAWN_RATE = this.BASE_OBSTACLE_SPAWN_RATE;
            this.WORMHOLE_SPAWN_RATE = this.BASE_WORMHOLE_SPAWN_RATE;

            // UI要素の調整
            this.adjustUIForMobile();
        } else {
            // デスクトップ用設定
            this.OBSTACLE_SPAWN_RATE = this.BASE_OBSTACLE_SPAWN_RATE;
            this.WORMHOLE_SPAWN_RATE = this.BASE_WORMHOLE_SPAWN_RATE;
        }
    },

    adjustUIForMobile() {
        // モバイル用のUI調整
        const stats = document.querySelector(".game-stats");
        const controls = document.querySelector(".controls");

        if (stats) stats.style.fontSize = "0.9rem";
        if (controls) {
            controls.style.flexDirection = "column";
            controls.style.gap = "10px";
        }
    },

    // game.js にゲーム開始前選択UIを追加

    // ゲーム開始前の準備画面を表示
    showPreGamePreparation() {
        // 🔧 修正: 完全なnullチェックと配列長チェック
        const hasPendingEffects =
            this.pendingEffects &&
            (this.pendingEffects.consumables?.length > 0 || this.pendingEffects.upgrades?.length > 0);

        if (!hasPendingEffects) {

            this.startGameDirectly();
            return;
        }


        this.closePreGameModal();

        const gameControls = document.getElementById("gameControls");
        if (gameControls) gameControls.style.visibility = "hidden";

        // オーバーレイ（背景）とコンテンツを別要素で構成
        const overlay = document.createElement("div");
        overlay.id = "preGameModal";
        Object.assign(overlay.style, {
            position: "fixed",
            top: "0", left: "0", right: "0", bottom: "0",
            width: "100%", height: "100%",
            zIndex: "99999",
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            boxSizing: "border-box"
        });

        const box = document.createElement("div");
        Object.assign(box.style, {
            background: "rgba(0,20,50,0.97)",
            border: "2px solid #00ffff",
            borderRadius: "16px",
            padding: "24px 20px",
            width: "100%",
            maxWidth: "420px",
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 0 40px rgba(0,255,255,0.3)"
        });

        box.innerHTML = `
            <h2 style="text-align:center;color:#00ffff;font-size:1.2rem;margin-bottom:16px;">🚀 ゲーム開始前の準備</h2>
            <div class="pending-effects-section">
                ${this.renderPendingEffects()}
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">
                <button class="btn btn-primary" onclick="Game.startGameWithEffects()">効果を適用して開始</button>
                <button class="btn btn-secondary" onclick="Game.startGameWithoutEffects()">効果なしで開始</button>
                <button class="btn btn-outline" onclick="Game.cancelGameStart()">キャンセル</button>
            </div>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

    },

    // 保留中の効果を表示
    renderPendingEffects() {
        let html = "";

        // 消費アイテム効果
        if (this.pendingEffects.consumables.length > 0) {
            html += `
            <div class="effects-group">
                <h3>🎁 消費アイテム効果</h3>
                <div class="effects-list">
                    ${this.pendingEffects.consumables
                        .map(
                            (effect) => `
                        <div class="effect-item consumable-effect">
                            <span class="effect-icon">${this.getEffectIcon(effect.itemId)}</span>
                            <div class="effect-info">
                                <div class="effect-name">${effect.name}</div>
                                <div class="effect-description">${this.getEffectDescription(effect)}</div>
                            </div>
                            <div class="effect-auto">自動適用</div>
                        </div>
                    `
                        )
                        .join("")}
                </div>
            </div>
        `;
        }

        // アップグレード効果
        if (this.pendingEffects.upgrades.length > 0) {
            html += `
            <div class="effects-group">
                <h3>⚡ アップグレード効果</h3>
                <div class="effects-list">
                    ${this.pendingEffects.upgrades
                        .map(
                            (effect) => `
                        <div class="effect-item upgrade-effect">
                            <span class="effect-icon">${this.getEffectIcon(effect.itemId)}</span>
                            <div class="effect-info">
                                <div class="effect-name">${effect.name}</div>
                                <div class="effect-description">${this.getEffectDescription(effect)}</div>
                            </div>
                            <label class="effect-toggle">
                                <input type="checkbox" checked 
                                    onchange="Game.toggleUpgradeEffect('${effect.itemId}', this.checked)">
                                適用する
                            </label>
                        </div>
                    `
                        )
                        .join("")}
                </div>
            </div>
        `;
        }

        return html || '<p class="no-effects">適用可能な効果はありません</p>';
    },

    // 効果のアイコンを取得
    getEffectIcon(itemId) {
        const icons = {
            extra_life: "💖",
            instant_shield: "⚡",
            mining_boost: "⛏️",
            shield_extension: "🛡️"
        };
        return icons[itemId] || "🎯";
    },

    // 効果の説明を取得
    getEffectDescription(effect) {
        const descriptions = {
            extra_life: "ライフ+1でゲーム開始",
            instant_shield: "開始時シールド発動",
            mining_boost: "採掘確率+10%",
            shield_extension: "シールド時間+2秒"
        };
        return descriptions[effect.itemId] || effect.description || "効果を適用します";
    },

    // アップグレード効果のトグル
    toggleUpgradeEffect(itemId, enabled) {
        const effect = this.pendingEffects.upgrades.find((e) => e.itemId === itemId);
        if (effect) {
            effect.enabled = enabled;
        }
    },

    // 効果を適用してゲーム開始
    startGameWithEffects() {

        // 効果キューの初期化確認
        if (!this.pendingEffects) {
            this.pendingEffects = {
                upgrades: [],
                consumables: []
            };
        }

        let appliedItems = [];

        // アップグレード効果の適用試行
        this.pendingEffects.upgrades.forEach((effect, index) => {
            if (effect.enabled !== false && !effect.applied) {

                appliedItems.push(effect.itemId);

                // 適用を試みて結果に関わらずマーク
                const applied = this.applyUpgradeEffect(effect);
                this.pendingEffects.upgrades[index].applied = true;

            }
        });

        // 消費アイテム効果の適用試行
        this.pendingEffects.consumables.forEach((effect, index) => {
            if (!effect.applied) {
                appliedItems.push(effect.itemId);

                // 適用を試みて結果に関わらずマーク
                const applied = this.applyConsumableEffect(effect);
                this.pendingEffects.consumables[index].applied = true;

            }
        });


        // ▼▼▼ 修正: 適用済みアイテムのクリーンアップを追加 ▼▼▼

        // 適用済みの消費アイテムを完全に削除（1回限り）
        const beforeConsumables = this.pendingEffects.consumables.length;
        this.pendingEffects.consumables = this.pendingEffects.consumables.filter((effect) => !effect.applied);
        const afterConsumables = this.pendingEffects.consumables.length;

        // 適用済みのアップグレード効果もフィルタリング
        const beforeUpgrades = this.pendingEffects.upgrades.length;
        this.pendingEffects.upgrades = this.pendingEffects.upgrades.filter((effect) => !effect.applied);
        const afterUpgrades = this.pendingEffects.upgrades.length;

        if (this.DEBUG_MODE) {
        }

        // 効果キューを保存
        this.savePendingEffects();

        this.closePreGameModal();
        this.startGameDirectly();
    },

    // 効果なしでゲーム開始
    startGameWithoutEffects() {

        // 🔧 確認: 効果をクリアせずに保持（次回も選択可能）
        // アイテムは消費しない

        this.closePreGameModal();
        this.startGameDirectly();
    },

    // ゲーム開始をキャンセル
    cancelGameStart() {

        this.closePreGameModal();

        // 確実にタイトル画面に戻る
        window.TitleScreen.showScreen("titleScreen");

        // 効果音
        if (window.SoundManager && window.SoundManager.play) {
            window.SoundManager.play("menuOpen");
        }
    },

    // モーダルを閉じる
    closePreGameModal() {
        const modal = document.getElementById("preGameModal");
        if (modal) modal.remove();
        const gameControls = document.getElementById("gameControls");
        if (gameControls) gameControls.style.visibility = "";
    },

    // 直接ゲーム開始（既存のstartメソッドから分離）
    startGameDirectly() {

        // 装備中武器の効果を適用（毎ゲーム開始時に必ず設定）
        if (window.StorageSystem && window.Bullets) {
            const effect = window.StorageSystem.getEquippedWeaponEffect();
            window.Bullets.burstCount = 1;
            window.Bullets.bossDamageMultiplier = 1;
            window.Bullets.laserLevel = 0;
            window.Bullets.fireFuelCost = 0;
            window.Bullets.laserFuelCost = 0;
            window.Bullets.chargeLevel = 0;
            window.Bullets.barrierLevel = 0;
            window.Bullets.homingLevel = 0;
            window.Bullets.homingBullets = [];
            if (effect) {
                if (effect.burstCount)    window.Bullets.burstCount = effect.burstCount;
                if (effect.bossDamage)    window.Bullets.bossDamageMultiplier = effect.bossDamage;
                if (effect.fireFuelCost)  window.Bullets.fireFuelCost = effect.fireFuelCost;
                if (effect.laserLevel) {
                    window.Bullets.laserLevel          = effect.laserLevel;
                    window.Bullets.laserFireMs         = effect.fireDurationMs;
                    window.Bullets.laserCooldownMs     = effect.cooldownMs;
                    window.Bullets.laserDamagePerFrame = effect.damagePerFrame;
                    window.Bullets.laserFuelCost       = effect.laserFuelCost || 0;
                    window.Bullets.laserState          = "cooldown";
                    window.Bullets.laserTimer          = 0;
                    window.Bullets.laserLastTime       = Date.now();
                }
                // チャージショット
                if (effect.chargeMs) {
                    window.Bullets.chargeLevel       = effect.chargeLevel || 1;
                    window.Bullets.chargeMs          = effect.chargeMs;
                    window.Bullets.chargeCooldownMs  = effect.cooldownMs;
                    window.Bullets.chargeDamage      = effect.damage || 1;
                    window.Bullets.chargeBossDamage  = effect.bossDamage2 || effect.bossDamage || 2;
                    window.Bullets.chargeFuelCost    = effect.fuelCost || 3;
                    window.Bullets.chargeState       = "ready";
                    window.Bullets.chargeTimer       = 0;
                    window.Bullets.chargeLastTime    = Date.now();
                }
                // バリア砲
                if (effect.widthMul) {
                    window.Bullets.barrierLevel      = effect.barrierLevel || 1;
                    window.Bullets.barrierWidthMul   = effect.widthMul;
                    window.Bullets.barrierHeightMul  = effect.heightMul;
                    window.Bullets.barrierFireMs     = effect.fireMs;
                    window.Bullets.barrierCooldownMs = effect.cooldownMs;
                    window.Bullets.barrierFuelPerSec = effect.fuelPerSec;
                    window.Bullets.barrierState      = "cooldown";
                    window.Bullets.barrierTimer      = 0;
                    window.Bullets.barrierLastTime   = Date.now();
                }
                // ホーミング弾
                if (effect.homingCount) {
                    window.Bullets.homingLevel       = effect.homingLevel || 1;
                    window.Bullets.homingCount       = effect.homingCount;
                    window.Bullets.homingIntervalMs  = effect.intervalMs;
                    window.Bullets.homingAngleRange  = effect.angleRange;
                    window.Bullets.homingFuelCost    = effect.fuelCost || 0;
                    window.Bullets.homingLastTime    = 0;
                    window.Bullets.homingBullets     = [];
                }
            }
        }

        // バフスロットの効果を自動適用（消費）
        if (window.StorageSystem && window.StorageSystem.applyBuffSlots) {
            const buffs = window.StorageSystem.applyBuffSlots();
            buffs.forEach(buff => {
                if (!buff.effect) return;
                // 採掘ブースト
                if (buff.effect.miningRate) {
                    this.MINING_DROP_RATE = this.MINING_DROP_RATE * (1 + buff.effect.miningRate);
                }
                // シールド延長
                if (buff.effect.shieldDuration && window.PowerUps) {
                    window.PowerUps.SHIELD_DURATION = (window.PowerUps.SHIELD_DURATION || 5000) + buff.effect.shieldDuration;
                }
                // 追加ライフ
                if (buff.effect.startingLives) {
                    this.maxLives = Math.min(5, (this.maxLives || 3) + buff.effect.startingLives);
                }
                // 即時シールド
                if (buff.effect.instantShield) {
                    this.startWithShield = true;
                }
            });
        }

        // ゲーム開始前にシールド延長効果を適用
        this.applyPendingShieldExtensions();

        // ゲーム開始時には効果を適用しない（既に適用済みまたは適用しない選択）
        // ここでは効果キューの初期化のみ行う

        if (!this.pendingEffects) {
            this.pendingEffects = {
                upgrades: [],
                consumables: []
            };
        }

        // アクティブ効果の初期化
        if (!this.activeEffects) {
            this.activeEffects = {};
        }

        if (!this.effectCleanup) {
            this.effectCleanup = [];
        }

        this.gameRunning = true;
        this.gamePaused = false;
        this.lives = this.maxLives;

        // 開始時シールドの適用チェック

        // 即時シールド効果をチェックして適用
        if (this.startWithShield) {
            this.applyStartingShield();
        }

        // セッションデータのリセット
        this.distance = 0;
        this.score = 0;
        this.wormholeCount = 0;
        this.shieldCollectCount = 0;
        this.dodgeCount = 0;
        this.shieldCrashCount = 0;
        this.resourceManagerCount = 0;
        this.riskTakerCount = 0;
        // 弾破壊セッションデータのリセット
        this.sessionBulletDestructionCount = 0;
        // B-35修正: 種類別破壊数・ボス撃破数・シールド種類別破壊数を持ち越さない
        this.sessionDestroyedByType         = { normal: 0, fast: 0, large: 0 };
        this.sessionBossDestroyed           = 0;
        this.sessionShieldDestroyedByType   = { normal: 0, fast: 0, large: 0 };

        // 採掘システムのリセット
        this.sessionOres = 0;
        this.sessionMiningCount = 0;
        this.sessionCommonOres = 0;
        this.sessionRareOres = 0;
        this.sessionEpicOres = 0;

        this.currentSessionStats = {
            startTime: Date.now(),
            miningAttempts: 0,
            successfulMining: 0,
            comboHistory: []
        };

        // BGM切り替え
        if (window.BGMManager.enabled && !window.BGMManager.isContextSuspended) {
            window.BGMManager.play("gameplay");
        }

        // UI表示
        window.UI.showGameControls();
        window.UI.showGameAreaStats();
        window.UI.setupLivesDisplay();
        window.UI.updateLives(this.lives, this.maxLives);

        // ゲームオブジェクトのリセット
        window.Obstacles.reset();
        window.Wormholes.reset();
        window.Particles.reset();
        window.PowerUps.reset();
        window.Resources.reset();

        // スコア内訳リセット
        this.scoreBreakdown = {
            flight: 0,
            wormhole: 0,
            shield: 0,
            resource: 0,
            bullet: 0,
            shield_destroy: 0   // B-34修正: 前ゲームのシールド破壊スコアを持ち越さない
        };

        window.UI.updateStats(this.distance, this.score, this.wormholeCount);
        this.gameLoop();

        if (window.announceToScreenReader) {
            announceToScreenReader("ゲーム開始");
        }
    },

    // 保留中のシールド延長効果を適用
    applyPendingShieldExtensions() {
        if (!this.pendingEffects || !this.pendingEffects.upgrades) return;

        let totalExtension = 0;
        let appliedCount = 0;

        // ▼▼▼ 修正: 適用済み効果を追跡して二重適用防止 ▼▼▼
        const effectsToRemove = [];

        // シールド延長効果を集計
        this.pendingEffects.upgrades.forEach((effect, index) => {
            if (effect.itemId === "shield_extension" && effect.enabled !== false && !effect.applied) {
                const extensionTime = effect.effect?.shieldDuration || 2000;
                totalExtension += extensionTime;

                // 適用済みマーク
                effect.applied = true;
                appliedCount++;

                // 削除リストに追加（適用済みで永続効果ではないもの）
                if (!effect.permanent) {
                    effectsToRemove.push(index);
                }

            }
        });

        // ▼▼▼ 修正: 適用済み効果をキューから削除 ▼▼▼
        if (effectsToRemove.length > 0) {
            // インデックスがずれないように後ろから削除
            effectsToRemove
                .sort((a, b) => b - a)
                .forEach((index) => {
                    this.pendingEffects.upgrades.splice(index, 1);
                });
        }

        if (totalExtension > 0) {
            this.SHIELD_EXTENSION_AMOUNT = totalExtension;
            const newBaseDuration = 5000 + totalExtension;

            if (window.PowerUps && window.PowerUps.SHIELD_DURATION !== undefined) {
                window.PowerUps.SHIELD_DURATION = newBaseDuration;
            }

            // 通知表示
            if (window.showNotification) {
                window.showNotification(`🛡️ シールド時間が延長されました: +${totalExtension / 1000}秒`, "success");
            }
        }

        this.savePendingEffects();
    },

    // 開始時シールド適用
    applyStartingShield() {

        if (window.PowerUps && typeof PowerUps.activateShield === "function") {
            try {
                // プレイヤー位置が確実に確定してから適用
                setTimeout(() => {
                    window.PowerUps.activateShield();

                    // フラグをリセット（1回のみの効果）
                    this.startWithShield = false;
                }, 50); // 短い遅延で確実性を向上
                return true;
            } catch (error) {
                console.error("❌ 開始時シールド適用エラー:", error);
                return false;
            }
        } else {
            console.error("❌ PowerUpsモジュールが利用できません");
            return false;
        }
    },

    // モーダル表示ユーティリティ
    showModal(html) {
        // 既存のモーダルを削除
        const existingModal = document.querySelector(".pre-game-modal");
        if (existingModal) {
            existingModal.remove();
        }

        // 新しいモーダルを追加
        document.body.insertAdjacentHTML("beforeend", html);
    },

    // ここからデバッグ用
    addDebugEffect() {
        if (!this.pendingEffects) {
            this.pendingEffects = { upgrades: [], consumables: [] };
        }

        // テスト用の効果を追加
        this.pendingEffects.consumables.push({
            itemId: "extra_life",
            name: "追加ライフ（デバッグ）",
            effect: { startingLives: 1 },
            type: "consumable",
            usage: "pre_game",
            applied: false,
            enabled: true
        });

        this.savePendingEffects();


        // 即時確認
        this.loadPendingEffects();


        // 通知表示
        if (window.showNotification) {
            window.showNotification("🐛 デバッグ効果を追加しました", "info");
        }
    },

    debugBulletStats() {
        if (this.DEBUG_MODE) {
        }
    }
};

// ✅ 追加: スクリプト読み込み状態のデバッグ

window.Game = Game; // グローバルGameオブジェクトを明示的に設定

function waitForGlobalObject(objectName, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        function checkObject() {
            // グローバルオブジェクトとwindowオブジェクトの両方をチェック
            const obj = window[objectName] || (objectName === 'Game' ? window.Game : null);
            
            if (obj) {
                resolve(obj);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`${objectName} の読み込みタイムアウト`));
            } else {
                setTimeout(checkObject, 50); // チェック間隔を短縮
            }
        }

        checkObject();
    });
}

window.onload = async function () {

    // 🔧 修正: Gameオブジェクトが利用可能になるまで待機
    try {
        await waitForGlobalObject("Game", 3000);
    } catch (error) {
        console.error("❌ Gameオブジェクトの読み込みに失敗:", error);

        // 代替手段: 手動でGameオブジェクトを確認
        if (typeof window.Game !== "undefined") {
            window.Game = Game;
        } else {
            console.error("💥 ゲームを開始できません。ページを再読み込みしてください。");
            return;
        }
    }

    // BGM状態デバッグ関数（既存のコードを維持）
    // function debugBGMState() {
    //     console.log("🔍 BGM状態:", {
    //         enabled: BGMManager.enabled,
    //         isPlaying: BGMManager.isPlaying,
    //         userGestureOccurred: BGMManager.userGestureOccurred,
    //         audioContext: !!BGMManager.audioContext,
    //         audioContextState: BGMManager.audioContext?.state,
    //         currentBGM: BGMManager.currentBGM?.sequence?.name
    //     });
    // }

    // 初期化
    async function initializeGame() {
        try {
            // 🔧 修正: Gameオブジェクトが利用可能か確認
            if (!window.Game || typeof Game.init !== "function") {
                console.error("❌ Gameオブジェクトが利用できません。スクリプト読み込み順序を確認してください。");

                // ユーザーへの通知
                if (window.showNotification) {
                    window.showNotification(
                        "ゲームの読み込みに失敗しました。ページを再読み込みしてください。",
                        "error"
                    );
                }
                return;
            }

            window.Game.init();

            // グローバルモジュール登録
            ensureGlobalModules();

            // 効果システムの初期化
            if (typeof window.Game.initializeEffectSystem === "function") {
                window.Game.initializeEffectSystem();
            }

            // 保留中の効果を読み込み
            if (typeof window.Game.loadPendingEffects === "function") {
                window.Game.loadPendingEffects();
            }

            // 既存の初期化コード
            window.SoundManager.init();

            await window.BGMManager.init();

            if (window.Game.loadCumulativeStats) {
                window.Game.loadCumulativeStats();
            }

            // ショップマネージャー初期化
            if (window.ShopManager && window.ShopManager.init) {
                window.ShopManager.init();
            }

            // StorageSystemの初期化を遅延
            setTimeout(() => {
                if (window.StorageSystem && window.StorageSystem.init) {
                    window.StorageSystem.init();
                }
            }, 300);

            window.TitleScreen.init();

            window.UI.init();

            // サウンドプリロード
            window.SoundManager.preloadAll();

            // 初期状態デバッグ
            // debugBGMState();

            // アクセシビリティ機能の初期化
            initAccessibility();

            // データ整合性チェック
            setTimeout(() => {

                // 強制同期
                if (window.StorageSystem && window.StorageSystem.syncWithGameData) {
                    window.StorageSystem.syncWithGameData();
                }
            }, 1000);
        } catch (error) {
            console.error("💥 初期化エラー:", error);
        }
    }
    
    // 🔧 追加: グローバルモジュール登録を確実にする関数
function ensureGlobalModules() {
    
    const modules = [
        { name: 'PowerUps', object: typeof window.PowerUps !== 'undefined' ? window.PowerUps : null },
        { name: 'Resources', object: typeof window.Resources !== 'undefined' ? window.Resources : null },
        { name: 'Obstacles', object: typeof window.Obstacles !== 'undefined' ? window.Obstacles : null },
        { name: 'Wormholes', object: typeof window.Wormholes !== 'undefined' ? window.Wormholes : null },
        { name: 'Particles', object: typeof window.Particles !== 'undefined' ? window.Particles : null }
    ];
    
    modules.forEach(module => {
        if (module.object && !window[module.name]) {
            window[module.name] = module.object;
        } else if (window[module.name]) {
        } else {
        }
    });
}

    // ユーザージェスチャーハンドラー
    function setupUserGestureHandler() {
        let gestureHandled = false;

        const handleUserGesture = async () => {
            if (gestureHandled) {
                return;
            }

            gestureHandled = true;

            try {
                // 1. AudioContextを確実に作成
                const audioSuccess = await BGMManager.initializeAudioContext();

                if (!audioSuccess) {
                    console.error("❌ AudioContext作成失敗");
                    return;
                }

                // 2. コンテキストをレジューム
                const resumeSuccess = await BGMManager.resumeContext();

                if (!resumeSuccess) {
                    console.error("❌ AudioContextレジューム失敗");
                    return;
                }

                // 3. 状態確認
                // debugBGMState();

                // 4. BGM再生
                if (window.BGMManager.enabled) {
                    // 少し遅延を入れて確実に
                    setTimeout(() => {
                        window.BGMManager.play("mainTheme");

                        // 再生確認
                        setTimeout(() => {
                            // debugBGMState();
                        }, 500);
                    }, 100);
                }
            } catch (error) {
                console.error("❌ ユーザージェスチャー処理エラー:", error);
            }
        };

        // イベントリスナー設定
        const setupListeners = () => {
            const events = ["click", "touchstart", "keydown"];

            events.forEach((event) => {
                document.addEventListener(event, handleUserGesture, {
                    once: true,
                    passive: true
                });
            });

        };

        setupListeners();

        // 🔧 修正: 存在しない関数をコメントアウト
        // createDebugStartButton();
    }

    // アクセシビリティ機能の実装（元のコードを保持）
    function initAccessibility() {
        // キーボード操作のサポート
        document.addEventListener("keydown", (e) => {

            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    if (window.Game.gameRunning) {
                        window.Game.togglePause();
                    }
                    break;

                case "Escape":
                    e.preventDefault();
                    if (window.TitleScreen.getCurrentScreen() === "gameScreen") {
                        window.TitleScreen.showScreen("titleScreen");
                        window.Game.reset();
                    }
                    break;

                case "KeyR":
                    if (window.Game.gameRunning && !window.Game.gamePaused) {
                        e.preventDefault();
                        window.Game.reset();
                    }
                    break;
            }
        });

        // 減光モードの検出と対応
        handleReducedMotion();

        // フォーカス表示の改善
        enhanceFocusIndicators();

    }

    // 減光モードの処理（元のコードを保持）
    function handleReducedMotion() {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

        const applyReducedMotion = (shouldReduce) => {
            if (shouldReduce) {

                // CSS変数でアニメーションを制御
                document.documentElement.style.setProperty("--animation-duration", "0.01s");
                document.documentElement.style.setProperty("--transition-duration", "0.01s");

                // ゲーム設定の調整
                if (window.Game.OBSTACLE_SPAWN_RATE) {
                    window.Game.OBSTACLE_SPAWN_RATE = 0.02; // 難易度を少し下げる
                }

                // パーティクルエフェクトを制限
                if (window.Particles && window.Particles.createEffect) {
                    // パーティクル数を減らす
                    const originalCreateEffect = Particles.createEffect;
                    window.Particles.createEffect = function (x, y, color) {
                        for (let i = 0; i < 5; i++) {
                            // 20から5に減少
                            this.particles.push({
                                x: x,
                                y: y,
                                vx: (Math.random() - 0.5) * 2, // 速度を低下
                                vy: (Math.random() - 0.5) * 2,
                                life: Math.random() * 20 + 10, // 寿命を短縮
                                color: color || `hsl(${Math.random() * 60 + 250}, 100%, 70%)`
                            });
                        }
                    };
                }
            } else {
                document.documentElement.style.setProperty("--animation-duration", "0.3s");
                document.documentElement.style.setProperty("--transition-duration", "0.3s");
            }
        };

        // 初期状態の適用
        applyReducedMotion(reducedMotion.matches);

        // 設定変更を監視
        reducedMotion.addEventListener("change", (e) => {
            applyReducedMotion(e.matches);

            // ゲームが実行中なら再描画
            if (window.Game.gameRunning) {
                window.Game.draw();
            }
        });
    }

    // フォーカス表示の改善（元のコードを保持）
    function enhanceFocusIndicators() {
        const style = document.createElement("style");
        style.textContent = `
            button:focus, 
            input:focus, 
            select:focus {
                outline: 3px solid #00ffff !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 3px rgba(0, 255, 255, 0.5) !important;
            }
            
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
            
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01s !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01s !important;
                }
            }
        `;
        document.head.appendChild(style);

        // スクリーンリーダー用の隠しテキストを追加
        const gameStatus = document.createElement("div");
        gameStatus.id = "gameStatus";
        gameStatus.className = "sr-only";
        gameStatus.setAttribute("aria-live", "polite");
        gameStatus.setAttribute("aria-atomic", "true");
        document.body.appendChild(gameStatus);
    }

    // ゲーム状態をスクリーンリーダーに通知（元のコードを保持）
    function announceToScreenReader(message) {
        const gameStatus = document.getElementById("gameStatus");
        if (gameStatus) {
            gameStatus.textContent = message;
        }
    }

    // グローバルに公開（他のファイルからも呼び出せるように）
    window.announceToScreenReader = announceToScreenReader;

    // ゲーム初期化を開始
    await initializeGame();
    setupUserGestureHandler();


    // 定期的な状態監視（開発用）
    // setInterval(debugBGMState, 5000);

    // 新しい関数：初期BGM再生試行（元のコードを修正）
    function attemptInitialBGM() {

        // ユーザージェスチャーが行われ、AudioContextが存在する場合のみ再生
        if (window.BGMManager.userGestureOccurred && window.BGMManager.audioContext && window.BGMManager.enabled && !window.BGMManager.isPlaying) {
            window.BGMManager.play("mainTheme");
        } else {
        }
    }

    // グローバルに公開してデバッグ用
    // window.debugBGMState = debugBGMState;
    window.attemptInitialBGM = attemptInitialBGM;

    // テスト用関数
    window.testBGM = function () {
        window.BGMManager.play("mainTheme");

        const checkInterval = setInterval(() => {
        }, 1000);

        setTimeout(() => {
            clearInterval(checkInterval);
            window.BGMManager.stop();
        }, 10000);
    };

    // デバッグ用: ストレージの状態を確認
    // function debugStorage() {
    //     console.log("🔍 ストレージ状態:");
    //     const keys = ["gameCumulativeStats", "achievementsProgress"];
    //     keys.forEach((key) => {
    //         const value = localStorage.getItem(key);
    //         console.log(`  ${key}:`, value);
    //     });
    // }

    // 定期的にストレージ状態を確認（開発用）
    // setInterval(debugStorage, 10000);

    // 手動でリセットする関数（開発用）
    function resetCumulativeStats() {
        localStorage.removeItem("gameCumulativeStats");
        localStorage.removeItem("achievementsProgress");
        window.Game.totalShieldCollectCount = 0;
        window.Game.totalWormholePassCount = 0;
        window.Game.saveCumulativeStats();
        location.reload();
    }

    function debugDodgeAchievement() {

        const achievement = Achievements.achievements.find((a) => a.id === "dodge_master");
        if (achievement) {
            const currentLevel = Achievements.unlockedLevels.get(achievement.id) || 0;
            const currentValue = achievement.getCurrentValue(Achievements.getGameState());
        }
    }

    // グローバルに公開（開発用）
    // window.debugStorage = debugStorage;
    window.resetCumulativeStats = resetCumulativeStats;
    window.debugDodgeAchievement = debugDodgeAchievement;

    // 開発用のショップデバッグ関数を追加
    function createShopDebugInterface() {
        if (document.getElementById("shopDebugPanel")) return;

        const debugPanel = document.createElement("div");
        debugPanel.id = "shopDebugPanel";
        debugPanel.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 10000;
        max-width: 300px;
    `;

        debugPanel.innerHTML = `
        <h4>🛒 ショップデバッグ</h4>
        <div>所持鉱石: ${window.Game ? window.Game.totalOres : 0}</div>
        <div>鉄: ${window.Game ? window.Game.totalCommonOres : 0} | 銀: ${window.Game ? window.Game.totalRareOres : 0} | 金: ${window.Game ? window.Game.totalEpicOres : 0}</div>
        <button onclick="testUpgradePurchase()">テストアップグレード購入</button>
        <button onclick="debugShopStatus()">ショップ状態表示</button>
    `;

        document.body.appendChild(debugPanel);
    }

    // グローバル関数として公開
    window.testUpgradePurchase = function () {
        if (window.ShopManager && window.Game.totalOres >= 100) {
            const success = ShopManager.purchaseUpgrade("miningEfficiency");
            if (success) {
            } else {
            }
        }
    };

    window.debugShopStatus = function () {
        if (window.ShopManager) {
        }
    };

    // 開発用: 強制同期関数
    window.forceSyncStorage = function () {

        if (window.StorageSystem && window.Game) {
            // 双方向同期
            window.StorageSystem.loadFromGameData();
            window.StorageSystem.syncWithGameData();
            window.StorageSystem.saveStorage();
            window.Game.saveCumulativeStats();

        }
    };

    // 開発用: データリセット関数
    window.resetOreData = function () {
        if (confirm("鉱石データをリセットしますか？")) {
            if (window.StorageSystem) {
                window.StorageSystem.resources = { common: 0, rare: 0, epic: 0 };
                window.StorageSystem.saveStorage();
            }
            if (window.Game) {
                window.Game.totalCommonOres = 0;
                window.Game.totalRareOres = 0;
                window.Game.totalEpicOres = 0;
                window.Game.totalOres = 0;
                window.Game.saveCumulativeStats();
            }
        }
    };

    // 開発用: データ状態チェック関数
    window.checkDataState = function () {

        if (window.Game) {
        }

        if (window.StorageSystem) {
        }

        // localStorageの生データも確認
        try {
            const gameStats = localStorage.getItem("gameCumulativeStats");
            const storageData = localStorage.getItem("gameStorage");

        } catch (error) {
            console.error("❌ localStorage読み込みエラー:", error);
        }
    };

    // ページ読み込み時にもチェック
    window.addEventListener("load", function () {
        setTimeout(() => {
            if (window.checkDataState) {
                window.checkDataState();
            }
        }, 1000);
    });

    // 開発用: 統計データ確認関数
    window.debugStatsData = function () {

        if (window.Game) {
        }

        if (window.StorageSystem) {
        }

        // 統計画面の計算を確認
        const scoreBreakdown = Game ? Game.scoreBreakdown : {};
        const flightScore = Game
            ? window.Game.score - (scoreBreakdown.wormhole + scoreBreakdown.shield + scoreBreakdown.resource)
            : 0;

    };

    // 🔧 追加: 効果システムのデバッグ関数
    window.debugEffectSystem = function () {

        if (window.Game) {
        } else {
        }
    };

    // 🔧 追加: テスト用効果追加関数
    window.addTestEffect = function () {
        if (!window.Game) {
            console.error("❌ Gameオブジェクトが利用できません");
            return;
        }

        if (!window.Game.pendingEffects) {
            window.Game.pendingEffects = { upgrades: [], consumables: [] };
        }

        // テスト用の消費アイテム効果を追加
        const testEffect = {
            itemId: "extra_life",
            name: "追加ライフ（テスト）",
            effect: { startingLives: 1 },
            type: "consumable",
            usage: "pre_game",
            applied: false,
            enabled: true
        };

        window.Game.pendingEffects.consumables.push(testEffect);
        window.Game.savePendingEffects();

        window.debugEffectSystem();
    };

    // 🔧 追加: 効果キューをクリアする関数
    window.clearPendingEffects = function () {
        if (window.Game) {
            window.Game.pendingEffects = { upgrades: [], consumables: [] };
            window.Game.savePendingEffects();
            window.debugEffectSystem();
        }
    };
};


