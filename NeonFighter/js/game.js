const arena =

document.getElementById("arena");

const playerEl =

document.getElementById("player");

const cpu1El =

document.getElementById("cpu1");

const cpu2El =

document.getElementById("cpu2");

const cpu3El =

document.getElementById("cpu3");

const startBtn =

document.getElementById("startBtn");

const restartBtn =

document.getElementById("restartBtn");

const fullscreenBtn =

document.getElementById("fullscreenBtn");

const fullscreenMenuBtn =

document.getElementById("fullscreenMenuBtn");

const menuBtn =

document.getElementById("menuBtn");

const playAgainBtn =

document.getElementById("playAgainBtn");

const difficultyButtons =

document.querySelectorAll(

".difficulty-btn"

);

const playerHealthEl =

document.getElementById(

"playerHealth"

);

const playerHealthText =

document.getElementById(

"playerHealthText"

);

const cpuHealthEl =

document.getElementById(

"cpuHealth"

);

const cpuHealthText =

document.getElementById(

"cpuHealthText"

);

const cpu1HealthEl =

document.getElementById(

"cpu1Health"

);

const cpu2HealthEl =

document.getElementById(

"cpu2Health"

);

const cpu3HealthEl =

document.getElementById(

"cpu3Health"

);

const cpu1HealthText =

document.getElementById(

"cpu1HealthText"

);

const cpu2HealthText =

document.getElementById(

"cpu2HealthText"

);

const cpu3HealthText =

document.getElementById(

"cpu3HealthText"

);

const roundNumberEl =

document.getElementById(

"roundNumber"

);

const playerScoreEl =

document.getElementById(

"playerScore"

);

const cpuScoreEl =

document.getElementById(

"cpuScore"

);

const timerEl =

document.getElementById(

"timer"

);

const hitEffect =

document.getElementById(

"hitEffect"

);

const blockIndicator =

document.getElementById(

"blockIndicator"

);

const blockCooldownText =

document.getElementById(

"blockCooldownText"

);

const resultOverlay =

document.getElementById(

"resultOverlay"

);

const resultTitle =

document.getElementById(

"resultTitle"

);

const resultScore =

document.getElementById(

"resultScore"

);

const resultMessage =

document.getElementById(

"resultMessage"

);

const FLOOR_HEIGHT = 70;

const JUMP_POWER = 14;

const GRAVITY = -0.72;

const MOVE_SPEED = 4.4;

const ROUND_TIME = 60;

const BLOCK_DURATION = 3000;

const BLOCK_COOLDOWN = 10000;

const ATTACK_COOLDOWN = 430;

const PLAYER_PUNCH_DAMAGE = 10;

const PLAYER_KICK_DAMAGE = 14;

const CPU_PUNCH_DAMAGE = 8;

const CPU_KICK_DAMAGE = 11;

const ATTACK_RANGE = 72;

// --------------------------------------------------

// NEOZZ CURRENCY, WEAPONS, AND LOCAL PROFILES

// --------------------------------------------------

const NEOZZ_SAVE_KEY = "neonFightersNeozzSave_v2";

const PROFILE_SAVE_KEY = "neonFightersProfiles_v1";

const ACTIVE_PROFILE_KEY = "neonFightersActiveProfile_v1";

const WEAPONS = [

{

id: "street-gloves",

name: "Street Gloves",

price: 50,

bonus: 2,

range: 78,

description: "Glowing gloves that boost close-range punches."

},

{

id: "neon-baton",

name: "Neon Baton",

price: 150,

bonus: 4,

range: 96,

description: "A glowing baton that reaches farther than fists."

},

{

id: "plasma-blade",

name: "Plasma Blade",

price: 400,

bonus: 7,

range: 92,

description: "A bright plasma blade with stronger close-range damage."

},

{

id: "shock-gauntlets",

name: "Shock Gauntlets",

price: 900,

bonus: 10,

range: 82,

description: "Electrical gloves that surge with energy."

},

{

id: "void-saber",

name: "Void Saber",

price: 1800,

bonus: 14,

range: 128,

description: "A powerful saber with an extended strike."

},

{

id: "quantum-edge",

name: "Quantum Edge",

price: 4000,

bonus: 19,

range: 360,

description: "Fire a quantum blast that can hit from far away."

},

{

id: "neon-overlord",

name: "Neon Overlord",

price: 10000,

bonus: 26,

range: 420,

description: "A mysterious legendary weapon with overwhelming power."

}

];

let neozz = 100;

let ownedWeapons = ["fists"];

let equippedWeapon = "fists";

let matchNeozzEarned = 0;

let extraControls = null;

let neozzBalanceEl = null;

let shopModal = null;

let accountModal = null;

let activeProfile = null;

let profiles = [];

function getRoundReward() {

const rewards = {

easy: 10,

medium: 12,

hard: 14,

veryhard: 16

};

return rewards[difficulty] || 10;

}

function getCPUHealthForDifficulty() {

const health = {

easy: 100,

medium: 125,

hard: 150,

veryhard: 175

};

return health[difficulty] || 100;

}

function getEquippedWeapon() {

return WEAPONS.find(

weapon => weapon.id === equippedWeapon

) || {

id: "fists",

name: "Starter Fists",

price: 0,

bonus: 0,

range: ATTACK_RANGE

};

}

function getWeaponBonus() {

return getEquippedWeapon().bonus;

}

function getWeaponRange() {

return getEquippedWeapon().range || ATTACK_RANGE;

}

function loadNeozzSave() {

try {

const saved = JSON.parse(

localStorage.getItem(NEOZZ_SAVE_KEY) || "null"

);

if (saved && typeof saved === "object") {

neozz = Number.isFinite(saved.neozz)

? Math.max(0, saved.neozz)

: 100;

ownedWeapons = Array.isArray(saved.ownedWeapons)

? [...new Set(["fists", ...saved.ownedWeapons])]

: ["fists"];

equippedWeapon = typeof saved.equippedWeapon === "string"

? saved.equippedWeapon

: "fists";

if (

equippedWeapon !== "fists" &&

!ownedWeapons.includes(equippedWeapon)

) {

equippedWeapon = "fists";

}

}

} catch (error) {

console.warn("Could not load Neozz save:", error);

}

}

function saveNeozz() {

try {

localStorage.setItem(

NEOZZ_SAVE_KEY,

JSON.stringify({

neozz,

ownedWeapons,

equippedWeapon

})

);

} catch (error) {

console.warn("Could not save Neozz:", error);

}

}

function updateNeozzDisplay() {

if (neozzBalanceEl) {

neozzBalanceEl.textContent =

`◈ ${neozz.toLocaleString()} Neozz`;

}

const shopBalance = document.getElementById("shopNeozzBalance");

if (shopBalance) {

shopBalance.textContent = neozz.toLocaleString();

}

const equippedLabel = document.getElementById("equippedWeaponLabel");

if (equippedLabel) {

equippedLabel.textContent = getEquippedWeapon().name;

}

if (shopModal && shopModal.classList.contains("open")) {

renderWeaponShop();

}

}

function awardNeozz(amount, reason) {

if (amount <= 0) return;

neozz += amount;

matchNeozzEarned += amount;

saveNeozz();

updateNeozzDisplay();

showHitEffect(`+${amount} ◈`);

console.info(`Earned ${amount} Neozz: ${reason}`);

}

