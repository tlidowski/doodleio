const pg = require("pg");
const bcrypt = require("bcrypt");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";


///Leftover from Bamazon; maybe remove soon
const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
    //console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json());


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
    let username = req.body.username;
    let plaintextPassword = req.body.plaintextPassword;
    pool.query("SELECT hashed_password FROM users WHERE username = $1", [
        username,
    ])
        .then(function (response) {
            if (response.rows.length === 0) {
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




app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});

