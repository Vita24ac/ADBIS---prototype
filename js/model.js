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

  projects: [
    { id: 'p1', name: 'YouTube Channel',   clientId: 'c1' },
    { id: 'p2', name: 'Instagram Growth',  clientId: 'c1' },
    { id: 'p3', name: 'Webinar Series',    clientId: 'c2' },
    { id: 'p4', name: 'Lead Gen Campaign', clientId: 'c2' },
    { id: 'p5', name: 'Brand Awareness',   clientId: 'c3' },
    { id: 'p6', name: 'Donation Drive',    clientId: 'c3' }
  ],

  tasks: [
    {
      id: 'task-01',
      title: 'Loop Fitness January Reel — Gym Transformation Story',
      status: 'draft',
      priority: 'high',
      contentTag: 'reel',
      clientId: 'c1',
      projectId: 'p2',
      assigneeId: 't1',
      dueDate: '2026-04-18',
      description: 'Create a compelling before/after gym transformation reel for Loop Fitness January campaign. Focus on emotional hook in first 3 seconds.',
      comments: [
        {
          id: 'cmt-01a',
          authorId: 't2',
          authorName: 'Christian',
          body: 'Mathias — can you send me the raw footage from last Tuesday? Need to review before scripting.',
          timestamp: '2026-04-10T09:14:00Z'
        },
        {
          id: 'cmt-01b',
          authorId: 't1',
          authorName: 'Mathias',
          body: 'Uploaded to shared drive. Folder is called /Loop-Jan-Raw. Let me know if access issues.',
          timestamp: '2026-04-10T11:32:00Z'
        }
      ]
    },
    {
      id: 'task-02',
      title: 'Innovator Circle — Welcome Email Sequence Blog Post',
      status: 'draft',
      priority: 'medium',
      contentTag: 'blog_post',
      clientId: 'c2',
      projectId: 'p3',
      assigneeId: 't3',
      dueDate: '2026-04-22',
      description: 'Write a 800-word blog post introducing new Innovator Circle members to the community values and expectations.',
      comments: []
    },
    {
      id: 'task-03',
      title: 'Cares — Q2 Ad Creative Set (Static)',
      status: 'draft',
      priority: 'low',
      contentTag: 'ad_creative',
      clientId: 'c3',
      projectId: 'p5',
      assigneeId: 't4',
      dueDate: '2026-04-25',
      description: 'Design 3 static ad creatives for Cares Q2 campaign. Sizes: 1080x1080, 1080x1920, 1200x628.',
      comments: []
    },
    {
      id: 'task-04',
      title: 'Loop Fitness — YouTube Channel Strategy Video',
      status: 'scoping',
      priority: 'high',
      contentTag: 'youtube_video',
      clientId: 'c1',
      projectId: 'p1',
      assigneeId: 't2',
      dueDate: '2026-04-20',
      description: 'Full production YouTube video covering Loop Fitness\'s new training methodology. 8-12 minutes. Script, shoot, and edit.',
      comments: [
        {
          id: 'cmt-04a',
          authorId: 't3',
          authorName: 'Victor',
          body: 'I\'ve drafted the script outline — three acts: Problem, Method, Results. Want to review it before we book the studio?',
          timestamp: '2026-04-09T14:20:00Z'
        },
        {
          id: 'cmt-04b',
          authorId: 't2',
          authorName: 'Christian',
          body: 'Yes, share the doc. Also we need to confirm the studio booking by Friday or we lose the slot.',
          timestamp: '2026-04-09T15:45:00Z'
        }
      ]
    },
    {
      id: 'task-05',
      title: 'Innovator Circle — Member Spotlight Story Series',
      status: 'scoping',
      priority: 'medium',
      contentTag: 'story',
      clientId: 'c2',
      projectId: 'p3',
      assigneeId: 't1',
      dueDate: '2026-04-24',
      description: 'Plan and produce a 5-part Instagram story series featuring IC member success stories. Needs interview questions and visual template.',
      comments: []
    },
    {
      id: 'task-06',
      title: 'Cares — YouTube Short: "Why Cares Exists"',
      status: 'ready_to_shoot',
      priority: 'high',
      contentTag: 'youtube_short',
      clientId: 'c3',
      projectId: 'p5',
      assigneeId: 't3',
      dueDate: '2026-04-16',
      description: 'Short-form YouTube video (60s max) explaining Cares\' mission. Needs founder on camera. Script approved. Studio booked for Thursday.',
      comments: []
    },
    {
      id: 'task-07',
      title: 'Loop Fitness — Static Post: New Class Schedule Launch',
      status: 'ready_to_shoot',
      priority: 'medium',
      contentTag: 'static_post',
      clientId: 'c1',
      projectId: 'p2',
      assigneeId: 't4',
      dueDate: '2026-04-17',
      description: 'Design and shoot product-style static post announcing Loop\'s new class schedule. Brand colors. Gym backdrop.',
      comments: []
    },
    {
      id: 'task-08',
      title: 'Innovator Circle — Founder Interview Reel',
      status: 'ready_for_edit',
      priority: 'low',
      contentTag: 'reel',
      clientId: 'c2',
      projectId: 'p4',
      assigneeId: 't2',
      dueDate: '2026-04-19',
      description: 'Raw footage is in. Edit a 60s reel from 40min founder interview. Hook: first answer about failure. Use IC brand overlay.',
      comments: []
    },
    {
      id: 'task-09',
      title: 'Cares — Blog Post: "5 Ways to Get Involved"',
      status: 'ready_for_edit',
      priority: 'medium',
      contentTag: 'blog_post',
      clientId: 'c3',
      projectId: 'p6',
      assigneeId: 't1',
      dueDate: '2026-04-21',
      description: 'SEO-optimised blog post targeting "how to volunteer in Denmark". 600 words. Draft written. Now needs final editing pass.',
      comments: []
    },
    {
      id: 'task-10',
      title: 'Loop Fitness — YouTube Short: Morning Routine',
      status: 'needs_review',
      priority: 'medium',
      contentTag: 'youtube_short',
      clientId: 'c1',
      projectId: 'p1',
      assigneeId: 't3',
      dueDate: '2026-04-15',
      description: 'Edit complete. Waiting for client review. Video shows 5am morning routine at Loop gym. Music licensed via Epidemic Sound.',
      comments: []
    },
    {
      id: 'task-11',
      title: 'Innovator Circle — Ad Creative: Q2 Lead Gen',
      status: 'needs_review',
      priority: 'high',
      contentTag: 'ad_creative',
      clientId: 'c2',
      projectId: 'p4',
      assigneeId: 't4',
      dueDate: '2026-04-14',
      description: 'Three ad variants for IC Q2 lead gen campaign. All designed. Needs approval from Mathias + IC contact before going live.',
      comments: []
    },
    {
      id: 'task-12',
      title: 'Cares — Instagram Story: Donation Drive',
      status: 'ready',
      priority: 'low',
      contentTag: 'story',
      clientId: 'c3',
      projectId: 'p6',
      assigneeId: 't2',
      dueDate: '2026-04-16',
      description: 'Story sequence ready for publish. 7 slides. Link sticker to donation page. Schedule for 11am Friday.',
      comments: []
    },
    {
      id: 'task-13',
      title: 'Loop Fitness — Static Post: Member of the Month',
      status: 'ready',
      priority: 'low',
      contentTag: 'static_post',
      clientId: 'c1',
      projectId: 'p2',
      assigneeId: 't1',
      dueDate: '2026-04-15',
      description: 'Member of the month post featuring Charles Alaocha. Photo edited. Caption written. Approved by client. Schedule for Thursday 12pm.',
      comments: []
    },
    {
      id: 'task-14',
      title: 'Innovator Circle — Welcome Reel for New Cohort',
      status: 'published',
      priority: 'low',
      contentTag: 'reel',
      clientId: 'c2',
      projectId: 'p3',
      assigneeId: 't3',
      dueDate: '2026-04-10',
      description: 'Published April 10. Welcome reel for the new IC cohort. Reached 4,200 views in 48h. Client happy.',
      comments: []
    },
    {
      id: 'task-15',
      title: 'Cares — YouTube Video: Annual Impact Report 2025',
      status: 'published',
      priority: 'medium',
      contentTag: 'youtube_video',
      clientId: 'c3',
      projectId: 'p5',
      assigneeId: 't4',
      dueDate: '2026-04-08',
      description: 'Published April 8. 12-minute documentary-style recap of Cares\' 2025 impact. 1,800 views. Strong watch time (68%).',
      comments: []
    }
  ],

  clients: [
    { id: 'c1', name: 'Loop Fitness',     slug: 'loop-fitness',     color: '#4CAF50' },
    { id: 'c2', name: 'Innovator Circle', slug: 'innovator-circle', color: '#9C6ADE' },
    { id: 'c3', name: 'Cares',            slug: 'cares',            color: '#E8734A' }
  ],

  team: [
    { id: 't1', name: 'Mathias',  initials: 'MK' },
    { id: 't2', name: 'Christian', initials: 'CM' },
    { id: 't3', name: 'Victor',   initials: 'VP' },
    { id: 't4', name: 'Nicolai',  initials: 'NB' }
  ],

  activeClient: null,
  openTaskId: null,
  // All projects open by default
  openProjects: new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6'])
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

  // Returns projects filtered by active client
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

  // Generic task update — pass any fields to patch
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

  // ─── Client CRUD ─────────────────────────────────────────────────────────
  addClient(name, color) {
    const id   = 'c' + Date.now();
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    state.clients.push({ id, name, slug, color });
    return id;
  },

  deleteClient(clientId) {
    // Remove all tasks belonging to this client's projects
    const projectIds = state.projects
      .filter(p => p.clientId === clientId)
      .map(p => p.id);
    state.tasks    = state.tasks.filter(t => !projectIds.includes(t.projectId));
    state.projects = state.projects.filter(p => p.clientId !== clientId);
    state.clients  = state.clients.filter(c => c.id !== clientId);
    // If the active client was deleted, reset filter
    if (state.activeClient) {
      const still = state.clients.find(c => c.slug === state.activeClient);
      if (!still) state.activeClient = null;
    }
  },

  // ─── Project CRUD ─────────────────────────────────────────────────────────
  addProject(name, clientId) {
    const id = 'p' + Date.now();
    state.projects.push({ id, name, clientId });
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
    const task = {
      id,
      title: 'New Task',
      status: 'draft',
      priority: 'medium',
      contentTag: 'reel',
      clientId: project.clientId,
      projectId,
      assigneeId: state.team[0].id,
      dueDate: '',
      description: '',
      comments: []
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
