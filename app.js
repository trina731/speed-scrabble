var DEBUG = 1;

var express = require('express');
var app = express();
var serv = require('http').Server(app);
var newTrie = require("./trie");
//const dictMethods = require("./dict");

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + 'client'));

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
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
 
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;
   
    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });

    socket.on('disconnect', function(){
        delete SOCKET_LIST[socket.id];
    });
    console.log("socket connection");

    socket.on('submitWord', function(data){
        //These two lines will have to be changed
        if(methods.isValidWord(data)){
            PLAYER_LIST[socket.id].words.push(data);
            PLAYER_LIST[socket.id].score += data.length;
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

    socket.on('evalServer', function(data){
        //Running eval(data) is dangerous, so don't let real users do it
        if(!DEBUG)
            return;
        var res = eval(data);
        socket.emit('evalAnswer', res);
    })
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