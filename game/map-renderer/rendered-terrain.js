const TERRAIN_RENDER_CONFIG = {
  backgroundOcean: '#12334a',
  renderPadding: 42,
  cellRadius: HEX_SIZE * 1.35,
  noiseDots: 4200,
  forestDensity: 9,
  mountainDensity: 6,
  hillDensity: 6
};

const TERRAIN_RENDER_COLORS = {
  ocean: ['#0e2a42', '#163d58', '#1f5872'],
  coast: ['#317f8e', '#66a9a0', '#c2c38d'],
  plains: ['#667a2d', '#8e9c3f', '#b2aa58'],
  forest: ['#1f3f25', '#2f612e', '#4f7c35'],
  hills: ['#75672e', '#a18a43', '#c0ab66'],
  mountain: ['#5f5f59', '#85847b', '#b4b0a3'],
  desert: ['#9c7a3f', '#c69b52', '#dfc27a'],
  lake: ['#376f76', '#5a9aa1', '#83b9b4'],
  tundra: ['#66746f', '#8b9587', '#bec5b2'],
  natural: ['#5d5580', '#8c7ab0', '#c0afd7']
};

function renderLargeTerrainMap() {
  const canvas = document.querySelector('#terrain-render');
  const board = document.querySelector('#board');
  if (!canvas || !board || !state.terrain || state.terrain.size === 0) return;

  const viewBox = board.getAttribute('viewBox');
  if (!viewBox) return;

  const [, , width, height] = viewBox.split(' ').map(Number);
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  const rng = mulberry32(state.seed + 4091);

  drawOceanBase(ctx, width, height, rng);
  drawTerrainBlobs(ctx, rng);
  drawCoastGlow(ctx, rng);
  drawTerrainDetails(ctx, rng);
  drawAtmosphere(ctx, width, height, rng);
}

function drawOceanBase(ctx, width, height, rng) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#173d5a');
  gradient.addColorStop(0.55, '#0f2d45');
  gradient.addColorStop(1, '#071826');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 460; i += 1) {
    const x = rng() * width;
    const y = rng() * height;
    const radius = 12 + rng() * 38;
    ctx.fillStyle = rng() > 0.55 ? '#9ed0d7' : '#284f64';
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius * 0.22, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawTerrainBlobs(ctx, rng) {
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const type = state.terrain.get(key(col, row));
      const { x, y } = hexCenter(col, row);
      drawSoftTerrainCell(ctx, x, y, type, rng);
    }
  }
}

