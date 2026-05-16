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

function _leg(ctx, hx, hy, angle) {
    ctx.save();
    ctx.translate(hx, hy); ctx.rotate(angle);
    ctx.fillStyle = '#1A3A8F'; _rrect(ctx, -5,  0, 10, 10, 2);
    ctx.fillStyle = '#FFD700'; _rrect(ctx, -4, 10,  9, 10, 2);
    ctx.fillStyle = '#111111'; _rrect(ctx, -5, 20, 13,  6, 2);
    ctx.restore();
}

function _arm(ctx, sx, sy, angle) {
    ctx.save();
    ctx.translate(sx, sy); ctx.rotate(angle);
    ctx.fillStyle = '#FFD700'; _rrect(ctx, -3,  0, 7, 13, 2);
    ctx.fillStyle = '#F5C5A3'; _rrect(ctx, -3, 12, 6,  9, 2);
    ctx.restore();
}

// ── drawProtagonista ──────────────────────────────────────────────────────────
// Bounding box: 34 × 78 px. (x,y) = top-left corner.
// frame: 0 o 1 → gambe alternate in camminata.

function drawProtagonista(ctx, x, y, facingLeft, frame) {
    ctx.save();
    ctx.translate(x + 17, y);
    if (facingLeft) ctx.scale(-1, 1);

    const sw = frame === 0 ? 0.38 : -0.38;

    // back leg & arm
    _leg(ctx, -5, 52, -sw);
    _arm(ctx, -12, 20,  sw * 0.65);

    // pantaloncini
    ctx.fillStyle = '#1A3A8F'; _rrect(ctx, -12, 48, 24, 11, 2);

    // maglia gialla
    ctx.fillStyle = '#FFD700'; _rrect(ctx, -13, 18, 26, 32, 3);

    // fascia blu verticale centrale
    ctx.fillStyle = '#1A3A8F'; ctx.fillRect(-3, 18, 6, 32);

    // colletto a V
    ctx.fillStyle = '#1A3A8F';
    ctx.beginPath(); ctx.moveTo(-5, 18); ctx.lineTo(5, 18); ctx.lineTo(0, 24);
    ctx.closePath(); ctx.fill();

    // numero 10 — sempre leggibile (annulla il flip se presente)
    ctx.save();
    if (facingLeft) ctx.scale(-1, 1);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 8px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('10', 8, 35);
    ctx.restore();

    // front arm & leg
    _arm(ctx,  12, 20, -sw * 0.65);
    _leg(ctx,   5, 52,  sw);

    // testa: capelli
    ctx.fillStyle = '#1a0f00';
    ctx.beginPath(); ctx.ellipse(0, 9, 12, 10, 0, 0, Math.PI * 2); ctx.fill();
    // viso
    ctx.fillStyle = '#F5C5A3';
    ctx.beginPath(); ctx.ellipse(0, 12, 10.5, 11, 0, 0, Math.PI * 2); ctx.fill();
    // orecchio
    ctx.fillStyle = '#E8A882';
    ctx.beginPath(); ctx.ellipse(-10, 13, 2.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    // bianco occhio
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(4, 10, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    // pupilla
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(5, 10, 1.4, 0, Math.PI * 2); ctx.fill();
    // sopracciglio
    ctx.strokeStyle = '#1a0f00'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(2, 7); ctx.lineTo(7, 6); ctx.stroke();
    // naso
    ctx.fillStyle = '#D4906A';
    ctx.beginPath(); ctx.arc(3, 14, 1.2, 0, Math.PI * 2); ctx.fill();
    // bocca
    ctx.strokeStyle = '#A0522D'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(2, 17, 3, 0.15, Math.PI - 0.15); ctx.stroke();

    ctx.restore();
}

// ── drawGraffa ────────────────────────────────────────────────────────────────
// Graffa napoletana: arco a ferro di cavallo con due code che si incrociano.
// Centro visivo circa a (x, y).

function drawGraffa(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.28, 0.28);

    const bx = 0, by = 0;
    const bodyColor = '#D4820A';
    const borderColor = '#7A4A08';
    const thickness = 45;

    const drawPath = () => {
        ctx.beginPath();
        ctx.moveTo(bx - 40, by - 80);
        ctx.bezierCurveTo(bx + 10, by - 20, bx + 90, by + 80, bx, by + 80);
        ctx.bezierCurveTo(bx - 90, by + 80, bx - 10, by - 20, bx + 40, by - 80);
    };

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = thickness + 4;
    drawPath(); ctx.stroke();

    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = thickness;
    drawPath(); ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.save();
    ctx.lineWidth = thickness;
    drawPath();
    ctx.clip();
    for (let i = 0; i < 300; i++) {
        const sx = bx - 100 + Math.random() * 200;
        const sy = by - 100 + Math.random() * 200;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.random() * 2.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
    ctx.restore();
}


// ── drawBottiglietta ──────────────────────────────────────────────────────────
// Bottiglia "Acqua della Madonna". (x,y) = centro-cima.

function drawBottiglietta(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // corpo bottiglia
    ctx.fillStyle = '#5BB8F5';
    ctx.beginPath();
    ctx.moveTo(-6, 8);
    ctx.bezierCurveTo(-8, 12, -10, 16, -9, 28);
    ctx.lineTo(9, 28);
    ctx.bezierCurveTo(10, 16, 8, 12, 6, 8);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3A8CC4'; ctx.lineWidth = 1; ctx.stroke();

    // collo
    ctx.fillStyle = '#5BB8F5'; ctx.fillRect(-5, 2, 10, 8);
    ctx.strokeStyle = '#3A8CC4'; ctx.lineWidth = 1; ctx.strokeRect(-5, 2, 10, 8);

    // tappo bianco
    ctx.fillStyle = '#fff'; _rrect(ctx, -5, 0, 10, 4, 2);

    // etichetta
    ctx.fillStyle = '#fff'; _rrect(ctx, -8, 12, 16, 12, 2);
    ctx.fillStyle = '#1A3A8F';
    ctx.font = 'bold 3px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Acqua della', 0, 16);
    ctx.fillText('Madonna',     0, 20);

    // croce
    ctx.strokeStyle = '#1A3A8F'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, 27); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2.5, 24); ctx.lineTo(2.5, 24); ctx.stroke();

    ctx.restore();
}

