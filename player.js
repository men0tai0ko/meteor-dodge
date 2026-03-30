
// ============================================================
// player.js
// Player — 宇宙船・燃料
// ============================================================
const Player = {
    x: 0,
    y: 0,
    width: 40,
    height: 40,

    // 燃料システム用
    fuel: 100,
    maxFuel: 100,
    isLowFuel: false,
    FUEL_SYSTEM: {
        BASE_CONSUMPTION: 1, // 1秒あたり1%消費（時間ベース）
        SHIELD_MULTIPLIER: 2, // シールド時消費倍率
        WORMHOLE_COST: -0.04, // ワームホール消費率(5%)
        COLLISION_COST: 0.3, // 衝突消費率(30%)
        CRITICAL_LEVEL: 20, // 警告表示しきい値(20%)
        WARNING_LEVEL: 40 // 注意表示しきい値(40%)
    },

    // デバイスに応じた基本消費量を取得するメソッドを追加
    getBaseConsumption() {
        const isMobile = this.isMobileDevice();
        return isMobile ? this.FUEL_SYSTEM.BASE_CONSUMPTION.MOBILE : this.FUEL_SYSTEM.BASE_CONSUMPTION.PC;
    },

    init(canvas) {
        this.reset(canvas);
    },

    // モバイルデバイス判定（方法1）
    isMobileDevice() {
        // 画面幅の判定
        const isSmallScreen = window.innerWidth <= 768;

        // タッチサポートの判定
        const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

        // ユーザーエージェントの判定
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

        return (isSmallScreen && hasTouch) || isMobileUA;
    },

    reset(canvas, _retryCount = 0) {
        if (!canvas) {
            console.error("❌ キャンバスが提供されていません");
            return;
        }
        if (canvas.width === 0 || canvas.height === 0) {
            if (_retryCount >= 5) return;
            setTimeout(() => this.reset(canvas, _retryCount + 1), 100);
            return;
        }


        if (!canvas || canvas.width === 0 || canvas.height === 0) {
            // デフォルト位置に設定（後で調整される）
            this.x = 400;
            this.y = 500;
            return;
        }

        // サイズをcanvas幅の9%に比例（画面サイズ問わず体感一定）
        this.width  = canvas.width * 0.09;
        this.height = canvas.width * 0.09;

        // コントロールゾーン（下部15%）の上端より少し上に配置
        const controlZoneTop = canvas.height * 0.85;
        this.x = canvas.width  / 2 - this.width  / 2;
        this.y = controlZoneTop - this.height - 8;

        // 燃料警告状態を完全にリセット
        this.fuel = this.maxFuel;
        this.isLowFuel = false;

        // UIの燃料表示を確実に更新（複数回実行）
        this.forceFuelUIUpdate();

    },

    // 燃料UIを強制更新するメソッドを追加
    forceFuelUIUpdate() {
        // 即時更新
        if (window.UI && UI.updateFuelDisplay) {
            window.UI.updateFuelDisplay(100, false);
        }

        // 遅延更新（確実性のため）
        setTimeout(() => {
            if (window.UI && UI.updateFuelDisplay) {
                window.UI.updateFuelDisplay(100, false);

                // 警告クラスを確実に削除
                const fuelDisplay = document.getElementById("fuelDisplay");
                const gameAreaFuel = document.querySelector(".game-area-stat.fuel-stat");

                if (fuelDisplay) {
                    fuelDisplay.classList.remove("fuel-warning", "fuel-critical", "fuel-blink");
                }
                if (gameAreaFuel) {
                    gameAreaFuel.classList.remove("fuel-warning", "fuel-critical");
                }
            }
        }, 100);

        // さらに遅延更新（他の初期化が完了した後）
        setTimeout(() => {
            if (window.UI && UI.updateFuelDisplay) {
                window.UI.updateFuelDisplay(100, false);
            }
        }, 500);
    },

    move(e, canvas) {
        if (!window.Game.gameRunning || window.Game.gamePaused) return;

        const rect = canvas.getBoundingClientRect();
        // タッチとマウスの両方に対応
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        this.x = clientX - rect.left - this.width / 2;

        // キャンバスの境界内に制限
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    },

    // ドラッグ追従: 指の移動量だけX座標を動かす（タップ瞬間移動を防ぐ）
    moveByDelta(deltaX, canvas) {
        if (!window.Game.gameRunning || window.Game.gamePaused) return;
        this.x += deltaX;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    },

    handleResize(canvas) {
        // リサイズ時に再設定
        this.reset(canvas);
    },

    draw(ctx) {
        if (!ctx || !ctx.canvas) {
            console.error("❌ 描画コンテキストが無効です");
            return;
        }
        const canvas = ctx.canvas;
        if (!canvas || canvas.width === 0 || canvas.height === 0) return;

        // 位置・サイズ更新
        const controlTop = canvas.height * 0.85;
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
        this.y     = controlTop - this.height - 8;
        this.width = this.height = canvas.width * 0.09;

        // 装備中機体データを取得（なければデフォルト）
        const ship = (window.StorageSystem && window.StorageSystem.getEquippedShipData)
            ? window.StorageSystem.getEquippedShipData()
            : { id: "standard", bodyColor: "#1E90FF", engineColor: "#FF4500" };

        this._drawShip(ctx, ship);
    },

    // 機体タイプ別描画
    _drawShip(ctx, ship) {
        const x = this.x, y = this.y, w = this.width, h = this.height;
        const cx = x + w / 2;
        const color = ship.bodyColor  || "#1E90FF";
        const flame = ship.engineColor || "#FF4500";

        ctx.save();
        switch (ship.id) {
            case "explorer": {
                // 六翼形
                ctx.fillStyle = color;
                ctx.beginPath();
                for (let k = 0; k < 6; k++) {
                    const a = (k / 6) * Math.PI * 2 - Math.PI / 2;
                    const r = k % 2 === 0 ? w * 0.5 : w * 0.28;
                    k === 0 ? ctx.moveTo(cx + Math.cos(a)*r, y + h*0.5 + Math.sin(a)*h*0.5)
                            : ctx.lineTo(cx + Math.cos(a)*r, y + h*0.5 + Math.sin(a)*h*0.5);
                }
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = flame;
                ctx.beginPath();
                ctx.moveTo(cx,         y + h);
                ctx.lineTo(cx - w*0.1, y + h + 10);
                ctx.lineTo(cx + w*0.1, y + h + 10);
                ctx.closePath();
                ctx.fill();
                break;
            }
            case "fighter": {
                // 10角形（シャープ）
                ctx.fillStyle = color;
                ctx.beginPath();
                for (let k = 0; k < 10; k++) {
                    const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
                    const r = k % 2 === 0 ? w * 0.5 : w * 0.3;
                    k === 0 ? ctx.moveTo(cx + Math.cos(a)*r, y + h*0.5 + Math.sin(a)*h*0.5)
                            : ctx.lineTo(cx + Math.cos(a)*r, y + h*0.5 + Math.sin(a)*h*0.5);
                }
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = flame;
                ctx.beginPath();
                ctx.moveTo(cx,         y + h);
                ctx.lineTo(cx - w*0.1, y + h + 10);
                ctx.lineTo(cx + w*0.1, y + h + 10);
                ctx.closePath();
                ctx.fill();
                break;
            }
            case "stealth": {
                // ダイヤ形
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(cx,       y);
                ctx.lineTo(cx + w/2, y + h * 0.55);
                ctx.lineTo(cx,       y + h);
                ctx.lineTo(cx - w/2, y + h * 0.55);
                ctx.closePath();
                ctx.fill();
                // コア
                ctx.fillStyle = ship.bodyHighlight || "#EEEDFE";
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(cx, y + h * 0.42, w * 0.14, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.fillStyle = flame;
                ctx.beginPath();
                ctx.moveTo(cx,         y + h);
                ctx.lineTo(cx - w*0.1, y + h + 10);
                ctx.lineTo(cx + w*0.1, y + h + 10);
                ctx.closePath();
                ctx.fill();
                break;
            }
            case "classic": {
                // UFO円盤
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.ellipse(cx, y + h * 0.65, w * 0.5, h * 0.22, 0, 0, Math.PI * 2);
                ctx.fill();
                // ドーム
                ctx.fillStyle = ship.bodyHighlight || "#FAC775";
                ctx.beginPath();
                ctx.ellipse(cx, y + h * 0.5, w * 0.26, h * 0.22, 0, Math.PI, Math.PI * 2);
                ctx.fill();
                // 炎（左右2本）
                ctx.fillStyle = flame;
                [cx - w*0.18, cx + w*0.18].forEach(fx => {
                    ctx.beginPath();
                    ctx.moveTo(fx - w*0.07, y + h * 0.78);
                    ctx.lineTo(fx,          y + h + 10);
                    ctx.lineTo(fx + w*0.07, y + h * 0.78);
                    ctx.closePath();
                    ctx.fill();
                });
                break;
            }
            case "nebula": {
                // 星型（5枚翼）
                ctx.fillStyle = color;
                ctx.beginPath();
                for (let k = 0; k < 10; k++) {
                    const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
                    const r = k % 2 === 0 ? w * 0.5 : w * 0.2;
                    k === 0 ? ctx.moveTo(cx + Math.cos(a)*r, y + h*0.5 + Math.sin(a)*h*0.5)
                            : ctx.lineTo(cx + Math.cos(a)*r, y + h*0.5 + Math.sin(a)*h*0.5);
                }
                ctx.closePath();
                ctx.fill();
                // 中心コア
                ctx.fillStyle = ship.bodyHighlight || "#FBEAF0";
                ctx.globalAlpha = 0.85;
                ctx.beginPath();
                ctx.arc(cx, y + h * 0.5, w * 0.14, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.fillStyle = flame;
                ctx.beginPath();
                ctx.moveTo(cx,         y + h);
                ctx.lineTo(cx - w*0.1, y + h + 10);
                ctx.lineTo(cx + w*0.1, y + h + 10);
                ctx.closePath();
                ctx.fill();
                break;
            }
            default: {
                // standard（三角形）
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(cx,    y);
                ctx.lineTo(x + w, y + h);
                ctx.lineTo(x,     y + h);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = flame;
                ctx.beginPath();
                ctx.moveTo(cx,         y + h);
                ctx.lineTo(cx - w/3,   y + h + 10);
                ctx.lineTo(cx + w/3,   y + h + 10);
                ctx.closePath();
                ctx.fill();
                break;
            }
        }
        ctx.restore();
    },

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    },

    // 燃料関連メソッド
    consumeFuel(amount) {
        const oldFuel = this.fuel;
        this.fuel = Math.max(0, this.fuel - amount);

        // 確実にUI更新をトリガー
        const fuelPercent = this.getFuelPercent();
        const isLowFuel = fuelPercent <= this.FUEL_SYSTEM.CRITICAL_LEVEL;

        if (window.UI && UI.updateFuelDisplay) {
            window.UI.updateFuelDisplay(fuelPercent, isLowFuel);
        }

        // デバッグモード時のみログ出力

        return this.fuel;
    },

    updateFuelStatus() {
        const fuelPercent = (this.fuel / this.maxFuel) * 100;
        this.isLowFuel = fuelPercent <= this.FUEL_SYSTEM.CRITICAL_LEVEL;

        // UI更新をトリガー
        if (window.UI && UI.updateFuelDisplay) {
            window.UI.updateFuelDisplay(fuelPercent, this.isLowFuel);
        }

        // 警告状態の効果音
        if (this.isLowFuel && window.SoundManager && window.SoundManager.play) {
            window.SoundManager.play("fuelWarning");
        }
    },

    getFuelPercent() {
        return (this.fuel / this.maxFuel) * 100;
    },

    isFuelEmpty() {
        return this.fuel <= 0;
    },

    // 燃料回復メソッド
    addFuel(amount) {
        const oldFuel = this.fuel;
        this.fuel = Math.min(this.maxFuel, this.fuel + amount);

        const fuelPercent = this.getFuelPercent();
        if (window.UI && UI.updateFuelDisplay) {
            window.UI.updateFuelDisplay(fuelPercent, this.isLowFuel);
            // 回復エフェクト表示
            window.UI.showFuelGainEffect();
        }

        return this.fuel;
    }
};


// UI関連の機能

window.Player = Player;
