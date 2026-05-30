'use strict';

const GRAVITY        = 0.55;
const MOVE_SPEED     = 5;
const JUMP_FORCE     = -14;
const FRICTION       = 0.82;
const MAX_FALL_SPEED = 18;
const COYOTE_TIME    = 0.10;
const JUMP_BUFFER    = 0.12;
const JUMP_CUT_MULT  = 0.45;

// ── Particle System ───────────────────────────────────────────────────────────

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, opts = {}) {
        const count = opts.count || 6;
        for (let i = 0; i < count; i++) {
            const angle  = (opts.angle  ?? (Math.random() * Math.PI * 2));
            const spread = (opts.spread ?? Math.PI * 2);
            const a = angle - spread / 2 + Math.random() * spread;
            const spd = (opts.speed ?? 2) * (0.5 + Math.random() * 0.8);
            this.particles.push({
                x, y,
                vx: Math.cos(a) * spd,
                vy: Math.sin(a) * spd - (opts.vy ?? 0),
                life: 1,
                decay: opts.decay ?? (0.03 + Math.random() * 0.03),
                size:  opts.size  ?? (2 + Math.random() * 3),
                color: opts.color ?? '#FFD700',
                gravity: opts.gravity ?? 0.12,
                type: opts.type ?? 'circle',
            });
        }
    }

    // Polvere sotto i piedi
    dust(x, y) {
        this.emit(x, y, {
            count: 2, angle: -Math.PI / 2, spread: Math.PI * 0.6,
            speed: 1.2, vy: 0, decay: 0.06, size: 3,
            color: 'rgba(180,150,100,0.7)', gravity: -0.04, type: 'circle'
        });
    }

    // Stelle alla raccolta
    stars(x, y, color) {
        this.emit(x, y, {
            count: 10, spread: Math.PI * 2,
            speed: 3.5, vy: 1.5, decay: 0.025, size: 4,
            color: color ?? '#FFD700', gravity: 0.1, type: 'star'
        });
    }

    // Scintille al danno
    sparks(x, y) {
        this.emit(x, y, {
            count: 14, spread: Math.PI * 2,
            speed: 4, vy: 2, decay: 0.04, size: 3,
            color: '#FF4444', gravity: 0.15, type: 'circle'
        });
    }

    // Esplosione nemico eliminato
    pop(x, y) {
        this.emit(x, y, {
            count: 12, spread: Math.PI * 2,
            speed: 3, vy: 1, decay: 0.03, size: 4,
            color: '#FF8800', gravity: 0.1, type: 'circle'
        });
        this.emit(x, y, {
            count: 8, spread: Math.PI * 2,
            speed: 2, vy: 0.5, decay: 0.02, size: 6,
            color: '#FFD700', gravity: 0.08, type: 'star'
        });
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x    += p.vx;
            p.y    += p.vy;
            p.vy   += p.gravity;
            p.vx   *= 0.96;
            p.life -= p.decay;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    draw(ctx) {
        ctx.save();
        for (const p of this.particles) {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle   = p.color;
            if (p.type === 'star') {
                this._drawStar(ctx, p.x, p.y, p.size);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    _drawStar(ctx, x, y, r) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a1 = (i * 2 * Math.PI / 5) - Math.PI / 2;
            const a2 = a1 + Math.PI / 5;
            if (i === 0) ctx.moveTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r);
            else         ctx.lineTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r);
            ctx.lineTo(x + Math.cos(a2) * r * 0.4, y + Math.sin(a2) * r * 0.4);
        }
        ctx.closePath();
        ctx.fill();
    }
}

// Istanza globale
const particles = new ParticleSystem();

// ── Screen Shake ──────────────────────────────────────────────────────────────

const screenShake = {
    intensity: 0,
    trauma: 0,

    add(amount) { this.trauma = Math.min(1, this.trauma + amount); },

    update(dt) {
        this.trauma = Math.max(0, this.trauma - dt * 2.5);
        this.intensity = this.trauma * this.trauma;
    },

    apply(ctx) {
        if (this.intensity < 0.001) return;
        const mx = 12 * this.intensity;
        const my = 8  * this.intensity;
        ctx.translate(
            (Math.random() * 2 - 1) * mx,
            (Math.random() * 2 - 1) * my
        );
    }
};

// ── Camera ────────────────────────────────────────────────────────────────────

class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = 0; this.y = 0;
        this.w = canvasWidth; this.h = canvasHeight;
    }

    follow(target, worldWidth) {
        this.x = target.x + target.w / 2 - this.w / 2;
        this.x = Math.max(0, Math.min(this.x, worldWidth - this.w));
    }

    apply(ctx) { ctx.translate(-this.x, -this.y); }
}

// ── GameObject ────────────────────────────────────────────────────────────────

class GameObject {
    constructor(x, y, w, h) {
        this.x = x; this.y = y; this.w = w; this.h = h;
        this.velX = 0; this.velY = 0;
    }
    update() { this.x += this.velX; this.y += this.velY; }
    draw(ctx) {}
}

function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}

// ── Engine ────────────────────────────────────────────────────────────────────

class Engine {
    constructor(canvasId) {
        this.canvas  = document.getElementById(canvasId);
        this.ctx     = this.canvas.getContext('2d');
        this.last    = 0;
        this.objects = [];
        this.running = false;
        this.accumulator = 0;

        this._resize = this._resize.bind(this);
        window.addEventListener('resize', this._resize);
        this._resize();
    }

    _resize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    add(obj) { this.objects.push(obj); return obj; }
    start() { this.running = true; this.last = performance.now(); requestAnimationFrame(ts => this._loop(ts)); }
    stop()  { this.running = false; }

    _loop(ts) {
        if (!this.running) return;
        const realDt = Math.min((ts - this.last) / 1000, 0.1);
        this.last = ts;
        this.accumulator += realDt;
        let steps = 0;
        while (this.accumulator >= Engine.FIXED_DT && steps < Engine.MAX_STEPS) {
            this.update(Engine.FIXED_DT);
            this.accumulator -= Engine.FIXED_DT;
            steps++;
        }
        if (steps >= Engine.MAX_STEPS) this.accumulator = 0;
        this.draw();
        requestAnimationFrame(ts => this._loop(ts));
    }

    update(dt) {
        particles.update();
        screenShake.update(dt);
        for (const obj of this.objects) obj.update(dt);
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const obj of this.objects) obj.draw(ctx);
    }
}

Engine.FIXED_DT  = 1 / 60;
Engine.MAX_STEPS = 5;
