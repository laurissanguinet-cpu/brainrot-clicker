import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// --- ⚠️ COLLE TA CONFIG ICI ⚠️ ---
const firebaseConfig = {
  apiKey: "AIzaSyCNJrTSoi10SfXP2UQkf7eGh4Q6uPgeVDE",
  authDomain: "brainrotclicker-5f6a8.firebaseapp.com",
  projectId: "brainrotclicker-5f6a8",
  storageBucket: "brainrotclicker-5f6a8.firebasestorage.app",
  messagingSenderId: "498729573208",
  appId: "1:498729573208:web:efad8306d196659a86632d"
};
// --------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- DONNÉES DU JEU ---
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
    { threshold: 1000000000, img: "10.png", name: "God" },
    { threshold: 5000000000, img: "11.png", name: "GigaChad" },
    { threshold: 25000000000, img: "12.png", name: "CaseOh" },
    { threshold: 100000000000, img: "13.png", name: "Backrooms" },
    { threshold: 500000000000, img: "14.png", name: "NPC" },
    { threshold: 2000000000000, img: "15.png", name: "Mogger" },
    { threshold: 10000000000000, img: "16.png", name: "Brainrot King" },
    { threshold: 100000000000000, img: "17.png", name: "Lobotomy" },
    { threshold: 1000000000000000, img: "18.png", name: "ASCENDED" }
];

const achievementsList = [
    { id: 'click_1', name: "Premier Pas", desc: "Cliquer 1 fois", cond: d => d.totalClicks >= 1 },
    { id: 'click_1k', name: "Échauffement", desc: "Cliquer 1 000 fois", cond: d => d.totalClicks >= 1000 },
    { id: 'click_100k', name: "Acharné", desc: "Cliquer 100 000 fois", cond: d => d.totalClicks >= 100000 },
    { id: 'click_1m', name: "Doigt Divin", desc: "Cliquer 1 Million de fois", cond: d => d.totalClicks >= 1000000 },
    
    { id: 'score_1m', name: "Millionnaire", desc: "Atteindre 1 Million", cond: d => d.bestScore >= 1e6 },
    { id: 'score_1b', name: "Milliardaire", desc: "Atteindre 1 Milliard", cond: d => d.bestScore >= 1e9 },
    { id: 'score_1t', name: "Trillionnaire", desc: "Atteindre 1 Trillion", cond: d => d.bestScore >= 1e12 },
    { id: 'score_1q', name: "Quadrillionnaire", desc: "Atteindre 1 Quadrillion", cond: d => d.bestScore >= 1e15 },
    { id: 'score_1sx', name: "Sextillionnaire", desc: "Atteindre 1 Sextillion", cond: d => d.bestScore >= 1e21 },
    
    { id: 'asc_1', name: "Éveil", desc: "Faire 1 Ascension", cond: d => d.ascendLevel >= 1 },
    { id: 'asc_10', name: "Transcendance", desc: "Faire 10 Ascensions", cond: d => d.ascendLevel >= 10 },
    { id: 'asc_50', name: "Être Suprême", desc: "Faire 50 Ascensions", cond: d => d.ascendLevel >= 50 },
    
    { id: 'nugget_1', name: "Chercheur d'Or", desc: "Trouver 1 pépite", cond: d => d.goldenClicks >= 1 },
    { id: 'nugget_50', name: "Ruée vers l'Or", desc: "Trouver 50 pépites", cond: d => d.goldenClicks >= 50 },
    
    { id: 'gamble_1', name: "Parieur", desc: "Jouer au Casino 1 fois", cond: d => d.totalGambles >= 1 },
    { id: 'gamble_win_10', name: "Expert du Pari", desc: "Gagner 10 paris", cond: d => d.gambleWins >= 10 },
    { id: 'gamble_win_50', name: "Roi du Casino", desc: "Gagner 50 paris", cond: d => d.gambleWins >= 50 },
    
    { id: 'time_1h', name: "Débutant", desc: "Jouer 1 heure", cond: d => d.timePlayed >= 3600 },
    { id: 'time_24h', name: "No Life", desc: "Jouer 24 heures", cond: d => d.timePlayed >= 86400 },
    
    { id: 'upg_all', name: "Collectionneur", desc: "Acheter 2000 améliorations", cond: d => d.upgradesOwned.reduce((a,b)=>a+b,0) >= 2000 }
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
    { name: "👺 God", cost: 10000000, pps: 15000 },
    { name: "🏋️ Jawline", cost: 50000000, pps: 45000 },
    { name: "🥞 Waffle House", cost: 250000000, pps: 120000 },
    { name: "🎮 Discord Mod", cost: 1000000000, pps: 350000 },
    { name: "🏃 Subway Surf", cost: 5000000000, pps: 1000000 },
    { name: "📺 Family Guy", cost: 25000000000, pps: 4000000 },
    { name: "🧠 Lobotomy", cost: 150000000000, pps: 15000000 },
    { name: "🎬 Absolute Cinema", cost: 1000000000000, pps: 50000000 }
];

