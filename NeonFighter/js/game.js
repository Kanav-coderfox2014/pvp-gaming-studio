/* =========================================================
   NEON FIGHTERS
   UPGRADED GAME ENGINE
   ========================================================= */

const player = document.getElementById("player");
const cpu = document.getElementById("cpu");
const arena = document.getElementById("arena");

const playerHealth =
    document.getElementById("playerHealth");

const cpuHealth =
    document.getElementById("cpuHealth");

const playerHealthText =
    document.getElementById("playerHealthText");

const cpuHealthText =
    document.getElementById("cpuHealthText");

const playerWinsText =
    document.getElementById("playerWins");

const cpuWinsText =
    document.getElementById("cpuWins");

const roundText =
    document.getElementById("roundText");

const timerText =
    document.getElementById("timer");

const comboText =
    document.getElementById("comboText");

const actionText =
    document.getElementById("actionText");

const hitEffect =
    document.getElementById("hitEffect");

const blockBar =
    document.getElementById("playerBlockBar");

const blockStatus =
    document.getElementById("playerBlockStatus");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const playAgainButton =
    document.getElementById("playAgainButton");

const resultOverlay =
    document.getElementById("resultOverlay");

const resultTitle =
    document.getElementById("resultTitle");

const resultScore =
    document.getElementById("resultScore");

const resultMessage =
    document.getElementById("resultMessage");

const roundPopup =
    document.getElementById("roundPopup");

const roundPopupText =
    document.getElementById("roundPopupText");

const difficultyButtons =
    document.querySelectorAll(".difficulty-btn");

const matchBoxes = [
    document.getElementById("match1"),
    document.getElementById("match2"),
    document.getElementById("match3")
];


/* =========================================================
   SETTINGS
   ========================================================= */

const ARENA_WIDTH = 1050;

const PLAYER_WIDTH = 82;
const CPU_WIDTH = 82;

const PUNCH_RANGE = 145;
const KICK_RANGE = 175;

const PUNCH_DAMAGE = 8;
const KICK_DAMAGE = 13;

const CPU_PUNCH_DAMAGE = 7;
const CPU_KICK_DAMAGE = 11;

const GRAVITY = 0.8;

const BLOCK_TIME = 5000;
const BLOCK_COOLDOWN = 10000;


/* =========================================================
   DIFFICULTY
   ========================================================= */

const difficultySettings = {

    easy: {
        speed: 1.7,
        reaction: 450,
        attackChance: .30,
        blockChance: .08,
        dodgeChance: .03,
        mistakeChance: .35,
        punchCooldown: 1000,
        kickCooldown: 1400
    },

    medium: {
        speed: 2.5,
        reaction: 230,
        attackChance: .58,
        blockChance: .25,
        dodgeChance: .10,
        mistakeChance: .15,
        punchCooldown: 700,
        kickCooldown: 1050
    },

    hard: {
        speed: 3.4,
        reaction: 75,
        attackChance: .80,
        blockChance: .52,
        dodgeChance: .22,
        mistakeChance: .04,
        punchCooldown: 500,
        kickCooldown: 800
    }

};

let difficulty = "easy";


/* =========================================================
   STATE
   ========================================================= */

let gameRunning = false;
let roundEnding = false;

let currentRound = 1;

let playerWins = 0;
let cpuWins = 0;

let playerHP = 100;
let cpuHP = 100;

let playerX = 130;
let cpuX = 820;

let playerY = 0;
let cpuY = 0;

let playerVelocityY = 0;

let timer = 60;

let keys = {};

let gameLoop = null;
let timerLoop = null;

let playerAttacking = false;
let cpuAttacking = false;

let playerAttackCooldown = false;
let cpuAttackCooldown = false;

let playerBlocking = false;

let blockStart = 0;
let blockCooldownStart = 0;

let lastCPUDecision = 0;

let combo = 0;
let comboTimer = null;

let dashCooldown = false;


/* =========================================================
   SOUND
   ========================================================= */

let audioContext = null;

function sound(frequency, duration, type = "square") {

    try {

        if (!audioContext) {

            audioContext =
                new (window.AudioContext ||
                window.webkitAudioContext)();

        }

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.type = type;

        oscillator.frequency.value =
            frequency;

        gain.gain.setValueAtTime(
            .08,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            .001,
            audioContext.currentTime + duration
        );

        oscillator.connect(gain);

        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + duration
        );

    } catch (error) {
        // Audio is optional.
    }

}


