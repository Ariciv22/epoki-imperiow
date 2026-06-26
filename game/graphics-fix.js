const fixedTerrainImages = {
  ocean: null,
  coast: 'Grafiki/wybrzeze.png?v=9',
  plains: 'Grafiki/rowniny.png?v=9',
  forest: 'Grafiki/las.png?v=9',
  hills: 'Grafiki/wzgorza.png?v=9',
  mountain: 'Grafiki/gory.png?v=9',
  desert: 'Grafiki/pustynia.png?v=9',
  lake: 'Grafiki/obszar_zalewowy.png?v=9',
  tundra: 'Grafiki/tundra.png?v=9',
  natural: 'Grafiki/gory.png?v=9'
};

const HEX_IMAGE_SCALE = 1.10;

function boardHexPoints(cx, cy, size) {
  return hexPoints(cx, cy, size * 0.96);
}

function imageClipHexPoints(cx, cy, size) {
  const halfWidth = size * 0.86;
  const halfTopWidth = size * 0.50;
  const halfHeight = size * 0.78;

  return [
    `${(cx + halfWidth).toFixed(1)},${cy.toFixed(1)}`,
    `${(cx + halfTopWidth).toFixed(1)},${(cy - halfHeight).toFixed(1)}`,
    `${(cx - halfTopWidth).toFixed(1)},${(cy - halfHeight).toFixed(1)}`,
    `${(cx - halfWidth).toFixed(1)},${cy.toFixed(1)}`,
    `${(cx - halfTopWidth).toFixed(1)},${(cy + halfHeight).toFixed(1)}`,
    `${(cx + halfTopWidth).toFixed(1)},${(cy + halfHeight).toFixed(1)}`
  ].join(' ');
}

function drawHex(col, row) {
  const type = state.terrain.get(key(col, row));
  const { x, y } = hexCenter(col, row);
  const boardPoints = boardHexPoints(x, y, HEX_SIZE);
  const imageClipPoints = imageClipHexPoints(x, y, HEX_SIZE);
  const clipId = `hex-clip-fixed-${col}-${row}`;
  const defs = board.querySelector('defs');

  const clipPath = createSvgElement('clipPath', { id: clipId });
  clipPath.appendChild(createSvgElement('polygon', { points: imageClipPoints }));
  defs.appendChild(clipPath);

  const base = createSvgElement('polygon', {
    points: boardPoints,
    fill: type === 'ocean' ? '#14314a' : (fallbackColors[type] || '#888'),
    class: 'hex-base',
    'data-col': col,
    'data-row': row
  });
  base.addEventListener('click', () => handleHexClick(col, row));
  board.appendChild(base);

  const imageSrc = fixedTerrainImages[type];
  if (imageSrc) {
    const imageWidth = HEX_SIZE * 2 * HEX_IMAGE_SCALE;
    const imageHeight = Math.sqrt(3) * HEX_SIZE * HEX_IMAGE_SCALE;
    const img = createSvgElement('image', {
      x: (x - imageWidth / 2).toFixed(1),
      y: (y - imageHeight / 2).toFixed(1),
      width: imageWidth.toFixed(1),
      height: imageHeight.toFixed(1),
      href: imageSrc,
      'clip-path': `url(#${clipId})`,
      preserveAspectRatio: 'xMidYMid slice',
      style: 'pointer-events: none;'
    });
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imageSrc);
    board.appendChild(img);
  }

  const border = createSvgElement('polygon', {
    points: boardPoints,
    fill: 'transparent',
    stroke: type === 'ocean' || type === 'coast' ? '#2f6f93' : '#183849',
    'stroke-width': type === 'ocean' ? '1.1' : '2.1',
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

render();
