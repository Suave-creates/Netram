import * as THREE from 'three';
import { OrbitControls } from './vendor/three/OrbitControls.js';
import { buildConfiguredFrameModel } from './frame-3d-model.mjs?v=20260620-solidtip1';

const MATERIAL_COLORS = {
  rim: 0x167f78,
  nose_bridge: 0x6b59b5,
  nose_pad: 0xb7d8d6,
  nose_pad_arm: 0x8e7f6b,
  browbar: 0x2f3b38,
  wire_core: 0x4b5b57,
  temple: 0xb57924,
  temple_tip: 0x915f1a,
  end_piece: 0xa93d38,
  hinge_joint: 0x7a2f2d,
  rim_lock: 0xb4403a,
};

const FRONT_VIEW_CAMERA = {
  position: { x: 0, y: 0, z: 285 },
  target: { x: 0, y: 0, z: -4 },
};

const FRONT_VIEW_EXPORT = {
  width: 1400,
  height: 900,
  frameWidthRatio: 0.72,
};

const DEFAULT_APPEARANCE = {
  frameColor: '#167f78',
  metalness: 0.72,
  roughness: 0.32,
  lensColor: '#d9ecf1',
  lensOpacity: 0.22,
  rxPower: 0,
  lensIndex: 1.5,
  faceWrapDeg: 0,
  pantoscopicTiltDeg: 0,
};

export function frontViewFileName(modelId) {
  return `${String(modelId).replace(/\s+/g, '_')}_front_view.jpg`;
}

export function initFrame3DViewer({ canvas, panel, modelId, childPartOverrides = {}, labelMemory = null, dimensionOverrides = {} }) {
  let overrides = { ...childPartOverrides };
  dimensionOverrides = { ...dimensionOverrides };
  let appearance = { ...DEFAULT_APPEARANCE };
  let model = buildConfiguredFrameModel(modelId, overrides, labelMemory, dimensionOverrides);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe8eeeb);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 600);
  camera.position.set(0, -24, 380);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.28;
  controls.target.set(0, -2, -72);
  controls.minDistance = 125;
  controls.maxDistance = 420;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
  });

  const frameGroup = new THREE.Group();
  frameGroup.name = `${model.modelId} frame`;
  scene.add(frameGroup);

  addLights(scene);
  let viewer = null;
  rebuildFrameGeometry();

  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(panel);
  } else {
    window.addEventListener('resize', resize);
  }

  let rafId = 0;
  function animate() {
    rafId = window.requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  function resize() {
    const rect = panel.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    if (canvas.width !== width || canvas.height !== height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
  }

  function destroy() {
    window.cancelAnimationFrame(rafId);
    if (resizeObserver) {
      resizeObserver.disconnect();
    } else {
      window.removeEventListener('resize', resize);
    }
    renderer.dispose();
  }

  function rebuildFrameGeometry() {
    clearObject(frameGroup);
    model = buildConfiguredFrameModel(modelId, overrides, labelMemory, dimensionOverrides);
    frameGroup.name = `${model.modelId} frame`;
    addFrameGeometry(frameGroup, model, appearance);
    addSourceMarker(frameGroup);
    updateSourceMeta(panel, model);
    if (viewer) {
      viewer.model = model;
    }
    resize();
  }

  function applyChildPart(component, part) {
    return applyChildParts({ [component]: part });
  }

  function applyChildParts(nextOverrides) {
    overrides = {
      ...overrides,
      ...nextOverrides,
    };
    rebuildFrameGeometry();
    return model;
  }

  function applyAppearance(nextAppearance) {
    appearance = {
      ...appearance,
      ...nextAppearance,
    };
    rebuildFrameGeometry();
    return appearance;
  }

  function applyFrameParameters(nextParameters) {
    dimensionOverrides = {
      ...dimensionOverrides,
      ...nextParameters,
    };
    rebuildFrameGeometry();
    return model;
  }

  function frontViewCamera(aspect, frameWidthRatio = 0.66) {
    const viewCamera = camera.clone();
    const target = new THREE.Vector3(FRONT_VIEW_CAMERA.target.x, FRONT_VIEW_CAMERA.target.y, FRONT_VIEW_CAMERA.target.z);
    const visibleWidth = model.dimensions.frontWidth / frameWidthRatio;
    const distance = visibleWidth / (2 * Math.tan(THREE.MathUtils.degToRad(viewCamera.fov / 2)) * aspect);
    viewCamera.aspect = aspect;
    viewCamera.position.set(FRONT_VIEW_CAMERA.position.x, FRONT_VIEW_CAMERA.position.y, target.z + distance);
    viewCamera.up.set(0, 1, 0);
    viewCamera.lookAt(target);
    viewCamera.updateProjectionMatrix();
    return { camera: viewCamera, target };
  }

  function setFrontView() {
    controls.autoRotate = false;
    const front = frontViewCamera(camera.aspect);
    controls.target.copy(front.target);
    camera.position.copy(front.camera.position);
    camera.up.copy(front.camera.up);
    camera.lookAt(controls.target);
    controls.update();
    resize();
  }

  function frontViewBlob(type = 'image/jpeg', quality = 0.92, exportOptions = FRONT_VIEW_EXPORT) {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportOptions.width;
    exportCanvas.height = exportOptions.height;
    const exportRenderer = new THREE.WebGLRenderer({
      canvas: exportCanvas,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    exportRenderer.setPixelRatio(1);
    exportRenderer.setSize(exportOptions.width, exportOptions.height, false);
    exportRenderer.outputColorSpace = THREE.SRGBColorSpace;
    const exportCamera = frontViewCamera(exportOptions.width / exportOptions.height, exportOptions.frameWidthRatio).camera;
    exportRenderer.render(scene, exportCamera);
    return new Promise((resolve, reject) => {
      exportCanvas.toBlob((blob) => {
        exportRenderer.dispose();
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error('Could not capture the 3D front view'));
      }, type, quality);
    });
  }

  viewer = {
    model,
    scene,
    camera,
    renderer,
    controls,
    resize,
    destroy,
    setFrontView,
    frontViewBlob,
    applyChildPart,
    applyChildParts,
    applyFrameParameters,
    applyAppearance,
    pixelSummary: () => pixelSummary(renderer, scene, camera),
  };

  window.__vcFrame3D = viewer;
  resize();
  animate();
  return viewer;
}

function clearObject(group) {
  while (group.children.length) {
    const child = group.children.pop();
    child.traverse((object) => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose?.());
      } else {
        object.material?.dispose?.();
      }
    });
  }
}

