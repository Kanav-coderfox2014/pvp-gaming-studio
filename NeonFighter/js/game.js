const arena = document.getElementById("arena");

const playerEl = document.getElementById("player");
const cpuEl = document.getElementById("cpu");

const playerHealthEl = document.getElementById("playerHealth");
const cpuHealthEl = document.getElementById("cpuHealth");

const roundNumberEl = null;
const playerRoundsEl = document.getElementById("playerScore");
const cpuRoundsEl = document.getElementById("cpuScore");

const timerEl = document.getElementById("timer");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

const punchBtn = document.getElementById("punchBtn");
const kickBtn = document.getElementById("kickBtn");
const blockBtn = document.getElementById("blockBtn");
const jumpBtn = document.getElementById("jumpBtn");

const blockIndicator = document.getElementById("blockIndicator");
const hitEffect = document.getElementById("hitEffect");

const resultOverlay = document.getElementById("resultOverlay");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultMessage");
const resultScore = document.getElementById("resultScore");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const FLOOR_HEIGHT = 70;

/* ==================================================
   EASIER JUMP SETTINGS
   ================================================== */

const JUMP_POWER = 18;
const GRAVITY = -0.62;

/*
   The old jump was too weak.

   New jump:
   - goes higher
   - stays in the air slightly longer
   - is easier to control
   - gives more time to move toward higher platforms
*/

const MOVE_SPEED = 4;
const ROUND_TIME = 60;

const BLOCK_DURATION = 3000;
const BLOCK_COOLDOWN = 10000;

const ATTACK_COOLDOWN = 430;

const PLAYER_PUNCH_DAMAGE = 10;
const PLAYER_KICK_DAMAGE = 14;

const CPU_PUNCH_DAMAGE = 8;
const CPU_KICK_DAMAGE = 11;

const PLATFORM_HEIGHT = 16;

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

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false
};


/* ==================================================
   PLAYER
   ================================================== */

const player = {
    x: 170,
    y: FLOOR_HEIGHT,

    width: 43,
    collisionHeight: 120,

    vy: 0,

    health: 100,

    grounded: true,
    platform: null,

    facing: 1,

    blocking: false,
    attacking: false,

    attackType: null,
    attackTimer: 0,

    lastAttack: 0,

    blockCooldownUntil: 0,
    blockStartedAt: 0
};


/* ==================================================
   CPU
   ================================================== */

const cpu = {
    x: 850,
    y: FLOOR_HEIGHT,

    width: 43,
    collisionHeight: 120,

    vy: 0,

    health: 100,

    grounded: true,
    platform: null,

    facing: -1,

    blocking: false,
    attacking: false,

    attackType: null,
    attackTimer: 0,

    lastAttack: 0,

    blockCooldownUntil: 0,
    blockStartedAt: 0,

    aiTimer: 0,
    jumpTimer: 0
};


/* ==================================================
   PLATFORM SETUP
   ================================================== */

function createPlatforms() {

    platforms = [];

    const platformData = [

        {
            element: document.querySelector(".platform-left-low"),
            type: "low"
        },

        {
            element: document.querySelector(".platform-right-low"),
            type: "low"
        },

        {
            element: document.querySelector(".platform-center"),
            type: "center"
        },

        {
            element: document.querySelector(".platform-left-high"),
            type: "high"
        },

        {
            element: document.querySelector(".platform-right-high"),
            type: "high"
        }

    ];


    platformData.forEach(item => {

        if (!item.element) return;

        const rect =
            item.element.getBoundingClientRect();

        const arenaRect =
            arena.getBoundingClientRect();

        const x =
            rect.left - arenaRect.left;

        const width =
            rect.width;

        const computed =
            getComputedStyle(item.element);

        const bottomValue =
            parseFloat(computed.bottom) || 0;

        const supportY =
            bottomValue + rect.height;


        platforms.push({

            element: item.element,

            type: item.type,

            x: x,

            width: width,

            supportY: supportY

        });

    });

}


/* ==================================================
   RESET FIGHTER
   ================================================== */

