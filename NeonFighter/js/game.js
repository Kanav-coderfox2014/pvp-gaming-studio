const player = document.getElementById("player");
const cpu = document.getElementById("cpu");

const playerHealthBar = document.getElementById("playerHealth");
const cpuHealthBar = document.getElementById("cpuHealth");

const playerHealthText = document.getElementById("playerHealthText");
const cpuHealthText = document.getElementById("cpuHealthText");

const playerWinsText = document.getElementById("playerWins");
const cpuWinsText = document.getElementById("cpuWins");

const timerText = document.getElementById("timer");

const message = document.getElementById("message");

const actionStatus = document.getElementById("actionStatus");
const seriesStatus = document.getElementById("seriesStatus");

const playerAction = document.getElementById("playerAction");
const cpuAction = document.getElementById("cpuAction");

const blockBar = document.getElementById("blockBar");
const blockStatus = document.getElementById("blockStatus");

const restartButton = document.getElementById("restartButton");

const matchBoxes = [
    document.getElementById("match1"),
    document.getElementById("match2"),
    document.getElementById("match3")
];


/* =========================
   GAME VARIABLES
========================= */

let playerHealth = 100;
let cpuHealth = 100;

let playerWins = 0;
let cpuWins = 0;

let currentMatch = 1;

let playerX = 18;
let cpuX = 74;

let playerY = 0;
let cpuY = 0;

let playerVelocityY = 0;
let cpuVelocityY = 0;

let keys = {};

let gameRunning = true;
let matchOver = false;

let timeLeft = 60;
let timerInterval;


/* =========================
   ATTACK COOLDOWNS
========================= */

let playerAttackCooldown = 0;
let cpuAttackCooldown = 0;


/* =========================
   PLAYER BLOCK SYSTEM
========================= */

/*
    Block:
    - Maximum active time = 5 seconds
    - Cooldown = 10 seconds
*/

const BLOCK_DURATION = 5;
const BLOCK_COOLDOWN = 10;

let playerBlocking = false;

let blockTimeLeft = 0;
let blockCooldownLeft = 0;

let blockTimer = null;
let blockCooldownTimer = null;


/* =========================
   CPU BLOCK SYSTEM
========================= */

let cpuBlocking = false;
let cpuBlockTimer = null;


/* =========================
   KEYBOARD
========================= */

document.addEventListener("keydown", function(event) {

    keys[event.key.toLowerCase()] = true;

    if (
        event.key === " " ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
    ) {
        event.preventDefault();
    }

    if (!gameRunning || matchOver) {
        return;
    }

    /* PUNCH */

    if (event.key === " ") {
        playerAttack("punch");
    }

    /* KICK */

    if (event.key.toLowerCase() === "f") {
        playerAttack("kick");
    }

    /* BLOCK */

    if (event.key.toLowerCase() === "d") {

        /*
            Only activate if block is READY.
            Holding D will NOT restart the timer.
        */

        if (!playerBlocking && blockCooldownLeft <= 0) {
            startPlayerBlock();
        }
    }

    /* JUMP */

    if (
        event.key === "ArrowUp" &&
        playerY === 0
    ) {
        playerVelocityY = 13;
    }

});


document.addEventListener("keyup", function(event) {

    keys[event.key.toLowerCase()] = false;

    /*
        Important:
        Releasing D does NOT immediately cancel block.

        Block always lasts up to 5 seconds.
    */

});


/* =========================
   PLAYER BLOCK
========================= */

function startPlayerBlock() {

    if (!gameRunning || matchOver) {
        return;
    }

    if (playerBlocking) {
        return;
    }

    if (blockCooldownLeft > 0) {
        return;
    }

    playerBlocking = true;

    blockTimeLeft = BLOCK_DURATION;

    player.classList.add("blocking");

    actionStatus.textContent = "BLOCK ACTIVE";

    blockStatus.className = "block-status active";

    updateBlockUI();

    clearInterval(blockTimer);

    blockTimer = setInterval(() => {

        blockTimeLeft--;

        updateBlockUI();

        if (blockTimeLeft <= 0) {

            stopPlayerBlock();

            startBlockCooldown();
        }

    }, 1000);
}


/* =========================
   STOP PLAYER BLOCK
========================= */

function stopPlayerBlock() {

    playerBlocking = false;

    player.classList.remove("blocking");

    clearInterval(blockTimer);

    blockTimer = null;

    blockTimeLeft = 0;

    updateBlockUI();

    if (gameRunning && !matchOver) {
        actionStatus.textContent = "READY";
    }
}


/* =========================
   BLOCK COOLDOWN
========================= */

