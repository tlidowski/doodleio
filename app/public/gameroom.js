//set up artist space
let flag = false;
let drawnf = false;
let lastf;
let strokeColor;
let strokeSize;
let fill = document.getElementById("fill");
let pencil = document.getElementById("pencil");
let eraser = document.getElementById("eraser");
let colors = [
    "#ff1616",
    "#ff914d",
    "#ffde59",
    "#c9e265",
    "#7ed957",
    "#008037",
    "#5ce1e6",
    "#38b6ff",
    "#5271ff",
    "#8c52ff",
    "#ffc6c4",
    "#000000",
    "#492b16",
    "#737373",
];
let milliPerSec = 1000; //Keep default at 1000 for timer
let easyWords = [];
let turnGuesses = []
let correctGuess = false

let urlString = window.location.search;
let params = new URLSearchParams(urlString);

console.log(params.get("roomId"));

//update header bar
let roomCodeSpace = document.getElementById("roomcode-space")
let roundSpace = document.getElementById("round-space")
let turnSpace = document.getElementById("turn-space")
let artistSpace = document.getElementById("artist-space")
roomCodeSpace.textContent = `${params.get("roomId")}`

//Current Default; Change When Artist Characteristic is Accessible
let isArtist = false;

let newWordButton = document.getElementById("newWordButton");
//Guess Box
let guess;

//Timer
let timerBox = document.getElementById("timer-space");
let turnSeconds = 60*(milliPerSec/1000);
let cooldownSeconds = 5*(milliPerSec/1000);

let turnInProgress = true;
let countdownInterval = null;
let cooldownInterval = null;

//Drawing Box
let doodleBox = document.getElementById("drawing-board");
let ctx = doodleBox.getContext("2d");

let lastSentf;

// Gameflow globals
let startButton = document.getElementById("start-button");
let playerInfo = [];
let activePlayers = []; //list that holds username:points pairs.
let correctGuesses = 0;
let turn = 1;
let roundsLeft = 3;
let isPlaying = false;
let chosenWord = '';


// Cookies
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

socket.emit("joinRoom", { username: getCookie("username"), roomNum: params.get("roomId") });

function coolDown() {
    timerBox.textContent = `Next Turn Starts In: ${cooldownSeconds}`;
    wordSpace.textContent = `${chosenWord}`
    if (cooldownSeconds > 0) {
        cooldownSeconds--;
    } else {
        turnInProgress = false;
        clearInterval(cooldownInterval);
        doodlioTurn();
    }
}

function countDown() {
    timerBox.textContent = `Time Remaining: ${turnSeconds}`;
    if (turnSeconds > 0) {
        turnSeconds--;
    } else {
        isArtist = false;
        timerBox.textContent = "Turn Over";
        clearInterval(countdownInterval);

        if (turn >= activePlayers.length) {
            turn = 1;
            roundsLeft -= 1;
        } else {
            turn += 1;
        }

        if (roundsLeft <= 0) {
            timerBox.textContent = "Game Over!";
            userStatUpdate();
        } else {
            cooldownSeconds = 5*(milliPerSec/1000);
            cooldownInterval = setInterval(coolDown, milliPerSec);
        }

    }
}

//Canvas set up

function setup() {
    let currentColor = document.getElementById("currentColor");
    let styleRow = document.getElementById("styleRow");
    currentColor.style.height = "50px";
    currentColor.style.width = "50px";
    for (let color = 0; color < colors.length; color++) {
        let row =
            color < colors.length / 2
                ? document.getElementById("firstColorRow")
                : document.getElementById("secondColorRow");
        let col = document.createElement("td");
        let colorButton = document.createElement("div");
        colorButton.classList.add("box");
        colorButton.style.backgroundColor = colors[color];
        colorButton.addEventListener("click", function (e) {
            currentColor.style.backgroundColor = this.style.backgroundColor;
            strokeColor = this.style.backgroundColor;
        });
        col.append(colorButton);
        row.append(col);
    }
    for (let size = 1; size <= 4; size++) {
        let col = document.createElement("td");
        let element = document.createElement("div");
        element.classList.add("box");
        element.style.borderRadius = "50%";
        element.style.backgroundColor = "black";
        element.style.width = size * 10 + "px";
        element.style.height = size * 10 + "px";
        element.addEventListener("click", function (e) {
            strokeSize = Number(this.style.height.slice(0, 2)) / 2;
        });
        col.append(element);
        styleRow.append(col);
    }
}

