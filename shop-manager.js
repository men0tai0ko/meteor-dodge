
// ============================================================
// shop-manager.js
// ShopManager — ショップ管理
// ============================================================
const ShopManager = {
    // 初期化
    init() {
    this.loadShopData();
    this.setupEventListeners();
    this.currentCategory = "upgrade"; // 初期表示はバフ
    },

    setupEventListeners() {
        // ショップ画面のイベント設定
        document.addEventListener("click", (e) => {
            if (e.target.classList.contains("shop-buy-btn")) {
                const itemId = e.target.dataset.itemId;
                this.purchaseItem(itemId);
            }

            if (e.target.classList.contains("category-btn")) {
                const category = e.target.dataset.category;
                this.filterItems(category);
            }
        });
    },

    // 購入処理メソッド追加
    purchaseItem(itemId) {
        const item = StorageSystem.getShopItem(itemId);
        if (!item) {
            console.error(`❌ アイテムが見つかりません: ${itemId}`);
            return false;
        }

        // weapon タイプは装備購入処理にリダイレクト
        if (item.usage === "equip") {
            const result = window.StorageSystem.purchaseWeapon(itemId);
            if (result.success) {
                this.updateShopUI();
                return true;
            }
            return false;
        }

        // 所持金チェック
        if (!this.canAfford(item.price)) {
            return false;
        }

        // 支払い処理
        if (!this.processPayment(item.price)) {
            return false;
        }

        // 格納庫に追加
        if (window.StorageSystem.addShopItem(itemId)) {
            this.updateShopUI();
            return true;
        }

        return false;
    },

    // ショップUI更新メソッド
    updateShopUI() {
        this.updateBalanceDisplay();
        // 開くたびに「バフ」タブを初期表示にリセット
        this.currentCategory = "upgrade";
        document.querySelectorAll(".category-btn").forEach(btn => {
            btn.classList.remove("active");
            if (btn.dataset.category === "upgrade") btn.classList.add("active");
        });
        this.renderShopItems(this.currentCategory);
        this.setupScrollIndicator();
    },

    // 所持金表示更新
    updateBalanceDisplay() {
        const elements = {
            common: document.getElementById("balanceCommon"),
            rare: document.getElementById("balanceRare"),
            epic: document.getElementById("balanceEpic")
        };

        if (elements.common) elements.common.textContent = window.StorageSystem.resources.common;
        if (elements.rare) elements.rare.textContent = window.StorageSystem.resources.rare;
        if (elements.epic) elements.epic.textContent = window.StorageSystem.resources.epic;
    },

    // アイテム表示レンダリング
    renderShopItems(category = "upgrade") {
        const grid = document.getElementById("shopItemsGrid");
        if (!grid) {
            console.error("❌ ショップアイテムグリッドが見つかりません");
            return;
        }

        grid.innerHTML = "";

        const allItems = StorageSystem.getAllShopItems();
        // weapon タイプは格納庫の装備改造で管理するためショップには表示しない
        let itemsToShow = Object.values(allItems).filter(item => item.usage !== "equip");

        // カテゴリフィルター
        if (category !== "all") {
            itemsToShow = itemsToShow.filter((item) => item.type === category);
        }

        // グリッドレイアウトをインラインスタイルで強制設定
        grid.style.cssText = "display:grid;grid-template-columns:repeat(2,1fr);gap:10px;width:100%;box-sizing:border-box;margin:8px 0;";

        itemsToShow.forEach((item) => {
            const itemCard = this.createItemCard(item);
            grid.appendChild(itemCard);
        });

    },

    // アイテムカード作成
createItemCard(item) {
    const card = document.createElement("div");
    card.className = "shop-item-card";

        // アイテム状態の判定
    const itemState = this.getItemState(item);
    // weapon タイプは現在レベルに応じた価格で判定
    let effectivePrice = item.price;
    if (item.usage === "equip" && item.levelPrices) {
        const ownedWeapon = StorageSystem.items.find(i => i.id === item.id);
        const currentLv = ownedWeapon ? (ownedWeapon.level || 1) : 0;
        if (currentLv < item.maxLevel) {
            effectivePrice = item.levelPrices[currentLv];
        } else {
            effectivePrice = null; // MAX
        }
    }
    const canAfford = effectivePrice ? this.canAfford(effectivePrice) : false;
    const ownedItem = StorageSystem.items.find((i) => i.id === item.id);

    // 短い説明文を生成（長すぎる場合は省略）
    const shortDescription = item.description.length > 60 
        ? item.description.substring(0, 60) + "..." 
        : item.description;

    // インラインスタイルでフレックス縦並びを確実に設定
    card.style.cssText = [
        "display:flex", "flex-direction:column", "align-items:center",
        "gap:8px", "padding:18px 14px 16px", "text-align:center",
        "box-sizing:border-box", "position:relative", "overflow:hidden",
        "border-radius:14px", "cursor:default",
        "transition:border-color 0.2s,box-shadow 0.2s",
        itemState === "maxed"
            ? "border:1.5px solid rgba(255,68,68,0.4);background:linear-gradient(170deg,rgba(40,10,10,0.95),rgba(50,15,15,0.85))"
            : canAfford
                ? "border:1.5px solid rgba(60,120,180,0.35);background:linear-gradient(170deg,rgba(5,18,38,0.95),rgba(8,25,55,0.85));box-shadow:0 2px 10px rgba(0,0,0,0.5)"
                : "border:1.5px solid rgba(60,120,180,0.35);background:linear-gradient(170deg,rgba(5,18,38,0.95),rgba(8,25,55,0.85))"
    ].join(";");

    const ownedText = ownedItem
        ? `<div class="shop-card-owned">所持 ${ownedItem.quantity}${item.maxStack ? `/${item.maxStack}` : ""}</div>`
        : "";
    const rarityColor = item.rarity === "epic" ? "#FFD700" : item.rarity === "rare" ? "#00AAFF" : "#88AABB";

    card.innerHTML =
        `<div class="shop-card-icon">${item.icon}</div>` +
        `<div class="shop-card-name">${item.name}</div>` +
        `<div class="shop-card-rarity" style="color:${rarityColor}">${this.getRarityText(item.rarity)}</div>` +
        `<div class="shop-card-desc">${shortDescription}</div>` +
        `<div class="shop-card-price">${this.renderPrice(effectivePrice || item.price)}</div>` +
        ownedText +
        `<button class="shop-buy-btn ${!canAfford ? "disabled" : ""} ${itemState}"
            data-item-id="${item.id}"
            ${!canAfford ? "disabled" : ""}>
            ${this.getButtonText(itemState, canAfford)}
        </button>`;

    return card;
},

    // 価格表示
renderPrice(price) {
    let priceHtml = "";
    if (price.common > 0) {
        priceHtml += `<div class="price-item" title="鉄鉱石">⚙️${price.common}</div>`;
    }
    if (price.rare > 0) {
        priceHtml += `<div class="price-item" title="銀鉱石">🔗${price.rare}</div>`;
    }
    if (price.epic > 0) {
        priceHtml += `<div class="price-item" title="金鉱石">💎${price.epic}</div>`;
    }
    return priceHtml;
},

    // アイテム状態判定
    getItemState(item) {
        const ownedItem = StorageSystem.items.find((i) => i.id === item.id);

        if (!ownedItem) return "available";
        if (item.maxStack && ownedItem.quantity >= item.maxStack) return "maxed";
        return "owned";
    },

    // レアリティ表示テキスト
    getRarityText(rarity) {
        const rarityTexts = {
            common: "ノーマル",
            rare: "レア",
            epic: "エピック"
        };
        return rarityTexts[rarity] || rarity;
    },

    // ボタンテキスト
    getButtonText(itemState, canAfford) {
        if (!canAfford) return "所持金不足";

        switch (itemState) {
            case "available":
                return "購入する";
            case "owned":
                return "追加購入";
            case "maxed":
                return "所持上限";
            default:
                return "購入する";
        }
    },

    // カテゴリフィルター
    filterItems(category) {
    // アクティブなボタンの更新
    document.querySelectorAll(".category-btn").forEach((btn) => {
        btn.classList.remove("active");
    });
    event.target.classList.add("active");

    this.currentCategory = category; // 現在のカテゴリを保存
    this.renderShopItems(category);
    },

    processPayment(price) {
        // 簡易的な支払い処理（後で拡張）
        if (price.common) window.StorageSystem.resources.common -= price.common;
        if (price.rare) window.StorageSystem.resources.rare -= price.rare;
        if (price.epic) window.StorageSystem.resources.epic -= price.epic;

        window.StorageSystem.saveStorage();
        return true;
    },

    // ショップデータの読み込み
    loadShopData() {
        try {
            const saved = localStorage.getItem("shopData");
            if (saved) {
                const data = JSON.parse(saved);
                // アップグレード状態などを読み込み
                if (data.upgrades) {
                    Object.assign(window.Game.SHOP_SYSTEM.UPGRADES, data.upgrades);
                }
            }
        } catch (error) {
        }
    },

    // ショップデータの保存
    saveShopData() {
        try {
            const data = {
                upgrades: window.Game.SHOP_SYSTEM.UPGRADES,
                lastUpdated: Date.now()
            };
            localStorage.setItem("shopData", JSON.stringify(data));
        } catch (error) {
        }
    },

    // アイテム購入可否チェック
    canAfford(price) {
        return (
            window.StorageSystem.resources.common >= (price.common || 0) &&
            window.StorageSystem.resources.rare >= (price.rare || 0) &&
            window.StorageSystem.resources.epic >= (price.epic || 0)
        );
    },

    // アイテム価格取得
    getItemPrice(itemType, currencyType = "common") {
        const basePrice = Game.SHOP_SYSTEM.ITEM_PRICES[itemType];
        if (!basePrice) return 0;

        // 通貨タイプに応じた換算
        switch (currencyType) {
            case "rare":
                return Math.ceil(basePrice / window.Game.SHOP_SYSTEM.EXCHANGE_RATES.COMMON_TO_RARE);
            case "epic":
                return Math.ceil(basePrice / window.Game.SHOP_SYSTEM.EXCHANGE_RATES.COMMON_TO_EPIC);
            default:
                return basePrice;
        }
    },

    // アップグレード購入
    purchaseUpgrade(upgradeType) {
        const upgrade = Game.SHOP_SYSTEM.UPGRADES[upgradeType];
        if (!upgrade || upgrade.level >= upgrade.maxLevel) return false;

        const cost = upgrade.cost[upgrade.level];
        if (window.Game.totalOres >= cost) {
            // 支払い処理
            window.Game.totalOres -= cost;

            // アップグレード適用
            upgrade.level++;
            this.applyUpgrade(upgradeType);

            // 取引記録
            this.recordTransaction("upgrade", upgradeType, cost);

            // データ保存
            window.Game.saveCumulativeStats();
            this.saveShopData();

            return true;
        }
        return false;
    },

    // アップグレード効果適用
    applyUpgrade(upgradeType) {
        const upgrade = Game.SHOP_SYSTEM.UPGRADES[upgradeType];
        const currentEffect = upgrade.effect[upgrade.level - 1];

        switch (upgradeType) {
            case "miningEfficiency":
                // 採掘確率ボーナスを適用
                window.Game.MINING_DROP_RATE += currentEffect;
                break;
            case "shieldDuration":
                // シールド時間延長を適用
                window.PowerUps.SHIELD_DURATION += currentEffect;
                break;
        }
    },

    // 取引記録
    recordTransaction(type, item, cost) {
        window.Game.shopTransactions.push({
            type: type,
            item: item,
            cost: cost,
            timestamp: Date.now(),
            balance: window.Game.getCurrencyBalance()
        });

        // 取引履歴が多すぎる場合は古いものを削除
        if (window.Game.shopTransactions.length > 100) {
            window.Game.shopTransactions = window.Game.shopTransactions.slice(-50);
        }
    },

    // スクロールインジケーター制御
    setupScrollIndicator() {
        const container = document.querySelector("#shopScreen .screen-container");
        const hint = document.getElementById("shopScrollHint");

        if (!container || !hint) return;

        container.addEventListener("scroll", () => {
            const scrollableHeight = container.scrollHeight - container.clientHeight;
            const currentScroll = container.scrollTop;

            // スクロールが下部近くになったらインジケーターを非表示
            if (currentScroll > scrollableHeight - 50) {
                hint.style.opacity = "0";
            } else {
                hint.style.opacity = "1";
            }
        });

        // 初期状態でスクロールが必要かチェック
        setTimeout(() => {
            const needsScroll = container.scrollHeight > container.clientHeight;
            hint.style.display = needsScroll ? "block" : "none";
        }, 100);
    },

    // ショップ状態の取得（デバッグ用）
    getShopStatus() {
        return {
            balance: window.Game.getCurrencyBalance(),
            upgrades: window.Game.SHOP_SYSTEM.UPGRADES,
            recentTransactions: window.Game.shopTransactions.slice(-5)
        };
    }
};


// パーティクルエフェクト関連の機能
window.ShopManager = ShopManager;
