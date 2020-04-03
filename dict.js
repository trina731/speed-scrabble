const newTrie = require("./trie");

module.exports = function(trie){
    return {
        isValidWord: function(word){
            if(trie.contains(word)){
                return true;
            }
            else{
                return false;
            }
        }
    }
}
//read from valid words file