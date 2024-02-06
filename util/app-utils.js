function removeAccents(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ç/g, 'c');
}

function chunkArray(array, sizes) {
  const chunkedArray = [];
  let currentIndex = 0;

  for (let size of sizes) {
    chunkedArray.push(array.slice(currentIndex, currentIndex + size));
    currentIndex += size;
  }

  return chunkedArray;
}

function mountHeaders(data) {
  data = data.text.split('\n');
  data.shift();
  data.shift();

  let headers = data[1].concat(' ').concat(data[2]).concat(' ').concat(data[3]).concat(' ').concat(data[4]).split(' ');

  const regex = /^[a-z]/;
  const formattedHeaders = headers.reduce((acumulator, header, i) => {
    header = removeAccents(header);
    const next = headers[i + 1];

    if (!next) {
      acumulator.push(header);
      return acumulator;
    }
    if (regex.test(header)) {
      return acumulator;
    }
    if (regex.test(next)) {
      header = `${header}_${next}`;
      acumulator.push(header);
      return acumulator
    }

    acumulator.push(header);
    return acumulator;
  }, []);

  const newHeaders = chunkArray(formattedHeaders, [5, 4, 5, 2]);

  return newHeaders;
}


module.exports = { mountHeaders };