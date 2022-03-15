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

function setCookie(value) {
    document.cookie = "username=" + value;
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

let isSignedIn = false;
let usernameInput = document.getElementById("username");
let passwordInput = document.getElementById("password");

if (!(getCookie("username") == "")) {
    isSignedIn = true;
    accountStatus(isSignedIn);
}

document.getElementById("logIn").addEventListener("click", function () {
    console.log("LOGIN TRIGGERED");
    fetch("/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: usernameInput.value,
            plaintextPassword: passwordInput.value,
        }),
    }).then(function (response) {
        if (response.status === 200) {
            setCookie(usernameInput.value);
            console.log("Successful Login");
            alert("You're In!");
            isSignedIn = true;
            accountStatus(isSignedIn);
        } else {
            console.log("Failed Login");
            alert("Something went wrong...");
        }
    });
});

document.getElementById("signUp").addEventListener("click", function () {
    alert("CLICK");
    console.log("CLICKED");
    fetch("/user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: usernameInput.value,
            plaintextPassword: passwordInput.value,
        }),
    }).then(function (response) {
        if (response.status === 200) {
            setCookie(usernameInput.value);
            alert("Account Created Successfully.");
            alert("Signing You In...");
            console.log("Successful New Account");
            isSignedIn = true;
            accountStatus(isSignedIn);
        } else if (response.status === 401) {
            alert(
                "Username must be 1-20 characters and Password must be 5-36 characters."
            );
            console.log("Failed New Account");
        } else {
            console.log("Failed New Account");
        }
    });
});

document
    .getElementById("user-requirements")
    .addEventListener("click", function () {
        alert(
            "Username must be 1-20 characters \nPassword must be 5-36 characters"
        );
    });
document.getElementById("signOut").addEventListener("click", function () {
    let isSignedIn = false;
    accountStatus(isSignedIn);
});

document.getElementById("newGameButton").addEventListener("click", () => {
    fetch("/newRoomEntry")
        .then(function (response) {
            // window.location.href =
            //     "http://localhost:3000/gameroom.html?roomId=OOZK";
            return response.json();
        })
        .then(function (data) {
            if (data != "NoRoomsAvailable") {
                console.log(data[0]);
                console.log(window.location.href);

                let baseUrl = window.location.href.replace("home.html", "");

                window.location.href = `${baseUrl}gameroom.html?roomId=${data[0].roomid}`;
            } else {
                alert("All game rooms are full. Please try again later.");
            }
        });
});

document.getElementById("joinGameButton").addEventListener("click", () => {
    let textbox = document.getElementById("joinGameTextField");

    let baseUrl = window.location.href.replace("home.html", "");

    let roomVals = ["OOZK", "QMAJ", "WMJH", "JFRC", "LVNR"];

    console.log(textbox.value);

    if (roomVals.includes(textbox.value)) {
        window.location.href = `${baseUrl}gameroom.html?roomId=${textbox.value}`;
    } else {
        alert("Invalid room Id");
    }
});

function accountStatus(signInStatus) {
    //alert(`Changing Account Status to ${signInStatus}`)
    let inputBox = document.getElementById("inputBox");
    let logInButton = document.getElementById("logIn");
    let signUpButton = document.getElementById("signUp");
    let signOutButton = document.getElementById("signOut");
    let accountInfoButton = document.getElementById("accountInfoButton");
    let newGameButton = document.getElementById("newGameButton");
    let joinGameButton = document.getElementById("joinGameButton");
    if (signInStatus) {
        //User Has Logged In
        console.log("Logging In");
        inputBox.setAttribute("hidden", "hidden");
        logInButton.setAttribute("hidden", "hidden");
        signUpButton.setAttribute("hidden", "hidden");
        signOutButton.removeAttribute("hidden");
        accountInfoButton.removeAttribute("hidden");
        accountInfoButton.textContent = getCookie("username");
        console.log(getCookie("username"));
        newGameButton.classList.replace("button-disabled", "button");
        joinGameButton.classList.replace("button-disabled", "button");
    } else {
        document.cookie = "username=";
        console.log("Logging Out");
        inputBox.removeAttribute("hidden");
        logInButton.removeAttribute("hidden");
        signUpButton.removeAttribute("hidden");
        signOutButton.setAttribute("hidden", "hidden");
        accountInfoButton.setAttribute("hidden", "hidden");
        newGameButton.classList.replace("button", "button-disabled");
        joinGameButton.classList.replace("button", "button-disabled");
        console.log(getCookie("username"));
    }
}
