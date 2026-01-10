import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, where, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- ⚠️ COLLE TA CONFIGURATION FIREBASE ICI (REMPLACE CE BLOC) ⚠️ ---
const firebaseConfig = {
  apiKey: "AIzaSyCNJrTSoi10SfXP2UQkf7eGh4Q6uPgeVDE",
  authDomain: "brainrotclicker-5f6a8.firebaseapp.com",
  projectId: "brainrotclicker-5f6a8",
  storageBucket: "brainrotclicker-5f6a8.firebasestorage.app",
  messagingSenderId: "498729573208",
  appId: "1:498729573208:web:efad8306d196659a86632d"
};

// ------------------------------------------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let gameData = {
    score: 0, upgradesOwned: Array(11).fill(0),
    totalClicks: 0, timePlayed: 0, bestScore: 0,
    maxEvoReached: 0, ascendLevel: 0, goldenClicks: 0,
    playerName: ""
};

const evolutions = [ { threshold: 0, img: "1.png", name: "Recrue" }, { threshold: 100, img: "2.png", name: "Skibidi" }, { threshold: 1000, img: "3.png", name: "Fanum" }, { threshold: 10000, img: "4.png", name: "Rizzler" }, { threshold: 50000, img: "5.png", name: "Sigma" }, { threshold: 250000, img: "6.png", name: "Mewing" }, { threshold: 1000000, img: "7.png", name: "Ohio" }, { threshold: 10000000, img: "8.png", name: "Grimace" }, { threshold: 100000000, img: "9.png", name: "Gyatt" }, { threshold: 1000000000, img: "10.png", name: "God" } ];
const upgrades = [ { name: "⚡ Clic", cost: 10, power: 1, isClick: true }, { name: "🚽 Skibidi", cost: 15, pps: 1 }, { name: "🍔 Fanum", cost: 100, pps: 5 }, { name: "👑 Rizzler", cost: 500, pps: 15 }, { name: "🗿 Sigma", cost: 2000, pps: 45 }, { name: "🤫 Mewing", cost: 10000, pps: 120 }, { name: "🌽 Ohio", cost: 50000, pps: 300 }, { name: "🍦 Grimace", cost: 150000, pps: 800 }, { name: "🧬 Looksmax", cost: 500000, pps: 2000 }, { name: "🍑 Gyatt", cost: 1500000, pps: 5000 }, { name: "👺 God", cost: 10000000, pps: 15000 } ];

let buyAmount = 1;
let goldenMultiplier = 1; 
let clickFrenzyMultiplier = 1;

function formatTime(seconds) {
    if(!seconds) return "0m";
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    if(h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

// --- LOGIQUE FIREBASE ---

window.manualSubmit = function() {
    const nameInput = document.getElementById('player-name-input');
    const pseudo = nameInput.value.trim();
    if(pseudo.length < 3) { alert("Pseudo trop court !"); return; }
    gameData.playerName = pseudo;
    save();
    window.submitScoreToFirebase(true); 
}

window.submitScoreToFirebase = async function(showStatus = false) {
    if (!gameData.playerName) return; 

    const statusMsg = document.getElementById('firebase-status');
    if(showStatus) statusMsg.innerText = "Synchronisation...";

    try {
        const scoresRef = collection(db, "scores");
        const q = query(scoresRef, where("name", "==", gameData.playerName));
        const querySnapshot = await getDocs(q);

        const currentBest = Math.floor(gameData.bestScore);
        
        const payload = {
            score: currentBest,
            ascendLevel: gameData.ascendLevel || 0,
            timePlayed: Math.floor(gameData.timePlayed || 0),
            timestamp: Date.now()
        };

        if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0];
            await updateDoc(docRef.ref, payload);
            if(showStatus) { statusMsg.innerText = "Données mises à jour !"; statusMsg.style.color = "#0f0"; }
        } else {
            await addDoc(scoresRef, { name: gameData.playerName, ...payload });
            if(showStatus) { statusMsg.innerText = "Inscrit au classement !"; statusMsg.style.color = "#0f0"; }
        }
        window.fetchLeaderboard();

    } catch (e) {
        console.error("Erreur Firebase: ", e);
        if(showStatus) { statusMsg.innerText = "Erreur synchro"; statusMsg.style.color = "#f44"; }
    }
}