/* =========================================================
   DIFFICULTY
   ========================================================= */

difficultyButtons.forEach(button => {

    button.addEventListener("click", () => {

        difficultyButtons.forEach(b => {
            b.classList.remove("selected");
        });

        button.classList.add("selected");

        difficulty = button.dataset.level;

        showAction(
            difficulty.toUpperCase() + " MODE"
        );

        sound(500, .06);

    });

});


/* =========================================================
   BUTTONS
   ========================================================= */

startButton.addEventListener("click", () => {

    startSeries();

});

restartButton.addEventListener("click", () => {

    resultOverlay.classList.add("hidden");

    startSeries();

});

playAgainButton.addEventListener("click", () => {

    resultOverlay.classList.add("hidden");

    startSeries();

});


/* =========================================================
   START SERIES
   ========================================================= */

function startSeries() {

    clearLoops();

    gameRunning = true;

    roundEnding = false;

    currentRound = 1;

    playerWins = 0;
    cpuWins = 0;

    playerWinsText.textContent = "0";
    cpuWinsText.textContent = "0";

    resetMatchHistory();

    startRound();

}


/* =========================================================
   START ROUND
   ========================================================= */

function startRound() {

    clearLoops();

    roundEnding = false;

    playerHP = 100;
    cpuHP = 100;

    playerX = 130;
    cpuX = 820;

    playerY = 0;
    cpuY = 0;

    playerVelocityY = 0;

    timer = 60;

    playerAttacking = false;
    cpuAttacking = false;

    playerAttackCooldown = false;
    cpuAttackCooldown = false;

    playerBlocking = false;

    blockStart = 0;
    blockCooldownStart = 0;

    combo = 0;

    comboText.textContent = "";

    updateHealth();

    updateBlock();

    updatePositions();

    roundText.textContent =
        `ROUND ${currentRound} / 3`;

    timerText.textContent = "60";

    announceRound();

    gameLoop =
        setInterval(gameUpdate, 16);

    timerLoop =
        setInterval(updateTimer, 1000);

}


/* =========================================================
   ROUND ANNOUNCEMENT
   ========================================================= */

function announceRound() {

    roundPopupText.textContent =
        `ROUND ${currentRound}`;

    roundPopup.classList.remove("show");

    void roundPopup.offsetWidth;

    roundPopup.classList.add("show");

    sound(300, .1);

}


/* =========================================================
   MAIN LOOP
   ========================================================= */

function gameUpdate() {

    if (!gameRunning || roundEnding) {
        return;
    }

    playerMovement();

    playerJump();

    cpuAI();

    updateBlock();

    updatePositions();

}


/* =========================================================
   PLAYER MOVEMENT
   ========================================================= */

function playerMovement() {

    if (playerAttacking) {
        return;
    }

    if (keys.ArrowLeft) {
        playerX -= 5;
    }

    if (keys.ArrowRight) {
        playerX += 5;
    }

    playerX = Math.max(
        10,
        Math.min(
            ARENA_WIDTH - PLAYER_WIDTH - 10,
            playerX
        )
    );

}


/* =========================================================
   JUMP
   ========================================================= */

function playerJump() {

    if (
        keys.ArrowUp &&
        playerY === 0 &&
        !playerAttacking
    ) {

        playerVelocityY = 14;

    }

    if (
        playerY > 0 ||
        playerVelocityY > 0
    ) {

        playerY += playerVelocityY;

        playerVelocityY -= GRAVITY;

        if (playerY <= 0) {

            playerY = 0;

            playerVelocityY = 0;

        }

    }

}


/* =========================================================
   DASH
   ========================================================= */

function dash() {

    if (
        dashCooldown ||
        !gameRunning ||
        playerAttacking ||
        playerBlocking
    ) {
        return;
    }

    dashCooldown = true;

    const direction =
        keys.ArrowLeft ? -1 : 1;

    playerX += direction * 95;

    playerX = Math.max(
        10,
        Math.min(
            ARENA_WIDTH - PLAYER_WIDTH - 10,
            playerX
        )
    );

    player.style.filter =
        "drop-shadow(0 0 20px white)";

    setTimeout(() => {

        player.style.filter = "";

    }, 100);

    sound(700, .05);

    setTimeout(() => {

        dashCooldown = false;

    }, 900);

}


