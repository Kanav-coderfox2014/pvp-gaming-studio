/* =========================================================
   NEON FIGHTERS
   Complete game.js
   ========================================================= */

const arena = document.getElementById("arena");

const playerEl = document.getElementById("player");
const cpuEl = document.getElementById("cpu");

const playerHealthEl = document.getElementById("playerHealth");
const cpuHealthEl = document.getElementById("cpuHealth");

const playerHealthText = document.getElementById("playerHealthText");
const cpuHealthText = document.getElementById("cpuHealthText");

const timerEl = document.getElementById("timer");

const playerScoreEl = document.getElementById("playerScore");
const cpuScoreEl = document.getElementById("cpuScore");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const easyBtn = document.getElementById("easyBtn");
const mediumBtn = document.getElementById("mediumBtn");
const hardBtn = document.getElementById("hardBtn");

const resultOverlay = document.getElementById("resultOverlay");
const resultTitle = document.getElementById("resultTitle");
const resultScore = document.getElementById("resultScore");
const resultMessage = document.getElementById("resultMessage");
const playAgainBtn = document.getElementById("playAgainBtn");

const confetti = document.getElementById("confetti");
const blockIndicator = document.getElementById("blockIndicator");
const hitEffect = document.getElementById("hitEffect");


/* =========================================================
   IMPORTANT:
   Move fullscreen-related elements INSIDE the arena.
   This makes them visible when the arena enters fullscreen.
   ========================================================= */

if (blockIndicator && !arena.contains(blockIndicator)) {
    arena.appendChild(blockIndicator);
}

if (resultOverlay && !arena.contains(resultOverlay)) {
    arena.appendChild(resultOverlay);
}


/* =========================================================
   GAME SETTINGS
   ========================================================= */

const ARENA_WIDTH = 1100;

const FIGHTER_WIDTH = 55;
const FIGHTER_HEIGHT = 110;

const FLOOR_Y = 70;

const GRAVITY = -0.72;
const JUMP_POWER = 15;

const MOVE_SPEED = 4;

const ROUND_TIME = 60;

const BLOCK_DURATION = 3000;

const ATTACK_COOLDOWN = 430;

const PLAYER_PUNCH_DAMAGE = 10;
const PLAYER_KICK_DAMAGE = 14;


/* =========================================================
   GAME STATE
   ========================================================= */

let difficulty = "easy";

let gameRunning = false;

let animationFrame = null;

let lastTime = 0;

let roundTime = ROUND_TIME;

let currentRound = 1;

let playerWins = 0;
let cpuWins = 0;

let roundFinished = false;

let keys = {};

let platforms = [];

let blockTimer = 0;

let playerAttackTimer = 0;
let cpuAttackTimer = 0;

let playerAttackType = null;
let cpuAttackType = null;

let playerAttackEnd = 0;
let cpuAttackEnd = 0;

let playerMessageTimer = 0;
let cpuMessageTimer = 0;


/* =========================================================
   FIGHTERS
   y = distance from bottom of arena
   ========================================================= */

const player = {
    x: 220,
    y: FLOOR_Y,

    width: FIGHTER_WIDTH,
    height: FIGHTER_HEIGHT,

    vy: 0,

    health: 100,

    grounded: true,
    platform: null,

    facing: 1,

    blocking: false,

    attacking: false
};


const cpu = {
    x: 820,
    y: FLOOR_Y,

    width: FIGHTER_WIDTH,
    height: FIGHTER_HEIGHT,

    vy: 0,

    health: 100,

    grounded: true,
    platform: null,

    facing: -1,

    blocking: false,

    attacking: false
};


/* =========================================================
   PLATFORM CREATION
   ========================================================= */