function addLights(scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa7a1, 2.1));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(-70, -90, 140);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xd7fff4, 1.1);
  rimLight.position.set(90, 60, -80);
  scene.add(rimLight);
}

function addFrameGeometry(group, model, appearance = DEFAULT_APPEARANCE) {
  const materials = createMaterials(appearance);
  const opticalFit = opticalFitFromAppearance(appearance);

  model.components.forEach((component) => {
    if (component.component === 'rim') {
      group.add(applyOpticalFitTransform(createRim(component, materials.rim), component, opticalFit));
      group.add(applyOpticalFitTransform(createLens(component, materials.lens, appearance), component, opticalFit));
      return;
    }
    if (component.component === 'nose_pad') {
      group.add(applyOpticalFitTransform(createNosePadAssembly(component, materials.nose_pad, materials.nose_pad_arm), component, opticalFit));
      return;
    }
    if (component.component === 'hinge_joint') {
      group.add(applyOpticalFitTransform(createHingeJoint(component, materials.hinge_joint), component, opticalFit));
      return;
    }
    if (component.component === 'rim_lock') {
      group.add(applyOpticalFitTransform(createRimLock(component, materials.rim_lock), component, opticalFit));
      return;
    }
    if (component.component === 'end_piece' && (component.plates || component.connectorPoints)) {
      group.add(applyOpticalFitTransform(createEndPieceAssembly(component, materials.end_piece), component, opticalFit));
      return;
    }
    if (component.sideOutlines) {
      group.add(applyOpticalFitTransform(createSideOutlinePart(component, materials[component.component]), component, opticalFit));
      return;
    }
    if (component.points) {
      group.add(applyOpticalFitTransform(createTubePart(component, materials[component.component]), component, opticalFit));
    }
  });
}

