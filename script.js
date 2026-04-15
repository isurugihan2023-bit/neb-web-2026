// Cinematic Preloader Logic
const preloader = document.getElementById('preloader');
const progressBar = document.getElementById('progress-bar');
const percentText = document.querySelector('.percent');
const body = document.body;

function typeSyncText() {
    const syncTypedTextElement = document.getElementById('sync-typed-text');
    const syncString = "LOADING ASSETS";
    if (syncTypedTextElement && !syncTypedTextElement.dataset.started) {
        syncTypedTextElement.dataset.started = 'true';
        let syncCharIndex = 0;
        function typeChar() {
            if (syncCharIndex < syncString.length) {
                syncTypedTextElement.textContent += syncString.charAt(syncCharIndex);
                syncCharIndex++;
                setTimeout(typeChar, 80);
            } else {
                const dotsSpan = document.createElement('span');
                dotsSpan.textContent = ''; // It will be animated by css
                syncTypedTextElement.parentNode.appendChild(dotsSpan);
            }
        }
        typeChar();
    }
}

function initPreloader() {
    let progress = 0;
    const duration = 3500; // 3.5 seconds fixed duration
    const interval = 30; // Update every 30ms
    const step = 100 / (duration / interval);

    typeSyncText();

    const loadingInterval = setInterval(() => {
        progress += step;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            finishLoading();
        }
        progressBar.style.width = `${progress}%`;
        percentText.innerText = `${Math.floor(progress)}%`;
        
        // Dynamic "Real Glitch" Displacement
        applyRealGlitch();
    }, interval);
}

function applyRealGlitch() {
    const filter = document.querySelector('#real-glitch feDisplacementMap');
    const noise = document.querySelector('#real-glitch feTurbulence');
    if (filter && noise) {
        // Randomly trigger intense glitch "crashes"
        if (Math.random() > 0.95) {
            filter.setAttribute('scale', Math.random() * 30 + 10); // Reduced scale for "smaller" look
            noise.setAttribute('baseFrequency', `${Math.random() * 0.1} ${Math.random() * 0.15}`);
        } else {
            filter.setAttribute('scale', Math.random() * 3); // More subtle jitter
            noise.setAttribute('baseFrequency', `0.01 0.1`);
        }
    }
}

function finishLoading() {
    setTimeout(() => {
        preloader.classList.add('preloader-hidden');
        body.style.overflowY = 'auto'; // Restore scroll
        
        // Trigger reveal animations for the main site
        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => {
                el.classList.add('active');
            });
        }, 300);
    }, 500);
}

window.addEventListener('load', initPreloader);

// HUD SYSTEM: High-Inertia Parallax & Global Micro-Drift
const hudGrid = document.querySelector('.hud-grid-overlay');
const hudShards = document.querySelector('.hud-shards-layer');
const canvas = document.getElementById('hero-particles');
const ctx = canvas.getContext('2d');
const heroSection = document.getElementById('hero');

let particles = [];
let orbs = [];
let mouse = { x: 0, y: 0 };
let cursorX = 0;
let cursorY = 0;

