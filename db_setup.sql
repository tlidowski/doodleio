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
    roomID VARCHAR(16) PRIMARY KEY, 
    isAvailable BOOLEAN, 
    isPlaying BOOLEAN, 
    numPlayers INT,
    roundNum INT, 
    currentTurn INT);

-- table for list of users
CREATE TABLE users(
    username VARCHAR(32) PRIMARY KEY,
    user_pass VARCHAR(32), 
    numGames INT, 
    numWon INT, 
    highScore INT, 
    totalPoints INT, 
    roomID VARCHAR(16),
    foreign key (roomID) references rooms(roomID));