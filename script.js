const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Ship {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.angle = 0;
    this.speed = 0;
    this.radius = 15;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-15, 10);
    ctx.lineTo(-15, -10);
    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.restore();
  }
}

class Asteroid {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = 20 + Math.random() * 30;
    this.speedX = (Math.random() - 0.5) * 2;
    this.speedY = (Math.random() - 0.5) * 2;
    this.sides = 5 + Math.floor(Math.random() * 5);
    this.angle = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.angle += this.rotationSpeed;
    if (this.x < -this.size) this.x = canvas.width + this.size;
    if (this.x > canvas.width + this.size) this.x = -this.size;
    if (this.y < -this.size) this.y = canvas.height + this.size;
    if (this.y > canvas.height + this.size) this.y = -this.size;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.beginPath();
    for (let i = 0; i < this.sides; i++) {
      const theta = (i / this.sides) * Math.PI * 2;
      const r = this.size * (0.7 + Math.random() * 0.3);
      const px = Math.cos(theta) * r;
      const py = Math.sin(theta) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = 'gray';
    ctx.stroke();
    ctx.restore();
  }
}

const ship = new Ship();
const asteroids = [];
for (let i = 0; i < 10; i++) {
  asteroids.push(new Asteroid());
}

const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function detectCollision(ship, asteroid) {
  const dx = ship.x - asteroid.x;
  const dy = ship.y - asteroid.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < ship.radius + asteroid.size;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (keys['ArrowLeft']) ship.angle -= 0.05;
  if (keys['ArrowRight']) ship.angle += 0.05;
  if (keys['ArrowUp']) ship.speed = Math.min(ship.speed + 0.1, 5);
  else ship.speed *= 0.98;

  ship.update();
  ship.draw();

  for (let asteroid of asteroids) {
    asteroid.update();
    asteroid.draw();
    if (detectCollision(ship, asteroid)) {
      alert('Crash !');
      window.location.reload();
    }
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
