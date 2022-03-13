const pg = require("pg");
const bcrypt = require("bcrypt");

const port = 3000;
const hostname = "localhost";

//For Doodle Board
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { createRoom, startRoom, joinRoom, leaveRoom } = require("./roommanager");

/*pool.connect().then(function () {
    //console.log(`Connected to database ${env.database}`);
});*/

//Taken From Login/Create Exercise
const saltRounds = 10;
const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
    console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json());

server.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});

/* 
    Websocket Code -- Drawing emit to other clients implemented from:
    https://github.com/wesbos/websocket-canvas-draw/blob/master/server.js
*/

//For Doodle Board
io.on("connection", function (socket) {
    console.log("a user connected");

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("joinRoom", ({ username, roomNum }) => {
        // loosely based on: https://github.com/bradtraversy/chatcord
        const user = joinRoom(socket.id, username, roomNum);

        //pool.query('UPDATE users SET roomID = $1 where username = $2', [user.roomNum, user.username]);

        socket.join(user.roomNum);

        console.log("joined " + user.roomNum);
    });

    socket.on("drawClick", function (data) {
        socket.broadcast.emit("draw", {
            xcor: data.xcor,
            ycor: data.ycor,
            drawnf: data.drawnf,
        });
    });
});

app.get("/guess", function (req, res) {
    //Queries guess, user, canGuess
    let body = req.query;
    let guess = body.guess;
    let user = body.user;
    let canGuess = body.canGuess;
    if (canGuess) {
        //User is a guesser who has not guessed yet
    } else {
        //Don't allow a guess
    }
});

//User Authentication
app.post("/user", function (req, res) {
    let username = req.body.username;
    let plaintextPassword = req.body.plaintextPassword;
    // TODO check body has username and plaintextPassword keys
    // TODO check password length >= 5 and <= 36
    // TODO check username length >= 1 and <= 20

    // TODO check if username already exists
    if (
        typeof username !== "string" ||
        typeof plaintextPassword !== "string" ||
        username.length < 1 ||
        username.length > 20 ||
        plaintextPassword.length < 5 ||
        plaintextPassword.length > 36
    ) {
        // username and/or password invalid
        return res.status(401).send();
    }

    pool.query("SELECT username FROM users WHERE username = $1", [username])
        .then(function (response) {
            if (response.rows.length !== 0) {
                // username already exists
                return res.status(401).send();
            }
            bcrypt
                .hash(plaintextPassword, saltRounds)
                .then(function (hashedPassword) {
                    pool.query(
                        "INSERT INTO users (username, hashed_password) VALUES ($1, $2)",
                        [username, hashedPassword]
                    )
                        .then(function (response) {
                            // account successfully created
                            res.status(200).send();
                        })
                        .catch(function (error) {
                            console.log(error);
                            res.status(500).send(); // server error
                        });
                })
                .catch(function (error) {
                    console.log(error);
                    res.status(500).send(); // server error
                });
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).send(); // server error
        });
});

app.post("/auth", function (req, res) {
    console.log("Attempting...");
    let username = req.body.username;
    let plaintextPassword = req.body.plaintextPassword;
    pool.query("SELECT hashed_password FROM users WHERE username = $1", [
        username,
    ])
        .then(function (response) {
            if (response.rows.length === 0) {
                console.log("User not found");
                // username doesn't exist
                return res.status(401).send();
            }
            let hashedPassword = response.rows[0].hashed_password;
            bcrypt
                .compare(plaintextPassword, hashedPassword)
                .then(function (isSame) {
                    if (isSame) {
                        // password matched
                        res.status(200).send();
                    } else {
                        // password didn't match
                        console.log("Incorrect Password");
                        res.status(401).send();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    res.status(500).send(); // server error
                });
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).send(); // server error
        });
});
