let currentsong = new Audio();
let songs;
let currfolder;
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds to always have two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Combine minutes and seconds with an asterisk
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    // console.log(as);
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        // console.log(element);
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
        else {
            // console.log('not mp3');
        }
    }
    // showing all songs in playlist

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = "";
    for (const i of songs) {
        songul.innerHTML = songul.innerHTML + `<li> 
           <img class="invert" src="Images/music.svg" alt="">
                           <div class="info">
                               <div>${i.replaceAll("%20", " ")} </div>
                               
                           </div>
                           <div class="playnow">
                               <span>Play now</span>
                               <img class="invert" src="Images/playbutton.svg" alt="">
                           </div></li> `;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector('.info').firstElementChild.innerHTML);
            playmusic(e.querySelector('.info').firstElementChild.innerHTML.trim());
        });
    });
    return songs;
}

function playmusic(track, pause = false) {
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {

        currentsong.play();
        plays.src = "Images/pausebutton.svg"; // sab music play ho raha hai na to hume pause button dikho isliye isko yaha likha hai 
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}

async function displayalbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    // console.log(div);
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            // console.log(e.href.split("/").slice(-2)[0]);
            let folder = e.href.split("/").slice(-2)[0];

            // Get the metadata of the folder

            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response);
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <!-- <img src="Images/playbutton.svg" alt=""> -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
                    <circle cx="25" cy="25" r="25" fill="#1fdf64" />
                    <path
                        d="M33.8906 25.846C33.5371 27.189 31.8667 28.138 28.5257 30.0361C25.296 31.8709 23.6812 32.7884 22.3798 32.4196C21.8418 32.2671 21.3516 31.9776 20.9562 31.5787C20 30.6139 20 28.7426 20 25C20 21.2574 20 19.3861 20.9562 18.4213C21.3516 18.0224 21.8418 17.7329 22.3798 17.5804C23.6812 17.2116 25.296 18.1291 28.5257 19.9639C31.8667 21.862 33.5371 22.811 33.8906 24.154C34.0365 24.7084 34.0365 25.2916 33.8906 25.846Z"
                        fill="black" transform="translate(0,0)" />
                </svg>

            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h3>${response.title}</h3>
            <p>${response.discrpition}</p>
        </div>` ;

        }
    }
    // console.log(anchors);

    // load the playlist whenever card is clicked

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            // console.log(item, item.currentTarget.dataset);
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0]);
        }
        )
    })


}

async function main() {

    await getsongs("songs/animal");
    // console.log(songs);
    playmusic(songs[0], true);


    // Display all the albums on the page.
    displayalbums();

    // Attach an event listener to previous , play and next

    plays.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            plays.src = "Images/pausebutton.svg";
        }
        else {
            currentsong.pause();
            plays.src = "Images/playbutton.svg";
        }
    }
    )

    // Listen for time update event

    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`

        document.querySelector(".circular").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // Add an event listener to the seek bar

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circular").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });

    // offsetX , getBoundingClientRect() , width ye sab property hai jo ki console.log(e) karenge to ussme ye sab property dekhegi except getBoundingClientRect() this one ye nahi dekhega ye jo hai na vo bata ta hai ki aap page par kaha ho issme width dekhta hai 


    // song play code.

    // var audio = new Audio(songs[0])
    // audio.play();  

    // Adding event listener to menu button

    document.querySelector(".humburgercontainer").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Adding event listener to close button

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-115%";
    });

    // Add event listner to previous 
    previous.addEventListener("click", () => {
        // console.log(currentsong.src.split("/").slice(-1)[0]); 
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        // console.log(songs, index);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }

    }
    )
    // Add event listner to next 
    next.addEventListener("click", () => {
        currentsong.pause();
        // console.log(currentsong.src.split("/").slice(-1)[0]); 
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        // console.log(songs, index);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }
    });

    // Add event listner to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        //   console.log(e.target.value);
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    // Add event listern to mute volume

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        // console.log(e.target);
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            currentsong.volume = .10;
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

        }
    })

}
main();