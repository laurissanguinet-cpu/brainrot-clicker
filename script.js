let gameData = {
    score: 0,
    upgradesOwned: Array(11).fill(0),
    totalClicks: 0,
    timePlayed: 0,
    bestScore: 0,
    maxEvoReached: 0,
    ascendLevel: 0
};

const evolutions = [
    { threshold: 0, img: "1.png", name: "Recrue" },
    { threshold: 100, img: "2.png", name: "Skibidi" },
    { threshold: 1000, img: "3.png", name: "Fanum" },
    { threshold: 10000, img: "4.png", name: "Rizzler" },
    { threshold: 50000, img: "5.png", name: "Sigma" },
    { threshold: 250000, img: "6.png", name: "Mewing" },
    { threshold: 1000000, img: "7.png", name: "Ohio" },
    { threshold: 10000000, img: "8.png", name: "Grimace" },
    { threshold: 100000000, img: "9.png", name: "Gyatt" },
    { threshold: 1000000000, img: "10.png", name: "God" }
];

const upgrades = [
    { name: "⚡ Clic", cost: 10, power: 1, isClick: true },
    { name: "🚽 Skibidi", cost: 15, pps: 1 },
    { name: "🍔 Fanum", cost: 100, pps: 5 },
    { name: "👑 Rizzler", cost: 500, pps: 15 },
    { name: "🗿 Sigma", cost: 2000, pps: 45 },
    { name: "🤫 Mewing", cost: 10000, pps: 120 },
    { name: "🌽 Ohio", cost: 50000, pps: 300 },
    { name: "🍦 Grimace", cost: 150000, pps: 800 },
    { name: "🧬 Looksmax", cost: 500000, pps: 2000 },
    { name: "🍑 Gyatt", cost: 1500000, pps: 5000 },
    { name: "👺 God", cost: 10000000, pps: 15000 }
];

let buyAmount = 1;
const ASCEND_REQ = 1000000;

