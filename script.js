/**
 * script.js — Code-to-Card Generator
 * 
 * Architecture:
 *  - state: single source of truth object
 *  - applyState(): reads state → updates DOM/CSS
 *  - Event listeners mutate state → call applyState()
 *  - Export: uses html2canvas on #cardBg (inner card area)
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   1. STATE
═══════════════════════════════════════════════════════════════ */
const state = {
  code:         `const greet = (name) => {\n  return \`Hello, \${name}! 👋\`;\n};\n\nconsole.log(greet('World'));`,
  language:     'javascript',
  fileName:     'index.js',
  gradientStart: '#6366f1',
  gradientEnd:   '#8b5cf6',
  gradientAngle: 135,
  padding:       48,
  borderRadius:  16,
  fontSize:      14,
  windowStyle:   'mac',     // 'mac' | 'windows' | 'minimal'
  codeTheme:     'dark',    // 'dark' | 'light'
  shadow:        true,
  watermark:     true,
};

/* ═══════════════════════════════════════════════════════════════
   2. DOM REFS
═══════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

const dom = {
  codeInput:       $('codeInput'),
  languageSelect:  $('languageSelect'),
  fileNameInput:   $('fileNameInput'),
  gradientStart:   $('gradientStart'),
  gradientEnd:     $('gradientEnd'),
  gradientAngle:   $('gradientAngle'),
  paddingRange:    $('paddingRange'),
  radiusRange:     $('radiusRange'),
  fontSizeRange:   $('fontSizeRange'),

  // Labels
  angleVal:        $('angleVal'),
  paddingVal:      $('paddingVal'),
  radiusVal:       $('radiusVal'),
  fontSizeVal:     $('fontSizeVal'),
  gradientStartHex: $('gradientStartHex'),
  gradientEndHex:  $('gradientEndHex'),

  // Preview elements
  cardBg:          $('cardBg'),
  codeCard:        $('codeCard'),
  codeHighlight:   $('codeHighlight'),
  chromeMac:       $('chromeMac'),
  chromeWindows:   $('chromeWindows'),
  chromeMinimal:   $('chromeMinimal'),
  chromeFilenameMac: $('chromeFilenameMac'),
  chromeFilenameWin: $('chromeFilenameWin'),
  chromeFilenameMin: $('chromeFilenameMin'),
  cardWatermark:   $('cardWatermark'),

  // Buttons
  btnDownload:     $('btnDownload'),
  btnCopyCode:     $('btnCopyCode'),
  btnRandomGradient: $('btnRandomGradient'),
  btnSavePreset:   $('btnSavePreset'),

  // Segmented groups
  windowStyleGroup: $('windowStyleGroup'),
  codeThemeGroup:   $('codeThemeGroup'),
  shadowGroup:      $('shadowGroup'),
  watermarkGroup:   $('watermarkGroup'),

  savedPresetsList: $('savedPresetsList'),
  toast:            $('toast'),
};

/* ═══════════════════════════════════════════════════════════════
   3. PRESET DEFINITIONS
═══════════════════════════════════════════════════════════════ */
const PRESETS = {
  twitter: {
    gradientStart: '#1d9bf0',
    gradientEnd:   '#0a71c0',
    gradientAngle: 145,
    padding:       40,
    borderRadius:  18,
    windowStyle:   'mac',
    codeTheme:     'dark',
    shadow:        true,
  },
  linkedin: {
    gradientStart: '#0072b1',
    gradientEnd:   '#00a0dc',
    gradientAngle: 160,
    padding:       48,
    borderRadius:  12,
    windowStyle:   'windows',
    codeTheme:     'light',
    shadow:        true,
  },
  minimal: {
    gradientStart: '#1a1a2e',
    gradientEnd:   '#16213e',
    gradientAngle: 180,
    padding:       32,
    borderRadius:  8,
    windowStyle:   'minimal',
    codeTheme:     'dark',
    shadow:        false,
  },
  neon: {
    gradientStart: '#0f0c29',
    gradientEnd:   '#302b63',
    gradientAngle: 135,
    padding:       48,
    borderRadius:  20,
    windowStyle:   'mac',
    codeTheme:     'dark',
    shadow:        true,
  },
  sunset: {
    gradientStart: '#f7971e',
    gradientEnd:   '#ffd200',
    gradientAngle: 120,
    padding:       44,
    borderRadius:  16,
    windowStyle:   'mac',
    codeTheme:     'dark',
    shadow:        true,
  },
  ocean: {
    gradientStart: '#1a6b4a',
    gradientEnd:   '#048c7f',
    gradientAngle: 150,
    padding:       44,
    borderRadius:  16,
    windowStyle:   'mac',
    codeTheme:     'dark',
    shadow:        true,
  },
};

