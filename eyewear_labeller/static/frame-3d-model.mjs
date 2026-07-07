export const VC_S19000_DIMENSIONS = {
  modelId: 'VC S19000',
  units: 'mm',
  lensWidth: 60,
  lensHeight: 53,
  bridgeWidth: 14,
  nominalBridgeWidth: 14,
  frontWidth: 144,
  topViewDepth: 150,
  topTempleRearSpan: 103,
  templeLength: 150,
  templeTipLength: 75,
  templeMetalLength: 75,
  rimTubeRadius: 1.1,
  frontDepth: 4.2,
  noseBridgeSource: 'VC S5158',
  noseBridgeDetailWidth: 15.27,
  noseBridgeProfileDepth: 2.0,
  browbarLength: 66.9,
  browbarHeight: 1.0,
  templeSource: 'T4',
  endPieceSource: 'T4',
  templeTipSource: 'TT1',
  templeTipVisibleLength: 75,
  templeTipSleeveOverlap: 0,
  templeTipSleeveHeight: 1.5,
  templeTipEndHeight: 10.1,
  templeTipAngledLength: 40,
  templeBendRadius: 30,
  templeTipAngleDeg: 35,
  sourceCues: [
    'DWG/PDF text: 60□14 150',
    'Front: 144±1 width, 60±0.2 A width, 53±0.2 B height, 14.0 DBL',
    'Front rims: VC S19000 CAD LWPOLYLINE entities 13010 and 13013, sampled with bulge arcs',
    'Eye rim: R2-Flat, 1.1 X 2.5 section cue',
    'Nose bridge: VC S5158 / MF-109535 front-detail cue, 15.27 mm child-part width',
    'Temples: T4 temple/end-piece, TT1-75 curved bend tip only, 150±2 temple length, 75 mm visible sleeve, R30/35° tip cue; straight dashed tip construction is excluded',
  ],
};

export const VC_S19003_DIMENSIONS = {
  modelId: 'VC S19003',
  units: 'mm',
  lensWidth: 58,
  lensHeight: 42.4,
  bridgeWidth: 15.6,
  nominalBridgeWidth: 16,
  frontWidth: 140,
  topViewDepth: 153,
  topTempleRearSpan: 99,
  templeLength: 145,
  templeTipLength: 70,
  templeMetalLength: 75,
  rimTubeRadius: 1.05,
  frontDepth: 3.4,
  noseBridgeSource: 'VC S13110',
  noseBridgeDetailWidth: 17.94,
  noseBridgeProfileDepth: 2.13,
  browbarLength: 84.1,
  browbarHeight: 1.2,
  templeSource: 'T5-VC E14506',
  endPieceSource: 'T5-VC E14506',
  templeTipSource: 'TT3',
  templeBendRadius: 30,
  templeTipAngleDeg: 42,
  sourceCues: [
    'DWG/PDF text: 58□16 145',
    'Front: 140±1 width, 58±0.2 A width, 42.4±0.2 B height, 15.6 DBL',
    'Front rims: CAD LWPOLYLINE entities 13444 and 13439, sampled with bulge arcs',
    'Browbar/top bar: CAD entity 13437, 84.1 mm by 1.2 mm front-view cue',
    'Nose bridge: VC S13110 front/detail cues, 17.94 mm width and 2.13 mm profile depth',
    'Top/side temples: top-view 140 to 99 mm convergence, 153 mm depth cue, 145±2 temple length, 70 mm TT3 tip, R30 bend',
  ],
};

export const VC_S19001_DIMENSIONS = {
  ...VC_S19000_DIMENSIONS,
  modelId: 'VC S19001',
  lensHeight: 52,
  frontWidth: 141,
  topViewDepth: 166,
  topTempleRearSpan: 105,
  templeSource: 'T1',
  endPieceSource: 'T1',
  templeTipSource: 'TT4',
  templeTipVisibleLength: 75,
  templeTipSleeveOverlap: 0,
  templeTipSleeveHeight: 2.9,
  templeTipEndHeight: 10.1,
  templeTipAngledLength: 40,
  templeTipAngleDeg: 35,
  rimTubeRadius: 1.2,
  sourceCues: [
    'DWG/PDF text: 60□14 150',
    'Front: 141±1 width, 60±0.2 A width, 52±0.2 B height, 13.8/14 DBL cue',
    'Eye rim: R3 pattern, 1.2 X 2.5 section cue',
    'Nose bridge: VC S5158 / MF-109535 table cue',
    'Temples/end-piece: T1, TT4 75mm curved bend tip only, R30/35° side-view cue; straight dashed tip construction is excluded',
  ],
};

export const VC_S19002_DIMENSIONS = {
  ...VC_S19003_DIMENSIONS,
  modelId: 'VC S19002',
  lensWidth: 59,
  lensHeight: 46.8,
  bridgeWidth: 11,
  nominalBridgeWidth: 11,
  frontWidth: 139,
  topViewDepth: 166,
  topTempleRearSpan: 105,
  templeLength: 145,
  templeTipLength: 75,
  templeMetalLength: 70,
  templeTipStartLength: 70,
  templeSource: 'T2',
  endPieceSource: 'T2',
  templeTipSource: 'TT1',
  templeTipVisibleLength: 75,
  templeTipSleeveOverlap: 0,
  templeTipSleeveHeight: 1.5,
  templeTipEndHeight: 10.4,
  templeTipAngledLength: 40,
  templeTipAngleDeg: 35,
  rimTubeRadius: 1.2,
  browbarLength: 0,
  browbarHeight: 0,
  hasBrowbar: false,
  hasWireCore: true,
  wireCoreRadius: 0.42,
  wireCoreY: -3.8,
  sourceCues: [
    'DWG/PDF text: 59□11 145',
    'Front: 139±1 width, 59.2±0.2 A width, 46.8±0.2 B-height cue, 12.0±0.5 / 11 DBL cue',
    'Eye rim: R3 pattern, 1.2 X 2.5 section cue',
    'Nose bridge: VC S13110/New table cue from corrected labels',
    'Temples/end-piece: T2, TT1 75mm curved bend tip only, R30/35° side-view cue; straight dashed tip construction is excluded',
  ],
};

export const VC_S19004_DIMENSIONS = {
  ...VC_S19003_DIMENSIONS,
  modelId: 'VC S19004',
  lensWidth: 57,
  lensHeight: 48.7,
  bridgeWidth: 16,
  nominalBridgeWidth: 16,
  frontWidth: 141.6,
  topViewDepth: 167,
  topTempleRearSpan: 105,
  templeLength: 145,
  templeTipLength: 75,
  templeMetalLength: 70,
  templeTipStartLength: 65.5,
  templeSource: 'T2',
  endPieceSource: 'T2',
  templeTipSource: 'TT1',
  templeTipVisibleLength: 79.5,
  templeTipSleeveOverlap: 4.5,
  templeTipSleeveHeight: 1.5,
  templeTipEndHeight: 10.4,
  templeTipAngledLength: 40.3,
  templeTipAngleDeg: 35,
  rimTubeRadius: 1.2,
  browbarLength: 0,
  browbarHeight: 0,
  hasBrowbar: false,
  hasWireCore: true,
  wireCoreRadius: 0.42,
  wireCoreY: -3.8,
  frontBaseCurveMm: 4,
  sourceCues: [
    'DWG/PDF text: 57□16 150',
    'Front: 141.6±1 width, 56.6±0.2 A width, 48.7±0.2 B-height cue, 16 DBL',
    'Top view: Base 4±0.5 front curve positions the browbar forward at the center instead of on a flat chord',
    'Eye rim: R3 pattern, 1.2 X 2.5 section cue; PDF Lens profile drives the 3D rim contour',
    'Nose bridge: VC S13110 table cue',
    'Side temples/end-piece: T2, 145±2 temple length, TT1 75mm curved bend tip only, R30/35° side-view cue; straight dashed tip construction is excluded',
  ],
};

export const VC_S19005_DIMENSIONS = {
  ...VC_S19000_DIMENSIONS,
  modelId: 'VC S19005',
  lensWidth: 59,
  lensHeight: 52.1,
  bridgeWidth: 15,
  nominalBridgeWidth: 15,
  frontWidth: 143,
  topViewDepth: 162,
  topTempleRearSpan: 105,
  templeLength: 150,
  templeTipLength: 75,
  templeSource: 'T4',
  endPieceSource: 'T4',
  templeTipSource: 'TT1',
  templeTipAngleDeg: 35,
  sourceCues: [
    'DWG/PDF text: 59□15 150',
    'Front: 143±1 width, 59.4±0.2 A width, 52.1±0.2 B height, 15.3/15 DBL cue',
    'Eye rim: R2 flat, 1.1 X 2.5 section cue',
    'Nose bridge: VC S5158 / MF-109535 table cue',
    'Temples/end-piece: VC T4 / T4, TT1 75mm curved bend tip only, R30/35° side-view cue; straight dashed tip construction is excluded',
  ],
};

export const FRAME_3D_DIMENSIONS = {
  [VC_S19000_DIMENSIONS.modelId]: VC_S19000_DIMENSIONS,
  [VC_S19001_DIMENSIONS.modelId]: VC_S19001_DIMENSIONS,
  [VC_S19002_DIMENSIONS.modelId]: VC_S19002_DIMENSIONS,
  [VC_S19003_DIMENSIONS.modelId]: VC_S19003_DIMENSIONS,
  [VC_S19004_DIMENSIONS.modelId]: VC_S19004_DIMENSIONS,
  [VC_S19005_DIMENSIONS.modelId]: VC_S19005_DIMENSIONS,
};

export const SUPPORTED_3D_MODEL_IDS = Object.freeze(Object.keys(FRAME_3D_DIMENSIONS));

const CAD_FRONT_REFERENCE = {
  centerX: 1782.049913704488,
  centerY: 1511.020383836697,
  sourceHeight: 41.286046837216,
};

const CAD_FRONT_REFERENCE_19000 = {
  centerX: 1565.007896197265,
  centerY: 1506.135327868139,
  sourceHeight: 51.337687342666,
};

const CAD_FRONT_REFERENCE_BY_MODEL = {
  'VC S19000': CAD_FRONT_REFERENCE_19000,
  'VC S19001': CAD_FRONT_REFERENCE_19000,
  'VC S19002': CAD_FRONT_REFERENCE,
  'VC S19003': CAD_FRONT_REFERENCE,
  'VC S19004': CAD_FRONT_REFERENCE,
  'VC S19005': CAD_FRONT_REFERENCE_19000,
};

const CAD_FRONT_RIMS = {
  wearerRight: {
    entityId: 2570,
    view: 'front-main',
    sourceBoundsMm: {
      x: 1715.760605146685,
      y: 1490.377360418089,
      width: 58.990970771003,
      height: 41.286046837216,
    },
    vertices: [
      [1715.945, 1523.205],
      [1716.685, 1525.443],
      [1719.207, 1528.675],
      [1722.582, 1530.726],
      [1725.589, 1531.375],
      [1763.577, 1531.663],
      [1768.492, 1530.77],
      [1774.752, 1522.354],
      [1773.502, 1513.897],
      [1766.928, 1497.143],
      [1764.329, 1493.528],
      [1758.462, 1490.377],
      [1724.842, 1491.465],
      [1722.893, 1492.282],
      [1717.586, 1499.363],
      [1715.761, 1513.965],
    ],
    bulges: [
      -0.1303383217869644,
      -0.04209548334354668,
      -0.1398108455066948,
      -0.02784514033553595,
      -0.05966510178568676,
      -0.01837017092996756,
      -0.3735023699971071,
      -0.03561452717190552,
      -0.07193833220461891,
      -0.04819378653521911,
      -0.1550687579297942,
      -0.09704213509838924,
      -0.08724681827139857,
      -0.1844694668562659,
      -0.0665956704444168,
      -0.02007577454501995,
    ],
  },
  wearerLeft: {
    entityId: 2565,
    view: 'front-main',
    sourceBoundsMm: {
      x: 1789.348251491274,
      y: 1490.377360418089,
      width: 58.990970771003,
      height: 41.286046837216,
    },
    vertices: [
      [1848.155, 1523.205],
      [1847.414, 1525.443],
      [1844.892, 1528.675],
      [1841.518, 1530.726],
      [1838.511, 1531.375],
      [1800.523, 1531.663],
      [1795.608, 1530.77],
      [1789.348, 1522.354],
      [1790.597, 1513.897],
      [1797.172, 1497.143],
      [1799.77, 1493.528],
      [1805.638, 1490.377],
      [1839.258, 1491.465],
      [1841.207, 1492.282],
      [1846.514, 1499.363],
      [1848.339, 1513.965],
    ],
    bulges: [
      0.1303383217869644,
      0.04209548334354668,
      0.1398108455066948,
      0.02784514033553595,
      0.05966510178568676,
      0.01837017092996756,
      0.3735023699971071,
      0.03561452717190552,
      0.07193833220461891,
      0.04819378653521911,
      0.1550687579297942,
      0.09704213509838924,
      0.08724681827139857,
      0.1844694668562659,
      0.0665956704444168,
      0.02007577454501995,
    ],
  },
};

