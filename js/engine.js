'use strict';

// Costanti in unità "@60fps" — applicate con f = dt*60 per essere FPS-independent
const GRAVITY        = 0.55;   // px/frame²
const MOVE_SPEED     = 5;      // px/frame
const JUMP_FORCE     = -14;    // px/frame (velocità iniziale del salto)
const FRICTION       = 0.82;   // moltiplicatore per frame (inerzia)
const MAX_FALL_SPEED = 18;     // tetto caduta (evita teleport attraverso piattaforme)

// Quality-of-life del salto (in secondi reali)
const COYOTE_TIME   = 0.10;    // puoi saltare fino a 100ms dopo aver lasciato il suolo
const JUMP_BUFFER   = 0.12;    // premere salto fino a 120ms prima dell'atterraggio funziona
const JUMP_CUT_MULT = 0.45;    // rilasciando salto durante salita, velY viene ridotta

class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = 0;
        this.y = 0;
        this.w = canvasWidth;
        this.h = canvasHeight;
    }

    follow(target, worldWidth) {
        this.x = target.x + target.w / 2 - this.w / 2;
        this.x = Math.max(0, Math.min(this.x, worldWidth - this.w));
    }

    apply(ctx) {
        ctx.translate(-this.x, -this.y);
    }
}

class GameObject {
    constructor(x, y, w, h) {
        this.x    = x;
        this.y    = y;
        this.w    = w;
        this.h    = h;
        this.velX = 0;
        this.velY = 0;
    }

    update() {
        this.x += this.velX;
        this.y += this.velY;
    }

    draw(ctx) {}
}

function aabb(a, b) {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

class Engine {
    constructor(canvasId) {
        this.canvas  = document.getElementById(canvasId);
        this.ctx     = this.canvas.getContext('2d');
        this.last    = 0;
        this.objects = [];
        this.running = false;

        this._resize = this._resize.bind(this);
        window.addEventListener('resize', this._resize);
        this._resize();
    }

    _resize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    add(obj) {
        this.objects.push(obj);
        return obj;
    }

    start() {
        this.running = true;
        requestAnimationFrame(ts => this._loop(ts));
    }

    stop() {
        this.running = false;
    }

    _loop(ts) {
        if (!this.running) return;
        const dt = Math.min((ts - this.last) / 1000, 0.05);
        this.last = ts;

        this.update(dt);
        this.draw();

        requestAnimationFrame(ts => this._loop(ts));
    }

    update(dt) {
        for (const obj of this.objects) obj.update(dt);
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const obj of this.objects) obj.draw(ctx);
    }
}
