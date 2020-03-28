//Read from file which has number of each letter
$.get( "letters.txt", function( data ) {
    let txt = data.toString().split("\n");

    //First line has the number of letters in the alphabet
    let alphSize = Number(txt[0]);

    //Initialize from file
    for(i = 0; i < alphSize; i++){
        alph += txt[i+1].substring(0,1);
        unflipped[i] = Number(txt[i+1].substring(1));
        numBag += unflipped[i];
        for(j = 0; j < unflipped[i]; j++){
            allUnflippedTiles += alph.substring(i);
        }
    }   
    flipped = Array(alphSize).fill(0);
    allTiles = Array(numBag).fill("_"); 
});

