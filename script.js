//* JAVASCRIPT document named `script.js` *//

const canvas = document.getElementById('gameCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext('2d');
const startOverlay = document.getElementById('startOverlay');
const startButton = document.getElementById('startButton');

/* CONST */

let frameCount = 0;
let isGameOver = false;
let isGameStarted = false;
let wave = 1;
let asteroidsDestroyed = 0;
let gameStartTime = Date.now();
let missilesFired = 0;
let canShoot = true;
let isExploding = false;
let explosionStartTime = 0;
let shieldSpawned = false;
let shieldPowerUp = null;
let waveDelayTimer = 0;
let waveInProgress = true;
let loopCount = 0;

const keys = {};

let waveMessage = '';
let waveMessageTimer = 0;

const MIN_ASTEROID_SIZE = 18;
const GRAY_ASTEROID_COUNT = 17;
const RED_ASTEROID_COUNT = 3;
const RED_ASTEROID_COLOR = 'rgba(255,0,0,1)';
const EXPLOSION_RADIUS = 200;
const EXPLOSION_FORCE = 3;
const EXPLOSION_DURATION = 1000;
const SHIP_RADIUS = 14;
const SHIELD_RADIUS = SHIP_RADIUS + 7.3;
const SAFETY_SPAWN_RADIUS = 60;

let GOD_MODE = false;
let SHIELD = false;

/* CLASS */

class Ship {
	constructor() {
		this.x = canvas.width / 2 + (2 * Math.random() - 1) * canvas.width / 8;
		this.y = canvas.height / 2 + (2 * Math.random() - 1) * canvas.height / 8;
		this.angle = Math.random() * Math.PI * 2;
		this.speed = 0;
		this.rotationSpeed = 0;
		this.radius = SHIP_RADIUS;
	}

	update() {
		this.x += Math.cos(this.angle) * this.speed;
		this.y += Math.sin(this.angle) * this.speed;
		
		
		if (this.speed > 0.2) {
			const offsetX = this.x - Math.cos(this.angle) * 12;
			const offsetY = this.y - Math.sin(this.angle) * 12 + 8 * (2 * Math.random() - 1);
			particles.push(new Particle(offsetX, offsetY, this.angle, this.speed));
		}
		
		if (this.x < 0) this.x = canvas.width;
		if (this.x > canvas.width) this.x = 0;
		if (this.y < 0) this.y = canvas.height;
		if (this.y > canvas.height) this.y = 0;
	}

	draw() {
		let vibration1 = 2 * Math.random() - 1;
		let vibration2 = 2 * Math.random() - 1;
		if (isGameOver) {
			ctx.save();
			ctx.translate(this.x, this.y);
			// ctx.rotate(- Math.PI / 2);
			
			ctx.beginPath();
			ctx.moveTo(-14 - vibration1, -11);
			ctx.lineTo(-14 - vibration1, 11 + vibration2);
			ctx.lineTo(14 + vibration1, 11 + vibration2);
			ctx.lineTo(14 + vibration1, -11);
			ctx.strokeStyle = 'white';
			ctx.stroke();
			
			ctx.beginPath();
			ctx.strokeStyle = 'white';
			ctx.arc(0, -11, 14 + vibration1, 0, Math.PI, 1);
			ctx.stroke();
			
			ctx.font = 'bold 8.5px Courier';
			ctx.fillStyle = 'gray';
			ctx.textAlign = 'center';
			ctx.fillText('R.I.P', 0, -4.5);
			
			ctx.restore();
		}
		else {
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
			
			if (SHIELD && !isGameOver) {
				let step1 = Math.sin(Date.now() / 100) ** 2
				let step2 = Math.sin(Date.now() / 90) ** 2
				
				ctx.beginPath();
				ctx.strokeStyle = `rgba(0,0,255,${1 - 0.8 * step1})`;
				ctx.arc(2 + vibration1 / 10, 0, SHIELD_RADIUS - step1, 0, 2 * Math.PI);
				ctx.stroke();
				
				ctx.beginPath();
				ctx.strokeStyle = 'rgba(0,100,255,1)';
				ctx.arc(2 + vibration1 / 10, 0, SHIELD_RADIUS - step2 * 2, 0, 2 * Math.PI);
				ctx.stroke();
			}
			
			ctx.restore();
		}
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

class RedAsteroid {
	constructor() {
		this.x = Math.random() * canvas.width;
		this.y = Math.random() * canvas.height;
		this.size = 50 + Math.random() * 15 - Math.min(5 * (wave - 1), 40 - MIN_ASTEROID_SIZE);
		this.speedX = (Math.random() - 0.5) * (2 + 0.31 * (wave - 1));
		this.speedY = (Math.random() - 0.5) * (2 + 0.31 * (wave - 1));
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
		ctx.strokeStyle = 'red';
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

class Particle {
	constructor(x, y, angle, speed) {
		this.x = x;
		this.y = y;
		this.radius = 0.8 * (Math.random() * 1.5 + 0.5);
		this.life = 1.1 * (40 + Math.random() * 10);
		this.angle = angle + (Math.random() - 0.5) * 0.6;
		this.speed = speed * 0.3 + Math.random() * 0.5;
		this.alpha = 1;
	}

	update() {
		this.x -= Math.cos(this.angle) * this.speed;
		this.y -= Math.sin(this.angle) * this.speed;
		this.life--;
		this.alpha = Math.max(0, this.life / 40);
	}

	draw() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.fillStyle = `rgba(${200 + this.life * 1.5},${145 - this.life},${50 - 0.5 * this.life},${this.alpha})`;
		ctx.fill();
	}
}

class ShieldPowerUp {
	constructor() {
		this.radius = SHIELD_RADIUS;
		this.x = Math.random() * canvas.width;
		this.y = Math.random() * canvas.height;
		this.speed = 1.2;
		this.angle = Math.random() * 2 * Math.PI;
		this.variation = 0;
	}

	update() {
		this.variation += 0.05;
		const variationX = 0.4 * Math.sin(this.variation * 3 + this.x / 50);
		const variationY = 0.4 * Math.cos(this.variation * 2 + this.y / 50);

		this.x += Math.cos(this.angle) * this.speed + variationX;
		this.y += Math.sin(this.angle) * this.speed + variationY;

		if (this.x < 0) this.x = canvas.width;
		if (this.x > canvas.width) this.x = 0;
		if (this.y < 0) this.y = canvas.height;
		if (this.y > canvas.height) this.y = 0;
	}

	draw() {
		ctx.save();
		
		let step3 = Math.sin(Date.now() / 100) ** 2
		let step4 = Math.sin(Date.now() / 90) ** 2
		
		ctx.beginPath();
		ctx.arc(this.x, this.y, SHIELD_RADIUS - step3, 0, 2 * Math.PI);
		ctx.strokeStyle = 'rgba(0, 0, 255, 0.7)';
		ctx.lineWidth = 2.5;
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(this.x, this.y, SHIELD_RADIUS - step4, 0, 2 * Math.PI);
		ctx.strokeStyle = 'rgba(0, 100, 255, 1)';
		ctx.stroke();

		ctx.restore();
	}
}

/* OBJECTS */

const ship = new Ship();
let asteroids = [];
let redAsteroids = [];
let missiles = [];
let particles = [];
const explosions = [];
const starLayers = [
	{ count: 100, speed: {x: 0.02, y: 0.006}, stars: [], opacity: 0.4 },
	{ count: 60, speed: {x: 0.01, y: 0.003}, stars: [], opacity: 0.2 },
	{ count: 30, speed: {x: 0.005, y: 0.0015}, stars: [], opacity: 0.1 },
];

/* UTILY & DEBUGGING */

function destroyAllAsteroids(animation = false) {
	for (let i = asteroids.length - 1; i >= 0; i--) {
		const asteroid = asteroids[i];
		asteroids.splice(i, 1);
	}

	for (let i = redAsteroids.length - 1; i >= 0; i--) {
		const redAsteroid = redAsteroids[i];
		if (animation) {createExplosionEffect(redAsteroid.x, redAsteroid.y);}
		redAsteroids.splice(i, 1);
	}
}

function stopAllAsteroids() {
	for (let asteroid of asteroids) {
		asteroid.speedX = 0;
		asteroid.speedY = 0;
		asteroid.rotationSpeed = 0;
	}
	for (let redAsteroid of redAsteroids) {
		redAsteroid.speedX = 0;
		redAsteroid.speedY = 0;
		redAsteroid.rotationSpeed = 0;
	}
}

function getTime(startTime, format) {
	const now = Date.now();
	const elapsedSeconds = ((now - startTime) / 1000);
	if (format) {
		if (elapsedSeconds < 0.6) return `${(elapsedSeconds * 100).toFixed(0)} ms`;
		else if (elapsedSeconds < 60) return `${(elapsedSeconds).toFixed(2)} s`;
		else if (elapsedSeconds < 3600) return `${(elapsedSeconds / 60).toFixed(2)} min`;
		else return `${(elapsedSeconds / 3600).toFixed(2)} h`;
	} else return elapsedSeconds;
}

function createExplosionEffect(x, y) {
	const particleCount = 30;
	const particles = [];

	for (let i = 0; i < particleCount; i++) {
		const angle = Math.random() * 2 * Math.PI;
		const speed = Math.random() * EXPLOSION_FORCE + 1;
		const size = Math.random() * 3 + 2;

		particles.push({
			x: x + (2 * Math.random() - 1) * size * 2,
			y: y + (2 * Math.random() - 1) * size * 2,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			size: size,
			alpha: 1,
			life: EXPLOSION_DURATION,
			color: RED_ASTEROID_COLOR,
		});
	}

	explosions.push({
		particles: particles,
		startTime: performance.now(),
		ringEffect: {
			x, y,
			startTime: performance.now()
		}
	});
}

function drawRadialExplosionRing(ctx, ringEffect, elapsed) {
	const progress = elapsed / EXPLOSION_DURATION;
	const maxRadius = EXPLOSION_RADIUS;
	const ringCount = 5;

	for (let i = 0; i < ringCount; i++) {
		const radius = maxRadius * progress * (0.6 + 0.1 * i + Math.random() / 5);
		const alpha = Math.max(0, 0.4 - 0.1 * i - progress * 0.5);
		const thickness = 1.5 + i * 0.8;

		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.beginPath();
		ctx.arc(ringEffect.x, ringEffect.y, radius, 0, 2 * Math.PI);
		ctx.lineWidth = thickness;
		ctx.strokeStyle = `rgba(${255 - 20 * progress},${130 * progress},${50 - 25 * progress},1)`;
		ctx.stroke();
		ctx.restore();
	}
}

/* COMMANDS */

window.addEventListener('keydown', (e) => {
	keys[e.key] = true;
	const key = e.key;
	
	if (!isGameStarted && (key === ' ' || key === 'Enter')) {
		e.preventDefault();
		startButton.click();
	} else if (e.key === ' ') {
		if (canShoot && !isGameOver) {
			const offset = ship.radius + 8;
			const missileX = ship.x + Math.cos(ship.angle) * offset;
			const missileY = ship.y + Math.sin(ship.angle) * offset;
			missiles.push(new Missile(missileX, missileY, ship.angle, ship.speed));
			missilesFired++;
			canShoot = false;
		}
	}

	if (isGameOver && (key === ' ' || key === 'Enter')) {
		e.preventDefault();
		const restartButton = document.getElementById('restartButton');
		if (restartButton) {
			restartButton.click();
		}
	}
});

window.addEventListener('keyup', (e) => {
	keys[e.key] = false;
	if (e.key === ' ') {
		canShoot = true;
	}
});

startButton.addEventListener('click', () => {
	isGameStarted = true;
	startOverlay.style.display = 'none';
	document.getElementById('helpWindow').style.display = 'none';
	showOverlay();
	document.getElementById('gameFooter').classList.add('hidden');
});

function commands() {
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
}

function restartGame() {
	window.location.reload();
}

/* DETECTION */

function isTooCloseToShip(x, y, size, ship) {
	const dx = ship.x - x;
	const dy = ship.y - y;
	const distance = Math.sqrt(dx * dx + dy * dy);
	return distance < ship.radius + size + SAFETY_SPAWN_RADIUS;
}

function isOverlappingWithOtherAsteroids(x, y, size, asteroidArray) {
	for (const other of asteroidArray) {
		const dx = x - other.x;
		const dy = y - other.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		if (distance < size + other.size) {
			return true;
		}
	}
	return false;
}

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

function shieldSavedOrNot(collider = null, array = null) {
	if (SHIELD) {
		SHIELD = false;

		if (collider && array) {
			const index = array.indexOf(collider);
			if (index !== -1) {
				array.splice(index, 1);
			}
		}
		return;
	}
	isGameOver = true;
	showGameOver();
}

/* RESOLVE */

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

function resolveRedAsteroidExplosions() {
	for (let i = missiles.length - 1; i >= 0; i--) {
		const missile = missiles[i];
		for (let j = redAsteroids.length - 1; j >= 0; j--) {
			const redAsteroid = redAsteroids[j];
			if (detectMissileAsteroidCollision(missile, redAsteroid)) {
				const explosionX = redAsteroid.x;
				const explosionY = redAsteroid.y;

				createExplosionEffect(explosionX, explosionY);

				missiles.splice(i, 1);
				redAsteroids.splice(j, 1);

				const pushTargets = [...asteroids, ...redAsteroids, ship];
				for (let obj of pushTargets) {
					const dx = obj.x - explosionX;
					const dy = obj.y - explosionY;
					const distance = Math.sqrt(dx * dx + dy * dy);
					if (distance < EXPLOSION_RADIUS && distance > 0) {
						const force = 5 * (1 - distance / EXPLOSION_RADIUS);
						obj.vx += (dx / distance) * force;
						obj.vy += (dy / distance) * force;
					}
				}
				
				asteroidsDestroyed++;

				break;
			}
		}
	}
}

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

/* INIT FUNC & GEN FUNCTION */

function initStars() {
	for (let layer of starLayers) {
		layer.stars = [];
		for (let i = 0; i < layer.count; i++) {
			layer.stars.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
			});
		}
	}
}

function createAsteroidsOfType(count, AsteroidClass, targetArray) {
	for (let i = 0; i < count;) {
		const tempAsteroid = new AsteroidClass();
		if (
			!isTooCloseToShip(tempAsteroid.x, tempAsteroid.y, tempAsteroid.size, ship) &&
			!isOverlappingWithOtherAsteroids(tempAsteroid.x, tempAsteroid.y, tempAsteroid.size, [
				...asteroids, ...redAsteroids, ...targetArray
			])
		) {
			targetArray.push(tempAsteroid);
			i++;
		}
	}
}

/* OVERLAY & HUD */

function showOverlay() {
	document.getElementById('gameOverlay').style.display = 'block';
	gameStartTime = Date.now();
	asteroidsDestroyed = 0;
}

function hideOverlay() {
	document.getElementById('gameOverlay').style.display = 'none';
}

function showGameOver() {
	document.getElementById('gameOverWindow').classList.remove('hidden');
	document.getElementById('gameFooter').classList.remove('hidden');
}

function showWaveMessage(waveNumber) {
	waveMessage = `WAVE ${waveNumber}`;
	waveMessageTimer = 300;
}

function drawVibratingWindow() {
	const x = canvas.width / 2;
	const y = canvas.height / 2;
	const sides = 5 + Math.floor(Math.random() * 2);
	const radiusX = 230;
	const radiusY = 140;
	const angleOffset = 0;

	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(angleOffset);
	ctx.beginPath();
	for (let i = 0; i <= sides; i++) {
		const vibrate = 0.1 + 0.075 * (2 * Math.random() - 1);
		const theta = (i / sides) * Math.PI * 2 - Date.now() / 1000;
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

/* UPDATE */

function updateAndDrawStars() {
	for (let layer of starLayers) {
		ctx.fillStyle = `rgba(236,230,230,${layer.opacity * (1 - 0.5 * Math.sin(Date.now() / 500 * layer.opacity)**2)})`;
		for (let star of layer.stars) {
			star.x -= layer.speed.x * wave;
			star.y -= layer.speed.y * wave;
			if (star.x < 0) {
				star.x = canvas.width;
				star.y = Math.random() * canvas.height;
			}
			if (star.y < 0) {
				star.y = canvas.height;
				star.x = Math.random() * canvas.width;
			}
			ctx.beginPath();
			ctx.arc(star.x, star.y, 1.2, 0, Math.PI * 2);
			ctx.fill();
		}
	}
}

function updateOverlay() {
	document.getElementById('asteroidsPresent').textContent = asteroids.length;
	document.getElementById('asteroidsDestroyed').textContent = asteroidsDestroyed;
	document.getElementById('timePlayed').textContent = getTime(gameStartTime, true);
	document.getElementById('wavesPassed').textContent = wave - 1;
	document.getElementById('missilesFiredText').textContent = missilesFired;
	if (missilesFired > 0) {
		document.getElementById('fireAccuracy').textContent = (asteroidsDestroyed / missilesFired * 100).toFixed(0);
	}
	if (GOD_MODE) {
		document.getElementById('godModeInfo').textContent = 'God mode activated';
	}
}

function updateAndDrawMissiles() {
	for (let i = missiles.length - 1; i >= 0; i--) {
		const missile = missiles[i];
		missile.update();
		missile.draw();
		if (detectMissileShipCollision(missile, ship) && !GOD_MODE) {
			shieldSavedOrNot(missile, missiles);
		}
		if (missile.life <= 0) {
			missiles.splice(i, 1);
		}
	}
}

function updateAndDrawParticles() {
	for (let i = particles.length - 1; i >= 0; i--) {
		particles[i].update();
		if (particles[i].life <= 0) {
			particles.splice(i, 1);
		} else {
			particles[i].draw();
		}
	}
}

function updateAndDrawAsteroids() {
	const allAsteroids = [...asteroids, ...redAsteroids];

	for (let asteroid of allAsteroids) {
		asteroid.update();
		asteroid.draw();
		if (detectCollision(ship, asteroid) && !GOD_MODE) {
			const isRed = redAsteroids.includes(asteroid);
			shieldSavedOrNot(asteroid, isRed ? redAsteroids : asteroids);
		}
	}
	
	for (let i = 0; i < allAsteroids.length; i++) {
		for (let j = i + 1; j < allAsteroids.length; j++) {
			const a1 = allAsteroids[i];
			const a2 = allAsteroids[j];
			if (detectAsteroidCollision(a1, a2)) {
				resolveAsteroidCollision(a1, a2);
			}
		}
	}
}

function updateAndDrawExplosions(ctx) {
	for (let i = explosions.length - 1; i >= 0; i--) {
		const explosion = explosions[i];
		const now = performance.now();
		const elapsed = now - explosion.startTime;

		if (elapsed > EXPLOSION_DURATION) {
			explosions.splice(i, 1);
			continue;
		}

		for (let p of explosion.particles) {
			p.x += p.vx;
			p.y += p.vy;
			p.alpha = 1 - elapsed / EXPLOSION_DURATION;
			p.vx *= 0.97;
			p.vy *= 0.97;

			const dx = p.x - ship.x;
			const dy = p.y - ship.y;
			if (Math.hypot(dx, dy) < ship.radius && !GOD_MODE && !SHIELD) {
				shieldSavedOrNot();
			}
		}

		for (let p of explosion.particles) {
			ctx.save();
			ctx.globalAlpha = p.alpha;
			ctx.fillStyle = p.color;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
			ctx.fill();
			ctx.restore();
		}
		if (explosion.ringEffect) {
			const ringElapsed = now - explosion.ringEffect.startTime;
			drawRadialExplosionRing(ctx, explosion.ringEffect, ringElapsed);
		}
	}
}

function updateAndDrawShieldPowerUp() {
	if (!shieldPowerUp && !shieldSpawned) return;

	const dx = ship.x - shieldPowerUp.x;
	const dy = ship.y - shieldPowerUp.y;
	const distance = Math.sqrt(dx * dx + dy * dy);

	if (distance < ship.radius + shieldPowerUp.radius) {
		SHIELD = true;
		shieldSpawned = false;
		shieldPowerUp = null;
		return;
	}
	
	shieldPowerUp.update();
	shieldPowerUp.draw();
}

function waveUpdater() {
	if ((asteroids.length === 0) && (redAsteroids.length === 0) && waveInProgress) {
		waveInProgress = false; 
		waveDelayTimer = 10;
		showWaveMessage(wave + 1);
	}
	
	if (!waveInProgress && waveDelayTimer > 0) {
		waveDelayTimer--;
		if (waveDelayTimer === 0) {
			wave++;
			waveInProgress = true;

			if (isGameStarted && !shieldSpawned && !SHIELD && !shieldPowerUp) {
				shieldPowerUp = new ShieldPowerUp();
				shieldSpawned = true;
			}

			createAsteroidsOfType(GRAY_ASTEROID_COUNT * wave, Asteroid, asteroids);
			createAsteroidsOfType(RED_ASTEROID_COUNT * wave, RedAsteroid, redAsteroids);
		}
	}
	
	if (waveMessageTimer > 0) {
		ctx.font = 'bold 90px Courier';
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.fillText(waveMessage, canvas.width / 2, canvas.height / 2);
		waveMessageTimer--;
	}
}

/* MAIN LOOP */

function mainLoop() {
	loopCount++;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	updateAndDrawStars();

	if (!isGameStarted || isGameOver) {
		drawVibratingWindow();
		
		ship.draw();
		for (let asteroid of [...asteroids, ...redAsteroids]) {
			asteroid.updateRotation();
			asteroid.draw();
		}
	} else if (!isGameOver) {
		commands();
		
		ship.update();
		
		updateOverlay();
		
		updateAndDrawMissiles();
		
		updateAndDrawParticles();

		updateAndDrawAsteroids();

		updateAndDrawShieldPowerUp();
		
		updateAndDrawExplosions(ctx, EXPLOSION_DURATION);
		
		resolveAsteroidDestruction();
		resolveRedAsteroidExplosions();
		
		waveUpdater();
		
		ship.draw();
	}
	
	requestAnimationFrame(mainLoop);
}

/* STARTING SCRIPT */

initStars();

createAsteroidsOfType(GRAY_ASTEROID_COUNT, Asteroid, asteroids);
createAsteroidsOfType(RED_ASTEROID_COUNT, RedAsteroid, redAsteroids);

mainLoop();

//* FPS *//
const fpsCounter=document.getElementById('fpsCounter'),
		idealFrame=25/3*4;
let fps=0,
	frames=0,
	lastFps=performance.now(),
	lastFrame=performance.now();

function PERF() {
  const now=performance.now(),
		delta=now-lastFrame;
  frames++;
  if (now-lastFps>=1000) {
	fps=frames;
	frames=0;
	lastFps=now;
	let cpu=Math.min(100,(delta/idealFrame)*100),
		state=cpu<30?'low':cpu<70?'medium':'high';
	fpsCounter.textContent=`FPS:${fps}|CPU:${cpu.toFixed(0)}%(${state})`;
  }
  lastFrame=now;
  requestAnimationFrame(PERF);
}

PERF();