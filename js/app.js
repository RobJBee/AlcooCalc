'use strict';

const DEFAULTS = {
  v0: 1.0,
  c0: 50,
  cf: 30,
  sconc: 150,
  k: 0.00063,
  preset: 'custom',
  advancedOpen: false,
  formulaOpen: false,
};

const STORAGE_KEY_INPUTS = 'alcoocalc_inputs';
const STORAGE_KEY_HISTORY = 'alcoocalc_history';
const MAX_HISTORY = 10;

const els = {};
let lastResults = null;

function $(id) {
  return document.getElementById(id);
}

function cacheEls() {
  els.presetSelect = $('presetSelect');
  els.v0Range = $('v0Range');
  els.v0Number = $('v0Number');
  els.c0Range = $('c0Range');
  els.c0Number = $('c0Number');
  els.cfRange = $('cfRange');
  els.cfNumber = $('cfNumber');
  els.sconcRange = $('sconcRange');
  els.sconcNumber = $('sconcNumber');
  els.kRange = $('kRange');
  els.kNumber = $('kNumber');
  els.advancedSection = $('advancedSection');
  els.errorBox = $('errorBox');
  els.resultWater = $('resultWater');
  els.resultSugar = $('resultSugar');
  els.resultFinalVolume = $('resultFinalVolume');
  els.resultExpansion = $('resultExpansion');
  els.btnReset = $('btnReset');
  els.btnCopy = $('btnCopy');
  els.copyFeedback = $('copyFeedback');
  els.formulaToggle = $('formulaToggle');
  els.formulaWrapper = $('formulaWrapper');
  els.formulaContainer = $('formulaContainer');
  els.formulaSteps = $('formulaSteps');
  els.historyList = $('historyList');
  els.btnClearHistory = $('btnClearHistory');
  els.langButtons = document.querySelectorAll('[data-lang-btn]');
}

function loadInputs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INPUTS);
    if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
  } catch (e) {
    /* ignore corrupted storage */
  }
  return Object.assign({}, DEFAULTS);
}

function saveInputs(state) {
  try {
    localStorage.setItem(STORAGE_KEY_INPUTS, JSON.stringify(state));
  } catch (e) {
    /* quota / private mode : on continue sans persister */
  }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore */
  }
  return [];
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (e) {
    /* ignore */
  }
}

function readInputsFromForm() {
  return {
    v0: parseFloat(els.v0Number.value),
    c0: parseFloat(els.c0Number.value),
    cf: parseFloat(els.cfNumber.value),
    sconc: parseFloat(els.sconcNumber.value),
    k: parseFloat(els.kNumber.value),
    preset: els.presetSelect.value,
    advancedOpen: els.advancedSection.open,
    formulaOpen: els.formulaWrapper.hidden === false,
  };
}

function applyInputsToForm(state) {
  els.v0Range.value = state.v0;
  els.v0Number.value = state.v0;
  els.c0Range.value = state.c0;
  els.c0Number.value = state.c0;
  els.cfRange.value = state.cf;
  els.cfNumber.value = state.cf;
  els.sconcRange.value = state.sconc;
  els.sconcNumber.value = state.sconc;
  els.kRange.value = state.k;
  els.kNumber.value = state.k;
  els.presetSelect.value = state.preset || 'custom';
  els.advancedSection.open = !!state.advancedOpen;
  setFormulaVisible(!!state.formulaOpen);
}

function syncPair(rangeEl, numberEl, onChange) {
  rangeEl.addEventListener('input', () => {
    numberEl.value = rangeEl.value;
    onChange();
  });
  numberEl.addEventListener('input', () => {
    rangeEl.value = numberEl.value;
    onChange();
  });
}

function setFormulaVisible(visible) {
  els.formulaWrapper.hidden = !visible;
  els.formulaToggle.setAttribute('aria-expanded', String(visible));
  els.formulaToggle.textContent = t(visible ? 'formulaToggleHide' : 'formulaToggleShow');
}

function showErrors(errorKeys) {
  if (!errorKeys || !errorKeys.length) {
    els.errorBox.hidden = true;
    els.errorBox.textContent = '';
    return;
  }
  els.errorBox.hidden = false;
  els.errorBox.textContent = errorKeys.map((k) => t(k)).join(' ');
}

function formatLiters(value) {
  return `${value.toFixed(3)} ${t('unitL')} (${(value * 1000).toFixed(0)} mL)`;
}

function renderResults(results) {
  if (!results.feasible) {
    els.resultWater.textContent = '—';
    els.resultSugar.textContent = '—';
    els.resultFinalVolume.textContent = '—';
    els.resultExpansion.textContent = '—';
    showErrors(results.errors);
    return;
  }
  showErrors(null);
  els.resultWater.textContent = formatLiters(results.Ve);
  els.resultSugar.textContent = `${results.ms.toFixed(1)} g`;
  els.resultFinalVolume.textContent = `${results.Vf.toFixed(3)} ${t('unitL')}`;
  els.resultExpansion.textContent = `${(results.expansion * 1000).toFixed(1)} mL`;
}

