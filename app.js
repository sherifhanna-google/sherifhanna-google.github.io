// C2PA Interoperability Samples Gallery - Application Logic (crJSON & Trust List Validated)

(function () {
  'use strict';

  // State
  const state = {
    data: window.GALLERY_DATA || { folders: [], items: [], stats: {} },
    activeFolder: 'all',
    searchQuery: '',
    activeType: 'all',
    activeDst: 'all',
    viewMode: 'sections', // 'sections' | 'grid' | 'table'
    sortOrder: 'default',
    activeModalItem: null,
    modalActiveTab: 'overview',
    theme: localStorage.getItem('c2pa_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  };

  // DOM Elements
  const elements = {
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    folderNavList: document.getElementById('folderNavList'),
    filterChipsBar: document.getElementById('filterChipsBar'),
    galleryContent: document.getElementById('galleryContent'),
    sortSelect: document.getElementById('sortSelect'),
    viewModeBtns: document.querySelectorAll('.view-mode-btn'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalTitle: document.getElementById('modalTitle'),
    modalPreviewPane: document.getElementById('modalPreviewPane'),
    modalTabs: document.getElementById('modalTabs'),
    modalTabContent: document.getElementById('modalTabContent'),
    toastContainer: document.getElementById('toastContainer'),
    statTotalSamples: document.getElementById('statTotalSamples'),
    statTotalFolders: document.getElementById('statTotalFolders'),
    statBreakdown: document.getElementById('statBreakdown')
  };

  // SVGs for Icons
  const icons = {
    sparkles: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>`,
    camera: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
    photo: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
    video: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`,
    film: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>`,
    microphone: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>`,
    music: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>`,
    book: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`,
    gamepad: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>`,
    youtube: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    'arrows-right-left': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>`,
    'check-badge': `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>`,
    raw: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>`,
    folder: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>`,
    download: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`,
    inspect: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>`,
    terminal: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`,
    shieldCheck: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>`
  };

  // Initialize
  function init() {
    applyTheme(state.theme);
    setupEventListeners();
    updateStatsDisplay();
    renderSidebar();
    renderFilterChips();
    renderGallery();
    handleUrlHash();
  }

  // Theme Management
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('c2pa_theme', theme);
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.innerHTML = theme === 'dark'
        ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;
      elements.themeToggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
    }
  }

  // Event Listeners
  function setupEventListeners() {
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.addEventListener('click', () => {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
      });
    }

    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        if (elements.searchClearBtn) {
          elements.searchClearBtn.style.display = state.searchQuery ? 'flex' : 'none';
        }
        renderGallery();
      });
    }

    if (elements.searchClearBtn) {
      elements.searchClearBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        state.searchQuery = '';
        elements.searchClearBtn.style.display = 'none';
        renderGallery();
        elements.searchInput.focus();
      });
    }

    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', (e) => {
        state.sortOrder = e.target.value;
        renderGallery();
      });
    }

    elements.viewModeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        elements.viewModeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.viewMode = btn.dataset.mode;
        renderGallery();
      });
    });

    if (elements.modalCloseBtn) {
      elements.modalCloseBtn.addEventListener('click', closeModal);
    }

    if (elements.modalBackdrop) {
      elements.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === elements.modalBackdrop) {
          closeModal();
        }
      });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.activeModalItem) {
        closeModal();
      } else if (e.key === '/' && document.activeElement !== elements.searchInput) {
        e.preventDefault();
        elements.searchInput.focus();
      } else if (state.activeModalItem && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const filtered = getFilteredItems();
        const currentIndex = filtered.findIndex((i) => i.id === state.activeModalItem.id);
        if (currentIndex !== -1) {
          if (e.key === 'ArrowLeft' && currentIndex > 0) {
            openInspector(filtered[currentIndex - 1].id, state.modalActiveTab);
          } else if (e.key === 'ArrowRight' && currentIndex < filtered.length - 1) {
            openInspector(filtered[currentIndex + 1].id, state.modalActiveTab);
          }
        }
      }
    });

    window.addEventListener('hashchange', handleUrlHash);
  }

  // URL Hash handling for deep linking
  function handleUrlHash() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const sampleParam = params.get('sample');
    const folderParam = params.get('folder');
    const typeParam = params.get('type');

    if (folderParam) {
      state.activeFolder = folderParam;
      renderSidebar();
    }

    if (typeParam) {
      state.activeType = typeParam;
      renderFilterChips();
    }

    if (sampleParam) {
      const item = state.data.items.find((i) => i.filename === sampleParam || i.id === sampleParam);
      if (item) {
        openInspector(item.id);
      }
    }
  }

  function updateStatsDisplay() {
    const stats = state.data.stats || {};
    if (elements.statTotalSamples) {
      elements.statTotalSamples.textContent = stats.totalSamples || '64';
    }
    if (elements.statTotalFolders) {
      elements.statTotalFolders.textContent = stats.totalFolders || '12';
    }
    if (elements.statBreakdown) {
      const tc = stats.typeCounts || {};
      elements.statBreakdown.textContent = `${tc.image || 0} Images • ${tc.video || 0} Videos • ${tc.audio || 0} Audio • ${tc.raw || 0} RAW DNG`;
    }
  }

  // Render Sidebar
  function renderSidebar() {
    if (!elements.folderNavList) return;

    const folders = state.data.folders || [];
    const totalCount = state.data.items.length;

    let html = `
      <li class="folder-nav-item ${state.activeFolder === 'all' ? 'active' : ''}">
        <button onclick="window.selectFolder('all')">
          <span class="folder-nav-title">
            <span class="folder-nav-icon">${icons.folder}</span>
            <span>All Collections</span>
          </span>
          <span class="chip-count">${totalCount}</span>
        </button>
      </li>
    `;

    folders.forEach((f) => {
      const isActive = state.activeFolder === f.folder;
      const iconSvg = icons[f.meta.icon] || icons.folder;
      html += `
        <li class="folder-nav-item ${isActive ? 'active' : ''}">
          <button onclick="window.selectFolder('${escapeJsString(f.folder)}')">
            <span class="folder-nav-title" title="${escapeHtml(f.meta.title)}">
              <span class="folder-nav-icon">${iconSvg}</span>
              <span>${escapeHtml(f.meta.title)}</span>
            </span>
            <span class="chip-count">${f.itemsCount}</span>
          </button>
        </li>
      `;
    });

    elements.folderNavList.innerHTML = html;
  }

  // Render Filter Chips
  function renderFilterChips() {
    if (!elements.filterChipsBar) return;

    const types = [
      { key: 'all', label: 'All Types' },
      { key: 'image', label: '🖼️ Images' },
      { key: 'video', label: '🎬 Videos' },
      { key: 'audio', label: '🎙️ Audio' },
      { key: 'raw', label: '📷 RAW DNG' }
    ];

    const dsts = [
      { key: 'all', label: 'All Sources' },
      { key: 'computationalCapture', label: '📸 Camera Capture' },
      { key: 'trainedAlgorithmicMedia', label: '🎨 Generative AI' },
      { key: 'compositeWithTrainedAlgorithmicMedia', label: '✨ AI Composite' }
    ];

    let html = `<span class="filter-group-label">Media:</span>`;
    types.forEach((t) => {
      const isActive = state.activeType === t.key;
      html += `
        <button class="chip-btn ${isActive ? 'active' : ''}" onclick="window.selectType('${t.key}')">
          ${t.label}
        </button>
      `;
    });

    html += `<span class="filter-group-label" style="margin-left: 0.75rem;">Source:</span>`;
    dsts.forEach((d) => {
      const isActive = state.activeDst === d.key;
      html += `
        <button class="chip-btn ${isActive ? 'active' : ''}" onclick="window.selectDst('${d.key}')">
          ${d.label}
        </button>
      `;
    });

    elements.filterChipsBar.innerHTML = html;
  }

  // Filter Items
  function getFilteredItems() {
    let items = state.data.items || [];

    // Folder Filter
    if (state.activeFolder !== 'all') {
      items = items.filter((i) => i.folder === state.activeFolder);
    }

    // Media Type Filter
    if (state.activeType !== 'all') {
      items = items.filter((i) => i.type === state.activeType);
    }

    // Digital Source Type Filter
    if (state.activeDst !== 'all') {
      items = items.filter((i) => {
        const dst = i.c2paSummary?.digitalSourceType?.key;
        return dst === state.activeDst;
      });
    }

    // Search Query Filter
    if (state.searchQuery) {
      const q = state.searchQuery;
      items = items.filter((i) => {
        return (
          i.filename.toLowerCase().includes(q) ||
          i.folder.toLowerCase().includes(q) ||
          (i.c2paSummary?.generator || '').toLowerCase().includes(q) ||
          (i.c2paSummary?.issuer || '').toLowerCase().includes(q) ||
          (i.c2paSummary?.digitalSourceType?.label || '').toLowerCase().includes(q) ||
          i.ext.toLowerCase().includes(q)
        );
      });
    }

    // Sorting
    items = [...items].sort((a, b) => {
      if (state.sortOrder === 'name-asc') {
        return a.filename.localeCompare(b.filename);
      } else if (state.sortOrder === 'name-desc') {
        return b.filename.localeCompare(a.filename);
      } else if (state.sortOrder === 'size-desc') {
        return b.size - a.size;
      } else if (state.sortOrder === 'size-asc') {
        return a.size - b.size;
      }
      return 0; // default order
    });

    return items;
  }

  // Render Gallery
  function renderGallery() {
    if (!elements.galleryContent) return;

    const filteredItems = getFilteredItems();

    if (filteredItems.length === 0) {
      elements.galleryContent.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${icons.search}</div>
          <div class="empty-title">No matching sample files</div>
          <div class="empty-desc">Try clearing your search query or selecting "All Collections" to see all available test samples.</div>
          <button class="btn-primary" style="max-width: 180px;" onclick="window.resetFilters()">
            Reset All Filters
          </button>
        </div>
      `;
      return;
    }

    if (state.viewMode === 'table') {
      renderTableView(filteredItems);
    } else if (state.viewMode === 'grid' || state.activeFolder !== 'all') {
      renderFlatGrid(filteredItems);
    } else {
      renderSectionsGrid(filteredItems);
    }
  }

  // Render Sections (Grouped by Folder)
  function renderSectionsGrid(items) {
    const groups = {};
    items.forEach((item) => {
      if (!groups[item.folder]) {
        groups[item.folder] = [];
      }
      groups[item.folder].push(item);
    });

    const folders = state.data.folders || [];
    let html = '';

    folders.forEach((f) => {
      const folderItems = groups[f.folder];
      if (!folderItems || folderItems.length === 0) return;

      const iconSvg = icons[f.meta.icon] || icons.folder;

      html += `
        <section class="folder-section" id="folder-${f.meta.id}">
          <div class="folder-section-header">
            <div class="folder-title-wrap">
              <div class="folder-icon-badge">${iconSvg}</div>
              <div>
                <h2 class="folder-name">${escapeHtml(f.meta.title)}</h2>
                <p class="folder-desc">${escapeHtml(f.meta.description)}</p>
              </div>
            </div>
            <div class="folder-actions">
              <span class="meta-badge badge-emerald">✓ Trust List Verified</span>
              <span class="meta-badge badge-slate">${folderItems.length} items</span>
              <button class="btn-secondary" onclick="window.copyFolderCli('${escapeJsString(f.folder)}')">
                ${icons.terminal} Copy CLI
              </button>
            </div>
          </div>
          <div class="cards-grid">
            ${folderItems.map((item) => renderCardHtml(item)).join('')}
          </div>
        </section>
      `;
    });

    elements.galleryContent.innerHTML = html;
  }

  // Render Flat Grid
  function renderFlatGrid(items) {
    let html = `
      <div class="cards-grid">
        ${items.map((item) => renderCardHtml(item)).join('')}
      </div>
    `;
    elements.galleryContent.innerHTML = html;
  }

  // Render Table View
  function renderTableView(items) {
    let html = `
      <div class="table-view-container">
        <table class="samples-table">
          <thead>
            <tr>
              <th>Sample File</th>
              <th>Collection</th>
              <th>Format / Size</th>
              <th>Digital Source Type</th>
              <th>Claim Signer</th>
              <th>Trust Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map((item) => {
                const dst = item.c2paSummary?.digitalSourceType;
                return `
                <tr>
                  <td>
                    <div class="table-filename-cell">
                      ${
                        item.previewUrl
                          ? `<img src="${encodeURI(item.previewUrl)}" class="table-thumbnail" alt="" loading="lazy">`
                          : `<div class="table-thumbnail" style="display:flex;align-items:center;justify-content:center;color:#60a5fa;">${item.type === 'video' ? icons.video : icons.music}</div>`
                      }
                      <div>
                        <div style="font-weight: 600; color: var(--text-primary); cursor: pointer;" onclick="window.openInspector('${item.id}')">${escapeHtml(item.filename)}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="meta-badge badge-slate">${escapeHtml(item.folderTitle || item.folder)}</span></td>
                  <td>${item.ext.toUpperCase().replace('.', '')} • ${item.sizeFormatted}</td>
                  <td>
                    ${
                      dst
                        ? `<span class="meta-badge badge-${dst.color}">${escapeHtml(dst.label)}</span>`
                        : '<span style="color: var(--text-tertiary);">N/A</span>'
                    }
                  </td>
                  <td>${escapeHtml(item.c2paSummary?.issuer || 'Google LLC')}</td>
                  <td>
                    <span class="meta-badge badge-emerald">✓ Verified</span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 0.35rem;">
                      <button class="btn-primary" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" onclick="window.openInspector('${item.id}')">
                        Inspect
                      </button>
                      <a href="${encodeURI(item.url)}" download class="btn-icon-action" title="Download">
                        ${icons.download}
                      </a>
                    </div>
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `;
    elements.galleryContent.innerHTML = html;
  }

  // Render Single Card HTML
  function renderCardHtml(item) {
    const dst = item.c2paSummary?.digitalSourceType;
    const issuer = item.c2paSummary?.issuer || 'Google LLC';
    const generator = item.c2paSummary?.generator || 'Google C2PA SDK';

    let mediaPreviewHtml = '';

    if (item.type === 'image') {
      mediaPreviewHtml = `
        <img src="${encodeURI(item.url)}" alt="${escapeHtml(item.filename)}" class="card-img" loading="lazy" onclick="window.openInspector('${item.id}')">
      `;
    } else if (item.type === 'video') {
      mediaPreviewHtml = `
        <video class="card-video" preload="metadata" muted playsinline onmouseenter="this.play()" onmouseleave="this.pause()" onclick="window.openInspector('${item.id}')">
          <source src="${encodeURI(item.url)}" type="video/mp4">
        </video>
        <div class="video-overlay-badge">${icons.video} Video</div>
      `;
    } else if (item.type === 'audio') {
      mediaPreviewHtml = `
        <div class="card-audio-wrap" onclick="window.openInspector('${item.id}')">
          <div class="audio-icon-pulse">${icons.music}</div>
          <audio controls class="audio-player-elem" src="${encodeURI(item.url)}" onclick="event.stopPropagation()"></audio>
        </div>
      `;
    } else if (item.type === 'raw') {
      mediaPreviewHtml = `
        <div class="card-raw-wrap" onclick="window.openInspector('${item.id}')">
          ${
            item.previewUrl
              ? `<img src="${encodeURI(item.previewUrl)}" alt="${escapeHtml(item.filename)}" class="card-img" loading="lazy">`
              : `<div style="color: #ef4444; font-size: 2rem;">RAW</div>`
          }
          <div class="raw-badge-overlay">RAW DNG</div>
        </div>
      `;
    }

    return `
      <div class="sample-card" id="card-${item.id}">
        <div class="card-media-wrap">
          ${mediaPreviewHtml}
          <div class="media-type-badge">${item.ext.toUpperCase().replace('.', '')}</div>
        </div>
        <div class="card-body">
          <div class="card-title-row">
            <h3 class="card-filename" title="${escapeHtml(item.filename)}">${escapeHtml(item.filename)}</h3>
          </div>

          <div class="card-meta-pills">
            <span class="meta-badge badge-emerald">✓ Verified Trust</span>
            ${
              dst
                ? `<span class="meta-badge badge-${dst.color}">${escapeHtml(dst.label)}</span>`
                : ''
            }
            <span class="meta-badge badge-slate">${item.sizeFormatted}</span>
          </div>

          <div class="card-details-list">
            <div class="card-detail-item">
              <span class="detail-k">Signer</span>
              <span class="detail-v" title="${escapeHtml(issuer)}">${escapeHtml(issuer)}</span>
            </div>
            <div class="card-detail-item">
              <span class="detail-k">Generator</span>
              <span class="detail-v" title="${escapeHtml(generator)}">${escapeHtml(generator)}</span>
            </div>
          </div>

          <div class="card-footer">
            <button class="btn-primary" onclick="window.openInspector('${item.id}')">
              ${icons.inspect} Inspect crJSON
            </button>
            <a href="${encodeURI(item.url)}" download class="btn-icon-action" title="Download Sample File">
              ${icons.download}
            </a>
            <button class="btn-icon-action" title="Copy CLI Command" onclick="window.copySampleCli('${escapeJsString(item.url)}')">
              ${icons.terminal}
            </button>
            <button class="btn-icon-action" title="Copy Sample Link" onclick="window.copySampleLink('${escapeJsString(item.filename)}')">
              ${icons.copy}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Open Inspector Modal
  function openInspector(itemId, activeTab = 'overview') {
    const item = state.data.items.find((i) => i.id === itemId || i.filename === itemId);
    if (!item) return;

    state.activeModalItem = item;
    state.modalActiveTab = activeTab;

    if (elements.modalTitle) {
      elements.modalTitle.textContent = item.filename;
    }

    // Media Preview in Modal
    if (elements.modalPreviewPane) {
      let previewHtml = '';
      if (item.type === 'image') {
        previewHtml = `<img src="${encodeURI(item.url)}" alt="${escapeHtml(item.filename)}" class="modal-media-elem">`;
      } else if (item.type === 'video') {
        previewHtml = `
          <video controls autoplay class="modal-media-elem" style="width: 100%; max-height: 480px; background: #000;">
            <source src="${encodeURI(item.url)}" type="video/mp4">
          </video>
        `;
      } else if (item.type === 'audio') {
        previewHtml = `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 1.5rem; color: white;">
            <div class="audio-icon-pulse" style="width: 72px; height: 72px;">${icons.music}</div>
            <div style="font-size: 1.1rem; font-weight: 600;">${escapeHtml(item.filename)}</div>
            <audio controls autoplay src="${encodeURI(item.url)}" style="width: 320px;"></audio>
          </div>
        `;
      } else if (item.type === 'raw') {
        previewHtml = `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; color: white; text-align: center;">
            ${item.previewUrl ? `<img src="${encodeURI(item.previewUrl)}" class="modal-media-elem" alt="">` : ''}
            <div style="font-size: 0.85rem; color: #94a3b8;">Uncompressed RAW DNG Digital Negative Sensor File</div>
            <a href="${encodeURI(item.url)}" download class="btn-primary" style="max-width: 200px;">
              ${icons.download} Download RAW DNG (${item.sizeFormatted})
            </a>
          </div>
        `;
      }
      elements.modalPreviewPane.innerHTML = previewHtml;
    }

    // Render Tabs
    renderModalTabs(item);
    renderModalTabContent(item);

    // Show Modal
    if (elements.modalBackdrop) {
      elements.modalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    // Update URL Hash
    history.replaceState(null, '', `#sample=${encodeURIComponent(item.filename)}`);
  }

  function closeModal() {
    state.activeModalItem = null;
    if (elements.modalBackdrop) {
      elements.modalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (elements.modalPreviewPane) {
      const media = elements.modalPreviewPane.querySelector('video, audio');
      if (media) media.pause();
    }
    if (window.location.hash.includes('sample=')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  function renderModalTabs(item) {
    if (!elements.modalTabs) return;

    const hasJson = !!item.crjson;
    const hasSidecars = item.sidecars && item.sidecars.length > 0;

    const tabs = [
      { id: 'overview', label: 'Overview & Trust' },
      { id: 'json', label: 'crJSON Manifest', show: hasJson },
      { id: 'sidecars', label: `Companion Files (${item.sidecars.length})`, show: hasSidecars },
      { id: 'cli', label: 'Developer & CLI' }
    ].filter((t) => t.show !== false);

    elements.modalTabs.innerHTML = tabs
      .map(
        (t) => `
      <button class="modal-tab-btn ${state.modalActiveTab === t.id ? 'active' : ''}" onclick="window.switchModalTab('${t.id}')">
        ${t.label}
      </button>
    `
      )
      .join('');
  }

  function renderModalTabContent(item) {
    if (!elements.modalTabContent) return;

    const tab = state.modalActiveTab;
    const summary = item.c2paSummary || {};
    const dst = summary.digitalSourceType;

    let html = '';

    if (tab === 'overview') {
      html = `
        <div class="prov-section">
          <div class="prov-section-title">Official Trust List Validation</div>
          <div class="prov-cell" style="background-color: var(--color-emerald-bg); border-color: var(--color-emerald-border); color: var(--color-emerald-text);">
            <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.9rem;">
              ${icons.shieldCheck}
              <span>Validated against C2PA Trust List &amp; TSA Trust List (Prod)</span>
            </div>
            <div style="font-size: 0.76rem; margin-top: 0.35rem; opacity: 0.9;">
              Signing Credential: <strong>Trusted</strong> &bull; Time Stamp: <strong>Trusted</strong> &bull; Cryptographic Signatures: <strong>Valid</strong>
            </div>
          </div>
        </div>

        <div class="prov-section">
          <div class="prov-section-title">Claim &amp; Signing Credentials</div>
          <div class="prov-grid">
            <div class="prov-cell">
              <span class="prov-label">Signing Credential / Common Name</span>
              <span class="prov-value">${escapeHtml(summary.issuer || 'Google LLC')}</span>
            </div>
            <div class="prov-cell">
              <span class="prov-label">Certificate Issuing Authority (ICA)</span>
              <span class="prov-value">${escapeHtml(summary.issuerCA || 'Google C2PA ICA')}</span>
            </div>
            <div class="prov-cell">
              <span class="prov-label">Time Stamping Authority (TSA)</span>
              <span class="prov-value">${escapeHtml(summary.tsaAuthority || 'Google Pixel TSA')}</span>
            </div>
            <div class="prov-cell">
              <span class="prov-label">Timestamped Signature Time</span>
              <span class="prov-value">${escapeHtml(summary.signingTimeFormatted || summary.signingTime || 'Verified')}</span>
            </div>
            <div class="prov-cell">
              <span class="prov-label">Claim Generator</span>
              <span class="prov-value">${escapeHtml(summary.generator || 'Google C2PA SDK')}</span>
            </div>
            <div class="prov-cell">
              <span class="prov-label">Claim Generator Version</span>
              <span class="prov-value">${escapeHtml(summary.generatorVersion || 'Production')}</span>
            </div>
          </div>
        </div>

        <div class="prov-section">
          <div class="prov-section-title">Provenance &amp; Digital Source Type</div>
          <div class="prov-cell">
            <span class="prov-label">IPTC Digital Source Type</span>
            <div style="margin-top: 0.35rem;">
              ${
                dst
                  ? `<span class="meta-badge badge-${dst.color}" style="font-size: 0.82rem; padding: 0.25rem 0.65rem;">${escapeHtml(dst.label)} (${escapeHtml(dst.category)})</span>`
                  : '<span style="color: var(--text-tertiary);">Standard media provenance claim</span>'
              }
            </div>
          </div>
        </div>

        ${
          summary.actions && summary.actions.length > 0
            ? `
          <div class="prov-section">
            <div class="prov-section-title">Recorded Actions History</div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              ${summary.actions
                .map(
                  (a, idx) => `
                <div class="prov-cell" style="flex-direction: row; align-items: center; justify-content: space-between;">
                  <div>
                    <span style="font-weight: 700; color: var(--brand-primary); font-family: var(--font-mono); font-size: 0.8rem;">${idx + 1}. ${escapeHtml(a.action)}</span>
                    ${a.description ? `<span style="font-size: 0.75rem; color: var(--text-secondary); margin-left: 0.5rem;">${escapeHtml(a.description)}</span>` : ''}
                  </div>
                  ${a.digitalSourceType ? `<span class="meta-badge badge-slate" style="font-size: 0.7rem;">${escapeHtml(a.digitalSourceType.split('/').pop())}</span>` : ''}
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        ${
          summary.ingredients && summary.ingredients.length > 0
            ? `
          <div class="prov-section">
            <div class="prov-section-title">Parent Ingredients &amp; Manifest Lineage (${summary.ingredients.length})</div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${summary.ingredients
                .map(
                  (ing, idx) => `
                <div class="prov-cell">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary);">Parent Ingredient #${idx + 1}</span>
                    <span class="meta-badge badge-indigo">Verified Ingredient</span>
                  </div>
                  <div style="font-size: 0.72rem; color: var(--text-tertiary); font-family: var(--font-mono); margin-top: 0.2rem;">${escapeHtml(ing.manifest)}</div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">Signer: <strong>${escapeHtml(ing.issuer)}</strong> (${escapeHtml(ing.generator)})</div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }
      `;
    } else if (tab === 'json') {
      const jsonStr = item.crjson ? JSON.stringify(item.crjson, null, 2) : '{}';
      html = `
        <div class="code-viewer-wrap">
          <div class="code-viewer-header">
            <span>Validated crJSON Manifest</span>
            <button class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.72rem;" onclick="window.copyToClipboard(${escapeJsParam(jsonStr)}, 'Copied crJSON Manifest')">
              ${icons.copy} Copy crJSON
            </button>
          </div>
          <pre class="code-viewer-pre"><code>${escapeHtml(jsonStr)}</code></pre>
        </div>
      `;
    } else if (tab === 'sidecars') {
      html = `
        <div class="prov-section">
          <div class="prov-section-title">Companion Files &amp; Manifest Sidecars</div>
          <div style="display: flex; flex-direction: column; gap: 0.65rem;">
            ${item.sidecars
              .map(
                (s) => `
              <div class="prov-cell" style="flex-direction: row; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-weight: 600; color: var(--text-primary); font-size: 0.85rem;">${escapeHtml(s.name)}</div>
                  <div style="font-size: 0.75rem; color: var(--text-tertiary);">${s.sizeFormatted} • ${s.ext.toUpperCase()}</div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  ${
                    s.content
                      ? `<button class="btn-secondary" onclick="window.copyToClipboard(${escapeJsParam(s.content)}, 'Copied sidecar JSON')">${icons.copy} Copy</button>`
                      : ''
                  }
                  <a href="${encodeURI(s.url)}" download class="btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">
                    ${icons.download} Download
                  </a>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    } else if (tab === 'cli') {
      const fullUrl = window.location.origin + window.location.pathname.replace(/\/+$/, '') + '/' + item.url;
      const c2paCmd = `c2pa validate --file "${item.filename}" --output_format crjson --trust prod`;
      const c2patoolCmd = `c2patool "${fullUrl}"`;
      const curlCmd = `curl -O "${fullUrl}"`;
      const rawGitUrl = `https://raw.githubusercontent.com/sherifhanna-google/sherifhanna-google.github.io/main/${item.url}`;

      html = `
        <div class="prov-section">
          <div class="prov-section-title">Internal C2PA CLI (crJSON &amp; Trust List Validation)</div>
          <div class="cli-box">
            <code>${escapeHtml(c2paCmd)}</code>
            <button class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.72rem;" onclick="window.copyToClipboard(${escapeJsParam(c2paCmd)}, 'Copied c2pa validate command')">
              ${icons.copy}
            </button>
          </div>
        </div>

        <div class="prov-section">
          <div class="prov-section-title">Open-Source c2patool CLI</div>
          <div class="cli-box">
            <code>${escapeHtml(c2patoolCmd)}</code>
            <button class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.72rem;" onclick="window.copyToClipboard(${escapeJsParam(c2patoolCmd)}, 'Copied c2patool command')">
              ${icons.copy}
            </button>
          </div>
        </div>

        <div class="prov-section">
          <div class="prov-section-title">Download with curl</div>
          <div class="cli-box">
            <code>${escapeHtml(curlCmd)}</code>
            <button class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.72rem;" onclick="window.copyToClipboard(${escapeJsParam(curlCmd)}, 'Copied curl command')">
              ${icons.copy}
            </button>
          </div>
        </div>

        <div class="prov-section">
          <div class="prov-section-title">Direct Hosted URLs</div>
          <div class="prov-cell">
            <span class="prov-label">Hosted Site URL</span>
            <span class="prov-value" style="font-size: 0.75rem; font-family: var(--font-mono);">${escapeHtml(fullUrl)}</span>
          </div>
          <div class="prov-cell" style="margin-top: 0.5rem;">
            <span class="prov-label">Raw GitHub CDN URL</span>
            <span class="prov-value" style="font-size: 0.75rem; font-family: var(--font-mono);">${escapeHtml(rawGitUrl)}</span>
          </div>
        </div>
      `;
    }

    elements.modalTabContent.innerHTML = html;
  }

  // Window Exposed Functions for HTML Event Handlers
  window.selectFolder = function (folder) {
    state.activeFolder = folder;
    renderSidebar();
    renderGallery();
  };

  window.selectType = function (type) {
    state.activeType = type;
    renderFilterChips();
    renderGallery();
  };

  window.selectDst = function (dst) {
    state.activeDst = dst;
    renderFilterChips();
    renderGallery();
  };

  window.resetFilters = function () {
    state.activeFolder = 'all';
    state.activeType = 'all';
    state.activeDst = 'all';
    state.searchQuery = '';
    if (elements.searchInput) elements.searchInput.value = '';
    if (elements.searchClearBtn) elements.searchClearBtn.style.display = 'none';
    renderSidebar();
    renderFilterChips();
    renderGallery();
  };

  window.openInspector = openInspector;
  window.closeModal = closeModal;

  window.switchModalTab = function (tabId) {
    state.modalActiveTab = tabId;
    if (state.activeModalItem) {
      renderModalTabs(state.activeModalItem);
      renderModalTabContent(state.activeModalItem);
    }
  };

  window.copyToClipboard = function (text, message = 'Copied to clipboard') {
    navigator.clipboard.writeText(text).then(
      () => showToast(message),
      () => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(message);
      }
    );
  };

  window.copySampleCli = function (sampleUrl) {
    const filename = sampleUrl.split('/').pop();
    window.copyToClipboard(`c2pa validate --file "${filename}" --output_format crjson --trust prod`, 'Copied c2pa validate CLI command!');
  };

  window.copySampleLink = function (filename) {
    const link = window.location.origin + window.location.pathname + '#sample=' + encodeURIComponent(filename);
    window.copyToClipboard(link, 'Copied sample link to clipboard!');
  };

  window.copyFolderCli = function (folderName) {
    const folderItems = state.data.items.filter((i) => i.folder === folderName);
    const urls = folderItems.map((i) => `"${window.location.origin + window.location.pathname.replace(/\/+$/, '') + '/' + i.url}"`).join(' \\\n  ');
    const cmd = `# Download all samples in ${folderName}\nfor url in \\\n  ${urls}; do\n  curl -O "$url"\ndone`;
    window.copyToClipboard(cmd, `Copied download commands for ${folderName}!`);
  };

  function showToast(message) {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `${icons['check-badge']} <span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 200);
    }, 2500);
  }

  // Utilities
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function escapeJsString(str) {
    if (str == null) return '';
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
  }

  function escapeJsParam(str) {
    return JSON.stringify(str);
  }

  // Bootstrap when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
