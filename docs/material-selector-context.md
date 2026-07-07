# Build Context — Functional "Material Selector" tab for the Configurator

## Goal
Replace the static metallurgy *information panel* with a **functional, questionnaire-driven
Base-Material Selector**. The user answers 5 short questions; the tool computes a recommended
base metal, acceptable alternatives, what to avoid, and the reasoning — all derived from
`Eyewear_Frame_Metallurgy_QC.xlsx`. The three reference tables stay, but collapsed under the
result (secondary, not primary).

This is **front-end only** — no `server.py` / API changes. All data lives as inline JS
constants and is rendered with DOM-building functions, exactly like `MATERIAL_PRESETS` /
`renderMaterialGrid()` in `configurator.js`.

## Files (all under `eyewear_labeller/static/`)
- `configurator.html` — add the 5th sub-header tab + its panel
- `configurator.js` — add data constants, the recommendation engine, render functions, a `dom` ref, and a state var
- `styles.css` — bump `.configurator-tabs` to 5 columns + style the selector

---

## STEP 1 — configurator.html

a) In `.configurator-tabs` (the `role="tablist"` block), add after the `specs` button:
```html
<button type="button" data-configurator-tab="material">Material</button>
```

b) After the `data-configurator-panel="specs"` section (still inside `.configurator-scroll`):
```html
<section class="configurator-panel" data-configurator-panel="material">
  <div class="panel-heading compact-heading">
    <h2>Material selector</h2>
    <span id="materialSelectorReadout">Answer to get a recommendation</span>
  </div>
  <div id="materialSelector" class="material-selector" aria-label="Base material selector"></div>
</section>
```
Keep `parts` as the only tab/panel with `is-active` (default unchanged). The existing
`setActiveTab()` / `bindEvents()` are generic over the data attributes — **do not modify them**.

---

## STEP 2 — configurator.js

### 2a. Data constants (place near `MATERIAL_PRESETS`)

