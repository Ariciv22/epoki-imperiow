const COLS = 20;
const ROWS = 14;
const HEX_SIZE = 24;
const MARGIN_X = 44;
const MARGIN_Y = 54;

const terrainColors = {
  ocean: '#2f6f9f',
  coast: '#5aa7c8',
  plains: '#8fbd68',
  forest: '#3f7f4f',
  hills: '#a58b55',
  mountain: '#8a8a86',
  desert: '#d8bc72',
  lake: '#4f9bc2',
  natural: '#c58edb'
};

const terrainLabels = {
  ocean: 'O',
  coast: 'W',
  plains: 'R',
  forest: 'L',
  hills: 'WZ',
  mountain: 'G',
  desert: 'P',
  lake: 'J',
  natural: 'CN'
};

const terrainNames = {
  ocean: 'ocean',
  coast: 'woda przybrzeżna',
  plains: 'równiny',
  forest: 'las',
  hills: 'wzgórza',
  mountain: 'góry',
  desert: 'suchy teren',
  lake: 'jezioro',
  natural: 'cud naturalny'
};

const discoveryPool = [
  'puste pole',
  'stare ruiny',
  'zagubione zasoby',
  'ślad dawnej osady',
  'mała nagroda',
  'nic ciekawego'
];

let state = {
  seed: 1000,
  terrain: new Map(),
  tokens: new Map(),
  revealed: new Map(),
  starts: [],
  units: [],
  discoveries: 0,
  showTokens: true
};

const board = document.querySelector('#board');
const selectedHex = document.querySelector('#selected-hex');
const logBox = document.querySelector('#log');
const startValue = document.querySelector('#start-value');
const discoveriesValue = document.querySelector('#discoveries-value');

function key(col, row) {
  return `${col},${row}`;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function neighbors(col, row) {
  const dirs = col % 2 === 0
    ? [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]]
    : [[0, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

  return dirs
    .map(([dc, dr]) => [col + dc, row + dr])
    .filter(([c, r]) => c >= 0 && c < COLS && r >= 0 && r < ROWS);
}

function oddqToCube(col, row) {
  const x = col;
  const z = row - Math.floor((col - (col & 1)) / 2);
  const y = -x - z;
  return [x, y, z];
}

function hexDistance(a, b) {
  const [ax, ay, az] = oddqToCube(a.col, a.row);
  const [bx, by, bz] = oddqToCube(b.col, b.row);
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by), Math.abs(az - bz));
}

function hexCenter(col, row) {
  const hexH = Math.sqrt(3) * HEX_SIZE;
  const xStep = 1.5 * HEX_SIZE;
  let x = MARGIN_X + col * xStep + HEX_SIZE;
  let y = MARGIN_Y + row * hexH + hexH / 2;
  if (col % 2 === 1) y += hexH / 2;
  return { x, y };
}

function hexPoints(cx, cy, size) {
  const points = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = Math.PI / 180 * (60 * i);
    points.push(`${(cx + size * Math.cos(angle)).toFixed(1)},${(cy + size * Math.sin(angle)).toFixed(1)}`);
  }
  return points.join(' ');
}

function createSvgElement(name, attrs = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([attr, value]) => element.setAttribute(attr, value));
  return element;
}

