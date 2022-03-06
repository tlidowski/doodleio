
var easyWords = [ //Put into .txt and import? Or from Database
	"dog",
	"cat",
	"elephant",
	"happy"
]
//Current Default; Change When Artist Characteristic is Accessible
let isArtist = false

//Word Box
let wordBox = document.getElementById("underscore-space")

let newWordButton = document.getElementById("newWordButton")

newWordButton.addEventListener("click", function() {
	clearWordSpace()
	chosenWord = pickAWord(easyWords)
	console.log(chosenWord)
	letterList = chosenWord.split('')
	console.log(letterList)
	for (letterIndex in letterList) {
		box = document.createElement("td")
		box.classList.add("blankLetter")
		if (isArtist) {
			//ShowWord
			box.textContent = letterList[letterIndex]
		} else {
			box.textContent = "_"
		}		
		wordBox.append(box)	
	}
	
})

function clearWordSpace() {
	wordBox.innerHTML = ""
}

function pickAWord(wordList) {
	let numWords = wordList.length
	let pickedWord = wordList[Math.floor(Math.random()*numWords)]
	return pickedWord
}

/*
	Doodle Box -- Sets up canvas and allows for drawing, drawings appear in real-time for other clients.
	Drawing emit implemented from: https://github.com/wesbos/websocket-canvas-draw/blob/master/scripts.js
*/

let doodleBox = document.getElementById("drawing-board");
let ctx = doodleBox.getContext("2d");

let flag = false;
let drawnf = false;
let lastf;
let lastSentf;

let draw = function(xcor, ycor, drawnf) {
	ctx.beginPath();

	if(drawnf){
	    ctx.lineCap = "round";
	    ctx.moveTo(lastSentf.x, lastSentf.y)
	    ctx.lineTo(xcor, ycor);
	    ctx.lineWidth = 1;
	    ctx.stroke();
	}


	lastSentf = {x: xcor, y: ycor};
}


socket.on('draw', function(data) {
	return draw(data.xcor, data.ycor, data.drawnf);
});

// size of canvas
doodleBox.width = 350;
doodleBox.height = 400;


doodleBox.addEventListener('mousedown',function(e) {
    flag=true;
});

doodleBox.addEventListener('mouseup',function(e) {
    flag=false;
    drawnf=false;
    socket.emit('drawnf', {drawnf: false});
});

doodleBox.addEventListener('mousemove',function(e) {
    if(flag){
	ctx.beginPath();
	var xcor = e.offsetX;
	var ycor = e.offsetY;
	if(drawnf){
	    ctx.lineCap = "round";
	    ctx.moveTo(lastf.x, lastf.y)
	    ctx.lineTo(xcor, ycor);
	    ctx.lineWidth = 1;
	    ctx.stroke();
	}
	lastf = {x: xcor, y: ycor};
	
	socket.emit('drawClick', {xcor: xcor, ycor:ycor, drawnf:drawnf});

	drawnf = true;
    }

});


//LeaderBoard Box

//Guess Box


/*
let dropdown = document.getElementById("genre");
let table = document.getElementById("books");
let button = document.getElementById("submit");

function removeChildren(element) {
	while (element.hasChildNodes()) {
		element.lastChild.remove();
	}
}

button.addEventListener("click", function() {
	let dropdown = document.getElementById("genre");
	let table = document.getElementById("books");
	let genre = dropdown.value;
	fetch(`/search?genre=${genre}`).then(function (response) {
		if (response.status === 200) {
			return response.json();
		} else {
			return response.status;
		}
	}).then(function (response) {
		removeChildren(table);
		let message = document.getElementById("message");
		if (response.rows.length === 0) { //No books
			message.textContent = "No books found"
		} else { //Books
			message.textContent = ""
			for (let row of response.rows) {
				let tableRow = document.createElement("tr");
				let keyIndex = 0;
				for (let key of ["title", "genre", "quality"]) {
					let cell = document.createElement("td");
					if (keyIndex == 2) {
						let quality = row[key]
						if (quality) {
							cell.textContent = "Yes";
						} else {
							cell.textContent = "No";
						}
					} else {
						cell.textContent = row[key];
					}
					keyIndex++
					tableRow.append(cell);
				}
				table.append(tableRow);
			}
		}
	}).catch(function (error) {
		console.log(error);
	});

});
*/