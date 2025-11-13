
// ========== SONG DATABASE ==========

const songs = [
    {
        title: "Midnight Dreams",
        artist: "Luna Eclipse",
        src: "https://files.catbox.moe/5xaxqo.mp3",
        cover: "https://images.unsplash.com/photo-1695893155131-5edd46be086c?q=80&w=w=400&h=400&fit=crop"
    },
    {
        title: "Neon Nights",
        artist: "Cyber Wave",
        src: "https://files.catbox.moe/5xaxqo.mp3",
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"
    },
    {
        title: "Void Space",
        artist: "Stellar Echo",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop"
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

// ========== STATE VARIABLES ==========
let currentSongIndex = 0;
let isPlaying = false;

// ========== INITIALIZE PLAYER ==========
function initPlayer() {
    // Set initial volume (70%)
    audioPlayer.volume = 0.7;
    
    // Load first song
    loadSong(currentSongIndex);
    
    // Add event listeners
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    volumeSlider.addEventListener('input', changeVolume);
    audioPlayer.addEventListener('ended', playNext);
}

// ========== LOAD SONG ==========
function loadSong(index) {
    const song = songs[index];
    audioPlayer.src = song.src;
    albumCover.src = song.cover;
    
    // Update song info only if playing or has been played
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
    audioPlayer.play();
    isPlaying = true;
    
    // Update UI
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    playPauseBtn.classList.add('playing');
    pulseRing.classList.add('active');
    
    // Update song info when first played
    const song = songs[currentSongIndex];
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
}

// ========== PAUSE SONG ==========
function pauseSong() {
    audioPlayer.pause();
    isPlaying = false;
    
    // Update UI
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    playPauseBtn.classList.remove('playing');
    pulseRing.classList.remove('active');
}

// ========== PLAY NEXT SONG ==========
function playNext() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    
    if (isPlaying) {
        playSong();
    } else {
        // If not playing, still update info for next song
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
        // If not playing, still update info for previous song
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



// ========== KEYBOARD SHORTCUTS (OPTIONAL) ==========
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

// ========== INITIALIZE ON PAGE LOAD ==========
window.addEventListener('DOMContentLoaded', initPlayer);

