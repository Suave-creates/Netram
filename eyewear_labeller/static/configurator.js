import { initFrame3DViewer } from './frame-3d-viewer.mjs?v=20260620-solidtip1';
import { FRAME_3D_DIMENSIONS } from './frame-3d-model.mjs?v=20260620-solidtip1';

const PART_TYPES = ['nose_bridge', 'temple', 'temple_tip', 'nosearm', 'nose_pad'];
const PART_LABELS = {
  nose_bridge: 'Nose bridge',
  temple: 'Temples',
  temple_tip: 'Acetate tips',
  nosearm: 'Nosearms',
  nose_pad: 'Nose pads',
};

const DEFAULT_CHILD_PART_NAME_BY_MODEL = {
  'VC S19000': { nose_bridge: 'VC S5158 NB', temple: 'T4', temple_tip: 'TT1-Bend' },
  'VC S19001': { nose_bridge: 'VC S5158 NB', temple: 'T1', temple_tip: 'TT4-Bend' },
  'VC S19002': { nose_bridge: 'VC S13110 NB', temple: 'T2', temple_tip: 'TT1-Bend' },
  'VC S19003': { nose_bridge: 'VC S13110 NB', temple: 'T5', temple_tip: 'TT3-Bend' },
  'VC S19004': { nose_bridge: 'VC S13110 NB', temple: 'T2', temple_tip: 'TT1-Bend' },
  'VC S19005': { nose_bridge: 'VC S5158 NB', temple: 'T4', temple_tip: 'TT1-Bend' },
};

const MATERIAL_PRESETS = [
  { id: 'polished-gold', label: 'Polished Gold', color: '#d4af37', metalness: 1, roughness: 0.05, family: 'precious' },
  { id: 'antique-brass', label: 'Antique Brass', color: '#9c7a31', metalness: 1, roughness: 0.55, family: 'precious' },
  { id: 'bright-chrome', label: 'Bright Chrome / Silver', color: '#e2e7e8', metalness: 1, roughness: 0.02, family: 'precious' },
  { id: 'brushed-nickel', label: 'Brushed Nickel', color: '#b8b0a1', metalness: 1, roughness: 0.35, family: 'precious' },
  { id: 'rose-gold', label: 'Rose Gold', color: '#c88773', metalness: 1, roughness: 0.12, family: 'precious' },
  { id: 'copper', label: 'Copper', color: '#b66a3c', metalness: 1, roughness: 0.4, family: 'precious' },
  { id: 'bronze', label: 'Bronze', color: '#705030', metalness: 1, roughness: 0.5, family: 'precious' },
  { id: 'matte-black', label: 'Matte Black', color: '#050505', metalness: 0.05, roughness: 0.85, family: 'neutral' },
  { id: 'gunmetal-grey', label: 'Gunmetal Grey', color: '#3b4246', metalness: 0.9, roughness: 0.45, family: 'neutral' },
  { id: 'oil-rubbed-bronze', label: 'Oil-Rubbed Bronze', color: '#2a1b12', metalness: 0.7, roughness: 0.6, family: 'neutral' },
  { id: 'glossy-white-cream', label: 'Glossy White / Cream', color: '#f2efe8', metalness: 0.05, roughness: 0.1, family: 'neutral' },
  { id: 'titanium-grey', label: 'Titanium Grey', color: '#9a9790', metalness: 1, roughness: 0.3, family: 'neutral' },
  { id: 'navy-blue', label: 'Navy Blue', color: '#101b2c', metalness: 0.2, roughness: 0.7, family: 'statement' },
  { id: 'emerald-green', label: 'Emerald Green', color: '#027a55', metalness: 0.8, roughness: 0.15, family: 'statement' },
  { id: 'burgundy', label: 'Burgundy', color: '#581c2c', metalness: 0.1, roughness: 0.65, family: 'statement' },
  { id: 'electric-blue', label: 'Electric Blue', color: '#006fff', metalness: 0.9, roughness: 0.08, family: 'statement' },
  { id: 'crimson-red', label: 'Crimson Red', color: '#c1121f', metalness: 0.05, roughness: 0.15, family: 'statement' },
  { id: 'champagne', label: 'Champagne', color: '#d8c99f', metalness: 0.8, roughness: 0.35, family: 'statement' },
  { id: 'plum-violet', label: 'Plum / Violet', color: '#4b1b69', metalness: 0.85, roughness: 0.18, family: 'statement' },
  { id: 'rose-pink-blush', label: 'Rose Pink / Blush', color: '#e7a6b5', metalness: 0.05, roughness: 0.8, family: 'statement' },
];

const LENS_TINTS = [
  { id: 'clear-tint', label: 'Clear Lens', materialId: 'nylon', color: '#dff8ff', opacity: 0.2, polarizedAllowed: false },
  { id: 'coffee-mirror', label: 'Coffee with Mirror', materialId: 'pc', color: '#a87944', opacity: 0.4, polarizedAllowed: true },
  { id: 'brown-fade', label: 'Brown Fade', materialId: 'tac', color: '#c08a53', opacity: 0.36, polarizedAllowed: true },
  { id: 'g15-smoke', label: 'G15 Smoke', materialId: 'pc', color: '#57715b', opacity: 0.38, polarizedAllowed: true },
  { id: 'graphite-polar', label: 'Graphite Polar', materialId: 'pc', color: '#3d4652', opacity: 0.42, polarizedAllowed: true },
  { id: 'charcoal-smoke', label: 'Charcoal Smoke', materialId: 'pc', color: '#51575e', opacity: 0.38, polarizedAllowed: true },
  { id: 'amber-gold', label: 'Amber Gold', materialId: 'tac', color: '#d7a24e', opacity: 0.38, polarizedAllowed: true },
  { id: 'green-gradient', label: 'Green Gradient', materialId: 'nylon', color: '#5f9674', opacity: 0.34, polarizedAllowed: false },
  { id: 'blue-mirror', label: 'Blue Mirror', materialId: 'pc', color: '#3c8dd1', opacity: 0.36, polarizedAllowed: true },
  { id: 'violet-smoke', label: 'Violet Smoke', materialId: 'nylon', color: '#80659b', opacity: 0.34, polarizedAllowed: false },
  { id: 'rose-brown', label: 'Rose Brown', materialId: 'tac', color: '#c0786f', opacity: 0.36, polarizedAllowed: true },
];

const METAL_GUIDE = [
  {
    id: 'recommendations',
    title: 'Recommended base metal',
    note: 'Let usage duration set the weight/nickel ceiling, then pick the easiest-to-manufacture alloy that stays under it.',
    columns: ['Product archetype', 'First choice', 'Value / acceptable', 'Avoid', 'Rationale'],
    rows: [
      ['High-power frames', 'Titanium', 'SS304 / 316L (if cost-bound)', 'White copper, brass', 'Heavy lenses + prolonged contact → light, nickel-free, fatigue-durable'],
      ['Low-power frames', 'SS304', 'White copper + robust plating', "Brass (won't hold adjustment)", 'Value sweet spot; manage nickel via plating QC'],
      ['Metal sunglasses', 'SS304 (→ 316L for beach)', 'White copper + strong PVD', 'Brass (soft, tarnish)', 'Corrosion / finish toughness > weight; cheaper than Ti'],
      ['Non-powered frames', 'White copper', 'Brass', 'Titanium (over-spec)', 'Cheapest, easiest to braze & plate'],
    ],
  },
  {
    id: 'usage',
    title: 'Usage duration — Rx glasses vs sunglasses',
    note: 'Wear pattern resets the comfort budget and the corrosion / nickel-exposure profile, which drives material bias.',
    columns: ['Dimension', 'Powered / Rx glasses', 'Sunglasses'],
    rows: [
      ['Wear pattern', 'All-day, daily, for years (continuous skin contact)', 'Intermittent / occasional; often pushed up on head'],
      ['Lens weight', 'High (esp. high-power); total weight = frame + lenses', 'Usually light (plano / low-power)'],
      ['Weight priority', 'HIGH — all-day fatigue, nose-bridge pressure marks', 'Forgiven — short wear cycles'],
      ['Nickel exposure', 'Maximised — prolonged contact; sensitisation accumulates with wear-time', 'Lower cumulative, but still face-worn'],
      ['Corrosion environment', 'Sweat (NaCl, lactic acid, urea), facial oils, repeated cleaning', 'Sweat + sunscreen + saltwater + sand + parked-car heat + UV'],
      ['Coating wear', 'Years of cleaning / re-adjustment → wear-through risk → Ni re-exposure', 'UV + heat stress on coatings & adhesives'],
      ['Adjustability', 'Critical — precise daily refit', 'Less critical'],
      ['Material bias', 'Light, nickel-free, fatigue-durable → Titanium / beta-Ti; SS304/316L for value', 'Corrosion- & finish-tough → SS304 (→316L beach) or PVD-coated white copper/Monel'],
    ],
  },
  {
    id: 'scorecard',
    title: 'Base material scorecard',
    note: 'Primary sourcing palette listed first; reference alloys below. Lower density = lighter = more comfortable.',
    columns: ['Material', 'Composition', 'Nickel / skin risk', 'Corrosion resistance', 'Durability / stress holding', 'Manufacturing ease', 'Joining method', 'Best-fit use'],
    rows: [
      ['Brass', 'Copper-Zinc (Cu-Zn)', 'None in base; plating often adds a Ni strike', 'Moderate — tarnish / dezincification; plating-dependent', 'Low — soft, holds adjustment poorly', 'Easiest — free-cutting, braze-solders, forms & plates well', 'Braze / solder', 'Fashion / decorative fronts & components'],
      ['White copper (cupronickel)', 'Copper-Nickel; incl. Cu-Ni-Zn nickel silver', 'HIGH — relies entirely on intact plating; wear-through re-exposes Ni', 'Decent; plating-dependent', 'Moderate; good formability', 'Very easy — machines, brazes, plates well', 'Braze / solder', 'Mainstream / value frames; cost-floor'],
      ['SS304', 'Austenitic stainless 18Cr-8Ni', 'Low release (Ni locked), but pits in chloride/sweat — marginal for prolonged contact', 'Good (less than 316L in salt)', 'High — strong, springy, thin sections', 'Harder — work-hardens; laser-weld over solder', 'Laser / TIG (solder w/ aggressive flux)', 'All-rounder for value Rx & sun (step to 316L for chloride)'],
      ['Titanium (CP / beta)', 'CP-Ti (Gr 1-4) / beta-Ti alloy', 'Low release (Ni locked), but pits in chloride/sweat — marginal for prolonged contact', 'Excellent', 'High strength-to-weight', 'Hardest — poor machinability, inert laser/TIG weld, IP/PVD finish', 'Laser / TIG (inert gas)', 'Premium all-day & high-power Rx'],
      ['316L stainless', 'Austenitic stainless 18Cr-10Ni-Mo', 'Low release; better than 304 in chloride', 'Very good', 'High', 'Moderate-hard; laser-weld', 'Laser / TIG', 'Hypoallergenic / prolonged-contact Rx; beach sun'],
      ['Monel', 'Nickel-Copper (~67% Ni)', 'High; plating-dependent', 'Good', 'Moderate; good formability', 'Good — braze-solders', 'Braze / solder', 'Mainstream metal fronts / temples'],
      ['Nickel silver (ref)', 'Cu-Ni-Zn (German silver; no actual silver)', 'Moderate-high; plating-dependent', 'Decent', 'Moderate', 'Excellent — machines / solders', 'Solder / braze', 'Decorative parts; low-cost fronts'],
    ],
  },
];

