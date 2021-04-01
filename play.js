console.log(Date.now());
var s = new Date(Date.now()).toLocaleDateString("en-US")
console.log(s)

console.log(Date.parse(s));