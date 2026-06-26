/* ===================================
   VOIDTUNE v2.0 MUSIC PLAYER
   With PWA Support & Audio Visualizer
   =================================== */

// ========== SONG DATABASE ==========
const songs = [
    {
        title: "Fool's Gold - Buffalo Traffic Jam",
        artist: "Buffalo Traffic Jam",
        src: "https://files.catbox.moe/r53p57.m4a",
        cover: "https://resources.tidal.com/images/b77634fe/2498/4185/8152/297690f5b2f1/1280x1280.jpg"
    },
    {
        title: "Ordinary Person",
        artist: "Leo",
        src: "https://files.catbox.moe/8td2vx.m4a",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyBi9Ro2nH0KakG39r64lulgeyZszQHVvw-oQrpanOhw&s=10"
    }
];

// ========== DOM ELEMENTS ==========
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeSlider = document.getElementById('volumeSlider');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const albumCover = document.getElementById('albumCover');
const pulseRing = document.getElementById('pulseRing');
const canvas = document.getElementById('visualizerCanvas');
const ctx = canvas.getContext('2d');

// ========== STATE VARIABLES ==========
let currentSongIndex = 0;
let isPlaying = false;
let audioContext = null;
let analyser = null;
let dataArray = null;
let bufferLength = 0;
let animationId = null;

// ========== PWA VARIABLES ==========
let deferredPrompt = null;
const installPrompt = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');
const dismissBtn = document.getElementById('dismissBtn');

// ====== iOS / PWA Lock Screen Metadata ======
function updateIOSMediaInfo() {
    if ('mediaSession' in navigator) {
        const song = songs[currentSongIndex];

        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            artwork: [
                { src: song.cover, sizes: '512x512', type: 'image/png' }
            ]
        });

        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
}

// ========== INITIALIZE PLAYER ==========
function initPlayer() {
    // Set canvas size
    canvas.width = 320;
    canvas.height = 320;

    // Set initial volume
    audioPlayer.volume = 0.7;

    // Load first song
    loadSong(currentSongIndex);

    // Event listeners for player controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    volumeSlider.addEventListener('input', changeVolume);
    audioPlayer.addEventListener('ended', playNext);

    // Initialize audio context on first user interaction
    document.body.addEventListener('click', initAudioContext, { once: true });
}

// ========== AUDIO CONTEXT & VISUALIZER SETUP ==========
function initAudioContext() {
    if (audioContext) return; // Already initialized

    try {
        // Create audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create analyser node
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512; // Higher for smoother circular waveform
        analyser.smoothingTimeConstant = 0.8; // Smooth transitions
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Connect audio element to analyser
        const source = audioContext.createMediaElementSource(audioPlayer);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        console.log('Audio visualizer initialized');
    } catch (error) {
        console.error('Audio context initialization failed:', error);
    }
}

// ========== VISUALIZER DRAWING FUNCTION ==========



// ========== LOAD SONG ==========
function loadSong(index) {
    const song = songs[index];
    audioPlayer.src = song.src;
    albumCover.src = song.cover;

    songTitle.textContent = song.title;
    artistName.textContent = song.artist;

    // Update lock screen info
    updateIOSMediaInfo();
}

// ========== TOGGLE PLAY/PAUSE ==========
function togglePlayPause() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

// ========== PLAY SONG ==========
function playSong() {
    // Resume audio context if suspended
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    audioPlayer.play();
    isPlaying = true;

    // Update UI
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    playPauseBtn.classList.add('playing');
    pulseRing.classList.add('active');

    // Update song info
    const song = songs[currentSongIndex];
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;

    // Update lock screen info
    updateIOSMediaInfo();

    // Start visualizer
    drawVisualizer();
}

// ========== PAUSE SONG ==========
function pauseSong() {
    audioPlayer.pause();
    isPlaying = false;

    // Update UI
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    playPauseBtn.classList.remove('playing');
    pulseRing.classList.remove('active');

    // Update lock screen info
    updateIOSMediaInfo();

    // Stop visualizer animation
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// ========== PLAY NEXT SONG ==========
function playNext() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);

    if (isPlaying) {
        playSong();
    }
}

// ========== PLAY PREVIOUS SONG ==========
function playPrevious() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);

    if (isPlaying) {
        playSong();
    }
}

// ========== CHANGE VOLUME ==========
function changeVolume() {
    const volume = volumeSlider.value / 100;
    audioPlayer.volume = volume;
}

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowRight':
            e.preventDefault();
            playNext();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            playPrevious();
            break;
    }
});

/* ===================================
   PWA INSTALLATION FUNCTIONALITY
   =================================== */

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installPrompt.style.display = 'flex';
});

// Install button click handler
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
        installPrompt.style.display = 'none';
    });
}

// Dismiss button click handler
if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
        installPrompt.style.display = 'none';
    });
}

// Listen for app installation
window.addEventListener('appinstalled', () => {
    console.log('VoidTune installed successfully!');
    installPrompt.style.display = 'none';
    deferredPrompt = null;
});

/* ===================================
   INTRO SCREEN LOGIC
   =================================== */
function initIntro() {
    const introScreen = document.getElementById('introScreen');
    const transitionScreen = document.getElementById('transitionScreen');
    const playerWrapper = document.getElementById('playerWrapper');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');

    // Make "No" button run away on mouseover / touchstart
    function runAway() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const btnW = noBtn.offsetWidth;
        const btnH = noBtn.offsetHeight;

        const randomX = Math.floor(Math.random() * (vw - btnW - 20)) - noBtn.getBoundingClientRect().left;
        const randomY = Math.floor(Math.random() * (vh - btnH - 20)) - noBtn.getBoundingClientRect().top;

        noBtn.style.position = 'fixed';
        noBtn.style.left = (Math.random() * (vw - btnW - 20) + 10) + 'px';
        noBtn.style.top = (Math.random() * (vh - btnH - 20) + 10) + 'px';
    }

    noBtn.addEventListener('mouseover', runAway);
    noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); runAway(); }, { passive: false });

    // Yes button — show transition then player
    yesBtn.addEventListener('click', () => {
        introScreen.style.display = 'none';
        transitionScreen.style.display = 'flex';

        setTimeout(() => {
            transitionScreen.style.display = 'none';
            playerWrapper.style.display = 'block';
            initPlayer();
        }, 2200);
    });
}

/* ===================================
   INITIALIZE ON PAGE LOAD
   =================================== */
window.addEventListener('DOMContentLoaded', initIntro);