/* ═══════════════════════════════════════════════════════════════
   4. APPLY STATE → DOM
═══════════════════════════════════════════════════════════════ */
function applyState() {
  const s = state;

  /* ── Gradient background ── */
  dom.cardBg.style.setProperty('--card-angle',   `${s.gradientAngle}deg`);
  dom.cardBg.style.setProperty('--card-g1',      s.gradientStart);
  dom.cardBg.style.setProperty('--card-g2',      s.gradientEnd);
  dom.cardBg.style.setProperty('--card-padding', `${s.padding}px`);
  dom.cardBg.style.setProperty('--card-outer-radius', `${s.borderRadius + 8}px`);

  /* ── Card border radius ── */
  dom.codeCard.style.setProperty('--card-inner-radius', `${s.borderRadius}px`);

  /* ── Shadow ── */
  dom.cardBg.classList.toggle('shadow-on', s.shadow);

  /* ── Font size ── */
  dom.codeCard.style.setProperty('--code-font-size', `${s.fontSize}px`);

  /* ── Code theme ── */
  dom.cardBg.classList.toggle('theme-light', s.codeTheme === 'light');
  // Swap Prism theme stylesheet
  const prismLink = document.getElementById('prism-theme-link');
  if (s.codeTheme === 'dark') {
    prismLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
    dom.codeCard.style.setProperty('--code-card-bg', '#1e1e2e');
  } else {
    prismLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';
    dom.codeCard.style.setProperty('--code-card-bg', '#fafafa');
  }

  /* ── Syntax highlighting ── */
  const lang = s.language === 'html' ? 'markup' : s.language;
  dom.codeHighlight.className = `language-${lang}`;
  dom.codeHighlight.textContent = s.code;
  if (window.Prism) Prism.highlightElement(dom.codeHighlight);

  /* ── Window chrome ── */
  dom.chromeMac.style.display     = s.windowStyle === 'mac'     ? 'flex'  : 'none';
  dom.chromeWindows.style.display = s.windowStyle === 'windows' ? 'flex'  : 'none';
  dom.chromeMinimal.style.display = s.windowStyle === 'minimal' ? 'flex'  : 'none';

  /* Filenames */
  dom.chromeFilenameMac.textContent = s.fileName;
  dom.chromeFilenameWin.textContent = s.fileName;
  dom.chromeFilenameMin.textContent = s.fileName;

  /* ── Watermark ── */
  dom.cardWatermark.style.display = s.watermark ? 'block' : 'none';

  /* ── Label readouts ── */
  dom.angleVal.textContent   = s.gradientAngle;
  dom.paddingVal.textContent = s.padding;
  dom.radiusVal.textContent  = s.borderRadius;
  dom.fontSizeVal.textContent = s.fontSize;
  dom.gradientStartHex.textContent = s.gradientStart;
  dom.gradientEndHex.textContent   = s.gradientEnd;
}

/* ═══════════════════════════════════════════════════════════════
   5. HELPER: update segmented control active state
═══════════════════════════════════════════════════════════════ */
function setSegmentActive(group, value) {
  group.querySelectorAll('.seg-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === value);
  });
}

/* ═══════════════════════════════════════════════════════════════
   6. SEGMENTED CONTROL FACTORY
═══════════════════════════════════════════════════════════════ */
function bindSegmented(groupEl, stateKey, callback) {
  groupEl.addEventListener('click', e => {
    const btn = e.target.closest('.seg-btn');
    if (!btn) return;
    const val = btn.dataset.value;

    // Parse booleans stored as 'on'/'off'
    if (val === 'on' || val === 'off') {
      state[stateKey] = val === 'on';
    } else {
      state[stateKey] = val;
    }

    setSegmentActive(groupEl, val);
    if (callback) callback(val);
    applyState();
  });
}

/* ═══════════════════════════════════════════════════════════════
   7. TOAST NOTIFICATION
═══════════════════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(msg, type = 'success') {
  dom.toast.textContent = msg;
  dom.toast.className   = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    dom.toast.classList.remove('show');
  }, 2400);
}

/* ═══════════════════════════════════════════════════════════════
   8. RANDOM GRADIENT GENERATOR
═══════════════════════════════════════════════════════════════ */
const GRADIENT_PALETTES = [
  ['#ff6b6b', '#feca57'], ['#48dbfb', '#ff9ff3'],
  ['#0abde3', '#48dbfb'], ['#ff9f43', '#ee5a24'],
  ['#6c5ce7', '#a29bfe'], ['#00b894', '#00cec9'],
  ['#e17055', '#fdcb6e'], ['#fd79a8', '#e84393'],
  ['#6d1b7b', '#d32f2f'], ['#1565c0', '#0d47a1'],
  ['#00695c', '#004d40'], ['#f57f17', '#e65100'],
  ['#37474f', '#263238'], ['#880e4f', '#4a148c'],
  ['#1a237e', '#283593'], ['#b71c1c', '#c62828'],
];