function startBlockCooldown() {

    blockCooldownLeft = BLOCK_COOLDOWN;

    blockStatus.className = "block-status cooldown";

    updateBlockUI();

    clearInterval(blockCooldownTimer);

    blockCooldownTimer = setInterval(() => {

        blockCooldownLeft--;

        updateBlockUI();

        if (blockCooldownLeft <= 0) {

            clearInterval(blockCooldownTimer);

            blockCooldownTimer = null;

            blockCooldownLeft = 0;

            updateBlockUI();

            if (gameRunning && !matchOver) {
                actionStatus.textContent = "READY";
            }
        }

    }, 1000);
}


/* =========================
   BLOCK UI
========================= */

function updateBlockUI() {

    if (playerBlocking) {

        const percentage =
            (blockTimeLeft / BLOCK_DURATION) * 100;

        blockBar.style.width =
            Math.max(0, percentage) + "%";

        blockStatus.textContent =
            "ACTIVE — " + blockTimeLeft + "s";

        return;
    }

    if (blockCooldownLeft > 0) {

        /*
            Cooldown starts at 10 seconds.
            Bar slowly fills as cooldown finishes.
        */

        const percentage =
            ((BLOCK_COOLDOWN - blockCooldownLeft) /
            BLOCK_COOLDOWN) * 100;

        blockBar.style.width =
            Math.max(0, percentage) + "%";

        blockStatus.textContent =
            "COOLDOWN — " +
            blockCooldownLeft +
            "s";

        return;
    }

    blockBar.style.width = "100%";

    blockStatus.textContent =
        "READY — PRESS D";

    blockStatus.className =
        "block-status ready";
}


/* =========================
   PLAYER ATTACK
========================= */

function playerAttack(type) {

    if (!gameRunning || matchOver) {
        return;
    }

    if (playerAttackCooldown > 0) {
        return;
    }

    /*
        Attacking while blocking cancels block.
    */

    if (playerBlocking) {

        stopPlayerBlock();

        startBlockCooldown();
    }


    if (type === "punch") {

        playerAttackCooldown = 18;

        player.classList.remove("punching");

        void player.offsetWidth;

        player.classList.add("punching");

        showAction(
            playerAction,
            "PUNCH!",
            "#00eaff"
        );

        actionStatus.textContent =
            "PUNCH ATTACK";

        /*
            Punch has a limited range.
        */

        checkPlayerAttack(
            8,
            8.5,
            "PUNCH"
        );
    }


    if (type === "kick") {

        playerAttackCooldown = 28;

        player.classList.remove("kicking");

        void player.offsetWidth;

        player.classList.add("kicking");

        showAction(
            playerAction,
            "KICK!",
            "#ffe600"
        );

        actionStatus.textContent =
            "KICK ATTACK";

        /*
            Kick has a slightly longer range.
        */

        checkPlayerAttack(
            12,
            10.5,
            "KICK"
        );
    }


    setTimeout(() => {

        player.classList.remove(
            "punching",
            "kicking"
        );

        if (
            !playerBlocking &&
            gameRunning &&
            !matchOver
        ) {
            actionStatus.textContent =
                "READY";
        }

    }, 300);
}


/* =========================
   PLAYER ATTACK HIT CHECK
========================= */

function checkPlayerAttack(
    damage,
    range,
    attackName
) {

    /*
        IMPORTANT:
        Attack only lands if fighters
        are actually close enough.

        A punch from across the arena
        cannot damage the CPU.
    */

    const distance = Math.abs(
        playerX - cpuX
    );


    if (distance > range) {

        showAction(
            playerAction,
            "MISS!",
            "#888"
        );

        actionStatus.textContent =
            attackName + " MISSED";

        return;
    }


    /*
        CPU is blocking.
    */

    if (cpuBlocking) {

        const blockedDamage =
            Math.ceil(damage * 0.25);

        cpuHealth -= blockedDamage;

        if (cpuHealth < 0) {
            cpuHealth = 0;
        }

        showAction(
            cpuAction,
            "BLOCKED!",
            "#38aaff"
        );

        updateHealth();

        return;
    }


    /*
        Successful hit.
    */

    cpuHealth -= damage;

    if (cpuHealth < 0) {
        cpuHealth = 0;
    }

    showAction(
        cpuAction,
        "-" + damage,
        "#ff3b5c"
    );

    cpu.classList.add("hit");

    setTimeout(() => {

        cpu.classList.remove("hit");

    }, 200);

    updateHealth();

    /*
        CPU may intelligently move away
        after getting hit.
    */

    if (cpuHealth > 0) {

        if (Math.random() < 0.6) {

            if (cpuX > playerX) {
                cpuX += 3;
            } else {
                cpuX -= 3;
            }

            cpuX = Math.max(
                5,
                Math.min(88, cpuX)
            );
        }
    }


    if (cpuHealth <= 0) {

        endMatch("PLAYER");
    }
}


