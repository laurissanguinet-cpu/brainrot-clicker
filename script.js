// DONNÉES DU JEU
let gameData = {
    score: 0,
    upgradesOwned: Array(11).fill(0),
    totalClicks: 0,
    timePlayed: 0,
    bestScore: 0,
    maxEvoReached: 0,
    ascendLevel: 0 // Nombre de fois que le joueur a fait l'ascendance
};

// CONFIGURATION
const ASCEND_THRESHOLD = 1000000; // 1 million pour ascendance
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

// --- FONCTIONS DE JEU ---

// Clic principal
document.getElementById('main-clicker').onclick = (e) => {
    // Calcul de la puissance du clic (Base + Upgrades) * Multiplicateur Ascendance
    let baseClick = 1 + (upgrades[0].power * gameData.upgradesOwned[0]);
    let multiplier = 1 + (gameData.ascendLevel * 0.5); // +50% par niveau
    let finalClick = baseClick * multiplier;

    gameData.score += finalClick;
    gameData.totalClicks++;

    // Animation Vibration
    const clicker = document.getElementById('main-clicker');
    clicker.classList.remove('shake');
    void clicker.offsetWidth; // Reset CSS
    clicker.classList.add('shake');

    // Texte Flottant
    const txt = document.createElement('div'); 
    txt.className = 'floating-text'; 
    txt.innerText = `+${Math.floor(finalClick)}`;
    txt.style.left = e.clientX + 'px'; 
    txt.style.top = e.clientY + 'px';
    document.body.appendChild(txt); 
    setTimeout(() => txt.remove(), 1000);

    updateDisplay();
};

// Boucle principale (Toutes les 100ms)
setInterval(() => {
    // Calcul PPS (Base + Upgrades) * Multiplicateur Ascendance
    let basePPS = upgrades.reduce((acc, u, i) => acc + (u.pps ? u.pps * gameData.upgradesOwned[i] : 0), 0);
    let multiplier = 1 + (gameData.ascendLevel * 0.5);
    let finalPPS = basePPS * multiplier;

    gameData.score += finalPPS / 10;
    gameData.timePlayed += 0.1;

    updateDisplay();
}, 100);

// Mise à jour de l'affichage
function updateDisplay() {
    let multiplier = 1 + (gameData.ascendLevel * 0.5);
    let basePPS = upgrades.reduce((acc, u, i) => acc + (u.pps ? u.pps * gameData.upgradesOwned[i] : 0), 0);
    
    document.getElementById('score').innerText = Math.floor(gameData.score).toLocaleString();
    document.getElementById('pps').innerText = Math.floor(basePPS * multiplier).toLocaleString();
    document.getElementById('ascend-bonus').innerText = `+${Math.round(gameData.ascendLevel * 50)}%`;
    
    if (gameData.score > gameData.bestScore) gameData.bestScore = gameData.score;
    
    checkEvolution();
    updateShop();
}

// Evolution de l'image
function checkEvolution() {
    let evoIdx = 0;
    for (let i = 0; i < evolutions.length; i++) {
        if (gameData.score >= evolutions[i].threshold) evoIdx = i;
    }

    if (evoIdx > gameData.maxEvoReached) {
        gameData.maxEvoReached = evoIdx;
        save();
    }

    document.getElementById('main-clicker').src = evolutions[evoIdx].img;

    // Barre de progression
    const next = evolutions[evoIdx + 1];
    if (next) {
        let percent = ((gameData.score - evolutions[evoIdx].threshold) / (next.threshold - evolutions[evoIdx].threshold)) * 100;
        document.getElementById('progress-bar').style.width = Math.max(0, Math.min(100, percent)) + "%";
        document.getElementById('next-evolution-text').innerText = `Prochain: ${Math.floor(next.threshold - gameData.score)} pts`;
    } else {
        document.getElementById('progress-bar').style.width = "100%";
        document.getElementById('next-evolution-text').innerText = "Niveau MAX";
    }
}

// --- MAGASIN ---

function initShop() {
    const container = document.getElementById('shop-container');
    upgrades.forEach((u, i) => {
        const div = document.createElement('div');
        div.className = 'upgrade-container';
        div.innerHTML = `
            <div class="lvl-bar-bg"><div class="lvl-bar-fill" id="lvl-fill-${i}"></div></div>
            <button class="upgrade-btn" id="upg-${i}" onclick="buyUpgrade(${i})">Init...</button>
        `;
        container.appendChild(div);
    });
}

