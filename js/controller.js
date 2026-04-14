/* ─── controller.js — Initialisation + event delegation ────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Initial render ───────────────────────────────────────────────────────
  View.renderNav();
  View.renderClientRibbon(Model.getClients(), Model.getActiveClientSlug());
  View.renderBoard(Model.getFilteredTasks(), Model.getProjects(), STATUSES, STATUS_LABELS);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function refreshBoard() {
    View.renderBoard(Model.getFilteredTasks(), Model.getProjects(), STATUSES, STATUS_LABELS);
  }

  function refreshRibbon() {
    View.renderClientRibbon(Model.getClients(), Model.getActiveClientSlug());
  }

  function refreshDrawer(taskId) {
    const task = Model.getTaskById(taskId);
    if (!task) return;
    View.renderDrawer(task, Model.getClients(), Model.getTeam());
    View.openDrawer();
  }

  // ─── Ribbon ───────────────────────────────────────────────────────────────
  document.querySelector('.ribbon').addEventListener('click', e => {
    // Delete client
    const delBtn = e.target.closest('[data-action="delete-client"]');
    if (delBtn) {
      e.stopPropagation();
      const clientId = delBtn.dataset.clientId;
      const client   = Model.getClients().find(c => c.id === clientId);
      const projCount = Model.getProjects().filter(p => p.clientId === clientId).length;
      const taskCount = Model.getFilteredTasks().filter(t => t.clientId === clientId).length;
      View.showModal({
        title: 'Delete Client',
        bodyHTML: `
          <p class="modal-message">
            Delete <strong>${client.name}</strong>?
            This will permanently remove <strong>${projCount} project${projCount !== 1 ? 's' : ''}</strong>
            and <strong>${taskCount} task${taskCount !== 1 ? 's' : ''}</strong>.
          </p>
        `,
        confirmLabel: 'Delete Client',
        danger: true,
        onConfirm: () => {
          Model.deleteClient(clientId);
          refreshRibbon();
          refreshBoard();
          View.closeDrawer();
        }
      });
      return;
    }

    // Add client
    if (e.target.closest('[data-action="add-client"]')) {
      View.showModal({
        title: 'Add Client',
        bodyHTML: `
          <div class="modal-field">
            <label class="modal-label">Client Name</label>
            <input class="modal-input" name="name" type="text" placeholder="e.g. Loop Fitness" autofocus>
          </div>
          <div class="modal-field">
            <label class="modal-label">Brand Color</label>
            <div class="modal-color-row">
              <input class="modal-color-input" name="color" type="color" value="#4CAF50">
              <span class="modal-color-preview">Pick a color for the client dot</span>
            </div>
          </div>
        `,
        confirmLabel: 'Create Client',
        danger: false,
        onConfirm: ({ name, color }) => {
          if (!name.trim()) return;
          Model.addClient(name.trim(), color);
          refreshRibbon();
          refreshBoard();
        }
      });
      return;
    }

    // Switch client tab
    const tab = e.target.closest('.ribbon-tab');
    if (tab) {
      Model.setActiveClient(tab.dataset.slug || null);
      refreshRibbon();
      refreshBoard();
    }
  });

  // ─── Board ────────────────────────────────────────────────────────────────
  document.querySelector('.board').addEventListener('click', e => {
    // Add Task
    const addTaskBtn = e.target.closest('[data-action="add-task"]');
    if (addTaskBtn) {
      const projectId = addTaskBtn.dataset.projectId;
      const taskId    = Model.addTask(projectId);
      if (!taskId) return;
      // Make sure the project is open
      if (!Model.isProjectOpen(projectId)) {
        Model.toggleProject(projectId);
        View.toggleProjectSection(projectId, true);
      }
      refreshBoard();
      Model.setOpenTask(taskId);
      refreshDrawer(taskId);
      View.openDrawer();
      return;
    }

    // Delete Project
    const delProjectBtn = e.target.closest('[data-action="delete-project"]');
    if (delProjectBtn) {
      const projectId = delProjectBtn.dataset.projectId;
      const project   = Model.getProjects().find(p => p.id === projectId);
      const taskCount = Model.getFilteredTasks().filter(t => t.projectId === projectId).length;
      View.showModal({
        title: 'Delete Project',
        bodyHTML: `
          <p class="modal-message">
            Delete <strong>${project.name}</strong>?
            This will permanently remove <strong>${taskCount} task${taskCount !== 1 ? 's' : ''}</strong>.
          </p>
        `,
        confirmLabel: 'Delete Project',
        danger: true,
        onConfirm: () => {
          Model.deleteProject(projectId);
          refreshBoard();
          View.closeDrawer();
        }
      });
      return;
    }

    // Add Project (bottom button)
    if (e.target.closest('[data-action="add-project"]')) {
      const clients = Model.getClients();
      if (clients.length === 0) {
        View.showModal({
          title: 'No Clients',
          bodyHTML: '<p class="modal-message">Create a client first before adding a project.</p>',
          confirmLabel: 'OK',
          danger: false,
          onConfirm: () => {}
        });
        return;
      }
      const clientOptions = clients.map(c =>
        `<option value="${c.id}">${c.name}</option>`
      ).join('');
      View.showModal({
        title: 'Add Project',
        bodyHTML: `
          <div class="modal-field">
            <label class="modal-label">Project Name</label>
            <input class="modal-input" name="name" type="text" placeholder="e.g. YouTube Channel" autofocus>
          </div>
          <div class="modal-field">
            <label class="modal-label">Client</label>
            <select class="modal-select" name="clientId">${clientOptions}</select>
          </div>
        `,
        confirmLabel: 'Create Project',
        danger: false,
        onConfirm: ({ name, clientId }) => {
          if (!name.trim()) return;
          Model.addProject(name.trim(), clientId);
          refreshBoard();
        }
      });
      return;
    }

    // Toggle project accordion
    const header = e.target.closest('[data-action="toggle-project"]');
    if (header) {
      const pid = header.dataset.projectId;
      Model.toggleProject(pid);
      View.toggleProjectSection(pid, Model.isProjectOpen(pid));
      return;
    }

    // Open task card
    const card = e.target.closest('.card');
    if (card) {
      const id = card.dataset.taskId;
      if (!id) return;
      Model.setOpenTask(id);
      refreshDrawer(id);
    }
  });

  // ─── Overlay — close drawer ───────────────────────────────────────────────
  document.querySelector('.overlay').addEventListener('click', () => {
    Model.setOpenTask(null);
    View.closeDrawer();
  });

  // ─── Drawer — clicks ─────────────────────────────────────────────────────
  document.querySelector('.drawer').addEventListener('click', e => {
    // Close button
    if (e.target.dataset.action === 'close') {
      Model.setOpenTask(null);
      View.closeDrawer();
      return;
    }

    // Delete Task
    const delTaskBtn = e.target.closest('[data-action="delete-task"]');
    if (delTaskBtn) {
      const taskId = delTaskBtn.dataset.taskId;
      const task   = Model.getTaskById(taskId);
      View.showModal({
        title: 'Delete Task',
        bodyHTML: `<p class="modal-message">Delete <strong>${task.title}</strong>? This cannot be undone.</p>`,
        confirmLabel: 'Delete Task',
        danger: true,
        onConfirm: () => {
          Model.deleteTask(taskId);
          View.closeDrawer();
          refreshBoard();
        }
      });
    }
  });

  // ─── Drawer — change (selects) ────────────────────────────────────────────
  document.querySelector('.drawer').addEventListener('change', e => {
    const el     = e.target;
    const taskId = el.dataset.taskId;
    if (!taskId) return;

    if (el.dataset.action === 'status-change') {
      Model.updateTaskStatus(taskId, el.value);
      refreshBoard();
      refreshDrawer(taskId);
    }
    if (el.dataset.action === 'priority-change') {
      Model.updateTask(taskId, { priority: el.value });
      refreshBoard();
      refreshDrawer(taskId);
    }
    if (el.dataset.action === 'assignee-change') {
      Model.updateTask(taskId, { assigneeId: el.value });
      refreshBoard();
      refreshDrawer(taskId);
    }
    if (el.dataset.action === 'due-date-change') {
      Model.updateTask(taskId, { dueDate: el.value });
      refreshBoard();
    }
  });

  // ─── Drawer — focusout (title + description inline edit) ─────────────────
  document.querySelector('.drawer').addEventListener('focusout', e => {
    const el     = e.target;
    const taskId = el.dataset.taskId;
    if (!taskId) return;

    if (el.dataset.action === 'title-edit') {
      const newTitle = el.value.trim();
      if (newTitle) {
        Model.updateTask(taskId, { title: newTitle });
        refreshBoard();
      }
    }
    if (el.dataset.action === 'description-edit') {
      Model.updateTask(taskId, { description: el.value });
    }
  });

  // ─── Drawer — comment submit ──────────────────────────────────────────────
  document.querySelector('.drawer').addEventListener('submit', e => {
    if (!e.target.classList.contains('comment-form')) return;
    e.preventDefault();
    const taskId = e.target.dataset.taskId;
    const input  = e.target.querySelector('.comment-input');
    const body   = input.value.trim();
    if (!body) return;
    Model.addComment(taskId, 'You', body);
    input.value = '';
    View.renderComments(Model.getTaskById(taskId).comments, Model.getTeam());
  });

  // ─── Escape — close drawer ────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.querySelector('.modal-wrap.visible')) {
        View.hideModal();
      } else {
        Model.setOpenTask(null);
        View.closeDrawer();
      }
    }
  });
});