window.fetchLeaderboard = async function() {
    const listDiv = document.getElementById('leaderboard-list');
    listDiv.innerHTML = "<p style='text-align:center;'>Chargement...</p>";

    try {
        const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(20));
        const querySnapshot = await getDocs(q);

        listDiv.innerHTML = "";
        let rank = 1;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement('div');
            row.className = "leader-row";
            if(data.name === gameData.playerName) row.style.border = "1px solid #0ff";

            const asc = data.ascendLevel !== undefined ? data.ascendLevel : "-";
            const time = data.timePlayed !== undefined ? formatTime(data.timePlayed) : "-";

            row.innerHTML = `
                <div class="leader-rank">#${rank}</div>
                <div class="leader-name">${data.name}</div>
                <div class="leader-score">${data.score.toLocaleString()}</div>
                <div class="leader-ascend">${asc}</div>
                <div class="leader-time">${time}</div>
            `;
            listDiv.appendChild(row);
            rank++;
        });

        if(rank === 1) listDiv.innerHTML = "<p>Aucun score pour l'instant.</p>";

    } catch (e) {
        console.error("Erreur lecture: ", e);
        listDiv.innerHTML = "<p style='color:#f44'>Erreur chargement.</p>";
    }
}

// --- LOGIQUE JEU ---

function getAscendCost() { return 1000000 * Math.pow(5, gameData.ascendLevel); }
function getNextAscendBonus() { return 0.5 + (gameData.ascendLevel * 0.1); }
function getMultiplier() {
    let m = 1;
    for(let i=0; i<gameData.ascendLevel; i++) { m *= (1 + (0.5 + (i * 0.1))); }
    return m * (1 + (gameData.maxEvoReached * 0.1)) * goldenMultiplier;
}

window.setBuyAmount = function(amt) {
    buyAmount = amt;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.innerText === "x"+amt));
    updateShop();
}

function initShop() {
    const container = document.getElementById('shop-items');
    container.innerHTML = "";
    upgrades.forEach((u, i) => {
        const div = document.createElement('div');
        div.className = "upgrade-container";
        div.innerHTML = `<div class="lvl-bar-bg"><div class="lvl-bar-fill" id="lvl-fill-${i}"></div></div>
                         <button class="upgrade-btn" id="upg-${i}" onclick="window.buyUpgrade(${i}, event)">...</button>`;
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
            btn.disabled = true; 
            btn.innerHTML = `<span class="upgrade-name">🔒 ${upg.name}</span><br><span style="color:#666; font-size:11px;">Niv. 5 précédent requis</span>`; 
            return;
        }
        let cost = 0;
        for(let n=0; n<buyAmount; n++) cost += Math.floor(upg.cost * Math.pow(1.15, lvl+n));
        let canBuy = (gameData.score + 0.1) >= cost;
        btn.disabled = !canBuy || lvl >= 200;
        let benefit = (upg.pps || upg.power) * buyAmount;
        let typeText = upg.isClick ? "Clic" : "PPS";
        let html = `<span class="upgrade-name">${upg.name}</span> <span style="font-size:11px; color:#aaa;">(${lvl}/200)</span><br>
                    <span class="upgrade-benefit">+${benefit.toLocaleString()} ${typeText}</span>
                    <div class="upgrade-cost">${cost.toLocaleString()} pts</div>`;
        if (!canBuy && lvl < 200) {
            let missing = Math.floor(cost - gameData.score);
            html += `<span class="missing-cost">Manque ${missing.toLocaleString()}</span>`;
        } else if (lvl >= 200) {
            html = `<span class="upgrade-name">${upg.name}</span> <br><strong style="color:#0f0">MAXIMUM ATTEINT</strong>`;
        }
        btn.innerHTML = html;
    });
}

window.buyUpgrade = function(i, event) {
    let purchased = 0; let totalCost = 0;
    for (let n = 0; n < buyAmount; n++) {
        let cost = Math.floor(upgrades[i].cost * Math.pow(1.15, gameData.upgradesOwned[i]));
        if ((gameData.score + 0.1) >= cost && gameData.upgradesOwned[i] < 200) {
            gameData.score -= cost; gameData.upgradesOwned[i]++;
            purchased++; totalCost += cost;
        } else break;
    }
    if (purchased > 0) {
        createFloatingSpendText(event, totalCost);
        updateDisplay(); save();
    }
}