/* =========================
   CPU AI
========================= */

function cpuThink() {

    if (!gameRunning || matchOver) {
        return;
    }

    const distance =
        Math.abs(playerX - cpuX);


    /*
        CPU keeps a reasonable fighting distance.
    */

    if (distance > 11) {

        if (playerX > cpuX) {
            cpuX += 0.28;
        } else {
            cpuX -= 0.28;
        }

        return;
    }


    /*
        CPU is close enough.

        Sometimes it moves away instead
        of attacking.
    */

    if (Math.random() < 0.15) {

        if (cpuX > playerX) {
            cpuX += 1.2;
        } else {
            cpuX -= 1.2;
        }

        return;
    }


    /*
        CPU blocks if the player is
        attacking or very close.
    */

    if (
        distance < 9 &&
        !cpuBlocking &&
        Math.random() < 0.22
    ) {

        startCPUBlock();

        return;
    }


    /*
        CPU attacks.
    */

    if (
        distance <= 10.5 &&
        cpuAttackCooldown <= 0
    ) {

        cpuAttack();
    }

}


/* =========================
   CPU ATTACK
========================= */

function cpuAttack() {

    if (!gameRunning || matchOver) {
        return;
    }

    if (cpuAttackCooldown > 0) {
        return;
    }


    const distance =
        Math.abs(playerX - cpuX);


    /*
        Double-check range.

        This prevents CPU attacks from
        magically landing from far away.
    */

    if (distance > 10.5) {
        return;
    }


    const attackType =
        Math.random() < 0.55
            ? "punch"
            : "kick";


    if (attackType === "punch") {

        cpuAttackCooldown = 55;

        cpu.classList.add("punching");

        showAction(
            cpuAction,
            "PUNCH!",
            "#ff3b5c"
        );

        setTimeout(() => {

            cpu.classList.remove("punching");

        }, 250);

        checkCPUAttack(
            7,
            8.5
        );

    } else {

        cpuAttackCooldown = 70;

        cpu.classList.add("kicking");

        showAction(
            cpuAction,
            "KICK!",
            "#ff8c42"
        );

        setTimeout(() => {

            cpu.classList.remove("kicking");

        }, 300);

        checkCPUAttack(
            10,
            10.5
        );
    }
}


/* =========================
   CPU ATTACK CHECK
========================= */

function checkCPUAttack(
    damage,
    range
) {

    const distance =
        Math.abs(playerX - cpuX);


    /*
        CPU attack misses if player
        is outside the attack range.
    */

    if (distance > range) {

        showAction(
            cpuAction,
            "MISS!",
            "#888"
        );

        return;
    }


    /*
        Player is blocking.
    */

    if (playerBlocking) {

        const blockedDamage =
            Math.ceil(damage * 0.25);

        playerHealth -= blockedDamage;

        if (playerHealth < 0) {
            playerHealth = 0;
        }

        showAction(
            playerAction,
            "BLOCKED!",
            "#38aaff"
        );

        updateHealth();

        return;
    }


    /*
        Successful CPU hit.
    */

    playerHealth -= damage;

    if (playerHealth < 0) {
        playerHealth = 0;
    }

    showAction(
        playerAction,
        "-" + damage,
        "#ff3b5c"
    );

    player.classList.add("hit");

    setTimeout(() => {

        player.classList.remove("hit");

    }, 200);

    updateHealth();


    if (playerHealth <= 0) {

        endMatch("CPU");
    }
}


/* =========================
   ACTION TEXT
========================= */

function showAction(
    element,
    text,
    color
) {

    element.textContent = text;

    element.style.color = color;

    element.classList.remove("active");

    void element.offsetWidth;

    element.classList.add("active");

    setTimeout(() => {

        element.classList.remove("active");

    }, 350);
}


/* =========================
   MOVEMENT
========================= */

