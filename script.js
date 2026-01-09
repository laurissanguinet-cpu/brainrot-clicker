let gameData = {
    score: 0, totalPPS: 0, clickValue: 1, multiplier: 1,
    upgradesOwned: Array(11).fill(0),
    totalClicks: 0, timePlayed: 0, bestScore: 0
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
    const cost = Math.floor(upgrades[i].cost * Math.pow(1.15, gameData.upgradesOwned[i]));
    if (gameData.score >= cost && gameData.upgradesOwned[i] < 200) {
        gameData.score -= cost; gameData.upgradesOwned[i]++;
        if (upgrades[i].isClick) gameData.clickValue += upgrades[i].power;
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
    for (let i = 0; i < evolutions.length; i++) { if (gameData.score >= evolutions[i].threshold) evoIdx = i; }
    gameData.multiplier = 1 + (evoIdx * 0.1);
    document.getElementById('main-clicker').src = evolutions[evoIdx].img;
    const next = evolutions[evoIdx + 1];
    if (next) {
        const progress = ((gameData.score - evolutions[evoIdx].threshold) / (next.threshold - evolutions[evoIdx].threshold)) * 100;
        document.getElementById('progress-bar').style.width = Math.min(100, progress) + "%";
        document.getElementById('next-evolution-text').innerText = `Suivant: ${Math.floor(next.threshold - gameData.score)} pts`;
    }
}

function updateShop() {
    upgrades.forEach((upg, i) => {
        const lvl = gameData.upgradesOwned[i];
        const cost = Math.floor(upg.cost * Math.pow(1.15, lvl));
        const btn = document.getElementById(`upg-${i}`);
        document.getElementById(`lvl-fill-${i}`).style.width = (lvl / 200) * 100 + "%";

        let isLocked = i > 0 && gameData.upgradesOwned[i-1] < 5;

        if (lvl >= 200) { btn.innerHTML = `<strong>${upg.name}</strong><br>MAX`; btn.disabled = true; }
        else if (isLocked) { btn.innerHTML = `🔒 Verrouillé<br><small>Niv. 5 précédent requis</small>`; btn.disabled = true; btn.classList.add('locked-upgrade'); }
        else {
            btn.classList.remove('locked-upgrade');
            let content = `<strong>${upg.name}</strong> (Niv.${lvl}) - ${cost} pts`;
            if (gameData.score < cost) {
                btn.disabled = true;
                content += `<span class="missing-points">Manque : ${Math.floor(cost - gameData.score)} pts</span>`;
            } else { btn.disabled = false; }
            btn.innerHTML = content;
        }
    });
}

// TOUCHE SECRETE "P"
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p') {
        for (let i = 0; i < upgrades.length; i++) {
            if (gameData.upgradesOwned[i] < 5) {
                const costTo5 = Math.floor(upgrades[i].cost * Math.pow(1.15, 5)) * 10;
                gameData.score += costTo5; // Donne assez de points pour débloquer
                updateDisplay();
                break;
            }
        }
    }
});

function closeM(id) { document.getElementById(id).style.display = "none"; }
document.getElementById('collection-btn').onclick = () => { document.getElementById('collection-modal').style.display = "block"; updateCol(); };
document.getElementById('stats-btn').onclick = () => {
    document.getElementById('stats-modal').style.display = "block";
    document.getElementById('stat-time').innerText = Math.floor(gameData.timePlayed / 60) + "m " + (gameData.timePlayed % 60) + "s";
    document.getElementById('stat-clicks').innerText = gameData.totalClicks;
    document.getElementById('stat-best-score').innerText = Math.floor(gameData.bestScore);
    document.getElementById('stat-upgrades').innerText = gameData.upgradesOwned.reduce((a, b) => a + b, 0) + " / 2200";
};

function updateCol() {
    const g = document.getElementById('collection-grid'); g.innerHTML = "";
    evolutions.forEach((evo, i) => {
        const item = document.createElement('div'); item.className = 'collection-item';
        const img = document.createElement('img'); img.src = evo.img;
        if (gameData.score < evo.threshold && i !== 0) img.className = 'locked-img';
        const name = document.createElement('span'); name.innerText = (gameData.score >= evo.threshold || i === 0) ? evo.name : "???";
        item.appendChild(img); item.appendChild(name); g.appendChild(item);
    });
}

function save() { localStorage.setItem('brFinalSave', JSON.stringify(gameData)); }
function load() { const s = localStorage.getItem('brFinalSave'); if (s) { gameData = {...gameData, ...JSON.parse(s)}; updatePPS(); updateDisplay(); } }

setInterval(() => { gameData.score += gameData.totalPPS / 10; gameData.timePlayed++; updateDisplay(); }, 100);
document.getElementById('reset-btn').onclick = () => { if(confirm("Reset ?")) { localStorage.clear(); location.reload(); } };
initShop(); load();