function randomGradient() {
  const pair  = GRADIENT_PALETTES[Math.floor(Math.random() * GRADIENT_PALETTES.length)];
  const angle = Math.floor(Math.random() * 360);

  state.gradientStart = pair[0];
  state.gradientEnd   = pair[1];
  state.gradientAngle = angle;

  // Sync controls
  dom.gradientStart.value  = pair[0];
  dom.gradientEnd.value    = pair[1];
  dom.gradientAngle.value  = angle;

  applyState();
  showToast('🎲 New gradient applied!');
}

/* ═══════════════════════════════════════════════════════════════
   9. APPLY PRESET
═══════════════════════════════════════════════════════════════ */
function applyPreset(name, data) {
  Object.assign(state, data);

  // Sync all controls to new state
  dom.gradientStart.value  = state.gradientStart;
  dom.gradientEnd.value    = state.gradientEnd;
  dom.gradientAngle.value  = state.gradientAngle;
  dom.paddingRange.value   = state.padding;
  dom.radiusRange.value    = state.borderRadius;

  setSegmentActive(dom.windowStyleGroup, state.windowStyle);
  setSegmentActive(dom.codeThemeGroup,   state.codeTheme);
  setSegmentActive(dom.shadowGroup,      state.shadow ? 'on' : 'off');

  // Highlight the active preset button
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.preset === name);
  });

  applyState();
  showToast(`✨ Preset "${name}" applied!`);
}

/* ═══════════════════════════════════════════════════════════════
   10. LOCAL STORAGE PRESETS
═══════════════════════════════════════════════════════════════ */
const LS_KEY = 'codecard_saved_presets';

function loadSavedPresets() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch { return {}; }
}

function persistSavedPresets(obj) {
  localStorage.setItem(LS_KEY, JSON.stringify(obj));
}

