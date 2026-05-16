'use strict';

const WORLD_H  = 600;
const GROUND_Y = WORLD_H - 70;   // 530

// ── Protagonista ──────────────────────────────────────────────────────────────

class Protagonista extends GameObject {
    constructor(x, y) {
        super(x, y, 34, 78);
        this.lives      = 3;
        this.facingLeft = false;
        this.frame      = 0;
        this.frameTick  = 0;
        this.onGround   = false;
        this.invTimer   = 0;
        this.prevJump   = false;
    }

    update(dt, platforms) {
        const wantsJump = controls.jump;

        if      (controls.left)  { this.velX = -MOVE_SPEED; this.facingLeft = true;  }
        else if (controls.right) { this.velX =  MOVE_SPEED; this.facingLeft = false; }
        else                       this.velX = 0;

        if (wantsJump && !this.prevJump && this.onGround) {
            this.velY     = JUMP_FORCE;
            this.onGround = false;
        }
        this.prevJump = wantsJump;

        if (this.velX !== 0 && this.onGround) {
            if (++this.frameTick >= 8) { this.frame = 1 - this.frame; this.frameTick = 0; }
        }

        this.velY += GRAVITY;
        this.x    += this.velX;
        this.y    += this.velY;
        this.x     = Math.max(0, this.x);

        this.onGround = false;
        for (const p of platforms) {
            if (aabb(this, p) && this.velY >= 0 && (this.y + this.h - this.velY) <= p.y + 6) {
                this.y      = p.y - this.h;
                this.velY   = 0;
                this.onGround = true;
            }
        }
        if (this.invTimer > 0) this.invTimer -= dt;
    }

    takeDamage() {
        if (this.invTimer > 0) return;
        this.lives--;
        this.invTimer = 2;
        this.velY     = JUMP_FORCE * 0.45;
    }

    draw(ctx) {
        if (this.invTimer > 0 && Math.floor(this.invTimer * 8) % 2 === 0) return;
        drawProtagonista(ctx, this.x, this.y, this.facingLeft, this.frame);
    }
}

// ── Nemico ────────────────────────────────────────────────────────────────────

const _NDIM = { gabbiano: [44, 20], turista: [28, 65], lucertola: [50, 16], motorino: [65, 55] };

class Nemico extends GameObject {
    constructor(data) {
        const [w, h] = _NDIM[data.type] || [30, 30];
        const bx = (data.type === 'turista' || data.type === 'motorino') ? data.x : data.x - w / 2;
        const by = (data.type === 'turista' || data.type === 'motorino') ? data.y : data.y - h / 2;
        super(bx, by, w, h);
        this.type       = data.type;
        this.alive      = true;
        this.frame      = 0;
        this.frameTick  = 0;
        this.velX       = (data.type === 'gabbiano') ? 2.2 : (data.type === 'motorino') ? 1.6 : 1.6;
        const patrol    = (data.type === 'gabbiano') ? 110 : (data.type === 'motorino') ? 30 : 65;
        this.leftBound  = bx - patrol;
        this.rightBound = bx + patrol;
    }

    update(dt) {
        if (!this.alive) return;
        this.x += this.velX;
        if (this.type === 'motorino') {
            if (this.x <= this.leftBound || this.x >= this.rightBound) this.velX = -this.velX;
        } else {
            if (this.x <= this.leftBound || this.x + this.w >= this.rightBound) this.velX = -this.velX;
        }
        if (++this.frameTick >= 18) { this.frame = 1 - this.frame; this.frameTick = 0; }
    }

    draw(ctx) {
        if (!this.alive) return;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        if      (this.type === 'gabbiano')  drawGabbiano(ctx, cx, cy, this.frame);
        else if (this.type === 'turista')   drawTurista(ctx, this.x, this.y, this.frame);
        else if (this.type === 'motorino')  drawMoto(ctx, this.x + this.w / 2, this.y + this.h, this.frame);
        else                                drawLucertola(ctx, cx, cy, this.frame);
    }
}

// ── Collezionabile ────────────────────────────────────────────────────────────

class Collezionabile extends GameObject {
    constructor(data) {
        super(data.x - 18, data.y - 18, 36, 36);
        this.type      = data.type;
        this.baseY     = data.y - 18;
        this.t         = Math.random() * Math.PI * 2;
        this.collected = false;
    }

