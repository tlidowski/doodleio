/*const newGameButton = document.getElementById('newGameButton')
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

ADD YOUR CLIENT-SIDE CODE FOR add.html HERE
*/


let isSignedIn = false
let usernameInput = document.getElementById("username");
let passwordInput = document.getElementById("password");
document.getElementById("logIn").addEventListener("click", function () {
	fetch("/auth", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username: usernameInput.value,
			plaintextPassword: passwordInput.value,
		})
	}).then(function (response) {
		if (response.status === 200) {
			console.log("Successful Login");
			alert("You're In!")
			isSignedIn = true
			accountStatus(isSignedIn)
		} else {
			console.log("Failed Login");
			alert("Something went wrong...")
		}
	});
});
document.getElementById("signUp").addEventListener("click", function () {
	alert("CLICK")
	console.log("CLICKED")
	fetch("/user", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username: usernameInput.value,
			plaintextPassword: passwordInput.value,
		})
	}).then(function (response) {
		if (response.status === 200) {
			alert("Account Created Successfully.")
			alert("Signing You In...") ///To-do: Hook Up Login Auto
			console.log("Successful New Account");
			
		} else if (response.status === 401) {
			alert("Username must be 1-20 characters and Password must be 5-36 characters.")
			console.log("Failed New Account");
		} else {
			console.log("Failed New Account");
		}
	})
});
document.getElementById("signOut").addEventListener("click", function() {
	let isSignedIn = false
	accountStatus(isSignedIn)
})

function accountStatus(signInStatus) {
	alert(`Changing Account Status to ${signInStatus}`)
	let inputBox = document.getElementById("inputBox")
	let logInButton = document.getElementById("logIn")
	let signUpButton = document.getElementById("signUp")
	let signOutButton = document.getElementById("signOut")
	let accountInfoButton = document.getElementById("accountInfoButton")
	let newGameButton = document.getElementById("newGameButton")
	let joinGameButton = document.getElementById("joinGameButton")
	if (signInStatus) { //User Has Logged In
		console.log("Logging In")
		inputBox.setAttribute("hidden", "hidden")
		logInButton.setAttribute("hidden", "hidden")
		signUpButton.setAttribute("hidden", "hidden")
		signOutButton.removeAttribute("hidden")
		accountInfoButton.removeAttribute("hidden")
		newGameButton.classList.replace('button-disabled', 'button')
		joinGameButton.classList.replace('button-disabled', 'button')
	} else {
		console.log("Logging Out")
		inputBox.removeAttribute("hidden")
		logInButton.removeAttribute("hidden")
		signUpButton.removeAttribute("hidden")
		signOutButton.setAttribute("hidden", "hidden")
		accountInfoButton.setAttribute("hidden", "hidden")
		newGameButton.classList.replace('button', 'button-disabled')
		joinGameButton.classList.replace('button', 'button-disabled')
	}
}

