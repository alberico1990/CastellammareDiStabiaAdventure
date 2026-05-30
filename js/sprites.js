'use strict';

// ── Helpers ───────────────────────────────────────────────────────────────────

function _rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath(); ctx.fill();
}

// ── Spritesheet Protagonista ──────────────────────────────────────────────────
// 6 frame × 80px = 480px totali, altezza 130px
// 0=idle  1=walk1  2=walk2  3=walk3  4=run  5=jump

const _SPRITE = {
    img:   null,
    ready: false,
    FW: 80, FH: 130,
    FRAMES: { idle:0, walk1:1, walk2:2, walk3:3 }
};

(function _loadSprite() {
    _SPRITE.img = new Image();
    _SPRITE.img.onload = () => { _SPRITE.ready = true; };
    _SPRITE.img.src = 'assets/alberico_sprite.png';
})();

function drawProtagonista(ctx, x, y, facingLeft, frame, isJumping, walkFrame) {
    // Scegli frame
    let fi;
    if (isJumping) {
        fi = 1; // usa walk1 come jump (no frame dedicato)
    } else if (frame === 0) {
        fi = 0; // idle
    } else {
        fi = (walkFrame % 3) + 1; // walk1,walk2,walk3
    }

    const DW = 56, DH = 88;

    ctx.save();

    // Ombra ellittica sul suolo
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x + 17, y + DH + 1, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (_SPRITE.ready) {
        // sx+1 e sw-2 evitano il bleeding dai frame adiacenti nello sheet
        const sx = fi * _SPRITE.FW + 1;
        const sw = _SPRITE.FW - 2;
        if (facingLeft) {
            ctx.translate(x + DW - 11, y);
            ctx.scale(-1, 1);
            ctx.drawImage(_SPRITE.img, sx, 0, sw, _SPRITE.FH, 0, 0, DW, DH);
        } else {
            ctx.drawImage(_SPRITE.img, sx, 0, sw, _SPRITE.FH, x - 11, y, DW, DH);
        }
    } else {
        _fallbackVettoriale(ctx, x, y, facingLeft, frame);
    }

    ctx.restore();
}

// ── Fallback vettoriale ───────────────────────────────────────────────────────

function _leg(ctx, hx, hy, angle) {
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(angle);
    ctx.fillStyle = '#1A3A8F'; _rrect(ctx, -5, 0, 10, 10, 2);
    ctx.fillStyle = '#FFD700'; _rrect(ctx, -4, 10, 9, 10, 2);
    ctx.fillStyle = '#111';    _rrect(ctx, -5, 20, 13, 6, 2);
    ctx.restore();
}
function _arm(ctx, sx, sy, angle) {
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(angle);
    ctx.fillStyle = '#FFD700'; _rrect(ctx, -3, 0, 7, 13, 2);
    ctx.fillStyle = '#F5C5A3'; _rrect(ctx, -3, 12, 6, 9, 2);
    ctx.restore();
}
function _fallbackVettoriale(ctx, x, y, facingLeft, frame) {
    ctx.save();
    ctx.translate(x + 17, y);
    if (facingLeft) ctx.scale(-1, 1);
    const sw = frame === 0 ? 0.38 : -0.38;
    _leg(ctx, -5, 52, -sw); _arm(ctx, -12, 20, sw * 0.65);
    ctx.fillStyle = '#1A3A8F'; _rrect(ctx, -12, 48, 24, 11, 2);
    ctx.fillStyle = '#FFD700'; _rrect(ctx, -13, 18, 26, 32, 3);
    ctx.fillStyle = '#1A3A8F'; ctx.fillRect(-3, 18, 6, 32);
    _arm(ctx, 12, 20, -sw * 0.65); _leg(ctx, 5, 52, sw);
    ctx.fillStyle = '#1a0f00'; ctx.beginPath(); ctx.ellipse(0, 9, 12, 10, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#F5C5A3'; ctx.beginPath(); ctx.ellipse(0, 12, 10.5, 11, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
}

// ── drawGraffa ────────────────────────────────────────────────────────────────

function drawGraffa(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.28, 0.28);
    ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 18;
    const bx = 0, by = 0, bodyColor = '#D4820A', borderColor = '#7A4A08', thickness = 45;
    const drawPath = () => {
        ctx.beginPath();
        ctx.moveTo(bx-40, by-80);
        ctx.bezierCurveTo(bx+10,by-20, bx+90,by+80, bx,by+80);
        ctx.bezierCurveTo(bx-90,by+80, bx-10,by-20, bx+40,by-80);
    };
    ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.strokeStyle=borderColor; ctx.lineWidth=thickness+4; drawPath(); ctx.stroke();
    ctx.strokeStyle=bodyColor;   ctx.lineWidth=thickness;   drawPath(); ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,0.85)';
    ctx.save(); ctx.lineWidth=thickness; drawPath(); ctx.clip();
    for(let i=0;i<300;i++){const sx=bx-100+Math.random()*200,sy=by-100+Math.random()*200;ctx.beginPath();ctx.arc(sx,sy,Math.random()*2.5,0,Math.PI*2);ctx.fill();}
    ctx.restore(); ctx.restore();
}

