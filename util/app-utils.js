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

function mountData(data) {
  const items = data.text.split('\n').splice(3, 4);
  return items;
}

function mountHeaders(data) {
  const items = data.text.split('\n').splice(3, 4);

  let headers = items[0].concat(' ')
    .concat(items[1]).concat(' ')
    .concat(items[2]).concat(' ')
    .concat(items[3]).split(' ');

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


module.exports = { mountHeaders, mountData };