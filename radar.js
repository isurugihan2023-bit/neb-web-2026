class TacticalRadar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.size = 300;
        this.center = this.size / 2;
        this.radius = (this.size / 2) * 0.8;
        this.metrics = ['FRAG', 'UTIL', 'SURV', 'ECON', 'OBJ', 'PREC'];
        this.data = {
            FRAG: 0.85,
            UTIL: 0.65,
            SURV: 0.90,
            ECON: 0.70,
            OBJ: 0.75,
            PREC: 0.95
        };
        this.init();
    }

    init() {
        if (!this.container) return;
        
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${this.size} ${this.size}`);
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        
        // Draw Grid Hexagons
        for (let i = 1; i <= 4; i++) {
            const level = i / 4;
            const hex = this.createHexagon(level, "rgba(255, 255, 255, 0.05)", "1");
            svg.appendChild(hex);
        }

        // Draw Metric Axis Lines
        this.metrics.forEach((_, index) => {
            const angle = (Math.PI * 2 / 6) * index - Math.PI / 2;
            const x2 = this.center + Math.cos(angle) * this.radius;
            const y2 = this.center + Math.sin(angle) * this.radius;
            
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", this.center);
            line.setAttribute("y1", this.center);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("stroke", "rgba(255, 255, 255, 0.1)");
            line.setAttribute("stroke-width", "1");
            svg.appendChild(line);
        });

        // The Data Polygon
        this.polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        this.polygon.setAttribute("fill", "rgba(255, 31, 31, 0.3)");
        this.polygon.setAttribute("stroke", "var(--primary)");
        this.polygon.setAttribute("stroke-width", "2");
        this.polygon.style.filter = "drop-shadow(0 0 8px rgba(255, 31, 31, 0.5))";
        svg.appendChild(this.polygon);

        this.container.appendChild(svg);
        this.animateIn();
    }

    createHexagon(scale, stroke, width) {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
            const x = this.center + Math.cos(angle) * this.radius * scale;
            const y = this.center + Math.sin(angle) * this.radius * scale;
            points.push(`${x},${y}`);
        }
        const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        poly.setAttribute("points", points.join(" "));
        poly.setAttribute("fill", "none");
        poly.setAttribute("stroke", stroke);
        poly.setAttribute("stroke-width", width);
        return poly;
    }

    animateIn() {
        let startTime = null;
        const duration = 1500; // 1.5s boot animation

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            
            const currentPoints = this.metrics.map((m, i) => {
                const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
                const value = this.data[m] * ease;
                const x = this.center + Math.cos(angle) * this.radius * value;
                const y = this.center + Math.sin(angle) * this.radius * value;
                return `${x},${y}`;
            });

            this.polygon.setAttribute("points", currentPoints.join(" "));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }
}

// Initialize when the section is revealed
const radarObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            new TacticalRadar('radar-chart-container');
            radarObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const radarModule = document.querySelector('.radar-module');
if (radarModule) radarObserver.observe(radarModule);
