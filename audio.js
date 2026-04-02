// ============================================================
// sound-manager.js
// SoundManager — 効果音管理
// ============================================================
const SoundManager = {
    // 設定
    enabled: true,
    volume: 0.7,

    // サウンドバッファのストレージ
    sounds: new Map(),

    // オーディオコンテキスト
    audioContext: null,

    // 初期化
    init() {
        try {
            // オーディオコンテキストの作成
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            this.enabled = false;
        }

        // 設定の読み込み
        this.loadSettings();
    },

    // 設定の読み込み
    loadSettings() {
        const saved = localStorage.getItem("soundSettings");
        if (saved) {
            const settings = JSON.parse(saved);
            this.enabled = settings.enabled !== false;
            this.volume = settings.volume || 0.7;
        }
    },

    // 設定の保存
    saveSettings() {
        const settings = {
            enabled: this.enabled,
            volume: this.volume
        };
        localStorage.setItem("soundSettings", JSON.stringify(settings));
    },

    // サウンドのプリロード
    async preloadSound(name, frequencyData = null) {
        if (!this.enabled || !this.audioContext) return;

        // 既にロード済みの場合はスキップ
        if (this.sounds.has(name)) return;

        try {
            let buffer;

            if (frequencyData) {
                // プログラムで生成するサウンド
                buffer = this.generateSound(frequencyData);
            } else {
                // 外部ファイルからロード（将来的な拡張用）
                buffer = await this.loadSoundFile(name);
            }

            this.sounds.set(name, buffer);
        } catch (error) {
        }
    },

    // プログラムによるサウンド生成
    generateSound(frequencyData) {
        const {
            type = "sine",
            frequency = 440,
            duration = 0.5,
            volume = 0.3,
            attack = 0.01,
            decay = 0.1,
            release = 0.1
        } = frequencyData;

        const buffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * duration,
            this.audioContext.sampleRate
        );

        const channelData = buffer.getChannelData(0);
        const sampleRate = this.audioContext.sampleRate;

        for (let i = 0; i < channelData.length; i++) {
            const time = i / sampleRate;
            let amplitude = 0;

            // 基本波形の生成
            switch (type) {
                case "sine":
                    amplitude = Math.sin(2 * Math.PI * frequency * time);
                    break;
                case "square":
                    amplitude = Math.sin(2 * Math.PI * frequency * time) > 0 ? 1 : -1;
                    break;
                case "sawtooth":
                    amplitude = 2 * (time * frequency - Math.floor(0.5 + time * frequency));
                    break;
                case "triangle":
                    amplitude = 2 * Math.abs(2 * (time * frequency - Math.floor(time * frequency + 0.5))) - 1;
                    break;
                default:
                    amplitude = Math.sin(2 * Math.PI * frequency * time);
            }

            // エンベロープ適用
            let envelope = 1;
            if (time < attack) {
                envelope = time / attack;
            } else if (time < attack + decay) {
                envelope = 1 - (1 - volume) * ((time - attack) / decay);
            } else if (time > duration - release) {
                envelope = volume * (1 - (time - (duration - release)) / release);
            } else {
                envelope = volume;
            }

            channelData[i] = amplitude * envelope;
        }

        return buffer;
    },

    // 外部ファイルのロード（将来的な拡張用）
    async loadSoundFile(name) {
        // ここではプログラム生成のみを使用
        // 将来的にファイルロードが必要な場合は実装
        throw new Error("ファイルロードは現在サポートされていません");
    },

    // 効果音の再生
    play(name, options = {}) {
        if (!this.enabled || !this.audioContext || !this.sounds.has(name)) {
            return null;
        }

        try {
            const buffer = this.sounds.get(name);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = buffer;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // ボリューム設定
            const volume = options.volume !== undefined ? options.volume : this.volume;
            gainNode.gain.value = volume;

            // 再生速度（ピッチ変更）
            if (options.playbackRate) {
                source.playbackRate.value = options.playbackRate;
            }

            source.start();

            // オプション：ループ再生
            if (options.loop) {
                source.loop = true;
            }

            return {
                source: source,
                stop: () => source.stop(),
                setVolume: (vol) => (gainNode.gain.value = vol)
            };
        } catch (error) {
            return null;
        }
    },

    // 効果音の停止
    stop(soundInstance) {
        if (soundInstance && soundInstance.stop) {
            soundInstance.stop();
        }
    },

    // 設定の変更
    setEnabled(enabled) {
        this.enabled = enabled;
        this.saveSettings();
    },

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    },

    // プリセットサウンドの定義
    presetSounds: {
        // 採掘効果音
        mining: {
            type: "square",
            frequency: 200,
            duration: 0.2,
            volume: 0.25,
            attack: 0.01,
            decay: 0.1,
            release: 0.1
        },

        miningRare: {
            type: "sine",
            frequency: 523.25, // C5
            duration: 0.5,
            volume: 0.3,
            attack: 0.05,
            decay: 0.2,
            release: 0.25
        },

        miningCollect: {
            type: "triangle",
            frequency: 659.25, // E5
            duration: 0.1,
            volume: 0.15,
            attack: 0.02,
            decay: 0.05,
            release: 0.03
        },

        // 衝突・ダメージ系
        explosion: {
            type: "sawtooth",
            frequency: 80,
            duration: 0.8,
            volume: 0.4,
            attack: 0.01,
            decay: 0.3,
            release: 0.4
        },

        shieldHit: {
            type: "sine",
            frequency: 300,
            duration: 0.3,
            volume: 0.3,
            attack: 0.01,
            decay: 0.1,
            release: 0.2
        },

        playerDamage: {
            type: "square",
            frequency: 150,
            duration: 0.4,
            volume: 0.35,
            attack: 0.02,
            decay: 0.15,
            release: 0.2
        },

        // アイテム取得系
        powerup: {
            type: "sine",
            frequency: 523.25, // C5
            duration: 0.5,
            volume: 0.25,
            attack: 0.05,
            decay: 0.2,
            release: 0.25
        },

        resourceCollect: {
            type: "triangle",
            frequency: 659.25, // E5
            duration: 0.4,
            volume: 0.2,
            attack: 0.03,
            decay: 0.15,
            release: 0.2
        },

        // ワームホール系
        wormhole: {
            type: "sine",
            frequency: 220,
            duration: 1.2,
            volume: 0.3,
            attack: 0.3,
            decay: 0.4,
            release: 0.5
        },

        // UI・メニュー系
        buttonClick: {
            type: "sine",
            frequency: 400,
            duration: 0.1,
            volume: 0.2,
            attack: 0.01,
            decay: 0.05,
            release: 0.04
        },

        menuOpen: {
            type: "sine",
            frequency: 600,
            duration: 0.2,
            volume: 0.15,
            attack: 0.02,
            decay: 0.1,
            release: 0.08
        },

        // ゲーム状態系
        gameStart: {
            type: "sine",
            frequency: 1046.5, // C6
            duration: 0.8,
            volume: 0.25,
            attack: 0.1,
            decay: 0.3,
            release: 0.4
        },

        gameOver: {
            type: "sawtooth",
            frequency: 110,
            duration: 1.0,
            volume: 0.4,
            attack: 0.1,
            decay: 0.4,
            release: 0.5
        },

        // 鉱石数更新時の効果音
        oreUpdate: {
            type: "sine",
            frequency: 800,
            duration: 0.1,
            volume: 0.1,
            attack: 0.01,
            decay: 0.05,
            release: 0.04
        },

        // レア鉱石獲得時の特別音
        rareOreGet: {
            type: "sine",
            frequency: 1046.5, // C6
            duration: 0.3,
            volume: 0.2,
            attack: 0.05,
            decay: 0.15,
            release: 0.1
        },

        // エピック鉱石獲得時の特別音
        epicOreGet: {
            type: "triangle",
            frequency: 1318.5, // E6
            duration: 0.5,
            volume: 0.25,
            attack: 0.1,
            decay: 0.2,
            release: 0.2
        },

        // コンボ更新時の効果音
        comboUpdate: {
            type: "square",
            frequency: 523.25, // C5
            duration: 0.15,
            volume: 0.15,
            attack: 0.02,
            decay: 0.08,
            release: 0.05
        },

        // 燃料警告音
        fuelWarning: {
            type: "sine",
            frequency: 440,
            duration: 200,
            volume: 0.3,
            fadeOut: true
        },

        // 自動射撃システム用サウンド
        bulletFire: {
            type: "square",
            frequency: 800,
            duration: 0.1,
            volume: 0.15,
            attack: 0.01,
            decay: 0.05,
            release: 0.04
        },

        bulletHit: {
            type: "sawtooth",
            frequency: 200,
            duration: 0.3,
            volume: 0.25,
            attack: 0.02,
            decay: 0.1,
            release: 0.15
        },

        // 連射モード用（将来的な拡張）
        rapidFire: {
            type: "square",
            frequency: 600,
            duration: 0.05,
            volume: 0.1,
            attack: 0.005,
            decay: 0.03,
            release: 0.02
        }
    },

    // すべてのプリセットサウンドをプリロード
    async preloadAll() {
        if (!this.enabled) return;

        const promises = Object.entries(this.presetSounds).map(([name, data]) => {
            return this.preloadSound(name, data);
        });

        await Promise.all(promises);
    },

    // ボリューム調整用の関数
    playAdjusted(soundName, context = "mining") {
        if (!this.enabled) return null;

        const baseVolume = this.volume;
        let adjustedVolume = baseVolume;

        // コンテキストに応じて音量調整
        switch (context) {
            case "mining":
                adjustedVolume = baseVolume * 0.8;
                break;
            case "ui":
                adjustedVolume = baseVolume * 0.6;
                break;
            case "combo":
                adjustedVolume = baseVolume * 0.5;
                break;
            default:
                adjustedVolume = baseVolume;
        }

        return this.play(soundName, { volume: adjustedVolume });
    }
};