/*
	Doodle Box -- Sets up canvas and allows for drawing, drawings appear in real-time for other clients.
	Drawing emit implemented from: https://github.com/wesbos/websocket-canvas-draw/blob/master/scripts.js
*/

let draw = function (xcor, ycor, drawnf, strokeSize, strokeColor) {
    ctx.beginPath();

    if (drawnf) {
        ctx.lineCap = "round";
        ctx.moveTo(lastSentf.x, lastSentf.y);
        ctx.lineTo(xcor, ycor);
        ctx.lineWidth = strokeSize;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    }
    lastSentf = { x: xcor, y: ycor };
};

socket.on("draw", function (data) {
    return draw(
        data.xcor,
        data.ycor,
        data.drawnf,
        data.strokeSize,
        data.strokeColor
    );
});
// size of canvas
doodleBox.width = 350;
doodleBox.height = 400;

function emitDraw (e) {
    if (flag && isArtist) {
        ctx.beginPath();
        let xcor = e.offsetX;
        let ycor = e.offsetY;
        if (drawnf) {
            ctx.lineCap = "round";
            ctx.moveTo(lastf.x, lastf.y);
            ctx.lineTo(xcor, ycor);
            ctx.lineWidth = strokeSize;
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
        }
        lastf = { x: xcor, y: ycor };

        socket.emit("drawClick", {
            xcor: xcor,
            ycor: ycor,
            drawnf: drawnf,
            strokeSize: strokeSize,
            strokeColor: strokeColor,
        });

        drawnf = true;
    }
}

doodleBox.addEventListener("mousedown", function (e) {
    flag = true;
});

doodleBox.addEventListener("mouseup", function (e) {
    flag = false;
    drawnf = false;
    socket.emit("drawnf", { drawnf: false });
});

pencil.addEventListener("mousedown", function (e) {
    flag = true;
});

eraser.addEventListener("mousedown", function (e) {
    strokeColor = "white";
});

doodleBox.addEventListener("mousemove", emitDraw);



//Generate Word Space
let selectedDiff = "easy";
let easyWordButton = document.getElementById("easyWord");
let medWordButton = document.getElementById("medWord");
let hardWordButton = document.getElementById("hardWord");
let exWordButton = document.getElementById("exWord");
let randWordButton = document.getElementById("randWord");
let selectedDiffBox = document.getElementById("selectedDiff")
selectedDiffBox.textContent = `Selected Difficulty: ${selectedDiff.toUpperCase()}`

easyWordButton.addEventListener("click", function () {
    selectedDiff = "easy";
    selectedDiffBox.textContent = `Selected Difficulty: ${selectedDiff.toUpperCase()}`
});

medWordButton.addEventListener("click", function () {
    selectedDiff = "medium";
    selectedDiffBox.textContent = `Selected Difficulty: ${selectedDiff.toUpperCase()}`
});

hardWordButton.addEventListener("click", function () {
    selectedDiff = "hard";
    selectedDiffBox.textContent = `Selected Difficulty: ${selectedDiff.toUpperCase()}`
});

exWordButton.addEventListener("click", function () {
    selectedDiff = "expert";
    selectedDiffBox.textContent = `Selected Difficulty: ${selectedDiff.toUpperCase()}`
});

randWordButton.addEventListener("click", function () {
    selectedDiff = "random";
    selectedDiffBox.textContent = `Selected Difficulty: ${selectedDiff.toUpperCase()}`
});


let wordSpace = document.getElementById("word-space");

