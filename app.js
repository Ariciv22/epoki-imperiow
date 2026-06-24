const BOARD_COLS = 20;
const BOARD_ROWS = 14;
const HEX_WIDTH = 54;
const HEX_HEIGHT = 48;
const X_STEP = 42;
const Y_STEP = 50;
const RESOURCE_LIMIT = 20;

const TERRAIN_TYPES = [
  { id: 'plains', name: 'Równiny', moveCost: 1, defense: 0, blocked: false },
  { id: 'forest', name: 'Las', moveCost: 2, defense: 1, blocked: false },
  { id: 'hills', name: 'Wzgórza', moveCost: 2, defense: 1, blocked: false },
  { id: 'mountains', name: 'Góry', moveCost: null, defense: 0, blocked: true },
  { id: 'river', name: 'Rzeka / dolina', moveCost: 1, defense: 0, blocked: false },
  { id: 'lake', name: 'Jezioro', moveCost: null, defense: 0, blocked: true },
  { id: 'desert', name: 'Pustynia', moveCost: 1, defense: 0, blocked: false },
  { id: 'swamp', name: 'Bagna', moveCost: 2, defense: 1, blocked: false },
  { id: 'jungle', name: 'Dżungla', moveCost: 2, defense: 1, blocked: false },
  { id: 'tundra', name: 'Tundra', moveCost: 1, defense: 0, blocked: false },
  { id: 'coast', name: 'Wybrzeże', moveCost: 1, defense: 0, blocked: false },
  { id: 'sea', name: 'Morze', moveCost: null, defense: 0, blocked: true },
];

const DISCOVERY_RESULTS = [
  'Puste pole',
  'Zwykłe miejsce bez nagrody',
  'Ruiny: +1 nauki',
  'Zagubione zasoby: +1 produkcji',
  'Zagrożenie: w przyszłości pojawią się barbarzyńcy',
  'Specjalne miejsce: +1 kultury',
  'Cud naturalny: +2 nauki albo +2 kultury',
];

const state = {
  round: 1,
  activePlayerId: 1,
  selectedHexId: null,
  players: [
    makePlayer(1, 'Gracz 1'),
    makePlayer(2, 'Gracz 2'),
  ],
  hexes: makeMap(),
  units: [
    makeUnit(1, 1, 'settler', 'Osadnik', 'civilian', 1, 2, 11),
    makeUnit(2, 1, 'warrior', 'Wojownik', 'military', 4, 2, 11),
    makeUnit(3, 2, 'settler', 'Osadnik', 'civilian', 1, 2, 268),
    makeUnit(4, 2, 'warrior', 'Wojownik', 'military', 4, 2, 268),
  ],
  cities: [],
  log: [
    'Utworzono świeży prototyp HTML/CSS/JS.',
    'Każdy gracz startuje z Osadnikiem i Wojownikiem.',
  ],
};

function makePlayer(id, name) {
  return {
    id,
    name,
    resources: {
      food: 0,
      production: 0,
      gold: 0,
      science: 0,
      culture: 0,
    },
  };
}

function makeUnit(id, ownerId, kind, name, type, hp, actions, hexId) {
  return { id, ownerId, kind, name, type, hp, actions, hexId };
}

function makeMap() {
  const weightedTerrains = [
    'plains', 'plains', 'plains', 'plains',
    'forest', 'forest', 'forest',
    'hills', 'hills', 'hills',
    'mountains', 'river', 'river', 'river',
    'lake', 'desert', 'desert',
    'swamp', 'jungle', 'tundra', 'coast', 'sea',
  ];

  const hexes = [];
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const id = row * BOARD_COLS + col;
      const terrainId = weightedTerrains[(id * 7 + row * 3 + col) % weightedTerrains.length];
      const safeFromStart = distanceById(id, 11) <= 2 || distanceById(id, 268) <= 2;
      const hasDiscovery = !safeFromStart && id % 3 === 0;
      hexes.push({
        id,
        row,
        col,
        terrainId,
        discoveryToken: hasDiscovery,
        discovered: false,
        ownerId: null,
      });
    }
  }
  return hexes;
}

function getTerrain(id) {
  return TERRAIN_TYPES.find((terrain) => terrain.id === id);
}

function getActivePlayer() {
  return state.players.find((player) => player.id === state.activePlayerId);
}

function getSelectedHex() {
  return state.hexes.find((hex) => hex.id === state.selectedHexId) || null;
}

function getUnitsOnHex(hexId) {
  return state.units.filter((unit) => unit.hexId === hexId);
}

function getCityOnHex(hexId) {
  return state.cities.find((city) => city.hexId === hexId) || null;
}