function setBuyAmount(amt) {
    buyAmount = amt;
    document.querySelectorAll('.mode-btn').forEach(b => {
        // CORRECTION DU BUG X5 / X25 : On vérifie l'égalité exacte
        if (b.innerText === "x" + amt) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
    updateShop();
}

function initShop() {
    const container = document.getElementById('shop-items');
    container.innerHTML = "";
    upgrades.forEach((u, i) => {
        const div = document.createElement('div');
        div.className = 'upgrade-container';
        div.innerHTML = `
            <div class="lvl-bar-bg"><div class="lvl-bar-fill" id="lvl-fill-${i}"></div></div>
            <button class="upgrade-btn" id="upg-${i}" onclick="buyUpgrade(${i})">Chargement...</button>
        `;
        container.appendChild(div);
    });
}

function updateShop() {
    upgrades.forEach((upg, i) => {
        const btn = document.getElementById(`upg-${i}`);
        const fill = document.getElementById(`lvl-fill-${i}`);
        if(!btn) return;
        const lvl = gameData.upgradesOwned[i];
        fill.style.width = Math.min(100, (lvl / 200) * 100) + "%";
        
        if (i > 0 && gameData.upgradesOwned[i-1] < 5) {
            btn.disabled = true;
            btn.innerHTML = `🔒 Verrouillé<br><small>Niv. 5 précédent requis</small>`;
            return;
        }

        let cost = 0;
        for(let n=0; n<buyAmount; n++) cost += Math.floor(upg.cost * Math.pow(1.15, lvl + n));

        if (lvl >= 200) {
            btn.disabled = true;
            btn.innerHTML = `<strong>${upg.name}</strong><br>MAX`;
        } else {
            let canBuy = Math.floor(gameData.score + 0.1) >= cost;
            btn.disabled = !canBuy;
            let benefit = upg.isClick ? `+${upg.power * buyAmount} Clic` : `+${upg.pps * buyAmount} PPS`;
            let html = `<span class="upgrade-info">${benefit}</span><strong>${upg.name}</strong> (x${buyAmount})<br>${cost.toLocaleString()} pts`;
            if (!canBuy) html += `<br><small style="color:#f44">Manque ${Math.floor(cost - gameData.score)}</small>`;
            btn.innerHTML = html;
        }
    });
}

function buyUpgrade(i) {
    const btn = document.getElementById(`upg-${i}`);
    let purchased = 0;
    for (let n = 0; n < buyAmount; n++) {
        let cost = Math.floor(upgrades[i].cost * Math.pow(1.15, gameData.upgradesOwned[i]));
        if (Math.floor(gameData.score + 0.1) >= cost && gameData.upgradesOwned[i] < 200) {
            gameData.score -= cost;
            gameData.upgradesOwned[i]++;
            purchased++;
        } else break;
    }
    if (purchased > 0) {
        btn.classList.remove('buy-animate');
        void btn.offsetWidth;
        btn.classList.add('buy-animate');
        updateDisplay(); save();
    }
}

function getMultiplier() {
    return 1 + (gameData.ascendLevel * 0.5); 
}

document.getElementById('main-clicker').onclick = (e) => {
    let baseClick = 1 + (upgrades[0].power * gameData.upgradesOwned[0]);
    let gain = baseClick * getMultiplier();
    
    gameData.score += gain;
    gameData.totalClicks++;

    const img = document.getElementById('main-clicker');
    img.classList.remove('shake');
    void img.offsetWidth;
    img.classList.add('shake');

    const txt = document.createElement('div');
    txt.className = 'floating-text';
    txt.innerText = "+" + Math.floor(gain);
    txt.style.left = e.clientX + 'px';
    txt.style.top = e.clientY + 'px';
    document.body.appendChild(txt);
    setTimeout(() => txt.remove(), 1000);

    updateDisplay();
};

setInterval(() => {
    let basePPS = upgrades.reduce((acc, u, i) => acc + (u.pps ? u.pps * gameData.upgradesOwned[i] : 0), 0);
    gameData.score += (basePPS * getMultiplier()) / 10;
    gameData.timePlayed += 0.1;
    updateDisplay();
}, 100);

function updateDisplay() {
    let mult = getMultiplier();
    let basePPS = upgrades.reduce((acc, u, i) => acc + (u.pps ? u.pps * gameData.upgradesOwned[i] : 0), 0);
    
    document.getElementById('score').innerText = Math.floor(gameData.score).toLocaleString();
    document.getElementById('pps').innerText = Math.floor(basePPS * mult).toLocaleString();
    
    let percent = Math.round((mult - 1) * 100);
    document.getElementById('ascend-bonus-display').innerText = `+${percent}%`;

    if(gameData.score > gameData.bestScore) gameData.bestScore = gameData.score;
    
    checkEvolution();
    updateShop();
}

function checkEvolution() {
    let evoIdx = 0;
    for (let i = 0; i < evolutions.length; i++) if (gameData.score >= evolutions[i].threshold) evoIdx = i;
    if (evoIdx > gameData.maxEvoReached) { gameData.maxEvoReached = evoIdx; save(); }
    document.getElementById('main-clicker').src = evolutions[evoIdx].img;

    const next = evolutions[evoIdx + 1];
    if (next) {
        let p = ((gameData.score - evolutions[evoIdx].threshold) / (next.threshold - evolutions[evoIdx].threshold)) * 100;
        document.getElementById('progress-bar').style.width = Math.max(0, Math.min(100, p)) + "%";
        document.getElementById('next-evolution-text').innerText = `Prochain: ${Math.floor(next.threshold - gameData.score)} pts`;
    } else {
        document.getElementById('progress-bar').style.width = "100%";
        document.getElementById('next-evolution-text').innerText = "MAX";
    }
}

function checkAscendStatus() {
    const btn = document.getElementById('do-ascend-btn');
    const msg = document.getElementById('ascend-msg');
    
    if (gameData.score >= ASCEND_REQ) {
        btn.disabled = false;
        msg.innerText = "PRÊT ! Bonus +50% Permanent !";
        msg.style.color = "#0f0";
    } else {
        btn.disabled = true;
        msg.innerText = `Manque ${Math.floor(ASCEND_REQ - gameData.score).toLocaleString()} pts`;
        msg.style.color = "#f44";
    }
}

document.getElementById('do-ascend-btn').onclick = () => {
    gameData.ascendLevel++;
    gameData.score = 0;
    gameData.upgradesOwned = Array(11).fill(0);
    closeM('ascend-modal');
    alert("Ascension réussie !");
    updateDisplay();
    save();
};

document.getElementById('ascend-icon').onclick = () => {
    document.getElementById('ascend-modal').style.display = 'block';
    checkAscendStatus();
};
document.getElementById('stats-icon').onclick = () => {
    document.getElementById('stats-modal').style.display = 'block';
    document.getElementById('stat-best').innerText = Math.floor(gameData.bestScore);
    document.getElementById('stat-time').innerText = Math.floor(gameData.timePlayed / 60) + "m";
    document.getElementById('stat-ascend-lvl').innerText = gameData.ascendLevel;
};
document.getElementById('collection-icon').onclick = () => {
    document.getElementById('collection-modal').style.display = 'block';
    const g = document.getElementById('collection-grid');
    g.innerHTML = "";
    evolutions.forEach((evo, i) => {
        const d = document.createElement('div'); d.className = 'collection-item';
        const img = document.createElement('img'); img.src = evo.img;
        if(i > gameData.maxEvoReached) img.className = 'locked-img';
        d.appendChild(img); g.appendChild(d);
    });
};
function closeM(id) { document.getElementById(id).style.display = 'none'; }

document.getElementById('reset-btn').onclick = () => {
    if(confirm("Effacer TOUTE la progression ?")) { localStorage.clear(); location.reload(); }
};

function save() { localStorage.setItem('BrainrotUltimateSave', JSON.stringify(gameData)); }
function load() {
    const s = localStorage.getItem('BrainrotUltimateSave');
    if (s) { gameData = {...gameData, ...JSON.parse(s)}; }
    updateDisplay();
}

initShop();
load();
setInterval(save, 5000);
