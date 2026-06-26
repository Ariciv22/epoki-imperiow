const fixedTerrainImages = {
  ocean: null,
  coast: 'Grafiki/wybrzeze.png?v=6',
  plains: 'Grafiki/rowniny.png?v=6',
  forest: 'Grafiki/las.png?v=6',
  hills: 'Grafiki/wzgorza.png?v=6',
  mountain: 'Grafiki/gory.png?v=6',
  desert: 'Grafiki/pustynia.png?v=6',
  lake: 'Grafiki/obszar_zalewowy.png?v=6',
  tundra: 'Grafiki/tundra.png?v=6',
  natural: 'Grafiki/gory.png?v=6'
};

const HEX_IMAGE_SCALE = 1.28;

function drawHex(col, row) {
  const type = state.terrain.get(key(col, row));
  const { x, y } = hexCenter(col, row);
  const points = hexPoints(x, y, HEX_SIZE * 0.96);
  const clipId = `hex-clip-fixed-${col}-${row}`;
  const defs = board.querySelector('defs');

  const clipPath = createSvgElement('clipPath', { id: clipId });
  clipPath.appendChild(createSvgElement('polygon', { points }));
  defs.appendChild(clipPath);

  const base = createSvgElement('polygon', {
    points,
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
    points,
    fill: 'transparent',
    stroke: type === 'ocean' || type === 'coast' ? '#1f5975' : '#26323a',
    'stroke-width': type === 'ocean' ? '0.9' : '1.2',
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
