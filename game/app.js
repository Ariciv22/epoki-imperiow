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

const terrainPatterns = {
  ocean: 'url(#terrain-ocean)',
  coast: 'url(#terrain-coast)',
  plains: 'url(#terrain-plains)',
  forest: 'url(#terrain-forest)',
  hills: 'url(#terrain-hills)',
  mountain: 'url(#terrain-mountain)',
  desert: 'url(#terrain-desert)',
  lake: 'url(#terrain-lake)',
  natural: 'url(#terrain-natural)'
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

const passableTerrain = ['plains', 'forest', 'hills', 'desert', 'natural'];

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

function createUnit(id, templateKey, col, row) {
  const template = unitTemplates[templateKey];
  return {
    id,
    templateKey,
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
  addTerrainDefs();

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      drawHex(col, row);
    }
  }

  drawMoveTargets();
  if (state.showTokens) drawTokens();
  drawStartMarkers();
  drawUnits();
  renderSelectedUnitPanel();
}

function addTerrainDefs() {
  const defs = createSvgElement('defs');
  defs.innerHTML = `
    <pattern id="terrain-plains" width="54" height="54" patternUnits="userSpaceOnUse">
      <rect width="54" height="54" fill="#8fbd68"/>
      <path d="M5 18 C14 10 22 24 31 14 C40 5 45 18 52 12" fill="none" stroke="#6fa34f" stroke-width="2" opacity="0.55"/>
      <path d="M8 38 C18 31 29 45 41 34" fill="none" stroke="#b7d986" stroke-width="1.5" opacity="0.45"/>
      <circle cx="13" cy="11" r="1.4" fill="#d7eaa7" opacity="0.55"/>
      <circle cx="39" cy="42" r="1.3" fill="#d7eaa7" opacity="0.45"/>
    </pattern>
    <pattern id="terrain-forest" width="58" height="58" patternUnits="userSpaceOnUse">
      <rect width="58" height="58" fill="#3f7f4f"/>
      <path d="M14 36 L22 18 L30 36 Z" fill="#235f37" opacity="0.9"/>
      <path d="M32 40 L42 16 L52 40 Z" fill="#2d6e42" opacity="0.9"/>
      <path d="M0 42 L9 22 L18 42 Z" fill="#2b693f" opacity="0.85"/>
      <rect x="21" y="34" width="3" height="8" fill="#6f4d27" opacity="0.7"/>
      <rect x="41" y="38" width="3" height="8" fill="#6f4d27" opacity="0.7"/>
    </pattern>
    <pattern id="terrain-hills" width="60" height="60" patternUnits="userSpaceOnUse">
      <rect width="60" height="60" fill="#a58b55"/>
      <ellipse cx="18" cy="33" rx="18" ry="10" fill="#8e7444" opacity="0.65"/>
      <ellipse cx="43" cy="24" rx="20" ry="12" fill="#b89d64" opacity="0.65"/>
      <path d="M4 43 C20 35 36 50 56 38" fill="none" stroke="#705b37" stroke-width="2" opacity="0.35"/>
    </pattern>
    <pattern id="terrain-mountain" width="60" height="60" patternUnits="userSpaceOnUse">
      <rect width="60" height="60" fill="#8a8a86"/>
      <polygon points="6,48 23,13 40,48" fill="#646461"/>
      <polygon points="25,49 43,8 58,49" fill="#73736f"/>
      <path d="M23 13 L28 27 L18 27 Z" fill="#f1f1e5" opacity="0.85"/>
      <path d="M43 8 L48 25 L37 25 Z" fill="#f1f1e5" opacity="0.8"/>
    </pattern>
    <pattern id="terrain-desert" width="60" height="60" patternUnits="userSpaceOnUse">
      <rect width="60" height="60" fill="#d8bc72"/>
      <path d="M0 23 C14 14 28 31 42 21 C51 15 56 17 60 19" fill="none" stroke="#b9964b" stroke-width="2" opacity="0.55"/>
      <path d="M0 44 C15 36 27 49 42 41 C51 36 56 38 60 40" fill="none" stroke="#edd58e" stroke-width="1.5" opacity="0.55"/>
      <circle cx="17" cy="16" r="1.3" fill="#9b793b" opacity="0.4"/>
      <circle cx="45" cy="47" r="1.2" fill="#9b793b" opacity="0.35"/>
    </pattern>
    <pattern id="terrain-ocean" width="62" height="62" patternUnits="userSpaceOnUse">
      <rect width="62" height="62" fill="#2f6f9f"/>
      <path d="M0 18 C10 10 20 26 31 18 C42 10 51 25 62 16" fill="none" stroke="#7cc7df" stroke-width="2" opacity="0.45"/>
      <path d="M0 41 C12 34 22 49 34 41 C45 34 52 47 62 39" fill="none" stroke="#1f5975" stroke-width="2" opacity="0.5"/>
    </pattern>
    <pattern id="terrain-coast" width="62" height="62" patternUnits="userSpaceOnUse">
      <rect width="62" height="62" fill="#5aa7c8"/>
      <path d="M-4 42 C12 22 26 51 42 30 C51 18 59 24 66 20" fill="none" stroke="#e7d18e" stroke-width="5" opacity="0.55"/>
      <path d="M0 18 C10 12 20 26 31 18 C42 11 51 25 62 17" fill="none" stroke="#a7e0ef" stroke-width="1.8" opacity="0.5"/>
    </pattern>
    <pattern id="terrain-lake" width="62" height="62" patternUnits="userSpaceOnUse">
      <rect width="62" height="62" fill="#4f9bc2"/>
      <ellipse cx="31" cy="31" rx="24" ry="16" fill="#69b7d4" opacity="0.7"/>
      <path d="M10 31 C19 25 28 37 37 31 C45 26 52 33 57 28" fill="none" stroke="#d4f4fb" stroke-width="1.8" opacity="0.55"/>
    </pattern>
    <pattern id="terrain-natural" width="62" height="62" patternUnits="userSpaceOnUse">
      <rect width="62" height="62" fill="#8fbd68"/>
      <circle cx="31" cy="31" r="22" fill="#c58edb" opacity="0.65"/>
      <path d="M31 9 L38 27 L57 27 L42 39 L48 57 L31 45 L14 57 L20 39 L5 27 L24 27 Z" fill="#f4e7a2" opacity="0.9"/>
    </pattern>
  `;
  board.appendChild(defs);
}

