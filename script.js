/**
 * PassportCard Content Review Tool
 * Wizard-style approval interface with progress tracking
 */

// ============================================
// Constants
// ============================================
const STORAGE_KEY = 'passportcard_translation_review';
const STORAGE_VERSION = '1.0.0';
const CONFETTI_COLORS = ['#E10514', '#FF4757', '#C50412', '#FFFFFF', '#FFD700'];

// ============================================
// State
// ============================================
let state = {
  originalData: null,
  currentData: null,
  sections: [],
  currentSectionIndex: 0,
  currentFieldIndex: 0,
  approved: new Set(),
  edited: {},
  loadedFileName: 'he.json',
  fileSignature: null,
  consecutiveApprovals: 0,
  lastMilestone: 0
};

// ============================================
// DOM Elements
// ============================================
const el = {};

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  setupEventListeners();
  loadSavedTheme();
  checkSavedProgress();
  setupScrollBehavior();
});

function cacheElements() {
  // Header
  el.header = document.getElementById('header');
  el.headerTitle = document.getElementById('header-title');
  el.headerStep = document.getElementById('header-step');
  el.logoLarge = document.getElementById('logo-large');
  el.btnTheme = document.getElementById('btn-theme');
  el.btnReset = document.getElementById('btn-reset');
  el.btnHeaderDownload = document.getElementById('btn-header-download');
  el.btnUpload = document.getElementById('btn-upload');
  el.btnMobileMenu = document.getElementById('btn-mobile-menu');

  // Progress Bar
  el.progressBarContainer = document.getElementById('progress-bar-container');
  el.progressBarFill = document.getElementById('progress-bar-fill');
  el.progressText = document.getElementById('progress-text');
  el.progressPercentage = document.getElementById('progress-percentage');

  // Welcome Screen
  el.welcomeScreen = document.getElementById('welcome-screen');
  el.uploadArea = document.getElementById('upload-area');
  el.fileInput = document.getElementById('file-input');
  el.savedProgressBanner = document.getElementById('saved-progress-banner');
  el.savedProgressTitle = document.getElementById('saved-progress-title');
  el.savedProgressDetails = document.getElementById('saved-progress-details');

  // Wizard
  el.wizardContainer = document.getElementById('wizard-container');
  el.minimap = document.getElementById('minimap');
  el.minimapList = document.getElementById('minimap-list');
  el.minimapApproved = document.getElementById('minimap-approved');
  el.minimapEdited = document.getElementById('minimap-edited');
  el.minimapTotal = document.getElementById('minimap-total');
  el.wizardContent = document.getElementById('wizard-content');
  el.sectionTitle = document.getElementById('section-title');
  el.sectionSubtitle = document.getElementById('section-subtitle');
  el.fieldsContainer = document.getElementById('fields-container');
  el.btnApproveAll = document.getElementById('btn-approve-all');
  el.btnPrevSection = document.getElementById('btn-prev-section');
  el.btnNextSection = document.getElementById('btn-next-section');

  // Summary
  el.summaryScreen = document.getElementById('summary-screen');
  el.summaryApproved = document.getElementById('summary-approved');
  el.summaryEdited = document.getElementById('summary-edited');
  el.summaryChanges = document.getElementById('summary-changes');
  el.summaryChangesList = document.getElementById('summary-changes-list');
  el.btnSummaryReset = document.getElementById('btn-summary-reset');
  el.btnDownload = document.getElementById('btn-download');

  // Modals
  el.modalResume = document.getElementById('modal-resume');
  el.modalResumeFilename = document.getElementById('modal-resume-filename');
  el.modalResumeProgress = document.getElementById('modal-resume-progress');
  el.modalResumeDate = document.getElementById('modal-resume-date');
  el.btnResumeRestart = document.getElementById('btn-resume-restart');
  el.btnResumeContinue = document.getElementById('btn-resume-continue');

  el.modalDifferentFile = document.getElementById('modal-different-file');
  el.modalDiffNew = document.getElementById('modal-diff-new');
  el.modalDiffOld = document.getElementById('modal-diff-old');
  el.btnDiffCancel = document.getElementById('btn-diff-cancel');
  el.btnDiffContinue = document.getElementById('btn-diff-continue');

  el.modalReset = document.getElementById('modal-reset');
  el.btnResetCancel = document.getElementById('btn-reset-cancel');
  el.btnResetConfirm = document.getElementById('btn-reset-confirm');

  el.modalTutorial = document.getElementById('modal-tutorial');
  el.tutorialDontShow = document.getElementById('tutorial-dont-show');
  el.btnTutorialStart = document.getElementById('btn-tutorial-start');

  // Other
  el.mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  el.keyboardHint = document.getElementById('keyboard-hint');
  el.confettiContainer = document.getElementById('confetti-container');
  el.toastContainer = document.getElementById('toast-container');
  el.footer = document.getElementById('footer');
}