// Base alloys (from the Material Scorecard sheet). tier 'primary' = recommendable; 'reference' = info only.
const MATERIALS = {
  titanium: { label: 'Titanium (CP / beta)', composition: 'CP-Ti (Gr 1-4) / beta-Ti', nickel: 'Low release (Ni locked)', corrosion: 'Excellent', durability: 'High strength-to-weight', mfg: 'Hardest — inert laser/TIG, IP/PVD finish', joining: 'Laser / TIG (inert gas)', use: 'Premium all-day & high-power Rx', tier: 'primary' },
  ss316l: { label: '316L stainless', composition: 'Austenitic 18Cr-10Ni-Mo', nickel: 'Low release; better than 304 in chloride', corrosion: 'Very good', durability: 'High', mfg: 'Moderate-hard; laser-weld', joining: 'Laser / TIG', use: 'Hypoallergenic / prolonged-contact Rx; beach sun', tier: 'primary' },
  ss304: { label: 'SS304', composition: 'Austenitic 18Cr-8Ni', nickel: 'Low release but pits in chloride/sweat — marginal for prolonged contact', corrosion: 'Good (less than 316L in salt)', durability: 'High — strong, springy, thin sections', mfg: 'Harder — work-hardens; laser-weld over solder', joining: 'Laser / TIG (solder w/ aggressive flux)', use: 'Value Rx & sun all-rounder', tier: 'primary' },
  white_copper: { label: 'White copper (cupronickel)', composition: 'Cu-Ni; incl. Cu-Ni-Zn nickel silver', nickel: 'HIGH — relies entirely on intact plating; wear-through re-exposes Ni', corrosion: 'Decent; plating-dependent', durability: 'Moderate; good formability', mfg: 'Very easy — machines, brazes, plates well', joining: 'Braze / solder', use: 'Mainstream / value frames; cost-floor', tier: 'primary' },
  brass: { label: 'Brass', composition: 'Copper-Zinc (Cu-Zn)', nickel: 'None in base; plating often adds a Ni strike', corrosion: 'Moderate — tarnish / dezincification', durability: 'Low — soft, holds adjustment poorly', mfg: 'Easiest — free-cutting, braze-solders, plates well', joining: 'Braze / solder', use: 'Fashion / decorative fronts & components', tier: 'primary' },
  monel: { label: 'Monel', composition: 'Nickel-Copper (~67% Ni)', nickel: 'High; plating-dependent', corrosion: 'Good', durability: 'Moderate; good formability', mfg: 'Good — braze-solders', joining: 'Braze / solder', use: 'Mainstream metal fronts / temples', tier: 'reference' },
  nickel_silver: { label: 'Nickel silver', composition: 'Cu-Ni-Zn (German silver; no actual silver)', nickel: 'Moderate-high; plating-dependent', corrosion: 'Decent', durability: 'Moderate', mfg: 'Excellent — machines / solders', joining: 'Solder / braze', use: 'Decorative parts; low-cost fronts', tier: 'reference' },
};

// Wear-pattern reasoning (from the Usage - Sun vs Rx sheet). Used to explain a suggestion.
const USAGE_DIMENSIONS = {
  wear: { label: 'Wear pattern', rx: 'All-day, daily, for years — continuous skin contact', sun: 'Intermittent / occasional; often pushed up on head' },
  lensWeight: { label: 'Lens weight', rx: 'High (esp. high-power); total weight = frame + lenses', sun: 'Usually light (plano / low-power)' },
  weightPrio: { label: 'Weight priority', rx: 'HIGH — all-day fatigue & nose-bridge pressure marks', sun: 'Forgiven — short wear cycles' },
  nickel: { label: 'Nickel exposure', rx: 'Maximised — prolonged contact; sensitisation accumulates with wear-time', sun: 'Lower cumulative, but still face-worn' },
  corrosion: { label: 'Corrosion environment', rx: 'Sweat (NaCl, lactic acid, urea), facial oils, repeated cleaning', sun: 'Sweat + sunscreen + saltwater + sand + parked-car heat + UV' },
  coating: { label: 'Coating wear', rx: 'Years of cleaning / refit → wear-through risk → Ni re-exposure', sun: 'UV + heat stress on coatings & adhesives' },
  adjust: { label: 'Adjustability', rx: 'Critical — precise daily refit', sun: 'Less critical' },
};

// Questionnaire. `showIf` hides a question until its dependency is set.
const MATERIAL_QUESTIONS = [
  { id: 'use', label: 'What is the frame for?', options: [
    { value: 'rx', label: 'Prescription (powered) glasses' },
    { value: 'sun', label: 'Sunglasses' },
    { value: 'plano', label: 'Non-powered / fashion (plano)' },
  ] },
  { id: 'power', label: 'Lens power?', showIf: (a) => a.use === 'rx', options: [
    { value: 'low', label: 'Low power (under ±4.00 D)' },
    { value: 'high', label: 'High power (±4.00 D and above)' },
  ] },
  { id: 'env', label: 'Wear environment?', options: [
    { value: 'everyday', label: 'Everyday indoor / outdoor' },
    { value: 'harsh', label: 'Harsh — beach, saltwater, heavy sweat, humidity' },
  ] },
  { id: 'skin', label: 'Skin sensitivity?', options: [
    { value: 'none', label: 'No known nickel sensitivity' },
    { value: 'sensitive', label: 'Nickel-sensitive / hypoallergenic required' },
  ] },
  { id: 'budget', label: 'Budget priority?', options: [
    { value: 'premium', label: 'Premium — best material wins' },
    { value: 'balanced', label: 'Balanced / value' },
    { value: 'cost_floor', label: 'Cost-floor — cheapest viable' },
  ] },
];

// Suggested base metal -> closest existing Finish preset (for the "Use suggested finish" action).
const METAL_TO_FINISH = {
  titanium: 'titanium-grey', ss316l: 'brushed-nickel', ss304: 'brushed-nickel',
  white_copper: 'bright-chrome', brass: 'antique-brass', monel: 'gunmetal-grey', nickel_silver: 'brushed-nickel',
};

// Manufacturability scorecard (higher = easier / better). Drives the recommended manufacturing route.
// `alias` reuses another material's profile (matrix has no 316L; white copper == nickel silver).
const MANUFACTURING_STEPS = ['cutting', 'soldering', 'polishing', 'tumbling', 'plating', 'painting', 'fitting', 'casting'];
const MANUFACTURING_STEP_LABELS = {
  cutting: 'Cutting', soldering: 'Soldering', polishing: 'Polishing', tumbling: 'Tumbling',
  plating: 'Plating', painting: 'Painting', fitting: 'Fitting', casting: 'Casting',
};
const MANUFACTURABILITY = {
  ss304: { overall: 3.0, scores: { cutting: 3, soldering: 2, polishing: 2, tumbling: 4, plating: 4, painting: 4, fitting: 4, casting: 1 }, notes: 'Weld/braze rather than solder. Polishes hard (electropolish for shine). ~8-10% Ni → prefer 316L or nickel-barrier plate for skin contact. Plating optional; can run bare. Not cast in eyewear.' },
  ss316l: { alias: 'ss304', extraNote: '316L manufactures like SS304 (laser-weld, hard to solder) but is preferred for prolonged skin contact.' },
  titanium: { overall: 2.5, scores: { cutting: 3, soldering: 1, polishing: 2, tumbling: 4, plating: 2, painting: 3, fitting: 4, casting: 1 }, notes: 'Laser-weld only — not solderable. Colour by anodizing; does NOT electroplate. Polishing hard → satin/bead-blast; use ceramic (non-ferrous) media. Nickel-free / hypoallergenic. Wire route only.', variant: 'Beta-Ti is springier — ideal for temples (IP-coat with adhesion prep).' },
  beta_titanium: { overall: 2.4, scores: { cutting: 2, soldering: 1, polishing: 2, tumbling: 4, plating: 2, painting: 3, fitting: 4, casting: 1 }, notes: 'Springy — ideal for temples. Laser-weld; IP-coat with adhesion prep. Hard to polish. Check grade for nickel. Wire route only.' },
  white_copper: { overall: 4.8, scores: { cutting: 5, soldering: 5, polishing: 5, tumbling: 5, plating: 5, painting: 4, fitting: 5, casting: 4 }, notes: 'Solders & polishes easily but tarnishes → plating/coating MANDATORY. Great plating substrate. High nickel → nickel-barrier plate for skin contact. Castable.' },
  brass: { overall: 4.9, scores: { cutting: 5, soldering: 5, polishing: 5, tumbling: 5, plating: 5, painting: 4, fitting: 5, casting: 5 }, notes: 'Best machinability & casting; solders easily; mirror-polishes fast. Plating MANDATORY (tarnish/dezincification). Use lead-free brass for compliance; Ni may enter via plating.' },
  monel: { overall: 4.4, scores: { cutting: 4, soldering: 5, polishing: 4, tumbling: 5, plating: 5, painting: 4, fitting: 5, casting: 3 }, notes: 'Mid-range workhorse. Solders & plates well; good corrosion resistance. High nickel → barrier plate for skin contact.' },
  nickel_silver: { alias: 'white_copper', extraNote: 'Nickel silver is the same cupronickel family as white copper on the shop floor.' },
};

