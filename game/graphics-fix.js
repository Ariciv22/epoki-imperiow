const fixedTerrainImages = {
  ocean: '../Grafiki/wybrzeze.png?v=3',
  coast: '../Grafiki/wybrzeze.png?v=3',
  plains: '../Grafiki/rowniny.png?v=3',
  forest: '../Grafiki/las.png?v=3',
  hills: '../Grafiki/wzgorza.png?v=3',
  mountain: '../Grafiki/gory.png?v=3',
  desert: '../Grafiki/pustynia.png?v=3',
  lake: '../Grafiki/obszar_zalewowy.png?v=3',
  tundra: '../Grafiki/tundra.png?v=3',
  natural: '../Grafiki/gory.png?v=3'
};

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
    href: fixedTerrainImages[type],
    'clip-path': `url(#${clipId})`,
    preserveAspectRatio: 'xMidYMid slice',
    style: 'pointer-events: none;'
  });
  img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', fixedTerrainImages[type]);
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

render();