function setupEventListeners() {
  // File upload
  el.uploadArea.addEventListener('click', () => el.fileInput.click());
  el.uploadArea.addEventListener('dragover', handleDragOver);
  el.uploadArea.addEventListener('dragleave', handleDragLeave);
  el.uploadArea.addEventListener('drop', handleDrop);
  el.fileInput.addEventListener('change', handleFileSelect);

  // Header buttons
  el.btnTheme.addEventListener('click', toggleTheme);
  el.btnReset.addEventListener('click', () => showModal('modal-reset'));
  el.btnUpload.addEventListener('click', showWelcomeScreen);
  el.btnMobileMenu.addEventListener('click', toggleMobileMenu);

  // Wizard navigation
  el.btnApproveAll.addEventListener('click', approveAllInSection);
  el.btnPrevSection.addEventListener('click', () => navigateSection(-1));
  el.btnNextSection.addEventListener('click', () => navigateSection(1));

  // Summary buttons
  el.btnSummaryReset.addEventListener('click', () => showModal('modal-reset'));
  el.btnDownload.addEventListener('click', downloadFile);
  
  // Header download button
  el.btnHeaderDownload.addEventListener('click', downloadFile);

  // Resume modal
  el.btnResumeRestart.addEventListener('click', () => {
    hideModal('modal-resume');
    clearSavedProgress();
    initializeWizard(state.pendingData);
  });
  el.btnResumeContinue.addEventListener('click', () => {
    hideModal('modal-resume');
    initializeWizard(state.pendingData, true);
  });

  // Different file modal
  el.btnDiffCancel.addEventListener('click', () => {
    hideModal('modal-different-file');
    state.pendingData = null;
  });
  el.btnDiffContinue.addEventListener('click', () => {
    hideModal('modal-different-file');
    clearSavedProgress();
    initializeWizard(state.pendingData);
  });

  // Reset modal
  el.btnResetCancel.addEventListener('click', () => hideModal('modal-reset'));
  el.btnResetConfirm.addEventListener('click', () => {
    hideModal('modal-reset');
    resetAndShowWelcome();
  });

  // Tutorial modal
  el.btnTutorialStart.addEventListener('click', () => {
    if (el.tutorialDontShow.checked) {
      savePreference('showTutorial', false);
    }
    hideModal('modal-tutorial');
  });

  // Mobile menu overlay
  el.mobileMenuOverlay.addEventListener('click', toggleMobileMenu);

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ============================================
// Scroll Behavior
// ============================================
function setupScrollBehavior() {
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 100) {
      el.header.classList.add('scrolled');
    } else {
      el.header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });
}

// ============================================
// Theme
// ============================================
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('passportcard_editor_theme', newTheme);
  const icon = el.btnTheme.querySelector('i');
  icon.className = newTheme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
}

function loadSavedTheme() {
  const savedTheme = localStorage.getItem('passportcard_editor_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const icon = el.btnTheme.querySelector('i');
  icon.className = savedTheme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
}

// ============================================
// LocalStorage - Progress Tracking
// ============================================
function generateFileSignature(data, fileName, fileSize) {
  const keyPaths = extractAllKeyPaths(data);
  const structureHash = simpleHash(keyPaths.sort().join('|'));
  return {
    name: fileName,
    size: fileSize,
    keyCount: keyPaths.length,
    structureHash: structureHash
  };
}

function extractAllKeyPaths(obj, prefix = '', result = []) {
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      extractAllKeyPaths(value, fullKey, result);
    } else {
      result.push(fullKey);
    }
  }
  return result;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function saveProgress() {
  const data = {
    version: STORAGE_VERSION,
    lastUpdated: new Date().toISOString(),
    fileSignature: state.fileSignature,
    currentSection: state.currentSectionIndex,
    currentIndex: state.currentFieldIndex,
    approved: Array.from(state.approved),
    edited: state.edited,
    theme: document.documentElement.getAttribute('data-theme') || 'light'
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadSavedProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function clearSavedProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

function checkSavedProgress() {
  const saved = loadSavedProgress();
  if (saved && saved.fileSignature) {
    el.savedProgressBanner.style.display = 'flex';
    el.savedProgressTitle.textContent = `נמצאה התקדמות שמורה מקובץ: ${saved.fileSignature.name}`;
    const progressPercent = Math.round((saved.approved.length / saved.fileSignature.keyCount) * 100);
    el.savedProgressDetails.textContent = `${progressPercent}% הושלמו (${saved.approved.length} מתוך ${saved.fileSignature.keyCount} שדות) - העלו את אותו קובץ כדי להמשיך`;
  }
}

function checkFileMatch(newSignature) {
  const saved = loadSavedProgress();
  if (!saved || !saved.fileSignature) {
    return { status: 'new' };
  }
  if (newSignature.structureHash === saved.fileSignature.structureHash) {
    return { status: 'match', saved };
  }
  return { status: 'different', saved };
}

function savePreference(key, value) {
  const prefs = JSON.parse(localStorage.getItem('passportcard_prefs') || '{}');
  prefs[key] = value;
  localStorage.setItem('passportcard_prefs', JSON.stringify(prefs));
}

function getPreference(key, defaultValue = null) {
  const prefs = JSON.parse(localStorage.getItem('passportcard_prefs') || '{}');
  return prefs.hasOwnProperty(key) ? prefs[key] : defaultValue;
}

// ============================================
// File Handling
// ============================================
function handleDragOver(e) {
  e.preventDefault();
  el.uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
  e.preventDefault();
  el.uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
  e.preventDefault();
  el.uploadArea.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.name.endsWith('.json') || file.type === 'application/json') {
      loadFile(file);
    } else {
      showToast('אנא בחרו קובץ JSON', 'error');
    }
  }
}

