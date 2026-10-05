/* =========================================================
   NEON FIGHTERS
   COMPLETE GAME.JS
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const arena = document.getElementById("arena");

const playerEl = document.getElementById("player");
const cpuEl = document.getElementById("cpu");

const playerHealthEl =
    document.getElementById("playerHealth");

const cpuHealthEl =
    document.getElementById("cpuHealth");

const playerHealthText =
    document.getElementById("playerHealthText");

const cpuHealthText =
    document.getElementById("cpuHealthText");

const timerEl =
    document.getElementById("timer");

const playerScoreEl =
    document.getElementById("playerScore");

const cpuScoreEl =
    document.getElementById("cpuScore");

const startBtn =
    document.getElementById("startBtn");

const restartBtn =
    document.getElementById("restartBtn");

const fullscreenBtn =
    document.getElementById("fullscreenBtn");

const easyBtn =
    document.getElementById("easyBtn");

const mediumBtn =
    document.getElementById("mediumBtn");

const hardBtn =
    document.getElementById("hardBtn");

const resultOverlay =
    document.getElementById("resultOverlay");

const resultTitle =
    document.getElementById("resultTitle");

const resultScore =
    document.getElementById("resultScore");

const resultMessage =
    document.getElementById("resultMessage");

const playAgainBtn =
    document.getElementById("playAgainBtn");

const confetti =
    document.getElementById("confetti");

const blockIndicator =
    document.getElementById("blockIndicator");

const hitEffect =
    document.getElementById("hitEffect");


/* =========================================================
   SETTINGS
   ========================================================= */

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
   GAME VARIABLES
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


/* =========================================================
   FIGHTERS
   ========================================================= */

const player = {

    x: 220,

    y: FLOOR_Y,

    width: 55,

    height: 110,

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

    width: 55,

    height: 110,

    vy: 0,

    health: 100,

    grounded: true,

    platform: null,

    facing: -1,

    blocking: false,

    attacking: false
};


/* =========================================================
   PLATFORM SETUP
   ========================================================= */

