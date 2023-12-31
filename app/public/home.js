function setCookie(value) {
    document.cookie = "username=" + value;
}

/* 
  Get Cookie Function implemented from:
  https://www.w3schools.com/js/js_cookies.asp
*/
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
        console.log(response)
        if (response.status === 200) {
            setCookie(usernameInput.value);
            console.log("Successful Login");
            alert("Successful Login!");
            isSignedIn = true;
            accountStatus(isSignedIn);
        } else if (response.status === 404) {
            alert("Username not found. Did you mean to sign up instead?")
        } else if (response.status === 401){
            alert("Username and Password do not match.")
        } else {
            console.log("Failed Login");
            alert("Sorry! Something went wrong. Please try again.");
        }
    });
});

document.getElementById("signUp").addEventListener("click", function () {
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
        console.log(response)
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
        } else if (response.status === 409){
            alert("Username is taken. Please try another username.")
        } else {
            alert("Oops. Something went wrong. Please try again.")
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
            return response.json();
        })
        .then(function (data) {
            if (data != "NoRoomsAvailable") {
                console.log(data[0]);
                console.log(window.location.href);

                let baseUrl = window.location.href.replace("index.html", "");

                window.location.href = `${baseUrl}gameroom.html?roomId=${data[0].roomid}`;
            } else {
                alert("All game rooms are full. Please try again later.");
            }
        });
    // need to set isAvailable to false;
});

document.getElementById("joinGameButton").addEventListener("click", () => {
    let textbox = document.getElementById("joinGameTextField");

    let baseUrl = window.location.href.replace("index.html", "");

    let roomVals = ["OOZK", "QMAJ", "WMJH", "JFRC", "LVNR"];
    let roomAvail = true;

    console.log(textbox.value);

    if (roomVals.includes(textbox.value)) {
        fetch(`/joinRoomEntryNumPlayers`)
            .then(function (response) {
                return response.json();
            })
            .then((data) => {
                console.log(data);

                let dataList = [];

                for (let room of data) {
                    dataList.push(room.roomid);
                }

                console.log(dataList);

                if (dataList.includes(textbox.value)) {
                    window.location.href = `${baseUrl}gameroom.html?roomId=${textbox.value}`;
                } else {
                    alert("Room already has the maximum number of players.");
                }
            });

        // console.log("test")
        // if (roomAvail) {
        //     fetch(`/joinRoomEntryPlaying?roomCode=${textbox.value}`)
        //         .then(function (response) {
        //             if (!response.status === 200){
        //                 throw Error();
        //             }
        //         }).then(function (data) {
        //             console.log("test");
        //             //window.location.href = `${baseUrl}gameroom.html?roomId=${textbox.value}`;
        //         }).catch(function (error) {
        //             alert("Room cannot be joined!")
        //         });

        // }
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