function loadProfiles() {

try {

const stored = JSON.parse(

localStorage.getItem(PROFILE_SAVE_KEY) || "[]"

);

profiles = Array.isArray(stored) ? stored : [];

const activeId = localStorage.getItem(ACTIVE_PROFILE_KEY);

activeProfile = profiles.find(profile => profile.id === activeId) || null;

} catch (error) {

profiles = [];

activeProfile = null;

}

}

function saveProfiles() {

try {

localStorage.setItem(PROFILE_SAVE_KEY, JSON.stringify(profiles));

if (activeProfile) {

localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfile.id);

} else {

localStorage.removeItem(ACTIVE_PROFILE_KEY);

}

} catch (error) {

console.warn("Could not save local profile:", error);

}

}

function updateProfileControls() {
    const profileButton = document.getElementById("profileMenuButton");
    if (profileButton) {
        profileButton.textContent = activeProfile
            ? `👤 ${activeProfile.name} ▾`
            : "👤 Profile ▾";
    }

    const signOut = document.getElementById("signOutButton");
    if (signOut) {
        signOut.disabled = !activeProfile;
        signOut.style.opacity = activeProfile ? "1" : ".5";
    }
}

function initializeExtraUI() {
    loadNeozzSave();
    loadProfiles();

    const header = document.querySelector(".site-header") || document.querySelector("header");
    extraControls = document.getElementById("neozzAccountControls");

    if (!extraControls) {
        extraControls = document.createElement("div");
        extraControls.id = "neozzAccountControls";

        neozzBalanceEl = document.createElement("span");
        neozzBalanceEl.id = "neozzBalance";

        const shopButton = makeExtraButton("⚔ Weapon Shop", "#9d65ff");
        shopButton.id = "openWeaponShopButton";
        shopButton.addEventListener("click", openWeaponShop);

        const profileWrap = document.createElement("div");
        profileWrap.id = "profileDropdown";
        profileWrap.className = "profile-dropdown";

        const profileButton = makeExtraButton("👤 Profile ▾", "#45e8ff");
        profileButton.id = "profileMenuButton";
        profileButton.setAttribute("aria-haspopup", "true");
        profileButton.setAttribute("aria-expanded", "false");

        const profileMenu = document.createElement("div");
        profileMenu.id = "profileMenu";
        profileMenu.className = "profile-menu";
        profileMenu.hidden = true;

        const editProfile = makeExtraButton("Edit Profile", "#ff9b54");
        editProfile.className = "profile-menu-item";
        editProfile.addEventListener("click", () => {
            closeProfileMenu();
            openAccountModal("profile");
        });

        const signIn = makeExtraButton("Sign In", "#45e8ff");
        signIn.id = "signInButton";
        signIn.className = "profile-menu-item";
        signIn.addEventListener("click", () => {
            closeProfileMenu();
            openAccountModal("signup");
        });

        const login = makeExtraButton("Log In", "#58e68b");
        login.id = "loginButton";
        login.className = "profile-menu-item";
        login.addEventListener("click", () => {
            closeProfileMenu();
            openAccountModal("login");
        });

        const signOut = makeExtraButton("Sign Out", "#ff4fa3");
        signOut.id = "signOutButton";
        signOut.className = "profile-menu-item";
        signOut.addEventListener("click", () => {
            closeProfileMenu();
            signOutProfile();
        });

        profileMenu.append(editProfile, signIn, login, signOut);
        profileWrap.append(profileButton, profileMenu);
        extraControls.append(neozzBalanceEl, shopButton, profileWrap);

        if (header) {
            header.appendChild(extraControls);
        } else {
            document.body.insertBefore(extraControls, document.body.firstChild);
        }

        profileButton.addEventListener("click", event => {
            event.stopPropagation();
            const opening = profileMenu.hidden;
            profileMenu.hidden = !opening;
            profileButton.setAttribute("aria-expanded", String(opening));
        });

        document.addEventListener("click", event => {
            if (!profileWrap.contains(event.target)) closeProfileMenu();
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeProfileMenu();
        });
    } else {
        neozzBalanceEl = document.getElementById("neozzBalance");
    }

    createWeaponShopModal();
    createAccountModal();
    installExtraStyles();
    ensureWeaponVisual();
    updateNeozzDisplay();
    updateProfileControls();
    updateWeaponVisual();
}

function closeProfileMenu() {
    const menu = document.getElementById("profileMenu");
    const button = document.getElementById("profileMenuButton");
    if (menu) menu.hidden = true;
    if (button) button.setAttribute("aria-expanded", "false");
}

function makeExtraButton(label, color) {

const button = document.createElement("button");

button.type = "button";

button.textContent = label;

button.style.cssText =

`cursor:pointer;padding:9px 11px;border:1px solid ${color};border-radius:9px;background:#111a32;color:#fff;font-weight:800;`;

return button;

}

