/* =========================================================
   NEON FIGHTERS
   COMPLETE GAME ENGINE
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

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


/* MENU */

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


/* DIFFICULTY */

const difficultyButtons =
    document.querySelectorAll(
        ".difficulty-btn"
    );


/* PLAYER HEALTH */

const playerHealthEl =
    document.getElementById(
        "playerHealth"
    );

const playerHealthText =
    document.getElementById(
        "playerHealthText"
    );


/* NORMAL CPU HEALTH */

const cpuHealthEl =
    document.getElementById(
        "cpuHealth"
    );

const cpuHealthText =
    document.getElementById(
        "cpuHealthText"
    );


/* VERY HARD HEALTH */

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


/* HUD */

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


/* EFFECTS */

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


/* RESULT */

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


/* =========================================================
   GAME SETTINGS
========================================================= */

const FLOOR_HEIGHT = 70;


/*
    Shorter jump than before.
*/

const JUMP_POWER = 14;

const GRAVITY = -0.72;


/*
    Player movement.
*/

const MOVE_SPEED = 4.4;


/*
    Match.
*/

const ROUND_TIME = 60;


/*
    Blocking:
    3 seconds active
    10 seconds cooldown
*/

const BLOCK_DURATION = 3000;

const BLOCK_COOLDOWN = 10000;


/*
    Attack timing.
*/

const ATTACK_COOLDOWN = 430;


/*
    Damage.
*/

const PLAYER_PUNCH_DAMAGE = 10;

const PLAYER_KICK_DAMAGE = 14;

const CPU_PUNCH_DAMAGE = 8;

const CPU_KICK_DAMAGE = 11;


/*
    How close fighters must be
    for an attack to hit.
*/

const ATTACK_RANGE = 72;


/* =========================================================
   GAME STATE
========================================================= */

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


/* =========================================================
   KEYBOARD
========================================================= */

const keys = {

    ArrowLeft: false,

    ArrowRight: false,

    ArrowUp: false

};


/* =========================================================
   PLAYER
========================================================= */

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


/* =========================================================
   CPU FACTORY
========================================================= */

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


/* =========================================================
   DIFFICULTY SETTINGS
========================================================= */

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

        speed: 2.5,

        attackDelay: 650,

        jumpDelay: 1100,

        blockChance: 0.25,

        attackChance: 0.72,

        smartPlatform: 0.70

    },


    hard: {

        speed: 3.0,

        attackDelay: 520,

        jumpDelay: 850,

        blockChance: 0.42,

        attackChance: 0.86,

        smartPlatform: 0.90

    },


    veryhard: {

        speed: 3.5,

        attackDelay: 400,

        jumpDelay: 650,

        blockChance: 0.58,

        attackChance: 0.94,

        smartPlatform: 1.0

    }

};


/* =========================================================
   PLATFORM CREATION
========================================================= */

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


        /*
            supportY is the exact top surface
            of the platform.

            Fighter bottom = supportY.
            This keeps the feet on the surface.
        */

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


/* =========================================================
   RESET FIGHTER
========================================================= */