// ── drawBottiglietta ──────────────────────────────────────────────────────────

function drawBottiglietta(ctx, x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.shadowColor='#5BB8F5'; ctx.shadowBlur=10;
    ctx.fillStyle='#5BB8F5';
    ctx.beginPath(); ctx.moveTo(-6,8); ctx.bezierCurveTo(-8,12,-10,16,-9,28); ctx.lineTo(9,28); ctx.bezierCurveTo(10,16,8,12,6,8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#3A8CC4'; ctx.lineWidth=1; ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle='#5BB8F5'; ctx.fillRect(-5,2,10,8);
    ctx.strokeStyle='#3A8CC4'; ctx.strokeRect(-5,2,10,8);
    ctx.fillStyle='#fff'; _rrect(ctx,-5,0,10,4,2);
    ctx.fillStyle='#fff'; _rrect(ctx,-8,12,16,12,2);
    ctx.fillStyle='#1A3A8F'; ctx.font='bold 3px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('Acqua della',0,16); ctx.fillText('Madonna',0,20);
    ctx.strokeStyle='#1A3A8F'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,22); ctx.lineTo(0,27); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2.5,24); ctx.lineTo(2.5,24); ctx.stroke();
    ctx.restore();
}

// ── drawGabbiano ──────────────────────────────────────────────────────────────

