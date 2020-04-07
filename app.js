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
        number:"" + Math.floor(100 * Math.random()),
    }
    // left this in just to show an example of a function
    // self.updatePosition = function(){
    //     if(self.pressingRight)
    //         self.x += self.maxSpd;
    //     if(self.pressingLeft)
    //         self.x -= self.maxSpd;
    //     if(self.pressingUp)
    //         self.y -= self.maxSpd;
    //     if(self.pressingDown)
    //         self.y += self.maxSpd;
    // }
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

    socket.on('submitWord', function(data){
        //Is the dict case sensitive?
        if(methods.isValidWord(data)){
            let currLetters = Array(alphSize).fill(0);
            data = data.toUpperCase();
            for(i = 0; i < data.length; i++){
                let newLetter = data.charAt(i);
                currLetters[alph.indexOf(newLetter)] += 1;
            }
            let canMake = 1;
            for(i = 0; i < alphSize; i++){
                if(currLetters[i] > flipped[i]){
                    canMake = 0;
                    break;
                }
            }
            if(canMake){
                for(i = 0; i < alphSize; i++){
                    flipped[i] = flipped[i] - currLetters[i];
                    for(j = 0; j < currLetters[i]; j++){
                        let index = 0;
                        for(k = index; index < allTiles.length; index++){
                            if(allTiles[index] === alph.charAt(i)){
                                allTiles[index] = '_';
                                break;
                            }
                        }
                    }
                }  
                PLAYER_LIST[socket.id].words.push(data);
                PLAYER_LIST[socket.id].score += data.length;
                SOCKET_LIST[s].emit('updateFlip', allTiles);
            }

            var pack = [];
            for(var  i in PLAYER_LIST){
                var player = PLAYER_LIST[i];
                pack.push({
                    number:player.number,
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
        //TODO:
        //Check if playable
        //Update display and pts if necessary
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
            allUnflippedTiles = allUnflippedTiles.substring(0,randIndex) + allUnflippedTiles.substring(randIndex);
    
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