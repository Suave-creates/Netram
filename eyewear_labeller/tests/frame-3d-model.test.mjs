import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  SUPPORTED_3D_MODEL_IDS,
  VC_S19000_DIMENSIONS,
  VC_S19003_DIMENSIONS,
  FRAME_3D_DIMENSIONS,
  buildConfiguredFrameModel,
  buildFrameModel,
  componentById,
  curveLength,
} from '../static/frame-3d-model.mjs';

function pathBounds(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function nearestNormalizedPoint(points, target) {
  const bounds = pathBounds(points);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  return points
    .map((point) => {
      const normalized = {
        x: ((point.x - centerX) / (bounds.width / 2)) * 100,
        y: ((point.y - centerY) / (bounds.height / 2)) * 100,
      };
      return {
        normalized,
        distance: Math.hypot(normalized.x - target.x, normalized.y - target.y),
      };
    })
    .sort((a, b) => a.distance - b.distance)[0];
}

function normalizedExtremes(points) {
  const bounds = pathBounds(points);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  return points.reduce((extremes, point) => {
    const normalized = {
      x: ((point.x - centerX) / (bounds.width / 2)) * 100,
      y: ((point.y - centerY) / (bounds.height / 2)) * 100,
    };
    const item = { point, normalized };
    return {
      minX: !extremes.minX || normalized.x < extremes.minX.normalized.x ? item : extremes.minX,
      maxX: !extremes.maxX || normalized.x > extremes.maxX.normalized.x ? item : extremes.maxX,
    };
  }, {});
}

function pointsAtLength(points, length) {
  return points
    .filter((point) => Math.abs(point.length - length) < 0.001)
    .sort((a, b) => b.y - a.y);
}

function pairedDistances(pointsA, pointsB) {
  return pointsA.map((point, index) => {
    const paired = pointsB[index];
    return Math.hypot(point.x - paired.x, point.y - paired.y, (point.z ?? 0) - (paired.z ?? 0));
  });
}

function pointDistance(pointA, pointB) {
  return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y, (pointA.z ?? 0) - (pointB.z ?? 0));
}

function profileHeightAtLength(points, length) {
  const boundary = pointsAtLength(points, length);
  assert.equal(boundary.length, 2);
  return Math.abs(boundary[0].y - boundary[1].y);
}

function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

test('3D model keeps wearer-right rim on viewer-left side of the front view', () => {
  const model = buildFrameModel();
  const rightRim = componentById(model, 'wearer-right-rim');
  const leftRim = componentById(model, 'wearer-left-rim');

  assert.equal(rightRim.side, 'wearer-right');
  assert.equal(leftRim.side, 'wearer-left');
  assert.equal(rightRim.center.x < leftRim.center.x, true);
});

test('VC S19000 builds as a dedicated 3D-supported frame from its corrected CAD/PDF cues', () => {
  const model = buildFrameModel('VC S19000');
  const bridge = componentById(model, 'nose-bridge');
  const temple = componentById(model, 'wearer-left-temple');
  const tip = componentById(model, 'wearer-left-temple-tip');

  assert.ok(SUPPORTED_3D_MODEL_IDS.includes('VC S19000'));
  assert.equal(model.modelId, 'VC S19000');
  assert.equal(model.dimensions, VC_S19000_DIMENSIONS);
  assert.equal(model.dimensions.noseBridgeSource, 'VC S5158');
  assert.equal(model.dimensions.templeSource, 'T4');
  assert.equal(model.dimensions.endPieceSource, 'T4');
  assert.equal(model.dimensions.templeTipSource, 'TT1');
  assert.equal(model.dimensions.topViewDepth, 150);
  assert.equal(model.dimensions.templeTipAngleDeg, 35);
  assert.equal(tip.bendRadius, 30);
  assert.equal(tip.angleDeg, 35);
  assert.equal(bridge.source.detail, 'VC S5158');
  assert.equal(temple.source.topView.sourceDepthMm, 150);
  assert.equal(tip.source.sideView.tipSource, 'TT1');
});

test('all labelled frame documents build 3D models from their PDF dimension cues', () => {
  const expected = {
    'VC S19000': { lensWidth: 60, lensHeight: 53, bridgeWidth: 14, frontWidth: 144, templeLength: 150, noseBridgeSource: 'VC S5158', templeSource: 'T4', templeTipSource: 'TT1', hasBrowbar: true, hasWireCore: false },
    'VC S19001': { lensWidth: 60, lensHeight: 52, bridgeWidth: 14, frontWidth: 141, templeLength: 150, noseBridgeSource: 'VC S5158', templeSource: 'T1', templeTipSource: 'TT4', hasBrowbar: true, hasWireCore: false },
    'VC S19002': { lensWidth: 59, lensHeight: 46.8, bridgeWidth: 11, frontWidth: 139, templeLength: 145, noseBridgeSource: 'VC S13110', templeSource: 'T2', templeTipSource: 'TT1', hasBrowbar: false, hasWireCore: true },
    'VC S19003': { lensWidth: 58, lensHeight: 42.4, bridgeWidth: 15.6, frontWidth: 140, templeLength: 145, noseBridgeSource: 'VC S13110', templeSource: 'T5-VC E14506', templeTipSource: 'TT3', hasBrowbar: true, hasWireCore: false },
    'VC S19004': { lensWidth: 57, lensHeight: 48.7, bridgeWidth: 16, frontWidth: 141.6, templeLength: 145, noseBridgeSource: 'VC S13110', templeSource: 'T2', templeTipSource: 'TT1', hasBrowbar: false, hasWireCore: true },
    'VC S19005': { lensWidth: 59, lensHeight: 52.1, bridgeWidth: 15, frontWidth: 143, templeLength: 150, noseBridgeSource: 'VC S5158', templeSource: 'T4', templeTipSource: 'TT1', hasBrowbar: true, hasWireCore: false },
  };

  assert.deepEqual(SUPPORTED_3D_MODEL_IDS, Object.keys(expected));

  for (const [modelId, cue] of Object.entries(expected)) {
    const model = buildFrameModel(modelId);
    const dimensions = FRAME_3D_DIMENSIONS[modelId];
    const components = new Set(model.components.map((component) => component.component));
    const rightRim = componentById(model, 'wearer-right-rim');
    const leftRim = componentById(model, 'wearer-left-rim');
    const bridge = componentById(model, 'nose-bridge');
    const temple = componentById(model, 'wearer-left-temple');
    const tip = componentById(model, 'wearer-left-temple-tip');

    assert.equal(model.modelId, modelId);
    assert.equal(dimensions.lensWidth, cue.lensWidth);
    assert.equal(dimensions.lensHeight, cue.lensHeight);
    assert.equal(dimensions.bridgeWidth, cue.bridgeWidth);
    assert.equal(dimensions.frontWidth, cue.frontWidth);
    assert.equal(dimensions.templeLength, cue.templeLength);
    assert.equal(dimensions.noseBridgeSource, cue.noseBridgeSource);
    assert.equal(dimensions.templeSource, cue.templeSource);
    assert.equal(dimensions.templeTipSource, cue.templeTipSource);
    assert.equal(components.has('browbar'), cue.hasBrowbar);
    assert.equal(components.has('wire_core'), cue.hasWireCore);
    assert.ok(rightRim.path.length > 60);
    assert.ok(leftRim.path.length > 60);
    assert.equal(rightRim.center.x < leftRim.center.x, true);
    assert.equal(bridge.source.detail, cue.noseBridgeSource);
    assert.equal(temple.source.topView.sourceDepthMm, dimensions.topViewDepth);
    assert.equal(tip.source.sideView.tipSource, cue.templeTipSource);
  }
});

test('VC S19004 3D front bars follow corrected label memory instead of stale model defaults', () => {
  const labelMemory = {
    labels: [
      {
        id: 'right-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 275.35135088915877, y: 99.25981044389937 },
          { x: 620.8812438638195, y: 402.8243543222101 },
        ],
      },
      {
        id: 'left-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 705.3682034805977, y: 101.05583329770332 },
          { x: 1052.7038709185551, y: 404.2279943971902 },
        ],
      },
      {
        id: 'corrected-upper-browbar',
        component: 'browbar',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 457.5210164748825, y: 102.21088962837847 },
          { x: 866.4901367738152, y: 117.88212656218138 },
        ],
      },
    ],
    groups: [],
  };

  const model = buildFrameModel('VC S19004', { labelMemory });
  const components = new Set(model.components.map((component) => component.component));
  const browbar = componentById(model, 'browbar-top-rail');
  const browbarBounds = pathBounds(browbar.points);

  assert.equal(components.has('browbar'), true);
  assert.equal(components.has('wire_core'), false);
  assert.equal(browbar.source.type, 'LABEL_MEMORY');
  assert.ok(Math.abs(browbarBounds.width - 67.3) < 0.8);
  assert.ok(browbarBounds.minY > 20);
  assert.ok(browbar.tubeRadius > 0.45);
});

test('VC S19004 corrected browbar labels replace the default wire-core front bar', () => {
  const labelMemory = {
    labels: [
      {
        id: 'right-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 275.35135088915877, y: 99.25981044389937 },
          { x: 620.8812438638195, y: 402.8243543222101 },
        ],
      },
      {
        id: 'left-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 705.3682034805977, y: 101.05583329770332 },
          { x: 1052.7038709185551, y: 404.2279943971902 },
        ],
      },
      {
        id: 'lower-detail-browbar-reference',
        component: 'browbar',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 458.0338408771404, y: 1452.7801529328008 },
          { x: 868.8748006661762, y: 1478.8145657859889 },
        ],
      },
      {
        id: 'upper-front-browbar',
        component: 'browbar',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 457.5210164748825, y: 102.21088962837847 },
          { x: 866.4901367738152, y: 117.88212656218138 },
        ],
      },
      {
        id: 'old-front-bar-default',
        component: 'wire_core',
        type: 'rect',
        view: 'front-detail',
        points: [
          { x: 1275, y: 1195 },
          { x: 2230, y: 1272 },
        ],
      },
    ],
    groups: [],
  };

  const model = buildFrameModel('VC S19004', { labelMemory });
  const frontBars = model.components.filter((component) => ['browbar', 'wire_core'].includes(component.component));

  assert.equal(frontBars.length, 1);
  assert.equal(frontBars[0].component, 'browbar');
  assert.equal(frontBars[0].source.type, 'LABEL_MEMORY');
  assert.equal(frontBars[0].source.labelId, 'upper-front-browbar');
});