function findSelectedDifficulty() {fetch(`/gameroom?difficulty=${selectedDiff}`).then(function (response) { //artist only; finds word
    if (response.status === 200) {
        return response.json();
    } else {
        throw Error(response.status);
    }
}).then(function (response) {
    if(response.word != ''){
        wordSpace.textContent = response.word;
        chosenWord = response.word;
        socket.emit("wordPicked", {roomNum: params.get("roomId"), chosenWord: chosenWord});
        let letterList = chosenWord.split("");
        let pickedIndices = []
        updateWordBox(letterList, pickedIndices);

    }
}).catch(function (error) {
    console.log(error);
});}

socket.on("wordSent", function (data) {
    chosenWord = data.chosenWord; 
    console.log(`Chosen Word is: ${chosenWord}`);
});

function updateWordBox(letterList, pickedIndices) {//Updates wordbox for artist or guesser
    clearWordSpace()
    let wordContent = ""
    for (letterIndex in letterList) {
        if (isArtist){
            wordContent+=`${(letterList[letterIndex])}`
        } else {
            if (pickedIndices.includes(parseInt(letterIndex))) {
                wordContent+= `${letterList[letterIndex]} `
            } else {
                wordContent+="_ "; //change: create a function to reveal a random character at 30, 10 seconds
            }
        }
       wordSpace.textContent = wordContent
    }
}

function updateWordBoxGuesser (letterList, pickedIndices){//calls revealLetter 3 times for guesser (CANNOT CALL IN UWB func)
    setTimeout(function() { revealLetter(letterList,pickedIndices); }, 60*milliPerSec*.5)
    setTimeout(function() { revealLetter(letterList,pickedIndices); }, 60*milliPerSec*.75)
    setTimeout(function() { revealLetter(letterList,pickedIndices); }, 60*milliPerSec*.9)
}

function revealLetter(letterList, pickedIndices){ //reveals letters
    if (!correctGuess){
        let revealed = false
        while (!revealed){
            let position = Math.floor(Math.random() * letterList.length);
            if (!pickedIndices.includes(position)){
                pickedIndices.push(position)
                revealed = true
                updateWordBox(letterList, pickedIndices)
            } else {
            }
        }
    }
}


function clearWordSpace() { //empties the wordBox
    wordSpace.textContent = ""
}
let headerTable = document.getElementById("game-header-table")
let toolTable = document.getElementById("tool-select-table")
let guessTable = document.getElementById("guess-table")
let difficultyTable = document.getElementById("difficulty-table")
let wordCountdown = document.getElementById("wordDiffCountdown")


function tableHide(isArtist) { //before turn start reset visibility
    if (isArtist){
        difficultyTable.removeAttribute("hidden")
        guessTable.setAttribute("hidden","hidden")
    } else { //is Guesser
        difficultyTable.setAttribute("hidden","hidden")
        guessTable.removeAttribute("hidden")
    }
}

function wordSelectCountdown() {//updates timer in word box, hides diffTable, and selects word

    setTimeout(function() {updateWordTime(4, isArtist)}, 1*milliPerSec)
    setTimeout(function() {updateWordTime(3, isArtist)}, 2*milliPerSec)
    setTimeout(function() {updateWordTime(2, isArtist)}, 3*milliPerSec)
    setTimeout(function() {updateWordTime(1, isArtist)}, 4*milliPerSec)
    clearWordSpace()
    if (isArtist) {
        setTimeout(function() {
            difficultyTable.setAttribute("hidden", "hidden");
            findSelectedDifficulty();
          // clearInterval(wordInterval);
          // TODO add ability to draw
        },
        5*milliPerSec);
    } else {
        wordSpace.textContent = ''
    }
}

function updateWordTime(seconds, isArtist) { //updates timer in word box
    if (isArtist){
        wordCountdown.textContent = `Confirm Word Difficulty in: ${seconds}`;
    } else {
        wordSpace.textContent = `Start Guessing in: ${seconds}`;
    }
}
let oldGuessBox = document.getElementById('past-guesses')
let userGuess = document.getElementById("wordguess")
userGuess.addEventListener('keyup', function(event) {//allows submission in guessbox
    if (event.code === 'Enter') {
        event.preventDefault()
        let lastGuess = userGuess.value
        checkGuess(lastGuess, turnGuesses)
        oldGuessBox.textContent = `Past Guesses: ${turnGuesses}`
        userGuess.value = ''

    }
})