function generateTerrain() {
  const rng = mulberry32(state.seed);
  const terrain = new Map();
  const centerX = (COLS - 1) / 2 + (rng() * 0.8 - 0.4);
  const centerY = (ROWS - 1) / 2 + (rng() * 0.6 - 0.3);
  const radiusX = 0.96;
  const radiusY = 0.80;

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const x = (col - centerX) / (COLS / 2);
      const y = (row - centerY) / (ROWS / 2);
      const noise = 0.08 * Math.sin(col * 1.2 + state.seed) + 0.07 * Math.cos(row * 1.4 + state.seed);
      let isLand = Math.pow(x / radiusX, 2) + Math.pow(y / radiusY, 2) + noise < 1.0;

      if ((col < 2 && row < 2) || (col > COLS - 3 && row < 2)) isLand = false;
      if ((col < 2 && row > ROWS - 3) || (col > COLS - 3 && row > ROWS - 3)) isLand = false;
      if (col < 3 && row >= 4 && row <= 7) isLand = false;
      if (col > 17 && row >= 7 && row <= 10) isLand = false;

      terrain.set(key(col, row), isLand ? 'plains' : 'ocean');
    }
  }

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const k = key(col, row);
      if (terrain.get(k) !== 'ocean') continue;
      const touchesLand = neighbors(col, row).some(([nc, nr]) => terrain.get(key(nc, nr)) === 'plains');
      if (touchesLand) terrain.set(k, 'coast');
    }
  }

  placeRegion(terrain, [[7, 4], [8, 5], [9, 6], [10, 7], [11, 7]], 'mountain');
  placeRegion(terrain, [[5, 5], [5, 6], [6, 6], [6, 7], [7, 7]], 'forest');
  placeRegion(terrain, [[13, 4], [14, 4], [14, 5], [15, 5]], 'forest');
  placeRegion(terrain, [[11, 9], [12, 9]], 'lake');
  placeRegion(terrain, [[14, 9], [15, 9], [15, 10], [16, 10]], 'desert');
  placeRegion(terrain, [[9, 6], [13, 8]], 'natural');

  return terrain;
}

function placeRegion(terrain, positions, type) {
  positions.forEach(([col, row]) => {
    const k = key(col, row);
    const current = terrain.get(k);
    if (current && current !== 'ocean' && current !== 'coast') {
      terrain.set(k, type);
    }
  });
}

function chooseStart(terrain) {
  const preferred = [
    { col: 5, row: 4 },
    { col: 14, row: 4 },
    { col: 5, row: 9 },
    { col: 13, row: 10 }
  ];

  const candidates = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const type = terrain.get(key(col, row));
      if (['plains', 'forest', 'hills', 'desert'].includes(type)) candidates.push({ col, row });
    }
  }

  const target = preferred[state.seed % preferred.length];
  return candidates.sort((a, b) => hexDistance(a, target) - hexDistance(b, target))[0];
}

function generateTokens(terrain, start) {
  const tokens = new Map();
  const rng = mulberry32(state.seed + 222);

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const type = terrain.get(key(col, row));
      const pos = { col, row };
      if (!['plains', 'forest', 'hills', 'desert'].includes(type)) continue;
      if (hexDistance(pos, start) <= 2) continue;
      if ((col * 3 + row + state.seed) % 3 === 0) continue;

      const content = discoveryPool[Math.floor(rng() * discoveryPool.length)];
      tokens.set(key(col, row), { hidden: true, content });
    }
  }

  return tokens;
}

function startNewMap() {
  state.seed += 17;
  state.terrain = generateTerrain();
  const start = chooseStart(state.terrain);
  state.starts = [start];
  state.units = [
    { type: 'osadnik', label: 'O', col: start.col, row: start.row },
    { type: 'wojownik', label: 'Woj', col: start.col, row: start.row }
  ];
  state.tokens = generateTokens(state.terrain, start);
  state.revealed = new Map();
  state.discoveries = 0;

  startValue.textContent = `${start.col}, ${start.row}`;
  discoveriesValue.textContent = '0';
  selectedHex.textContent = 'Kliknij heks na mapie.';
  logBox.innerHTML = '';
  addLog(`Wygenerowano mapę. Start gracza: ${start.col}, ${start.row}.`);
  render();
}

function render() {
  const width = MARGIN_X * 2 + (COLS - 1) * 1.5 * HEX_SIZE + 2 * HEX_SIZE;
  const height = MARGIN_Y * 2 + (ROWS - 1) * Math.sqrt(3) * HEX_SIZE + Math.sqrt(3) * HEX_SIZE * 1.5;

  board.setAttribute('viewBox', `0 0 ${width} ${height}`);
  board.setAttribute('width', width);
  board.setAttribute('height', height);
  board.innerHTML = '';

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      drawHex(col, row);
    }
  }

  if (state.showTokens) drawTokens();
  drawStartMarkers();
  drawUnits();
}