let gameData = {
    score: 0, upgradesOwned: Array(upgrades.length).fill(0),
    totalClicks: 0, timePlayed: 0, bestScore: 0,
    maxEvoReached: 0, ascendLevel: 0, goldenClicks: 0,
    totalGambles: 0, bestGambleWin: 0, gambleWins: 0, 
    playerName: "Invité", timestamp: 0, achievements: [] 
};

let currentUser = null;
let goldenMultiplier = 1; 
let clickFrenzyMultiplier = 1;
let buyAmount = 1;
let isNuggetActive = false;

// --- FONCTIONS ---
function formatNumber(num) {
    if (!num) return "0";
    if (num >= 1e12) return Number(num).toExponential(2).replace("+", "");
    return Math.floor(num).toLocaleString();
}
function formatTime(s) {
    if (!s) return "0s";
    let h = Math.floor(s / 3600); let m = Math.floor((s % 3600) / 60); let sec = Math.floor(s % 60);
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
}

// --- AUTH ---
window.loginGoogle = async function() { try { await signInWithPopup(auth, provider); } catch (e) { alert(e.message); } };
window.logoutGoogle = async function() { try { await signOut(auth); location.reload(); } catch (e) { console.error(e); } };

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('logged-out-view').style.display = 'none';
        document.getElementById('logged-in-view').style.display = 'flex';
        document.getElementById('user-avatar').src = user.photoURL;
        document.getElementById('user-name').innerText = user.displayName;
        await loadCloudSave();
    } else {
        currentUser = null;
        document.getElementById('logged-out-view').style.display = 'block';
        document.getElementById('logged-in-view').style.display = 'none';
        loadLocalSave();
    }
});

// --- SAVE SYSTEM ---
async function save() {
    gameData.timestamp = Date.now();
    localStorage.setItem('BR_V44_WHEEL_FIX', JSON.stringify(gameData));
    
    if (currentUser) {
        try {
            await setDoc(doc(db, "users", currentUser.uid), {
                ...gameData,
                playerName: currentUser.displayName,
                photoURL: currentUser.photoURL
            });
            const s = document.getElementById('save-status');
            if(s) { s.innerText = "Sauvegardé"; s.style.color = "#0f0"; setTimeout(() => { s.innerText = "Synchro..."; s.style.color = "#aaa"; }, 2000); }
        } catch (e) { console.error(e); }
    }
}

function sanitizeSave(data) {
    if (data.upgradesOwned.length < upgrades.length) {
        for(let i=0; i < upgrades.length - data.upgradesOwned.length; i++) data.upgradesOwned.push(0);
    }
    if (!data.achievements) data.achievements = [];
    if (!data.totalGambles) data.totalGambles = 0;
    if (!data.gambleWins) data.gambleWins = 0;
    if (!data.goldenClicks) data.goldenClicks = 0;
    return data;
}

