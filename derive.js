const fs = require('fs');

const file = fs.readFileSync('results/predios2018.json');
const { data } = JSON.parse(file.toString());
const results = {};

parseDataFields = () => {
  data.forEach(predio => {
    predio.usedArea = parseFloat(predio.usedArea);
  });
}

aggregateBarrios = () => {
  const perBarrio = {};

  data.forEach(predio => {
    // Create barrio if does not exist
    let barrio = perBarrio[predio.barrio];
    if (!barrio) {
      perBarrio[predio.barrio] = {
        count: 0,
        destinations: {},
      }

      barrio = perBarrio[predio.barrio];
    }

    barrio.count += 1;

    // Create destination if does not exist
    let destination = barrio.destinations[predio.destination];
    if (!destination) {
      barrio.destinations[predio.destination] = {
        count: 0,
        area: 0,
      }

      destination = barrio.destinations[predio.destination];
    }

    // Aggregate values
    destination.count += 1;
    destination.area += predio.usedArea;
  });

  return perBarrio;
}

aggregateLocalities = () => {
  const perLocality = {};

  data.forEach(predio => {
    // Create locality if does not exist
    let locality = perLocality[predio.locality];
    if (!locality) {
      perLocality[predio.locality] = {
        count: 0,
        destinations: {},
      }

      locality = perLocality[predio.locality];
    }

    locality.count += 1;

    // Create destination if does not exist
    let destination = locality.destinations[predio.destination];
    if (!destination) {
      locality.destinations[predio.destination] = {
        count: 0,
        area: 0,
      }

      destination = locality.destinations[predio.destination];
    }

    // Aggregate values
    destination.count += 1;
    destination.area += predio.usedArea;
  });

  return perLocality;
}

saveAggregatedData = (aggregates) => {
  fs.writeFileSync('results/aggregatedPredios.json', JSON.stringify(aggregates, null, 2))
}

aggregteData = () => {
  const perLocality = aggregateLocalities();
  const perBarrio = aggregateBarrios();

  const aggregate = {
    perLocality,
    perBarrio,
  };

  saveAggregatedData(aggregate);
}

parseDataFields();
aggregteData();
