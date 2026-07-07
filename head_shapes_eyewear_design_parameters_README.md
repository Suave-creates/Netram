# Head shapes → eyewear design parameters

Companion notes for the two CSVs in this folder:

1. **`anthropometric_measurements.csv`** — real, sourced, region- and sex-split
   measured values (PD, nasal width, face width, cephalic index). Every row
   carries a study, year, source URL, and confidence level.
2. **`head_shapes_eyewear_design_parameters.csv`** — the shape → frame-design
   taxonomy (style heuristics + fit engineering), cross-referenced to the
   measurement rows that back it.

The split is deliberate: "what flatters a round face" is a **design heuristic**;
"the mean IPD of South Asian women" is a **measured fact with a citation**.
Those are different kinds of claims and now live in different files.

---

## File 1 — `anthropometric_measurements.csv`

One row per `(measurement, region/population, sex)`. Columns:

| column | meaning |
|--------|---------|
| `measurement_id` | stable key (PD-01, NW-01, FW-01, CI-01 …) |
| `measurement` | interpupillary_distance, nasal_width_alar, bizygomatic_face_width, cephalic_index, nasal_bridge_root_height, face_shape_prevalence |
| `region_population` | e.g. East Asian, South Asian/Indian, West African |
| `sex` | male / female / both |
| `value_mm` | the figure (or `~X` for a value derived from a verified sex offset; or `NO-RELIABLE-DATA`) |
| `sd_mm`, `range_mm`, `sample_size`, `age_range` | study detail where reported |
| `study`, `year`, `source_url` | citation |
| `confidence` | high / medium / none |
| `notes` | caveats, corroboration, derivation method |

### Headline findings (all verified, 3-vote adversarial pass)

- **Pupillary distance (PD/IPD)** — strongest data. Pooled ethnic means from a
  2025 meta-analysis (242 studies, ~125,973 subjects): Caucasian ~62.3,
  East Asian 62.8, South Asian 63.3, Hispanic/Latino 64.0, African American 66.4,
  West African 69.9 mm. Males run **+2.0 to +3.3 mm** over females within each
  group (we applied ~±2.5 mm to derive the per-sex rows, marked with `~`).
  Direct measured anchors: ANSUR (Dodgson 2004, n=3,976) male 64.67 / female 62.31;
  Black South African (Polokwane, n=386) 67.2 mm.
- **Nasal width (low-bridge / Asian-fit basis)** — strong, sex-split. Kenyan-African
  43.2 M / 40.7 F mm vs European ~35 mm; SE Asian (Indonesian) 37.6 M / 35.3 F.
  Farkas (2005, n=1,470) confirms Asian and Black noses are "very/extremely
  significantly wide in both sexes." This is the anthropometric driver of
  low-bridge eyewear.
- **Bizygomatic face width** — partial. Kenyan zy-zy 133.8 M / 130.1 F (high
  confidence); Indian Jaipur 121.6 M / 117.7 F (medium — paywalled extraction).
  NOTE: broad per-continent face-width ranges were **refuted** in verification
  and deliberately excluded.
- **Cephalic index (real head-shape data)** — two solid cohorts at opposite poles:
  Yoruba (Nigeria, n=1,020) dolichocephalic-dominant (68.33%); North Indian
  Punjabi (n=500) brachycephalic (CI 80.5 M / 84.3 F). This is the **only**
  real head-shape distribution data — it is a head breadth/length ratio, NOT the
  consumer face-shape categories.

### Two honest data gaps (marked `NO-RELIABLE-DATA`, not invented)

- **`nasal_bridge_root_height` (BH-01)** — no citable cross-regional bridge-**height**
  table in mm exists in the verified sources. The *direction* is established
  (Asian/African bridges sit lower and less projected) and nasal *width* is well
  documented, but a clean height-in-mm dataset was not found. Left explicitly blank
  rather than guessed.
- **`face_shape_prevalence` (FS-01)** — there is **no real prevalence data** for the
  oval/round/square/heart/oblong/diamond/triangle taxonomy. It is a styling
  construct, not an anthropometric distribution. Use the cephalic-index rows for
  real head-shape proportions instead.

### Excluded (refuted in verification — do not reintroduce)

- Broad face-width ranges (African 139–149 / European 131–143 / Asian 143–150 mm) — 0-3.
- African male IPD ~66.1 mm + Zimbabwe 60.7/59.5 figures — 0-3.
- "Orbital region has greatest cross-ethnic variation" claim — 1-2.

---

## File 2 — `head_shapes_eyewear_design_parameters.csv`

13 rows, tagged by `shape_system` (7 face_shape + 3 skull_morphology + 3 nose_bridge).
No more `TODO-research` flags, and the fake per-shape `typical_pd_mm` /
`typical_face_width_mm` columns are **removed** — PD and face width are properties of
a *population*, not of "a round face," so they belong in File 1.