function getSettlerOnSelectedHex() {
  const selectedHex = getSelectedHex();
  if (!selectedHex) return null;
  return state.units.find(
    (unit) => unit.hexId === selectedHex.id && unit.ownerId === state.activePlayerId && unit.kind === 'settler'
  ) || null;
}

function render() {
  renderHeader();
  renderPlayerPanel();
  renderBoard();
  renderHexPanel();
  renderButtons();
  renderLog();
}

function renderHeader() {
  document.getElementById('roundLabel').textContent = `Runda ${state.round}`;
  document.getElementById('playerLabel').textContent = getActivePlayer().name;
}

function renderPlayerPanel() {
  const player = getActivePlayer();
  document.getElementById('playerPanel').innerHTML = `
    <div class="stat-grid">
      <span>Żywność</span><strong>${player.resources.food}/${RESOURCE_LIMIT}</strong>
      <span>Produkcja</span><strong>${player.resources.production}/${RESOURCE_LIMIT}</strong>
      <span>Złoto</span><strong>${player.resources.gold}/${RESOURCE_LIMIT}</strong>
      <span>Nauka</span><strong>${player.resources.science}/${RESOURCE_LIMIT}</strong>
      <span>Kultura</span><strong>${player.resources.culture}/${RESOURCE_LIMIT}</strong>
      <span>Miasta</span><strong>${state.cities.filter((city) => city.ownerId === player.id).length}/4</strong>
    </div>
  `;
}

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  state.hexes.forEach((hex) => {
    const terrain = getTerrain(hex.terrainId);
    const button = document.createElement('button');
    button.className = `hex terrain-${terrain.id}`;
    if (state.selectedHexId === hex.id) button.classList.add('selected');
    if (hex.ownerId === 1) button.classList.add('owned-p1');
    if (hex.ownerId === 2) button.classList.add('owned-p2');

    const left = hex.col * X_STEP;
    const top = hex.row * Y_STEP + (hex.col % 2 === 1 ? HEX_HEIGHT / 2 : 0);
    button.style.left = `${left}px`;
    button.style.top = `${top}px`;

    button.innerHTML = `<span>${hex.id}</span>`;

    if (hex.discoveryToken) {
      const token = document.createElement('span');
      token.className = 'token';
      token.textContent = '?';
      button.appendChild(token);
    }

    const city = getCityOnHex(hex.id);
    if (city) {
      const cityEl = document.createElement('span');
      cityEl.className = 'city';
      cityEl.textContent = city.isCapital ? 'S' : 'M';
      button.appendChild(cityEl);
    }

    getUnitsOnHex(hex.id).forEach((unit) => {
      const unitEl = document.createElement('span');
      unitEl.className = `unit ${unit.type} p${unit.ownerId}`;
      unitEl.title = unit.name;
      unitEl.textContent = unit.kind === 'settler' ? 'O' : 'W';
      button.appendChild(unitEl);
    });

    button.addEventListener('click', () => {
      state.selectedHexId = hex.id;
      render();
    });

    board.appendChild(button);
  });
}

function renderHexPanel() {
  const panel = document.getElementById('hexPanel');
  const hex = getSelectedHex();
  if (!hex) {
    panel.textContent = 'Kliknij heks na mapie.';
    return;
  }

  const terrain = getTerrain(hex.terrainId);
  const units = getUnitsOnHex(hex.id);
  const city = getCityOnHex(hex.id);
  panel.innerHTML = `
    <div class="stat-grid">
      <span>ID</span><strong>${hex.id}</strong>
      <span>Teren</span><strong>${terrain.name}</strong>
      <span>Ruch</span><strong>${terrain.blocked ? 'niedostępny' : terrain.moveCost}</strong>
      <span>Obrona</span><strong>+${terrain.defense}</strong>
      <span>Żeton odkryć</span><strong>${hex.discoveryToken ? 'tak' : 'nie'}</strong>
      <span>Właściciel</span><strong>${hex.ownerId ? `Gracz ${hex.ownerId}` : '-'}</strong>
      <span>Miasto</span><strong>${city ? city.name : '-'}</strong>
      <span>Jednostki</span><strong>${units.length ? units.map((unit) => `${unit.name} G${unit.ownerId}`).join(', ') : '-'}</strong>
    </div>
  `;
}

function renderButtons() {
  const settleButton = document.getElementById('settleButton');
  const discoverButton = document.getElementById('discoverButton');
  const hex = getSelectedHex();
  const settler = getSettlerOnSelectedHex();
  settleButton.disabled = !canSettle(hex, settler);
  discoverButton.disabled = !hex || !hex.discoveryToken;
}

function renderLog() {
  document.getElementById('log').innerHTML = state.log
    .slice(-40)
    .reverse()
    .map((entry) => `<div class="log-entry">${entry}</div>`)
    .join('');
}