function installExtraStyles() {

if (document.getElementById("neozzExtraStyles")) return;

const style = document.createElement("style");

style.id = "neozzExtraStyles";

style.textContent = `

#neozzShopModal,#accountModal {

display:none;position:fixed;inset:0;z-index:20000;

background:rgba(2,5,18,.88);padding:16px;overflow:auto;

align-items:center;justify-content:center;box-sizing:border-box;

}

#neozzShopModal.open,#accountModal.open {display:flex;}

#neozzShopPanel,#accountPanel {

width:min(900px,100%);max-height:90vh;overflow:auto;

background:#10172b;color:#f5f7ff;border:1px solid #45e8ff;

border-radius:18px;padding:22px;box-sizing:border-box;

box-shadow:0 0 30px rgba(69,232,255,.18);font-family:Arial,sans-serif;

}

#neozzShopPanel h2,#accountPanel h2 {margin:0 0 8px;color:#45e8ff;}

#neozzShopHeader {display:flex;align-items:center;justify-content:space-between;gap:12px;}

#neozzShopGrid {display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;}

.neozz-weapon-card {border:1px solid rgba(157,101,255,.65);border-radius:12px;padding:14px;background:#171f39;display:flex;flex-direction:column;gap:9px;}

.neozz-weapon-card h3 {margin:0;color:#fff;font-size:17px;}

.neozz-weapon-card p {margin:0;color:#bdc8e4;font-size:13px;line-height:1.4;}

.neozz-weapon-card .weapon-price {color:#45e8ff;font-weight:800;}

.neozz-weapon-card button,#closeNeozzShop,#accountPanel button {

cursor:pointer;border:0;border-radius:8px;padding:10px 12px;background:#45e8ff;color:#08101e;font-weight:800;

}

.neozz-weapon-card button:disabled,#accountPanel button:disabled {cursor:not-allowed;opacity:.5;}

#closeNeozzShop {background:#9d65ff;color:#fff;}

#accountPanel label {display:block;margin:12px 0 6px;font-weight:700;}

#neozzAccountControls {
    display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;
    margin-left:auto;position:relative;z-index:150;min-width:0;
}
#neozzBalance {
    color:#45e8ff;font-weight:800;padding:9px 12px;border:1px solid #45e8ff;
    border-radius:10px;background:#081426;white-space:nowrap;
}
.profile-dropdown {position:relative;display:inline-flex;align-items:center;}
#profileMenuButton {white-space:nowrap;}
.profile-menu {
    position:absolute;right:0;top:calc(100% + 9px);min-width:170px;padding:7px;
    display:flex;flex-direction:column;gap:5px;border:1px solid #354766;border-radius:12px;
    background:#10172b;box-shadow:0 14px 35px rgba(0,0,0,.45);z-index:1000;
}
.profile-menu[hidden] {display:none !important;}
.profile-menu .profile-menu-item {
    display:block;width:100%;text-align:left;padding:11px 12px;border-radius:8px;
    border:1px solid transparent;background:#171f39;color:#f5f7ff;cursor:pointer;
    font-weight:800;letter-spacing:.2px;
}
.profile-menu .profile-menu-item:hover {background:#202c48;border-color:#45e8ff;}
.profile-menu #signOutButton:disabled {opacity:.45;cursor:not-allowed;}
@media (max-width:950px) {
    .site-header {flex-wrap:wrap;gap:12px;}
    #neozzAccountControls {width:100%;justify-content:flex-end;margin-left:0;}
}
@media (max-width:520px) {
    #neozzAccountControls {justify-content:flex-start;}
    #neozzBalance {font-size:12px;}
    .profile-menu {right:auto;left:0;}
}

#accountPanel input,#accountPanel textarea,#accountPanel select {

width:100%;box-sizing:border-box;padding:11px;border-radius:8px;border:1px solid #485777;background:#0b1225;color:#fff;

}

#accountPanel textarea {min-height:75px;resize:vertical;}

#accountPanel .account-actions {display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;}

#accountError {color:#ff9bad;min-height:20px;}

#playerWeaponVisual {position:absolute;left:63%;top:43%;z-index:20;pointer-events:none;display:block;transform:rotate(-18deg);border-radius:6px;}

#playerWeaponVisual::before,#playerWeaponVisual::after {content:"";position:absolute;display:block;}

#playerWeaponVisual.weapon-fists {width:12px;height:12px;left:65%;top:44%;border-radius:50%;background:#d8e6ff;box-shadow:0 0 8px #d8e6ff;}

#playerWeaponVisual.weapon-fists::before,#playerWeaponVisual.weapon-street-gloves::before {width:12px;height:12px;left:-13px;top:0;border-radius:50%;background:inherit;box-shadow:0 0 8px currentColor;}

#playerWeaponVisual.weapon-street-gloves {width:13px;height:13px;left:65%;top:44%;border-radius:50%;background:#ff4fa3;color:#ff4fa3;box-shadow:0 0 12px #ff4fa3;}

#playerWeaponVisual.weapon-neon-baton {width:40px;height:5px;background:#45e8ff;box-shadow:0 0 12px #45e8ff;left:61%;top:48%;}

#playerWeaponVisual.weapon-neon-baton::before {width:8px;height:9px;left:0;top:-2px;background:#f7fdff;border-radius:2px;}

#playerWeaponVisual.weapon-plasma-blade {width:42px;height:5px;background:#8effff;box-shadow:0 0 7px #45e8ff,0 0 16px #45e8ff;left:60%;top:46%;}

#playerWeaponVisual.weapon-plasma-blade::before {width:9px;height:9px;left:-5px;top:-2px;background:#8b5cff;border-radius:2px;}

#playerWeaponVisual.weapon-shock-gauntlets {width:14px;height:14px;border-radius:5px;background:#ffe45e;box-shadow:0 0 9px #ffe45e,0 0 18px #45e8ff;left:65%;top:44%;}

#playerWeaponVisual.weapon-shock-gauntlets::before {width:14px;height:14px;left:-15px;top:0;border-radius:5px;background:#ffe45e;box-shadow:0 0 9px #ffe45e;}

#playerWeaponVisual.weapon-void-saber {width:47px;height:5px;background:#bd82ff;box-shadow:0 0 8px #bd82ff,0 0 20px #9d65ff;left:59%;top:45%;}

#playerWeaponVisual.weapon-void-saber::before {width:8px;height:10px;left:-4px;top:-2px;background:#eee0ff;border-radius:2px;}

#playerWeaponVisual.weapon-quantum-edge {width:16px;height:16px;border-radius:50%;background:#45e8ff;box-shadow:0 0 8px #45e8ff,0 0 20px #9d65ff;left:68%;top:43%;}

#playerWeaponVisual.weapon-quantum-edge::before {width:5px;height:28px;left:5px;top:-6px;background:#fff;opacity:.8;transform:rotate(45deg);}

#playerWeaponVisual.weapon-neon-overlord {width:46px;height:8px;background:linear-gradient(90deg,#45e8ff,#9d65ff,#ff4fa3);box-shadow:0 0 10px #45e8ff,0 0 24px #ff4fa3;left:59%;top:44%;animation:overlordGlow 1s ease-in-out infinite alternate;}

#playerWeaponVisual.weapon-neon-overlord::before {width:13px;height:13px;left:-4px;top:-3px;border-radius:50%;background:#fff;box-shadow:0 0 12px #fff;}

@keyframes overlordGlow {from{filter:brightness(.9)}to{filter:brightness(1.7)}}

@media(max-width:520px){#neozzShopPanel,#accountPanel{padding:14px;}#neozzAccountControls{font-size:12px;}}

`;

document.head.appendChild(style);

}

function ensureWeaponVisual() {

if (!playerEl) return;

playerEl.style.overflow = "visible";

if (document.getElementById("playerWeaponVisual")) return;

const visual = document.createElement("span");

visual.id = "playerWeaponVisual";

visual.setAttribute("aria-hidden", "true");

playerEl.appendChild(visual);

}

function updateWeaponVisual() {

const visual = document.getElementById("playerWeaponVisual");

if (!visual) return;

visual.className = `weapon-${equippedWeapon}`;

}

function createWeaponShopModal() {

if (document.getElementById("neozzShopModal")) {

shopModal = document.getElementById("neozzShopModal");

return;

}

shopModal = document.createElement("div");

shopModal.id = "neozzShopModal";

shopModal.innerHTML = `

<section id="neozzShopPanel" role="dialog" aria-modal="true" aria-labelledby="neozzShopTitle">

<div id="neozzShopHeader"><div><h2 id="neozzShopTitle">⚔ Neon Weapon Shop</h2><p>Buy weapons and equip them to change your attack damage and reach.</p></div><button type="button" id="closeNeozzShop">Close ✕</button></div>

<p><strong>Balance:</strong> <span id="shopNeozzBalance">100</span> Neozz &nbsp; | &nbsp; <strong>Equipped:</strong> <span id="equippedWeaponLabel">Starter Fists</span></p>

<div id="neozzShopGrid"></div>

<p style="color:#bdc8e4">Earn Neozz by winning rounds. Winning all three rounds earns an extra full-sweep bonus.</p>

</section>`;

document.body.appendChild(shopModal);

document.getElementById("closeNeozzShop").addEventListener("click", closeWeaponShop);

shopModal.addEventListener("click", event => {

if (event.target === shopModal) closeWeaponShop();

});

}

function openWeaponShop() {

if (!shopModal) createWeaponShopModal();

renderWeaponShop();

shopModal.classList.add("open");

}

