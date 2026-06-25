const COLS = 20;
const ROWS = 14;
const HEX_SIZE = 24;
const MARGIN_X = 44;
const MARGIN_Y = 54;

const terrainImages = {
  ocean: '../grafiki/wybrzeze.png',
  coast: '../grafiki/wybrzeze.png',
  plains: '../grafiki/rowniny.png',
  forest: '../grafiki/las.png',
  hills: '../grafiki/wzgorza.png',
  mountain: '../grafiki/gory.png',
  desert: '../grafiki/pustynia.png',
  lake: '../grafiki/obszar_zalewowy.png',
  tundra: '../grafiki/tundra.png',
  natural: '../grafiki/gory.png'
};

const fallbackColors = {
  ocean: '#2f6f9f',
  coast: '#5aa7c8',
  plains: '#8fbd68',
  forest: '#3f7f4f',
  hills: '#a58b55',
  mountain: '#8a8a86',
  desert: '#d8bc72',
  lake: '#4f9bc2',
  tundra: '#9cb8a7',
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
  lake: 'Z',
  tundra: 'T',
  natural: 'CN'
};

const terrainNames = {
  ocean: 'ocean / wybrzeże',
  coast: 'wybrzeże',
  plains: 'równiny',
  forest: 'las',
  hills: 'wzgórza',
  mountain: 'góry',
  desert: 'pustynia',
  lake: 'obszar zalewowy',
  tundra: 'tundra',
  natural: 'cud naturalny'
};

const passableTerrain = ['plains', 'forest', 'hills', 'desert', 'tundra', 'natural'];

const unitTemplates = {
  settler: {
    name: 'Osadnik',
    label: 'O',
    maxHp: 10,
    attack: 0,
    defense: 1,
    maxMove: 2,
    description: 'Zakłada miasta. Na razie nie walczy.'
  },
  warrior: {
    name: 'Wojownik',
    label: 'Woj',
    maxHp: 20,
    attack: 4,
    defense: 3,
    maxMove: 2,
    description: 'Podstawowa jednostka wojskowa do ochrony i eksploracji.'
  }
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
  round: 1,
  terrain: new Map(),
  tokens: new Map(),
  revealed: new Map(),
  starts: [],
  units: [],
  selectedUnitId: null,
  discoveries: 0,
  showTokens: true,
  showTerrainLabels: false
};

const board = document.querySelector('#board');
const selectedHex = document.querySelector('#selected-hex');
const selectedUnitBox = document.querySelector('#selected-unit');
const logBox = document.querySelector('#log');
const startValue = document.querySelector('#start-value');
const discoveriesValue = document.querySelector('#discoveries-value');
const roundValue = document.querySelector('#round-value');

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

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const x = (col - centerX) / (COLS / 2);
      const y = (row - centerY) / (ROWS / 2);
      const noise = 0.08 * Math.sin(col * 1.2 + state.seed) + 0.07 * Math.cos(row * 1.4 + state.seed);
      let isLand = Math.pow(x / 0.96, 2) + Math.pow(y / 0.80, 2) + noise < 1.0;

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
  placeRegion(terrain, [[6, 10], [7, 10], [8, 10], [16, 6]], 'tundra');
  placeRegion(terrain, [[9, 6], [13, 8]], 'natural');

  return terrain;
}

function placeRegion(terrain, positions, type) {
  positions.forEach(([col, row]) => {
    const k = key(col, row);
    const current = terrain.get(k);
    if (current && current !== 'ocean' && current !== 'coast') terrain.set(k, type);
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
      if (passableTerrain.includes(type)) candidates.push({ col, row });
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
      if (!passableTerrain.includes(type) || type === 'natural') continue;
      if (hexDistance(pos, start) <= 2) continue;
      if ((col * 3 + row + state.seed) % 3 === 0) continue;

      const content = discoveryPool[Math.floor(rng() * discoveryPool.length)];
      tokens.set(key(col, row), { hidden: true, content });
    }
  }

  return tokens;
}

function createUnit(id, templateKey, col, row) {
  const template = unitTemplates[templateKey];
  return {
    id,
    type: templateKey,
    name: template.name,
    label: template.label,
    col,
    row,
    hp: template.maxHp,
    maxHp: template.maxHp,
    attack: template.attack,
    defense: template.defense,
    maxMove: template.maxMove,
    moveLeft: template.maxMove,
    description: template.description
  };
}

