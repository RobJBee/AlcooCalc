'use strict';

const TRANSLATIONS = {
  fr: {
    appTitle: 'AlcooCalc',
    appSubtitle: 'Calculateur de dilution alcool + sucre',
    presetLabel: 'Alcool de base',
    presetCustom: 'Personnalisé',
    preset_gin: 'Gin',
    preset_vodka: 'Vodka',
    preset_rhum: 'Rhum',
    preset_whisky: 'Whisky',
    preset_absinthe: 'Absinthe',
    preset_limoncello: 'Limoncello',
    preset_amaretto: 'Amaretto',
    preset_cognac: 'Cognac',
    preset_tequila: 'Tequila',
    preset_eaudevie: 'Eau-de-vie',
    preset_liqueur: 'Liqueur',
    inputsTitle: 'Paramètres',
    labelV0: 'Volume initial (V₀)',
    labelC0: 'Alcool initial (C₀)',
    labelCf: 'Alcool cible (C_f)',
    labelSconc: 'Sucre visé (S)',
    labelK: "Coefficient d'expansion (k)",
    advancedToggle: 'Avancé',
    unitL: 'L',
    unitPercent: '%',
    unitGL: 'g/L',
    unitMLg: 'mL/g',
    resultsTitle: 'Résultats',
    resultWater: 'Eau à ajouter',
    resultSugar: 'Sucre à ajouter',
    resultFinalVolume: 'Volume final',
    resultExpansion: 'Expansion due au sucre',
    btnReset: 'Réinitialiser',
    btnCopy: 'Copier les résultats',
    copiedMsg: 'Copié !',
    formulaToggleShow: 'Voir la formule détaillée',
    stepsTitle: 'Étapes du calcul',
    historyTitle: 'Historique',
    historyEmpty: 'Aucun calcul enregistré pour le moment.',
    historyClear: "Effacer l'historique",
    errorCfGteC0: 'Le degré cible doit être strictement inférieur au degré initial.',
    errorPositive: 'Toutes les valeurs doivent être supérieures à zéro.',
    errorNegativeWater: "Combinaison impossible : trop de sucre pour cette dilution (eau négative). Réduisez le sucre visé ou l'écart de dilution.",
    langSwitchLabel: 'Langue',
    footerText: '100% local · aucune donnée envoyée · fonctionne hors-ligne',
    copyTemplate:
      'AlcooCalc — {date}\nVolume initial : {v0} L à {c0}%\nCible : {cf}% avec {sconc} g/L de sucre\n---\nEau à ajouter : {ve}\nSucre à ajouter : {ms} g\nVolume final : {vf} L\nExpansion (sucre) : {exp} mL',
  },
  en: {
    appTitle: 'AlcooCalc',
    appSubtitle: 'Alcohol + Sugar Dilution Calculator',
    presetLabel: 'Base spirit',
    presetCustom: 'Custom',
    preset_gin: 'Gin',
    preset_vodka: 'Vodka',
    preset_rhum: 'Rum',
    preset_whisky: 'Whisky',
    preset_absinthe: 'Absinthe',
    preset_limoncello: 'Limoncello',
    preset_amaretto: 'Amaretto',
    preset_cognac: 'Cognac',
    preset_tequila: 'Tequila',
    preset_eaudevie: 'Fruit brandy',
    preset_liqueur: 'Liqueur',
    inputsTitle: 'Parameters',
    labelV0: 'Initial volume (V₀)',
    labelC0: 'Initial ABV (C₀)',
    labelCf: 'Target ABV (C_f)',
    labelSconc: 'Target sugar (S)',
    labelK: 'Expansion coefficient (k)',
    advancedToggle: 'Advanced',
    unitL: 'L',
    unitPercent: '%',
    unitGL: 'g/L',
    unitMLg: 'mL/g',
    resultsTitle: 'Results',
    resultWater: 'Water to add',
    resultSugar: 'Sugar to add',
    resultFinalVolume: 'Final volume',
    resultExpansion: 'Sugar volume expansion',
    btnReset: 'Reset',
    btnCopy: 'Copy results',
    copiedMsg: 'Copied!',
    formulaToggleShow: 'Show detailed formula',
    stepsTitle: 'Calculation steps',
    historyTitle: 'History',
    historyEmpty: 'No calculation saved yet.',
    historyClear: 'Clear history',
    errorCfGteC0: 'Target ABV must be strictly lower than initial ABV.',
    errorPositive: 'All values must be greater than zero.',
    errorNegativeWater: 'Impossible combination: too much sugar for this dilution (negative water). Lower the target sugar or the dilution gap.',
    langSwitchLabel: 'Language',
    footerText: '100% local · no data sent · works offline',
    copyTemplate:
      'AlcooCalc — {date}\nInitial volume: {v0} L at {c0}%\nTarget: {cf}% with {sconc} g/L sugar\n---\nWater to add: {ve}\nSugar to add: {ms} g\nFinal volume: {vf} L\nSugar expansion: {exp} mL',
  },
};

const SUPPORTED_LANGS = Object.keys(TRANSLATIONS);
const DEFAULT_LANG = 'fr';

function getLanguage() {
  try {
    const saved = localStorage.getItem('alcoocalc_lang');
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  } catch (e) {
    /* localStorage indisponible (mode privé, quota…) : on retombe sur le défaut */
  }
  return DEFAULT_LANG;
}

function t(key, lang) {
  const l = lang || getLanguage();
  return (TRANSLATIONS[l] && TRANSLATIONS[l][key]) || TRANSLATIONS[DEFAULT_LANG][key] || key;
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  try {
    localStorage.setItem('alcoocalc_lang', lang);
  } catch (e) {
    /* ignore */
  }
  applyTranslations(lang);
}

function applyTranslations(lang) {
  const l = lang || getLanguage();
  document.documentElement.lang = l;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key, l);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key, l));
  });
  document.querySelectorAll('[data-lang-btn]').forEach((el) => {
    el.classList.toggle('is-active', el.getAttribute('data-lang-btn') === l);
  });
  if (typeof onLanguageChanged === 'function') onLanguageChanged(l);
}