function resetFighter(
    fighter,
    x,
    facing
) {

    fighter.x = x;

    fighter.y = FLOOR_HEIGHT;

    fighter.vy = 0;

    fighter.health = 100;

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


/* =========================================================
   RESET ROUND
========================================================= */

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


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    /*
        Important:
        Selecting difficulty does NOT call this.
        Only PLAY does.
    */

    stopGameLoop();

    clearInterval(
        timerInterval
    );


    playerRounds = 0;

    cpuRounds = 0;

    roundNumber = 1;

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


    document.getElementById(
        "gameScreen"
    ).scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   STOP GAME LOOP
========================================================= */

function stopGameLoop() {

    gameRunning = false;

    roundActive = false;

    clearInterval(
        timerInterval
    );

}


/* =========================================================
   TIMER
========================================================= */

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


/* =========================================================
   HEALTH
========================================================= */

function updateHealth() {

    /*
        Player.
    */

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


    /*
        Normal CPU.
    */

    cpuHealthEl.style.width =
        `${Math.max(
            0,
            cpus[0].health
        )}%`;


    cpuHealthText.textContent =
        Math.ceil(
            Math.max(
                0,
                cpus[0].health
            )
        );


    /*
        Very Hard CPU 1.
    */

    cpu1HealthEl.style.width =
        `${Math.max(
            0,
            cpus[0].health
        )}%`;


    cpu1HealthText.textContent =
        Math.ceil(
            Math.max(
                0,
                cpus[0].health
            )
        );


    /*
        Very Hard CPU 2.
    */

    cpu2HealthEl.style.width =
        `${Math.max(
            0,
            cpus[1].health
        )}%`;


    cpu2HealthText.textContent =
        Math.ceil(
            Math.max(
                0,
                cpus[1].health
            )
        );


    /*
        Very Hard CPU 3.
    */

    cpu3HealthEl.style.width =
        `${Math.max(
            0,
            cpus[2].health
        )}%`;


    cpu3HealthText.textContent =
        Math.ceil(
            Math.max(
                0,
                cpus[2].health
            )
        );

}


/* =========================================================
   SCORE
========================================================= */

function updateScore() {

    playerScoreEl.textContent =
        playerRounds;

    cpuScoreEl.textContent =
        cpuRounds;

    roundNumberEl.textContent =
        roundNumber;

}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

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


/* =========================================================
   PLAYER JUMP
========================================================= */

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


/* =========================================================
   PLAYER PUNCH
========================================================= */

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


/* =========================================================
   PLAYER KICK
========================================================= */

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


/* =========================================================
   PLAYER ATTACK
========================================================= */

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


/* =========================================================
   PLAYER ATTACK DETECTION
========================================================= */

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
            ATTACK_RANGE
        ) {
            continue;
        }


        hitSomeone = true;


        /*
            BLOCK = ZERO DAMAGE.
        */

        if (cpu.blocking) {

            showHitEffect(
                "BLOCK"
            );

            continue;

        }


        const damage =
            type === "punch"
                ? PLAYER_PUNCH_DAMAGE
                : PLAYER_KICK_DAMAGE;


        cpu.health -= damage;


        cpu.health =
            Math.max(
                0,
                cpu.health
            );


        showHitEffect(
            `-${damage}`
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


/* =========================================================
   SAME HEIGHT CHECK
========================================================= */

function sameHeight(
    fighterA,
    fighterB
) {

    return Math.abs(
        fighterA.y -
        fighterB.y
    ) < 55;

}


/* =========================================================
   PLAYER BLOCK
========================================================= */

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


/* =========================================================
   STOP PLAYER BLOCK
========================================================= */

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


/* =========================================================
   BLOCK COOLDOWN UI
========================================================= */

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


/* =========================================================
   CPU UPDATE
========================================================= */

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


/* =========================================================
   SINGLE CPU AI
========================================================= */

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


    /*
        -------------------------------------------------
        PLATFORM AI
        -------------------------------------------------

        If the player is above the CPU,
        CPU tries to jump toward that platform.
    */


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


            /*
                Move underneath the platform first.
            */

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


            /*
                Jump when close enough.
            */

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


    /*
        -------------------------------------------------
        NORMAL CHASING
        -------------------------------------------------
    */


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


    /*
        -------------------------------------------------
        VERY HARD SURROUNDING AI
        -------------------------------------------------

        The three CPUs try to spread around
        the player instead of standing in
        exactly the same location.
    */


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


    /*
        -------------------------------------------------
        ATTACK
        -------------------------------------------------
    */


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


    /*
        -------------------------------------------------
        BLOCK
        -------------------------------------------------
    */


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


    /*
        -------------------------------------------------
        RANDOM PLATFORM JUMP
        -------------------------------------------------
    */


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


    /*
        Arena boundaries.
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

}


/* =========================================================
   CPU JUMP
========================================================= */

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


/* =========================================================
   CPU ATTACK
========================================================= */

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


/* =========================================================
   CPU ATTACK DETECTION
========================================================= */

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


    /*
        BLOCK = ZERO DAMAGE.
    */

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


/* =========================================================
   CPU BLOCK
========================================================= */

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


/* =========================================================
   STOP CPU BLOCK
========================================================= */

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


/* =========================================================
   PHYSICS
========================================================= */

function updatePhysics(
    fighter
) {

    const previousY =
        fighter.y;


    /*
        If standing on a platform,
        stay on its surface while overlapping.
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


        fighter.grounded =
            false;


        fighter.platform =
            null;

    }


    /*
        Floor.
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
        Gravity.
    */

    fighter.vy +=
        GRAVITY;


    fighter.y +=
        fighter.vy;


    fighter.grounded =
        false;


    /*
        Platform landing.

        We only land while falling.
    */

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


    /*
        Floor landing.
    */

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


/* =========================================================
   PLATFORM HORIZONTAL COLLISION
========================================================= */

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


/* =========================================================
   VISUAL POSITION
========================================================= */

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


    /*
        This is the important part:

        The bottom of the fighter is
        exactly at the floor/platform
        support surface.

        Therefore the feet don't sink
        through the platform.
    */

    element.style.bottom =
        `${fighter.y}px`;


    element.style.transform =
        fighter.facing === 1
            ? "scaleX(1)"
            : "scaleX(-1)";

}


/* =========================================================
   GET CPU ELEMENT
========================================================= */

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


/* =========================================================
   ACTIVE CPUS
========================================================= */

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


/* =========================================================
   DEFEAT CPU
========================================================= */

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


/* =========================================================
   HIT EFFECT
========================================================= */

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


/* =========================================================
   END ROUND
========================================================= */

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

    } else {

        cpuRounds++;

    }


    updateScore();


    /*
        Always play all 3 rounds.
    */

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


