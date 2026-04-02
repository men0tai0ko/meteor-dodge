
// ============================================================
// obstacles.js
// Obstacles — 隕石・障害物
// ============================================================
const Obstacles = {
    DEBUG_MODE: false,
    obstacles: [],
    lastCollided: null,

    init() {
        this.DEBUG_MODE = window.Game ? window.Game.DEBUG_MODE : false;
        this.obstacles = [];
        this.boss = null;
        this.nextFastDistance  = 500;
        this.nextLargeDistance = 1000;

        // 新しいデバッグログ
        if (window.DebugLogger) {
            window.DebugLogger.debug("OBSTACLES", "障害物システム初期化");
        }
    },

    // デバッグログ用のユーティリティメソッド
    debugLog(message, data = null) {
        if (this.DEBUG_MODE) {
            if (data) {
            } else {
            }
        }
        // 新しいログシステム（オプション）
        if (window.DebugLogger) {
            window.DebugLogger.debug("OBSTACLES", message, data);
        }
    },

    debugWarn(message, data = null) {
        if (this.DEBUG_MODE) {
            if (data) {
            } else {
            }
        }
        if (window.DebugLogger) {
            window.DebugLogger.warn("OBSTACLES", message, data);
        }
    },

    // 重大なエラー（常に表示）
    criticalError(message, error = null) {
        if (error) {
            console.error(`❌ ${message}:`, error);
        } else {
            console.error(`❌ ${message}`);
        }
        if (window.DebugLogger) {
            window.DebugLogger.error("OBSTACLES", message, error);
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
        if (window.DebugLogger && this.DEBUG_MODE) {
            window.DebugLogger.error("OBSTACLES", message, error);
        }
    },

    reset() {
        this.obstacles = [];
        this.boss = null;
        this.nextFastDistance  = 500;
        this.nextLargeDistance = 1000;
        this.lastCollided = null;

        if (window.DebugLogger) {
            window.DebugLogger.debug("OBSTACLES", "障害物リセット");
        }
    },


    // ボス隕石のスポーン
    spawnBoss(canvas) {
        if (this.boss) return;
        const distance = (window.Game && window.Game.distance) || 0;
        const bossHpMul = (window.Game && window.Game.bossDifficultyMul) || 1.0;
        const hp = Math.max(1, Math.round(Math.min(10, 5 + Math.floor(distance / 2000)) * bossHpMul));
        const size = canvas.width * 0.40;
        this.boss = {
            x: canvas.width / 2 - size / 2,
            y: -size,
            width: size,
            height: size,
            speed: canvas.height * 0.002,
            hp,
            maxHp: hp,
            hitFlash: 0,
        };
    },

    // ボス更新（毎フレーム呼ぶ）
    updateBoss(canvas, playerBounds) {
        if (!this.boss) return false;
        const b = this.boss;
        b.y += b.speed;
        if (b.hitFlash > 0) b.hitFlash--;
        if (b.y > canvas.height * 0.85) {
            this.boss = null;
            return false;
        }
        if (playerBounds &&
            b.x < playerBounds.x + playerBounds.width &&
            b.x + b.width  > playerBounds.x &&
            b.y < playerBounds.y + playerBounds.height &&
            b.y + b.height > playerBounds.y) {
            return true;
        }
        return false;
    },

    // ボス描画
    drawBoss(ctx) {
        if (!this.boss) return;
        const b = this.boss;
        const cx = b.x + b.width  / 2;
        const cy = b.y + b.height / 2;
        const r  = b.width / 2;
        const base = b.hitFlash > 0 ? "#FFFFFF" : "#4A4A4A";
        const hl   = b.hitFlash > 0 ? "#DDDDDD" : "#6A6A6A";

        ctx.fillStyle = base;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = hl;
        ctx.beginPath();
        ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.38, 0, Math.PI * 2);
        ctx.fill();

        if (b.hitFlash === 0) {
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            for (const [dx, dy, cr] of [[0.3,0.2,0.14],[-0.35,0.1,0.10],[0.1,-0.35,0.12],[-0.2,-0.2,0.08]]) {
                ctx.beginPath();
                ctx.arc(cx + r*dx, cy + r*dy, r*cr, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.fillStyle = "#FF4400";
        ctx.font = `bold ${Math.round(r * 0.4)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("☄", cx, cy);

        // HPバー
        const barW = b.width * 0.8;
        const barH = Math.max(8, b.width * 0.04);
        const barX = cx - barW / 2;
        const barY = b.y + b.height + 6;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(barX, barY, barW, barH);
        const hpR = b.hp / b.maxHp;
        ctx.fillStyle = hpR > 0.5 ? "#00FF88" : hpR > 0.25 ? "#FFD700" : "#FF4444";
        ctx.fillRect(barX, barY, barW * hpR, barH);
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);

        // HPテキスト
        ctx.fillStyle = "#FFFFFF";
        ctx.font = `${Math.round(barH * 0.85)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`HP ${b.hp}/${b.maxHp}`, cx, barY + barH / 2);
    },

    // 弾がボスに当たったか判定
    hitBoss(bullet) {
        if (!this.boss) return false;
        const b = this.boss;
        if (bullet.x < b.x + b.width  &&
            bullet.x + bullet.width  > b.x &&
            bullet.y < b.y + b.height &&
            bullet.y + bullet.height > b.y) {
            const dmg = window.Bullets ? (window.Bullets.bossDamageMultiplier || 1) : 1;
            b.hp -= dmg;
            b.hitFlash = 6;
            if (b.hp <= 0) {
                const cx = b.x + b.width  / 2;
                const cy = b.y + b.height / 2;
                if (window.Particles) {
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            if (window.Particles) {
                                window.Particles.createEffect.bind(window.Particles)(
                                    cx + (Math.random()-0.5)*b.width*0.4,
                                    cy + (Math.random()-0.5)*b.height*0.4,
                                    "#FF8800", "bulletHit");
                            }
                        }, i * 120);
                    }
                }
                this.boss = null;
                return "destroyed";
            }
            return "hit";
        }
        return false;
    },

    // 隕石タイプ定義
    TYPES: {
        normal: {
            minSize: 0.05, maxSize: 0.12,
            speedMin: 0.004, speedMax: 0.010,
            color: "#8B4513", highlight: "#A0522D",
        },
        fast: {
            minSize: 0.04, maxSize: 0.08,
            speedMin: 0.010, speedMax: 0.020,
            color: "#B22222", highlight: "#DC143C",
        },
        large: {
            minSize: 0.15, maxSize: 0.22,
            speedMin: 0.002, speedMax: 0.005,
            color: "#696969", highlight: "#808080",
        },
    },

    spawn(canvas) {
        if (this.obstacles.length >= 20) return;
        // ボス出現中は通常隕石を出さない
        if (this.boss) return;

        const distance = (window.Game && window.Game.distance) || 0;

        // 閾値を超えていたらタイプを確定して次の閾値へ進める
        // large（1000kmごと）は fast（500kmごと）より優先
        let typeName = "normal";
        if (distance >= this.nextLargeDistance) {
            typeName = "large";
            this.nextLargeDistance += 1000;
            this.nextFastDistance  += 500; // fast も1つ進める（スキップしない）
        } else if (distance >= this.nextFastDistance) {
            typeName = "fast";
            this.nextFastDistance += 500;
        }

        const type = this.TYPES[typeName];
        const size  = canvas.width  * (Math.random() * (type.maxSize - type.minSize) + type.minSize);
        const speed = canvas.height * (Math.random() * (type.speedMax - type.speedMin) + type.speedMin);

        this.obstacles.push({
            x: Math.random() * (canvas.width - size),
            y: -size,
            width: size,
            height: size,
            speed,
            type: typeName,
        });
    },

    update(canvas, playerBounds) {
        let collisionOccurred = false;
        this.lastCollided = null;

        const controlZoneTop = canvas.height * 0.85; // コントロールゾーン上端
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].y += this.obstacles[i].speed;

            // 反射バリアで上方向に飛び出した隕石を除去（メモリリーク防止）
            if (this.obstacles[i].speed < 0 && this.obstacles[i].y + this.obstacles[i].height < 0) {
                this.obstacles.splice(i, 1);
                continue;
            }

            // 反射直後の衝突猶予（reflectFramesが残っている間は衝突判定スキップ）
            if (this.obstacles[i].reflectFrames > 0) {
                this.obstacles[i].reflectFrames--;
                continue;
            }

            // 衝突判定を詳細にログ出力
            const isColliding = this.checkCollision(playerBounds, this.obstacles[i]);

            if (isColliding) {
                collisionOccurred = true;
                this.lastCollided = {
                    ...this.obstacles[i],
                    index: i
                };

                // 新しいデバッグログを追加
                if (window.DebugLogger) {
                    window.DebugLogger.debug("OBSTACLES", "衝突検出", {
                        obstacleIndex: i,
                        position: { x: this.obstacles[i].x, y: this.obstacles[i].y },
                        hasShield: window.PowerUps.isShieldActive ? window.PowerUps.isShieldActive() : false
                    });
                }

                // シールドがアクティブな場合は隕石を即時削除
                if (window.PowerUps.isShieldActive()) {
                    this.obstacles.splice(i, 1);
                }
                continue;
            }

            // 回避カウントの追跡
            if (this.obstacles[i].y > controlZoneTop) {
                // 燃料状態チェック（コントロールゾーン上端を超えたら回避成功）
                this.checkLowFuelDodge();

                // 確実にGameのメソッドを呼び出す（既存コード）
                if (window.Game && typeof window.Game.incrementDodgeCount === "function") {
                    window.Game.incrementDodgeCount();
                } else {
                    // フォールバック：直接カウント（非推奨）
                    if (window.Game && window.Game.gameRunning && !window.Game.gamePaused) {
                        window.Game.dodgeCount = (window.Game.dodgeCount || 0) + 1;
                        window.Game.totalDodgeCount = (window.Game.totalDodgeCount || 0) + 1;
                    }
                }
                this.obstacles.splice(i, 1);
            }
        }

        return collisionOccurred;
    },

    // 低燃料時の回避チェック
    checkLowFuelDodge: function () {
        if (!window.Game || !window.Game.gameRunning || window.Game.gamePaused) return;

        // 燃料状態をチェック
        if (window.Player && window.Player.fuel !== undefined) {
            const fuelPercent = Player.getFuelPercent();
            const isLowFuel = fuelPercent <= Player.FUEL_SYSTEM.CRITICAL_LEVEL; // 20%以下

            if (isLowFuel) {
                // カウンターを初期化（既存のパターンに従う）
                if (window.Game.lowFuelDodges === undefined) {
                    window.Game.lowFuelDodges = 0;
                }
                if (window.Game.totalLowFuelDodges === undefined) {
                    window.Game.totalLowFuelDodges = 0;
                }

                // カウント増加
                window.Game.lowFuelDodges++;
                window.Game.totalLowFuelDodges++;

                // 特別エフェクト（低燃料回避時）
                window.Particles.createEffect(
                    window.Player.x + window.Player.width / 2,
                    window.Player.y + window.Player.height / 2,
                    "#FF6B6B", // 赤系の色で危機感を表現
                    "lowFuelDodge"
                );

                // デバッグログ
                
                // 新しいデバッグログ
                if (window.DebugLogger) {
                    window.DebugLogger.info('OBSTACLES', '低燃料回避', {
                        fuelPercent: fuelPercent.toFixed(1),
                        currentCount: window.Game.lowFuelDodges,
                        totalCount: window.Game.totalLowFuelDodges
                    });
                }

                // 10回ごとに保存
                if (window.Game.totalLowFuelDodges % 10 === 0) {
                    window.Game.saveCumulativeStats();
                }

                // 実績更新
                if (window.Achievements && window.Achievements.update) {
                    window.Achievements.update(window.Achievements.getGameState());
                }
            }
        }
    },

    getLastCollided() {
        return this.lastCollided;
    },

    checkCollision(rect1, rect2) {
        // パラメータ検証
        if (!rect1 || !rect2) {
            return false;
        }

        // 必須プロパティの存在確認
        const requiredProps = ["x", "y", "width", "height"];
        for (const prop of requiredProps) {
            if (rect1[prop] === undefined || rect2[prop] === undefined) {
                return false;
            }
        }

        // 既存の衝突判定ロジック
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    },

    draw(ctx) {
        for (const obstacle of this.obstacles) {
            const type   = this.TYPES[obstacle.type] || this.TYPES.normal;
            const cx     = obstacle.x + obstacle.width  / 2;
            const cy     = obstacle.y + obstacle.height / 2;
            const radius = obstacle.width / 2;

            // 本体
            ctx.fillStyle = type.color;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            // ハイライト（質感）
            ctx.fillStyle = type.highlight;
            ctx.beginPath();
            ctx.arc(cx - radius * 0.28, cy - radius * 0.28, radius * 0.42, 0, Math.PI * 2);
            ctx.fill();

            // fast 専用：速度感ライン
            if (obstacle.type === "fast") {
                ctx.strokeStyle = "rgba(255,80,80,0.5)";
                ctx.lineWidth = 1.5;
                for (let k = 1; k <= 3; k++) {
                    ctx.beginPath();
                    ctx.moveTo(cx - radius * 0.3, cy + radius * 0.5 * k * 0.5);
                    ctx.lineTo(cx + radius * 0.3, cy + radius * 0.5 * k * 0.5);
                    ctx.stroke();
                }
            }

            // large 専用：クレーター
            if (obstacle.type === "large") {
                ctx.fillStyle = "rgba(0,0,0,0.2)";
                const craters = [[0.25, 0.2, 0.12], [-0.3, 0.1, 0.09], [0.1, -0.3, 0.10]];
                for (const [dx, dy, r] of craters) {
                    ctx.beginPath();
                    ctx.arc(cx + radius * dx, cy + radius * dy, radius * r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
};

Obstacles.getDistance = function (rect1, rect2) {
    const center1 = {
        x: rect1.x + rect1.width / 2,
        y: rect1.y + rect1.height / 2
    };
    const center2 = {
        x: rect2.x + rect2.width / 2,
        y: rect2.y + rect2.height / 2
    };

    const dx = center1.x - center2.x;
    const dy = center1.y - center2.y;
    return Math.sqrt(dx * dx + dy * dy);
};

// 最も近い障害物を検出（新規関数）
Obstacles.findClosestObstacle = function (playerBounds) {
    if (!this.obstacles || this.obstacles.length === 0) return null;

    let closest = null;
    let minDistance = Infinity;

    for (const obstacle of this.obstacles) {
        const distance = this.getDistance(playerBounds, obstacle);
        if (distance < minDistance) {
            minDistance = distance;
            closest = obstacle;
        }
    }

    return { obstacle: closest, distance: minDistance };
};


// ワームホール関連の機能

window.Obstacles = Obstacles;


// ============================================================
// wormholes.js
// Wormholes — ワームホール
// ============================================================
const Wormholes = {
    wormholes: [],
    lastCollided: null,

    init() {
        this.wormholes = [];
        this.lastCollided = null;
    },

    reset() {
        this.wormholes = [];
        this.lastCollided = null;
    },

    spawn(canvas) {
        // 同時出現数を1個に制限（ボス連鎖の抑制）
        if (this.wormholes.length >= 1) return;
        // サイズをcanvas幅の18〜25%に比例
        const size = canvas.width * (Math.random() * 0.07 + 0.18);
        const speed = canvas.height * (Math.random() * 0.004 + 0.002);
        const wormhole = {
            x: Math.random() * (canvas.width - size),
            y: -size,
            width: size,
            height: size,
            speed
        };
        this.wormholes.push(wormhole);
    },

    update(canvas, playerBounds) {
        this.lastCollided = null;

        for (let i = this.wormholes.length - 1; i >= 0; i--) {
            this.wormholes[i].y += this.wormholes[i].speed;

            // 衝突判定
            if (window.Obstacles.checkCollision(playerBounds, this.wormholes[i])) {
                this.lastCollided = { ...this.wormholes[i] };
                this.wormholes.splice(i, 1);

                // ワームホール通過時の燃料消費
                if (window.Game && window.Game.fuelSystemEnabled && window.Player && typeof window.Player.addFuel === "function") {
                    const fuelBonus = Player.FUEL_SYSTEM.WORMHOLE_COST * Player.maxFuel;
                    window.Player.addFuel(Math.abs(fuelBonus)); // 絶対値で回復


                    // 回復エフェクト（緑色のパーティクル）
                    window.Particles.createEffect(
                        this.lastCollided.x + this.lastCollided.width / 2,
                        this.lastCollided.y + this.lastCollided.height / 2,
                        "#00ff00", // 緑色 = 回復
                        "fuelRecovery"
                    );
                }

                // リスクテイカー実績: 残りライフ1でワームホール通過
                if (window.Game.lives === 1) {
                    window.Game.riskTakerCount++;
                    window.Game.totalRiskTakerCount++;
                    window.Game.saveCumulativeStats(); // 即時保存


                    // 実績システムの即時更新を追加
                    if (window.Achievements && window.Achievements.update) {
                        window.Achievements.update(window.Game.getAchievementState());
                    }

                    // 実績表示の即時更新を追加（実績画面が開いている場合）
                    if (window.TitleScreen.getCurrentScreen() === "achievementsScreen") {
                        window.Achievements.refreshAchievementsDisplay();
                    }
                }

                // 強化されたパーティクルエフェクトを生成
                const centerX = this.lastCollided.x + this.lastCollided.width / 2;
                const centerY = this.lastCollided.y + this.lastCollided.height / 2;
                window.Particles.createEffect(centerX, centerY, "#DA70D6", "wormhole");

                // ワームホールアクティブエフェクトを表示
                window.UI.showWormholeActiveEffect();

                // スクリーンシェイク効果を追加
                this.addScreenShake();

                // ワームホールサウンド
                window.SoundManager.play("wormhole");

                return true;
            }

            // 画面外のワームホールを削除
            if (this.wormholes[i].y > canvas.height * 0.85) {
                this.wormholes.splice(i, 1);
            }
        }
        return false;
    },

    // スクリーンシェイク効果を追加
    addScreenShake() {
        const gameArea = document.querySelector(".game-area");
        if (!gameArea) return;

        gameArea.classList.add("screen-shake");
        setTimeout(() => {
            gameArea.classList.remove("screen-shake");
        }, 500);
    },

    getLastCollided() {
        return this.lastCollided;
    },

    draw(ctx) {
        for (const wormhole of this.wormholes) {
            ctx.fillStyle = "#8A2BE2";
            ctx.beginPath();
            ctx.arc(
                wormhole.x + wormhole.width / 2,
                wormhole.y + wormhole.height / 2,
                wormhole.width / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // ワームホールの中心
            ctx.fillStyle = "#4B0082";
            ctx.beginPath();
            ctx.arc(
                wormhole.x + wormhole.width / 2,
                wormhole.y + wormhole.height / 2,
                wormhole.width / 4,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // ワームホールの回転効果
            ctx.strokeStyle = "#00FFFF";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(
                wormhole.x + wormhole.width / 2,
                wormhole.y + wormhole.height / 2,
                wormhole.width / 2 - 2,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
    }
};


// 弾関連の機能
window.Wormholes = Wormholes;



// ============================================================
// bullets.js
// Bullets — 自動弾
// ============================================================
const Bullets = {
    bullets: [],
    fireIntervalMs: 1000,        // 1000ms（1秒）に1回 — fps非依存
    lastFireTime: 0,
    enabled: true,
    bossDamageMultiplier: 1,     // 強化弾装備時に増加
    burstCount: 1,               // 連射弾装備時に増加（1=通常、2〜4=連射）

    // レーザー砲
    laserLevel: 0,               // 0=未装備, 1〜3=レベル
    laserFireMs: 2000,           // 照射時間
    laserCooldownMs: 3000,       // クールダウン時間
    laserDamagePerFrame: 1,      // フレームあたりダメージ
    laserFuelCost: 0,            // 照射1回あたりの燃料消費
    laserState: "cooldown",      // "firing" | "cooldown"
    laserTimer: 0,               // 現在のフェーズ経過時間(ms)
    laserLastTime: 0,            // 前フレームのDate.now()

    // 武器燃料消費（発射/照射1回あたり）
    fireFuelCost: 0,             // 連射弾・強化弾の発射コスト

    // チャージショット
    chargeLevel: 0,              // 0=未装備
    chargeMs: 2000,              // 溜め時間
    chargeCooldownMs: 4000,      // CD
    chargeDamage: 1,             // 通常隕石ダメージ
    chargeBossDamage: 2,         // ボスダメージ
    chargeFuelCost: 3,           // 発射時燃料
    chargeState: "ready",        // "charging"|"cooldown"|"ready"
    chargeTimer: 0,
    chargeLastTime: 0,

    // バリア砲
    barrierLevel: 0,             // 0=未装備
    barrierWidthMul: 1.5,
    barrierHeightMul: 0.6,
    barrierFireMs: 3000,
    barrierCooldownMs: 5000,
    barrierFuelPerSec: 1.5,
    barrierState: "cooldown",    // "active"|"cooldown"
    barrierTimer: 0,
    barrierLastTime: 0,

    // ホーミング弾
    homingLevel: 0,              // 0=未装備
    homingCount: 1,              // 同時発射数
    homingIntervalMs: 1500,
    homingAngleRange: 30,        // 追尾角度範囲(度)
    homingFuelCost: 0,
    homingLastTime: 0,
    homingBullets: [],           // ホーミング弾専用配列

    // ── Lv4/5 固有フラグ ──
    piercing: false,             // 連射弾Lv5: 貫通弾
    spreadExtra: 0,              // 連射弾Lv4: 拡散角追加(度)
    splitBeam: false,            // レーザーLv5: 分裂照射
    doubleBlast: false,          // チャージLv5: 連続爆発
    doubleBlastPending: false,   // 連続爆発の追撃待ち状態
    doubleBlastTimer: 0,         // 追撃タイマー
    reflect: false,              // バリアLv5: 反射バリア
    chainHoming: false,          // ホーミングLv5: 連鎖追尾
    explode: false,              // 強化弾Lv5: 爆発弾
    bulletSpeedBonus: 0,         // 強化弾Lv4: 弾速ボーナス

    init() {
        this.bullets = [];
        this.lastFireTime = 0;
        this.enabled = true;
        this.laserTimer = 0;
        this.laserLastTime = Date.now();
        this.laserState = "cooldown";
        // burstCount / bossDamageMultiplier / laserLevel は startGameDirectly で装備効果として設定するためここではリセットしない

        // カウンターの初期化を確認
        if (window.Game && window.Game.sessionBulletDestructionCount === undefined) {
            window.Game.sessionBulletDestructionCount = 0;
        }
        if (window.Game && window.Game.totalBulletDestructionCount === undefined) {
            window.Game.totalBulletDestructionCount = 0;
        }
    },

    reset() {
        this.bullets = [];
        this.homingBullets = [];
        this.lastFireTime = 0;
        this.laserTimer = 0;
        this.laserLastTime = Date.now();
        this.laserState = "cooldown";
        this.chargeTimer = 0;
        this.chargeLastTime = Date.now();
        this.chargeState = "ready";
        this.barrierTimer = 0;
        this.barrierLastTime = Date.now();
        this.barrierState = "cooldown";
        this.homingLastTime = 0;
        this.doubleBlastPending = false;
        this.doubleBlastTimer = 0;
        this.warpLevel = 0;
        this.warpLastTime = 0;
        this.swLevel = 0;
        this.swLastTime = 0;
    },

    // 射撃システムの有効/無効切り替え
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            // 無効化時に全ての弾をクリア
            this.bullets = [];
        }
    },

    // 弾を発射（burstCount に応じて複数発）
    fire(playerX, playerY, playerWidth, playerHeight) {
        if (!this.enabled) return;

        const count = this.burstCount || 1;
        const cx = playerX + playerWidth / 2;

        // 広がり角度：弾数に応じて均等に分散
        // count=1: 0deg、count=2: -8/+8、count=3: -10/0/+10、count=4: -15/-5/+5/+15
        // spreadExtra(Lv4): 各角度にさらに広げる
        const extra = this.spreadExtra || 0;
        const baseSpread = count === 1 ? [0]
            : count === 2 ? [-8, 8]
            : count === 3 ? [-10, 0, 10]
            : [-15, -5, 5, 15];
        const spread = baseSpread.map(deg => deg + (deg >= 0 ? extra : -extra));

        const baseSpeed = 8 + (this.bulletSpeedBonus || 0);

        spread.forEach((deg, i) => {
            const rad = deg * Math.PI / 180;
            const bullet = {
                x: cx - 2 + Math.sin(rad) * (playerWidth * 0.2),
                y: playerY,
                width: 4,
                height: 8,
                speed: baseSpeed,
                vx: Math.sin(rad) * 2,  // 横方向の速度成分
                active: true,
                piercing: this.piercing || false  // 貫通フラグ
            };
            this.bullets.push(bullet);
        });

        window.SoundManager.playAdjusted("bulletFire", "mining");

        // 装備による燃料消費（通常弾は消費なし）
        if (this.fireFuelCost > 0 && window.Player && typeof window.Player.consumeFuel === "function") {
            window.Player.consumeFuel(this.fireFuelCost);
        }
    },

    // 更新処理
    update(canvas) {
        if (!this.enabled || !window.Game.gameRunning || window.Game.gamePaused) return;

        const now = Date.now();

        // レーザーサイクル処理
        if (this.laserLevel > 0) {
            const elapsed = now - this.laserLastTime;
            this.laserLastTime = now;
            this.laserTimer += elapsed;

            if (this.laserState === "firing") {
                // 照射中: 毎フレームダメージ判定
                const playerBounds = window.Player ? window.Player.getBounds() : null;
                if (playerBounds) {
                    this._applyLaserDamage(playerBounds);
                }
                if (this.laserTimer >= this.laserFireMs) {
                    this.laserState = "cooldown";
                    this.laserTimer = 0;
                    // 照射1回分の燃料消費
                    if (this.laserFuelCost > 0 && window.Player && typeof window.Player.consumeFuel === "function") {
                        window.Player.consumeFuel(this.laserFuelCost);
                    }
                }
            } else {
                // クールダウン中: 通常弾を発射
                if (now - this.lastFireTime >= this.fireIntervalMs) {
                    const playerBounds = window.Player ? window.Player.getBounds() : null;
                    if (playerBounds) {
                        this.fire(playerBounds.x, playerBounds.y, playerBounds.width, playerBounds.height);
                    }
                    this.lastFireTime = now;
                }
                if (this.laserTimer >= this.laserCooldownMs) {
                    this.laserState = "firing";
                    this.laserTimer = 0;
                }
            }
        } else {
            // 通常弾（レーザーなし）
            if (now - this.lastFireTime >= this.fireIntervalMs) {
                const playerBounds = window.Player ? window.Player.getBounds() : null;
                if (playerBounds) {
                    this.fire(playerBounds.x, playerBounds.y, playerBounds.width, playerBounds.height);
                }
                this.lastFireTime = now;
            }
        }

        // 弾の移動と衝突判定
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed;
            if (bullet.vx) bullet.x += bullet.vx;

            // 画面外チェック
            if (bullet.y + bullet.height < 0) {
                this.bullets.splice(i, 1);
                continue;
            }

            // ボスへの衝突判定
            const bossResult = window.Obstacles.hitBoss(bullet);
            if (bossResult) {
                this.bullets.splice(i, 1);
                if (bossResult === "destroyed") {
                    // ボス撃破スコア
                    if (window.Game && window.Game.gameRunning) {
                        window.Game.sessionBossDestroyed = (window.Game.sessionBossDestroyed || 0) + 1;
                        const bossScore = 500;
                        window.Game.scoreBreakdown.bullet = (window.Game.scoreBreakdown.bullet || 0) + bossScore;
                        window.Game.score = Math.round(
                            (window.Game.scoreBreakdown.wormhole +
                            window.Game.scoreBreakdown.shield +
                            window.Game.scoreBreakdown.resource +
                            window.Game.scoreBreakdown.bullet +
                            (window.Game.scoreBreakdown.shield_destroy || 0))
                            * (window.Game.scoreMultiplier || 1)
                        );
                        if (window.UI && window.UI.showFloatingText) {
                            window.UI.showFloatingText("+500 BOSS!", bullet.x, bullet.y, "#FF8800", "bold", "20px");
                        }
                        if (window.Game.addBulletDestructionScore) window.Game.addBulletDestructionScore();
                    }
                } else {
                    // ボスヒット音
                    if (window.SoundManager) window.SoundManager.playAdjusted("bulletHit", "mining");
                    if (window.UI && window.UI.showFloatingText) {
                        window.UI.showFloatingText("HIT!", bullet.x, bullet.y, "#FFFFFF");
                    }
                }
                continue;
            }

            // 障害物との衝突判定
            let hitObstacle = false;
            for (let j = window.Obstacles.obstacles.length - 1; j >= 0; j--) {
                const obstacle = Obstacles.obstacles[j];
                if (this.checkCollision(bullet, obstacle)) {
                    // 衝突処理
                    this.handleBulletHit(bullet, obstacle);

                    // 爆発弾（強化弾Lv5）: 着弾隕石の周囲1隕石にも範囲ダメージ
                    if (this.explode) {
                        this._applyExplosion(obstacle, j);
                    }

                    window.Obstacles.obstacles.splice(j, 1);

                    // 貫通弾（連射弾Lv5）: 弾を消費せず次の隕石にも当たる
                    if (!bullet.piercing) {
                        this.bullets.splice(i, 1);
                        hitObstacle = true;
                    }
                    // 回避カウントを増加（隕石破壊も回避とみなす）
                    if (window.Game && typeof window.Game.incrementDodgeCount === "function") {
                        window.Game.incrementDodgeCount();
                    }
                    break;
                }
            }

            if (hitObstacle) continue;
        }

        // ── ホーミング弾の更新 ──
        if (this.homingLevel > 0) {
            const now2 = Date.now();
            if (now2 - this.homingLastTime >= this.homingIntervalMs) {
                this.homingLastTime = now2;
                this._fireHoming();
            }
            // ホーミング弾の移動・追尾・衝突
            for (let i = this.homingBullets.length - 1; i >= 0; i--) {
                const hb = this.homingBullets[i];
                // ターゲット更新（毎フレーム）
                hb.target = this._findHomingTarget();
                if (hb.target) {
                    const tx = hb.target.x + hb.target.width  / 2;
                    const ty = hb.target.y + hb.target.height / 2;
                    const dx = tx - hb.x;
                    const dy = ty - hb.y;
                    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                    const turnRate = 0.18;
                    hb.vx = hb.vx * (1 - turnRate) + (dx / dist) * hb.speed * turnRate;
                    hb.vy = hb.vy * (1 - turnRate) + (dy / dist) * hb.speed * turnRate;
                }
                hb.x += hb.vx;
                hb.y += hb.vy;
                if (hb.y + hb.size < 0 || hb.y > (window.Game?.canvas?.height || 9999)) {
                    this.homingBullets.splice(i, 1);
                    continue;
                }
                // ボス衝突
                if (window.Obstacles) {
                    const br = window.Obstacles.hitBoss(hb);
                    if (br) {
                        this.homingBullets.splice(i, 1);
                        if (br === "destroyed" && window.Game) {
                            window.Game.sessionBossDestroyed = (window.Game.sessionBossDestroyed||0)+1;
                            const bs = 500;
                            window.Game.scoreBreakdown.bullet = (window.Game.scoreBreakdown.bullet||0)+bs;
                            window.Game.score = Math.round((window.Game.scoreBreakdown.wormhole + window.Game.scoreBreakdown.shield + window.Game.scoreBreakdown.resource + window.Game.scoreBreakdown.bullet + (window.Game.scoreBreakdown.shield_destroy||0)) * (window.Game.scoreMultiplier || 1));
                        }
                        continue;
                    }
                    let hit = false;
                    for (let j = window.Obstacles.obstacles.length - 1; j >= 0; j--) {
                        const ob = window.Obstacles.obstacles[j];
                        if (hb.x < ob.x+ob.width && hb.x+hb.size > ob.x && hb.y < ob.y+ob.height && hb.y+hb.size > ob.y) {
                            this.handleBulletHit(hb, ob);
                            window.Obstacles.obstacles.splice(j, 1);
                            // 連鎖ホーミング（Lv5）: 撃破後に次ターゲットへ転移
                            if (this.chainHoming) {
                                const nextTarget = this._findHomingTarget();
                                if (nextTarget) {
                                    hb.target = nextTarget;
                                    const tx = nextTarget.x + nextTarget.width  / 2;
                                    const ty = nextTarget.y + nextTarget.height / 2;
                                    const dx = tx - hb.x, dy = ty - hb.y;
                                    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                                    hb.vx = (dx / dist) * hb.speed;
                                    hb.vy = (dy / dist) * hb.speed;
                                    // 弾を消費しない（転移）→ spliceせずbreakのみ
                                    break;
                                }
                            }
                            // 転移先なし、または連鎖なし → 通常通り弾を削除
                            this.homingBullets.splice(i, 1);
                            hit = true;
                            break;
                        }
                    }
                    if (hit) continue;
                }
            }
        }

        // ── チャージショットの更新 ──
        if (this.chargeLevel > 0) {
            const now3 = Date.now();
            const elapsed3 = now3 - this.chargeLastTime;
            this.chargeLastTime = now3;
            this.chargeTimer += elapsed3;
            if (this.chargeState === "charging" && this.chargeTimer >= this.chargeMs) {
                this._releaseCharge();
                this.chargeState = "cooldown";
                this.chargeTimer = 0;
                // doubleBlast（Lv5）: 0.5秒後に追撃
                if (this.doubleBlast) {
                    this.doubleBlastPending = true;
                    this.doubleBlastTimer = 0;
                }
            } else if (this.chargeState === "cooldown" && this.chargeTimer >= this.chargeCooldownMs) {
                // cooldown終了 → すぐchargingに入る
                this.chargeState = "charging";
                this.chargeTimer = 0;
            }
            // ready の場合も即charging開始（ゲーム開始時）
            if (this.chargeState === "ready") {
                this.chargeState = "charging";
                this.chargeTimer = 0;
            }
            // doubleBlast追撃処理
            if (this.doubleBlastPending) {
                this.doubleBlastTimer += elapsed3;
                if (this.doubleBlastTimer >= 500) {
                    this._releaseCharge();
                    this.doubleBlastPending = false;
                }
            }
        }

        // ── バリア砲の更新 ──
        if (this.barrierLevel > 0) {
            const now4 = Date.now();
            const elapsed4 = now4 - this.barrierLastTime;
            this.barrierLastTime = now4;
            this.barrierTimer += elapsed4;
            if (this.barrierState === "active") {
                // 燃料消費
                if (window.Player) window.Player.consumeFuel(this.barrierFuelPerSec * elapsed4 / 1000);
                // 衝突判定（reflect有無で分岐）
                if (this.reflect) {
                    this._barrierReflect();
                } else {
                    this._barrierCollide();
                }
                if (this.barrierTimer >= this.barrierFireMs) {
                    this.barrierState = "cooldown";
                    this.barrierTimer = 0;
                }
            } else if (this.barrierState === "cooldown" && this.barrierTimer >= this.barrierCooldownMs) {
                this.barrierState = "active";
                this.barrierTimer = 0;
            }
        }

        // ── ワープキャノンの更新 ──
        if (this.warpLevel > 0) {
            this._updateWarpCannon(now);
        }

        // ── 衝撃波の更新 ──
        if (this.swLevel > 0) {
            this._updateShockwave(now, canvas);
        }
    },

    // ワープキャノンのupdate処理（update()から呼ぶ）
    _updateWarpCannon(now) {
        if (!this.warpLevel || !window.Obstacles || !window.Player) return;
        if (now - this.warpLastTime < this.warpCooldownMs) return;

        const pb = window.Player.getBounds();
        const cx = pb.x + pb.width / 2;
        const canvasW = window.Game && window.Game.canvas ? window.Game.canvas.width : 400;

        // 発動: 真上の範囲内の隕石を消滅
        let destroyed = 0;
        for (let i = window.Obstacles.obstacles.length - 1; i >= 0; i--) {
            const ob = window.Obstacles.obstacles[i];
            const obCx = ob.x + ob.width / 2;
            // Lv5: 全画面縦1列（canvasの中央±幅/2の範囲）
            const inColumn = this.warpFullColumn
                ? Math.abs(obCx - cx) < canvasW * 0.1
                : Math.abs(obCx - cx) < (ob.width / 2 + pb.width / 2);
            const inRange = ob.y + ob.height > 0 && ob.y < pb.y - 10;
            const dist = pb.y - (ob.y + ob.height);
            if (inColumn && inRange && dist < this.warpRange) {
                if (window.Particles) window.Particles.createEffect(obCx, ob.y + ob.height / 2, "#AA66FF", "bulletHit");
                window.Obstacles.obstacles.splice(i, 1);
                destroyed++;
            }
        }
        if (destroyed === 0) return; // 消す隕石がなければCD消費しない

        // ボスダメージ
        if (this.warpBossDamage > 0 && window.Obstacles.boss) {
            window.Obstacles.boss.hp -= this.warpBossDamage;
            if (window.Obstacles.boss.hp <= 0) window.Obstacles.boss.hp = 0;
        }

        // 燃料消費・エフェクト・CD更新
        if (window.Player) window.Player.consumeFuel(this.warpFuelCost);
        if (window.SoundManager) window.SoundManager.playAdjusted("bulletHit", "mining");
        if (window.UI && window.UI.showFloatingText) {
            window.UI.showFloatingText("WARP!", cx, pb.y - 20, "#AA66FF", "bold", "16px");
        }
        this.warpLastTime = now;
    },

    // 衝撃波のupdate処理（update()から呼ぶ）
    _updateShockwave(now, canvas) {
        if (!this.swLevel || !window.Obstacles || !window.Player) return;
        if (now - this.swLastTime < this.swCooldownMs) return;
        if (!window.Obstacles.obstacles.length && !window.Obstacles.boss) return;

        const pb = window.Player.getBounds();
        const cx = pb.x + pb.width / 2;
        const cy = pb.y + pb.height / 2;
        const radius = canvas.width * this.swRadiusMul;

        const fireOnce = () => {
            // 隕石を吹き飛ばす（破壊しない）
            for (let i = window.Obstacles.obstacles.length - 1; i >= 0; i--) {
                const ob = window.Obstacles.obstacles[i];
                const dx = (ob.x + ob.width / 2) - cx;
                const dy = (ob.y + ob.height / 2) - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < radius) {
                    // 上方向に高速で吹き飛ばす
                    ob.speed = -canvas.height * 0.025 * this.swSpeedMul;
                    ob.reflectFrames = 30; // 衝突猶予
                }
            }
            // ボスダメージ
            if (this.swBossDamage > 0 && window.Obstacles.boss) {
                window.Obstacles.boss.hp = Math.max(0, window.Obstacles.boss.hp - this.swBossDamage);
            }
            if (window.Particles) window.Particles.createEffect(cx, cy, "#FFFFFF", "explosion");
            if (window.UI && window.UI.showFloatingText) {
                window.UI.showFloatingText("SHOCKWAVE!", cx, cy, "#FFFFFF", "bold", "16px");
            }
        };

        fireOnce();
        if (this.swDouble) {
            setTimeout(() => { if (window.Game && window.Game.gameRunning) fireOnce(); }, 300);
        }

        if (window.Player) window.Player.consumeFuel(this.swFuelCost);
        if (window.SoundManager) window.SoundManager.play("explosion");
        this.swLastTime = now;
    },

    // ホーミング弾を発射
    _fireHoming() {
        const pb = window.Player ? window.Player.getBounds() : null;
        if (!pb) return;
        const cx = pb.x + pb.width / 2;
        const cy = pb.y;
        for (let k = 0; k < this.homingCount; k++) {
            const spread = (k - (this.homingCount-1)/2) * 10;
            this.homingBullets.push({
                x: cx + spread - 3, y: cy,
                vx: spread * 0.05, vy: -7,
                speed: 7, size: 8,
                width: 8, height: 8,
                active: true,
                target: this._findHomingTarget()
            });
        }
        if (this.homingFuelCost > 0 && window.Player) {
            window.Player.consumeFuel(this.homingFuelCost);
        }
        window.SoundManager && window.SoundManager.playAdjusted("bulletFire", "mining");
    },

    // ホーミングのターゲット選択（ボス＞大型＞最近傍）
    _findHomingTarget() {
        if (!window.Obstacles) return null;
        if (window.Obstacles.boss) return window.Obstacles.boss;
        const obs = window.Obstacles.obstacles;
        if (!obs || obs.length === 0) return null;
        const pb = window.Player ? window.Player.getBounds() : {x:0,y:500};
        // 大型優先
        const large = obs.filter(o => o.type === "large");
        const pool = large.length > 0 ? large : obs;
        let best = null, bestDist = Infinity;
        pool.forEach(o => {
            const dx = (o.x + o.width/2) - (pb.x + (pb.width||0)/2);
            const dy = (o.y + o.height/2) - pb.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < bestDist) { bestDist = d; best = o; }
        });
        return best;
    },

    // チャージ解放（全画面衝撃波）
    _releaseCharge() {
        if (!window.Obstacles || !window.Game) return;
        // 通常隕石
        for (let i = window.Obstacles.obstacles.length - 1; i >= 0; i--) {
            const ob = window.Obstacles.obstacles[i];
            for (let d = 0; d < this.chargeDamage; d++) {
                const result = this.handleBulletHit({x: ob.x, y: ob.y, width: ob.width, height: ob.height}, ob);
            }
            window.Obstacles.obstacles.splice(i, 1);
            if (window.Particles) window.Particles.createEffect(ob.x+ob.width/2, ob.y+ob.height/2, "#FFFF00", "bulletHit");
        }
        // ボス
        if (window.Obstacles.boss) {
            for (let d = 0; d < this.chargeBossDamage; d++) {
                const r = window.Obstacles.hitBoss({x: window.Obstacles.boss.x, y: window.Obstacles.boss.y, width: 1, height: 1});
                if (r === "destroyed") {
                    window.Game.sessionBossDestroyed = (window.Game.sessionBossDestroyed||0)+1;
                    break;
                }
            }
        }
        if (window.Player) window.Player.consumeFuel(this.chargeFuelCost);
        window.SoundManager && window.SoundManager.playAdjusted("bulletHit", "mining");
    },

    // バリア衝突判定（描画と同じ座標）
    _barrierCollide() {
        if (!window.Obstacles || !window.Player) return;
        const pb = window.Player.getBounds();
        const canvas = window.Game && window.Game.canvas;
        const cw = canvas ? canvas.width  : 400;
        const ch = canvas ? canvas.height : 700;
        const bw = cw * (0.25 + (this.barrierWidthMul - 1.5) * 0.1);
        const bh = ch * 0.10;
        const bx = pb.x + pb.width/2 - bw/2;
        const by = pb.y - bh - pb.height * 0.3;
        for (let i = window.Obstacles.obstacles.length - 1; i >= 0; i--) {
            const ob = window.Obstacles.obstacles[i];
            if (ob.x < bx+bw && ob.x+ob.width > bx && ob.y < by+bh && ob.y+ob.height > by) {
                this.handleBulletHit({x: ob.x, y: ob.y, width: ob.width, height: ob.height}, ob);
                window.Obstacles.obstacles.splice(i, 1);
                if (window.Particles) window.Particles.createEffect(ob.x+ob.width/2, ob.y+ob.height/2, "#00FFCC", "bulletHit");
            }
        }
    },

    // バリアLv5: 反射バリア（隕石を破壊せず後方に押し返す）
    _barrierReflect() {
        if (!window.Obstacles || !window.Player) return;
        const pb = window.Player.getBounds();
        const canvas = window.Game && window.Game.canvas;
        const cw = canvas ? canvas.width  : 400;
        const ch = canvas ? canvas.height : 700;
        const bw = cw * (0.25 + (this.barrierWidthMul - 1.5) * 0.1);
        const bh = ch * 0.10;
        const bx = pb.x + pb.width/2 - bw/2;
        const by = pb.y - bh - pb.height * 0.3;
        for (let i = window.Obstacles.obstacles.length - 1; i >= 0; i--) {
            const ob = window.Obstacles.obstacles[i];
            if (ob.x < bx+bw && ob.x+ob.width > bx && ob.y < by+bh && ob.y+ob.height > by) {
                // 速度を反転して後方へ弾き飛ばす（除去はObstacles.update()側で行う）
                ob.speed = -(Math.abs(ob.speed || 2) + 1);
                ob.reflected = true;         // 反射フラグ（衝突判定猶予用）
                ob.reflectFrames = 10;       // 10フレーム間は衝突判定を無効化
                if (window.Particles) window.Particles.createEffect(ob.x+ob.width/2, ob.y+ob.height/2, "#44FFFF", "bulletHit");
            }
        }
    },

    // 強化弾Lv5: 爆発弾（着弾位置の周囲で最も近い隕石1体にも追加ダメージ）
    _applyExplosion(sourceObstacle, sourceIndex) {
        if (!window.Obstacles) return;
        const cx = sourceObstacle.x + sourceObstacle.width  / 2;
        const cy = sourceObstacle.y + sourceObstacle.height / 2;
        const EXPLOSION_RADIUS = 80;
        let nearest = null;
        let nearestDist = Infinity;
        let nearestIdx = -1;

        for (let i = window.Obstacles.obstacles.length - 1; i >= 0; i--) {
            if (i === sourceIndex) continue; // 元の隕石は既に処理済み
            const ob = window.Obstacles.obstacles[i];
            const dx = (ob.x + ob.width  / 2) - cx;
            const dy = (ob.y + ob.height / 2) - cy;
            const d  = Math.sqrt(dx*dx + dy*dy);
            if (d < EXPLOSION_RADIUS && d < nearestDist) {
                nearestDist = d;
                nearest = ob;
                nearestIdx = i;
            }
        }

        if (nearest !== null && nearestIdx >= 0) {
            this.handleBulletHit({x: nearest.x, y: nearest.y, width: nearest.width, height: nearest.height}, nearest);
            window.Obstacles.obstacles.splice(nearestIdx, 1);
            if (window.Particles) window.Particles.createEffect(nearest.x+nearest.width/2, nearest.y+nearest.height/2, "#FF6600", "bulletHit");
            if (window.UI && window.UI.showFloatingText) {
                window.UI.showFloatingText("💥", nearest.x+nearest.width/2, nearest.y, "#FF6600");
            }
        }
    },

    // 衝突判定
    checkCollision(bullet, obstacle) {
        return (
            bullet.x < obstacle.x + obstacle.width &&
            bullet.x + bullet.width > obstacle.x &&
            bullet.y < obstacle.y + obstacle.height &&
            bullet.y + bullet.height > obstacle.y
        );
    },

    // 弾のヒット処理
    handleBulletHit(bullet, obstacle) {
        try {
            // 既存の処理の前にnullチェック
            if (!bullet || !obstacle) {
                return;
            }

            // 破壊エフェクト
            window.Particles.createEffect(
                obstacle.x + obstacle.width / 2,
                obstacle.y + obstacle.height / 2,
                "#FFA500", // オレンジ色の爆発
                "bulletHit"
            );

            // ヒット音
            window.SoundManager.playAdjusted("bulletHit", "mining");

            // 最接近隕石破壊チェック
            const isClosestDestruction = this.checkClosestObstacleDestruction(obstacle);

            // 破壊カウントを増加
            if (window.Game && window.Game.gameRunning) {
                // セッションカウントと累積カウントを増加
                window.Game.sessionBulletDestructionCount = (window.Game.sessionBulletDestructionCount || 0) + 1;
                window.Game.totalBulletDestructionCount = (window.Game.totalBulletDestructionCount || 0) + 1;

                // type別スコア加算
                const obsType = obstacle.type || "normal";
                const typeMultiplier = obsType === "fast"  ? 2 :
                                       obsType === "large" ? 3 : 1;
                const bulletScore = Game.BULLET_DESTRUCTION_SCORE * typeMultiplier;

                // 種類別破壊カウントを記録
                window.Game.sessionDestroyedByType = window.Game.sessionDestroyedByType || { normal:0, fast:0, large:0 };
                window.Game.sessionDestroyedByType[obsType] = (window.Game.sessionDestroyedByType[obsType] || 0) + 1;
                window.Game.scoreBreakdown.bullet = (window.Game.scoreBreakdown.bullet || 0) + bulletScore;

                // 総合スコアも更新（飛行距離は含めない）
                window.Game.score = Math.round(
                    (window.Game.scoreBreakdown.wormhole +
                    window.Game.scoreBreakdown.shield +
                    window.Game.scoreBreakdown.resource +
                    window.Game.scoreBreakdown.bullet +
                    (window.Game.scoreBreakdown.shield_destroy || 0))
                    * (window.Game.scoreMultiplier || 1)
                );


                // スコア加算をGameメソッド経由でも行う（UI更新用）
                if (window.Game && typeof window.Game.addBulletDestructionScore === "function") {
                    window.Game.addBulletDestructionScore();
                }

                // フローティングテキストでスコア加算を表示
                if (window.UI && typeof window.UI.showFloatingText === "function") {
                    if (isClosestDestruction) {
                        // 至近距離破壊 - 特別表示（金色、大きめ、ボーナス感）
                        window.UI.showFloatingText(
                            `+${bulletScore}✨`,
                            obstacle.x + obstacle.width / 2,
                            obstacle.y,
                            "#FFD700", "bold", "18px"
                        );
                    } else {
                        const color = obstacle.type === "fast"  ? "#FF6B6B" :
                                      obstacle.type === "large" ? "#A8A8A8" : "#FFA500";
                        window.UI.showFloatingText(
                            `+${bulletScore}`,
                            obstacle.x + obstacle.width / 2,
                            obstacle.y,
                            color
                        );
                    }
                }

                // デバッグログ
                if (window.Game.DEBUG_MODE) {
                }

                // 50回ごとに保存（パフォーマンス考慮）
                if (window.Game.totalBulletDestructionCount % 50 === 0) {
                    window.Game.saveCumulativeStats();
                }

                // 実績更新をトリガー
                if (window.Game.totalBulletDestructionCount % 10 === 0) {
                    if (window.Achievements && window.Achievements.update) {
                        window.Achievements.update(window.Achievements.getGameState());
                    }
                }
            }

        } catch (error) {
            console.error("❌ 弾ヒット処理エラー:", error);
            // ゲームクラッシュを防ぐ
        }
    },

    // 新規メソッドを追加
    checkClosestObstacleDestruction: function (destroyedObstacle) {
        if (!window.Game || !window.Game.gameRunning) return false; // booleanを返すように変更

        const playerBounds = Player.getBounds();
        if (!playerBounds) return false;

        // 新しいユーティリティ関数を使用
        const closestInfo = Obstacles.findClosestObstacle(playerBounds);

        if (closestInfo && closestInfo.obstacle === destroyedObstacle) {
            // 距離チェック（近すぎるものだけをカウント）
            const isCloseEnough = closestInfo.distance < 150; // 適切な距離閾値

            if (isCloseEnough) {
                // カウンターを初期化（既存のパターンに従う）
                if (window.Game.closestObstacleDestructionCount === undefined) {
                    window.Game.closestObstacleDestructionCount = 0;
                }
                if (window.Game.totalClosestObstacleDestructionCount === undefined) {
                    window.Game.totalClosestObstacleDestructionCount = 0;
                }

                // カウント増加
                window.Game.closestObstacleDestructionCount++;
                window.Game.totalClosestObstacleDestructionCount++;

                // 特別エフェクト（既存のものに加えて）
                window.Particles.createEffect(
                    destroyedObstacle.x + destroyedObstacle.width / 2,
                    destroyedObstacle.y + destroyedObstacle.height / 2,
                    "#00FF00",
                    "precisionHit"
                );

                // 追加エフェクト：金色のパーティクル
                setTimeout(() => {
                    window.Particles.createEffect(
                        destroyedObstacle.x + destroyedObstacle.width / 2,
                        destroyedObstacle.y + destroyedObstacle.height / 2,
                        "#FFD700", // 金色
                        "goldenHit"
                    );
                }, 100);

                // デバッグログ

                // 実績更新（既存の方法で）
                if (window.Achievements && window.Achievements.update) {
                    window.Achievements.update(window.Achievements.getGameState());
                }

                return true; // 至近距離破壊だったことを返す
            }
        }

        return false; // 至近距離破壊ではなかった
    },

    // 描画
    draw(ctx) {
        if (!this.enabled) return;

        const burst = this.burstCount || 1;
        const boss  = this.bossDamageMultiplier || 1;

        for (const bullet of this.bullets) {
            const cx = bullet.x + bullet.width / 2;
            const cy = bullet.y + bullet.height / 2;

            if (boss > 1) {
                // ── 強化弾：オレンジ六角形（レベルに応じてサイズ変化）──
                // boss=2→Lv1, boss=3→Lv2, boss=5→Lv3
                const sizeScale = boss === 2 ? 1.0 : boss === 3 ? 1.5 : 2.2;
                this._drawHexBullet(ctx, cx, bullet.y, bullet.width, bullet.height, sizeScale);
            } else if (burst > 1) {
                // ── 連射弾：細長い水色レーザー ──
                this._drawLaserBullet(ctx, bullet.x, bullet.y, bullet.width, bullet.height, bullet.vx || 0);
            } else {
                // ── 通常弾：黄色の矩形 ──
                ctx.fillStyle = "#FFFF00";
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                ctx.fillStyle = "rgba(255,255,200,0.7)";
                ctx.fillRect(bullet.x, bullet.y + bullet.height - 2, bullet.width, 2);
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(bullet.x + 1, bullet.y, bullet.width - 2, 1);
            }
        }
    },

    // ── ホーミング弾の描画 ──
    drawHoming(ctx) {
        if (!this.enabled || this.homingLevel === 0) return;
        ctx.save();
        for (const hb of this.homingBullets) {
            const cx = hb.x + hb.size/2;
            const cy = hb.y + hb.size/2;
            ctx.fillStyle = "#CC88FF";
            ctx.beginPath();
            ctx.arc(cx, cy, hb.size/2, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = "#EE99FF";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // 追尾軌跡
            ctx.fillStyle = "rgba(200,100,255,0.3)";
            ctx.beginPath();
            ctx.arc(cx, cy + hb.size*0.4, hb.size*0.3, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.restore();
    },

    // ── チャージショットのチャージエフェクト描画 ──
    drawCharge(ctx) {
        if (!this.enabled || this.chargeLevel === 0) return;
        if (this.chargeState !== "charging") return;
        const pb = window.Player ? window.Player.getBounds() : null;
        if (!pb) return;
        const progress = Math.min(this.chargeTimer / this.chargeMs, 1);
        const cx = pb.x + pb.width/2;
        const cy = pb.y + pb.height/2;
        const r  = pb.width * 0.6 * progress;
        ctx.save();
        ctx.globalAlpha = 0.4 + progress * 0.4;
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 2 + progress * 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI*2);
        ctx.stroke();
        // 内側の光
        ctx.globalAlpha = progress * 0.6;
        ctx.fillStyle = "#FFFF88";
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.4, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    },

    // ── バリア砲のバリア描画 ──
    drawBarrier(ctx) {
        if (!this.enabled || this.barrierLevel === 0) return;
        if (this.barrierState !== "active") return;
        const pb = window.Player ? window.Player.getBounds() : null;
        if (!pb) return;
        const canvas = ctx.canvas;
        // 幅：canvasの widthMul 割合、高さ：canvasの12%固定で視認性確保
        const bw = canvas.width * (0.25 + (this.barrierWidthMul - 1.5) * 0.1);
        const bh = canvas.height * 0.10;
        const bx = pb.x + pb.width/2 - bw/2;
        // 機体の少し前方（上）に離して配置
        const by = pb.y - bh - pb.height * 0.3;
        const progress = Math.min(this.barrierTimer / this.barrierFireMs, 1);
        ctx.save();
        ctx.globalAlpha = 0.6 + (1 - progress) * 0.3;
        // 外枠（明るい緑）
        ctx.strokeStyle = "#00FFCC";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 8)
                      : ctx.rect(bx, by, bw, bh);
        ctx.stroke();
        // 内側の塗り
        ctx.fillStyle = "rgba(0,255,200,0.12)";
        ctx.fill();
        // 六角形パターン（バリアらしさ演出）
        ctx.strokeStyle = "rgba(0,255,200,0.25)";
        ctx.lineWidth = 1;
        const hexSize = 14;
        for (let hx = bx + hexSize; hx < bx + bw - hexSize; hx += hexSize * 1.8) {
            for (let hy = by + hexSize * 0.5; hy < by + bh - hexSize * 0.5; hy += hexSize * 1.6) {
                ctx.beginPath();
                for (let k = 0; k < 6; k++) {
                    const a = (k / 6) * Math.PI * 2;
                    const px = hx + Math.cos(a) * hexSize * 0.55;
                    const py = hy + Math.sin(a) * hexSize * 0.55;
                    k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.stroke();
            }
        }
        ctx.restore();
    },

    // ── ワープキャノンのCDインジケーター描画 ──
    drawWarpCannon(ctx) {
        if (!this.enabled || this.warpLevel === 0) return;
        const pb = window.Player ? window.Player.getBounds() : null;
        if (!pb) return;
        const now = Date.now();
        const elapsed = now - (this.warpLastTime || 0);
        const progress = Math.min(elapsed / (this.warpCooldownMs || 3000), 1);
        const cx = pb.x + pb.width / 2;
        const cy = pb.y + pb.height / 2;
        ctx.save();
        // CDが溜まっているときは紫縦ラインを薄く表示
        if (progress >= 1) {
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = "#AA66FF";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, pb.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        // CDリングをプレイヤー周囲に表示
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = progress >= 1 ? "#AA66FF" : "rgba(170,102,255,0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, pb.width * 0.7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.stroke();
        ctx.restore();
    },

    // ── 衝撃波のCDインジケーター描画 ──
    drawShockwave(ctx) {
        if (!this.enabled || this.swLevel === 0) return;
        const pb = window.Player ? window.Player.getBounds() : null;
        if (!pb) return;
        const canvas = ctx.canvas;
        const now = Date.now();
        const elapsed = now - (this.swLastTime || 0);
        const progress = Math.min(elapsed / (this.swCooldownMs || 6000), 1);
        const cx = pb.x + pb.width / 2;
        const cy = pb.y + pb.height / 2;
        const maxR = canvas.width * (this.swRadiusMul || 0.2);
        ctx.save();
        // 射程円（薄く常時表示）
        ctx.globalAlpha = 0.12;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
        ctx.stroke();
        // CDリング
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = progress >= 1 ? "#FFFFFF" : "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, pb.width * 0.9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.stroke();
        ctx.restore();
    },

    // レーザーダメージ判定（照射中毎フレーム呼ぶ）
    _applyLaserDamage(playerBounds) {
        const cx = playerBounds.x + playerBounds.width / 2;
        const dmg = this.laserDamagePerFrame;

        // レベル別のビーム幅（横方向の当たり判定幅）
        // Lv1: 細い光線2px → 幅3
        // Lv2: 太いビーム → 幅10
        // Lv3: 3本束（±10px） → 中心±14でカバー
        // Lv4: 幅拡大 → 幅18
        // Lv5: splitBeam（中心+斜め2本）→ 幅18、斜めビームはoffset±60px
        const beamHalfW = this.laserLevel <= 1 ? 3
                        : this.laserLevel === 2 ? 10
                        : this.laserLevel === 3 ? 14 : 18;

        // splitBeam(Lv5)のビームX座標リスト（中心+左右斜め）
        const beamCenters = this.splitBeam
            ? [cx, cx - 60, cx + 60]
            : [cx];

        // 通常隕石へのダメージ
        if (window.Obstacles && window.Obstacles.obstacles) {
            for (let i = window.Obstacles.obstacles.length - 1; i >= 0; i--) {
                const ob = window.Obstacles.obstacles[i];
                const obCx = ob.x + ob.width / 2;
                const hitRange = ob.width / 2 + beamHalfW;
                const inBeam = beamCenters.some(bcx => Math.abs(obCx - bcx) < hitRange);
                if (inBeam && ob.y < playerBounds.y && ob.y + ob.height > 0) {
                    window.Obstacles.obstacles.splice(i, 1);
                    if (window.Game && window.Game.gameRunning) {
                        window.Game.sessionBulletDestructionCount = (window.Game.sessionBulletDestructionCount || 0) + 1;
                        const obsType = ob.type || "normal";
                        const typeMultiplier = obsType === "fast" ? 2 : obsType === "large" ? 3 : 1;
                        const score = (window.Game.BULLET_DESTRUCTION_SCORE || 10) * typeMultiplier;
                        window.Game.scoreBreakdown.bullet = (window.Game.scoreBreakdown.bullet || 0) + score;
                        window.Game.score = Math.round((window.Game.scoreBreakdown.wormhole + window.Game.scoreBreakdown.shield +
                            window.Game.scoreBreakdown.resource + window.Game.scoreBreakdown.bullet +
                            (window.Game.scoreBreakdown.shield_destroy || 0)) * (window.Game.scoreMultiplier || 1));
                        window.Game.sessionDestroyedByType = window.Game.sessionDestroyedByType || {normal:0,fast:0,large:0};
                        window.Game.sessionDestroyedByType[obsType] = (window.Game.sessionDestroyedByType[obsType] || 0) + 1;
                    }
                    if (window.Particles) window.Particles.createEffect(ob.x + ob.width/2, ob.y + ob.height/2, "#00FFFF", "bulletHit");
                }
            }
        }

        // ボスへのダメージ
        if (window.Obstacles && window.Obstacles.boss) {
            const b = window.Obstacles.boss;
            const bCx = b.x + b.width / 2;
            const bossHitRange = b.width / 2 + beamHalfW;
            const bossInBeam = beamCenters.some(bcx => Math.abs(bCx - bcx) < bossHitRange);
            if (bossInBeam && b.y < playerBounds.y && b.y + b.height > 0) {
                b.hp -= dmg;
                b.hitFlash = 3;
                if (b.hp <= 0) {
                    if (window.Particles) {
                        for (let i = 0; i < 3; i++) {
                            setTimeout(() => {
                                if (window.Particles) window.Particles.createEffect.bind(window.Particles)(
                                    bCx + (Math.random()-0.5)*b.width*0.4,
                                    b.y + b.height/2 + (Math.random()-0.5)*b.height*0.4,
                                    "#00FFFF", "bulletHit");
                            }, i * 120);
                        }
                    }
                    if (window.Game && window.Game.gameRunning) {
                        window.Game.sessionBossDestroyed = (window.Game.sessionBossDestroyed || 0) + 1;
                        window.Game.scoreBreakdown.bullet = (window.Game.scoreBreakdown.bullet || 0) + 500;
                        window.Game.score = Math.round((window.Game.scoreBreakdown.wormhole + window.Game.scoreBreakdown.shield +
                            window.Game.scoreBreakdown.resource + window.Game.scoreBreakdown.bullet +
                            (window.Game.scoreBreakdown.shield_destroy || 0)) * (window.Game.scoreMultiplier || 1));
                        if (window.UI && window.UI.showFloatingText)
                            window.UI.showFloatingText("+500 BOSS!", bCx, b.y, "#00FFFF", "bold", "20px");
                    }
                    window.Obstacles.boss = null;
                }
            }
        }
    },

    // レーザー描画（Game.draw()から呼ぶ）
    drawLaser(ctx, canvas) {
        if (!this.enabled || this.laserLevel === 0) return;
        if (this.laserState !== "firing") {
            // クールダウン中: チャージバーを宇宙船上に描画
            const playerBounds = window.Player ? window.Player.getBounds() : null;
            if (!playerBounds) return;
            const pct = Math.min(1, this.laserTimer / this.laserCooldownMs);
            const barW = playerBounds.width * 1.1;
            const barH = 4;
            const bx = playerBounds.x + playerBounds.width / 2 - barW / 2;
            const by = playerBounds.y - 10;
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(bx, by, barW, barH);
            ctx.fillStyle = this.laserLevel === 1 ? "#00FF88" : this.laserLevel === 2 ? "#00AAFF" : "#CC44FF";
            ctx.fillRect(bx, by, barW * pct, barH);
            return;
        }

        // 照射中: ビーム描画
        const playerBounds = window.Player ? window.Player.getBounds() : null;
        if (!playerBounds) return;
        const cx = playerBounds.x + playerBounds.width / 2;
        const originY = playerBounds.y;

        ctx.save();

        if (this.laserLevel === 1) {
            // Lv1: 細い緑の光線
            ctx.shadowColor = "#00FF88";
            ctx.shadowBlur = 10;
            ctx.strokeStyle = "#00FF88";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx, originY);
            ctx.lineTo(cx, 0);
            ctx.stroke();
            // コア
            ctx.strokeStyle = "#AAFFCC";
            ctx.lineWidth = 1;
            ctx.stroke();

        } else if (this.laserLevel === 2) {
            // Lv2: 太い青白ビーム
            ctx.shadowColor = "#00AAFF";
            ctx.shadowBlur = 20;
            // 外側グロー
            ctx.strokeStyle = "rgba(0,170,255,0.25)";
            ctx.lineWidth = 18;
            ctx.beginPath(); ctx.moveTo(cx, originY); ctx.lineTo(cx, 0); ctx.stroke();
            // 中層
            ctx.strokeStyle = "#0088FF";
            ctx.lineWidth = 8;
            ctx.beginPath(); ctx.moveTo(cx, originY); ctx.lineTo(cx, 0); ctx.stroke();
            // コア
            ctx.strokeStyle = "#CCEEFF";
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(cx, originY); ctx.lineTo(cx, 0); ctx.stroke();

        } else {
            // Lv3: 3本束ビーム（紫）
            const offsets = [-10, 0, 10];
            offsets.forEach((off, i) => {
                ctx.shadowColor = "#CC44FF";
                ctx.shadowBlur = 12;
                ctx.strokeStyle = "rgba(180,0,255,0.3)";
                ctx.lineWidth = 8;
                ctx.beginPath(); ctx.moveTo(cx + off, originY); ctx.lineTo(cx + off, 0); ctx.stroke();
                ctx.strokeStyle = i === 1 ? "#DD88FF" : "#AA44EE";
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(cx + off, originY); ctx.lineTo(cx + off, 0); ctx.stroke();
                ctx.strokeStyle = "#FFFFFF";
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(cx + off, originY); ctx.lineTo(cx + off, 0); ctx.stroke();
            });

            // Lv4: 幅拡大ビーム（シアン）
            if (this.laserLevel >= 4) {
                ctx.shadowColor = "#00FFEE";
                ctx.shadowBlur = 25;
                ctx.strokeStyle = "rgba(0,255,220,0.2)";
                ctx.lineWidth = 28;
                ctx.beginPath(); ctx.moveTo(cx, originY); ctx.lineTo(cx, 0); ctx.stroke();
                ctx.strokeStyle = "#00FFCC";
                ctx.lineWidth = 8;
                ctx.beginPath(); ctx.moveTo(cx, originY); ctx.lineTo(cx, 0); ctx.stroke();
                ctx.strokeStyle = "#EEFFFF";
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(cx, originY); ctx.lineTo(cx, 0); ctx.stroke();
            }

            // Lv5: 分裂照射（左右斜め2本追加）
            if (this.splitBeam) {
                const splitOffsets = [-60, 60];
                splitOffsets.forEach(off => {
                    ctx.shadowColor = "#FF44FF";
                    ctx.shadowBlur = 15;
                    ctx.strokeStyle = "rgba(255,0,255,0.2)";
                    ctx.lineWidth = 12;
                    ctx.beginPath();
                    ctx.moveTo(cx, originY);
                    ctx.lineTo(cx + off, 0);
                    ctx.stroke();
                    ctx.strokeStyle = "#FF66FF";
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(cx, originY);
                    ctx.lineTo(cx + off, 0);
                    ctx.stroke();
                    ctx.strokeStyle = "#FFCCFF";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(cx, originY);
                    ctx.lineTo(cx + off, 0);
                    ctx.stroke();
                });
            }
        }

        // 照射中フラッシュ（画面端に周期的な光）
        const pulse = 0.4 + 0.3 * Math.sin(Date.now() / 80);
        ctx.strokeStyle = `rgba(255,255,255,${pulse * 0.15})`;
        ctx.lineWidth = 40;
        ctx.beginPath(); ctx.moveTo(cx, originY); ctx.lineTo(cx, 0); ctx.stroke();

        ctx.restore();
    },

    // 強化弾：オレンジの六角形＋グロー（sizeScaleでレベル別サイズ）
    _drawHexBullet(ctx, cx, top, w, h, sizeScale = 1.0) {
        const r = w * 0.9 * sizeScale;
        const y = top + h / 2;

        // グロー
        ctx.save();
        ctx.shadowColor = "#FF6600";
        ctx.shadowBlur  = 8 * sizeScale;

        // 六角形
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i - Math.PI / 6;
            const px = cx + r * Math.cos(a);
            const py = y  + r * Math.sin(a);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = "#FF8800";
        ctx.fill();

        // 中心の白点
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(cx, y, r * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // トレイル
        ctx.fillStyle = "rgba(255,120,0,0.35)";
        ctx.fillRect(cx - r * 0.3, top + h, r * 0.6, h * 0.8);

        ctx.restore();
    },

    // 連射弾：細いシアン色レーザー＋グロー
    _drawLaserBullet(ctx, x, y, w, h, vx) {
        ctx.save();
        ctx.shadowColor = "#00FFFF";
        ctx.shadowBlur  = 6;

        // 軌跡（薄いトレイル）
        ctx.fillStyle = "rgba(0,220,255,0.25)";
        ctx.fillRect(x, y + h, w, h * 0.6);

        // 弾本体（細いシアン棒）
        ctx.fillStyle = "#00EEFF";
        ctx.fillRect(x, y, w, h);

        // 先端ハイライト
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x + 1, y, w - 2, 2);

        // 横流れ弾のとき少し傾いた光線
        if (Math.abs(vx) > 0.5) {
            ctx.fillStyle = "rgba(0,255,255,0.4)";
            ctx.fillRect(x - vx * 1.5, y + 2, w, h - 4);
        }

        ctx.restore();
    }
};


// パワーアップアイテム関連の機能
window.Bullets = Bullets;




// ============================================================
// resources.js
// Resources — 資源アイテム
// ============================================================
const Resources = {
    resources: [],

    init() {
        this.resources = [];
    },

    reset() {
        this.resources = [];
    },

    spawn(canvas) {
        // サイズをcanvas幅の6〜9%に比例
        const size = canvas.width * (Math.random() * 0.03 + 0.06);
        const speed = canvas.height * (Math.random() * 0.004 + 0.002);
        const resource = {
            x: Math.random() * (canvas.width - size),
            y: -size,
            width: size,
            height: size,
            speed,
            type: "life"
        };
        this.resources.push(resource);
    },

    update(canvas, playerBounds) {
        for (let i = this.resources.length - 1; i >= 0; i--) {
            this.resources[i].y += this.resources[i].speed;

            // 衝突判定
            if (window.Obstacles.checkCollision(playerBounds, this.resources[i])) {
                this.collectResource(this.resources[i]);
                this.resources.splice(i, 1);
                continue;
            }

            // 画面外の資源を削除
            if (this.resources[i].y > canvas.height * 0.85) {
                this.resources.splice(i, 1);
            }
        }
    },

    collectResource(resource) {
        if (resource.type === "life") {
            // リソースマネージャー実績: 最大ライフ状態で資源を取得
            if (window.Game.lives >= window.Game.maxLives) {
                window.Game.resourceManagerCount++;
                window.Game.totalResourceManagerCount++;
                window.Game.saveCumulativeStats(); // 即時保存

                // 実績システムの即時更新を追加
                if (window.Achievements && window.Achievements.update) {
                    window.Achievements.update(window.Game.getAchievementState());
                }

                // 実績表示の即時更新を追加（実績画面が開いている場合）
                if (window.TitleScreen.getCurrentScreen() === "achievementsScreen") {
                    window.Achievements.refreshAchievementsDisplay();
                }
            }

            // ライフ回復（最大値を超えないように）
            if (window.Game.lives < window.Game.maxLives) {
                window.Game.lives++;
            }

            // スコア加算を確実に一度だけ行う
            if (window.Game.gameRunning && !resource.collected) {
                window.Game.scoreBreakdown.resource += window.Game.RESOURCE_SCORE;
                resource.collected = true; // 重複防止フラグ

                // 累積燃料補給回数を更新
                window.Game.totalResourceCollectCount++;
                window.Game.saveCumulativeStats(); // 即時保存

                // console.log(`💎 資源獲得点数: ${Game.RESOURCE_SCORE}点, 累積回数: ${Game.totalResourceCollectCount}回`);
            }

            // フローティングテキストを表示
            const message = Game.lives < Game.maxLives ? "ライフ回復！" : "資源獲得！";
            this.showCollectText(message, resource.x, resource.y, "#00ff00", resource);

            // スクリーンリーダー通知
            if (window.announceToScreenReader) {
                announceToScreenReader(`資源を取得！${message} スコア: +${window.Game.RESOURCE_SCORE}`);
            }

            // パワーアップ取得サウンド
            window.SoundManager.play("powerup");
        }

        // パーティクルエフェクトの生成
        window.Particles.createEffect(resource.x + resource.width / 2, resource.y + resource.height / 2, "#00ff00");
    },

    showCollectText(text, x, y, color, resource) {
        const textElement = document.createElement("div");
        textElement.className = `item-collect-text resource-collect`;
        textElement.textContent = text;
        textElement.style.left = x + "px";
        textElement.style.top = y + "px";
        textElement.style.color = color;

        document.querySelector(".game-area").appendChild(textElement);

        // アニメーション終了後に要素を削除
        setTimeout(() => {
            textElement.remove();
        }, 1500);
    },

    draw(ctx) {
        for (const resource of this.resources) {
            this.drawResource(ctx, resource);
        }
    },

    // 六角形を描画するヘルパー関数
    drawHexagon(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
    },

    // 回転する光のエフェクト
    drawRotatingLight(ctx, x, y, size, time) {
        ctx.strokeStyle = `rgba(0, 255, 136, ${0.5 + Math.sin(time) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, size + 5, time, time + Math.PI * 0.7);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + Math.cos(time * 1.5) * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, size + 2, -time, -time + Math.PI * 0.5);
        ctx.stroke();
    },

    // きらめきエフェクト
    drawSparkleEffect(ctx, x, y, size, time) {
        const sparkleCount = 4;

        for (let i = 0; i < sparkleCount; i++) {
            const angle = ((Math.PI * 2) / sparkleCount) * i + time;
            const distance = size * 0.8;
            const sparkleX = x + Math.cos(angle) * distance;
            const sparkleY = y + Math.sin(angle) * distance;

            const sparkleSize = 2 + Math.sin(time * 3 + i) * 1;
            const alpha = 0.7 + Math.sin(time * 4 + i) * 0.3;

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    // メインの描画関数
    drawResource(ctx, resource) {
        const centerX = resource.x + resource.width / 2;
        const centerY = resource.y + resource.height / 2;
        const size = resource.width / 2;
        const time = Date.now() * 0.01;

        ctx.save();

        // グロー効果
        const pulse = 0.7 + Math.sin(time * 0.8) * 0.3;
        ctx.globalAlpha = pulse;
        ctx.shadowColor = "#00ff88";
        ctx.shadowBlur = 15;

        // メイン結晶（緑色グラデーション）
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size);
        gradient.addColorStop(0, "#88ffaa");
        gradient.addColorStop(1, "#00ff88");

        ctx.fillStyle = gradient;
        this.drawHexagon(ctx, centerX, centerY, size);
        ctx.fill();

        // ハイライト（明るい部分）
        ctx.fillStyle = "#ccffee";
        this.drawHexagon(ctx, centerX, centerY, size * 0.4);
        ctx.fill();

        // 金色の縁取り
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        this.drawHexagon(ctx, centerX, centerY, size);
        ctx.stroke();

        // 内側の細いライン
        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = 1;
        this.drawHexagon(ctx, centerX, centerY, size * 0.8);
        ctx.stroke();

        ctx.restore();

        // エフェクト類
        this.drawRotatingLight(ctx, centerX, centerY, size, time);
        this.drawSparkleEffect(ctx, centerX, centerY, size, time);
    },

    // シールド延長メソッドをGameに委譲
    extendShieldDuration(additionalTime) {

        // Gameモジュールのメソッドを呼び出す
        if (window.Game && typeof Game.applyShieldExtension === "function") {
            const effect = {
                itemId: "shield_extension",
                effect: { shieldDuration: additionalTime }
            };
            return window.Game.applyShieldExtension(effect);
        }

        console.error("❌ window.Game.applyShieldExtensionが利用できません");
        return false;
    },

    // シールド延長の視覚効果
    showShieldExtensionEffect(additionalTime) {
        const gameArea = document.querySelector(".game-area");
        if (!gameArea) return;

        const effectElement = document.createElement("div");
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
    `;

        gameArea.appendChild(effectElement);

        setTimeout(() => {
            if (effectElement.parentNode) {
                effectElement.parentNode.removeChild(effectElement);
            }
        }, 1500);
    }
};

Resources.extendShieldDuration = function (additionalTime) {
    // PowerUpsモジュールに委譲
    if (window.PowerUps && typeof PowerUps.extendShieldDuration === "function") {
        return window.PowerUps.extendShieldDuration(additionalTime);
    }

    return false;
};


window.Resources = Resources;
