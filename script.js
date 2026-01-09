let gameData = {
    score: 0, upgradesOwned: Array(11).fill(0),
    totalClicks: 0, timePlayed: 0, bestScore: 0,
    maxEvoReached: 0, ascendLevel: 0
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
const ASCEND_REQ = 1000000;

function setBuyAmount(amt) {
    buyAmount = amt;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.innerText.includes(amt)));
    updateShop();
}

function buyUpgrade(i) {
    let purchased = 0;
    const btn = document.getElementById(`upg-${i}`);
    for (let n = 0; n < buyAmount; n++) {
        let cost = Math.floor(upgrades[i].cost * Math.pow(1.15, gameData.upgradesOwned[i]));
        if (Math.floor(gameData.score + 0.1) >= cost && gameData.upgradesOwned[i] < 200) {
            gameData.score -= cost;
            gameData.upgradesOwned[i]++;
            purchased++;
        } else break;
    }
    if (purchased > 0) {
        btn.classList.add('buy-animate');
        setTimeout(() => btn.classList.remove('buy-animate'), 200);
        updateDisplay(); save();
    }
}

document.getElementById('main-clicker').onclick = () => {
    let mult = 1 + (gameData.ascendLevel * 0.5);
    let power = (1 + (upgrades[0].power * gameData.upgradesOwned[0])) * mult;
    gameData.score += power;
    gameData.totalClicks++;
    
    const clicker = document.getElementById('main-clicker');
    clicker.classList.remove('shake');
    void clicker.offsetWidth;
    clicker.classList.add('shake');
    updateDisplay();
};

function updateDisplay() {
    let mult = 1 + (gameData.ascendLevel * 0.5);
    let basePPS = upgrades.reduce((acc, u, i) => acc + (u.pps ? u.pps * gameData.upgradesOwned[i] : 0), 0);
    let finalPPS = basePPS * mult;

    document.getElementById('score').innerText = Math.floor(gameData.score);
    document.getElementById('pps').innerText = Math.floor(finalPPS);
    document.getElementById('ascend-display').innerText = `x${mult.toFixed(1)}`;
    
    if (gameData.score > gameData.bestScore) gameData.bestScore = gameData.score;
    checkEvolution();
    updateShop();
}

function updateShop() {
    upgrades.forEach((upg, i) => {
        const btn = document.getElementById(`upg-${i}`);
        if(!btn) return;
        const lvl = gameData.upgradesOwned[i];
        let isLocked = i > 0 && gameData.upgradesOwned[i-1] < 5;
        let cost = 0;
        for(let n=0; n<buyAmount; n++) cost += Math.floor(upg.cost * Math.pow(1.15, lvl + n));

        if (isLocked) {
            btn.disabled = true;
            btn.innerHTML = `🔒 Niv. 5 préc. requis`;
        } else {
            btn.disabled = Math.floor(gameData.score + 0.1) < cost;
            let benefit = upg.isClick ? `+${upg.power * buyAmount} Clic` : `+${upg.pps * buyAmount} PPS`;
            btn.innerHTML = `<span class="upgrade-info">${benefit}</span><strong>${upg.name}</strong> (x${lvl}) - ${cost} pts`;
        }
    });
}

function checkEvolution() {
    let evoIdx = 0;
    for (let i = 0; i < evolutions.length; i++) if (gameData.score >= evolutions[i].threshold) evoIdx = i;
    document.getElementById('main-clicker').src = evolutions[evoIdx].img;
    if (evoIdx > gameData.maxEvoReached) { gameData.maxEvoReached = evoIdx; save(); }
    
    const next = evolutions[evoIdx + 1];
    if (next) {
        let prog = ((gameData.score - evolutions[evoIdx].threshold) / (next.threshold - evolutions[evoIdx].threshold)) * 100;
        document.getElementById('progress-bar').style.width = Math.min(100, prog) + "%";
        document.getElementById('next-evolution-text').innerText = `Suivant: ${Math.floor(next.threshold - gameData.score)} pts`;
    }
}

// ASCENDANCE
document.getElementById('confirm-ascend-btn').onclick = () => {
    gameData.ascendLevel++;
    gameData.score = 0;
    gameData.upgradesOwned = Array(11).fill(0);
    closeM('ascend-modal');
    updateDisplay();
    save();
};

function updateAscendStatus() {
    const btn = document.getElementById('confirm-ascend-btn');
    const info = document.getElementById('ascend-info');
    if (gameData.score >= ASCEND_REQ) {
        btn.disabled = false;
        info.innerText = "PRÊT ! Recommencez avec un bonus permanent de +50% !";
    } else {
        btn.disabled = true;
        info.innerText = `Besoin de ${Math.floor(ASCEND_REQ - gameData.score)} pts pour l'ascendance.`;
    }
}

// MODALS
document.getElementById('stats-icon').onclick = () => {
    document.getElementById('stats-modal').style.display = 'block';
    document.getElementById('stat-best').innerText = Math.floor(gameData.bestScore);
    document.getElementById('stat-asc-lvl').innerText = gameData.ascendLevel;
    document.getElementById('stat-time').innerText = Math.floor(gameData.timePlayed / 60) + "m";
};
document.getElementById('ascend-icon').onclick = () => {
    document.getElementById('ascend-modal').style.display = 'block';
    updateAscendStatus();
};
document.getElementById('collection-icon').onclick = () => {
    document.getElementById('collection-modal').style.display = 'block';
    const g = document.getElementById('collection-grid'); g.innerHTML = "";
    evolutions.forEach((evo, i) => {
        const item = document.createElement('div'); item.className = 'collection-item';
        const img = document.createElement('img'); img.src = evo.img;
        if (i > gameData.maxEvoReached) img.className = 'locked-img';
        item.appendChild(img); g.appendChild(item);
    });
};

function closeM(id) { document.getElementById(id).style.display = "none"; }
function save() { localStorage.setItem('brSave_final', JSON.stringify(gameData)); }
function load() { 
    const s = localStorage.getItem('brSave_final'); 
    if (s) { gameData = {...gameData, ...JSON.parse(s)}; updateDisplay(); } 
}

function initShop() {
    const container = document.getElementById('shop-items');
    upgrades.forEach((u, i) => {
        const btn = document.createElement('button');
        btn.className = 'upgrade-btn';
        btn.id = `upg-${i}`;
        btn.onclick = () => buyUpgrade(i);
        container.appendChild(btn);
    });
}

setInterval(() => { 
    let mult = 1 + (gameData.ascendLevel * 0.5);
    let basePPS = upgrades.reduce((acc, u, i) => acc + (u.pps ? u.pps * gameData.upgradesOwned[i] : 0), 0);
    gameData.score += (basePPS * mult) / 10;
    gameData.timePlayed += 0.1;
    updateDisplay(); 
}, 100);

document.getElementById('reset-btn').onclick = () => { if(confirm("VRAIMENT réinitialiser TOUT ?")) { localStorage.clear(); location.reload(); } };

initShop(); load();
