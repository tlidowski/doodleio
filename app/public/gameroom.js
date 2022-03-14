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
let testSpeed = 1000; //Keep default at 1000 for timer
let easyWords = [
    //Put into .txt and import? Or from Database
    "dog",
    "cat",
    "elephant",
    "happy",
];

let urlString = window.location.search;
let params = new URLSearchParams(urlString);

console.log(params.get("roomId"));

//Current Default; Change When Artist Characteristic is Accessible
let isArtist = false;

//Word Box
let wordBox = document.getElementById("underscore-space");

let newWordButton = document.getElementById("newWordButton");
//Guess Box
let guess;

//Timer
let timerBox = document.getElementById("timer-space");
let seconds = 60;

let turnInProgress = true;
let intervalId = null;
let turnStarted = false;

//Drawing Box
let doodleBox = document.getElementById("drawing-board");
let ctx = doodleBox.getContext("2d");

let lastSentf;

// Gameflow globals
let startButton = document.getElementById("start-button")
let activePlayers = []; //list that holds username:points pairs.
let currentTurn = 1;
let roundsLeft = 3;

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

function countDown() {
    timerBox.textContent = `Time Remaining: ${seconds}`;
    if (seconds > 0) {
        seconds--;
        //socket.emit("tickDown",{seconds:seconds});
    } else {
        turnInProgress = false;
        timerBox.textContent = "Turn Over";
    }
}

function checkTurnStatus() {
    if (turnInProgress && !turnStarted) {
        turnStarted = true;
        //intervalId = setInterval(countDown, testSpeed); (sorry dora, im testing)
    } else if (!turnInProgress) {
        clearInterval(intervalId);
        turnStarted = false;
    }
}
checkTurnStatus();
setInterval(checkTurnStatus, 1000);

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
    if (flag) {
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





//Generate Word Space

newWordButton.addEventListener("click", function () {
    clearWordSpace();
    chosenWord = pickAWord(easyWords);
    console.log(chosenWord);
    letterList = chosenWord.split("");
    console.log(letterList);
    for (letterIndex in letterList) {
        box = document.createElement("td");
        box.classList.add("blankLetter");
        if (isArtist) {
            //ShowWord
            box.textContent = letterList[letterIndex];
        } else {
            box.textContent = "_"; //change: create a function to reveal a random character at 30, 10 seconds
        }
        wordBox.append(box);
    }
});

function clearWordSpace() {
    wordBox.innerHTML = "";
}

function pickAWord(wordList) {
    //To be changed to connect to database
    let numWords = wordList.length;
    let pickedWord = wordList[Math.floor(Math.random() * numWords)];
    return pickedWord;
}

//LeaderBoard Box

// ******************************* Gameflow! ******************************************

//syncing clocks
socket.on("startClock", function (data) {
    setInterval(countDown, testSpeed);
    gameFlow();
});

startButton.addEventListener("click", function() {
    socket.emit("pressedStart", {roomNum: params.get("roomId")});
})


//get list of players

socket.on("activePlayers", function (data) {
    activePlayers = data.activePlayers;
    console.log(activePlayers);
});



function gameFlow() {
    console.log("CURRENT TURN: " + currentTurn);
    if (activePlayers[currentTurn-1] === getCookie("username")) {
        isArtist = true;
    }

    if (isArtist) {
        doodleBox.addEventListener("mousemove", emitDraw);
    } else {
        doodleBox.removeEventListener('mousemove', emitDraw);
    }

    currentTurn += 1;
}