/* =========================================================
   FINISH MATCH
========================================================= */

function finishMatch() {

    gameRunning =
        false;


    roundActive =
        false;


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

}


/* =========================================================
   CONFETTI
========================================================= */

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


/* =========================================================
   GAME LOOP
========================================================= */

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


    /*
        Attack timers.
    */

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


/* =========================================================
   ATTACK TIMER
========================================================= */

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


/* =========================================================
   KEYBOARD
========================================================= */

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


        /*
            SPACE = PUNCH
        */

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


        /*
            F = KICK
        */

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


        /*
            D or B = BLOCK
        */

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


/* =========================================================
   DIFFICULTY BUTTONS
========================================================= */

difficultyButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

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


                /*
                    IMPORTANT:
                    DO NOT START THE GAME HERE.

                    This was one of the problems
                    in the previous version.
                */

                document.body.classList.toggle(
                    "hard-mode",
                    difficulty ===
                    "hard"
                );

            }
        );

    }
);


/* =========================================================
   PLAY BUTTON
========================================================= */

startBtn.addEventListener(
    "click",
    () => {

        startGame();

    }
);


/* =========================================================
   RESTART
========================================================= */

restartBtn.addEventListener(
    "click",
    () => {

        startGame();

    }
);


/* =========================================================
   PLAY AGAIN
========================================================= */

playAgainBtn.addEventListener(
    "click",
    () => {

        resultOverlay.classList.remove(
            "show"
        );


        startGame();

    }
);


/* =========================================================
   GO TO MENU
========================================================= */

menuBtn.addEventListener(
    "click",
    async () => {

        stopGameLoop();


        /*
            Exit browser fullscreen.
        */

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


        /*
            Remove our fullscreen CSS mode.
        */

        document.body.classList.remove(
            "fullscreen-mode"
        );


        /*
            Hide result.
        */

        resultOverlay.classList.remove(
            "show"
        );


        /*
            Scroll back to menu.
        */

        document.getElementById(
            "game"
        ).scrollIntoView({
            behavior: "smooth"
        });

    }
);


/* =========================================================
   FULLSCREEN FUNCTION
========================================================= */

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

        /*
            Even if browser fullscreen
            is blocked, our CSS fullscreen
            mode still works.
        */

        console.log(
            "Fullscreen API unavailable:",
            error
        );

    }


    setTimeout(() => {

        createPlatforms();

    }, 200);

}


/* =========================================================
   FULLSCREEN GAME BUTTON
========================================================= */

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


/* =========================================================
   FULLSCREEN MENU BUTTON
========================================================= */

fullscreenMenuBtn.addEventListener(
    "click",
    async () => {

        /*
            This enters fullscreen visual mode,
            but does NOT start the game.
        */

        await enterFullscreen();

    }
);


/* =========================================================
   EXIT FULLSCREEN
========================================================= */

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


/* =========================================================
   BROWSER FULLSCREEN CHANGE
========================================================= */

document.addEventListener(
    "fullscreenchange",
    () => {

        /*
            If the browser exits fullscreen
            with ESC, also remove our CSS mode.
        */

        if (
            !document.fullscreenElement
        ) {

            document.body.classList.remove(
                "fullscreen-mode"
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
            Keep player inside arena.
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


/* =========================================================
   INITIAL SETUP
========================================================= */

window.addEventListener(
    "load",
    () => {

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


        /*
            Make sure game is NOT running
            when the website first opens.
        */

        gameRunning =
            false;


        roundActive =
            false;


        updateHealth();

        updateTimer();

        updateScore();

        updateBlockCooldown();


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


        /*
            Easy is selected initially,
            but the game does NOT start.
        */

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