test('VC S19004 labelled browbar follows the PDF top-view base curve', () => {
  const labelMemory = {
    labels: [
      {
        id: 'right-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 275.35135088915877, y: 99.25981044389937 },
          { x: 620.8812438638195, y: 402.8243543222101 },
        ],
      },
      {
        id: 'left-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 705.3682034805977, y: 101.05583329770332 },
          { x: 1052.7038709185551, y: 404.2279943971902 },
        ],
      },
      {
        id: 'upper-front-browbar',
        component: 'browbar',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 457.5210164748825, y: 102.21088962837847 },
          { x: 866.4901367738152, y: 117.88212656218138 },
        ],
      },
    ],
    groups: [],
  };

  const model = buildFrameModel('VC S19004', { labelMemory });
  const browbar = componentById(model, 'browbar-top-rail');
  const centerPoint = browbar.points.find((point) => Math.abs(point.x) < 0.001);
  const edgeDepths = [browbar.points[0].z, browbar.points.at(-1).z];

  assert.equal(browbar.source.topView.view, 'top');
  assert.equal(browbar.source.topView.baseCurveMm, 4);
  assert.ok(browbar.points.length >= 5);
  assert.ok(centerPoint.z > Math.max(...edgeDepths));
  assert.ok(Math.abs(centerPoint.z - 4) < 0.35);
  assert.ok(edgeDepths.every((depth) => depth > 2.8 && depth < 3.4));
});

test('non-19004 label memory keeps CAD/PDF front-bar defaults', () => {
  const labelMemory = {
    labels: [
      {
        id: 'right-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 275.35135088915877, y: 99.25981044389937 },
          { x: 620.8812438638195, y: 402.8243543222101 },
        ],
      },
      {
        id: 'left-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 705.3682034805977, y: 101.05583329770332 },
          { x: 1052.7038709185551, y: 404.2279943971902 },
        ],
      },
      {
        id: 'upper-front-browbar',
        component: 'browbar',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 457.5210164748825, y: 102.21088962837847 },
          { x: 866.4901367738152, y: 117.88212656218138 },
        ],
      },
      {
        id: 'labelled-wire-core',
        component: 'wire_core',
        type: 'rect',
        view: 'front-detail',
        points: [
          { x: 1275, y: 1195 },
          { x: 2230, y: 1272 },
        ],
      },
    ],
    groups: [],
  };

  const model = buildFrameModel('VC S19002', { labelMemory });
  const frontBars = model.components.filter((component) => ['browbar', 'wire_core'].includes(component.component));
  const components = frontBars.map((component) => component.component).sort();

  assert.deepEqual(components, ['wire_core']);
});

test('VC S19003 label memory does not replace the source-of-truth CAD browbar', () => {
  const labelMemory = {
    labels: [
      {
        id: 'right-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 275, y: 120 },
          { x: 695, y: 410 },
        ],
      },
      {
        id: 'left-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 755, y: 118 },
          { x: 1185, y: 412 },
        ],
      },
      {
        id: 'user-browbar-that-must-not-drive-19003',
        component: 'browbar',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 447.17541215535124, y: 123.15648118618839 },
          { x: 989.9710963506029, y: 154.5049311504676 },
        ],
      },
    ],
    groups: [],
  };

  const model = buildFrameModel('VC S19003', { labelMemory });
  const browbar = componentById(model, 'browbar-top-rail');
  const bounds = pathBounds(browbar.points);

  assert.equal(browbar.source.entityId, 13437);
  assert.equal(browbar.source.type, undefined);
  assert.ok(Math.abs(bounds.width - VC_S19003_DIMENSIONS.browbarLength) < 0.25);
});

test('VC S19004 front rims use the corrected PDF lens contour instead of VC S19003 CAD rims', () => {
  const labelMemory = {
    labels: [
      {
        id: 'label-front-main-right-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 275.35135088915877, y: 99.25981044389937 },
          { x: 620.8812438638195, y: 402.8243543222101 },
        ],
      },
      {
        id: 'label-front-main-left-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-main',
        points: [
          { x: 705.3682034805977, y: 101.05583329770332 },
          { x: 1052.7038709185551, y: 404.2279943971902 },
        ],
      },
      {
        id: 'label-front-detail-right-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-detail',
        points: [
          { x: 1538.4937906772261, y: 1153.1202081619842 },
          { x: 1879.6621851093144, y: 1474.166579749774 },
        ],
      },
      {
        id: 'label-front-detail-left-rim',
        component: 'rim',
        type: 'rect',
        view: 'front-detail',
        points: [
          { x: 1966.3080996811952, y: 1162.330641675769 },
          { x: 2319.2984887337802, y: 1466.0272519958605 },
        ],
      },
    ],
    groups: [],
  };

  const model = buildFrameModel('VC S19004', { labelMemory });
  const rightRim = componentById(model, 'wearer-right-rim');
  const leftRim = componentById(model, 'wearer-left-rim');
  const rightBounds = pathBounds(rightRim.path);

  assert.equal(rightRim.source.type, 'PDF_LENS_CONTOUR');
  assert.equal(rightRim.source.view, 'lens-detail');
  assert.equal(leftRim.source.type, 'PDF_LENS_CONTOUR');
  assert.notEqual(rightRim.source.entityId, 2570);
  assert.ok(rightRim.path.length > 40);
  assert.ok(Math.abs(rightBounds.width - FRAME_3D_DIMENSIONS['VC S19004'].lensWidth) < 0.2);
  assert.ok(Math.abs(rightBounds.height - FRAME_3D_DIMENSIONS['VC S19004'].lensHeight) < 0.2);
});

test('VC S19004 PDF lens contour is mirrored onto the correct wearer side', () => {
  const model = buildFrameModel('VC S19004');
  const rightRim = componentById(model, 'wearer-right-rim');
  const leftRim = componentById(model, 'wearer-left-rim');
  const rightExtremes = normalizedExtremes(rightRim.path);
  const leftExtremes = normalizedExtremes(leftRim.path);

  assert.equal(rightRim.center.x < leftRim.center.x, true);
  assert.equal(rightRim.source.type, 'PDF_LENS_CONTOUR');
  assert.equal(leftRim.source.type, 'PDF_LENS_CONTOUR');
  assert.ok(rightExtremes.maxX.normalized.y > 35);
  assert.ok(rightExtremes.minX.normalized.y < 10);
  assert.ok(leftExtremes.minX.normalized.y > 35);
  assert.ok(leftExtremes.maxX.normalized.y < 10);
});

test('VC S19004 rim contour follows the traced PDF lens profile, not a generic R3 superellipse', () => {
  const model = buildFrameModel('VC S19004');
  const rightRim = componentById(model, 'wearer-right-rim');

  const upperShoulder = nearestNormalizedPoint(rightRim.path, { x: -51.95, y: 90.24 });
  const lowerInnerCurve = nearestNormalizedPoint(rightRim.path, { x: 64.56, y: -65.16 });

  assert.ok(upperShoulder.distance < 3);
  assert.ok(lowerInnerCurve.distance < 3);
});

test('VC S19002 front rims use the traced PDF lens contour instead of VC S19003 CAD rims', () => {
  const model = buildFrameModel('VC S19002');
  const rightRim = componentById(model, 'wearer-right-rim');
  const leftRim = componentById(model, 'wearer-left-rim');
  const rightBounds = pathBounds(rightRim.path);

  assert.equal(rightRim.source.type, 'PDF_LENS_CONTOUR');
  assert.equal(leftRim.source.type, 'PDF_LENS_CONTOUR');
  assert.equal(rightRim.source.view, 'lens-detail');
  assert.equal(rightRim.source.detail.includes('VC S19002 PDF Lens profile'), true);
  assert.notEqual(rightRim.source.entityId, 2570);
  assert.ok(Math.abs(rightBounds.width - FRAME_3D_DIMENSIONS['VC S19002'].lensWidth) < 0.2);
  assert.ok(Math.abs(rightBounds.height - FRAME_3D_DIMENSIONS['VC S19002'].lensHeight) < 0.2);
});

test('VC S19002 PDF lens contour is mirrored onto the correct wearer side', () => {
  const model = buildFrameModel('VC S19002');
  const rightRim = componentById(model, 'wearer-right-rim');
  const leftRim = componentById(model, 'wearer-left-rim');
  const rightExtremes = normalizedExtremes(rightRim.path);
  const leftExtremes = normalizedExtremes(leftRim.path);

  assert.equal(rightRim.center.x < leftRim.center.x, true);
  assert.equal(rightRim.source.type, 'PDF_LENS_CONTOUR');
  assert.equal(leftRim.source.type, 'PDF_LENS_CONTOUR');
  assert.ok(rightExtremes.minX.normalized.y < 14);
  assert.ok(rightExtremes.maxX.normalized.y > 17);
  assert.ok(leftExtremes.minX.normalized.y > 17);
  assert.ok(leftExtremes.maxX.normalized.y < 14);
});

test('labeller entrypoint cache-busts the live child-part 3D renderer update', () => {
  const htmlSource = readFileSync(new URL('../static/index.html', import.meta.url), 'utf8');
  const appSource = readFileSync(new URL('../static/app.js', import.meta.url), 'utf8');
  const matcherSource = readFileSync(new URL('../static/matcher.js', import.meta.url), 'utf8');
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');

  assert.equal(htmlSource.includes('/static/app.js?v=20260620-solidtip1'), true);
  assert.equal(appSource.includes('frame-3d-viewer.mjs?v=20260620-solidtip1'), true);
  assert.equal(matcherSource.includes('frame-3d-viewer.mjs?v=20260620-solidtip1'), true);
  assert.equal(viewerSource.includes('frame-3d-model.mjs?v=20260620-solidtip1'), true);
});

test('nose bridge connects the inner tips of both rims using the DBL cue', () => {
  const model = buildFrameModel();
  const bridge = componentById(model, 'nose-bridge');
  const halfBridge = VC_S19003_DIMENSIONS.bridgeWidth / 2;

  assert.equal(bridge.component, 'nose_bridge');
  assert.ok(bridge.points[0].x <= -halfBridge);
  assert.ok(bridge.points.at(-1).x >= halfBridge);
  assert.deepEqual(bridge.attachment, ['wearer-right-rim.inner', 'wearer-left-rim.inner']);
});