/* =========================================================
   CPU AI
   ========================================================= */

function cpuAI() {

    const settings =
        difficultySettings[difficulty];

    const now = Date.now();

    if (
        now - lastCPUDecision <
        settings.reaction
    ) {
        return;
    }

    lastCPUDecision = now;

    const distance =
        Math.abs(cpuX - playerX);


    /*
       HARD MODE REACTION
    */

    if (
        difficulty === "hard" &&
        playerAttacking &&
        distance < KICK_RANGE
    ) {

        const decision =
            Math.random();

        if (
            decision <
            settings.blockChance
        ) {

            cpuBlock();

            return;

        }

        if (
            decision <
            settings.blockChance +
            settings.dodgeChance
        ) {

            if (cpuX > playerX) {
                cpuX += 70;
            } else {
                cpuX -= 70;
            }

            keepCPUInside();

            return;

        }

    }


    /*
       Don't stand directly on top
    */

    if (distance < 85) {

        if (cpuX > playerX) {
            cpuX += settings.speed * 2;
        } else {
            cpuX -= settings.speed * 2;
        }

        keepCPUInside();

        return;

    }


    /*
       Approach
    */

    if (
        distance > PUNCH_RANGE &&
        !cpuAttacking
    ) {

        if (cpuX > playerX) {
            cpuX -= settings.speed;
        } else {
            cpuX += settings.speed;
        }

    }


    /*
       Attack
    */

    if (
        distance <= KICK_RANGE &&
        !cpuAttackCooldown &&
        !cpuAttacking
    ) {

        if (
            Math.random() <
            settings.attackChance
        ) {

            if (
                playerBlocking &&
                difficulty === "hard"
            ) {

                if (Math.random() < .5) {
                    return;
                }

            }

            if (
                Math.random() < .55
            ) {

                cpuPunch();

            } else {

                cpuKick();

            }

        }

    }

}


/* =========================================================
   CPU BLOCK
   ========================================================= */

function cpuBlock() {

    if (
        cpuAttacking ||
        roundEnding
    ) {
        return;
    }

    cpu.classList.add("blocking");

    setTimeout(() => {

        cpu.classList.remove("blocking");

    }, difficulty === "hard" ? 600 : 450);

}


/* =========================================================
   KEEP CPU INSIDE
   ========================================================= */

function keepCPUInside() {

    cpuX = Math.max(
        10,
        Math.min(
            ARENA_WIDTH - CPU_WIDTH - 10,
            cpuX
        )
    );

}


/* =========================================================
   UPDATE POSITIONS
   ========================================================= */

function updatePositions() {

    player.style.left =
        playerX + "px";

    cpu.style.left =
        cpuX + "px";

    player.style.bottom =
        (96 + playerY) + "px";

    cpu.style.bottom =
        (96 + cpuY) + "px";

}


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener("keydown", event => {

    if (
        event.code === "Space" ||
        event.key.startsWith("Arrow")
    ) {

        event.preventDefault();

    }

    keys[event.key] = true;

    if (
        !gameRunning ||
        roundEnding
    ) {
        return;
    }

    if (event.repeat) {
        return;
    }


    if (event.code === "Space") {
        punch();
    }


    if (
        event.key.toLowerCase() === "f"
    ) {
        kick();
    }


    if (
        event.key.toLowerCase() === "d"
    ) {
        startBlock();
    }


    if (event.key === "Shift") {
        dash();
    }

});


document.addEventListener("keyup", event => {

    keys[event.key] = false;

});


/* =========================================================
   PUNCH
   ========================================================= */

function punch() {

    if (
        playerAttacking ||
        playerAttackCooldown ||
        playerBlocking ||
        roundEnding
    ) {
        return;
    }

    playerAttacking = true;

    playerAttackCooldown = true;

    player.classList.add("hit");

    sound(180, .08);

    showAction("PUNCH!");

    const distance =
        Math.abs(playerX - cpuX);

    const blocked =
        cpu.classList.contains("blocking");


    if (
        distance <= PUNCH_RANGE &&
        !blocked
    ) {

        damageCPU(PUNCH_DAMAGE);

        registerCombo();

        hitAnimation();

        showAction(
            `PUNCH HIT! -${PUNCH_DAMAGE}`
        );

    }

    else if (blocked) {

        showAction("BLOCKED!");

        sound(100, .08);

    }

    else {

        showAction("PUNCH MISS!");

    }


    setTimeout(() => {

        playerAttacking = false;

    }, 550);


    setTimeout(() => {

        playerAttackCooldown = false;

    }, 650);

}


