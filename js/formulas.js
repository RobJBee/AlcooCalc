'use strict';

/*
 * Modèle physique (spécifié dans le cahier des charges — voir
 * docs/decisions/0002-formule-dilution-sucre.md) :
 *
 *   1) Conservation de l'alcool pur lors de la dilution à l'eau :
 *        V0 * C0 = Vf * Cf   =>   Vf = (V0 * C0) / Cf
 *   2) Le sucre est ajouté pour atteindre une concentration cible dans le volume final :
 *        ms = S_conc * Vf
 *   3) Dissoudre du sucre augmente légèrement le volume (coefficient k, L par gramme) :
 *        deltaV_sucre = k * ms
 *   4) L'eau à ajouter comble le reste du volume final :
 *        Ve = Vf - V0 - deltaV_sucre
 *
 * Si Ve < 0, la combinaison demandée est physiquement impossible (trop de sucre pour
 * l'écart de dilution choisi) : on renvoie feasible=false plutôt qu'un résultat négatif.
 */

function calculateDilution(V0, C0, Cf, S_conc, k) {
  const errors = [];

  if (![V0, C0, Cf, S_conc, k].every((v) => Number.isFinite(v))) {
    errors.push('errorPositive');
    return { feasible: false, errors };
  }
  if (V0 <= 0 || C0 <= 0 || Cf <= 0 || S_conc < 0 || k < 0) {
    errors.push('errorPositive');
  }
  if (Cf >= C0) {
    errors.push('errorCfGteC0');
  }
  if (errors.length) {
    return { feasible: false, errors };
  }

  const Vf = (V0 * C0) / Cf;
  const ms = S_conc * Vf;
  const expansion = k * ms;
  const Ve = Vf - V0 - expansion;

  if (Ve < 0) {
    return { feasible: false, errors: ['errorNegativeWater'], Vf, ms, expansion, Ve };
  }

  return { feasible: true, errors: [], Vf, ms, expansion, Ve };
}

function generateFormulaSteps(V0, C0, Cf, S_conc, k, results) {
  const fmt = (n, d = 3) => Number(n).toFixed(d);
  return [
    {
      tex: 'V_f = \\dfrac{V_0 \\cdot C_0}{C_f}',
      substituted: `V_f = \\dfrac{${fmt(V0)} \\times ${fmt(C0, 1)}}{${fmt(Cf, 1)}} = ${fmt(results.Vf)}\\ \\text{L}`,
    },
    {
      tex: 'm_s = S_{conc} \\cdot V_f',
      substituted: `m_s = ${fmt(S_conc, 1)} \\times ${fmt(results.Vf)} = ${fmt(results.ms, 1)}\\ \\text{g}`,
    },
    {
      tex: '\\Delta V_{sucre} = k \\cdot m_s',
      substituted: `\\Delta V_{sucre} = ${fmt(k, 5)} \\times ${fmt(results.ms, 1)} = ${fmt(results.expansion)}\\ \\text{L} = ${fmt(results.expansion * 1000, 1)}\\ \\text{mL}`,
    },
    {
      tex: 'V_e = V_f - V_0 - \\Delta V_{sucre}',
      substituted: `V_e = ${fmt(results.Vf)} - ${fmt(V0)} - ${fmt(results.expansion)} = ${fmt(results.Ve)}\\ \\text{L}`,
    },
  ];
}

function renderFormula(containerEl, stepsContainerEl, V0, C0, Cf, S_conc, k, results) {
  if (typeof katex === 'undefined') return;

  const mainFormula =
    '\\begin{aligned} V_f &= \\dfrac{V_0 \\cdot C_0}{C_f} \\\\ m_s &= S_{conc} \\cdot V_f \\\\ \\Delta V_{sucre} &= k \\cdot m_s \\\\ V_e &= V_f - V_0 - \\Delta V_{sucre} \\end{aligned}';

  katex.render(mainFormula, containerEl, { throwOnError: false, displayMode: true });

  stepsContainerEl.innerHTML = '';
  if (!results.feasible && !Number.isFinite(results.Vf)) return;

  const steps = generateFormulaSteps(V0, C0, Cf, S_conc, k, results);
  steps.forEach((step, i) => {
    const line = document.createElement('div');
    line.className = 'formula-step';
    const num = document.createElement('span');
    num.className = 'formula-step__num';
    num.textContent = `${i + 1}.`;
    const math = document.createElement('span');
    math.className = 'formula-step__math';
    katex.render(step.substituted, math, { throwOnError: false, displayMode: false });
    line.appendChild(num);
    line.appendChild(math);
    stepsContainerEl.appendChild(line);
  });
}