function resetFighter(fighter, x, facing) {

    fighter.x = x;

    fighter.y = FLOOR_HEIGHT;

    fighter.vy = 0;

    fighter.health = 100;

    fighter.grounded = true;

    fighter.platform = null;

    fighter.facing = facing;

    fighter.blocking = false;

    fighter.attacking = false;

    fighter.attackType = null;

    fighter.attackTimer = 0;

    fighter.lastAttack = 0;

    fighter.blockCooldownUntil = 0;

    fighter.blockStartedAt = 0;

    fighter.aiTimer = 0;

    fighter.jumpTimer = 0;

}


/* ==================================================
   RESET ROUND
   ================================================== */

function resetRound() {

    resetFighter(
        player,
        170,
        1
    );

    resetFighter(
        cpu,
        Math.max(300, arena.clientWidth - 213),
        -1
    );


    timer = ROUND_TIME;

    roundActive = true;

    updateHealth();

    updateTimer();

    updateScore();

    updateFighterVisual(
        player,
        playerEl
    );

    updateFighterVisual(
        cpu,
        cpuEl
    );


    resultOverlay.classList.remove("show");

    startTimer();

}


/* ==================================================
   START GAME
   ================================================== */

function startGame() {

    createPlatforms();

    playerRounds = 0;

    cpuRounds = 0;

    roundNumber = 1;

    gameRunning = true;

    resetRound();

    lastTime = performance.now();

    requestAnimationFrame(gameLoop);

}


/* ==================================================
   TIMER
   ================================================== */