/* =========================================================
   KICK
   ========================================================= */

function kick() {

    if (
        playerAttacking ||
        playerAttackCooldown ||
        playerBlocking ||
        roundEnding
    ) {
        return;
    }

    playerAttacking = true;

    playerAttackCooldown = true;

    player.classList.add("hit");

    sound(120, .1);

    showAction("KICK!");

    const distance =
        Math.abs(playerX - cpuX);

    const blocked =
        cpu.classList.contains("blocking");


    if (
        distance <= KICK_RANGE &&
        !blocked
    ) {

        damageCPU(KICK_DAMAGE);

        registerCombo();

        hitAnimation();

        showAction(
            `KICK HIT! -${KICK_DAMAGE}`
        );

    }

    else if (blocked) {

        showAction("BLOCKED!");

    }

    else {

        showAction("KICK MISS!");

    }


    setTimeout(() => {

        playerAttacking = false;

    }, 750);


    setTimeout(() => {

        playerAttackCooldown = false;

    }, 900);

}


/* =========================================================
   CPU PUNCH
   ========================================================= */

function cpuPunch() {

    if (
        cpuAttackCooldown ||
        cpuAttacking ||
        roundEnding
    ) {
        return;
    }

    cpuAttacking = true;

    cpuAttackCooldown = true;

    const settings =
        difficultySettings[difficulty];

    const distance =
        Math.abs(cpuX - playerX);


    if (
        distance <= PUNCH_RANGE &&
        !playerBlocking &&
        Math.random() >
        settings.mistakeChance
    ) {

        damagePlayer(CPU_PUNCH_DAMAGE);

        showAction(
            `CPU PUNCH! -${CPU_PUNCH_DAMAGE}`
        );

        sound(160, .08);

    }

    else if (playerBlocking) {

        showAction("BLOCKED!");

    }

    else {

        showAction("CPU MISS!");

    }


    setTimeout(() => {

        cpuAttacking = false;

    }, 350);


    setTimeout(() => {

        cpuAttackCooldown = false;

    }, settings.punchCooldown);

}


/* =========================================================
   CPU KICK
   ========================================================= */

function cpuKick() {

    if (
        cpuAttackCooldown ||
        cpuAttacking ||
        roundEnding
    ) {
        return;
    }

    cpuAttacking = true;

    cpuAttackCooldown = true;

    const settings =
        difficultySettings[difficulty];

    const distance =
        Math.abs(cpuX - playerX);


    if (
        distance <= KICK_RANGE &&
        !playerBlocking &&
        Math.random() >
        settings.mistakeChance
    ) {

        damagePlayer(CPU_KICK_DAMAGE);

        showAction(
            `CPU KICK! -${CPU_KICK_DAMAGE}`
        );

        sound(120, .1);

    }

    else if (playerBlocking) {

        showAction("BLOCKED!");

    }

    else {

        showAction("CPU MISS!");

    }


    setTimeout(() => {

        cpuAttacking = false;

    }, 450);


    setTimeout(() => {

        cpuAttackCooldown = false;

    }, settings.kickCooldown);

}


/* =========================================================
   DAMAGE CPU
   ========================================================= */

function damageCPU(amount) {

    if (roundEnding) {
        return;
    }

    cpuHP -= amount;

    cpuHP =
        Math.max(0, cpuHP);

    updateHealth();

    cpu.classList.add("hit");

    setTimeout(() => {

        cpu.classList.remove("hit");

    }, 160);


    if (cpuHP <= 0) {

        endRound("PLAYER");

    }

}


/* =========================================================
   DAMAGE PLAYER
   ========================================================= */

function damagePlayer(amount) {

    if (roundEnding) {
        return;
    }

    if (playerBlocking) {

        showAction("BLOCKED!");

        sound(90, .05);

        return;

    }

    playerHP -= amount;

    playerHP =
        Math.max(0, playerHP);

    updateHealth();

    player.classList.add("hit");

    arena.classList.add("shake");

    setTimeout(() => {

        player.classList.remove("hit");

        arena.classList.remove("shake");

    }, 180);


    if (playerHP <= 0) {

        endRound("CPU");

    }

}


