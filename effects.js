// ============================================================
// debug.js
// DebugLogger — デバッグログ
// ============================================================
const DebugLogger = {
    MODULE_COLORS: {
        'GAME': '#FF6B6B',
        'PLAYER': '#4ECDC4',
        'OBSTACLES': '#FFD166',
        'BULLETS': '#06D6A0',
        'POWERUPS': '#118AB2',
        'RESOURCES': '#EF476F',
        'PARTICLES': '#073B4C',
        'UI': '#7209B7',
        'SOUND': '#F15BB5',
        'ACHIEVEMENTS': '#00BBF9'
    },

    LEVELS: { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 },
    currentLevel: 2,
    debugMode: false, // 外部から setDebugMode() で設定する

    init() {
        // 依存なし。debugMode は Game.init() から setDebugMode() で設定される
    },

    // Game から呼ばれる: DebugLogger.setDebugMode(this.DEBUG_MODE)
    setDebugMode(enabled) {
        this.debugMode = !!enabled;
        if (this.debugMode) {
            this.currentLevel = this.LEVELS.DEBUG;
        }
    },

    setLevel(level) {
        if (this.LEVELS[level] !== undefined) {
            this.currentLevel = this.LEVELS[level];
        }
    },

    shouldLog(level) {
        return this.debugMode && level <= this.currentLevel;
    },

    formatMessage(module, level, message, data) {
        const timestamp = new Date().toISOString().substr(11, 12);
        const levelStr = ['ERROR', 'WARN', 'INFO', 'DEBUG'][level];
        const color = this.MODULE_COLORS[module] || '#666666';
        
        return {
            formatted: `%c[${timestamp}][${module}][${levelStr}] ${message}`,
            style: `color: ${color}; font-weight: bold;`,
            data: data
        };
    },

    log(module, level, message, data = null) {
        if (!this.shouldLog(level)) return;

        const formatted = this.formatMessage(module, level, message, data);
        
        if (data) {
        } else {
        }
    },

    error(module, message, data = null) {
        this.log(module, this.LEVELS.ERROR, message, data);
    },

    warn(module, message, data = null) {
        this.log(module, this.LEVELS.WARN, message, data);
    },

    info(module, message, data = null) {
        this.log(module, this.LEVELS.INFO, message, data);
    },

    debug(module, message, data = null) {
        this.log(module, this.LEVELS.DEBUG, message, data);
    }
};

if (typeof window !== 'undefined') {
    window.DebugLogger = DebugLogger;
    // 初期化を遅延実行
    // DebugLogger.init() は空実装。debugMode は Game.init() 内の setDebugMode() で設定される
}


