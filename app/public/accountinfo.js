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

function setCookie(value) {
  document.cookie = "username=" + value;
}

// Fetch Account Info and Updates Fields
let userText = document.getElementById("user");
let gamesPlayedText = document.getElementById("gamesPlayed");
let gamesWonText = document.getElementById("gamesWon");
let highScoreText = document.getElementById("highScore");
let totalpointsText = document.getElementById("totalPoints");

function acctUpdate () {
  fetch("/numgames?username=" + getCookie("username")).then(function (response) {
    return response.json();
  }).then(function (data) {
    console.log("numgames: " + data.numgames);
    gamesPlayedText.textContent = "Games Played: " + data.numgames;
  });

  fetch("/numwon?username=" + getCookie("username")).then(function (response) {
    return response.json();
  }).then(function (data) {
    console.log("numwon: " + data.numwon);
    gamesWonText.textContent = "Games Won: " + data.numwon;
  });

  fetch("/highscore?username=" + getCookie("username")).then(function (response) {
      return response.json();
  }).then(function (data) {
    console.log("highscore: " + data.highscore);
    highScoreText.textContent = "Highest Game Score: " + data.highscore;
  });

  fetch("/totalpoints?username=" + getCookie("username")).then(function (response) {
    return response.json();
  }).then(function (data) {
    console.log("totalpoints: " + data.totalpoints);
    totalpointsText.textContent = "Overall Total Game Score: " + data.totalpoints;
  });
}

console.log(getCookie("username"));
userText.textContent = getCookie("username");
acctUpdate();