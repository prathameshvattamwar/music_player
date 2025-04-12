document.addEventListener("DOMContentLoaded", () => {
  // --- Get DOM Elements ---
  const musicContainer = document.getElementById("music-container");
  const playerCard = document.getElementById("player-card"); // Make sure this ID exists on the .player-card div in HTML
  const playPauseBtn = document.getElementById("play-pause-btn");
  const playPauseIcon = document.getElementById("play-pause-icon");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const repeatBtn = document.getElementById("repeat-btn");

  const audioElement = document.getElementById("audio-element");
  const progressContainer = document.getElementById("progress-container");
  const progress = document.getElementById("progress");
  const currentTimeEl = document.getElementById("current-time");
  const durationEl = document.getElementById("duration");

  const volumeSlider = document.getElementById("volume-slider");
  const volumeProgress = document.getElementById("volume-progress");
  const volumeIconLow = document.getElementById("volume-icon-low");
  const volumeIconHigh = document.getElementById("volume-icon-high");

  const trackTitle = document.getElementById("track-title");
  const trackArtist = document.getElementById("track-artist");
  const albumArt = document.getElementById("album-art");
  const artPlaceholder = document.querySelector(".art-placeholder");
  const playlistElement = document.getElementById("playlist");

  const lyricsToggleBtn = document.getElementById("lyrics-toggle-btn"); // Button to open
  const lyricsPanel = document.getElementById("lyrics-panel");
  const lyricsContent = document.getElementById("lyrics-content");
  const loadingOverlay = document.getElementById("loading-overlay");
  const lyricsCloseBtn = document.getElementById("lyrics-close-btn"); // The close button

  // --- Verification ---
  // Add these console logs to check if elements are found correctly
  console.log("Player Card Element:", playerCard);
  console.log("Lyrics Close Button Element:", lyricsCloseBtn);
  // Check your browser's developer console (F12 -> Console) for these logs when the page loads.
  // If playerCard or lyricsCloseBtn is 'null', there's an ID mismatch between HTML and JS.

  // --- State Variables ---
  let isPlaying = false;
  let currentTrackIndex = 0;
  let isShuffle = false;
  let repeatMode = 0;
  let originalPlaylist = [];
  let playlist = [];
  let isLoading = false;

  // --- Playlist Data (Direct file names, added lyrics) ---
  const trackData = [
    {
      title: "Ishq Hai Ye",
      artist: "Shreya Ghoshal, Irshad Kamil, Pritam Chakraborty",
      src: "ishqhai.mp3", // DIRECT file name
      cover: "ishqhai.jpg", // DIRECT file name
      lyrics: `
Dekho toh kya hi baat hai (kya hi baat hai)
Kambakht is jahaan mein (is jahaan mein)
Yeh ishq hai jisne isey (jisne isey)
Rehne ke qaabil kar diya (kar diya)
Rehne ke qaabil kar diya
Roshni hi roshni hai
Chaar-soo, jo chaar-soo
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai
Jo chhupa hai har nazar mein
Har taraf jo roo-ba-roo
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai
Tum se mile toh kuchh gunguni si
Hone lagi hain sardiyaan (ishq-ishq, ishq-ishq)
Tum se mile toh dekho shehar mein
Khilne lagi hain waadiyaan (ishq-ishq, ishq-ishq)
Saaya mera hai tu aur main tera
Tu dikhe ya na dikhe tu
Teri khushboo koo-ba-koo
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai
Haan, koyi kehta, ishq humein aabaad karta hai
Koyi kehta, ishq humein barbaad karta hai
Zehan ki tang deewaaron se uthkar
Main kehta hoon, ishq humein aazaad karta hai
Moh pe yeh karam bhi keeje
Moh pe yeh karam bhi keeje
Laage naahi tum bin jiyaara
Aisi bekhudi hi deeje
Moh pe yeh karam bhi keeje
Moh pe yeh karam bhi keeje
Laage naahi tum bin jiyaara
Aisi bekhudi (aisi bekhudi) hi deeje
Haan, saara mera ho tu aur main tera
Yeh hi meri vehshatein hain
Yeh hi meri justujoo
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai
Barsi hai mujhpe meher aasmaani
(Barsi hai mujhpe meher aasmaani)
Mohabbat ka dekho asar aasmaani
(Mohabbat ka dekho asar aasmaani)
Pairon ke neeche zameen ud rahi hai
(Pairon ke neeche zameen ud rahi hai)
Hai ishq mein har safar aasmaani
Tum se mile toh baithe-bithaayein
Chhoone lage hain aasmaan (ishq-ishq, ishq-ishq)
Tum se mile toh chhota sa qissa
Ban'ne ko hai ik daastaan (ishq-ishq, ishq-ishq)
Haan, saaya mera hai tu aur main tera
Tu dikhe ya, tu dikhe ya
Tu dikhe ya na dikhe tu
Teri khushboo koo-ba-koo
Ishq hai yeh, ishq hai (ishq hai)
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai (ishq hai)
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai
Ishq hai yeh, ishq hai (ishq hai)
Ishq hai yeh, ishq hai
            `,
    },
    {
      title: "Zaroor",
      artist: "Aparshakti Khurana, Savi Kahlon",
      src: "zaroor.mp3", // DIRECT file name
      cover: "zaroor.jpg", // DIRECT file name
      lyrics: `
Baithi kithe baddlan ton door honi ae
Mere wangu oh vi majboor honi ae
Sundi taan gall vi zaroor honi ae
Sundi taan gall vi zaroor honi ae
Paak si khulliyaan fizaavaan vich ji
Kaash kithe mil jaave raahvaan vich ji
Rabb si oh meriyaan nigaahaan vich ji
Bani kise chann di hoor honi ae
Baithi kithe baddlan ton door honi ae
Mere wangu oh vi majboor honi ae
Sundi taan gall vi zaroor honi ae
Sundi taan gall vi zaroor honi ae
Pattharaan de vich jivein phool ugde
Ajjkal saath, yaara, kithe pugde
Aapaan vi taan raahi iss kalyug de
Kadhdi oh mera vi kasoor honi ae
Dekhiyaan na mud ke, duaavaan dittiyaan
Rabb jaane kinna ne salaahvaan dittiyaan
Beetiyaan jo bas mere naal beetiyaan
Supneyaan wangu kehda poor honi ae
Baithi kithe baddlan ton door honi ae
Mere wangu oh vi majboor honi ae
Sundi taan gall vi zaroor honi ae
Sundi taan gall vi zaroor honi ae
Gale da si kade ohde haar baneya
Ajj ohi kehndi, "Gunahgaar baneya"
Savi likhda te gaaunda kalaakaar baneya
Par mud ke kise da nahiyon yaar baneya
Tutteya parinda phir eddaan judeya
Modeya kaiyaan ne, pher nahiyon mudeya
Mil gaya sab, bas ohi thodh aa
Kami mere vich hi, hazoor, honi ae
Baithi kithe baddlan ton door honi ae
Mere wangu oh vi majboor honi ae
Sundi taan gall vi zaroor honi ae
Sundi taan gall vi zaroor honi ae
Baithi kithe baddlan ton door honi ae
Mere wangu oh vi majboor honi ae
Sundi taan gall vi zaroor honi ae
Sundi taan gall vi zaroor honi ae
Sun, jaande-jaande ikk gall sundi ja
Laake kade aas kise khaas 'te na baithi
Jehda langh gaya vela, itihaas 'te na baithi
Mukk jaana main, sukkh jaana main
Phool jeha leke meri laash 'te na baithi
      `,
    },
    {
      title: "Jo Tu Mil Gaya",
      artist: "Tulsi Kumar, Jubin Nautiyal, Srikanth",
      src: "jo_tu_mil_gaya.mp3", // DIRECT file name
      cover: "jo_tu_mil_gaya.jpg", // DIRECT file name
      lyrics: `
Kaash Ek Din Aisa Ho
Kandhe Pe Tere Dhal Jaaye
Toh Din Woh Hoga Kitna Khushnuma

Teri Tamanna Aisi
Har Roj Bata Ke Jaaye
Tu Reh Ja Banke Mera Aasman

Tere Sang Jeena Hi Toh
Jeena Mere Humdum
Apna Hai Mana Maine
Mana Tujhe Hardum
Goonje Hawaon Mein Hai
Teri Meri Sargam Piya

Jo Tu Mil Gaya Deewane Bane
Hum Tere Pyaar Mein Muskurane Lage
Jo Tu Mil Gaya Deewane Bane
Hum Tere Pyaar Mein Muskurane Lage

Tere Sang Ishq Hai Rab Ne Likha
Rab Ne Diya Tera Naam Pata
Paaye Nazare Hai Tere Kinare Piya Piya

Jabse Hai Mujhe Tera Sang Mila
Sang Se Tere Har Rang Khila
Tere Sirhane Hi Mere Sitare Piya Piya

Mithi Lage Har Baat Teri
Dil Toh Na Maane Baat Meri
Na Jaane Kaise Tune Hai Jaadu Kiya

Jo Tu Mil Gaya Deewane Bane
Hum Tere Pyaar Mein Muskurane Lage
Jo Tu Mil Gaya Deewane Bane
Hum Tere Pyaar Mein Muskurane Lage

Jaha Dekhu Tera Hi Hai Chehra
Nigaahon Ne Jo Dekha Tu Woh Khaab Sunehra
Asar Tera Dil Pe Hua Hai Mere Gehera
Main Ho Gaya Ho Gaya Bas Tera

Tere Sang Jeena Hi Toh Jeena Maine
Apna Hai Mana Maine Mana Tujhe
Goonje Hawaon Mein Hai
Teri Meri Sargam Piya

Jo Tu Mil Gaya Deewane Bane
Hum Tere Pyaar Mein Muskurane Lage
Jo Tu Mil Gaya Deewane Bane
Hum Tere Pyaar Mein Muskurane Lage

Tu Mil Gaya, Tu Mil Gaya
Main Khil Gaya, Main Khil Gaya
Tu Mil Gaya, Tu Mil Gaya Piya

Tu Mil Gaya, Tu Mil Gaya
Main Khil Gaya, Main Khil Gaya
Tu Mil Gaya, Tu Mil Gaya Piya
            `,
    },
    {
      title: "Yeda Yung Bombay Mashup",
      artist: "YUNG DSA, Year Down",
      src: "yeda_yung.mp3", // DIRECT file name
      cover: "yeda_yung.jpg", // DIRECT file name
      lyrics: `
Wssup ma Gang! Welcome to Hood!
Pune 06 rep karra, kaipar banre dude.
Meko Gang sign dene time nhi srif real shit baju
Jabhi YUNG bajta hood mai tabhi on hota mood!
Hood ke bahar rukke call kare meko mere dude
Dene ke baat paile reppin ma crew
Mai OGz ke playlist mai paile se hu
Bro jhada maine chutiya log ke ginti mai tu
Vocal aaise jaise bajta srif YUNG oldskool
Gane tere sunke meko lagta tu fool
Tere jaise 4 log ko kalti karu
Tera aawaj pe fake jaise fake rehra tu
Chowk mai rukke rehte haat uppar
Sathme 7 shooter
Mere homies log pan yede sedha haat uppar
Meko laganeka try kar haat jhat uppat
Teko lagra rahinga bhonda lekin sharp shooter
Mai Jhadgde nahi karta kyu ke peace mera khoon
Mai address nahi bolta, bolta TRIPPAGUYZ se hu
Sedha pair hote out when you step in my hood
Bhonde try pan mat kar or mai Yerwada ka dude
Hum log Patre ke kholi se Street karte flue
Bachpan se sapna tha sapna ko lu
Teko kiya maine feature q ke apna tha tu
Abhi kon nahi apna nusta reppin ma crew
Aaisa dekhra kya bhonde ye Blood walk hai dude
Teko jhat nai malum or bole Rap karta tu
Hum log sunte the THUG ko jab YSL top pe tha dekh mere lifestyle RMD bita tu
Hip Hop ko Hip Hop se cop karra
Shooter tera bola teko YUNG BHAU ne drop kara
Rehneka Like mai Jab mai ghumta NIKE MAI
YUNG SITAR tabhi jake maine mera paila gana drop kara
Kon nahi karneka ye Cultural shit
Tabhi hum logch bajneke TRIP
Tum log sun ke humko fir
Diss karo humkoch
Tera Hip Hop nahi rehra bro Rehra
Fake shit
Fake aawaj tera fake tera shit
Fake homies tere fake tere Drip
Fake laga tere stage name ke paile
Mere naam ke paile TRIPPA jodte jab mai karta SPIT!!
Wssup ma Gang! Welcome to Hood!
Pune 06 rep karra, kaipar banre dude.
Meko Gang sign dene time nhi srif real shit baju
Jabhi YUNG bajta hood mai tabhi on hota mood!
      `,
    },
    {
      title: "Nadaaniyan",
      artist: "Akshath Acharya",
      src: "nadaaniya.mp3", // DIRECT file name
      cover: "nadaaniya.jpg", // DIRECT file name
      lyrics: `
Kaise tu gungunaaye, muskuraaye
Chhoti-moti baaton pe muhn fulaye?
Yeh nazakat
Meri aadat paas mujhe laaye
Nadaaniyan, nadaaniyan
Kheenchein mujhe nadaaniyan
Nadaaniyan, nadaaniyan
Pagal kare teri har adaa

Shaam-o-subah main teri yaad karoon
Tere khyaalon se main baat karoon
Teri nazar mein yeh kaisa nasha?
Teri awaaz mei yeh kaisa sukoon?

Dil ke saare ishaaron pe
Bas tera hi naam hai

Kaise tu gungunaaye, muskuraaye
Chhoti-moti baaton pe muhn fulaye?
Yeh nazakat
Meri aadat paas mujhe laaye
Nadaaniyan, nadaaniyan
Kheenchein mujhe nadaaniyan
Nadaaniyan, nadaaniyan
Pagal kare teri har adaa
      `,
    },
  ];

  // --- Loading Indicator Functions ---
  function showLoading() {
    isLoading = true;
    loadingOverlay.classList.add("visible");
  }
  function hideLoading() {
    isLoading = false;
    loadingOverlay.classList.remove("visible");
  }

  // --- Core Functions ---
  function loadTrack(trackIndex) {
    if (isLoading) return;
    if (trackIndex < 0 || trackIndex >= playlist.length) {
      console.error("Invalid track index:", trackIndex);
      return;
    }
    showLoading();
    const track = playlist[trackIndex];
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    hideLyricsPanel(); // Ensure panel is closed on track change
    lyricsContent.textContent =
      track.lyrics?.trim() || "Lyrics not available for this track.";
    lyricsContent.scrollTop = 0;
    albumArt.classList.remove("loaded");
    albumArt.alt = `${track.title} - ${track.artist}`;
    albumArt.src = "";
    audioElement.src = track.src;
    albumArt.src = track.cover || "default-art.png";
    progress.style.width = "0%";
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";
    updatePlaylistUI();
    document.title = `${track.title} - ${track.artist}`;
  }

  albumArt.onload = () => {
    albumArt.classList.add("loaded");
  };
  albumArt.onerror = () => {
    console.warn("Failed to load album art:", albumArt.src);
    albumArt.src = "default-art.png";
    albumArt.classList.add("loaded");
  };

  function playTrack() {
    if (audioElement.readyState >= 2) {
      audioElement
        .play()
        .then(() => {
          isPlaying = true;
          playerCard.classList.add("playing");
          playPauseIcon.classList.replace("fa-play", "fa-pause");
          playPauseBtn.title = "Pause (Space)";
          hideLoading();
        })
        .catch((error) => {
          console.error("Playback Error:", error);
          pauseTrack();
          hideLoading();
        });
    } else {
      console.log("Audio not ready, waiting for canplay...");
      showLoading();
    }
  }

  function pauseTrack() {
    isPlaying = false;
    playerCard.classList.remove("playing");
    playPauseIcon.classList.replace("fa-pause", "fa-play");
    playPauseBtn.title = "Play (Space)";
    audioElement.pause();
  }

  function togglePlayPause() {
    if (!isLoading) {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack();
      }
    }
  }
  function prevTrack() {
    if (!isLoading) {
      if (isShuffle) {
        currentTrackIndex = getRandomIndex(true);
      } else {
        currentTrackIndex =
          (currentTrackIndex - 1 + playlist.length) % playlist.length;
      }
      loadTrack(currentTrackIndex);
    }
  }
  function nextTrackLogic() {
    if (isShuffle) {
      currentTrackIndex = getRandomIndex(true);
    } else {
      if (repeatMode !== 2 && currentTrackIndex === playlist.length - 1) {
        return false;
      } else {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
      }
    }
    loadTrack(currentTrackIndex);
    return true;
  }
  function nextBtnHandler() {
    if (!isLoading) {
      nextTrackLogic();
    }
  }

  function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (duration && isFinite(duration)) {
      const progressPercent = (currentTime / duration) * 100;
      progress.style.width = `${progressPercent}%`;
      currentTimeEl.textContent = formatTime(currentTime);
    }
  }
  function setProgress(e) {
    if (isLoading) return;
    const width = progressContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audioElement.duration;
    if (duration && isFinite(duration)) {
      const newTime = (clickX / width) * duration;
      audioElement.currentTime = newTime;
      progress.style.width = `${(newTime / duration) * 100}%`;
      currentTimeEl.textContent = formatTime(newTime);
    }
  }
  function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }
  function updateDuration() {
    const duration = audioElement.duration;
    if (duration && isFinite(duration)) {
      durationEl.textContent = formatTime(duration);
    } else {
      durationEl.textContent = "0:00";
    }
  }

  // --- Feature Functions ---
  function toggleShuffle() {
    if (isLoading) return;
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
    shuffleBtn.title = isShuffle ? "Shuffle On (S)" : "Shuffle Off (S)";
    if (isShuffle) {
      if (originalPlaylist.length === 0) {
        originalPlaylist = [...playlist];
      }
      let currentSong = playlist[currentTrackIndex];
      let shuffled = playlist.filter((song) => song.src !== currentSong.src);
      shuffled.sort(() => Math.random() - 0.5);
      playlist = [currentSong, ...shuffled];
      currentTrackIndex = 0;
      buildPlaylistUI();
    } else if (originalPlaylist.length > 0) {
      let currentSongSrc = playlist[currentTrackIndex].src;
      playlist = [...originalPlaylist];
      originalPlaylist = [];
      currentTrackIndex = playlist.findIndex(
        (song) => song.src === currentSongSrc
      );
      if (currentTrackIndex === -1) currentTrackIndex = 0;
      buildPlaylistUI();
    }
    updatePlaylistUI();
  }
  function toggleRepeat() {
    if (isLoading) return;
    repeatMode = (repeatMode + 1) % 3;
    updateRepeatUI();
  }
  function updateRepeatUI() {
    repeatBtn.classList.remove("active", "repeat-mode-one");
    let title = "Repeat Off (R)";
    switch (repeatMode) {
      case 1:
        repeatBtn.classList.add("active", "repeat-mode-one");
        title = "Repeat One (R)";
        break;
      case 2:
        repeatBtn.classList.add("active");
        title = "Repeat All (R)";
        break;
    }
    repeatBtn.title = title;
  }
  function handleSongEnd() {
    if (repeatMode === 1) {
      audioElement.currentTime = 0;
      playTrack();
    } else {
      nextTrackLogic();
    }
  }
  function getRandomIndex(avoidCurrent = false) {
    if (playlist.length <= 1) return 0;
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * playlist.length);
    } while (avoidCurrent && newIndex === currentTrackIndex);
    return newIndex;
  }
  function setVolume(value) {
    const newVolume = Math.max(0, Math.min(1, value));
    audioElement.volume = newVolume;
    volumeSlider.value = newVolume;
    volumeProgress.style.width = `${newVolume * 100}%`;
    volumeIconLow.className = `fas ${
      newVolume === 0 ? "fa-volume-mute" : "fa-volume-down"
    } volume-icon`;
    volumeIconHigh.className = `fas ${
      newVolume === 0
        ? "fa-volume-mute"
        : newVolume > 0.6
        ? "fa-volume-up"
        : "fa-volume-down"
    } volume-icon`;
  }
  function volumeStep(amount) {
    setVolume(audioElement.volume + amount);
  }

  // --- Lyrics Panel Functions ---
  function showLyricsPanel() {
    if (playerCard) {
      // Check if playerCard exists
      playerCard.classList.add("lyrics-visible");
    } else {
      console.error("Cannot show lyrics: playerCard element not found.");
    }
  }

  function hideLyricsPanel() {
    if (playerCard) {
      // Check if playerCard exists
      playerCard.classList.remove("lyrics-visible");
    } else {
      console.error("Cannot hide lyrics: playerCard element not found.");
    }
  }

  function toggleLyricsPanel() {
    if (playerCard) {
      // Check if playerCard exists
      // Toggle based on current state
      if (playerCard.classList.contains("lyrics-visible")) {
        hideLyricsPanel();
      } else {
        showLyricsPanel();
      }
    } else {
      console.error("Cannot toggle lyrics: playerCard element not found.");
    }
  }

  // --- Playlist UI Functions ---
  function buildPlaylistUI() {
    playlistElement.innerHTML = "";
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
        if (isLoading || index === currentTrackIndex) return;
        currentTrackIndex = index;
        loadTrack(currentTrackIndex);
      });
      playlistElement.appendChild(li);
    });
    updatePlaylistUI();
  }
  function updatePlaylistUI() {
    const listItems = playlistElement.querySelectorAll("li");
    listItems.forEach((item) => {
      const index = parseInt(item.dataset.index, 10);
      if (index === currentTrackIndex) {
        item.classList.add("playing");
        item.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        item.classList.remove("playing");
      }
    });
  }

  // --- Initialization ---
  function initializePlayer() {
    playlist = [...trackData];
    setVolume(parseFloat(volumeSlider.value));
    buildPlaylistUI();
    loadTrack(currentTrackIndex);
    updateRepeatUI();
    hideLoading();

    // ** Crucial Part: Attach Event Listeners AFTER ensuring elements exist **
    if (lyricsToggleBtn) {
      lyricsToggleBtn.addEventListener("click", showLyricsPanel); // Open button shows
    } else {
      console.error("Lyrics Toggle Button not found!");
    }

    if (lyricsCloseBtn) {
      lyricsCloseBtn.addEventListener("click", hideLyricsPanel); // Close button hides
    } else {
      console.error("Lyrics Close Button not found!");
    }
  }

  // --- Event Listeners (Audio, Controls, Volume - Keep these) ---
  playPauseBtn.addEventListener("click", togglePlayPause);
  prevBtn.addEventListener("click", prevTrack);
  nextBtn.addEventListener("click", nextBtnHandler);
  shuffleBtn.addEventListener("click", toggleShuffle);
  repeatBtn.addEventListener("click", toggleRepeat);

  audioElement.addEventListener("timeupdate", updateProgress);
  audioElement.addEventListener("loadedmetadata", updateDuration);
  audioElement.addEventListener("ended", handleSongEnd);
  audioElement.addEventListener("error", (e) => {
    console.error("Audio Element Error:", audioElement.error);
    pauseTrack();
    trackTitle.textContent = "Error";
    trackArtist.textContent = `Cannot load: ${
      playlist[currentTrackIndex]?.src || "file"
    }`;
    hideLoading();
  });
  audioElement.addEventListener("canplay", () => {
    console.log("Audio can play");
    hideLoading();
    if (isPlaying) {
      playTrack();
    }
  });

  progressContainer.addEventListener("click", setProgress);
  volumeSlider.addEventListener("input", (e) =>
    setVolume(parseFloat(e.target.value))
  );
  volumeIconLow.addEventListener("click", () => volumeStep(-0.1));
  volumeIconHigh.addEventListener("click", () => volumeStep(0.1));

  // Keyboard listeners
  document.addEventListener("keydown", (e) => {
    if (
      playerCard &&
      playerCard.classList.contains("lyrics-visible") &&
      e.code === "Escape"
    ) {
      // Check playerCard exists
      e.preventDefault();
      hideLyricsPanel();
      return;
    }
    switch (e.code) {
      case "Space":
        e.preventDefault();
        togglePlayPause();
        break;
      case "ArrowRight":
        e.preventDefault();
        nextBtnHandler();
        break;
      case "ArrowLeft":
        e.preventDefault();
        prevTrack();
        break;
      case "ArrowUp":
        e.preventDefault();
        volumeStep(0.1);
        break;
      case "ArrowDown":
        e.preventDefault();
        volumeStep(-0.1);
        break;
      case "KeyS":
        toggleShuffle();
        break;
      case "KeyR":
        toggleRepeat();
        break;
      case "KeyL":
        toggleLyricsPanel();
        break; // 'L' toggles open/close
    }
  });

  // --- Start the player ---
  // Delay initialization slightly to ensure DOM is fully ready, though DOMContentLoaded should handle this.
  // setTimeout(initializePlayer, 0);
  initializePlayer(); // Call directly within DOMContentLoaded
}); // End DOMContentLoaded
