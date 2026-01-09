let gameData = {
    score: 0, totalPPS: 0, clickValue: 1, multiplier: 1,
    upgradesOwned: Array(11).fill(0),
    totalClicks: 0, timePlayed: 0, bestScore: 0,
    maxEvoReached: 0
};

const evolutions = [
    { threshold: 0, img: "1.png", name: "Recrue" }, { threshold: 100, img: "2.png", name: "Skibidi" },
    { threshold: 1000, img: "3.png", name: "Fanum" }, { threshold: 10000, img: "4.png", name: "Rizzler" },
    { threshold: 50000, img: "5.png", name: "Sigma" }, { threshold: 250000, img: "6.png", name: "Mewing" },
    { threshold: 1000000, img: "7.png", name: "Ohio" }, { threshold: 10000000, img: "8.png", name: "Grimace" },
    { threshold: 100000000, img: "9.png", name: "Gyatt" }, { threshold: 1000000000, img: "10.png", name: "God" }
];

const upgrades = [
    { name: "⚡ Clic", cost: 10, power: 1, isClick: true },
    { name: "🚽 Skibidi", cost: 15, pps: 1 }, { name: "🍔 Fanum", cost: 100, pps: 5 },
    { name: "👑 Rizzler", cost: 500, pps: 15 }, { name: "🗿 Sigma", cost: 2000, pps: 45 },
    { name: "🤫 Mewing", cost: 10000, pps: 120 }, { name: "🌽 Ohio", cost: 50000, pps: 300 },
    { name: "🍦 Grimace", cost: 150000, pps: 800 }, { name: "🧬 Looksmax", cost: 500000, pps: 2000 },
    { name: "🍑 Gyatt", cost: 1500000, pps: 5000 }, { name: "👺 God", cost: 10000000, pps: 15000 }
];

let buyAmount = 1;

function setBuyAmount(amt) {
    buyAmount = amt;
    document.querySelectorAll('.buy-modes .mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if(parseInt(btn.innerText.replace('x','')) === amt) btn.classList.add('active');
    });
    updateShop();
}

function initShop() {
    const shop = document.getElementById('shop');
    upgrades.forEach((upg, i) => {
        const div = document.createElement('div'); div.className = 'upgrade-container';
        div.innerHTML = `<div class="lvl-bar-bg"><div class="lvl-bar-fill" id="lvl-fill-${i}"></div></div>
                         <button class="upgrade-btn" id="upg-${i}" onclick="buyUpgrade(${i})"></button>`;
        shop.appendChild(div);
    });
}

function buyUpgrade(i) {
    let purchased = 0;
    const btn = document.getElementById(`upg-${i}`);
    for (let n = 0; n < buyAmount; n++) {
        const lvl = gameData.upgradesOwned[i];
        const cost = Math.floor(upgrades[i].cost * Math.pow(1.15, lvl));
        if (gameData.score >= cost && lvl < 200) {
            gameData.score -= cost; gameData.upgradesOwned[i]++; purchased++;
            if (upgrades[i].isClick) gameData.clickValue += upgrades[i].power;
        } else { break; }
    }
    if (purchased > 0) { 
        // ANIMATION FLASH ACHAT
        btn.classList.remove('buy-animate');
        void btn.offsetWidth;
        btn.classList.add('buy-animate');
        updatePPS(); save(); updateDisplay(); 
    }
}

function updatePPS() {
    let base = upgrades.reduce((s, u, i) => s + (u.pps ? u.pps * gameData.upgradesOwned[i] : 0), 0);
    gameData.totalPPS = base * gameData.multiplier;
    document.getElementById('pps').innerText = Math.floor(gameData.totalPPS);
}

document.getElementById('main-clicker').onclick = (e) => {
    gameData.score += gameData.clickValue; gameData.totalClicks++;
    if (gameData.score > gameData.bestScore) gameData.bestScore = gameData.score;
    
    // VIBRATION
    const clicker = document.getElementById('main-clicker');
    clicker.classList.remove('shake');
    void clicker.offsetWidth;
    clicker.classList.add('shake');

    const txt = document.createElement('div'); txt.className = 'floating-text'; txt.innerText = `+${gameData.clickValue}`;
    txt.style.left = e.clientX + 'px'; txt.style.top = e.clientY + 'px';
    document.body.appendChild(txt); setTimeout(() => txt.remove(), 1000);
    updateDisplay();
};

function updateDisplay() {
    document.getElementById('score').innerText = Math.floor(gameData.score);
    document.getElementById('multiplier-display').innerText = `x${gameData.multiplier.toFixed(1)}`;
    checkEvolution(); updateShop();
}

