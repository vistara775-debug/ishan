const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const restartButton = document.getElementById("restart");

const tileCount = 21;
const tileSize = canvas.width / tileCount;
const speed = 140;

let direction = { x: 1, y: 0 };
let pendingDirection = { x: 1, y: 0 };
let candy;
let treat;
let score;
let gameOver;
let best = Number(localStorage.getItem("candy-way-best") || 0);

bestEl.textContent = String(best);

function resetGame() {
  candy = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  pendingDirection = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  spawnTreat();
  updateHud();
}

function updateHud() {
  scoreEl.textContent = String(score);
  bestEl.textContent = String(best);
}

function spawnTreat() {
  let x;
  let y;
  do {
    x = Math.floor(Math.random() * tileCount);
    y = Math.floor(Math.random() * tileCount);
  } while (candy.some((piece) => piece.x === x && piece.y === y));
  treat = { x, y };
}

function drawCell(x, y, fill, radius = 0) {
  const px = x * tileSize;
  const py = y * tileSize;
  ctx.fillStyle = fill;
  if (!radius) {
    ctx.fillRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
    return;
  }

  const w = tileSize - 2;
  const h = tileSize - 2;
  const rx = px + 1;
  const ry = py + 1;
  const r = Math.min(radius, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(rx + r, ry);
  ctx.arcTo(rx + w, ry, rx + w, ry + h, r);
  ctx.arcTo(rx + w, ry + h, rx, ry + h, r);
  ctx.arcTo(rx, ry + h, rx, ry, r);
  ctx.arcTo(rx, ry, rx + w, ry, r);
  ctx.closePath();
  ctx.fill();
}

function draw() {
  ctx.fillStyle = "#19142b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  for (let i = 1; i < tileCount; i += 1) {
    const pos = i * tileSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }

  drawCell(treat.x, treat.y, "#ffbe3b", 8);

  candy.forEach((segment, index) => {
    if (index === 0) {
      drawCell(segment.x, segment.y, "#ff5fa2", 10);
      return;
    }
    drawCell(segment.x, segment.y, "#ff88bc", 7);
  });

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 36px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "20px Trebuchet MS";
    ctx.fillText("Press Restart", canvas.width / 2, canvas.height / 2 + 30);
  }
}

function moveCandy() {
  if (gameOver) return;

  if (pendingDirection.x !== -direction.x || pendingDirection.y !== -direction.y) {
    direction = { ...pendingDirection };
  }

  const head = {
    x: candy[0].x + direction.x,
    y: candy[0].y + direction.y,
  };

  const hitWall = head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount;
  const hitSelf = candy.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    gameOver = true;
    draw();
    return;
  }

  candy.unshift(head);

  if (head.x === treat.x && head.y === treat.y) {
    score += 10;
    if (score > best) {
      best = score;
      localStorage.setItem("candy-way-best", String(best));
    }
    spawnTreat();
    updateHud();
  } else {
    candy.pop();
  }
}

function loop() {
  moveCandy();
  draw();
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const map = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };

  const next = map[key];
  if (!next) return;
  pendingDirection = next;
});

restartButton.addEventListener("click", resetGame);

resetGame();
setInterval(loop, speed);