const SPEC_CONTROLS = [
  { id: 'rxPower', label: 'Power', min: -8, max: 6, step: 0.25, value: 0, unit: 'D', note: 'single-vision design input' },
  { id: 'lensIndex', label: 'Lens index', min: 1.5, max: 1.74, step: 0.01, value: 1.59, unit: '', note: 'optical material index' },
];

const FRAME_PARAMETER_DEFINITIONS = [
  { id: 'lensWidth_mm', label: 'Lens width', unit: 'mm', min: 42, max: 64, step: 0.5, value: 52, tolerance: 0.15 },
  { id: 'lensHeight_mm', label: 'Lens height', unit: 'mm', min: 32, max: 56, step: 0.5, value: 44, tolerance: 0.15 },
  { id: 'bridgeWidth_mm', label: 'Bridge width', unit: 'mm', min: 12, max: 26, step: 0.5, value: 18, tolerance: 0.1 },
  { id: 'templeLength_mm', label: 'Temple length', unit: 'mm', min: 120, max: 160, step: 1, value: 140, tolerance: 0.25 },
  { id: 'templeThickness_mm', label: 'Temple thickness', unit: 'mm', min: 0.8, max: 4.5, step: 0.1, value: 1.5, tolerance: 0.05 },
  { id: 'rimThickness_mm', label: 'Rim thickness', unit: 'mm', min: 0.8, max: 4.5, step: 0.1, value: 2.1, tolerance: 0.05 },
  { id: 'baseCurve', label: 'Lens base curve', unit: 'curve', min: 0, max: 10, step: 0.25, value: 4, tolerance: 0 },
  { id: 'nosePadSpacing_mm', label: 'Nosepad spacing', unit: 'mm', min: 10, max: 26, step: 0.5, value: 17, tolerance: 0.1 },
  { id: 'frontFrameWidth_mm', label: 'Front-frame width', unit: 'mm', min: 112, max: 156, step: 0.5, value: 136, tolerance: 0.2 },
  { id: 'templeAngle_deg', label: 'Temple angle', unit: 'deg', min: 80, max: 105, step: 0.5, value: 92, tolerance: 0.25 },
  { id: 'hingePlacement_mm', label: 'Hinge placement', unit: 'mm', min: 0, max: 8, step: 0.25, value: 3.5, tolerance: 0.05 },
  { id: 'templeHeightPosition_mm', label: 'Temple height vs rim', unit: 'mm', min: -12, max: 12, step: 0.5, value: -6, tolerance: 0.15 },
  { id: 'templeCurveBendPoint_mm', label: 'Temple bend point', unit: 'mm', min: 60, max: 105, step: 1, value: 82, tolerance: 0.25 },
  { id: 'templeCurveDrop_mm', label: 'Temple drop', unit: 'mm', min: 12, max: 42, step: 0.5, value: 28, tolerance: 0.25 },
  { id: 'hingePosition_mm', label: 'Hinge position', unit: 'mm', min: 44, max: 70, step: 0.5, value: 58, tolerance: 0.15 },
  { id: 'tipDropAngle_deg', label: 'Tip drop angle', unit: 'deg', min: 0, max: 28, step: 0.5, value: 12, tolerance: 0.25 },
  { id: 'pantoscopicAngle_deg', label: 'Pantoscopic tilt', unit: 'deg', min: 0, max: 18, step: 0.5, value: 8, tolerance: 0.25 },
  { id: 'faceFormWrapAngle_deg', label: 'Wrap', unit: 'deg', min: 0, max: 14, step: 0.5, value: 6, tolerance: 0.25 },
  { id: 'splayAngle_deg', label: 'Splay angle', unit: 'deg', min: 0, max: 14, step: 0.5, value: 5, tolerance: 0.25 },
  { id: 'dbl_mm', label: 'DBL', unit: 'mm', min: 12, max: 26, step: 0.5, value: 18, tolerance: 0.1 },
  { id: 'lensGrooveDepth_mm', label: 'Lens groove depth', unit: 'mm', min: 0.2, max: 1.4, step: 0.05, value: 0.7, tolerance: 0.03 },
  { id: 'lensGrooveWidth_mm', label: 'Lens-groove width', unit: 'mm', min: 0.3, max: 1.6, step: 0.05, value: 0.9, tolerance: 0.03 },
  { id: 'weight_g', label: 'Frame weight', unit: 'g', min: 12, max: 44, step: 0.5, value: 23.5, tolerance: 0.1 },
];

const CORE_FRAME_GEOMETRY_KEYS = ['lensWidth_mm', 'bridgeWidth_mm', 'templeLength_mm', 'rimThickness_mm', 'templeThickness_mm'];
const FRAME_FIT_GEOMETRY_KEYS = [
  'baseCurve',
  'nosePadSpacing_mm',
  'templeHeightPosition_mm',
  'pantoscopicAngle_deg',
  'faceFormWrapAngle_deg',
  'splayAngle_deg',
  'lensGrooveDepth_mm',
];
const ADDITIONAL_GEOMETRY_KEYS = ['lensGrooveWidth_mm', 'weight_g'];
const DETAIL_GEOMETRY_KEYS = [
  'lensHeight_mm',
  'frontFrameWidth_mm',
  'templeAngle_deg',
  'hingePlacement_mm',
  'templeCurveBendPoint_mm',
  'templeCurveDrop_mm',
  'hingePosition_mm',
  'tipDropAngle_deg',
  'dbl_mm',
];
const FRAME_PARAMETER_BY_ID = Object.fromEntries(FRAME_PARAMETER_DEFINITIONS.map((definition) => [definition.id, definition]));

const STARTER_VALIDATION_RULES = [
  {
    id: 'std-lens-width',
    ruleSetId: 'starter-metal-frame',
    parameter: 'lensWidth_mm',
    operator: 'range',
    value: [46, 58],
    tolerance_mm: 0.15,
    severity: 'warn',
    message: 'Starter adult metal range for lens width; replace with uploaded brand/customer standard.',
  },
  {
    id: 'std-bridge',
    ruleSetId: 'starter-metal-frame',
    parameter: 'bridgeWidth_mm',
    operator: 'range',
    value: [16, 22],
    tolerance_mm: 0.1,
    severity: 'fail',
    message: 'Bridge width must sit inside the active guideline range.',
  },
  {
    id: 'std-temple-length',
    ruleSetId: 'starter-metal-frame',
    parameter: 'templeLength_mm',
    operator: 'range',
    value: [135, 150],
    tolerance_mm: 0.25,
    severity: 'fail',
    message: 'Temple length must comply with the active size rule.',
  },
  {
    id: 'std-rim-wall',
    ruleSetId: 'starter-metal-frame',
    parameter: 'rimThickness_mm',
    operator: 'min',
    value: 1.4,
    tolerance_mm: 0.05,
    severity: 'fail',
    message: 'Rim wall is below the configured minimum.',
  },
  {
    id: 'std-front-width',
    ruleSetId: 'starter-metal-frame',
    parameter: 'frontFrameWidth_mm',
    operator: 'range',
    value: [126, 145],
    tolerance_mm: 0.2,
    severity: 'fail',
    message: 'Front width must match the active fit target.',
  },
  {
    id: 'std-pad-spacing',
    ruleSetId: 'starter-metal-frame',
    parameter: 'nosePadSpacing_mm',
    operator: 'range',
    value: [14, 21],
    tolerance_mm: 0.1,
    severity: 'fail',
    message: 'Nose-pad spacing must stay inside the active guideline.',
  },
  {
    id: 'std-panto-angle',
    ruleSetId: 'starter-metal-frame',
    parameter: 'pantoscopicAngle_deg',
    operator: 'range',
    value: [6, 12],
    tolerance_mm: 0,
    severity: 'warn',
    message: 'Pantoscopic angle is outside the configured comfort band.',
  },
  {
    id: 'std-wrap',
    ruleSetId: 'starter-metal-frame',
    parameter: 'faceFormWrapAngle_deg',
    operator: 'range',
    value: [2, 8],
    tolerance_mm: 0,
    severity: 'warn',
    message: 'Face-form angle is outside the active wrap range.',
  },
];

const dom = {
  modelSelect: document.querySelector('#configuratorModelSelect'),
  state: document.querySelector('#configuratorState'),
  summary: document.querySelector('#configuratorSummary'),
  drawer: document.querySelector('#configuratorDrawer'),
  drawerToggle: document.querySelector('#configuratorDrawerToggle'),
  tabButtons: [...document.querySelectorAll('[data-configurator-tab]')],
  panels: [...document.querySelectorAll('[data-configurator-panel]')],
  partSections: document.querySelector('#configuratorPartSections'),
  partStatus: document.querySelector('#configuratorPartStatus'),
  materialGrid: document.querySelector('#materialPresetGrid'),
  materialReadout: document.querySelector('#materialReadout'),
  lensGrid: document.querySelector('#lensTintGrid'),
  lensReadout: document.querySelector('#lensReadout'),
  polarizedToggle: document.querySelector('#polarizedToggle'),
  specGrid: document.querySelector('#specControlGrid'),
  specReadout: document.querySelector('#specReadout'),
  metalGuide: document.querySelector('#metalGuide'),
  materialSelector: document.querySelector('#materialSelector'),
  materialSelectorReadout: document.querySelector('#materialSelectorReadout'),
  framePanel: document.querySelector('#frame3dPanel'),
  frameCanvas: document.querySelector('#frame3dCanvas'),
  frontButton: document.querySelector('#configuratorFrontButton'),
  saveButton: document.querySelector('#configuratorSaveButton'),
  saveStatus: document.querySelector('#configuratorSaveStatus'),
  labellerLink: document.querySelector('#configuratorLabellerLink'),
  matcherLink: document.querySelector('#configuratorMatcherLink'),
  lenskartMatcherLink: document.querySelector('#configuratorLenskartMatcherLink'),
  progress: document.querySelector('#configuratorProgress'),
  progressLabel: document.querySelector('#configuratorProgressLabel'),
  progressPercent: document.querySelector('#configuratorProgressPercent'),
  progressFill: document.querySelector('#configuratorProgressFill'),
};