window.SoundManager = SoundManager;


// ============================================================
// bgm-sequences.js
// BGMSequences — BGM音楽データ
// ============================================================
const BGMSequences = {
    // ゲーム開始ファンファーレ（ワンフレーズのみ・ループなし）
    fanfare: {
        name: "ファンファーレ",
        bpm: 150,
        loop: false,
        tracks: [
            {
                instrument: "square",
                notes: [
                    { note: "G4",  duration: 0.5, type: "square", velocity: 0.7 },
                    { note: "E4",  duration: 0.5, type: "square", velocity: 0.6 },
                    { note: "C4",  duration: 0.5, type: "square", velocity: 0.6 },
                    { note: "E4",  duration: 0.5, type: "square", velocity: 0.65 },
                    { note: "G4",  duration: 0.5, type: "square", velocity: 0.7 },
                    { note: "A4",  duration: 0.5, type: "square", velocity: 0.7 },
                    { note: "G4",  duration: 0.5, type: "square", velocity: 0.65 },
                    { note: "E4",  duration: 0.5, type: "square", velocity: 0.6 },
                    { note: "C5",  duration: 0.5, type: "square", velocity: 0.75 },
                    { note: "B4",  duration: 0.5, type: "square", velocity: 0.7 },
                    { note: "G4",  duration: 0.5, type: "square", velocity: 0.65 },
                    { note: "E4",  duration: 1.0, type: "square", velocity: 0.5 }
                ]
            },
            {
                instrument: "triangle",
                notes: [
                    { note: "C3",  duration: 2.0, type: "triangle", velocity: 0.3 },
                    { note: "G3",  duration: 2.0, type: "triangle", velocity: 0.3 },
                    { note: "C3",  duration: 2.0, type: "triangle", velocity: 0.25 },
                    { note: "E3",  duration: 2.0, type: "triangle", velocity: 0.2 }
                ]
            }
        ]
    },

    // メインテーマ（タイトル画面）
    mainTheme: {
        name: "メインテーマ",
        bpm: 120,
        loopPoints: { start: 0, end: 16 },
        tracks: [
            {
                instrument: "square",
                notes: [
                    { note: "C4", duration: 1, type: "square", velocity: 0.6 },
                    { note: "E4", duration: 1, type: "square", velocity: 0.6 },
                    { note: "G4", duration: 1, type: "square", velocity: 0.6 },
                    { note: "C5", duration: 1, type: "square", velocity: 0.6 },
                    { note: "E5", duration: 1, type: "square", velocity: 0.6 },
                    { note: "G4", duration: 1, type: "square", velocity: 0.6 },
                    { note: "E5", duration: 1, type: "square", velocity: 0.6 },
                    { note: "C5", duration: 1, type: "square", velocity: 0.6 },
                    { note: "G4", duration: 1, type: "square", velocity: 0.6 },
                    { note: "E4", duration: 1, type: "square", velocity: 0.6 },
                    { note: "C4", duration: 1, type: "square", velocity: 0.6 },
                    { note: "G3", duration: 1, type: "square", velocity: 0.6 },
                    { note: "C4", duration: 1, type: "square", velocity: 0.6 },
                    { note: "E4", duration: 1, type: "square", velocity: 0.6 },
                    { note: "G4", duration: 1, type: "square", velocity: 0.6 },
                    { note: "C5", duration: 1, type: "square", velocity: 0.6 }
                ]
            },
            {
                instrument: "sine",
                notes: [
                    { note: "C3", duration: 4, type: "sine", velocity: 0.3 },
                    { note: "G2", duration: 4, type: "sine", velocity: 0.3 },
                    { note: "C3", duration: 4, type: "sine", velocity: 0.3 },
                    { note: "E3", duration: 4, type: "sine", velocity: 0.3 }
                ]
            }
        ]
    },

    // ゲームプレイ中
    gameplay: {
        name: "ゲームプレイ",
        bpm: 140,
        loopPoints: { start: 0, end: 8 },
        tracks: [
            {
                instrument: "sawtooth",
                notes: [
                    { note: "A4", duration: 0.5, type: "sawtooth", velocity: 0.4 },
                    { note: "C5", duration: 0.5, type: "sawtooth", velocity: 0.4 },
                    { note: "E5", duration: 0.5, type: "sawtooth", velocity: 0.4 },
                    { note: "G5", duration: 0.5, type: "sawtooth", velocity: 0.4 },
                    { note: "E5", duration: 0.5, type: "sawtooth", velocity: 0.4 },
                    { note: "C5", duration: 0.5, type: "sawtooth", velocity: 0.4 },
                    { note: "A4", duration: 0.5, type: "sawtooth", velocity: 0.4 },
                    { note: "G4", duration: 0.5, type: "sawtooth", velocity: 0.4 }
                ]
            }
        ]
    },

    // 危険状態（ライフが少ないなど）
    danger: {
        name: "危険状態",
        bpm: 160,
        loopPoints: { start: 0, end: 4 },
        tracks: [
            {
                instrument: "square",
                notes: [
                    { note: "G3", duration: 0.25, type: "square", velocity: 0.5 },
                    { note: "F3", duration: 0.25, type: "square", velocity: 0.5 },
                    { note: "G3", duration: 0.25, type: "square", velocity: 0.5 },
                    { note: "F3", duration: 0.25, type: "square", velocity: 0.5 },
                    { note: "G3", duration: 0.25, type: "square", velocity: 0.5 },
                    { note: "F3", duration: 0.25, type: "square", velocity: 0.5 },
                    { note: "G3", duration: 0.25, type: "square", velocity: 0.5 },
                    { note: "F3", duration: 0.25, type: "square", velocity: 0.5 }
                ]
            }
        ]
    },

    // ゲームオーバー
    gameOver: {
        name: "ゲームオーバー",
        bpm: 80,
        loop: false,
        tracks: [
            {
                instrument: "sine",
                notes: [
                    { note: "C3", duration: 1, type: "sine", velocity: 0.6 },
                    { note: "G2", duration: 1, type: "sine", velocity: 0.5 },
                    { note: "F2", duration: 1, type: "sine", velocity: 0.4 },
                    { note: "E2", duration: 1, type: "sine", velocity: 0.3 },
                    { note: "D2", duration: 2, type: "sine", velocity: 0.2 }
                ]
            }
        ]
    }
};


