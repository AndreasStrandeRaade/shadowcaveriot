let game;
let player, pipes, beers, cursors, deathZones;
let coinCount = 0;
let flapVelocity = -250;
let gameOver = false;
let startTime = 0;
let obstacleTimer, speedTimer;
let gameStarted = false;
let currentSpeed = -240;
let previousGapPosition = null;
let liveTimerText;
let finalElapsed = 0;

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

function preload() {
  this.load.image('shadow', 'ghost.png');
  this.load.image('pipe', 'wall.png');
  this.load.image('beer', 'beer.png');
}

function create() {
  player = this.physics.add.sprite(150, config.height / 2, 'shadow').setScale(0.2);
  player.setCollideWorldBounds(true);

  pipes = this.physics.add.group();
  beers = this.physics.add.group();
  deathZones = this.physics.add.staticGroup();

  deathZones.create(config.width / 2, -10, null).setDisplaySize(config.width, 20).refreshBody();
  deathZones.create(config.width / 2, config.height + 10, null).setDisplaySize(config.width, 20).refreshBody();

  this.physics.add.collider(player, deathZones, hitPipe, null, this);
  this.physics.add.collider(player, pipes, hitPipe, null, this);
  this.physics.add.overlap(player, beers, collectBeer, null, this);

  cursors = this.input.keyboard.createCursorKeys();
  this.input.keyboard.on('keydown-SPACE', flap, this);
  this.input.keyboard.on('keydown-UP', flap, this);
  this.input.on('pointerdown', flap, this);

  obstacleTimer = this.time.addEvent({
    delay: 2200,
    callback: addObstacle,
    callbackScope: this,
    loop: true
  });

  speedTimer = this.time.addEvent({
    delay: 15000,
    callback: () => {
      currentSpeed -= 30;
      pipes.setVelocityX(currentSpeed);
      beers.setVelocityX(currentSpeed);
    },
    loop: true
  });

  liveTimerText = document.getElementById('liveTimer');
}

function flap() {
  if (!gameOver) {
    player.setVelocityY(flapVelocity);
  }
}

function addObstacle() {
  if (gameOver) return;

  const gap = Math.min(350, config.height * 0.5);
  const safeMargin = 80;
  const maxGapPos = config.height - gap - safeMargin;
  const variation = 300;

  let gapPosition;

  if (previousGapPosition === null) {
    gapPosition = Phaser.Math.Between(safeMargin, maxGapPos);
  } else {
    const min = Math.max(safeMargin, previousGapPosition - variation);
    const max = Math.min(maxGapPos, previousGapPosition + variation);
    gapPosition = Phaser.Math.Between(min, max);
  }

  previousGapPosition = gapPosition;
  const pipeWidth = 40;

  const topPipe = pipes.create(config.width, 0, 'pipe')
    .setOrigin(0, 0)
    .setDisplaySize(pipeWidth, gapPosition);

  const bottomPipe = pipes.create(config.width, gapPosition + gap, 'pipe')
    .setOrigin(0, 0)
    .setDisplaySize(pipeWidth, config.height - (gapPosition + gap));

  topPipe.body.allowGravity = false;
  bottomPipe.body.allowGravity = false;
  topPipe.setVelocityX(currentSpeed);
  bottomPipe.setVelocityX(currentSpeed);

  const beer = beers.create(config.width + 50, gapPosition + gap / 2, 'beer').setScale(0.2);
  beer.body.allowGravity = false;
  beer.setVelocityX(currentSpeed);
}

function collectBeer(player, beer) {
  beer.destroy();
  coinCount++;
  document.getElementById('coinCounter').textContent = coinCount;
}

function hitPipe() {
  if (gameOver) return;

  gameOver = true;
  player.setTint(0xff0000);
  player.setVelocity(0, 0);
  pipes.setVelocityX(0);
  beers.setVelocityX(0);
  this.physics.pause();

  document.getElementById('finalBeers').textContent = coinCount;
  document.getElementById('timeSurvived').textContent = finalElapsed;
  document.getElementById('gameOverScreen').style.display = 'block';

  if (obstacleTimer) {
    obstacleTimer.remove(false);
  }
  if (speedTimer) {
    speedTimer.remove(false);
  }
}

function update() {
  if (!gameOver) {
    const bounds = player.getBounds();
    if (bounds.top <= 0 || bounds.bottom >= config.height) {
      hitPipe.call(this);
    }

    finalElapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    if (liveTimerText) {
      liveTimerText.textContent = finalElapsed;
    }
  }
}

// ⭐ Start spillet når DOM er klar og knapp trykkes
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startBtn').addEventListener('click', () => {
    if (!gameStarted) {
      game = new Phaser.Game(config);
      gameStarted = true;
      startTime = Date.now();
      document.getElementById('startBtn').style.display = 'none';
      document.getElementById('startImage').style.display = 'none';
      document.getElementById('restartBtn').style.display = 'inline-block';
    }
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    location.reload();
  });
});
