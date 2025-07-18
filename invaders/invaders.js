let game;

document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('startBtn').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';

  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    parent: 'gameContainer',
    physics: {
      default: 'arcade',
      arcade: { debug: false }
    },
    scene: {
      preload,
      create,
      update
    }
  };

  game = new Phaser.Game(config);
});

let player, bullets, enemies, scoreText, timeText, pauseButton;
let score = 0;
let gameOver = false;
let isTouching = false;
let shootTimer, spawnTimer, speedTimer;
let timeCounter = 0;
let difficultyMultiplier = 1;
let isPaused = false;

function preload() {
  this.load.image('hero', 'hero.png');
  this.load.image('stick', 'stick.png');
  this.load.image('drum', 'drum.png');
}

function create() {
  const width = this.scale.width;
  const height = this.scale.height;

  // Spiller
  player = this.physics.add.sprite(width / 2, height - 100, 'hero')
    .setCollideWorldBounds(true)
    .setScale(0.3);

  // Skuddgruppe
  bullets = this.physics.add.group();

  // Fiender
  enemies = this.physics.add.group();

  // Poengvisning
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '20px', fill: '#fff' });

  // Tid
  timeText = this.add.text(16, 40, 'Tid: 0.00', { fontSize: '20px', fill: '#fff' });

  // Pauseknapp
  pauseButton = this.add.text(width - 100, 16, '[Pause]', {
    fontSize: '20px', fill: '#B47CFF', backgroundColor: '#222', padding: { x: 10, y: 5 }
  }).setInteractive().on('pointerdown', () => togglePause(this));

  // Fiender spawner
  spawnTimer = this.time.addEvent({
    delay: 1000,
    callback: () => {
      if (!gameOver && !isPaused) {
        const x = Phaser.Math.Between(30, width - 30);
        const enemy = enemies.create(x, 0, 'drum');
        enemy.setVelocityY(50 * difficultyMultiplier);
        enemy.setScale(0.15);
      }
    },
    loop: true
  });

  // Øk vanskelighetsgrad hvert 5. sekund
  speedTimer = this.time.addEvent({
    delay: 5000,
    callback: () => {
      difficultyMultiplier += 0.3;
    },
    loop: true
  });

  // Tidsteller
  this.time.addEvent({
    delay: 10,
    callback: () => {
      if (!gameOver && !isPaused) {
        timeCounter += 0.01;
        timeText.setText('Tid: ' + timeCounter.toFixed(2));
      }
    },
    loop: true
  });

  // Kollisjon
  this.physics.add.overlap(bullets, enemies, (bullet, enemy) => {
    bullet.destroy();
    enemy.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
  });

  // Touchkontroll
  this.input.on('pointerdown', pointer => {
    isTouching = true;
    shootTimer = this.time.addEvent({
      delay: 500,
      callback: () => shoot.call(this),
      loop: true
    });
  });

  this.input.on('pointerup', () => {
    isTouching = false;
    if (shootTimer) shootTimer.remove();
  });

  this.input.on('pointermove', pointer => {
    if (isTouching) {
      player.x = Phaser.Math.Clamp(pointer.x, 30, this.scale.width - 30);
    }
  });
}

function update() {
  if (gameOver || isPaused) return;

  enemies.getChildren().forEach(enemy => {
    if (enemy.y > this.scale.height - 60) {
      endGame.call(this);
    }
  });
}

function shoot() {
  if (gameOver || isPaused) return;

  const bullet = bullets.create(player.x, player.y - 20, 'stick');
  bullet.setVelocityY(-400);
  bullet.setScale(0.2);

  bullet.setCollideWorldBounds(true);
  bullet.body.onWorldBounds = true;
  bullet.body.world.on('worldbounds', body => {
    if (body.gameObject === bullet) bullet.destroy();
  });
}

function togglePause(scene) {
  if (gameOver) return;

  isPaused = !isPaused;
  scene.physics.world.isPaused = isPaused;
  pauseButton.setText(isPaused ? '[Start]' : '[Pause]');
}

function endGame() {
  if (gameOver) return;

  gameOver = true;
  this.physics.pause();
  spawnTimer.remove();
  speedTimer.remove();
  if (shootTimer) shootTimer.remove();

  const centerX = this.scale.width / 2;
  const centerY = this.scale.height / 2;

  this.add.rectangle(centerX, centerY, 300, 200, 0x000000, 0.8);
  this.add.text(centerX, centerY - 40, 'Game Over', { fontSize: '32px', fill: '#B47CFF' }).setOrigin(0.5);
  this.add.text(centerX, centerY, `Score: ${score}\nTid: ${timeCounter.toFixed(2)} sek`, {
    fontSize: '20px',
    fill: '#fff',
    align: 'center'
  }).setOrigin(0.5);

  this.add.text(centerX, centerY + 60, 'Prøv igjen', {
    fontSize: '20px',
    backgroundColor: '#B47CFF',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5).setInteractive().on('pointerdown', () => location.reload());
}
