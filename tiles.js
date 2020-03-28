alert("starting tiles.js");
$.get( "letters.txt", function( data ) {
    alert("inside tiles.js");
    //This file has the number of each letter we want
    let txt = data.toString().split("\n");

    //First line has the number of letters in the alphabet
    let alphSize = Number(txt[0]);

    //Initialize from file
    for(i = 0; i < alphSize; i++){
        alph += txt[i+1].substring(0,1);
        numLetters[i] = Number(txt[i+1].substring(1));
        numTiles += numLetters[i];
    }    
});
alert("end of tiles.js");