// ============================================================
// particles.js
// Particles — パーティクルエフェクト
// ============================================================
const Particles = {
    particles: [],

    init() {
        this.particles = [];
    },

    reset() {
        this.particles = [];
    },

    createEffect(x, y, color = null, type = "default") {
        let particleCount, particleSize, speedMultiplier;

        // エフェクトタイプごとの設定
        switch (type) {
            case "shieldBreak":
                particleCount = 30;
                particleSize = 3;
                speedMultiplier = 6;

                for (let i = 0; i < particleCount; i++) {
                    const hue = 180 + Math.random() * 60; // 青～水色
                    const saturation = 80 + Math.random() * 20;
                    const lightness = 60 + Math.random() * 20;

                    this.particles.push({
                        x: x,
                        y: y,
                        vx: (Math.random() - 0.5) * speedMultiplier * (1 + Math.random()),
                        vy: (Math.random() - 0.5) * speedMultiplier * (1 + Math.random()),
                        life: Math.random() * 40 + 20,
                        color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                        size: particleSize * (0.5 + Math.random()),
                        type: type
                    });
                }
                break;
            case "playerBurn":
                particleCount = 25;
                particleSize = 4;
                speedMultiplier = 3;
                break;
            case "resource":
                particleCount = 20;
                particleSize = 3;
                speedMultiplier = 3;

                for (let i = 0; i < particleCount; i++) {
                    const hue = 120 + Math.random() * 30; // 緑系
                    this.particles.push({
                        x: x,
                        y: y,
                        vx: (Math.random() - 0.5) * speedMultiplier,
                        vy: (Math.random() - 0.5) * speedMultiplier,
                        life: Math.random() * 40 + 20,
                        color: `hsl(${hue}, 100%, 60%)`,
                        size: particleSize * (0.5 + Math.random()),
                        type: "resource"
                    });
                }
                break;

            case "wormhole":
                // 既存の設定
                particleCount = 80;
                particleSize = 4;
                speedMultiplier = 10;
                break;

            // 採掘エフェクト
            case "mining":
                particleCount = 15;
                particleSize = 3;
                speedMultiplier = 4;

                for (let i = 0; i < particleCount; i++) {
                    const hue = color === "#FFD700" ? 50 + Math.random() * 10 : 0 + Math.random() * 30;
                    const saturation = 70 + Math.random() * 30;
                    const lightness = 50 + Math.random() * 30;

                    this.particles.push({
                        x: x,
                        y: y,
                        vx: (Math.random() - 0.5) * speedMultiplier,
                        vy: (Math.random() - 0.5) * speedMultiplier,
                        life: Math.random() * 30 + 20,
                        color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                        size: particleSize * (0.5 + Math.random()),
                        type: "mining"
                    });
                }
                return;

            // レアドロップ用の特別エフェクト
            case "miningRare":
                particleCount = 25;
                particleSize = 4;
                speedMultiplier = 6;

                for (let i = 0; i < particleCount; i++) {
                    // 金色の輝きを持つパーティクル
                    const hue = 50 + Math.random() * 10; // 金色系
                    const saturation = 80 + Math.random() * 20;
                    const lightness = 60 + Math.random() * 20;

                    this.particles.push({
                        x: x,
                        y: y,
                        vx: (Math.random() - 0.5) * speedMultiplier * (1 + Math.random()),
                        vy: (Math.random() - 0.5) * speedMultiplier * (1 + Math.random()),
                        life: Math.random() * 40 + 30, // 長めの寿命
                        color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                        size: particleSize * (0.7 + Math.random()),
                        type: "miningRare"
                    });
                }
                return;

            case "miningCOMMON":
                particleCount = 12;
                particleSize = 2;
                speedMultiplier = 3;
                // 鉄鉱石の灰色系パーティクル
                break;

            case "miningRARE":
                particleCount = 18;
                particleSize = 3;
                speedMultiplier = 4;
                // 銀鉱石の銀色系パーティクル
                break;

            case "miningEPIC":
                particleCount = 25;
                particleSize = 4;
                speedMultiplier = 5;
                // 金鉱石の金色系パーティクル
                break;

            // 星屑ケース
            case "starBurst":
                particleCount = 12;
                particleSize = 2;
                speedMultiplier = 8;

                for (let i = 0; i < particleCount; i++) {
                    const angle = ((Math.PI * 2) / particleCount) * i;
                    const distance = 2 + Math.random() * 3;

                    this.particles.push({
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * speedMultiplier * distance,
                        vy: Math.sin(angle) * speedMultiplier * distance,
                        life: Math.random() * 40 + 30,
                        color: `hsl(${45 + Math.random() * 15}, 100%, 60%)`, // 金色系
                        size: particleSize * (0.8 + Math.random()),
                        type: "starBurst"
                    });
                }
                return;

            // 弾発射システム用
            case "bulletHit":
                particleCount = 15;
                particleSize = 3;
                speedMultiplier = 5;

                for (let i = 0; i < particleCount; i++) {
                    const hue = 30 + Math.random() * 30; // オレンジ系
                    this.particles.push({
                        x: x,
                        y: y,
                        vx: (Math.random() - 0.5) * speedMultiplier,
                        vy: (Math.random() - 0.5) * speedMultiplier,
                        life: Math.random() * 30 + 20,
                        color: `hsl(${hue}, 100%, 60%)`,
                        size: particleSize * (0.5 + Math.random()),
                        type: "bulletHit"
                    });
                }
                break;

            default:
                particleCount = 20;
                particleSize = 2;
                speedMultiplier = 4;
        }

        // シールド破壊エフェクト（青系）
        if (type === "shieldBreak") {
            for (let i = 0; i < particleCount; i++) {
                const hue = 180 + Math.random() * 60; // 青～水色
                this.particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * speedMultiplier,
                    vy: (Math.random() - 0.5) * speedMultiplier,
                    life: Math.random() * 40 + 20,
                    color: `hsl(${hue}, 80%, 60%)`,
                    size: particleSize * (0.5 + Math.random()),
                    type: type
                });
            }
            return;
        }

        // 自機燃焼エフェクト（赤～オレンジ系）
        if (type === "playerBurn") {
            for (let i = 0; i < particleCount; i++) {
                const hue = 10 + Math.random() * 30; // 赤～オレンジ
                this.particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * speedMultiplier,
                    vy: (Math.random() - 0.1) * speedMultiplier, // やや上方向に
                    life: Math.random() * 50 + 30, // 長めの寿命
                    color: `hsl(${hue}, 90%, 60%)`,
                    size: particleSize * (0.7 + Math.random()),
                    type: type
                });
            }
            return;
        }

        // ワームホール用の強化設定
        if (type === "wormhole") {
            particleCount = 80; // 大幅に増加
            particleSize = 4; // サイズ拡大
            speedMultiplier = 10; // 速度向上

            // 複数色のパーティクルを生成
            for (let i = 0; i < particleCount; i++) {
                const hue = 270 + Math.random() * 60; // 紫色系
                const saturation = 80 + Math.random() * 20;
                const lightness = 60 + Math.random() * 20;

                this.particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * speedMultiplier * (1 + Math.random()),
                    vy: (Math.random() - 0.5) * speedMultiplier * (1 + Math.random()),
                    life: Math.random() * 60 + 40, // 寿命延長
                    color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                    size: particleSize * (0.5 + Math.random()),
                    type: type
                });
            }
            return;
        }

        // 通常のパーティクル生成
        const baseColor = color || `hsl(${Math.random() * 60 + 250}, 100%, 70%)`;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * speedMultiplier,
                vy: (Math.random() - 0.5) * speedMultiplier,
                life: Math.random() * 40 + 30,
                color: baseColor,
                size: particleSize
            });
        }
    },

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].x += this.particles[i].vx;
            this.particles[i].y += this.particles[i].vy;
            this.particles[i].life--;

            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    },

    draw(ctx) {
        for (const particle of this.particles) {
            // ワームホールパーティクルは特別な描画
            if (particle.type === "wormhole") {
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.life / 100;

                // 星形のパーティクル
                ctx.beginPath();
                const spikes = 5;
                const outerRadius = particle.size;
                const innerRadius = particle.size * 0.5;

                for (let i = 0; i < spikes * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (Math.PI * i) / spikes;
                    const x = particle.x + Math.cos(angle) * radius;
                    const y = particle.y + Math.sin(angle) * radius;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.closePath();
                ctx.fill();
            } else if (particle.type === "mining") {
                // 採掘パーティクルの描画
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.life / 50;

                // 鉱石らしい四角形やダイヤモンド形状
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(Math.PI / 4); // 45度回転してダイヤモンド状に

                const size = particle.size || 2;
                ctx.fillRect(-size / 2, -size / 2, size, size);

                ctx.restore();
            } else if (particle.type === "starBurst") {
                // 星形のパーティクル
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.life / 70;

                ctx.save();
                ctx.translate(particle.x, particle.y);

                // 星を描画
                this.drawStar(ctx, 0, 0, particle.size, particle.size * 0.5, 5);
                ctx.fill();

                ctx.restore();
            } else {
                // 通常の円形パーティクル
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.life / 50;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size || 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    },

    // 星を描画
    drawStar(ctx, cx, cy, outerRadius, innerRadius, points) {
        ctx.beginPath();

        for (let i = 0; i < points * 2; i++) {
            const angle = (Math.PI / points) * i;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
    }
};

window.Particles = Particles;