test('front rims use source CAD polylines with PDF A/B dimensions', () => {
  const model = buildFrameModel();
  const rightRim = componentById(model, 'wearer-right-rim');
  const leftRim = componentById(model, 'wearer-left-rim');

  assert.equal(rightRim.source.entityId, 2570);
  assert.equal(leftRim.source.entityId, 2565);
  assert.ok(rightRim.path.length > 80);
  assert.ok(leftRim.path.length > 80);

  const rightBounds = pathBounds(rightRim.path);
  assert.ok(Math.abs(rightBounds.width - VC_S19003_DIMENSIONS.lensWidth) < 0.2);
  assert.ok(Math.abs(rightBounds.height - VC_S19003_DIMENSIONS.lensHeight) < 0.2);
});

test('CAD rim path preserves the flatter roof and deeper lower curve from the front view', () => {
  const model = buildFrameModel();
  const rightRim = componentById(model, 'wearer-right-rim');
  const bounds = pathBounds(rightRim.path);
  const topBand = rightRim.path.filter((point) => point.y > bounds.maxY - bounds.height * 0.1);
  const lowerBand = rightRim.path.filter((point) => point.y < bounds.minY + bounds.height * 0.18);
  const topSpan = Math.max(...topBand.map((point) => point.x)) - Math.min(...topBand.map((point) => point.x));
  const lowerSpan = Math.max(...lowerBand.map((point) => point.x)) - Math.min(...lowerBand.map((point) => point.x));

  assert.ok(topSpan > VC_S19003_DIMENSIONS.lensWidth * 0.48);
  assert.ok(lowerSpan > VC_S19003_DIMENSIONS.lensWidth * 0.55);
  assert.notEqual(Math.round(topSpan * 10), Math.round(lowerSpan * 10));
});

test('nose bridge uses the CAD VC S13110 shallow bridge path', () => {
  const model = buildFrameModel();
  const bridge = componentById(model, 'nose-bridge');
  const bounds = pathBounds(bridge.points);

  assert.equal(bridge.source.view, 'front-main');
  assert.deepEqual(bridge.source.entityIds, [13419, 13420, 13421, 13422, 13423, 13424, 13427, 13428, 13429, 13430]);
  assert.ok(Math.abs(bounds.width - VC_S19003_DIMENSIONS.noseBridgeDetailWidth) < 0.25);
  assert.ok(bounds.height < 3);
  assert.ok(bounds.minY > VC_S19003_DIMENSIONS.lensHeight * 0.25);
});

test('nose bridge child-part override rebuilds the 3D bridge source and width', () => {
  const model = buildFrameModel({
    ...VC_S19003_DIMENSIONS,
    noseBridgeSource: 'BWF 2520 NB',
    noseBridgeDetailWidth: 20,
    configuredParts: {
      nose_bridge: {
        id: 'nose_bridge--main--bwf-2520-nb',
        name: 'BWF 2520 NB',
      },
    },
  });
  const bridge = componentById(model, 'nose-bridge');
  const bounds = pathBounds(bridge.points);

  assert.equal(model.dimensions.configuredParts.nose_bridge.id, 'nose_bridge--main--bwf-2520-nb');
  assert.equal(bridge.source.detail, 'BWF 2520 NB');
  assert.ok(Math.abs(bounds.width - 20) < 0.25);
});

test('configured nose bridge uses the selected child-part PDF centerline geometry', () => {
  const model = buildConfiguredFrameModel('VC S19003', {
    nose_bridge: {
      id: 'nose_bridge--ss-26--vc-s13112-nb',
      name: 'VC S13112 NB',
      configurator: {
        fit: {
          bridgeDetailWidthMm: 23.32,
          profileDepthMm: 2.14,
          source: 'PDF text',
          centerline2dMm: [
            [-11.66, 0],
            [-7.0, 1.05],
            [-3.2, 1.8],
            [0, 2.14],
            [3.2, 1.8],
            [7.0, 1.05],
            [11.66, 0],
          ],
        },
      },
    },
  });
  const bridge = componentById(model, 'nose-bridge');
  const bounds = pathBounds(bridge.points);
  const centerPoint = bridge.points[Math.floor(bridge.points.length / 2)];

  assert.equal(model.dimensions.noseBridgeSource, 'VC S13112 NB');
  assert.equal(bridge.source.geometrySource, 'selected_child_part_pdf');
  assert.equal(bridge.points.length, 7);
  assert.ok(Math.abs(bounds.width - 23.32) < 0.01);
  assert.ok(centerPoint.y > bridge.points[0].y + 2);
});

test('configured temple and acetate tip parts rebuild the 3D side assembly', () => {
  const model = buildConfiguredFrameModel('VC S19003', {
    temple: {
      id: 'temple--main--vc-e11891-temple',
      name: 'VC E11891 Temple',
      configurator: {
        fit: {
          templeLengthMm: 132.7,
          frontHeightMm: 5.8,
          midHeightMm: 3.1,
          rearHeightMm: 1.3,
          source: 'VC E11891 Temple PDF/DWG',
          confidence: 'drawing_cue',
        },
      },
    },
    temple_tip: {
      id: 'temple_tip--ss26-bend-tips--tt2-bend',
      name: 'TT2-Bend',
      configurator: {
        fit: {
          tipLengthMm: 70,
          bendRadiusMm: 25.839,
          tipAngleDeg: 83,
          source: 'TT2-Bend DWG',
          confidence: 'drawing_cue',
        },
      },
    },
  });
  const temple = componentById(model, 'wearer-left-temple');
  const tip = componentById(model, 'wearer-left-temple-tip');

  assert.equal(model.dimensions.configuredParts.temple.id, 'temple--main--vc-e11891-temple');
  assert.equal(model.dimensions.configuredParts.temple_tip.id, 'temple_tip--ss26-bend-tips--tt2-bend');
  assert.equal(model.dimensions.templeSource, 'VC E11891 Temple');
  assert.equal(model.dimensions.templeTipSource, 'TT2-Bend');
  assert.equal(model.dimensions.templeLength, 132.7);
  assert.equal(tip.angleDeg, 83);
  assert.equal(tip.bendRadius, 25.839);
  assert.equal(tip.source.sideView.tipSource, 'TT2-Bend');
  assert.equal(tip.points.at(-1).z, -132.7);
  assert.notEqual(tip.source.sideView.tipAngleDeg, VC_S19003_DIMENSIONS.templeTipAngleDeg);
  assert.ok(Math.abs(temple.sideOutlines[0].source.heightMm - 5.8) < 0.01);
});

test('VC S19004 TT1 side view uses the visible overlap and end-height cues from the PDF', () => {
  const model = buildConfiguredFrameModel('VC S19004', {
    temple: {
      id: 'temple--ss-26--t2',
      name: 'T2',
      configurator: {
        fit: {
          templeLengthMm: 145,
          source: 'T2 PDF text',
          confidence: 'drawing_cue',
        },
      },
    },
    temple_tip: {
      id: 'temple_tip--ss26-bend-tips--tt1-bend',
      name: 'TT1-Bend',
      configurator: {
        fit: {
          tipLengthMm: 75,
          visibleLengthMm: 79.5,
          sleeveOverlapMm: 4.5,
          sleeveHeightMm: 1.5,
          endHeightMm: 10.4,
          bendRadiusMm: 30,
          tipAngleDeg: 35,
          source: 'TT1-Bend DWG/PDF cue',
          confidence: 'drawing_cue',
        },
      },
    },
  });
  const expectedTipStart = model.dimensions.templeLength - 79.5;

  assert.equal(model.dimensions.templeTipVisibleLength, 79.5);
  assert.ok(Math.abs(model.dimensions.templeTipStartLength - expectedTipStart) < 0.01);
  assert.ok(Math.abs(model.dimensions.templeMetalLength - model.dimensions.templeTipStartLength - 4.5) < 0.01);

  for (const side of ['wearer-right', 'wearer-left']) {
    const temple = componentById(model, `${side}-temple`);
    const tip = componentById(model, `${side}-temple-tip`);
    const templeOutline = temple.sideOutlines.find((outline) => outline.component === 'temple');
    const tipOutline = tip.sideOutlines.find((outline) => outline.component === 'temple_tip');
    const tipStart = pointsAtLength(tipOutline.points, model.dimensions.templeTipStartLength);
    const templeJoin = pointsAtLength(templeOutline.points, model.dimensions.templeMetalLength);
    const tipJoin = pointsAtLength(tipOutline.points, model.dimensions.templeMetalLength);
    const tipEnd = pointsAtLength(tipOutline.points, model.dimensions.templeLength);

    assert.equal(tipStart.length, 2);
    assert.equal(templeJoin.length, 2);
    assert.equal(tipJoin.length, 2);
    assert.equal(tipEnd.length, 2);
    assert.ok(pairedDistances(templeJoin, tipJoin).every((distance) => distance < 0.35));
    assert.ok(tipStart[0].y - tipEnd[0].y > 13);
    assert.ok(Math.abs(profileHeightAtLength(tipOutline.points, model.dimensions.templeLength) - 10.4) < 0.2);
  }
});

test('VC S19004 keeps its frame-specific 79.5 mm TT1 overlap when the selected TT1 part is generic', () => {
  const model = buildConfiguredFrameModel('VC S19004', {
    temple: {
      id: 'temple--ss-26--t2',
      name: 'T2',
      configurator: {
        fit: {
          templeLengthMm: 145,
          source: 'T2 PDF text',
          confidence: 'drawing_cue',
        },
      },
    },
    temple_tip: {
      id: 'temple_tip--ss26-bend-tips--tt1-bend',
      name: 'TT1-Bend',
      configurator: {
        fit: {
          tipLengthMm: 75,
          bendRadiusMm: 30,
          tipAngleDeg: 35,
          source: 'TT1-Bend DWG/PDF cue',
          confidence: 'drawing_cue',
        },
      },
    },
  });

  assert.equal(model.dimensions.templeLength, 145);
  assert.equal(model.dimensions.templeTipVisibleLength, 79.5);
  assert.equal(model.dimensions.templeTipSleeveOverlap, 4.5);
  assert.ok(Math.abs(model.dimensions.templeMetalLength - 70) < 0.01);
  assert.ok(Math.abs(model.dimensions.templeTipStartLength - 65.5) < 0.01);
});