async function loadCloudSave() {
    if (!currentUser) return;
    try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) {
            const cloudData = snap.data();
            if (cloudData.timestamp > (gameData.timestamp || 0)) {
                gameData = sanitizeSave({ ...gameData, ...cloudData });
                updateDisplay();
            } else { save(); }
        } else { save(); }
    } catch (e) { console.error(e); }
}

function loadLocalSave() {
    const s = localStorage.getItem('BR_V44_WHEEL_FIX');
    if (s) { gameData = sanitizeSave({ ...gameData, ...JSON.parse(s) }); updateDisplay(); }
}

// --- LOGIQUE JEU ---
function getAscendCost() {
    if (gameData.ascendLevel >= 4) {
        return 1000000 * Math.pow(6, 4) * Math.pow(15, gameData.ascendLevel - 4);
    }
    return 1000000 * Math.pow(6, gameData.ascendLevel);
}

function getNextAscendBonus() { return 0.5 + (gameData.ascendLevel * 0.15); }

function getMultiplier() {
    let m = 1; for(let i=0; i<gameData.ascendLevel; i++) m *= (1 + (0.5 + (i * 0.15)));
    let achieveBonus = 1 + (gameData.achievements.length * 0.02);
    return m * (1 + (gameData.maxEvoReached * 0.15)) * goldenMultiplier * achieveBonus;
}

window.setBuyAmount = function(amt) { buyAmount = amt; document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.innerText === "x"+amt)); updateShop(); }

function initShop() {
    const c = document.getElementById('shop-items'); c.innerHTML = "";
    upgrades.forEach((u, i) => {
        const d = document.createElement('div'); d.className = "upgrade-container";
        d.innerHTML = `<div class="lvl-bar-bg"><div class="lvl-bar-fill" id="lvl-fill-${i}"></div></div><button class="upgrade-btn" id="upg-${i}" onclick="window.buyUpgrade(${i}, event)">...</button>`;
        c.appendChild(d);
    });
}

function updateShop() {
    upgrades.forEach((upg, i) => {
        const btn = document.getElementById(`upg-${i}`); const fill = document.getElementById(`lvl-fill-${i}`);
        if(!btn) return;
        if (gameData.upgradesOwned[i] === undefined) gameData.upgradesOwned[i] = 0;
        const lvl = gameData.upgradesOwned[i]; fill.style.width = (lvl/200)*100 + "%";
        if (i > 0 && gameData.upgradesOwned[i-1] < 5) { btn.disabled = true; btn.innerHTML = `<span class="upgrade-name">🔒 ${upg.name}</span><br><span style="color:#666; font-size:11px;">Niv. 5 précédent requis</span>`; return; }
        
        let cost = 0; for(let n=0; n<buyAmount; n++) cost += Math.floor(upg.cost * Math.pow(1.18, lvl+n));
        let canBuy = (gameData.score + 0.1) >= cost; btn.disabled = !canBuy || lvl >= 200;
        let benefit = (upg.pps || upg.power) * buyAmount; let typeText = upg.isClick ? "Clic" : "PPS";
        let html = `<span class="upgrade-name">${upg.name}</span> <span style="font-size:11px; color:#aaa;">(${lvl}/200)</span><br><span class="upgrade-benefit">+${formatNumber(benefit)} ${typeText}</span><div class="upgrade-cost">${formatNumber(cost)} pts</div>`;
        if (!canBuy && lvl < 200) html += `<span class="missing-cost">Manque ${formatNumber(cost - gameData.score)}</span>`;
        else if (lvl >= 200) html = `<span class="upgrade-name">${upg.name}</span> <br><strong style="color:#0f0">MAXIMUM ATTEINT</strong>`;
        btn.innerHTML = html;
    });
}