function createPlatforms() {

    const width = arena.clientWidth || ARENA_WIDTH;

    const scale = width / ARENA_WIDTH;

    platforms = [

        {
            name: "leftLow",

            x: width * 0.08,

            width: 180 * scale,

            supportY: 122
        },

        {
            name: "rightLow",

            x: width * 0.92 - (180 * scale),

            width: 180 * scale,

            supportY: 122
        },

        {
            name: "center",

            x: width * 0.5 - (190 * scale) / 2,

            width: 190 * scale,

            supportY: 177
        },

        {
            name: "leftHigh",

            x: width * 0.18,

            width: 165 * scale,

            supportY: 227
        },

        {
            name: "rightHigh",

            x: width * 0.82 - (165 * scale),

            width: 165 * scale,

            supportY: 227
        }

    ];
}


/* =========================================================
   RESET FIGHTERS
   ========================================================= */

function resetFighters() {

    player.x = 220;
    player.y = FLOOR_Y;

    player.vy = 0;

    player.health = 100;

    player.grounded = true;

    player.platform = null;

    player.facing = 1;

    player.blocking = false;

    player.attacking = false;


    cpu.x = 820;
    cpu.y = FLOOR_Y;

    cpu.vy = 0;

    cpu.health = 100;

    cpu.grounded = true;

    cpu.platform = null;

    cpu.facing = -1;

    cpu.blocking = false;

    cpu.attacking = false;


    playerAttackTimer = 0;
    cpuAttackTimer = 0;

    playerAttackType = null;
    cpuAttackType = null;

    playerMessageTimer = 0;
    cpuMessageTimer = 0;

    blockTimer = 0;
}


/* =========================================================
   UI
   ========================================================= */

function updateHealth() {

    playerHealthEl.style.width =
        Math.max(0, player.health) + "%";

    cpuHealthEl.style.width =
        Math.max(0, cpu.health) + "%";


    if (playerHealthText) {
        playerHealthText.textContent =
            Math.max(0, Math.round(player.health));
    }

    if (cpuHealthText) {
        cpuHealthText.textContent =
            Math.max(0, Math.round(cpu.health));
    }
}


function updateScore() {

    if (playerScoreEl) {
        playerScoreEl.textContent = playerWins;
    }

    if (cpuScoreEl) {
        cpuScoreEl.textContent = cpuWins;
    }
}


function updateTimer() {

    if (timerEl) {

        const seconds =
            Math.max(0, Math.ceil(roundTime));

        timerEl.textContent =
            String(seconds).padStart(2, "0");
    }
}


/* =========================================================
   DIFFICULTY
   ========================================================= */

function setDifficulty(level) {

    difficulty = level;

    easyBtn?.classList.toggle("active", level === "easy");
    mediumBtn?.classList.toggle("active", level === "medium");
    hardBtn?.classList.toggle("active", level === "hard");

    /*
       Changing difficulty automatically restarts
       the complete match.
    */

    startGame();
}


easyBtn?.addEventListener("click", () => {
    setDifficulty("easy");
});

mediumBtn?.addEventListener("click", () => {
    setDifficulty("medium");
});

hardBtn?.addEventListener("click", () => {
    setDifficulty("hard");
});


/* =========================================================
   CPU SETTINGS
   ========================================================= */

function getCpuSpeed() {

    if (difficulty === "easy") {
        return 2.6;
    }

    if (difficulty === "medium") {
        return 3.3;
    }

    return 4;
}


function getCpuDamage() {

    if (difficulty === "easy") {
        return 5;
    }

    if (difficulty === "medium") {
        return 7;
    }

    return 9;
}


/* =========================================================
   POSITION HELPERS
   ========================================================= */

function getLeft(fighter) {
    return fighter.x;
}


function getRight(fighter) {
    return fighter.x + fighter.width;
}


function getCenter(fighter) {
    return fighter.x + fighter.width / 2;
}


/*
   Returns the platform currently underneath a fighter.
   This is used AFTER movement to determine whether
   the fighter has walked off a platform.
*/

function getSupportingPlatform(fighter) {

    const center = getCenter(fighter);

    for (const platform of platforms) {

        if (
            center >= platform.x &&
            center <= platform.x + platform.width &&
            Math.abs(fighter.y - platform.supportY) < 2
        ) {
            return platform;
        }
    }

    return null;
}