test('dimensioned temple tips use only the solid arched PDF tip and keep the rear end-height as local thickness', () => {
  const defaultTempleParts = {
    'VC S19000': {
      temple: { id: 'temple--ss-26--t4', name: 'T4', configurator: { fit: { templeLengthMm: 145 } } },
      temple_tip: { id: 'temple_tip--ss26-bend-tips--tt1-bend', name: 'TT1-Bend', configurator: { fit: { tipLengthMm: 75, bendRadiusMm: 30, tipAngleDeg: 35 } } },
      templeLength: 150,
      metalLength: 75,
      visibleLength: 75,
      endHeight: 10.1,
    },
    'VC S19001': {
      temple: { id: 'temple--ss-26--t1', name: 'T1', configurator: { fit: { templeLengthMm: 147.6 } } },
      temple_tip: { id: 'temple_tip--ss26-bend-tips--tt4-bend', name: 'TT4-Bend', configurator: { fit: { tipLengthMm: 75, bendRadiusMm: 30, tipAngleDeg: 35 } } },
      templeLength: 150,
      metalLength: 75,
      visibleLength: 75,
      endHeight: 10.1,
    },
    'VC S19002': {
      temple: { id: 'temple--ss-26--t2', name: 'T2', configurator: { fit: { templeLengthMm: 145 } } },
      temple_tip: { id: 'temple_tip--ss26-bend-tips--tt1-bend', name: 'TT1-Bend', configurator: { fit: { tipLengthMm: 75, bendRadiusMm: 30, tipAngleDeg: 35 } } },
      templeLength: 145,
      metalLength: 70,
      visibleLength: 75,
      endHeight: 10.4,
    },
    'VC S19004': {
      temple: { id: 'temple--ss-26--t2', name: 'T2', configurator: { fit: { templeLengthMm: 145 } } },
      temple_tip: { id: 'temple_tip--ss26-bend-tips--tt1-bend', name: 'TT1-Bend', configurator: { fit: { tipLengthMm: 75, bendRadiusMm: 30, tipAngleDeg: 35 } } },
      templeLength: 145,
      metalLength: 70,
      visibleLength: 79.5,
      endHeight: 10.4,
    },
    'VC S19005': {
      temple: { id: 'temple--ss-26--t4', name: 'T4', configurator: { fit: { templeLengthMm: 145 } } },
      temple_tip: { id: 'temple_tip--ss26-bend-tips--tt1-bend', name: 'TT1-Bend', configurator: { fit: { tipLengthMm: 75, bendRadiusMm: 30, tipAngleDeg: 35 } } },
      templeLength: 150,
      metalLength: 75,
      visibleLength: 75,
      endHeight: 10.1,
    },
  };

  for (const [modelId, cue] of Object.entries(defaultTempleParts)) {
    const model = buildConfiguredFrameModel(modelId, cue);
    const tip = componentById(model, 'wearer-left-temple-tip');
    const tipOutline = tip.sideOutlines.find((outline) => outline.component === 'temple_tip');
    const centerlineDrop = tip.points[0].y - tip.points.at(-1).y;
    const startTop = pointsAtLength(tipOutline.points, model.dimensions.templeTipStartLength)[0];
    const endTop = pointsAtLength(tipOutline.points, cue.templeLength)[0];

    assert.equal(model.dimensions.templeLength, cue.templeLength);
    assert.equal(model.dimensions.templeMetalLength, cue.metalLength);
    assert.equal(model.dimensions.templeTipVisibleLength, cue.visibleLength);
    assert.equal(model.dimensions.templeTipAngleDeg, 35);
    assert.equal(tip.angleDeg, 35);
    assert.equal(tip.source.sideView.visibleGeometryRule, 'arched_curved_tip_only');
    assert.equal(tip.source.sideView.excludedGeometry, 'straight_dashed_construction_tip');
    assert.equal(tipOutline.source.visibleGeometryRule, 'arched_curved_tip_only');
    assert.equal(tipOutline.source.excludedGeometry, 'straight_dashed_construction_tip');
    assert.ok(Math.abs(profileHeightAtLength(tipOutline.points, cue.templeLength) - cue.endHeight) < 0.25);
    assert.ok(centerlineDrop > 18);
    assert.ok(centerlineDrop < 26);
    assert.ok(startTop.y - endTop.y > 13);
  }
});

test('default TT1 and TT4 frame models bend the solid temple tip instead of using the straight construction line', () => {
  const expected = {
    'VC S19000': { templeLength: 150, metalLength: 75, tipStartLength: 75, endHeight: 10.1 },
    'VC S19001': { templeLength: 150, metalLength: 75, tipStartLength: 75, endHeight: 10.1 },
    'VC S19002': { templeLength: 145, metalLength: 70, tipStartLength: 70, endHeight: 10.4 },
    'VC S19004': { templeLength: 145, metalLength: 70, tipStartLength: 65.5, endHeight: 10.4 },
    'VC S19005': { templeLength: 150, metalLength: 75, tipStartLength: 75, endHeight: 10.1 },
  };

  for (const [modelId, cue] of Object.entries(expected)) {
    const model = buildFrameModel(modelId);
    const temple = componentById(model, 'wearer-left-temple');
    const tip = componentById(model, 'wearer-left-temple-tip');
    const tipOutline = tip.sideOutlines.find((outline) => outline.component === 'temple_tip');
    const startTop = pointsAtLength(tipOutline.points, cue.tipStartLength)[0];
    const endTop = pointsAtLength(tipOutline.points, cue.templeLength)[0];
    const centerlineDrop = tip.points[0].y - tip.points.at(-1).y;

    assert.equal(model.dimensions.templeLength, cue.templeLength);
    assert.equal(model.dimensions.templeMetalLength, cue.metalLength);
    assert.equal(model.dimensions.templeTipStartLength ?? model.dimensions.templeMetalLength, cue.tipStartLength);
    assert.equal(tip.source.sideView.visibleGeometryRule, 'arched_curved_tip_only');
    assert.equal(tip.source.sideView.excludedGeometry, 'straight_dashed_construction_tip');
    assert.equal(tipOutline.source.visibleGeometryRule, 'arched_curved_tip_only');
    assert.equal(tipOutline.source.excludedGeometry, 'straight_dashed_construction_tip');
    assert.equal(pointsAtLength(tipOutline.points, cue.templeLength).length, 2);
    assert.equal(tip.points.at(-1).z, -cue.templeLength);
    assert.ok(Math.abs(profileHeightAtLength(tipOutline.points, cue.templeLength) - cue.endHeight) < 0.25);
    assert.ok(centerlineDrop > 18);
    assert.ok(centerlineDrop < 26);
    assert.ok(startTop.y - endTop.y > 13);
    assert.ok(temple.points.at(-1).z <= -cue.metalLength + 0.001);
  }
});

test('model-default temple parts preserve each frame PDF side-view temple length', () => {
  const defaultTempleParts = {
    'VC S19000': {
      temple: { id: 'temple--ss-26--t4', name: 'T4', configurator: { fit: { templeLengthMm: 145 } } },
      temple_tip: { id: 'temple_tip--ss26-bend-tips--tt1-bend', name: 'TT1-Bend', configurator: { fit: { tipLengthMm: 75, bendRadiusMm: 30, tipAngleDeg: 35 } } },
    },
    'VC S19001': {
      temple: { id: 'temple--ss-26--t1', name: 'T1', configurator: { fit: { templeLengthMm: 147.6 } } },
      temple_tip: { id: 'temple_tip--ss26-bend-tips--tt4-bend', name: 'TT4-Bend', configurator: { fit: { tipLengthMm: 75, bendRadiusMm: 30, tipAngleDeg: 83 } } },
    },
    'VC S19002': {
      temple: { id: 'temple--ss-26--t2', name: 'T2', configurator: { fit: { templeLengthMm: 145 } } },
      temple_tip: { id: 'temple_tip--ss26-bend-tips--tt1-bend', name: 'TT1-Bend', configurator: { fit: { tipLengthMm: 75, bendRadiusMm: 30, tipAngleDeg: 35 } } },
    },
    'VC S19003': {
      temple: { id: 'temple--ss-26--t5', name: 'T5', configurator: { fit: { templeLengthMm: 136.1 } } },
      temple_tip: { id: 'temple_tip--ss26-bend-tips--tt3-bend', name: 'TT3-Bend', configurator: { fit: { tipLengthMm: 70, bendRadiusMm: 30, tipAngleDeg: 42 } } },
    },
    'VC S19004': {
      temple: { id: 'temple--ss-26--t2', name: 'T2', configurator: { fit: { templeLengthMm: 145 } } },
      temple_tip: { id: 'temple_tip--ss26-bend-tips--tt1-bend', name: 'TT1-Bend', configurator: { fit: { tipLengthMm: 75, bendRadiusMm: 30, tipAngleDeg: 35 } } },
    },
    'VC S19005': {
      temple: { id: 'temple--ss-26--t4', name: 'T4', configurator: { fit: { templeLengthMm: 145 } } },
      temple_tip: { id: 'temple_tip--ss26-bend-tips--tt1-bend', name: 'TT1-Bend', configurator: { fit: { tipLengthMm: 75, bendRadiusMm: 30, tipAngleDeg: 35 } } },
    },
  };
  const expectedVisibleTipLengths = {
    'VC S19000': 75,
    'VC S19001': 75,
    'VC S19002': 75,
    'VC S19003': null,
    'VC S19004': 79.5,
    'VC S19005': 75,
  };

  for (const [modelId, overrides] of Object.entries(defaultTempleParts)) {
    const model = buildConfiguredFrameModel(modelId, overrides);
    const expectedLength = FRAME_3D_DIMENSIONS[modelId].templeLength;
    const temple = componentById(model, 'wearer-left-temple');
    const tip = componentById(model, 'wearer-left-temple-tip');

    assert.equal(model.dimensions.templeLength, expectedLength);
    assert.equal(temple.source.topView.templeLengthMm, expectedLength);
    assert.equal(tip.source.sideView.templeLengthMm, expectedLength);
    assert.equal(tip.points.at(-1).z, -expectedLength);
    assert.equal(model.dimensions.templeTipVisibleLength ?? null, expectedVisibleTipLengths[modelId]);
  }
});

test('browbar uses the CAD top-bar 84.1 by 1.2 cue instead of a full-width rail', () => {
  const model = buildFrameModel();
  const browbar = componentById(model, 'browbar-top-rail');
  const bounds = pathBounds(browbar.points);

  assert.equal(browbar.source.entityId, 13437);
  assert.ok(Math.abs(bounds.width - VC_S19003_DIMENSIONS.browbarLength) < 0.25);
  assert.ok(Math.abs(browbar.source.sourceBoundsMm.height - VC_S19003_DIMENSIONS.browbarHeight) < 0.05);
  assert.ok(bounds.maxY > VC_S19003_DIMENSIONS.lensHeight * 0.45);
});