function handleFileSelect(e) {
  if (e.target.files.length > 0) {
    loadFile(e.target.files[0]);
  }
}

function loadFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      state.loadedFileName = file.name;
      const signature = generateFileSignature(data, file.name, file.size);
      state.fileSignature = signature;

      const matchResult = checkFileMatch(signature);

      if (matchResult.status === 'match') {
        state.pendingData = data;
        const progressPercent = Math.round((matchResult.saved.approved.length / signature.keyCount) * 100);
        el.modalResumeFilename.textContent = file.name;
        el.modalResumeProgress.textContent = `${progressPercent}% (${matchResult.saved.approved.length} מתוך ${signature.keyCount} שדות)`;
        el.modalResumeDate.textContent = new Date(matchResult.saved.lastUpdated).toLocaleString('he-IL');
        showModal('modal-resume');
      } else if (matchResult.status === 'different') {
        state.pendingData = data;
        el.modalDiffNew.textContent = `${file.name} (${signature.keyCount} שדות)`;
        el.modalDiffOld.textContent = `${matchResult.saved.fileSignature.name} (${matchResult.saved.fileSignature.keyCount} שדות)`;
        showModal('modal-different-file');
      } else {
        initializeWizard(data);
      }
    } catch (error) {
      showToast('שגיאה בקריאת הקובץ - ודאו שזה קובץ JSON תקין', 'error');
      console.error(error);
    }
  };
  reader.readAsText(file);
}

// ============================================
// Wizard Initialization
// ============================================
function initializeWizard(data, resume = false) {
  state.originalData = JSON.parse(JSON.stringify(data));
  state.currentData = JSON.parse(JSON.stringify(data));

  // Build sections from top-level keys
  state.sections = [];
  for (const key in data) {
    if (key === '$meta') continue;
    const value = data[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const fields = flattenToFields(value, key);
      if (fields.length > 0) {
        state.sections.push({ name: key, fields });
      }
    }
  }

  // Load saved progress if resuming
  if (resume) {
    const saved = loadSavedProgress();
    if (saved) {
      state.approved = new Set(saved.approved);
      state.edited = saved.edited || {};
      state.currentSectionIndex = saved.currentSection || 0;
      state.currentFieldIndex = saved.currentIndex || 0;
    }
  } else {
    state.approved = new Set();
    state.edited = {};
    state.currentSectionIndex = 0;
    state.currentFieldIndex = 0;
  }

  // Show tutorial if first time
  const showTutorial = getPreference('showTutorial', true);
  if (showTutorial && !resume) {
    showModal('modal-tutorial');
  }

  // Update UI
  showWizardScreen();
  renderMinimap();
  renderCurrentSection();
  updateProgress();
  saveProgress();

  showToast(`קובץ ${state.loadedFileName} נטען בהצלחה`, 'success');
}

function flattenToFields(obj, prefix = '') {
  const fields = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      fields.push(...flattenToFields(value, fullKey));
    } else {
      fields.push({ key: fullKey, originalValue: String(value) });
    }
  }
  return fields;
}

// ============================================
// Hierarchical Tree Building
// ============================================
function buildFieldTree(fields) {
  const tree = {};
  
  fields.forEach(field => {
    const parts = field.key.split('.');
    let current = tree;
    
    // Navigate/create the tree structure
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      
      if (isLast) {
        // This is a leaf node (actual field)
        if (!current._fields) {
          current._fields = [];
        }
        current._fields.push(field);
      } else {
        // This is an intermediate node (group)
        if (!current[part]) {
          current[part] = { _isGroup: true, _expanded: true };
        }
        current = current[part];
      }
    }
  });
  
  return tree;
}

// Count all fields in a group (including nested)
function countFieldsInGroup(group) {
  let count = 0;
  if (group._fields) {
    count += group._fields.length;
  }
  for (const key in group) {
    if (key.startsWith('_')) continue;
    count += countFieldsInGroup(group[key]);
  }
  return count;
}

// Count approved fields in a group
function countApprovedInGroup(group) {
  let count = 0;
  if (group._fields) {
    group._fields.forEach(field => {
      if (state.approved.has(field.key)) count++;
    });
  }
  for (const key in group) {
    if (key.startsWith('_')) continue;
    count += countApprovedInGroup(group[key]);
  }
  return count;
}

// Generate unique group path
function getGroupPath(sectionName, parentPath, groupName) {
  return parentPath ? `${parentPath}.${groupName}` : `${sectionName}.${groupName}`;
}

// Check if group is expanded (from state)
function isGroupExpanded(groupPath) {
  if (!state.expandedGroups) {
    state.expandedGroups = new Set();
    return true; // Default expanded
  }
  // If not in collapsedGroups, it's expanded (default state)
  if (!state.collapsedGroups) {
    return true;
  }
  return !state.collapsedGroups.has(groupPath);
}

// Toggle group expand/collapse
window.toggleGroup = function(groupPath) {
  if (!state.collapsedGroups) {
    state.collapsedGroups = new Set();
  }
  
  if (state.collapsedGroups.has(groupPath)) {
    state.collapsedGroups.delete(groupPath);
  } else {
    state.collapsedGroups.add(groupPath);
  }
  
  // Re-render current section
  renderCurrentSection();
};