// Custom Cursor Elements
const cursorDot = document.querySelector('.cursor-dot');

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    
    // Update Custom Cursor
    if (cursorDot) {
        cursorDot.style.left = `${e.x}px`;
        cursorDot.style.top = `${e.y}px`;
        cursorDot.style.opacity = '1';
    }
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
        this.color = Math.random() > 0.8 ? 'rgba(255, 31, 31, 0.25)' : 'rgba(255, 255, 255, 0.1)';
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
            this.x -= dx / 100;
            this.y -= dy / 100;
        }

        if (this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class GlowOrb {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 150 + 50;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.speedY = Math.random() * 0.3 - 0.15;
        this.opacity = Math.random() * 0.08 + 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
    }

    draw() {
        let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `rgba(255, 31, 31, ${this.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 31, 31, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Tactical Click Spark Particle
class Spark {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8;
        this.opacity = 1;
        this.decay = Math.random() * 0.03 + 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= this.decay;
        this.size *= 0.95;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 31, 31, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

let sparks = [];

function initHUDSystem() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    orbs = [];
    sparks = [];
    for (let i = 0; i < 35; i++) particles.push(new Particle());
    for (let i = 0; i < 2; i++) orbs.push(new GlowOrb());
}

function updateHUDParallax() {
    const scrollDelta = window.scrollY;
    const moveX = (mouse.x / window.innerWidth - 0.5) * 2;
    const moveY = (mouse.y / window.innerHeight - 0.5) * 2;

    if (hudGrid) {
        hudGrid.style.transform = `perspective(1000px) rotateX(60deg) translateY(${-20 + scrollDelta * 0.06}%) translateX(${moveX * -10}px)`;
    }

    if (hudShards) {
        hudShards.style.transform = `translateY(${scrollDelta * -0.12}px) translateX(${moveX * 15}px)`;
    }

    if (heroSection) {
        heroSection.style.backgroundPosition = `calc(100% + ${moveX}%) calc(50% + ${moveY}%)`;
        const flare = document.querySelector('.mouse-flare');
        if (flare) {
            flare.style.left = `${mouse.x}px`;
            flare.style.top = `${mouse.y}px`;
        }
    }
}

function animateHUD() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateHUDParallax();
    
    // Draw Background Depth
    orbs.forEach(o => { o.update(); o.draw(); });
    particles.forEach(p => { p.update(); p.draw(); });
    
    // Draw Tactical Sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
        sparks[i].update();
        sparks[i].draw();
        if (sparks[i].opacity <= 0) sparks.splice(i, 1);
    }

    requestAnimationFrame(animateHUD);
}

// Global Click Spark Listener
window.addEventListener('mousedown', (e) => {
    for (let i = 0; i < 12; i++) {
        sparks.push(new Spark(e.clientX, e.clientY));
    }
});

// Subtle Hero Glitch-Text System (Heartbeat Pulse)
function triggerSubtleGlitch() {
    // Sharp rhythmic flicker (Heartbeat feel)
    if (heroSection) {
        heroSection.classList.add('glitch-active');
        setTimeout(() => {
            heroSection.classList.remove('glitch-active');
            
            // Occasional double-flicker for realism
            if (Math.random() > 0.7) {
                setTimeout(() => {
                    heroSection.classList.add('glitch-active');
                    setTimeout(() => heroSection.classList.remove('glitch-active'), 50);
                }, 80);
            }
        }, 120);
    }
    
    // Heartbeat frequency: every 12-18 seconds
    const interval = Math.random() * 6000 + 12000;
    setTimeout(triggerSubtleGlitch, interval);
}

window.addEventListener('resize', initHUDSystem);
initHUDSystem();
animateHUD();
setTimeout(triggerSubtleGlitch, 8000);

// Typing Effect for Hero Section
const typedTextElement = document.getElementById('typed-text');
const categories = ["Competitive", "Action", "Tutorials", "Funny Moments", "Valorant", "GTA V", "Among Us"];
let categoryIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function type() {
    const currentCategory = categories[categoryIndex];
    
    if (isDeleting) {
        typedTextElement.textContent = currentCategory.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
    } else {
        typedTextElement.textContent = currentCategory.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentCategory.length) {
        isDeleting = true;
        typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        categoryIndex = (categoryIndex + 1) % categories.length;
        typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
}

// Navbar background toggle
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Stats Counter Animation
const counters = document.querySelectorAll('.counter');
const speed = 200; // Lower is slower

const startCounter = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
            observer.unobserve(counter);
        }
    });
};

const counterObserver = new IntersectionObserver(startCounter, {
    threshold: 0.5
});

counters.forEach(counter => counterObserver.observe(counter));

// Scroll Reveal Animation (Fixing duplicated logic and initializing typing)
const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = (entries, observer) => {
    let delay = 0;
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            // Apply staggered delay for category cards specifically
            if (entry.target.classList.contains('category-card')) {
                entry.target.style.transitionDelay = `${delay}s`;
                delay += 0.15;
            }
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
};

const revealObserver = new IntersectionObserver(revealOnScroll, {
    threshold: 0.1
});

revealElements.forEach(element => revealObserver.observe(element));

// Category Card Mouse Parallax
const categoryCards = document.querySelectorAll('.category-card');
categoryCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;
        
        const img = card.querySelector('img');
        if (img) {
            // Subtle tilt and shift
            img.style.transform = `scale(1.1) translate(${deltaX * 15}px, ${deltaY * 15}px) rotateX(${deltaY * -5}deg) rotateY(${deltaX * 5}deg)`;
        }
    });
    
    card.addEventListener('mouseleave', () => {
        const img = card.querySelector('img');
        if (img) {
            img.style.transform = 'scale(1.1) translate(0, 0) rotateX(0) rotateY(0)';
        }
    });
});

// Vanguard Armory Mission Data
const vanguardData = {
    'valorant': {
        title: 'VALORANT TACTICAL PRECISION',
        desc: 'Master the art of tactical precision. Join NEW BRON in the high-stakes world of VALORANT, where ability mastery and team coordination define victory. Explore our latest agent guides and clutch highlights.',
        image: 'assets/armory/valorant.png',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Valorant_logo_-_pink_color_version.svg/1200px-Valorant_logo_-_pink_color_version.svg.png',
        link: 'https://www.youtube.com/@NEW-BRON/search?query=valorant'
    },
    'gta': {
        title: 'GTA V LOS SANTOS UNDERWORLD',
        desc: 'Navigating the chaotic underworld of Los Santos. From high-octane heists to the funniest moments in GTA Online, experience the ultimate open-world adventure with the squad.',
        image: 'assets/armory/gta.png',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Grand_Theft_Auto_V_logo.svg/1200px-Grand_Theft_Auto_V_logo.svg.png',
        link: 'https://www.youtube.com/@NEW-BRON/search?query=gta'
    },
    'amongus': {
        title: 'AMONG US SPATIAL SUSPENSE',
        desc: 'Trust no one. Dive into the spatial suspense of Among Us. Watch the most galaxy-brained plays and hilarious betrayals as we decode the impostors.',
        image: 'assets/armory/amongus.png',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Among_Us_Logo.svg/1200px-Among_Us_Logo.svg.png',
        link: 'https://www.youtube.com/@NEW-BRON/search?query=amongus'
    },
    'cs2': {
        title: 'CS 2 COMPETITIVE MASTERY',
        desc: 'The global offensive continues. Experience the next generation of tactical shooters with NEW BRON\'s CS2 competitive archives. Strategic maneuvers and pro-level highlights await.',
        image: 'assets/armory/cs2.png',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Counter-Strike_2_logo.png/1200px-Counter-Strike_2_logo.png',
        link: 'https://www.youtube.com/@NEW-BRON/search?query=cs2'
    },
    'raft': {
        title: 'RAFT OCEAN SURVIVAL LOGS',
        desc: 'Survive the vast blue. Build, sail, and conquer the ocean\'s dangers. Experience the ultimate survival journey from a simple wooden plank to a luxury sea fortress.',
        image: 'assets/armory/raft.png',
        logo: 'https://raft-game.com/img/footer_logo.png',
        link: 'https://www.youtube.com/@NEW-BRON/search?query=raft'
    }
};

const armoryModal = document.getElementById('armory-modal');
const modalClose = document.getElementById('modal-close');

function openArmory(gameKey) {
    const data = vanguardData[gameKey];
    if (!data) return;

    // Populate Modal
    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-desc').textContent = data.desc;
    document.getElementById('modal-image').src = data.image;
    document.getElementById('modal-link').href = data.link;

    // Trigger Animation
    armoryModal.classList.add('active');
    
    // Lock Body Scroll
    document.body.style.overflow = 'hidden';
}

function closeArmory() {
    armoryModal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Explicitly restore scroll
}

if (modalClose) {
    modalClose.addEventListener('click', closeArmory);
}

// Close on background click
armoryModal.addEventListener('click', (e) => {
    if (e.target === armoryModal) closeArmory();
});

// Close on Escape Key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeArmory();
});

// Initialize Typing and Other Final Drivers
window.addEventListener('load', () => {
    type();
});

// Dynamic Video Container (Placeholder for Future YT Integration)
const videoContainer = document.getElementById('video-container');

/**
 * LIVE DATA UPDATES
 * To connect to the real YouTube Data API:
 * 1. Get an API Key from Google Cloud Console.
 * 2. Use fetch() to call https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UC...&key=YOUR_API_KEY
 * 3. Update the 'data-target' attributes and innerHTML of the counters.
 */

function simulateLiveUpdates() {
    // Occasionally increment views to simulate "All Time Update"
    setInterval(() => {
        const viewCounter = document.querySelector('.stat-card:nth-child(3) .counter');
        if (viewCounter) {
            let currentTarget = parseInt(viewCounter.getAttribute('data-target'));
            let newTarget = currentTarget + Math.floor(Math.random() * 5); // Add 0-4 views 
            viewCounter.setAttribute('data-target', newTarget);
            viewCounter.innerText = newTarget;
        }
    }, 10000); // Every 10 seconds
}

/**
 * VIDEO SLIDER: INDEPENDENT DATA HORIZONS
 * Handles scrolling for Videos and Lives separately.
 */
document.querySelectorAll('.video-slider-container').forEach(container => {
    const grid = container.querySelector('.video-grid');
    const prev = container.querySelector('.slider-arrow.left');
    const next = container.querySelector('.slider-arrow.right');

    if (grid && prev && next) {
        next.addEventListener('click', () => {
            const cardWidth = grid.querySelector('.video-card').offsetWidth + 30;
            grid.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });

        prev.addEventListener('click', () => {
            const cardWidth = grid.querySelector('.video-card').offsetWidth + 30;
            grid.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });

        // Auto-hide arrows based on scroll position
        grid.addEventListener('scroll', () => {
            const maxScroll = grid.scrollWidth - grid.clientWidth;
            prev.style.opacity = grid.scrollLeft <= 10 ? '0.2' : '1';
            next.style.opacity = grid.scrollLeft >= maxScroll - 10 ? '0.2' : '1';
        });

        // Kinetic Drag-to-Scroll Support
        let isDown = false;
        let startX;
        let scrollLeft;

        grid.addEventListener('mousedown', (e) => {
            isDown = true;
            grid.classList.add('grabbing');
            startX = e.pageX - grid.offsetLeft;
            scrollLeft = grid.scrollLeft;
            grid.style.scrollSnapType = 'none';
        });

        grid.addEventListener('mouseleave', () => {
            isDown = false;
            grid.classList.remove('grabbing');
        });

        grid.addEventListener('mouseup', () => {
            isDown = false;
            grid.classList.remove('grabbing');
            grid.style.scrollSnapType = 'x mandatory';
        });

        grid.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - grid.offsetLeft;
            const walk = (x - startX) * 2;
            grid.scrollLeft = scrollLeft - walk;
        });
    }
});

simulateLiveUpdates();

// Mobile Hamburger Menu Logic
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
        // Change icon between bars and times
        const icon = hamburger.querySelector('i');
        if (icon) {
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });

    // Close menu when a link is clicked (useful on one-page smooth scroll)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
}

console.log("NEW BRON. Twin Horizon Engine Finalized 🚀");