```js
// Base alloys (from the Material Scorecard sheet). tier:'primary' = recommendable; 'reference' = info only.
const MATERIALS = {
  titanium:     { label: 'Titanium (CP / beta)', composition: 'CP-Ti (Gr 1-4) / beta-Ti', nickel: 'Low release (Ni locked)', corrosion: 'Excellent', durability: 'High strength-to-weight', mfg: 'Hardest — inert laser/TIG, IP/PVD finish', joining: 'Laser / TIG (inert gas)', use: 'Premium all-day & high-power Rx', tier: 'primary' },
  ss316l:       { label: '316L stainless', composition: 'Austenitic 18Cr-10Ni-Mo', nickel: 'Low release; better than 304 in chloride', corrosion: 'Very good', durability: 'High', mfg: 'Moderate-hard; laser-weld', joining: 'Laser / TIG', use: 'Hypoallergenic / prolonged-contact Rx; beach sun', tier: 'primary' },
  ss304:        { label: 'SS304', composition: 'Austenitic 18Cr-8Ni', nickel: 'Low release but pits in chloride/sweat — marginal for prolonged contact', corrosion: 'Good (less than 316L in salt)', durability: 'High — strong, springy, thin sections', mfg: 'Harder — work-hardens; laser-weld over solder', joining: 'Laser / TIG (solder w/ aggressive flux)', use: 'Value Rx & sun all-rounder', tier: 'primary' },
  white_copper: { label: 'White copper (cupronickel)', composition: 'Cu-Ni; incl. Cu-Ni-Zn nickel silver', nickel: 'HIGH — relies entirely on intact plating; wear-through re-exposes Ni', corrosion: 'Decent; plating-dependent', durability: 'Moderate; good formability', mfg: 'Very easy — machines, brazes, plates well', joining: 'Braze / solder', use: 'Mainstream / value frames; cost-floor', tier: 'primary' },
  brass:        { label: 'Brass', composition: 'Copper-Zinc (Cu-Zn)', nickel: 'None in base; plating often adds a Ni strike', corrosion: 'Moderate — tarnish / dezincification', durability: 'Low — soft, holds adjustment poorly', mfg: 'Easiest — free-cutting, braze-solders, plates well', joining: 'Braze / solder', use: 'Fashion / decorative fronts & components', tier: 'primary' },
  monel:        { label: 'Monel', composition: 'Nickel-Copper (~67% Ni)', nickel: 'High; plating-dependent', corrosion: 'Good', durability: 'Moderate; good formability', mfg: 'Good — braze-solders', joining: 'Braze / solder', use: 'Mainstream metal fronts / temples', tier: 'reference' },
  nickel_silver:{ label: 'Nickel silver', composition: 'Cu-Ni-Zn (German silver; no actual silver)', nickel: 'Moderate-high; plating-dependent', corrosion: 'Decent', durability: 'Moderate', mfg: 'Excellent — machines / solders', joining: 'Solder / braze', use: 'Decorative parts; low-cost fronts', tier: 'reference' },
};

// Wear-pattern reasoning (from the Usage - Sun vs Rx sheet). Used to explain a recommendation.
const USAGE_DIMENSIONS = {
  wear:       { label: 'Wear pattern', rx: 'All-day, daily, for years — continuous skin contact', sun: 'Intermittent / occasional; often pushed up on head' },
  lensWeight: { label: 'Lens weight', rx: 'High (esp. high-power); total weight = frame + lenses', sun: 'Usually light (plano / low-power)' },
  weightPrio: { label: 'Weight priority', rx: 'HIGH — all-day fatigue & nose-bridge pressure marks', sun: 'Forgiven — short wear cycles' },
  nickel:     { label: 'Nickel exposure', rx: 'Maximised — prolonged contact; sensitisation accumulates with wear-time', sun: 'Lower cumulative, but still face-worn' },
  corrosion:  { label: 'Corrosion environment', rx: 'Sweat (NaCl, lactic acid, urea), facial oils, repeated cleaning', sun: 'Sweat + sunscreen + saltwater + sand + parked-car heat + UV' },
  coating:    { label: 'Coating wear', rx: 'Years of cleaning / refit → wear-through risk → Ni re-exposure', sun: 'UV + heat stress on coatings & adhesives' },
  adjust:     { label: 'Adjustability', rx: 'Critical — precise daily refit', sun: 'Less critical' },
};

// Questionnaire. `showIf` hides a question until its dependency is set.
const MATERIAL_QUESTIONS = [
  { id: 'use', label: 'What is the frame for?', options: [
      { value: 'rx', label: 'Prescription (powered) glasses' },
      { value: 'sun', label: 'Sunglasses' },
      { value: 'plano', label: 'Non-powered / fashion (plano)' } ] },
  { id: 'power', label: 'Lens power?', showIf: (a) => a.use === 'rx', options: [
      { value: 'low', label: 'Low power (under ±4.00 D)' },
      { value: 'high', label: 'High power (±4.00 D and above)' } ] },
  { id: 'env', label: 'Wear environment?', options: [
      { value: 'everyday', label: 'Everyday indoor / outdoor' },
      { value: 'harsh', label: 'Harsh — beach, saltwater, heavy sweat, humidity' } ] },
  { id: 'skin', label: 'Skin sensitivity?', options: [
      { value: 'none', label: 'No known nickel sensitivity' },
      { value: 'sensitive', label: 'Nickel-sensitive / hypoallergenic required' } ] },
  { id: 'budget', label: 'Budget priority?', options: [
      { value: 'premium', label: 'Premium — best material wins' },
      { value: 'balanced', label: 'Balanced / value' },
      { value: 'cost_floor', label: 'Cost-floor — cheapest viable' } ] },
];

// Recommended base metal -> closest existing Finish preset (for the optional "Apply finish" action).
const METAL_TO_FINISH = {
  titanium: 'titanium-grey', ss316l: 'brushed-nickel', ss304: 'brushed-nickel',
  white_copper: 'bright-chrome', brass: 'antique-brass', monel: 'gunmetal-grey', nickel_silver: 'brushed-nickel',
};
```

Also **retain the three reference tables** as a `MATERIAL_GUIDE` constant (the
Recommendations / Usage / Scorecard tables) — reuse the transcription already prepared for
the earlier static-panel task — and render them inside a collapsed `<details>` below the result.

### 2b. Recommendation engine (pure function — deterministic, faithful to the matrix)