function startTimer() {

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {

        if (!gameRunning || !roundActive) {
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

    if (timerEl) {

        timerEl.textContent = timer;

    }

}


/* ==================================================
   HEALTH
   ================================================== */

function updateHealth() {

    playerHealthEl.style.width =
        `${Math.max(0, player.health)}%`;

    cpuHealthEl.style.width =
        `${Math.max(0, cpu.health)}%`;

    const playerHealthText =
        document.getElementById("playerHealthText");

    const cpuHealthText =
        document.getElementById("cpuHealthText");


    if (playerHealthText) {

        playerHealthText.textContent =
            Math.ceil(player.health);

    }

    if (cpuHealthText) {

        cpuHealthText.textContent =
            Math.ceil(cpu.health);

    }

}


/* ==================================================
   SCORE
   ================================================== */

function updateScore() {

    if (playerRoundsEl) {

        playerRoundsEl.textContent =
            playerRounds;

    }

    if (cpuRoundsEl) {

        cpuRoundsEl.textContent =
            cpuRounds;

    }

    if (roundNumberEl) {

        roundNumberEl.textContent =
            roundNumber;

    }

}


/* ==================================================
   KEYBOARD
   ================================================== */

window.addEventListener(
    "keydown",
    event => {

        if (event.code === "ArrowLeft") {

            keys.ArrowLeft = true;

        }


        if (event.code === "ArrowRight") {

            keys.ArrowRight = true;

        }


        if (event.code === "ArrowUp") {

            keys.ArrowUp = true;

            if (!event.repeat) {

                playerJump();

            }

        }


        if (
            event.code === "KeyF" ||
            event.code === "KeyJ"
        ) {

            if (!event.repeat) {

                playerPunch();

            }

        }


        if (event.code === "Space") {

            event.preventDefault();

            if (!event.repeat) {

                playerKick();

            }

        }


        if (event.code === "KeyB") {

            if (!event.repeat) {

                playerBlock();

            }

        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        if (event.code === "ArrowLeft") {

            keys.ArrowLeft = false;

        }


        if (event.code === "ArrowRight") {

            keys.ArrowRight = false;

        }


        if (event.code === "ArrowUp") {

            keys.ArrowUp = false;

        }

    }
);


/* ==================================================
   PLAYER MOVEMENT
   ================================================== */

function movePlayer() {

    if (!gameRunning || !roundActive) {
        return;
    }

    let speed = MOVE_SPEED;


    /*
       IMPORTANT:
       The player keeps full horizontal control
       while jumping.

       This makes the higher platforms MUCH easier
       to reach.
    */

    if (!player.grounded) {

        speed *= 1.0;

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
                arena.clientWidth - player.width,
                player.x
            )
        );

}


/* ==================================================
   PLAYER JUMP
   ================================================== */

function playerJump() {

    if (!gameRunning || !roundActive) {
        return;
    }


    if (!player.grounded) {
        return;
    }


    /*
       MUCH STRONGER JUMP

       This is the main change.

       The player can now jump from:
       FLOOR
          ↓
       LOW PLATFORM
          ↓
       CENTER PLATFORM
          ↓
       HIGH PLATFORM
    */

    player.vy = JUMP_POWER;

    player.grounded = false;

    player.platform = null;

}


/* ==================================================
   PLAYER PUNCH
   ================================================== */

function playerPunch() {

    if (!gameRunning || !roundActive) {
        return;
    }

    performPlayerAttack("punch");

}


/* ==================================================
   PLAYER KICK
   ================================================== */

function playerKick() {

    if (!gameRunning || !roundActive) {
        return;
    }

    performPlayerAttack("kick");

}


/* ==================================================
   PLAYER ATTACK
   ================================================== */

function performPlayerAttack(type) {

    const now = performance.now();


    if (
        now - player.lastAttack <
        ATTACK_COOLDOWN
    ) {

        return;

    }


    if (player.blocking) {
        return;
    }


    player.lastAttack = now;

    player.attacking = true;

    player.attackType = type;

    player.attackTimer = 260;


    playerEl.classList.remove(
        "punch",
        "kick"
    );


    void playerEl.offsetWidth;


    playerEl.classList.add(type);


    setTimeout(() => {

        if (roundActive) {

            checkPlayerAttack(type);

        }

    }, 100);


    setTimeout(() => {

        playerEl.classList.remove(
            "punch",
            "kick"
        );

    }, 260);

}


/* ==================================================
   PLAYER ATTACK HIT DETECTION
   ================================================== */

function checkPlayerAttack(type) {

    if (!roundActive) {
        return;
    }


    const distance =
        Math.abs(
            (player.x + player.width / 2) -
            (cpu.x + cpu.width / 2)
        );


    /*
       Attacks ONLY hit when the fighters
       are actually close.
    */

    if (distance > 72) {

        showHitEffect("MISS");

        return;

    }


    const damage =
        type === "punch"
            ? PLAYER_PUNCH_DAMAGE
            : PLAYER_KICK_DAMAGE;


    if (cpu.blocking) {

        showHitEffect("BLOCK");

        return;

    }


    cpu.health -= damage;

    cpu.health =
        Math.max(
            0,
            cpu.health
        );


    showHitEffect(
        `-${damage}`
    );


    updateHealth();


    if (cpu.health <= 0) {

        endRound("player");

    }

}


/* ==================================================
   PLAYER BLOCK
   ================================================== */

function playerBlock() {

    if (!gameRunning || !roundActive) {
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


    player.blocking = true;

    player.blockStartedAt = now;


    playerEl.classList.add(
        "blocking"
    );


    if (blockIndicator) {

        blockIndicator.classList.add(
            "active"
        );

        blockIndicator.textContent = "3";

    }


    const countdownStart =
        performance.now();


    function blockCountdown() {

        if (!player.blocking) {
            return;
        }


        const elapsed =
            performance.now() -
            countdownStart;


        const remaining =
            Math.ceil(
                (BLOCK_DURATION - elapsed) /
                1000
            );


        if (remaining > 0) {

            if (blockIndicator) {

                blockIndicator.textContent =
                    remaining;

            }


            requestAnimationFrame(
                blockCountdown
            );

        } else {

            stopPlayerBlock();

        }

    }


    requestAnimationFrame(
        blockCountdown
    );

}


/* ==================================================
   STOP PLAYER BLOCK
   ================================================== */

function stopPlayerBlock() {

    if (!player.blocking) {
        return;
    }


    player.blocking = false;


    playerEl.classList.remove(
        "blocking"
    );


    if (blockIndicator) {

        blockIndicator.classList.remove(
            "active"
        );

    }


    player.blockCooldownUntil =
        performance.now() +
        BLOCK_COOLDOWN;

}


/* ==================================================
   CPU AI
   ================================================== */

function updateCPU(delta) {

    if (!gameRunning || !roundActive) {
        return;
    }


    const difficultySettings = {

        easy: {

            speed: 1.7,

            attackChance: 0.008,

            jumpChance: 0.006,

            blockChance: 0.004

        },


        medium: {

            speed: 2.4,

            attackChance: 0.012,

            jumpChance: 0.009,

            blockChance: 0.007

        },


        hard: {

            speed: 3.0,

            attackChance: 0.018,

            jumpChance: 0.012,

            blockChance: 0.009

        }

    };


    const settings =
        difficultySettings[difficulty];


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


    /*
       If the player is on a higher platform,
       CPU tries to jump toward it.
    */

    if (
        player.platform &&
        cpu.platform !== player.platform &&
        cpu.grounded
    ) {

        if (
            player.platform.supportY >
            cpu.y + 10
        ) {

            cpuJump();

        }

    }


    /*
       NORMAL CPU MOVEMENT
    */

    if (absoluteDistance > 62) {

        if (horizontalDistance > 0) {

            cpu.x +=
                settings.speed;

        } else {

            cpu.x -=
                settings.speed;

        }

    }


    /*
       RANDOM JUMP
    */

    if (
        cpu.grounded &&
        Math.random() <
        settings.jumpChance
    ) {

        cpuJump();

    }


    /*
       ATTACK
    */

    if (
        absoluteDistance <= 72 &&
        Math.random() <
        settings.attackChance
    ) {

        cpuAttack(
            Math.random() < 0.55
                ? "punch"
                : "kick"
        );

    }


    /*
       BLOCK
    */

    if (
        absoluteDistance <= 90 &&
        player.attacking &&
        Math.random() <
        settings.blockChance
    ) {

        cpuBlock();

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


/* ==================================================
   CPU JUMP
   ================================================== */

function cpuJump() {

    if (!cpu.grounded) {
        return;
    }


    /*
       CPU gets the same easier jump
       as the player.
    */

    cpu.vy = JUMP_POWER;

    cpu.grounded = false;

    cpu.platform = null;

}


/* ==================================================
   CPU ATTACK
   ================================================== */

function cpuAttack(type) {

    const now =
        performance.now();


    if (
        now - cpu.lastAttack <
        ATTACK_COOLDOWN
    ) {

        return;

    }


    if (cpu.blocking) {
        return;
    }


    cpu.lastAttack = now;

    cpu.attacking = true;

    cpu.attackType = type;

    cpu.attackTimer = 260;


    cpuEl.classList.remove(
        "punch",
        "kick"
    );


    void cpuEl.offsetWidth;


    cpuEl.classList.add(type);


    setTimeout(() => {

        if (roundActive) {

            checkCPUAttack(type);

        }

    }, 100);


    setTimeout(() => {

        cpuEl.classList.remove(
            "punch",
            "kick"
        );

    }, 260);

}


/* ==================================================
   CPU ATTACK HIT
   ================================================== */

function checkCPUAttack(type) {

    if (!roundActive) {
        return;
    }


    const distance =
        Math.abs(
            (cpu.x + cpu.width / 2) -
            (player.x + player.width / 2)
        );


    if (distance > 72) {
        return;
    }


    if (player.blocking) {

        showHitEffect("BLOCK");

        return;

    }


    const damage =
        type === "punch"
            ? CPU_PUNCH_DAMAGE
            : CPU_KICK_DAMAGE;


    player.health -= damage;

    player.health =
        Math.max(
            0,
            player.health
        );


    showHitEffect(
        `-${damage}`
    );


    updateHealth();


    if (player.health <= 0) {

        endRound("cpu");

    }

}


/* ==================================================
   CPU BLOCK
   ================================================== */

function cpuBlock() {

    if (cpu.blocking) {
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


    cpu.blocking = true;

    cpu.blockStartedAt = now;


    cpuEl.classList.add(
        "blocking"
    );


    setTimeout(() => {

        stopCPUBlock();

    }, BLOCK_DURATION);

}


/* ==================================================
   STOP CPU BLOCK
   ================================================== */

function stopCPUBlock() {

    if (!cpu.blocking) {
        return;
    }


    cpu.blocking = false;


    cpuEl.classList.remove(
        "blocking"
    );


    cpu.blockCooldownUntil =
        performance.now() +
        BLOCK_COOLDOWN;

}


/* ==================================================
   PHYSICS
   ================================================== */

function updatePhysics(fighter) {

    const previousY =
        fighter.y;


    /*
       CURRENT PLATFORM
    */

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


        fighter.grounded = false;

        fighter.platform = null;

    }


    /*
       FLOOR
    */

    if (
        fighter.grounded &&
        !fighter.platform
    ) {

        fighter.y =
            FLOOR_HEIGHT;

        fighter.vy = 0;

    }


    /*
       GRAVITY

       The smaller gravity value is what
       makes the jump easier and gives
       the player more time in the air.
    */

    fighter.vy += GRAVITY;

    fighter.y += fighter.vy;

    fighter.grounded = false;


    /*
       PLATFORM LANDING

       Only land while falling.
    */

    if (fighter.vy <= 0) {

        const sortedPlatforms =
            [...platforms].sort(
                (a, b) =>
                    b.supportY -
                    a.supportY
            );


        for (
            const platform of
            sortedPlatforms
        ) {

            const crossedPlatform =
                previousY >=
                platform.supportY &&
                fighter.y <=
                platform.supportY;


            if (
                crossedPlatform &&
                horizontalOverlap(
                    fighter,
                    platform
                )
            ) {

                fighter.y =
                    platform.supportY;

                fighter.vy = 0;

                fighter.grounded = true;

                fighter.platform =
                    platform;

                return;

            }

        }

    }


    /*
       FLOOR LANDING
    */

    if (
        fighter.y <=
        FLOOR_HEIGHT
    ) {

        fighter.y =
            FLOOR_HEIGHT;

        fighter.vy = 0;

        fighter.grounded = true;

        fighter.platform = null;

    }

}


/* ==================================================
   HORIZONTAL PLATFORM COLLISION
   ================================================== */

function horizontalOverlap(
    fighter,
    platform
) {

    /*
       A little forgiveness is added to
       make platform landings easier.
    */

    const left =
        fighter.x + 4;

    const right =
        fighter.x +
        fighter.width -
        4;


    const platformLeft =
        platform.x;

    const platformRight =
        platform.x +
        platform.width;


    return (
        right >
        platformLeft &&
        left <
        platformRight
    );

}


/* ==================================================
   VISUAL UPDATE
   ================================================== */

function updateFighterVisual(
    fighter,
    element
) {

    element.style.left =
        `${fighter.x}px`;


    element.style.bottom =
        `${fighter.y}px`;


    if (fighter.facing === 1) {

        element.style.transform =
            "scaleX(1)";

    } else {

        element.style.transform =
            "scaleX(-1)";

    }

}


/* ==================================================
   HIT EFFECT
   ================================================== */

function showHitEffect(text) {

    if (!hitEffect) {
        return;
    }


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


/* ==================================================
   END ROUND
   ================================================== */

function endRound(winner) {

    if (!roundActive) {
        return;
    }


    roundActive = false;

    clearInterval(
        timerInterval
    );


    if (winner === "player") {

        playerRounds++;

    } else {

        cpuRounds++;

    }


    updateScore();


    /*
       ALWAYS PLAY ALL 3 ROUNDS.
    */

    if (roundNumber < 3) {

        roundNumber++;


        setTimeout(() => {

            if (gameRunning) {

                resetRound();

            }

        }, 1200);


        return;

    }


    finishMatch();

}


/* ==================================================
   FINISH MATCH
   ================================================== */

function finishMatch() {

    gameRunning = false;

    roundActive = false;

    clearInterval(
        timerInterval
    );


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


        resultText.textContent =
            "Amazing fighting!";


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


        resultText.textContent =
            "Amazing fighting!";

    }

    else {

        resultTitle.textContent =
            "DRAW";


        resultScore.textContent =
            `${playerRounds} - ${cpuRounds}`;


        resultText.textContent =
            "Amazing fighting!";

    }

}


/* ==================================================
   CONFETTI
   ================================================== */

function createConfetti() {

    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );


        piece.className =
            "confetti";


        piece.style.left =
            `${Math.random() * 100}%`;


        piece.style.animationDelay =
            `${Math.random() * 0.8}s`;


        piece.style.transform =
            `rotate(${Math.random() * 360}deg)`;


        document.body.appendChild(
            piece
        );


        setTimeout(() => {

            piece.remove();

        }, 3000);

    }

}


/* ==================================================
   GAME LOOP
   ================================================== */

function gameLoop(timestamp) {

    if (!gameRunning) {
        return;
    }


    const delta =
        Math.min(
            32,
            timestamp - lastTime
        );


    lastTime = timestamp;


    movePlayer();

    updateCPU(delta);

    updatePhysics(player);

    updatePhysics(cpu);


    updateFighterVisual(
        player,
        playerEl
    );


    updateFighterVisual(
        cpu,
        cpuEl
    );


    /*
       ATTACK TIMERS
    */

    if (
        player.attackTimer >
        0
    ) {

        player.attackTimer -=
            delta;


        if (
            player.attackTimer <=
            0
        ) {

            player.attacking =
                false;

        }

    }


    if (
        cpu.attackTimer >
        0
    ) {

        cpu.attackTimer -=
            delta;


        if (
            cpu.attackTimer <=
            0
        ) {

            cpu.attacking =
                false;

        }

    }


    requestAnimationFrame(
        gameLoop
    );

}


/* ==================================================
   DIFFICULTY BUTTONS
   ================================================== */

difficultyButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                if (
                    button.id ===
                    "easyBtn"
                ) {

                    difficulty =
                        "easy";

                }


                if (
                    button.id ===
                    "mediumBtn"
                ) {

                    difficulty =
                        "medium";

                }


                if (
                    button.id ===
                    "hardBtn"
                ) {

                    difficulty =
                        "hard";

                }


                difficultyButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                /*
                   Changing difficulty
                   automatically restarts.
                */

                startGame();

            }
        );

    }
);


