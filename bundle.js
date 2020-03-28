(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const fs = require('fs'); 
alert("2");
fs.readFile('letters.txt', (err, data) => { 
    alert("3");
    if (err) throw err; 
    alert("4");
    //This file has the number of each letter we want
    let txt = data.toString().split("\n");

    //First line has the number of letters in the alphabet
    let alphSize = Number(txt[0]);

    //Initialize from file
    for(i = 0; i < alphSize; i++){
        alph += txt[i+1].substring(0,1);
        numLetters[i] = Number(txt[i+1].substring(1));
    }    
})
alert("5"); 
},{"fs":2}],2:[function(require,module,exports){

},{}]},{},[1]);