function updateMovement() {

    if (!gameRunning || matchOver) {
        return;
    }


    /*
        PLAYER MOVEMENT
    */

    if (keys["arrowleft"]) {
        playerX -= 0.8;
    }

    if (keys["arrowright"]) {
        playerX += 0.8;
    }


    playerX = Math.max(
        5,
        Math.min(88, playerX)
    );


    /*
        PLAYER JUMP
    */

    if (
        playerY > 0 ||
        playerVelocityY > 0
    ) {

        playerY += playerVelocityY;

        playerVelocityY -= 0.7;

        if (playerY <= 0) {

            playerY = 0;
            playerVelocityY = 0;
        }
    }


    player.style.left =
        playerX + "%";

    player.style.bottom =
        (42 + playerY) + "px";


    /*
        CPU JUMP
    */

    if (
        Math.random() < 0.0015 &&
        cpuY === 0
    ) {

        cpuVelocityY = 11;
    }


    if (
        cpuY > 0 ||
        cpuVelocityY > 0
    ) {

        cpuY += cpuVelocityY;

        cpuVelocityY -= 0.7;

        if (cpuY <= 0) {

            cpuY = 0;
            cpuVelocityY = 0;
        }
    }


    cpu.style.bottom =
        (42 + cpuY) + "px";


    /*
        CPU MOVEMENT IS HANDLED
        BY cpuThink().
    */

    cpu.style.left =
        cpuX + "%";
}


/* =========================
   HEALTH UI
========================= */

function updateHealth() {

    playerHealthBar.style.width =
        playerHealth + "%";

    cpuHealthBar.style.width =
        cpuHealth + "%";

    playerHealthText.textContent =
        playerHealth;

    cpuHealthText.textContent =
        cpuHealth;
}


/* =========================
   TIMER
========================= */

function startTimer() {

    clearInterval(timerInterval);

    timeLeft = 60;

    timerText.textContent =
        timeLeft;


    timerInterval = setInterval(() => {

        if (!gameRunning || matchOver) {
            return;
        }

        timeLeft--;

        timerText.textContent =
            timeLeft;


        if (timeLeft <= 0) {

            clearInterval(timerInterval);

            /*
                If time ends, higher health wins.
            */

            if (playerHealth > cpuHealth) {

                endMatch("PLAYER");

            } else if (cpuHealth > playerHealth) {

                endMatch("CPU");

            } else {

                /*
                    Exact tie:
                    CPU gets a very small advantage
                    so the game cannot get stuck.
                */

                endMatch("CPU");
            }
        }

    }, 1000);
}


/* =========================
   END MATCH
========================= */

function endMatch(winner) {

    if (matchOver) {
        return;
    }

    matchOver = true;

    clearInterval(timerInterval);

    /*
        Stop player block.
    */

    if (playerBlocking) {
        stopPlayerBlock();
    }


    /*
        PLAYER WON ROUND
    */

    if (winner === "PLAYER") {

        playerWins++;

        matchBoxes[
            currentMatch - 1
        ].classList.remove("active");

        matchBoxes[
            currentMatch - 1
        ].classList.add("win");

        matchBoxes[
            currentMatch - 1
        ].textContent =
            "MATCH " +
            currentMatch +
            " - WIN";

        playerWinsText.textContent =
            playerWins;

        message.textContent =
            "YOU WIN ROUND " +
            currentMatch;

        message.style.color =
            "#20ff88";

    }


    /*
        CPU WON ROUND
    */

    else {

        cpuWins++;

        matchBoxes[
            currentMatch - 1
        ].classList.remove("active");

        matchBoxes[
            currentMatch - 1
        ].classList.add("loss");

        matchBoxes[
            currentMatch - 1
        ].textContent =
            "MATCH " +
            currentMatch +
            " - LOSS";

        cpuWinsText.textContent =
            cpuWins;

        message.textContent =
            "CPU WINS ROUND " +
            currentMatch;

        message.style.color =
            "#ff3b5c";
    }


    message.classList.add("show");

    seriesStatus.textContent =
        "Round " +
        currentMatch +
        " finished";


    /*
        IMPORTANT:

        NEVER END THE SERIES AFTER
        2 ROUNDS.

        Always continue to Match 3.
    */

    if (currentMatch === 3) {

        setTimeout(() => {

            finishSeries();

        }, 1800);

        return;
    }


    /*
        Start next round.
    */

    setTimeout(() => {

        startNextMatch();

    }, 1800);
}


/* =========================
   NEXT MATCH
========================= */

