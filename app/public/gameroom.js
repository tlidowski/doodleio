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
let clear = document.getElementById("clearCanvas");
let urlString = window.location.search;
let params = new URLSearchParams(urlString);
let timeouts = []
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
let currentDiff;
let wordRevealInterval = null;

/* 
  Get Cookie Function implemented from:
  https://www.w3schools.com/js/js_cookies.asp
*/
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
    console.log("in cooldown");
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
    console.log(correctGuesses + " and " + (activePlayers.length - 1));
    if (turnSeconds > 0 && correctGuesses < (activePlayers.length - 1)) {
        turnSeconds--;
    } else {
        isArtist = false;
        timerBox.textContent = "Turn Over";
        clearInterval(countdownInterval);
        //clearInterval(wordRevealInterval);

        if (turn >= activePlayers.length) {
            turn = 1;
            roundsLeft -= 1;
        } else {
            turn += 1;
        }

        if (roundsLeft <= 0) {
            timerBox.textContent = "Game Over!";
            userStatUpdate();
            document.getElementById("homeButton").removeAttribute("hidden")
        } else {
            cooldownSeconds = 5*(milliPerSec/1000);
            cooldownInterval = setInterval(coolDown, milliPerSec);
        }

    }
}

//Canvas set up

let currentColor = document.getElementById("currentColor");


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

clear.addEventListener("click", function (e) {
    ctx.clearRect(0, 0, doodleBox.width, doodleBox.height);
});

doodleBox.addEventListener("mousedown", function (e) {
    flag = true;
});

doodleBox.addEventListener("mouseup", function (e) {
    flag = false;
    drawnf = false;
    socket.emit("drawnf", { drawnf: false });
});

currentColor.addEventListener("mousedown", function (e) {
    flag = true;
});

eraser.addEventListener("mousedown", function (e) {
    strokeColor = "white";
});

doodleBox.addEventListener("mousemove", emitDraw);



//Generate Word Space
let difficultList = ["easy", "medium", "hard", "expert"]
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
    selectedDiff = difficultList[Math.floor(Math.random()*difficultList.length)];
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
        socket.emit("wordPicked", {roomNum: params.get("roomId"), chosenWord: chosenWord, diff: selectedDiff});
        let letterList = chosenWord.split("");
        let pickedIndices = []
        updateWordBox(letterList, pickedIndices);

    }
}).catch(function (error) {
    console.log(error);
});}