test('nose pads include the top-view metal nose arms, not only translucent pads', () => {
  const model = buildFrameModel();
  const rightPad = componentById(model, 'wearer-right-nose-pad');
  const leftPad = componentById(model, 'wearer-left-nose-pad');

  for (const pad of [rightPad, leftPad]) {
    assert.equal(pad.component, 'nose_pad');
    assert.ok(pad.armPoints.length >= 4);
    assert.ok(pad.armTubeRadius > 0);
    assert.equal(pad.source.topView.angleDeg, 85);
    assert.equal(pad.source.topView.bridgeDropMm, 1.8);
    assert.equal(pad.source.topView.baseOffsetMm, 2.0);
    assert.equal(pad.armAttachment[0], `${pad.side}-rim.inner-edge`);

    const first = pad.armPoints[0];
    const last = pad.armPoints.at(-1);
    assert.ok(Math.abs(first.x) > Math.abs(last.x));
    assert.ok(last.z < first.z);
    assert.ok(Math.hypot(last.x - pad.center.x, last.y - pad.center.y, last.z - pad.center.z) < 4);
  }

  assert.ok(rightPad.source.topView.entityIds.length > 0);
  assert.ok(leftPad.source.topView.entityIds.length > 0);
  assert.equal(rightPad.center.x < 0, true);
  assert.equal(leftPad.center.x > 0, true);
});

test('configured nose pad part recolors the 3D pad material cue', () => {
  const model = buildConfiguredFrameModel('VC S19003', {
    nose_pad: {
      id: 'nose_pad--manual--plain-black',
      name: 'Plain - black',
      configurator: {
        fit: {
          colorHex: '#202124',
          opacity: 0.96,
          logo: 'none',
          confidence: 'manual_variant',
        },
      },
    },
  });
  const rightPad = componentById(model, 'wearer-right-nose-pad');
  const leftPad = componentById(model, 'wearer-left-nose-pad');

  assert.equal(model.dimensions.configuredParts.nose_pad.id, 'nose_pad--manual--plain-black');
  assert.equal(model.dimensions.nosePadSource, 'Plain - black');
  assert.equal(model.dimensions.nosePadColor, '#202124');
  assert.equal(rightPad.appearance.color, '#202124');
  assert.equal(leftPad.appearance.color, '#202124');
  assert.equal(rightPad.source.part, 'Plain - black');
});

test('configured nosearm part reshapes the 3D nose-pad arm in the correct component slot', () => {
  const longModel = buildConfiguredFrameModel('VC S19003', {
    nosearm: {
      id: 'nosearm--manual--long-nosearm',
      name: 'Long nosearm',
      configurator: {
        fit: {
          lengthClass: 'long',
          armReachMm: 7.8,
          armDropMm: 6.6,
          confidence: 'manual_variant',
        },
      },
    },
  });
  const shortModel = buildConfiguredFrameModel('VC S19003', {
    nosearm: {
      id: 'nosearm--manual--short-nosearm',
      name: 'Short nosearm',
      configurator: {
        fit: {
          lengthClass: 'short',
          armReachMm: 4.4,
          armDropMm: 4.8,
          confidence: 'manual_variant',
        },
      },
    },
  });
  const longPad = componentById(longModel, 'wearer-left-nose-pad');
  const shortPad = componentById(shortModel, 'wearer-left-nose-pad');
  const longArmSpan = pointDistance(longPad.armPoints[0], longPad.armPoints.at(-1));
  const shortArmSpan = pointDistance(shortPad.armPoints[0], shortPad.armPoints.at(-1));

  assert.equal(longModel.dimensions.configuredParts.nosearm.id, 'nosearm--manual--long-nosearm');
  assert.equal(longPad.component, 'nose_pad');
  assert.equal(longPad.source.noseArm.part, 'Long nosearm');
  assert.equal(shortPad.source.noseArm.part, 'Short nosearm');
  assert.equal(longPad.armAttachment[0], 'wearer-left-rim.inner-edge');
  assert.equal(longPad.armAttachment[1], 'wearer-left-nose-pad');
  assert.ok(longArmSpan > shortArmSpan + 1);
  assert.ok(Math.abs(longPad.armPoints[0].x) > Math.abs(shortPad.armPoints[0].x));
});

test('nose arm foot is anchored to the inner rim edge near the pad, not the bridge center', () => {
  const model = buildFrameModel();

  for (const side of ['wearer-right', 'wearer-left']) {
    const pad = componentById(model, `${side}-nose-pad`);
    const rim = componentById(model, `${side}-rim`);
    const foot = pad.armPoints[0];
    const closestRimPoint = rim.path.reduce((closest, point) => {
      const distance = Math.hypot(point.x - foot.x, point.y - foot.y);
      return !closest || distance < closest.distance ? { point, distance } : closest;
    }, null);

    assert.equal(pad.armAttachment[0], `${side}-rim.inner-edge`);
    assert.ok(closestRimPoint.distance < 1.8);
    assert.ok(Math.abs(foot.z) < 0.8);
    assert.ok(Math.abs(foot.x) > VC_S19003_DIMENSIONS.bridgeWidth / 2);
    assert.ok(Math.abs(foot.y - pad.center.y) < 5);
    assert.ok(pad.armFootRadius > pad.armTubeRadius);
    assert.equal(Math.hypot(pad.rimEdgeAnchor.x - foot.x, pad.rimEdgeAnchor.y - foot.y), 0);
  }
});

test('hinge and rim lock form an interlocked screw-and-clamp assembly from top and front views', () => {
  const model = buildFrameModel();

  for (const side of ['wearer-left', 'wearer-right']) {
    const hinge = componentById(model, `${side}-hinge`);
    const rimLock = componentById(model, `${side}-rim-lock`);

    assert.equal(hinge.interlocksWith, rimLock.id);
    assert.equal(rimLock.interlocksWith, hinge.id);
    assert.ok(hinge.pivotCenters.length >= 2);
    assert.ok(hinge.leaves.length >= 2);
    assert.ok(rimLock.clampPlates.length >= 2);
    assert.ok(rimLock.lockScrewCenters.length >= 1);
    assert.ok(hinge.source.topView.entityIds.length > 0);
    assert.ok(hinge.source.frontView.entityIds.length > 0);
    assert.ok(rimLock.source.frontView.entityIds.length > 0);

    const primaryPivot = hinge.pivotCenters[0];
    assert.ok(Math.abs(primaryPivot.x - rimLock.center.x) < 4.5);
    assert.ok(Math.abs(primaryPivot.y - rimLock.center.y) < 8);
    assert.ok(Math.abs(rimLock.center.x) > VC_S19003_DIMENSIONS.frontWidth / 2 - 5);
  }
});

test('temple root overlaps the hinge sleeve so the side assembly has no visual break', () => {
  for (const modelId of ['VC S19001', 'VC S19002', 'VC S19003', 'VC S19004', 'VC S19005']) {
    const model = buildFrameModel(modelId);

    for (const side of ['wearer-left', 'wearer-right']) {
      const temple = componentById(model, `${side}-temple`);
      const endPiece = componentById(model, `${side}-end-piece`);
      const connector = temple.rootConnectorPoints;

      assert.ok(connector?.length >= 2);
      assert.ok(pointDistance(connector[0], endPiece.points.at(-1)) < 0.001);
      assert.ok(pointDistance(connector.at(-1), temple.points[0]) < 0.001);
      assert.ok(Math.abs(connector[0].z - connector.at(-1).z) > 2);
      assert.equal(temple.source.sideView.templeRootConnection, 'hinge_sleeve_overlap');
    }
  }
});

test('VC S19000 outer junction follows the corrected front and top CAD cues', () => {
  const model = buildFrameModel('VC S19000');
  const expected = {
    'wearer-right': {
      frontStartEntity: 12977,
      frontEndEntity: 13000,
      topScrewEntity: 13018,
      topEndPieceEntity: 13020,
    },
    'wearer-left': {
      frontStartEntity: 12950,
      frontEndEntity: 12973,
      topScrewEntity: 12869,
      topEndPieceEntity: 12871,
    },
  };

  for (const side of ['wearer-right', 'wearer-left']) {
    const hinge = componentById(model, `${side}-hinge`);
    const rimLock = componentById(model, `${side}-rim-lock`);
    const endPiece = componentById(model, `${side}-end-piece`);
    const cue = expected[side];

    assert.equal(hinge.interlocksWith, rimLock.id);
    assert.equal(rimLock.interlocksWith, hinge.id);
    assert.equal(endPiece.interlocksWith, hinge.id);
    assert.ok(hinge.source.frontView.entityIds.includes(cue.frontStartEntity));
    assert.ok(hinge.source.frontView.entityIds.includes(cue.frontEndEntity));
    assert.ok(hinge.source.topView.entityIds.includes(cue.topScrewEntity));
    assert.ok(rimLock.source.frontView.entityIds.includes(cue.frontStartEntity));
    assert.ok(rimLock.source.topView.entityIds.includes(cue.topScrewEntity));
    assert.ok(endPiece.source.frontView.entityIds.includes(cue.frontStartEntity));
    assert.ok(endPiece.source.topView.entityIds.includes(cue.topEndPieceEntity));
    assert.ok(rimLock.frontRibs.length >= 8);
    assert.ok(endPiece.plates.length >= 2);
    assert.ok(endPiece.connectorPoints.length >= 3);

    const ySpread = Math.max(...hinge.pivotCenters.map((point) => point.y)) - Math.min(...hinge.pivotCenters.map((point) => point.y));
    const zSpread = Math.max(...hinge.pivotCenters.map((point) => point.z)) - Math.min(...hinge.pivotCenters.map((point) => point.z));
    assert.ok(ySpread < 2.5);
    assert.ok(zSpread > 3);
  }
});

test('temple and temple tip preserve the 145 mm temple and 70 mm tip cues', () => {
  const model = buildFrameModel();
  const temple = componentById(model, 'wearer-left-temple');
  const tip = componentById(model, 'wearer-left-temple-tip');
  const templePlusTipLength = curveLength(temple.points) + curveLength(tip.points);

  assert.equal(tip.bendRadius, 30);
  assert.equal(tip.angleDeg, 42);
  assert.ok(curveLength(tip.points) > 60);
  assert.ok(templePlusTipLength > VC_S19003_DIMENSIONS.templeLength * 0.82);
  assert.equal(tip.points.at(-1).z, -VC_S19003_DIMENSIONS.templeLength);
});

