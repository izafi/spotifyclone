let currentAudio = null;
let currentButton = null;
let isPlaying = false;
let img;
let playbarcircle;
let songs = [];

// DOM elements
const playbarTitle = document.querySelector(".song-name");
const playbarTime = document.querySelector(".song-time");
const previous = document.querySelector(".previous-button");
const next = document.querySelector(".next-button")

async function getsongs() {
    let a = await fetch("http://127.0.0.1:3000/song/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`http://127.0.0.1:3000/song/`)[1]);
        }
    }

    console.log("Fetched songs:", songs);

    // Hardcoded song info (titles, artists, and images)
    const songsInfo = [
        { title: "Kya sach ho tum?", artist: "Amna Riaz", image: "image/song1.jpeg" },
        { title: "at peace", artist: "karan aujla", image: "image/song2.jpeg" },
        { title: "Guzaarishein", artist: "Samar jafri", image: "image/song3.jpeg" },
        { title: "Sohni Lagdi", artist: "diljit dosanjh", image: "image/song5.jpeg" }

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
                    if (img) img.src = "image/play.svg";
                } else {
                    currentAudio.play();
                    isPlaying = true;
                    changeToPauseIcon(button);
                    if (img) img.src = "image/pause.svg";
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
                if (img) img.src = "image/pause.svg";

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
    // Add event listner to the hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%"
    })
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    document.addEventListener("DOMContentLoaded", function () {
        const searchWrapper = document.querySelector(".search-wrapper");
        const searchToggle = document.querySelector(".search-toggle");

        if (searchToggle && searchWrapper) {
            searchToggle.addEventListener("click", function () {
                searchWrapper.classList.toggle("expanded");
            });
        }
    });

    // Add event listner to the previous button
    previous.addEventListener("click", () => {
        if (!currentAudio) return;

        const currentFilename = currentAudio.src.split("/").pop().split("?")[0];
        const index = songs.indexOf(currentFilename);

        if (index > 0) {
            playSongByName(songs[index - 1]);
        }
    });

    // Add event listner to the next button
    next.addEventListener("click", () => {
        if (!currentAudio) return;

        const currentFilename = currentAudio.src.split("/").pop().split("?")[0];
        const index = songs.indexOf(currentFilename);

        if (index < songs.length - 1) {
            playSongByName(songs[index + 1]);
        }
    });


    //Add event to the volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",
        (e) => {
            console.log("volume is:", e.target.value ,"/100");
            
            currentAudio.volume = parseInt(e.target.value) / 100;

        });

        //Add event listner to the mute volume

       document.querySelector(".volume>img").addEventListener("click", (e) => {
    console.log(e.target);

    if (e.target.src.includes("image/volume.svg")) {
        e.target.src = e.target.src.replace("image/volume.svg", "image/mute.svg");
        currentAudio.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;

    } else {
        e.target.src = e.target.src.replace("image/mute.svg", "image/volume.svg");
        currentAudio.volume = 0.1;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
});


    return songs;
}
function playSongByName(filename) {
    const index = songs.indexOf(filename);
    if (index === -1) return;

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    const songUrl = "/song/" + filename;
    currentAudio = new Audio(songUrl);
    currentAudio.play();
    isPlaying = true;

    // ✅ Show just song name (no .mp3)
    playbarTitle.innerText = decodeURIComponent(filename.replace(".mp3", ""));

    if (img) img.src = "image/pause.svg";

    currentAudio.addEventListener("timeupdate", () => {
        const mins = Math.floor(currentAudio.currentTime / 60);
        let secs = Math.floor(currentAudio.currentTime % 60);
        if (secs < 10) secs = "0" + secs;
        playbarTime.innerText = `${mins}:${secs}`;

        if (currentAudio.duration && playbarcircle) {
            const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
            playbarcircle.style.left = `${progress}%`;
        }
    });

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
            img.src = "image/play.svg";
        } else {
            currentAudio.play();
            isPlaying = true;
            img.src = "image/pause.svg";
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