    update(dt) {
        if (this.collected) return;
        this.t += dt * 2.4;
        this.y  = this.baseY + Math.sin(this.t) * 5;
    }

    draw(ctx) {
        if (this.collected) return;
        if (this.type === 'graffa') drawGraffa(ctx, this.x + 18, this.y + 18);
        else                        drawBottiglietta(ctx, this.x + 18, this.y + 18);
    }
}

// ── Livello ───────────────────────────────────────────────────────────────────

class Livello {
    constructor(idx) {
        this.data           = LEVELS[idx];
        this.waveT          = 0;
        this.platforms      = this.data.platforms;
        this.nemici         = this.data.enemies.map(e => new Nemico(e));
        this.collezionabili = this.data.collectibles.map(c => new Collezionabile(c));
    }

    update(dt) {
        this.waveT += dt;
        this.nemici.forEach(n => n.update(dt));
        this.collezionabili.forEach(c => c.update(dt));
    }

    // Screen-space background (call BEFORE camera transform)
    drawBg(ctx, camX, cW, cH) {
        const bg = this.data.background;
        if (this.data.id === 1) { this._villaBg(ctx, camX, cW, cH); return; }
        if (this.data.id === 2) { this._stadioBg(ctx, camX, cW, cH); return; }
        if (this.data.id === 3) { this._termeBg(ctx, camX, cW, cH); return; }
        if (this.data.id === 4) { this._cassamonicaBg(ctx, camX, cW, cH); return; }
        if (this.data.id === 5) { this._piazzaBg(ctx, camX, cW, cH); return; }
        const sg = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        sg.addColorStop(0, bg.skyColor);
        sg.addColorStop(1, this._lighten(bg.skyColor, 28));
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, cW, GROUND_Y);
        if (bg.vesuvio) this._vesuvio(ctx, camX, cW);
        if (bg.colline) this._colline(ctx, camX, cW);
    }

    drawGround(ctx, camX, cW, cH) {
        const bg = this.data.background;
        if (this.data.id === 1) { this._villaGround(ctx, camX, cW, cH); return; }
        if (this.data.id === 2) { this._stadioGround(ctx, camX, cW, cH); return; }
        if (this.data.id === 3) { this._termeGround(ctx, camX, cW, cH); return; }
        if (this.data.id === 4) { this._cassamonicaGround(ctx, camX, cW, cH); return; }
        if (this.data.id === 5) { this._piazzaGround(ctx, camX, cW, cH); return; }
        ctx.fillStyle = bg.groundColor;
        ctx.fillRect(camX, GROUND_Y, cW, cH);
        ctx.fillStyle = this._lighten(bg.groundColor, 22);
        ctx.fillRect(camX, GROUND_Y, cW, 6);
        if (bg.mare) this._mare(ctx, camX, cW);
    }

    // Disegna immagine con logica "cover": mantiene proporzioni, ritaglia i bordi
    _drawImageCover(ctx, img, cW, cH) {
        const iW = img.naturalWidth;
        const iH = img.naturalHeight;
        const scale = Math.max(cW / iW, cH / iH);
        const dW = iW * scale;
        const dH = iH * scale;
        const dx = (cW - dW) / 2;
        const dy = (cH - dH) / 2;
        ctx.drawImage(img, dx, dy, dW, dH);
    }

    _villaBg(ctx, camX, cW, cH) {
        if (!this._bgImgVilla) {
            this._bgImgVilla = new Image();
            this._bgImgVilla.src = 'assets/villacomunale.png';
        }
        if (this._bgImgVilla.complete && this._bgImgVilla.naturalWidth > 0) {
            this._drawImageCover(ctx, this._bgImgVilla, cW, cH);
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            ctx.fillRect(0, 0, cW, cH);
        } else {
            const sky=ctx.createLinearGradient(0,0,0,cH);
            sky.addColorStop(0,'#4A8FB8');sky.addColorStop(1,'#B8DCF0');
            ctx.fillStyle=sky;ctx.fillRect(0,0,cW,cH);
        }
    }


    _villaGround(ctx, camX, cW, cH) {
        // L'immagine copre già tutto il canvas
    }

    _stadioBg(ctx, camX, cW, cH) {
        if (!this._bgImgStadio) {
            this._bgImgStadio = new Image();
            this._bgImgStadio.src = 'assets/stadiomenti.png';
        }
        if (this._bgImgStadio.complete && this._bgImgStadio.naturalWidth > 0) {
            this._drawImageCover(ctx, this._bgImgStadio, cW, cH);
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            ctx.fillRect(0, 0, cW, cH);
        } else {
            const sky=ctx.createLinearGradient(0,0,0,cH);
            sky.addColorStop(0,'#1E1028');sky.addColorStop(1,'#F0A855');
            ctx.fillStyle=sky;ctx.fillRect(0,0,cW,cH);
        }
    }

    _stadioGround(ctx, camX, cW, cH) {
        // L'immagine copre già tutto il canvas
    }

    _termeBg(ctx, camX, cW, cH) {
        if (!this._bgImgTerme) {
            this._bgImgTerme = new Image();
            this._bgImgTerme.src = 'assets/termedistabia.png';
        }
        if (this._bgImgTerme.complete && this._bgImgTerme.naturalWidth > 0) {
            this._drawImageCover(ctx, this._bgImgTerme, cW, cH);
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            ctx.fillRect(0, 0, cW, cH);
        } else {
            const sky=ctx.createLinearGradient(0,0,0,cH);
            sky.addColorStop(0,'#B8BFA8');sky.addColorStop(1,'#8A9278');
            ctx.fillStyle=sky;ctx.fillRect(0,0,cW,cH);
        }
    }

    _termeGround(ctx, camX, cW, cH) {
        // L'immagine copre già tutto il canvas
    }

    _piazzaBg(ctx, camX, cW, cH) {
        if (!this._bgImgPiazza) {
            this._bgImgPiazza = new Image();
            this._bgImgPiazza.src = 'assets/piazzaspartaco.png';
        }
        if (this._bgImgPiazza.complete && this._bgImgPiazza.naturalWidth > 0) {
            this._drawImageCover(ctx, this._bgImgPiazza, cW, cH);
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            ctx.fillRect(0, 0, cW, cH);
        } else {
            const sky = ctx.createLinearGradient(0, 0, 0, cH);
            sky.addColorStop(0, '#5BA8E0'); sky.addColorStop(1, '#C8C0A8');
            ctx.fillStyle = sky; ctx.fillRect(0, 0, cW, cH);
        }
    }

    _piazzaGround(ctx, camX, cW, cH) {
        // L'immagine copre già tutto il canvas
    }

    _cassamonicaBg(ctx, camX, cW, cH) {
        if (!this._bgImg) {
            this._bgImg = new Image();
            this._bgImg.src = 'assets/cassamonica.png';
        }
        if (this._bgImg.complete && this._bgImg.naturalWidth > 0) {
            this._drawImageCover(ctx, this._bgImg, cW, cH);
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.fillRect(0, 0, cW, cH);
        } else {
            let bg = ctx.createLinearGradient(0,0,0,cH);
            bg.addColorStop(0,'#5BA8E0'); bg.addColorStop(1,'#C8C0A8');
            ctx.fillStyle = bg; ctx.fillRect(0,0,cW,cH);
        }
    }

    _cassamonicaGround(ctx, camX, cW, cH) {
        // Niente — l'immagine copre già tutto il canvas
    }

    drawPlatforms(ctx) {
        for (const p of this.platforms) this._platform(ctx, p);
    }

    drawObjects(ctx) {
        drawPennone(ctx, this.data.flagX, GROUND_Y);
        this.nemici.forEach(n => n.draw(ctx));
        this.collezionabili.forEach(c => c.draw(ctx));
    }

    // ── Private background helpers ──────────────────────────────────────────

    _vesuvio(ctx, camX, cW) {
        const sx = cW * 0.62 - camX * 0.18;
        ctx.fillStyle = '#5a4a3a';
        ctx.beginPath();
        ctx.moveTo(sx - 185, GROUND_Y); ctx.lineTo(sx, GROUND_Y - 225); ctx.lineTo(sx + 165, GROUND_Y);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#7a7a7a';
        ctx.beginPath();
        ctx.moveTo(sx - 24, GROUND_Y - 196); ctx.lineTo(sx, GROUND_Y - 225); ctx.lineTo(sx + 22, GROUND_Y - 196);
        ctx.closePath(); ctx.fill();
        // smoke puff
        ctx.fillStyle = 'rgba(200,200,200,0.45)';
        ctx.beginPath(); ctx.arc(sx, GROUND_Y - 240, 14, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 12, GROUND_Y - 252, 10, 0, Math.PI * 2); ctx.fill();
    }

    _colline(ctx, camX, cW) {
        const off = (camX * 0.28) % 700;
        ctx.fillStyle = '#4a7e28';
        for (let i = -1; i <= Math.ceil(cW / 700) + 1; i++) {
            const bx = i * 700 - off;
            ctx.beginPath(); ctx.ellipse(bx + 130, GROUND_Y, 210, 115, 0, Math.PI, 0, true); ctx.fill();
            ctx.beginPath(); ctx.ellipse(bx + 470, GROUND_Y, 175, 95,  0, Math.PI, 0, true); ctx.fill();
        }
        ctx.fillStyle = '#3a6a18';
        for (let i = -1; i <= Math.ceil(cW / 700) + 1; i++) {
            const bx = i * 700 - off;
            ctx.beginPath(); ctx.ellipse(bx + 290, GROUND_Y, 140, 75, 0, Math.PI, 0, true); ctx.fill();
            ctx.beginPath(); ctx.ellipse(bx + 610, GROUND_Y, 160, 85, 0, Math.PI, 0, true); ctx.fill();
        }
    }

    _mare(ctx, camX, cW) {
        ctx.fillStyle = '#1565C0';
        ctx.fillRect(camX, GROUND_Y + 5, cW, 32);
        ctx.strokeStyle = 'rgba(255,255,255,0.38)';
        ctx.lineWidth = 1.5;
        const wOff = (this.waveT * 38) % 170;
        for (let i = -1; i <= Math.ceil(cW / 170) + 1; i++) {
            const wx = camX + i * 170 - wOff;
            ctx.beginPath();
            ctx.moveTo(wx, GROUND_Y + 14);
            ctx.bezierCurveTo(wx + 22, GROUND_Y + 8, wx + 48, GROUND_Y + 8, wx + 70, GROUND_Y + 14);
            ctx.stroke();
        }
    }

    _platform(ctx, p) {
        if (p.type === 'legno') {
            ctx.fillStyle = '#8B5E2A'; ctx.fillRect(p.x, p.y, p.w, p.h);
            ctx.fillStyle = '#A07232'; ctx.fillRect(p.x, p.y, p.w, 5);
            ctx.strokeStyle = '#5a380e'; ctx.lineWidth = 1;
            for (let i = 16; i < p.w; i += 16) {
                ctx.beginPath(); ctx.moveTo(p.x + i, p.y); ctx.lineTo(p.x + i, p.y + p.h); ctx.stroke();
            }
            ctx.strokeRect(p.x, p.y, p.w, p.h);
        } else if (p.type === 'pietra') {
            ctx.fillStyle = '#7a7060'; ctx.fillRect(p.x, p.y, p.w, p.h);
            ctx.fillStyle = '#9a9080'; ctx.fillRect(p.x, p.y, p.w, 5);
            ctx.strokeStyle = '#4a4838'; ctx.lineWidth = 1;
            for (let i = 0; i < p.w; i += 28) ctx.strokeRect(p.x + i, p.y, 28, p.h);
        } else {
            ctx.fillStyle = '#8a7a58'; ctx.fillRect(p.x, p.y, p.w, p.h);
            ctx.fillStyle = '#a09068'; ctx.fillRect(p.x, p.y, p.w, 4);
            ctx.strokeStyle = '#4a3a1a'; ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x + p.w * 0.30, p.y); ctx.lineTo(p.x + p.w * 0.33, p.y + p.h);
            ctx.moveTo(p.x + p.w * 0.68, p.y); ctx.lineTo(p.x + p.w * 0.65, p.y + p.h);
            ctx.stroke();
            ctx.strokeRect(p.x, p.y, p.w, p.h);
        }
    }

    _lighten(hex, amt) {
        const n = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, ((n >> 16) & 0xff) + amt);
        const g = Math.min(255, ((n >> 8)  & 0xff) + amt);
        const b = Math.min(255, ( n        & 0xff) + amt);
        return `rgb(${r},${g},${b})`;
    }
}