window.buyUpgrade = function(i, event) {
    let purchased = 0; let totalCost = 0;
    for (let n = 0; n < buyAmount; n++) {
        let cost = Math.floor(upgrades[i].cost * Math.pow(1.18, gameData.upgradesOwned[i]));
        if ((gameData.score + 0.1) >= cost && gameData.upgradesOwned[i] < 200) { gameData.score -= cost; gameData.upgradesOwned[i]++; purchased++; totalCost += cost; } else break;
    }
    if (purchased > 0) { createFloatingSpendText(event, totalCost); updateDisplay(); save(); }
}

// --- SUCCÈS ---
function checkAchievements() {
    let newUnlock = false;
    achievementsList.forEach(ach => {
        if (!gameData.achievements.includes(ach.id)) {
            if (ach.cond(gameData)) {
                gameData.achievements.push(ach.id);
                showAchievementPopup(ach.name);
                newUnlock = true;
            }
        }
    });
    if (newUnlock) { updateDisplay(); save(); }
}
function showAchievementPopup(name) {
    const p = document.getElementById('achievement-notify');
    p.innerText = "🏆 Succès : " + name; p.classList.add('show');
    setTimeout(() => p.classList.remove('show'), 3000);
}
window.openAchievements = function() {
    document.getElementById('achieve-modal').style.display = 'block';
    const list = document.getElementById('achieve-list'); list.innerHTML = "";
    achievementsList.forEach(ach => {
        const unlocked = gameData.achievements.includes(ach.id);
        const div = document.createElement('div');
        div.className = `achieve-item ${unlocked ? 'achieve-unlocked' : ''}`;
        div.innerHTML = `<div class="achieve-icon">${unlocked ? '🏆' : '🔒'}</div><div class="achieve-info"><h4>${ach.name}</h4><p>${ach.desc}</p></div>`;
        list.appendChild(div);
    });
    document.getElementById('achieve-total-bonus').innerText = "x" + (1 + (gameData.achievements.length * 0.02)).toFixed(2);
}

// --- CASINO (ROUE CORRIGÉE) ---
window.openGamble = function() {
    document.getElementById('gamble-modal').style.display = 'block';
    document.getElementById('gamble-result').innerText = "Faites vos jeux !";
    document.getElementById('gamble-result').style.color = "#fff";
    
    // RESET VISUEL DE LA ROUE A L'OUVERTURE
    const wheel = document.getElementById('wheel');
    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';
    wheel.offsetHeight; // Force reflow
    wheelRotation = 0;
}

let wheelRotation = 0;

window.spinWheel = function(percent) {
    let bet = Math.floor(gameData.score * percent);
    if (bet < 10) { document.getElementById('gamble-result').innerText = "Pas assez de points !"; return; }
    
    document.querySelectorAll('.gamble-btn').forEach(b => b.disabled = true);
    document.getElementById('gamble-result').innerText = "La roue tourne...";
    
    gameData.score -= bet;
    updateDisplay();

    // DÉCISION DU RÉSULTAT
    let win = Math.random() < 0.5;
    
    // RESET POSITION SANS ANIMATION
    const wheel = document.getElementById('wheel');
    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';
    wheel.offsetHeight; // Force reflow (Tricky CSS trick)

    // CALCUL DE L'ANGLE
    // Vert (Win) est visuellement à droite (0-180deg si on considère le haut comme 0)
    // Mais CSS rotate tourne dans le sens horaire.
    // - Pour tomber sur VERT (Win), il faut tourner de X tours + s'arrêter quand le Vert est en haut.
    // - Pour tomber sur ROUGE (Lose), il faut s'arrêter quand le Rouge est en haut.
    
    let baseSpins = 1440; // 4 tours complets
    
    // Si Win : On vise entre 10 et 170 degrés (Zone Verte)
    // Si Lose : On vise entre 190 et 350 degrés (Zone Rouge)
    let targetAngle = win ? (Math.random() * 160 + 10) : (Math.random() * 160 + 190);
    
    // On applique la rotation négative pour tourner dans le sens horaire
    let finalRot = baseSpins + targetAngle;
    
    wheel.style.transition = 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)';
    wheel.style.transform = `rotate(-${finalRot}deg)`;

    setTimeout(() => {
        if (win) {
            let gain = bet * 2;
            gameData.score += gain;
            gameData.totalGambles = (gameData.totalGambles || 0) + 1;
            gameData.gambleWins = (gameData.gambleWins || 0) + 1;
            if(gain > (gameData.bestGambleWin || 0)) gameData.bestGambleWin = gain;
            document.getElementById('gamble-result').innerText = "GAGNÉ ! +" + formatNumber(gain);
            document.getElementById('gamble-result').style.color = "#0f0";
        } else {
            gameData.totalGambles = (gameData.totalGambles || 0) + 1;
            document.getElementById('gamble-result').innerText = "PERDU...";
            document.getElementById('gamble-result').style.color = "#f00";
        }
        document.querySelectorAll('.gamble-btn').forEach(b => b.disabled = false);
        updateDisplay();
        checkAchievements();
        save();
    }, 4000);
}

