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

// SQL Functions -- Taken from https://stackoverflow.com/questions/58254717/returning-the-result-of-a-node-postgres-query

async function selectFrom(data, table, condition, parameters) {
    try {
        const res = await pool.query(
            `SELECT ${data} FROM ${table} ${condition}`,
            parameters
        );
        return res.rows[0][data];
    } catch (err) {
        return err.stack;
    }
}

//Taken From Login/Create Exercise
const saltRounds = 10;
const env = require("../env.json");
const { response } = require("express");
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

userRoomsLocalStorage = [];

//For Doodle Board
io.on("connection", function (socket) {
    console.log("a user connected");

    socket.on("joinRoom", async function ({ username, roomNum }) {
        // loosely based on: https://github.com/bradtraversy/chatcord

        id = socket.id;
        const user = { id, username, roomNum };

        let isPlaying = await selectFrom(
            "isplaying",
            "rooms",
            `WHERE roomid = $1`,
            [user.roomNum]
        ); //needs the start button

        if (!isPlaying) {
            //update users
            pool.query("UPDATE users SET roomID = $1 where username = $2", [
                user.roomNum,
                user.username,
            ]).catch(function (error) {
                return -1;
            });

            userRoomsLocalStorage.push({
                roomNum: roomNum,
                id: socket.id,
                username: username,
            });

            socket.join(user.roomNum);

            //update rooms
            pool.query(
                "UPDATE rooms SET numplayers = numplayers + 1 where roomid = $1",
                [user.roomNum]
            ).catch(function (error) {
                return -1;
            });

            // check amount of people in room
            let numPlayers = await selectFrom(
                "numplayers",
                "rooms",
                `WHERE roomid = $1`,
                [user.roomNum]
            );

            /*if (numPlayers >= 4) {
                console.log("Room is full!");
                pool.query(
                    "UPDATE rooms SET isplaying = TRUE where roomid = $1",
                    [user.roomNum]
                ).catch(function (error) {
                    return -1;
                }); //redirect --> home.html
            }*/

            console.log(user.username + "joined " + user.roomNum);

            // send out active players
            let listPlayers = [];
            for (let userInfo in userRoomsLocalStorage) {
                if (userRoomsLocalStorage[userInfo].roomNum === user.roomNum) {
                    listPlayers.push(userRoomsLocalStorage[userInfo].username);
                }
            }
            //console.log(listPlayers);
            io.in(roomNum).emit("activePlayers", {
                activePlayers: listPlayers,
            });
        }
    });

    socket.on("pressedStart", function (data) {
        io.in(data.roomNum).emit("startClock", {});
    });

    socket.on("drawClick", function (data) {
        // from https://github.com/bradtraversy/chatcord

        user = userRoomsLocalStorage.find((user) => user.id === socket.id);
        socket.broadcast.to(user.roomNum).emit("draw", {
            xcor: data.xcor,
            ycor: data.ycor,
            drawnf: data.drawnf,
            strokeSize: data.strokeSize,
            strokeColor: data.strokeColor,
        });
    });

    socket.on("disconnect", async function () {
        console.log("user disconnected");
        let room;

        for (let i = 0; i < userRoomsLocalStorage.length; i++) {
            let user = userRoomsLocalStorage[i];
            if (user.id === socket.id) {
                room = user.roomNum;

                //update users
                pool.query("UPDATE users SET roomid = $1 where username = $2", [
                    "blank",
                    user.username,
                ]).catch(function (error) {
                    return -1;
                });

                //update rooms
                pool.query(
                    "UPDATE rooms SET numplayers = numplayers - 1 where roomid = $1",
                    [user.roomNum]
                ).catch(function (error) {
                    return -1;
                });

                let numPlayers = await selectFrom(
                    "numplayers",
                    "rooms",
                    `WHERE roomid = $1`,
                    [user.roomNum]
                );

                console.log("NUM PLAYERS: " + numPlayers);

                if (numPlayers <= 1) {
                    pool.query(
                        "UPDATE rooms SET isAvailable = TRUE where roomid = $1",
                        [user.roomNum]
                    ).catch(function (error) {
                        return -1;
                    });

                    console.log(user.roomNum);
                    pool.query(
                        "UPDATE rooms SET isPlaying = FALSE where roomid = $1",
                        [user.roomNum]
                    ).catch(function (error) {
                        return -1;
                    });
                }

                userRoomsLocalStorage.splice(i, 1);

                let listPlayers = [];
                for (let userInfo in userRoomsLocalStorage) {
                    if (userRoomsLocalStorage[userInfo].roomNum === room) {
                        listPlayers.push(
                            userRoomsLocalStorage[userInfo].username
                        );
                    }
                }
                io.in(user.roomNum).emit("activePlayers", {
                    activePlayers: listPlayers,
                });
                console.log("deleted user ");
            }
        }
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

let validDifficulty = ["easy", "medium", "hard", "expert"];
app.get("/gameroom", async function (req, res) {
    let diff = req.query["difficulty"];
    if (!validDifficulty.includes(diff)) {
        console
            .log("Not a valid difficulty level");
            
        res.send().status(500);
    } else {
        let respWord = await selectFrom(
            "word",
            "words",
            `WHERE difficulty = $1 ORDER BY RANDOM() LIMIT 1`,
            [diff]
        ).then(function(respWord){
            res.json({ word: respWord });
	}).catch(function(error){
	    res.send().status(500);
	}
		);
	
    }
    
});
	
	//User Authentication
app.post("/user", function (req, res) {
    //signup
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
                        "INSERT INTO users (username, userPass, numGames, numWon, highScore, totalPoints) VALUES ($1, $2, $3, $4, $5, $6)",
                        [username, hashedPassword, 0, 0, 0, 0]
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

app.get("/newRoomEntry", function (req, res) {
    pool.query(
        "SELECT roomID FROM rooms WHERE isPlaying = FALSE AND isAvailable = TRUE AND NOT roomid = 'blank' "
    ).then(function (response) {
        let openRooms = JSON.stringify(response.rows);
        if (openRooms.length > 0) {
            res.status(200);
            res.send(openRooms);
        } else {
            res.send("NoRoomsAvailable");
            res.status(400);
        }

        //console.log("newRoomEntries: " + JSON.stringify(response.rows));
    });
});


app.get("/joinRoomEntryNumPlayers", async function (req, res) {
    let room = req.query["roomCode"]
    let numPlayersToJoin = await selectFrom("numplayers", "rooms", `WHERE roomid = $1`, [room]).then(function(numPlayersToJoin){
        if (numPlayersToJoin  < 4) {
            res.status(200);
        } else {
            res.status(400);
        }
    }).catch(function(error){
        res.send().status(500);
    });
});


app.get("/joinRoomEntryPlaying", async function (req, res) {
    let room = req.query["roomCode"]
    let numPlayersToJoin = await selectFrom("isPlaying", "rooms", `WHERE roomid = $1`, [room]).then(function(numPlayersToJoin){
        console.log(isPlaying);
    }).catch(function(error){
        res.send().status(500);
    });
});

app.get("/gameStart", function (req, res) {
    let room = req.query["roomCode"];
    pool.query(
        "UPDATE rooms SET isPlaying = TRUE where roomid = $1" , [room]
    ).then(function (response) {
        res.status(200);
    }).catch(function(response) {
        res.status(500).send();
    });
});

app.post("/auth", function (req, res) {
    //login
    console.log("Attempting...");
    let username = req.body.username;
    let plaintextPassword = req.body.plaintextPassword;
    pool.query("SELECT userPass FROM users WHERE username = $1", [username])
        .then(function (response) {
            if (response.rows.length === 0) {
                console.log("User not found");
                // username doesn't exist
                return res.status(401).send();
            }
            let hashedPassword = response.rows[0].userpass;
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
