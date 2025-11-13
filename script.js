/* ===================================
   VOIDTUNE v2.0 MUSIC PLAYER
   With PWA Support & Audio Visualizer
   =================================== */

// ========== SONG DATABASE ==========
const songs = [
    {
        title: "Tu - (Slowed)",
        artist: "Talwinder",
        src: "https://files.catbox.moe/5xaxqo.mp3",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5BV8Cxx2uQDi3eetWut5WQId8kzKiVaP3KQ&s"
    },
     {
        title: "Teri Galliyan (Slowed) ",
        artist: "BMW ",
        src: "https://files.catbox.moe/p5z4g2.mp3",
        cover: "https://www.stickersmurali.com/it/img/asfs2027-jpg/folder/products-listado-merchant/adesivi-logo-bmw-2.jpg"
    },
    {
        title: "Going High",
        artist: "Pure Vibe",
        src: "https://files.catbox.moe/x2jdih.mp3",
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"
    },
    {
        title: "Hold Out",
        artist: "Talha Anjum, Shareh",
        src: "https://files.catbox.moe/76cbl3.mp3",
        cover: "https://wallpapers.com/images/thumbnail/boy-smoke-with-hand-on-face-90eo6h8ccp71qgha.jpg"
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
    
    if (isPlaying || audioPlayer.currentTime > 0) {
        songTitle.textContent = song.title;
        artistName.textContent = song.artist;
    }
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
    } else {
        const song = songs[currentSongIndex];
        songTitle.textContent = song.title;
        artistName.textContent = song.artist;
    }
}

// ========== PLAY PREVIOUS SONG ==========
function playPrevious() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    
    if (isPlaying) {
        playSong();
    } else {
        const song = songs[currentSongIndex];
        songTitle.textContent = song.title;
        artistName.textContent = song.artist;
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
    // Prevent default prompt
    e.preventDefault();
    
    // Store event for later use
    deferredPrompt = e;
    
    // Show custom install prompt
    installPrompt.style.display = 'flex';
});

// Install button click handler
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        // Show native install prompt
        deferredPrompt.prompt();
        
        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        
        // Clear prompt
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
   INITIALIZE ON PAGE LOAD
   =================================== */

window.addEventListener('DOMContentLoaded', initPlayer);