function startNewMap() {
  state.seed += 17;
  state.round = 1;
  state.terrain = generateTerrain();
  const start = chooseStart(state.terrain);
  state.starts = [start];
  state.units = [
    createUnit('unit-settler-1', 'settler', start.col, start.row),
    createUnit('unit-warrior-1', 'warrior', start.col, start.row)
  ];
  state.selectedUnitId = null;
  state.tokens = generateTokens(state.terrain, start);
  state.revealed = new Map();
  state.discoveries = 0;

  roundValue.textContent = String(state.round);
  startValue.textContent = `${start.col}, ${start.row}`;
  discoveriesValue.textContent = '0';
  selectedHex.textContent = 'Kliknij heks na mapie.';
  selectedUnitBox.textContent = 'Kliknij osadnika albo wojownika.';
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
  board.appendChild(createSvgElement('defs'));

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) drawHex(col, row);
  }

  drawMoveTargets();
  if (state.showTokens) drawTokens();
  drawStartMarkers();
  drawUnits();
  renderSelectedUnitPanel();
}

function drawHex(col, row) {
  const type = state.terrain.get(key(col, row));
  const { x, y } = hexCenter(col, row);
  const points = hexPoints(x, y, HEX_SIZE * 0.96);
  const clipId = `hex-clip-${col}-${row}`;
  const defs = board.querySelector('defs');

  const clipPath = createSvgElement('clipPath', { id: clipId });
  clipPath.appendChild(createSvgElement('polygon', { points }));
  defs.appendChild(clipPath);

  const base = createSvgElement('polygon', {
    points,
    fill: fallbackColors[type] || '#888',
    class: 'hex-base',
    'data-col': col,
    'data-row': row
  });
  base.addEventListener('click', () => handleHexClick(col, row));
  board.appendChild(base);

  const img = createSvgElement('image', {
    x: (x - HEX_SIZE).toFixed(1),
    y: (y - (Math.sqrt(3) / 2) * HEX_SIZE).toFixed(1),
    width: (HEX_SIZE * 2).toFixed(1),
    height: (Math.sqrt(3) * HEX_SIZE).toFixed(1),
    href: terrainImages[type],
    'clip-path': `url(#${clipId})`,
    preserveAspectRatio: 'xMidYMid slice',
    style: 'pointer-events: none;'
  });
  img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', terrainImages[type]);
  board.appendChild(img);

  const border = createSvgElement('polygon', {
    points,
    fill: 'transparent',
    stroke: type === 'ocean' || type === 'coast' ? '#1f5975' : '#26323a',
    'stroke-width': '1.2',
    class: 'hex-border',
    'data-col': col,
    'data-row': row
  });
  border.addEventListener('click', () => handleHexClick(col, row));
  board.appendChild(border);

  if (state.showTerrainLabels) {
    const label = createSvgElement('text', {
      x,
      y: y + 1,
      fill: ['ocean', 'coast', 'forest', 'mountain', 'natural'].includes(type) ? '#ffffff' : '#1f2723',
      class: 'hex-label'
    });
    label.textContent = terrainLabels[type];
    board.appendChild(label);
  }
}

function drawMoveTargets() {
  const selected = getSelectedUnit();
  if (!selected || selected.moveLeft <= 0) return;

  getMoveTargets(selected).forEach(({ col, row }) => {
    const { x, y } = hexCenter(col, row);
    const polygon = createSvgElement('polygon', {
      points: hexPoints(x, y, HEX_SIZE * 0.78),
      fill: '#fff2c7',
      stroke: '#5f491d',
      'stroke-width': 1.5,
      class: 'move-target'
    });
    polygon.addEventListener('click', (event) => {
      event.stopPropagation();
      moveSelectedUnit(col, row);
    });
    board.appendChild(polygon);
  });
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
  const groups = new Map();
  state.units.forEach((unit) => {
    const k = key(unit.col, unit.row);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(unit);
  });

  groups.forEach((unitsOnHex) => {
    unitsOnHex.forEach((unit, index) => {
      const { x, y } = hexCenter(unit.col, unit.row);
      const offset = unitsOnHex.length === 1 ? 0 : index === 0 ? -10 : 10;
      const cx = x + offset;
      const cy = y + 15;
      const isSelected = unit.id === state.selectedUnitId;

      if (isSelected) {
        board.appendChild(createSvgElement('circle', { cx, cy, r: 12.5, class: 'selected-unit-ring' }));
      }

      const circle = createSvgElement('circle', {
        cx,
        cy,
        r: 9,
        fill: unit.type === 'settler' ? '#f4e4a4' : '#d88a6a',
        stroke: '#4a2f16',
        'stroke-width': 1.5,
        class: 'unit'
      });
      circle.addEventListener('click', (event) => {
        event.stopPropagation();
        selectUnit(unit.id);
      });
      board.appendChild(circle);

      const text = createSvgElement('text', {
        x: cx,
        y: cy + 1,
        fill: '#2a2110',
        'font-size': unit.type === 'settler' ? 9 : 7,
        class: 'unit-text'
      });
      text.textContent = unit.label;
      board.appendChild(text);
    });
  });
}

function handleHexClick(col, row) {
  const selected = getSelectedUnit();
  if (selected && canMoveTo(selected, col, row)) {
    moveSelectedUnit(col, row);
    return;
  }
  selectHex(col, row);
}

