let gameData = {
    score: 0, upgradesOwned: Array(11).fill(0),
    totalClicks: 0, timePlayed: 0, bestScore: 0,
    maxEvoReached: 0, ascendLevel: 0
};

// --- LOGIQUE ASCENDANCE ÉVOLUTIVE ---
function getAscendCost() {
    // Niveau 0 -> 1M, Niveau 1 -> 5M, Niveau 2 -> 25M, etc.
    return 1000000 * Math.pow(5, gameData.ascendLevel);
}

function getAscendBonus() {
    // Chaque ascendance donne +50%, +60%, +70%... de façon cumulative
    return 0.5 + (gameData.ascendLevel * 0.1);
}

function getMultiplier() {
    // Calcul du bonus cumulé des ascendances passées
    let totalPrestigeMult = 1;
    for(let i=0; i < gameData.ascendLevel; i++) {
        totalPrestigeMult *= (1 + (0.5 + (i * 0.1)));
    }
    // Bonus de rang Brainrot (+10% par palier)
    let rankMult = 1 + (gameData.maxEvoReached * 0.1);
    return totalPrestigeMult * rankMult;
}

// --- RESTE DU CODE ---
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

function setBuyAmount(amt) {
    buyAmount = amt;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.innerText === "x"+amt));
    updateShop();
}

function initShop() {
    const container = document.getElementById('shop-items');
    container.innerHTML = "";
    upgrades.forEach((u, i) => {
        const div = document.createElement('div');
        div.className = 'upgrade-container';
        div.innerHTML = `<div class="lvl-bar-bg"><div class="lvl-bar-fill" id="lvl-fill-${i}"></div></div>
                         <button class="upgrade-btn" id="upg-${i}" onclick="buyUpgrade(${i})">...</button>`;
        container.appendChild(div);
    });
}

function updateShop() {
    upgrades.forEach((upg, i) => {
        const btn = document.getElementById(`upg-${i}`);
        const fill = document.getElementById(`lvl-fill-${i}`);
        if(!btn) return;
        const lvl = gameData.upgradesOwned[i];
        fill.style.width = (lvl/200)*100 + "%";
        if (i > 0 && gameData.upgradesOwned[i-1] < 5) {
            btn.disabled = true; btn.innerHTML = `🔒 Niv. 5 préc.`; return;
        }
        let cost = 0;
        for(let n=0; n<buyAmount; n++) cost += Math.floor(upg.cost * Math.pow(1.15, lvl+n));
        btn.disabled = gameData.score < cost || lvl >= 200;
        btn.innerHTML = lvl >= 200 ? "MAX" : `<span class="upgrade-info">+${upg.pps || upg.power}</span>${upg.name} (${lvl}/200)<br>${cost.toLocaleString()}`;
    });
}

function buyUpgrade(i) {
    for (let n = 0; n < buyAmount; n++) {
        let cost = Math.floor(upgrades[i].cost * Math.pow(1.15, gameData.upgradesOwned[i]));
        if (gameData.score >= cost && gameData.upgradesOwned[i] < 200) {
            gameData.score -= cost; gameData.upgradesOwned[i]++;
        } else break;
    }
    updateDisplay(); save();
}

document.getElementById('main-clicker').onclick = (e) => {
    gameData.score += (1 + (upgrades[0].power * gameData.upgradesOwned[0])) * getMultiplier();
    gameData.totalClicks++; updateDisplay();
};

setInterval(() => {
    let basePPS = upgrades.reduce((acc, u, i) => acc + (u.pps ? u.pps * gameData.upgradesOwned[i] : 0), 0);
    gameData.score += (basePPS * getMultiplier()) / 10;
    gameData.timePlayed += 0.1;
    updateDisplay();
}, 100);

function updateDisplay() {
    let mult = getMultiplier();
    document.getElementById('score').innerText = Math.floor(gameData.score).toLocaleString();
    document.getElementById('pps').innerText = Math.floor(upgrades.reduce((acc, u, i) => acc + (u.pps ? u.pps * gameData.upgradesOwned[i] : 0), 0) * mult).toLocaleString();
    document.getElementById('global-mult-display').innerText = `x${mult.toFixed(2)}`;
    if (gameData.score > gameData.bestScore) gameData.bestScore = gameData.score;
    checkEvolution(); updateShop();
}

function checkEvolution() {
    let cur = gameData.maxEvoReached;
    if (evolutions[cur+1] && gameData.score >= evolutions[cur+1].threshold) {
        gameData.maxEvoReached++; save();
    }
    document.getElementById('main-clicker').src = evolutions[gameData.maxEvoReached].img;
    let next = evolutions[gameData.maxEvoReached + 1];
    if (next) {
        let p = ((gameData.score - evolutions[gameData.maxEvoReached].threshold) / (next.threshold - evolutions[gameData.maxEvoReached].threshold)) * 100;
        document.getElementById('progress-bar').style.width = Math.max(0, Math.min(100, p)) + "%";
        document.getElementById('next-evolution-text').innerText = `Suivant: ${Math.floor(next.threshold - gameData.score)} pts`;
    }
}

document.getElementById('ascend-icon').onclick = () => {
    document.getElementById('ascend-modal').style.display = 'block';
    const cost = getAscendCost();
    const btn = document.getElementById('do-ascend-btn');
    document.getElementById('next-ascend-bonus').innerText = `+${Math.round(getAscendBonus() * 100)}%`;
    if (gameData.score >= cost) {
        btn.disabled = false;
        document.getElementById('ascend-msg').innerHTML = `<span style="color:#0f0">Prêt ! Coût : ${cost.toLocaleString()}</span>`;
    } else {
        btn.disabled = true;
        document.getElementById('ascend-msg').innerHTML = `<span style="color:#f44">Manque ${(cost - gameData.score).toLocaleString()} pts</span>`;
    }
};

document.getElementById('do-ascend-btn').onclick = () => {
    gameData.ascendLevel++; gameData.score = 0; gameData.upgradesOwned = Array(11).fill(0);
    gameData.maxEvoReached = 0; closeM('ascend-modal'); updateDisplay(); save();
};

function closeM(id) { document.getElementById(id).style.display = 'none'; }
document.getElementById('stats-icon').onclick = () => {
    document.getElementById('stats-modal').style.display = 'block';
    let s = Math.floor(gameData.timePlayed);
    document.getElementById('stat-time').innerText = `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m ${s%60}s`;
    document.getElementById('stat-best').innerText = Math.floor(gameData.bestScore).toLocaleString();
    document.getElementById('stat-clicks').innerText = gameData.totalClicks.toLocaleString();
    document.getElementById('stat-ascend-lvl').innerText = gameData.ascendLevel;
    document.getElementById('stat-bonus').innerText = `x${getMultiplier().toFixed(2)}`;
};

document.getElementById('reset-btn').onclick = () => { if(confirm("Effacer tout ?")) { localStorage.clear(); location.reload(); } };
function save() { localStorage.setItem('BR_V10_Save', JSON.stringify(gameData)); }
function load() { const s = localStorage.getItem('BR_V10_Save'); if (s) gameData = {...gameData, ...JSON.parse(s)}; updateDisplay(); }

initShop(); load(); setInterval(save, 5000);


