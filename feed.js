class KillFeedTerminal {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.maxItems = 15;
        this.events = [
            { type: 'kill', text: '[KILL]: NEW-BRON ELIMINATED TARGET_041' },
            { type: 'kill', text: '[KILL]: NEW-BRON -> DOUBLE_KILL -> TARGET_012' },
            { type: 'objective', text: '[OBJ]: SPIKE_PLANTED -> SITE_A' },
            { type: 'objective', text: '[OBJ]: TARGET_HEIST_COMPLETE' },
            { type: 'system', text: '[SYS]: DATA_SYNC_OPTIMAL' },
            { type: 'kill', text: '[KILL]: NEW-BRON -> HEADSHOT -> TARGET_099' },
            { type: 'system', text: '[SYS]: PERF_MODE_ENGAGED' }
        ];
        this.init();
    }

    init() {
        if (!this.container) return;
        
        // Initial "Sync" sequence
        setTimeout(() => this.addItem('system', '[SYS]: BOOTING_HUD_MODULES...'), 500);
        setTimeout(() => this.addItem('system', '[SYS]: LIVE_FEED_ESTABLISHED'), 1200);
        
        // Start live simulation
        this.startStream();
    }

    addItem(type, text) {
        const item = document.createElement('div');
        item.className = `feed-item ${type}`;
        item.innerText = text;
        
        this.container.appendChild(item);
        
        if (this.container.children.length > this.maxItems) {
            this.container.removeChild(this.container.firstChild);
        }
        
        // Auto-scroll to bottom
        this.container.scrollTop = this.container.scrollHeight;
    }

    startStream() {
        const nextEvent = () => {
            const delay = Math.random() * 4000 + 2000; // 2-6s between events
            setTimeout(() => {
                const event = this.events[Math.floor(Math.random() * this.events.length)];
                this.addItem(event.type, event.text);
                nextEvent();
            }, delay);
        };
        nextEvent();
    }
}

// Initialize when simple reveal happens
const feedObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            new KillFeedTerminal('kill-feed');
            feedObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const feedModule = document.querySelector('.feed-module');
if (feedModule) feedObserver.observe(feedModule);
