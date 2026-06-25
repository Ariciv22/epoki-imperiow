const MAP_BASE_WIDTH = 1120;
const MAP_ZOOM_LEVELS = [1.45, 2.35, 3.45];
let mapZoomIndex = 0;

function getMapZoom() {
  return MAP_ZOOM_LEVELS[mapZoomIndex];
}

function setBoardWidth(zoom) {
  const board = document.querySelector('#board');
  if (!board) return;
  board.style.width = `${Math.round(MAP_BASE_WIDTH * zoom)}px`;
  board.dataset.zoom = String(zoom);
}

function applyMapZoomToPointer(nextZoom, pointerX, pointerY) {
  const boardWrap = document.querySelector('.board-wrap');
  const board = document.querySelector('#board');
  if (!boardWrap || !board) return;

  const previousZoom = Number(board.dataset.zoom || getMapZoom());
  const rect = boardWrap.getBoundingClientRect();

  const localX = pointerX - rect.left;
  const localY = pointerY - rect.top;
  const mapXBeforeZoom = (boardWrap.scrollLeft + localX) / previousZoom;
  const mapYBeforeZoom = (boardWrap.scrollTop + localY) / previousZoom;

  setBoardWidth(nextZoom);

  requestAnimationFrame(() => {
    boardWrap.scrollLeft = mapXBeforeZoom * nextZoom - localX;
    boardWrap.scrollTop = mapYBeforeZoom * nextZoom - localY;
  });
}

function zoomMapFromWheel(event) {
  const nextIndex = mapZoomIndex + (event.deltaY < 0 ? 1 : -1);
  if (nextIndex < 0 || nextIndex >= MAP_ZOOM_LEVELS.length) return;

  mapZoomIndex = nextIndex;
  applyMapZoomToPointer(MAP_ZOOM_LEVELS[mapZoomIndex], event.clientX, event.clientY);
}

function setupMapZoom() {
  const boardWrap = document.querySelector('.board-wrap');
  if (!boardWrap) return;

  boardWrap.addEventListener('wheel', (event) => {
    event.preventDefault();
    event.stopPropagation();
    zoomMapFromWheel(event);
  }, { passive: false });

  setBoardWidth(getMapZoom());
}

setupMapZoom();