let project = null;
let frame3dViewer = null;
let librariesByType = new Map();
let selectedPartIdsByType = {};
let activePartType = 'nose_bridge';
let activeMaterialId = 'gunmetal-grey';
let activeLensId = 'g15-smoke';
let polarized = true;
let specs = Object.fromEntries(SPEC_CONTROLS.map((control) => [control.id, control.value]));
let frameParameters = Object.fromEntries(FRAME_PARAMETER_DEFINITIONS.map((definition) => [definition.id, definition.value]));
let frontFrameWidthAutoSynced = true;
let frontFrameWidthAutoAllowance = 0;
syncSpecsFromFrameParameters();
let activeBuildId = 0;
let materialAnswers = {};

init();

async function init() {
  bindEvents();
  renderMaterialGrid();
  renderLensGrid();
  renderSpecControls();
  renderMetalGuide();
  renderMaterialSelector();
  const modelId = new URLSearchParams(window.location.search).get('model');
  await loadProject(modelId);
}

function bindEvents() {
  dom.modelSelect.addEventListener('change', async () => {
    const modelId = dom.modelSelect.value;
    window.history.replaceState(null, '', `/configurator?model=${encodeURIComponent(modelId)}`);
    await loadProject(modelId);
  });

  dom.frontButton.addEventListener('click', () => frame3dViewer?.setFrontView());
  dom.saveButton.addEventListener('click', saveConfiguratorBuild);
  dom.drawerToggle.addEventListener('click', () => {
    const collapsed = dom.drawer.classList.toggle('is-collapsed');
    dom.drawerToggle.textContent = collapsed ? 'Show' : 'Hide';
    dom.drawerToggle.setAttribute('aria-expanded', String(!collapsed));
    window.requestAnimationFrame(() => frame3dViewer?.resize());
  });

  dom.tabButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveTab(button.dataset.configuratorTab));
  });

  dom.polarizedToggle.addEventListener('click', () => {
    const tint = activeLens();
    if (!tint.polarizedAllowed) {
      polarized = false;
      markConfiguratorDirty();
      renderLensGrid();
      applyAppearance();
      updateValidationReport();
      return;
    }
    polarized = !polarized;
    markConfiguratorDirty();
    renderLensGrid();
    applyAppearance();
    updateValidationReport();
  });
}

async function loadProject(modelId = null) {
  setState('Loading');
  const projectUrl = modelId ? `/api/project?model=${encodeURIComponent(modelId)}` : '/api/project';
  project = await fetchJson(projectUrl);
  document.title = `Natalia - ${project.selectedModelId ?? project.modelId} Configurator`;
  populateModelSelect(project.models);
  dom.labellerLink.href = project.labellerUrl;
  dom.matcherLink.href = project.matcherUrl;
  dom.lenskartMatcherLink.href = project.lenskartMatcherUrl;
  await loadPartLibraries();
  initializeFrameParametersForModel(project.modelId);
  await loadSelectedConfiguratorBuild();
  initViewer();
  renderAll();
  setState(project.supports3dModel ? 'Ready' : 'No 3D');
}

async function loadSelectedConfiguratorBuild() {
  setSaveStatus(`Save as ${nextConfiguratorSaveName()}`);
  if (!project.configuratorLoadUrl) {
    return;
  }
  try {
    const saved = await fetchJson(project.configuratorLoadUrl);
    if (!saved.exists) {
      return;
    }
    applyConfiguratorSave(saved);
    setSaveStatus(`Loaded ${saved.savedAs}`);
  } catch {
    setSaveStatus(`Save as ${project.modelId}-01`);
  }
}

function applyConfiguratorSave(saved) {
  selectedPartIdsByType = {
    ...selectedPartIdsByType,
    ...stringEntries(saved.selectedPartIdsByType),
  };
  if (MATERIAL_PRESETS.some((preset) => preset.id === saved.materialId)) {
    activeMaterialId = saved.materialId;
  }
  if (LENS_TINTS.some((tint) => tint.id === saved.lensId)) {
    activeLensId = saved.lensId;
  }
  const tint = activeLens();
  polarized = Boolean(saved.polarized) && tint.polarizedAllowed;
  specs = {
    ...specs,
    ...numericEntries(saved.specs),
  };
  frameParameters = {
    ...frameParameters,
    ...numericEntries(saved.frameParameters),
  };
  const restoredAnswers = stringEntries(saved.materialAnswers);
  materialAnswers = Object.fromEntries(MATERIAL_QUESTIONS
    .map((question) => [question.id, restoredAnswers[question.id], question])
    .filter(([, value, question]) => question.options.some((option) => option.value === value))
    .map(([id, value]) => [id, value]));
  syncSpecsFromFrameParameters();
}

async function loadPartLibraries() {
  const entries = await Promise.all(PART_TYPES.map(async (partType) => [
    partType,
    await fetchJson(`/api/child-parts?type=${encodeURIComponent(partType)}`),
  ]));
  librariesByType = new Map(entries);
  activePartType = 'nose_bridge';
  selectedPartIdsByType = Object.fromEntries(PART_TYPES.map((partType) => {
    const parts = partsForType(partType);
    return [partType, defaultPartIdForType(partType, parts)];
  }));
}

function initViewer() {
  if (frame3dViewer) {
    frame3dViewer.destroy();
    frame3dViewer = null;
  }
  if (!project.supports3dModel) {
    return;
  }
  frame3dViewer = initFrame3DViewer({
    canvas: dom.frameCanvas,
    panel: dom.framePanel,
    modelId: project.modelId,
    childPartOverrides: selected3DChildPartOverrides(),
    dimensionOverrides: frameGeometryFromParameters(),
  });
  applyAppearance();
  window.requestAnimationFrame(() => {
    frame3dViewer?.resize();
    frame3dViewer?.setFrontView();
  });
}

function populateModelSelect(models) {
  dom.modelSelect.replaceChildren(...models.map((model) => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = model.title;
    return option;
  }));
  dom.modelSelect.value = project.selectedModelId ?? project.modelId;
}

function renderAll() {
  renderPartSections();
  renderMaterialGrid();
  renderLensGrid();
  renderSpecControls();
  renderMetalGuide();
  renderMaterialSelector();
  updateSummary();
}

function setActiveTab(tab) {
  dom.tabButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.configuratorTab === tab));
  dom.panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.configuratorPanel === tab));
}

function renderPartSections() {
  dom.partSections.replaceChildren(...PART_TYPES.map((partType) => createPartSection(partType)));
  updatePartStatus();
}

function createPartSection(partType) {
  const parts = partsForType(partType);
  const section = document.createElement('section');
  section.className = 'part-drawer-section';
  section.classList.toggle('is-expanded', activePartType === partType);
  section.dataset.partType = partType;

  const heading = document.createElement('div');
  heading.className = 'part-section-heading';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'part-section-toggle';
  toggle.dataset.partType = partType;
  toggle.setAttribute('aria-expanded', String(activePartType === partType));
  toggle.addEventListener('click', () => {
    toggleConfiguratorPartType(partType);
  });
  const title = document.createElement('span');
  title.textContent = PART_LABELS[partType] ?? partType;
  toggle.append(title);
  const count = document.createElement('span');
  count.className = 'part-count';
  count.textContent = String(parts.length);
  heading.append(toggle, count);

  const list = document.createElement('div');
  list.className = 'part-card-list';
  list.hidden = activePartType !== partType;
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', `${PART_LABELS[partType]} parts`);
  list.replaceChildren(...parts.map((part) => createPartCard(partType, part)));
  section.append(heading, list);
  return section;
}

function toggleConfiguratorPartType(partType) {
  if (!PART_TYPES.includes(partType)) {
    return;
  }
  activePartType = activePartType === partType ? null : partType;
  renderPartSections();
}

function createPartCard(partType, part) {
  const selected = selectedPartIdsByType[partType] === part.id;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'part-card';
  button.classList.toggle('is-selected', selected);
  button.setAttribute('role', 'option');
  button.setAttribute('aria-selected', String(selected));
  button.addEventListener('click', () => selectPart(partType, part.id));

  const media = document.createElement('span');
  media.className = 'part-card-media';
  const image = document.createElement('img');
  image.src = part.assets?.svgUrl ?? svgDataUrl(generatedPartPreviewSvg(partType, part));
  image.alt = '';
  image.loading = 'lazy';
  image.addEventListener('error', () => {
    image.remove();
    media.textContent = partInitials(part);
  });
  media.append(image);

  const body = document.createElement('span');
  body.className = 'part-card-body';
  const name = document.createElement('strong');
  name.textContent = part.name;
  const detail = document.createElement('span');
  detail.textContent = partCardDetail(part);
  body.append(name, detail);
  button.append(media, body);
  return button;
}

async function selectPart(partType, partId) {
  selectedPartIdsByType = { ...selectedPartIdsByType, [partType]: partId };
  activePartType = partType;
  markConfiguratorDirty();
  renderPartSections();
  updateSummary();
  updateValidationReport();
  const part = selectedPartByType(partType);
  if (!frame3dViewer || !part?.configurator?.canPreviewOnFrame) {
    return;
  }
  await run3DRenderBuild(part.name, () => {
    frame3dViewer.applyChildPart(partType, part);
  });
}

function renderMaterialGrid() {
  dom.materialGrid.replaceChildren(...MATERIAL_PRESETS.map((preset) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch-button material-configurator-swatch';
    button.classList.toggle('is-selected', preset.id === activeMaterialId);
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', String(preset.id === activeMaterialId));
    button.style.setProperty('--swatch-color', preset.color);
    button.innerHTML = `<span class="round-swatch" aria-hidden="true"></span><strong>${preset.label}</strong><small>${preset.family}</small>`;
    button.addEventListener('click', () => {
      activeMaterialId = preset.id;
      markConfiguratorDirty();
      renderMaterialGrid();
      applyAppearance();
      updateValidationReport();
    });
    return button;
  }));
  dom.materialReadout.textContent = activeMaterial().label;
}