/* ==================================================
   BUTTON CONTROLS
   ================================================== */

if (punchBtn) {

    punchBtn.addEventListener(
        "click",
        playerPunch
    );

}


if (kickBtn) {

    kickBtn.addEventListener(
        "click",
        playerKick
    );

}


if (blockBtn) {

    blockBtn.addEventListener(
        "click",
        playerBlock
    );

}


if (jumpBtn) {

    jumpBtn.addEventListener(
        "click",
        playerJump
    );

}


/* ==================================================
   START BUTTON
   ================================================== */

if (startBtn) {

    startBtn.addEventListener(
        "click",
        () => {

            startGame();

        }
    );

}


/* ==================================================
   RESTART BUTTON
   ================================================== */

if (restartBtn) {

    restartBtn.addEventListener(
        "click",
        () => {

            startGame();

        }
    );

}


/* ==================================================
   FULLSCREEN
   ================================================== */

if (fullscreenBtn) {

    fullscreenBtn.addEventListener(
        "click",
        async () => {

            try {

                if (
                    !document.fullscreenElement
                ) {

                    await document.documentElement
                        .requestFullscreen();

                }

                else {

                    await document
                        .exitFullscreen();

                }


                setTimeout(() => {

                    createPlatforms();


                    player.x =
                        Math.min(
                            player.x,
                            arena.clientWidth -
                            player.width
                        );


                    cpu.x =
                        Math.min(
                            cpu.x,
                            arena.clientWidth -
                            cpu.width
                        );

                }, 300);

            }

            catch (error) {

                console.log(
                    "Fullscreen error:",
                    error
                );

            }

        }
    );

}


/* ==================================================
   RESIZE
   ================================================== */

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
);


/* ==================================================
   INITIAL SETUP
   ================================================== */

window.addEventListener(
    "load",
    () => {

        createPlatforms();


        resetFighter(
            player,
            170,
            1
        );


        resetFighter(
            cpu,
            Math.max(
                300,
                arena.clientWidth - 213
            ),
            -1
        );


        updateHealth();

        updateTimer();

        updateScore();


        updateFighterVisual(
            player,
            playerEl
        );


        updateFighterVisual(
            cpu,
            cpuEl
        );


        difficultyButtons.forEach(
            button => {

                if (
                    button.id ===
                    "easyBtn"
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );

    }
);