function drawHex(col, row) {
  const type = state.terrain.get(key(col, row));
  const { x, y } = hexCenter(col, row);
  const polygon = createSvgElement('polygon', {
    points: hexPoints(x, y, HEX_SIZE * 0.96),
    fill: terrainPatterns[type] || terrainColors[type],
    stroke: type === 'ocean' || type === 'coast' ? '#1f5975' : '#26323a',
    'stroke-width': '1.2',
    class: 'hex',
    'data-col': col,
    'data-row': row
  });

  polygon.addEventListener('click', () => handleHexClick(col, row));
  board.appendChild(polygon);
  drawTerrainDecoration(col, row, type, x, y);

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

function drawTerrainDecoration(col, row, type, x, y) {
  const seed = (col * 31 + row * 17 + state.seed) % 100;
  const group = createSvgElement('g', { class: 'terrain-decoration' });

  if (type === 'forest') {
    const trees = [[-8, 0], [3, -7], [10, 3]];
    trees.forEach(([dx, dy], index) => {
      const tree = createSvgElement('path', {
        d: `M ${x + dx - 6} ${y + dy + 6} L ${x + dx} ${y + dy - 8 - index} L ${x + dx + 6} ${y + dy + 6} Z`,
        fill: index === 1 ? '#174d2e' : '#215f38',
        opacity: 0.9
      });
      group.appendChild(tree);
    });
  }

  if (type === 'mountain') {
    [[-8, 7, 18], [7, 8, 22]].forEach(([dx, base, height]) => {
      const mountain = createSvgElement('polygon', {
        points: `${x + dx - 10},${y + base} ${x + dx},${y + base - height} ${x + dx + 10},${y + base}`,
        fill: '#5d5d5a',
        opacity: 0.88
      });
      group.appendChild(mountain);
      const snow = createSvgElement('polygon', {
        points: `${x + dx - 4},${y + base - height + 8} ${x + dx},${y + base - height} ${x + dx + 5},${y + base - height + 9}`,
        fill: '#f2f0df',
        opacity: 0.9
      });
      group.appendChild(snow);
    });
  }

  if (type === 'hills') {
    const hill = createSvgElement('path', {
      d: `M ${x - 16} ${y + 7} C ${x - 8} ${y - 4}, ${x + 2} ${y - 6}, ${x + 17} ${y + 7} Z`,
      fill: '#7f6539',
      opacity: 0.55
    });
    group.appendChild(hill);
  }

  if (type === 'plains' && seed > 55) {
    const grass = createSvgElement('path', {
      d: `M ${x - 14} ${y + 7} C ${x - 4} ${y + 1}, ${x + 6} ${y + 12}, ${x + 15} ${y + 4}`,
      fill: 'none',
      stroke: '#e0eaa2',
      'stroke-width': 1.7,
      opacity: 0.55
    });
    group.appendChild(grass);
  }

  if (type === 'desert') {
    const dune = createSvgElement('path', {
      d: `M ${x - 17} ${y + 6} C ${x - 5} ${y - 3}, ${x + 7} ${y + 12}, ${x + 18} ${y + 1}`,
      fill: 'none',
      stroke: '#f1dc96',
      'stroke-width': 2,
      opacity: 0.65
    });
    group.appendChild(dune);
  }

  if (type === 'natural') {
    const star = createSvgElement('text', {
      x,
      y: y + 3,
      fill: '#4b2a68',
      'font-size': 16,
      'font-weight': 900,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      opacity: 0.9
    });
    star.textContent = '✦';
    group.appendChild(star);
  }

  board.appendChild(group);
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
        const ring = createSvgElement('circle', {
          cx,
          cy,
          r: 12.5,
          class: 'selected-unit-ring'
        });
        board.appendChild(ring);
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
  if (otherUnits.length > 0) return false;

  return true;
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
  state.units.forEach((unit) => {
    unit.moveLeft = unit.maxMove;
  });
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

  if (units.length > 0) {
    html += `<strong>Jednostki:</strong> ${units.map((unit) => unit.name).join(', ')}<br>`;
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
document.querySelector('#end-turn-button').addEventListener('click', endTurn);
document.querySelector('#toggle-tokens-button').addEventListener('click', () => {
  state.showTokens = !state.showTokens;
  render();
});

startNewMap();