// ── drawGabbiano ──────────────────────────────────────────────────────────────
// Gabbiano in volo. (x,y) = centro del corpo.
// frame 0 → ali su, frame 1 → ali giù.

function drawGabbiano(ctx, x, y, frame) {
    ctx.save();
    ctx.translate(x, y);

    const wa = frame === 0 ? -0.30 : 0.22;

    function wing(sign) {
        ctx.save();
        ctx.translate(sign * 12, 0);
        ctx.rotate(sign * wa);
        ctx.fillStyle = '#ddd';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(sign * 8,  -3, sign * 18, -2, sign * 22,  2);
        ctx.bezierCurveTo(sign * 16,  4, sign *  6,  3, 0,           2);
        ctx.closePath(); ctx.fill();
        // punta alare grigia
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.moveTo(sign * 22, 2);
        ctx.bezierCurveTo(sign * 20, -2, sign * 16, -2, sign * 14, 0);
        ctx.bezierCurveTo(sign * 16,  3, sign * 19,  5, sign * 22, 2);
        ctx.fill();
        ctx.restore();
    }

    wing(-1);  // ala sinistra (dietro)

    // corpo
    ctx.fillStyle = '#eee';
    ctx.beginPath(); ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2); ctx.fill();
    // coda
    ctx.fillStyle = '#ddd';
    ctx.beginPath(); ctx.moveTo(-4, 4); ctx.lineTo(4, 4); ctx.lineTo(0, 11);
    ctx.closePath(); ctx.fill();

    wing(1);   // ala destra (davanti)

    // testa
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(10, -4, 7, 6, 0, 0, Math.PI * 2); ctx.fill();
    // occhio
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(13, -5, 1.2, 0, Math.PI * 2); ctx.fill();
    // becco giallo
    ctx.fillStyle = '#F4B942';
    ctx.beginPath(); ctx.moveTo(16, -3); ctx.lineTo(22, -4); ctx.lineTo(16, -1);
    ctx.closePath(); ctx.fill();
    // macchia rossa sul becco
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.arc(19, -2.5, 1, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
}

// ── drawTurista ───────────────────────────────────────────────────────────────
// Turista con cappello di paglia, occhiali da sole, macchina fotografica.
// (x,y) = top-left. Bounding box ≈ 28 × 65 px.

