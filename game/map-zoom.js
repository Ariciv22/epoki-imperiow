const MAP_ZOOM_LEVELS = [1.15, 1.55, 2.05];
let mapZoomIndex = 1;

function applyMapZoom() {
  const boardWrap = document.querySelector('.board-wrap');
  const board = document.querySelector('#board');
  if (!boardWrap || !board) return;

  const zoom = MAP_ZOOM_LEVELS[mapZoomIndex];
  const oldCenterX = boardWrap.scrollLeft + boardWrap.clientWidth / 2;
  const oldCenterY = boardWrap.scrollTop + boardWrap.clientHeight / 2;
  const previousZoom = Number(board.dataset.zoom || MAP_ZOOM_LEVELS[0]);

  board.style.width = `${Math.round(1120 * zoom)}px`;
  board.dataset.zoom = String(zoom);

  const ratio = previousZoom > 0 ? zoom / previousZoom : 1;
  requestAnimationFrame(() => {
    boardWrap.scrollLeft = oldCenterX * ratio - boardWrap.clientWidth / 2;
    boardWrap.scrollTop = oldCenterY * ratio - boardWrap.clientHeight / 2;
  });
}

function changeMapZoom(direction) {
  const next = mapZoomIndex + direction;
  if (next < 0 || next >= MAP_ZOOM_LEVELS.length) return;
  mapZoomIndex = next;
  applyMapZoom();
}

function setupMapZoom() {
  const boardWrap = document.querySelector('.board-wrap');
  if (!boardWrap) return;

  boardWrap.addEventListener('wheel', (event) => {
    event.preventDefault();
    changeMapZoom(event.deltaY < 0 ? 1 : -1);
  }, { passive: false });

  applyMapZoom();
}

setupMapZoom();