test('temple centerlines use top-view convergence and side-view tip drop', () => {
  const model = buildFrameModel();
  const rightTemple = componentById(model, 'wearer-right-temple');
  const leftTemple = componentById(model, 'wearer-left-temple');
  const rightTip = componentById(model, 'wearer-right-temple-tip');
  const leftTip = componentById(model, 'wearer-left-temple-tip');
  const frontSpan = leftTemple.points[0].x - rightTemple.points[0].x;
  const rearSpan = leftTip.points.at(-1).x - rightTip.points.at(-1).x;
  const leftDrop = leftTip.points.at(-1).y - leftTemple.points[0].y;

  assert.equal(leftTemple.source.topView.view, 'top');
  assert.equal(leftTip.source.sideView.view, 'side-left');
  assert.ok(Math.abs(frontSpan - VC_S19003_DIMENSIONS.frontWidth) < 3.5);
  assert.ok(Math.abs(rearSpan - VC_S19003_DIMENSIONS.topTempleRearSpan) < 5);
  assert.ok(leftDrop < -18);
  assert.equal(leftTip.points.at(-1).z, -VC_S19003_DIMENSIONS.templeLength);
});

test('temple tip stays straight through the early TT3 side-view segment before the R30 bend', () => {
  const model = buildFrameModel();
  const temple = componentById(model, 'wearer-left-temple');
  const tip = componentById(model, 'wearer-left-temple-tip');
  const startY = temple.points[0].y;
  const earlyTip = tip.points.reduce((closest, point) => (
    Math.abs(point.z + 92) < Math.abs(closest.z + 92) ? point : closest
  ), tip.points[0]);
  const bendTip = tip.points.reduce((closest, point) => (
    Math.abs(point.z + 112) < Math.abs(closest.z + 112) ? point : closest
  ), tip.points[0]);

  assert.equal(tip.source.sideView.bendStartLengthMm, 100);
  assert.ok(tip.source.sideView.profilePointsMm.length >= 8);
  assert.ok(tip.points.some((point) => Math.abs(point.z + 100) < 0.01));
  assert.ok(tip.points.some((point) => Math.abs(point.z + 124.3) < 0.1));
  assert.ok(earlyTip.y > startY - 2.6);
  assert.ok(bendTip.y < startY - 6);

  for (const side of ['wearer-left', 'wearer-right']) {
    const sideTip = componentById(model, `${side}-temple-tip`);
    const zStops = new Set(sideTip.points.map((point) => point.z.toFixed(3)));
    assert.equal(zStops.size, sideTip.points.length);
    for (let index = 1; index < sideTip.points.length; index += 1) {
      assert.ok(Math.abs(sideTip.points[index].z - sideTip.points[index - 1].z) > 0.5);
    }
  }
});

test('temple and TT3 tip expose only visible CAD/PDF side-view silhouettes for 3D reconstruction', () => {
  const model = buildFrameModel();
  const temple = componentById(model, 'wearer-left-temple');
  const tip = componentById(model, 'wearer-left-temple-tip');

  assert.equal(temple.sideOutlines.length, 1);
  assert.equal(temple.sideOutlines[0].id, 'temple-side-strip');
  assert.ok(Math.abs(temple.sideOutlines[0].source.heightMm - 3.3) < 0.1);

  assert.equal(tip.sideOutlines.length, 1);
  assert.equal(tip.sideOutlines.some((outline) => outline.id === 'tt3-straight-top-strip'), false);
  const bent = tip.sideOutlines.find((outline) => outline.id === 'tt3-r30-bent-ear-tip');

  assert.ok(bent);
  assert.equal(bent.source.bendRadiusMm, 30);
  assert.equal(bent.source.tipAngleDeg, 42);
  assert.equal(bent.source.sleeveOverlapMm, 4);
  assert.deepEqual(bent.source.ignoredConstructionEntityIds, [13093]);
  assert.equal(bent.profilePointsMm.some((point) => Math.abs(point.length - 145) < 0.01), false);
  assert.ok(Math.min(...bent.profilePointsMm.map((point) => point.length)) <= VC_S19003_DIMENSIONS.templeMetalLength);

  const bentMinY = Math.min(...bent.profilePointsMm.map((point) => point.y));
  const bentMaxY = Math.max(...bent.profilePointsMm.map((point) => point.y));

  assert.ok(bentMinY < -22);
  assert.ok(bentMaxY > 1);
});

test('3D viewer hides component label sprites', () => {
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');

  assert.equal(viewerSource.includes('addComponentLabels(frameGroup)'), false);
});

test('3D viewer renders side-view temple silhouettes instead of round tubes', () => {
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');

  assert.equal(viewerSource.includes('createSideOutlinePart(component'), true);
  assert.equal(viewerSource.includes('component.sideOutlines'), true);
  assert.equal(viewerSource.includes('component.rootConnectorPoints'), true);
  assert.equal(viewerSource.includes('hinge-sleeve-connector'), true);
});

test('3D viewer builds geometry for the selected frame model', () => {
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');
  const appSource = readFileSync(new URL('../static/app.js', import.meta.url), 'utf8');

  assert.equal(viewerSource.includes('modelId'), true);
  assert.equal(viewerSource.includes('buildConfiguredFrameModel(modelId'), true);
  assert.equal(appSource.includes('modelId: project.modelId'), true);
});

test('3D viewer source chips come from the selected frame dimensions', () => {
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');
  const indexSource = readFileSync(new URL('../static/index.html', import.meta.url), 'utf8');

  assert.equal(viewerSource.includes('updateSourceMeta(panel, model)'), true);
  assert.equal(viewerSource.includes('dimensions.topViewDepth'), true);
  assert.equal(indexSource.includes('58-16-145'), false);
});

test('3D viewer renders nose arms and hinge pivots as modeled assemblies', () => {
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');

  assert.equal(viewerSource.includes('createNosePadAssembly(component'), true);
  assert.equal(viewerSource.includes('component.armPoints'), true);
  assert.equal(viewerSource.includes('nose-arm-foot'), true);
  assert.equal(viewerSource.includes('createHingeJoint(component'), true);
  assert.equal(viewerSource.includes('component.pivotCenters'), true);
  assert.equal(viewerSource.includes('createRimLock(component'), true);
});

test('3D viewer renders detailed end-piece plates and rim-lock front ribs', () => {
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');

  assert.equal(viewerSource.includes('createEndPieceAssembly(component'), true);
  assert.equal(viewerSource.includes('component.connectorPoints'), true);
  assert.equal(viewerSource.includes('component.frontRibs'), true);
});

test('labeller UI exposes model selector and reloads project data per frame', () => {
  const htmlSource = readFileSync(new URL('../static/index.html', import.meta.url), 'utf8');
  const appSource = readFileSync(new URL('../static/app.js', import.meta.url), 'utf8');

  assert.equal(htmlSource.includes('id="modelSelect"'), true);
  assert.equal(appSource.includes('project.models'), true);
  assert.equal(appSource.includes('loadProject(modelId)'), true);
  assert.equal(appSource.includes("modelSelect.addEventListener('change'"), true);
});

test('labeller UI asks before rebuilding 3D after label edits', () => {
  const appSource = readFileSync(new URL('../static/app.js', import.meta.url), 'utf8');

  assert.equal(appSource.includes('labelsChangedSince3DRender'), true);
  assert.equal(appSource.includes('confirm3DRefreshAfterLabelChange'), true);
  assert.equal(appSource.includes('Labels changed. Rebuild the 3D render now?'), true);
});

test('labeller UI passes current label memory into the 3D rebuild', () => {
  const appSource = readFileSync(new URL('../static/app.js', import.meta.url), 'utf8');
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');

  assert.equal(appSource.includes('currentLabelMemoryFor3D'), true);
  assert.equal(appSource.includes('labelMemory: currentLabelMemoryFor3D()'), true);
  assert.equal(viewerSource.includes('labelMemory = null'), true);
  assert.equal(viewerSource.includes('buildConfiguredFrameModel(modelId, overrides, labelMemory, dimensionOverrides)'), true);
});

