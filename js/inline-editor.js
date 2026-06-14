/**
 * inline-editor.js
 * ────────────────────────────────────────────────────────────────────
 * Standalone inline visual editor for the Bible Quiz landing page.
 * Allows superadmin users to edit text, manage section visibility &
 * order, and add/remove custom sections — all directly on the page.
 *
 * Dependencies:
 *   - window.db           (localStorage persistence API)
 *   - window.currentUser  (auth object with .role)
 *   - window.showToast    (notification helper)
 *
 * Usage:
 *   window.inlineEditor.init()    — after admin login
 *   window.inlineEditor.destroy() — on logout
 * ────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────
  let editMode = false;
  let snapshot = {};          // original text values captured on edit-mode entry
  let dirtyMap = {};          // { key: newValue } for changed fields
  let sectionConfig = [];     // live copy of section_config
  let fabEl = null;           // FAB DOM node
  let toolbarEl = null;       // toolbar DOM node
  let addSectionBtnEl = null; // "add section" button
  let modalEl = null;         // custom-section modal
  const cleanupFns = [];      // teardown callbacks

  // ── Helpers ────────────────────────────────────────────────────────

  /** Shortcut: is the current user a superadmin? */
  function isAdmin() {
    return window.currentUser && window.currentUser.role === 'superadmin';
  }

  /** Count of uncommitted changes. */
  function dirtyCount() {
    return Object.keys(dirtyMap).length;
  }

  /** Safely call showToast if available. */
  function toast(msg, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type);
    }
  }

  /** Create a DOM element with optional class, attributes, and inner HTML. */
  function createElement(tag, opts = {}) {
    const el = document.createElement(tag);
    if (opts.className) el.className = opts.className;
    if (opts.innerHTML) el.innerHTML = opts.innerHTML;
    if (opts.textContent) el.textContent = opts.textContent;
    if (opts.attrs) {
      Object.entries(opts.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    }
    return el;
  }

  // ── 1. Floating Action Button (FAB) ───────────────────────────────

  function createFAB() {
    if (fabEl) return;
    fabEl = createElement('button', {
      className: 'inline-editor-fab',
      innerHTML: '✏️ सम्पादन मोड (Edit Mode)',
    });
    fabEl.addEventListener('click', toggleEditMode);
    document.body.appendChild(fabEl);
  }

  function removeFAB() {
    if (fabEl) {
      fabEl.removeEventListener('click', toggleEditMode);
      fabEl.remove();
      fabEl = null;
    }
  }

  // ── 2. Top Toolbar ─────────────────────────────────────────────────

  function createToolbar() {
    if (toolbarEl) return;

    toolbarEl = createElement('div', {
      className: 'inline-editor-toolbar',
    });

    // Save button
    const saveBtn = createElement('button', {
      innerHTML: '💾 सबै सेभ गर्नुहोस् (Save All)',
    });
    saveBtn.addEventListener('click', saveAll);

    // Undo button
    const undoBtn = createElement('button', {
      innerHTML: '↩️ सबै पूर्ववत् गर्नुहोस् (Undo All)',
    });
    undoBtn.addEventListener('click', undoAll);

    // Exit button
    const exitBtn = createElement('button', {
      innerHTML: '❌ सम्पादन बन्द गर्नुहोस् (Exit Edit Mode)',
    });
    exitBtn.addEventListener('click', () => toggleEditMode());

    // Change-count badge
    const badge = createElement('span', {
      className: 'toolbar-change-badge',
      textContent: '0 परिवर्तन',
    });
    badge.id = 'editor-change-badge';

    toolbarEl.append(saveBtn, undoBtn, exitBtn, badge);
    document.body.appendChild(toolbarEl);
  }

  function removeToolbar() {
    if (toolbarEl) {
      toolbarEl.remove();
      toolbarEl = null;
    }
  }

  /** Refresh the change-count badge text. */
  function updateBadge() {
    const badge = document.getElementById('editor-change-badge');
    if (badge) {
      const count = dirtyCount();
      badge.textContent = count > 0
        ? `${count} परिवर्तन (${count} change${count > 1 ? 's' : ''})`
        : '0 परिवर्तन';
    }
  }

  // ── 3. Inline Text Editing ─────────────────────────────────────────

  /** Take a snapshot of all editable elements' current text. */
  function captureSnapshot() {
    snapshot = {};
    document.querySelectorAll('[data-editable]').forEach((el) => {
      const key = el.getAttribute('data-editable');
      snapshot[key] = el.innerHTML;
    });
  }

  /** Enable contentEditable on all [data-editable] elements. */
  function enableEditing() {
    document.querySelectorAll('[data-editable]').forEach((el) => {
      el.contentEditable = 'true';
      el.addEventListener('blur', handleEditableBlur);
      el.addEventListener('keydown', handleEditableKeydown);
    });
    document.body.classList.add('editable-active');
  }

  /** Disable contentEditable on all [data-editable] elements. */
  function disableEditing() {
    document.querySelectorAll('[data-editable]').forEach((el) => {
      el.contentEditable = 'false';
      el.removeEventListener('blur', handleEditableBlur);
      el.removeEventListener('keydown', handleEditableKeydown);
    });
    document.body.classList.remove('editable-active');
  }

  /**
   * On blur: compare current text with snapshot.
   * If changed, record in dirtyMap; if reverted, remove from dirtyMap.
   */
  function handleEditableBlur(e) {
    const el = e.target;
    const key = el.getAttribute('data-editable');
    if (!key) return;

    const current = el.innerHTML;
    if (current !== snapshot[key]) {
      dirtyMap[key] = current;
    } else {
      delete dirtyMap[key];
    }
    updateBadge();
  }

  /**
   * Prevent Enter from inserting <br>/<div> in single-line elements.
   * Allows Enter in paragraphs / divs / textareas for multi-line content.
   */
  function handleEditableKeydown(e) {
    if (e.key === 'Enter') {
      const tag = e.target.tagName.toLowerCase();
      const singleLineTags = ['h1', 'h2', 'h3', 'h4', 'span', 'a', 'button', 'label'];
      if (singleLineTags.includes(tag)) {
        e.preventDefault();
        e.target.blur(); // commit the edit
      }
    }
  }

  /** Save all dirty changes to the database in one batch. */
  function saveAll() {
    if (dirtyCount() === 0) {
      toast('कुनै परिवर्तन छैन (No changes to save)', 'info');
      return;
    }

    try {
      window.db.updatePageContentBatch({ ...dirtyMap });
      // Update the snapshot so subsequent edits diff against saved state
      Object.entries(dirtyMap).forEach(([key, val]) => {
        snapshot[key] = val;
      });
      const saved = dirtyCount();
      dirtyMap = {};
      updateBadge();
      toast(`${saved} परिवर्तन सेभ भयो (${saved} change(s) saved)`, 'success');
    } catch (err) {
      console.error('[InlineEditor] Save failed:', err);
      toast('सेभ गर्न असफल भयो (Save failed)', 'error');
    }
  }

  /** Revert all editable elements to the snapshot values. */
  function undoAll() {
    document.querySelectorAll('[data-editable]').forEach((el) => {
      const key = el.getAttribute('data-editable');
      if (key && snapshot[key] !== undefined) {
        el.innerHTML = snapshot[key];
      }
    });
    dirtyMap = {};
    updateBadge();
    toast('सबै परिवर्तन पूर्ववत् भयो (All changes reverted)', 'info');
  }

  // ── 4. Section Management Controls ─────────────────────────────────

  /** Load section config from db into local state. */
  function loadSectionConfig() {
    sectionConfig = window.db.getSectionConfig() || [];
  }

  /** Persist the current sectionConfig to db. */
  function saveSectionConfig() {
    window.db.updateSectionConfig(sectionConfig);
  }

  /**
   * Inject a control bar at the top of each managed section.
   * Controls: label, visibility toggle, move up, move down.
   */
  function injectSectionControls() {
    sectionConfig.forEach((sec) => {
      const sectionEl = document.getElementById(sec.id);
      if (!sectionEl) return;

      // Avoid duplicate injection
      if (sectionEl.querySelector('.section-editor-controls')) return;

      const bar = createElement('div', { className: 'section-editor-controls' });

      // Label
      const label = createElement('span', {
        textContent: sec.label || sec.id,
        className: 'section-control-label',
      });

      // Visibility toggle
      const visBtn = createElement('button', {
        innerHTML: sec.visible ? '👁️ लुकाउनुहोस् (Hide)' : '👁️‍🗨️ देखाउनुहोस् (Show)',
      });
      visBtn.addEventListener('click', () => toggleSectionVisibility(sec.id));

      // Move up
      const upBtn = createElement('button', { innerHTML: '⬆️ माथि (Up)' });
      upBtn.addEventListener('click', () => moveSection(sec.id, -1));

      // Move down
      const downBtn = createElement('button', { innerHTML: '⬇️ तल (Down)' });
      downBtn.addEventListener('click', () => moveSection(sec.id, 1));

      bar.append(label, visBtn, upBtn, downBtn);

      // If section has a removable custom section, add remove button
      if (sec.removable) {
        const removeBtn = createElement('button', {
          innerHTML: '🗑️ हटाउनुहोस् (Remove)',
        });
        removeBtn.addEventListener('click', () => removeSection(sec.id));
        bar.appendChild(removeBtn);
      }

      sectionEl.prepend(bar);
    });
  }

  /** Remove all injected section control bars. */
  function removeSectionControls() {
    document.querySelectorAll('.section-editor-controls').forEach((el) => el.remove());
  }

  /** Toggle a section's visibility flag and re-apply. */
  function toggleSectionVisibility(sectionId) {
    const sec = sectionConfig.find((s) => s.id === sectionId);
    if (!sec) return;
    sec.visible = !sec.visible;
    saveSectionConfig();
    applySectionConfig();
    // Re-inject controls since we just re-applied config
    removeSectionControls();
    injectSectionControls();
    toast(
      sec.visible
        ? `"${sec.label}" देखाइयो (shown)`
        : `"${sec.label}" लुकाइयो (hidden)`,
      'info',
    );
  }

  /**
   * Move a section up (direction = -1) or down (direction = +1).
   * Re-sorts by order, updates DOM, and persists.
   */
  function moveSection(sectionId, direction) {
    const idx = sectionConfig.findIndex((s) => s.id === sectionId);
    if (idx === -1) return;

    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= sectionConfig.length) return;

    // Swap order values
    const tempOrder = sectionConfig[idx].order;
    sectionConfig[idx].order = sectionConfig[targetIdx].order;
    sectionConfig[targetIdx].order = tempOrder;

    // Sort by order
    sectionConfig.sort((a, b) => a.order - b.order);

    saveSectionConfig();
    applySectionConfig();
    removeSectionControls();
    injectSectionControls();
    toast('क्रम अपडेट भयो (Order updated)', 'info');
  }

  /** Remove a custom section entirely. */
  function removeSection(sectionId) {
    if (!confirm('के तपाईं यो सेक्सन हटाउन चाहनुहुन्छ? (Remove this section?)')) {
      return;
    }

    // Remove from custom sections db
    window.db.removeCustomSection(sectionId);

    // Remove from section config
    sectionConfig = sectionConfig.filter((s) => s.id !== sectionId);
    saveSectionConfig();

    // Remove DOM element
    const el = document.getElementById(sectionId);
    if (el) el.remove();

    toast('सेक्सन हटाइयो (Section removed)', 'success');
  }

  // ── 5. Add Custom Section (Modal) ──────────────────────────────────

  /** Create the "Add New Section" button at the bottom of the landing container. */
  function createAddSectionButton() {
    if (addSectionBtnEl) return;

    const container = document.getElementById('landing-page-container');
    if (!container) return;

    addSectionBtnEl = createElement('button', {
      className: 'add-section-btn',
      innerHTML: '➕ नयाँ सेक्सन थप्नुहोस् (Add New Section)',
    });
    addSectionBtnEl.addEventListener('click', openAddSectionModal);
    container.appendChild(addSectionBtnEl);
  }

  function removeAddSectionButton() {
    if (addSectionBtnEl) {
      addSectionBtnEl.removeEventListener('click', openAddSectionModal);
      addSectionBtnEl.remove();
      addSectionBtnEl = null;
    }
  }

  /** Open the add-custom-section modal dialog. */
  function openAddSectionModal() {
    if (modalEl) return; // already open

    modalEl = createElement('div', { className: 'inline-editor-modal-overlay' });

    const dialog = createElement('div', { className: 'inline-editor-modal' });
    dialog.innerHTML = `
      <h3>➕ नयाँ सेक्सन थप्नुहोस् (Add New Section)</h3>
      <label>शीर्षक (Title)
        <input type="text" id="custom-sec-title" placeholder="सेक्सनको शीर्षक" />
      </label>
      <label>सामग्री (Content)
        <textarea id="custom-sec-content" rows="5" placeholder="सेक्सनको सामग्री लेख्नुहोस्..."></textarea>
      </label>
      <label>आइकन Emoji (Icon)
        <input type="text" id="custom-sec-icon" placeholder="📖" maxlength="4" />
      </label>
      <div class="modal-actions">
        <button id="modal-save-btn">💾 सेभ गर्नुहोस् (Save)</button>
        <button id="modal-cancel-btn">❌ रद्द गर्नुहोस् (Cancel)</button>
      </div>
    `;

    modalEl.appendChild(dialog);
    document.body.appendChild(modalEl);

    // Close on overlay click (outside dialog)
    modalEl.addEventListener('click', handleModalOverlayClick);
    document.getElementById('modal-save-btn').addEventListener('click', handleAddSectionSave);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeAddSectionModal);
  }

  /** Close and destroy the modal. */
  function closeAddSectionModal() {
    if (modalEl) {
      modalEl.removeEventListener('click', handleModalOverlayClick);
      modalEl.remove();
      modalEl = null;
    }
  }

  /** Close modal when clicking the overlay background. */
  function handleModalOverlayClick(e) {
    if (e.target === modalEl) {
      closeAddSectionModal();
    }
  }

  /** Validate inputs, persist the new custom section, and render it. */
  function handleAddSectionSave() {
    const titleInput = document.getElementById('custom-sec-title');
    const contentInput = document.getElementById('custom-sec-content');
    const iconInput = document.getElementById('custom-sec-icon');

    const title = (titleInput.value || '').trim();
    const content = (contentInput.value || '').trim();
    const icon = (iconInput.value || '📄').trim();

    if (!title) {
      toast('शीर्षक आवश्यक छ (Title is required)', 'error');
      titleInput.focus();
      return;
    }

    // Generate a unique id
    const id = 'custom-section-' + Date.now();
    const order = sectionConfig.length + 1;

    const section = { id, title, content, icon, order };

    try {
      // Persist
      window.db.addCustomSection(section);

      // Add to section config
      sectionConfig.push({
        id,
        label: `${icon} ${title}`,
        visible: true,
        order,
        removable: true,
      });
      saveSectionConfig();

      // Render
      renderCustomSections();

      // Re-apply controls if in edit mode
      if (editMode) {
        removeSectionControls();
        injectSectionControls();
      }

      closeAddSectionModal();
      toast('नयाँ सेक्सन थपियो (New section added)', 'success');
    } catch (err) {
      console.error('[InlineEditor] Add section failed:', err);
      toast('सेक्सन थप्न असफल भयो (Failed to add section)', 'error');
    }
  }

  // ── 6. Custom Section Rendering ────────────────────────────────────

  /**
   * Render all custom sections into #custom-sections-container.
   * Each section gets a wrapper with data-section-id for management.
   */
  function renderCustomSections() {
    const container = document.getElementById('custom-sections-container');
    if (!container) return;

    // Clear existing custom sections
    container.innerHTML = '';

    const customSections = window.db.getCustomSections() || [];

    // Sort by order
    customSections.sort((a, b) => (a.order || 0) - (b.order || 0));

    customSections.forEach((sec) => {
      const sectionEl = createElement('section', {
        className: 'custom-section',
        attrs: { id: sec.id, 'data-section-id': sec.id },
      });

      const card = createElement('div', { className: 'custom-section-card' });

      const heading = createElement('h2', {
        textContent: `${sec.icon || '📄'} ${sec.title}`,
        attrs: { 'data-editable': `${sec.id}_title` },
      });

      const body = createElement('div', {
        className: 'custom-section-content',
        innerHTML: sec.content,
        attrs: { 'data-editable': `${sec.id}_content` },
      });

      card.append(heading, body);
      sectionEl.appendChild(card);
      container.appendChild(sectionEl);
    });
  }

  // ── Section Config Application ─────────────────────────────────────

  /**
   * Apply section order and visibility to the DOM.
   * - Reorders children of #landing-page-container by config order
   * - Hides / shows sections based on visibility and user role
   */
  function applySectionConfig() {
    loadSectionConfig();

    const container = document.getElementById('landing-page-container');
    if (!container) return;

    sectionConfig.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (!el) return;

      if (sec.visible) {
        el.classList.remove('section-hidden-overlay');
        el.style.display = '';
      } else if (isAdmin() && editMode) {
        // Admin in edit mode: show greyed-out overlay, keep in DOM
        el.classList.add('section-hidden-overlay');
        el.style.display = '';
      } else {
        // Non-admin or not in edit mode: fully hide
        el.classList.remove('section-hidden-overlay');
        el.style.display = 'none';
      }
    });

    // Re-order DOM elements according to config order
    const sorted = [...sectionConfig].sort((a, b) => a.order - b.order);
    sorted.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el && el.parentNode === container) {
        container.appendChild(el); // moves to end, effectively sorting
      }
    });
  }

  // ── Page Content Application ───────────────────────────────────────

  /**
   * Read saved content from db and apply to all [data-editable] elements.
   * Called on page load to hydrate the DOM with stored values.
   */
  function applyPageContent() {
    const content = window.db.getPageContent() || {};
    Object.entries(content).forEach(([key, value]) => {
      const el = document.querySelector(`[data-editable="${key}"]`);
      if (el) {
        el.innerHTML = value;
      }
    });
  }

  // ── Edit Mode Toggle ──────────────────────────────────────────────

  function toggleEditMode() {
    if (editMode) {
      exitEditMode();
    } else {
      enterEditMode();
    }
  }

  function enterEditMode() {
    if (editMode) return;
    editMode = true;

    // Reset dirty state
    dirtyMap = {};

    // Snapshot current editable content
    captureSnapshot();

    // UI setup
    createToolbar();
    enableEditing();
    updateBadge();

    // Section management
    loadSectionConfig();
    applySectionConfig();
    injectSectionControls();
    createAddSectionButton();

    // Update FAB label
    if (fabEl) {
      fabEl.innerHTML = '✏️ सम्पादन सक्रिय (Editing…)';
    }

    toast('सम्पादन मोड सक्रिय भयो (Edit mode activated)', 'success');
  }

  function exitEditMode() {
    if (!editMode) return;

    // Warn if there are unsaved changes
    if (dirtyCount() > 0) {
      const proceed = confirm(
        `${dirtyCount()} परिवर्तन सेभ भएको छैन। बाहिर निस्कने?\n` +
        `(${dirtyCount()} unsaved change(s). Exit without saving?)`,
      );
      if (!proceed) return;
      // Revert unsaved changes
      undoAll();
    }

    editMode = false;

    // Teardown UI
    removeToolbar();
    disableEditing();
    removeSectionControls();
    removeAddSectionButton();
    closeAddSectionModal();

    // Re-apply section visibility for viewer mode (hides hidden sections)
    applySectionConfig();

    // Update FAB label
    if (fabEl) {
      fabEl.innerHTML = '✏️ सम्पादन मोड (Edit Mode)';
    }

    toast('सम्पादन मोड बन्द भयो (Edit mode deactivated)', 'info');
  }

  // ── Public API ─────────────────────────────────────────────────────

  /**
   * Initialise the inline editor.
   * Call after admin login — shows FAB for superadmin users.
   */
  function init() {
    if (!isAdmin()) return;

    // Apply persisted content & layout
    applyPageContent();
    renderCustomSections();
    applySectionConfig();

    // Show the edit-mode FAB
    createFAB();
  }

  /**
   * Tear down the inline editor completely.
   * Call on logout to remove all editor UI and listeners.
   */
  function destroy() {
    if (editMode) {
      // Force-exit without confirmation
      editMode = false;
      removeToolbar();
      disableEditing();
      removeSectionControls();
      removeAddSectionButton();
      closeAddSectionModal();
    }
    removeFAB();

    // Run any extra cleanup callbacks
    cleanupFns.forEach((fn) => fn());
    cleanupFns.length = 0;

    // Reset state
    snapshot = {};
    dirtyMap = {};
    sectionConfig = [];
  }

  // ── Expose Global API ──────────────────────────────────────────────

  window.inlineEditor = {
    init,
    destroy,
    applyPageContent,
    applySectionConfig,
    renderCustomSections,
  };
})();
