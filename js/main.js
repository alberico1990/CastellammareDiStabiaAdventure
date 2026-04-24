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

const _NDIM = { gabbiano: [44, 20], turista: [28, 65], lucertola: [50, 16] };

class Nemico extends GameObject {
    constructor(data) {
        const [w, h] = _NDIM[data.type] || [30, 30];
        const bx = (data.type === 'turista') ? data.x : data.x - w / 2;
        const by = (data.type === 'turista') ? data.y : data.y - h / 2;
        super(bx, by, w, h);
        this.type       = data.type;
        this.alive      = true;
        this.frame      = 0;
        this.frameTick  = 0;
        this.velX       = (data.type === 'gabbiano') ? 2.2 : 1.6;
        const patrol    = (data.type === 'gabbiano') ? 110 : 65;
        this.leftBound  = bx - patrol;
        this.rightBound = bx + patrol;
    }

    update(dt) {
        if (!this.alive) return;
        this.x += this.velX;
        if (this.x <= this.leftBound || this.x + this.w >= this.rightBound) this.velX = -this.velX;
        if (++this.frameTick >= 18) { this.frame = 1 - this.frame; this.frameTick = 0; }
    }

    draw(ctx) {
        if (!this.alive) return;
        const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
        if      (this.type === 'gabbiano')  drawGabbiano(ctx, cx, cy, this.frame);
        else if (this.type === 'turista')   drawTurista(ctx, this.x, this.y, this.frame);
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
        ctx.fillStyle = bg.groundColor;
        ctx.fillRect(camX, GROUND_Y, cW, cH);
        ctx.fillStyle = this._lighten(bg.groundColor, 22);
        ctx.fillRect(camX, GROUND_Y, cW, 6);
        if (bg.mare) this._mare(ctx, camX, cW);
    }

