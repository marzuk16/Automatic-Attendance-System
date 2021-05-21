let date = new Date();

let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu','Fri', 'Sat'];

let bar = days[date.getDay()];
let year = date.getFullYear();
let month = months[date.getMonth()];
let day = date.getDate();
let hours = date.getHours();
let minutes = date.getMinutes();

date = `${bar} ${day}-${month}-${year} ${hours}:${minutes}`;

let x = `আত্মতৃপ্তিতে ভোগা সংকীর্ণ জ্ঞানের পরিচয়।`;
console.log(date, x);