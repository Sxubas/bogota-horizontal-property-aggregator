const Papa = require('papaparse');
const fs = require('fs');

const p = (...args) => console.log(...args);
const config = {
  header: true,
}

const loadPH = () => {
  const file = fs.readFileSync('data/predios_pph_bogota_2.csv');
  const json = Papa.parse(file.toString(), config);
  const lastYearData = [];

  json.data.forEach(row => {
    if (row['AVALUO_ANO'] === '2018') {
      delete row['CODIGO_MANZANA'];
      delete row['AVALUO_ANO'];
      lastYearData.push(row);
    }
  });

  return lastYearData;
}

const convertDestinationCode = (data) => {
  // Load destino csv file
  const file = fs.readFileSync('data/destino.csv');
  const dataArray = Papa.parse(file.toString(), config);

  // Convert to object
  const destinations = {};
  dataArray.data.forEach(row => {
    destinations[row.codigo_destino] = row.destino_economico;
  });

  // Replace code for actual word. Delete code attr
  data.forEach(row => {
    const code = row['CODIGO_DESTINO'];
    delete row['CODIGO_DESTINO'];

    row.destination = destinations[code];
  });
}

const normalizeSectorNumber = (numberString) => {
  const sectorNumber = parseInt(numberString, 10);
  return sectorNumber.toString();
}

const convertBarrioCode = (data) => {
  // Load city info csv file
  const file = fs.readFileSync('data/city_info.csv');
  const dataArray = Papa.parse(file.toString(), config);

  // Convert to object
  const localities = {};
  const barrios = {};
  dataArray.data.forEach(row => {
    const barrio_code = normalizeSectorNumber(row.sector_code);
    barrios[barrio_code] = {
      barrio: row.sector_name,
      locality: row.locality_name,
    };
  });

  const undefs = {};

  // Replace code for actual barrio name. Delete code attr and add locality
  data.forEach(row => {
    const barrioCode = normalizeSectorNumber(row['CODIGO_BARRIO']);
    delete row['CODIGO_BARRIO'];

    if (undefs[barrioCode]) {
      return;
    }

    if (!barrios[barrioCode]) {
      undefs[barrioCode] = barrioCode;
      p('Could not find a name for this barrio/sector code: ', barrioCode);
      return;
    }

    row.barrio = barrios[barrioCode].barrio;
    row.locality = barrios[barrioCode].locality;
  });
}

const saveData = (data) => {
  fs.writeFileSync('results/predios2018.json', JSON.stringify({ data }, null, 2));
}

const filePerformanceOptimization = (data) => {
  data.forEach(row =>  {
    delete row['CODIGO_PREDIO'];
    delete row['CODIGO_RESTO'];
    delete row['CODIGO_CONSTRUCCION'];
  });
}

const otherConversions = (data) => {
  data.forEach(row => {
    const usedArea = row['AREA_USO'];
    delete row['AREA_USO'];

    row.usedArea = usedArea;
  });
}

const data = loadPH();
convertDestinationCode(data);
convertBarrioCode(data);
filePerformanceOptimization(data);
otherConversions(data);
saveData(data);
Object.keys(data[0]).forEach(key => console.log(key))