function closeWeaponShop() {

if (shopModal) shopModal.classList.remove("open");

}

function renderWeaponShop() {

const grid = document.getElementById("neozzShopGrid");

const balance = document.getElementById("shopNeozzBalance");

const label = document.getElementById("equippedWeaponLabel");

if (!grid) return;

if (balance) balance.textContent = neozz.toLocaleString();

if (label) label.textContent = getEquippedWeapon().name;

grid.innerHTML = "";

const starter = document.createElement("article");

starter.className = "neozz-weapon-card";

starter.innerHTML = "<h3>Starter Fists</h3><p>Your free starting weapon.</p><div class='weapon-price'>FREE · +0 damage</div>";

const starterButton = document.createElement("button");

starterButton.type = "button";

starterButton.textContent = equippedWeapon === "fists" ? "Equipped" : "Equip";

starterButton.disabled = equippedWeapon === "fists";

starterButton.addEventListener("click", () => equipWeapon("fists"));

starter.appendChild(starterButton);

grid.appendChild(starter);

for (const weapon of WEAPONS) {

const owned = ownedWeapons.includes(weapon.id);

const equipped = equippedWeapon === weapon.id;

const card = document.createElement("article");

card.className = "neozz-weapon-card";

const title = document.createElement("h3");

title.textContent = weapon.name;

const description = document.createElement("p");

description.textContent = weapon.description;

const price = document.createElement("div");

price.className = "weapon-price";

price.textContent = `◈ ${weapon.price.toLocaleString()} · +${weapon.bonus} damage · range ${weapon.range}`;

const button = document.createElement("button");

button.type = "button";

button.textContent = equipped

? "Equipped"

: owned

? "Equip Weapon"

: `Buy · ◈ ${weapon.price.toLocaleString()}`;

button.disabled = equipped || (!owned && neozz < weapon.price);

button.addEventListener("click", () => {

if (owned) {

equipWeapon(weapon.id);

return;

}

if (neozz < weapon.price) return;

neozz -= weapon.price;

ownedWeapons.push(weapon.id);

equippedWeapon = weapon.id;

saveNeozz();

updateNeozzDisplay();

updateWeaponVisual();

renderWeaponShop();

});

card.append(title, description, price, button);

grid.appendChild(card);

}

}

function equipWeapon(weaponId) {

if (weaponId !== "fists" && !ownedWeapons.includes(weaponId)) return;

equippedWeapon = weaponId;

saveNeozz();

updateNeozzDisplay();

updateWeaponVisual();

renderWeaponShop();

}

// Local demo profiles only: no passwords are stored.

function createAccountModal() {

if (document.getElementById("accountModal")) {

accountModal = document.getElementById("accountModal");

return;

}

accountModal = document.createElement("div");

accountModal.id = "accountModal";

accountModal.innerHTML = `

<section id="accountPanel" role="dialog" aria-modal="true" aria-labelledby="accountTitle">

<h2 id="accountTitle">Player Profile</h2>

<p id="accountHelp">Create or edit your local player profile.</p>

<form id="accountForm">

<label for="accountName">Display name</label>

<input id="accountName" maxlength="24" required placeholder="Enter a player name">

<label for="accountBio">Profile bio</label>

<textarea id="accountBio" maxlength="160" placeholder="A short profile description (optional)"></textarea>

<div class="account-actions"><button type="submit" id="accountSubmit">Save profile</button><button type="button" id="accountCancel">Cancel</button></div>

<p id="accountError" role="status"></p>

</form>

</section>`;

document.body.appendChild(accountModal);

document.getElementById("accountCancel").addEventListener("click", closeAccountModal);

accountModal.addEventListener("click", event => {

if (event.target === accountModal) closeAccountModal();

});

document.getElementById("accountForm").addEventListener("submit", event => {

event.preventDefault();

const mode = accountModal.dataset.mode;

const nameInput = document.getElementById("accountName");

const bioInput = document.getElementById("accountBio");

const error = document.getElementById("accountError");

const name = nameInput.value.trim();

const bio = bioInput.value.trim();

if (!name) {

error.textContent = "Please enter a display name.";

return;

}

if (mode === "signup") {

const exists = profiles.some(profile => profile.name.toLowerCase() === name.toLowerCase());

if (exists) {

error.textContent = "That name already exists on this browser. Use Log in instead.";

return;

}

activeProfile = {

id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,

name,

bio

};

profiles.push(activeProfile);

} else if (mode === "profile") {

if (!activeProfile) {

error.textContent = "Please sign in or log in first.";

return;

}

activeProfile.name = name;

activeProfile.bio = bio;

profiles = profiles.map(profile => profile.id === activeProfile.id ? activeProfile : profile);

} else {

const found = profiles.find(profile => profile.name.toLowerCase() === name.toLowerCase());

if (!found) {

error.textContent = "Profile not found on this browser. Use Sign in to create one.";

return;

}

activeProfile = found;

}

saveProfiles();

updateProfileControls();

closeAccountModal();

});

}

function openAccountModal(mode) {

if (!accountModal) createAccountModal();

accountModal.dataset.mode = mode;

const title = document.getElementById("accountTitle");

const help = document.getElementById("accountHelp");

const submit = document.getElementById("accountSubmit");

const name = document.getElementById("accountName");

const bio = document.getElementById("accountBio");

const error = document.getElementById("accountError");

error.textContent = "";

name.value = "";

bio.value = "";

if (mode === "signup") {

title.textContent = "Create Player Profile";

help.textContent = "Sign in on this browser with a display name. This is a local demo profile, not a secure online account.";

submit.textContent = "Create profile";

} else if (mode === "login") {

title.textContent = "Log in";

help.textContent = "Enter the display name of a profile already saved in this browser.";

submit.textContent = "Log in";

} else {

if (!activeProfile) {

openAccountModal("signup");

return;

}

title.textContent = "Edit Profile";

help.textContent = "Update your local display name and bio.";

submit.textContent = "Save changes";

name.value = activeProfile.name;

bio.value = activeProfile.bio || "";

}

accountModal.classList.add("open");

name.focus();

}

function closeAccountModal() {

if (accountModal) accountModal.classList.remove("open");

}

function signOutProfile() {

activeProfile = null;

saveProfiles();

updateProfileControls();

}

// --------------------------------------------------

// END OF NEOZZ / PROFILE SYSTEM

// --------------------------------------------------

let gameRunning = false;

let roundActive = false;

let difficulty = "easy";

let timer = ROUND_TIME;

let timerInterval = null;

let roundNumber = 1;

let playerRounds = 0;

let cpuRounds = 0;

let lastTime = 0;

let platforms = [];

let animationStarted = false;

const keys = {

ArrowLeft: false,

ArrowRight: false,

ArrowUp: false

};

const player = {

x: 160,

y: FLOOR_HEIGHT,

width: 45,

height: 116,

vy: 0,

health: 100,

grounded: true,

platform: null,

facing: 1,

blocking: false,

blockCooldownUntil: 0,

attacking: false,

attackType: null,

attackTimer: 0,

lastAttack: 0

};