function createFloatingSpendText(event, amount) {
    const txt = document.createElement('div');
    txt.className = 'spending-text';
    txt.innerText = "-" + amount.toLocaleString();
    let x = event && event.clientX ? event.clientX : window.innerWidth / 2;
    let y = event && event.clientY ? event.clientY : window.innerHeight / 2;
    txt.style.left = x + 'px'; txt.style.top = y + 'px';
    document.body.appendChild(txt);
    setTimeout(() => txt.remove(), 1000);
}

document.getElementById('main-clicker').onclick = (e) => {
    if (navigator.vibrate) navigator.vibrate(20);
    let gain = (1 + (upgrades[0].power * gameData.upgradesOwned[0])) * getMultiplier() * clickFrenzyMultiplier;
    gameData.score += gain; gameData.totalClicks++;
    const img = document.getElementById('main-clicker');
    img.classList.remove('shake'); void img.offsetWidth; img.classList.add('shake');
    const txt = document.createElement('div');
    txt.className = 'floating-text'; txt.innerText = "+" + Math.floor(gain);
    txt.style.left = e.clientX + 'px'; txt.style.top = e.clientY + 'px';
    document.body.appendChild(txt); setTimeout(() => txt.remove(), 1000);
    updateDisplay();
};

function spawnGoldenNugget() {
    const nugget = document.getElementById('golden-nugget');
    const x = Math.random() * (window.innerWidth - 80);
    const y = Math.random() * (window.innerHeight - 80);
    nugget.style.left = x + 'px'; nugget.style.top = y + 'px';
    nugget.style.display = 'block'; nugget.classList.add('nugget-appear');
    setTimeout(() => { if (nugget.style.display === 'block') { nugget.style.display = 'none'; nugget.classList.remove('nugget-appear'); } }, 14000);
    let nextSpawn = Math.random() * 120000 + 60000; 
    setTimeout(spawnGoldenNugget, nextSpawn);
}

document.getElementById('golden-nugget').onclick = () => {
    const nugget = document.getElementById('golden-nugget');
    nugget.style.display = 'none'; nugget.classList.remove('nugget-appear');
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
    let rand = Math.random(); let effectName = ""; let duration = 0;
    if (rand < 0.4) {
        let pps = upgrades.reduce((acc, u, i) => acc + (u.pps ? u.pps * gameData.upgradesOwned[i] : 0), 0);
        let gain = Math.max(1000, pps * 300 * getMultiplier()); 
        gameData.score += gain; effectName = `Jackpot ! +${Math.floor(gain).toLocaleString()}`;
    } else if (rand < 0.7) {
        goldenMultiplier = 7; duration = 30; effectName = "FRENESIE (x7 Global)";
    } else {
        clickFrenzyMultiplier = 777; duration = 10; effectName = "CLIC DIVIN (x777)";
    }
    const statusDiv = document.getElementById('golden-status');
    statusDiv.style.display = 'block'; statusDiv.innerText = effectName;
    setTimeout(() => { statusDiv.style.display = 'none'; }, 3000);
    if (duration > 0) { setTimeout(() => { goldenMultiplier = 1; clickFrenzyMultiplier = 1; updateDisplay(); }, duration * 1000); }
    gameData.goldenClicks = (gameData.goldenClicks || 0) + 1; save(); updateDisplay();
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
    
    // MISE A JOUR DE L'AFFICHAGE HAUT GAUCHE
    document.getElementById('ascend-corner-display').innerText = "ASCENDANCE LVL " + gameData.ascendLevel;

    let totalDisplayMult = mult;
    if (clickFrenzyMultiplier > 1) totalDisplayMult += " (Clic x777!)";
    document.getElementById('global-mult-display').innerText = `x${(typeof totalDisplayMult === 'number' ? totalDisplayMult.toFixed(2) : totalDisplayMult)}`;
    if (gameData.score > gameData.bestScore) gameData.bestScore = gameData.score;
    checkEvolution(); updateShop();
}

