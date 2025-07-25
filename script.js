console.log("hello fellows");

let currentAudio = null;
let currentButton = null;
let isPlaying = false;
let img;
let playbarcircle;

// DOM elements
const playbarTitle = document.querySelector(".song-name");
const playbarTime = document.querySelector(".song-time");

async function getsongs() {
    let a = await fetch("http://127.0.0.1:3000/song/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`http://127.0.0.1:3000/song/`)[1]);
        }
    }

    console.log("Fetched songs:", songs);

    // Hardcoded song info (titles, artists, and images)
    const songsInfo = [
        { title: "Kya sach ho tum?", artist: "Amna Riaz", image: "song1.jpeg" },
        { title: "at peace", artist: "karan aujla", image: "song2.jpeg" },
        { title: "Guzaarishein", artist: "Sema jafri", image: "song3.jpeg" },
        { title: "Sohni Lagdi", artist: "diljit dosanjh", image: "song5.jpeg" }
    ];

    const container = document.getElementById("song-container");
    container.innerHTML = "";

    for (let i = 0; i < songsInfo.length; i++) {
        const song = songsInfo[i];
        container.innerHTML += `
            <div class="card">
                <div class="card-content">
                    <div class="play">
                        <button class="play-button" data-index="${i}">
                            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="24" fill="green" />
                                <path d="M18 33V15L34 24L18 33Z" fill="black" />
                            </svg>
                        </button>
                    </div>
                    <img src="${song.image}" alt="song image">
                    <div class="song-info">
                        <h2><a href="#">${song.title}</a></h2>
                        <p><a href="#">${song.artist}</a></p>
                    </div>
                </div>
            </div>
        `;
    }

    // Add event listeners to each play button
    const playButtons = document.querySelectorAll(".play-button");

    playButtons.forEach(button => {
        button.addEventListener("click", () => {
            let index = button.getAttribute("data-index");
            let songUrl = "/song/" + songs[index];
            let title = songsInfo[index].title;

            // If same song is clicked again
            if (currentAudio && currentAudio.src.includes(songUrl)) {
                if (isPlaying) {
                    currentAudio.pause();
                    isPlaying = false;
                    changeToPlayIcon(button);
                    if (img) img.src = "play.svg";
                } else {
                    currentAudio.play();
                    isPlaying = true;
                    changeToPauseIcon(button);
                    if (img) img.src = "pause.svg";
                }
            } else {
                // Stop current song if playing
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    if (currentButton) {
                        changeToPlayIcon(currentButton);
                    }
                }

                // Load and play new song
                currentAudio = new Audio(songUrl);
                currentAudio.play();
                isPlaying = true;
                currentButton = button;
                changeToPauseIcon(button);
                if (img) img.src = "pause.svg";

                // Update playbar title
                playbarTitle.innerText = title;

                // Update seekbar as song plays
                currentAudio.addEventListener("timeupdate", () => {
                    let mins = Math.floor(currentAudio.currentTime / 60);
                    let secs = Math.floor(currentAudio.currentTime % 60);
                    if (secs < 10) secs = "0" + secs;
                    playbarTime.innerText = `${mins}:${secs}`;

                    if (currentAudio.duration) {
                        let progress = (currentAudio.currentTime / currentAudio.duration) * 100;
                        playbarcircle.style.left = `${progress}%`;
                    }
                });
            }
        });
    });

    // Load first song but don't auto-play
    currentAudio = new Audio("/song/" + songs[0]);
    playbarTitle.innerText = songsInfo[0].title;

    // Setup seekbar even when paused
    currentAudio.addEventListener("timeupdate", () => {
        let mins = Math.floor(currentAudio.currentTime / 60);
        let secs = Math.floor(currentAudio.currentTime % 60);
        if (secs < 10) secs = "0" + secs;
        playbarTime.innerText = `${mins}:${secs}`;

        if (currentAudio.duration) {
            let progress = (currentAudio.currentTime / currentAudio.duration) * 100;
            playbarcircle.style.left = `${progress}%`;
        }
    });

    // Add event listener to the seekbar

    // Handle seekbar click
const seekbar = document.querySelector(".seekbar");

seekbar.addEventListener("click", (e) => {
    const rect = seekbar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    const percent = clickX / width;

    // Move the circle
    playbarcircle.style.left = `${percent * 100}%`;

    // Update audio time (no /100 needed)
    if (currentAudio && currentAudio.duration) {
        currentAudio.currentTime = currentAudio.duration * percent;
    }
});


    return songs;
}

// Switch SVG to play ▶️
function changeToPlayIcon(button) {
    const path = button.querySelector("svg path");
    if (path) path.setAttribute("d", "M18 33V15L34 24L18 33Z");
}

// Switch SVG to pause ⏸️
function changeToPauseIcon(button) {
    const path = button.querySelector("svg path");
    if (path) path.setAttribute("d", "M17 15H21V33H17V15ZM27 15H31V33H27V15Z");
}

// Playbar main play/pause button
function setupPlaybarControls() {
    const playbarPlayButton = document.querySelector(".playbar .play");

    playbarPlayButton.addEventListener("click", () => {
        if (!currentAudio) {
            console.log("No song selected");
            return;
        }

        if (isPlaying) {
            currentAudio.pause();
            isPlaying = false;
            img.src = "play.svg";
        } else {
            currentAudio.play();
            isPlaying = true;
            img.src = "pause.svg";
        }
    });
}

// Main function
async function main() {
    await getsongs();
    setupPlaybarControls();

    // Get playbar play/pause image
    img = document.querySelector(".playbar .play img");

    // Get circle element from seekbar
    playbarcircle = document.querySelector(".circle");
}

main();