/* =========================================================
   PLATFORM LANDING
   ========================================================= */

/*
   THIS IS THE IMPORTANT FIX.

   A fighter lands only when:

   1. They were above the platform.
   2. They are moving downward.
   3. Their feet cross the platform height.
   4. Their horizontal body overlaps the platform.

   When this happens, we SNAP their y position
   exactly onto the platform.

   This prevents the CPU from floating.
*/

function findLandingPlatform(fighter, previousY, nextY) {

    /*
       Don't allow landing while going upward.
    */

    if (fighter.vy > 0) {
        return null;
    }


    /*
       Check the floor separately.
    */

    if (
        previousY >= FLOOR_Y &&
        nextY <= FLOOR_Y
    ) {

        fighter.y = FLOOR_Y;

        return "floor";
    }


    /*
       Check every aerial platform.
    */

    for (const platform of platforms) {

        const overlapsHorizontally =
            getRight(fighter) > platform.x &&
            getLeft(fighter) <
            platform.x + platform.width;


        if (!overlapsHorizontally) {
            continue;
        }


        /*
           The fighter must be above the platform
           before falling through it.
        */

        if (
            previousY >= platform.supportY &&
            nextY <= platform.supportY
        ) {

            /*
               SNAP TO PLATFORM
            */

            fighter.y = platform.supportY;

            fighter.vy = 0;

            fighter.grounded = true;

            fighter.platform = platform;

            return platform;
        }
    }


    return null;
}


/* =========================================================
   PHYSICS
   ========================================================= */

function updatePhysics(fighter) {

    const previousY = fighter.y;


    /*
       Apply gravity if airborne.
    */

    if (!fighter.grounded) {

        fighter.vy += GRAVITY;

        fighter.y += fighter.vy;
    }


    /*
       If the fighter is standing on a platform,
       make sure they haven't walked off it.
    */

    if (fighter.grounded) {

        if (fighter.platform) {

            const p = fighter.platform;

            const horizontalOverlap =
                getRight(fighter) > p.x &&
                getLeft(fighter) < p.x + p.width;


            /*
               If the fighter walks completely off
               the platform, they start falling.
            */

            if (!horizontalOverlap) {

                fighter.grounded = false;

                fighter.platform = null;
            }

            else {

                /*
                   IMPORTANT:
                   Keep feet exactly on the platform.
                   This stops floating/sinking.
                */

                fighter.y = p.supportY;

                fighter.vy = 0;
            }
        }

        else {

            /*
               Fighter is standing on the floor.
            */

            fighter.y = FLOOR_Y;

            fighter.vy = 0;
        }
    }


    /*
       If airborne, check for landing.
    */

    if (!fighter.grounded) {

        const nextY = fighter.y;

        const landing =
            findLandingPlatform(
                fighter,
                previousY,
                nextY
            );


        if (landing === "floor") {

            fighter.grounded = true;

            fighter.platform = null;

            fighter.vy = 0;

            fighter.y = FLOOR_Y;
        }

        else if (landing) {

            /*
               findLandingPlatform already snapped
               the fighter to the platform.
            */

            fighter.grounded = true;

            fighter.vy = 0;

            fighter.platform = landing;
        }
    }


    /*
       Safety floor.
    */

    if (fighter.y < FLOOR_Y) {

        fighter.y = FLOOR_Y;

        fighter.vy = 0;

        fighter.grounded = true;

        fighter.platform = null;
    }
}


/* =========================================================
   MOVEMENT
   ========================================================= */

function movePlayer() {

    if (!gameRunning) {
        return;
    }


    let moving = false;


    if (keys["ArrowLeft"]) {

        player.x -= MOVE_SPEED;

        player.facing = -1;

        moving = true;
    }


    if (keys["ArrowRight"]) {

        player.x += MOVE_SPEED;

        player.facing = 1;

        moving = true;
    }


    /*
       Keep player inside arena.
    */

    player.x = Math.max(
        0,
        Math.min(
            arena.clientWidth - player.width,
            player.x
        )
    );


    /*
       Jump.
    */

    if (
        keys["ArrowUp"] &&
        player.grounded
    ) {

        player.vy = JUMP_POWER;

        player.grounded = false;

        player.platform = null;

        keys["ArrowUp"] = false;
    }


    /*
       Block.
    */

    if (
        keys["d"] ||
        keys["D"]
    ) {

        if (!player.attacking) {

            startBlock();
        }
    }
}