function updateShop() {
    upgrades.forEach((upg, i) => {
        const btn = document.getElementById(`upg-${i}`);
        const fill = document.getElementById(`lvl-fill-${i}`);
        const lvl = gameData.upgradesOwned[i];

        if (!btn) return;

        fill.style.width = Math.min(100, (lvl / 200) * 100) + "%";

        // Verrouillage (Niveau 5 du précédent requis)
        let isLocked = i > 0 && gameData.upgradesOwned[i-1] < 5;

        if (isLocked) {
            btn.disabled = true;
            btn.innerHTML = `🔒 Verrouillé<br><small>Niv. 5 précédent requis</small>`;
            return;
        }

        // Calcul du coût
        let cost = 0;
        for (let n = 0; n < buyAmount; n++) {
            cost += Math.floor(upg.cost * Math.pow(1.15, lvl + n));
        }

        // Affichage bouton
        if (lvl >= 200) {
            btn.disabled = true;
            btn.innerHTML = `<strong>${upg.name}</strong><br>MAX`;
        } else {
            let canBuy = Math.floor(gameData.score + 0.1) >= cost;
            btn.disabled = !canBuy;
            let benefit = upg.isClick ? `+${upg.power * buyAmount} Clic` : `+${upg.pps * buyAmount} PPS`;
            
            let html = `<span class="upgrade-info">${benefit}</span><strong>${upg.name}</strong> (x${buyAmount})<br>${cost.toLocaleString()} pts`;
            if (!canBuy) html += `<br><span style="color:#f44; font-size:10px;">Manque ${Math.floor(cost - gameData.score)}</span>`;
            
            btn.innerHTML = html;
        }
    });
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
        } else {
            break;
        }
    }

    if (purchased > 0) {
        btn.classList.remove('buy-animate');
        void btn.offsetWidth; // Reset anim
        btn.classList.add('buy-animate');
        updateDisplay();
        save();
    }
}

function setBuyAmount(n) {
    buyAmount = n;
    document.querySelectorAll('.mode-btn').forEach(b => {
        b.classList.remove('active');
        if (b.innerText === "x" + n) b.classList.add('active');
    });
    updateShop();
}

// --- ASCENDANCE ---

function checkAscendStatus() {
    const btn = document.getElementById('do-ascend-btn');
    const status = document.getElementById('ascend-status');
    
    if (gameData.score >= ASCEND_THRESHOLD) {
        btn.disabled = false;
        status.innerText = "PRÊT ! Bonus: +50% (Permanent)";
        status.style.color = "#0f0";
    } else {
        btn.disabled = true;
        status.innerText = `Manque ${Math.floor(ASCEND_THRESHOLD - gameData.score).toLocaleString()} points`;
        status.style.color = "#f44";
    }
}

document.getElementById('do-ascend-btn').onclick = () => {
    gameData.ascendLevel++;
    // RESET SOFT
    gameData.score = 0;
    gameData.upgradesOwned = Array(11).fill(0);
    // ON GARDE : bestScore, timePlayed, maxEvoReached, ascendLevel
    
    closeM('ascend-modal');
    updateDisplay();
    save();
    alert("Ascendance réussie ! Bonus permanent activé.");
};

// --- MODALS & OUTILS ---

function closeM(id) { document.getElementById(id).style.display = "none"; }

document.getElementById('stats-icon').onclick = () => {
    document.getElementById('stats-modal').style.display = "block";
    document.getElementById('stat-time').innerText = Math.floor(gameData.timePlayed / 60) + " min";
    document.getElementById('stat-clicks').innerText = gameData.totalClicks;
    document.getElementById('stat-ascend-lvl').innerText = gameData.ascendLevel;
};

document.getElementById('ascend-icon').onclick = () => {
    document.getElementById('ascend-modal').style.display = "block";
    checkAscendStatus();
};

document.getElementById('collection-icon').onclick = () => {
    document.getElementById('collection-modal').style.display = "block";
    const grid = document.getElementById('collection-grid');
    grid.innerHTML = "";
    evolutions.forEach((evo, i) => {
        const item = document.createElement('div');
        item.className = 'collection-item';
        
        const img = document.createElement('img');
        img.src = evo.img;
        if (i > gameData.maxEvoReached) img.className = 'locked-img';
        
        const txt = document.createElement('span');
        txt.innerText = (i <= gameData.maxEvoReached) ? evo.name : "???";
        txt.style.fontSize = "10px";
        
        item.appendChild(img);
        item.appendChild(txt);
        grid.appendChild(item);
    });
};

document.getElementById('reset-btn').onclick = () => {
    if (confirm("⚠️ Tout effacer pour toujours ?")) {
        localStorage.clear();
        location.reload();
    }
};

// --- SAUVEGARDE ---
function save() { localStorage.setItem('BrainrotFinalSave', JSON.stringify(gameData)); }
function load() {
    const s = localStorage.getItem('BrainrotFinalSave');
    if (s) {
        let loaded = JSON.parse(s);
        // Fusion pour éviter les crashs si on ajoute des nouvelles variables
        gameData = { ...gameData, ...loaded };
    }
    updateDisplay();
}

// LANCEMENT
initShop();
load();
// Sauvegarde auto toutes les 2s
setInterval(save, 2000);