// ============================================
// Screen Navigation
// ============================================
function showWelcomeScreen() {
  el.welcomeScreen.style.display = 'flex';
  el.wizardContainer.classList.remove('visible');
  el.summaryScreen.classList.remove('visible');
  el.progressBarContainer.classList.remove('visible');
  el.headerStep.classList.remove('visible');
  el.btnReset.style.display = 'none';
  el.btnHeaderDownload.style.display = 'none';
  el.btnUpload.style.display = 'none';
  el.keyboardHint.classList.remove('visible');
  el.footer.style.display = 'block';
  document.body.classList.remove('wizard-active');
  closeMobileMenu();
  checkSavedProgress();
}

function showWizardScreen() {
  el.welcomeScreen.style.display = 'none';
  el.wizardContainer.classList.add('visible');
  el.summaryScreen.classList.remove('visible');
  el.progressBarContainer.classList.add('visible');
  el.headerStep.classList.add('visible');
  el.btnReset.style.display = 'flex';
  el.btnHeaderDownload.style.display = 'flex';
  el.btnUpload.style.display = 'none';
  el.keyboardHint.classList.add('visible');
  el.footer.style.display = 'none';
  document.body.classList.add('wizard-active');
}

function showSummaryScreen() {
  el.welcomeScreen.style.display = 'none';
  el.wizardContainer.classList.remove('visible');
  el.summaryScreen.classList.add('visible');
  el.progressBarContainer.classList.remove('visible');
  el.headerStep.classList.remove('visible');
  el.btnReset.style.display = 'flex';
  el.btnHeaderDownload.style.display = 'flex';
  el.btnUpload.style.display = 'none';
  el.keyboardHint.classList.remove('visible');
  el.footer.style.display = 'block';
  document.body.classList.remove('wizard-active');
  closeMobileMenu();

  // Update summary stats
  el.summaryApproved.textContent = state.approved.size;
  el.summaryEdited.textContent = Object.keys(state.edited).length;

  // Show changes list
  const editedKeys = Object.keys(state.edited);
  if (editedKeys.length > 0) {
    el.summaryChanges.style.display = 'block';
    el.summaryChangesList.innerHTML = editedKeys.map(key => {
      const original = getOriginalValue(key);
      const edited = state.edited[key];
      return `
        <div class="summary-change-item">
          <div class="summary-change-key">${key}</div>
          <div class="summary-change-values">
            <div class="summary-change-before">${escapeHtml(original)}</div>
            <i class="ti ti-arrow-left summary-change-arrow"></i>
            <div class="summary-change-after">${escapeHtml(edited)}</div>
          </div>
        </div>
      `;
    }).join('');
  } else {
    el.summaryChanges.style.display = 'none';
  }

  // Big confetti burst
  triggerConfetti(100);
}

function resetAndShowWelcome() {
  clearSavedProgress();
  state.originalData = null;
  state.currentData = null;
  state.sections = [];
  state.approved = new Set();
  state.edited = {};
  state.currentSectionIndex = 0;
  state.currentFieldIndex = 0;
  state.consecutiveApprovals = 0;
  showWelcomeScreen();
}

// ============================================
// Minimap
// ============================================
function renderMinimap() {
  const icons = {
    'common': 'ti-puzzle',
    'auth': 'ti-lock',
    'dashboard': 'ti-dashboard',
    'policies': 'ti-file-text',
    'cards': 'ti-credit-card',
    'claims': 'ti-file-invoice',
    'profile': 'ti-user',
    'accessibility': 'ti-accessible',
    'layouts': 'ti-layout',
    'components': 'ti-components',
    'ds': 'ti-palette'
  };

  el.minimapList.innerHTML = state.sections.map((section, index) => {
    const approvedCount = section.fields.filter(f => state.approved.has(f.key)).length;
    const totalCount = section.fields.length;
    const isComplete = approvedCount === totalCount;
    const isCurrent = index === state.currentSectionIndex;
    const icon = icons[section.name] || 'ti-folder';

    let statusClass = 'pending';
    let statusIcon = 'ti-circle';
    if (isComplete) {
      statusClass = 'completed';
      statusIcon = 'ti-check';
    } else if (isCurrent) {
      statusClass = 'current';
      statusIcon = 'ti-point-filled';
    }

    return `
      <li class="minimap-item ${isCurrent ? 'current' : ''} ${isComplete ? 'completed' : ''}" 
          data-section="${index}" onclick="navigateToSection(${index})">
        <span class="minimap-item-icon ${statusClass}"><i class="ti ${statusIcon}"></i></span>
        <span class="minimap-item-text">${section.name}</span>
        <span class="minimap-item-count">${approvedCount}/${totalCount}</span>
      </li>
    `;
  }).join('');

  updateMinimapStats();
}

function updateMinimapStats() {
  const totalFields = state.sections.reduce((sum, s) => sum + s.fields.length, 0);
  el.minimapApproved.textContent = state.approved.size;
  el.minimapEdited.textContent = Object.keys(state.edited).length;
  el.minimapTotal.textContent = totalFields;
}

window.navigateToSection = function(index) {
  if (index >= 0 && index < state.sections.length) {
    state.currentSectionIndex = index;
    state.currentFieldIndex = 0;
    renderMinimap();
    renderCurrentSection();
    updateProgress();
    saveProgress();
    closeMobileMenu();
  }
};