const CAD_FRONT_RIMS_19000 = {
  wearerRight: {
    entityId: 13010,
    view: 'front-main',
    sourceBoundsMm: {
      x: 1497.731848606709,
      y: 1480.466484196806,
      width: 60.809758147312,
      height: 51.337687342666,
    },
    vertices: [
      [1512.119425189623, 1529.409431987528],
      [1498.299585383735, 1513.318539383043],
      [1497.731848606709, 1504.355065158767],
      [1500.436924193731, 1493.336067542245],
      [1530.923122520857, 1480.466484196806],
      [1535.284500068272, 1482.592299428739],
      [1557.552217837059, 1510.316992705963],
      [1558.541606754021, 1518.483311919745],
      [1553.088343799835, 1528.089595382808],
      [1544.190813620808, 1531.804171539472],
      [1519.684591631594, 1531.565735620246],
    ],
    bulges: [
      0.26957834707145,
      0.05993354577637,
      0.08716926888821,
      0.39753602869419,
      0.04816546145501,
      0.17360095594049,
      0.09088608516527,
      0.21204964094509,
      0.10463680742552,
      0.09429692373951,
      0.02846534523152,
    ],
  },
  wearerLeft: {
    entityId: 13013,
    view: 'front-main',
    sourceBoundsMm: {
      x: 1571.474185640509,
      y: 1480.466484196806,
      width: 60.809758147312,
      height: 51.337687342666,
    },
    vertices: [
      [1617.896367204907, 1529.409431987528],
      [1631.716207010795, 1513.318539383043],
      [1632.283943787821, 1504.355065158767],
      [1629.578868200799, 1493.336067542245],
      [1599.092669873666, 1480.466484196806],
      [1594.731292326258, 1482.592299428739],
      [1572.463574557471, 1510.316992705963],
      [1571.474185640509, 1518.483311919745],
      [1576.927448594688, 1528.089595382808],
      [1585.824978773722, 1531.804171539472],
      [1610.331200762936, 1531.565735620246],
    ],
    bulges: [
      -0.26957834707145,
      -0.05993354577637,
      -0.08716926888821,
      -0.39753602869419,
      -0.04816546145501,
      -0.17360095594049,
      -0.09088608516527,
      -0.21204964094509,
      -0.10463680742552,
      -0.09429692373951,
      -0.02846534523152,
    ],
  },
};

const PDF_FRONT_RIMS_19004 = {
  wearerRight: {
    type: 'PDF_LENS_CONTOUR',
    view: 'lens-detail',
    sourceDetail: 'VC S19004 PDF Lens profile, traced from the solid 56.6 A / 48.7 B outline, mirrored onto the wearer-right rim, and excluding the dashed ED circle',
    sourceBoundsMm: CAD_FRONT_RIMS.wearerRight.sourceBoundsMm,
    sourceBoundsPx: {
      x: 1430,
      y: 120,
      width: 333,
      height: 287,
    },
    vertices: buildS19004PdfRimContourVertices(-1),
    bulges: [],
  },
  wearerLeft: {
    type: 'PDF_LENS_CONTOUR',
    view: 'lens-detail',
    sourceDetail: 'VC S19004 PDF Lens profile, traced from the solid 56.6 A / 48.7 B outline for the wearer-left rim',
    sourceBoundsMm: CAD_FRONT_RIMS.wearerLeft.sourceBoundsMm,
    sourceBoundsPx: {
      x: 1430,
      y: 120,
      width: 333,
      height: 287,
    },
    vertices: buildS19004PdfRimContourVertices(1),
    bulges: [],
  },
};

const PDF_FRONT_RIMS_19002 = {
  wearerRight: {
    type: 'PDF_LENS_CONTOUR',
    view: 'lens-detail',
    sourceDetail: 'VC S19002 PDF Lens profile, traced from the solid 59.2 A / 46.8 B outline and excluding the dashed ED circle',
    sourceBoundsMm: CAD_FRONT_RIMS.wearerRight.sourceBoundsMm,
    sourceBoundsPx: {
      x: 1460,
      y: 50,
      width: 445,
      height: 425,
    },
    vertices: buildS19002PdfRimContourVertices(-1),
    bulges: [],
  },
  wearerLeft: {
    type: 'PDF_LENS_CONTOUR',
    view: 'lens-detail',
    sourceDetail: 'VC S19002 PDF Lens profile, traced from the solid 59.2 A / 46.8 B outline and mirrored for the wearer-left rim',
    sourceBoundsMm: CAD_FRONT_RIMS.wearerLeft.sourceBoundsMm,
    sourceBoundsPx: {
      x: 1460,
      y: 50,
      width: 445,
      height: 425,
    },
    vertices: buildS19002PdfRimContourVertices(1),
    bulges: [],
  },
};

const CAD_FRONT_RIMS_BY_MODEL = {
  'VC S19000': CAD_FRONT_RIMS_19000,
  'VC S19001': CAD_FRONT_RIMS_19000,
  'VC S19002': PDF_FRONT_RIMS_19002,
  'VC S19003': CAD_FRONT_RIMS,
  'VC S19004': PDF_FRONT_RIMS_19004,
  'VC S19005': CAD_FRONT_RIMS_19000,
};

const CAD_NOSE_BRIDGE = {
  view: 'front-main',
  entityIds: [13419, 13420, 13421, 13422, 13423, 13424, 13427, 13428, 13429, 13430],
  sourceDetail: 'VC S13110',
  sourceWidthMm: 17.94,
  sourceDepthMm: 2.13,
  centerline: [
    [1774.489632175393, 1522.878126483557],
    [1776.298876376224, 1523.760925487174],
    [1777.381963076175, 1524.472201618655],
    [1782.051324269682, 1524.672310713101],
    [1786.720685463188, 1524.472201618655],
    [1787.803772163139, 1523.760925487174],
    [1789.61022379092, 1522.880069858111],
  ],
};

const CAD_NOSE_BRIDGE_19000 = {
  view: 'front-main',
  entityIds: [13005, 13006, 13007, 13008],
  sourceDetail: 'VC S5158',
  sourceWidthMm: 15.27,
  sourceDepthMm: 2.0,
  centerline: [
    [1557.4834925898685, 1517.041571816464],
    [1557.8873777602785, 1519.292082503287],
    [1560.23811096188, 1521.9263072443591],
    [1565.078672290183, 1522.6176214179231],
    [1569.784233618484, 1521.9263072443591],
    [1572.1349668200928, 1519.292082503287],
    [1572.5448896387388, 1517.0103762647905],
  ],
};

const CAD_NOSE_BRIDGE_BY_MODEL = {
  'VC S19000': CAD_NOSE_BRIDGE_19000,
  'VC S19001': CAD_NOSE_BRIDGE_19000,
  'VC S19002': CAD_NOSE_BRIDGE,
  'VC S19003': CAD_NOSE_BRIDGE,
  'VC S19004': CAD_NOSE_BRIDGE,
  'VC S19005': CAD_NOSE_BRIDGE_19000,
};

const CAD_BROWBAR = {
  view: 'front-main',
  entityId: 13437,
  points: [
    [1824.095082879414, 1532.5493710728306],
    [1740.01057397964, 1532.5493710728288],
    [1740.054671294316, 1531.3498211037831],
    [1824.0509855647379, 1531.3498211037831],
  ],
  bulges: [0.00612475236764, 0, -0.00612046775526, 0],
};

const CAD_BROWBAR_19000 = {
  view: 'front-main',
  entityId: 13447,
  points: [
    [1531.5676868047958, 1531.785602324895],
    [1598.4639275476438, 1531.785602324895],
    [1598.4639275476438, 1532.785602324895],
    [1531.5676868047958, 1532.785602324895],
  ],
  bulges: [0, 0, 0, 0],
};

const CAD_BROWBAR_BY_MODEL = {
  'VC S19000': CAD_BROWBAR_19000,
  'VC S19001': CAD_BROWBAR_19000,
  'VC S19003': CAD_BROWBAR,
  'VC S19005': CAD_BROWBAR_19000,
};

const CAD_NOSE_PAD_TOP_VIEW = {
  view: 'top',
  angleDeg: 85,
  bridgeDropMm: 1.8,
  baseOffsetMm: 2.0,
  entityIdsBySide: {
    'wearer-right': [13423, 13424, 13425, 13426, 13429, 13430, 13433, 13434, 13435, 13436],
    'wearer-left': [13412, 13413, 13414, 13415, 13416, 13417, 13418, 13421, 13422, 13446],
  },
};

const CAD_HINGE_RIM_LOCK = {
  'wearer-right': {
    topViewEntityIds: [12626, 12627, 12628, 12629, 12630, 12634, 12635, 12639, 16499, 17132, 17134],
    frontViewEntityIds: [13448, 13449, 13450, 13451, 13452, 13453],
    rimLockEntityIds: [13448, 13449, 13450, 13451, 13452, 13453],
  },
  'wearer-left': {
    topViewEntityIds: [12802, 12803, 12804, 12805, 12806, 12810, 12811, 12815, 17094, 17133, 17134],
    frontViewEntityIds: [13407, 13408, 13409, 13410, 13411, 13431],
    rimLockEntityIds: [13407, 13408, 13409, 13410, 13411, 13431],
  },
};

const CAD_HINGE_RIM_LOCK_19000 = {
  'wearer-right': {
    topViewEntityIds: [13017, 13018, 13019, 13020, 13021, 13022, 13023, 13024, 13025, 13027, 13028, 13029, 13030, 13031],
    frontViewEntityIds: [
      12977, 12978, 12979, 12980, 12981, 12982, 12983, 12984,
      12985, 12986, 12987, 12988, 12989, 12990, 12991, 12992,
      12993, 12994, 12995, 12996, 12997, 12998, 13000,
    ],
    rimLockEntityIds: [
      12977, 12978, 12979, 12980, 12981, 12982, 12983, 12984,
      12985, 12986, 12987, 12988, 12989, 12990, 12991, 12992,
      12993, 12994, 12995, 12996, 12997, 12998, 13000,
    ],
    frontOuterPoint: [1493.012469233312, 1515.89256889454009],
    frontInnerPoint: [1501.66871923331928, 1515.89256889454009],
    frontScrewPoints: [
      [1493.62496923332219, 1514.54256889453973],
      [1493.62496923331491, 1517.24256889454045],
    ],
    frontRibYValues: [
      1514.04256889453973,
      1514.58806366350291,
      1514.98806366350254,
      1515.19707412557727,
      1515.51499821967445,
      1515.71499821967518,
      1516.070139569405,
      1516.27013956940573,
      1516.59707412557691,
      1516.79707412557764,
      1517.19707412557727,
      1517.74256889454045,
    ],
    topScrewPoint: [1496.12977538555424, 1320.85141235016454],
    topFrontY: 1308.21625036045771,
    topRearY: 1397.10713433861565,
    topEndPieceEntityIds: [13017, 13020, 13025, 13028, 13029, 13030, 13031],
  },
  'wearer-left': {
    topViewEntityIds: [12868, 12869, 12870, 12871, 12872, 12873, 12874, 12875, 12876, 12878, 12879, 12880, 12881, 12882, 12883],
    frontViewEntityIds: [
      12950, 12951, 12952, 12953, 12954, 12955, 12956, 12957,
      12958, 12959, 12960, 12961, 12962, 12963, 12964, 12965,
      12966, 12967, 12968, 12969, 12970, 12971, 12973,
    ],
    rimLockEntityIds: [
      12950, 12951, 12952, 12953, 12954, 12955, 12956, 12957,
      12958, 12959, 12960, 12961, 12962, 12963, 12964, 12965,
      12966, 12967, 12968, 12969, 12970, 12971, 12973,
    ],
    frontOuterPoint: [1637.01580717621982, 1515.89256889454009],
    frontInnerPoint: [1628.35955717621982, 1515.89256889454009],
    frontScrewPoints: [
      [1636.40330717621691, 1514.54256889453973],
      [1636.40330717621691, 1517.24256889454045],
    ],
    frontRibYValues: [
      1514.04256889453973,
      1514.58806366350291,
      1514.98806366350254,
      1515.19707412557727,
      1515.51499821967445,
      1515.71499821967518,
      1516.070139569405,
      1516.27013956940573,
      1516.59707412557691,
      1516.79707412557764,
      1517.19707412557727,
      1517.74256889454045,
    ],
    topScrewPoint: [1633.88601700898289, 1320.85141235016454],
    topFrontY: 1308.21625036045771,
    topRearY: 1397.10713433861565,
    topEndPieceEntityIds: [12868, 12871, 12876, 12879, 12880, 12881, 12882, 12883],
  },
};

const CAD_HINGE_RIM_LOCK_BY_MODEL = {
  'VC S19000': CAD_HINGE_RIM_LOCK_19000,
  'VC S19003': CAD_HINGE_RIM_LOCK,
};

const CAD_TOP_TEMPLE_PATHS = {
  'wearer-right': {
    view: 'top',
    entityIds: [12626, 12628, 12630, 12633, 12636, 12640, 12756, 12757, 12760, 12763, 12767, 12770],
    centerX: 1782.049913704488,
    hingeY: 1338.8141014690764,
    rearY: 1471.0473681674166,
    centerline: [
      [1713.617718586951, 1338.8141014690764],
      [1713.617718586951, 1352.4643783130532],
      [1713.617718581021, 1361.7935068819834],
      [1713.5491137378176, 1411.7423384676067],
      [1714.095, 1420.0],
      [1716.7, 1443.3],
      [1723.9, 1458.2],
      [1730.7792079718402, 1471.0473681674166],
    ],
  },
  'wearer-left': {
    view: 'top',
    entityIds: [12806, 12810, 12812, 12813, 12814, 12816, 12817, 12819, 12823, 12839],
    centerX: 1782.049913704488,
    hingeY: 1338.8141014690764,
    rearY: 1471.0473681674166,
    centerline: [
      [1850.482108822025, 1338.8141014690764],
      [1850.482108822025, 1352.4643783130532],
      [1850.4821088279477, 1361.7935068819834],
      [1850.5507136721552, 1411.7423384676067],
      [1850.004827409, 1420.0],
      [1847.4, 1443.3],
      [1840.2, 1458.2],
      [1833.3206194371358, 1471.0473681674166],
    ],
  },
};

