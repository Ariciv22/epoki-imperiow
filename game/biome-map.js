function biomeByLatitude(row, rngValue) {
  const latitude = row / (ROWS - 1);

  if (latitude < 0.12 || latitude > 0.88) return 'tundra';
  if (latitude < 0.25 || latitude > 0.75) return rngValue < 0.60 ? 'forest' : 'tundra';
  if (latitude < 0.38 || latitude > 0.62) return rngValue < 0.45 ? 'forest' : 'plains';
  if (latitude < 0.46 || latitude > 0.54) return rngValue < 0.20 ? 'hills' : 'plains';
  return rngValue < 0.70 ? 'desert' : 'hills';
}

function createCivStyleContinentMask(col, row, seed) {
  const centerX = (COLS - 1) / 2;
  const centerY = (ROWS - 1) / 2;
  const x = (col - centerX) / (COLS / 2);
  const y = (row - centerY) / (ROWS / 2);

  const waveA = 0.13 * Math.sin(row * 0.9 + seed * 0.05);
  const waveB = 0.09 * Math.cos(col * 1.1 + seed * 0.03);
  const westBite = col < 4 && row > 2 && row < 9 ? 0.35 : 0;
  const eastBay = col > 16 && row > 6 && row < 11 ? 0.28 : 0;

  return Math.pow((x + waveA) / 0.86, 2) + Math.pow((y + waveB) / 0.92, 2) + westBite + eastBay < 1.0;
}

function generateTerrain() {
  const rng = mulberry32(state.seed + 701);
  const terrain = new Map();

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const k = key(col, row);
      const isLand = createCivStyleContinentMask(col, row, state.seed);
      terrain.set(k, isLand ? biomeByLatitude(row, rng()) : 'ocean');
    }
  }

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const k = key(col, row);
      if (terrain.get(k) !== 'ocean') continue;

      const touchesLand = neighbors(col, row).some(([nc, nr]) => {
        const type = terrain.get(key(nc, nr));
        return type && type !== 'ocean' && type !== 'coast';
      });

      if (touchesLand) terrain.set(k, 'coast');
    }
  }

  addMountainChain(terrain, [
    [9, 2], [10, 2], [10, 3],
    [8, 5], [9, 6], [10, 7],
    [7, 10], [8, 10]
  ]);

  addTerrainRegion(terrain, 'hills', [[8, 7], [9, 7], [10, 8], [12, 8], [13, 9]]);
  addTerrainRegion(terrain, 'forest', [[4, 5], [5, 5], [5, 6], [14, 4], [15, 4], [15, 5]]);
  addTerrainRegion(terrain, 'lake', [[10, 6], [11, 6]]);
  addTerrainRegion(terrain, 'natural', [[12, 7]]);

  return terrain;
}

function addTerrainRegion(terrain, type, cells) {
  cells.forEach(([col, row]) => {
    const k = key(col, row);
    const current = terrain.get(k);
    if (current && current !== 'ocean' && current !== 'coast') terrain.set(k, type);
  });
}

function addMountainChain(terrain, cells) {
  addTerrainRegion(terrain, 'mountain', cells);
}

startNewMap();
