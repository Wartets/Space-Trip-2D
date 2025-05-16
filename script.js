const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let isGameOver = false;
const MIN_ASTEROID_SIZE = 18;
const ASTEROID_COUNT = 20;

let isGameStarted = false;
let wave = 1;
let asteroidsDestroyed = 0;
let gameStartTime = 0;
let missilesFired = 0;

const startOverlay = document.getElementById('startOverlay');
const startButton = document.getElementById('startButton');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Ship {
	constructor() {
		this.x = canvas.width / 2 + (2 * Math.random() - 1) * canvas.width / 8;
		this.y = canvas.height / 2 + (2 * Math.random() - 1) * canvas.height / 8;
		this.angle = Math.random() * Math.PI * 2;
		this.speed = 0;
		this.rotationSpeed = 0;
		this.radius = 14;
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
		let vibration1 = 2 * Math.random() - 1;
		let vibration2 = 2 * Math.random() - 1;
		
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle);
		ctx.beginPath();
		ctx.moveTo(18 + vibration2 / 2, 0);
		ctx.lineTo(-7, 10);
		ctx.lineTo(-7, -10);
		ctx.closePath();
		ctx.strokeStyle = 'white';
		ctx.stroke();
		
		ctx.beginPath();
		ctx.strokeStyle = 'white';
		ctx.arc(0, 0, 2.5, -1, 1);
		ctx.stroke();
		
		/* ctx.beginPath(); // Rayon de collision
		ctx.strokeStyle = 'white';
		ctx.arc(0, 0, this.radius, 0, 2 * Math.PI, 0);
		ctx.stroke(); */
		
		ctx.beginPath();
		ctx.strokeStyle = 'gray';
		ctx.arc(vibration1, vibration2, 3.5, 0, 2 * Math.PI);
		ctx.stroke();
		
		ctx.beginPath();
		ctx.moveTo(-7, 7);
		ctx.lineTo(-13 + vibration1 / 2, 9 + vibration2);
		ctx.lineTo(-13 + vibration1 / 2, -9 + vibration2);
		ctx.lineTo(-7, -7);
		ctx.closePath();
		ctx.strokeStyle = 'white';
		ctx.stroke();
		
		ctx.beginPath();
		ctx.moveTo(14 + vibration1, vibration2);
		ctx.lineTo(-10 + vibration1 + vibration2 / 2, 7 + vibration2);
		ctx.lineTo(-10 + vibration1 + vibration2 / 2, -7 + vibration2);
		ctx.closePath();
		ctx.strokeStyle = 'gray';
		ctx.stroke();
		ctx.restore();
	}
}

class Asteroid {
	constructor() {
		this.x = Math.random() * canvas.width;
		this.y = Math.random() * canvas.height;
		this.size = 39 + Math.random() * 30 - Math.min(5 * (wave - 1), 40 - MIN_ASTEROID_SIZE);
		this.speedX = (Math.random() - 0.5) * (1.85 + 0.3 * wave);
		this.speedY = (Math.random() - 0.5) * (1.85 + 0.3 * wave);
		this.sides = 5 + Math.floor(Math.random() * 5);
		this.angle = Math.random() * Math.PI * 2;
		this.rotationSpeed = (Math.random() - 0.5) * 0.02;
	}

	updatePosition() {
		this.x += this.speedX;
		this.y += this.speedY;
		if (this.x < -this.size) this.x = canvas.width + this.size;
		if (this.x > canvas.width + this.size) this.x = -this.size;
		if (this.y < -this.size) this.y = canvas.height + this.size;
		if (this.y > canvas.height + this.size) this.y = -this.size;
	}

	updateRotation() {
		this.angle += this.rotationSpeed;
	}