function createMaterials(appearance = DEFAULT_APPEARANCE) {
  const frameColor = colorValue(appearance.frameColor, MATERIAL_COLORS.rim);
  const lensColor = colorValue(appearance.lensColor, MATERIAL_COLORS.lens ?? 0xd9ecf1);
  const metalness = finiteOr(appearance.metalness, DEFAULT_APPEARANCE.metalness);
  const baseRoughness = finiteOr(appearance.roughness, DEFAULT_APPEARANCE.roughness);
  const metalMaterial = (component, roughness = baseRoughness, color = frameColor) => new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
  });

  return {
    rim: metalMaterial('rim', Math.max(0.04, baseRoughness - 0.05)),
    nose_bridge: metalMaterial('nose_bridge', baseRoughness),
    nose_pad_arm: metalMaterial('nose_pad_arm', 0.38),
    browbar: metalMaterial('browbar', Math.max(0.04, baseRoughness - 0.07)),
    wire_core: metalMaterial('wire_core', baseRoughness),
    temple: metalMaterial('temple', Math.min(0.86, baseRoughness + 0.04)),
    temple_tip: new THREE.MeshStandardMaterial({
      color: frameColor,
      metalness: Math.max(0.15, metalness * 0.35),
      roughness: Math.min(0.9, baseRoughness + 0.18),
    }),
    end_piece: metalMaterial('end_piece', baseRoughness),
    hinge_joint: metalMaterial('hinge_joint', Math.max(0.08, baseRoughness - 0.04)),
    rim_lock: metalMaterial('rim_lock', baseRoughness),
    nose_pad: new THREE.MeshPhysicalMaterial({
      color: MATERIAL_COLORS.nose_pad,
      transparent: true,
      opacity: 0.58,
      roughness: 0.18,
      transmission: 0.2,
    }),
    lens: new THREE.MeshPhysicalMaterial({
      color: lensColor,
      transparent: true,
      opacity: Math.max(0.08, Math.min(0.62, finiteOr(appearance.lensOpacity, DEFAULT_APPEARANCE.lensOpacity))),
      roughness: 0.12,
      transmission: 0.28,
      side: THREE.DoubleSide,
    }),
  };
}