test('labeller UI shows percentage progress while rebuilding a 3D child part', () => {
  const appSource = readFileSync(new URL('../static/app.js', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../static/styles.css', import.meta.url), 'utf8');

  assert.equal(appSource.includes('run3DRenderBuild'), true);
  assert.equal(appSource.includes('set3DBuildProgress'), true);
  assert.equal(appSource.includes('Building 3D'), true);
  assert.equal(cssSource.includes('.frame3d-build-progress'), true);
  assert.equal(cssSource.includes('.frame3d-build-progress-fill'), true);
});

test('labeller UI can toggle nose bridge before and after render states', () => {
  const htmlSource = readFileSync(new URL('../static/index.html', import.meta.url), 'utf8');
  const appSource = readFileSync(new URL('../static/app.js', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../static/styles.css', import.meta.url), 'utf8');

  assert.equal(htmlSource.includes('id="noseBridgeCompare"'), true);
  assert.equal(htmlSource.includes('id="noseBridgeBeforeButton"'), true);
  assert.equal(htmlSource.includes('id="noseBridgeAfterButton"'), true);
  assert.equal(htmlSource.includes('id="noseBridgeCompareStatus"'), true);
  assert.equal(appSource.includes('showNoseBridgeCompareMode'), true);
  assert.equal(appSource.includes('beforeNoseBridgePartId'), true);
  assert.equal(appSource.includes('afterNoseBridgePartId'), true);
  assert.equal(cssSource.includes('.part-compare'), true);
}
);

test('3D mode uses a collapsible parts drawer with visual single-select part cards', () => {
  const htmlSource = readFileSync(new URL('../static/index.html', import.meta.url), 'utf8');
  const appSource = readFileSync(new URL('../static/app.js', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../static/styles.css', import.meta.url), 'utf8');

  assert.equal(htmlSource.includes('id="partDrawer"'), true);
  assert.equal(htmlSource.includes('id="partDrawerToggle"'), true);
  assert.equal(htmlSource.includes('id="partDrawerContent"'), true);
  assert.equal(htmlSource.includes('id="noseBridgePartList"'), true);
  assert.equal(appSource.includes('renderPartDrawer'), true);
  assert.equal(appSource.includes('selectDrawerPart'), true);
  assert.equal(appSource.includes('partLibrariesByType'), true);
  assert.equal(appSource.includes('part-card-media'), true);
  assert.equal(appSource.includes('generatedPartPreviewUrl'), true);
  assert.equal(appSource.includes('part.assets?.previewUrl ?? part.assets?.svgUrl'), true);
  assert.equal(appSource.includes('nosearmPreviewSvg'), true);
  assert.equal(appSource.includes('nosePadPreviewSvg'), true);
  assert.equal(cssSource.includes('.workspace.is-3d-drawer-collapsed'), true);
  assert.equal(cssSource.includes('.part-drawer'), true);
  assert.equal(cssSource.includes('.part-card'), true);
});

test('parts drawer sends selected temple and acetate tip parts into the live 3D viewer', () => {
  const appSource = readFileSync(new URL('../static/app.js', import.meta.url), 'utf8');
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');

  assert.equal(appSource.includes('selected3DChildPartOverrides'), true);
  assert.equal(appSource.includes('applySelectedDrawerPart(partType)'), true);
  assert.equal(appSource.includes('frame3dViewer.applyChildPart(partType, part)'), true);
  assert.equal(appSource.includes('templePreviewSvg'), true);
  assert.equal(appSource.includes('templeTipPreviewSvg'), true);
  assert.equal(viewerSource.includes('applyChildParts'), true);
  assert.equal(viewerSource.includes('panel.dataset.templeSource'), true);
  assert.equal(viewerSource.includes('panel.dataset.templeTipSource'), true);
}
);

test('parts drawer lets the active component category be minimized', () => {
  const htmlSource = readFileSync(new URL('../static/index.html', import.meta.url), 'utf8');
  const appSource = readFileSync(new URL('../static/app.js', import.meta.url), 'utf8');
  const configuratorSource = readFileSync(new URL('../static/configurator.js', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../static/styles.css', import.meta.url), 'utf8');

  assert.equal(htmlSource.includes('data-part-type="nose_bridge"'), true);
  assert.equal(htmlSource.includes('class="part-section-toggle"'), true);
  assert.equal(appSource.includes('activePartDrawerType'), true);
  assert.equal(appSource.includes('setActivePartDrawerType'), true);
  assert.equal(appSource.includes('activePartDrawerType = activePartDrawerType === partType ? null : partType'), true);
  assert.equal(appSource.includes("dom.partDrawerContent.dataset.activePartType = activePartDrawerType ?? 'none'"), true);
  assert.equal(configuratorSource.includes('function toggleConfiguratorPartType(partType)'), true);
  assert.equal(configuratorSource.includes('activePartType = activePartType === partType ? null : partType'), true);
  assert.equal(appSource.includes('is-expanded'), true);
  assert.equal(cssSource.includes('.part-drawer-section:not(.is-expanded) .part-card-list'), true);
});

test('parts drawer lets the expanded category use the available vertical space', () => {
  const appSource = readFileSync(new URL('../static/app.js', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../static/styles.css', import.meta.url), 'utf8');

  assert.equal(appSource.includes('partDrawerContent.dataset.activePartType = activePartDrawerType'), true);
  assert.equal(cssSource.includes('.part-drawer-content[data-active-part-type="nose_bridge"] .part-drawer-modules'), true);
  assert.equal(cssSource.includes('.part-drawer-modules .part-drawer-section.is-expanded'), true);
  assert.equal(cssSource.includes('grid-template-rows: auto minmax(0, 1fr)'), true);
  assert.equal(cssSource.includes('.part-drawer-section.is-expanded .part-card-list'), true);
  assert.equal(cssSource.includes('overflow-y: auto'), true);
});

test('3D viewer exposes the rendered nose bridge source and width for live verification', () => {
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');

  assert.equal(viewerSource.includes('panel.dataset.noseBridgeSource'), true);
  assert.equal(viewerSource.includes('panel.dataset.noseBridgeDetailWidth'), true);
});

test('3D viewer exposes rendered front-bar components for live verification', () => {
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');

  assert.equal(viewerSource.includes('panel.dataset.frontBarComponents'), true);
  assert.equal(viewerSource.includes('panel.dataset.frontBarCount'), true);
  assert.equal(viewerSource.includes('panel.dataset.browbarSource'), true);
  assert.equal(viewerSource.includes('panel.dataset.browbarLabelId'), true);
});

test('3D front-view export uses a fixed landscape canvas with side padding', () => {
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');

  assert.equal(viewerSource.includes('FRONT_VIEW_EXPORT'), true);
  assert.equal(viewerSource.includes('width: 1400'), true);
  assert.equal(viewerSource.includes('height: 900'), true);
  assert.equal(viewerSource.includes('frameWidthRatio: 0.72'), true);
  assert.equal(viewerSource.includes('frontViewBlob(type = \'image/jpeg\''), true);
});

test('matcher UI auto-generates a front-view JPG input and keeps manual mask override', () => {
  const matcherSource = readFileSync(new URL('../static/matcher.js', import.meta.url), 'utf8');

  assert.equal(matcherSource.includes('generatedLensMaskFile'), true);
  assert.equal(matcherSource.includes('manualLensMaskFile'), true);
  assert.equal(matcherSource.includes('lensMaskForMatch()'), true);
  assert.equal(matcherSource.includes('refreshGeneratedLensMask'), true);
  assert.equal(matcherSource.includes('Generated front-view JPG'), true);
});

test('matcher UI preloads the server default portfolio index path', () => {
  const matcherSource = readFileSync(new URL('../static/matcher.js', import.meta.url), 'utf8');

  assert.equal(matcherSource.includes("const DEFAULT_MATCHER_INDEX_PATH = '/tmp/merch_matcher_index/portfolio_index.pkl';"), true);
  assert.equal(matcherSource.includes('project.engine.defaultIndexPath'), true);
  assert.equal(matcherSource.includes('dom.indexPath.value = project.engine.defaultIndexPath ?? DEFAULT_MATCHER_INDEX_PATH;'), true);
});

test('matcher engine settings are collapsed by default so results stay visible', () => {
  const htmlSource = readFileSync(new URL('../static/matcher.html', import.meta.url), 'utf8');
  const matcherSource = readFileSync(new URL('../static/matcher.js', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../static/styles.css', import.meta.url), 'utf8');

  assert.equal(htmlSource.includes('id="matcherEnginePanel"'), true);
  assert.equal(htmlSource.includes('id="engineToggleButton"'), true);
  assert.equal(htmlSource.includes('id="matcherEngineBody" class="matcher-form matcher-engine-body" hidden'), true);
  assert.equal(matcherSource.includes('setEngineCollapsed(true);'), true);
  assert.equal(matcherSource.includes('engineToggleButton.addEventListener'), true);
  assert.equal(cssSource.includes('.panel-toggle'), true);
  assert.equal(cssSource.includes('.matcher-engine-body[hidden]'), true);
});

test('run match refreshes the current 3D front-view file before submitting', () => {
  const matcherSource = readFileSync(new URL('../static/matcher.js', import.meta.url), 'utf8');

  assert.equal(matcherSource.includes('const mask = await lensMaskForMatch();'), true);
  assert.equal(matcherSource.includes('async function lensMaskForMatch()'), true);
  assert.equal(matcherSource.includes('return currentGeneratedLensMaskFile();'), true);
  assert.equal(matcherSource.includes('async function currentGeneratedLensMaskFile()'), true);
  assert.equal(matcherSource.includes("updateGeneratedLensMaskStatus('Preparing current front-view JPG for match');"), true);
});

test('run match reports a missing index path before preparing the front-view file', () => {
  const matcherSource = readFileSync(new URL('../static/matcher.js', import.meta.url), 'utf8');
  const indexGuard = matcherSource.indexOf("renderMessage('Portfolio index path is required before matching.')");
  const lensCapture = matcherSource.indexOf('const mask = await lensMaskForMatch();');

  assert.notEqual(indexGuard, -1);
  assert.notEqual(lensCapture, -1);
  assert.equal(indexGuard < lensCapture, true);
  assert.equal(matcherSource.includes("setPageState('Missing index')"), true);
  assert.equal(matcherSource.includes('dom.indexPath.focus();'), true);
});

test('matcher layout stacks the render and controls on narrow vertical screens', () => {
  const cssSource = readFileSync(new URL('../static/styles.css', import.meta.url), 'utf8');

  assert.equal(cssSource.includes('@media (max-width: 820px)'), true);
  assert.equal(cssSource.includes('.matcher-workspace'), true);
  assert.equal(cssSource.includes('grid-template-columns: 1fr'), true);
  assert.equal(cssSource.includes('minmax(360px, 58vh)'), true);
});

test('configurator spec controls pass optical fit values into the 3D viewer', () => {
  const configuratorSource = readFileSync(new URL('../static/configurator.js', import.meta.url), 'utf8');

  assert.equal(configuratorSource.includes('rxPower: specs.rxPower'), true);
  assert.equal(configuratorSource.includes('lensIndex: specs.lensIndex'), true);
  assert.equal(configuratorSource.includes('faceWrapDeg: specs.faceWrap'), true);
  assert.equal(configuratorSource.includes('pantoscopicTiltDeg: specs.pantoscopicTilt'), true);
});

test('configurator imports the Metal Frame Design Studio parameter groups', () => {
  const configuratorSource = readFileSync(new URL('../static/configurator.js', import.meta.url), 'utf8');

  assert.equal(configuratorSource.includes('const FRAME_PARAMETER_DEFINITIONS'), true);
  assert.equal(configuratorSource.includes("id: 'lensWidth_mm'"), true);
  assert.equal(configuratorSource.includes("label: 'Lens width'"), true);
  assert.equal(configuratorSource.includes('tolerance: 0.15'), true);
  assert.equal(configuratorSource.includes("id: 'bridgeWidth_mm'"), true);
  assert.equal(configuratorSource.includes('tolerance: 0.1'), true);
  assert.equal(configuratorSource.includes("id: 'templeLength_mm'"), true);
  assert.equal(configuratorSource.includes('tolerance: 0.25'), true);
  assert.equal(configuratorSource.includes("id: 'rimThickness_mm'"), true);
  assert.equal(configuratorSource.includes("id: 'templeThickness_mm'"), true);
  assert.equal(configuratorSource.includes('CORE_FRAME_GEOMETRY_KEYS'), true);
  assert.equal(configuratorSource.includes('FRAME_FIT_GEOMETRY_KEYS'), true);
  assert.equal(configuratorSource.includes('ADDITIONAL_GEOMETRY_KEYS'), true);
  assert.equal(configuratorSource.includes('type="range" min="${definition.min}" max="${definition.max}" step="any"'), true);
});

test('configurator imports the Metal Frame Design Studio validation feature', () => {
  const configuratorSource = readFileSync(new URL('../static/configurator.js', import.meta.url), 'utf8');
  const cssSource = readFileSync(new URL('../static/styles.css', import.meta.url), 'utf8');

  assert.equal(configuratorSource.includes('const STARTER_VALIDATION_RULES'), true);
  assert.equal(configuratorSource.includes("id: 'std-bridge'"), true);
  assert.equal(configuratorSource.includes("parameter: 'bridgeWidth_mm'"), true);
  assert.equal(configuratorSource.includes('function evaluateValidationRule'), true);
  assert.equal(configuratorSource.includes('function validateConfiguratorDesign'), true);
  assert.equal(configuratorSource.includes('function renderValidationReport'), true);
  assert.equal(configuratorSource.includes("ruleId: `assembly-${partType}`"), true);
  assert.equal(configuratorSource.includes("ruleId: 'lens-stress'"), true);
  assert.equal(configuratorSource.includes("data-validation-status"), true);
  assert.equal(cssSource.includes('.validation-summary-card'), true);
  assert.equal(cssSource.includes('.validation-result-row.fail'), true);
  assert.equal(cssSource.includes('.validation-result-row.warn'), true);
});

test('configurator keeps connected frame parameters synchronized before rebuilding 3D', () => {
  const configuratorSource = readFileSync(new URL('../static/configurator.js', import.meta.url), 'utf8');

  assert.equal(configuratorSource.includes('let frontFrameWidthAutoSynced = true'), true);
  assert.equal(configuratorSource.includes('function syncConnectedFrameParameters(parameterId)'), true);
  assert.equal(configuratorSource.includes("parameterId === 'frontFrameWidth_mm'"), true);
  assert.equal(configuratorSource.includes("['lensWidth_mm', 'bridgeWidth_mm', 'dbl_mm'].includes(parameterId)"), true);
  assert.equal(configuratorSource.includes('frameParameters.frontFrameWidth_mm = clampToRange'), true);
});

test('configurator saves incremental builds and shows saved versions in the model dropdown', () => {
  const htmlSource = readFileSync(new URL('../static/configurator.html', import.meta.url), 'utf8');
  const configuratorSource = readFileSync(new URL('../static/configurator.js', import.meta.url), 'utf8');

  assert.equal(htmlSource.includes('id="configuratorSaveButton"'), true);
  assert.equal(htmlSource.includes('id="configuratorSaveStatus"'), true);
  assert.equal(configuratorSource.includes('saveConfiguratorBuild'), true);
  assert.equal(configuratorSource.includes('configuratorSavePayload'), true);
  assert.equal(configuratorSource.includes('project.configuratorSaveUrl'), true);
  assert.equal(configuratorSource.includes('project.nextConfiguratorSaveName'), true);
  assert.equal(configuratorSource.includes('project.selectedModelId'), true);
  assert.equal(configuratorSource.includes('project.configuratorLoadUrl'), true);
  assert.equal(configuratorSource.includes('await loadProject(saved.savedAs)'), true);
  assert.equal(configuratorSource.includes('selectedPartIdsByType'), true);
  assert.equal(configuratorSource.includes('frameParameters'), true);
});

test('configurator imports the Metal Frame Design Studio finish and lens option catalogs', () => {
  const configuratorSource = readFileSync(new URL('../static/configurator.js', import.meta.url), 'utf8');

  assert.equal(configuratorSource.includes("id: 'antique-brass'"), true);
  assert.equal(configuratorSource.includes("id: 'brushed-nickel'"), true);
  assert.equal(configuratorSource.includes("id: 'oil-rubbed-bronze'"), true);
  assert.equal(configuratorSource.includes("id: 'electric-blue'"), true);
  assert.equal(configuratorSource.includes("id: 'plum-violet'"), true);
  assert.equal(configuratorSource.includes("id: 'clear-tint'"), true);
  assert.equal(configuratorSource.includes("id: 'brown-fade'"), true);
  assert.equal(configuratorSource.includes("id: 'amber-gold'"), true);
  assert.equal(configuratorSource.includes("id: 'green-gradient'"), true);
  assert.equal(configuratorSource.includes("id: 'violet-smoke'"), true);
  assert.equal(configuratorSource.includes('materialId'), true);
});

test('configurator passes frame geometry overrides into the 3D viewer', () => {
  const configuratorSource = readFileSync(new URL('../static/configurator.js', import.meta.url), 'utf8');
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');

  assert.equal(configuratorSource.includes('frameGeometryFromParameters'), true);
  assert.equal(configuratorSource.includes('applyFrameParameters'), true);
  assert.equal(configuratorSource.includes('frame3dViewer.applyFrameParameters'), true);
  assert.equal(configuratorSource.includes('dimensionOverrides: frameGeometryFromParameters()'), true);
  assert.equal(viewerSource.includes('dimensionOverrides = {}'), true);
  assert.equal(viewerSource.includes('applyFrameParameters'), true);
  assert.equal(viewerSource.includes('buildConfiguredFrameModel(modelId, overrides, labelMemory, dimensionOverrides)'), true);
});

test('configured 3D model applies imported geometry parameters to physical frame dimensions', () => {
  const model = buildConfiguredFrameModel('VC S19003', {}, null, {
    lensWidth: 52,
    lensHeight: 44,
    bridgeWidth: 18,
    templeLength: 140,
    rimThickness: 2.1,
    templeThickness: 1.5,
  });
  const rightRim = componentById(model, 'wearer-right-rim');
  const leftRim = componentById(model, 'wearer-left-rim');
  const leftTemple = componentById(model, 'wearer-left-temple');

  assert.equal(model.dimensions.lensWidth, 52);
  assert.equal(model.dimensions.lensHeight, 44);
  assert.equal(model.dimensions.bridgeWidth, 18);
  assert.equal(model.dimensions.nominalBridgeWidth, 18);
  assert.equal(model.dimensions.templeLength, 140);
  assert.equal(model.dimensions.rimThickness, 2.1);
  assert.equal(model.dimensions.templeThickness, 1.5);
  assert.equal(rightRim.tubeRadius, 1.05);
  assert.equal(leftRim.tubeRadius, 1.05);
  assert.equal(leftRim.center.x - rightRim.center.x, 70);
  assert.equal(leftTemple.tubeRadius, 0.75);
  assert.ok(leftTemple.source.topView.templeLengthMm === 140);
});

test('temple thickness override changes the rendered side-outline surface thickness', () => {
  const model = buildConfiguredFrameModel('VC S19003', {}, null, {
    templeThickness: 4,
  });
  const leftTemple = componentById(model, 'wearer-left-temple');
  const outline = leftTemple.sideOutlines.find((item) => item.component === 'temple');

  assert.equal(model.dimensions.templeThickness, 4);
  assert.equal(leftTemple.tubeRadius, 2);
  assert.equal(outline.source.surfaceHalfThicknessMm, 2);
});

test('configured frame parameters keep physically attached 3D parts connected', () => {
  const model = buildConfiguredFrameModel('VC S19003', {}, null, {
    lensWidth: 52,
    lensHeight: 44,
    bridgeWidth: 18,
    templeLength: 140,
  });
  const rightRim = componentById(model, 'wearer-right-rim');
  const leftRim = componentById(model, 'wearer-left-rim');
  const bridge = componentById(model, 'nose-bridge');
  const leftTemple = componentById(model, 'wearer-left-temple');
  const leftHinge = componentById(model, 'wearer-left-hinge');
  const leftRimLock = componentById(model, 'wearer-left-rim-lock');
  const leftEndPiece = componentById(model, 'wearer-left-end-piece');
  const bridgeBounds = pathBounds(bridge.points);
  const sourceBridgeOverlap = VC_S19003_DIMENSIONS.noseBridgeDetailWidth - VC_S19003_DIMENSIONS.bridgeWidth;
  const sourceEndPieceAllowance = VC_S19003_DIMENSIONS.frontWidth
    - ((VC_S19003_DIMENSIONS.lensWidth * 2) + VC_S19003_DIMENSIONS.bridgeWidth);
  const expectedFrontWidth = (52 * 2) + 18 + sourceEndPieceAllowance;
  const expectedHalfFrontWidth = expectedFrontWidth / 2;

  assert.equal(roundTo(leftRim.center.x - rightRim.center.x, 3), 70);
  assert.equal(roundTo(model.dimensions.frontWidth, 3), roundTo(expectedFrontWidth, 3));
  assert.equal(roundTo(bridgeBounds.width, 3), roundTo(18 + sourceBridgeOverlap, 3));
  assert.ok(bridge.points[0].x <= -9);
  assert.ok(bridge.points.at(-1).x >= 9);
  assert.equal(roundTo(leftTemple.points[0].x, 3), roundTo(expectedHalfFrontWidth, 3));
  assert.equal(roundTo(leftHinge.center.x, 3), roundTo(expectedHalfFrontWidth, 3));
  assert.ok(Math.abs(leftRimLock.center.x - expectedHalfFrontWidth) < 2);
  assert.ok(Math.abs(leftEndPiece.points.at(-1).x - expectedHalfFrontWidth) < 0.001);
});

test('temple height parameter moves the attached side assembly as one chain', () => {
  const baseModel = buildConfiguredFrameModel('VC S19003', {}, null, {});
  const movedModel = buildConfiguredFrameModel('VC S19003', {}, null, {
    templeHeightPosition: 2,
  });
  const expectedOffset = 2 - (-6);

  for (const id of ['wearer-left-temple', 'wearer-left-hinge', 'wearer-left-rim-lock', 'wearer-left-end-piece']) {
    const base = componentById(baseModel, id);
    const moved = componentById(movedModel, id);
    const baseY = base.center?.y ?? base.points[0].y;
    const movedY = moved.center?.y ?? moved.points[0].y;

    assert.equal(roundTo(movedY - baseY, 3), expectedOffset);
  }
});

test('3D viewer turns optical specs into lens curvature and frame fit transforms', () => {
  const viewerSource = readFileSync(new URL('../static/frame-3d-viewer.mjs', import.meta.url), 'utf8');

  assert.equal(viewerSource.includes('function visualLensSagMm'), true);
  assert.equal(viewerSource.includes('function createLensProfileGeometry'), true);
  assert.equal(viewerSource.includes('function applyOpticalFitTransform'), true);
  assert.equal(viewerSource.includes('appearance.faceWrapDeg'), true);
  assert.equal(viewerSource.includes('appearance.pantoscopicTiltDeg'), true);
});