// --- EVENTS ---
document.getElementById('main-clicker').onclick = (e) => {
    if (navigator.vibrate) navigator.vibrate(20);
    let gain = (1 + (upgrades[0].power * gameData.upgradesOwned[0])) * getMultiplier() * clickFrenzyMultiplier;
    gameData.score += gain; gameData.totalClicks++;
    const img = document.getElementById('main-clicker'); img.classList.remove('shake'); void img.offsetWidth; img.classList.add('shake');
    const txt = document.createElement('div'); txt.className = 'floating-text'; txt.innerText = "+" + formatNumber(gain);
    txt.style.left = e.clientX + 'px'; txt.style.top = e.clientY + 'px'; document.body.appendChild(txt); setTimeout(() => txt.remove(), 1000);
    checkAchievements(); updateDisplay();
};

function spawnGoldenNugget() {
    if (isNuggetActive) return;
    const nugget = document.createElement('img');
    nugget.src = "nugget.png"; nugget.className = "golden-nugget-style nugget-appear"; nugget.draggable = false;
    nugget.id = "nugget_" + Math.random().toString(36).substr(2, 9);
    const x = Math.random() * (window.innerWidth - 80); const y = Math.random() * (window.innerHeight - 80);
    nugget.style.left = x + 'px'; nugget.style.top = y + 'px';
    nugget.onclick = function(event) { if (!event.isTrusted) return; handleNuggetClick(); nugget.remove(); isNuggetActive = false; };
    document.body.appendChild(nugget); isNuggetActive = true;
    setTimeout(() => { if (document.body.contains(nugget)) { nugget.remove(); isNuggetActive = false; } }, 14000);
    setTimeout(spawnGoldenNugget, Math.random() * 120000 + 60000);
}
function handleNuggetClick() {
    let rand = Math.random(); let effectName = ""; let duration = 0;
    if (rand < 0.4) {
        let pps = upgrades.reduce((acc, u, i) => acc + (u.pps ? u.pps * gameData.upgradesOwned[i] : 0), 0);
        let gain = Math.max(1000, pps * 120 * getMultiplier()); 
        gameData.score += gain; effectName = `Jackpot ! +${formatNumber(gain)}`;
    } else if (rand < 0.7) { goldenMultiplier = 5; duration = 30; effectName = "FRENESIE (x5 Global)"; } 
    else { clickFrenzyMultiplier = 20; duration = 10; effectName = "CLIC DIVIN (x20)"; }
    const statusDiv = document.getElementById('golden-status'); statusDiv.style.display = 'block'; statusDiv.innerText = effectName;
    setTimeout(() => { statusDiv.style.display = 'none'; }, 3000);
    if (duration > 0) { setTimeout(() => { goldenMultiplier = 1; clickFrenzyMultiplier = 1; updateDisplay(); }, duration * 1000); }
    gameData.goldenClicks = (gameData.goldenClicks || 0) + 1; checkAchievements(); save(); updateDisplay();
}