function drawHex(col, row) {
  const type = state.terrain.get(key(col, row));
  const { x, y } = hexCenter(col, row);
  const polygon = createSvgElement('polygon', {
    points: hexPoints(x, y, HEX_SIZE * 0.96),
    fill: terrainColors[type],
    stroke: type === 'ocean' || type === 'coast' ? '#1f5975' : '#26323a',
    'stroke-width': '1.2',
    class: 'hex',
    'data-col': col,
    'data-row': row
  });

  polygon.addEventListener('click', () => selectHex(col, row));
  board.appendChild(polygon);

  const label = createSvgElement('text', {
    x,
    y: y + 1,
    fill: ['ocean', 'coast', 'forest', 'mountain', 'natural'].includes(type) ? '#ffffff' : '#1f2723',
    class: 'hex-label'
  });
  label.textContent = terrainLabels[type];
  board.appendChild(label);
}

function drawTokens() {
  state.tokens.forEach((token, k) => {
    const [col, row] = k.split(',').map(Number);
    const { x, y } = hexCenter(col, row);
    const isRevealed = state.revealed.has(k);

    const circle = createSvgElement('circle', {
      cx: x,
      cy: y - 11,
      r: 6,
      fill: isRevealed ? '#f2efe6' : '#d9c38b',
      stroke: '#5d4622',
      'stroke-width': 1.3,
      class: 'token'
    });
    board.appendChild(circle);

    const text = createSvgElement('text', {
      x,
      y: y - 10,
      fill: '#4b3215',
      'font-size': 9,
      class: 'token-text'
    });
    text.textContent = isRevealed ? '✓' : '?';
    board.appendChild(text);
  });
}

function drawStartMarkers() {
  state.starts.forEach((start) => {
    const { x, y } = hexCenter(start.col, start.row);
    const circle = createSvgElement('circle', {
      cx: x,
      cy: y,
      r: 13,
      fill: '#fff7c2',
      stroke: '#a57923',
      'stroke-width': 2.4,
      class: 'start-marker'
    });
    board.appendChild(circle);

    const text = createSvgElement('text', {
      x,
      y: y + 1,
      fill: '#6b4312',
      'font-size': 10,
      class: 'start-text'
    });
    text.textContent = 'S';
    board.appendChild(text);
  });
}

function drawUnits() {
  state.units.forEach((unit, index) => {
    const { x, y } = hexCenter(unit.col, unit.row);
    const offset = index === 0 ? -9 : 9;
    const circle = createSvgElement('circle', {
      cx: x + offset,
      cy: y + 15,
      r: 9,
      fill: unit.type === 'osadnik' ? '#f4e4a4' : '#d88a6a',
      stroke: '#4a2f16',
      'stroke-width': 1.5,
      class: 'unit'
    });
    board.appendChild(circle);

    const text = createSvgElement('text', {
      x: x + offset,
      y: y + 16,
      fill: '#2a2110',
      'font-size': unit.type === 'osadnik' ? 9 : 7,
      class: 'unit-text'
    });
    text.textContent = unit.label;
    board.appendChild(text);
  });
}

function selectHex(col, row) {
  const k = key(col, row);
  const type = state.terrain.get(k);
  const token = state.tokens.get(k);
  const units = state.units.filter((unit) => unit.col === col && unit.row === row);

  let html = `<strong>Heks:</strong> ${col}, ${row}<br>`;
  html += `<strong>Teren:</strong> ${terrainNames[type]}<br>`;

  if (token && !state.revealed.has(k)) {
    state.revealed.set(k, token.content);
    state.discoveries += 1;
    discoveriesValue.textContent = String(state.discoveries);
    html += `<strong>Żeton odkrycia:</strong> ${token.content}<br>`;
    addLog(`Odkryto żeton na polu ${col}, ${row}: ${token.content}.`);
    render();
  } else if (token && state.revealed.has(k)) {
    html += `<strong>Żeton odkrycia:</strong> ${state.revealed.get(k)}<br>`;
  } else {
    html += '<strong>Żeton odkrycia:</strong> brak<br>';
  }

  if (units.length > 0) {
    html += `<strong>Jednostki:</strong> ${units.map((unit) => unit.type).join(', ')}<br>`;
  }

  selectedHex.innerHTML = html;
}

function addLog(message) {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = message;
  logBox.prepend(entry);
}

document.querySelector('#new-map-button').addEventListener('click', startNewMap);
document.querySelector('#toggle-tokens-button').addEventListener('click', () => {
  state.showTokens = !state.showTokens;
  render();
});

startNewMap();