window.BGMSequences = BGMSequences;


// ============================================================
// bgm-manager.js
// BGMManager — BGM再生管理
// ============================================================
const BGMManager = {
    audioContext: null,
    currentBGM: null,
    isPlaying: false,
    enabled: true,
    volume: 0.3,

    // ユーザージェスチャーが行われたか追跡
    userGestureOccurred: false,

    // 初期化（AudioContextは作成しない）
    async init() {
        try {
            // 設定のみ読み込み、AudioContextはユーザージェスチャーまで作成しない
            this.loadSettings();
            this.createOscillatorCache(); // オシレーターキャッシュのみ準備
        } catch (error) {
            this.enabled = false;
        }
    },

    // ユーザージェスチャー後に呼び出す初期化
    async initializeAudioContext() {
        if (this.audioContext) {
            return true;
        }

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isContextSuspended = this.audioContext.state === "suspended";
            this.userGestureOccurred = true;

            return true;
        } catch (error) {
            console.error("❌ AudioContext作成失敗:", error);
            this.enabled = false;
            return false;
        }
    },

    // オーディオコンテキストをレジューム
    async resumeContext() {
        if (!this.audioContext) {
            return false;
        }

        if (this.audioContext.state !== "suspended") {
            this.isContextSuspended = false;
            return true;
        }

        try {
            await this.audioContext.resume();
            this.isContextSuspended = false;
            return true;
        } catch (error) {
            return false;
        }
    },

    // 基本音色の作成（AudioContextが存在する場合のみ）
    createOscillatorCache() {
        // 実際のオシレーターはAudioContext作成時に作る
        this.oscillatorTypes = ["sine", "square", "sawtooth", "triangle"];
    },

    // 基本音色の作成
    createOscillators() {
        if (!this.audioContext) {
            console.error("❌ AudioContextがありません");
            return;
        }

        this.oscillators = new Map();
        this.oscillatorTypes.forEach((type) => {
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = type;
            oscillator.frequency.value = 0;
            oscillator.start();

            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0;
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            this.oscillators.set(type, { oscillator, gainNode });
        });
    },

    // 設定の管理
    loadSettings() {
        const saved = localStorage.getItem("bgmSettings");
        if (saved) {
            const settings = JSON.parse(saved);
            this.enabled = settings.enabled !== false;
            this.volume = settings.volume || 0.3;
        }
    },

    saveSettings() {
        const settings = {
            enabled: this.enabled,
            volume: this.volume
        };
        localStorage.setItem("bgmSettings", JSON.stringify(settings));
    },

    // BGM再生（ユーザージェスチャー対応版）
    async play(sequenceName, options = {}) {

        if (!this.enabled) {
            return;
        }

        // AudioContextがなければ作成を試みる
        if (!this.audioContext) {
            const success = await this.initializeAudioContext();
            if (!success) {
                return;
            }
            this.createOscillators();
        }

        // コンテキストがサスペンド状態ならレジューム
        if (this.audioContext.state === "suspended") {
            try {
                await this.audioContext.resume();
            } catch (error) {
                return;
            }
        }

        // 同じBGMが既に再生中の場合は何もしない
        if (
            this.currentBGM &&
            this.currentBGM.sequence &&
            this.currentBGM.sequence.name === sequenceName &&
            this.isPlaying
        ) {
            return;
        }

        // 既存のBGMを停止（フェードアウト付き）
        if (this.currentBGM) {
            this.stop(0.3); // 0.3秒のフェードアウト
        }

        const sequence = BGMSequences[sequenceName];
        if (!sequence) {
            return;
        }

        try {
            // 少し遅延を入れて確実に再生
            setTimeout(() => {
                this.currentBGM = this.createBGMSequence(sequence, options);
                this.isPlaying = true;

            }, 100);
        } catch (error) {
            console.error(`❌ BGM再生エラー (${sequenceName}):`, error);
            this.isPlaying = false;
            this.currentBGM = null;
        }
    },

    // BGMシーケンスの作成
    createBGMSequence(sequence, options) {
        // sequenceにloop:falseが定義されている場合はそちらを優先
        const loopDefault = sequence.loop !== undefined ? sequence.loop : true;
        const { loop = loopDefault, fadeIn = 0.5 } = options;

        // メインのゲインノードを作成
        const gainNode = this.audioContext.createGain();
        gainNode.connect(this.audioContext.destination);
        gainNode.gain.value = 0;

        // フェードイン
        const now = this.audioContext.currentTime;
        if (fadeIn > 0) {
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(this.volume, now + fadeIn);
        } else {
            gainNode.gain.value = this.volume;
        }

        // ノートシーケンスのスケジュール
        this.scheduleNotes(sequence, gainNode, loop);

        const bgmObject = {
            gainNode,
            sequence,
            startTime: now,
            timeoutIds: [],
            // ループ状態を追跡
            isLooping: loop
        };


        return bgmObject;
    },

    // ノートのスケジュール
    scheduleNotes(sequence, gainNode, loop) {
        const bpm = sequence.bpm || 120;
        const beatDuration = 60 / bpm;
        const now = this.audioContext.currentTime;


        // 既存のタイムアウトをクリア
        if (this.currentBGM && this.currentBGM.timeoutIds) {
            this.currentBGM.timeoutIds.forEach((id) => clearTimeout(id));
            this.currentBGM.timeoutIds = [];
        }

        sequence.tracks.forEach((track, trackIndex) => {
            let position = 0;

            track.notes.forEach((note) => {
                const startTime = now + position * beatDuration;
                const duration = note.duration * beatDuration;

                this.scheduleNote(note, startTime, duration, gainNode, trackIndex);
                position += note.duration;
            });
        });

        // ループ処理 - 正確なループ時間を計算
        const totalDuration = sequence.tracks.reduce((max, track) => {
            const trackDuration = track.notes.reduce((sum, note) => sum + note.duration, 0) * beatDuration;
            return Math.max(max, trackDuration);
        }, 0);

        if (loop && this.isPlaying) {
            const loopTimeoutId = setTimeout(() => {
                // まだ再生中で、同じgainNodeを使用している場合のみループ
                if (this.isPlaying && this.currentBGM && this.currentBGM.gainNode === gainNode) {
                    this.scheduleNotes(sequence, gainNode, loop);
                }
            }, totalDuration * 1000);

            // タイムアウトIDを保存
            if (this.currentBGM && this.currentBGM.timeoutIds) {
                this.currentBGM.timeoutIds.push(loopTimeoutId);
            }
        } else if (!loop) {
            // ワンフレーズ再生終了後にisPlayingをリセット
            const endTimeoutId = setTimeout(() => {
                if (this.currentBGM && this.currentBGM.gainNode === gainNode) {
                    this.isPlaying = false;
                    this.currentBGM = null;
                }
            }, (totalDuration + 0.5) * 1000);

            if (this.currentBGM && this.currentBGM.timeoutIds) {
                this.currentBGM.timeoutIds.push(endTimeoutId);
            }
        }
    },

    // 個別ノートのスケジュール
    scheduleNote(note, startTime, duration, gainNode, trackIndex) {
        const oscillator = this.audioContext.createOscillator();
        const noteGain = this.audioContext.createGain();

        oscillator.type = note.type || "sine";
        oscillator.frequency.value = this.noteToFrequency(note.note);

        // エンベロープ適用
        const attack = note.attack || 0.05;
        const release = note.release || 0.1;
        const velocity = note.velocity || 0.7;

        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(velocity, startTime + attack);
        noteGain.gain.linearRampToValueAtTime(velocity, startTime + duration - release);
        noteGain.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.connect(noteGain);
        noteGain.connect(gainNode);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    },

    // ノート名から周波数への変換
    noteToFrequency(note) {
        const notes = {
            C4: 261.63,
            "C#4": 277.18,
            D4: 293.66,
            "D#4": 311.13,
            E4: 329.63,
            F4: 349.23,
            "F#4": 369.99,
            G4: 392.0,
            "G#4": 415.3,
            A4: 440.0,
            "A#4": 466.16,
            B4: 493.88,
            C5: 523.25,
            "C#5": 554.37,
            D5: 587.33,
            "D#5": 622.25,
            E5: 659.25,
            F5: 698.46,
            "F#5": 739.99,
            G5: 783.99,
            "G#5": 830.61,
            A5: 880.0,
            "A#5": 932.33,
            B5: 987.77
        };
        return notes[note] || 440;
    },

    // BGMの停止
    stop(fadeOut = 1.0) {
        if (!this.currentBGM) {
            return;
        }


        this.isPlaying = false;

        // すべてのタイムアウトをクリア
        if (this.currentBGM.timeoutIds) {
            this.currentBGM.timeoutIds.forEach((id) => clearTimeout(id));
            this.currentBGM.timeoutIds = [];
        }

        if (fadeOut > 0) {
            const now = this.audioContext.currentTime;
            this.currentBGM.gainNode.gain.cancelScheduledValues(now);
            this.currentBGM.gainNode.gain.setValueAtTime(this.currentBGM.gainNode.gain.value, now);
            this.currentBGM.gainNode.gain.linearRampToValueAtTime(0, now + fadeOut);

            setTimeout(() => {
                if (this.currentBGM) {
                    this.currentBGM.gainNode.disconnect();
                    this.currentBGM = null;
                }
            }, fadeOut * 1000);
        } else {
            this.currentBGM.gainNode.disconnect();
            this.currentBGM = null;
        }
    },

    // 設定の変更
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stop();
        }
        this.saveSettings();
    },

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.currentBGM) {
            this.currentBGM.gainNode.gain.value = this.volume;
        }
        this.saveSettings();
    },

    // ゲーム状態に応じたBGM切り替え
    playForGameState(state) {
        const bgmMap = {
            title: "mainTheme",
            playing: "gameplay",
            danger: "danger",
            gameOver: "gameOver"
        };

        const sequenceName = bgmMap[state];
        if (sequenceName) {
            this.play(sequenceName);
        }
    }
};


window.BGMManager = BGMManager;