function createCPU() {

return {

x: 800,

y: FLOOR_HEIGHT,

width: 45,

height: 116,

vy: 0,

health: 100,

grounded: true,

platform: null,

facing: -1,

blocking: false,

blockCooldownUntil: 0,

attacking: false,

attackType: null,

attackTimer: 0,

lastAttack: 0,

aiCooldown: 0,

jumpCooldown: 0,

targetPlatform: null,

defeated: false

};

}

const cpus = [

createCPU(),

createCPU(),

createCPU()

];

const difficultySettings = {

easy: {

speed: 1.8,

attackDelay: 950,

jumpDelay: 1500,

blockChance: 0.10,

attackChance: 0.55,

smartPlatform: 0.35

},

medium: {

speed: 2.8,

attackDelay: 650,

jumpDelay: 1100,

blockChance: 0.25,

attackChance: 0.72,

smartPlatform: 0.70

},

hard: {

speed: 3.6,

attackDelay: 520,

jumpDelay: 850,

blockChance: 0.42,

attackChance: 0.86,

smartPlatform: 0.90

},

veryhard: {

speed: 4.3,

attackDelay: 400,

jumpDelay: 650,

blockChance: 0.58,

attackChance: 0.94,

smartPlatform: 1.0

}

};

function createPlatforms() {

platforms = [];

const arenaRect =

arena.getBoundingClientRect();

const platformElements = [

{

element:

document.querySelector(

".platform-left-low"

),

type: "low"

},

{

element:

document.querySelector(

".platform-right-low"

),

type: "low"

},

{

element:

document.querySelector(

".platform-center"

),

type: "center"

},

{

element:

document.querySelector(

".platform-left-high"

),

type: "high"

},

{

element:

document.querySelector(

".platform-right-high"

),

type: "high"

}

];

platformElements.forEach(item => {

if (!item.element) {

return;

}

const rect =

item.element.getBoundingClientRect();

const computed =

getComputedStyle(

item.element

);

const bottom =

parseFloat(

computed.bottom

) || 0;

const supportY =

bottom + rect.height;

platforms.push({

element: item.element,

type: item.type,

x:

rect.left -

arenaRect.left,

width:

rect.width,

supportY

});

});

}

function resetFighter(

fighter,

x,

facing

) {

fighter.x = x;

fighter.y = FLOOR_HEIGHT;

fighter.vy = 0;

fighter.maxHealth = fighter === player ? 100 : getCPUHealthForDifficulty();

fighter.health = fighter.maxHealth;

fighter.grounded = true;

fighter.platform = null;

fighter.facing = facing;

fighter.blocking = false;

fighter.blockCooldownUntil = 0;

fighter.attacking = false;

fighter.attackType = null;

fighter.attackTimer = 0;

fighter.lastAttack = 0;

fighter.aiCooldown =

Math.random() * 500;

fighter.jumpCooldown =

Math.random() * 600;

fighter.targetPlatform = null;

fighter.defeated = false;

}

function resetRound() {

createPlatforms();

resetFighter(

player,

150,

1

);

const width =

arena.clientWidth;

if (difficulty === "veryhard") {

resetFighter(

cpus[0],

width - 240,

-1

);

resetFighter(

cpus[1],

width / 2 + 180,

-1

);

resetFighter(

cpus[2],

width / 2 - 250,

-1

);

} else {

resetFighter(

cpus[0],

width - 220,

-1

);

resetFighter(

cpus[1],

width + 500,

-1

);

resetFighter(

cpus[2],

width + 600,

-1

);

}

timer = ROUND_TIME;

roundActive = true;

resultOverlay.classList.remove(

"show"

);

updateHealth();

updateTimer();

updateScore();

updateFighterVisual(

player,

playerEl

);

updateFighterVisual(

cpus[0],

cpu1El

);

updateFighterVisual(

cpus[1],

cpu2El

);

updateFighterVisual(

cpus[2],

cpu3El

);

startTimer();

}

function startGame() {

stopGameLoop();

clearInterval(

timerInterval

);

playerRounds = 0;

cpuRounds = 0;

roundNumber = 1;

matchNeozzEarned = 0;

gameRunning = true;

document.body.classList.toggle(

"very-hard-mode",

difficulty === "veryhard"

);

document.body.classList.toggle(

"hard-mode",

difficulty === "hard"

);

resetRound();

lastTime =

performance.now();

if (!animationStarted) {

animationStarted = true;

requestAnimationFrame(

gameLoop

);

}

}

function stopGameLoop() {

gameRunning = false;

roundActive = false;

clearInterval(

timerInterval

);

}

function startTimer() {

clearInterval(

timerInterval

);

timerInterval =

setInterval(() => {

if (

!gameRunning ||

!roundActive

) {

return;

}

timer--;

updateTimer();

if (timer <= 0) {

timer = 0;

updateTimer();

endRound("cpu");

}

}, 1000);

}

function updateTimer() {

timerEl.textContent =

timer;

}

function updateHealth() {

playerHealthEl.style.width =

`${Math.max(

0,

player.health

)}%`;

playerHealthText.textContent =

Math.ceil(

Math.max(

0,

player.health

)

);

cpuHealthEl.style.width =

`${Math.max(0, cpus[0].health / cpus[0].maxHealth * 100)}%`;

cpuHealthText.textContent =

Math.ceil(

Math.max(

0,

cpus[0].health

)

);

cpu1HealthEl.style.width =

`${Math.max(0, cpus[0].health / cpus[0].maxHealth * 100)}%`;

cpu1HealthText.textContent =

Math.ceil(

Math.max(

0,

cpus[0].health

)

);

cpu2HealthEl.style.width =

`${Math.max(0, cpus[1].health / cpus[1].maxHealth * 100)}%`;

cpu2HealthText.textContent =

Math.ceil(

Math.max(

0,

cpus[1].health

)

);

cpu3HealthEl.style.width =

`${Math.max(0, cpus[2].health / cpus[2].maxHealth * 100)}%`;

cpu3HealthText.textContent =

Math.ceil(

Math.max(

0,

cpus[2].health

)

);

}

function updateScore() {

playerScoreEl.textContent =

playerRounds;

cpuScoreEl.textContent =

cpuRounds;

roundNumberEl.textContent =

roundNumber;

}

function movePlayer() {

if (

!gameRunning ||

!roundActive

) {

return;

}

let speed =

MOVE_SPEED;

if (!player.grounded) {

speed *= 0.82;

}

if (keys.ArrowLeft) {

player.x -= speed;

player.facing = -1;

}

if (keys.ArrowRight) {

player.x += speed;

player.facing = 1;

}

player.x =

Math.max(

0,

Math.min(

arena.clientWidth -

player.width,

player.x

)

);

}

function playerJump() {

if (

!gameRunning ||

!roundActive

) {

return;

}

if (!player.grounded) {

return;

}

player.vy =

JUMP_POWER;

player.grounded =

false;

player.platform =

null;

}

function playerPunch() {

if (

!gameRunning ||

!roundActive

) {

return;

}

performPlayerAttack(

"punch"

);

}

function playerKick() {

if (

!gameRunning ||

!roundActive

) {

return;

}

performPlayerAttack(

"kick"

);

}

