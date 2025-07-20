const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = Math.min(450, window.innerWidth * 0.95);
canvas.height = window.innerHeight * 0.7;

const config = {
    ballRadius: canvas.width * 0.02,
    paddleHeight: canvas.height * 0.02,
    paddleWidth: canvas.width * 0.2,
    brickRowCount: 5,
    brickColumnCount: 8,
    brickWidth: canvas.width * 0.1,
    brickHeight: canvas.height * 0.03,
    brickPadding: canvas.width * 0.015,
    brickOffsetTop: canvas.height * 0.1,
    brickOffsetLeft: canvas.width * 0.05,
    levelSettings: {
        1: { speed: 1, colors: ['#ff3e9d', '#04d9ff', '#ff8a00', '#4cff00', '#e52e71'] },
        2: { speed: 1.2, colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff'] },
        3: { speed: 1.4, colors: ['#8a2be2', '#ff1493', '#00bfff', '#7fff00', '#ffd700'] },
        4: { speed: 1.6, colors: ['#ff00ff', '#00ffff', '#ffff00', '#ff00ff', '#00ffff'] },
        5: { speed: 1.8, colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'] },
        6: { speed: 2, colors: ['#00ff88', '#8800ff', '#ff0088', '#88ff00', '#0088ff'] },
        7: { speed: 2.2, colors: ['#ff5500', '#55ff00', '#0055ff', '#ff0055', '#5500ff'] },
        8: { speed: 2.4, colors: ['#ff3366', '#33ff66', '#3366ff', '#ff6633', '#66ff33'] },
        9: { speed: 2.6, colors: ['#9933ff', '#33ff99', '#ff3399', '#99ff33', '#3399ff'] },
        10: { speed: 2.8, colors: ['#ff00aa', '#aa00ff', '#00aaff', '#ffaa00', '#00ffaa'] },
        11: { speed: 3, colors: ['#ff0066', '#00ff66', '#6600ff', '#ff6600', '#0066ff'] },
        12: { speed: 3.2, colors: ['#ff0099', '#99ff00', '#0099ff', '#ff9900', '#9900ff'] },
        13: { speed: 3.4, colors: ['#ff0f0f', '#0fff0f', '#0f0fff', '#ffff0f', '#ff0fff'] },
        14: { speed: 3.6, colors: ['#f0f0f0', '#0f0f0f', '#f00f0f', '#0ff00f', '#00f0ff'] },
        15: { speed: 3.8, colors: ['#ff5555', '#55ff55', '#5555ff', '#ffff55', '#ff55ff'] },
        16: { speed: 4, colors: ['#ff3333', '#33ff33', '#3333ff', '#ffff33', '#ff33ff'] },
        17: { speed: 4.2, colors: ['#ff1111', '#11ff11', '#1111ff', '#ffff11', '#ff11ff'] },
        18: { speed: 4.4, colors: ['#ff9999', '#99ff99', '#9999ff', '#ffff99', '#ff99ff'] },
        19: { speed: 4.6, colors: ['#ff7777', '#77ff77', '#7777ff', '#ffff77', '#ff77ff'] },
        20: { speed: 5, colors: ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'] }
    }
};

let gameState = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: canvas.width * 0.01,
    dy: -canvas.width * 0.01,
    paddleX: (canvas.width - config.paddleWidth) / 2,
    score: 0,
    lives: 3,
    gameRunning: false,
    leftPressed: false,
    rightPressed: false,
    bricks: [],
    currentLevel: 1,
    unlockedLevels: 1,
    levelStars: {}
};

for (let i = 1; i <= 20; i++) {
    gameState.levelStars[i] = 0;
}

const welcomeScreen = document.getElementById('welcome-screen');
const levelSelect = document.getElementById('level-select');
const gameOverScreen = document.getElementById('game-over');
const resultTitle = document.getElementById('result-title');
const starsEarned = document.getElementById('stars-earned');
const nextLevelBtn = document.getElementById('next-level-btn');
const levelsGrid = document.getElementById('levels-grid');

function initBricks() {
    gameState.bricks = [];
    const levelConfig = config.levelSettings[gameState.currentLevel];
    
    for (let c = 0; c < config.brickColumnCount; c++) {
        gameState.bricks[c] = [];
        for (let r = 0; r < config.brickRowCount; r++) {
            gameState.bricks[c][r] = { 
                x: c * (config.brickWidth + config.brickPadding) + config.brickOffsetLeft,
                y: r * (config.brickHeight + config.brickPadding) + config.brickOffsetTop,
                status: 1,
                color: levelConfig.colors[r % levelConfig.colors.length]
            };
        }
    }
    
    gameState.dx = canvas.width * 0.01 * levelConfig.speed;
    gameState.dy = -canvas.width * 0.01 * levelConfig.speed;
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(gameState.x, gameState.y, config.ballRadius, 0, Math.PI*2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.roundRect(gameState.paddleX, canvas.height - config.paddleHeight - 10, config.paddleWidth, config.paddleHeight, [10]);
    ctx.fillStyle = '#7c3aed';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < config.brickColumnCount; c++) {
        for (let r = 0; r < config.brickRowCount; r++) {
            if (gameState.bricks[c][r].status === 1) {
                const brick = gameState.bricks[c][r];
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, config.brickWidth, config.brickHeight, [5]);
                ctx.fillStyle = brick.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < config.brickColumnCount; c++) {
        for (let r = 0; r < config.brickRowCount; r++) {
            const brick = gameState.bricks[c][r];
            if (brick.status === 1) {
                if (gameState.x + config.ballRadius > brick.x && 
                    gameState.x - config.ballRadius < brick.x + config.brickWidth && 
                    gameState.y + config.ballRadius > brick.y && 
                    gameState.y - config.ballRadius < brick.y + config.brickHeight) {
                    
                    gameState.dy = -gameState.dy;
                    brick.status = 0;
                    gameState.score += 10 * gameState.currentLevel;
                    document.getElementById('score').textContent = `Score: ${gameState.score}`;
                    
                    if (gameState.score === config.brickRowCount * config.brickColumnCount * 10 * gameState.currentLevel) {
                        levelCompleted();
                    }
                    return;
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    if (gameState.x + gameState.dx > canvas.width - config.ballRadius || gameState.x + gameState.dx < config.ballRadius) {
        gameState.dx = -gameState.dx;
    }

    if (gameState.y + gameState.dy < config.ballRadius) {
        gameState.dy = -gameState.dy;
    } else if (gameState.y + gameState.dy > canvas.height - config.ballRadius) {
        if (gameState.x > gameState.paddleX && gameState.x < gameState.paddleX + config.paddleWidth) {
            gameState.dy = -Math.abs(gameState.dy);
            gameState.dx = ((gameState.x - (gameState.paddleX + config.paddleWidth/2)) / (config.paddleWidth/2)) * Math.abs(gameState.dy);
        } else {
            gameState.lives--;
            document.getElementById('lives').textContent = `Vies: ${gameState.lives}`;
            
            if (gameState.lives <= 0) {
                gameOver(false);
            } else {
                resetBall();
            }
        }
    }

    if (gameState.rightPressed && gameState.paddleX < canvas.width - config.paddleWidth) {
        gameState.paddleX