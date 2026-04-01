class ClickSpark {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.init();
    }

    init() {
        this.canvas.id = 'click-spark-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '10002';
        document.body.appendChild(this.canvas);

        window.addEventListener('resize', () => this.resize());
        this.resize();

        window.addEventListener('mousedown', (e) => this.burst(e.clientX, e.clientY));
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    burst(x, y) {
        const count = 12 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
            this.particles.push(new SparkParticle(x, y));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            p.draw(this.ctx);
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

class SparkParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = Math.random() * 3 + 2;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
        
        // Color Jitter: Range of aggressive reds and oranges
        const colors = [
            '#ff1f1f', // Primary Red
            '#ff4d4d', // Secondary Red
            '#ff8000', // Orange-Red
            '#ffffff'  // White highlight
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.96; // Air resistance
        this.vy *= 0.96;
        this.alpha -= this.decay;
        this.size *= 0.95;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialize the spark engine
new ClickSpark();
