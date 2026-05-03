/* ─── model.js — State, data, and pure functions ─────────────────────────────── */

const STATUSES = [
  'draft',
  'scoping',
  'ready_to_shoot',
  'ready_for_edit',
  'needs_review',
  'ready',
  'published'
];

const STATUS_LABELS = {
  draft:          'Draft',
  scoping:        'Scoping',
  ready_to_shoot: 'Ready to Shoot',
  ready_for_edit: 'Ready for Edit',
  needs_review:   'Needs Review',
  ready:          'Ready',
  published:      'Published'
};

// ─── Single source of truth ─────────────────────────────────────────────────
const state = {

  contentCategories: [],

  projects: [],

  tasks: [],

  clients: [],

  tasks: [],

  clients: [],

  team: [
    { id: 't1', name: 'Mathias',  initials: 'MK' },
    { id: 't2', name: 'Christian', initials: 'CM' },
    { id: 't3', name: 'Victor',   initials: 'VP' },
    { id: 't4', name: 'Nicolai',  initials: 'NB' }
  ],

  activeClient: null,
  openTaskId: null,
  openProjects: new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6']),
  openProjects: new Set()
};

// ─── Priority sort order ─────────────────────────────────────────────────────
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

// ─── Model API ───────────────────────────────────────────────────────────────
const Model = {

  getClients() {
    return state.clients;
  },

  getTeam() {
    return state.team;
  },

  getProjects() {
    if (!state.activeClient) return state.projects;
    const client = state.clients.find(c => c.slug === state.activeClient);
    if (!client) return state.projects;
    return state.projects.filter(p => p.clientId === client.id);
  },

  getFilteredTasks() {
    let tasks = state.tasks;
    if (state.activeClient) {
      const client = state.clients.find(c => c.slug === state.activeClient);
      if (client) tasks = tasks.filter(t => t.clientId === client.id);
    }
    return [...tasks].sort((a, b) => {
      if (a.status !== b.status) return 0;
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    });
  },

  getTaskById(id) {
    return state.tasks.find(t => t.id === id) || null;
  },

  setActiveClient(slug) {
    state.activeClient = slug || null;
  },

  setOpenTask(id) {
    state.openTaskId = id || null;
  },

  toggleProject(projectId) {
    if (state.openProjects.has(projectId)) {
      state.openProjects.delete(projectId);
    } else {
      state.openProjects.add(projectId);
    }
  },

  isProjectOpen(projectId) {
    return state.openProjects.has(projectId);
  },

  updateTask(id, patch) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    Object.assign(task, patch);
  },

  updateTaskStatus(id, newStatus) {
    if (STATUSES.includes(newStatus)) {
      this.updateTask(id, { status: newStatus });
    }
  },

  addComment(taskId, authorName, body) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.comments.push({
      id: 'cmt-' + Date.now(),
      authorId: 'you',
      authorName,
      body: body.trim(),
      timestamp: new Date().toISOString()
    });
  },

  // ─── Internal Notes ───────────────────────────────────────────────────────
  addInternalNote(taskId, authorName, body) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (!task.internalNotes) task.internalNotes = [];
    task.internalNotes.push({
      id: 'note-' + Date.now(),
      authorName,
      body: body.trim(),
      timestamp: new Date().toISOString()
    });
  },

  // ─── Attachments ──────────────────────────────────────────────────────────
  addAttachment(taskId, type, name, url) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return null;
    if (!task.attachments) task.attachments = [];
    const att = {
      id: 'att-' + Date.now(),
      type,   // 'link' | 'file'
      name,
      url,
      addedBy: 'You',
      timestamp: new Date().toISOString()
    };
    task.attachments.push(att);
    return att.id;
  },

  removeAttachment(taskId, attachmentId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.attachments = (task.attachments || []).filter(a => a.id !== attachmentId);
  },

  // ─── Content Categories ───────────────────────────────────────────────────
  getContentCategories() {
    return state.contentCategories;
  },

  addContentCategory(label) {
    const value = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const id = 'cat-' + Date.now();
    state.contentCategories.push({ id, value, label: label.trim() });
    return value;
  },

  deleteContentCategory(id) {
    state.contentCategories = state.contentCategories.filter(c => c.id !== id);
  },

  // ─── Close Project ────────────────────────────────────────────────────────
  canCloseProject(projectId) {
    const tasks = state.tasks.filter(t => t.projectId === projectId);
    if (tasks.length === 0) return false;
    return tasks.every(t => t.status === 'published');
  },

  closeProject(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project || !this.canCloseProject(projectId)) return false;
    project.closed = true;
    return true;
  },

  reopenProject(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (project) project.closed = false;
  },

  isProjectClosed(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    return project ? !!project.closed : false;
  },

  // ─── Client CRUD ──────────────────────────────────────────────────────────
  addClient(name, color) {
    const id   = 'c' + Date.now();
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    state.clients.push({ id, name, slug, color });
    return id;
  },

  deleteClient(clientId) {
    const projectIds = state.projects
      .filter(p => p.clientId === clientId)
      .map(p => p.id);
    state.tasks    = state.tasks.filter(t => !projectIds.includes(t.projectId));
    state.projects = state.projects.filter(p => p.clientId !== clientId);
    state.clients  = state.clients.filter(c => c.id !== clientId);
    if (state.activeClient) {
      const still = state.clients.find(c => c.slug === state.activeClient);
      if (!still) state.activeClient = null;
    }
  },

  // ─── Project CRUD ─────────────────────────────────────────────────────────
  addProject(name, clientId) {
    const id = 'p' + Date.now();
    state.projects.push({ id, name, clientId, closed: false });
    state.openProjects.add(id);
    return id;
  },

  deleteProject(projectId) {
    state.tasks    = state.tasks.filter(t => t.projectId !== projectId);
    state.projects = state.projects.filter(p => p.id !== projectId);
    state.openProjects.delete(projectId);
  },

  // ─── Task CRUD ────────────────────────────────────────────────────────────
  addTask(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project) return null;
    const id = 'task-' + Date.now();
    const defaultCat = state.contentCategories[0];
    const task = {
      id,
      title: 'New Task',
      status: 'draft',
      priority: 'medium',
      contentTag: defaultCat ? defaultCat.value : 'reel',
      clientId: project.clientId,
      projectId,
      assigneeId: state.team[0].id,
      dueDate: '',
      description: '',
      comments: [],
      internalNotes: [],
      attachments: []
    };
    state.tasks.push(task);
    return id;
  },

  deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    if (state.openTaskId === taskId) state.openTaskId = null;
  },

  getActiveClientSlug() {
    return state.activeClient;
  },

  getOpenTaskId() {
    return state.openTaskId;
  }
};