function performPlayerAttack(

type

) {

const now =

performance.now();

if (

now -

player.lastAttack <

ATTACK_COOLDOWN

) {

return;

}

if (player.blocking) {

return;

}

player.lastAttack =

now;

player.attacking =

true;

player.attackType =

type;

player.attackTimer =

280;

playerEl.classList.remove(

"punch",

"kick"

);

void playerEl.offsetWidth;

playerEl.classList.add(

type

);

setTimeout(() => {

if (

gameRunning &&

roundActive

) {

checkPlayerAttack(

type

);

}

}, 105);

setTimeout(() => {

playerEl.classList.remove(

type

);

}, 300);

}

function showWeaponBlast(target) {

const startRect = playerEl.getBoundingClientRect();

const targetRect = getCPUElement(target).getBoundingClientRect();

const blast = document.createElement("div");

const legendary = equippedWeapon === "neon-overlord";

blast.style.cssText = [

"position:fixed",

"z-index:30000",

"pointer-events:none",

"left:" + (startRect.left + startRect.width * 0.72) + "px",

"top:" + (startRect.top + startRect.height * 0.42) + "px",

"width:" + (legendary ? 24 : 16) + "px",

"height:" + (legendary ? 24 : 16) + "px",

"border-radius:50%",

"background:" + (legendary ? "linear-gradient(135deg,#45e8ff,#9d65ff,#ff4fa3)" : "#45e8ff"),

"box-shadow:" + (legendary ? "0 0 12px #45e8ff,0 0 28px #ff4fa3" : "0 0 12px #45e8ff,0 0 24px #9d65ff"),

"transition:left .18s linear,top .18s linear,transform .18s ease-out,opacity .18s ease-out"

].join(";");

document.body.appendChild(blast);

requestAnimationFrame(() => {

blast.style.left = `${targetRect.left + targetRect.width / 2}px`;

blast.style.top = `${targetRect.top + targetRect.height / 2}px`;

blast.style.transform = "scale(1.8)";

});

setTimeout(() => {

blast.style.opacity = "0";

setTimeout(() => blast.remove(), 200);

}, 190);

}

function checkPlayerAttack(

type

) {

if (!roundActive) {

return;

}

const targets =

getActiveCPUs();

let hitSomeone = false;

for (const cpu of targets) {

if (cpu.defeated) {

continue;

}

if (

!sameHeight(

player,

cpu

)

) {

continue;

}

const distance =

Math.abs(

(

player.x +

player.width / 2

) -

(

cpu.x +

cpu.width / 2

)

);

if (

distance >

getWeaponRange()

) {

continue;

}

hitSomeone = true;

if (equippedWeapon === "quantum-edge" || equippedWeapon === "neon-overlord") {

showWeaponBlast(cpu);

}

if (cpu.blocking) {

showHitEffect(

"BLOCK"

);

continue;

}

const damage =

(type === "punch"

? PLAYER_PUNCH_DAMAGE

: PLAYER_KICK_DAMAGE) + getWeaponBonus();

cpu.health -= damage;

cpu.health =

Math.max(

0,

cpu.health

);

showHitEffect(

equippedWeapon === "quantum-edge" || equippedWeapon === "neon-overlord"

? `QUANTUM BLAST -${damage}`

: `-${damage}`

);

if (cpu.health <= 0) {

defeatCPU(

cpu

);

}

}

if (!hitSomeone) {

showHitEffect(

"MISS"

);

}

updateHealth();

if (

difficulty === "veryhard"

) {

const remaining =

getActiveCPUs()

.filter(

cpu =>

!cpu.defeated

);

if (

remaining.length === 0

) {

endRound(

"player"

);

}

} else {

if (

cpus[0].health <= 0

) {

endRound(

"player"

);

}

}

}

function sameHeight(

fighterA,

fighterB

) {

return Math.abs(

fighterA.y -

fighterB.y

) < 55;

}

function playerBlock() {

if (

!gameRunning ||

!roundActive

) {

return;

}

const now =

performance.now();

if (

now <

player.blockCooldownUntil

) {

return;

}

if (player.blocking) {

return;

}

player.blocking =

true;

playerEl.classList.add(

"blocking"

);

blockIndicator.classList.add(

"active"

);

blockIndicator.querySelector(

"strong"

).textContent = "3";

updateBlockCooldown();

setTimeout(() => {

stopPlayerBlock();

}, BLOCK_DURATION);

}

function stopPlayerBlock() {

if (!player.blocking) {

return;

}

player.blocking =

false;

playerEl.classList.remove(

"blocking"

);

blockIndicator.classList.remove(

"active"

);

player.blockCooldownUntil =

performance.now() +

BLOCK_COOLDOWN;

updateBlockCooldown();

}

function updateBlockCooldown() {

const now =

performance.now();

if (player.blocking) {

blockCooldownText.textContent =

"ACTIVE";

return;

}

if (

now <

player.blockCooldownUntil

) {

const remaining =

Math.ceil(

(

player.blockCooldownUntil -

now

) / 1000

);

blockCooldownText.textContent =

`${remaining}s`;

} else {

blockCooldownText.textContent =

"READY";

}

}

function updateAllCPUs(

delta

) {

if (

!gameRunning ||

!roundActive

) {

return;

}

const active =

getActiveCPUs();

for (

const cpu of active

) {

updateSingleCPU(

cpu,

delta

);

}

}

function updateSingleCPU(

cpu,

delta

) {

if (cpu.defeated) {

return;

}

const settings =

difficultySettings[

difficulty

];

cpu.aiCooldown -= delta;

cpu.jumpCooldown -= delta;

const playerCenter =

player.x +

player.width / 2;

const cpuCenter =

cpu.x +

cpu.width / 2;

const horizontalDistance =

playerCenter -

cpuCenter;

const absoluteDistance =

Math.abs(

horizontalDistance

);

cpu.facing =

horizontalDistance >= 0

? 1

: -1;

if (

player.platform &&

player.platform !==

cpu.platform &&

cpu.grounded

) {

if (

Math.random() <

settings.smartPlatform

) {

const platform =

player.platform;

const platformCenter =

platform.x +

platform.width / 2;

const cpuCenterNow =

cpu.x +

cpu.width / 2;

const horizontalGap =

Math.abs(

platformCenter -

cpuCenterNow

);

if (

horizontalGap > 45

) {

if (

platformCenter >

cpuCenterNow

) {

cpu.x +=

settings.speed;

} else {

cpu.x -=

settings.speed;

}

}

if (

horizontalGap <

105 &&

cpu.jumpCooldown <= 0

) {

cpuJump(

cpu

);

cpu.jumpCooldown =

settings.jumpDelay;

}

}

}

if (

absoluteDistance >

68

) {

if (

horizontalDistance > 0

) {

cpu.x +=

settings.speed;

} else {

cpu.x -=

settings.speed;

}

}

if (

difficulty === "veryhard"

) {

const index =

cpus.indexOf(cpu);

const desiredOffset =

index === 0

? -85

: index === 1

? 0

: 85;

const targetX =

player.x +

desiredOffset;

if (

Math.abs(

cpu.x -

targetX

) > 45

) {

if (

cpu.x <

targetX

) {

cpu.x +=

settings.speed *

0.45;

} else {

cpu.x -=

settings.speed *

0.45;

}

}

}

if (

absoluteDistance <=

ATTACK_RANGE &&

sameHeight(

cpu,

player

)

) {

if (

cpu.aiCooldown <= 0 &&

Math.random() <

settings.attackChance

) {

cpuAttack(

cpu,

Math.random() <

0.55

? "punch"

: "kick"

);

cpu.aiCooldown =

settings.attackDelay;

}

}

if (

player.attacking &&

absoluteDistance < 100

) {

if (

Math.random() <

settings.blockChance

) {

cpuBlock(

cpu

);

}

}

if (

cpu.grounded &&

cpu.jumpCooldown <= 0 &&

Math.random() < 0.008

) {

cpuJump(

cpu

);

cpu.jumpCooldown =

settings.jumpDelay;

}

cpu.x =

Math.max(

0,

Math.min(

arena.clientWidth -

cpu.width,

cpu.x

)

);

}

