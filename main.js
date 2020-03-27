const newTrie = require("./dict");
var dict = newTrie();
// insert few values
dict.insert("hello");
dict.insert("helium");

// check contains method
console.log(dict.contains("helium"));  // true
console.log(dict.contains("kickass")); // false

// check find method
console.log(dict.find("hel"));  // [ 'helium', 'hello' ]
console.log(dict.find("hell")); // [ 'hello' ]
console.log(dict.contains("hello"));
console.log("Hello Word");