function canSettle(hex, settler) {
  if (!hex || !settler) return false;
  const terrain = getTerrain(hex.terrainId);
  if (terrain.blocked) return false;
  if (getCityOnHex(hex.id)) return false;
  if (state.cities.some((city) => city.ownerId === state.activePlayerId && city.isCapital)) return false;
  if (state.cities.some((city) => distanceById(city.hexId, hex.id) < 4)) return false;
  return true;
}

function settleCapital() {
  const hex = getSelectedHex();
  const settler = getSettlerOnSelectedHex();
  if (!canSettle(hex, settler)) return;

  state.units = state.units.filter((unit) => unit.id !== settler.id);
  state.cities.push({
    id: state.cities.length + 1,
    ownerId: state.activePlayerId,
    name: `Stolica G${state.activePlayerId}`,
    hexId: hex.id,
    isCapital: true,
    hp: 7,
    defense: 7,
  });

  getNeighborIds(hex.id).concat(hex.id).forEach((hexId) => {
    const ownedHex = state.hexes.find((candidate) => candidate.id === hexId);
    if (ownedHex) ownedHex.ownerId = state.activePlayerId;
  });

  addLog(`${getActivePlayer().name} zakłada stolicę na heksie ${hex.id}.`);
  render();
}

function discoverSelectedHex() {
  const hex = getSelectedHex();
  if (!hex || !hex.discoveryToken) return;
  const result = DISCOVERY_RESULTS[hex.id % DISCOVERY_RESULTS.length];
  hex.discoveryToken = false;
  hex.discovered = true;

  const player = getActivePlayer();
  if (result.includes('+1 nauki')) addResource(player, 'science', 1);
  if (result.includes('+1 produkcji')) addResource(player, 'production', 1);
  if (result.includes('+1 kultury')) addResource(player, 'culture', 1);
  if (result.includes('+2 nauki')) addResource(player, 'science', 2);

  addLog(`${player.name} odkrywa heks ${hex.id}: ${result}.`);
  render();
}

function endTurn() {
  giveCityIncome(getActivePlayer());

  if (state.activePlayerId === 1) {
    state.activePlayerId = 2;
  } else {
    state.activePlayerId = 1;
    state.round += 1;
  }

  state.selectedHexId = null;
  addLog(`Tura przechodzi do ${getActivePlayer().name}.`);
  render();
}

function giveCityIncome(player) {
  const playerCities = state.cities.filter((city) => city.ownerId === player.id);
  playerCities.forEach((city) => {
    if (city.isCapital) {
      addResource(player, 'food', 2);
      addResource(player, 'production', 2);
      addResource(player, 'gold', 1);
      addResource(player, 'science', 1);
      addResource(player, 'culture', 1);
      addLog(`${player.name} dostaje dochód ze stolicy.`);
    } else {
      addResource(player, 'food', 1);
      addResource(player, 'production', 1);
      addResource(player, 'gold', 1);
      addResource(player, 'science', 1);
      addLog(`${player.name} dostaje dochód z miasta.`);
    }
  });
}

function addResource(player, key, amount) {
  player.resources[key] = Math.min(RESOURCE_LIMIT, player.resources[key] + amount);
}

function addLog(text) {
  state.log.push(text);
}

function getNeighborIds(hexId) {
  const hex = state.hexes.find((candidate) => candidate.id === hexId);
  if (!hex) return [];

  const evenColOffsets = [
    [-1, -1], [0, -1],
    [-1, 0], [1, 0],
    [-1, 1], [0, 1],
  ];
  const oddColOffsets = [
    [0, -1], [1, -1],
    [-1, 0], [1, 0],
    [0, 1], [1, 1],
  ];

  const offsets = hex.col % 2 === 0 ? evenColOffsets : oddColOffsets;
  return offsets
    .map(([dc, dr]) => ({ col: hex.col + dc, row: hex.row + dr }))
    .filter(({ col, row }) => col >= 0 && col < BOARD_COLS && row >= 0 && row < BOARD_ROWS)
    .map(({ col, row }) => row * BOARD_COLS + col);
}

function distanceById(a, b) {
  const hexA = { col: a % BOARD_COLS, row: Math.floor(a / BOARD_COLS) };
  const hexB = { col: b % BOARD_COLS, row: Math.floor(b / BOARD_COLS) };
  return Math.max(Math.abs(hexA.col - hexB.col), Math.abs(hexA.row - hexB.row));
}

document.getElementById('settleButton').addEventListener('click', settleCapital);
document.getElementById('discoverButton').addEventListener('click', discoverSelectedHex);
document.getElementById('endTurnButton').addEventListener('click', endTurn);

render();
