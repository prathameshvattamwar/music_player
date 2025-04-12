document.addEventListener("DOMContentLoaded", () => {
  // --- Get DOM Elements ---
  const musicContainer = document.getElementById("music-container");
  const playerCard = document.querySelector(".player-card");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const playPauseIcon = document.getElementById("play-pause-icon");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const repeatBtn = document.getElementById("repeat-btn");
  // Removed repeatIcon/Indicator refs, will handle via class

  const audioElement = document.getElementById("audio-element");
  const progressContainer = document.getElementById("progress-container");
  const progress = document.getElementById("progress");
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");

  const volumeSlider = document.getElementById("volume-slider");
  const volumeProgress = document.getElementById("volume-progress");
  const volumeIconLow = document.getElementById("volume-icon-low"); // Renamed for clarity
  const volumeIconHigh = document.getElementById("volume-icon-high"); // Renamed for clarity

  const trackTitle = document.getElementById("track-title");
  const trackArtist = document.getElementById("track-artist");
  const albumArt = document.getElementById("album-art");
  const artPlaceholder = document.querySelector(".art-placeholder"); // Get placeholder

  const playlistElement = document.getElementById("playlist");

  // --- State Variables ---
  let isPlaying = false;
  let currentTrackIndex = 0;
  let isShuffle = false;
  let repeatMode = 0; // 0: off, 1: repeat one, 2: repeat all
  let originalPlaylist = []; // To store the original order for unshuffling
  let playlist = []; // Will be populated

  // --- Playlist Data (Example - REPLACE!) ---
  const trackData = [
    {
      title: "Ishq Hai Ye",
      artist: "Shreya Ghoshal, Irshad Kamil, Pritam Chakraborty",
      src: "ishqhai.mp3",
      cover: "ishqhai.jpg",
    },
    {
      title: "Zaroor",
      artist: "Aparshakti Khurana, Savi Kahlon",
      src: "zaroor.mp3",
      cover: "zaroor.jpg",
    },
    {
      title: "Jo Tu Mil Gaya",
      artist: "Tulsi Kumar, Jubin Nautiyal, Srikanth",
      src: "jo_tu_mil_gaya.mp3",
      cover: "jo_tu_mil_gaya.jpg",
    },
    {
      title: "Yeda Yung Bombay Mashup",
      artist: "YUNG DSA, Year Down",
      src: "yeda_yung.mp3",
      cover: "yeda_yung.jpg",
    },
    {
      title: "Nadaaniyan",
      artist: "Akshath Acharya",
      src: "nadaaniya.mp3",
      cover: "nadaaniya.jpg",
    },
    // Add more tracks here
  ];

  // --- Core Functions ---

  // Load track details into DOM
  function loadTrack(trackIndex) {
    if (trackIndex < 0 || trackIndex >= playlist.length) {
      console.error("Invalid track index:", trackIndex);
      return; // Prevent errors with invalid index
    }
    const track = playlist[trackIndex];
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    audioElement.src = track.src;

    // Handle Album Art Loading
    albumArt.classList.remove("loaded"); // Hide current art
    albumArt.alt = `${track.title} - ${track.artist}`;
    albumArt.src = ""; // Clear src first to ensure 'load' event fires reliably
    albumArt.src = track.cover || "images/default-art.png"; // Set new source

    // Reset progress
    progress.style.width = "0%";
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";

    updatePlaylistUI();
    document.title = `${track.title} - ${track.artist}`; // Update page title

    // If track was playing, attempt to play the new one (might require user interaction first)
    if (isPlaying) {
      // Short delay might help ensure audio is ready after src change
      setTimeout(() => playTrack(), 50);
    }
  }

  // Handle image load success
  albumArt.onload = () => {
    albumArt.classList.add("loaded"); // Fade in the image
  };
  // Optional: Handle image load error
  albumArt.onerror = () => {
    console.warn("Failed to load album art:", albumArt.src);
    albumArt.src = "images/default-art.png"; // Fallback if cover fails
    albumArt.classList.add("loaded"); // Still show the placeholder fade out
  };

  // Play track
  function playTrack() {
    // Check if audio context requires user gesture
    if (audioElement.readyState >= 2) {
      // HAVE_CURRENT_DATA or more
      audioElement
        .play()
        .then(() => {
          isPlaying = true;
          playerCard.classList.add("playing");
          playPauseIcon.classList.replace("fa-play", "fa-pause");
          playPauseBtn.title = "Pause";
        })
        .catch((error) => {
          console.error("Playback Error:", error);
          // Usually happens if user hasn't interacted yet
          pauseTrack(); // Reset state if play fails
        });
    } else {
      // If not ready, wait for 'canplay' event (might be redundant with loadTrack logic)
      console.log("Audio not ready, waiting...");
      // Consider adding a temporary loading state visual cue
    }
  }

  // Pause track
  function pauseTrack() {
    isPlaying = false;
    playerCard.classList.remove("playing");
    playPauseIcon.classList.replace("fa-pause", "fa-play");
    playPauseBtn.title = "Play";
    audioElement.pause();
  }

  // Toggle Play/Pause
  function togglePlayPause() {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  }

  // Go to previous track (Handles shuffle)
  function prevTrack() {
    if (isShuffle) {
      currentTrackIndex = getRandomIndex(true); // Get random, avoid immediate repeat if possible
    } else {
      currentTrackIndex =
        (currentTrackIndex - 1 + playlist.length) % playlist.length; // Wrap around backward
    }
    loadTrack(currentTrackIndex);
  }

  // Go to next track (Handles shuffle, repeat) - Called by button & song end
  function nextTrackLogic() {
    if (isShuffle) {
      currentTrackIndex = getRandomIndex(true);
    } else {
      // Only wrap around if repeat all is OFF or not at the end
      if (repeatMode !== 2 && currentTrackIndex === playlist.length - 1) {
        // End of playlist, repeat is off or repeat-one
        // Behavior depends on how 'handleSongEnd' calls this
        // Generally, stop or go to 0 if called manually
        return false; // Indicate end reached without wrap/repeat-all
      } else {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length; // Wrap around forward
      }
    }
    loadTrack(currentTrackIndex);
    return true; // Indicate success
  }

  // Next button specific handler
  function nextBtnHandler() {
    const success = nextTrackLogic();
    if (!success && !isPlaying) {
      // If end reached sequentially and paused, go to start
      currentTrackIndex = 0;
      loadTrack(currentTrackIndex);
    } else if (isPlaying) {
      // If playing, ensure it continues
      playTrack(); // Or rely on loadTrack to handle it
    }
  }

  // Update progress bar and time display
  function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (duration && isFinite(duration)) {
      const progressPercent = (currentTime / duration) * 100;
      progress.style.width = `${progressPercent}%`;
      currentTimeEl.textContent = formatTime(currentTime);
    }
  }

  // Set progress bar when user clicks
  function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioElement.duration;

    if (duration && isFinite(duration)) {
      const newTime = (clickX / width) * duration;
      audioElement.currentTime = newTime;
      // Instantly update visuals if needed, though timeupdate should catch it
      progress.style.width = `${(newTime / duration) * 100}%`;
      currentTimeEl.textContent = formatTime(newTime);
    }
  }

  // Format time in M:SS
  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }

  // Update total duration display
  function updateDuration() {
    const duration = audioElement.duration;
    if (duration && isFinite(duration)) {
      durationEl.textContent = formatTime(duration);
    } else {
      durationEl.textContent = "0:00"; // Or "--:--"
    }
  }

  // --- Feature Functions (Shuffle, Repeat, Volume) ---

  // Toggle Shuffle
  function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
    shuffleBtn.title = isShuffle ? "Shuffle On" : "Shuffle Off";

    if (isShuffle) {
      // Save original order IF IT HASN'T BEEN SAVED YET
      if (originalPlaylist.length === 0) {
        originalPlaylist = [...playlist];
      }
      // Shuffle the current playlist, keeping the current song playing (at index 0)
      let currentSong = playlist[currentTrackIndex];
      let shuffled = playlist.filter((song) => song.src !== currentSong.src); // Get others
      shuffled.sort(() => Math.random() - 0.5); // Shuffle others
      playlist = [currentSong, ...shuffled]; // Rebuild playlist array
      currentTrackIndex = 0; // Current song is now index 0
      buildPlaylistUI(); // Rebuild UI to reflect new order
    } else if (originalPlaylist.length > 0) {
      // Restore original order
      let currentSongSrc = playlist[currentTrackIndex].src; // Get current song source before restoring
      playlist = [...originalPlaylist]; // Restore
      originalPlaylist = []; // Clear saved original
      // Find the index of the current song in the restored list
      currentTrackIndex = playlist.findIndex(
        (song) => song.src === currentSongSrc
      );
      if (currentTrackIndex === -1) currentTrackIndex = 0; // Fallback
      buildPlaylistUI(); // Rebuild UI
    }
    updatePlaylistUI(); // Ensure correct highlighting
  }

  // Cycle through repeat modes
  function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3; // 0 -> 1 -> 2 -> 0
    updateRepeatUI();
  }

  // Update Repeat button UI based on repeatMode
  function updateRepeatUI() {
    repeatBtn.classList.remove("active", "repeat-mode-one"); // Clear previous states
    // No need to hide/show indicator span, CSS handles it via 'repeat-mode-one' class

    switch (repeatMode) {
      case 0: // Off
        repeatBtn.title = "Repeat Off";
        break;
      case 1: // Repeat One
        repeatBtn.classList.add("active", "repeat-mode-one"); // Add both classes
        repeatBtn.title = "Repeat One";
        break;
      case 2: // Repeat All
        repeatBtn.classList.add("active"); // Only 'active' class
        repeatBtn.title = "Repeat All";
        break;
    }
  }

  // Handle song ending based on repeat/shuffle modes
  function handleSongEnd() {
    if (repeatMode === 1) {
      // Repeat the current track
      audioElement.currentTime = 0;
      playTrack();
    } else {
      // Attempt to play the next track logically (handles shuffle and repeat all)
      const movedNext = nextTrackLogic();
      if (movedNext) {
        playTrack(); // Autoplay the next track
      } else {
        // Reached end, repeat is off
        pauseTrack();
        currentTrackIndex = 0; // Go back to start visually
        loadTrack(currentTrackIndex); // Load first track but don't play
      }
    }
  }

  // Get a random index, optionally try to avoid immediate repeat
  function getRandomIndex(avoidCurrent = false) {
    if (playlist.length <= 1) return 0;
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * playlist.length);
    } while (avoidCurrent && newIndex === currentTrackIndex);
    return newIndex;
  }

  // Set Volume & Update UI
  function setVolume(e) {
    const volume = parseFloat(e.target.value); // Ensure float
    audioElement.volume = volume;
    volumeProgress.style.width = `${volume * 100}%`;

    // Update volume icons based on level
    volumeIconLow.className = `fas ${
      volume === 0 ? "fa-volume-mute" : "fa-volume-down"
    } volume-icon`;
    volumeIconHigh.className = `fas ${
      volume === 0
        ? "fa-volume-mute"
        : volume > 0.6
        ? "fa-volume-up"
        : "fa-volume-down"
    } volume-icon`; // Show 'up' only for higher volumes

    // Persist volume setting slightly (optional)
    // localStorage.setItem('musicPlayerVolume', volume);
  }

  // --- Playlist UI Functions ---

  // Build Playlist UI from the playlist array
  function buildPlaylistUI() {
    playlistElement.innerHTML = ""; // Clear existing list
    playlist.forEach((track, index) => {
      const li = document.createElement("li");
      li.dataset.index = index;

      const titleSpan = document.createElement("span");
      titleSpan.className = "playlist-title";
      titleSpan.textContent = track.title;

      const artistSpan = document.createElement("span");
      artistSpan.className = "playlist-artist";
      artistSpan.textContent = track.artist;

      li.appendChild(titleSpan);
      li.appendChild(artistSpan);

      li.addEventListener("click", () => {
        // If the clicked track is already the current one AND playing, do nothing (or maybe pause?)
        // if (index === currentTrackIndex && isPlaying) return;

        // If clicked track is different, or same but paused
        currentTrackIndex = index;
        loadTrack(currentTrackIndex);
        // Always play when clicking a playlist item
        // Add a slight delay before playing after click-load
        setTimeout(() => playTrack(), 50);
      });

      playlistElement.appendChild(li);
    });
    updatePlaylistUI(); // Ensure highlighting is correct after build
  }

  // Update Playlist Highlighting & Scroll
  function updatePlaylistUI() {
    const listItems = playlistElement.querySelectorAll("li");
    listItems.forEach((item) => {
      const index = parseInt(item.dataset.index, 10);
      if (index === currentTrackIndex) {
        item.classList.add("playing");
        // Scroll into view smoothly if needed
        item.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        item.classList.remove("playing");
      }
    });
  }

  // --- Initialization ---
  function initializePlayer() {
    playlist = [...trackData]; // Copy track data to the working playlist
    // Load persisted volume (optional)
    // const savedVolume = localStorage.getItem('musicPlayerVolume');
    // if (savedVolume !== null) {
    //    volumeSlider.value = savedVolume;
    // }

    // Set initial volume based on slider value
    setVolume({ target: { value: volumeSlider.value } });

    buildPlaylistUI();
    loadTrack(currentTrackIndex); // Load the first track
    updateRepeatUI(); // Set initial repeat button state
    updatePlaylistUI(); // Set initial playlist highlight
  }

  // --- Event Listeners ---
  playPauseBtn.addEventListener("click", togglePlayPause);
  prevBtn.addEventListener("click", prevTrack);
  nextBtn.addEventListener("click", nextBtnHandler);
  shuffleBtn.addEventListener("click", toggleShuffle);
  repeatBtn.addEventListener("click", toggleRepeat);

  audioElement.addEventListener("timeupdate", updateProgress);
  audioElement.addEventListener("loadedmetadata", updateDuration);
  audioElement.addEventListener("ended", handleSongEnd);
  audioElement.addEventListener("error", (e) => {
    console.error("Audio Element Error:", e);
    // Maybe display an error message to the user
    pauseTrack(); // Ensure UI is in paused state on error
    trackTitle.textContent = "Error loading track";
    trackArtist.textContent = "Please try another";
  });
  // Add 'canplay' listener if needed for more robust ready state checking
  // audioElement.addEventListener('canplay', () => { console.log("Audio can play"); });

  progressContainer.addEventListener("click", setProgress);

  // Use 'input' for live volume updates while dragging
  volumeSlider.addEventListener("input", setVolume);

  // --- Start the player ---
  initializePlayer();
}); // End DOMContentLoaded
