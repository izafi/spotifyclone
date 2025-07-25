console.log("Music Player Loaded");

let currentIndex = 0;
let songs = [];
let audio = new Audio();
let currentPlayBtn = null;

// DOM elements
const playbarTitle = document.querySelector(".song-name");
const playbarTime = document.querySelector(".song-time");
const prevIcon = document.querySelector(".play-icon img[src='previous.svg']");
const nextIcon = document.querySelector(".play-icon img[src='next.svg']");
const centerPlayIcon = document.querySelector(".play-icon img[src='play.svg']");

async function GetSongs() {
    const res = await fetch("http://127.0.0.1:3000/song/");
    const text = await res.text();
    const div = document.createElement("div");
    div.innerHTML = text;

    const links = div.getElementsByTagName("a");
    const songLinks = [];

    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            songLinks.push(link.href);
        }
    }
    return songLinks;
}

async function setupCards() {
    songs = await GetSongs();
    const cards = document.querySelectorAll(".card");

    cards.forEach((card, index) => {
        if (!songs[index]) return;

        const songUrl = songs[index];
        const titleLink = card.querySelector(".song-info h2 a");
        const artistLink = card.querySelector(".song-info p a");

        titleLink.href = "#";
        artistLink.href = "#";

        // Click on song name
        titleLink.addEventListener("click", (e) => {
            e.preventDefault();
            playSong(index, titleLink.textContent, artistLink.textContent);
            if (currentPlayBtn) setToPlayIcon(currentPlayBtn);
            currentPlayBtn = null;
            setPlaybarToPauseIcon();
        });

        // Click on artist name
        artistLink.addEventListener("click", (e) => {
            e.preventDefault();
            playSong(index, titleLink.textContent, artistLink.textContent);
            if (currentPlayBtn) setToPlayIcon(currentPlayBtn);
            currentPlayBtn = null;
            setPlaybarToPauseIcon();
        });

        // Set up play/pause button
        const playButton = card.querySelector(".play-button");
        playButton.innerHTML = `
            <a href="#" class="play-link" data-index="${index}">
                ${getPlaySVG()}
            </a>`;

        const playLink = playButton.querySelector(".play-link");

        playLink.addEventListener("click", (e) => {
            e.preventDefault();
            const thisIndex = parseInt(playLink.getAttribute("data-index"));
            const title = titleLink.textContent;
            const artist = artistLink.textContent;

            if (currentIndex === thisIndex && !audio.paused) {
                audio.pause();
                setToPlayIcon(playLink);
                setPlaybarToPlayIcon();
            } else {
                if (!audio.paused && currentPlayBtn) setToPlayIcon(currentPlayBtn);
                playSong(thisIndex, title, artist);
                setToPauseIcon(playLink);
                setPlaybarToPauseIcon();
                currentPlayBtn = playLink;
            }
        });
    });

    // Playbar controls
    prevIcon?.addEventListener("click", () => {
        if (songs.length === 0) return;
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        playFromIndex(currentIndex);
    });

    nextIcon?.addEventListener("click", () => {
        if (songs.length === 0) return;
        currentIndex = (currentIndex + 1) % songs.length;
        playFromIndex(currentIndex);
    });

    centerPlayIcon?.addEventListener("click", () => {
        if (!audio.src) return;

        if (audio.paused) {
            audio.play();
            setPlaybarToPauseIcon();
            if (currentPlayBtn) setToPauseIcon(currentPlayBtn);
        } else {
            audio.pause();
            setPlaybarToPlayIcon();
            if (currentPlayBtn) setToPlayIcon(currentPlayBtn);
        }
    });
}

function playSong(index, title, artist) {
    currentIndex = index;
    audio.src = songs[index];
    audio.play();

    playbarTitle.textContent = `${title} - ${artist}`;
    updatePlayTime();
    setPlaybarToPauseIcon();

    audio.addEventListener("loadeddata", updatePlayTime);

    audio.addEventListener("ended", () => {
        if (currentPlayBtn) setToPlayIcon(currentPlayBtn);
        setPlaybarToPlayIcon();
    });
}

function playFromIndex(index) {
    const cards = document.querySelectorAll(".card");
    const card = cards[index];
    const title = card.querySelector(".song-info h2 a").textContent;
    const artist = card.querySelector(".song-info p a").textContent;

    if (currentPlayBtn) setToPlayIcon(currentPlayBtn);
    const playLink = card.querySelector(".play-button .play-link");
    currentPlayBtn = playLink;
    setToPauseIcon(playLink);

    playSong(index, title, artist);
}

function updatePlayTime() {
    audio.ontimeupdate = () => {
        const current = formatTime(audio.currentTime);
        const total = formatTime(audio.duration);
        playbarTime.textContent = `${current} / ${total}`;
    };
}

function formatTime(sec) {
    if (isNaN(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
}

// SVGs for play/pause icons
function getPlaySVG() {
    return `
        <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="green" />
            <path d="M18 33V15L34 24L18 33Z" fill="black" />
        </svg>`;
}

function getPauseSVG() {
    return `
        <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="green" />
            <rect x="16" y="15" width="5" height="18" fill="black"/>
            <rect x="27" y="15" width="5" height="18" fill="black"/>
        </svg>`;
}

function setToPlayIcon(element) {
    element.innerHTML = getPlaySVG();
}

function setToPauseIcon(element) {
    element.innerHTML = getPauseSVG();
}

function setPlaybarToPlayIcon() {
    centerPlayIcon.src = "play.svg";
}

function setPlaybarToPauseIcon() {
    centerPlayIcon.src = "pause.svg";
}

setupCards();
