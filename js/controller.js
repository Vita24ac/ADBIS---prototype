/* ─── controller.js — Initialisation + event delegation ────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Initial render ───────────────────────────────────────────────────────
  View.renderNav();
  View.renderClientRibbon(Model.getClients(), Model.getActiveClientSlug());
  View.renderBoard(Model.getFilteredTasks(), STATUSES, STATUS_LABELS);

  // ─── Helper: re-render board keeping current filter ───────────────────────
  function refreshBoard() {
    View.renderBoard(Model.getFilteredTasks(), STATUSES, STATUS_LABELS);
  }

  // ─── Client Ribbon — tab clicks ───────────────────────────────────────────
  document.querySelector('.ribbon').addEventListener('click', e => {
    const tab = e.target.closest('.ribbon-tab');
    if (!tab) return;
    const slug = tab.dataset.slug || null;
    Model.setActiveClient(slug);
    View.renderClientRibbon(Model.getClients(), Model.getActiveClientSlug());
    refreshBoard();
  });

  // ─── Board — card clicks ──────────────────────────────────────────────────
  document.querySelector('.board').addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const id = card.dataset.taskId;
    if (!id) return;
    Model.setOpenTask(id);
    const task = Model.getTaskById(id);
    View.renderDrawer(task, Model.getClients(), Model.getTeam());
    View.openDrawer();
  });

  // ─── Overlay click — close drawer ────────────────────────────────────────
  document.querySelector('.overlay').addEventListener('click', () => {
    Model.setOpenTask(null);
    View.closeDrawer();
  });

  // ─── Drawer — delegated events (close btn, status change, comment submit) ─
  document.querySelector('.drawer').addEventListener('click', e => {
    // Close button
    if (e.target.dataset.action === 'close') {
      Model.setOpenTask(null);
      View.closeDrawer();
    }
  });

  document.querySelector('.drawer').addEventListener('change', e => {
    // Status dropdown
    if (e.target.dataset.action === 'status-change') {
      const taskId = e.target.dataset.taskId;
      const newStatus = e.target.value;
      Model.updateTaskStatus(taskId, newStatus);
      refreshBoard();
      // Keep drawer open with updated task data
      const updatedTask = Model.getTaskById(taskId);
      View.renderDrawer(updatedTask, Model.getClients(), Model.getTeam());
      View.openDrawer();
    }
  });

  document.querySelector('.drawer').addEventListener('submit', e => {
    // Comment form
    if (e.target.classList.contains('comment-form')) {
      e.preventDefault();
      const taskId = e.target.dataset.taskId;
      const input = e.target.querySelector('.comment-input');
      const body = input.value.trim();
      if (!body) return;
      Model.addComment(taskId, 'You', body);
      input.value = '';
      const task = Model.getTaskById(taskId);
      View.renderComments(task.comments, Model.getTeam());
    }
  });

  // ─── Keyboard: Escape closes drawer ──────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      Model.setOpenTask(null);
      View.closeDrawer();
    }
  });
});