// ============================================
// Breadcrumb Key Display Helper
// ============================================
function formatKeyAsBreadcrumb(key) {
  const parts = key.split('.');
  return parts.map((part, i) => {
    const isLast = i === parts.length - 1;
    return `<span class="${isLast ? 'breadcrumb-current' : 'breadcrumb-parent'}">${part}</span>`;
  }).join('<span class="breadcrumb-sep"> › </span>');
}

// ============================================
// Single Dropdown Logic - Only one card expanded at a time
// ============================================
function closeAllFieldCards() {
  document.querySelectorAll('.field-card.expanded').forEach(card => {
    card.classList.remove('expanded', 'editing');
  });
}

// Expand a specific field card
window.expandFieldCard = function(key) {
  const card = document.querySelector(`.field-card[data-key="${key}"]`);
  if (!card) return;
  
  const wasExpanded = card.classList.contains('expanded');
  
  // Close all cards first (single dropdown behavior)
  closeAllFieldCards();
  
  // Toggle - if it was expanded, leave it closed; otherwise expand it
  if (!wasExpanded) {
    card.classList.add('expanded');
    // Scroll into view
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
};

// ============================================
// Section Rendering
// ============================================
function renderCurrentSection() {
  const section = state.sections[state.currentSectionIndex];
  if (!section) return;

  el.sectionTitle.textContent = section.name;
  el.sectionSubtitle.textContent = `${section.fields.length} שדות`;
  el.headerStep.textContent = `סקשן ${state.currentSectionIndex + 1} מתוך ${state.sections.length}`;

  // Build tree structure from fields (skip the section name prefix)
  const tree = buildFieldTreeFromSection(section);
  
  // Render the tree
  el.fieldsContainer.innerHTML = renderFieldTree(tree, section.name, '', 0);
  
  // Add click handler for field card expansion
  window.handleFieldCardClick = function(event, key) {
    // Don't expand if clicking on buttons or textarea
    if (event.target.closest('button') || event.target.closest('textarea')) {
      return;
    }
    expandFieldCard(key);
  };

  // Update navigation buttons
  el.btnPrevSection.disabled = state.currentSectionIndex === 0;

  const isLastSection = state.currentSectionIndex === state.sections.length - 1;
  const allApprovedInSection = section.fields.every(f => state.approved.has(f.key));

  if (isLastSection && allApprovedInSection) {
    el.btnNextSection.innerHTML = '<i class="ti ti-check"></i> סיום';
  } else {
    el.btnNextSection.innerHTML = 'הבא <i class="ti ti-arrow-left"></i>';
  }

  // Animate in
  el.wizardContent.classList.add('animate-slide-in');
  setTimeout(() => el.wizardContent.classList.remove('animate-slide-in'), 300);
}

// Build tree from section fields (removes section prefix from keys for tree building)
function buildFieldTreeFromSection(section) {
  const tree = {};
  
  section.fields.forEach(field => {
    // Remove section name prefix from key for tree building
    const keyWithoutSection = field.key.replace(`${section.name}.`, '');
    const parts = keyWithoutSection.split('.');
    let current = tree;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      
      if (isLast) {
        // Leaf node - store the field
        if (!current._fields) {
          current._fields = [];
        }
        current._fields.push(field);
      } else {
        // Intermediate node - create group if needed
        if (!current[part]) {
          current[part] = { _isGroup: true };
        }
        current = current[part];
      }
    }
  });
  
  return tree;
}

// Render the tree recursively
function renderFieldTree(tree, sectionName, parentPath, depth) {
  let html = '';
  
  // First, render direct fields (if any)
  if (tree._fields && tree._fields.length > 0) {
    tree._fields.forEach((field, index) => {
      html += renderFieldCard(field, index);
    });
  }
  
  // Then, render child groups
  const groups = Object.keys(tree).filter(k => !k.startsWith('_'));
  
  groups.forEach(groupName => {
    const group = tree[groupName];
    const groupPath = parentPath ? `${parentPath}.${groupName}` : `${sectionName}.${groupName}`;
    const isExpanded = isGroupExpanded(groupPath);
    const totalFields = countFieldsInGroup(group);
    const approvedFields = countApprovedInGroup(group);
    const isComplete = totalFields > 0 && approvedFields === totalFields;
    
    html += `
      <div class="field-group ${isExpanded ? 'expanded' : 'collapsed'} ${isComplete ? 'complete' : ''}" data-group="${groupPath}" data-depth="${depth}">
        <div class="field-group-header" onclick="toggleGroup('${escapeAttr(groupPath)}')" style="padding-right: ${depth * 16}px;">
          <i class="ti ${isExpanded ? 'ti-chevron-down' : 'ti-chevron-left'} field-group-arrow"></i>
          <span class="field-group-name">${groupName}</span>
          <span class="field-group-count">${approvedFields}/${totalFields}</span>
          ${isComplete ? '<i class="ti ti-check field-group-check"></i>' : ''}
        </div>
        <div class="field-group-content" style="${isExpanded ? '' : 'display: none;'}">
          ${renderFieldTree(group, sectionName, groupPath, depth + 1)}
        </div>
      </div>
    `;
  });
  
  return html;
}