/* =========================================================
   BLOCK
   ========================================================= */

function startBlock() {

    if (blockTimer > 0) {
        return;
    }


    player.blocking = true;

    blockTimer = BLOCK_DURATION;


    if (blockIndicator) {

        blockIndicator.classList.add("show");
    }
}


function updateBlock(delta) {

    if (blockTimer > 0) {

        blockTimer -= delta;

        player.blocking = true;


        if (blockIndicator) {

            const seconds =
                Math.ceil(blockTimer / 1000);

            blockIndicator.textContent =
                Math.max(1, seconds);

            blockIndicator.classList.add("show");
        }


        if (blockTimer <= 0) {

            blockTimer = 0;

            player.blocking = false;

            if (blockIndicator) {

                blockIndicator.classList.remove("show");
            }
        }
    }
}


/* =========================================================
   JUMP PLAYER
   ========================================================= */

function playerJump() {

    if (
        gameRunning &&
        player.grounded
    ) {

        player.vy = JUMP_POWER;

        player.grounded = false;

        player.platform = null;
    }
}


/* =========================================================
   CPU PLATFORM AI
   ========================================================= */

function getPlatformUnderFighter(fighter) {

    /*
       Floor.
    */

    if (
        Math.abs(fighter.y - FLOOR_Y) < 3
    ) {
        return null;
    }


    for (const platform of platforms) {

        const center = getCenter(fighter);


        if (
            center >= platform.x &&
            center <= platform.x + platform.width &&
            Math.abs(
                fighter.y - platform.supportY
            ) < 3
        ) {

            return platform;
        }
    }


    return null;
}


/*
   Find the platform where the player is currently standing.
*/

function getPlayerPlatform() {

    if (!player.grounded) {
        return null;
    }

    return getPlatformUnderFighter(player);
}


/*
   CPU tries to reach the same platform as the player.
*/

function cpuTryReachPlayerPlatform() {

    const targetPlatform =
        getPlayerPlatform();


    if (!targetPlatform) {
        return false;
    }


    const targetCenter =
        targetPlatform.x +
        targetPlatform.width / 2;


    const cpuCenter =
        getCenter(cpu);


    const difference =
        targetCenter - cpuCenter;


    /*
       Move toward the target platform.
    */

    if (Math.abs(difference) > 18) {

        if (difference > 0) {

            cpu.x += getCpuSpeed();

            cpu.facing = 1;

        }
        else {

            cpu.x -= getCpuSpeed();

            cpu.facing = -1;
        }
    }


    /*
       If the target platform is above the CPU,
       jump when we're reasonably underneath it.
    */

    if (
        cpu.grounded &&
        targetPlatform.supportY > cpu.y + 5
    ) {

        const horizontallyNear =
            Math.abs(
                cpuCenter - targetCenter
            ) < 150;


        if (horizontallyNear) {

            cpu.vy = JUMP_POWER;

            cpu.grounded = false;

            cpu.platform = null;
        }
    }


    return true;
}


/* =========================================================
   CPU AI
   ========================================================= */