function checkEvolution() {
    let cur = gameData.maxEvoReached;
    if (evolutions[cur+1] && gameData.score >= evolutions[cur+1].threshold) {
        gameData.maxEvoReached++; save(); cur = gameData.maxEvoReached;
    }
    document.getElementById('main-clicker').src = evolutions[cur].img;
    let next = evolutions[cur + 1];
    if (next) {
        let p = ((gameData.score - evolutions[cur].threshold) / (next.threshold - evolutions[cur].threshold)) * 100;
        document.getElementById('progress-bar').style.width = Math.max(0, Math.min(100, p)) + "%";
        document.getElementById('next-evolution-text').innerText = `Suivant: ${Math.floor(next.threshold - gameData.score)} pts`;
    } else {
        document.getElementById('progress-bar').style.width = "100%"; document.getElementById('next-evolution-text').innerText = "MAX";
    }
}

window.closeM = function(id) { document.getElementById(id).style.display = 'none'; }

document.getElementById('leaderboard-icon').onclick = () => {
    document.getElementById('leaderboard-modal').style.display = 'block';
    if(gameData.playerName) {
        document.getElementById('player-name-input').value = gameData.playerName;
        window.submitScoreToFirebase(false); 
    } else {
        window.fetchLeaderboard();
    }
};

document.getElementById('stats-icon').onclick = () => {
    document.getElementById('stats-modal').style.display = 'block';
    let s = Math.floor(gameData.timePlayed);
    document.getElementById('stat-time').innerText = `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m ${s%60}s`;
    document.getElementById('stat-best').innerText = Math.floor(gameData.bestScore).toLocaleString();
    document.getElementById('stat-clicks').innerText = gameData.totalClicks.toLocaleString();
    document.getElementById('stat-ascend-lvl').innerText = gameData.ascendLevel;
    document.getElementById('stat-bonus').innerText = `x${getMultiplier().toFixed(2)}`;
    document.getElementById('stat-nuggets').innerText = gameData.goldenClicks || 0;
};
document.getElementById('collection-icon').onclick = () => {
    document.getElementById('collection-modal').style.display = 'block';
    const g = document.getElementById('collection-grid'); g.innerHTML = "";
    evolutions.forEach((evo, i) => {
        const d = document.createElement('div'); d.className = 'collection-item';
        const img = document.createElement('img'); img.src = evo.img;
        if(i > gameData.maxEvoReached) img.className = 'locked-img';
        const t = document.createElement('span'); t.innerText = (i <= gameData.maxEvoReached) ? evo.name : "???";
        t.style.fontFamily = "Titan One"; t.style.fontSize = "12px";
        d.appendChild(img); d.appendChild(t); g.appendChild(d);
    });
};
document.getElementById('ascend-icon').onclick = () => {
    document.getElementById('ascend-modal').style.display = 'block';
    const cost = getAscendCost();
    const btn = document.getElementById('do-ascend-btn');
    document.getElementById('next-ascend-bonus-text').innerText = `+${Math.floor(getNextAscendBonus() * 100)}%`;
    if (gameData.score >= cost) {
        btn.disabled = false; document.getElementById('ascend-msg').innerHTML = "<span style='color:#0f0'>Prêt !</span>";
    } else {
        btn.disabled = true; document.getElementById('ascend-msg').innerHTML = `<span style='color:#f44'>Manque ${Math.floor(cost - gameData.score).toLocaleString()} pts</span>`;
    }
};
document.getElementById('do-ascend-btn').onclick = () => {
    gameData.ascendLevel++; gameData.score = 0; gameData.upgradesOwned = Array(11).fill(0);
    gameData.maxEvoReached = 0; window.closeM('ascend-modal'); updateDisplay(); save();
};
document.getElementById('reset-btn').onclick = () => { if(confirm("Effacer tout ?")) { localStorage.clear(); location.reload(); } };
function save() { localStorage.setItem('BR_ONLINE_FINAL_V4', JSON.stringify(gameData)); }
function load() { const s = localStorage.getItem('BR_ONLINE_FINAL_V4'); if (s) gameData = {...gameData, ...JSON.parse(s)}; updateDisplay(); }

setTimeout(spawnGoldenNugget, 15000);
initShop(); load(); setInterval(save, 5000);






