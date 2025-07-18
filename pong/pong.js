const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let playerSide = 'left';
let gameStarted = false;
let gameOver = false;
let winner = '';

const paddleHeight = 100;
let leftY = 150;
let rightY = 150;

let prevLeftY = 0;
let prevRightY = 0;

let ballX = 300, ballY = 200;
let ballSpeedX = 5, ballSpeedY = 3;
let serveToLeft = false;

let leftLives = 3;
let rightLives = 3;

let countdown = 0;
let countdownText = '';

const imgLeft = new Image();
imgLeft.src = 'eilert.png';

const imgRight = new Image();
imgRight.src = 'pc.png';

const imgBall = new Image();
imgBall.src = 'ball.png';

const imgHeart = new Image();
imgHeart.src = 'heart.png';

function startGame(side) {
  playerSide = side;
  resetGame();
  document.getElementById('start-menu').style.display = 'none';
  document.getElementById('game-over').style.display = 'none';
  canvas.style.display = 'block';
  resizeCanvas();
  gameStarted = true;
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  leftY = canvas.height / 2 - paddleHeight / 2;
  rightY = canvas.height / 2 - paddleHeight / 2;
  leftLives = 3;
  rightLives = 3;
  serveToLeft = false;
  startCountdown();
  gameOver = false;
  winner = '';
}

document.getElementById('choose-eilert').onclick = () => startGame('left');
document.getElementById('choose-pc').onclick = () => startGame('right');
document.getElementById('restart').onclick = () => {
  document.getElementById('start-menu').style.display = 'flex';
  canvas.style.display = 'none';
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);

function gameLoop() {
  if (!gameStarted || gameOver) return;
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  if (countdown > 0) return;

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY <= 0 || ballY + 30 >= canvas.height) {
    ballSpeedY *= -1;
  }

  // Kollisjon venstre
  if (ballX <= 70 && ballY + 15 >= leftY && ballY <= leftY + paddleHeight) {
    let hitPos = (ballY + 15) - (leftY + paddleHeight / 2);
    ballSpeedY = hitPos * 0.2;
    if (playerSide === 'left') {
      ballSpeedY += (leftY - prevLeftY) * -0.4;
    }
    ballSpeedX = Math.abs(ballSpeedX);
  }

  // Kollisjon høyre
  if (ballX + 30 >= canvas.width - 70 && ballY + 15 >= rightY && ballY <= rightY + paddleHeight) {
    let hitPos = (ballY + 15) - (rightY + paddleHeight / 2);
    ballSpeedY = hitPos * 0.2;
    if (playerSide === 'right') {
      ballSpeedY += (rightY - prevRightY) * -0.4;
    }
    ballSpeedX = -Math.abs(ballSpeedX);
  }

  // Ball utenfor
  if (ballX < 0) {
    leftLives--;
    if (leftLives === 0) {
      winner = 'PC vant!';
      endGame();
    } else {
      serveToLeft = false;
      startCountdown();
    }
  }

  if (ballX > canvas.width) {
    rightLives--;
    if (rightLives === 0) {
      winner = 'Eilert vant!';
      endGame();
    } else {
      serveToLeft = true;
      startCountdown();
    }
  }

  prevLeftY = leftY;
  prevRightY = rightY;

  updateAI();
}

function startCountdown() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = 0;
  ballSpeedY = 0;

  countdown = 180; // 3 sekunder @ 60fps
}

function updateCountdown() {
  if (countdown > 0) {
    countdown--;

    if (countdown === 120) countdownText = '3';
    if (countdown === 90) countdownText = '2';
    if (countdown === 60) countdownText = '1';
    if (countdown === 30) countdownText = 'SPILL!';
    if (countdown === 0) {
      countdownText = '';
      ballSpeedX = serveToLeft ? -5 : 5;
      ballSpeedY = 3;
    }
  }
}

function updateAI() {
    if (countdown > 0) {
      // Flytt AI rolig mot midten av skjermen under nedtelling
      const centerY = canvas.height / 2 - paddleHeight / 2;
      const aiY = playerSide === 'left' ? rightY : leftY;
      const move = (centerY - aiY) * 0.1;
  
      if (playerSide === 'left') {
        rightY += move;
      } else {
        leftY += move;
      }
      return;
    }
  
    let aiY = playerSide === 'left' ? rightY : leftY;
    let targetY = ballY + 15 + (Math.random() * 10 - 5);
    let reactionSpeed = 0.1 + Math.random() * 0.02;
    let direction = targetY - (aiY + paddleHeight / 2);
    let move = direction * reactionSpeed;
    move = Math.max(Math.min(move, 6), -6);
  
    if (playerSide === 'left' && ballSpeedX > 0) {
      rightY += move;
    }
    if (playerSide === 'right' && ballSpeedX < 0) {
      leftY += move;
    }
  }
  

function endGame() {
  gameOver = true;
  gameStarted = false;
  canvas.style.display = 'none';
  document.getElementById('game-over').style.display = 'flex';
  document.getElementById('winner-text').innerText = winner;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Spillere
  ctx.drawImage(imgLeft, 10, leftY - 30, 60, 150);
  ctx.drawImage(imgRight, canvas.width - 70, rightY - 30, 60, 150);

  // Ball
  ctx.drawImage(imgBall, ballX, ballY, 30, 30);

  // Liv
  for (let i = 0; i < leftLives; i++) {
    ctx.drawImage(imgHeart, 20 + i * 35, 20, 30, 30);
  }
  for (let i = 0; i < rightLives; i++) {
    ctx.drawImage(imgHeart, canvas.width - 35 - i * 35, 20, 30, 30);
  }

  // Nedtelling
  if (countdown > 0) {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(countdownText, canvas.width / 2, canvas.height / 2);
  }

  updateCountdown();
}

// Touchkontroll
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touchY = e.touches[0].clientY;

  if (playerSide === 'left' && e.touches[0].clientX < canvas.width / 2) {
    leftY = touchY - paddleHeight / 2;
  }

  if (playerSide === 'right' && e.touches[0].clientX > canvas.width / 2) {
    rightY = touchY - paddleHeight / 2;
  }
}, { passive: false });
