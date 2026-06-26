const MAP_BASE_WIDTH = 1120;
const MAP_ZOOM_LEVELS = [1.15, 1.75, 2.6];
let mapZoomIndex = 0;
let isDraggingMap = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartScrollLeft = 0;
let dragStartScrollTop = 0;
let activeDragPointerId = null;

function getMapZoom() {
  return MAP_ZOOM_LEVELS[mapZoomIndex];
}

function getMapStage() {
  return document.querySelector('#map-stage') || document.querySelector('#board');
}

function setBoardWidth(zoom) {
  const stage = getMapStage();
  if (!stage) return;
  stage.style.width = `${Math.round(MAP_BASE_WIDTH * zoom)}px`;
  stage.dataset.zoom = String(zoom);
}

function applyMapZoomToPointer(nextZoom, pointerX, pointerY) {
  const boardWrap = document.querySelector('.board-wrap');
  const stage = getMapStage();
  if (!boardWrap || !stage) return;

  const previousZoom = Number(stage.dataset.zoom || getMapZoom());
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

function startMapDrag(event) {
  if (event.button !== 0) return;

  const boardWrap = document.querySelector('.board-wrap');
  if (!boardWrap) return;

  isDraggingMap = true;
  activeDragPointerId = event.pointerId;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragStartScrollLeft = boardWrap.scrollLeft;
  dragStartScrollTop = boardWrap.scrollTop;

  boardWrap.classList.add('is-dragging-map');
  boardWrap.setPointerCapture(event.pointerId);
  event.preventDefault();
  event.stopPropagation();
}

function moveMapDrag(event) {
  if (!isDraggingMap || event.pointerId !== activeDragPointerId) return;

  const boardWrap = document.querySelector('.board-wrap');
  if (!boardWrap) return;

  const deltaX = event.clientX - dragStartX;
  const deltaY = event.clientY - dragStartY;

  boardWrap.scrollLeft = dragStartScrollLeft - deltaX;
  boardWrap.scrollTop = dragStartScrollTop - deltaY;

  event.preventDefault();
  event.stopPropagation();
}

function endMapDrag(event) {
  if (!isDraggingMap || event.pointerId !== activeDragPointerId) return;

  const boardWrap = document.querySelector('.board-wrap');
  if (!boardWrap) return;

  isDraggingMap = false;
  activeDragPointerId = null;
  boardWrap.classList.remove('is-dragging-map');

  try {
    boardWrap.releasePointerCapture(event.pointerId);
  } catch (error) {
    // Pointer capture may already be released by the browser.
  }

  event.preventDefault();
  event.stopPropagation();
}

function setupMapZoom() {
  const boardWrap = document.querySelector('.board-wrap');
  if (!boardWrap) return;

  boardWrap.addEventListener('wheel', (event) => {
    event.preventDefault();
    event.stopPropagation();
    zoomMapFromWheel(event);
  }, { passive: false });

  boardWrap.addEventListener('pointerdown', startMapDrag);
  boardWrap.addEventListener('pointermove', moveMapDrag);
  boardWrap.addEventListener('pointerup', endMapDrag);
  boardWrap.addEventListener('pointercancel', endMapDrag);
  boardWrap.addEventListener('lostpointercapture', () => {
    isDraggingMap = false;
    activeDragPointerId = null;
    boardWrap.classList.remove('is-dragging-map');
  });

  setBoardWidth(getMapZoom());
}

setupMapZoom();