// Render a single field card
function renderFieldCard(field, index) {
  const isApproved = state.approved.has(field.key);
  const isEdited = state.edited.hasOwnProperty(field.key);
  const currentValue = isEdited ? state.edited[field.key] : field.originalValue;

  let cardClasses = 'field-card';
  if (isApproved) cardClasses += ' approved';
  if (isEdited) cardClasses += ' edited';

  // Use breadcrumb format for key display
  const breadcrumbKey = formatKeyAsBreadcrumb(field.key);
  
  // Get just the last part of the key for the title (the field name)
  const keyParts = field.key.split('.');
  const fieldName = keyParts[keyParts.length - 1];
  
  // Truncate the value for collapsed header display
  const maxTitleChars = 50;
  const truncatedTitle = currentValue.length > maxTitleChars 
    ? currentValue.substring(0, maxTitleChars) + '...' 
    : currentValue;

  return `
    <div class="${cardClasses}" data-key="${field.key}" data-index="${index}" onclick="handleFieldCardClick(event, '${escapeAttr(field.key)}')">
      <div class="field-card-header">
        <span class="field-card-title-preview">${escapeHtml(truncatedTitle)}</span>
        <div class="field-card-key field-card-breadcrumb">${breadcrumbKey}</div>
        <div class="field-card-badges">
          ${isApproved ? '<span class="badge badge-approved">אושר</span>' : ''}
          ${isEdited ? '<span class="badge badge-edited">נערך</span>' : ''}
        </div>
        <div class="field-card-quick-actions">
          <button class="quick-action-btn approve" onclick="event.stopPropagation(); quickApproveField('${escapeAttr(field.key)}')" title="אישור מהיר" ${isApproved ? 'style="display:none"' : ''}>
            <i class="ti ti-check"></i>
          </button>
          <button class="quick-action-btn edit" onclick="event.stopPropagation(); quickEditField('${escapeAttr(field.key)}')" title="עריכה מהירה">
            <i class="ti ti-edit"></i>
          </button>
        </div>
        <i class="ti ti-chevron-down field-card-expand-icon"></i>
        <div class="field-card-actions">
          <button class="entry-action-btn" onclick="event.stopPropagation(); copyToClipboard('${escapeAttr(currentValue)}')" title="העתקה">
            <i class="ti ti-copy"></i>
          </button>
          ${isApproved ? `
            <button class="entry-action-btn" onclick="event.stopPropagation(); unapproveField('${field.key}')" title="ביטול אישור">
              <i class="ti ti-x"></i>
            </button>
          ` : ''}
        </div>
      </div>
      <div class="field-card-content">
        <div class="field-value-display">${escapeHtml(currentValue)}</div>
        <div class="field-edit-area">
          <label class="field-edit-label">ערך חדש:</label>
          <textarea class="field-edit-textarea" data-key="${field.key}" data-original="${escapeAttr(field.originalValue)}" onclick="event.stopPropagation()">${escapeHtml(currentValue)}</textarea>
        </div>
      </div>
      <div class="field-card-footer">
        <button class="btn btn-secondary btn-edit" onclick="event.stopPropagation(); toggleEditMode('${field.key}')">
          <i class="ti ti-edit"></i>
          עריכה
        </button>
        <button class="btn btn-primary btn-approve" onclick="event.stopPropagation(); approveField('${field.key}')">
          <i class="ti ti-check"></i>
          אישור
        </button>
        <button class="btn btn-secondary btn-cancel" onclick="event.stopPropagation(); cancelEdit('${field.key}')">
          ביטול
        </button>
        <button class="btn btn-primary btn-save" onclick="event.stopPropagation(); saveEdit('${field.key}')">
          <i class="ti ti-check"></i>
          שמור
        </button>
      </div>
    </div>
  `;
}

// ============================================
// Field Actions
// ============================================
window.toggleEditMode = function(key) {
  const card = document.querySelector(`.field-card[data-key="${key}"]`);
  if (card) {
    const wasEditing = card.classList.contains('editing');
    
    if (!wasEditing) {
      card.classList.add('editing');
      const textarea = card.querySelector('.field-edit-textarea');
      textarea.focus();
    }
  }
};

window.cancelEdit = function(key) {
  const card = document.querySelector(`.field-card[data-key="${key}"]`);
  if (card) {
    card.classList.remove('editing');
    const textarea = card.querySelector('.field-edit-textarea');
    const original = state.edited[key] || getOriginalValue(key);
    textarea.value = original;
  }
};

// Collapse card after clicking outside
window.collapseFieldCard = function(key) {
  const card = document.querySelector(`.field-card[data-key="${key}"]`);
  if (card) {
    card.classList.remove('expanded', 'editing');
  }
};

window.saveEdit = function(key) {
  const card = document.querySelector(`.field-card[data-key="${key}"]`);
  if (!card) return;

  const textarea = card.querySelector('.field-edit-textarea');
  const newValue = textarea.value;
  const originalValue = textarea.dataset.original;

  if (newValue !== originalValue) {
    state.edited[key] = newValue;
    card.classList.add('edited');
  } else {
    delete state.edited[key];
    card.classList.remove('edited');
  }

  card.classList.remove('editing');
  // Collapse the card after saving
  card.classList.remove('expanded');

  // Update display
  const display = card.querySelector('.field-value-display');
  display.textContent = newValue;
  const preview = card.querySelector('.field-card-collapsed-preview');
  preview.textContent = newValue;

  // Update badges
  updateFieldBadges(card, key);
  saveProgress();
  updateMinimapStats();
  
  showToast('השינויים נשמרו', 'success');
};