function checkGuess(guess, oldGuesses){
    if (guess == chosenWord){ //correct guess
        guessTable.setAttribute("hidden","hidden") //hide guessBox
        let score = 0
        correctGuess = true
        correctGuesses++
        if (oldGuesses.length < 2) {
            let score = 20 - 5*oldGuesses.length
        } else {
            let score = 5
        }//update score
        wordSpace.textContent = `CORRECT`
    } else {
        correctGuess = false
        oldGuesses.push(guess) //add guess to turnGuess
        //update turnGuess box
    }
}
// function pickAWord(difficulty) {
//     return pickedWord;
// }

//LeaderBoard Box

// ******************************* Gameflow! ******************************************

//syncing clocks
socket.on("startClock", function (data) {
    startButton.setAttribute("hidden", true);
    isPlaying = true;

    for (userIdx = 0; userIdx < activePlayers.length; userIdx++) {
        playerInfo.push({"username": activePlayers[userIdx], "active": true, "points": 0});
    }

    console.log(`Player Info is: ${playerInfo}`);

    doodlioTurn();
});

startButton.addEventListener("click", function() {
    socket.emit("pressedStart", {roomNum: params.get("roomId")});

    let startRoom = params.get("roomId");
    fetch(`/gameStart?roomCode=${startRoom}`).then(function (response) {
		if (response.status === 200) {
			return;
		} else {
			throw Error(response.status);
		}
	}).catch(function (error) {
		console.log(error);
	});
})



//get list of players

socket.on("activePlayers", function (data) {
    activePlayers = data.activePlayers;
    console.log(activePlayers);

    if (isPlaying) {

        let dropIdx = 0;

        for (let j = 0; j < playerInfo.length; j++){
            if (!activePlayers.includes(playerInfo[j].username)){
                playerInfo[j].active = false;
                dropIdx = j;
                break;
            }
        }
        
        let currentTurn = turn - 1;

        if (dropIdx <= currentTurn) { //if the dropped user is taking/already took their turn
            turn -= 1;
            if (dropIdx === currentTurn) { //if the dropped user is the current artist
                turnSeconds = 0;
            }
        } 

        console.log(`${playerInfo}`);
    }
    
});



function doodlioTurn(){
    correctGuess = false
    oldGuessBox.textContent = ''
    turnGuesses = []
    clearWordSpace();
    headerTable.removeAttribute("hidden")
    turnSpace.textContent = `Turn: ${turn}`
    roundSpace.textContent = `Round: ${(3-roundsLeft) + 1}`
    artistSpace.textContent = `Artist: ${activePlayers[turn-1]}`
    console.log("CURRENT TURN: " + turn + " and Round: " + ((3-roundsLeft) + 1));
    correctGuesses = 0;
    
    if (activePlayers[turn-1] === getCookie("username")) { //user is artist
        console.log(activePlayers[turn-1] + " is artist!");
        isArtist = true;
    } else { //user is guesser
        isArtist = false;
    }
    wordSelectCountdown()
    if (!isArtist){//find chosen word
        setTimeout(function () {}, 5*milliPerSec);
        setTimeout(function() {
            let letterList = chosenWord.split("")
            console.log(`New Word: ${letterList}`)
            updateWordBox(letterList, [])
            updateWordBoxGuesser(letterList, [])
        }, 7*milliPerSec)
    }
    tableHide(isArtist)
    ctx.clearRect(0, 0, doodleBox.width, doodleBox.height);

    turnSeconds = 60*(milliPerSec/1000);
    setTimeout(function() {countdownInterval = setInterval(countDown, milliPerSec)}, 4*milliPerSec) //Wait for wordSelect to end timer
    
}

function userStatUpdate () {
    // find winner;

    for (let s = 0; s < playerInfo.length; s++){
        if (playerInfo[s].active) {

          
        }
    }

    let urlHS = "/highscore?username=" + getCookie("username");
            
    fetch(urlHS).then(function (response) {
        return response.json();
    }).then(function (data) {
       console.log("highscore? : " + data.highscore);
    });

    //let data = {username: getCookie("username"), points: playerInfo.points};
}