function updateCPU() {

    if (!gameRunning) {
        return;
    }


    const cpuSpeed =
        getCpuSpeed();


    const horizontalDistance =
        getCenter(player) -
        getCenter(cpu);


    const absoluteDistance =
        Math.abs(horizontalDistance);


    /*
       First priority:
       try to reach player's platform.
    */

    const reachedPlatform =
        cpuTryReachPlayerPlatform();


    /*
       If player is not on an aerial platform,
       follow normally.
    */

    if (!reachedPlatform) {

        if (absoluteDistance > 80) {

            if (horizontalDistance > 0) {

                cpu.x += cpuSpeed;

                cpu.facing = 1;
            }

            else {

                cpu.x -= cpuSpeed;

                cpu.facing = -1;
            }
        }
    }


    /*
       CPU can jump toward the player
       when player is above.
    */

    if (
        cpu.grounded &&
        player.y > cpu.y + 35
    ) {

        const closeEnough =
            absoluteDistance < 260;


        if (closeEnough) {

            cpu.vy = JUMP_POWER;

            cpu.grounded = false;

            cpu.platform = null;
        }
    }


    /*
       While airborne, keep steering toward
       the player's platform/player.
    */

    if (!cpu.grounded) {

        if (horizontalDistance > 10) {

            cpu.x += cpuSpeed * 0.75;

            cpu.facing = 1;
        }

        else if (horizontalDistance < -10) {

            cpu.x -= cpuSpeed * 0.75;

            cpu.facing = -1;
        }
    }


    /*
       Keep CPU inside arena.
    */

    cpu.x = Math.max(
        0,
        Math.min(
            arena.clientWidth - cpu.width,
            cpu.x
        )
    );


    /*
       CPU attacks only when close enough.
    */

    if (
        absoluteDistance < 78 &&
        Math.abs(player.y - cpu.y) < 70
    ) {

        cpuAttack();
    }
}


/* =========================================================
   HITBOXES
   ========================================================= */

function getBodyBox(fighter) {

    return {

        left: fighter.x,

        right:
            fighter.x +
            fighter.width,

        bottom: fighter.y,

        top:
            fighter.y +
            fighter.height
    };
}


/*
   Returns the actual arm/leg attack area.

   This means attacks cannot magically hit from
   across the screen.
*/

function getAttackHitbox(
    fighter,
    attackType
) {

    const facing =
        fighter.facing;


    const bodyCenter =
        fighter.x +
        fighter.width / 2;


    if (attackType === "punch") {

        const armWidth = 42;
        const armHeight = 24;


        if (facing === 1) {

            return {

                left:
                    bodyCenter + 5,

                right:
                    bodyCenter +
                    5 +
                    armWidth,

                bottom:
                    fighter.y + 57,

                top:
                    fighter.y + 57 +
                    armHeight
            };
        }

        else {

            return {

                left:
                    bodyCenter -
                    5 -
                    armWidth,

                right:
                    bodyCenter - 5,

                bottom:
                    fighter.y + 57,

                top:
                    fighter.y + 57 +
                    armHeight
            };
        }
    }


    /*
       KICK
    */

    const legWidth = 48;
    const legHeight = 30;


    if (facing === 1) {

        return {

            left:
                bodyCenter + 5,

            right:
                bodyCenter +
                5 +
                legWidth,

            bottom:
                fighter.y + 5,

            top:
                fighter.y + 5 +
                legHeight
        };
    }

    else {

        return {

            left:
                bodyCenter -
                5 -
                legWidth,

            right:
                bodyCenter - 5,

            bottom:
                fighter.y + 5,

            top:
                fighter.y + 5 +
                legHeight
        };
    }
}


function boxesTouch(a, b) {

    return (

        a.left < b.right &&

        a.right > b.left &&

        a.bottom < b.top &&

        a.top > b.bottom
    );
}


/* =========================================================
   PLAYER ATTACK
   ========================================================= */

function playerAttack(type) {

    if (!gameRunning) {
        return;
    }


    if (playerAttackTimer > 0) {
        return;
    }


    if (player.blocking) {
        return;
    }


    playerAttackType = type;

    playerAttackTimer =
        ATTACK_COOLDOWN;

    playerAttackEnd =
        performance.now() + 220;


    player.attacking = true;


    playerEl.classList.remove(
        "punch",
        "kick"
    );

    playerEl.classList.add(type);


    setTimeout(() => {

        playerEl.classList.remove(type);

        player.attacking = false;

    }, 220);


    /*
       Check the hit slightly after
       the attack begins.
    */

    setTimeout(() => {

        if (!gameRunning) {
            return;
        }


        const attackBox =
            getAttackHitbox(
                player,
                type
            );


        const targetBox =
            getBodyBox(cpu);


        if (boxesTouch(
            attackBox,
            targetBox
        )) {

            const damage =
                type === "kick"
                    ? PLAYER_KICK_DAMAGE
                    : PLAYER_PUNCH_DAMAGE;


            damageCPU(damage);

        }
        else {

            showMiss();
        }

    }, 100);
}


