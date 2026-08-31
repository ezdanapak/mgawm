/* ── Poem reveal ─────────────────────────────────────────── */
const lines = document.querySelectorAll('.poem .line');
const sign = document.querySelector('.sign');

function revealPoem() {
    lines.forEach(l => l.classList.remove('show'));
    sign.classList.remove('show');
    // reflow so the transition restarts each cycle
    void document.querySelector('.poem').offsetWidth;
    lines.forEach(l => l.classList.add('show'));
    sign.classList.add('show');
}

revealPoem();
// full stanza reveals, holds to be read, then restarts every 110 seconds
setInterval(revealPoem, 110000);

/* ── Falling rose petals ─────────────────────────────────── */
const canvas = document.getElementById('roseCanvas');
const ctx = canvas.getContext('2d');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let W, H, dpr;
function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener('resize', resize);

// Warm rose palette — soft, romantic
const palette = [
    ['#ff8fb3', '#e64f86'],
    ['#ffb3c9', '#ff6f9c'],
    ['#ff7a9a', '#c9366a'],
    ['#ffd0dc', '#ff9ec4'],
    ['#f7a8c4', '#d75b8a']
];

const rand = (a, b) => a + Math.random() * (b - a);

class Petal {
    constructor(seeded) {
        this.reset(seeded);
    }
    reset(seeded) {
        this.x = rand(0, W);
        this.y = seeded ? rand(0, H) : rand(-H * 0.2, -20);
        this.size = rand(9, 22);
        this.depth = this.size / 22;                 // bigger = closer
        this.speed = rand(0.5, 1.4) * (0.6 + this.depth);
        this.angle = rand(0, Math.PI * 2);
        this.spin = rand(-0.02, 0.02);
        this.swayAmp = rand(12, 40);
        this.swayFreq = rand(0.4, 1.1);
        this.phase = rand(0, Math.PI * 2);
        this.opacity = rand(0.55, 0.95) * (0.5 + this.depth * 0.5);
        const c = palette[Math.floor(Math.random() * palette.length)];
        this.c1 = c[0];
        this.c2 = c[1];
    }
    update(t) {
        this.y += this.speed;
        this.x += Math.sin(t * this.swayFreq + this.phase) * this.swayAmp * 0.012;
        this.angle += this.spin;
        if (this.y - this.size > H) {
            this.reset(false);
        }
    }
    draw() {
        const s = this.size;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity;

        // petal shape: two mirrored bezier curves ending in a soft point
        const grad = ctx.createLinearGradient(0, -s, 0, s);
        grad.addColorStop(0, this.c1);
        grad.addColorStop(1, this.c2);
        ctx.fillStyle = grad;
        ctx.shadowColor = this.c1;
        ctx.shadowBlur = s * 0.7;

        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.8, -s * 0.5, s * 0.7, s * 0.7, 0, s);
        ctx.bezierCurveTo(-s * 0.7, s * 0.7, -s * 0.8, -s * 0.5, 0, -s);
        ctx.fill();

        // subtle crease highlight down the middle
        ctx.shadowBlur = 0;
        ctx.globalAlpha = this.opacity * 0.35;
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.85);
        ctx.lineTo(0, s * 0.85);
        ctx.stroke();

        ctx.restore();
    }
}

const COUNT = Math.round(Math.min(120, Math.max(40, W / 12)));
const petals = Array.from({ length: COUNT }, () => new Petal(true));

let start = null;
function frame(now) {
    if (start === null) start = now;
    const t = (now - start) / 1000;
    ctx.clearRect(0, 0, W, H);
    for (const p of petals) {
        p.update(t);
        p.draw();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
}

if (reduced) {
    // Draw a single static, gentle scatter — no motion
    petals.forEach(p => p.draw());
} else {
    requestAnimationFrame(frame);
}
