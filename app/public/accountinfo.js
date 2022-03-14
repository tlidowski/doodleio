function setCookie(value) {
    document.cookie = "username=" + value;
}

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

let userText = document.getElementById("user");
let gamesPlayedText = document.getElementById("gamesPlayed");
let gamesWonText = document.getElementById("gamesWon");
let highScoreText = document.getElementById("highScore");
let totalpointsText = document.getElementById("totalPoints");

console.log(getCookie("username"));
userText.textContent = getCookie("username");