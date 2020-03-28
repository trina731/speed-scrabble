let btn = document.getElementById('flipBtn');

//Runs the following code when the button is pressed
btn.onclick = function(){

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
        unflipped[alph.indexOf(newLetter)] = unflipped[alph.indexOf(newLetter)] - 1;



        //Render changes
        let yVal = Math.floor(toFlip / xSize);
        let xVal = toFlip % xSize; 
        let table = document.getElementById('pool');

        //Select cell and change source image to new letter
        let toEdit = table.rows[yVal].cells[xVal].childNodes[0];
        toEdit.src = "./img/" + newLetter + ".jpg";
    }
}