	update() {
		this.updatePosition();
		this.updateRotation();
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

class Missile {
	constructor(x, y, angle, shipSpeed) {
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.speed = 7 + shipSpeed;
		this.radius = 2.7 + Math.random();
		this.life = 180 + Math.floor(Math.random() * 175 + 70 / this.speed); 
	}

	update() {
		this.x += Math.cos(this.angle) * this.speed;
		this.y += Math.sin(this.angle) * this.speed;
		this.life--;
		this.radius = 2.7 + Math.random();

		if (this.x < 0) this.x = canvas.width;
		if (this.x > canvas.width) this.x = 0;
		if (this.y < 0) this.y = canvas.height;
		if (this.y > canvas.height) this.y = 0;
	}

	draw() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = 'red';
		ctx.fill();
	}
}

const ship = new Ship();
const asteroids = [];
const missiles = [];

let canShoot = true;

function isTooCloseToShip(x, y, size, ship) {
	const dx = ship.x - x;
	const dy = ship.y - y;
	const distance = Math.sqrt(dx * dx + dy * dy);
	return distance < ship.radius + size + 55;
}

function isOverlappingWithOtherAsteroids(x, y, size, existingAsteroids) {
	for (let asteroid of existingAsteroids) {
		const dx = asteroid.x - x;
		const dy = asteroid.y - y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		if (distance < (size + asteroid.size) * 0.5 + 10) {
			return true;
		}
	}
	return false;
}

function createAsteroid(count) {
	for (let i = 0; i < count; ) {
		const tempAsteroid = new Asteroid();
		if (
			!isTooCloseToShip(tempAsteroid.x, tempAsteroid.y, tempAsteroid.size, ship) &&
			!isOverlappingWithOtherAsteroids(tempAsteroid.x, tempAsteroid.y, tempAsteroid.size, asteroids)
		) {
			asteroids.push(tempAsteroid);
			i++;
		}
	}
};

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

function detectMissileShipCollision(missile, ship) {
	const dx = missile.x - ship.x;
	const dy = missile.y - ship.y;
	const distance = Math.sqrt(dx * dx + dy * dy);
	return distance < missile.radius + ship.radius;
}

function detectAsteroidCollision(a, b) {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	const distance = Math.sqrt(dx * dx + dy * dy);
	return distance < (a.size + b.size) * 0.5;
}

function detectMissileAsteroidCollision(missile, asteroid) {
		const dx = missile.x - asteroid.x;
		const dy = missile.y - asteroid.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance < missile.radius + asteroid.size * 0.5 * 1.05;
}

function resolveAsteroidDestruction() {
	for (let i = missiles.length - 1; i >= 0; i--) {
		const missile = missiles[i];
		let hit = false;
		for (let j = asteroids.length - 1; j >= 0; j--) {
			const asteroid = asteroids[j];
			if (detectMissileAsteroidCollision(missile, asteroid)) {
				const collisionVector = {
					x: (asteroid.x - missile.x),
					y: (asteroid.y - missile.y),
				};
				const dist = Math.sqrt(collisionVector.x ** 2 + collisionVector.y ** 2);
				collisionVector.x /= dist;
				collisionVector.y /= dist;

				if (asteroid.size > MIN_ASTEROID_SIZE * 2) {
					const fragments = splitAsteroid(asteroid, collisionVector);
					asteroids.splice(j, 1);
					asteroids.push(...fragments);
				} else {
					asteroids.splice(j, 1);
				}

				missiles.splice(i, 1);
				hit = true;
				
				asteroidsDestroyed++;
				
				break;
			}
		}
		if (hit) continue;
	}
};

function resolveAsteroidCollision(a, b) {
	const tempX = a.speedX;
	const tempY = a.speedY;
	a.speedX = b.speedX;
	a.speedY = b.speedY;
	b.speedX = tempX;
	b.speedY = tempY;

	const dx = a.x - b.x;
	const dy = a.y - b.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	const collisionVector = { x: dx / dist, y: dy / dist };

	const overlap = (a.size + b.size) * 0.5 - dist;
	if (overlap > 0) {
		const correctionX = collisionVector.x * (overlap / 2);
		const correctionY = collisionVector.y * (overlap / 2);
		a.x += correctionX;
		a.y += correctionY;
		b.x -= correctionX;
		b.y -= correctionY;
	}

	const relVelX = a.speedX - b.speedX;
	const relVelY = a.speedY - b.speedY;
	const impactForce = Math.sqrt(relVelX * relVelX + relVelY * relVelY);

	[a, b].forEach((asteroid) => {
		const breakChance = (impactForce * 0.4 + asteroid.size / 53) * 0.01;
		if (Math.random() < Math.min(1, breakChance) && asteroid.size > MIN_ASTEROID_SIZE * 2) {
			const fragments = splitAsteroid(asteroid, collisionVector);
			const idx = asteroids.indexOf(asteroid);
			if (idx > -1) {
				asteroids.splice(idx, 1);
				asteroids.push(...fragments);
			}
		}
	});
}

function splitAsteroid(asteroid, collisionVector) {
		if (asteroid.size < MIN_ASTEROID_SIZE * 2) return [];

		const totalSize = asteroid.size;
		const numFragments = Math.random() < 0.1 ? 4 : Math.random() < 0.3 ? 3 : 2;
		let sizes = new Array(numFragments).fill(MIN_ASTEROID_SIZE);
		let remaining = totalSize - MIN_ASTEROID_SIZE * numFragments;

		for (let i = 0; i < remaining; i++) {
				const idx = Math.floor(Math.random() * numFragments);
				sizes[idx] += 1;
		}

		const baseAngle = Math.atan2(-collisionVector.y, -collisionVector.x);
		const angleSpread = Math.PI;
		let offsetAngle = baseAngle - angleSpread / 2;
		const fragments = [];
		let currentAngle = offsetAngle;

		for (let size of sizes) {
				const frag = new Asteroid();
				frag.size = size;

				const distanceFromCenter = asteroid.size * 0.5 + size;
				frag.x = asteroid.x + Math.cos(currentAngle) * distanceFromCenter;
				frag.y = asteroid.y + Math.sin(currentAngle) * distanceFromCenter;

				const speed = (Math.random() - 0.5) * (1.85 + 0.3 * wave);
				frag.speedX = Math.cos(currentAngle) * speed;
				frag.speedY = Math.sin(currentAngle) * speed;

				frag.angle = Math.random() * Math.PI * 2;
				frag.rotationSpeed = (Math.random() - 0.5) * 0.02;
				frag.sides = 5 + Math.floor(Math.random() * 5);

				fragments.push(frag);
				currentAngle += angleSpread / (numFragments - 1);
		}
		return fragments;
}

function drawVibratingWindow() {
	const x = canvas.width / 2;
	const y = canvas.height / 2;
	const sides = 5 + Math.floor(Math.random() * 2);
	const radiusX = 230;
	const radiusY = 140;
	const angleOffset = Math.pi * Date.now() / 2;

	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(angleOffset);
	ctx.beginPath();
	for (let i = 0; i <= sides; i++) {
		const vibrate = 0.1 + 0.075 * (2 * Math.random() - 1);
		const theta = (i / sides) * Math.PI * 2 + vibrate;
		const rx = radiusX * ((1 - vibrate) + Math.random() * vibrate);
		const ry = radiusY * ((1 - vibrate) + Math.random() * vibrate);
		const px = Math.cos(theta) * rx;
		const py = Math.sin(theta) * ry;
		if (i === 0) ctx.moveTo(px, py);
		else ctx.lineTo(px, py);
	}
	ctx.closePath();
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 2 + 0.8 * Math.random();
	ctx.stroke();
	ctx.restore();
}

window.addEventListener('keydown', (e) => {
	keys[e.key] = true;
	if (e.key === ' ') {
		if (canShoot && !isGameOver) {
			const offset = ship.radius + 8;
			const missileX = ship.x + Math.cos(ship.angle) * offset;
			const missileY = ship.y + Math.sin(ship.angle) * offset;
			missiles.push(new Missile(missileX, missileY, ship.angle, ship.speed));
			missilesFired++;
			canShoot = false;
		}
	}
});

window.addEventListener('keyup', (e) => {
	keys[e.key] = false;
	if (e.key === ' ') {
		canShoot = true;
	}
});

function updateOverlay() {
	const now = Date.now();
	const elapsedSeconds = ((now - gameStartTime) / 1000).toFixed(1);

	document.getElementById('asteroidsPresent').textContent = asteroids.length;
	document.getElementById('asteroidsDestroyed').textContent = asteroidsDestroyed;
	document.getElementById('timePlayed').textContent = elapsedSeconds;
	document.getElementById('wavesPassed').textContent = wave - 1;
	document.getElementById('missilesFiredText').textContent = missilesFired;
}

function showOverlay() {
	document.getElementById('gameOverlay').style.display = 'block';
	gameStartTime = Date.now();
	asteroidsDestroyed = 0;
}

function hideOverlay() {
	document.getElementById('gameOverlay').style.display = 'none';
}

function gameLoop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (!isGameOver) {
		updateOverlay();
		
		if ((keys['ArrowLeft'] || keys['a']) && (keys['ArrowRight'] || keys['d'])) {
			ship.rotationSpeed *= 0.95;
		} else if (keys['ArrowLeft'] || keys['a']) {
			ship.rotationSpeed = Math.max(ship.rotationSpeed - 0.005, -0.04);
		} else if (keys['ArrowRight'] || keys['d']) {
			ship.rotationSpeed = Math.min(ship.rotationSpeed + 0.005, 0.04);
		} else {
			ship.rotationSpeed *= 0.96;
		}

		ship.angle += ship.rotationSpeed;

		if ((keys['ArrowUp'] || keys['w']) && (keys['ArrowDown'] || keys['s'])) {
			ship.speed *= 0.97;
		} else if (keys['ArrowUp'] || keys['w']) {
			ship.speed = Math.min(ship.speed + 0.1, 5);
		} else if (keys['ArrowDown'] || keys['s']) {
			ship.speed = Math.max(ship.speed - 0.1, -3);
		} else {
			ship.speed *= 0.98;
		}
		
		for (let i = missiles.length - 1; i >= 0; i--) {
			const missile = missiles[i];
			missile.update();
			missile.draw();
			if (detectMissileShipCollision(missile, ship)) {
				isGameOver = true;
				showGameOver();
			}
			if (missile.life <= 0) {
				missiles.splice(i, 1);
			}
		}
		
		resolveAsteroidDestruction();
		
		ship.update();
		ship.draw();

		for (let asteroid of asteroids) {
			asteroid.update();
			asteroid.draw();
			if (detectCollision(ship, asteroid)) {
				isGameOver = true;
				showGameOver();
			}
		}
		
		for (let i = 0; i < asteroids.length; i++) {
			for (let j = i + 1; j < asteroids.length; j++) {
				const a1 = asteroids[i];
				const a2 = asteroids[j];
				if (detectAsteroidCollision(a1, a2)) {
					resolveAsteroidCollision(a1, a2);
				}
			}
		}

		if (asteroids.length == 0) {
			wave++;
			createAsteroid(Math.floor(ASTEROID_COUNT * wave));
		}
	} else {
		ship.draw();
		for (let asteroid of asteroids) {
			asteroid.updateRotation();
			asteroid.draw();
		}
		drawVibratingWindow();
	}

	requestAnimationFrame(gameLoop);
}

function showGameOver() {
	document.getElementById('gameOverWindow').classList.remove('hidden');
	// hideOverlay();
	document.getElementById('gameFooter').classList.remove('hidden');
}

function restartGame() {
	window.location.reload();
}

startButton.addEventListener('click', () => {
	isGameStarted = true;
	startOverlay.style.display = 'none';
	document.getElementById('helpWindow').style.display = 'none';
	showOverlay();
	document.getElementById('gameFooter').classList.add('hidden');
});

function preGameLoop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (!isGameStarted) {
		drawVibratingWindow();
		
		ship.draw();
		for (let asteroid of asteroids) {
			asteroid.updateRotation();
			asteroid.draw();
		}
		
		requestAnimationFrame(preGameLoop);
	} else {
		requestAnimationFrame(gameLoop);
	}
}

createAsteroid(ASTEROID_COUNT);

preGameLoop();