socket.on("wordSent", function (data) {
    chosenWord = data.chosenWord; 
    currentDiff = data.diff;
    console.log(currentDiff)
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
    timeouts.push(setTimeout(function() { revealLetter(letterList,pickedIndices); }, 60*milliPerSec*.5))
    timeouts.push(setTimeout(function() { revealLetter(letterList,pickedIndices); }, 60*milliPerSec*.75))
    timeouts.push(setTimeout(function() { revealLetter(letterList,pickedIndices); }, 60*milliPerSec*.9))
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
    guessTable.setAttribute("hidden","hidden")
    if (isArtist){
        difficultyTable.removeAttribute("hidden")
        toolTable.removeAttribute("hidden")
    } else { //is Guesser
        difficultyTable.setAttribute("hidden","hidden")
        toolTable.setAttribute("hidden","hidden")
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
        setTimeout(function() {
            guessTable.removeAttribute("hidden");
          // clearInterval(wordInterval);
          // TODO add ability to draw
        },
        5*milliPerSec)
    }
}

function updateWordTime(seconds, isArtist) { //updates timer in word box
    if (isArtist){
        wordCountdown.textContent = `Confirm Word Difficulty in: ${seconds}`;
    } else {
        wordSpace.textContent = `Start Guessing in: ${seconds}`;
        guessTable.setAttribute("hidden", "hidden")
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
    if (guess.toUpperCase() == chosenWord.toUpperCase()){ //correct guess
        guessTable.setAttribute("hidden","hidden") //hide guessBox
        let score = 0
        correctGuess = true
        //correctGuesses++
        if (oldGuesses.length < 2) {
            score = 20 - 5*oldGuesses.length
        } else {
            score = 5
        }//update score
        console.log("THIS IS SCORE: " + score);
        wordSpace.textContent = `CORRECT`
        socket.emit("correctGuessing", {roomNum: params.get("roomId"), username: getCookie("username"), points: score});
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
let player1Box = document.getElementById('player1')
let player2Box = document.getElementById('player2')
let player3Box = document.getElementById('player3')
let player4Box = document.getElementById('player4')

socket.on("startClock", function (data) {
    startButton.setAttribute("hidden", true);
    isPlaying = true;

    for (userIdx = 0; userIdx < activePlayers.length; userIdx++) {
        playerInfo.push({"username": activePlayers[userIdx], "active": true, "points": 0});
    }

    console.log(playerInfo);

    for (i = 0; i < playerInfo.length; i++){
        let user = playerInfo[i].username
        let score = playerInfo[i].points
        if (i == 0){
            player1Box.textContent = `${user}: ${score}`.toUpperCase()
        } else if (i == 1){
            player2Box.textContent = `${user}: ${score}`.toUpperCase()
        } else if (i == 2){
            player3Box.textContent = `${user}: ${score}`.toUpperCase()
        } else {
            player4Box.textContent = `${user}: ${score}`.toUpperCase()
        }
    }

    doodlioTurn();
});

startButton.addEventListener("click", function() {
    isArtist = false
    tableHide("isArtist")
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
    console.log(playerInfo)
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

    if (!isPlaying){
        for (i = 0; i < 4; i++){
            if (i < activePlayers.length) {
                let user = activePlayers[i]
                if (i == 0){
                    player1Box.textContent = `${user} is in`
                } else if (i == 1){
                    player2Box.textContent = `${user} is in`
                } else if (i == 2){
                    player3Box.textContent = `${user} is in`
                } else {
                    player4Box.textContent = `${user} is in`
                }
            } else {
                if (i == 0){
                    player1Box.textContent = ``
                } else if (i == 1){
                    player2Box.textContent = ``
                } else if (i == 2){
                    player3Box.textContent = ``
                } else {
                    player4Box.textContent = ``
                }
            }
            
        }
    }
    
    
});

// on correct guesses
socket.on("correctGuessUpdates", function (data) {
    correctGuesses += 1;
    console.log("There was a correct guess")
    console.log("data: " + data.points);
    console.log(chosenWord)

    for (let s = 0; s < playerInfo.length; s++){
        if (data.username === playerInfo[s].username) { //update correct guesser's score
            playerInfo[s].points += data.points;   
            console.log(`Giving Guesser ${playerInfo[s].username} ${data.points} points`)
        } else if (activePlayers[turn-1] === playerInfo[s].username) { //current artist score matches user in database
            let wordMult = null
            let diff = ""
            if (isArtist){
                diff = selectedDiff
            } else {
                diff = currentDiff
            }
            if (diff == "easy"){
                wordMult = 1
            } else if (diff =="medium"){
                wordMult = 2
            } else if (diff == "hard"){
                wordMult = 3
            } else if (diff == "expert"){
                wordMult = 4
            }
            console.log(`Giving Artist ${playerInfo[s].username} ${5*wordMult} points`)  //Artist scored by 5*wordDiff (easy=1; expert=4)
            playerInfo[s].points += 5*wordMult;        
        }
        console.log(`New Total: ${playerInfo[s].points}`)
    }

    console.log(playerInfo)
    for (i = 0; i < playerInfo.length; i++){
        let user = playerInfo[i].username
        let score = playerInfo[i].points
        if (i == 0){
            player1Box.textContent = `${user}: ${score}`.toUpperCase()
        } else if (i == 1){
            player2Box.textContent = `${user}: ${score}`.toUpperCase()
        } else if (i == 2){
            player3Box.textContent = `${user}: ${score}`.toUpperCase()
        } else {
            player4Box.textContent = `${user}: ${score}`.toUpperCase()
        }
    }

    console.log(playerInfo);
});


function doodlioTurn(){
    while(timeouts.length>0){
	clearTimeout(timeouts.pop());
    }
    correctGuess = false;
    correctGuesses = 0;
    oldGuessBox.textContent = '';
    turnGuesses = [];
    clearWordSpace();
    headerTable.removeAttribute("hidden")
    turnSpace.textContent = `Turn: ${turn} / ${activePlayers.length}`
    roundSpace.textContent = `Round: ${(3-roundsLeft) + 1} / 3`
    artistSpace.textContent = `Artist: ${activePlayers[turn-1]}`
    console.log("CURRENT TURN: " + turn + " and Round: " + ((3-roundsLeft) + 1));
    correctGuesses = 0;
    
    if (activePlayers[turn-1] === getCookie("username")) { //user is artist
        console.log(activePlayers[turn-1] + " is artist!");
        isArtist = true;
    } else { //user is guesser
        isArtist = false;
    }
    tableHide(isArtist)
    wordSelectCountdown()
    if (!isArtist){//find chosen word

        wordRevealInterval = setTimeout(function() {
            let letterList = chosenWord.split("")
            console.log(`New Word: ${letterList}`)
            updateWordBox(letterList, [])
            updateWordBoxGuesser(letterList, [])
            guessTable.removeAttribute("hidden")
        }, 6*milliPerSec)
    }
    ctx.clearRect(0, 0, doodleBox.width, doodleBox.height);

    turnSeconds = 60*(milliPerSec/1000);
    setTimeout(function() {countdownInterval = setInterval(countDown, milliPerSec)}, 4*milliPerSec) //Wait for wordSelect to end timer
    
}

function userStatUpdate () {
    isArtist = true
    toolTable.removeAttribute("hidden")
    // find winner;
    let winner = ''; 
    let maxScore = 0;
    let thisUser = '';
    let userHighscore = 0;

    for (let s = 0; s < playerInfo.length; s++){
        if (playerInfo[s].active) {
            if (getCookie("username") === playerInfo[s].username) {
                thisUser = playerInfo[s];
            }

            if (playerInfo[s].points > maxScore){
                maxScore = playerInfo[s].points;
                winner = playerInfo[s].username;
            }
          
        }
    }

    //update winner to header
    roundSpace.textContent = `Winner:`
    turnSpace.textContent = `${winner}`
    artistSpace.textContent = `Their Score:`
    timerBox.textContent = `${maxScore}`
    wordSpace.textContent = `Free Draw!`

    console.log(thisUser);
    console.log("WINNER: " + winner + " with points: " + maxScore);

    // get current highscore
    let urlHS = "/highscore?username=" + getCookie("username");
            
    fetch(urlHS).then(function (response) {
        return response.json();
    }).then(function (data) {
       userHighscore = data.highscore;
    });

    // update stats
    let data = {username: thisUser.username, points: thisUser.points};
    

    fetch("/updateRegStats", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(function (response) {
		if (!(response.status === 200)) {
			throw Error();
		}
	}).then(function (data) {
		console.log("Success");
	}).catch(function (error) {
		console.log("Bad request");
	});

    if (thisUser.points > userHighscore) {
        fetch("/updateHighScore", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(function (response) {
            if (!(response.status === 200)) {
                throw Error();
            }
        }).then(function (data) {
            console.log("Success");
        }).catch(function (error) {
            console.log("Bad request");
        });
    }

    if (thisUser.username === winner) {
        fetch("/updateNumWon", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(function (response) {
            if (!(response.status === 200)) {
                throw Error();
            }
        }).then(function (data) {
            console.log("Success");
        }).catch(function (error) {
            console.log("Bad request");
        });
    }
    


}