function drawTurista(ctx, x, y, frame) {
    ctx.save();
    ctx.translate(x + 14, y);

    const sw = frame === 0 ? 0.32 : -0.32;

    function tLeg(hx, angle) {
        ctx.save(); ctx.translate(hx, 48); ctx.rotate(angle);
        ctx.fillStyle = '#1A6B1A'; _rrect(ctx, -5,  0, 10, 10, 2);
        ctx.fillStyle = '#F5C5A3'; _rrect(ctx, -4, 10,  8,  8, 2);
        ctx.fillStyle = '#5c4a3a'; _rrect(ctx, -5, 17, 12,  5, 2);
        ctx.restore();
    }
    function tArm(sx, angle) {
        ctx.save(); ctx.translate(sx, 20); ctx.rotate(angle);
        ctx.fillStyle = '#1A6B1A'; _rrect(ctx, -3,  0, 7, 12, 2);
        ctx.fillStyle = '#F5C5A3'; _rrect(ctx, -3, 11, 6,  9, 2);
        ctx.restore();
    }

    tLeg(-5, -sw);
    tArm(-12,  sw * 0.65);

    // camicia hawaiana arancione
    ctx.fillStyle = '#1A6B1A'; _rrect(ctx, -13, 18, 26, 30, 3);
    ctx.fillStyle = '#2A8B2A';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(-6 + i * 6, 28, 3, 0, Math.PI * 2); ctx.fill();
    }

    // macchina fotografica
    ctx.fillStyle = '#333'; _rrect(ctx, 5, 30, 11, 8, 1);
    ctx.fillStyle = '#1a6080';
    ctx.beginPath(); ctx.arc(10, 34, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#444'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(5, 30); ctx.bezierCurveTo(-2, 26, -5, 22, -3, 20); ctx.stroke();

    // pantaloncini kaki
    ctx.fillStyle = '#1A6B1A'; _rrect(ctx, -12, 46, 24, 10, 2);

    tArm(12, -sw * 0.65);
    tLeg( 5,  sw);

    // viso
    ctx.fillStyle = '#F5C5A3';
    ctx.beginPath(); ctx.ellipse(0, 10, 10, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E8A882';
    ctx.beginPath(); ctx.ellipse(-9, 12, 2.5, 3, 0, 0, Math.PI * 2); ctx.fill();

    // occhiali da sole
    ctx.fillStyle = '#1a1a1a';
    _rrect(ctx, -9, 7, 7, 5, 2); _rrect(ctx, 2, 7, 7, 5, 2);
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-2, 9.5); ctx.lineTo(2, 9.5); ctx.stroke();
    ctx.strokeStyle = '#555'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-9, 9.5); ctx.lineTo(-13, 9.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( 9, 9.5); ctx.lineTo( 13, 9.5); ctx.stroke();

    // bocca
    ctx.strokeStyle = '#A0522D'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, 16, 3, 0.2, Math.PI - 0.2); ctx.stroke();

    // cappello di paglia
    ctx.fillStyle = '#D4A847';
    ctx.beginPath(); ctx.ellipse(0, 1, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#A07830'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#D4A847'; _rrect(ctx, -10, -11, 20, 13, 4);
    ctx.fillStyle = '#A07830'; ctx.fillRect(-10, -1, 20, 3);

    ctx.restore();
}

// ── drawLucertola ─────────────────────────────────────────────────────────────
// Vista laterale. (x,y) = centro del corpo.
// frame 0 o 1 → animazione zampe.

