(() => {
  const TERRAIN_FILES = {
    ocean: 'wybrzeze.png',
    coast: 'wybrzeze.png',
    plains: 'rowniny.png',
    forest: 'las.png',
    hills: 'wzgorza.png',
    mountain: 'gory.png',
    desert: 'pustynia.png',
    lake: 'obszar_zalewowy.png',
    floodplain: 'obszar_zalewowy.png',
    tundra: 'tundra.png',
    natural: 'gory.png'
  };

  const TERRAIN_IMAGE_DIRS = [
    '/grafiki',
    '../grafiki',
    'grafiki',
    '/Grafiki',
    '../Grafiki',
    'Grafiki'
  ];

  const terrainImageCache = new Map();

  function buildImageCandidates(type) {
    const filename = TERRAIN_FILES[type];
    if (!filename) return [];
    return TERRAIN_IMAGE_DIRS.map((directory) => `${directory}/${filename}`);
  }

  function loadTerrainImage(type) {
    const cached = terrainImageCache.get(type);
    if (cached && cached.status !== 'missing') return;

    const candidates = buildImageCandidates(type);
    if (candidates.length === 0) {
      terrainImageCache.set(type, { status: 'missing', src: null });
      return;
    }

    terrainImageCache.set(type, { status: 'loading', src: null });

    function tryNext(index) {
      if (index >= candidates.length) {
        console.warn(`Nie znaleziono grafiki terenu dla typu: ${type}`, candidates);
        terrainImageCache.set(type, { status: 'missing', src: null });
        return;
      }

      const src = candidates[index];
      const probe = new Image();
      probe.onload = () => {
        terrainImageCache.set(type, { status: 'loaded', src });
        render();
      };
      probe.onerror = () => tryNext(index + 1);
      probe.src = src;
    }

    tryNext(0);
  }

  function getTerrainImage(type) {
    const cached = terrainImageCache.get(type);
    if (cached?.status === 'loaded') return cached.src;
    loadTerrainImage(type);
    return null;
  }

  function drawTerrainImage(col, row, type, x, y, points, src) {
    const defs = board.querySelector('defs') || createSvgElement('defs');
    if (!defs.parentNode) board.prepend(defs);

    const clipId = `terrain-image-clip-${state.seed}-${col}-${row}`;
    const clipPath = createSvgElement('clipPath', { id: clipId });
    clipPath.appendChild(createSvgElement('polygon', { points }));
    defs.appendChild(clipPath);

    const image = createSvgElement('image', {
      x: (x - HEX_SIZE).toFixed(1),
      y: (y - (Math.sqrt(3) / 2) * HEX_SIZE).toFixed(1),
      width: (HEX_SIZE * 2).toFixed(1),
      height: (Math.sqrt(3) * HEX_SIZE).toFixed(1),
      href: src,
      'clip-path': `url(#${clipId})`,
      preserveAspectRatio: 'xMidYMid slice',
      class: 'terrain-image',
      style: 'pointer-events: none;'
    });
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', src);
    board.appendChild(image);

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
  }

  drawHex = function drawHexWithTerrainImage(col, row) {
    const type = state.terrain.get(key(col, row));
    const { x, y } = hexCenter(col, row);
    const points = hexPoints(x, y, HEX_SIZE * 0.96);
    const imageSrc = getTerrainImage(type);

    if (imageSrc) {
      drawTerrainImage(col, row, type, x, y, points, imageSrc);
    } else {
      const polygon = createSvgElement('polygon', {
        points,
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
    }

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
  };

  render();
})();