function cpuJump(

cpu

) {

if (!cpu.grounded) {

return;

}

cpu.vy =

JUMP_POWER;

cpu.grounded =

false;

cpu.platform =

null;

}

function cpuAttack(

cpu,

type

) {

const now =

performance.now();

if (

now -

cpu.lastAttack <

ATTACK_COOLDOWN

) {

return;

}

if (cpu.blocking) {

return;

}

cpu.lastAttack =

now;

cpu.attacking =

true;

cpu.attackType =

type;

cpu.attackTimer =

280;

const element =

getCPUElement(

cpu

);

element.classList.remove(

"punch",

"kick"

);

void element.offsetWidth;

element.classList.add(

type

);

setTimeout(() => {

if (

gameRunning &&

roundActive &&

!cpu.defeated

) {

checkCPUAttack(

cpu,

type

);

}

}, 105);

setTimeout(() => {

element.classList.remove(

type

);

}, 300);

}

function checkCPUAttack(

cpu,

type

) {

if (!roundActive) {

return;

}

const distance =

Math.abs(

(

cpu.x +

cpu.width / 2

) -

(

player.x +

player.width / 2

)

);

if (

distance >

ATTACK_RANGE ||

!sameHeight(

cpu,

player

)

) {

return;

}

if (player.blocking) {

showHitEffect(

"BLOCK"

);

return;

}

const damage =

type === "punch"

? CPU_PUNCH_DAMAGE

: CPU_KICK_DAMAGE;

player.health -=

damage;

player.health =

Math.max(

0,

player.health

);

showHitEffect(

`-${damage}`

);

updateHealth();

if (

player.health <= 0

) {

endRound(

"cpu"

);

}

}

function cpuBlock(

cpu

) {

if (

cpu.blocking ||

cpu.defeated

) {

return;

}

const now =

performance.now();

if (

now <

cpu.blockCooldownUntil

) {

return;

}

cpu.blocking =

true;

const element =

getCPUElement(

cpu

);

element.classList.add(

"blocking"

);

setTimeout(() => {

stopCPUBlock(

cpu

);

}, BLOCK_DURATION);

}

function stopCPUBlock(

cpu

) {

if (!cpu.blocking) {

return;

}

cpu.blocking =

false;

const element =

getCPUElement(

cpu

);

element.classList.remove(

"blocking"

);

cpu.blockCooldownUntil =

performance.now() +

BLOCK_COOLDOWN;

}

function updatePhysics(

fighter

) {

const previousY =

fighter.y;

if (

fighter.grounded &&

fighter.platform

) {

const platform =

fighter.platform;

if (

horizontalOverlap(

fighter,

platform

)

) {

fighter.y =

platform.supportY;

fighter.vy = 0;

return;

}

fighter.grounded =

false;

fighter.platform =

null;

}

if (

fighter.grounded &&

!fighter.platform

) {

fighter.y =

FLOOR_HEIGHT;

fighter.vy = 0;

}

fighter.vy +=

GRAVITY;

fighter.y +=

fighter.vy;

fighter.grounded =

false;

if (

fighter.vy <= 0

) {

const sortedPlatforms =

[...platforms].sort(

(

a,

b

) =>

b.supportY -

a.supportY

);

for (

const platform

of sortedPlatforms

) {

const crossed =

previousY >=

platform.supportY &&

fighter.y <=

platform.supportY;

if (

crossed &&

horizontalOverlap(

fighter,

platform

)

) {

fighter.y =

platform.supportY;

fighter.vy =

0;

fighter.grounded =

true;

fighter.platform =

platform;

return;

}

}

}

if (

fighter.y <=

FLOOR_HEIGHT

) {

fighter.y =

FLOOR_HEIGHT;

fighter.vy =

0;

fighter.grounded =

true;

fighter.platform =

null;

}

}

function horizontalOverlap(

fighter,

platform

) {

const left =

fighter.x + 8;

const right =

fighter.x +

fighter.width -

8;

return (

right >

platform.x &&

left <

platform.x +

platform.width

);

}

function updateFighterVisual(

fighter,

element

) {

if (

fighter.defeated

) {

element.classList.add(

"defeated"

);

} else {

element.classList.remove(

"defeated"

);

}

element.style.left =

`${fighter.x}px`;

element.style.bottom =

`${fighter.y}px`;

element.style.transform =

fighter.facing === 1

? "scaleX(1)"

: "scaleX(-1)";

}

function getCPUElement(

cpu

) {

const index =

cpus.indexOf(

cpu

);

if (index === 0) {

return cpu1El;

}

if (index === 1) {

return cpu2El;

}

return cpu3El;

}

function getActiveCPUs() {

if (

difficulty ===

"veryhard"

) {

return cpus;

}

return [

cpus[0]

];

}

function defeatCPU(

cpu

) {

cpu.health =

0;

cpu.defeated =

true;

cpu.blocking =

false;

cpu.attacking =

false;

const element =

getCPUElement(

cpu

);

element.classList.remove(

"blocking",

"punch",

"kick"

);

element.classList.add(

"defeated"

);

updateHealth();

}

function showHitEffect(

text

) {

hitEffect.textContent =

text;

hitEffect.classList.remove(

"show"

);

void hitEffect.offsetWidth;

hitEffect.classList.add(

"show"

);

setTimeout(() => {

hitEffect.classList.remove(

"show"

);

}, 500);

}

function endRound(

winner

) {

if (!roundActive) {

return;

}

roundActive =

false;

clearInterval(

timerInterval

);

if (

winner ===

"player"

) {

playerRounds++;

awardNeozz(getRoundReward(), "round win");

} else {

cpuRounds++;

}

updateScore();

if (

roundNumber <

3

) {

roundNumber++;

setTimeout(() => {

if (gameRunning) {

resetRound();

}

}, 1300);

return;

}

finishMatch();

}

function finishMatch() {

gameRunning =

false;

roundActive =

false;

clearInterval(

timerInterval

);

if (playerRounds === 3 && cpuRounds === 0) {

awardNeozz(getRoundReward(), "perfect match bonus");

}

resultOverlay.classList.add(

"show"

);

if (

playerRounds >

cpuRounds

) {

resultTitle.textContent =

"YOU WIN!";

resultScore.textContent =

`${playerRounds} - ${cpuRounds}`;

resultMessage.textContent =

"You dominated the arena. Nice fight!";

createConfetti();

}

else if (

cpuRounds >

playerRounds

) {

resultTitle.textContent =

"CPU WINS";

resultScore.textContent =

`${playerRounds} - ${cpuRounds}`;

resultMessage.textContent =

"The CPU took the match. Try again!";

}

else {

resultTitle.textContent =

"DRAW";

resultScore.textContent =

`${playerRounds} - ${cpuRounds}`;

resultMessage.textContent =

"Neither fighter could take the match.";

}

resultMessage.textContent += ` You earned ◈ ${matchNeozzEarned} Neozz this match.`;

}