/* =========================================================
   HEALTH
   ========================================================= */

function updateHealth() {

    playerHealth.style.width =
        playerHP + "%";

    cpuHealth.style.width =
        cpuHP + "%";

    playerHealthText.textContent =
        Math.round(playerHP);

    cpuHealthText.textContent =
        Math.round(cpuHP);

}


/* =========================================================
   COMBO
   ========================================================= */

function registerCombo() {

    combo++;

    clearTimeout(comboTimer);

    if (combo >= 2) {

        comboText.textContent =
            `${combo} HIT COMBO`;

    }

    comboTimer = setTimeout(() => {

        combo = 0;

        comboText.textContent = "";

    }, 1400);

}


/* =========================================================
   HIT EFFECT
   ========================================================= */

function hitAnimation() {

    hitEffect.classList.remove("active");

    void hitEffect.offsetWidth;

    hitEffect.classList.add("active");

    arena.classList.remove("shake");

    void arena.offsetWidth;

    arena.classList.add("shake");

}


/* =========================================================
   BLOCK
   ========================================================= */

function startBlock() {

    if (
        playerAttacking ||
        playerBlocking ||
        roundEnding
    ) {
        return;
    }

    const now = Date.now();

    if (
        blockCooldownStart &&
        now - blockCooldownStart <
        BLOCK_COOLDOWN
    ) {
        return;
    }

    playerBlocking = true;

    blockStart = now;

    player.classList.add("blocking");

    updateBlock();

}


function updateBlock() {

    const now = Date.now();


    if (playerBlocking) {

        const elapsed =
            now - blockStart;

        const remaining =
            Math.max(
                0,
                BLOCK_TIME - elapsed
            );

        blockBar.style.width =
            (remaining / BLOCK_TIME * 100)
            + "%";

        blockStatus.textContent =
            `BLOCKING ${Math.ceil(
                remaining / 1000
            )}s`;


        if (remaining <= 0) {

            playerBlocking = false;

            blockCooldownStart = now;

            player.classList.remove(
                "blocking"
            );

        }

        return;

    }


    if (
        blockCooldownStart &&
        now - blockCooldownStart <
        BLOCK_COOLDOWN
    ) {

        const remaining =
            BLOCK_COOLDOWN -
            (now - blockCooldownStart);

        blockBar.style.width = "0%";

        blockStatus.textContent =
            `COOLDOWN ${Math.ceil(
                remaining / 1000
            )}s`;

        return;

    }


    blockBar.style.width = "100%";

    blockStatus.textContent =
        "BLOCK READY";

}


/* =========================================================
   TIMER
   ========================================================= */

function updateTimer() {

    if (
        !gameRunning ||
        roundEnding
    ) {
        return;
    }

    timer--;

    timer =
        Math.max(0, timer);

    timerText.textContent =
        timer;


    if (timer <= 10) {

        timerText.style.color =
            "#ff315c";

    } else {

        timerText.style.color =
            "#ffe600";

    }


    if (timer <= 0) {

        if (playerHP > cpuHP) {

            endRound("PLAYER");

        }

        else if (cpuHP > playerHP) {

            endRound("CPU");

        }

        else {

            endRound("DRAW");

        }

    }

}


/* =========================================================
   END ROUND
   ========================================================= */

function endRound(winner) {

    if (roundEnding) {
        return;
    }

    roundEnding = true;

    clearLoops();


    if (winner === "PLAYER") {

        playerWins++;

        playerWinsText.textContent =
            playerWins;

        setMatchResult(
            currentRound,
            "WIN"
        );

        showAction(
            "ROUND WON!"
        );

        sound(700, .12);

    }

    else if (winner === "CPU") {

        cpuWins++;

        cpuWinsText.textContent =
            cpuWins;

        setMatchResult(
            currentRound,
            "LOSS"
        );

        showAction(
            "ROUND LOST!"
        );

        sound(120, .15);

    }

    else {

        setMatchResult(
            currentRound,
            "DRAW"
        );

        showAction(
            "DRAW!"
        );

    }


    /*
       Always play all 3 rounds.
    */

    if (currentRound < 3) {

        setTimeout(() => {

            currentRound++;

            startRound();

        }, 2000);

    }

    else {

        setTimeout(() => {

            finishSeries();

        }, 1800);

    }

}


