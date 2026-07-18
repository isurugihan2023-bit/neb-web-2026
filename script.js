// --- Navbar Scroll Effect ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- Dynamic Text in Discord Presence ---
const dynamicText = document.querySelector('.dp-dynamic-text');
const statuses = ["100+ SERVERS", "24/7 MUSIC", "PLAYING LOFI RADIO", "LISTENING TO COMMANDS"];
let statusIndex = 0;

setInterval(() => {
    dynamicText.style.opacity = 0;
    setTimeout(() => {
        statusIndex = (statusIndex + 1) % statuses.length;
        dynamicText.textContent = statuses[statusIndex];
        dynamicText.style.opacity = 1;
    }, 300);
}, 4000);

// --- Stat Counters Animation ---
const statElements = document.querySelectorAll('.stat-number');
const animateStats = () => {
    statElements.forEach(el => {
        const target = parseFloat(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix');
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                // If it's a decimal number (like uptime)
                if (target % 1 !== 0) {
                    el.textContent = current.toFixed(2) + suffix;
                } else {
                    el.textContent = Math.ceil(current) + suffix;
                }
                requestAnimationFrame(updateCounter);
            } else {
                el.textContent = target + suffix;
            }
        };
        updateCounter();
    });
};

// Trigger stats animation when scrolled into view
const statsSection = document.getElementById('stats');
let statsAnimated = false;

window.addEventListener('scroll', () => {
    if (statsAnimated) return;
    const rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
        animateStats();
        statsAnimated = true;
    }
});

// --- Scroll Reveal Animations ---
const reveals = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 100;
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('visible');
        }
    }
};

window.addEventListener('scroll', revealOnScroll);
revealOnScroll(); // Trigger once on load

// --- Real-time Bot Stats Sync ---
async function fetchBotStats() {
    try {
        // Fetch via Vercel Proxy to avoid HTTPS Mixed Content error
        const response = await fetch('/api/bot-stats');
        if (!response.ok) return;
        const data = await response.json();
        
        // Use REAL uptime, but make the bot look popular for servers and members
        data.servers = data.servers < 100 ? 100 : data.servers;
        data.members = data.members < 500 ? 500 : data.members;
        
        // Update Hero Chips
        document.getElementById('hero-servers').textContent = data.servers + '+';
        document.getElementById('hero-members').textContent = data.members.toLocaleString() + '+';
        document.getElementById('hero-uptime').textContent = data.uptime;
        
        // Update fake ping every 3 seconds
        if (!window.lastPingTime || Date.now() - window.lastPingTime > 3000) {
            window.lastFakePing = Math.floor(Math.random() * (50 - 38 + 1)) + 38 + 'ms';
            window.lastPingTime = Date.now();
        }
        document.getElementById('hero-ping').textContent = window.lastFakePing;

        // Update Big Stats section dynamically
        const serverStat = document.getElementById('server-count-stat');
        if (serverStat && serverStat.textContent !== '0' && serverStat.textContent !== '0+') {
            serverStat.textContent = data.servers + '+';
        }
        const userStat = document.getElementById('user-count-stat');
        if (userStat && userStat.textContent !== '0' && userStat.textContent !== '0+') {
            userStat.textContent = data.members.toLocaleString() + '+';
        }
        
        // Update About Section Ping
        const aboutPing = document.getElementById('about-ping');
        if (aboutPing) {
            aboutPing.textContent = window.lastFakePing;
        }
    } catch (e) {
        console.log("Error updating stats", e);
    }
}

fetchBotStats();
setInterval(fetchBotStats, 1000);

/* --- Private Beta Modal Logic --- */
function openPrivateModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('privateModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closePrivateModal() {
    const modal = document.getElementById('privateModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Close modal when clicking outside of the content box
window.addEventListener('click', function(event) {
    const modal = document.getElementById('privateModal');
    if (event.target === modal) {
        closePrivateModal();
    }
});

// 🎧 Lofi Player Logic
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('lofi-audio');
    const playBtn = document.getElementById('lofi-play-btn');
    const visualizer = document.getElementById('lofi-visualizer');
    
    if (audio && playBtn) {
        // Adjust audio volume slightly for a chill background vibe
        audio.volume = 0.4;
        
        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                visualizer.classList.add('active');
            } else {
                audio.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                visualizer.classList.remove('active');
            }
        });
        
        // Handle stream errors
        audio.addEventListener('error', () => {
            console.error("Error playing Lofi stream.");
            playBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            visualizer.classList.remove('active');
        });
    }
});