function compute({ recordHistory } = { recordHistory: false }) {
  const input = readInputsFromForm();
  const results = calculateDilution(input.v0, input.c0, input.cf, input.sconc, input.k);
  lastResults = results;
  renderResults(results);

  if (!els.formulaWrapper.hidden) {
    renderFormula(els.formulaContainer, els.formulaSteps, input.v0, input.c0, input.cf, input.sconc, input.k, results);
  }

  saveInputs(input);

  if (recordHistory && results.feasible) {
    pushHistory(input, results);
  }
}

function pushHistory(input, results) {
  const history = loadHistory();
  history.unshift({
    date: new Date().toISOString(),
    v0: input.v0,
    c0: input.c0,
    cf: input.cf,
    sconc: input.sconc,
    k: input.k,
    ve: results.Ve,
    ms: results.ms,
    vf: results.Vf,
    expansion: results.expansion,
  });
  saveHistory(history.slice(0, MAX_HISTORY));
  renderHistory();
}

function renderHistory() {
  const history = loadHistory();
  els.historyList.innerHTML = '';

  if (!history.length) {
    const empty = document.createElement('p');
    empty.className = 'history-empty';
    empty.textContent = t('historyEmpty');
    els.historyList.appendChild(empty);
    return;
  }

  history.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'history-row';
    const d = new Date(entry.date);
    row.innerHTML = `
      <span class="history-row__date">${d.toLocaleString()}</span>
      <span class="history-row__spec">${entry.v0}${t('unitL')} · ${entry.c0}${t('unitPercent')} → ${entry.cf}${t('unitPercent')}</span>
      <span class="history-row__result">${t('resultWater')}: ${entry.ve.toFixed(3)}${t('unitL')} · ${t('resultSugar')}: ${entry.ms.toFixed(1)}g</span>
    `;
    els.historyList.appendChild(row);
  });
}

function copyResults() {
  if (!lastResults || !lastResults.feasible) return;
  const input = readInputsFromForm();
  const text = t('copyTemplate')
    .replace('{date}', new Date().toLocaleString())
    .replace('{v0}', input.v0)
    .replace('{c0}', input.c0)
    .replace('{cf}', input.cf)
    .replace('{sconc}', input.sconc)
    .replace('{ve}', formatLiters(lastResults.Ve))
    .replace('{ms}', lastResults.ms.toFixed(1))
    .replace('{vf}', lastResults.Vf.toFixed(3))
    .replace('{exp}', (lastResults.expansion * 1000).toFixed(1));

  const feedback = () => {
    els.copyFeedback.textContent = t('copiedMsg');
    els.copyFeedback.hidden = false;
    setTimeout(() => {
      els.copyFeedback.hidden = true;
    }, 1800);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(feedback).catch(() => {});
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      feedback();
    } catch (e) {
      /* ignore */
    }
    document.body.removeChild(ta);
  }
}

function resetToDefaults() {
  applyInputsToForm(DEFAULTS);
  compute({ recordHistory: false });
}

function onLanguageChanged(lang) {
  populatePresets(els.presetSelect, lang);
  setFormulaVisible(els.formulaWrapper.hidden === false);
  renderHistory();
  compute({ recordHistory: false });
}

function wireEvents() {
  syncPair(els.v0Range, els.v0Number, () => compute({ recordHistory: false }));
  syncPair(els.c0Range, els.c0Number, () => compute({ recordHistory: false }));
  syncPair(els.cfRange, els.cfNumber, () => compute({ recordHistory: false }));
  syncPair(els.sconcRange, els.sconcNumber, () => compute({ recordHistory: false }));
  syncPair(els.kRange, els.kNumber, () => compute({ recordHistory: false }));

  [els.v0Number, els.c0Number, els.cfNumber, els.sconcNumber, els.kNumber].forEach((el) => {
    el.addEventListener('change', () => {
      els.presetSelect.value = 'custom';
      compute({ recordHistory: true });
    });
  });
  [els.v0Range, els.c0Range, els.cfRange, els.sconcRange, els.kRange].forEach((el) => {
    el.addEventListener('change', () => {
      els.presetSelect.value = 'custom';
      compute({ recordHistory: true });
    });
  });

  els.presetSelect.addEventListener('change', () => {
    const preset = applyPreset(els.presetSelect.value);
    if (preset) {
      els.c0Range.value = preset.c0;
      els.c0Number.value = preset.c0;
      els.cfRange.value = preset.cf;
      els.cfNumber.value = preset.cf;
    }
    compute({ recordHistory: true });
  });

  els.btnReset.addEventListener('click', resetToDefaults);
  els.btnCopy.addEventListener('click', copyResults);
  els.btnClearHistory.addEventListener('click', () => {
    saveHistory([]);
    renderHistory();
  });

  els.formulaToggle.addEventListener('click', () => {
    const nowVisible = els.formulaWrapper.hidden;
    setFormulaVisible(nowVisible);
    if (nowVisible) compute({ recordHistory: false });
    saveInputs(readInputsFromForm());
  });

  els.langButtons.forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang-btn')));
  });
}

function initApp() {
  cacheEls();
  const lang = getLanguage();
  const savedInputs = loadInputs();

  populatePresets(els.presetSelect, lang);
  applyInputsToForm(savedInputs);
  wireEvents();
  applyTranslations(lang);
  renderHistory();
  compute({ recordHistory: false });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {
        /* SW facultatif : l'app reste utilisable sans mode hors-ligne */
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', initApp);
