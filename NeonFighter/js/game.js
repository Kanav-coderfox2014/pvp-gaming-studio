/* =========================================================
   NEON FIGHTERS
   COMPLETE GAME JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const player =
        document.getElementById("player");

    const cpu =
        document.getElementById("cpu");

    const cpu2 =
        document.getElementById("cpu2");

    const cpu3 =
        document.getElementById("cpu3");

    const arena =
        document.getElementById("arena");


    const playerHealthEl =
        document.getElementById("playerHealth");

    const playerHealthText =
        document.getElementById("playerHealthText");


    const cpuHealthEl =
        document.getElementById("cpuHealth");

    const cpuHealthText =
        document.getElementById("cpuHealthText");


    const cpu1Health =
        document.getElementById("cpu1Health");

    const cpu1HealthText =
        document.getElementById("cpu1HealthText");

    const cpu2Health =
        document.getElementById("cpu2Health");

    const cpu2HealthText =
        document.getElementById("cpu2HealthText");

    const cpu3Health =
        document.getElementById("cpu3Health");

    const cpu3HealthText =
        document.getElementById("cpu3HealthText");


    const playerScoreEl =
        document.getElementById("playerScore");

    const cpuScoreEl =
        document.getElementById("cpuScore");

    const timerEl =
        document.getElementById("timer");


    const hitEffect =
        document.getElementById("hitEffect");

    const blockIndicator =
        document.getElementById("blockIndicator");


    const resultOverlay =
        document.getElementById("resultOverlay");

    const resultTitle =
        document.getElementById("resultTitle");

    const resultScore =
        document.getElementById("resultScore");

    const resultMessage =
        document.getElementById("resultMessage");

    const confetti =
        document.getElementById("confetti");


    /* =====================================================
       BUTTONS
       ===================================================== */

    const startBtn =
        document.getElementById("startBtn");

    const restartBtn =
        document.getElementById("restartBtn");

    const fullscreenBtn =
        document.getElementById("fullscreenBtn");

    const gameFullscreenBtn =
        document.getElementById("gameFullscreenBtn");

    const playAgainBtn =
        document.getElementById("playAgainBtn");


    const easyBtn =
        document.getElementById("easyBtn");

    const mediumBtn =
        document.getElementById("mediumBtn");

    const hardBtn =
        document.getElementById("hardBtn");

    const veryHardBtn =
        document.getElementById("veryHardBtn");


    /* =====================================================
       DIFFICULTY
       ===================================================== */

    const difficultySettings = {

        easy: {
            speed: 1.55,
            attackChance: 0.006,
            jumpChance: 0.004,
            blockChance: 0.002,
            damage: 0.75,
            count: 1
        },

        medium: {
            speed: 2.15,
            attackChance: 0.010,
            jumpChance: 0.006,
            blockChance: 0.005,
            damage: 0.95,
            count: 1
        },

        hard: {
            speed: 2.55,
            attackChance: 0.012,
            jumpChance: 0.007,
            blockChance: 0.006,
            damage: 1,
            count: 1
        },

        veryhard: {
            speed: 2.15,
            attackChance: 0.009,
            jumpChance: 0.007,
            blockChance: 0.006,
            damage: 0.8,
            count: 3
        }

    };


    let difficulty = "easy";


    /* =====================================================
       CONSTANTS
       ===================================================== */

    const MAX_HEALTH = 100;

    const GAME_TIME = 60;

    const MOVE_SPEED = 4.5;

    /*
       Shorter jump.
    */
    const JUMP_POWER = 12.5;

    const GRAVITY = 0.70;

    const ATTACK_RANGE = 78;

    const PUNCH_DAMAGE = 10;

    const KICK_DAMAGE = 14;

    const CPU_PUNCH_DAMAGE = 7;

    const CPU_KICK_DAMAGE = 10;

    const BLOCK_DURATION = 5000;

    const BLOCK_COOLDOWN = 10000;


    /* =====================================================
       GAME STATE
       ===================================================== */

    let gameRunning = false;

    let roundEnding = false;

    let matchFinished = false;

    let roundNumber = 1;

    let playerRounds = 0;

    let cpuRounds = 0;

    let timeLeft = GAME_TIME;

    let timerInterval = null;

    let animationFrame = null;

    let lastTime = 0;

    let messageTimer = null;


    /* =====================================================
       PLAYER
       ===================================================== */

    const playerState = {

        x: 120,

        y: 0,

        vx: 0,

        vy: 0,

        width: 46,

        height: 90,

        health: 100,

        facing: 1,

        onGround: true,

        jumping: false,

        attacking: false,

        attackType: null,

        attackTimer: 0,

        attackCooldown: 0,

        blocking: false,

        blockStart: 0,

        blockCooldownUntil: 0,

        hitFlash: 0

    };


    /* =====================================================
       CPU STATES
       ===================================================== */

    const cpuStates = [

        createCPU(0),

        createCPU(1),

        createCPU(2)

    ];


    function createCPU(index) {

        return {

            x:
                760 -
                index * 75,

            y: 0,

            vx: 0,

            vy: 0,

            width: 46,

            height: 90,

            health: 100,

            facing: -1,

            onGround: true,

            jumping: false,

            attacking: false,

            attackType: null,

            attackTimer: 0,

            attackCooldown: 0,

            blocking: false,

            blockStart: 0,

            blockCooldownUntil: 0,

            hitFlash: 0,

            aiTimer: 0

        };

    }


    const cpuElements = [
        cpu,
        cpu2,
        cpu3
    ];


    /* =====================================================
       KEYBOARD
       ===================================================== */

    const keys = {

        ArrowLeft: false,

        ArrowRight: false,

        ArrowUp: false,

        Space: false,

        KeyF: false,

        KeyD: false,

        KeyB: false

    };


    /* =====================================================
       ARENA SIZE
       ===================================================== */

    function arenaWidth() {

        return arena
            ? arena.clientWidth
            : window.innerWidth;

    }


    function arenaHeight() {

        return arena
            ? arena.clientHeight
            : window.innerHeight;

    }


    /* =====================================================
       FLOOR
       ===================================================== */

    function floorY() {

        if (!arena) {
            return arenaHeight() - 52;
        }

        const floor =
            arena.querySelector(".floor");

        if (!floor) {
            return arenaHeight() - 52;
        }

        return (
            floor.offsetTop
        );

    }


    /* =====================================================
       PLATFORMS
       ===================================================== */

    function getPlatforms() {

        if (!arena) {
            return [];
        }

        const arenaRect =
            arena.getBoundingClientRect();

        const elements =
            arena.querySelectorAll(
                ".platform"
            );

        const platforms = [];

        elements.forEach(element => {

            const rect =
                element.getBoundingClientRect();

            platforms.push({

                left:
                    rect.left -
                    arenaRect.left,

                right:
                    rect.right -
                    arenaRect.left,

                top:
                    rect.top -
                    arenaRect.top,

                bottom:
                    rect.bottom -
                    arenaRect.top

            });

        });

        return platforms;

    }


    /* =====================================================
       RESET PLAYER
       ===================================================== */

    function resetPlayer() {

        playerState.x = 120;

        /*
           IMPORTANT:
           Bottom of fighter is exactly on floor.
           Feet therefore sit ABOVE the floor surface.
        */

        playerState.y =
            floorY() -
            playerState.height -
            1;

        playerState.vx = 0;

        playerState.vy = 0;

        playerState.health =
            MAX_HEALTH;

        playerState.facing = 1;

        playerState.onGround = true;

        playerState.jumping = false;

        playerState.attacking = false;

        playerState.attackType = null;

        playerState.attackTimer = 0;

        playerState.attackCooldown = 0;

        playerState.blocking = false;

        playerState.blockStart = 0;

        playerState.blockCooldownUntil = 0;

        playerState.hitFlash = 0;

    }


    /* =====================================================
       RESET CPUS
       ===================================================== */

    function resetCPUs() {

        const count =
            difficultySettings[
                difficulty
            ].count;


        for (
            let i = 0;
            i < cpuStates.length;
            i++
        ) {

            const state =
                cpuStates[i];

            state.x =
                arenaWidth() -
                150 -
                i * 70;

            state.y =
                floorY() -
                state.height -
                1;

            state.vx = 0;

            state.vy = 0;

            state.health =
                MAX_HEALTH;

            state.facing = -1;

            state.onGround = true;

            state.jumping = false;

            state.attacking = false;

            state.attackType = null;

            state.attackTimer = 0;

            state.attackCooldown = 0;

            state.blocking = false;

            state.blockStart = 0;

            state.blockCooldownUntil = 0;

            state.hitFlash = 0;

            state.aiTimer =
                Math.random() * 1000;


            if (cpuElements[i]) {

                cpuElements[i].style.display =
                    i < count
                        ? "block"
                        : "none";

            }

        }

    }


    /* =====================================================
       HEALTH DISPLAY
       ===================================================== */

    function updateHealthDisplay() {

        if (playerHealthEl) {

            playerHealthEl.style.width =
                `${Math.max(
                    0,
                    playerState.health
                )}%`;

        }

        if (playerHealthText) {

            playerHealthText.textContent =
                Math.ceil(
                    Math.max(
                        0,
                        playerState.health
                    )
                );

        }


        if (
            difficulty !== "veryhard"
        ) {

            if (cpuHealthEl) {

                cpuHealthEl.style.width =
                    `${Math.max(
                        0,
                        cpuStates[0].health
                    )}%`;

            }

            if (cpuHealthText) {

                cpuHealthText.textContent =
                    Math.ceil(
                        Math.max(
                            0,
                            cpuStates[0].health
                        )
                    );

            }

        }


        if (cpu1Health) {

            cpu1Health.style.width =
                `${Math.max(
                    0,
                    cpuStates[0].health
                )}%`;

        }

        if (cpu1HealthText) {

            cpu1HealthText.textContent =
                Math.ceil(
                    Math.max(
                        0,
                        cpuStates[0].health
                    )
                );

        }


        if (cpu2Health) {

            cpu2Health.style.width =
                `${Math.max(
                    0,
                    cpuStates[1].health
                )}%`;

        }

        if (cpu2HealthText) {

            cpu2HealthText.textContent =
                Math.ceil(
                    Math.max(
                        0,
                        cpuStates[1].health
                    )
                );

        }


        if (cpu3Health) {

            cpu3Health.style.width =
                `${Math.max(
                    0,
                    cpuStates[2].health
                )}%`;

        }

        if (cpu3HealthText) {

            cpu3HealthText.textContent =
                Math.ceil(
                    Math.max(
                        0,
                        cpuStates[2].health
                    )
                );

        }

    }


    /* =====================================================
       SCORE
       ===================================================== */

    function updateScore() {

        if (playerScoreEl) {

            playerScoreEl.textContent =
                playerRounds;

        }

        if (cpuScoreEl) {

            cpuScoreEl.textContent =
                cpuRounds;

        }

    }


    /* =====================================================
       TIMER
       ===================================================== */

    function updateTimer() {

        if (timerEl) {

            timerEl.textContent =
                timeLeft;

        }

    }


    /* =====================================================
       SHOW MESSAGE
       ===================================================== */

    function showMessage(text) {

        if (!hitEffect) {
            return;
        }

        hitEffect.textContent =
            text;

        hitEffect.classList.add(
            "show"
        );

        clearTimeout(messageTimer);

        messageTimer =
            setTimeout(() => {

                hitEffect.classList.remove(
                    "show"
                );

            }, 500);

    }


    /* =====================================================
       PLAYER JUMP
       ===================================================== */

    function playerJump() {

        if (!gameRunning) {
            return;
        }

        if (roundEnding) {
            return;
        }

        if (
            playerState.onGround
        ) {

            playerState.vy =
                -JUMP_POWER;

            playerState.onGround =
                false;

            playerState.jumping =
                true;

        }

    }


    /* =====================================================
       PLAYER PUNCH
       ===================================================== */

    function playerPunch() {

        if (!gameRunning) {
            return;
        }

        if (roundEnding) {
            return;
        }

        if (
            playerState.attacking ||
            playerState.blocking
        ) {
            return;
        }

        if (
            playerState.attackCooldown > 0
        ) {
            return;
        }


        playerState.attacking =
            true;

        playerState.attackType =
            "punch";

        playerState.attackTimer =
            250;

        playerState.attackCooldown =
            400;


        let hit = false;


        for (
            let i = 0;
            i < 3;
            i++
        ) {

            if (
                i >=
                difficultySettings[
                    difficulty
                ].count
            ) {
                continue;
            }

            const enemy =
                cpuStates[i];

            if (
                enemy.health <= 0
            ) {
                continue;
            }


            if (
                isAttackRange(
                    playerState,
                    enemy
                )
            ) {

                enemy.health =
                    Math.max(
                        0,
                        enemy.health -
                        PUNCH_DAMAGE
                    );

                enemy.hitFlash =
                    180;

                hit = true;

            }

        }


        showMessage(
            hit
                ? "PUNCH!"
                : "MISS!"
        );

        updateHealthDisplay();

    }


    /* =====================================================
       PLAYER KICK
       ===================================================== */

    function playerKick() {

        if (!gameRunning) {
            return;
        }

        if (roundEnding) {
            return;
        }

        if (
            playerState.attacking ||
            playerState.blocking
        ) {
            return;
        }

        if (
            playerState.attackCooldown > 0
        ) {
            return;
        }


        playerState.attacking =
            true;

        playerState.attackType =
            "kick";

        playerState.attackTimer =
            320;

        playerState.attackCooldown =
            550;


        let hit = false;


        for (
            let i = 0;
            i < 3;
            i++
        ) {

            if (
                i >=
                difficultySettings[
                    difficulty
                ].count
            ) {
                continue;
            }

            const enemy =
                cpuStates[i];

            if (
                enemy.health <= 0
            ) {
                continue;
            }


            if (
                isAttackRange(
                    playerState,
                    enemy
                )
            ) {

                enemy.health =
                    Math.max(
                        0,
                        enemy.health -
                        KICK_DAMAGE
                    );

                enemy.hitFlash =
                    180;

                hit = true;

            }

        }


        showMessage(
            hit
                ? "KICK!"
                : "MISS KICK!"
        );

        updateHealthDisplay();

    }


    /* =====================================================
       ATTACK RANGE
       ===================================================== */

    function isAttackRange(
        attacker,
        target
    ) {

        const dx =
            target.x -
            attacker.x;

        const distance =
            Math.abs(dx);


        if (
            distance >
            ATTACK_RANGE
        ) {

            return false;

        }


        const verticalDistance =
            Math.abs(
                attacker.y -
                target.y
            );


        if (
            verticalDistance >
            75
        ) {

            return false;

        }


        const requiredDirection =
            dx >= 0
                ? 1
                : -1;


        if (
            attacker.facing !==
            requiredDirection
        ) {

            return false;

        }


        return true;

    }


    /* =====================================================
       BLOCK
       ===================================================== */

    function playerBlock() {

        if (!gameRunning) {
            return;
        }

        if (
            playerState.blocking
        ) {
            return;
        }

        const now =
            performance.now();


        if (
            now <
            playerState.blockCooldownUntil
        ) {

            return;

        }


        playerState.blocking =
            true;

        playerState.blockStart =
            now;


        if (blockIndicator) {

            blockIndicator.classList.add(
                "show"
            );

            blockIndicator.textContent =
                "5";

        }

    }


    /* =====================================================
       UPDATE PLAYER BLOCK
       ===================================================== */

    function updatePlayerBlock() {

        if (
            !playerState.blocking
        ) {
            return;
        }


        const elapsed =
            performance.now() -
            playerState.blockStart;


        const seconds =
            Math.max(
                0,
                Math.ceil(
                    (
                        BLOCK_DURATION -
                        elapsed
                    ) / 1000
                )
            );


        if (blockIndicator) {

            blockIndicator.textContent =
                seconds;

        }


        if (
            elapsed >=
            BLOCK_DURATION
        ) {

            playerState.blocking =
                false;

            playerState.blockCooldownUntil =
                performance.now() +
                BLOCK_COOLDOWN;


            if (blockIndicator) {

                blockIndicator.classList.remove(
                    "show"
                );

            }

        }

    }


    /* =====================================================
       CPU ATTACK
       ===================================================== */

    function cpuAttack(
        state,
        type
    ) {

        if (
            state.attacking ||
            state.blocking
        ) {
            return;
        }

        if (
            state.attackCooldown > 0
        ) {
            return;
        }


        state.attacking =
            true;

        state.attackType =
            type;

        state.attackTimer =
            type === "punch"
                ? 260
                : 330;

        state.attackCooldown =
            type === "punch"
                ? 500
                : 650;


        if (
            isAttackRange(
                state,
                playerState
            )
        ) {

            if (
                playerState.blocking
            ) {

                showMessage(
                    "BLOCK!"
                );

                return;

            }


            const settings =
                difficultySettings[
                    difficulty
                ];


            const baseDamage =
                type === "punch"
                    ? CPU_PUNCH_DAMAGE
                    : CPU_KICK_DAMAGE;


            playerState.health =
                Math.max(
                    0,
                    playerState.health -
                    (
                        baseDamage *
                        settings.damage
                    )
                );


            playerState.hitFlash =
                160;


            showMessage(
                type === "punch"
                    ? "CPU PUNCH!"
                    : "CPU KICK!"
            );


            updateHealthDisplay();

        }

    }


    /* =====================================================
       CPU AI
       ===================================================== */

    function updateCPU(
        state,
        index
    ) {

        if (
            state.health <= 0
        ) {

            state.vx = 0;

            return;

        }


        const settings =
            difficultySettings[
                difficulty
            ];


        const dx =
            playerState.x -
            state.x;


        const distance =
            Math.abs(dx);


        /*
           Face player.
        */

        state.facing =
            dx >= 0
                ? 1
                : -1;


        /*
           Move toward player.
        */

        if (
            distance > 72
        ) {

            state.vx =
                Math.sign(dx) *
                settings.speed;

        } else {

            state.vx = 0;

        }


        /*
           Attack.
        */

        if (
            distance <=
            ATTACK_RANGE &&
            Math.abs(
                state.y -
                playerState.y
            ) < 75
        ) {

            if (
                Math.random() <
                settings.attackChance
            ) {

                cpuAttack(
                    state,
                    Math.random() < 0.55
                        ? "punch"
                        : "kick"
                );

            }

        }


        /*
           Block if player is attacking.
        */

        if (
            playerState.attacking &&
            distance < 110
        ) {

            if (
                Math.random() <
                settings.blockChance
            ) {

                const now =
                    performance.now();

                if (
                    now >=
                    state.blockCooldownUntil
                ) {

                    state.blocking =
                        true;

                    state.blockStart =
                        now;

                }

            }

        }


        /*
           Jump occasionally.
        */

        if (
            state.onGround &&
            Math.random() <
            settings.jumpChance
        ) {

            if (
                distance > 130
            ) {

                state.vy =
                    -JUMP_POWER;

                state.onGround =
                    false;

                state.jumping =
                    true;

            }

        }


        /*
           Keep CPUs from standing
           on exactly the same spot.
        */

        for (
            let i = 0;
            i < cpuStates.length;
            i++
        ) {

            if (i === index) {
                continue;
            }

            const other =
                cpuStates[i];

            if (
                other.health <= 0
            ) {
                continue;
            }

            if (
                Math.abs(
                    state.x -
                    other.x
                ) < 48
            ) {

                state.x +=
                    state.x >
                    other.x
                        ? 1.2
                        : -1.2;

            }

        }

    }


    /* =====================================================
       CPU BLOCK
       ===================================================== */

    function updateCPUBlock(state) {

        if (
            !state.blocking
        ) {
            return;
        }


        if (
            performance.now() -
            state.blockStart >=
            BLOCK_DURATION
        ) {

            state.blocking =
                false;

            state.blockCooldownUntil =
                performance.now() +
                BLOCK_COOLDOWN;

        }

    }


    /* =====================================================
       ATTACK STATE
       ===================================================== */

    function updateAttackState(
        state,
        delta
    ) {

        if (
            state.attackCooldown > 0
        ) {

            state.attackCooldown -=
                delta;

            if (
                state.attackCooldown < 0
            ) {

                state.attackCooldown = 0;

            }

        }


        if (
            state.attackTimer > 0
        ) {

            state.attackTimer -=
                delta;

            if (
                state.attackTimer <= 0
            ) {

                state.attackTimer = 0;

                state.attacking =
                    false;

                state.attackType =
                    null;

            }

        }


        if (
            state.hitFlash > 0
        ) {

            state.hitFlash -=
                delta;

            if (
                state.hitFlash < 0
            ) {

                state.hitFlash = 0;

            }

        }

    }


    /* =====================================================
       PHYSICS
       ===================================================== */

    function physics(state, delta) {

        const dt =
            Math.min(
                delta / 16.67,
                2
            );


        state.vy +=
            GRAVITY *
            dt;


        state.y +=
            state.vy *
            dt;


        state.x +=
            state.vx *
            dt;


        /*
           Arena boundaries.
        */

        const maxX =
            arenaWidth() -
            state.width -
            5;


        if (
            state.x < 5
        ) {

            state.x = 5;

            state.vx = 0;

        }


        if (
            state.x > maxX
        ) {

            state.x = maxX;

            state.vx = 0;

        }


        /*
           FLOOR.
           Fighter bottom stays slightly
           ABOVE the floor.
        */

        const ground =
            floorY() -
            state.height -
            1;


        if (
            state.y >= ground
        ) {

            state.y =
                ground;

            state.vy = 0;

            state.onGround =
                true;

            state.jumping =
                false;

        }


        /*
           PLATFORMS.
        */

        const platforms =
            getPlatforms();


        if (
            state.vy >= 0
        ) {

            const oldBottom =
                state.y +
                state.height -
                state.vy;


            const bottom =
                state.y +
                state.height;


            const centerX =
                state.x +
                state.width / 2;


            for (
                const platform of platforms
            ) {

                const touchingHorizontal =
                    centerX >
                    platform.left &&
                    centerX <
                    platform.right;


                const crossingTop =
                    oldBottom <=
                    platform.top + 4 &&
                    bottom >=
                    platform.top;


                if (
                    touchingHorizontal &&
                    crossingTop
                ) {

                    state.y =
                        platform.top -
                        state.height -
                        1;

                    state.vy = 0;

                    state.onGround =
                        true;

                    state.jumping =
                        false;

                    break;

                }

            }

        }

    }


    /* =====================================================
       PLAYER MOVEMENT
       ===================================================== */

    function updatePlayerMovement() {

        if (
            playerState.blocking
        ) {

            playerState.vx = 0;

            return;

        }


        if (
            playerState.attacking
        ) {

            playerState.vx *= 0.7;

            return;

        }


        playerState.vx = 0;


        if (
            keys.ArrowLeft
        ) {

            playerState.vx =
                -MOVE_SPEED;

            playerState.facing =
                -1;

        }


        if (
            keys.ArrowRight
        ) {

            playerState.vx =
                MOVE_SPEED;

            playerState.facing =
                1;

        }

    }


    /* =====================================================
       FIGHTER COLLISION
       ===================================================== */

    function resolveCollision() {

        const count =
            difficultySettings[
                difficulty
            ].count;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const enemy =
                cpuStates[i];


            if (
                enemy.health <= 0
            ) {
                continue;
            }


            const playerRight =
                playerState.x +
                playerState.width;


            const enemyRight =
                enemy.x +
                enemy.width;


            if (
                playerRight >
                enemy.x &&
                playerState.x <
                enemyRight &&
                Math.abs(
                    playerState.y -
                    enemy.y
                ) < 70
            ) {

                const overlap =
                    Math.min(
                        playerRight,
                        enemyRight
                    ) -
                    Math.max(
                        playerState.x,
                        enemy.x
                    );


                if (
                    playerState.x <
                    enemy.x
                ) {

                    playerState.x -=
                        overlap / 2;

                    enemy.x +=
                        overlap / 2;

                } else {

                    playerState.x +=
                        overlap / 2;

                    enemy.x -=
                        overlap / 2;

                }

            }

        }

    }


    /* =====================================================
       CHECK WIN
       ===================================================== */

    function allCPUsDefeated() {

        const count =
            difficultySettings[
                difficulty
            ].count;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            if (
                cpuStates[i].health > 0
            ) {

                return false;

            }

        }


        return true;

    }


    /* =====================================================
       ROUND END
       ===================================================== */

    function checkRoundEnd() {

        if (
            roundEnding
        ) {
            return;
        }


        if (
            playerState.health <= 0
        ) {

            endRound("cpu");

            return;

        }


        if (
            allCPUsDefeated()
        ) {

            endRound("player");

        }

    }


    /* =====================================================
       END ROUND
       ===================================================== */

    function endRound(winner) {

        if (
            roundEnding
        ) {
            return;
        }


        roundEnding =
            true;


        if (
            winner === "player"
        ) {

            playerRounds++;

        } else {

            cpuRounds++;

        }


        updateScore();


        clearInterval(
            timerInterval
        );


        timerInterval =
            null;


        setTimeout(() => {

            /*
               Match winner.
            */

            if (
                playerRounds >= 2
            ) {

                finishMatch(
                    "player"
                );

                return;

            }


            if (
                cpuRounds >= 2
            ) {

                finishMatch(
                    "cpu"
                );

                return;

            }


            /*
               Continue to next round.
            */

            roundNumber++;

            startRound();

        }, 1100);

    }


    /* =====================================================
       START ROUND
       ===================================================== */

    function startRound() {

        if (
            !gameRunning
        ) {
            return;
        }


        roundEnding =
            false;


        resetPlayer();

        resetCPUs();


        timeLeft =
            GAME_TIME;


        updateTimer();

        updateHealthDisplay();


        startTimer();

    }


    /* =====================================================
       TIMER
       ===================================================== */

    function startTimer() {

        clearInterval(
            timerInterval
        );


        timerInterval =
            setInterval(() => {

                if (
                    !gameRunning ||
                    roundEnding
                ) {

                    return;

                }


                timeLeft--;

                updateTimer();


                if (
                    timeLeft <= 0
                ) {

                    clearInterval(
                        timerInterval
                    );

                    timerInterval =
                        null;


                    endRound(
                        "cpu"
                    );

                }

            }, 1000);

    }


    /* =====================================================
       START GAME
       ===================================================== */

    function startGame() {

        /*
           This is deliberately simple.

           The PLAY NOW button directly reaches
           this function.
        */

        gameRunning =
            true;

        roundEnding =
            false;

        matchFinished =
            false;


        roundNumber =
            1;

        playerRounds =
            0;

        cpuRounds =
            0;


        if (
            resultOverlay
        ) {

            resultOverlay.classList.remove(
                "show"
            );

        }


        updateScore();


        startRound();


        /*
           Move view to arena.
        */

        setTimeout(() => {

            const gameSection =
                document.querySelector(
                    ".game-section"
                );

            if (
                gameSection
            ) {

                gameSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }, 100);

    }


    /* =====================================================
       FINISH MATCH
       ===================================================== */

    function finishMatch(
        winner
    ) {

        if (
            matchFinished
        ) {
            return;
        }


        matchFinished =
            true;

        gameRunning =
            false;


        clearInterval(
            timerInterval
        );


        if (
            winner === "player"
        ) {

            if (
                resultTitle
            ) {

                resultTitle.textContent =
                    "YOU WIN!";

            }

            if (
                resultMessage
            ) {

                resultMessage.textContent =
                    "You conquered the neon arena!";

            }

        } else {

            if (
                resultTitle
            ) {

                resultTitle.textContent =
                    "CPU WINS!";

            }

            if (
                resultMessage
            ) {

                resultMessage.textContent =
                    "The arena belongs to the CPU this time.";

            }

        }


        if (
            resultScore
        ) {

            resultScore.textContent =
                `${playerRounds} : ${cpuRounds}`;

        }


        if (
            resultOverlay
        ) {

            resultOverlay.classList.add(
                "show"
            );

        }


        makeConfetti();

    }


    /* =====================================================
       CONFETTI
       ===================================================== */

    function makeConfetti() {

        if (!confetti) {
            return;
        }


        confetti.innerHTML =
            "";


        for (
            let i = 0;
            i < 60;
            i++
        ) {

            const piece =
                document.createElement(
                    "span"
                );


            piece.className =
                "confetti-piece";


            piece.style.left =
                `${Math.random() * 100}%`;


            piece.style.animationDelay =
                `${Math.random() * 1.5}s`;


            confetti.appendChild(
                piece
            );

        }

    }


    /* =====================================================
       RENDER PLAYER
       ===================================================== */

    function renderPlayer() {

        if (!player) {
            return;
        }


        player.style.left =
            `${playerState.x}px`;


        player.style.top =
            `${playerState.y}px`;


        player.classList.toggle(
            "facing-left",
            playerState.facing === -1
        );


        player.classList.toggle(
            "attacking",
            playerState.attacking
        );


        player.classList.toggle(
            "blocking",
            playerState.blocking
        );


        player.classList.toggle(
            "hit",
            playerState.hitFlash > 0
        );

    }


    /* =====================================================
       RENDER CPUS
       ===================================================== */

    function renderCPUs() {

        const count =
            difficultySettings[
                difficulty
            ].count;


        for (
            let i = 0;
            i < cpuElements.length;
            i++
        ) {

            const element =
                cpuElements[i];

            const state =
                cpuStates[i];


            if (!element) {
                continue;
            }


            if (
                i >= count ||
                state.health <= 0
            ) {

                element.style.display =
                    "none";

                continue;

            }


            element.style.display =
                "block";


            element.style.left =
                `${state.x}px`;


            element.style.top =
                `${state.y}px`;


            element.classList.toggle(
                "facing-left",
                state.facing === -1
            );


            element.classList.toggle(
                "attacking",
                state.attacking
            );


            element.classList.toggle(
                "blocking",
                state.blocking
            );


            element.classList.toggle(
                "hit",
                state.hitFlash > 0
            );

        }

    }


    /* =====================================================
       GAME LOOP
       ===================================================== */

    function gameLoop(timestamp) {

        if (
            !lastTime
        ) {

            lastTime =
                timestamp;

        }


        const delta =
            Math.min(
                timestamp -
                lastTime,
                40
            );


        lastTime =
            timestamp;


        if (
            gameRunning &&
            !roundEnding
        ) {

            updatePlayerMovement();

            updatePlayerBlock();

            updateAttackState(
                playerState,
                delta
            );


            physics(
                playerState,
                delta
            );


            const count =
                difficultySettings[
                    difficulty
                ].count;


            for (
                let i = 0;
                i < count;
                i++
            ) {

                updateCPU(
                    cpuStates[i],
                    i
                );


                updateCPUBlock(
                    cpuStates[i]
                );


                updateAttackState(
                    cpuStates[i],
                    delta
                );


                physics(
                    cpuStates[i],
                    delta
                );

            }


            resolveCollision();

            checkRoundEnd();

        }


        renderPlayer();

        renderCPUs();


        animationFrame =
            requestAnimationFrame(
                gameLoop
            );

    }


    /* =====================================================
       DIFFICULTY SELECTION
       ===================================================== */

    function chooseDifficulty(
        newDifficulty
    ) {

        if (
            !difficultySettings[
                newDifficulty
            ]
        ) {

            return;

        }


        difficulty =
            newDifficulty;


        [
            easyBtn,
            mediumBtn,
            hardBtn,
            veryHardBtn
        ].forEach(button => {

            if (button) {

                button.classList.remove(
                    "active"
                );

            }

        });


        const selected = {

            easy:
                easyBtn,

            medium:
                mediumBtn,

            hard:
                hardBtn,

            veryhard:
                veryHardBtn

        };


        if (
            selected[newDifficulty]
        ) {

            selected[
                newDifficulty
            ].classList.add(
                "active"
            );

        }


        document.body.classList.toggle(
            "hard-mode",
            newDifficulty === "hard"
        );


        document.body.classList.toggle(
            "very-hard-mode",
            newDifficulty === "veryhard"
        );


        /*
           If already playing,
           immediately restart with
           the new difficulty.
        */

        if (
            gameRunning
        ) {

            startGame();

        }

    }


    /* =====================================================
       DIFFICULTY BUTTONS
       ===================================================== */

    if (easyBtn) {

        easyBtn.addEventListener(
            "click",
            () => {
                chooseDifficulty(
                    "easy"
                );
            }
        );

    }


    if (mediumBtn) {

        mediumBtn.addEventListener(
            "click",
            () => {
                chooseDifficulty(
                    "medium"
                );
            }
        );

    }


    if (hardBtn) {

        hardBtn.addEventListener(
            "click",
            () => {
                chooseDifficulty(
                    "hard"
                );
            }
        );

    }


    if (veryHardBtn) {

        veryHardBtn.addEventListener(
            "click",
            () => {
                chooseDifficulty(
                    "veryhard"
                );
            }
        );

    }


    /* =====================================================
       KEYBOARD DOWN
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                [
                    "ArrowLeft",
                    "ArrowRight",
                    "ArrowUp",
                    "Space"
                ].includes(
                    event.code
                )
            ) {

                event.preventDefault();

            }


            keys[event.code] =
                true;


            if (
                !gameRunning
            ) {

                return;

            }


            if (
                event.code ===
                "ArrowUp" &&
                !event.repeat
            ) {

                playerJump();

            }


            if (
                event.code ===
                "Space" &&
                !event.repeat
            ) {

                playerPunch();

            }


            if (
                event.code ===
                "KeyF" &&
                !event.repeat
            ) {

                playerKick();

            }


            if (
                (
                    event.code ===
                    "KeyD" ||
                    event.code ===
                    "KeyB"
                ) &&
                !event.repeat
            ) {

                playerBlock();

            }

        }
    );


    /* =====================================================
       KEYBOARD UP
       ===================================================== */

    document.addEventListener(
        "keyup",
        event => {

            keys[event.code] =
                false;

        }
    );


    /* =====================================================
       PLAY BUTTON
       ===================================================== */

    if (startBtn) {

        startBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                startGame();

            }
        );

    }


    /* =====================================================
       RESTART
       ===================================================== */

    if (restartBtn) {

        restartBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                startGame();

            }
        );

    }


    /* =====================================================
       PLAY AGAIN
       ===================================================== */

    if (playAgainBtn) {

        playAgainBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                if (
                    resultOverlay
                ) {

                    resultOverlay.classList.remove(
                        "show"
                    );

                }

                startGame();

            }
        );

    }


    /* =====================================================
       FULLSCREEN
       ===================================================== */

    async function fullscreen() {

        try {

            if (
                !document.fullscreenElement
            ) {

                if (
                    document.documentElement
                        .requestFullscreen
                ) {

                    await document
                        .documentElement
                        .requestFullscreen();

                }

                document.body.classList.add(
                    "fullscreen-mode"
                );

            } else {

                if (
                    document.exitFullscreen
                ) {

                    await document.exitFullscreen();

                }

                document.body.classList.remove(
                    "fullscreen-mode"
                );

            }

        } catch (error) {

            /*
               Fallback if browser blocks
               fullscreen API.
            */

            document.body.classList.toggle(
                "fullscreen-mode"
            );

        }

    }


    if (fullscreenBtn) {

        fullscreenBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                fullscreen();

            }
        );

    }


    if (gameFullscreenBtn) {

        gameFullscreenBtn.addEventListener(
            "click",
            event => {

                event.preventDefault();

                fullscreen();

            }
        );

    }


    /* =====================================================
       FULLSCREEN CHANGE
       ===================================================== */

    document.addEventListener(
        "fullscreenchange",
        () => {

            document.body.classList.toggle(
                "fullscreen-mode",
                Boolean(
                    document.fullscreenElement
                )
            );

        }
    );


    /* =====================================================
       RESIZE
       ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                !gameRunning
            ) {

                return;

            }


            const maxPlayer =
                arenaWidth() -
                playerState.width -
                5;


            playerState.x =
                Math.max(
                    5,
                    Math.min(
                        playerState.x,
                        maxPlayer
                    )
                );


            for (
                const state of cpuStates
            ) {

                const max =
                    arenaWidth() -
                    state.width -
                    5;


                state.x =
                    Math.max(
                        5,
                        Math.min(
                            state.x,
                            max
                        )
                    );

            }

        }
    );


    /* =====================================================
       INITIAL SETUP
       ===================================================== */

    chooseDifficulty(
        "easy"
    );


    resetPlayer();

    resetCPUs();

    updateHealthDisplay();

    updateScore();

    updateTimer();


    if (
        resultOverlay
    ) {

        resultOverlay.classList.remove(
            "show"
        );

    }


    /*
       START THE GAME LOOP.
       This runs independently of the
       PLAY button, so the button cannot
       be blocked by the game loop.
    */

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

});