function drawSoftTerrainCell(ctx, x, y, type, rng) {
  const colors = TERRAIN_RENDER_COLORS[type] || TERRAIN_RENDER_COLORS.plains;
  const radius = TERRAIN_RENDER_CONFIG.cellRadius;
  const gradient = ctx.createRadialGradient(x - 8, y - 10, 3, x, y, radius);
  gradient.addColorStop(0, colors[2]);
  gradient.addColorStop(0.48, colors[1]);
  gradient.addColorStop(1, colors[0]);

  ctx.globalAlpha = type === 'ocean' ? 0.18 : 0.78;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(x, y, radius * 1.08, radius * 0.86, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (type !== 'ocean' && type !== 'coast') {
    for (let i = 0; i < 5; i += 1) {
      ctx.globalAlpha = 0.13 + rng() * 0.12;
      ctx.fillStyle = colors[Math.floor(rng() * colors.length)];
      ctx.beginPath();
      ctx.ellipse(
        x + (rng() - 0.5) * radius,
        y + (rng() - 0.5) * radius * 0.7,
        8 + rng() * 18,
        5 + rng() * 13,
        rng() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function drawCoastGlow(ctx, rng) {
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const type = state.terrain.get(key(col, row));
      if (type !== 'coast') continue;
      const { x, y } = hexCenter(col, row);
      ctx.globalAlpha = 0.44;
      ctx.strokeStyle = '#d8d0a3';
      ctx.lineWidth = 4 + rng() * 2;
      ctx.beginPath();
      ctx.ellipse(x, y, HEX_SIZE * 1.05, HEX_SIZE * 0.74, rng() * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

function drawTerrainDetails(ctx, rng) {
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const type = state.terrain.get(key(col, row));
      const { x, y } = hexCenter(col, row);
      if (type === 'forest') drawForestPatch(ctx, x, y, rng, TERRAIN_RENDER_CONFIG.forestDensity);
      if (type === 'mountain') drawMountainPatch(ctx, x, y, rng, TERRAIN_RENDER_CONFIG.mountainDensity);
      if (type === 'hills') drawHillPatch(ctx, x, y, rng, TERRAIN_RENDER_CONFIG.hillDensity);
      if (type === 'desert') drawDesertRipples(ctx, x, y, rng);
      if (type === 'tundra') drawTundraFrost(ctx, x, y, rng);
      if (type === 'lake' || type === 'natural') drawWetland(ctx, x, y, rng);
    }
  }
}

function drawForestPatch(ctx, x, y, rng, count) {
  for (let i = 0; i < count; i += 1) {
    const tx = x + (rng() - 0.5) * HEX_SIZE * 1.75;
    const ty = y + (rng() - 0.5) * HEX_SIZE * 1.2;
    const size = 3.5 + rng() * 4.5;
    ctx.fillStyle = rng() > 0.45 ? '#12351c' : '#245327';
    ctx.beginPath();
    ctx.moveTo(tx, ty - size * 1.8);
    ctx.lineTo(tx - size, ty + size);
    ctx.lineTo(tx + size, ty + size);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5a3a1c';
    ctx.fillRect(tx - 0.8, ty + size * 0.6, 1.6, size * 0.9);
  }
}

function drawMountainPatch(ctx, x, y, rng, count) {
  for (let i = 0; i < count; i += 1) {
    const mx = x + (rng() - 0.5) * HEX_SIZE * 1.5;
    const my = y + (rng() - 0.5) * HEX_SIZE * 0.9;
    const w = 7 + rng() * 10;
    const h = 10 + rng() * 18;
    ctx.fillStyle = '#5d5a54';
    ctx.beginPath();
    ctx.moveTo(mx, my - h);
    ctx.lineTo(mx - w, my + h * 0.45);
    ctx.lineTo(mx + w, my + h * 0.45);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(230,230,215,0.45)';
    ctx.beginPath();
    ctx.moveTo(mx, my - h);
    ctx.lineTo(mx - w * 0.35, my + h * 0.15);
    ctx.lineTo(mx + w * 0.12, my + h * 0.05);
    ctx.closePath();
    ctx.fill();
  }
}

function drawHillPatch(ctx, x, y, rng, count) {
  for (let i = 0; i < count; i += 1) {
    const hx = x + (rng() - 0.5) * HEX_SIZE * 1.6;
    const hy = y + (rng() - 0.5) * HEX_SIZE * 1.0;
    const gradient = ctx.createRadialGradient(hx - 5, hy - 5, 2, hx, hy, 18);
    gradient.addColorStop(0, '#c3b66e');
    gradient.addColorStop(1, 'rgba(80,70,36,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(hx, hy, 16, 9, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDesertRipples(ctx, x, y, rng) {
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#e7c77e';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 5; i += 1) {
    const yy = y - 16 + i * 7 + rng() * 3;
    ctx.beginPath();
    ctx.moveTo(x - 22, yy);
    ctx.quadraticCurveTo(x, yy - 7, x + 22, yy + 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawTundraFrost(ctx, x, y, rng) {
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#d9e5dc';
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.ellipse(x + (rng() - 0.5) * 42, y + (rng() - 0.5) * 30, 4 + rng() * 8, 2 + rng() * 5, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawWetland(ctx, x, y, rng) {
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = '#79aaa1';
  ctx.beginPath();
  ctx.ellipse(x, y, 26, 16, rng() * Math.PI, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawAtmosphere(ctx, width, height, rng) {
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#fff0b0';
  ctx.beginPath();
  ctx.ellipse(width * 0.36, height * 0.18, width * 0.5, height * 0.18, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < TERRAIN_RENDER_CONFIG.noiseDots && i * 4 < data.length; i += 1) {
    const index = Math.floor(rng() * (data.length / 4)) * 4;
    const delta = (rng() - 0.5) * 22;
    data[index] += delta;
    data[index + 1] += delta;
    data[index + 2] += delta;
  }
  ctx.putImageData(image, 0, 0);
}

function drawHex(col, row) {
  const type = state.terrain.get(key(col, row));
  const { x, y } = hexCenter(col, row);
  const points = hexPoints(x, y, HEX_SIZE * 0.96);

  if (type === 'ocean') return;

  const border = createSvgElement('polygon', {
    points,
    fill: 'transparent',
    stroke: type === 'coast' ? 'rgba(185, 224, 222, 0.38)' : 'rgba(210, 226, 202, 0.18)',
    'stroke-width': type === 'coast' ? '1.5' : '1',
    class: 'hex-border',
    'data-col': col,
    'data-row': row
  });
  border.addEventListener('click', () => handleHexClick(col, row));
  board.appendChild(border);
}

const originalRender = render;
render = function renderWithLargeTerrainMap() {
  originalRender();
  renderLargeTerrainMap();
};

render();
