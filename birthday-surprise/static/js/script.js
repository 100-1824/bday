document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. COUNTDOWN TIMER ---
    const countdownEl = document.getElementById('countdown');
    const targetDate = new Date();
    const currentYear = targetDate.getFullYear();
    // Month is 0-indexed in JS (Jan = 0)
    let bday = new Date(currentYear, 0, 30); // Jan 30th

    // If birthday passed this year, look to next year
    if (Date.now() > bday) {
        bday.setFullYear(currentYear + 1);
    }

    function updateCountdown() {
        const now = new Date();
        const diff = bday - now;

        if (diff <= 0) {
            countdownEl.innerHTML = "<div>It's Today! Happy Birthday! 🎉</div>";
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownEl.innerHTML = `
            <div class="timer-box">
                <span class="time">${days}</span><span class="label">Days</span>
            </div>
            <div class="timer-box">
                <span class="time">${hours}</span><span class="label">Hrs</span>
            </div>
            <div class="timer-box">
                <span class="time">${minutes}</span><span class="label">Mins</span>
            </div>
            <div class="timer-box">
                <span class="time">${seconds}</span><span class="label">Secs</span>
            </div>
        `;
    }
    
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // --- 2. FALLING PETALS ANIMATION (Canvas Confetti) ---
    // We create a custom shape or just use colorful circles/ovals to look like petals
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const duration = 15 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 2,
            angle: 270, // Straight down
            spread: 90, // Wide spread
            origin: { y: -0.1, x: Math.random() }, // Start from top
            colors: ['#E0C3FC', '#9CA3DB', '#F3E5F5'], // Lavender shades
            shapes: ['circle'],
            gravity: 0.5,
            scalar: 0.8,
            drift: 0,
            fullScreen: false // We are targeting a canvas, but simple global confetti works too
            // Note: Canvas-confetti by default uses a global canvas unless specified. 
            // For simplicity in this script, we'll let it use the default global one which overlays nicely.
        });

        // Keep it going indefinitely for the "atmosphere"
        requestAnimationFrame(frame);
    }());


    // --- 3. CONNECTION MAP (Leaflet) ---
    // MY_COORDS and HER_COORDS are global vars passed from HTML
    const map = L.map('map').setView([20, 0], 2); // Global view initially

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Custom Heart Icon
    const heartIcon = L.divIcon({
        className: 'custom-div-icon',
        html: "<div style='background-color:#6A4C93;width:15px;height:15px;border-radius:50%;box-shadow:0 0 10px #6A4C93;'></div>",
        iconSize: [15, 15],
        iconAnchor: [7, 7]
    });

    const marker1 = L.marker(MY_COORDS, {icon: heartIcon}).addTo(map);
    const marker2 = L.marker(HER_COORDS, {icon: heartIcon}).addTo(map);

    // Draw Line
    const latlngs = [MY_COORDS, HER_COORDS];
    const polyline = L.polyline(latlngs, {
        color: '#9CA3DB',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10', 
        lineCap: 'round'
    }).addTo(map);

    // Fit map to show both points with padding
    map.fitBounds(polyline.getBounds(), {padding: [50, 50]});


    // --- 4. REASONS GENERATOR ---
    // REASONS is global var from HTML
    const reasonsBtn = document.getElementById('heart-btn');
    const reasonDisplay = document.getElementById('reason-display');
    
    // Animation trigger
    reasonsBtn.addEventListener('click', () => {
        // Animate button
        gsap.fromTo(reasonsBtn, {scale: 0.8}, {scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)"});

        // Fade out text
        gsap.to(reasonDisplay, {opacity: 0, duration: 0.2, onComplete: () => {
            // Pick random reason
            const randomReason = REASONS[Math.floor(Math.random() * REASONS.length)];
            reasonDisplay.innerText = randomReason;
            // Fade in text
            gsap.to(reasonDisplay, {opacity: 1, duration: 0.5});
        }});
        
        // Burst of confetti on the heart
        const rect = reasonsBtn.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        
        confetti({
            particleCount: 30,
            spread: 60,
            origin: { x: x, y: y },
            colors: ['#ff6b81', '#E0C3FC'],
            disableForReducedMotion: true
        });
    });


    // --- 5. MUSIC PLAYER ---
    const musicBtn = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-music');
    let isPlaying = false;

    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            musicBtn.innerText = "🎵 Play Music";
            isPlaying = false;
        } else {
            audio.play().then(() => {
                musicBtn.innerText = "⏸ Pause Music";
                isPlaying = true;
            }).catch(e => {
                alert("Please interact with the document first (browser policy).");
            });
        }
    });

});
