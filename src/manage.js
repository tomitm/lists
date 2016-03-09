import dragula from 'dragula';

function setupDragula() {
  var listContainer = document.querySelector('.GridTimeline-items');
  var options = {
    revertOnSpill: true
  };
  dragula([listContainer], options);
  listContainer.classList.add('drag-ready');
}

export function setupManage() {
  if (!window.location.pathname.endsWith('/lists')) {
    return;
  }
  setupDragula();
}