setInterval(() => {
    let basePPS = upgrades.reduce((acc, u, i) => acc + (u.pps ? u.pps * gameData.upgradesOwned[i] : 0), 0);
    gameData.score += (basePPS * getMultiplier()) / 10; 
    gameData.timePlayed = (gameData.timePlayed || 0) + 0.1;
    updateDisplay();
    if(Math.random() < 0.1) checkAchievements();
}, 100);

function updateDisplay() {
    let mult = getMultiplier();
    document.getElementById('score').innerText = formatNumber(gameData.score);
    document.getElementById('pps').innerText = formatNumber(Math.floor(upgrades.reduce((acc, u, i) => acc + (u.pps ? u.pps * gameData.upgradesOwned[i] : 0), 0) * mult));
    let totalDisplayMult = mult;
    if (clickFrenzyMultiplier > 1) totalDisplayMult += " (Clic x20!)";
    document.getElementById('global-mult-display').innerText = `x${(typeof totalDisplayMult === 'number' ? totalDisplayMult.toFixed(2) : totalDisplayMult)}`;
    if (gameData.score > gameData.bestScore) gameData.bestScore = gameData.score;
    document.getElementById('ascend-corner-display').innerText = "ASCENDANCE LVL " + gameData.ascendLevel;
    checkEvolution(); updateShop();
}

function checkEvolution() {
    let cur = gameData.maxEvoReached;
    if (evolutions[cur+1] && gameData.score >= evolutions[cur+1].threshold) { gameData.maxEvoReached++; save(); cur = gameData.maxEvoReached; }
    if (evolutions[cur]) { document.getElementById('main-clicker').src = evolutions[cur].img; } else { document.getElementById('main-clicker').src = "18.png"; }
    let next = evolutions[cur + 1];
    if (next) {
        let p = ((gameData.score - evolutions[cur].threshold) / (next.threshold - evolutions[cur].threshold)) * 100;
        document.getElementById('progress-bar').style.width = Math.max(0, Math.min(100, p)) + "%";
        document.getElementById('next-evolution-text').innerText = `Suivant: ${formatNumber(next.threshold - gameData.score)} pts`;
    } else { document.getElementById('progress-bar').style.width = "100%"; document.getElementById('next-evolution-text').innerText = "MAX"; }
}

window.closeM = function(id) { document.getElementById(id).style.display = 'none'; }
document.getElementById('leaderboard-icon').onclick = () => { document.getElementById('leaderboard-modal').style.display = 'block'; window.fetchLeaderboard(); };
window.fetchLeaderboard = async function() {
    const listDiv = document.getElementById('leaderboard-list'); const refreshBtn = document.getElementById('refresh-btn');
    if(refreshBtn) { refreshBtn.innerText = "⏳"; refreshBtn.disabled = true; }
    if(listDiv.innerHTML.includes("Chargement") || listDiv.innerHTML === "") { listDiv.innerHTML = "<p style='text-align:center;'>Chargement...</p>"; }
    try {
        const snap = await getDocs(query(collection(db, "users"), orderBy("bestScore", "desc"), limit(20)));
        listDiv.innerHTML = ""; let rank = 1;
        snap.forEach(d => {
            const data = d.data();
            const row = document.createElement('div'); row.className = "leader-row";
            if(currentUser && d.id === currentUser.uid) { row.style.border = "1px solid #0ff"; row.style.background = "rgba(0,255,255,0.1)"; }
            row.innerHTML = `<div class="leader-rank">#${rank}</div><div class="leader-name">${data.playerName||"Inconnu"}</div><div class="leader-score">${formatNumber(data.bestScore||0)}</div><div class="leader-ascend">${data.ascendLevel||0}</div><div class="leader-time">${formatTime(data.timePlayed||0)}</div>`;
            listDiv.appendChild(row); rank++;
        });
        if(rank === 1) listDiv.innerHTML = "<p>Aucun score.</p>";
    } catch (e) { listDiv.innerHTML = "<p style='color:#f44'>Erreur chargement.</p>"; } 
    finally { if(refreshBtn) { refreshBtn.innerText = "🔄"; refreshBtn.disabled = false; } }
}

