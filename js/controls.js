'use strict';

const Keys = {
    ArrowLeft:  false,
    ArrowRight: false,
    Space:      false,
    KeyA:       false,
    KeyD:       false,
    KeyW:       false,
};

window.addEventListener('keydown', e => {
    if (e.code in Keys) { Keys[e.code] = true; e.preventDefault(); }
});
window.addEventListener('keyup', e => {
    if (e.code in Keys) { Keys[e.code] = false; }
});

class JoystickTouch {
    constructor() {
        this.joyId      = null;
        this.jmpId      = null;
        this.base       = { x: 0, y: 0 };
        this.stick      = { x: 0, y: 0 };
        this.joyActive  = false;
        this.jmpActive  = false;
        this.jmpFired   = false;

        this.JOY_R = 55;
        this.STK_R = 22;
        this.BTN_R = 42;

        const cvs = document.getElementById('gameCanvas');
        cvs.addEventListener('touchstart',  e => this._onStart(e), { passive: false });
        cvs.addEventListener('touchmove',   e => this._onMove(e),  { passive: false });
        cvs.addEventListener('touchend',    e => this._onEnd(e),   { passive: false });
        cvs.addEventListener('touchcancel', e => this._onEnd(e),   { passive: false });
    }

    _onStart(e) {
        e.preventDefault();
        const W = window.innerWidth;
        for (const t of e.changedTouches) {
            if (this.joyId === null && t.clientX < W / 2) {
                this.joyId    = t.identifier;
                this.joyActive = true;
                this.base.x   = t.clientX;
                this.base.y   = t.clientY;
                this.stick.x  = t.clientX;
                this.stick.y  = t.clientY;
            } else if (this.jmpId === null && t.clientX >= W / 2) {
                this.jmpId    = t.identifier;
                this.jmpActive = true;
                this.jmpFired  = true;
            }
        }
    }

    _onMove(e) {
        e.preventDefault();
        for (const t of e.changedTouches) {
            if (t.identifier !== this.joyId) continue;
            let dx = t.clientX - this.base.x;
            let dy = t.clientY - this.base.y;
            const d = Math.hypot(dx, dy);
            if (d > this.JOY_R) { dx = dx / d * this.JOY_R; dy = dy / d * this.JOY_R; }
            this.stick.x = this.base.x + dx;
            this.stick.y = this.base.y + dy;
        }
    }

    _onEnd(e) {
        e.preventDefault();
        for (const t of e.changedTouches) {
            if (t.identifier === this.joyId) {
                this.joyId    = null;
                this.joyActive = false;
                this.stick.x  = this.base.x;
                this.stick.y  = this.base.y;
            }
            if (t.identifier === this.jmpId) {
                this.jmpId    = null;
                this.jmpActive = false;
            }
        }
    }

    get dx() {
        return this.joyActive ? this.stick.x - this.base.x : 0;
    }

    draw(ctx) {
        if (!this.joyActive && this.joyId === null) {
            this.base.x = 90;
            this.base.y = window.innerHeight - 90;
            this.stick.x = this.base.x;
            this.stick.y = this.base.y;
        }

        const { base, stick, JOY_R, STK_R, BTN_R, joyActive, jmpActive } = this;

        ctx.save();
        ctx.resetTransform();

        // Base circle
        ctx.beginPath();
        ctx.arc(base.x, base.y, JOY_R, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.30)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Crosshairs
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(base.x - JOY_R + 8, base.y);
        ctx.lineTo(base.x + JOY_R - 8, base.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(base.x, base.y - JOY_R + 8);
        ctx.lineTo(base.x, base.y + JOY_R - 8);
        ctx.stroke();

        // Stick
        ctx.beginPath();
        ctx.arc(stick.x, stick.y, STK_R, 0, Math.PI * 2);
        ctx.fillStyle = joyActive ? 'rgba(255,215,0,0.75)' : 'rgba(255,215,0,0.35)';
        ctx.fill();
        ctx.strokeStyle = '#1A3A8F';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Jump button
        const bx = window.innerWidth - 80;
        const by = window.innerHeight - 90;
        ctx.beginPath();
        ctx.arc(bx, by, BTN_R, 0, Math.PI * 2);
        ctx.fillStyle = jmpActive ? 'rgba(255,215,0,0.75)' : 'rgba(255,215,0,0.30)';
        ctx.fill();
        ctx.strokeStyle = '#1A3A8F';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#1A3A8F';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SALTA', bx, by);
        ctx.textBaseline = 'alphabetic';

        ctx.restore();
    }
}

const joystick = new JoystickTouch();

const controls = {
    get left()  { return Keys.ArrowLeft  || Keys.KeyA || joystick.dx < -12; },
    get right() { return Keys.ArrowRight || Keys.KeyD || joystick.dx >  12; },
    get jump()  {
        const j = Keys.ArrowUp || Keys.Space || Keys.KeyW || joystick.jmpFired;
        if (joystick.jmpFired) joystick.jmpFired = false;
        return j;
    },
    drawUI(ctx) { joystick.draw(ctx); },
    isMobile: navigator.maxTouchPoints > 0,
};
