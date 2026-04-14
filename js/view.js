/* ─── view.js — DOM rendering, no state reads ───────────────────────────────── */

const View = (() => {

  // ─── DOM refs ──────────────────────────────────────────────────────────────
  const $nav      = document.querySelector('.nav');
  const $ribbon   = document.querySelector('.ribbon');
  const $board    = document.querySelector('.board');
  const $drawer   = document.querySelector('.drawer');
  const $overlay  = document.querySelector('.overlay');

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function assigneeClass(assigneeId) {
    const map = { t1: 'assignee-t1', t2: 'assignee-t2', t3: 'assignee-t3', t4: 'assignee-t4', you: 'assignee-you' };
    return map[assigneeId] || 'assignee-t1';
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  function isOverdue(iso) {
    if (!iso) return false;
    return new Date(iso) < new Date();
  }

  function formatTimestamp(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  function contentTagLabel(tag) {
    const map = {
      reel:          'Reel',
      youtube_video: 'YT Video',
      youtube_short: 'YT Short',
      story:         'Story',
      static_post:   'Static',
      blog_post:     'Blog',
      ad_creative:   'Ad'
    };
    return map[tag] || tag;
  }

  // ─── renderNav ─────────────────────────────────────────────────────────────
  function renderNav() {
    $nav.innerHTML = `
      <span class="nav-logo">
        House <span class="logo-of">of</span> Leap
      </span>
      <div class="nav-right">
        <span class="nav-gear" title="Settings">⚙</span>
        <div class="nav-avatar assignee-t3" title="Victor Prager">VP</div>
      </div>
    `;
  }

  // ─── renderClientRibbon ────────────────────────────────────────────────────
  function renderClientRibbon(clients, activeSlug) {
    const allTab = `
      <button class="ribbon-tab ${activeSlug === null ? 'active' : ''}" data-slug="">
        All Clients
      </button>
    `;
    const clientTabs = clients.map(c => `
      <button class="ribbon-tab ${activeSlug === c.slug ? 'active' : ''}" data-slug="${c.slug}">
        <span class="client-dot" style="background:${c.color}"></span>
        ${c.name}
      </button>
    `).join('');

    $ribbon.innerHTML = allTab + clientTabs;
  }

  // ─── renderBoard ───────────────────────────────────────────────────────────
  function renderBoard(tasks, statuses, statusLabels) {
    $board.innerHTML = '';
    statuses.forEach(status => {
      const colTasks = tasks.filter(t => t.status === status);
      const col = renderColumn(status, statusLabels[status], colTasks);
      $board.appendChild(col);
    });
  }

  // ─── renderColumn ──────────────────────────────────────────────────────────
  function renderColumn(status, label, tasks) {
    const col = document.createElement('div');
    col.className = 'column';
    col.dataset.status = status;

    const header = document.createElement('div');
    header.className = 'column-header';
    header.innerHTML = `
      <span class="column-title">${label}</span>
      <span class="column-count">${tasks.length}</span>
    `;

    const cards = document.createElement('div');
    cards.className = 'column-cards';

    tasks.forEach(task => {
      const client   = Model.getClients().find(c => c.id === task.clientId);
      const assignee = Model.getTeam().find(m => m.id === task.assigneeId);
      cards.appendChild(renderCard(task, client, assignee));
    });

    col.appendChild(header);
    col.appendChild(cards);
    return col;
  }

  // ─── renderCard ────────────────────────────────────────────────────────────
  function renderCard(task, client, assignee) {
    const card = document.createElement('div');
    card.className = `card priority-${task.priority}`;
    card.dataset.taskId = task.id;

    const prioritySymbol = task.priority === 'high' ? '★' : task.priority === 'medium' ? '◆' : '○';
    const badgeClass = `badge-${task.priority}`;
    const overdueCls = isOverdue(task.dueDate) && task.status !== 'published' ? ' overdue' : '';
    const clientBg = client ? client.color : '#555';
    const clientName = client ? client.name : '—';
    const assigneeInitials = assignee ? assignee.initials : '?';
    const assigneeAvatarCls = assigneeClass(task.assigneeId);

    card.innerHTML = `
      <div class="card-top-row">
        <span class="card-client-tag" style="background:${clientBg}">${clientName}</span>
        <span class="card-priority-badge ${badgeClass}">${prioritySymbol}</span>
      </div>
      <div class="card-title">${task.title}</div>
      <div class="card-meta">
        <span class="card-content-tag tag">${contentTagLabel(task.contentTag)}</span>
      </div>
      <div class="card-footer">
        <div class="card-assignee ${assigneeAvatarCls}">${assigneeInitials}</div>
        <span class="card-due${overdueCls}">${formatDate(task.dueDate)}</span>
      </div>
    `;

    return card;
  }

  // ─── renderDrawer ──────────────────────────────────────────────────────────
  function renderDrawer(task, clients, team) {
    const client   = clients.find(c => c.id === task.clientId);
    const assignee = team.find(m => m.id === task.assigneeId);
    const clientBg = client ? client.color : '#555';
    const clientName = client ? client.name : '—';
    const assigneeInitials = assignee ? assignee.initials : '?';
    const assigneeAvatarCls = assigneeClass(task.assigneeId);
    const assigneeName = assignee ? assignee.name : 'Unassigned';

    const statusOptions = STATUSES.map(s =>
      `<option value="${s}" ${task.status === s ? 'selected' : ''}>${STATUS_LABELS[s]}</option>`
    ).join('');

    $drawer.innerHTML = `
      <div class="drawer-header">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span class="card-client-tag tag" style="background:${clientBg};font-size:11px;padding:2px 8px;border-radius:4px;color:#0d1a0d;">${clientName}</span>
            <span class="card-content-tag tag">${contentTagLabel(task.contentTag)}</span>
          </div>
          <h2 class="drawer-title">${task.title}</h2>
        </div>
        <button class="drawer-close" data-action="close">✕</button>
      </div>
      <div class="drawer-body">
        <div class="drawer-meta-grid">
          <div class="drawer-field">
            <label class="drawer-label">Status</label>
            <select class="drawer-select" data-action="status-change" data-task-id="${task.id}">
              ${statusOptions}
            </select>
          </div>
          <div class="drawer-field">
            <label class="drawer-label">Assignee</label>
            <div class="drawer-assignee-display">
              <div class="drawer-assignee-avatar ${assigneeAvatarCls}">${assigneeInitials}</div>
              <span class="drawer-assignee-name">${assigneeName}</span>
            </div>
          </div>
        </div>

        <div class="drawer-field">
          <label class="drawer-label">Due Date</label>
          <div style="font-size:14px;color:var(--text-secondary);padding:8px 12px;background:var(--bg-secondary);border:1px solid var(--border-strong);border-radius:6px;">
            ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'long', year:'numeric' }) : 'Not set'}
          </div>
        </div>

        <div class="drawer-field">
          <label class="drawer-label">Description</label>
          <div class="drawer-textarea" style="resize:none;cursor:default;min-height:auto;">${task.description || 'No description.'}</div>
        </div>

        <div class="drawer-divider"></div>

        <div class="drawer-section-title">Comments</div>
        <div class="comment-list" id="comment-list">
          <!-- comments rendered here -->
        </div>

        <form class="comment-form" data-task-id="${task.id}">
          <textarea class="comment-input" placeholder="Add a comment…" rows="3"></textarea>
          <button type="submit" class="comment-submit">Post Comment</button>
        </form>
      </div>
    `;

    // Render comments into the list
    renderComments(task.comments, team);
  }

  // ─── renderComments ────────────────────────────────────────────────────────
  function renderComments(comments, team) {
    const $list = document.getElementById('comment-list');
    if (!$list) return;

    if (!comments || comments.length === 0) {
      $list.innerHTML = '<p class="comment-empty">No comments yet.</p>';
      return;
    }

    $list.innerHTML = comments.map(c => {
      const member = team.find(m => m.id === c.authorId);
      const initials = member ? member.initials : c.authorName.substring(0, 2).toUpperCase();
      const avatarCls = assigneeClass(c.authorId);
      return `
        <div class="comment-item">
          <div class="comment-avatar ${avatarCls}">${initials}</div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">${c.authorName}</span>
              <span class="comment-time">${formatTimestamp(c.timestamp)}</span>
            </div>
            <div class="comment-body">${c.body}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ─── Drawer open / close ───────────────────────────────────────────────────
  function openDrawer() {
    $drawer.classList.add('open');
    $overlay.classList.add('visible');
  }

  function closeDrawer() {
    $drawer.classList.remove('open');
    $overlay.classList.remove('visible');
  }

  // ─── Public API ────────────────────────────────────────────────────────────
  return {
    renderNav,
    renderClientRibbon,
    renderBoard,
    renderColumn,
    renderCard,
    renderDrawer,
    openDrawer,
    closeDrawer,
    renderComments
  };
})();
