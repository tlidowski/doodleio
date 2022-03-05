const port = 3000;
const hostname = "localhost";

const pg = require("pg");
const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);

const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);

const {Server} = require("socket.io");
const io = new Server(server);

/*pool.connect().then(function () {
    //console.log(`Connected to database ${env.database}`);
});*/

app.use(express.static("public"));
app.use(express.json());

server.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});

/* 
    Websocket Code -- Drawing emit to other clients implemented from:
    https://github.com/wesbos/websocket-canvas-draw/blob/master/server.js
*/

io.on('connection', function(socket) {
	console.log('a user connected');

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('drawClick', function(data) {
		socket.broadcast.emit('draw', {xcor: data.xcor, ycor: data.ycor, drawnf: data.drawnf});
	});

});


app.get("/guess", function (req, res) { //Queries guess, user, canGuess
    let body = req.query;
    let guess = body.guess;
    let user = body.user;
    let canGuess = body.canGuess;
    if (canGuess) { //User is a guesser who has not guessed yet
        
    } else {
        //Don't allow a guess
    }
});
/* YOUR CODE HERE */

/*
let acceptableGenre = [
    "scifi",
    "romance",
    "adventure"
]

let acceptableQuality = [
    "yes",
    "no"
]


app.post("/add", function(req, res) {
    let body = req.body
    if (
        !body.hasOwnProperty("title") ||
        !body.hasOwnProperty("genre") ||
        !body.hasOwnProperty("quality")
    ) {
        res.status(400)
        res.send()
        return
    } else {
        let title = body.title
        let genre = body.genre
        let quality = body.quality
        if (
            title.length > 15 || title.length < 1 ||
            !acceptableGenre.includes(genre) ||
            !acceptableQuality.includes(quality)
        ) {
            res.status(400)
            res.send()
            return
        }
    }


    //Insert Book
    
    pool.query(
        `INSERT INTO books(title, genre, quality) 
        VALUES($1, $2, $3)
        RETURNING *`,
        [body.title, body.genre, body.quality]
    ).then(function (response) {
        res.status(200)
        res.send()
    })
    .catch(function (error) {
        // something went wrong when inserting the row
        res.status(500)
        res.send()
    });
})

app.get("/search", function (req, res) {
    let { genre } = req.query;
    if (Object.keys(genre).length === 0) { //Any Genre
        pool.query("SELECT * FROM books")
        .then(function (response) {
            return res.json({ rows: response.rows });
        })
        .catch(function (error) {
            return res.status(500);
        });
    } else if (!acceptableGenre.includes(genre)) {
        return res.status(400);
    }
    pool.query("SELECT * FROM books WHERE genre = $1", [genre])
        .then(function (response) {
            return res.json({ rows: response.rows });
        })
        .catch(function (error) {
            return res.status(500);
        });
});

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});

*/