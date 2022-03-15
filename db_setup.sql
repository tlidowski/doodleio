-- table for list of words
CREATE TABLE words(
    wordID SERIAL PRIMARY KEY, 
    word VARCHAR(32), 
    difficulty VARCHAR(8));

INSERT INTO words (word, difficulty) VALUES ('pizza', 'easy'), ('show', 'easy'), ('laptop', 'easy'), ('grapes', 'easy'), ('train', 'easy'), ('feather', 'easy'), ('octopus', 'easy'), ('book', 'easy'), ('stairs', 'easy'), ('butterfly', 'easy'), ('leaf', 'easy'), ('boat', 'easy'), ('Earth', 'easy'), ('shirt', 'easy'), ('ring', 'easy'), ('grass', 'easy'), ('car', 'easy'), ('fire', 'easy'), ('fish', 'easy'), ('glasses', 'easy');
INSERT INTO words (word, difficulty) VALUES ('jump', 'medium'), ('electricity', 'medium'), ('hero', 'medium'), ('stain', 'medium'), ('college', 'medium'), ('attic', 'medium'), ('inch', 'medium'), ('spill', 'medium'), ('Aunt', 'medium'), ('day', 'medium'), ('pollution', 'medium'), ('class', 'medium'), ('sneeze', 'medium'), ('prince', 'medium'), ('trip', 'medium'), ('salt', 'medium'), ('cover', 'medium'), ('dock', 'medium'), ('bacteria', 'medium'), ('sunburn', 'medium');
INSERT INTO words (word, difficulty) VALUES ('calm', 'hard'), ('judge', 'hard'), ('competition', 'hard'), ('ashamed', 'hard'), ('world', 'hard'), ('Internet', 'hard'), ('lecture', 'hard'), ('actor', 'hard'), ('fog', 'hard'), ('classroom', 'hard'), ('expert', 'hard'), ('edge', 'hard'), ('human', 'hard'), ('border', 'hard'), ('steam', 'hard'), ('violent', 'hard'), ('dawn', 'hard'), ('weather', 'hard'), ('imagine', 'hard'), ('blush', 'hard');
INSERT INTO words (word, difficulty) VALUES ('aftermath', 'expert'), ('chaos', 'expert'), ('crisp', 'expert'), ('creator', 'expert'), ('dictate', 'expert'), ('stranger', 'expert'), ('upgrade', 'expert'), ('time zone', 'expert'), ('refund', 'expert'), ('promise', 'expert'), ('group', 'expert'), ('infect', 'expert'), ('knowledge', 'expert'), ('reward', 'expert'), ('panic', 'expert'), ('representative', 'expert'), ('parody', 'expert'), ('depth', 'expert'), ('schedule', 'expert'), ('texture', 'expert'); 

-- table for rooms
CREATE TABLE rooms(
    roomID VARCHAR(64) PRIMARY KEY, 
    isAvailable BOOLEAN, 
    isPlaying BOOLEAN, 
    numPlayers INT);

INSERT INTO rooms (roomID, isAvailable, isPlaying, numPlayers, roundNum, currentTurn) VALUES ('blank', true, false, 0, 0, 0);
INSERT INTO rooms (roomID, isAvailable, isPlaying, numPlayers, roundNum, currentTurn) VALUES ('WMJH', true, false, 0, 0, 1);
INSERT INTO rooms (roomID, isAvailable, isPlaying, numPlayers, roundNum, currentTurn) VALUES ('JFRC', true, false, 0, 0, 1);
INSERT INTO rooms (roomID, isAvailable, isPlaying, numPlayers, roundNum, currentTurn) VALUES ('LVNR', true, false, 0, 0, 1);
INSERT INTO rooms (roomID, isAvailable, isPlaying, numPlayers, roundNum, currentTurn) VALUES ('OOZK', true, false, 0, 0, 1);
INSERT INTO rooms (roomID, isAvailable, isPlaying, numPlayers, roundNum, currentTurn) VALUES ('QMAJ', true, false, 0, 0, 1);

-- table for list of users
CREATE TABLE users(
    username VARCHAR(256) PRIMARY KEY,
    userPass VARCHAR(256), 
    numGames INT, 
    numWon INT, 
    highScore INT, 
    totalPoints INT, 
    roomID VARCHAR(64),
    foreign key (roomID) references rooms(roomID));