// ── GameManager ───────────────────────────────────────────────────────────────

const STATE = { START: 'START', PLAYING: 'PLAYING', GAMEOVER: 'GAMEOVER', WIN: 'WIN' };

class GameManager {
    constructor() {
        this.engine  = new Engine('gameCanvas');
        this.state   = STATE.START;
        this.score   = 0;
        this.lvIdx   = 0;
        this.level   = null;
        this.player  = null;
        this.camera  = null;
        this.tapX    = -1;
        this.tapY    = -1;

        // Override Engine loop handlers
        this.engine.update = (dt) => this._update(dt);
        this.engine.draw   = ()   => this._draw();

        // Unified pointer input for menu buttons (doesn't conflict with JoystickTouch)
        const onTap = e => {
            const src = e.changedTouches ? e.changedTouches[0] : e;
            this.tapX = src.clientX;
            this.tapY = src.clientY;
        };
        this.engine.canvas.addEventListener('touchend', onTap, { passive: true });
        this.engine.canvas.addEventListener('click',    onTap);
    }

    start() { this.engine.start(); }

    _loadLevel(idx) {
        this.lvIdx  = idx;
        const savedLives = this.player ? this.player.lives : 3;
        this.level  = new Livello(idx);
        const firstP = LEVELS[idx].platforms[0];
        this.player = new Protagonista(firstP.x + 20, firstP.y - 78);
        this.player.lives = savedLives;
        this.player.invTimer = 2.5;
        this.camera = new Camera(this.engine.canvas.width, this.engine.canvas.height);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    _update(dt) {
        const { canvas } = this.engine;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        if (this.state === STATE.START) {
            if (this._tapped(cx - 80, cy + 50, 160, 50)) {
                this.score = 0;
                this._loadLevel(4);
                this.state = STATE.PLAYING;
            }
        } else if (this.state === STATE.PLAYING) {
            this._updatePlay(dt);
        } else {
            // GAMEOVER or WIN → RIGIOCA button
            if (this._tapped(cx - 80, cy + 55, 160, 50)) {
                this.score = 0;
                this._loadLevel(4);
                this.state = STATE.PLAYING;
            }
        }
        this.tapX = -1;
        this.tapY = -1;
    }

    _tapped(bx, by, bw, bh) {
        return this.tapX >= bx && this.tapX <= bx + bw &&
               this.tapY >= by && this.tapY <= by + bh;
    }

    _updatePlay(dt) {
        const pl = this.player;
        const lv = this.level;

        lv.update(dt);
        pl.update(dt, lv.platforms);

        this.camera.w = this.engine.canvas.width;
        this.camera.h = this.engine.canvas.height;
        this.camera.follow(pl, lv.data.worldWidth);

        // Collectibles
        for (const c of lv.collezionabili) {
            if (!c.collected && aabb(pl, c)) {
                c.collected = true;
                if (c.type === 'graffa') {
                    this.score += 100;
                } else {
                    this.player.lives++;
                }
            }
        }

        // Enemies
        for (const n of lv.nemici) {
            if (!n.alive || !aabb(pl, n)) continue;
            if (pl.velY > 0 && (pl.y + pl.h - pl.velY) <= n.y + 8) {
                n.alive = false;
                pl.velY = JUMP_FORCE * 0.55;
                this.score += 200;
            } else {
                pl.takeDamage();
            }
        }

        // Caduta nel vuoto → perde vita e riparte dall'inizio
        if (pl.y > GROUND_Y + 50) {
            pl.lives--;
            if (pl.lives <= 0) { this.state = STATE.GAMEOVER; return; }
            this._loadLevel(this.lvIdx);
            return;
        }

        // Pennone reached
        if (pl.x + pl.w >= lv.data.flagX - 8) {
            this.score += 500;
            if (this.lvIdx + 1 < LEVELS.length) {
                this._loadLevel(this.lvIdx + 1);
            } else {
                this.state = STATE.WIN;
            }
        }
    }

    // ── Draw ──────────────────────────────────────────────────────────────────

    _draw() {
        const { ctx, canvas } = this.engine;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if      (this.state === STATE.START)    this._drawStart(ctx, canvas);
        else if (this.state === STATE.PLAYING)  this._drawPlay(ctx, canvas);
        else if (this.state === STATE.GAMEOVER) this._drawOver(ctx, canvas);
        else                                    this._drawWin(ctx, canvas);
    }

    _drawPlay(ctx, canvas) {
        const lv  = this.level;
        const cam = this.camera;
        const cW  = canvas.width;
        const cH  = canvas.height;

        // 1. Background in screen space
        lv.drawBg(ctx, cam.x, cW, cH);

        // 2. World space
        ctx.save();
        cam.apply(ctx);

        lv.drawGround(ctx, cam.x, cW, cH);
        lv.drawPlatforms(ctx);
        lv.drawObjects(ctx);
        this.player.draw(ctx);

        ctx.restore();

        // 3. HUD + mobile controls (screen space)
        this._drawHUD(ctx, canvas);
        if (controls.isMobile) controls.drawUI(ctx);
    }

    _drawHUD(ctx, canvas) {
        ctx.save();
        ctx.resetTransform();

        // Strip
        ctx.fillStyle = 'rgba(0,0,0,0.42)';
        ctx.fillRect(0, 0, canvas.width, 44);

        // Left: graffa icon + score
        drawGraffa(ctx, 26, 22);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(String(this.score).padStart(5, '0'), 52, 22);

        // Centre: level label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center';
        ctx.fillText(`LIVELLO ${this.lvIdx + 1}  —  ${this.level.data.name}`, canvas.width / 2, 22);

        // Right: bottiglietta × lives
        for (let i = 0; i < this.player.lives; i++) {
            drawBottiglietta(ctx, canvas.width - 22 - i * 26, 4);
        }

        ctx.restore();
    }

    // ── Screens ───────────────────────────────────────────────────────────────

    _drawStart(ctx, canvas) {
        const cW = canvas.width, cH = canvas.height;
        const g = ctx.createLinearGradient(0, 0, 0, cH);
        g.addColorStop(0, '#0D47A1'); g.addColorStop(1, '#42A5F5');
        ctx.fillStyle = g; ctx.fillRect(0, 0, cW, cH);

        // Decorative clouds
        this._cloud(ctx, cW * 0.12, cH * 0.1, 55);
        this._cloud(ctx, cW * 0.78, cH * 0.08, 70);

        ctx.save();
        ctx.shadowColor = '#000'; ctx.shadowBlur = 12;
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('CASTELLAMMARE', cW / 2, cH / 2 - 75);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 30px Arial';
        ctx.fillText('ADVENTURE', cW / 2, cH / 2 - 30);
        ctx.restore();

        drawProtagonista(ctx, cW / 2 - 17, cH / 2 + 5, false, 0);

        this._btn(ctx, cW / 2 - 80, cH / 2 + 50, 160, 50, 'INIZIA');

        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText('Frecce + Spazio  |  Joystick touch', cW / 2, cH - 12);
    }

    _drawOver(ctx, canvas) {
        const cW = canvas.width, cH = canvas.height;
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.fillRect(0, 0, cW, cH);

        ctx.save();
        ctx.shadowColor = '#e74c3c'; ctx.shadowBlur = 14;
        ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', cW / 2, cH / 2 - 55);
        ctx.restore();

        ctx.fillStyle = '#FFD700'; ctx.font = '22px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(`Punti: ${this.score}`, cW / 2, cH / 2);

        this._btn(ctx, cW / 2 - 80, cH / 2 + 55, 160, 50, 'RIGIOCA');
    }

    _drawWin(ctx, canvas) {
        const cW = canvas.width, cH = canvas.height;
        const g = ctx.createLinearGradient(0, 0, 0, cH);
        g.addColorStop(0, '#1A3A8F'); g.addColorStop(1, '#FFD700');
        ctx.fillStyle = g; ctx.fillRect(0, 0, cW, cH);

        ctx.save();
        ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 16;
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 44px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('HAI VINTO!', cW / 2, cH / 2 - 80);
        ctx.restore();

        ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('Forza Juve Stabia!', cW / 2, cH / 2 - 38);

        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 26px Arial';
        ctx.fillText(`Punteggio: ${this.score}`, cW / 2, cH / 2 + 6);

        this._btn(ctx, cW / 2 - 80, cH / 2 + 55, 160, 50, 'RIGIOCA');
    }

    // ── UI helpers ────────────────────────────────────────────────────────────

    _btn(ctx, x, y, w, h, label) {
        const r = 10;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#1A3A8F'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.fillStyle = '#1A3A8F'; ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(label, x + w / 2, y + h / 2);
        ctx.restore();
    }

    _cloud(ctx, cx, cy, r) {
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.arc(cx,           cy,           r * 0.55, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.5, cy + r * 0.1, r * 0.45, 0, Math.PI * 2);
        ctx.arc(cx - r * 0.4, cy + r * 0.1, r * 0.38, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ── Boot ──────────────────────────────────────────────────────────────────────

const gm = new GameManager();
gm.start();
