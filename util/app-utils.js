function removeAccents(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ç/g, 'c');
}

function mountHeaders(data) {
  data = data.text.split('\n');
  data.shift();
  data.shift();

  const headers = data[1].concat(' ').concat(data[2]).concat(' ').concat(data[3]).concat(' ').concat(data[4]).split(' ');

  const regex = /^[a-z]/;
  return headers.reduce((acumulator, header, i) => {
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
}


module.exports = { mountHeaders };