function selectUnit(unitId) {
  state.selectedUnitId = unitId;
  const unit = getSelectedUnit();
  if (unit) {
    addLog(`Wybrano jednostkę: ${unit.name}.`);
    selectHex(unit.col, unit.row, false);
  }
  render();
}

function getSelectedUnit() {
  return state.units.find((unit) => unit.id === state.selectedUnitId) || null;
}

function getUnitsAt(col, row) {
  return state.units.filter((unit) => unit.col === col && unit.row === row);
}

function getMoveTargets(unit) {
  return neighbors(unit.col, unit.row)
    .map(([col, row]) => ({ col, row }))
    .filter((pos) => canMoveTo(unit, pos.col, pos.row));
}

function canMoveTo(unit, col, row) {
  if (unit.moveLeft <= 0) return false;
  if (hexDistance({ col: unit.col, row: unit.row }, { col, row }) !== 1) return false;
  const terrain = state.terrain.get(key(col, row));
  if (!passableTerrain.includes(terrain)) return false;
  const otherUnits = getUnitsAt(col, row).filter((other) => other.id !== unit.id);
  return otherUnits.length === 0;
}

function moveSelectedUnit(col, row) {
  const unit = getSelectedUnit();
  if (!unit || !canMoveTo(unit, col, row)) return;

  const from = `${unit.col}, ${unit.row}`;
  unit.col = col;
  unit.row = row;
  unit.moveLeft -= 1;

  addLog(`${unit.name} rusza się z ${from} na ${col}, ${row}. Pozostały ruch: ${unit.moveLeft}.`);
  revealTokenIfPresent(col, row, unit);
  selectHex(col, row, false);
  render();
}

function revealTokenIfPresent(col, row, unit) {
  const k = key(col, row);
  const token = state.tokens.get(k);
  if (!token || state.revealed.has(k)) return;
  state.revealed.set(k, token.content);
  state.discoveries += 1;
  discoveriesValue.textContent = String(state.discoveries);
  addLog(`${unit.name} odkrywa żeton: ${token.content}.`);
}

function endTurn() {
  state.round += 1;
  state.units.forEach((unit) => { unit.moveLeft = unit.maxMove; });
  roundValue.textContent = String(state.round);
  addLog(`Koniec tury. Runda ${state.round}. Ruch jednostek odświeżony.`);
  render();
}

function renderSelectedUnitPanel() {
  const unit = getSelectedUnit();
  if (!unit) {
    selectedUnitBox.textContent = 'Kliknij osadnika albo wojownika.';
    return;
  }

  selectedUnitBox.innerHTML = `
    <div class="unit-card-title">
      <strong>${unit.name}</strong>
      <span>${unit.col}, ${unit.row}</span>
    </div>
    <div>${unit.description}</div>
    <div class="unit-stat-grid">
      <div class="unit-stat"><span>HP</span><b>${unit.hp} / ${unit.maxHp}</b></div>
      <div class="unit-stat"><span>Ruch</span><b>${unit.moveLeft} / ${unit.maxMove}</b></div>
      <div class="unit-stat"><span>Atak</span><b>${unit.attack}</b></div>
      <div class="unit-stat"><span>Obrona</span><b>${unit.defense}</b></div>
    </div>
  `;
}

function selectHex(col, row, reveal = true) {
  const k = key(col, row);
  const type = state.terrain.get(k);
  const token = state.tokens.get(k);
  const units = getUnitsAt(col, row);

  let html = `<strong>Heks:</strong> ${col}, ${row}<br>`;
  html += `<strong>Teren:</strong> ${terrainNames[type]}<br>`;

  if (token && !state.revealed.has(k) && reveal) {
    state.revealed.set(k, token.content);
    state.discoveries += 1;
    discoveriesValue.textContent = String(state.discoveries);
    html += `<strong>Żeton odkrycia:</strong> ${token.content}<br>`;
    addLog(`Odkryto żeton na polu ${col}, ${row}: ${token.content}.`);
    render();
  } else if (token && state.revealed.has(k)) {
    html += `<strong>Żeton odkrycia:</strong> ${state.revealed.get(k)}<br>`;
  } else if (token) {
    html += '<strong>Żeton odkrycia:</strong> zakryty<br>';
  } else {
    html += '<strong>Żeton odkrycia:</strong> brak<br>';
  }

  if (units.length > 0) html += `<strong>Jednostki:</strong> ${units.map((unit) => unit.name).join(', ')}<br>`;
  selectedHex.innerHTML = html;
}

function addLog(message) {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = message;
  logBox.prepend(entry);
}

document.querySelector('#new-map-button').addEventListener('click', startNewMap);
document.querySelector('#end-turn-button').addEventListener('click', endTurn);
document.querySelector('#toggle-tokens-button').addEventListener('click', () => {
  state.showTokens = !state.showTokens;
  render();
});

startNewMap();