/* =========================================================
   CPU ATTACK
   ========================================================= */

function cpuAttack() {

    if (!gameRunning) {
        return;
    }


    if (cpuAttackTimer > 0) {
        return;
    }


    if (cpu.blocking) {
        return;
    }


    const type =
        Math.random() < 0.55
            ? "punch"
            : "kick";


    cpuAttackType = type;

    cpuAttackTimer =
        difficulty === "hard"
            ? 430
            : 600;


    cpuAttackEnd =
        performance.now() + 220;


    cpu.attacking = true;


    cpuEl.classList.remove(
        "punch",
        "kick"
    );

    cpuEl.classList.add(type);


    setTimeout(() => {

        cpuEl.classList.remove(type);

        cpu.attacking = false;

    }, 220);


    setTimeout(() => {

        if (!gameRunning) {
            return;
        }


        const attackBox =
            getAttackHitbox(
                cpu,
                type
            );


        const targetBox =
            getBodyBox(player);


        if (boxesTouch(
            attackBox,
            targetBox
        )) {

            damagePlayer(
                getCpuDamage()
            );

        }

    }, 100);
}


/* =========================================================
   DAMAGE
   ========================================================= */

function damagePlayer(amount) {

    if (!gameRunning) {
        return;
    }


    /*
       Blocking reduces damage.
    */

    if (player.blocking) {

        amount *= 0.33;

        amount =
            Math.max(
                1,
                Math.round(amount)
            );
    }


    player.health -= amount;

    player.health =
        Math.max(
            0,
            player.health
        );


    updateHealth();

    showHitEffect(
        player,
        "#00eaff"
    );


    /*
       Small knockback.
    */

    player.x +=
        cpu.facing * 16;


    player.x =
        Math.max(
            0,
            Math.min(
                arena.clientWidth -
                player.width,
                player.x
            )
        );


    if (player.health <= 0) {

        endRound("cpu");
    }
}


function damageCPU(amount) {

    if (!gameRunning) {
        return;
    }


    cpu.health -= amount;

    cpu.health =
        Math.max(
            0,
            cpu.health
        );


    updateHealth();

    showHitEffect(
        cpu,
        "#ff335f"
    );


    cpu.x +=
        player.facing * 16;


    cpu.x =
        Math.max(
            0,
            Math.min(
                arena.clientWidth -
                cpu.width,
                cpu.x
            )
        );


    if (cpu.health <= 0) {

        endRound("player");
    }
}


/* =========================================================
   MISS MESSAGE
   ========================================================= */

function showMiss() {

    if (!hitEffect) {
        return;
    }


    hitEffect.textContent = "MISS!";

    hitEffect.classList.remove("show");

    void hitEffect.offsetWidth;

    hitEffect.classList.add("show");


    setTimeout(() => {

        hitEffect.classList.remove("show");

    }, 450);
}


/* =========================================================
   HIT EFFECT
   ========================================================= */

