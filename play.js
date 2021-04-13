let today = new Date();
let date = today.getFullYear().toString() + '-';
if(today.getMonth()+1 < 10) date += '0';
date += today.getMonth()+1 + '-';

if(today.getDate() < 10) date += '0';
date += today.getDate().toString();

console.log(date);

console.log(today.getDate() , " ", today.getMonth()+1, " ", today.getFullYear());