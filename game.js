const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const messageElement = document.getElementById('message');

// Game Constants
const GRAVITY = 0.25;
const JUMP = -4.5;
const PIPE_SPEED = 2;
const PIPE_SPAWN_RATE = 100; // frames
const PIPE_WIDTH = 50;
const PIPE_GAP = 120;
const BIRD_X = 50;
const BIRD_SIZE = 20;

// Game State
let birdY = canvas.height / 2;
let birdVelocity = 0;
let pipes = [];
let score = 0;
let frameCount = 0;
let gameOver = false;
let gameStarted = false;

function drawBird() {
    ctx.fillStyle = '#f8e71c';
    ctx.fillRect(BIRD_X, birdY, BIRD_SIZE, BIRD_SIZE);
}

function drawPipes() {
    ctx.fillStyle = '#7ed321';
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, canvas.height - (pipe.topHeight + PIPE_GAP));
    });
}

function update() {
    if (!gameStarted || gameOver) return;

    // Bird movement
    birdVelocity += GRAVITY;
    birdY += birdVelocity;

    // Collision with boundaries
    if (birdY + BIRD_SIZE > canvas.height || birdY < 0) {
        endGame();
    }

    // Pipe management
    if (frameCount % PIPE_SPAWN_RATE === 0) {
        const minPipeHeight = 50;
        const maxPipeHeight = canvas.height - PIPE_GAP - minPipeHeight;
        const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
        pipes.push({ x: canvas.width, topHeight, passed: false });
    }

    pipes.forEach((pipe, index) => {
        pipe.x -= PIPE_SPEED;

        // Collision detection
        if (
            BIRD_X + BIRD_SIZE > pipe.x &&
            BIRD_X < pipe.x + PIPE_WIDTH &&
            (birdY < pipe.topHeight || birdY + BIRD_SIZE > pipe.topHeight + PIPE_GAP)
        ) {
            endGame();
        }

        // Scoring
        if (pipe.x + PIPE_WIDTH < BIRD_X && !pipe.passed) {
            score++;
            scoreElement.textContent = score;
            pipe.passed = true;
        }

        // Remove off-screen pipes
        if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(index, 1);
        }
    });

    frameCount++;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawPipes();
    drawBird();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function jump() {
    if (gameOver) {
        resetGame();
        return;
    }
    if (!gameStarted) {
        gameStarted = true;
        messageElement.style.display = 'none';
    }
    birdVelocity = JUMP;
}

function resetGame() {
    birdY = canvas.height / 2;
    birdVelocity = 0;
    pipes = [];
    score = 0;
    scoreElement.textContent = score;
    frameCount = 0;
    gameOver = false;
    gameStarted = false;
    messageElement.style.display = 'block';
    messageElement.textContent = 'Press Space or Click to Jump';
}

function endGame() {
    gameOver = true;
    messageElement.style.display = 'block';
    messageElement.textContent = 'Game Over! Click to Restart';
}

// Controls
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') jump();
});

canvas.addEventListener('click', jump);

loop();