function renderMetalGuide() {
  if (!dom.metalGuide) return;
  dom.metalGuide.replaceChildren(...METAL_GUIDE.map((table) => {
    const card = document.createElement('section');
    card.className = 'metal-guide-table';
    const head = document.createElement('div');
    head.className = 'metal-guide-head';
    head.innerHTML = `<h3>${escapeHtml(table.title)}</h3><small>${escapeHtml(table.note)}</small>`;
    const scroll = document.createElement('div');
    scroll.className = 'metal-guide-scroll';
    const headerCells = table.columns.map((c) => `<th scope="col">${escapeHtml(c)}</th>`).join('');
    const bodyRows = table.rows.map((row) => {
      const cells = row.map((cell, index) => (index === 0
        ? `<th scope="row">${escapeHtml(cell)}</th>`
        : `<td>${escapeHtml(cell)}</td>`)).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    scroll.innerHTML = `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    card.append(head, scroll);
    return card;
  }));
}

// Deterministic base-metal advisor. Returns a ranked list of suggested alloys (best first),
// an avoid list, the driving notes, and the reasoning — all derived from the QC matrix.
function recommendMaterial(a) {
  const notes = [];
  let primary;
  let acceptable = [];
  let avoid = [];
  let archetype;

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
    if (primary === 'ss304') {
      primary = 'ss316l';
      notes.push('Chloride/beach exposure → SS304 stepped up to 316L for pitting resistance.');
    } else if (primary === 'white_copper') {
      acceptable = ['ss316l', ...acceptable];
      notes.push('Harsh exposure → white copper only with strong PVD; stainless preferred.');
    }
  }

  // C. Nickel sensitivity — hard constraint toward Ni-locked alloys
  if (a.skin === 'sensitive') {
    const safe = ['titanium', 'ss316l'];
    if (!safe.includes(primary)) primary = a.budget === 'premium' ? 'titanium' : 'ss316l';
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
        notes.push('Cost-floor → stepped down to the cheapest viable alloy; manage the trade-offs in the scorecard.');
      }
    }
  }

  // E. Dedupe and rank into a multi-suggestion list
  acceptable = acceptable.filter((m, i, arr) => m !== primary && arr.indexOf(m) === i && MATERIALS[m]);
  avoid = avoid.filter((m, i, arr) => m !== primary && !acceptable.includes(m) && arr.indexOf(m) === i && MATERIALS[m]);
  const suggestions = [primary, ...acceptable].map((id, index) => ({ id, rank: index + 1, role: index === 0 ? 'best' : 'alternative' }));

  // F. Reasons (Usage sheet), chosen by the answers
  const col = a.use === 'rx' ? 'rx' : 'sun';
  const keys = ['wear', 'weightPrio', 'nickel'];
  if (a.use === 'rx' && a.power === 'high') keys.splice(1, 0, 'lensWeight');
  if (a.env === 'harsh') keys.push('corrosion');
  if (a.use === 'rx') keys.push('adjust');
  const reasons = [...new Set(keys)].map((k) => ({ label: USAGE_DIMENSIONS[k].label, text: USAGE_DIMENSIONS[k][col] }));

  return { archetype, suggestions, avoid, notes, reasons };
}

// Resolve a material's manufacturability row, following `alias` (e.g. 316L -> SS304).
function manufacturabilityFor(materialId) {
  const entry = MANUFACTURABILITY[materialId];
  if (!entry) return null;
  if (entry.alias) {
    const base = MANUFACTURABILITY[entry.alias];
    if (!base) return null;
    return { ...base, extraNote: entry.extraNote, aliasOf: entry.alias };
  }
  return entry;
}

// Decide the manufacturing route from the scores (higher = better / easier).
function decideManufacturing(materialId) {
  const entry = manufacturabilityFor(materialId);
  if (!entry) return null;
  const s = entry.scores;
  const isTitanium = materialId === 'titanium' || materialId === 'beta_titanium' || entry.aliasOf === 'titanium';

  let colour;
  if (isTitanium) colour = { pick: 'Anodize / IP-coat', why: 'does not electroplate' };
  else if (s.plating >= 4) colour = { pick: 'Electroplate / PVD', why: `strong plating substrate (${s.plating}/5)` };
  else colour = { pick: 'Paint / powder coat', why: `limited plating (${s.plating}/5)` };

  const route = [
    { step: 'Joining', pick: s.soldering >= 4 ? 'Solder / braze' : 'Laser / TIG weld', why: s.soldering >= 4 ? `solders easily (${s.soldering}/5)` : `low solderability (${s.soldering}/5)` },
    { step: 'Finishing', pick: s.polishing >= 4 ? 'Mirror polish' : 'Satin / bead-blast', why: s.polishing >= 4 ? `polishes easily (${s.polishing}/5)` : `hard to polish (${s.polishing}/5)` },
    { step: 'Colour / coating', pick: colour.pick, why: colour.why },
    { step: 'Forming', pick: s.casting >= 4 ? 'Cast or wire / sheet' : 'Wire / sheet (not cast)', why: `casting ${s.casting}/5` },
  ];

  const topSteps = MANUFACTURING_STEPS
    .map((key) => ({ key, label: MANUFACTURING_STEP_LABELS[key], score: s[key] }))
    .sort((a, b) => b.score - a.score);

  const extraNotes = [entry.extraNote, entry.variant].filter(Boolean);
  return { overall: entry.overall, scores: s, notes: entry.notes, extraNotes, route, topSteps };
}

// 1 (worst) -> 5 (best) traffic-light scale, matching the QC scorecard's conditional formatting.
function manufacturingScoreColor(score) {
  return { 1: '#d64545', 2: '#e0803c', 3: '#e6be3f', 4: '#7fb069', 5: '#2f9e5f' }[score] ?? '#9aa0a6';
}

function visibleMaterialQuestions() {
  return MATERIAL_QUESTIONS.filter((question) => !question.showIf || question.showIf(materialAnswers));
}

function setMaterialAnswer(id, value) {
  materialAnswers = { ...materialAnswers, [id]: value };
  // Drop answers whose question is no longer visible (e.g. power after leaving Rx).
  MATERIAL_QUESTIONS.forEach((question) => {
    if (question.showIf && !question.showIf(materialAnswers) && question.id in materialAnswers) {
      const next = { ...materialAnswers };
      delete next[question.id];
      materialAnswers = next;
    }
  });
  renderMaterialSelector();
}

function resetMaterialSelector() {
  materialAnswers = {};
  renderMaterialSelector();
}

function renderMaterialSelector() {
  if (!dom.materialSelector) return;
  const questions = visibleMaterialQuestions();
  const nodes = [];

  const quiz = document.createElement('div');
  quiz.className = 'material-quiz';
  questions.forEach((question) => quiz.append(createMaterialQuestion(question)));
  nodes.push(quiz);

  const complete = questions.every((question) => materialAnswers[question.id]);
  if (complete) {
    nodes.push(createMaterialResult(recommendMaterial(materialAnswers)));
  } else {
    const hint = document.createElement('p');
    hint.className = 'material-quiz-hint';
    hint.textContent = 'Pick an option for each question to see suggested base metals.';
    nodes.push(hint);
    setMaterialSelectorReadout('Answer to get a suggestion');
  }

  dom.materialSelector.replaceChildren(...nodes);
}

function createMaterialQuestion(question) {
  const block = document.createElement('section');
  block.className = 'material-q';
  const label = document.createElement('h3');
  label.className = 'material-q-label';
  label.textContent = question.label;
  const options = document.createElement('div');
  options.className = 'material-q-options';
  question.options.forEach((option) => {
    const selected = materialAnswers[question.id] === option.value;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'material-q-option';
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.textContent = option.label;
    button.addEventListener('click', () => setMaterialAnswer(question.id, option.value));
    options.append(button);
  });
  block.append(label, options);
  return block;
}

function createMaterialResult(rec) {
  const best = rec.suggestions[0];
  setMaterialSelectorReadout(best ? `${MATERIALS[best.id].label} suggested` : 'No match');

  const result = document.createElement('div');
  result.className = 'material-result';

  const head = document.createElement('div');
  head.className = 'material-result-head';
  head.innerHTML = `<span class="material-archetype">${escapeHtml(rec.archetype)}</span><strong>${rec.suggestions.length} suggested base metal${rec.suggestions.length === 1 ? '' : 's'}</strong>`;
  result.append(head);

  const cards = document.createElement('div');
  cards.className = 'material-suggest-grid';
  rec.suggestions.forEach((suggestion) => cards.append(createSuggestionCard(suggestion)));
  result.append(cards);

  if (best) {
    const manufacturing = createManufacturingSection(best.id);
    if (manufacturing) result.append(manufacturing);
  }

  if (rec.notes.length) {
    const notes = document.createElement('div');
    notes.className = 'material-notes';
    notes.replaceChildren(...rec.notes.map((note) => {
      const chip = document.createElement('p');
      chip.className = 'material-note';
      chip.textContent = note;
      return chip;
    }));
    result.append(notes);
  }

  if (rec.avoid.length) {
    const avoid = document.createElement('p');
    avoid.className = 'material-avoid';
    avoid.innerHTML = `<span>Avoid</span> ${rec.avoid.map((id) => `<s>${escapeHtml(MATERIALS[id].label)}</s>`).join(' · ')}`;
    result.append(avoid);
  }

  const reasons = document.createElement('div');
  reasons.className = 'material-reasons';
  const reasonsHead = document.createElement('h4');
  reasonsHead.textContent = 'Why these';
  const reasonsList = document.createElement('dl');
  rec.reasons.forEach((reason) => {
    const dt = document.createElement('dt');
    dt.textContent = reason.label;
    const dd = document.createElement('dd');
    dd.textContent = reason.text;
    reasonsList.append(dt, dd);
  });
  reasons.append(reasonsHead, reasonsList);
  result.append(reasons);

  const actions = document.createElement('div');
  actions.className = 'material-actions';
  const finishId = best && METAL_TO_FINISH[best.id];
  if (finishId && MATERIAL_PRESETS.some((preset) => preset.id === finishId)) {
    const applyButton = document.createElement('button');
    applyButton.type = 'button';
    applyButton.className = 'primary-button';
    applyButton.textContent = 'Use suggested finish';
    applyButton.addEventListener('click', () => applySuggestedFinish(best.id));
    actions.append(applyButton);
  }
  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'action-button';
  resetButton.textContent = 'Reset';
  resetButton.addEventListener('click', resetMaterialSelector);
  actions.append(resetButton);
  result.append(actions);

  return result;
}

function createSuggestionCard(suggestion) {
  const material = MATERIALS[suggestion.id];
  const card = document.createElement('article');
  card.className = `material-suggest-card ${suggestion.role}`;
  const tag = suggestion.role === 'best' ? 'Best match' : `Also suitable #${suggestion.rank}`;
  const mfg = manufacturabilityFor(suggestion.id);
  const easeChip = mfg
    ? `<span class="material-ease" title="Manufacturing ease (1-5, higher = easier)" style="--ease-color:${manufacturingScoreColor(Math.round(mfg.overall))}">Mfg ease ${mfg.overall.toFixed(1)}/5</span>`
    : '';
  card.innerHTML = `
    <div class="material-suggest-top">
      <span class="material-rank">${escapeHtml(tag)}</span>
      <strong>${escapeHtml(material.label)}</strong>
      <small>${escapeHtml(material.composition)}</small>
      ${easeChip}
    </div>
    <dl class="material-suggest-specs">
      <div><dt>Nickel / skin</dt><dd>${escapeHtml(material.nickel)}</dd></div>
      <div><dt>Corrosion</dt><dd>${escapeHtml(material.corrosion)}</dd></div>
      <div><dt>Durability</dt><dd>${escapeHtml(material.durability)}</dd></div>
      <div><dt>Joining</dt><dd>${escapeHtml(material.joining)}</dd></div>
      <div><dt>Manufacturing</dt><dd>${escapeHtml(material.mfg)}</dd></div>
    </dl>
    <small class="material-suggest-use">${escapeHtml(material.use)}</small>
  `;
  return card;
}

function createManufacturingSection(materialId) {
  const plan = decideManufacturing(materialId);
  if (!plan) return null;
  const material = MATERIALS[materialId];
  const section = document.createElement('section');
  section.className = 'material-mfg';

  const head = document.createElement('div');
  head.className = 'material-mfg-head';
  head.innerHTML = `
    <div>
      <h4>Manufacturing route</h4>
      <small>${escapeHtml(material ? material.label : materialId)} — higher score = easier / preferred</small>
    </div>
    <span class="material-mfg-ease" style="--ease-color:${manufacturingScoreColor(Math.round(plan.overall))}">${plan.overall.toFixed(1)}/5 overall</span>
  `;
  section.append(head);

  const route = document.createElement('div');
  route.className = 'material-mfg-route';
  route.replaceChildren(...plan.route.map((item) => {
    const row = document.createElement('div');
    row.className = 'material-mfg-step';
    row.innerHTML = `<span class="material-mfg-stepname">${escapeHtml(item.step)}</span><strong>${escapeHtml(item.pick)}</strong><small>${escapeHtml(item.why)}</small>`;
    return row;
  }));
  section.append(route);

  const grid = document.createElement('div');
  grid.className = 'material-mfg-scores';
  grid.replaceChildren(...MANUFACTURING_STEPS.map((key) => {
    const score = plan.scores[key];
    const cell = document.createElement('div');
    cell.className = 'material-mfg-score';
    cell.innerHTML = `<span class="material-mfg-scorelabel">${escapeHtml(MANUFACTURING_STEP_LABELS[key])}</span><span class="material-mfg-scoreval" style="background:${manufacturingScoreColor(score)}">${score}</span>`;
    return cell;
  }));
  section.append(grid);

  const notes = [plan.notes, ...plan.extraNotes].filter(Boolean);
  if (notes.length) {
    const noteWrap = document.createElement('div');
    noteWrap.className = 'material-mfg-notes';
    noteWrap.replaceChildren(...notes.map((text) => {
      const paragraph = document.createElement('p');
      paragraph.className = 'material-mfg-note';
      paragraph.textContent = text;
      return paragraph;
    }));
    section.append(noteWrap);
  }

  return section;
}

function applySuggestedFinish(metalId) {
  const finishId = METAL_TO_FINISH[metalId];
  if (!finishId || !MATERIAL_PRESETS.some((preset) => preset.id === finishId)) return;
  activeMaterialId = finishId;
  markConfiguratorDirty();
  renderMaterialGrid();
  applyAppearance();
  updateValidationReport();
}

function setMaterialSelectorReadout(text) {
  if (dom.materialSelectorReadout) dom.materialSelectorReadout.textContent = text;
}

function renderLensGrid() {
  dom.lensGrid.replaceChildren(...LENS_TINTS.map((tint) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch-button lens-configurator-swatch';
    button.classList.toggle('is-selected', tint.id === activeLensId);
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', String(tint.id === activeLensId));
    button.style.setProperty('--swatch-color', tint.color);
    button.innerHTML = `<span class="lens-swatch" aria-hidden="true"></span><strong>${tint.label}</strong><small>${tint.materialId.toUpperCase()}${tint.polarizedAllowed ? ' / polar ok' : ''}</small>`;
    button.addEventListener('click', () => {
      activeLensId = tint.id;
      if (!tint.polarizedAllowed) polarized = false;
      markConfiguratorDirty();
      renderLensGrid();
      applyAppearance();
      updateValidationReport();
    });
    return button;
  }));
  const tint = activeLens();
  dom.lensReadout.textContent = tint.label;
  dom.polarizedToggle.disabled = !tint.polarizedAllowed;
  dom.polarizedToggle.classList.toggle('is-selected', polarized);
  dom.polarizedToggle.setAttribute('aria-pressed', String(polarized));
  dom.polarizedToggle.querySelector('span').textContent = polarized ? 'On' : 'Off';
}

function renderSpecControls() {
  dom.specGrid.replaceChildren(
    createValidationSection(),
    createSpecSection('Core Frame Geometry', CORE_FRAME_GEOMETRY_KEYS.map((key) => createFrameParameterControl(FRAME_PARAMETER_BY_ID[key]))),
    createSpecSection('Prescription Optics', SPEC_CONTROLS.map(createOpticalSpecControl)),
    createSpecSection('Frame Fit Geometry', FRAME_FIT_GEOMETRY_KEYS.map((key) => createFrameParameterControl(FRAME_PARAMETER_BY_ID[key]))),
    createDetailsSpecSection('Detailed CAD Controls', DETAIL_GEOMETRY_KEYS.map((key) => createFrameParameterControl(FRAME_PARAMETER_BY_ID[key]))),
    createDetailsSpecSection('Additional Manufacturing Controls', ADDITIONAL_GEOMETRY_KEYS.map((key) => createFrameParameterControl(FRAME_PARAMETER_BY_ID[key]))),
  );
  updateSpecReadout();
  updateValidationReport();
}

function createValidationSection() {
  const section = document.createElement('section');
  section.className = 'validation-summary-card';
  section.dataset.validationReport = 'true';
  section.setAttribute('data-validation-status', 'pass');
  section.innerHTML = `
    <div class="validation-summary-head">
      <span class="validation-status-pill pass" data-validation-pill>pass</span>
      <strong>Validation</strong>
      <small data-validation-counts>0 fail / 0 warn</small>
    </div>
    <div class="validation-result-list" data-validation-results></div>
  `;
  return section;
}

function createSpecSection(title, controls) {
  const section = document.createElement('section');
  section.className = 'configurator-spec-section';
  const heading = document.createElement('h3');
  heading.textContent = title;
  const stack = document.createElement('div');
  stack.className = 'configurator-spec-stack';
  stack.replaceChildren(...controls.filter(Boolean));
  section.append(heading, stack);
  return section;
}

function createDetailsSpecSection(title, controls) {
  const details = document.createElement('details');
  details.className = 'configurator-spec-section configurator-spec-details';
  const summary = document.createElement('summary');
  summary.textContent = title;
  const stack = document.createElement('div');
  stack.className = 'configurator-spec-stack';
  stack.replaceChildren(...controls.filter(Boolean));
  details.append(summary, stack);
  return details;
}

function createOpticalSpecControl(control) {
  const value = specs[control.id];
  const label = document.createElement('label');
  label.className = 'configurator-spec-control';
  label.innerHTML = `
    <span>${control.label}<b>${formatSpecValue(value, control.unit)}</b></span>
    <div class="spec-input-row">
      <input type="range" min="${control.min}" max="${control.max}" step="${control.step}" value="${value}">
      <input type="number" min="${control.min}" max="${control.max}" step="${control.step}" value="${value}" aria-label="${control.label} value">
    </div>
    <small>${control.note}</small>
  `;
  const [range, number] = label.querySelectorAll('input');
  const update = (nextValue) => {
    const value = clampToRange(Number(nextValue), control.min, control.max);
    specs = { ...specs, [control.id]: value };
    markConfiguratorDirty();
    range.value = String(value);
    number.value = String(value);
    label.querySelector('b').textContent = formatSpecValue(value, control.unit);
    updateSpecReadout();
    applyAppearance();
    updateValidationReport();
  };
  range.addEventListener('input', () => update(range.value));
  number.addEventListener('input', () => update(number.value));
  return label;
}

function createFrameParameterControl(definition) {
  if (!definition) return null;
  const value = frameParameters[definition.id];
  const label = document.createElement('label');
  label.className = 'configurator-spec-control frame-parameter-control';
  label.dataset.parameterId = definition.id;
  label.innerHTML = `
    <span>${definition.label}<b data-parameter-value="${definition.id}">${formatParameterValue(definition, value)}</b></span>
    <div class="spec-input-row">
      <input type="range" min="${definition.min}" max="${definition.max}" step="any" value="${value}">
      <input type="number" min="${definition.min}" max="${definition.max}" step="${definition.step}" value="${value}" aria-label="${definition.label} value">
    </div>
    <small>tol ${formatTolerance(definition)}</small>
  `;
  const [range, number] = label.querySelectorAll('input');
  const update = (nextValue) => {
    const value = setFrameParameterValue(definition.id, nextValue);
    markConfiguratorDirty();
    range.value = String(value);
    number.value = String(value);
    refreshFrameParameterLabels();
    updateSpecReadout();
    applyFrameParameters();
    updateValidationReport();
  };
  range.addEventListener('input', () => update(range.value));
  number.addEventListener('input', () => update(number.value));
  return label;
}

function initializeFrameParametersForModel(modelId) {
  const dimensions = FRAME_3D_DIMENSIONS[modelId];
  frameParameters = Object.fromEntries(FRAME_PARAMETER_DEFINITIONS.map((definition) => [definition.id, definition.value]));
  frontFrameWidthAutoSynced = true;
  frontFrameWidthAutoAllowance = 0;
  if (dimensions) {
    frontFrameWidthAutoAllowance = dimensions.frontWidth - ((dimensions.lensWidth * 2) + dimensions.bridgeWidth);
    frameParameters = {
      ...frameParameters,
      lensWidth_mm: dimensions.lensWidth,
      lensHeight_mm: dimensions.lensHeight,
      bridgeWidth_mm: dimensions.bridgeWidth,
      dbl_mm: dimensions.nominalBridgeWidth ?? dimensions.bridgeWidth,
      templeLength_mm: dimensions.templeLength,
      frontFrameWidth_mm: dimensions.frontWidth,
      rimThickness_mm: dimensions.rimThickness ?? roundTo((dimensions.rimTubeRadius ?? 1.05) * 2, 2),
    };
  }
  syncSpecsFromFrameParameters();
}

function setFrameParameterValue(parameterId, nextValue) {
  const definition = FRAME_PARAMETER_BY_ID[parameterId];
  if (!definition) return Number(nextValue);
  const value = clampToRange(Number(nextValue), definition.min, definition.max);
  if (!Number.isFinite(value)) return frameParameters[parameterId];
  frameParameters = {
    ...frameParameters,
    [parameterId]: value,
  };
  syncConnectedFrameParameters(parameterId);
  syncSpecsFromFrameParameters();
  return value;
}

function syncConnectedFrameParameters(parameterId) {
  if (parameterId === 'bridgeWidth_mm') {
    frameParameters.dbl_mm = frameParameters.bridgeWidth_mm;
  }
  if (parameterId === 'dbl_mm') {
    frameParameters.bridgeWidth_mm = frameParameters.dbl_mm;
  }
  if (parameterId === 'frontFrameWidth_mm') {
    frontFrameWidthAutoSynced = false;
  }
  if (['lensWidth_mm', 'bridgeWidth_mm', 'dbl_mm'].includes(parameterId) && frontFrameWidthAutoSynced) {
    const definition = FRAME_PARAMETER_BY_ID.frontFrameWidth_mm;
    const connectedWidth = (frameParameters.lensWidth_mm * 2) + frameParameters.bridgeWidth_mm + frontFrameWidthAutoAllowance;
    frameParameters.frontFrameWidth_mm = clampToRange(roundTo(connectedWidth, 3), definition.min, definition.max);
  }
}

function refreshFrameParameterLabels() {
  document.querySelectorAll('.frame-parameter-control').forEach((control) => {
    const definition = FRAME_PARAMETER_BY_ID[control.dataset.parameterId];
    if (definition) {
      const value = frameParameters[definition.id];
      const readout = control.querySelector('[data-parameter-value]');
      const inputs = control.querySelectorAll('input');
      if (readout) readout.textContent = formatParameterValue(definition, value);
      inputs.forEach((input) => {
        input.value = String(value);
      });
    }
  });
}

function syncSpecsFromFrameParameters() {
  specs = {
    ...specs,
    faceWrap: frameParameters.faceFormWrapAngle_deg,
    pantoscopicTilt: frameParameters.pantoscopicAngle_deg,
  };
}

function applyFrameParameters(nextParameters = {}) {
  Object.entries(nextParameters).forEach(([key, value]) => setFrameParameterValue(key, value));
  if (frame3dViewer?.applyFrameParameters) {
    frame3dViewer.applyFrameParameters(frameGeometryFromParameters());
  }
  applyAppearance();
}

function frameGeometryFromParameters() {
  return {
    lensWidth: frameParameters.lensWidth_mm,
    lensHeight: frameParameters.lensHeight_mm,
    bridgeWidth: frameParameters.bridgeWidth_mm,
    dbl: frameParameters.dbl_mm,
    frontWidth: frameParameters.frontFrameWidth_mm,
    templeLength: frameParameters.templeLength_mm,
    rimThickness: frameParameters.rimThickness_mm,
    templeThickness: frameParameters.templeThickness_mm,
    nosePadSpacing: frameParameters.nosePadSpacing_mm,
    baseCurve: frameParameters.baseCurve,
    templeAngle: frameParameters.templeAngle_deg,
    hingePlacement: frameParameters.hingePlacement_mm,
    templeHeightPosition: frameParameters.templeHeightPosition_mm,
    templeCurveBendPoint: frameParameters.templeCurveBendPoint_mm,
    templeCurveDrop: frameParameters.templeCurveDrop_mm,
    hingePosition: frameParameters.hingePosition_mm,
    tipDropAngle: frameParameters.tipDropAngle_deg,
    splayAngle: frameParameters.splayAngle_deg,
    lensGrooveDepth: frameParameters.lensGrooveDepth_mm,
    lensGrooveWidth: frameParameters.lensGrooveWidth_mm,
    weight: frameParameters.weight_g,
  };
}

function validateConfiguratorDesign() {
  const ruleResults = STARTER_VALIDATION_RULES.map(evaluateValidationRule);
  const assemblyResults = PART_TYPES.map((partType) => {
    const part = selectedPartByType(partType);
    const pass = Boolean(part);
    return {
      ruleId: `assembly-${partType}`,
      label: `Assembly ${PART_LABELS[partType] ?? partType}`,
      status: pass ? 'pass' : 'fail',
      severity: 'fail',
      measured: pass ? part.name : 'missing',
      expected: 'present',
      message: `${PART_LABELS[partType] ?? partType} component is required for export.`,
      source: 'geometry',
    };
  });
  const syntheticResults = [
    fitProfileValidationResult(),
    lensStressValidationResult(),
  ];
  const results = [...ruleResults, ...assemblyResults, ...syntheticResults];
  const status = results.some((result) => result.status === 'fail')
    ? 'fail'
    : results.some((result) => result.status === 'warn')
      ? 'warn'
      : 'pass';
  return {
    status,
    results,
    failing: results.filter((result) => result.status === 'fail'),
    warnings: results.filter((result) => result.status === 'warn'),
  };
}

function evaluateValidationRule(rule) {
  const measured = validationValueForRule(rule.parameter);
  let passes = true;
  if (rule.operator === 'min') passes = Number(measured) + rule.tolerance_mm >= Number(rule.value);
  if (rule.operator === 'max') passes = Number(measured) - rule.tolerance_mm <= Number(rule.value);
  if (rule.operator === 'range') {
    const [min, max] = rule.value;
    passes = Number(measured) + rule.tolerance_mm >= min && Number(measured) - rule.tolerance_mm <= max;
  }
  if (rule.operator === 'equals') passes = String(measured).toLowerCase() === String(rule.value).toLowerCase();
  if (rule.operator === 'in') {
    const allowed = Array.isArray(rule.value) ? rule.value : [rule.value];
    passes = allowed.map((item) => String(item).toLowerCase()).includes(String(measured).toLowerCase());
  }
  return {
    ruleId: rule.id,
    label: validationLabel(rule.parameter),
    status: passes ? 'pass' : rule.severity,
    severity: rule.severity,
    measured: validationMeasuredLabel(rule.parameter, measured),
    expected: `${rule.operator} ${Array.isArray(rule.value) ? rule.value.join(' - ') : rule.value}${rule.tolerance_mm ? `, tol ${rule.tolerance_mm.toFixed(2)} mm` : ''}`,
    message: rule.message,
    source: rule.ruleSetId.startsWith('starter') ? 'starter' : 'uploaded',
  };
}

function validationValueForRule(parameter) {
  if (parameter in frameParameters) return frameParameters[parameter];
  if (parameter in specs) return specs[parameter];
  if (parameter === 'materialPreset') return activeMaterialId;
  if (parameter === 'lensTint.materialId') return activeLens().materialId;
  if (parameter === 'polarized') return polarized;
  return undefined;
}

function fitProfileValidationResult() {
  const issues = [];
  const faceWidthTarget = 136;
  const bridgeTarget = 18;
  const templeTarget = 140;
  const frontDelta = frameParameters.frontFrameWidth_mm - faceWidthTarget;
  const bridgeDelta = frameParameters.bridgeWidth_mm - bridgeTarget;
  const templeDelta = frameParameters.templeLength_mm - templeTarget;
  if (Math.abs(frontDelta) > 5) issues.push(`front ${frontDelta.toFixed(1)} mm`);
  if (Math.abs(bridgeDelta) > 2) issues.push(`bridge ${bridgeDelta.toFixed(1)} mm`);
  if (templeDelta < -5 || templeDelta > 8) issues.push(`temple ${templeDelta.toFixed(1)} mm`);
  return {
    ruleId: 'fit-profile',
    label: 'Fit profile',
    status: issues.length > 2 ? 'fail' : issues.length ? 'warn' : 'pass',
    severity: 'warn',
    measured: issues.length ? issues.join('; ') : 'no fit issues',
    expected: 'selected face profile',
    message: 'Fit simulation uses the active front, bridge, and temple measurements.',
    source: 'fit',
  };
}

function lensStressValidationResult() {
  const edgeThickness = Math.max(1, 1.15 + Math.abs(specs.rxPower) * 0.28 - (specs.lensIndex - 1.5) * 1.6);
  const centerThickness = Math.max(1.1, 1.25 + Math.max(specs.rxPower, 0) * 0.12);
  const stressScore = edgeThickness
    + frameParameters.lensGrooveDepth_mm * 1.7
    + Math.abs(edgeThickness - centerThickness) * 0.25
    - frameParameters.rimThickness_mm;
  const stressRisk = stressScore > 2.5 ? 'high' : stressScore > 1.3 ? 'medium' : 'low';
  return {
    ruleId: 'lens-stress',
    label: 'Lens stress',
    status: stressRisk === 'high' ? 'warn' : 'pass',
    severity: 'warn',
    measured: `${stressRisk}; center ${centerThickness.toFixed(2)} mm / edge ${edgeThickness.toFixed(2)} mm`,
    expected: 'low or medium heuristic risk',
    message: 'Optical lens simulation uses power, refractive index, groove depth, and rim thickness.',
    source: 'simulation',
  };
}

function updateValidationReport() {
  const card = dom.specGrid?.querySelector('[data-validation-report]');
  if (!card) return;
  renderValidationReport(card, validateConfiguratorDesign());
}

function renderValidationReport(card, report) {
  card.dataset.validationStatus = report.status;
  const pill = card.querySelector('[data-validation-pill]');
  const counts = card.querySelector('[data-validation-counts]');
  const list = card.querySelector('[data-validation-results]');
  if (pill) {
    pill.className = `validation-status-pill ${report.status}`;
    pill.textContent = report.status;
  }
  if (counts) {
    counts.textContent = `${report.failing.length} fail / ${report.warnings.length} warn`;
  }
  if (list) {
    list.replaceChildren(...report.results
      .filter((result) => result.status !== 'pass')
      .slice(0, 8)
      .map(createValidationResultRow));
    if (!list.children.length) {
      const empty = document.createElement('article');
      empty.className = 'validation-result-row pass';
      empty.innerHTML = '<span class="validation-status-pill pass">pass</span><strong>All active checks pass</strong><small>Starter rules and assembly checks are clear.</small>';
      list.append(empty);
    }
  }
}

function createValidationResultRow(result) {
  const row = document.createElement('article');
  row.className = `validation-result-row ${result.status}`;
  row.innerHTML = `
    <span class="validation-status-pill ${result.status}">${result.status}</span>
    <strong>${escapeHtml(result.label)}</strong>
    <span>${escapeHtml(result.message)}</span>
    <small>${escapeHtml(result.measured)} / ${escapeHtml(result.expected)}</small>
  `;
  return row;
}

function validationLabel(parameter) {
  return FRAME_PARAMETER_BY_ID[parameter]?.label ?? parameter;
}

function validationMeasuredLabel(parameter, measured) {
  const definition = FRAME_PARAMETER_BY_ID[parameter];
  if (definition && Number.isFinite(Number(measured))) {
    return formatParameterValue(definition, Number(measured));
  }
  return String(measured ?? 'missing');
}

function formatParameterValue(definition, value) {
  const numeric = Number(value);
  const digits = definition.step < 0.1 ? 2 : definition.step < 1 ? 1 : 0;
  const formatted = Number.isFinite(numeric) ? numeric.toFixed(digits) : String(value ?? '');
  return `${formatted}${definition.unit ? ` ${definition.unit === 'curve' ? 'curve' : definition.unit}` : ''}`;
}

function formatTolerance(definition) {
  return `${definition.tolerance.toFixed(2)} ${definition.unit === 'curve' ? 'curve' : definition.unit}`;
}

function clampToRange(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function roundTo(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function applyAppearance() {
  const material = activeMaterial();
  const tint = activeLens();
  dom.materialReadout.textContent = material.label;
  dom.lensReadout.textContent = tint.label;
  frame3dViewer?.applyAppearance?.({
    frameColor: material.color,
    metalness: material.metalness,
    roughness: material.roughness,
    lensColor: tint.color,
    lensOpacity: tint.opacity + (polarized ? 0.08 : 0),
    polarized,
    rxPower: specs.rxPower,
    lensIndex: specs.lensIndex,
    faceWrapDeg: specs.faceWrap,
    pantoscopicTiltDeg: specs.pantoscopicTilt,
  });
}

function selected3DChildPartOverrides() {
  return Object.fromEntries(PART_TYPES
    .map((partType) => [partType, selectedPartByType(partType)])
    .filter(([, part]) => part?.configurator?.canPreviewOnFrame));
}

function selectedPartByType(partType) {
  const partId = selectedPartIdsByType[partType];
  return partsForType(partType).find((part) => part.id === partId) ?? null;
}

function partsForType(partType) {
  return Array.isArray(librariesByType.get(partType)?.parts) ? librariesByType.get(partType).parts : [];
}

function defaultPartIdForType(partType, parts) {
  const defaultName = DEFAULT_CHILD_PART_NAME_BY_MODEL[project.modelId]?.[partType];
  if (!defaultName) return parts[0]?.id ?? null;
  return parts.find((part) => part.name === defaultName || part.name.startsWith(defaultName))?.id
    ?? parts[0]?.id
    ?? null;
}

function activeMaterial() {
  return MATERIAL_PRESETS.find((preset) => preset.id === activeMaterialId) ?? MATERIAL_PRESETS[0];
}

function activeLens() {
  return LENS_TINTS.find((tint) => tint.id === activeLensId) ?? LENS_TINTS[0];
}

function partCardDetail(part) {
  const fit = part.configurator?.fit ?? {};
  if (part.type === 'nose_bridge') return fit.bridgeDetailWidthMm == null ? part.sourceGroup : `${fit.bridgeDetailWidthMm} mm - ${part.sourceGroup}`;
  if (part.type === 'temple') return fit.templeLengthMm == null ? part.sourceGroup : `${fit.templeLengthMm} mm - ${part.sourceGroup}`;
  if (part.type === 'temple_tip') return fit.tipLengthMm == null ? part.sourceGroup : `${fit.tipLengthMm} mm / ${fit.tipAngleDeg ?? 'n/a'} deg`;
  return part.readiness === 'manual_only' ? 'Manual seed' : part.sourceGroup;
}

function updatePartStatus() {
  const selectedCount = Object.values(selectedPartIdsByType).filter(Boolean).length;
  dom.partStatus.textContent = `${selectedCount} selected`;
}

function updateSummary() {
  const selected = ['nose_bridge', 'temple', 'temple_tip']
    .map((partType) => selectedPartByType(partType)?.name)
    .filter(Boolean);
  dom.summary.textContent = selected.join(' / ') || 'Select parts and finish';
  updatePartStatus();
}

function configuratorSavePayload() {
  return {
    modelId: project.modelId,
    savedAs: nextConfiguratorSaveName(),
    selectedPartIdsByType: { ...selectedPartIdsByType },
    materialId: activeMaterialId,
    lensId: activeLensId,
    polarized,
    specs: { ...specs },
    frameParameters: { ...frameParameters },
    materialAnswers: { ...materialAnswers },
    updatedAt: new Date().toISOString(),
  };
}

async function saveConfiguratorBuild() {
  if (!project?.configuratorSaveUrl) {
    return;
  }
  dom.saveButton.disabled = true;
  setSaveStatus('Saving');
  try {
    const saved = await postJson(project.configuratorSaveUrl, configuratorSavePayload());
    if (!saved.savedAs) {
      throw new Error('Configurator save did not return a saved name');
    }
    window.history.replaceState(null, '', `/configurator?model=${encodeURIComponent(saved.savedAs)}`);
    await loadProject(saved.savedAs);
    setSaveStatus(`Saved as ${saved.savedAs}`);
    setState('Saved');
  } catch {
    setSaveStatus('Save failed');
    setState('Save failed');
  } finally {
    dom.saveButton.disabled = false;
  }
}

function setSaveStatus(message) {
  if (dom.saveStatus) {
    dom.saveStatus.textContent = message;
  }
}

function markConfiguratorDirty() {
  if (project) {
    setSaveStatus(`Unsaved changes - save as ${nextConfiguratorSaveName()}`);
  }
}

function nextConfiguratorSaveName() {
  if (!project) {
    return 'Model-01';
  }
  return project.nextConfiguratorSaveName ?? `${project.modelId}-01`;
}

function updateSpecReadout() {
  const size = `${formatCompact(frameParameters.lensWidth_mm)}-${formatCompact(frameParameters.bridgeWidth_mm)}-${formatCompact(frameParameters.templeLength_mm)}`;
  dom.specReadout.textContent = `${size} / ${formatSpecValue(specs.rxPower, 'D')} / index ${Number(specs.lensIndex).toFixed(2)}`;
}

function formatCompact(value) {
  return Number.isInteger(Number(value)) ? String(Number(value)) : Number(value).toFixed(1);
}

async function run3DRenderBuild(label, renderBuild) {
  const buildId = activeBuildId + 1;
  activeBuildId = buildId;
  setProgress(18, 'Building 3D');
  await nextAnimationFrame();
  if (buildId !== activeBuildId) return;
  renderBuild();
  setProgress(78, `Rendering ${label}`);
  await delay(180);
  if (buildId !== activeBuildId) return;
  setProgress(100, `Rendered ${label}`);
  await delay(260);
  if (buildId === activeBuildId) hideProgress();
}

function setProgress(percent, label) {
  const bounded = Math.max(0, Math.min(100, Math.round(percent)));
  dom.progress.hidden = false;
  dom.progressLabel.textContent = label;
  dom.progressPercent.textContent = `${bounded}%`;
  dom.progressFill.style.width = `${bounded}%`;
}

function hideProgress() {
  dom.progress.hidden = true;
  dom.progressPercent.textContent = '0%';
  dom.progressFill.style.width = '0%';
}

function setState(value) {
  dom.state.textContent = value;
}

function formatSpecValue(value, unit) {
  const digits = Number.isInteger(value) ? 0 : 2;
  return `${Number(value).toFixed(digits)}${unit ? ` ${unit}` : ''}`;
}

function partInitials(part) {
  return part.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

function generatedPartPreviewSvg(partType, part) {
  const color = {
    nose_bridge: '#6b59b5',
    temple: '#b57924',
    temple_tip: '#915f1a',
    nosearm: '#8e7f6b',
    nose_pad: '#7db7b3',
  }[partType] ?? '#0f8f84';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="96" viewBox="0 0 180 96"><rect width="180" height="96" rx="10" fill="#f7f9f8"/><path d="M28 58 C58 24 118 24 152 58" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/><text x="90" y="82" text-anchor="middle" fill="#222826" font-family="Arial" font-size="12" font-weight="700">${escapeSvg(partInitials(part))}</text></svg>`;
}

function svgDataUrl(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function stringEntries(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(Object.entries(value).filter((entry) => (
    typeof entry[0] === 'string' && typeof entry[1] === 'string'
  )));
}

function numericEntries(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(Object.entries(value).filter((entry) => (
    typeof entry[0] === 'string' && Number.isFinite(entry[1])
  )));
}

function escapeSvg(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  }[char]));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function nextAnimationFrame() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.json();
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.json();
}
