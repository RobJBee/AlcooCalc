'use strict';

/*
 * Degrés (C0/Cf) typiques pour un usage maison (infusion/macération à l'alcool
 * neutre puis dilution) — valeurs de départ, à ajuster librement via "Personnalisé".
 */
const SPIRIT_PRESETS = {
  gin: { c0: 43, cf: 37.5 },
  vodka: { c0: 40, cf: 37.5 },
  rhum: { c0: 54, cf: 40 },
  whisky: { c0: 46, cf: 40 },
  absinthe: { c0: 68, cf: 45 },
  limoncello: { c0: 96, cf: 30 },
  amaretto: { c0: 96, cf: 24 },
  cognac: { c0: 70, cf: 40 },
  tequila: { c0: 55, cf: 38 },
  eaudevie: { c0: 86, cf: 45 },
  liqueur: { c0: 96, cf: 20 },
};

const PRESET_ORDER = [
  'gin', 'vodka', 'rhum', 'whisky', 'absinthe', 'limoncello',
  'amaretto', 'cognac', 'tequila', 'eaudevie', 'liqueur',
];

function populatePresets(selectEl, lang) {
  const currentValue = selectEl.value;
  selectEl.innerHTML = '';

  const customOpt = document.createElement('option');
  customOpt.value = 'custom';
  customOpt.textContent = t('presetCustom', lang);
  selectEl.appendChild(customOpt);

  PRESET_ORDER.forEach((key) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = t('preset_' + key, lang);
    selectEl.appendChild(opt);
  });

  if (currentValue && [...selectEl.options].some((o) => o.value === currentValue)) {
    selectEl.value = currentValue;
  }
}

function applyPreset(key) {
  if (key === 'custom' || !SPIRIT_PRESETS[key]) return null;
  return SPIRIT_PRESETS[key];
}
