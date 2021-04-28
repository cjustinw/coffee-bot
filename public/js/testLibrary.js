const XRegExp = require('xregexp');

const date = XRegExp.build(' [\\s] ({{day}}) [-|/|\\s] ({{month}}) [-|/|\\s] ({{year}})', {
    day : /(0[1-9]|[12][0-9]|3[01])/,
    month : /(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)|(0[1-9]|1[012])/i,
    year : /\d{4}/
}, 'x');
  
var str = '28 januari 2021 ';
str = XRegExp.replace(str, date, '$<day>/$<month>/$<year>');

console.log(str);