function createPlatforms() {

    const width =
        arena.clientWidth || 1100;

    const scale =
        width / 1100;


    platforms = [

        {
            name: "leftLow",

            x: width * 0.08,

            width: 180 * scale,

            supportY: 122
        },

        {
            name: "rightLow",

            x:
                width * 0.92 -
                180 * scale,

            width: 180 * scale,

            supportY: 122
        },

        {
            name: "center",

            x:
                width * 0.5 -
                95 * scale,

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

            x:
                width * 0.82 -
                165 * scale,

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


    cpu.x =
        Math.max(
            arena.clientWidth - 280,
            400
        );

    cpu.y = FLOOR_Y;

    cpu.vy = 0;

    cpu.health = 100;

    cpu.grounded = true;

    cpu.platform = null;

    cpu.facing = -1;

    cpu.blocking = false;

    cpu.attacking = false;


    blockTimer = 0;

    playerAttackTimer = 0;

    cpuAttackTimer = 0;
}


/* =========================================================
   UI
   ========================================================= */

function updateHealth() {

    playerHealthEl.style.width =
        Math.max(
            0,
            player.health
        ) + "%";


    cpuHealthEl.style.width =
        Math.max(
            0,
            cpu.health
        ) + "%";


    playerHealthText.textContent =
        Math.round(
            Math.max(0, player.health)
        );


    cpuHealthText.textContent =
        Math.round(
            Math.max(0, cpu.health)
        );
}


function updateScore() {

    playerScoreEl.textContent =
        playerWins;

    cpuScoreEl.textContent =
        cpuWins;
}


function updateTimer() {

    timerEl.textContent =
        String(
            Math.max(
                0,
                Math.ceil(roundTime)
            )
        ).padStart(2, "0");
}


/* =========================================================
   DIFFICULTY
   ========================================================= */

function setDifficulty(level) {

    difficulty = level;


    easyBtn.classList.toggle(
        "active",
        level === "easy"
    );


    mediumBtn.classList.toggle(
        "active",
        level === "medium"
    );


    hardBtn.classList.toggle(
        "active",
        level === "hard"
    );


    /*
       Changing difficulty automatically
       starts a completely new match.
    */

    startGame();
}


easyBtn.addEventListener(
    "click",
    () => setDifficulty("easy")
);


mediumBtn.addEventListener(
    "click",
    () => setDifficulty("medium")
);


hardBtn.addEventListener(
    "click",
    () => setDifficulty("hard")
);


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

function getCenter(fighter) {

    return fighter.x +
        fighter.width / 2;
}


function getLeft(fighter) {

    return fighter.x;
}


function getRight(fighter) {

    return fighter.x +
        fighter.width;
}


/* =========================================================
   PHYSICS
   ========================================================= */

function updatePhysics(fighter) {

    /*
       Save the position before gravity.
    */

    const previousY =
        fighter.y;


    /*
       Apply gravity when airborne.
    */

    if (!fighter.grounded) {

        fighter.vy += GRAVITY;

        fighter.y += fighter.vy;
    }


    /*
       If standing on a platform,
       keep the feet EXACTLY on it.
    */

    if (fighter.grounded &&
        fighter.platform) {

        const p =
            fighter.platform;


        const overlaps =
            getRight(fighter) > p.x &&
            getLeft(fighter) <
                p.x + p.width;


        if (overlaps) {

            fighter.y =
                p.supportY;

            fighter.vy = 0;

        } else {

            /*
               Walked off platform.
            */

            fighter.grounded = false;

            fighter.platform = null;
        }
    }


    /*
       Find landing while falling.
    */

    if (!fighter.grounded) {

        /*
           Floor landing.
        */

        if (
            fighter.vy <= 0 &&
            previousY >= FLOOR_Y &&
            fighter.y <= FLOOR_Y
        ) {

            fighter.y = FLOOR_Y;

            fighter.vy = 0;

            fighter.grounded = true;

            fighter.platform = null;

        } else {

            /*
               Check aerial platforms.
            */

            for (
                const platform of platforms
            ) {

                const horizontalOverlap =
                    getRight(fighter) >
                        platform.x &&
                    getLeft(fighter) <
                        platform.x +
                        platform.width;


                if (!horizontalOverlap) {
                    continue;
                }


                /*
                   The fighter must be moving DOWN.
                */

                if (fighter.vy <= 0) {

                    /*
                       Check whether the feet
                       crossed the platform.
                    */

                    if (
                        previousY >=
                            platform.supportY &&
                        fighter.y <=
                            platform.supportY
                    ) {

                        /*
                           THIS IS THE FIX.

                           Snap directly onto
                           the platform.
                        */

                        fighter.y =
                            platform.supportY;

                        fighter.vy = 0;

                        fighter.grounded =
                            true;

                        fighter.platform =
                            platform;

                        break;
                    }
                }
            }
        }
    }


    /*
       Safety check.
    */

    if (fighter.y < FLOOR_Y) {

        fighter.y = FLOOR_Y;

        fighter.vy = 0;

        fighter.grounded = true;

        fighter.platform = null;
    }
}


/* =========================================================
   PLAYER MOVEMENT
   ========================================================= */

function movePlayer() {

    if (!gameRunning) {
        return;
    }


    if (keys["ArrowLeft"]) {

        player.x -= MOVE_SPEED;

        player.facing = -1;
    }


    if (keys["ArrowRight"]) {

        player.x += MOVE_SPEED;

        player.facing = 1;
    }


    /*
       Keep inside arena.
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
}


/* =========================================================
   PLAYER JUMP
   ========================================================= */

function playerJump() {

    if (
        gameRunning &&
        player.grounded
    ) {

        player.vy =
            JUMP_POWER;

        player.grounded =
            false;

        player.platform =
            null;
    }
}


/* =========================================================
   CPU PLATFORM DETECTION
   ========================================================= */

function getPlatformUnderFighter(
    fighter
) {

    if (
        Math.abs(
            fighter.y - FLOOR_Y
        ) < 3
    ) {

        return null;
    }


    for (
        const platform of platforms
    ) {

        const center =
            getCenter(fighter);


        if (
            center >= platform.x &&
            center <=
                platform.x +
                platform.width &&
            Math.abs(
                fighter.y -
                platform.supportY
            ) < 3
        ) {

            return platform;
        }
    }


    return null;
}


function getPlayerPlatform() {

    if (!player.grounded) {
        return null;
    }


    return getPlatformUnderFighter(
        player
    );
}


/* =========================================================
   CPU PLATFORM AI
   ========================================================= */

function cpuTryReachPlayerPlatform() {

    const target =
        getPlayerPlatform();


    if (!target) {
        return false;
    }


    const targetCenter =
        target.x +
        target.width / 2;


    const cpuCenter =
        getCenter(cpu);


    const difference =
        targetCenter -
        cpuCenter;


    /*
       Move toward platform.
    */

    if (
        Math.abs(difference) > 20
    ) {

        if (difference > 0) {

            cpu.x += getCpuSpeed();

            cpu.facing = 1;

        } else {

            cpu.x -= getCpuSpeed();

            cpu.facing = -1;
        }
    }


    /*
       Jump toward higher platform.
    */

    if (
        cpu.grounded &&
        target.supportY >
            cpu.y + 5
    ) {

        if (
            Math.abs(
                difference
            ) < 180
        ) {

            cpu.vy =
                JUMP_POWER;

            cpu.grounded =
                false;

            cpu.platform =
                null;
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


    const distance =
        getCenter(player) -
        getCenter(cpu);


    const absoluteDistance =
        Math.abs(distance);


    const platformTarget =
        cpuTryReachPlayerPlatform();


    /*
       If there isn't a target platform,
       follow the player.
    */

    if (!platformTarget) {

        if (
            absoluteDistance > 75
        ) {

            if (distance > 0) {

                cpu.x +=
                    getCpuSpeed();

                cpu.facing = 1;

            } else {

                cpu.x -=
                    getCpuSpeed();

                cpu.facing = -1;
            }
        }
    }


    /*
       Jump if player is above.
    */

    if (
        cpu.grounded &&
        player.y >
            cpu.y + 35 &&
        absoluteDistance < 280
    ) {

        cpu.vy =
            JUMP_POWER;

        cpu.grounded =
            false;

        cpu.platform =
            null;
    }


    /*
       Air control.
    */

    if (!cpu.grounded) {

        if (distance > 10) {

            cpu.x +=
                getCpuSpeed() * 0.75;

            cpu.facing = 1;

        } else if (distance < -10) {

            cpu.x -=
                getCpuSpeed() * 0.75;

            cpu.facing = -1;
        }
    }


    /*
       Stay inside arena.
    */

    cpu.x =
        Math.max(
            0,
            Math.min(
                arena.clientWidth -
                    cpu.width,
                cpu.x
            )
        );


    /*
       Attack only when close.
    */

    if (
        absoluteDistance < 78 &&
        Math.abs(
            player.y - cpu.y
        ) < 70
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


function getAttackHitbox(
    fighter,
    type
) {

    const center =
        getCenter(fighter);


    /*
       PUNCH
    */

    if (type === "punch") {

        if (fighter.facing === 1) {

            return {

                left: center + 3,

                right:
                    center + 45,

                bottom:
                    fighter.y + 55,

                top:
                    fighter.y + 82
            };

        } else {

            return {

                left:
                    center - 45,

                right:
                    center - 3,

                bottom:
                    fighter.y + 55,

                top:
                    fighter.y + 82
            };
        }
    }


    /*
       KICK
    */

    if (fighter.facing === 1) {

        return {

            left:
                center + 3,

            right:
                center + 50,

            bottom:
                fighter.y + 5,

            top:
                fighter.y + 38
        };

    } else {

        return {

            left:
                center - 50,

            right:
                center - 3,

            bottom:
                fighter.y + 5,

            top:
                fighter.y + 38
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


    playerAttackTimer =
        ATTACK_COOLDOWN;


    player.attacking = true;


    playerEl.classList.remove(
        "punch",
        "kick"
    );


    playerEl.classList.add(
        type
    );


    setTimeout(() => {

        playerEl.classList.remove(
            type
        );

        player.attacking = false;

    }, 220);


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


        if (
            boxesTouch(
                attackBox,
                targetBox
            )
        ) {

            if (type === "kick") {

                damageCPU(
                    PLAYER_KICK_DAMAGE
                );

            } else {

                damageCPU(
                    PLAYER_PUNCH_DAMAGE
                );
            }

        } else {

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


    const type =
        Math.random() < 0.55
            ? "punch"
            : "kick";


    cpuAttackTimer =
        difficulty === "hard"
            ? 430
            : 600;


    cpu.attacking = true;


    cpuEl.classList.remove(
        "punch",
        "kick"
    );


    cpuEl.classList.add(
        type
    );


    setTimeout(() => {

        cpuEl.classList.remove(
            type
        );

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


        if (
            boxesTouch(
                attackBox,
                targetBox
            )
        ) {

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

        amount =
            Math.max(
                1,
                Math.round(
                    amount * 0.33
                )
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
        player
    );


    /*
       Knockback.
    */

    player.x +=
        cpu.facing * 15;


    player.x =
        Math.max(
            0,
            Math.min(
                arena.clientWidth -
                    player.width,
                player.x
            )
        );


    if (
        player.health <= 0
    ) {

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
        cpu
    );


    cpu.x +=
        player.facing * 15;


    cpu.x =
        Math.max(
            0,
            Math.min(
                arena.clientWidth -
                    cpu.width,
                cpu.x
            )
        );


    if (
        cpu.health <= 0
    ) {

        endRound("player");
    }
}


/* =========================================================
   HIT EFFECT
   ========================================================= */

function showHitEffect(
    fighter
) {

    if (!hitEffect) {
        return;
    }


    hitEffect.textContent =
        "HIT!";


    hitEffect.style.left =
        (
            fighter.x +
            fighter.width / 2
        ) + "px";


    hitEffect.style.bottom =
        (
            fighter.y + 90
        ) + "px";


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

    }, 400);
}


function showMiss() {

    if (!hitEffect) {
        return;
    }


    hitEffect.textContent =
        "MISS!";


    hitEffect.style.left =
        "50%";


    hitEffect.style.bottom =
        "250px";


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

    }, 400);
}


/* =========================================================
   BLOCK
   ========================================================= */

function startBlock() {

    if (blockTimer > 0) {
        return;
    }


    blockTimer =
        BLOCK_DURATION;


    player.blocking = true;


    blockIndicator.classList.add(
        "show"
    );
}


function updateBlock(delta) {

    if (blockTimer <= 0) {

        player.blocking = false;

        blockIndicator.classList.remove(
            "show"
        );

        return;
    }


    blockTimer -= delta;


    player.blocking = true;


    const seconds =
        Math.ceil(
            blockTimer / 1000
        );


    blockIndicator.textContent =
        Math.max(
            1,
            seconds
        );


    if (blockTimer <= 0) {

        blockTimer = 0;

        player.blocking = false;

        blockIndicator.classList.remove(
            "show"
        );
    }
}


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        keys[event.key] = true;


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
           SPACE = PUNCH
        */

        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            playerAttack(
                "punch"
            );
        }


        /*
           F = KICK
        */

        if (
            event.key === "f" ||
            event.key === "F"
        ) {

            playerAttack(
                "kick"
            );
        }


        /*
           UP = JUMP
        */

        if (
            event.key === "ArrowUp"
        ) {

            playerJump();

            keys["ArrowUp"] =
                false;
        }


        /*
           D = BLOCK
        */

        if (
            event.key === "d" ||
            event.key === "D"
        ) {

            startBlock();
        }
    }
);


document.addEventListener(
    "keyup",
    (event) => {

        keys[event.key] = false;
    }
);


/* =========================================================
   TIMER
   ========================================================= */

function updateRoundTimer(delta) {

    if (!gameRunning) {
        return;
    }


    roundTime -=
        delta / 1000;


    if (
        roundTime <= 0
    ) {

        roundTime = 0;

        updateTimer();

        finishRoundByTime();

        return;
    }


    updateTimer();
}


function finishRoundByTime() {

    if (roundFinished) {
        return;
    }


    if (
        player.health >
        cpu.health
    ) {

        endRound("player");

    } else if (
        cpu.health >
        player.health
    ) {

        endRound("cpu");

    } else {

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

    } else if (
        winner === "cpu"
    ) {

        cpuWins++;
    }


    updateScore();


    setTimeout(() => {

        if (
            currentRound < 3
        ) {

            currentRound++;

            startRound();

        } else {

            finishMatch();
        }

    }, 1200);
}


/* =========================================================
   START ROUND
   ========================================================= */

function startRound() {

    roundFinished = false;

    roundTime =
        ROUND_TIME;


    createPlatforms();

    resetFighters();

    updateHealth();

    updateTimer();


    gameRunning = true;
}


/* =========================================================
   START MATCH
   ========================================================= */

function startGame() {

    /*
       Cancel previous animation loop.
    */

    if (
        animationFrame !== null
    ) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;
    }


    currentRound = 1;

    playerWins = 0;

    cpuWins = 0;

    roundFinished = false;


    /*
       Make absolutely sure the result
       popup cannot block buttons.
    */

    resultOverlay.classList.remove(
        "show"
    );


    resultOverlay.style.pointerEvents =
        "none";


    confetti.innerHTML = "";


    updateScore();


    createPlatforms();

    resetFighters();


    roundTime =
        ROUND_TIME;


    updateHealth();

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


    resultScore.textContent =
        `${playerWins} - ${cpuWins}`;


    if (
        playerWins >
        cpuWins
    ) {

        resultTitle.textContent =
            "YOU WIN!";


        resultMessage.textContent =
            "Amazing fighting!";


        createConfetti();

    } else if (
        cpuWins >
        playerWins
    ) {

        resultTitle.textContent =
            "CPU WINS!";


        resultMessage.textContent =
            "Try again and fight smarter!";

    } else {

        resultTitle.textContent =
            "DRAW!";


        resultMessage.textContent =
            "What a close match!";
    }


    resultOverlay.classList.add(
        "show"
    );


    resultOverlay.style.pointerEvents =
        "auto";
}


/* =========================================================
   CONFETTI
   ========================================================= */

function createConfetti() {

    confetti.innerHTML = "";


    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const piece =
            document.createElement(
                "span"
            );


        piece.className =
            "confetti-piece";


        piece.style.left =
            Math.random() *
            100 +
            "%";


        piece.style.animationDelay =
            Math.random() *
            1.5 +
            "s";


        piece.style.transform =
            `rotate(${
                Math.random() *
                360
            }deg)`;


        confetti.appendChild(
            piece
        );
    }
}


/* =========================================================
   BUTTONS
   ========================================================= */

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

        startGame();
    }
);


/* =========================================================
   FULLSCREEN
   ========================================================= */

fullscreenBtn.addEventListener(
    "click",
    async () => {

        try {

            if (
                !document.fullscreenElement
            ) {

                /*
                   FULL PAGE FULLSCREEN.

                   This keeps the popup,
                   block countdown and buttons
                   inside the fullscreen page.
                */

                await document
                    .documentElement
                    .requestFullscreen();

            } else {

                await document
                    .exitFullscreen();
            }

        } catch (error) {

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
   VISUAL UPDATE
   ========================================================= */

function updateFighterVisual(
    fighter,
    element
) {

    element.style.left =
        fighter.x + "px";


    element.style.bottom =
        fighter.y + "px";


    /*
       Don't use transform for facing here
       because CSS animations can also use
       transforms.

       Instead, flip the entire fighter
       using scaleX.
    */

    if (
        fighter.facing === -1
    ) {

        element.style.transform =
            "scaleX(-1)";

    } else {

        element.style.transform =
            "scaleX(1)";
    }


    element.classList.toggle(
        "blocking",
        fighter.blocking
    );
}


/* =========================================================
   MAIN GAME LOOP
   ========================================================= */

function gameLoop(timestamp) {

    const delta =
        Math.min(
            40,
            timestamp -
                lastTime
        );


    lastTime =
        timestamp;


    if (gameRunning) {

        /*
           PLAYER
        */

        movePlayer();


        /*
           CPU
        */

        updateCPU();


        /*
           PHYSICS

           Movement happens FIRST.
           Physics happens SECOND.

           This makes platform collision
           much more reliable.
        */

        updatePhysics(
            player
        );


        updatePhysics(
            cpu
        );


        /*
           ATTACK COOLDOWNS
        */

        if (
            playerAttackTimer > 0
        ) {

            playerAttackTimer -=
                delta;


            if (
                playerAttackTimer < 0
            ) {

                playerAttackTimer = 0;
            }
        }


        if (
            cpuAttackTimer > 0
        ) {

            cpuAttackTimer -=
                delta;


            if (
                cpuAttackTimer < 0
            ) {

                cpuAttackTimer = 0;
            }
        }


        /*
           BLOCK
        */

        updateBlock(delta);


        /*
           TIMER
        */

        updateRoundTimer(
            delta
        );


        /*
           VISUALS
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


easyBtn.classList.add(
    "active"
);


/*
   Start immediately.
*/

startGame();