function renderSavedPresets() {
  const saved = loadSavedPresets();
  const keys = Object.keys(saved);
  dom.savedPresetsList.innerHTML = '';

  if (keys.length === 0) return;

  const label = document.createElement('div');
  label.className = 'section-label';
  label.style.cssText = 'margin-top:10px; margin-bottom:6px;';
  label.innerHTML = '<span class="section-label__dot"></span>Saved Presets';
  dom.savedPresetsList.appendChild(label);

  keys.forEach(name => {
    const item = document.createElement('div');
    item.className = 'saved-preset-item';

    const loadBtn = document.createElement('button');
    loadBtn.className = 'load-saved-btn';
    loadBtn.textContent = name;
    loadBtn.addEventListener('click', () => {
      applyPreset(name, saved[name]);
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.title = 'Delete preset';
    delBtn.addEventListener('click', () => {
      const s = loadSavedPresets();
      delete s[name];
      persistSavedPresets(s);
      renderSavedPresets();
      showToast(`🗑 Preset "${name}" deleted`);
    });

    item.appendChild(loadBtn);
    item.appendChild(delBtn);
    dom.savedPresetsList.appendChild(item);
  });
}

function saveCurrentAsPreset() {
  const name = prompt('Name your preset:');
  if (!name || !name.trim()) return;
  const trimmed = name.trim();

  const saved = loadSavedPresets();
  saved[trimmed] = {
    gradientStart: state.gradientStart,
    gradientEnd:   state.gradientEnd,
    gradientAngle: state.gradientAngle,
    padding:       state.padding,
    borderRadius:  state.borderRadius,
    windowStyle:   state.windowStyle,
    codeTheme:     state.codeTheme,
    shadow:        state.shadow,
  };
  persistSavedPresets(saved);
  renderSavedPresets();
  showToast(`💾 Preset "${trimmed}" saved!`);
}

/* ═══════════════════════════════════════════════════════════════
   11. EXPORT AS PNG (html2canvas)
═══════════════════════════════════════════════════════════════ */
async function exportCard() {
  const btn = dom.btnDownload;
  btn.disabled = true;
  btn.textContent = '⏳ Exporting…';

  try {
    // Capture the card background (gradient + inner card)
    const canvas = await html2canvas(dom.cardBg, {
      scale:            3,           // 3× for high-DPI / retina quality
      useCORS:          true,
      backgroundColor:  null,        // keep gradient transparency at edges
      logging:          false,
      imageTimeout:     0,
      allowTaint:       true,
    });

    // Create download link
    const link = document.createElement('a');
    const fileName = (state.fileName.replace(/\.[^.]+$/, '') || 'code-card');
    link.download = `${fileName}-codecard.png`;
    link.href     = canvas.toDataURL('image/png', 1.0);
    link.click();

    showToast('✅ Image downloaded!', 'success');
  } catch (err) {
    console.error('Export error:', err);
    showToast('❌ Export failed. See console.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '↓ Export PNG';
  }
}

/* ═══════════════════════════════════════════════════════════════
   12. COPY CODE TO CLIPBOARD
═══════════════════════════════════════════════════════════════ */
async function copyCode() {
  try {
    await navigator.clipboard.writeText(state.code);
    dom.btnCopyCode.textContent = '✓ Copied!';
    setTimeout(() => { dom.btnCopyCode.textContent = 'Copy'; }, 1800);
    showToast('📋 Code copied to clipboard!');
  } catch {
    showToast('❌ Clipboard not available', 'error');
  }
}

/* ═══════════════════════════════════════════════════════════════
   13. EVENT LISTENERS
═══════════════════════════════════════════════════════════════ */
function bindEvents() {

  /* ── Code textarea ── */
  dom.codeInput.addEventListener('input', () => {
    state.code = dom.codeInput.value;
    applyState();
  });

  /* Handle Tab key in textarea (indent instead of focus change) */
  dom.codeInput.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: ss, selectionEnd: se } = dom.codeInput;
      const v = dom.codeInput.value;
      dom.codeInput.value = v.slice(0, ss) + '  ' + v.slice(se);
      dom.codeInput.setSelectionRange(ss + 2, ss + 2);
      state.code = dom.codeInput.value;
      applyState();
    }
  });

  /* ── Language select ── */
  dom.languageSelect.addEventListener('change', () => {
    state.language = dom.languageSelect.value;
    applyState();
  });

  /* ── File name ── */
  dom.fileNameInput.addEventListener('input', () => {
    state.fileName = dom.fileNameInput.value;
    applyState();
  });

  /* ── Gradient controls ── */
  dom.gradientStart.addEventListener('input', () => {
    state.gradientStart = dom.gradientStart.value;
    applyState();
  });
  dom.gradientEnd.addEventListener('input', () => {
    state.gradientEnd = dom.gradientEnd.value;
    applyState();
  });
  dom.gradientAngle.addEventListener('input', () => {
    state.gradientAngle = +dom.gradientAngle.value;
    applyState();
  });

  /* ── Range sliders ── */
  dom.paddingRange.addEventListener('input', () => {
    state.padding = +dom.paddingRange.value;
    applyState();
  });
  dom.radiusRange.addEventListener('input', () => {
    state.borderRadius = +dom.radiusRange.value;
    applyState();
  });
  dom.fontSizeRange.addEventListener('input', () => {
    state.fontSize = +dom.fontSizeRange.value;
    applyState();
  });

  /* ── Segmented controls ── */
  bindSegmented(dom.windowStyleGroup, 'windowStyle');
  bindSegmented(dom.codeThemeGroup,   'codeTheme');
  bindSegmented(dom.shadowGroup,      'shadow');
  bindSegmented(dom.watermarkGroup,   'watermark');

  /* ── Preset buttons ── */
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.preset;
      if (PRESETS[name]) applyPreset(name, PRESETS[name]);
    });
  });

  /* ── Action buttons ── */
  dom.btnDownload.addEventListener('click', exportCard);
  dom.btnCopyCode.addEventListener('click', copyCode);
  dom.btnRandomGradient.addEventListener('click', randomGradient);
  dom.btnSavePreset.addEventListener('click', saveCurrentAsPreset);

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', e => {
    // Cmd/Ctrl + Shift + E → Export
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      exportCard();
    }
    // Cmd/Ctrl + Shift + C → Copy code
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      copyCode();
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   14. INIT
═══════════════════════════════════════════════════════════════ */
function init() {
  // Sync textarea to initial state
  dom.codeInput.value = state.code;

  // Sync range inputs
  dom.gradientStart.value  = state.gradientStart;
  dom.gradientEnd.value    = state.gradientEnd;
  dom.gradientAngle.value  = state.gradientAngle;
  dom.paddingRange.value   = state.padding;
  dom.radiusRange.value    = state.borderRadius;
  dom.fontSizeRange.value  = state.fontSize;

  // Sync segmented controls
  setSegmentActive(dom.windowStyleGroup, state.windowStyle);
  setSegmentActive(dom.codeThemeGroup,   state.codeTheme);
  setSegmentActive(dom.shadowGroup,      state.shadow ? 'on' : 'off');
  setSegmentActive(dom.watermarkGroup,   state.watermark ? 'on' : 'off');

  bindEvents();
  applyState();
  renderSavedPresets();

  // Welcome toast
  setTimeout(() => showToast('👋 Welcome to CodeCard!'), 600);
}

/* Wait for Prism to load before initialising */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