window.approveField = function(key) {
  const card = document.querySelector(`.field-card[data-key="${key}"]`);
  if (!card) return;

  state.approved.add(key);
  card.classList.add('approved', 'animate-approve');
  card.classList.remove('editing', 'expanded');

  updateFieldBadges(card, key);
  updateQuickActionButtons(card, key);
  saveProgress();
  updateProgress();
  renderMinimap();

  // Track consecutive approvals
  state.consecutiveApprovals++;
  if (state.consecutiveApprovals >= 10) {
    triggerConfetti(30);
    state.consecutiveApprovals = 0;
  }

  // Check section completion
  checkSectionCompletion();
};

// Quick approve from collapsed card (doesn't expand)
window.quickApproveField = function(key) {
  const card = document.querySelector(`.field-card[data-key="${key}"]`);
  if (!card) return;
  
  // If already approved, do nothing
  if (state.approved.has(key)) return;

  state.approved.add(key);
  card.classList.add('approved', 'animate-approve');

  updateFieldBadges(card, key);
  updateQuickActionButtons(card, key);
  saveProgress();
  updateProgress();
  renderMinimap();

  // Track consecutive approvals
  state.consecutiveApprovals++;
  if (state.consecutiveApprovals >= 10) {
    triggerConfetti(30);
    state.consecutiveApprovals = 0;
  }

  // Check section completion
  checkSectionCompletion();
};