function showHitEffect(
    fighter,
    textColor
) {

    if (!hitEffect) {
        return;
    }


    hitEffect.textContent = "HIT!";

    hitEffect.style.left =
        fighter.x + "px";

    hitEffect.style.bottom =
        (fighter.y + 80) + "px";

    hitEffect.style.color =
        textColor;


    hitEffect.classList.remove("show");

    void hitEffect.offsetWidth;

    hitEffect.classList.add("show");


    setTimeout(() => {

        hitEffect.classList.remove("show");

    }, 350);
}


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        keys[event.key] = true;


        /*
           Prevent arrow keys from scrolling.
        */

        if (
            [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                " "
            ].includes(event.key)
        ) {

            event.preventDefault();
        }


        if (!gameRunning) {
            return;
        }


        /*
           SPACE = punch
        */

        if (event.code === "Space") {

            event.preventDefault();

            playerAttack("punch");
        }


        /*
           F = kick
        */

        if (
            event.key === "f" ||
            event.key === "F"
        ) {

            playerAttack("kick");
        }


        /*
           UP = jump
        */

        if (
            event.key === "ArrowUp"
        ) {

            playerJump();

            keys["ArrowUp"] = false;
        }
    }
);


document.addEventListener(
    "keyup",
    (event) => {

        keys[event.key] = false;


        if (
            event.key === "d" ||
            event.key === "D"
        ) {

            /*
               The block continues until its
               3-second countdown ends.
            */

        }
    }
);


/* =========================================================
   TIMER
   ========================================================= */

function updateRoundTimer(delta) {

    if (!gameRunning) {
        return;
    }


    roundTime -= delta / 1000;


    if (roundTime <= 0) {

        roundTime = 0;

        updateTimer();

        finishRoundByTime();

        return;
    }


    updateTimer();
}


/* =========================================================
   ROUND END BY TIME
   ========================================================= */

function finishRoundByTime() {

    if (roundFinished) {
        return;
    }


    roundFinished = true;


    /*
       IMPORTANT:
       Timer reaching zero does NOT automatically
       make the player lose.

       Highest health wins.
    */

    if (player.health > cpu.health) {

        endRound("player");

    }
    else if (cpu.health > player.health) {

        endRound("cpu");

    }
    else {

        endRound("draw");
    }
}


/* =========================================================
   ROUND END
   ========================================================= */

function endRound(winner) {

    if (roundFinished) {
        return;
    }


    roundFinished = true;

    gameRunning = false;


    if (winner === "player") {

        playerWins++;

    }
    else if (winner === "cpu") {

        cpuWins++;
    }


    updateScore();


    /*
       Play all 3 rounds.
    */

    setTimeout(() => {

        if (currentRound < 3) {

            currentRound++;

            startRound();

        }
        else {

            finishMatch();
        }

    }, 1200);
}


/* =========================================================
   START ROUND
   ========================================================= */

function startRound() {

    roundFinished = false;

    roundTime = ROUND_TIME;

    resetFighters();

    createPlatforms();

    updateHealth();

    updateTimer();

    gameRunning = true;
}


/* =========================================================
   START COMPLETE MATCH
   ========================================================= */

function startGame() {

    /*
       Stop previous loop safely.
    */

    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;
    }


    currentRound = 1;

    playerWins = 0;

    cpuWins = 0;

    roundFinished = false;


    resultOverlay?.classList.remove("show");


    confetti?.replaceChildren();


    updateScore();

    createPlatforms();

    resetFighters();

    updateHealth();

    roundTime = ROUND_TIME;

    updateTimer();


    gameRunning = true;

    lastTime =
        performance.now();


    animationFrame =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================================
   FINISH MATCH
   ========================================================= */

function finishMatch() {

    gameRunning = false;


    if (!resultOverlay) {
        return;
    }


    resultOverlay.classList.add("show");


    if (resultScore) {

        resultScore.textContent =
            `${playerWins} - ${cpuWins}`;
    }


    if (playerWins > cpuWins) {

        if (resultTitle) {
            resultTitle.textContent =
                "YOU WIN!";
        }

        if (resultMessage) {
            resultMessage.textContent =
                "Amazing fighting!";
        }

        createConfetti();

    }
    else if (cpuWins > playerWins) {

        if (resultTitle) {
            resultTitle.textContent =
                "CPU WINS!";
        }

        if (resultMessage) {
            resultMessage.textContent =
                "Try again and fight smarter!";
        }

    }
    else {

        if (resultTitle) {
            resultTitle.textContent =
                "DRAW!";
        }

        if (resultMessage) {
            resultMessage.textContent =
                "What a close match!";
        }
    }
}


