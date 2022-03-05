const users = []; // {name: "steve", room: "3456", id: 325}

const rooms = []; // {room:3456, game_occ: true/false, #ofplayers: int}

let newestRoom = 0;

// The above lists will be database tables in the final version.
// Lists are used for now but V2 of this file will query each of these
// database tables.

function createRoom(roomNum, numPlayers) {
    const room = {
        roomNum: newestRoom,
        game_occ: false,
        numPlayers: numPlayers,
    };

    rooms.push(room);

    console.log("room " + newestRoom + " created");

    newestRoom++;
}

function startRoom(roomNum) {
    for (let room of rooms) {
        if (room.roomNum === roomNum) {
            room.game_occ = true;
        }
    }
}

function joinRoom(id, username, roomNum) {
    const user = { id, username, roomNum };

    for (let room of rooms) {
        if (room.roomNum === roomNum) {
            if (room.game_occ) {
                users.push(user);
            } else {
                console.log("game already started");
            }
        }
    }
}

function leaveRoom(id) {}

module.exports = {
    createRoom,
    startRoom,
    joinRoom,
    leaveRoom,
};