// Quick edit - expands card AND enters edit mode
window.quickEditField = function(key) {
  const card = document.querySelector(`.field-card[data-key="${key}"]`);
  if (!card) return;
  
  // Close all other cards first
  closeAllFieldCards();
  
  // Expand this card and enter edit mode
  card.classList.add('expanded', 'editing');
  
  // Focus the textarea
  const textarea = card.querySelector('.field-edit-textarea');
  if (textarea) {
    setTimeout(() => {
      textarea.focus();
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
};

// Update quick action buttons visibility
function updateQuickActionButtons(card, key) {
  const quickApproveBtn = card.querySelector('.quick-action-btn.approve');
  if (quickApproveBtn) {
    if (state.approved.has(key)) {
      quickApproveBtn.style.display = 'none';
    } else {
      quickApproveBtn.style.display = 'flex';
    }
  }
}

window.unapproveField = function(key) {
  const card = document.querySelector(`.field-card[data-key="${key}"]`);
  if (!card) return;

  state.approved.delete(key);
  card.classList.remove('approved');
  // Expand the card when unapproving so user can see it
  closeAllFieldCards();
  card.classList.add('expanded');

  updateFieldBadges(card, key);
  updateQuickActionButtons(card, key);
  saveProgress();
  updateProgress();
  renderMinimap();
  state.consecutiveApprovals = 0;
};

function updateFieldBadges(card, key) {
  const badgesContainer = card.querySelector('.field-card-badges');
  const isApproved = state.approved.has(key);
  const isEdited = state.edited.hasOwnProperty(key);

  badgesContainer.innerHTML = `
    ${isApproved ? '<span class="badge badge-approved">אושר</span>' : ''}
    ${isEdited ? '<span class="badge badge-edited">נערך</span>' : ''}
  `;

  // Update action buttons
  const actionsContainer = card.querySelector('.field-card-actions');
  const currentValue = isEdited ? state.edited[key] : getOriginalValue(key);
  actionsContainer.innerHTML = `
    <button class="entry-action-btn" onclick="copyToClipboard('${escapeAttr(currentValue)}')" title="העתקה">
      <i class="ti ti-copy"></i>
    </button>
    ${isApproved ? `
      <button class="entry-action-btn" onclick="unapproveField('${key}')" title="ביטול אישור">
        <i class="ti ti-x"></i>
      </button>
    ` : ''}
  `;
}

function approveAllInSection() {
  const section = state.sections[state.currentSectionIndex];
  if (!section) return;

  let approved = 0;
  section.fields.forEach(field => {
    if (!state.approved.has(field.key)) {
      state.approved.add(field.key);
      approved++;
    }
  });

  if (approved > 0) {
    showToast(`${approved} שדות אושרו`, 'success');
    renderCurrentSection();
    saveProgress();
    updateProgress();
    renderMinimap();
    checkSectionCompletion();
  }
}

function checkSectionCompletion() {
  const section = state.sections[state.currentSectionIndex];
  if (!section) return;

  const allApproved = section.fields.every(f => state.approved.has(f.key));
  if (allApproved) {
    triggerConfetti(50);
    showToast('הסקשן הושלם', 'success');

    // Auto advance if not last section
    if (state.currentSectionIndex < state.sections.length - 1) {
      setTimeout(() => navigateSection(1), 1000);
    }
  }
}

// ============================================
// Navigation
// ============================================
function navigateSection(direction) {
  const newIndex = state.currentSectionIndex + direction;

  if (newIndex < 0) return;

  if (newIndex >= state.sections.length) {
    // Check if all approved
    const totalFields = state.sections.reduce((sum, s) => sum + s.fields.length, 0);
    if (state.approved.size >= totalFields) {
      showSummaryScreen();
    } else {
      showToast('עדיין יש שדות שלא אושרו', 'error');
    }
    return;
  }

  state.currentSectionIndex = newIndex;
  state.currentFieldIndex = 0;
  renderMinimap();
  renderCurrentSection();
  updateProgress();
  saveProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// Progress
// ============================================
function updateProgress() {
  const totalFields = state.sections.reduce((sum, s) => sum + s.fields.length, 0);
  const approvedCount = state.approved.size;
  const percentage = totalFields > 0 ? Math.round((approvedCount / totalFields) * 100) : 0;

  el.progressBarFill.style.width = `${percentage}%`;
  el.progressText.textContent = `${approvedCount} מתוך ${totalFields} אושרו`;
  el.progressPercentage.textContent = `${percentage}%`;

  // Milestone toasts
  const milestones = [25, 50, 75];
  for (const milestone of milestones) {
    if (percentage >= milestone && state.lastMilestone < milestone) {
      state.lastMilestone = milestone;
      if (milestone === 25) showToast('רבע מהדרך', 'success');
      else if (milestone === 50) showToast('חצי מהדרך', 'success');
      else if (milestone === 75) showToast('כמעט שם', 'success');
    }
  }
}

// ============================================
// Download
// ============================================
function downloadFile() {
  if (!state.currentData) return;

  // Apply edits
  for (const [key, value] of Object.entries(state.edited)) {
    setNestedValue(state.currentData, key, value);
  }

  const BOM = '\uFEFF';
  const dataStr = JSON.stringify(state.currentData, null, 2);
  const blob = new Blob([BOM + dataStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  const filename = `he-reviewed-${date}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 150);
  showToast(`הקובץ ${filename} הורד בהצלחה`, 'success');
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

function getOriginalValue(key) {
  const keys = key.split('.');
  let current = state.originalData;
  for (const k of keys) {
    if (current && k in current) {
      current = current[k];
    } else {
      return '';
    }
  }
  return String(current);
}

// ============================================
// Modals
// ============================================
function showModal(id) {
  document.getElementById(id).classList.add('visible');
}

function hideModal(id) {
  document.getElementById(id).classList.remove('visible');
}

// ============================================
// Mobile Menu
// ============================================
function toggleMobileMenu() {
  el.minimap.classList.toggle('mobile-open');
  el.mobileMenuOverlay.classList.toggle('visible');
}

function closeMobileMenu() {
  el.minimap.classList.remove('mobile-open');
  el.mobileMenuOverlay.classList.remove('visible');
}

// ============================================
// Keyboard Shortcuts
// ============================================
function handleKeyboardShortcuts(e) {
  // Only when wizard is visible
  if (!el.wizardContainer.classList.contains('visible')) return;

  // Ignore if typing in textarea
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
    if (e.key === 'Escape') {
      e.target.blur();
      const card = e.target.closest('.field-card');
      if (card && card.classList.contains('editing')) {
        cancelEdit(card.dataset.key);
      }
    }
    return;
  }

  const section = state.sections[state.currentSectionIndex];
  if (!section) return;

  switch (e.key.toLowerCase()) {
    case 'a':
      e.preventDefault();
      approveAllInSection();
      break;
    case 'd':
      e.preventDefault();
      toggleTheme();
      break;
    case '?':
      e.preventDefault();
      showModal('modal-tutorial');
      break;
    case 'arrowleft':
      e.preventDefault();
      navigateSection(1);
      break;
    case 'arrowright':
      e.preventDefault();
      navigateSection(-1);
      break;
  }

  // Number keys for section navigation
  if (e.key >= '1' && e.key <= '9') {
    const sectionIndex = parseInt(e.key) - 1;
    if (sectionIndex < state.sections.length) {
      e.preventDefault();
      navigateToSection(sectionIndex);
    }
  }
}

// ============================================
// Falling PassportCards (instead of confetti)
// ============================================
const CARD_IMAGE_URL = 'https://www.passportcard.co.il/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2025/05/pcil-pc-group-378-238.png.webp';

function triggerConfetti(count = 50) {
  // Limit cards for performance
  const cardCount = Math.min(count, 25);
  for (let i = 0; i < cardCount; i++) {
    setTimeout(() => createFallingCard(), i * 50); // Faster spawn
  }
}

function createFallingCard() {
  const card = document.createElement('img');
  card.src = CARD_IMAGE_URL;
  card.className = 'falling-card';
  card.style.left = Math.random() * 100 + 'vw';
  
  // Random size between 50-100px
  const size = Math.random() * 50 + 50;
  card.style.width = size + 'px';
  
  // Random starting rotation
  const startRotation = Math.random() * 40 - 20;
  card.style.setProperty('--start-rotation', startRotation + 'deg');
  
  // Much faster fall - 0.8 to 1.5 seconds
  const duration = Math.random() * 0.7 + 0.8;
  card.style.animation = `cardFall ${duration}s ease-in forwards`;

  el.confettiContainer.appendChild(card);

  setTimeout(() => card.remove(), duration * 1000);
}

// ============================================
// Utilities
// ============================================
window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('הועתק ללוח', 'success');
  });
};

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function escapeAttr(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="ti ${type === 'success' ? 'ti-check' : type === 'error' ? 'ti-x' : 'ti-info-circle'}"></i>
    ${message}
  `;
  el.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

