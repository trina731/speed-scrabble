const fs = require('fs') 
const newTrie = require("./trie");

//read from valid words file
function loadDict(dict){
    validWords = fs.readFileSync("valid_words.txt").toString().split("\r"); 
    for(i = 0; i < validWords.length; i++){
        dict.insert(validWords[i].substring(1));
    }
}

function isValidWord(dict, word){
    if(dict.contains(word)){
        return true;
    }
    else{
        return false;
    }
}

module.exports = loadDict;
module.exports = isValidWord;