```js
function recommendMaterial(a) {
  const notes = [];
  let primary, acceptable = [], avoid = [], archetype;

  // A. Base archetype (Product Recommendations sheet)
  if (a.use === 'rx' && a.power === 'high') {
    archetype = 'High-power Rx'; primary = 'titanium'; acceptable = ['ss304', 'ss316l']; avoid = ['white_copper', 'brass'];
  } else if (a.use === 'rx') {
    archetype = 'Low-power Rx'; primary = 'ss304'; acceptable = ['white_copper']; avoid = ['brass'];
  } else if (a.use === 'sun') {
    archetype = 'Metal sunglasses'; primary = 'ss304'; acceptable = ['white_copper']; avoid = ['brass'];
  } else {
    archetype = 'Non-powered / fashion'; primary = 'white_copper'; acceptable = ['brass']; avoid = ['titanium'];
  }

  // B. Environment (harsh = beach / saltwater / heavy sweat / humid)
  if (a.env === 'harsh') {
    if (primary === 'ss304') { primary = 'ss316l'; notes.push('Chloride/beach exposure → SS304 stepped up to 316L for pitting resistance.'); }
    else if (primary === 'white_copper') { acceptable = ['ss316l', ...acceptable]; notes.push('Harsh exposure → white copper only with strong PVD; stainless preferred.'); }
  }

  // C. Nickel sensitivity — hard constraint toward Ni-locked alloys
  if (a.skin === 'sensitive') {
    const safe = ['titanium', 'ss316l'];
    if (!safe.includes(primary)) primary = (a.budget === 'premium') ? 'titanium' : 'ss316l';
    acceptable = safe.filter((m) => m !== primary);
    avoid = ['white_copper', 'monel', 'nickel_silver'];
    notes.push('Nickel-sensitive → only Ni-locked alloys (titanium / 316L). White copper, Monel, nickel silver excluded; any plated part risks a Ni strike at wear-through.');
  }

  // D. Budget
  if (a.budget === 'premium' && a.use === 'rx' && a.skin !== 'sensitive' && primary !== 'titanium') {
    acceptable = [primary, ...acceptable.filter((m) => m !== 'titanium')];
    primary = 'titanium';
    notes.push('Premium budget → titanium for all-day comfort & nickel safety.');
  }
  if (a.budget === 'cost_floor') {
    if (a.skin === 'sensitive') {
      notes.push('Cost-floor is capped by nickel safety → 316L is the cheapest safe option.');
    } else {
      const step = { titanium: a.env === 'harsh' ? 'ss316l' : 'ss304', ss316l: a.env === 'harsh' ? 'ss316l' : 'ss304', ss304: 'white_copper', white_copper: 'brass' };
      const next = step[primary];
      if (next && next !== primary) {
        acceptable = [primary, ...acceptable.filter((m) => m !== next)];
        primary = next;
        notes.push('Cost-floor → stepped down to the cheapest viable alloy; manage the trade-offs noted in the scorecard.');
      }
    }
  }

  // E. Dedupe
  acceptable = acceptable.filter((m, i, arr) => m !== primary && arr.indexOf(m) === i);
  avoid = avoid.filter((m, i, arr) => m !== primary && !acceptable.includes(m) && arr.indexOf(m) === i);

  // F. Reasons (Usage sheet), chosen by the answers
  const col = a.use === 'rx' ? 'rx' : 'sun';
  const keys = ['wear', 'weightPrio', 'nickel'];
  if (a.use === 'rx' && a.power === 'high') keys.splice(1, 0, 'lensWeight');
  if (a.env === 'harsh') keys.push('corrosion');
  if (a.use === 'rx') keys.push('adjust');
  const reasons = [...new Set(keys)].map((k) => ({ label: USAGE_DIMENSIONS[k].label, text: USAGE_DIMENSIONS[k][col] }));

  return { archetype, primary, acceptable, avoid, notes, reasons };
}
```

### 2c. State, dom ref, render

- Add state: `let materialAnswers = {};`
- Add dom ref: `materialSelector: document.querySelector('#materialSelector'),`
- Add `renderMaterialSelector()` and call it from BOTH `init()` and `renderAll()` (after `renderSpecControls()`), matching how the other grids are wired.

`renderMaterialSelector()` requirements:
1. **Questionnaire** — one block per `MATERIAL_QUESTIONS` entry whose `showIf` passes (or has none).
   Each option is a button; clicking sets `materialAnswers[q.id]`, clears any now-hidden
   dependent answers (e.g. switching `use` away from `rx` deletes `power`), then re-renders.
   Mark the chosen option with `is-selected` / `aria-selected` like the existing swatch buttons.