function colorValue(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().replace(/^#/, '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return fallback;
  return Number.parseInt(normalized, 16);
}

function finiteOr(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function opticalFitFromAppearance(appearance = DEFAULT_APPEARANCE) {
  return {
    faceWrapDeg: clamp(finiteOr(appearance.faceWrapDeg, DEFAULT_APPEARANCE.faceWrapDeg), 0, 18),
    pantoscopicTiltDeg: clamp(finiteOr(appearance.pantoscopicTiltDeg, DEFAULT_APPEARANCE.pantoscopicTiltDeg), -8, 22),
  };
}

function applyOpticalFitTransform(object, component, fit) {
  const wrapper = new THREE.Group();
  wrapper.name = `${object.name || component.id}-optical-fit`;
  wrapper.add(object);

  const sideSign = component.side === 'wearer-right' ? -1 : component.side === 'wearer-left' ? 1 : 0;
  if (sideSign && fit.faceWrapDeg) {
    wrapper.rotation.y = sideSign * THREE.MathUtils.degToRad(fit.faceWrapDeg);
  }

  if (!['temple', 'temple_tip'].includes(component.component) && fit.pantoscopicTiltDeg) {
    wrapper.rotation.x = -THREE.MathUtils.degToRad(fit.pantoscopicTiltDeg);
  }

  return wrapper;
}

function createRim(component, material) {
  if (component.path) {
    const curve = pathCurve(component.path, true);
    const geometry = new THREE.TubeGeometry(curve, Math.max(120, component.path.length), component.tubeRadius, 14, true);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = component.id;
    return mesh;
  }

  const curve = ellipseCurve(component.center, component.radiusX, component.radiusY);
  const geometry = new THREE.TubeGeometry(curve, 144, component.tubeRadius, 14, true);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = component.id;
  return mesh;
}

function createLens(component, material, appearance = DEFAULT_APPEARANCE) {
  const lensPath = component.lensPath ?? ellipseLensPath(component.center, component.radiusX - 2.4, component.radiusY - 2.1);
  const geometry = createLensProfileGeometry(lensPath, appearance);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `${component.id}-lens-former`;
  return mesh;
}

function createLensProfileGeometry(points, appearance = DEFAULT_APPEARANCE) {
  const cleanPoints = points.map((point) => ({ x: point.x, y: point.y }));
  const center = polygonCenter(cleanPoints);
  const bounds = pointBounds(cleanPoints);
  const radiusX = Math.max(1, (bounds.maxX - bounds.minX) / 2);
  const radiusY = Math.max(1, (bounds.maxY - bounds.minY) / 2);
  const halfChordMm = Math.max(radiusX, radiusY);
  const power = finiteOr(appearance.rxPower, DEFAULT_APPEARANCE.rxPower);
  const lensIndex = clamp(finiteOr(appearance.lensIndex, DEFAULT_APPEARANCE.lensIndex), 1.49, 1.9);
  const sag = visualLensSagMm(power, lensIndex, halfChordMm);
  const baseHalfThickness = visualLensBaseThicknessMm(power, lensIndex) / 2;
  const sagMagnitude = Math.abs(sag);
  const edgeHalfThickness = baseHalfThickness + (power < -0.05 ? sagMagnitude * 0.5 : 0);
  const centerHalfThickness = clamp(
    baseHalfThickness + (power > 0.05 ? sagMagnitude * 0.58 : -sagMagnitude * 0.26),
    0.18,
    8,
  );
  const frontCenterIndex = 0;
  const backCenterIndex = cleanPoints.length + 1;
  const positions = [
    center.x,
    center.y,
    centerHalfThickness,
  ];

  cleanPoints.forEach((point) => {
    positions.push(point.x, point.y, edgeHalfThickness);
  });

  positions.push(center.x, center.y, -centerHalfThickness);
  cleanPoints.forEach((point) => {
    positions.push(point.x, point.y, -edgeHalfThickness);
  });

  const indices = [];
  for (let index = 0; index < cleanPoints.length; index += 1) {
    const next = index === cleanPoints.length - 1 ? 1 : index + 2;
    const current = index + 1;
    indices.push(frontCenterIndex, current, next);
    indices.push(backCenterIndex, next + cleanPoints.length + 1, current + cleanPoints.length + 1);
    indices.push(current, current + cleanPoints.length + 1, next);
    indices.push(next, current + cleanPoints.length + 1, next + cleanPoints.length + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function visualLensSagMm(power, lensIndex, halfChordMm) {
  const opticalPower = Math.abs(finiteOr(power, 0));
  if (opticalPower < 0.05) {
    return 0;
  }
  const indexOffset = Math.max(0.2, finiteOr(lensIndex, 1.5) - 1);
  const radiusMeters = indexOffset / opticalPower;
  const chordMeters = Math.min(Math.max(halfChordMm, 1) / 1000, radiusMeters * 0.9);
  const sagMeters = radiusMeters - Math.sqrt(Math.max(0, (radiusMeters ** 2) - (chordMeters ** 2)));
  return Math.sign(power) * clamp(sagMeters * 1000, 0, 7.2);
}

function visualLensBaseThicknessMm(power, lensIndex) {
  const opticalPower = Math.abs(finiteOr(power, 0));
  const indexFactor = 1.5 / clamp(finiteOr(lensIndex, 1.5), 1.49, 1.9);
  return clamp(1.22 + opticalPower * 0.1 * indexFactor, 1.2, 2.35);
}

function ellipseLensPath(center, radiusX, radiusY) {
  const points = [];
  const count = 96;
  for (let index = 0; index < count; index += 1) {
    const theta = (index / count) * Math.PI * 2;
    points.push({
      x: center.x + Math.cos(theta) * radiusX,
      y: center.y + Math.sin(theta) * radiusY,
    });
  }
  return points;
}

function polygonCenter(points) {
  const total = points.reduce((accumulator, point) => ({
    x: accumulator.x + point.x,
    y: accumulator.y + point.y,
  }), { x: 0, y: 0 });
  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
}

function pointBounds(points) {
  return points.reduce((bounds, point) => ({
    minX: Math.min(bounds.minX, point.x),
    maxX: Math.max(bounds.maxX, point.x),
    minY: Math.min(bounds.minY, point.y),
    maxY: Math.max(bounds.maxY, point.y),
  }), {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createTubePart(component, material) {
  const points = component.points;
  const curve = pathCurve(component.points, false);
  const geometry = new THREE.TubeGeometry(curve, Math.max(24, points.length * 24), component.tubeRadius ?? 1, 12, false);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = component.id;
  return mesh;
}

function createEndPieceAssembly(component, material) {
  const group = new THREE.Group();
  group.name = component.id;

  if (component.connectorPoints) {
    const curve = pathCurve(component.connectorPoints, false);
    const geometry = new THREE.TubeGeometry(
      curve,
      Math.max(36, component.connectorPoints.length * 22),
      component.tubeRadius ?? 0.5,
      10,
      false,
    );
    const connector = new THREE.Mesh(geometry, material);
    connector.name = `${component.id}-connector`;
    group.add(connector);
  }

  component.plates?.forEach((plate, index) => {
    const mesh = createBoxMesh(plate, material);
    mesh.name = `${component.id}-plate-${index + 1}`;
    group.add(mesh);
  });

  return group;
}

function createSideOutlinePart(component, material) {
  const group = new THREE.Group();
  group.name = component.id;

  if (component.rootConnectorPoints?.length >= 2) {
    const curve = pathCurve(component.rootConnectorPoints, false);
    const geometry = new THREE.TubeGeometry(
      curve,
      Math.max(24, component.rootConnectorPoints.length * 20),
      component.rootConnectorRadius ?? component.tubeRadius ?? 0.75,
      10,
      false,
    );
    const connector = new THREE.Mesh(geometry, material);
    connector.name = `${component.id}-hinge-sleeve-connector`;
    group.add(connector);
  }

  component.sideOutlines.forEach((outline) => {
    const mesh = createSideOutlineMesh(outline, material);
    mesh.name = `${component.id}-${outline.id}`;
    group.add(mesh);
  });

  return group;
}

function createSideOutlineMesh(outline, material) {
  const halfThickness = outline.source?.surfaceHalfThicknessMm ?? 0.45;
  const contour = outline.points.map((point) => new THREE.Vector2(point.z, point.y));
  const triangles = THREE.ShapeUtils.triangulateShape(contour, []);
  const positions = [];
  const indices = [];
  const pointCount = outline.points.length;

  outline.points.forEach((point) => {
    positions.push(point.x + halfThickness, point.y, point.z);
  });
  outline.points.forEach((point) => {
    positions.push(point.x - halfThickness, point.y, point.z);
  });

  triangles.forEach(([a, b, c]) => {
    indices.push(a, b, c);
    indices.push(c + pointCount, b + pointCount, a + pointCount);
  });

  for (let index = 0; index < pointCount; index += 1) {
    const nextIndex = (index + 1) % pointCount;
    indices.push(index, nextIndex, nextIndex + pointCount);
    indices.push(index, nextIndex + pointCount, index + pointCount);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return new THREE.Mesh(geometry, material);
}

function pathCurve(points, closed) {
  const vectors = points.map((point) => new THREE.Vector3(point.x, point.y, point.z));
  return new THREE.CatmullRomCurve3(vectors, closed, 'centripetal', closed ? 0.12 : 0.4);
}

function shapeFromPath(points) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => {
    shape.lineTo(point.x, point.y);
  });
  shape.closePath();
  return shape;
}

function createNosePadAssembly(component, material, armMaterial) {
  const group = new THREE.Group();
  group.name = component.id;

  const geometry = new THREE.SphereGeometry(1, 28, 18);
  const mesh = new THREE.Mesh(geometry, nosePadMaterialForComponent(component, material));
  mesh.name = `${component.id}-pad`;
  mesh.position.set(component.center.x, component.center.y, component.center.z);
  mesh.scale.set(component.radius.x, component.radius.y, component.radius.z);
  mesh.rotation.z = component.side === 'wearer-right' ? -0.28 : 0.28;
  mesh.rotation.y = component.side === 'wearer-right' ? 0.3 : -0.3;
  group.add(mesh);

  if (component.armPoints) {
    const curve = pathCurve(component.armPoints, false);
    const armGeometry = new THREE.TubeGeometry(curve, Math.max(32, component.armPoints.length * 18), component.armTubeRadius, 10, false);
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.name = `${component.id}-nose-arm`;
    group.add(arm);

    const footGeometry = new THREE.SphereGeometry(component.armFootRadius ?? 0.7, 20, 12);
    const foot = new THREE.Mesh(footGeometry, armMaterial);
    foot.name = `${component.id}-nose-arm-foot`;
    const footPoint = component.armPoints[0];
    foot.position.set(footPoint.x, footPoint.y, footPoint.z);
    foot.scale.set(1.05, 0.65, 0.5);
    group.add(foot);

    const bossGeometry = new THREE.SphereGeometry(component.armBossRadius ?? 0.8, 20, 12);
    const boss = new THREE.Mesh(bossGeometry, armMaterial);
    boss.name = `${component.id}-nose-arm-boss`;
    const bossPoint = component.armPoints.at(-1);
    boss.position.set(bossPoint.x, bossPoint.y, bossPoint.z);
    boss.scale.set(1.0, 0.72, 0.65);
    group.add(boss);
  }

  return group;
}

function nosePadMaterialForComponent(component, material) {
  const appearance = component.appearance ?? {};
  if (!appearance.color && appearance.opacity == null) {
    return material;
  }
  const next = material.clone();
  next.color.setHex(colorValue(appearance.color, MATERIAL_COLORS.nose_pad));
  if (appearance.opacity != null) {
    next.opacity = Math.max(0.18, Math.min(1, Number(appearance.opacity)));
    next.transparent = next.opacity < 1;
  }
  return next;
}

function createHingeJoint(component, material) {
  const group = new THREE.Group();
  group.name = component.id;

  component.leaves.forEach((leaf, index) => {
    const mesh = createBoxMesh(leaf, material);
    mesh.name = `${component.id}-leaf-${index + 1}`;
    group.add(mesh);
  });

  component.pivotCenters.forEach((pivot, index) => {
    const pivotMesh = createPivotCylinder(pivot, material);
    pivotMesh.name = `${component.id}-pivot-${index + 1}`;
    group.add(pivotMesh);
  });

  return group;
}

function createRimLock(component, material) {
  const group = new THREE.Group();
  group.name = component.id;

  component.clampPlates.forEach((plate, index) => {
    const mesh = createBoxMesh(plate, material);
    mesh.name = `${component.id}-clamp-${index + 1}`;
    group.add(mesh);
  });

  component.frontRibs?.forEach((rib, index) => {
    const ribMesh = createBoxMesh(rib, material);
    ribMesh.name = `${component.id}-front-rib-${index + 1}`;
    group.add(ribMesh);
  });

  component.lockScrewCenters.forEach((screw, index) => {
    const screwMesh = createPivotCylinder(screw, material);
    screwMesh.name = `${component.id}-screw-${index + 1}`;
    group.add(screwMesh);
  });

  return group;
}

function createBoxMesh(part, material) {
  const geometry = new THREE.BoxGeometry(part.size.x, part.size.y, part.size.z);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(part.center.x, part.center.y, part.center.z);
  return mesh;
}

function createPivotCylinder(pivot, material) {
  const geometry = new THREE.CylinderGeometry(pivot.radius, pivot.radius, pivot.depth, 28);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(pivot.x, pivot.y, pivot.z);
  if (pivot.axis === 'x') {
    mesh.rotation.z = Math.PI / 2;
  } else if (pivot.axis === 'z') {
    mesh.rotation.x = Math.PI / 2;
  }
  return mesh;
}

function createBoxPart(component, material) {
  const geometry = new THREE.BoxGeometry(component.size.x, component.size.y, component.size.z);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = component.id;
  mesh.position.set(component.center.x, component.center.y, component.center.z);
  mesh.rotation.y = component.side === 'wearer-right' ? 0.08 : -0.08;
  return mesh;
}

function ellipseCurve(center, radiusX, radiusY) {
  const points = [];
  const count = 96;
  for (let index = 0; index < count; index += 1) {
    const theta = (index / count) * Math.PI * 2;
    const roundness = 1 - 0.08 * Math.cos(theta * 2);
    points.push(new THREE.Vector3(
      center.x + Math.cos(theta) * radiusX * roundness,
      center.y + Math.sin(theta) * radiusY * (1 + 0.04 * Math.cos(theta)),
      center.z,
    ));
  }
  return new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.35);
}

function addSourceMarker(group) {
  const grid = new THREE.GridHelper(176, 8, 0x9aaca4, 0xc8d2ce);
  grid.name = 'source-scale-grid';
  grid.position.set(0, -27, -58);
  grid.rotation.x = Math.PI / 2;
  group.add(grid);
}

function updateSourceMeta(panel, model) {
  const meta = panel.querySelector('.frame3d-meta');
  if (!meta) {
    return;
  }

  const dimensions = model.dimensions;
  panel.dataset.lensWidth = formatDimension(dimensions.lensWidth);
  panel.dataset.lensHeight = formatDimension(dimensions.lensHeight);
  panel.dataset.bridgeWidth = formatDimension(dimensions.bridgeWidth);
  panel.dataset.frontWidth = formatDimension(dimensions.frontWidth);
  panel.dataset.rimThickness = formatDimension(dimensions.rimThickness ?? (dimensions.rimTubeRadius * 2));
  panel.dataset.templeThickness = formatDimension(dimensions.templeThickness ?? (dimensions.templeTubeRadius * 2));
  panel.dataset.noseBridgeSource = dimensions.noseBridgeSource ?? '';
  panel.dataset.noseBridgeDetailWidth = formatDimension(dimensions.noseBridgeDetailWidth);
  panel.dataset.templeSource = dimensions.templeSource ?? '';
  panel.dataset.templeLength = formatDimension(dimensions.templeLength);
  panel.dataset.templeTipSource = dimensions.templeTipSource ?? '';
  panel.dataset.templeTipLength = formatDimension(dimensions.templeTipLength);
  panel.dataset.templeTipAngle = formatDimension(dimensions.templeTipAngleDeg);
  panel.dataset.nosePadSource = dimensions.nosePadSource ?? '';
  panel.dataset.nosePadColor = dimensions.nosePadColor ?? '';
  panel.dataset.noseArmSource = dimensions.noseArmSource ?? '';
  panel.dataset.noseArmLengthClass = dimensions.noseArmLengthClass ?? '';
  const frontBars = model.components.filter((component) => ['browbar', 'wire_core'].includes(component.component));
  const browbar = frontBars.find((component) => component.component === 'browbar');
  panel.dataset.frontBarComponents = frontBars.map((component) => component.component).join(',');
  panel.dataset.frontBarCount = String(frontBars.length);
  panel.dataset.browbarSource = browbar?.source?.type ?? (browbar ? 'CAD' : '');
  panel.dataset.browbarLabelId = browbar?.source?.labelId ?? '';
  const chips = [
    'CAD/PDF',
    `${formatDimension(dimensions.lensWidth)}-${formatDimension(dimensions.nominalBridgeWidth)}-${formatDimension(dimensions.templeLength)}`,
    `${formatDimension(dimensions.frontWidth)} front`,
    `${formatDimension(dimensions.topViewDepth)} top`,
    dimensions.noseBridgeSource,
    dimensions.nosePadSource ?? 'Default nose pad',
    dimensions.noseArmSource ?? 'Default nosearm',
    `${dimensions.templeSource}-${formatDimension(dimensions.templeLength)}`,
    `${dimensions.templeTipSource}-${formatDimension(dimensions.templeTipLength)}`,
  ];

  meta.replaceChildren(...chips.map((chip) => {
    const span = document.createElement('span');
    span.textContent = chip;
    return span;
  }));
}

function formatDimension(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function addComponentLabels(group) {
  const labels = [
    ['Right rim', [-58, 31, 4], '#167f78'],
    ['Left rim', [58, 31, 4], '#167f78'],
    ['Nose bridge', [0, 28, 4], '#6b59b5'],
    ['Nose pads', [0, -19, -2], '#4d8b87'],
    ['Hinges', [0, 9, -4], '#a93d38'],
    ['Temples', [0, 13, -78], '#b57924'],
    ['Temple tips', [0, -24, -140], '#915f1a'],
    ['Browbar', [0, 34, -2], '#2f3b38'],
  ];

  labels.forEach(([text, position, color]) => {
    const sprite = createTextSprite(text, color);
    sprite.position.set(...position);
    group.add(sprite);
  });
}

function createTextSprite(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(255, 255, 255, 0.88)';
  context.strokeStyle = color;
  context.lineWidth = 4;
  roundedRect(context, 8, 12, canvas.width - 16, canvas.height - 24, 18);
  context.fill();
  context.stroke();
  context.fillStyle = '#1f2724';
  context.font = '700 30px Inter, system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(23, 5.75, 1);
  sprite.renderOrder = 10;
  return sprite;
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function pixelSummary(renderer, scene, camera) {
  renderer.render(scene, camera);
  const gl = renderer.getContext();
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  let varied = 0;
  const step = 64;
  for (let index = 0; index < pixels.length; index += step * 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    if (Math.abs(red - 232) + Math.abs(green - 238) + Math.abs(blue - 235) > 24) {
      varied += 1;
    }
  }
  return { width, height, varied };
}