function startNextMatch() {

    currentMatch++;

    playerHealth = 100;
    cpuHealth = 100;

    playerX = 18;
    cpuX = 74;

    playerY = 0;
    cpuY = 0;

    playerVelocityY = 0;
    cpuVelocityY = 0;

    matchOver = false;
    gameRunning = true;

    player.classList.remove(
        "blocking",
        "punching",
        "kicking",
        "hit"
    );

    cpu.classList.remove(
        "blocking",
        "punching",
        "kicking",
        "hit"
    );

    playerBlocking = false;
    cpuBlocking = false;

    /*
        Reset block for the new round.
    */

    clearInterval(blockTimer);
    clearInterval(blockCooldownTimer);
    clearInterval(cpuBlockTimer);

    blockTimer = null;
    blockCooldownTimer = null;
    cpuBlockTimer = null;

    blockTimeLeft = 0;
    blockCooldownLeft = 0;

    updateBlockUI();


    matchBoxes.forEach(box => {

        box.classList.remove("active");

    });

    matchBoxes[
        currentMatch - 1
    ].classList.add("active");


    message.classList.remove("show");

    actionStatus.textContent =
        "READY";

    seriesStatus.textContent =
        "Match " +
        currentMatch +
        " of 3";


    updateHealth();

    startTimer();
}


/* =========================
   FINISH SERIES
========================= */

function finishSeries() {

    gameRunning = false;
    matchOver = true;

    clearInterval(timerInterval);

    /*
        PLAYER WON MORE ROUNDS
    */

    if (playerWins > cpuWins) {

        message.textContent =
            "🏆 SERIES WON!";

        message.style.color =
            "#20ff88";

    }

    /*
        CPU WON MORE ROUNDS
    */

    else if (cpuWins > playerWins) {

        message.textContent =
            "SERIES LOST";

        message.style.color =
            "#ff3b5c";

    }

    /*
        TIE
    */

    else {

        message.textContent =
            "SERIES DRAW";

        message.style.color =
            "#ffe600";
    }


    message.classList.add("show");

    seriesStatus.textContent =
        "FINAL SCORE: " +
        playerWins +
        " - " +
        cpuWins;
}


/* =========================
   CPU BLOCK
========================= */

function startCPUBlock() {

    if (
        cpuBlocking ||
        !gameRunning ||
        matchOver
    ) {
        return;
    }

    cpuBlocking = true;

    cpu.classList.add("blocking");

    showAction(
        cpuAction,
        "BLOCK!",
        "#38aaff"
    );

    clearTimeout(cpuBlockTimer);

    /*
        CPU blocks for a shorter
        strategic period.
    */

    cpuBlockTimer = setTimeout(() => {

        cpuBlocking = false;

        cpu.classList.remove(
            "blocking"
        );

    }, 1200);
}


/* =========================
   RESTART SERIES
========================= */

restartButton.addEventListener(
    "click",
    restartSeries
);


function restartSeries() {

    clearInterval(timerInterval);

    clearInterval(blockTimer);

    clearInterval(blockCooldownTimer);

    clearTimeout(cpuBlockTimer);


    playerHealth = 100;
    cpuHealth = 100;

    playerWins = 0;
    cpuWins = 0;

    currentMatch = 1;

    playerX = 18;
    cpuX = 74;

    playerY = 0;
    cpuY = 0;

    playerVelocityY = 0;
    cpuVelocityY = 0;

    playerBlocking = false;
    cpuBlocking = false;

    blockTimeLeft = 0;
    blockCooldownLeft = 0;

    playerAttackCooldown = 0;
    cpuAttackCooldown = 0;

    gameRunning = true;
    matchOver = false;


    playerWinsText.textContent =
        "0";

    cpuWinsText.textContent =
        "0";


    matchBoxes.forEach(
        (box, index) => {

            box.classList.remove(
                "active",
                "win",
                "loss"
            );

            box.textContent =
                "MATCH " +
                (index + 1);
        }
    );


    matchBoxes[0].classList.add(
        "active"
    );


    player.classList.remove(
        "blocking",
        "punching",
        "kicking",
        "hit"
    );

    cpu.classList.remove(
        "blocking",
        "punching",
        "kicking",
        "hit"
    );


    message.classList.remove(
        "show"
    );


    actionStatus.textContent =
        "READY";

    seriesStatus.textContent =
        "Match 1 of 3";


    updateHealth();

    updateBlockUI();

    startTimer();
}


/* =========================
   MAIN GAME LOOP
========================= */

let cpuThinkTimer = 0;

function gameLoop() {

    updateMovement();


    if (playerAttackCooldown > 0) {
        playerAttackCooldown--;
    }


    if (cpuAttackCooldown > 0) {
        cpuAttackCooldown--;
    }


    /*
        CPU makes decisions regularly
        instead of randomly attacking
        every frame.
    */

    cpuThinkTimer++;

    if (cpuThinkTimer >= 20) {

        cpuThinkTimer = 0;

        cpuThink();
    }


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================
   START
========================= */

restartSeries();

gameLoop();