const CAD_SIDE_TEMPLE_PROFILES = {
  'wearer-left': {
    view: 'side-left',
    entityIds: [12910, 12912, 13147, 13148, 13202, 13204, 13205, 16283, 16284, 16285],
    bendStartLengthMm: 100,
    baselineY: 1452.2597489077933,
    cadProfile: [
      [1922.3111607197698, 1452.2597489077933],
      [1997.311160719777, 1452.2097489077933],
      [2014.6345179792825, 1450.740121115231],
      [2022.3111607197698, 1450.2597489077933],
      [2034.092239271411, 1443.574242121259],
      [2046.602912513028, 1431.2990678382203],
      [2058.459902805973, 1430.1879303438573],
      [2067.31116071977, 1430.1879303438573],
    ],
  },
  'wearer-right': {
    view: 'side-right',
    entityIds: [12985, 12987, 13064, 13075, 13084, 13263, 13264, 13316, 13318, 13319],
    bendStartLengthMm: 100,
    baselineY: 1402.9115751536583,
    cadProfile: [
      [2049.9483654988126, 1402.9115751536583],
      [1974.944455370407, 1402.8615751536582],
      [1957.6210981108943, 1401.363738150717],
      [1949.9483654988126, 1400.9115751536583],
      [1938.163376818773, 1394.197859156745],
      [1925.652703577156, 1381.9226848737044],
      [1913.7957132842112, 1380.8115473793432],
      [1904.9483654988126, 1380.8115473793432],
    ],
  },
};

const CAD_SIDE_OUTLINE_REFERENCE = {
  startX: 1922.3111607197698,
  baselineY: 1452.2597489077933,
};

const CAD_SIDE_TEMPLE_OUTLINES = [
  {
    id: 'temple-side-strip',
    component: 'temple',
    entityIdsBySide: {
      'wearer-left': [12910, 12912],
      'wearer-right': [12985, 12987],
    },
    source: {
      heightMm: 3.3,
      surfaceHalfThicknessMm: 0.45,
      note: 'Side-view 3.3 mm temple strip, from the two parallel CAD temple edges.',
    },
    cadPoints: [
      [1922.3111607197698, 1453.909748907793],
      [1997.311160719777, 1452.9458357884205],
      [1997.311160719777, 1451.5344064420415],
      [1922.3111607197698, 1450.6097489077938],
    ],
  },
  {
    id: 'tt3-r30-bent-ear-tip',
    component: 'temple_tip',
    entityIdsBySide: {
      'wearer-left': [13147, 13202, 13203, 13204, 13205],
      'wearer-right': [13263, 13316, 13317, 13318, 13319],
    },
    ignoredConstructionEntityIdsBySide: {
      'wearer-left': [13093],
      'wearer-right': [13209],
    },
    source: {
      bendRadiusMm: 30,
      tipAngleDeg: 42,
      angledTipLengthMm: 40,
      sleeveOverlapMm: 4,
      surfaceHalfThicknessMm: 0.65,
      note: 'Visible TT3 ear-tip sleeve: connector sits over the temple end, then follows the side-view R30 bend and 42 degree cue.',
    },
    cadPoints: [
      [1997.311160719777, 1453.242],
      [1997.579, 1453.54],
      [2001.3111607197698, 1453.740121115231],
      [2013.7465545250652, 1453.740121115231],
      [2035.2720078109905, 1447.0966227781437],
      [2055.243, 1434.741],
      [2057.925, 1433.105],
      [2058.744, 1432.432],
      [2059.218, 1431.784],
      [2059.086, 1430.747],
      [2058.459902805973, 1430.1879303438573],
      [2054.0229444854176, 1428.5077102105033],
      [2046.602912513028, 1431.2990678382203],
      [2034.092239271411, 1443.574242121259],
      [2014.6345179792825, 1450.740121115231],
      [2001.3111607197698, 1450.740121115231],
      [1997.579, 1450.94],
      [1997.311160719777, 1451.238],
    ],
  },
];

export function buildFrameModel(modelOrDimensions = VC_S19003_DIMENSIONS, options = {}) {
  const dimensions = resolveFrameDimensions(modelOrDimensions, options);
  const frontRims = CAD_FRONT_RIMS_BY_MODEL[dimensions.modelId] ?? CAD_FRONT_RIMS;
  const rimCenterOffset = (dimensions.lensWidth + dimensions.bridgeWidth) / 2;
  const halfFrontWidth = dimensions.frontWidth / 2;

  const rightRim = buildCadRim({
    id: 'wearer-right-rim',
    side: 'wearer-right',
    center: { x: -rimCenterOffset, y: 0, z: 0 },
    cad: frontRims.wearerRight,
    dimensions,
  });
  const leftRim = buildCadRim({
    id: 'wearer-left-rim',
    side: 'wearer-left',
    center: { x: rimCenterOffset, y: 0, z: 0 },
    cad: frontRims.wearerLeft,
    dimensions,
  });

  return {
    modelId: dimensions.modelId,
    units: dimensions.units,
    dimensions,
    sourceCues: dimensions.sourceCues,
    components: [
      rightRim,
      leftRim,
      buildCadNoseBridge(dimensions),
      ...buildOptionalFrontBars(dimensions),
      buildNosePad('wearer-right', -1, rightRim, dimensions),
      buildNosePad('wearer-left', 1, leftRim, dimensions),
      ...buildSideAssembly('wearer-right', -1, halfFrontWidth, dimensions),
      ...buildSideAssembly('wearer-left', 1, halfFrontWidth, dimensions),
    ],
  };
}

export function buildConfiguredFrameModel(modelOrDimensions, overrides = {}, labelMemory = null, dimensionOverrides = {}) {
  return buildFrameModel(frameDimensionsWithChildParts(modelOrDimensions, overrides, labelMemory, dimensionOverrides));
}

export function frameDimensionsWithChildParts(modelOrDimensions, overrides = {}, labelMemory = null, dimensionOverrides = {}) {
  const base = resolveFrameDimensions(modelOrDimensions, { labelMemory });
  const dimensions = {
    ...base,
    sourceCues: [...(base.sourceCues ?? [])],
    configuredParts: {
      ...(base.configuredParts ?? {}),
    },
  };

  const bridge = overrides?.nose_bridge;
  if (bridge) {
    const fit = bridge.configurator?.fit ?? {};
    dimensions.noseBridgeSource = bridge.name;
    dimensions.noseBridgeDetailWidth = numericFitValue(fit, ['bridgeDetailWidthMm'], base.noseBridgeDetailWidth);
    dimensions.noseBridgeProfileDepth = numericFitValue(fit, ['profileDepthMm'], base.noseBridgeProfileDepth);
    dimensions.noseBridgeCenterline2dMm = centerlineFitValue(fit);
    dimensions.configuredParts.nose_bridge = configuredPartRecord(bridge, fit);
    dimensions.sourceCues.push(`Configured nose bridge: ${bridge.name}`);
  }

  const temple = overrides?.temple;
  if (temple) {
    const fit = temple.configurator?.fit ?? {};
    const templeLength = numericFitValue(fit, ['templeLengthMm', 'lengthMm'], null);
    const preserveFrameTempleLength = isFrameSourceTemplePart(base, temple.name);
    dimensions.templeSource = temple.name;
    dimensions.endPieceSource = temple.name;
    if (templeLength !== null && !preserveFrameTempleLength) {
      dimensions.templeLength = templeLength;
    }
    dimensions.templeFrontHeight = numericFitValue(fit, ['frontHeightMm'], null);
    dimensions.templeMidHeight = numericFitValue(fit, ['midHeightMm'], null);
    dimensions.templeRearHeight = numericFitValue(fit, ['rearHeightMm'], null);
    dimensions.configuredParts.temple = configuredPartRecord(temple, fit);
    dimensions.sourceCues.push(`Configured temple: ${temple.name}`);
    if (templeLength !== null && preserveFrameTempleLength && Math.abs(templeLength - dimensions.templeLength) > 0.001) {
      dimensions.sourceCues.push(`Frame PDF temple length retained over ${temple.name} child-part length cue`);
    }
  }

  const templeTip = overrides?.temple_tip;
  if (templeTip) {
    const fit = templeTip.configurator?.fit ?? {};
    const preserveFrameTipCues = isFrameSourceTempleTipPart(base, templeTip.name);
    dimensions.templeTipSource = templeTip.name;
    dimensions.templeTipLength = numericFitValue(fit, ['tipLengthMm', 'lengthMm'], dimensions.templeTipLength);
    dimensions.templeTipVisibleLength = numericFitValue(
      fit,
      ['visibleLengthMm', 'visibleTipLengthMm'],
      preserveFrameTipCues ? dimensions.templeTipVisibleLength ?? null : null,
    );
    dimensions.templeTipSleeveOverlap = numericFitValue(
      fit,
      ['sleeveOverlapMm', 'overlapMm'],
      preserveFrameTipCues ? dimensions.templeTipSleeveOverlap ?? null : null,
    );
    dimensions.templeTipSleeveHeight = numericFitValue(
      fit,
      ['sleeveHeightMm'],
      preserveFrameTipCues ? dimensions.templeTipSleeveHeight ?? null : null,
    );
    dimensions.templeTipEndHeight = numericFitValue(
      fit,
      ['endHeightMm'],
      preserveFrameTipCues ? dimensions.templeTipEndHeight ?? null : null,
    );
    dimensions.templeTipAngledLength = numericFitValue(
      fit,
      ['angledTipLengthMm', 'angledLengthMm'],
      preserveFrameTipCues ? dimensions.templeTipAngledLength ?? null : null,
    );
    dimensions.templeBendRadius = numericFitValue(fit, ['bendRadiusMm', 'radiusMm'], dimensions.templeBendRadius);
    dimensions.templeTipAngleDeg = numericFitValue(fit, ['tipAngleDeg', 'angleDeg'], dimensions.templeTipAngleDeg);
    dimensions.configuredParts.temple_tip = configuredPartRecord(templeTip, fit);
    dimensions.sourceCues.push(`Configured acetate tip: ${templeTip.name}`);
  }

  const nosePad = overrides?.nose_pad;
  if (nosePad) {
    const fit = nosePad.configurator?.fit ?? {};
    dimensions.nosePadSource = nosePad.name;
    dimensions.nosePadColor = colorFitValue(fit, ['colorHex'], '#b7d8d6');
    dimensions.nosePadOpacity = numericFitValue(fit, ['opacity'], 0.58);
    dimensions.nosePadLogo = stringFitValue(fit, ['logo'], nosePad.attributes?.logo ?? null);
    dimensions.configuredParts.nose_pad = configuredPartRecord(nosePad, fit);
    dimensions.sourceCues.push(`Configured nose pad: ${nosePad.name}`);
  }

  const noseArm = overrides?.nosearm;
  if (noseArm) {
    const fit = noseArm.configurator?.fit ?? {};
    dimensions.noseArmSource = noseArm.name;
    dimensions.noseArmLengthClass = stringFitValue(fit, ['lengthClass'], noseArm.attributes?.lengthClass ?? null);
    dimensions.noseArmReach = numericFitValue(fit, ['armReachMm', 'reachMm'], null);
    dimensions.noseArmDrop = numericFitValue(fit, ['armDropMm', 'dropMm'], null);
    dimensions.noseArmTubeRadius = numericFitValue(fit, ['tubeRadiusMm'], null);
    dimensions.configuredParts.nosearm = configuredPartRecord(noseArm, fit);
    dimensions.sourceCues.push(`Configured nosearm: ${noseArm.name}`);
  }

  const templeFit = temple?.configurator?.fit ?? {};
  const explicitMetalLength = numericFitValue(templeFit, ['templeMetalLengthMm', 'metalLengthMm'], null);
  applyFrameDimensionOverrides(dimensions, dimensionOverrides);
  if (temple || templeTip || hasAnyDimensionOverride(dimensionOverrides, ['templeLength', 'templeLength_mm'])) {
    reconcileTempleLengths(dimensions, explicitMetalLength);
  }

  return dimensions;
}

function hasAnyDimensionOverride(overrides = {}, keys = []) {
  return keys.some((key) => overrides?.[key] !== undefined && overrides?.[key] !== null && overrides?.[key] !== '');
}

