/*
ADD YOUR CLIENT-SIDE CODE FOR add.html HERE
*/

let titleInput = document.getElementById("title");
let genreInput = document.getElementById("genre");
let qualityCollection = document.getElementsByName("quality");
let button = document.getElementById("submit");


button.addEventListener("click", function() {
	let titleChoice = titleInput.value
	// TODO print other fields
	let genreChoice = genreInput.value
    for (let option of qualityCollection) {
        if (option.checked) {
            var qualityChoice = option.value
        }
    }
	let data = {title: titleChoice, genre: genreChoice, quality: qualityChoice}
	fetch('/add', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
     }).then(function (response) {
		let textBox = document.getElementById("message")
        if (response.status == 200) {
            textBox.textContent = "Success" // will be 400 if request failed
        } else {
            textBox.textContent = "Bad Request"
        }
	})
});