function drawLucertola(ctx, x, y, frame) {
    ctx.save();
    ctx.translate(x, y);

    const lo = frame === 0 ? 3 : -3;

    // coda
    ctx.fillStyle = '#5A8A2A';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.bezierCurveTo(-18, -2, -26, 1, -32, -1);
    ctx.bezierCurveTo(-28,  3, -18, 4, -10,  2);
    ctx.closePath(); ctx.fill();

    // zampe (linee spesse)
    ctx.strokeStyle = '#5A8A2A'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    [[-6, 5, lo], [-6, -5, -lo], [5, 5, lo], [5, -5, -lo]].forEach(([bx, by, off]) => {
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + off, by > 0 ? 11 : -11);
        ctx.stroke();
        // piedino
        ctx.beginPath();
        ctx.moveTo(bx + off, by > 0 ? 11 : -11);
        ctx.lineTo(bx + off + (by > 0 ? 4 : 4), by > 0 ? 9 : -9);
        ctx.stroke();
    });

    // corpo verde
    ctx.fillStyle = '#6AAB35';
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 6, 0, 0, Math.PI * 2); ctx.fill();
    // pancia chiara
    ctx.fillStyle = '#B8D87A';
    ctx.beginPath(); ctx.ellipse(1, 1, 9, 4, 0, 0, Math.PI * 2); ctx.fill();

    // testa
    ctx.fillStyle = '#6AAB35';
    ctx.beginPath(); ctx.ellipse(16, 0, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
    // muso
    ctx.fillStyle = '#5A8A2A';
    ctx.beginPath(); ctx.ellipse(23, 0, 4, 3, 0, 0, Math.PI * 2); ctx.fill();

    // occhio giallo
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.arc(17, -2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(17.5, -2, 1, 0, Math.PI * 2); ctx.fill();

    // lingua biforcuta
    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(30, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(30,  2); ctx.stroke();

    ctx.restore();
}

// ── drawPennone ───────────────────────────────────────────────────────────────
// (x,y) = base del palo (piede).

function drawPennone(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    const H = 85;

    // palo metallico
    ctx.fillStyle = '#aaa'; ctx.fillRect(-3, -H, 6, H);
    ctx.fillStyle = '#ccc'; ctx.fillRect(-1, -H, 2, H);

    // sfera in cima
    ctx.fillStyle = '#FFD700';
    ctx.beginPath(); ctx.arc(0, -H, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#cc9900'; ctx.lineWidth = 1; ctx.stroke();

    // bandiera gialla (Juve Stabia)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo( 3, -H +  6); ctx.lineTo(34, -H + 12);
    ctx.lineTo(34, -H + 32); ctx.lineTo( 3, -H + 38);
    ctx.closePath(); ctx.fill();

    // striscia blu verticale sulla bandiera
    ctx.fillStyle = '#1A3A8F';
    ctx.beginPath();
    ctx.moveTo(16, -H +  9); ctx.lineTo(22, -H + 11);
    ctx.lineTo(22, -H + 33); ctx.lineTo(16, -H + 35);
    ctx.closePath(); ctx.fill();

    // bordo bandiera
    ctx.strokeStyle = '#cc9900'; ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo( 3, -H +  6); ctx.lineTo(34, -H + 12);
    ctx.lineTo(34, -H + 32); ctx.lineTo( 3, -H + 38);
    ctx.closePath(); ctx.stroke();

    ctx.restore();
}

// ── drawMoto ──────────────────────────────────────────────────────────────────
// Moto sportiva blu con pilota. (x,y) = centro-basso (punto contatto ruote).

function drawMoto(ctx, x, y, frame) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.65, 0.65);

    const rot     = frame === 1 ? Math.PI / 10 : 0;
    const blue    = '#0D47A1';
    const blueMid = '#1565C0';
    const blueHi  = '#42A5F5';
    const skin    = '#f1b27a';
    const jacket  = '#0a2a5e';

    function wheel(wx, wy, r) {
        ctx.save(); ctx.translate(wx, wy);
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = '#111'; ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, r - 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, r - 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#666'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.rotate(rot);
        ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 7; i++) {
            const a = (Math.PI * 2 * i) / 7;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 3, Math.sin(a) * 3);
            ctx.lineTo(Math.cos(a) * (r - 5), Math.sin(a) * (r - 5));
            ctx.stroke();
        }
        ctx.fillStyle = '#888'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#444'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    // scarico
    ctx.strokeStyle = '#777'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-18, -8); ctx.bezierCurveTo(-30, -6, -44, -4, -50, -8); ctx.stroke();
    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-18, -8); ctx.bezierCurveTo(-30, -6, -44, -4, -50, -8); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-51, -8, 4, 5, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#666'; ctx.fill();

    wheel(-35, 0, 18);
    wheel(38, 0, 18);

    // forcella
    ctx.strokeStyle = '#999'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(28, -14); ctx.lineTo(40, -40); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(33, -14); ctx.lineTo(44, -40); ctx.stroke();
    // ammortizzatore
    ctx.strokeStyle = '#888'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-28, -10); ctx.lineTo(-20, -32); ctx.stroke();

    // telaio
    ctx.strokeStyle = '#333'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-20, -32); ctx.lineTo(0, -38); ctx.lineTo(28, -34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(2, -20); ctx.lineTo(-20, -16); ctx.lineTo(-20, -32); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, -20); ctx.lineTo(28, -18); ctx.lineTo(28, -34); ctx.stroke();

    // motore
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath(); ctx.moveTo(-16, -14); ctx.lineTo(24, -14); ctx.lineTo(24, -28); ctx.lineTo(-16, -28); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#444'; ctx.fillRect(-14, -26, 12, 10); ctx.fillRect(4, -26, 12, 10);

    // carena posteriore
    ctx.beginPath();
    ctx.moveTo(-48, -12); ctx.bezierCurveTo(-50, -20, -42, -38, -20, -40);
    ctx.lineTo(-4, -36); ctx.bezierCurveTo(-8, -20, -14, -14, -18, -10); ctx.closePath();
    ctx.fillStyle = blue; ctx.fill();
    ctx.strokeStyle = '#0a3080'; ctx.lineWidth = 1; ctx.stroke();

    // cupolino
    ctx.beginPath();
    ctx.moveTo(16, -20); ctx.bezierCurveTo(14, -32, 20, -46, 36, -52);
    ctx.bezierCurveTo(46, -54, 52, -46, 50, -34); ctx.bezierCurveTo(48, -24, 42, -18, 36, -16);
    ctx.bezierCurveTo(30, -14, 20, -16, 16, -20); ctx.closePath();
    ctx.fillStyle = blueMid; ctx.fill();
    ctx.strokeStyle = '#0a3080'; ctx.lineWidth = 1; ctx.stroke();
    // highlight cupolino
    ctx.beginPath(); ctx.moveTo(22, -26); ctx.bezierCurveTo(22, -38, 28, -48, 38, -50);
    ctx.bezierCurveTo(44, -48, 46, -40, 44, -32); ctx.bezierCurveTo(42, -24, 34, -22, 28, -24); ctx.closePath();
    ctx.fillStyle = blueHi; ctx.globalAlpha = 0.35; ctx.fill(); ctx.globalAlpha = 1;

    // faro
    ctx.beginPath(); ctx.ellipse(50, -38, 6, 5, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFDE0'; ctx.fill();
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; ctx.stroke();

    // sella
    ctx.beginPath(); ctx.moveTo(-22, -40); ctx.bezierCurveTo(-14, -48, 10, -48, 18, -40);
    ctx.bezierCurveTo(10, -36, -14, -36, -22, -40); ctx.closePath();
    ctx.fillStyle = '#111'; ctx.fill();

    // codone + luce posteriore
    ctx.beginPath(); ctx.moveTo(-20, -40); ctx.bezierCurveTo(-28, -42, -44, -36, -48, -28);
    ctx.lineTo(-42, -26); ctx.bezierCurveTo(-38, -32, -24, -36, -18, -36); ctx.closePath();
    ctx.fillStyle = blue; ctx.fill();
    ctx.fillStyle = '#ff1111'; ctx.beginPath(); ctx.ellipse(-48, -28, 4, 3, 0, 0, Math.PI * 2); ctx.fill();

    // targa
    ctx.fillStyle = '#fff'; ctx.fillRect(-50, -22, 14, 8);
    ctx.strokeStyle = '#bbb'; ctx.lineWidth = 0.5; ctx.strokeRect(-50, -22, 14, 8);
    ctx.fillStyle = '#1A3A8F'; ctx.font = 'bold 4px Arial'; ctx.textAlign = 'center';
    ctx.fillText('NA 321', -43, -16);

    // manubrio racing
    ctx.strokeStyle = '#888'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(18, -42); ctx.lineTo(28, -46); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(26, -46); ctx.lineTo(36, -44); ctx.stroke();

    // PILOTA — stivali
    ctx.fillStyle = '#090909'; ctx.fillRect(10, -18, 12, 5); ctx.fillRect(-36, -16, 10, 5);
    // gambe
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-2, -38); ctx.lineTo(10, -26); ctx.lineTo(20, -18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12, -38); ctx.lineTo(-24, -24); ctx.lineTo(-32, -16); ctx.stroke();
    // busto
    ctx.fillStyle = jacket;
    ctx.beginPath(); ctx.moveTo(-20, -40); ctx.bezierCurveTo(-20, -64, 12, -64, 14, -40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue; ctx.fillRect(-18, -58, 4, 18); ctx.fillRect(8, -58, 4, 18);
    // braccia
    ctx.strokeStyle = jacket; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(8, -54); ctx.lineTo(24, -50); ctx.lineTo(36, -46); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(36, -46, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6, -54); ctx.lineTo(6, -50); ctx.stroke();
    // collo
    ctx.fillStyle = skin; ctx.fillRect(-4, -64, 7, 6);
    // casco integrale
    ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(0, -70, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = blue; ctx.beginPath(); ctx.arc(0, -70, 12, Math.PI * 0.75, Math.PI * 2.25); ctx.fill();
    // visiera
    ctx.beginPath(); ctx.moveTo(-10, -63); ctx.bezierCurveTo(-6, -57, 6, -57, 10, -63);
    ctx.bezierCurveTo(6, -60, -6, -60, -10, -63); ctx.closePath();
    ctx.fillStyle = 'rgba(80,180,255,0.6)'; ctx.fill();
    ctx.strokeStyle = 'rgba(100,200,255,0.8)'; ctx.lineWidth = 0.8; ctx.stroke();
    // striscia bianca casco
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -70, 12, Math.PI * 1.1, Math.PI * 1.9); ctx.fill();
    ctx.fillStyle = blue;   ctx.beginPath(); ctx.arc(0, -70, 10, Math.PI * 1.1, Math.PI * 1.9); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, -70, 12, 0, Math.PI * 2); ctx.stroke();

    ctx.restore();
}
