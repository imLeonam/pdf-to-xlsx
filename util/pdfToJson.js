const fs = require('fs');

function removeAccents(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ç/g, 'c');
}

function renameArrayElement(array, element, newName) {
  const indexToRename = array.indexOf(element);
  if (indexToRename === -1) return
  if (indexToRename >= 0 && indexToRename < array.length) {
    array[indexToRename] = newName; // assign a new value to the element at the specified index
  } else {
    console.log("Index is out of bounds");
  }
}

function removeArrayIndexOf(array, key) {
  const index = array.indexOf(key);
  if (index !== -1) {
    array.splice(index, 1);
    return
  }
  array.splice(index, 1);
}

function removeArrayIndex(array, index) {
  array.splice(index, 1);
}

function removeMultipleArrayIndex(array, keys) {
  keys.forEach((key) => {
    if (key) {
      removeArrayIndexOf(array, key);
    }
  });
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

function transformArray(sourceArray) {
  sourceArray = sourceArray.filter(item => item !== '').filter(item => item !== '6x8');
  const resultArray = [];
  for (let i = 0; i < sourceArray.length; i += 3) {
    resultArray.push(sourceArray.slice(i, i + 3));
  }
  return resultArray;
}

function mountItems(data) {
  const splitedItems = data.text.split('\n');
  const items = splitedItems.splice(7, splitedItems.length - 3);
  const arrayItems = transformArray(items);
  const lastIndex = arrayItems.length;
  removeMultipleArrayIndex(arrayItems, [lastIndex - 1, lastIndex - 2, lastIndex - 3]);

  const firstRowPattern = /(^[0-9]+)\s+(\-?\S+\s+\|\s+(\b[A-Z]{2,}\b))\s+(\S+)/;
  const moneyPattern = /R\$ \-?[\d,.]+\d+?/g;

  const mapped = arrayItems.map((item) => {
    return item.map((row) => {
      if (row === '') {
        return;
      }
      if (firstRowPattern.test(row)) {
        const splitedFirstRow = row.match(firstRowPattern).slice(1);
        removeArrayIndex(splitedFirstRow, 1)
        return splitedFirstRow;
      }
      if (row.includes('R$')) {
        const splitedMoney = row.match(moneyPattern);
        splitedMoney.forEach((money, i) => {
          if (/\b\d+\.\d{2}\b/) {
            const newMoney = money.replace('.', ',').replace(/R\$ ?/, '');
            renameArrayElement(splitedMoney, money, newMoney);
          }
        });
        return splitedMoney;
      }
      return [row];
    });
  });
  createJson('mapped', mapped);

  return mapped;
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
    const next = headers[i + 1] ? removeAccents(headers[i + 1]) : headers[i + 1];

    if (!next) {
      acumulator.push(header);
      return acumulator;
    }
    if (regex.test(header)) {
      return acumulator;
    }
    if (regex.test(next)) {
      header = `${header.toLowerCase()}_${next}`;
      acumulator.push(header);
      return acumulator
    }

    acumulator.push(header.toLowerCase());
    return acumulator;
  }, []);

  const newHeaders = chunkArray(formattedHeaders, [5, 4, 5, 2]);

  return newHeaders;
}

function createJson(name, data) {
  const jsonData = JSON.stringify(data, null, 2);
  fs.writeFile(`${name}.json`, jsonData, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log('Data has been written to file successfully!');
    }
  });
}

function mountData(data) {
  const headers = mountHeaders(data);
  const items = mountItems(data);

  removeMultipleArrayIndex(headers[0], ['classificacao', 'codigo_interno']);
  renameArrayElement(headers[0], 'estoque_atual', 'unidade');
  removeMultipleArrayIndex(headers[1], ['data_cadastro', 'ncm', 'cest']);
  removeArrayIndex(headers, 3);

  return items.map((item) => {
    const obj = {};
    headers[0].forEach((key, i) => {
      const element = item[0][i];
      if (/^[0-9]+$/.test(element)) {
        obj['codigo'] = element || '';
      }
      else if (/\b[A-Z]{2,}\b/g.test(element)) {
        obj['unidade'] = element || '';
      }
    });
    headers[1].forEach((key, i) => {
      const element = item[1][i];
      if (/[^\.\?!\d+]+([\.\?!]\d.+)?/g.test(element)) {
        obj['produto'] = element || '';
      }
    });
    headers[2].forEach((key, i) => {
      const element = item[2][i];
      if (!element) return;
      obj[key] = element || '';
      // console.log(i, element);
    });
    return obj;
  });
};


module.exports = { mountData, mountItems, createJson };