function applyFrameDimensionOverrides(dimensions, overrides = {}) {
  const numeric = (keys) => numericFitValue(overrides, keys, null);
  const sourceLensWidth = dimensions.lensWidth;
  const sourceBridgeWidth = dimensions.bridgeWidth;
  const sourceFrontWidth = dimensions.frontWidth;
  const sourceNoseBridgeDetailWidth = dimensions.noseBridgeDetailWidth;
  const lensWidth = numeric(['lensWidth', 'lensWidth_mm']);
  const lensHeight = numeric(['lensHeight', 'lensHeight_mm']);
  const bridgeWidth = numeric(['bridgeWidth', 'bridgeWidth_mm', 'dbl', 'dbl_mm']);
  const frontWidth = numeric(['frontWidth', 'frontFrameWidth', 'frontFrameWidth_mm']);
  const templeLength = numeric(['templeLength', 'templeLength_mm']);
  const rimThickness = numeric(['rimThickness', 'rimThickness_mm']);
  const templeThickness = numeric(['templeThickness', 'templeThickness_mm']);
  const nosePadSpacing = numeric(['nosePadSpacing', 'nosePadSpacing_mm']);
  const baseCurve = numeric(['baseCurve']);
  const templeAngle = numeric(['templeAngle', 'templeAngle_deg']);
  const hingePlacement = numeric(['hingePlacement', 'hingePlacement_mm']);
  const templeHeightPosition = numeric(['templeHeightPosition', 'templeHeightPosition_mm']);
  const templeCurveBendPoint = numeric(['templeCurveBendPoint', 'templeCurveBendPoint_mm']);
  const templeCurveDrop = numeric(['templeCurveDrop', 'templeCurveDrop_mm']);
  const hingePosition = numeric(['hingePosition', 'hingePosition_mm']);
  const tipDropAngle = numeric(['tipDropAngle', 'tipDropAngle_deg']);
  const splayAngle = numeric(['splayAngle', 'splayAngle_deg']);
  const lensGrooveDepth = numeric(['lensGrooveDepth', 'lensGrooveDepth_mm']);
  const lensGrooveWidth = numeric(['lensGrooveWidth', 'lensGrooveWidth_mm']);
  const frameWeight = numeric(['weight', 'weight_g', 'frameWeight', 'frameWeight_g']);

  if (lensWidth !== null) dimensions.lensWidth = lensWidth;
  if (lensHeight !== null) dimensions.lensHeight = lensHeight;
  if (bridgeWidth !== null) {
    const sourceBridgeOverlap = sourceNoseBridgeDetailWidth - sourceBridgeWidth;
    dimensions.bridgeWidth = bridgeWidth;
    dimensions.nominalBridgeWidth = bridgeWidth;
    dimensions.dbl = bridgeWidth;
    dimensions.noseBridgeDetailWidth = bridgeWidth + sourceBridgeOverlap;
  }
  if (frontWidth !== null) {
    dimensions.frontWidth = frontWidth;
  } else if (lensWidth !== null || bridgeWidth !== null) {
    const sourceEndPieceAllowance = sourceFrontWidth - ((sourceLensWidth * 2) + sourceBridgeWidth);
    dimensions.frontWidth = (dimensions.lensWidth * 2) + dimensions.bridgeWidth + sourceEndPieceAllowance;
  }
  if (templeLength !== null) dimensions.templeLength = templeLength;
  if (rimThickness !== null) {
    dimensions.rimThickness = rimThickness;
    dimensions.rimTubeRadius = rimThickness / 2;
  }
  if (templeThickness !== null) {
    dimensions.templeThickness = templeThickness;
    dimensions.templeTubeRadius = templeThickness / 2;
  }
  if (nosePadSpacing !== null) dimensions.nosePadSpacing = nosePadSpacing;
  if (baseCurve !== null) dimensions.lensBaseCurve = baseCurve;
  if (templeAngle !== null) dimensions.templeAngleDeg = templeAngle;
  if (hingePlacement !== null) dimensions.hingePlacement = hingePlacement;
  if (templeHeightPosition !== null) dimensions.templeHeightPosition = templeHeightPosition;
  if (templeCurveBendPoint !== null) dimensions.templeCurveBendPoint = templeCurveBendPoint;
  if (templeCurveDrop !== null) dimensions.templeCurveDrop = templeCurveDrop;
  if (hingePosition !== null) dimensions.hingePosition = hingePosition;
  if (tipDropAngle !== null) dimensions.tipDropAngleDeg = tipDropAngle;
  if (splayAngle !== null) dimensions.splayAngleDeg = splayAngle;
  if (lensGrooveDepth !== null) dimensions.lensGrooveDepth = lensGrooveDepth;
  if (lensGrooveWidth !== null) dimensions.lensGrooveWidth = lensGrooveWidth;
  if (frameWeight !== null) dimensions.weight = frameWeight;

  if (Object.keys(overrides ?? {}).length) {
    dimensions.sourceCues.push('Configured frame parameters from Metal Frame Design Studio controls');
  }
}

function reconcileTempleLengths(dimensions, explicitMetalLength = null) {
  if (dimensions.templeTipVisibleLength > 0) {
    dimensions.templeTipStartLength = Math.max(0, dimensions.templeLength - dimensions.templeTipVisibleLength);
  }
  const fallbackMetalLength = Math.max(0, dimensions.templeLength - dimensions.templeTipLength);
  const overlappedMetalLength = dimensions.templeTipStartLength !== undefined && dimensions.templeTipSleeveOverlap > 0
    ? dimensions.templeTipStartLength + dimensions.templeTipSleeveOverlap
    : fallbackMetalLength;
  dimensions.templeMetalLength = explicitMetalLength ?? overlappedMetalLength;
}

function resolveFrameDimensions(modelOrDimensions, options = {}) {
  if (typeof modelOrDimensions === 'string') {
    const dimensions = FRAME_3D_DIMENSIONS[modelOrDimensions];
    if (!dimensions) {
      throw new Error(`Unsupported 3D frame model: ${modelOrDimensions}`);
    }
    return applyLabelMemoryToFrameDimensions(dimensions, options.labelMemory);
  }
  return applyLabelMemoryToFrameDimensions(modelOrDimensions ?? VC_S19003_DIMENSIONS, options.labelMemory);
}

function isFrameSourceTemplePart(dimensions, partName) {
  const source = normalizePartName(dimensions?.templeSource);
  const selected = normalizePartName(partName);
  if (!source || !selected) {
    return false;
  }
  return source === selected || source.startsWith(`${selected} `) || selected.startsWith(`${source} `);
}

function isFrameSourceTempleTipPart(dimensions, partName) {
  const source = normalizePartName(dimensions?.templeTipSource);
  const selected = normalizePartName(partName);
  if (!source || !selected) {
    return false;
  }
  return source === selected || source.startsWith(`${selected} `) || selected.startsWith(`${source} `);
}

