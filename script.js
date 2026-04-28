const board = document.getElementById("game-board");
const ctx = board.getContext("2d");

const scoreNode = document.getElementById("score");
const highScoreNode = document.getElementById("high-score");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");

const gridSize = 20;
const tileCount = board.width / gridSize;
const baseSpeed = 140;
const minSpeed = 70;
const speedStep = 8;
const highScoreKey = "snake-rush-high-score";

let snake;
let direction;
let nextDirection;
let fruit;
let score;
let highScore = Number(localStorage.getItem(highScoreKey) || 0);
let gameLoopId = null;
let isRunning = false;
let isPaused = false;

highScoreNode.textContent = highScore;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { ...direction };
  score = 0;
  scoreNode.textContent = score;
  fruit = randomFruit();
  isPaused = false;
  pauseBtn.textContent = "Pause";
  draw();
}

function randomFruit() {
  let nextFruit;

  do {
    nextFruit = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some((segment) => segment.x === nextFruit.x && segment.y === nextFruit.y));

  return nextFruit;
}

function showOverlay(title, text) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.add("visible");
}

function hideOverlay() {
  overlay.classList.remove("visible");
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem(highScoreKey, String(highScore));
    highScoreNode.textContent = highScore;
  }
}

function currentSpeed() {
  return Math.max(minSpeed, baseSpeed - Math.floor(score / 5) * speedStep);
}

function startGame() {
  if (gameLoopId) {
    clearTimeout(gameLoopId);
  }

  resetGame();
  isRunning = true;
  hideOverlay();
  tick();
}

function endGame() {
  isRunning = false;
  updateHighScore();
  showOverlay("Game Over", `Score ${score}. Press Enter or click Start Game to try again.`);
}

function togglePause() {
  if (!isRunning) {
    return;
  }

  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";

  if (isPaused) {
    showOverlay("Paused", "Press Space or click Resume to jump back in.");
  } else {
    hideOverlay();
    tick();
  }
}

function tick() {
  if (!isRunning || isPaused) {
    return;
  }

  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const hitWall =
    head.x < 0 ||
    head.x >= tileCount ||
    head.y < 0 ||
    head.y >= tileCount;

  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    draw();
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === fruit.x && head.y === fruit.y) {
    score += 1;
    scoreNode.textContent = score;
    fruit = randomFruit();
  } else {
    snake.pop();
  }

  draw();
  gameLoopId = setTimeout(tick, currentSpeed());
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= tileCount; i += 1) {
    const pos = i * gridSize;

    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, board.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(board.width, pos);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#c7f464" : "#77dd77";
    ctx.shadowColor = index === 0 ? "rgba(199, 244, 100, 0.45)" : "rgba(119, 221, 119, 0.25)";
    ctx.shadowBlur = index === 0 ? 12 : 6;

    ctx.fillRect(
      segment.x * gridSize + 2,
      segment.y * gridSize + 2,
      gridSize - 4,
      gridSize - 4
    );
  });

  ctx.shadowBlur = 0;
}

function drawFruit() {
  const x = fruit.x * gridSize + gridSize / 2;
  const y = fruit.y * gridSize + gridSize / 2;

  ctx.fillStyle = "#ff5d73";
  ctx.shadowColor = "rgba(255, 93, 115, 0.45)";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, gridSize / 2.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function draw() {
  ctx.clearRect(0, 0, board.width, board.height);
  drawGrid();
  drawFruit();
  drawSnake();
}

function queueDirection(nextX, nextY) {
  if (!isRunning || isPaused) {
    return;
  }

  if (direction.x === -nextX && direction.y === -nextY) {
    return;
  }

  nextDirection = { x: nextX, y: nextY };
}

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
    case "w":
    case "W":
      event.preventDefault();
      queueDirection(0, -1);
      break;
    case "ArrowDown":
    case "s":
    case "S":
      event.preventDefault();
      queueDirection(0, 1);
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      event.preventDefault();
      queueDirection(-1, 0);
      break;
    case "ArrowRight":
    case "d":
    case "D":
      event.preventDefault();
      queueDirection(1, 0);
      break;
    case " ":
      event.preventDefault();
      togglePause();
      break;
    case "Enter":
      event.preventDefault();
      startGame();
      break;
    default:
      break;
  }
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);

resetGame();
showOverlay("Ready to Play", "Click Start Game or press Enter to begin.");
