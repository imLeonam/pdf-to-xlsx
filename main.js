const fs = require('fs');
const pdf = require('pdf-parse-pages');
const XLSX = require('xlsx');

const { mountData, mountItems, createJson } = require('./util/pdfToJson');

let dataBuffer = fs.readFileSync('./input.pdf');

function rewriteSheet(fileName, jsonData) {
  const newFile = '_outputs/' + fileName;

  const ws = XLSX.utils.json_to_sheet(jsonData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  const outputPath = `${newFile}.xlsx`;
  XLSX.writeFile(wb, outputPath);

  console.log(`XLSX file "${outputPath}" created.`);
}

function run() {
  pdf(dataBuffer).then((data) => {
    const fileName = 'migration_sheet_segel';
    // createJson(fileName, mountData(data));
    const jsonData = fs.readFileSync(`${fileName}.json`, 'utf-8');
    console.log(JSON.parse(jsonData));
    rewriteSheet(fileName, JSON.parse(jsonData));
  });
}

run();