/* =========================================================
   CONFETTI
   ========================================================= */

function createConfetti() {

    if (!confetti) {
        return;
    }


    confetti.innerHTML = "";


    for (let i = 0; i < 80; i++) {

        const piece =
            document.createElement("span");


        piece.className =
            "confetti-piece";


        piece.style.left =
            Math.random() * 100 + "%";


        piece.style.animationDelay =
            Math.random() * 1.5 + "s";


        piece.style.transform =
            `rotate(${Math.random() * 360}deg)`;


        confetti.appendChild(piece);
    }
}


/* =========================================================
   PLAY AGAIN
   ========================================================= */

playAgainBtn?.addEventListener(
    "click",
    () => {

        startGame();
    }
);


startBtn?.addEventListener(
    "click",
    () => {

        startGame();
    }
);


restartBtn?.addEventListener(
    "click",
    () => {

        startGame();
    }
);


/* =========================================================
   FULLSCREEN
   ========================================================= */

fullscreenBtn?.addEventListener(
    "click",
    async () => {

        try {

            /*
               Fullscreen the arena itself.
               Because the result overlay and block indicator
               were moved inside the arena above, they remain
               visible in fullscreen.
            */

            if (!document.fullscreenElement) {

                await arena.requestFullscreen();

            }
            else {

                await document.exitFullscreen();
            }

        }
        catch (error) {

            console.log(
                "Fullscreen error:",
                error
            );
        }
    }
);


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    () => {

        createPlatforms();


        /*
           Keep fighters inside the new arena size.
        */

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


/* =========================================================
   UPDATE FIGHTER VISUALS
   ========================================================= */

function updateFighterVisual(
    fighter,
    element
) {

    if (!element) {
        return;
    }


    element.style.left =
        fighter.x + "px";


    /*
       y is measured from the bottom.
    */

    element.style.bottom =
        fighter.y + "px";


    /*
       Flip character based on facing.
    */

    if (fighter.facing === -1) {

        element.style.transform =
            "scaleX(-1)";

    }
    else {

        element.style.transform =
            "scaleX(1)";
    }


    /*
       Blocking class.
    */

    element.classList.toggle(
        "blocking",
        fighter.blocking
    );


    /*
       Grounded class.
    */

    element.classList.toggle(
        "grounded",
        fighter.grounded
    );
}


/* =========================================================
   GAME LOOP
   ========================================================= */

function gameLoop(timestamp) {

    const delta =
        Math.min(
            40,
            timestamp - lastTime
        );


    lastTime = timestamp;


    if (gameRunning) {

        /*
           Player movement.
        */

        movePlayer();


        /*
           CPU movement/AI.
        */

        updateCPU();


        /*
           Physics AFTER movement.
           This is important because platform
           detection uses the new x position.
        */

        updatePhysics(player);

        updatePhysics(cpu);


        /*
           Attack cooldowns.
        */

        if (playerAttackTimer > 0) {

            playerAttackTimer -= delta;

            if (playerAttackTimer < 0) {
                playerAttackTimer = 0;
            }
        }


        if (cpuAttackTimer > 0) {

            cpuAttackTimer -= delta;

            if (cpuAttackTimer < 0) {
                cpuAttackTimer = 0;
            }
        }


        /*
           Block countdown.
        */

        updateBlock(delta);


        /*
           Round timer.
        */

        updateRoundTimer(delta);


        /*
           Update visuals.
        */

        updateFighterVisual(
            player,
            playerEl
        );

        updateFighterVisual(
            cpu,
            cpuEl
        );
    }


    /*
       Keep animation loop alive.
    */

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

createPlatforms();

resetFighters();

updateHealth();

updateScore();

updateTimer();

updateFighterVisual(
    player,
    playerEl
);

updateFighterVisual(
    cpu,
    cpuEl
);


/*
   Default difficulty.
*/

easyBtn?.classList.add("active");


/*
   Start the game.
*/

startGame();