    _villaBg(ctx, camX, cW, cH) {
        const sky=ctx.createLinearGradient(0,0,0,GROUND_Y);
        sky.addColorStop(0,'#4A8FB8');sky.addColorStop(0.5,'#7AB8D8');sky.addColorStop(1,'#B8DCF0');
        ctx.fillStyle=sky;ctx.fillRect(0,0,cW,GROUND_Y);
        const co=(camX*0.05)%cW;
        ctx.fillStyle='rgba(255,255,255,0.45)';
        [[100,50,18],[280,38,13],[560,44,16],[750,42,15]].forEach(([cx,cy,r])=>{
            const x=((cx-co+cW*2)%(cW+200))-100;
            ctx.beginPath();ctx.arc(x,cy,r,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(x+r*.7,cy+r*.2,r*.7,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.arc(x-r*.55,cy+r*.2,r*.55,0,Math.PI*2);ctx.fill();
        });
        const mare=ctx.createLinearGradient(0,GROUND_Y-70,0,GROUND_Y);
        mare.addColorStop(0,'rgba(155,190,215,0.85)');mare.addColorStop(0.5,'#4E9ABE');mare.addColorStop(1,'#357EA0');
        ctx.fillStyle=mare;ctx.fillRect(0,GROUND_Y-72,cW,75);
        ctx.fillStyle='rgba(195,218,235,0.5)';ctx.fillRect(0,GROUND_Y-75,cW,22);
        ctx.strokeStyle='rgba(255,255,255,0.22)';ctx.lineWidth=1.2;
        const wOff=(this.waveT*30)%180;
        for(let i=0;i<4;i++){
            const wy=GROUND_Y-55+i*13;
            for(let j=-1;j<=Math.ceil(cW/180)+1;j++){
                const wx=j*180-wOff;
                ctx.beginPath();ctx.moveTo(wx,wy);ctx.bezierCurveTo(wx+45,wy-4,wx+90,wy+4,wx+180,wy);ctx.stroke();
            }
        }
        const vx=cW*0.38-camX*0.18;
        ctx.fillStyle='#6B7B6A';
        ctx.beginPath();
        ctx.moveTo(vx-220,GROUND_Y-58);ctx.bezierCurveTo(vx-145,GROUND_Y-78,vx-75,GROUND_Y-108,vx-18,GROUND_Y-148);
        ctx.lineTo(vx-5,GROUND_Y-142);ctx.lineTo(vx,GROUND_Y-155);ctx.lineTo(vx+8,GROUND_Y-144);ctx.lineTo(vx+14,GROUND_Y-148);
        ctx.bezierCurveTo(vx+65,GROUND_Y-115,vx+130,GROUND_Y-82,vx+200,GROUND_Y-58);
        ctx.lineTo(vx-220,GROUND_Y-58);ctx.closePath();ctx.fill();
        ctx.fillStyle='#556A55';
        ctx.beginPath();
        ctx.moveTo(vx-220,GROUND_Y-58);ctx.bezierCurveTo(vx-145,GROUND_Y-78,vx-75,GROUND_Y-108,vx-18,GROUND_Y-148);
        ctx.lineTo(vx,GROUND_Y-155);ctx.bezierCurveTo(vx-30,GROUND_Y-115,vx-80,GROUND_Y-85,vx-110,GROUND_Y-58);
        ctx.closePath();ctx.fill();
        ctx.fillStyle='rgba(190,185,178,0.7)';
        ctx.beginPath();ctx.moveTo(vx-5,GROUND_Y-142);ctx.lineTo(vx,GROUND_Y-155);ctx.lineTo(vx+14,GROUND_Y-148);ctx.lineTo(vx+10,GROUND_Y-138);ctx.closePath();ctx.fill();
        ctx.fillStyle='rgba(215,215,210,0.3)';ctx.beginPath();ctx.ellipse(vx+2,GROUND_Y-165,10,6,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(155,148,138,0.45)';
        for(let i=0;i<40;i++){const bx=vx-210+i*13;const bh=4+Math.sin(i*.8)*3.5;if(bx>vx+190)break;ctx.fillRect(bx,GROUND_Y-56-bh,9,bh);}
        ctx.fillStyle='rgba(95,88,80,0.6)';ctx.fillRect(vx+50,GROUND_Y-26,80,8);ctx.fillRect(vx+100,GROUND_Y-32,14,14);
        const rEnd=cW;
        ctx.fillStyle='#C5BDB0';ctx.fillRect(0,GROUND_Y-16,rEnd,18);
        ctx.fillStyle='#D5CEC2';ctx.fillRect(0,GROUND_Y-16,rEnd,5);
        ctx.fillStyle='#B0A898';ctx.fillRect(0,GROUND_Y-18,rEnd,3);
        ctx.strokeStyle='#404040';ctx.lineCap='round';
        ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(10,GROUND_Y-18);ctx.lineTo(rEnd,GROUND_Y-18);ctx.stroke();
        ctx.beginPath();ctx.moveTo(10,GROUND_Y-28);ctx.lineTo(rEnd,GROUND_Y-28);ctx.stroke();
        ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(10,GROUND_Y-23);ctx.lineTo(rEnd,GROUND_Y-23);ctx.stroke();
        for(let rx=18;rx<rEnd;rx+=17){
            ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(rx,GROUND_Y-16);ctx.lineTo(rx,GROUND_Y-30);ctx.stroke();
            ctx.beginPath();ctx.arc(rx,GROUND_Y-25,2.8,0,Math.PI*2);ctx.stroke();
        }
        const ax=cW*0.35;
        ctx.fillStyle='#959088';ctx.beginPath();ctx.ellipse(ax,GROUND_Y-4,65,13,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#858078';ctx.beginPath();ctx.ellipse(ax,GROUND_Y-4,60,10,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#333';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(ax,GROUND_Y-4,65,13,0,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='#999';ctx.fillRect(ax-1.5,GROUND_Y-20,3,14);ctx.beginPath();ctx.ellipse(ax,GROUND_Y-20,6,2.5,0,0,Math.PI*2);ctx.fill();
        const agave=(ox,oy,sz)=>{for(let i=0;i<8;i++){const ang=(i/8)*Math.PI*2;const lean=0.28+Math.sin(i)*.08;ctx.save();ctx.translate(ox,oy);ctx.rotate(ang);ctx.fillStyle=i%2===0?'#3E6030':'#4E7040';ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(sz*.2,-sz*lean,sz*.12,-sz*(lean+.55),sz*.04,-sz*(lean+1.1));ctx.bezierCurveTo(-sz*.04,-sz*(lean+1.),-sz*.18,-sz*lean,0,0);ctx.fill();ctx.restore();}};
        agave(cW*.07,GROUND_Y+2,20);agave(cW*.17,GROUND_Y,16);agave(cW*.60,GROUND_Y+1,19);agave(cW*.66,GROUND_Y,14);
        const palma=(px,py,h,curva)=>{for(let s=0;s<12;s++){const t1=s/12,t2=(s+1)/12;ctx.strokeStyle=s%2===0?'#7A5A0E':'#8E6A18';ctx.lineWidth=Math.max(3,9-s*.5);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(px+curva*t1*t1,py-h*t1);ctx.lineTo(px+curva*t2*t2,py-h*t2);ctx.stroke();}const tx=px+curva,ty=py-h;for(let i=0;i<11;i++){const ang=(i/11)*Math.PI*2-.4;const fl=55+Math.sin(i*1.1)*12;const droop=.4+Math.sin(i*.9)*.12;ctx.save();ctx.translate(tx,ty);ctx.rotate(ang);ctx.fillStyle=i%3===0?'#1E4E08':i%3===1?'#285E10':'#326618';ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(fl*.35,-6,fl*.75,fl*droop*.2,fl,fl*droop*.55);ctx.bezierCurveTo(fl*.7,fl*droop*.65,fl*.3,4,0,0);ctx.fill();ctx.restore();}};
        palma(cW*.80,GROUND_Y+8,Math.min(160,GROUND_Y-20),-10);palma(cW*.895,GROUND_Y+10,Math.min(118,GROUND_Y-20),8);
    }

    _villaGround(ctx, camX, cW, cH) {
        // Gradiente verticale caldo base
        const pav=ctx.createLinearGradient(0,GROUND_Y,0,GROUND_Y+cH);
        pav.addColorStop(0,'#A09080');
        pav.addColorStop(0.4,'#8A7A6A');
        pav.addColorStop(1,'#6A5A4A');
        ctx.fillStyle=pav;ctx.fillRect(camX,GROUND_Y,cW,cH);

        // Bordo superiore luminoso
        const topShine=ctx.createLinearGradient(0,GROUND_Y,0,GROUND_Y+8);
        topShine.addColorStop(0,'rgba(255,240,210,0.35)');
        topShine.addColorStop(1,'rgba(255,240,210,0)');
        ctx.fillStyle=topShine;ctx.fillRect(camX,GROUND_Y,cW,8);

        // Linee prospettiche che partono vicino al centro e si allargano verso il basso
        const VP={x:camX+cW/2, y:GROUND_Y};
        const nLines=18;
        ctx.strokeStyle='rgba(0,0,0,0.12)';ctx.lineWidth=1;
        for(let i=0;i<=nLines;i++){
            const t=i/nLines; // 0=sinistra, 1=destra
            // In alto convergono verso il centro, in basso si allargano
            const xTop=VP.x+(t-0.5)*cW*0.15;
            const xBot=camX+t*cW;
            ctx.beginPath();ctx.moveTo(xTop,GROUND_Y);ctx.lineTo(xBot,GROUND_Y+cH);ctx.stroke();
        }

        // Assi orizzontali con leggera curvatura
        const nRows=10;
        for(let r=1;r<nRows;r++){
            const t=Math.pow(r/nRows,0.7);
            const y=GROUND_Y+t*cH;
            const curve=4*(1-t); // più curva in alto, piatta in basso
            ctx.strokeStyle=`rgba(0,0,0,${0.08+t*0.06})`;ctx.lineWidth=0.8;
            ctx.beginPath();
            ctx.moveTo(camX,y);
            ctx.bezierCurveTo(camX+cW*0.25,y-curve, camX+cW*0.75,y-curve, camX+cW,y);
            ctx.stroke();
        }

        // Ombreggiatura finale verso il basso
        const shadow=ctx.createLinearGradient(0,GROUND_Y+cH*0.6,0,GROUND_Y+cH);
        shadow.addColorStop(0,'rgba(0,0,0,0)');
        shadow.addColorStop(1,'rgba(0,0,0,0.18)');
        ctx.fillStyle=shadow;ctx.fillRect(camX,GROUND_Y,cW,cH);

        const t=this.waveT;
        const drawPersona=(wx,py,sc,dir,skin,shirt,pant,type)=>{
            const sw=Math.floor(t*3+wx*0.1)%2;
            ctx.save();
            ctx.translate(wx,py);
            ctx.scale(sc*(dir===-1?-1:1),sc);
            if(type==='anziano'){
                ctx.fillStyle=shirt;ctx.fillRect(-6,-18,12,14);
                ctx.fillStyle='#888';ctx.fillRect(-7,-4,14,12);
                ctx.strokeStyle='#8B6914';ctx.lineWidth=1.5;
                ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(12,-20);ctx.stroke();
                ctx.fillStyle=skin;ctx.beginPath();ctx.arc(0,-22,6,0,Math.PI*2);ctx.fill();
                ctx.fillStyle='#EEE';ctx.beginPath();ctx.arc(0,-26,5,Math.PI,0);ctx.fill();
                ctx.fillStyle='#888';ctx.fillRect(-6,8,5,10);ctx.fillRect(1,8,5,10);
                ctx.fillStyle='#333';ctx.fillRect(-7,18,7,4);ctx.fillRect(0,18,7,4);
            } else if(type==='mamma'){
                ctx.fillStyle=shirt;ctx.fillRect(-7,-20,14,16);
                ctx.fillStyle=pant;ctx.fillRect(-6,-4,12,14);
                ctx.fillStyle=skin;ctx.beginPath();ctx.arc(0,-24,6,0,Math.PI*2);ctx.fill();
                ctx.fillStyle='#3D1C00';ctx.beginPath();ctx.arc(0,-27,5,Math.PI,0);ctx.fill();
                ctx.fillRect(-5,-27,10,5);
                ctx.fillStyle=pant;
                ctx.fillRect(-6,10,5,sw===0?10:8);ctx.fillRect(1,10,5,sw===0?8:10);
                ctx.fillStyle='#333';ctx.fillRect(-7,sw===0?20:18,7,4);ctx.fillRect(0,sw===0?18:20,7,4);
                ctx.strokeStyle='#555';ctx.lineWidth=1.5;
                ctx.beginPath();ctx.moveTo(14,-2);ctx.lineTo(22,-2);ctx.lineTo(22,10);ctx.lineTo(8,10);ctx.stroke();
                ctx.fillStyle='#FFD700';ctx.fillRect(9,3,12,7);
                ctx.fillStyle='#333';ctx.beginPath();ctx.arc(10,12,3,0,Math.PI*2);ctx.fill();
                ctx.beginPath();ctx.arc(21,12,3,0,Math.PI*2);ctx.fill();
                ctx.fillStyle=skin;ctx.beginPath();ctx.arc(15,2,3,0,Math.PI*2);ctx.fill();
            } else {
                ctx.fillStyle=shirt;ctx.fillRect(-6,-20,12,15);
                ctx.fillStyle=pant;ctx.fillRect(-6,-5,12,13);
                ctx.fillStyle=skin;ctx.beginPath();ctx.arc(0,-24,6,0,Math.PI*2);ctx.fill();
                ctx.fillStyle='#2C1810';ctx.beginPath();ctx.arc(0,-28,5,Math.PI,0);ctx.fill();
                ctx.fillStyle=shirt;
                ctx.fillRect(-10,-18,4,sw===0?12:10);ctx.fillRect(6,-18,4,sw===0?10:12);
                ctx.fillStyle=pant;
                ctx.fillRect(-6,8,5,sw===0?12:9);ctx.fillRect(1,8,5,sw===0?9:12);
                ctx.fillStyle='#333';ctx.fillRect(-7,sw===0?20:17,7,4);ctx.fillRect(0,sw===0?17:20,7,4);
            }
            ctx.restore();
        };

        const skins=['#F5C5A3','#8D5524','#C68642','#FDBCB4','#A0522D'];
        const shirts=['#E74C3C','#3498DB','#27AE60','#9B59B6','#E67E22','#1ABC9C','#F39C12','#2980B9','#C0392B','#16A085'];
        const pants=['#2C3E50','#1A252F','#34495E','#7F8C8D','#4A235A','#1B2631'];
        const seed=(x,y)=>Math.abs(Math.sin(x*127.1+y*311.7)*43758.5453)%1;
        const types=['normal','normal','normal','anziano','mamma'];

        // PERSONE SPARSE nella zona centrale (tra GROUND_Y e negozi)
        const midTop=GROUND_Y+20;
        const midBot=cH-80;
        for(let wx=80;wx<3000;wx+=55){
            if(wx+30<camX||wx-30>camX+cW)continue;
            const r1=seed(wx,1),r2=seed(wx,2),r3=seed(wx,3);
            const r4=seed(wx,4),r5=seed(wx,5),r6=seed(wx,6);
            const py=midTop+r1*(midBot-midTop);
            const sc=0.45+((py-midTop)/(midBot-midTop))*0.55;
            const dir=r2>0.5?1:-1;
            const wx2=wx+Math.sin(t*0.7+wx*0.05)*12*dir;
            drawPersona(wx2,py,sc,dir,
                skins[Math.floor(r3*skins.length)],
                shirts[Math.floor(r4*shirts.length)],
                pants[Math.floor(r5*pants.length)],
                types[Math.floor(r6*types.length)]
            );
        }

        // NEGOZI in fondo
        const shops=[
            {x:80,   label:'Bar Stabia',   aw:'#C0392B',door:'#8B4513'},
            {x:195,  label:'Pasticceria',  aw:'#27AE60',door:'#5D4037'},
            {x:310,  label:'Caffè Napoli', aw:'#2980B9',door:'#4E342E'},
            {x:425,  label:'Tabacchi',     aw:'#8E44AD',door:'#37474F'},
            {x:540,  label:'Gelateria',    aw:'#E67E22',door:'#5D4037'},
            {x:655,  label:'Pizzeria',     aw:'#C0392B',door:'#4E342E'},
            {x:770,  label:'Bar Stabia',   aw:'#27AE60',door:'#8B4513'},
            {x:885,  label:'Farmacia',     aw:'#16A085',door:'#37474F'},
            {x:1000, label:'Pasticceria',  aw:'#8E44AD',door:'#5D4037'},
            {x:1115, label:'Caffè Napoli', aw:'#C0392B',door:'#4E342E'},
            {x:1230, label:'Gelateria',    aw:'#E67E22',door:'#8B4513'},
            {x:1345, label:'Tabacchi',     aw:'#2980B9',door:'#37474F'},
            {x:1460, label:'Bar Stabia',   aw:'#27AE60',door:'#5D4037'},
            {x:1575, label:'Pizzeria',     aw:'#C0392B',door:'#4E342E'},
            {x:1690, label:'Farmacia',     aw:'#16A085',door:'#37474F'},
            {x:1805, label:'Pasticceria',  aw:'#8E44AD',door:'#8B4513'},
            {x:1920, label:'Caffè Napoli', aw:'#E67E22',door:'#5D4037'},
            {x:2035, label:'Bar Stabia',   aw:'#C0392B',door:'#4E342E'},
            {x:2150, label:'Gelateria',    aw:'#27AE60',door:'#37474F'},
            {x:2265, label:'Tabacchi',     aw:'#2980B9',door:'#8B4513'},
            {x:2380, label:'Pizzeria',     aw:'#8E44AD',door:'#5D4037'},
            {x:2495, label:'Bar Stabia',   aw:'#C0392B',door:'#4E342E'},
            {x:2610, label:'Farmacia',     aw:'#16A085',door:'#37474F'},
            {x:2725, label:'Pasticceria',  aw:'#E67E22',door:'#8B4513'},
            {x:2840, label:'Caffè Napoli', aw:'#27AE60',door:'#5D4037'},
        ];
        const sy=cH-70;
        shops.forEach(s=>{
            if(s.x+115<camX||s.x-10>camX+cW)return;
            ctx.fillStyle='#D4C9B8';ctx.fillRect(s.x,sy,108,70);
            ctx.fillStyle=s.aw;
            ctx.beginPath();ctx.moveTo(s.x-4,sy+8);ctx.lineTo(s.x+112,sy+8);
            ctx.lineTo(s.x+108,sy+22);ctx.lineTo(s.x,sy+22);ctx.closePath();ctx.fill();
            ctx.fillStyle='rgba(255,255,255,0.28)';
            for(let r=0;r<6;r++)ctx.fillRect(s.x+r*18,sy+8,9,14);
            ctx.fillStyle='rgba(150,210,255,0.45)';ctx.fillRect(s.x+6,sy+24,55,34);
            ctx.strokeStyle='#777';ctx.lineWidth=1.5;ctx.strokeRect(s.x+6,sy+24,55,34);
            ctx.strokeStyle='#999';ctx.lineWidth=1;
            ctx.beginPath();ctx.moveTo(s.x+33,sy+24);ctx.lineTo(s.x+33,sy+58);ctx.stroke();
            ctx.beginPath();ctx.moveTo(s.x+6,sy+41);ctx.lineTo(s.x+61,sy+41);ctx.stroke();
            ctx.fillStyle=s.door;ctx.fillRect(s.x+68,sy+30,28,38);
            ctx.fillStyle=s.door;ctx.fillRect(s.x+70,sy+32,24,34);
            ctx.fillStyle='#C8A000';ctx.beginPath();ctx.arc(s.x+86,sy+50,2,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#FFF';ctx.fillRect(s.x+2,sy+1,104,8);
            ctx.fillStyle='#111';ctx.font='bold 7px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
            ctx.fillText(s.label,s.x+54,sy+5);
        });

        // PERSONE SUL BORDO inferiore (vicino ai negozi)
        const peopleBot=[
            {x:60,  skin:'#F5C5A3',shirt:'#3498DB',pant:'#2C3E50',dir:1, type:'normal'},
            {x:130, skin:'#8D5524',shirt:'#E74C3C',pant:'#1A252F',dir:-1,type:'anziano'},
            {x:200, skin:'#F5C5A3',shirt:'#27AE60',pant:'#7F8C8D',dir:1, type:'mamma'},
            {x:270, skin:'#C68642',shirt:'#9B59B6',pant:'#2C3E50',dir:1, type:'normal'},
            {x:340, skin:'#F5C5A3',shirt:'#E67E22',pant:'#34495E',dir:-1,type:'normal'},
            {x:410, skin:'#8D5524',shirt:'#1ABC9C',pant:'#2C3E50',dir:1, type:'anziano'},
            {x:480, skin:'#F5C5A3',shirt:'#E74C3C',pant:'#7F8C8D',dir:-1,type:'normal'},
            {x:550, skin:'#C68642',shirt:'#3498DB',pant:'#1A252F',dir:1, type:'mamma'},
            {x:620, skin:'#F5C5A3',shirt:'#8E44AD',pant:'#2C3E50',dir:-1,type:'normal'},
            {x:690, skin:'#8D5524',shirt:'#27AE60',pant:'#34495E',dir:1, type:'normal'},
            {x:760, skin:'#F5C5A3',shirt:'#E67E22',pant:'#2C3E50',dir:-1,type:'anziano'},
            {x:830, skin:'#C68642',shirt:'#E74C3C',pant:'#7F8C8D',dir:1, type:'normal'},
            {x:900, skin:'#F5C5A3',shirt:'#3498DB',pant:'#1A252F',dir:-1,type:'mamma'},
            {x:970, skin:'#8D5524',shirt:'#9B59B6',pant:'#2C3E50',dir:1, type:'normal'},
            {x:1040,skin:'#F5C5A3',shirt:'#1ABC9C',pant:'#34495E',dir:-1,type:'anziano'},
            {x:1110,skin:'#C68642',shirt:'#E74C3C',pant:'#2C3E50',dir:1, type:'normal'},
            {x:1180,skin:'#F5C5A3',shirt:'#27AE60',pant:'#7F8C8D',dir:-1,type:'mamma'},
            {x:1250,skin:'#8D5524',shirt:'#E67E22',pant:'#1A252F',dir:1, type:'normal'},
            {x:1320,skin:'#F5C5A3',shirt:'#8E44AD',pant:'#2C3E50',dir:-1,type:'anziano'},
            {x:1390,skin:'#C68642',shirt:'#3498DB',pant:'#34495E',dir:1, type:'normal'},
            {x:1460,skin:'#F5C5A3',shirt:'#E74C3C',pant:'#2C3E50',dir:-1,type:'mamma'},
            {x:1530,skin:'#8D5524',shirt:'#27AE60',pant:'#7F8C8D',dir:1, type:'normal'},
            {x:1600,skin:'#F5C5A3',shirt:'#1ABC9C',pant:'#1A252F',dir:-1,type:'anziano'},
            {x:1670,skin:'#C68642',shirt:'#9B59B6',pant:'#2C3E50',dir:1, type:'normal'},
            {x:1740,skin:'#F5C5A3',shirt:'#E67E22',pant:'#34495E',dir:-1,type:'normal'},
            {x:1810,skin:'#8D5524',shirt:'#3498DB',pant:'#2C3E50',dir:1, type:'mamma'},
            {x:1880,skin:'#F5C5A3',shirt:'#E74C3C',pant:'#7F8C8D',dir:-1,type:'normal'},
            {x:1950,skin:'#C68642',shirt:'#8E44AD',pant:'#1A252F',dir:1, type:'anziano'},
            {x:2020,skin:'#F5C5A3',shirt:'#27AE60',pant:'#2C3E50',dir:-1,type:'normal'},
            {x:2090,skin:'#8D5524',shirt:'#1ABC9C',pant:'#34495E',dir:1, type:'normal'},
            {x:2160,skin:'#F5C5A3',shirt:'#E67E22',pant:'#2C3E50',dir:-1,type:'mamma'},
            {x:2230,skin:'#C68642',shirt:'#E74C3C',pant:'#7F8C8D',dir:1, type:'normal'},
            {x:2300,skin:'#F5C5A3',shirt:'#3498DB',pant:'#1A252F',dir:-1,type:'anziano'},
            {x:2370,skin:'#8D5524',shirt:'#9B59B6',pant:'#2C3E50',dir:1, type:'normal'},
            {x:2440,skin:'#F5C5A3',shirt:'#27AE60',pant:'#34495E',dir:-1,type:'mamma'},
            {x:2510,skin:'#C68642',shirt:'#E74C3C',pant:'#2C3E50',dir:1, type:'normal'},
            {x:2580,skin:'#F5C5A3',shirt:'#1ABC9C',pant:'#7F8C8D',dir:-1,type:'anziano'},
            {x:2650,skin:'#8D5524',shirt:'#8E44AD',pant:'#1A252F',dir:1, type:'normal'},
            {x:2720,skin:'#F5C5A3',shirt:'#E67E22',pant:'#2C3E50',dir:-1,type:'mamma'},
            {x:2790,skin:'#C68642',shirt:'#3498DB',pant:'#34495E',dir:1, type:'normal'},
            {x:2860,skin:'#F5C5A3',shirt:'#E74C3C',pant:'#7F8C8D',dir:-1,type:'normal'},
            {x:2930,skin:'#8D5524',shirt:'#27AE60',pant:'#2C3E50',dir:1, type:'anziano'},
        ];
        peopleBot.forEach((p,i)=>{
            if(p.x+20<camX||p.x-20>camX+cW)return;
            const wx=p.x+Math.sin(t*0.8+i)*18*p.dir;
            drawPersona(wx,cH-72,1,p.dir,p.skin,p.shirt,p.pant,p.type);
        });
    }

    _stadioBg(ctx, camX, cW, cH) {
        const sky=ctx.createLinearGradient(0,0,0,GROUND_Y*0.7);
        sky.addColorStop(0,'#1E1028');sky.addColorStop(0.25,'#6B2548');
        sky.addColorStop(0.55,'#B84A38');sky.addColorStop(0.8,'#E07840');sky.addColorStop(1,'#F0A855');
        ctx.fillStyle=sky;ctx.fillRect(0,0,cW,GROUND_Y);
        // Alone fari
        [90,215,355,480,610,740,870].forEach(fx=>{
            const g=ctx.createRadialGradient(fx,15,3,fx,15,100);
            g.addColorStop(0,'rgba(255,255,210,0.5)');g.addColorStop(1,'rgba(255,255,200,0)');
            ctx.fillStyle=g;ctx.beginPath();ctx.arc(fx,15,100,0,Math.PI*2);ctx.fill();
        });
        // Struttura stadio
        ctx.fillStyle='#A8A098';ctx.fillRect(0,GROUND_Y-195,cW,195);
        ctx.fillStyle='#989088';ctx.fillRect(0,GROUND_Y-195,cW,3);
        ctx.fillStyle='#B0A8A0';ctx.fillRect(0,GROUND_Y-160,cW,3);
        // Tettoia
        ctx.fillStyle='#6E6E70';ctx.fillRect(-10,GROUND_Y-208,cW+20,16);
        ctx.fillStyle='#5E5E60';ctx.fillRect(-10,GROUND_Y-210,cW+20,5);
        for(let px=60;px<cW;px+=110){ctx.fillStyle='#606060';ctx.fillRect(px-4,GROUND_Y-208,8,30);}
        ctx.fillStyle='#808080';ctx.fillRect(-10,GROUND_Y-194,cW+20,4);
        // Fari
        [90,215,355,480,610,740,870].forEach(fx=>{
            ctx.fillStyle='#888';ctx.fillRect(fx-2,GROUND_Y-232,4,26);
            ctx.fillStyle='#333';ctx.fillRect(fx-13,GROUND_Y-243,26,12);
            [[fx-9,GROUND_Y-239],[fx-2,GROUND_Y-239],[fx+5,GROUND_Y-239],[fx-9,GROUND_Y-234],[fx-2,GROUND_Y-234],[fx+5,GROUND_Y-234]].forEach(([lx,ly])=>{
                ctx.fillStyle='#FFFFC0';ctx.fillRect(lx-2,ly-2,5,4);
                const gl=ctx.createRadialGradient(lx,ly,0,lx,ly,18);
                gl.addColorStop(0,'rgba(255,255,180,0.6)');gl.addColorStop(1,'rgba(255,255,180,0)');
                ctx.fillStyle=gl;ctx.beginPath();ctx.arc(lx,ly,18,0,Math.PI*2);ctx.fill();
            });
        });
        // Tribune
        const drawT=(y,h,rows,pat)=>{const rh=h/rows;for(let r=0;r<rows;r++){const ry=y+r*rh;ctx.fillStyle='#8A8280';ctx.fillRect(0,ry,cW,rh-1);const sw=13;for(let s=0;s<Math.ceil(cW/sw);s++){ctx.fillStyle=pat[(s+r*3)%pat.length];ctx.beginPath();ctx.roundRect(s*sw+1,ry+1,sw-2,rh-3,1);ctx.fill();ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(s*sw+1,ry+rh-4,sw-2,3);}}};
        drawT(GROUND_Y-192,65,5,['#1A3A8F','#1A3A8F','#FFD700','#1A3A8F','#1A3A8F','#1A3A8F','#FFD700','#1A3A8F','#1A3A8F','#FFD700']);
        drawT(GROUND_Y-127,60,5,['#FFD700','#1A3A8F','#FFD700','#FFD700','#1A3A8F','#FFD700','#1A3A8F','#FFD700','#FFD700','#1A3A8F']);
        // Fascia scritta
        ctx.fillStyle='#C8C2B8';ctx.fillRect(0,GROUND_Y-68,cW,36);
        ctx.fillStyle='#D8D2C8';ctx.fillRect(0,GROUND_Y-68,cW,5);
        ctx.fillStyle='#B8B2A8';ctx.fillRect(0,GROUND_Y-34,cW,3);
        ctx.strokeStyle='#999';ctx.lineWidth=1.5;ctx.strokeRect(cW*0.06,GROUND_Y-65,cW*0.88,28);
        ctx.fillStyle='#E0DAD0';ctx.fillRect(cW*0.06+1,GROUND_Y-64,cW*0.88-2,26);
        ctx.fillStyle='#111';ctx.font='bold 14px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText('CITTÀ DI CASTELLAMMARE DI STABIA',cW/2,GROUND_Y-52);
        // Cartelloni
        const adC=['#1A3A8F','#FFD700','#CC0000','#1A3A8F','#FFD700','#00880A','#1A3A8F'];
        adC.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(i*(cW/7),GROUND_Y-32,cW/7-2,20);});
        // Cancelli con sbarre
        [cW*0.12,cW*0.88].forEach(gx=>{
            const gw=44,gh=32,gy=GROUND_Y-32;
            ctx.fillStyle='#E8C000';
            ctx.fillRect(gx-gw/2,gy,6,gh);ctx.fillRect(gx+gw/2-6,gy,6,gh);
            ctx.fillRect(gx-gw/2,gy,gw,5);ctx.fillRect(gx-gw/2,gy+gh-5,gw,5);ctx.fillRect(gx-gw/2,gy+gh/2-2,gw,4);
            for(let b=0;b<6;b++){ctx.fillStyle='#D4AE00';const bx=gx-gw/2+6+(b+0.5)*((gw-12)/6)-2;ctx.fillRect(bx,gy+5,3,gh-10);}
        });
        // Recinzione
        ctx.save();ctx.globalAlpha=0.25;ctx.strokeStyle='#BBB';ctx.lineWidth=0.7;
        for(let fx=0;fx<cW;fx+=7){ctx.beginPath();ctx.moveTo(fx,GROUND_Y-30);ctx.lineTo(fx,GROUND_Y);ctx.stroke();}
        for(let fy=GROUND_Y-30;fy<=GROUND_Y;fy+=7){ctx.beginPath();ctx.moveTo(0,fy);ctx.lineTo(cW,fy);ctx.stroke();}
        ctx.restore();
    }

    _stadioGround(ctx, camX, cW, cH) {
        // Fasce erba in prospettiva — più sottili in alto, più alte in basso
        const nFasce=14;
        for(let r=0;r<nFasce;r++){
            const t0=Math.pow(r/nFasce,0.6);
            const t1=Math.pow((r+1)/nFasce,0.6);
            const y0=GROUND_Y+t0*cH;
            const y1=GROUND_Y+t1*cH;
            ctx.fillStyle=r%2===0?'#4AB820':'#56CC28';
            ctx.fillRect(camX,y0,cW,y1-y0);
        }
        // Bordo superiore morbido — separa campo da sfondo
        const topFade=ctx.createLinearGradient(0,GROUND_Y,0,GROUND_Y+14);
        topFade.addColorStop(0,'rgba(30,80,10,0.5)');
        topFade.addColorStop(1,'rgba(30,80,10,0)');
        ctx.fillStyle=topFade;ctx.fillRect(camX,GROUND_Y,cW,14);
        // Linee bianche convergenti verso centro alto
        const VPx=camX+cW/2;
        const nLinee=20;
        ctx.lineCap='round';
        for(let i=0;i<=nLinee;i++){
            const t=i/nLinee;
            const xTop=VPx+(t-0.5)*cW*0.08;
            const xBot=camX+t*cW;
            const alpha=0.06+Math.abs(t-0.5)*0.1;
            ctx.strokeStyle=`rgba(255,255,255,${alpha})`;
            ctx.lineWidth=0.8;
            ctx.beginPath();ctx.moveTo(xTop,GROUND_Y);ctx.lineTo(xBot,GROUND_Y+cH);ctx.stroke();
        }
        // Linee orizzontali prospettiche — convergono verso l'alto
        const nRighe=10;
        for(let r=1;r<nRighe;r++){
            const t=Math.pow(r/nRighe,0.6);
            const y=GROUND_Y+t*cH;
            const alpha=0.12+t*0.1;
            const lw=0.5+t*1.2;
            // Leggera curvatura per effetto stadio
            const curva=2*(1-t);
            ctx.strokeStyle=`rgba(255,255,255,${alpha})`;ctx.lineWidth=lw;
            ctx.beginPath();
            ctx.moveTo(camX,y);
            ctx.bezierCurveTo(camX+cW*0.3,y-curva,camX+cW*0.7,y-curva,camX+cW,y);
            ctx.stroke();
        }
        // Gradiente ombra verso il basso
        const shadow=ctx.createLinearGradient(0,GROUND_Y+cH*0.45,0,GROUND_Y+cH);
        shadow.addColorStop(0,'rgba(0,0,0,0)');
        shadow.addColorStop(1,'rgba(0,0,0,0.2)');
        ctx.fillStyle=shadow;ctx.fillRect(camX,GROUND_Y,cW,cH);
        // Linee campo originali sopra tutto
        ctx.strokeStyle='rgba(255,255,255,0.9)';ctx.lineWidth=2.5;
        const midW=1750;
        ctx.beginPath();ctx.moveTo(midW,GROUND_Y);ctx.lineTo(midW,GROUND_Y+cH);ctx.stroke();
        ctx.beginPath();ctx.ellipse(midW,GROUND_Y+25,90,35,0,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='white';ctx.beginPath();ctx.arc(midW,GROUND_Y+25,4,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,0.65)';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(80,GROUND_Y);ctx.lineTo(80,GROUND_Y+cH);ctx.stroke();
        ctx.beginPath();ctx.moveTo(3420,GROUND_Y);ctx.lineTo(3420,GROUND_Y+cH);ctx.stroke();
        // Panchine
        [midW-700,midW+700].forEach(px=>{
            ctx.fillStyle='#8B3A10';ctx.fillRect(px-65,GROUND_Y-14,130,8);
            ctx.fillStyle='#7A3410';ctx.fillRect(px-65,GROUND_Y-7,130,7);
            for(let i=0;i<9;i++){ctx.fillStyle=i%2===0?'#1A3A8F':'#243AAF';ctx.fillRect(px-60+i*14,GROUND_Y-6,12,6);}
            [px-55,px-20,px+20,px+55].forEach(lx=>{ctx.fillStyle='#444';ctx.fillRect(lx-1,GROUND_Y,2,8);});
        });
    }

    _termeBg(ctx, camX, cW, cH) {
        // Sfondo muro tufo
        let bg=ctx.createLinearGradient(0,0,0,GROUND_Y);
        bg.addColorStop(0,'#B8BFA8');bg.addColorStop(1,'#8A9278');
        ctx.fillStyle=bg;ctx.fillRect(0,0,cW,GROUND_Y);
        // Texture blocchi tufo
        ctx.strokeStyle='rgba(0,0,0,0.08)';ctx.lineWidth=1;
        for(let gy=0;gy<GROUND_Y;gy+=30){
            ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(cW,gy);ctx.stroke();
            const off=((gy/30)%2===0)?0:60;
            for(let gx=off;gx<cW;gx+=120){ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx,gy+30);ctx.stroke();}
        }
        // Fascia marmo scritta — in cima assoluta
        ctx.fillStyle='#D8D2C2';ctx.fillRect(0,GROUND_Y*0.38,cW,32);
        ctx.fillStyle='#EEE8D8';ctx.fillRect(0,GROUND_Y*0.38,cW,5);
        ctx.fillStyle='#B8B2A0';ctx.fillRect(0,GROUND_Y*0.38+29,cW,3);
        ctx.fillStyle='#7A1010';
        ctx.font='bold 15px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText('CREATIONIS  GLORIA  ·  HUMANITATIS  SALUTE',cW/2,GROUND_Y*0.38+16);
        // Struttura fontana sorgenti
        const FY=GROUND_Y-90;
        ctx.fillStyle='#787882';ctx.fillRect(0,FY,cW,90);
        ctx.fillStyle='#888892';ctx.fillRect(0,FY,cW,3);
        ctx.fillStyle='#585860';ctx.fillRect(0,GROUND_Y-12,cW,12);
        ctx.fillStyle='#686870';ctx.fillRect(-4,GROUND_Y,cW+8,5);
        // Pannelli sorgenti
        const nomi=['ACETOSA','ACIDULA','MAGNESIA','SULFUREA','SOLFOREA\nCARBONICA','ACIDULA','S.VINCENZO','MEDIA','FERRATA','MAGNESIA'];
        const n=10;const pw=cW/n;const panH=75;
        for(let i=0;i<n;i++){
            const px=i*pw;const pc=px+pw/2;
            ctx.fillStyle='#525260';ctx.fillRect(px+3,FY+4,pw-6,panH);
            ctx.fillStyle='#626270';
            ctx.beginPath();ctx.arc(pc,FY+14,pw/2-5,Math.PI,0);ctx.fill();
            [px+4,px+pw-9].forEach(cx=>{
                ctx.fillStyle='#424250';ctx.fillRect(cx,FY+4,5,panH);
                ctx.fillStyle='#7A3858';
                for(let r=0;r<4;r++)ctx.fillRect(cx+1,FY+8+r*16,3,9);
            });
            const lw=pw-22;
            ctx.fillStyle='#EEEAE4';ctx.fillRect(px+11,FY+18,lw,14);
            ctx.strokeStyle='#AAA';ctx.lineWidth=0.7;ctx.strokeRect(px+11,FY+18,lw,14);
            ctx.fillStyle='#111';
            const nome=nomi[i];
            if(nome.includes('\n')){
                const p=nome.split('\n');
                ctx.font='5px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
                ctx.fillText(p[0],pc,FY+23);ctx.fillText(p[1],pc,FY+30);
            } else {
                ctx.font=`${Math.min(7,52/nome.length+2)}px Arial`;
                ctx.textAlign='center';ctx.textBaseline='middle';
                ctx.fillText(nome,pc,FY+25);
            }
            ctx.fillStyle='#333338';ctx.beginPath();ctx.arc(pc,GROUND_Y-20,6,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#222228';ctx.beginPath();ctx.arc(pc,GROUND_Y-20,4,0,Math.PI*2);ctx.fill();
            // Filo acqua animato
            ctx.strokeStyle='rgba(140,195,235,0.75)';ctx.lineWidth=1.8;ctx.lineCap='round';
            ctx.beginPath();ctx.moveTo(pc,GROUND_Y-15);
            ctx.bezierCurveTo(pc-1,GROUND_Y-8,pc+1,GROUND_Y-4,pc,GROUND_Y-1);ctx.stroke();
        }
        ctx.strokeStyle='rgba(0,0,0,0.22)';ctx.lineWidth=1.5;
        for(let i=1;i<n;i++){
            ctx.beginPath();ctx.moveTo(i*pw,FY+4);ctx.lineTo(i*pw,GROUND_Y-4);ctx.stroke();
        }
    }

    _termeGround(ctx, camX, cW, cH) {
        // Pavimento pietra grigia — colori originali con prospettiva 2.5D
        const pav=ctx.createLinearGradient(0,GROUND_Y,0,GROUND_Y+cH);
        pav.addColorStop(0,'#747C7E');pav.addColorStop(1,'#585E60');
        ctx.fillStyle=pav;ctx.fillRect(camX,GROUND_Y,cW,cH);
        // Bordo superiore luminoso
        const topShine=ctx.createLinearGradient(0,GROUND_Y,0,GROUND_Y+8);
        topShine.addColorStop(0,'rgba(180,200,210,0.3)');
        topShine.addColorStop(1,'rgba(180,200,210,0)');
        ctx.fillStyle=topShine;ctx.fillRect(camX,GROUND_Y,cW,8);
        // Linee prospettiche dal centro verso il basso
        const VP={x:camX+cW/2, y:GROUND_Y};
        const nLines=16;
        ctx.strokeStyle='rgba(0,0,0,0.1)';ctx.lineWidth=1;
        for(let i=0;i<=nLines;i++){
            const t=i/nLines;
            const xTop=VP.x+(t-0.5)*cW*0.12;
            const xBot=camX+t*cW;
            ctx.beginPath();ctx.moveTo(xTop,GROUND_Y);ctx.lineTo(xBot,GROUND_Y+cH);ctx.stroke();
        }
        // Assi orizzontali curvi
        const nRows=8;
        for(let r=1;r<nRows;r++){
            const t=Math.pow(r/nRows,0.7);
            const y=GROUND_Y+t*cH;
            const curve=3*(1-t);
            ctx.strokeStyle=`rgba(0,0,0,${0.08+t*0.06})`;ctx.lineWidth=0.8;
            ctx.beginPath();
            ctx.moveTo(camX,y);
            ctx.bezierCurveTo(camX+cW*0.25,y-curve,camX+cW*0.75,y-curve,camX+cW,y);
            ctx.stroke();
        }
        // Ombreggiatura verso il basso
        const shadow=ctx.createLinearGradient(0,GROUND_Y+cH*0.6,0,GROUND_Y+cH);
        shadow.addColorStop(0,'rgba(0,0,0,0)');shadow.addColorStop(1,'rgba(0,0,0,0.18)');
        ctx.fillStyle=shadow;ctx.fillRect(camX,GROUND_Y,cW,cH);
        // Riflesso bagnato in cima
        const wet=ctx.createLinearGradient(0,GROUND_Y,0,GROUND_Y+25);
        wet.addColorStop(0,'rgba(100,140,160,0.2)');wet.addColorStop(1,'rgba(100,140,160,0)');
        ctx.fillStyle=wet;ctx.fillRect(camX,GROUND_Y,cW,25);
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
        this.engine.canvas.addEventListener('pointerdown', e => {
            this.tapX = e.clientX;
            this.tapY = e.clientY;
        });
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
                this._loadLevel(0);
                this.state = STATE.PLAYING;
            }
        } else if (this.state === STATE.PLAYING) {
            this._updatePlay(dt);
        } else {
            // GAMEOVER or WIN → RIGIOCA button
            if (this._tapped(cx - 80, cy + 55, 160, 50)) {
                this.score = 0;
                this._loadLevel(0);
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