2. **Required check** — required ids = every visible question's id (so `power` is required only
   when `use === 'rx'`). Until all are answered, show a hint and the `#materialSelectorReadout`
   stays "Answer to get a recommendation".
3. **Result** (when complete) — call `recommendMaterial(materialAnswers)` and render a card:
   - Headline: **recommended material label** + the `archetype` as a sub-label.
   - "Why" list from `reasons` (label → text).
   - `notes` rendered as callout chips (the step-up / constraint explanations).
   - **Acceptable alternatives** row (material labels) and **Avoid** row (material labels, muted/struck).
   - A compact spec strip for the primary material from `MATERIALS[primary]`
     (nickel risk, corrosion, durability, joining method, manufacturing ease).
   - Update `#materialSelectorReadout` to the recommended label (e.g. "Titanium (CP / beta)").
   - A **Reset** button that clears `materialAnswers` and re-renders.
4. **Reference** — render the three `MATERIAL_GUIDE` tables inside a collapsed
   `<details><summary>Full QC reference matrix</summary>…</details>` below the result.
5. **Escaping** — every dynamic string goes through the existing `escapeHtml()` helper.

### 2d. (Optional but recommended) Bridge + persistence
- **Apply finish:** add a button "Use suggested finish" that sets
  `activeMaterialId = METAL_TO_FINISH[primary]`, then calls `markConfiguratorDirty()`,
  `renderMaterialGrid()`, `applyAppearance()`. (Base metal ≠ cosmetic finish, so this is a
  convenience mapping, not an exact equivalence — label it "closest finish".)
- **Persistence:** include `materialAnswers` and `recommendedMetalId` in
  `configuratorSavePayload()`, and restore them in `applyConfiguratorSave()` so a saved build
  reopens with its selector state. Guard the restore (only apply if it's a plain object).

---

## STEP 3 — styles.css
- `.configurator-tabs` (~line 1336): change `repeat(4, …)` → `repeat(5, …)`. Leave the mobile
  media-query override (`repeat(2, …)`, ~line 2396) as-is.
- Add styles for `.material-selector` using the existing tokens (`var(--line)`, `var(--muted)`,
  `var(--teal-dark)`, `rgba(15,143,132,…)`): question blocks, option buttons (reuse the
  `.swatch-button` selected-state look — teal border/tint when `is-selected`), the result card
  (recommended headline emphasised), alternative/avoid chips, the spec strip, and the reference
  `<details>` table styling (sticky teal header, bold first column, horizontal scroll).

---

## Acceptance criteria
- Sub-header shows 5 even tabs: **Parts, Finish, Lens, Specs, Material**. "Parts" still default.
- Selecting `use = Prescription` reveals the **Lens power** question; switching away hides it and
  clears its answer. Result appears only once all visible questions are answered.
- "Reset" returns to the empty questionnaire. No console errors. No `server.py`/API changes.
- **Engine test cases** (env=everyday, skin=none, budget=balanced unless stated) — primary must equal:

  | use | power | env | skin | budget | → primary | notes |
  |-----|-------|-----|------|--------|-----------|-------|
  | rx | high | everyday | none | balanced | **titanium** | alt SS304/316L; avoid white copper, brass |
  | rx | low | everyday | none | balanced | **ss304** | alt white copper; avoid brass |
  | sun | – | everyday | none | balanced | **ss304** | alt white copper; avoid brass |
  | sun | – | harsh | none | balanced | **ss316l** | "stepped up to 316L" note |
  | plano | – | everyday | none | balanced | **white_copper** | alt brass; avoid titanium |
  | plano | – | everyday | none | cost_floor | **brass** | stepped down |
  | rx | high | everyday | none | cost_floor | **ss304** | cost-bound step-down (matches matrix) |
  | rx | high | harsh | none | cost_floor | **ss316l** | – |
  | rx | low | everyday | sensitive | balanced | **ss316l** | hypoallergenic; avoid white copper/Monel/nickel silver |
  | rx | low | everyday | sensitive | premium | **titanium** | – |
  | rx | low | everyday | none | premium | **titanium** | premium Rx upgrade |
