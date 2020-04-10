var DEBUG = 1;

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var newTrie = require("./trie");

//const dictMethods = require("./dict");

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use(express.static(__dirname + '/client'));
// app.use('/client', express.static(__dirname + 'client'));

//port is 2000
//default domain is localhost
serv.listen(2000);
console.log("Server started");
  
var SOCKET_LIST = {};
var PLAYER_LIST = {};
 
var Player = function(id){
    var self = {
        words:[],
        score:0,
        id:id,
        name:"",
    }
    return self;
}

//load dictionary
const fs = require('fs') 
var dict = newTrie.trie;
validWords = fs.readFileSync("valid_words.txt").toString().split("\r"); 
for(i = 0; i < validWords.length; i++){
    dict.insert(validWords[i].substring(1));
}
//console.log(dict);
var methods = require('./dict')(dict);

//leaving this in - example of checking valid word
/*console.log(methods.isValidWord("cat"));*/

var io = require("socket.io")(serv,{});


//TILES
var alph = "";
var allUnflippedTiles = "";
var numBag = 0;

var flipped = [];
var allTiles = [];

let txt = fs.readFileSync('letters.txt').toString().split("\n");;

//First line has the number of letters in the alphabet
let alphSize = Number(txt[0]);

//Initialize from file
for(i = 0; i < alphSize; i++){
    alph += txt[i+1].substring(0,1);
    let amount = Number(txt[i+1].substring(1));
    numBag += amount;
    for(j = 0; j < amount; j++){
        allUnflippedTiles += alph.substring(i);
    }
}   
flipped = Array(alphSize).fill(0);
allTiles = Array(numBag).fill("_"); 

function removeFromPool(letters){
    for(i = 0; i < alphSize; i++){
        flipped[i] = flipped[i] - letters[i];
        for(j = 0; j < letters[i]; j++){
            let index = 0;
            let letter = alph.charAt(i);
            for(k = index; index < allTiles.length; index++){
                if(allTiles[index] === letter){
                    allTiles[index] = ' ';
                    break;
                }
            }
        }
    }  
}

function countLetters(word){
    let toReturn = Array(alphSize).fill(0);
    word = word.toUpperCase();
    for(i = 0; i < word.length; i++){
        let newLetter = word.charAt(i);
        toReturn[alph.indexOf(newLetter)] += 1;
    }
    return toReturn;
}

io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
 
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;

    socket.emit('tileInfo', allTiles);
   
    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });

    socket.on('disconnect', function(){
        delete SOCKET_LIST[socket.id];
    });
    console.log("socket connection");

    socket.on('submitUsername', function(name){
        PLAYER_LIST[socket.id].name = name;
        let pack = [];
            for(i in PLAYER_LIST){
                let player = PLAYER_LIST[i];
                pack.push({
                    name:player.name,
                    score:player.score,
                    words:player.words
                });
            }
        socket.emit('updateWordDisplay', pack);
    })

    socket.on('submitWord', function(data){
        //If this word is in the dictionary
        if(methods.isValidWord(data.toLowerCase())){
            data = data.toUpperCase();
            //Count all the letters needed to make the word
            let currLetters = countLetters(data);
            
            //Check if letters in pool are enough
            let canMake = 1;
            for(i = 0; i < alphSize; i++){
                if(currLetters[i] > flipped[i]){
                    canMake = 0;
                    break;
                }
            }
            //If all letters are in pool, take em out
            if(canMake){
                removeFromPool(currLetters);
                PLAYER_LIST[socket.id].words.push(data);
                PLAYER_LIST[socket.id].score += data.length;
                for(s in SOCKET_LIST){
                    SOCKET_LIST[s].emit('updateFlip', allTiles);
                }
            }
            //Steal
            else{
                let toStealFrom = -1;
                let wordToSteal = "";
                let stealLetterCount = [];
                //TODO: Random ordering for fairness
                for(i in PLAYER_LIST){
                    let player = PLAYER_LIST[i];
                    for(w in player.words){
                        //Count letters in word that's gonna be stolen
                        word = player.words[w]
                        let requiredToSteal = countLetters(word);
                        let canSteal = 1;
                        for(i = 0; i < alphSize; i++){
                            //Must use all letter from word you are going to steal
                            //Must be enough letters overall for the word to exist
                            if(currLetters[i] != 0 &&
                                    currLetters[i] > flipped[i] + requiredToSteal[i] || 
                                    currLetters[i] < requiredToSteal[i]){
                                canSteal = 0;
                                break;
                            }
                        }
                        if(canSteal){
                            toStealFrom = player;
                            wordToSteal = word;
                            //copy the array
                            stealLetterCount = requiredToSteal.slice();
                            break;
                        }
                    }
                }
                if(toStealFrom != -1){
                    let stolenWord = toStealFrom.words.splice(wordToSteal)[0];

                    //TODO - there must be some kinda array subtract method
                    //It should be faster than looping over everything
                    for(i = 0; i < alphSize; i++)
                        currLetters[i] -= stealLetterCount[i];

                    removeFromPool(currLetters);

                    PLAYER_LIST[socket.id].words.push(data);
                    PLAYER_LIST[socket.id].score += data.length;
                    toStealFrom.score -= stolenWord.length;
                    for(s in SOCKET_LIST){
                        SOCKET_LIST[s].emit('updateFlip', allTiles);
                    }
                }
            }

            //update scoreboard
            let pack = [];
            for(i in PLAYER_LIST){
                let player = PLAYER_LIST[i];
                pack.push({
                    name:player.name,
                    score:player.score,
                    words:player.words
                });
            }
            for(s in SOCKET_LIST){
                SOCKET_LIST[s].emit("updateWordDisplay", pack);
            }
        }
        else{
            //TODO (What to do if not a word)
        }
    });
    
    //For debugging app.js from browser
    socket.on('evalServer', function(data){
        //Running eval(data) is dangerous, so don't let real users do it
        if(!DEBUG)
            return;
        var res = eval(data);
        socket.emit('evalAnswer', res);
    })

    //Called when client clicks flip
    //Emits array of tiles in pool
    socket.on('requestFlip', function(){
        if(allUnflippedTiles !== ""){
            //Find unflipped tile
            let toFlip = 0;
            while(allTiles[toFlip] !== '_'){
                toFlip++;
            }
    
            //Choose random letter from bag
            let randIndex = Math.random() * allUnflippedTiles.length;
            let newLetter = allUnflippedTiles.substring(randIndex, randIndex + 1);
    
            //Remove letter from bag
            allUnflippedTiles = allUnflippedTiles.substring(0,randIndex) + allUnflippedTiles.substring(randIndex + 1);
    
            //Flip tile and update counts
            allTiles[toFlip] = newLetter;
            flipped[alph.indexOf(newLetter)] = flipped[alph.indexOf(newLetter)] + 1;
    
            //Render changes
            for(s in SOCKET_LIST)
                SOCKET_LIST[s].emit('updateFlip', allTiles);
        }
    });
});

//We can repurpose this to handle tile-flipping
setInterval(function(){
    var pack = [];
    for(var  i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.x++;
        socket.y++;
        pack.push({
            x:socket.x,
            y:socket.y
        });
    }
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions', pack);
    }
}, 1000/25);