function createConfetti() {

for (

let i = 0;

i < 70;

i++

) {

const piece =

document.createElement(

"div"

);

piece.style.position =

"fixed";

piece.style.width =

"8px";

piece.style.height =

"8px";

piece.style.left =

`${Math.random() * 100}vw`;

piece.style.top =

"-10px";

piece.style.zIndex =

"10000";

piece.style.background =

[

"#45e8ff",

"#9d65ff",

"#ff4fa3",

"#ff9b54",

"#58e68b"

][

Math.floor(

Math.random() * 5

)

];

piece.style.transform =

`rotate(

${Math.random() * 360}deg

)`;

piece.style.transition =

"top 2.2s ease-in, transform 2.2s linear";

document.body.appendChild(

piece

);

requestAnimationFrame(() => {

piece.style.top =

"105vh";

piece.style.transform =

`rotate(

${Math.random() * 900}deg

)`;

});

setTimeout(() => {

piece.remove();

}, 2400);

}

}

function gameLoop(

timestamp

) {

if (!gameRunning) {

animationStarted =

false;

return;

}

const delta =

Math.min(

32,

timestamp -

lastTime

);

lastTime =

timestamp;

movePlayer();

updateAllCPUs(

delta

);

updatePhysics(

player

);

for (

const cpu of getActiveCPUs()

) {

if (!cpu.defeated) {

updatePhysics(

cpu

);

}

}

updateFighterVisual(

player,

playerEl

);

updateFighterVisual(

cpus[0],

cpu1El

);

updateFighterVisual(

cpus[1],

cpu2El

);

updateFighterVisual(

cpus[2],

cpu3El

);

updateAttackTimer(

player,

playerEl,

delta

);

for (

const cpu of getActiveCPUs()

) {

updateAttackTimer(

cpu,

getCPUElement(cpu),

delta

);

}

updateBlockCooldown();

requestAnimationFrame(

gameLoop

);

}

function updateAttackTimer(

fighter,

element,

delta

) {

if (

fighter.attackTimer >

0

) {

fighter.attackTimer -=

delta;

if (

fighter.attackTimer <=

0

) {

fighter.attacking =

false;

}

}

}

window.addEventListener(

"keydown",

event => {

if (

event.code ===

"ArrowLeft"

) {

keys.ArrowLeft =

true;

}

if (

event.code ===

"ArrowRight"

) {

keys.ArrowRight =

true;

}

if (

event.code ===

"ArrowUp"

) {

keys.ArrowUp =

true;

if (

!event.repeat

) {

playerJump();

}

}

if (

event.code ===

"Space"

) {

event.preventDefault();

if (

!event.repeat

) {

playerPunch();

}

}

if (

event.code ===

"KeyF"

) {

if (

!event.repeat

) {

playerKick();

}

}

if (

event.code ===

"KeyD" ||

event.code ===

"KeyB"

) {

if (

!event.repeat

) {

playerBlock();

}

}

}

);

window.addEventListener(

"keyup",

event => {

if (

event.code ===

"ArrowLeft"

) {

keys.ArrowLeft =

false;

}

if (

event.code ===

"ArrowRight"

) {

keys.ArrowRight =

false;

}

if (

event.code ===

"ArrowUp"

) {

keys.ArrowUp =

false;

}

}

);

difficultyButtons.forEach(

button => {

button.addEventListener(

"click",

() => {

const wasRunning = gameRunning;

difficulty =

button.dataset.difficulty;

difficultyButtons.forEach(

other => {

other.classList.remove(

"active"

);

}

);

button.classList.add(

"active"

);

document.body.classList.toggle(

"very-hard-mode", difficulty === "veryhard"

);

document.body.classList.toggle(

"hard-mode",

difficulty ===

"hard"

);

if (wasRunning) startGame();

}

);

}

);

startBtn.addEventListener(

"click",

() => {

startGame();

}

);

restartBtn.addEventListener(

"click",

() => {

startGame();

}

);

playAgainBtn.addEventListener(

"click",

() => {

resultOverlay.classList.remove(

"show"

);

startGame();

}

);

menuBtn.addEventListener(

"click",

async () => {

stopGameLoop();

try {

if (

document.fullscreenElement

) {

await document.exitFullscreen();

}

} catch (error) {

console.log(

error

);

}

document.body.classList.remove(

"fullscreen-mode"

);

resultOverlay.classList.remove(

"show"

);

document.getElementById(

"game"

).scrollIntoView({

behavior: "smooth"

});

}

);

async function enterFullscreen() {

document.body.classList.add(

"fullscreen-mode"

);

try {

if (

!document.fullscreenElement

) {

await document.documentElement

.requestFullscreen();

}

} catch (error) {

console.log(

error

);

}

setTimeout(() => {

createPlatforms();

}, 200);

}

fullscreenBtn.addEventListener(

"click",

async () => {

if (

document.body.classList.contains(

"fullscreen-mode"

)

) {

await exitFullscreen();

} else {

await enterFullscreen();

}

}

);

fullscreenMenuBtn.addEventListener(

"click",

async () => {

await enterFullscreen();

}

);

async function exitFullscreen() {

document.body.classList.remove(

"fullscreen-mode"

);

try {

if (

document.fullscreenElement

) {

await document.exitFullscreen();

}

} catch (error) {

console.log(

error

);

}

setTimeout(() => {

createPlatforms();

}, 200);

}

document.addEventListener(

"fullscreenchange",

() => {

if (

!document.fullscreenElement

) {

document.body.classList.remove(

"fullscreen-mode"

);

}

}

);

window.addEventListener(

"resize",

() => {

createPlatforms();

player.x =

Math.max(

0,

Math.min(

arena.clientWidth -

player.width,

player.x

)

);

for (

const cpu of cpus

) {

cpu.x =

Math.max(

0,

Math.min(

arena.clientWidth -

cpu.width,

cpu.x

)

);

}

}

);

window.addEventListener(

"load",

() => {

initializeExtraUI();

createPlatforms();

resetFighter(

player,

150,

1

);

resetFighter(

cpus[0],

arena.clientWidth - 220,

-1

);

resetFighter(

cpus[1],

arena.clientWidth + 500,

-1

);

resetFighter(

cpus[2],

arena.clientWidth + 600,

-1

);

gameRunning =

false;

roundActive =

false;

updateHealth();

updateTimer();

updateScore();

updateBlockCooldown();

updateWeaponVisual();

updateFighterVisual(

player,

playerEl

);

updateFighterVisual(

cpus[0],

cpu1El

);

updateFighterVisual(

cpus[1],

cpu2El

);

updateFighterVisual(

cpus[2],

cpu3El

);

difficulty =

"easy";

difficultyButtons.forEach(

button => {

button.classList.toggle(

"active",

button.dataset.difficulty ===

"easy"

);

}

);

}

);