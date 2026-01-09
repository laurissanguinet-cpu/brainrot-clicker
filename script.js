let gameData = {
    score: 0, 
    upgradesOwned: Array(11).fill(0),
    totalClicks: 0, 
    bestScore: 0, 
    maxEvoReached: 0,
    ascendLevel: 0 // Chaque niveau ajoute +50% de bonus total
};

const upgrades = [
    { name: "⚡ Clic", cost: 10, power: 1, isClick: true },
    { name: "🚽 Skibidi", cost: 15, pps: 1 }, { name: "🍔 Fanum", cost: 100, pps: 5 },
    { name: "👑 Rizzler", cost: 500, pps: 15 }, { name: "🗿 Sigma", cost: 2000, pps: 45 },
    { name: "🤫 Mewing", cost: 10000, pps: 120 }, { name: "🌽 Ohio", cost: 50000, pps: 300 },
    { name: "🍦 Grimace", cost: 150000, pps: 800 }, { name: "🧬 Looksmax", cost: 500000, pps: 2000 },
    { name: "🍑 Gyatt", cost: 1500000, pps: 5000 }, { name: "👺 God", cost: 10000000, pps: 15000 }
];

let buyAmount = 1;
const ASCEND_REQUIRED = 1000000;

function setBuyAmount(amt) {
    buyAmount = amt;
    document.querySelectorAll('.buy-modes .mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.includes(amt));
    });
    updateShop();
}

function buyUpgrade(i) {
    let purchased = 0;
    const btn = document.getElementById(`upg-${i}`);
    for (let n = 0; n < buyAmount; n++) {
        const cost = Math.floor(upgrades[i].cost * Math.pow(1.15, gameData.upgradesOwned[i]));
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
    let clickPower = (1 + (upgrades[0].power * gameData.upgradesOwned[0])) * (1 + (gameData.ascendLevel * 0.5));
    gameData.score += clickPower;
    gameData.totalClicks++;
    updateDisplay();
};

function updateDisplay() {
    let basePPS = upgrades.reduce((acc, upg, i) => acc + (upg.pps ? upg.pps * gameData.upgradesOwned[i] : 0), 0);
    let totalMultiplier = 1 + (gameData.ascendLevel * 0.5);
    let finalPPS = basePPS * totalMultiplier;

    document.getElementById('score').innerText = Math.floor(gameData.score);
    document.getElementById('pps').innerText = Math.floor(finalPPS);
    document.getElementById('ascend-display').innerText = `x${totalMultiplier.toFixed(1)}`;
    
    if (gameData.score > gameData.bestScore) gameData.bestScore = gameData.score;
    updateShop();
    updateAscendModal();
}

function updateShop() {
    upgrades.forEach((upg, i) => {
        const btn = document.getElementById(`upg-${i}`);
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
            btn.innerHTML = `<span class="upgrade-info">${benefit}</span><strong>${upg.name}</strong> (x${lvl}) - ${cost}`;
        }
    });
}

function updateAscendModal() {
    const btn = document.getElementById('confirm-ascend-btn');
    const info = document.getElementById('ascend-info');
    if (gameData.score >= ASCEND_REQUIRED) {
        btn.disabled = false;
        info.innerText = "Vous pouvez monter en Ascendance ! Bonus actuel : +" + (gameData.ascendLevel * 50) + "%";
    } else {
        btn.disabled = true;
        info.innerText = `Il vous manque ${Math.floor(ASCEND_REQUIRED - gameData.score)} pts pour l'Ascendance.`;
    }
}

document.getElementById('confirm-ascend-btn').onclick = () => {
    gameData.ascendLevel++;
    gameData.score = 0;
    gameData.upgradesOwned = Array(11).fill(0);
    closeM('ascend-modal');
    updateDisplay();
    save();
};

function initShop() {
    const shop = document.getElementById('shop');
    upgrades.forEach((u, i) => {
        const div = document.createElement('div');
        div.className = 'upgrade-container';
        div.innerHTML = `<button class="upgrade-btn" id="upg-${i}" onclick="buyUpgrade(${i})"></button>`;
        shop.appendChild(div);
    });
}

// MODALS
document.getElementById('stats-icon').onclick = () => {
    document.getElementById('stats-modal').style.display = 'block';
    document.getElementById('stat-best-score').innerText = Math.floor(gameData.bestScore);
    document.getElementById('stat-ascend').innerText = gameData.ascendLevel;
};
document.getElementById('ascend-icon').onclick = () => document.getElementById('ascend-modal').style.display = 'block';
document.getElementById('collection-icon').onclick = () => document.getElementById('collection-modal').style.display = 'block';

function closeM(id) { document.getElementById(id).style.display = "none"; }
function save() { localStorage.setItem('brSave_vAsc', JSON.stringify(gameData)); }
function load() { 
    const s = localStorage.getItem('brSave_vAsc'); 
    if (s) { gameData = {...gameData, ...JSON.parse(s)}; updateDisplay(); } 
}

setInterval(() => { 
    let basePPS = upgrades.reduce((acc, upg, i) => acc + (upg.pps ? upg.pps * gameData.upgradesOwned[i] : 0), 0);
    gameData.score += (basePPS * (1 + (gameData.ascendLevel * 0.5))) / 10;
    updateDisplay(); 
}, 100);

document.getElementById('reset-btn').onclick = () => { if(confirm("Reset total ?")) { localStorage.clear(); location.reload(); } };
initShop(); load();