function drawGabbiano(ctx, x, y, frame) {
    ctx.save(); ctx.translate(x, y);
    const wa = frame===0 ? -0.30 : 0.22;
    function wing(sign) {
        ctx.save(); ctx.translate(sign*12,0); ctx.rotate(sign*wa);
        ctx.fillStyle='#ddd'; ctx.beginPath(); ctx.moveTo(0,0); ctx.bezierCurveTo(sign*8,-3,sign*18,-2,sign*22,2); ctx.bezierCurveTo(sign*16,4,sign*6,3,0,2); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#888'; ctx.beginPath(); ctx.moveTo(sign*22,2); ctx.bezierCurveTo(sign*20,-2,sign*16,-2,sign*14,0); ctx.bezierCurveTo(sign*16,3,sign*19,5,sign*22,2); ctx.fill();
        ctx.restore();
    }
    wing(-1);
    ctx.fillStyle='#eee'; ctx.beginPath(); ctx.ellipse(0,0,12,7,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ddd'; ctx.beginPath(); ctx.moveTo(-4,4); ctx.lineTo(4,4); ctx.lineTo(0,11); ctx.closePath(); ctx.fill();
    wing(1);
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.ellipse(10,-4,7,6,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(13,-5,1.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#F4B942'; ctx.beginPath(); ctx.moveTo(16,-3); ctx.lineTo(22,-4); ctx.lineTo(16,-1); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#c0392b'; ctx.beginPath(); ctx.arc(19,-2.5,1,0,Math.PI*2); ctx.fill();
    ctx.restore();
}

// ── drawTurista ───────────────────────────────────────────────────────────────

function drawTurista(ctx, x, y, frame) {
    ctx.save(); ctx.translate(x+14, y);
    const sw = frame===0 ? 0.32 : -0.32;
    function tLeg(hx,angle){ctx.save();ctx.translate(hx,48);ctx.rotate(angle);ctx.fillStyle='#1A6B1A';_rrect(ctx,-5,0,10,10,2);ctx.fillStyle='#F5C5A3';_rrect(ctx,-4,10,8,8,2);ctx.fillStyle='#5c4a3a';_rrect(ctx,-5,17,12,5,2);ctx.restore();}
    function tArm(sx,angle){ctx.save();ctx.translate(sx,20);ctx.rotate(angle);ctx.fillStyle='#1A6B1A';_rrect(ctx,-3,0,7,12,2);ctx.fillStyle='#F5C5A3';_rrect(ctx,-3,11,6,9,2);ctx.restore();}
    tLeg(-5,-sw); tArm(-12,sw*0.65);
    ctx.fillStyle='#1A6B1A'; _rrect(ctx,-13,18,26,30,3);
    ctx.fillStyle='#2A8B2A'; for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-6+i*6,28,3,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#333'; _rrect(ctx,5,30,11,8,1);
    ctx.fillStyle='#1a6080'; ctx.beginPath(); ctx.arc(10,34,2.5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#1A6B1A'; _rrect(ctx,-12,46,24,10,2);
    tArm(12,-sw*0.65); tLeg(5,sw);
    ctx.fillStyle='#F5C5A3'; ctx.beginPath(); ctx.ellipse(0,10,10,11,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#1a1a1a'; _rrect(ctx,-9,7,7,5,2); _rrect(ctx,2,7,7,5,2);
    ctx.fillStyle='#D4A847'; ctx.beginPath(); ctx.ellipse(0,1,18,5,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#D4A847'; _rrect(ctx,-10,-11,20,13,4);
    ctx.fillStyle='#A07830'; ctx.fillRect(-10,-1,20,3);
    ctx.restore();
}

// ── drawLucertola ─────────────────────────────────────────────────────────────

function drawLucertola(ctx, x, y, frame) {
    ctx.save(); ctx.translate(x, y);
    const lo = frame===0 ? 3 : -3;
    ctx.fillStyle='#5A8A2A'; ctx.beginPath(); ctx.moveTo(-10,0); ctx.bezierCurveTo(-18,-2,-26,1,-32,-1); ctx.bezierCurveTo(-28,3,-18,4,-10,2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#5A8A2A'; ctx.lineWidth=3; ctx.lineCap='round';
    [[-6,5,lo],[-6,-5,-lo],[5,5,lo],[5,-5,-lo]].forEach(([bx,by,off])=>{ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+off,by>0?11:-11);ctx.stroke();ctx.beginPath();ctx.moveTo(bx+off,by>0?11:-11);ctx.lineTo(bx+off+4,by>0?9:-9);ctx.stroke();});
    ctx.fillStyle='#6AAB35'; ctx.beginPath(); ctx.ellipse(0,0,13,6,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#B8D87A'; ctx.beginPath(); ctx.ellipse(1,1,9,4,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#6AAB35'; ctx.beginPath(); ctx.ellipse(16,0,8,5,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#5A8A2A'; ctx.beginPath(); ctx.ellipse(23,0,4,3,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.arc(17,-2,2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#111'; ctx.beginPath(); ctx.arc(17.5,-2,1,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#e74c3c'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(26,0); ctx.lineTo(30,-2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(26,0); ctx.lineTo(30,2); ctx.stroke();
    ctx.restore();
}

// ── drawPennone ───────────────────────────────────────────────────────────────

function drawPennone(ctx, x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.shadowColor='#FFD700'; ctx.shadowBlur=15;
    const H=85;
    ctx.fillStyle='#aaa'; ctx.fillRect(-3,-H,6,H);
    ctx.fillStyle='#ccc'; ctx.fillRect(-1,-H,2,H);
    ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.arc(0,-H,5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#cc9900'; ctx.lineWidth=1; ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.moveTo(3,-H+6); ctx.lineTo(34,-H+12); ctx.lineTo(34,-H+32); ctx.lineTo(3,-H+38); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#1A3A8F'; ctx.beginPath(); ctx.moveTo(16,-H+9); ctx.lineTo(22,-H+11); ctx.lineTo(22,-H+33); ctx.lineTo(16,-H+35); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#cc9900'; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(3,-H+6); ctx.lineTo(34,-H+12); ctx.lineTo(34,-H+32); ctx.lineTo(3,-H+38); ctx.closePath(); ctx.stroke();
    ctx.restore();
}

// ── drawMoto ──────────────────────────────────────────────────────────────────

function drawMoto(ctx, x, y, frame) {
    ctx.save(); ctx.translate(x, y); ctx.scale(0.65, 0.65);
    const rot=frame===1?Math.PI/10:0, blue='#0D47A1', blueMid='#1565C0', blueHi='#42A5F5', skin='#f1b27a', jacket='#0a2a5e';
    function wheel(wx,wy,r){ctx.save();ctx.translate(wx,wy);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fillStyle='#111';ctx.fill();ctx.beginPath();ctx.arc(0,0,r-2,0,Math.PI*2);ctx.strokeStyle='#333';ctx.lineWidth=2;ctx.stroke();ctx.rotate(rot);ctx.strokeStyle='#aaa';ctx.lineWidth=1.2;for(let i=0;i<7;i++){const a=(Math.PI*2*i)/7;ctx.beginPath();ctx.moveTo(Math.cos(a)*3,Math.sin(a)*3);ctx.lineTo(Math.cos(a)*(r-5),Math.sin(a)*(r-5));ctx.stroke();}ctx.fillStyle='#888';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();ctx.restore();}
    ctx.strokeStyle='#777';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-18,-8);ctx.bezierCurveTo(-30,-6,-44,-4,-50,-8);ctx.stroke();
    wheel(-35,0,18); wheel(38,0,18);
    ctx.strokeStyle='#999';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(28,-14);ctx.lineTo(40,-40);ctx.stroke();ctx.beginPath();ctx.moveTo(33,-14);ctx.lineTo(44,-40);ctx.stroke();
    ctx.strokeStyle='#333';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-20,-32);ctx.lineTo(0,-38);ctx.lineTo(28,-34);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-38);ctx.lineTo(2,-20);ctx.lineTo(-20,-16);ctx.lineTo(-20,-32);ctx.stroke();ctx.beginPath();ctx.moveTo(2,-20);ctx.lineTo(28,-18);ctx.lineTo(28,-34);ctx.stroke();
    ctx.fillStyle='#2a2a2a';ctx.beginPath();ctx.moveTo(-16,-14);ctx.lineTo(24,-14);ctx.lineTo(24,-28);ctx.lineTo(-16,-28);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(-48,-12);ctx.bezierCurveTo(-50,-20,-42,-38,-20,-40);ctx.lineTo(-4,-36);ctx.bezierCurveTo(-8,-20,-14,-14,-18,-10);ctx.closePath();ctx.fillStyle=blue;ctx.fill();
    ctx.beginPath();ctx.moveTo(16,-20);ctx.bezierCurveTo(14,-32,20,-46,36,-52);ctx.bezierCurveTo(46,-54,52,-46,50,-34);ctx.bezierCurveTo(48,-24,42,-18,36,-16);ctx.bezierCurveTo(30,-14,20,-16,16,-20);ctx.closePath();ctx.fillStyle=blueMid;ctx.fill();
    ctx.beginPath();ctx.ellipse(50,-38,6,5,0.3,0,Math.PI*2);ctx.fillStyle='#FFFDE0';ctx.fill();
    ctx.beginPath();ctx.moveTo(-22,-40);ctx.bezierCurveTo(-14,-48,10,-48,18,-40);ctx.bezierCurveTo(10,-36,-14,-36,-22,-40);ctx.closePath();ctx.fillStyle='#111';ctx.fill();
    ctx.fillStyle='#ff1111';ctx.beginPath();ctx.ellipse(-48,-28,4,3,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.fillRect(-50,-22,14,8);ctx.fillStyle='#1A3A8F';ctx.font='bold 4px Arial';ctx.textAlign='center';ctx.fillText('NA 321',-43,-16);
    ctx.fillStyle='#090909';ctx.fillRect(10,-18,12,5);ctx.fillRect(-36,-16,10,5);
    ctx.strokeStyle='#1a1a1a';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-2,-38);ctx.lineTo(10,-26);ctx.lineTo(20,-18);ctx.stroke();ctx.beginPath();ctx.moveTo(-12,-38);ctx.lineTo(-24,-24);ctx.lineTo(-32,-16);ctx.stroke();
    ctx.fillStyle=jacket;ctx.beginPath();ctx.moveTo(-20,-40);ctx.bezierCurveTo(-20,-64,12,-64,14,-40);ctx.closePath();ctx.fill();
    ctx.fillStyle=blue;ctx.fillRect(-18,-58,4,18);ctx.fillRect(8,-58,4,18);
    ctx.strokeStyle=jacket;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(8,-54);ctx.lineTo(24,-50);ctx.lineTo(36,-46);ctx.stroke();
    ctx.fillStyle=skin;ctx.fillRect(-4,-64,7,6);
    ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(0,-70,13,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=blue;ctx.beginPath();ctx.arc(0,-70,12,Math.PI*0.75,Math.PI*2.25);ctx.fill();
    ctx.beginPath();ctx.moveTo(-10,-63);ctx.bezierCurveTo(-6,-57,6,-57,10,-63);ctx.bezierCurveTo(6,-60,-6,-60,-10,-63);ctx.closePath();ctx.fillStyle='rgba(80,180,255,0.6)';ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,-70,12,Math.PI*1.1,Math.PI*1.9);ctx.fill();
    ctx.fillStyle=blue;ctx.beginPath();ctx.arc(0,-70,10,Math.PI*1.1,Math.PI*1.9);ctx.fill();
    ctx.strokeStyle='#000';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,-70,12,0,Math.PI*2);ctx.stroke();
    ctx.restore();
}
