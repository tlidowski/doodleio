const newGameButton = document.getElementById('newGameButton')
const joinGameButton = document.getElementById('joinGameButton')
const logInSignUpButton = document.getElementById('loginsignup')
const accountInfoButton = document.getElementById('accountInfoButton')

const userSignedIn = false; //default user is signed out

if (userSignedIn) {
    newGameButton.disabled = true;
    joinGameButton.disabled = false;
} else {
    newGameButton.disabled = "enabled";
    joinGameButton.disabled = "enabled";
}
newGameButton.onclick = function() { 
    location.href = "localhost:3000/gameroom.html"
}
/*
ADD YOUR CLIENT-SIDE CODE FOR add.html HERE
*/



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


