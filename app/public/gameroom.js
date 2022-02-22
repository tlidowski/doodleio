
var easyWords = [ //Put into .txt and import
	"dog",
	"cat",
	"elephant",
	"happy"
]

//Word Box
let wordBox = document.getElementById("word-space")

let newWordButton = document.getElementById("newWordButton")

newWordButton.addEventListener("click", function() {
	wordBox.textContent = pickAWord(easyWords)
})

function pickAWord(wordList) {
	let numWords = wordList.length
	let pickedWord = wordList[Math.floor(Math.random()*numWords)]
	return pickedWord
}

//Doodle Box

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