/* =========================================================
   FINISH SERIES
   ========================================================= */

function finishSeries() {

    gameRunning = false;

    clearLoops();

    roundEnding = true;


    const playerWon =
        playerWins > cpuWins;

    const cpuWon =
        cpuWins > playerWins;


    if (playerWon) {

        resultTitle.textContent =
            "VICTORY";

        resultTitle.classList.remove(
            "defeat"
        );

        resultMessage.textContent =
            "YOU OWN THE NEON ARENA";

        showConfetti();

        sound(900, .15);

        setTimeout(() => {
            sound(1200, .2);
        }, 150);

    }

    else if (cpuWon) {

        resultTitle.textContent =
            "DEFEAT";

        resultTitle.classList.add(
            "defeat"
        );

        resultMessage.textContent =
            "THE CPU RULES THIS ROUND";

        sound(100, .25);

    }

    else {

        resultTitle.textContent =
            "DRAW";

        resultTitle.classList.remove(
            "defeat"
        );

        resultMessage.textContent =
            "THE ARENA HAS NO WINNER";

    }


    resultScore.textContent =
        `${playerWins} - ${cpuWins}`;


    resultOverlay.classList.remove(
        "hidden"
    );

}


/* =========================================================
   MATCH HISTORY
   ========================================================= */

function setMatchResult(
    round,
    result
) {

    const box =
        matchBoxes[round - 1];

    if (!box) {
        return;
    }

    box.classList.remove(
        "win",
        "loss"
    );


    if (result === "WIN") {

        box.innerHTML =
            `<span>${String(round).padStart(2,"0")}</span> WIN`;

        box.classList.add("win");

    }

    else if (result === "LOSS") {

        box.innerHTML =
            `<span>${String(round).padStart(2,"0")}</span> LOSS`;

        box.classList.add("loss");

    }

    else {

        box.innerHTML =
            `<span>${String(round).padStart(2,"0")}</span> DRAW`;

    }

}


/* =========================================================
   RESET MATCH HISTORY
   ========================================================= */

function resetMatchHistory() {

    matchBoxes.forEach(
        (box, index) => {

            box.classList.remove(
                "win",
                "loss"
            );

            box.innerHTML =
                `<span>${String(index + 1)
                    .padStart(2,"0")}</span>`;

        }
    );

}


/* =========================================================
   ACTION MESSAGE
   ========================================================= */

let actionTimeout;

function showAction(message) {

    actionText.textContent =
        message;

    actionText.classList.add(
        "show"
    );

    clearTimeout(actionTimeout);

    actionTimeout =
        setTimeout(() => {

            actionText.classList.remove(
                "show"
            );

        }, 900);

}


/* =========================================================
   CONFETTI
   ========================================================= */

function showConfetti() {

    const pieces = 160;

    for (let i = 0; i < pieces; i++) {

        const piece =
            document.createElement("div");

        piece.className =
            "confetti";

        piece.style.left =
            Math.random() * 100 + "vw";

        piece.style.animationDuration =
            (2 + Math.random() * 3) + "s";

        piece.style.animationDelay =
            Math.random() * .8 + "s";

        piece.style.transform =
            `rotate(${Math.random() * 360}deg)`;

        piece.style.background =
            [
                "#00eaff",
                "#ff315c",
                "#ffe600",
                "#00ff9d",
                "#ffffff",
                "#9d5cff"
            ][
                Math.floor(
                    Math.random() * 6
                )
            ];

        document.body.appendChild(piece);


        setTimeout(() => {

            piece.remove();

        }, 6000);

    }

}


/* =========================================================
   CLEAR LOOPS
   ========================================================= */

function clearLoops() {

    if (gameLoop) {

        clearInterval(gameLoop);

        gameLoop = null;

    }

    if (timerLoop) {

        clearInterval(timerLoop);

        timerLoop = null;

    }

}


/* =========================================================
   INITIALIZE
   ========================================================= */

updateHealth();

updateBlock();

updatePositions();

roundText.textContent =
    "ROUND 1 / 3";

timerText.textContent =
    "60";

playerWinsText.textContent =
    "0";

cpuWinsText.textContent =
    "0";