function checkEvolution() {
    let evoIdx = 0;
    for (let i = 0; i < evolutions.length; i++) { 
        if (gameData.score >= evolutions[i].threshold) evoIdx = i; 
    }
    if (evoIdx > gameData.maxEvoReached) { gameData.maxEvoReached = evoIdx; save(); }
    gameData.multiplier = 1 + (evoIdx * 0.1);
    document.getElementById('main-clicker').src = evolutions[evoIdx].img;
    const next = evolutions[evoIdx + 1];
    if (next) {
        const prog = ((gameData.score - evolutions[evoIdx].threshold) / (next.threshold - evolutions[evoIdx].threshold)) * 100;
        document.getElementById('progress-bar').style.width = Math.min(100, prog) + "%";
        document.getElementById('next-evolution-text').innerText = `Suivant: ${Math.floor(next.threshold - gameData.score)} pts`;
    }
}

function updateShop() {
    upgrades.forEach((upg, i) => {
        const lvl = gameData.upgradesOwned[i];
        const btn = document.getElementById(`upg-${i}`);
        document.getElementById(`lvl-fill-${i}`).style.width = (lvl / 200) * 100 + "%";
        let isLocked = i > 0 && gameData.upgradesOwned[i-1] < 5;
        let totalCost = 0; let purchasable = 0;
        if (!isLocked) {
            for(let n=0; n < buyAmount; n++) {
                if (lvl + n < 200) { totalCost += Math.floor(upg.cost * Math.pow(1.15, lvl + n)); purchasable++; }
                else break;
            }
        }
        if (lvl >= 200) { btn.innerHTML = `<strong>${upg.name}</strong><br>MAX`; btn.disabled = true; }
        else if (isLocked) { btn.innerHTML = `🔒 Verrouillé<br><small>Niv. 5 précédent requis</small>`; btn.disabled = true; }
        else {
            let benefit = upg.isClick ? `+${upg.power * purchasable} au Clic` : `+${upg.pps * purchasable} PPS`;
            let content = `<span class="upgrade-info">${benefit}</span><strong>${upg.name}</strong> (x${purchasable}) - ${totalCost} pts`;
            btn.disabled = gameData.score < totalCost;
            if (gameData.score < totalCost) content += `<span class="missing-points">Manque : ${Math.floor(totalCost - gameData.score)} pts</span>`;
            btn.innerHTML = content;
        }
    });
}

// TOUCHE P
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p') {
        for (let i = 0; i < upgrades.length; i++) {
            if (gameData.upgradesOwned[i] < 5) {
                let needed = 0;
                for (let k = gameData.upgradesOwned[i]; k < 5; k++) needed += Math.floor(upgrades[i].cost * Math.pow(1.15, k));
                gameData.score += needed; gameData.upgradesOwned[i] = 5;
                updatePPS(); save(); updateDisplay(); break;
            }
        }
    }
});

function closeM(id) { document.getElementById(id).style.display = "none"; }
document.getElementById('stats-icon').onclick = () => {
    document.getElementById('stats-modal').style.display = "block";
    let h = Math.floor(gameData.timePlayed / 3600);
    let m = Math.floor((gameData.timePlayed % 3600) / 60);
    let s = gameData.timePlayed % 60;
    document.getElementById('stat-time').innerText = `${h}h ${m}m ${s}s`;
    document.getElementById('stat-clicks').innerText = gameData.totalClicks;
    document.getElementById('stat-best-score').innerText = Math.floor(gameData.bestScore);
    document.getElementById('stat-upgrades').innerText = gameData.upgradesOwned.reduce((a, b) => a + b, 0) + " / 2200";
};

document.getElementById('collection-icon').onclick = () => { document.getElementById('collection-modal').style.display = "block"; updateCol(); };

function updateCol() {
    const g = document.getElementById('collection-grid'); g.innerHTML = "";
    evolutions.forEach((evo, i) => {
        const item = document.createElement('div'); item.className = 'collection-item';
        const img = document.createElement('img'); img.src = evo.img; img.draggable = false;
        if (i > gameData.maxEvoReached) img.className = 'locked-img';
        const name = document.createElement('span'); name.innerText = (i <= gameData.maxEvoReached) ? evo.name : "???";
        item.appendChild(img); item.appendChild(name); g.appendChild(item);
    });
}

function save() { localStorage.setItem('brFinalSave_v3', JSON.stringify(gameData)); }
function load() { 
    const s = localStorage.getItem('brFinalSave_v3'); 
    if (s) { gameData = {...gameData, ...JSON.parse(s)}; updatePPS(); updateDisplay(); } 
}

setInterval(() => { gameData.score += gameData.totalPPS / 10; updateDisplay(); }, 100);
setInterval(() => { gameData.timePlayed++; save(); }, 1000);

document.getElementById('reset-btn').onclick = () => { if(confirm("Réinitialiser ?")) { localStorage.clear(); location.reload(); } };
initShop(); load();