Key columns now:
- Identity + anatomy: `shape_name`, `description`, `key_proportion_rule`,
  `cephalic_index_range`.
- Frame design: `recommended_frame_shapes`, `bridge_design`, `nose_pad_type`,
  `temple_length_guidance`, `lens_height_guidance`, `pantoscopic_tilt_deg`, `wrap_angle_deg`.
  Numeric millimetre guidance is replaced with relative direction
  (Standard / Longer / Shorter / Deeper) since absolute values depend on the wearer's
  measured PD/face width from File 1, not on the shape category.
- Logic: `goal`, `avoid`, `rationale`.
- `parameter_type` — `design_heuristic` (face shapes: aesthetic, no measured backing
  claimed) vs `fit_engineering` (skull/nose: backed by real measurements).
- `cross_reference` — links skull/nose rows to the `measurement_id`s in File 1 that
  support them.

---

## Sources (all peer-reviewed / primary unless noted)

- IPD meta-analysis 2025 (242 studies, ~125,973 subjects) — PMC12805943 / Dovepress OPTH
- Dodgson 2004, "Variation and extrema of human IPD" (ANSUR) — neildodgson.com
- Mhaleni et al. 2021, Black South African IPD — African Vision & Eye Health
- Virdi, Wertheim & Naini 2019, Kenyan craniofacial — PMC6384287
- JESTEC 2016, Indonesian glasses-frame anthropometry — academia.edu/106435167
- Farkas et al. 2005, international facial morphology (n=1,470) — J Craniofac Surg 16:615-646
- Oladipo et al. 2014, Yoruba cephalic index (n=1,020) — Hindawi J Anthropology
- Seema & Verma 2016, North Indian Punjabi cephalic index — Int J Morphol 34(2)
- Comparative Craniofacial Anthropometry 2025 (Jaipur, n=200) — journals.lww.com (medium-confidence)

### Pediatric / child age-band sources (round 3, 2026-06-19; folded into `anthropometric_measurements_round2.csv` R2-KID-* rows + `frame_size_grid.csv` child buckets)

- **Saini et al. 2022**, age/sex pediatric IPD percentiles, NW India/PGIMER Chandigarh (n=3,622, 1 mo–14 yr) — Indian J Med Res, PMC9707680. **Best India child anchor**; IPD is canthal-derived (Feingold–Bossert), caps at 14 yr.
- **MacLachlan & Howland 2002**, continuous sex-specific IPD-by-age model 1 mo–19 yr (n=1,311 / 4,294 visits) — Ophthalmic Physiol Opt 22(3):175-182, PMID 12090630. **Only verified source spanning the full 3–17 band**, but US/Western — Asian children run wider, adapt upward.
- **Etezad-Razavi & Jalalifar 2008**, Iranian (West/Central Asian) age-band near-IPD, 3 mo–20 yr (n=419) — J Ophthalmic Vis Res 3(1):16-22, PMC3589221. True PD-meter.
- **Fu & Luximon 2019**, Hong Kong Chinese child head breadth ages 5–12 (n=102) — Industrial Eng & Mgmt Systems 18(4):619-629. Only age-stratified **Asian head-breadth** data; very small per-band n (down to 4); age trend not significant.
- **Grabcika et al. 2024**, Latvian child bizygomatic face width ages 1–15 (n=375) — Children 11(9):1141, PMC11429820. European; closest available age-stratified **face-width** source (no Asian equivalent found).
- **Wu et al. 2000** (Taiwan, n=4,446, <5 yr) — directional only: Asian children have wider ICD/OCD/IPD than Caucasian; supports adapting Western data upward. No usable 3–17 bands.
- **Majumder et al. 2024** Indian growth reference + NFHS-3/4/5 + CNNS — Indian Pediatrics 61:425-434. **NULL finding**: India's national child surveys capture only stature/weight/BMI/MUAC — zero craniofacial dimensions.

### Confirmed child-data gaps (flagged `NO-RELIABLE-DATA`, not invented)

- **Pediatric nasal/bridge width (3–17, any Asian/Indian or general pop.)** — none found (R2-KID-GAP-01).
- **Pediatric ear position / front-to-bend (temple-arm length driver)** — none found (R2-KID-GAP-02).
- **India teen (13–17) IPD percentiles** — Saini caps at 14 yr; only the Western MacLachlan model reaches 17.
- **Any Indian/Asian child face-width or full-range head-breadth percentiles** — only European (face) and HK 5–12 (head breadth) proxies exist.

## Methodological notes

- All ethnicity values are group **means with SDs**, not discrete traits — there is
  large within-group overlap and continuous variation.
- `~` values were derived from a pooled ethnic mean plus the verified ±2.5 mm sex
  offset; direct measured values (no `~`) are preferred where present.
- Several regional studies are young-adult/student convenience samples — `sample_size`
  and `age_range` are recorded per row so you can weight them.
- Anthropometry is slow-moving, so the 2004–2025 source spread is acceptable.
