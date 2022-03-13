//set up artist space
var flag = false;
var drawnf = false;
var lastf;
var strokeColor;
var strokeSize;
var fill = document.getElementById("fill");
var pencil = document.getElementById("pencil");
var eraser = document.getElementById("eraser");
var colors = [
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
var easyWords = [
    //Put into .txt and import? Or from Database
    "dog",
    "cat",
    "elephant",
    "happy",
];
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

let doodleBox = document.getElementById("drawing-board");
let ctx = doodleBox.getContext("2d");

let lastSentf;

socket.emit("joinRoom", { username: "kyleQ", roomNum: "5" });

function setup() {
    var currentColor = document.getElementById("currentColor");
    var styleRow = document.getElementById("styleRow");
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
        var col = document.createElement("td");
        var element = document.createElement("div");
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
//

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

function countDown() {
    timerBox.textContent = `Time Remaining: ${seconds}`;
    if (seconds > 0) {
        seconds--;
    } else {
        turnInProgress = false;
    }
}

checkTurnStatus();
setInterval(checkTurnStatus, 1000);

/*
	Doodle Box -- Sets up canvas and allows for drawing, drawings appear in real-time for other clients.
	Drawing emit implemented from: https://github.com/wesbos/websocket-canvas-draw/blob/master/scripts.js
*/

let draw = function (xcor, ycor, drawnf) {
    lastSentf = { x: xcor, y: ycor };
};

socket.on("draw", function (data) {
    return draw(data.xcor, data.ycor, data.drawnf);
});

// size of canvas
doodleBox.width = 350;
doodleBox.height = 400;

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

fill.addEventListener("mousedown", function (e) {
    flag = true;
});

doodleBox.addEventListener("mousemove", function (e) {
    if (flag) {
        ctx.beginPath();
        var xcor = e.offsetX;
        var ycor = e.offsetY;
        if (drawnf) {
            ctx.lineCap = "round";
            ctx.moveTo(lastf.x, lastf.y);
            ctx.lineTo(xcor, ycor);
            ctx.lineWidth = 1;
            ctx.strokeStyle = strokeColor;
            ctx.stroke();
        }
        lastf = { x: xcor, y: ycor };

        socket.emit("drawClick", { xcor: xcor, ycor: ycor, drawnf: drawnf });

        drawnf = true;
    }
});

//LeaderBoard Box
