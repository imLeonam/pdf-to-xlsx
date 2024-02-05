const fs = require('fs');
const pdf = require('pdf-parse-pages');

const { mountHeaders } = require('./util/app-utils');

let dataBuffer = fs.readFileSync('./input.pdf');

pdf(dataBuffer).then((data) => {
  const headers = mountHeaders(data);
  console.log(headers);
  // console.log(data.text.split('\n'));
});