document.getElementById('stats-icon').onclick = () => { 
    document.getElementById('stats-modal').style.display = 'block'; 
    document.getElementById('stat-best').innerText = formatNumber(gameData.bestScore); 
    document.getElementById('stat-clicks').innerText = gameData.totalClicks.toLocaleString(); 
    document.getElementById('stat-ascend-lvl').innerText = gameData.ascendLevel; 
    document.getElementById('stat-bonus').innerText = `x${getMultiplier().toFixed(2)}`; 
    document.getElementById('stat-nuggets').innerText = gameData.goldenClicks || 0; 
    document.getElementById('stat-time').innerText = formatTime(gameData.timePlayed || 0); 
    document.getElementById('stat-gamble-wins').innerText = gameData.gambleWins || 0; 
};

document.getElementById('collection-icon').onclick = () => { document.getElementById('collection-modal').style.display = 'block'; const g = document.getElementById('collection-grid'); g.innerHTML = ""; evolutions.forEach((evo, i) => { const d = document.createElement('div'); d.className = 'collection-item'; const img = document.createElement('img'); img.src = evo.img; if(i > gameData.maxEvoReached) img.className = 'locked-img'; const t = document.createElement('span'); t.innerText = (i <= gameData.maxEvoReached) ? evo.name : "???"; t.style.fontFamily = "Titan One"; t.style.fontSize = "12px"; d.appendChild(img); d.appendChild(t); g.appendChild(d); }); };
document.getElementById('ascend-icon').onclick = () => { document.getElementById('ascend-modal').style.display = 'block'; const cost = getAscendCost(); const btn = document.getElementById('do-ascend-btn'); document.getElementById('next-ascend-bonus-text').innerText = `+${Math.floor(getNextAscendBonus() * 100)}%`; if (gameData.score >= cost) { btn.disabled = false; document.getElementById('ascend-msg').innerHTML = "<span style='color:#0f0'>Prêt !</span>"; } else { btn.disabled = true; document.getElementById('ascend-msg').innerHTML = `<span style='color:#f44'>Manque ${formatNumber(cost - gameData.score)} pts</span>`; } };
document.getElementById('do-ascend-btn').onclick = () => { gameData.ascendLevel++; gameData.score = 0; gameData.upgradesOwned = Array(upgrades.length).fill(0); gameData.maxEvoReached = 0; window.closeM('ascend-modal'); updateDisplay(); save(); };

// --- AUDIO ---
const audio = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
const volumeSlider = document.getElementById('volume-slider');
audio.volume = 0.3; volumeSlider.value = 0.3;
musicBtn.addEventListener('click', () => {
    if (audio.paused) { audio.play().catch(e => console.log(e)); updateMusicUI(true); } else { audio.pause(); updateMusicUI(false); }
});
volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value); audio.volume = val;
    if (audio.paused && val > 0) audio.play().catch(e => console.log(e));
    updateMusicUI(val > 0);
});
function updateMusicUI(isPlaying) {
    if (isPlaying && audio.volume > 0) {
        musicBtn.classList.add('music-active');
        if (audio.volume < 0.5) musicBtn.innerText = "🔉"; else musicBtn.innerText = "🔊";
    } else { musicBtn.classList.remove('music-active'); musicBtn.innerText = "🔇"; }
}

setTimeout(spawnGoldenNugget, 15000);
initShop(); loadLocalSave();
setInterval(() => { save(); console.log("Sauvegarde auto (20 min)"); }, 1200000);
window.addEventListener("beforeunload", () => { save(); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === 'hidden') { save(); console.log("Sauvegarde (App masquée)"); } });