function normalizePartName(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function configuredPartRecord(part, fit) {
  return {
    id: part.id,
    name: part.name,
    fitConfidence: fit.confidence ?? 'fallback',
  };
}

function numericFitValue(fit, keys, fallback) {
  for (const key of keys) {
    const value = fit?.[key];
    if (value === null || value === undefined || value === '') {
      continue;
    }
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  return fallback;
}

function centerlineFitValue(fit) {
  if (!Array.isArray(fit.centerline2dMm)) {
    return null;
  }
  const points = fit.centerline2dMm
    .map((point) => {
      if (!Array.isArray(point) || point.length < 2) {
        return null;
      }
      const x = Number(point[0]);
      const y = Number(point[1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return null;
      }
      return { x, y };
    })
    .filter(Boolean);
  return points.length >= 2 ? points : null;
}

function stringFitValue(fit, keys, fallback) {
  for (const key of keys) {
    const value = fit?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return fallback;
}

function colorFitValue(fit, keys, fallback) {
  const value = stringFitValue(fit, keys, fallback);
  return /^#[0-9a-f]{6}$/i.test(value ?? '') ? value : fallback;
}

function applyLabelMemoryToFrameDimensions(dimensions, labelMemory) {
  const labels = Array.isArray(labelMemory?.labels) ? labelMemory.labels : [];
  if (!labels.length || dimensions.modelId !== 'VC S19004') {
    return dimensions;
  }

  const labelledComponents = new Set(labels.map((label) => label?.component).filter(Boolean));
  const next = {
    ...dimensions,
    sourceCues: [...dimensions.sourceCues],
  };

  if (labelledComponents.has('browbar')) {
    const cue = deriveBrowbarCueFromLabels(next, labels);
    const browbarSupersedesWireCore = next.modelId === 'VC S19004';
    next.hasBrowbar = true;
    next.hasWireCore = browbarSupersedesWireCore ? false : labelledComponents.has('wire_core');
    if (cue) {
      next.browbarLength = cue.length;
      next.browbarHeight = cue.height;
      next.browbarY = cue.y;
      next.browbarLabelSource = cue.source;
      next.sourceCues.push(`Corrected label memory: browbar ${cue.length.toFixed(1)} mm from ${cue.source.labelId}`);
    } else {
      next.browbarLength = next.browbarLength > 0 ? next.browbarLength : Math.max(0, next.frontWidth - (next.lensWidth * 1.25));
      next.browbarHeight = next.browbarHeight > 0 ? next.browbarHeight : next.rimTubeRadius;
      next.sourceCues.push('Corrected label memory: browbar present');
    }
    if (browbarSupersedesWireCore) {
      next.sourceCues.push('Corrected VC S19004 label memory: browbar supersedes the old wire-core/front-bar default');
    }
    return next;
  }

  next.hasBrowbar = false;
  next.browbarLength = 0;
  next.browbarHeight = 0;
  delete next.browbarY;
  delete next.browbarLabelSource;
  next.hasWireCore = labelledComponents.has('wire_core');
  return next;
}

function deriveBrowbarCueFromLabels(dimensions, labels) {
  const rimBounds = labels
    .filter((label) => label?.component === 'rim' && label.view === 'front-main')
    .map(labelBounds)
    .filter(Boolean);
  if (rimBounds.length < 2) {
    return null;
  }

  const candidates = labels
    .filter((label) => label?.component === 'browbar' && String(label.view ?? '').startsWith('front'))
    .map((label) => ({ label, bounds: labelBounds(label) }))
    .filter((item) => item.bounds);
  if (!candidates.length) {
    return null;
  }

  const rimMinY = Math.min(...rimBounds.map((bounds) => bounds.minY));
  const rimMaxY = Math.max(...rimBounds.map((bounds) => bounds.maxY));
  const averageRimHeightPx = average(rimBounds.map((bounds) => bounds.height));
  const averageRimWidthPx = average(rimBounds.map((bounds) => bounds.width));
  const pxPerMmX = averageRimWidthPx / dimensions.lensWidth;
  const pxPerMmY = averageRimHeightPx / dimensions.lensHeight;
  if (!Number.isFinite(pxPerMmX) || pxPerMmX <= 0 || !Number.isFinite(pxPerMmY) || pxPerMmY <= 0) {
    return null;
  }

  const rimCenterY = average(rimBounds.map((bounds) => bounds.centerY));
  const verticalBand = {
    minY: rimMinY - averageRimHeightPx * 0.2,
    maxY: rimMaxY + averageRimHeightPx * 0.15,
  };
  const visibleFrontCandidates = candidates.filter(({ bounds }) => (
    bounds.centerY >= verticalBand.minY && bounds.centerY <= verticalBand.maxY
  ));
  const selected = [...(visibleFrontCandidates.length ? visibleFrontCandidates : candidates)].sort((a, b) => {
    const aTopOffset = Math.abs(a.bounds.centerY - rimMinY);
    const bTopOffset = Math.abs(b.bounds.centerY - rimMinY);
    return aTopOffset - bTopOffset || b.bounds.width - a.bounds.width;
  })[0];

  const rawLength = selected.bounds.width / pxPerMmX;
  const rawHeight = selected.bounds.height / pxPerMmY;
  return {
    length: clamp(rawLength, dimensions.bridgeWidth, dimensions.frontWidth - 8),
    height: clamp(rawHeight / 2, 1.0, 1.3),
    y: clamp((rimCenterY - selected.bounds.centerY) / pxPerMmY, 0, dimensions.lensHeight / 2 + 2.5),
    source: {
      type: 'LABEL_MEMORY',
      labelId: selected.label.id,
      view: selected.label.view,
      sourceBoundsPx: {
        x: selected.bounds.minX,
        y: selected.bounds.minY,
        width: selected.bounds.width,
        height: selected.bounds.height,
      },
      scalePxPerMm: {
        x: pxPerMmX,
        y: pxPerMmY,
      },
    },
  };
}

function labelBounds(label) {
  if (!Array.isArray(label?.points) || label.points.length < 2) {
    return null;
  }
  const points = label.points.filter((point) => (
    Number.isFinite(point?.x) && Number.isFinite(point?.y)
  ));
  if (points.length < 2) {
    return null;
  }
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildOptionalFrontBars(dimensions) {
  const components = [];
  if (dimensions.hasBrowbar !== false && dimensions.browbarLength > 0) {
    components.push(dimensions.browbarLabelSource ? buildLabelBrowbar(dimensions) : buildCadBrowbar(dimensions));
  }
  if (dimensions.hasWireCore) {
    components.push(buildWireCore(dimensions));
  }
  return components;
}

function buildLabelBrowbar(dimensions) {
  const halfLength = dimensions.browbarLength / 2;
  const y = dimensions.browbarY ?? (dimensions.lensHeight / 2 - 1.5);
  const topViewSource = buildFrontBaseCurveSource(dimensions);
  return {
    id: 'browbar-top-rail',
    component: 'browbar',
    attachment: ['wearer-right-rim.upper', 'wearer-left-rim.upper'],
    points: buildLabelBrowbarPoints(dimensions, halfLength, y),
    tubeRadius: dimensions.browbarHeight / 2,
    source: topViewSource
      ? { ...dimensions.browbarLabelSource, topView: topViewSource }
      : dimensions.browbarLabelSource,
  };
}

function buildLabelBrowbarPoints(dimensions, halfLength, y) {
  const ratios = dimensions.frontBaseCurveMm > 0 ? [-1, -0.5, 0, 0.5, 1] : [-1, 0, 1];
  return ratios.map((ratio) => {
    const x = ratio * halfLength;
    return {
      x,
      y,
      z: frontBaseCurveDepthAtX(x, dimensions),
    };
  });
}

function frontBaseCurveDepthAtX(x, dimensions) {
  if (!(dimensions.frontBaseCurveMm > 0) || !(dimensions.frontWidth > 0)) {
    return -0.4;
  }

  const halfFrontWidth = dimensions.frontWidth / 2;
  const normalizedX = clamp(Math.abs(x) / halfFrontWidth, 0, 1);
  return dimensions.frontBaseCurveMm * (1 - normalizedX ** 2);
}

function buildFrontBaseCurveSource(dimensions) {
  if (!(dimensions.frontBaseCurveMm > 0)) {
    return null;
  }

  return {
    view: 'top',
    baseCurveMm: dimensions.frontBaseCurveMm,
    toleranceMm: 0.5,
    sourceWidthMm: dimensions.frontWidth,
    note: 'PDF top view Base 4±0.5: the front/browbar plane bows forward at center and returns toward the rim-edge ends.',
  };
}

function buildWireCore(dimensions) {
  const halfSpan = dimensions.frontWidth / 2 - 5;
  const y = dimensions.wireCoreY ?? -3.8;
  return {
    id: 'wire-core-front-bar',
    component: 'wire_core',
    attachment: ['wearer-right-rim.outer', 'wearer-left-rim.outer'],
    points: [
      { x: -halfSpan, y, z: -1.7 },
      { x: halfSpan, y, z: -1.7 },
    ],
    tubeRadius: dimensions.wireCoreRadius ?? 0.42,
    source: {
      view: 'top/front-detail',
      detail: 'Wire core / front bar visible in corrected labels',
      note: 'S19002/S19004 corrected labels include the long straight wire-core/front-bar and no browbar label.',
    },
  };
}

function buildNosePad(side, sign, rim, dimensions) {
  const padSpacing = Number.isFinite(Number(dimensions.nosePadSpacing)) ? Number(dimensions.nosePadSpacing) : 20.8;
  const center = { x: sign * (padSpacing / 2), y: -8.3, z: -6.2 };
  const noseArm = noseArmFitForDimensions(dimensions);
  const rawRimEdgeAnchor = findNoseArmRimEdgeAnchor(rim, center);
  const rimEdgeAnchor = noseArm
    ? {
      ...rawRimEdgeAnchor,
      x: rawRimEdgeAnchor.x + sign * noseArm.reachDelta * 0.6,
      y: rawRimEdgeAnchor.y - noseArm.dropDelta * 0.08,
    }
    : rawRimEdgeAnchor;
  const armEnd = noseArm
    ? {
      x: center.x - sign * (1.2 - noseArm.reachDelta * 0.25),
      y: center.y + 1.9 - noseArm.dropDelta * 0.15,
      z: center.z + 0.25 - noseArm.dropDelta * 0.32,
    }
    : { x: center.x - sign * 1.2, y: center.y + 1.9, z: center.z + 0.25 };
  const armPoints = noseArm
    ? [
      { x: rimEdgeAnchor.x, y: rimEdgeAnchor.y, z: -0.35 },
      { x: rimEdgeAnchor.x - sign * 0.65, y: rimEdgeAnchor.y + 0.35, z: -1.65 - noseArm.dropDelta * 0.18 },
      { x: center.x - sign * (0.25 + noseArm.reachDelta * 0.16), y: center.y + 4.75 - noseArm.dropDelta * 0.08, z: center.z + 2.25 - noseArm.dropDelta * 0.22 },
      { x: center.x - sign * (1.55 - noseArm.reachDelta * 0.14), y: center.y + 3.05 - noseArm.dropDelta * 0.12, z: center.z + 0.95 - noseArm.dropDelta * 0.28 },
      armEnd,
    ]
    : [
      { x: rimEdgeAnchor.x, y: rimEdgeAnchor.y, z: -0.35 },
      { x: rimEdgeAnchor.x - sign * 0.65, y: rimEdgeAnchor.y + 0.35, z: -1.65 },
      { x: center.x - sign * 0.25, y: center.y + 4.75, z: center.z + 2.25 },
      { x: center.x - sign * 1.55, y: center.y + 3.05, z: center.z + 0.95 },
      armEnd,
    ];

  return {
    id: `${side}-nose-pad`,
    component: 'nose_pad',
    side,
    center,
    radius: { x: 3.8, y: 7.2, z: 1.1 },
    armAttachment: [`${side}-rim.inner-edge`, `${side}-nose-pad`],
    armTubeRadius: noseArm?.tubeRadius ?? 0.42,
    armFootRadius: 0.74,
    armBossRadius: 0.82,
    appearance: {
      color: dimensions.nosePadColor ?? '#b7d8d6',
      opacity: dimensions.nosePadOpacity ?? 0.58,
      logo: dimensions.nosePadLogo ?? null,
    },
    armPoints,
    rimEdgeAnchor,
    source: {
      part: dimensions.nosePadSource ?? 'Default nose pad',
      noseArm: {
        part: dimensions.noseArmSource ?? 'Default nosearm',
        lengthClass: dimensions.noseArmLengthClass ?? 'standard',
        reachMm: dimensions.noseArmReach ?? null,
        dropMm: dimensions.noseArmDrop ?? null,
      },
      topView: {
        view: CAD_NOSE_PAD_TOP_VIEW.view,
        entityIds: CAD_NOSE_PAD_TOP_VIEW.entityIdsBySide[side],
        angleDeg: CAD_NOSE_PAD_TOP_VIEW.angleDeg,
        bridgeDropMm: CAD_NOSE_PAD_TOP_VIEW.bridgeDropMm,
        baseOffsetMm: CAD_NOSE_PAD_TOP_VIEW.baseOffsetMm,
        note: 'Top view shows the nose pad as a pad plus curled metal nose arm mounted on the inner rim edge.',
      },
    },
  };
}

function noseArmFitForDimensions(dimensions) {
  if (!dimensions.noseArmSource) {
    return null;
  }
  const defaultReach = 6.2;
  const defaultDrop = 5.6;
  const reach = numericOr(dimensions.noseArmReach, defaultReach);
  const drop = numericOr(dimensions.noseArmDrop, defaultDrop);
  return {
    reach,
    drop,
    reachDelta: reach - defaultReach,
    dropDelta: drop - defaultDrop,
    tubeRadius: numericOr(dimensions.noseArmTubeRadius, 0.42),
  };
}

function findNoseArmRimEdgeAnchor(rim, padCenter) {
  const target = { x: padCenter.x, y: padCenter.y + 2.4 };
  return rim.path.reduce((closest, point) => {
    const distance = Math.hypot(point.x - target.x, point.y - target.y);
    return !closest || distance < closest.distance
      ? { x: point.x, y: point.y, distance }
      : closest;
  }, null);
}

function buildCadRim({ id, side, center, cad, dimensions }) {
  const sampledCadPath = sampleBulgedPolyline(cad.vertices, cad.bulges, true, 6);
  const path = normalizeCadPath(sampledCadPath, center, dimensions.lensWidth, dimensions.lensHeight);
  const source = {
    type: cad.type ?? 'CAD_LWPOLYLINE',
    view: cad.view,
    sourceBoundsMm: cad.sourceBoundsMm,
  };
  if (cad.entityId !== undefined) {
    source.entityId = cad.entityId;
  }
  if (cad.labelId) {
    source.labelId = cad.labelId;
  }
  if (cad.sourceBoundsPx) {
    source.sourceBoundsPx = cad.sourceBoundsPx;
  }
  if (cad.sourceDetail) {
    source.detail = cad.sourceDetail;
  }

  return {
    id,
    component: 'rim',
    side,
    center,
    path,
    lensPath: scalePath(path, center, 0.92, 0.9, -1.15),
    radiusX: dimensions.lensWidth / 2,
    radiusY: dimensions.lensHeight / 2,
    tubeRadius: dimensions.rimTubeRadius,
    source,
  };
}

function buildCadNoseBridge(dimensions) {
  if (Array.isArray(dimensions.noseBridgeCenterline2dMm) && dimensions.noseBridgeCenterline2dMm.length >= 2) {
    return buildSelectedNoseBridge(dimensions);
  }
  const bridgeCad = CAD_NOSE_BRIDGE_BY_MODEL[dimensions.modelId] ?? CAD_NOSE_BRIDGE;
  const frontReference = CAD_FRONT_REFERENCE_BY_MODEL[dimensions.modelId] ?? CAD_FRONT_REFERENCE;
  const rawBounds = pointBounds(bridgeCad.centerline.map(([x, y]) => ({ x, y })));
  const scaleX = dimensions.noseBridgeDetailWidth / (rawBounds.maxX - rawBounds.minX);
  const scaleY = dimensions.lensHeight / frontReference.sourceHeight;
  const sourceCenterX = (rawBounds.minX + rawBounds.maxX) / 2;
  const points = bridgeCad.centerline.map(([x, y]) => ({
    x: (x - sourceCenterX) * scaleX,
    y: (y - frontReference.centerY) * scaleY,
    z: -0.75,
  }));

  return {
    id: 'nose-bridge',
    component: 'nose_bridge',
    attachment: ['wearer-right-rim.inner', 'wearer-left-rim.inner'],
    points,
    tubeRadius: 0.82,
    source: {
      view: bridgeCad.view,
      entityIds: bridgeCad.entityIds,
      detail: dimensions.noseBridgeSource ?? bridgeCad.sourceDetail,
      sourceBoundsMm: {
        x: rawBounds.minX,
        y: rawBounds.minY,
        width: rawBounds.maxX - rawBounds.minX,
        height: rawBounds.maxY - rawBounds.minY,
      },
      detailWidthMm: bridgeCad.sourceWidthMm,
      profileDepthMm: bridgeCad.sourceDepthMm,
    },
  };
}

function buildSelectedNoseBridge(dimensions) {
  const centerline = dimensions.noseBridgeCenterline2dMm;
  const anchorY = dimensions.lensHeight * 0.285;
  const points = centerline.map((point) => ({
    x: point.x,
    y: anchorY + point.y,
    z: -0.75,
  }));
  const bounds = pointBounds(points);

  return {
    id: 'nose-bridge',
    component: 'nose_bridge',
    attachment: ['wearer-right-rim.inner', 'wearer-left-rim.inner'],
    points,
    tubeRadius: 0.82,
    source: {
      view: 'child-part-pdf',
      detail: dimensions.noseBridgeSource,
      geometrySource: 'selected_child_part_pdf',
      sourceBoundsMm: {
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
      },
      detailWidthMm: dimensions.noseBridgeDetailWidth,
      profileDepthMm: dimensions.noseBridgeProfileDepth,
    },
  };
}

function buildCadBrowbar(dimensions) {
  const browbarCad = CAD_BROWBAR_BY_MODEL[dimensions.modelId] ?? CAD_BROWBAR;
  const frontReference = CAD_FRONT_REFERENCE_BY_MODEL[dimensions.modelId] ?? CAD_FRONT_REFERENCE;
  const bounds = pointBounds(browbarCad.points.map(([x, y]) => ({ x, y })));
  const sourceCenterX = (bounds.minX + bounds.maxX) / 2;
  const sourceCenterY = (bounds.minY + bounds.maxY) / 2;
  const scaleX = dimensions.browbarLength / (bounds.maxX - bounds.minX);
  const scaleY = dimensions.lensHeight / frontReference.sourceHeight;
  const points = [
    { x: bounds.minX, y: sourceCenterY },
    { x: sourceCenterX, y: sourceCenterY + (browbarCad.bulges[0] ?? 0) * 0.4 },
    { x: bounds.maxX, y: sourceCenterY },
  ].map((point) => ({
    x: (point.x - sourceCenterX) * scaleX,
    y: (point.y - frontReference.centerY) * scaleY,
    z: -0.4,
  }));

  return {
    id: 'browbar-top-rail',
    component: 'browbar',
    attachment: ['wearer-right-rim.upper', 'wearer-left-rim.upper'],
    points,
    tubeRadius: dimensions.browbarHeight / 2,
    source: {
      view: browbarCad.view,
      entityId: browbarCad.entityId,
      sourceBoundsMm: {
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
      },
    },
  };
}

function buildSideAssembly(side, sign, halfFrontWidth, dimensions) {
  const templeCurve = buildTempleCurve(side, sign, dimensions);
  const templePoints = templeCurve.points.filter((point) => point.length <= dimensions.templeMetalLength + 0.001);
  const tipStartLength = templeTipStartLength(dimensions);
  const tipPoints = templeCurve.points.filter((point) => point.length >= tipStartLength - 0.001);
  const templeOutlines = templeCurve.sideOutlines.filter((outline) => outline.component === 'temple');
  const tipOutlines = templeCurve.sideOutlines.filter((outline) => outline.component === 'temple_tip');
  const endPiece = buildEndPiece(side, sign, halfFrontWidth, dimensions);
  const hinge = buildHingeJoint(side, sign, halfFrontWidth, dimensions);
  const rootConnectorPoints = templeRootConnectorPoints(endPiece, templePoints, dimensions);

  return [
    endPiece,
    hinge,
    {
      id: `${side}-temple`,
      component: 'temple',
      side,
      points: templePoints.map(stripLength),
      sideOutlines: templeOutlines,
      rootConnectorPoints,
      rootConnectorRadius: dimensions.templeTubeRadius ?? 1.05,
      tubeRadius: dimensions.templeTubeRadius ?? 1.05,
      source: {
        part: dimensions.templeSource,
        topView: templeCurve.source.topView,
        sideView: {
          ...templeCurve.source.sideView,
          templeRootConnection: rootConnectorPoints ? 'hinge_sleeve_overlap' : null,
        },
      },
    },
    {
      id: `${side}-temple-tip`,
      component: 'temple_tip',
      side,
      points: tipPoints.map(stripLength),
      sideOutlines: tipOutlines,
      tubeRadius: 1.25,
      bendRadius: dimensions.templeBendRadius,
      angleDeg: dimensions.templeTipAngleDeg,
      source: {
        part: dimensions.templeTipSource,
        topView: templeCurve.source.topView,
        sideView: templeCurve.source.sideView,
      },
    },
    buildRimLock(side, sign, halfFrontWidth, dimensions),
  ];
}

function templeRootConnectorPoints(endPiece, templePoints, dimensions) {
  if (dimensions.modelId === 'VC S19000' || !endPiece.points || !templePoints.length) {
    return null;
  }

  return [
    stripLength(endPiece.points.at(-1)),
    stripLength(templePoints[0]),
  ];
}

function templeMountY(dimensions) {
  const neutralTempleHeightPosition = -6;
  const configuredTempleHeightPosition = Number(dimensions.templeHeightPosition);
  return 4.8 + (Number.isFinite(configuredTempleHeightPosition)
    ? configuredTempleHeightPosition - neutralTempleHeightPosition
    : 0);
}

function buildEndPiece(side, sign, halfFrontWidth, dimensions) {
  const hingeX = sign * halfFrontWidth;
  const source = getJunctionSource(dimensions, side);

  if (dimensions.modelId !== 'VC S19000') {
    const mountY = templeMountY(dimensions);
    return {
      id: `${side}-end-piece`,
      component: 'end_piece',
      side,
      points: [
        { x: sign * (halfFrontWidth - 7), y: mountY + 0.6, z: 0 },
        { x: hingeX, y: mountY, z: -2.8 },
      ],
      tubeRadius: 1.0,
      source: {
        part: dimensions.endPieceSource,
      },
    };
  }

  const frontOuter = frontPointFromCad(source.frontOuterPoint, dimensions);
  const frontInner = frontPointFromCad(source.frontInnerPoint, dimensions);
  const topScrew = frontPointFromCad(source.topScrewPoint, dimensions);
  const pivotDepth = topDepthFromCadY(source.topScrewPoint[1], source, dimensions);
  const sleeveX = lerp(frontOuter.x, topScrew.x, 0.45);
  const sleeveY = frontOuter.y;
  const sleeveDepth = pivotDepth * 0.58;
  const sleeveLength = Math.abs(sleeveDepth) + 2.6;

  return {
    id: `${side}-end-piece`,
    component: 'end_piece',
    side,
    interlocksWith: `${side}-hinge`,
    connectorPoints: [
      { x: frontOuter.x, y: sleeveY, z: -0.35 },
      { x: sleeveX, y: sleeveY - 0.15, z: sleeveDepth },
      { x: topScrew.x, y: sleeveY - 0.1, z: pivotDepth + 1.4 },
    ],
    tubeRadius: 0.46,
    plates: [
      {
        center: { x: sleeveX, y: sleeveY + 1.05, z: sleeveDepth / 2 },
        size: { x: 2.8, y: 0.48, z: sleeveLength },
      },
      {
        center: { x: sleeveX, y: sleeveY - 1.05, z: sleeveDepth / 2 },
        size: { x: 2.8, y: 0.48, z: sleeveLength },
      },
      {
        center: { x: frontOuter.x, y: sleeveY, z: -1.4 },
        size: { x: Math.abs(frontInner.x - frontOuter.x) * 0.52, y: 2.9, z: 0.78 },
      },
      {
        center: { x: topScrew.x, y: sleeveY, z: pivotDepth + 1.2 },
        size: { x: 3.4, y: 2.85, z: 0.95 },
      },
    ],
    source: {
      part: dimensions.endPieceSource,
      frontView: {
        view: 'front-main',
        entityIds: source.frontViewEntityIds,
        note: '19000 end piece begins at the rim-edge tab visible in the front view.',
      },
      topView: {
        view: 'top',
        entityIds: source.topEndPieceEntityIds,
        topScrewEntityId: source.topViewEntityIds.find((entityId) => entityId === 13018 || entityId === 12869),
        note: 'Top view shows the T4 end piece leaving the rim and meeting the hinge screw cluster before the temple run.',
      },
    },
  };
}

function buildHingeJoint(side, sign, halfFrontWidth, dimensions) {
  const hingeX = sign * halfFrontWidth;
  const source = getJunctionSource(dimensions, side);

  if (dimensions.modelId === 'VC S19000') {
    const frontOuter = frontPointFromCad(source.frontOuterPoint, dimensions);
    const topScrew = frontPointFromCad(source.topScrewPoint, dimensions);
    const pivotDepth = topDepthFromCadY(source.topScrewPoint[1], source, dimensions);
    const primaryZ = pivotDepth - 1.8;
    const secondaryZ = pivotDepth + 1.9;

    return {
      id: `${side}-hinge`,
      component: 'hinge_joint',
      side,
      center: { x: topScrew.x, y: frontOuter.y, z: pivotDepth },
      interlocksWith: `${side}-rim-lock`,
      leaves: [
        {
          center: { x: topScrew.x - sign * 0.35, y: frontOuter.y + 0.72, z: pivotDepth },
          size: { x: 1.15, y: 1.45, z: 7.5 },
        },
        {
          center: { x: topScrew.x + sign * 0.65, y: frontOuter.y - 0.7, z: pivotDepth },
          size: { x: 1.15, y: 1.35, z: 7.0 },
        },
      ],
      pivotCenters: [
        { x: topScrew.x, y: frontOuter.y, z: primaryZ, radius: 0.78, depth: 0.82, axis: 'x' },
        { x: topScrew.x, y: frontOuter.y + 0.2, z: secondaryZ, radius: 0.72, depth: 0.76, axis: 'x' },
      ],
      source: {
        topView: {
          view: 'top',
          entityIds: source.topViewEntityIds,
          screwCenterMm: source.topScrewPoint,
          note: '19000 top view places the hinge screw cluster just behind the rim-edge end piece.',
        },
        frontView: {
          view: 'front-main',
          entityIds: source.frontViewEntityIds,
          note: '19000 front view shows the hinge/rim-lock stack as a compact ribbed tab at the outer rim split.',
        },
      },
    };
  }

  const mountY = templeMountY(dimensions);

  return {
    id: `${side}-hinge`,
    component: 'hinge_joint',
    side,
    center: { x: hingeX, y: mountY + 1.0, z: -2.6 },
    interlocksWith: `${side}-rim-lock`,
    leaves: [
      {
        center: { x: hingeX + sign * 0.4, y: mountY + 0.2, z: -2.55 },
        size: { x: 1.55, y: 8.8, z: 3.0 },
      },
      {
        center: { x: hingeX - sign * 1.25, y: mountY - 3.6, z: -0.7 },
        size: { x: 1.2, y: 12.6, z: 2.2 },
      },
    ],
    pivotCenters: [
      { x: hingeX, y: mountY + 2.0, z: -2.85, radius: 1.45, depth: 1.05, axis: 'x' },
      { x: hingeX - sign * 1.55, y: mountY - 4.2, z: -0.15, radius: 1.18, depth: 0.9, axis: 'x' },
    ],
    source: {
      topView: {
        view: 'top',
        entityIds: source.topViewEntityIds,
        note: 'Top view shows curved hinge/end-piece leaves with circular screw or pivot heads at the temple root.',
      },
      frontView: {
        view: 'front-main',
        entityIds: source.frontViewEntityIds,
        note: 'Front view shows the hinge/rim-lock tab projecting from the outer rim split.',
      },
    },
  };
}

function buildRimLock(side, sign, halfFrontWidth, dimensions) {
  const source = getJunctionSource(dimensions, side);

  if (dimensions.modelId === 'VC S19000') {
    const frontOuter = frontPointFromCad(source.frontOuterPoint, dimensions);
    const frontInner = frontPointFromCad(source.frontInnerPoint, dimensions);
    const center = {
      x: (frontOuter.x + frontInner.x) / 2,
      y: frontOuter.y,
      z: 0.12,
    };
    const ribWidth = Math.abs(frontInner.x - frontOuter.x) * 0.84;
    const ribCenterX = (frontOuter.x + frontInner.x) / 2;

    return {
      id: `${side}-rim-lock`,
      component: 'rim_lock',
      side,
      center,
      interlocksWith: `${side}-hinge`,
      clampPlates: [
        {
          center: { x: ribCenterX, y: frontPointFromCad([source.frontOuterPoint[0], source.frontRibYValues.at(0)], dimensions).y, z: 0.2 },
          size: { x: ribWidth, y: 0.42, z: 1.08 },
        },
        {
          center: { x: ribCenterX, y: frontPointFromCad([source.frontOuterPoint[0], source.frontRibYValues.at(-1)], dimensions).y, z: 0.2 },
          size: { x: ribWidth, y: 0.42, z: 1.08 },
        },
      ],
      frontRibs: source.frontRibYValues.slice(1, -1).map((cadY, index) => ({
        center: { x: ribCenterX + sign * (index % 2 === 0 ? 0.05 : -0.03), y: frontPointFromCad([source.frontOuterPoint[0], cadY], dimensions).y, z: 0.68 },
        size: { x: ribWidth - 0.18 * (index % 3), y: 0.085, z: 0.52 },
      })),
      lockScrewCenters: source.frontScrewPoints.map((point) => {
        const mapped = frontPointFromCad(point, dimensions);
        return { x: mapped.x, y: mapped.y, z: 0.78, radius: 0.38, depth: 0.5, axis: 'z' };
      }),
      source: {
        frontView: {
          view: 'front-main',
          entityIds: source.rimLockEntityIds,
          note: '19000 rim lock is the ribbed clamp stack at the outer rim split, not the larger 19003 tab.',
        },
        topView: {
          view: 'top',
          entityIds: source.topViewEntityIds,
          note: 'Top view aligns the rim lock with the adjacent T4 end-piece and hinge screw cluster.',
        },
      },
    };
  }

  const mountY = templeMountY(dimensions);
  const center = { x: sign * (halfFrontWidth - 1.25), y: mountY + 2.8, z: -0.25 };

  return {
    id: `${side}-rim-lock`,
    component: 'rim_lock',
    side,
    center,
    interlocksWith: `${side}-hinge`,
    clampPlates: [
      {
        center: { x: center.x + sign * 0.25, y: mountY + 3.95, z: -0.25 },
        size: { x: 1.25, y: 2.7, z: 1.35 },
      },
      {
        center: { x: center.x - sign * 1.2, y: mountY + 1.45, z: -0.2 },
        size: { x: 1.1, y: 2.35, z: 1.2 },
      },
    ],
    lockScrewCenters: [
      { x: center.x - sign * 0.35, y: mountY + 2.7, z: 0.45, radius: 0.72, depth: 0.55, axis: 'x' },
    ],
    source: {
      frontView: {
        view: 'front-main',
        entityIds: source.rimLockEntityIds,
        note: 'Rim lock is the small clamp/tab at the outer rim split and is physically tied into the hinge/end-piece.',
      },
      topView: {
        view: 'top',
        entityIds: source.topViewEntityIds,
      },
    },
  };
}

function getJunctionSource(dimensions, side) {
  const sourceBySide = CAD_HINGE_RIM_LOCK_BY_MODEL[dimensions.modelId] ?? CAD_HINGE_RIM_LOCK;
  return sourceBySide[side];
}

function frontPointFromCad([x, y], dimensions) {
  const frontReference = CAD_FRONT_REFERENCE_BY_MODEL[dimensions.modelId] ?? CAD_FRONT_REFERENCE;
  const frontRims = CAD_FRONT_RIMS_BY_MODEL[dimensions.modelId] ?? CAD_FRONT_RIMS;
  const rightCenter = frontRims.wearerRight.sourceBoundsMm.x + frontRims.wearerRight.sourceBoundsMm.width / 2;
  const leftCenter = frontRims.wearerLeft.sourceBoundsMm.x + frontRims.wearerLeft.sourceBoundsMm.width / 2;
  const scaleX = (dimensions.lensWidth + dimensions.bridgeWidth) / (leftCenter - rightCenter);
  const scaleY = dimensions.lensHeight / frontReference.sourceHeight;

  return {
    x: (x - frontReference.centerX) * scaleX,
    y: (y - frontReference.centerY) * scaleY,
  };
}

function topDepthFromCadY(cadY, source, dimensions) {
  return -clamp(
    ((cadY - source.topFrontY) / (source.topRearY - source.topFrontY || 1)) * dimensions.topViewDepth,
    0,
    dimensions.topViewDepth,
  );
}

function buildTempleCurve(side, sign, dimensions) {
  const topView = CAD_TOP_TEMPLE_PATHS[side];
  const sideView = CAD_SIDE_TEMPLE_PROFILES[side];
  const sideProfile = buildSideProfile(sideView, dimensions);
  const tipStartLength = templeTipStartLength(dimensions);
  const rawSamples = topView.centerline
    .map(([cadX, cadY]) => ({
      cadX,
      cadY,
      length: clamp(
        ((cadY - topView.hingeY) / (topView.rearY - topView.hingeY)) * dimensions.templeLength,
        0,
        dimensions.templeLength,
      ),
    }))
    .sort((a, b) => a.length - b.length);

  const samples = insertLengthSamples(rawSamples, [
    interpolateCadSample(rawSamples, tipStartLength),
    interpolateCadSample(rawSamples, dimensions.templeMetalLength),
    ...sideProfile.map((point) => interpolateCadSample(rawSamples, point.length)),
  ]);
  const startHalf = Math.abs(samples[0].cadX - topView.centerX);
  const endHalf = Math.abs(samples.at(-1).cadX - topView.centerX);

  const points = samples.map((sample) => ({
    ...templePointFromCadSample(
      sample,
      interpolateProfile(sideProfile, sample.length),
      sign,
      topView,
      startHalf,
      endHalf,
      dimensions,
    ),
    length: sample.length,
  }));
  const sideOutlines = buildTempleSideOutlines(
    side,
    sign,
    topView,
    rawSamples,
    startHalf,
    endHalf,
    dimensions,
  );

  return {
    points,
    sideOutlines,
    source: {
      topView: {
        view: topView.view,
        entityIds: topView.entityIds,
        sourceFrontSpanMm: dimensions.frontWidth,
        sourceRearSpanMm: dimensions.topTempleRearSpan,
        sourceDepthMm: dimensions.topViewDepth,
        templeLengthMm: dimensions.templeLength,
      },
      sideView: {
        view: sideView.view,
        entityIds: sideView.entityIds,
        templeSource: dimensions.templeSource,
        tipSource: dimensions.templeTipSource,
        templeLengthMm: dimensions.templeLength,
        tipLengthMm: dimensions.templeTipLength,
        visibleTipLengthMm: dimensions.templeTipVisibleLength,
        tipStartLengthMm: tipStartLength,
        sleeveOverlapMm: dimensions.templeTipSleeveOverlap,
        sleeveHeightMm: dimensions.templeTipSleeveHeight,
        endHeightMm: dimensions.templeTipEndHeight,
        bendStartLengthMm: sideView.bendStartLengthMm,
        bendRadiusMm: dimensions.templeBendRadius,
        tipAngleDeg: dimensions.templeTipAngleDeg,
        visibleGeometryRule: dimensions.templeTipVisibleLength > 0 ? 'arched_curved_tip_only' : null,
        excludedGeometry: dimensions.templeTipVisibleLength > 0 ? 'straight_dashed_construction_tip' : null,
        profilePointsMm: sideProfile.map(({ length, y }) => ({
          length: roundTo(length, 3),
          y: roundTo(y, 3),
        })),
      },
    },
  };
}

function buildTempleSideOutlines(side, sign, topView, rawSamples, startHalf, endHalf, dimensions) {
  const sideView = CAD_SIDE_TEMPLE_PROFILES[side];

  return CAD_SIDE_TEMPLE_OUTLINES.map((outline) => {
    const outlineId = outline.component === 'temple_tip'
      ? `${dimensions.templeTipSource.toLowerCase()}-r30-bent-ear-tip`
      : outline.id;
    const rawProfilePointsMm = rawSideOutlineProfilePoints(outline, dimensions);
    const profilePointsMm = configuredSideOutlineProfilePoints(outline, rawProfilePointsMm, dimensions);
    const points = profilePointsMm.map((profilePoint) => ({
      ...templePointAtLength(
        profilePoint.length,
        profilePoint.y,
        sign,
        topView,
        rawSamples,
        startHalf,
        endHalf,
        dimensions,
      ),
      length: profilePoint.length,
    }));

    return {
      id: outlineId,
      component: outline.component,
      side,
      points,
      profilePointsMm: profilePointsMm.map(({ length, y }) => ({
        length: roundTo(length, 3),
        y: roundTo(y, 3),
      })),
      source: {
        ...configuredSideOutlineSource(outline, dimensions),
        view: sideView.view,
        templeSource: dimensions.templeSource,
        tipSource: dimensions.templeTipSource,
        entityIds: outline.entityIdsBySide[side],
        ignoredConstructionEntityIds: outline.ignoredConstructionEntityIdsBySide?.[side] ?? [],
      },
    };
  });
}

function rawSideOutlineProfilePoints(outline, dimensions) {
  return outline.cadPoints.map(([cadX, cadY]) => ({
    length: snapTempleProfileLength(
      clamp(Math.abs(cadX - CAD_SIDE_OUTLINE_REFERENCE.startX), 0, dimensions.templeLength),
      dimensions,
    ),
    y: cadY - CAD_SIDE_OUTLINE_REFERENCE.baselineY,
  }));
}

function configuredSideOutlineProfilePoints(outline, profilePointsMm, dimensions) {
  if (outline.component === 'temple' && dimensions.configuredParts?.temple) {
    return configuredTempleStripProfilePoints(outline, profilePointsMm, dimensions);
  }
  if (outline.component === 'temple_tip' && dimensions.templeTipVisibleLength > 0 && dimensions.templeTipEndHeight > 0) {
    return buildDimensionedTempleTipProfilePoints(dimensions);
  }
  if (outline.component === 'temple_tip' && (dimensions.configuredParts?.temple || dimensions.configuredParts?.temple_tip)) {
    return configuredTempleTipProfilePoints(profilePointsMm, dimensions);
  }
  return profilePointsMm;
}

function configuredTempleStripProfilePoints(outline, profilePointsMm, dimensions) {
  const sourceHeight = outline.source.heightMm ?? 3.3;
  const maxLength = Math.max(...profilePointsMm.map((point) => point.length), 1);
  return profilePointsMm.map((point) => {
    const targetLength = (point.length / maxLength) * dimensions.templeMetalLength;
    const targetHeight = templeStripHeightAtLength(targetLength, dimensions, sourceHeight);
    return {
      length: targetLength,
      y: point.y * (targetHeight / sourceHeight),
    };
  });
}

function configuredTempleTipProfilePoints(profilePointsMm, dimensions) {
  if (dimensions.templeTipVisibleLength > 0 && dimensions.templeTipEndHeight > 0) {
    return buildDimensionedTempleTipProfilePoints(dimensions);
  }

  const sourceStart = Math.min(...profilePointsMm.map((point) => point.length));
  const sourceEnd = Math.max(...profilePointsMm.map((point) => point.length));
  const sourceSpan = sourceEnd - sourceStart || 1;
  const sourceJoin = profilePointsMm
    .filter((point) => Math.abs(point.length - sourceStart) < 0.001)
    .sort((a, b) => b.y - a.y);
  const targetJoin = templeRearJoinProfilePoints(dimensions);
  const sourceCenterY = average(sourceJoin.map((point) => point.y));
  const targetCenterY = average(targetJoin.map((point) => point.y));
  const sourceHalfHeight = Math.max((sourceJoin[0].y - sourceJoin.at(-1).y) / 2, 0.001);
  const targetHalfHeight = Math.max((targetJoin[0].y - targetJoin.at(-1).y) / 2, 0.001);
  const joinScaleY = targetHalfHeight / sourceHalfHeight;

  return profilePointsMm.map((point) => {
    const ratio = clamp((point.length - sourceStart) / sourceSpan, 0, 1);
    const tipDistance = ratio * dimensions.templeTipLength;
    return {
      length: dimensions.templeMetalLength + tipDistance,
      y: targetCenterY + ((point.y - sourceCenterY) * joinScaleY) - templeTipDropAtDistance(tipDistance, dimensions),
    };
  });
}

function buildDimensionedTempleTipProfilePoints(dimensions) {
  const start = templeTipStartLength(dimensions);
  const end = dimensions.templeLength;
  const bendStart = clamp(CAD_SIDE_TEMPLE_PROFILES['wearer-left'].bendStartLengthMm, start, end);
  const startBoundary = templeProfileBoundaryAtLength(start, dimensions);
  const metalBoundary = templeProfileBoundaryAtLength(dimensions.templeMetalLength, dimensions);
  const bendBoundary = templeProfileBoundaryAtLength(bendStart, dimensions);
  const sleeveHeight = dimensions.templeTipSleeveHeight ?? Math.abs(startBoundary[0].y - startBoundary.at(-1).y);
  const endHeight = dimensions.templeTipEndHeight ?? sleeveHeight;
  const endCenterY = average(startBoundary.map((point) => point.y)) - dimensionedTempleTipEndDrop(dimensions);
  const endTop = { length: end, y: endCenterY + (endHeight / 2) };
  const endBottom = { length: end, y: endCenterY - (endHeight / 2) };
  const upperEdge = uniqueProfilePointsByLength([
    startBoundary[0],
    metalBoundary[0],
    bendBoundary[0],
    ...[0.2, 0.4, 0.65, 0.85, 1].map((ratio) => ({
      length: lerp(bendStart, end, ratio),
      y: lerp(bendBoundary[0].y, endTop.y, smoothStep(ratio)),
    })),
  ].filter((point) => point.length >= start - 0.001 && point.length <= end + 0.001));
  const lowerCurve = [0.2, 0.4, 0.65, 0.85, 1].map((ratio) => ({
    length: lerp(bendStart, end, ratio),
    y: lerp(bendBoundary.at(-1).y, endBottom.y, smoothStep(ratio)),
  }));
  const lowerEdge = uniqueOrderedProfilePointsByLength([
    endBottom,
    ...lowerCurve.slice(0, -1).reverse(),
    bendBoundary.at(-1),
    metalBoundary.at(-1),
    startBoundary.at(-1),
  ]);
  return [...upperEdge, ...lowerEdge];
}

function templeRearJoinProfilePoints(dimensions) {
  return templeProfileBoundaryAtLength(dimensions.templeMetalLength, dimensions);
}

function templeProfileBoundaryAtLength(length, dimensions) {
  const templeOutline = CAD_SIDE_TEMPLE_OUTLINES.find((outline) => outline.component === 'temple');
  const rawProfilePointsMm = rawSideOutlineProfilePoints(templeOutline, dimensions);
  const profilePointsMm = dimensions.configuredParts?.temple
    ? configuredTempleStripProfilePoints(templeOutline, rawProfilePointsMm, dimensions)
    : rawProfilePointsMm;
  const minLength = Math.min(...profilePointsMm.map((point) => point.length));
  const maxLength = Math.max(...profilePointsMm.map((point) => point.length));
  const start = profilePointsMm
    .filter((point) => Math.abs(point.length - minLength) < 0.001)
    .sort((a, b) => b.y - a.y);
  const end = profilePointsMm
    .filter((point) => Math.abs(point.length - maxLength) < 0.001)
    .sort((a, b) => b.y - a.y);
  const ratio = clamp((length - minLength) / Math.max(maxLength - minLength, 0.001), 0, 1);
  return [
    { length, y: lerp(start[0].y, end[0].y, ratio) },
    { length, y: lerp(start.at(-1).y, end.at(-1).y, ratio) },
  ];
}

function configuredSideOutlineSource(outline, dimensions) {
  const source = { ...outline.source };
  if (outline.component === 'temple' && Number.isFinite(dimensions.templeTubeRadius)) {
    source.surfaceHalfThicknessMm = dimensions.templeTubeRadius;
  }
  if (outline.component === 'temple' && dimensions.configuredParts?.temple) {
    source.heightMm = dimensions.templeFrontHeight ?? source.heightMm;
    source.midHeightMm = dimensions.templeMidHeight ?? null;
    source.rearHeightMm = dimensions.templeRearHeight ?? null;
  }
  if (outline.component === 'temple_tip' && dimensions.templeTipVisibleLength > 0) {
    source.visibleGeometryRule = 'arched_curved_tip_only';
    source.excludedGeometry = 'straight_dashed_construction_tip';
    source.bendRadiusMm = dimensions.templeBendRadius;
    source.tipAngleDeg = dimensions.templeTipAngleDeg;
    source.tipLengthMm = dimensions.templeTipLength;
    source.visibleLengthMm = dimensions.templeTipVisibleLength ?? null;
    source.sleeveOverlapMm = dimensions.templeTipSleeveOverlap ?? null;
    source.sleeveHeightMm = dimensions.templeTipSleeveHeight ?? null;
    source.endHeightMm = dimensions.templeTipEndHeight ?? null;
    source.angledTipLengthMm = dimensions.templeTipAngledLength ?? null;
  }
  return source;
}

function templeTipStartLength(dimensions) {
  return dimensions.templeTipStartLength ?? dimensions.templeMetalLength;
}

function uniqueProfileLengths(lengths) {
  return [...lengths]
    .sort((a, b) => a - b)
    .filter((length, index, ordered) => index === 0 || Math.abs(length - ordered[index - 1]) > 0.001);
}

function uniqueProfilePointsByLength(points) {
  return [...points]
    .sort((a, b) => a.length - b.length)
    .filter((point, index, ordered) => index === 0 || Math.abs(point.length - ordered[index - 1].length) > 0.001);
}

function uniqueOrderedProfilePointsByLength(points) {
  return [...points]
    .filter((point, index, ordered) => index === 0 || Math.abs(point.length - ordered[index - 1].length) > 0.001);
}

function templeStripHeightAtLength(length, dimensions, fallback) {
  const frontHeight = dimensions.templeFrontHeight ?? fallback;
  const midHeight = dimensions.templeMidHeight ?? frontHeight;
  const rearHeight = dimensions.templeRearHeight ?? midHeight;
  const midLength = Math.max(dimensions.templeMetalLength * 0.55, 0.001);
  if (length <= midLength) {
    return lerp(frontHeight, midHeight, length / midLength);
  }
  return lerp(
    midHeight,
    rearHeight,
    clamp((length - midLength) / Math.max(dimensions.templeMetalLength - midLength, 0.001), 0, 1),
  );
}

function templeTipDropAtDistance(distance, dimensions) {
  const radius = Math.max(dimensions.templeBendRadius ?? 30, 1);
  const angleRad = Math.abs(dimensions.templeTipAngleDeg ?? 42) * (Math.PI / 180);
  const arcLength = Math.min(distance, radius * angleRad);
  const straightLength = Math.max(0, distance - arcLength);
  const arcDrop = radius * (1 - Math.cos(arcLength / radius));
  return arcDrop + (straightLength * Math.sin(angleRad) * 0.35);
}

function dimensionedTempleTipEndDrop(dimensions) {
  const angleRad = Math.abs(dimensions.templeTipAngleDeg ?? 35) * (Math.PI / 180);
  const angledLength = Math.max(dimensions.templeTipAngledLength ?? 40, 0);
  const visibleLength = Math.max(dimensions.templeTipVisibleLength ?? dimensions.templeTipLength ?? angledLength, 1);
  const geometricDrop = angledLength * Math.sin(angleRad);
  return clamp(geometricDrop, 0, visibleLength * 0.45);
}

function templePointAtLength(length, yOffset, sign, topView, rawSamples, startHalf, endHalf, dimensions) {
  return templePointFromCadSample(
    interpolateCadSample(rawSamples, length),
    yOffset,
    sign,
    topView,
    startHalf,
    endHalf,
    dimensions,
  );
}

function templePointFromCadSample(sample, yOffset, sign, topView, startHalf, endHalf, dimensions) {
  const inward = endHalf === startHalf
    ? sample.length / dimensions.templeLength
    : (Math.abs(sample.cadX - topView.centerX) - startHalf) / (endHalf - startHalf);
  const targetHalf = lerp(dimensions.frontWidth / 2, dimensions.topTempleRearSpan / 2, clamp(inward, 0, 1));
  return {
    x: sign * targetHalf,
    y: templeMountY(dimensions) + yOffset,
    z: -sample.length,
  };
}

function buildSideProfile(sideView, dimensions) {
  const startX = sideView.cadProfile[0][0];
  const rawProfile = sideView.cadProfile
    .map(([cadX, cadY]) => ({
      length: snapTempleProfileLength(clamp(Math.abs(cadX - startX), 0, dimensions.templeLength), dimensions),
      y: cadY - sideView.baselineY,
    }))
    .sort((a, b) => a.length - b.length);

  if (dimensions.templeTipVisibleLength > 0 && dimensions.templeTipEndHeight > 0) {
    return buildDimensionedTempleCenterProfile(rawProfile, dimensions);
  }

  return rawProfile;
}

function buildDimensionedTempleCenterProfile(rawProfile, dimensions) {
  const start = templeTipStartLength(dimensions);
  const end = dimensions.templeLength;
  const bendStart = clamp(CAD_SIDE_TEMPLE_PROFILES['wearer-left'].bendStartLengthMm, start, end);
  const templeCenterY = (length) => average(templeProfileBoundaryAtLength(length, dimensions).map((point) => point.y));
  const endY = templeCenterY(start) - dimensionedTempleTipEndDrop(dimensions);
  const preTipSamples = uniqueProfileLengths([0, start, dimensions.templeMetalLength, bendStart])
    .filter((length) => length >= 0 && length <= end)
    .map((length) => ({
      length,
      y: length < start ? interpolateProfile(rawProfile, length) : templeCenterY(length),
    }));
  const bendStartY = preTipSamples.at(-1)?.y ?? templeCenterY(bendStart);
  const curvedTipSamples = [0.2, 0.4, 0.65, 0.85, 1].map((ratio) => ({
    length: lerp(bendStart, end, ratio),
    y: lerp(bendStartY, endY, smoothStep(ratio)),
  }));

  return insertLengthSamples(preTipSamples, curvedTipSamples);
}

function snapTempleProfileLength(length, dimensions) {
  for (const dimensionStop of [0, dimensions.templeMetalLength, dimensions.templeLength]) {
    if (Math.abs(length - dimensionStop) < 0.05) {
      return dimensionStop;
    }
  }
  return length;
}

function interpolateCadSample(samples, targetLength) {
  const ordered = [...samples].sort((a, b) => a.length - b.length);
  if (targetLength <= ordered[0].length) {
    return { ...ordered[0], length: targetLength };
  }
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const next = ordered[index];
    if (targetLength <= next.length) {
      const ratio = (targetLength - previous.length) / (next.length - previous.length || 1);
      return {
        cadX: lerp(previous.cadX, next.cadX, ratio),
        cadY: lerp(previous.cadY, next.cadY, ratio),
        length: targetLength,
      };
    }
  }
  return { ...ordered.at(-1), length: targetLength };
}

function insertLengthSamples(samples, insertedSamples) {
  const merged = [...samples, ...insertedSamples].sort((a, b) => a.length - b.length);
  return merged.filter((item, index) => index === 0 || Math.abs(item.length - merged[index - 1].length) > 0.001);
}

function interpolateProfile(profile, targetLength) {
  if (targetLength <= profile[0].length) {
    return profile[0].y;
  }
  for (let index = 1; index < profile.length; index += 1) {
    const previous = profile[index - 1];
    const next = profile[index];
    if (targetLength <= next.length) {
      const ratio = (targetLength - previous.length) / (next.length - previous.length || 1);
      return lerp(previous.y, next.y, ratio);
    }
  }
  return profile.at(-1).y;
}

function stripLength(point) {
  return {
    x: point.x,
    y: point.y,
    z: point.z,
  };
}

function buildS19004PdfRimContourVertices(sideSign) {
  const wearerRightPdfLensContour = [
    [100.0, -0.3484], [100.0, 7.3171], [100.0, 14.9826], [99.3994, 22.6481],
    [97.5976, 30.3136], [95.1952, 37.2822], [92.1922, 44.2509], [88.5886, 50.5226],
    [84.985, 56.7944], [80.7808, 62.3693], [77.1772, 68.6411], [72.3724, 73.5192],
    [67.5676, 78.3972], [62.7628, 83.2753], [57.3574, 87.4564], [51.952, 90.2439],
    [45.3453, 92.3345], [39.3393, 93.7282], [33.9339, 95.122], [27.9279, 96.5157],
    [21.9219, 97.2125], [16.5165, 97.9094], [11.1111, 98.6063], [5.1051, 99.3031],
    [-0.3003, 99.3031], [-5.7057, 100.0], [-11.7117, 100.0], [-17.7177, 100.0],
    [-23.1231, 99.3031], [-29.1291, 99.3031], [-35.7357, 98.6063], [-41.7417, 97.9094],
    [-48.9489, 97.2125], [-55.5556, 95.8188], [-62.7628, 94.4251], [-69.97, 92.3345],
    [-77.7778, 89.547], [-83.7838, 84.669], [-89.1892, 79.0941], [-93.994, 72.1254],
    [-97.5976, 64.4599], [-99.3994, 56.0976], [-100.0, 47.7352], [-100.0, 38.676],
    [-99.3994, 30.3136], [-98.1982, 21.9512], [-96.997, 14.2857], [-95.1952, 6.6202],
    [-93.3934, -0.3484], [-91.5916, -7.3171], [-89.1892, -14.2857], [-87.3874, -20.5575],
    [-84.985, -26.8293], [-82.5826, -32.4042], [-79.5796, -38.676], [-76.5766, -44.2509],
    [-74.1742, -49.8258], [-71.1712, -55.4007], [-67.5676, -60.2787], [-64.5646, -65.1568],
    [-60.3604, -70.0348], [-56.1562, -74.216], [-51.952, -77.7003], [-47.1471, -81.1847],
    [-42.3423, -84.669], [-36.9369, -87.4564], [-32.1321, -90.2439], [-27.3273, -92.3345],
    [-21.9219, -94.4251], [-16.5165, -95.8188], [-11.1111, -97.2125], [-5.7057, -98.6063],
    [-0.3003, -99.3031], [5.1051, -100.0], [11.1111, -100.0], [16.5165, -100.0],
    [22.5225, -99.3031], [28.5285, -98.6063], [34.5345, -97.2125], [40.5405, -95.8188],
    [46.5465, -93.7282], [51.952, -91.6376], [57.958, -88.8502], [63.964, -85.3659],
    [69.97, -81.8815], [74.7748, -76.3066], [78.979, -71.4286], [82.5826, -65.1568],
    [86.1862, -58.1882], [89.1892, -51.2195], [91.5916, -44.2509], [93.994, -37.2822],
    [95.7958, -30.3136], [96.997, -22.6481], [98.1982, -15.6794], [99.3994, -8.0139],
  ];

  return wearerRightPdfLensContour.map(([x, y]) => [sideSign * x, y]);
}

function buildS19002PdfRimContourVertices(sideSign) {
  const wearerRightPdfLensContour = [
    [-82.0, 63.0], [-75.0, 68.0], [-64.0, 71.0], [-49.0, 72.0],
    [-34.0, 72.0], [-18.0, 71.6], [-2.0, 70.6], [14.0, 69.1],
    [30.0, 67.1], [46.0, 64.1], [61.0, 59.6], [75.0, 52.6],
    [86.0, 42.1], [94.0, 29.1], [98.4, 13.6], [100.0, -3.9],
    [99.3, -21.4], [95.6, -38.4], [88.0, -54.0], [76.5, -67.2],
    [61.0, -78.2], [42.5, -87.2], [21.0, -94.0], [-1.5, -98.1],
    [-24.0, -100.0], [-44.0, -97.5], [-58.5, -89.0], [-69.5, -74.5],
    [-78.5, -57.0], [-86.5, -38.5], [-94.0, -19.2], [-100.0, 2.5],
    [-96.2, 23.0], [-90.5, 44.0],
  ];

  return densifyMirroredContour(wearerRightPdfLensContour, sideSign, 2);
}

function densifyMirroredContour(contour, sideSign, subdivisions = 1) {
  const vertices = [];
  for (let index = 0; index < contour.length; index += 1) {
    const [x1, y1] = contour[index];
    const [x2, y2] = contour[(index + 1) % contour.length];
    for (let step = 0; step < subdivisions; step += 1) {
      const ratio = step / subdivisions;
      vertices.push([
        sideSign * lerp(x1, x2, ratio),
        lerp(y1, y2, ratio),
      ]);
    }
  }
  return vertices;
}

function sampleBulgedPolyline(vertices, bulges, closed, samplesPerSegment) {
  const points = [];
  const segmentCount = closed ? vertices.length : vertices.length - 1;

  for (let index = 0; index < segmentCount; index += 1) {
    const start = vertices[index];
    const end = vertices[(index + 1) % vertices.length];
    const bulge = bulges[index] ?? 0;

    if (index === 0) {
      points.push({ x: start[0], y: start[1], z: 0 });
    }

    if (Math.abs(bulge) < 1e-8) {
      points.push({ x: end[0], y: end[1], z: 0 });
      continue;
    }

    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const chord = Math.hypot(dx, dy);
    const offset = chord * (1 - bulge ** 2) / (4 * bulge);
    const midX = (start[0] + end[0]) / 2;
    const midY = (start[1] + end[1]) / 2;
    const normalX = -dy / chord;
    const normalY = dx / chord;
    const centerX = midX + normalX * offset;
    const centerY = midY + normalY * offset;
    const theta = 4 * Math.atan(bulge);
    const startAngle = Math.atan2(start[1] - centerY, start[0] - centerX);
    const radius = Math.hypot(start[0] - centerX, start[1] - centerY);

    for (let step = 1; step <= samplesPerSegment; step += 1) {
      const angle = startAngle + theta * (step / samplesPerSegment);
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        z: 0,
      });
    }
  }

  return points;
}

function normalizeCadPath(points, center, targetWidth, targetHeight) {
  const bounds = pointBounds(points);
  const sourceCenterX = (bounds.minX + bounds.maxX) / 2;
  const sourceCenterY = (bounds.minY + bounds.maxY) / 2;
  const scaleX = targetWidth / (bounds.maxX - bounds.minX);
  const scaleY = targetHeight / (bounds.maxY - bounds.minY);

  return points.map((point) => ({
    x: center.x + (point.x - sourceCenterX) * scaleX,
    y: center.y + (point.y - sourceCenterY) * scaleY,
    z: center.z,
  }));
}

function scalePath(path, center, scaleX, scaleY, z) {
  return path.map((point) => ({
    x: center.x + (point.x - center.x) * scaleX,
    y: center.y + (point.y - center.y) * scaleY,
    z,
  }));
}

function lerp(start, end, ratio) {
  return start + (end - start) * ratio;
}

function smoothStep(ratio) {
  return ratio * ratio * (3 - (2 * ratio));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function numericOr(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function roundTo(value, decimals) {
  const scale = 10 ** decimals;
  return Math.round(value * scale) / scale;
}

function pointBounds(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

export function componentById(model, id) {
  return model.components.find((component) => component.id === id);
}

export function curveLength(points) {
  return points.slice(1).reduce((total, point, index) => {
    const previous = points[index];
    return total + Math.hypot(point.x - previous.x, point.y - previous.y, point.z - previous.z);
  }, 0);
}
