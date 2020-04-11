(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var c = document.getElementById("ctx");
ctx = c.getContext("2d");
ctx.font = '30px Arial';

var wordForm = document.getElementById('word-form');
var wordInput = document.getElementById('word-input');
var signInForm = document.getElementById('player-form');
var username = document.getElementById('player-input');
var playerInfo = document.getElementById('playerInfo');
let btn = document.getElementById('flipBtn');

var Player = function(id){
    var self = {
        words:[],
        score:0,
        id:id,
        number:"" + Math.floor(100 * Math.random()),
    }
    return self;
}

//Hm... I'm not a fan of hardcoding 2000. What if that port is busy for some reason?
//I guess for now it's ok because it makes it easy to use in the browser, but I think
//We should look into alternatives
var socket = io.connect('http://61776c4b.ngrok.io');

btn.onclick = function(){
    console.log("Requested flip inside index.html");
    socket.emit("requestFlip");
}

//For setting up the table when client connects
socket.on("tileInfo", function(data){
    let table = document.getElementById("pool");
    table.innerHTML = "";

    let numBag = data.length;
    let xSize = 12;
    let ySize = Math.ceil(numBag / xSize);

    let count = 0;
    for(i = 0; i < ySize; i++){
            let row = table.insertRow();
            for(j = 0; j < xSize; j++){
                //Check if there are already enough tiles
                if(count < numBag){
                    let cell = row.insertCell();
                    let elem = document.createElement("img");
                    
                    //Set id of tile to the index of that
                    //tile in the pool array
                    elem.setAttribute("id", "tile_" + count);
                    let l = data[count];
                    elem.src = "/img/" + l + ".jpg";
                    cell.appendChild(elem);
                    count++;
                }
                else
                    break;
            }
        }
});

//Updates tiles when any player flip a tile
socket.on("updateFlip", function(data){
        //Render changes
        let table = document.getElementById("pool");
        let numBag = data.length;

        for(i = 0; i < numBag; i++){
            let t = document.getElementById("tile_" + i);
            console.log(data[i]);
            t.src = '/img/' + data[i] + '.jpg';
        }
        console.log("data" + data);
});

//For displaying the players, their words, and scores
socket.on('updateWordDisplay', function(data){
    playerInfo.innerHTML = '';
    for(i in data){
        playerInfo.innerHTML += "<p>" + data[i].name + "'s score: " +
        data[i].score + "<br/>" + " Words: " + data[i].words.join(', ') + "</p>";
    }
});

//For debugging
socket.on('evalAnswer', function(data){
    console.log(data);
})

function userNameSubmit(e){
    //Prevent automatic page refresh
    e.preventDefault();
    socket.emit('submitUsername', username.value);
}
//Send word to server
wordForm.onsubmit = function(e){
    //Prevent automatic page refresh
    e.preventDefault();
    //For debugging purposes: 
    //If you want to see the value of a variable, type in textbox
    //starting with a slash
    //You can also type functions
    if(wordInput.value[0] === '/'){
        socket.emit('evalServer', wordInput.value.slice(1));
    }
    else{
        socket.emit('submitWord', wordInput.value);
    }
    wordInput.value = '';
}
},{}]},{},[1]);
