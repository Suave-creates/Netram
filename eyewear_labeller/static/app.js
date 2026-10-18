import {
  addLabel,
  clearSelection,
  createInitialState,
  deleteSelection,
  groupSelection,
  labelBounds,
  labelsForRendering,
  moveLabel,
  restoreSnapshot,
  resizeRectLabel,
  selectedLabels,
  serializeState,
  snapshotState,
  toggleSelection,
  updatePolygonPoint,
} from './label-state.mjs';
import { frontViewFileName, initFrame3DViewer } from './frame-3d-viewer.mjs?v=20260620-solidtip1';

const COMPONENT_LABELS = {
  rim: 'Rim',
  nose_bridge: 'Nose bridge',
  nose_pad: 'Nose pad',
  browbar: 'Browbar',
  temple: 'Temple',
  temple_tip: 'Temple tip',
  end_piece: 'End piece',
  hinge_joint: 'Hinge / joint',
  rim_lock: 'Rim lock',
  lens_former: 'Lens / former',
  wire_core: 'Wire core',
  dimension_reference: 'Dimension ref',
  view_label: 'View label',
  other: 'Other',
};

const dom = {
  modelSelect: document.querySelector('#modelSelect'),
  saveState: document.querySelector('#saveState'),
  modeButtons: [...document.querySelectorAll('[data-mode]')],
  workspaceViewButtons: [...document.querySelectorAll('[data-workspace-view]')],
  componentSelect: document.querySelector('#componentSelect'),
  viewSelect: document.querySelector('#viewSelect'),
  groupName: document.querySelector('#groupName'),
  groupButton: document.querySelector('#groupButton'),
  deleteButton: document.querySelector('#deleteButton'),
  saveButton: document.querySelector('#saveButton'),
  configuratorLink: document.querySelector('#configuratorLink'),
  partsLink: document.querySelector('#partsLink'),
  matcherLink: document.querySelector('#matcherLink'),
  lenskartMatcherLink: document.querySelector('#lenskartMatcherLink'),
  workspace: document.querySelector('.workspace'),
  viewport: document.querySelector('#viewport'),
  stage: document.querySelector('#stage'),
  image: document.querySelector('#sourceImage'),
  overlay: document.querySelector('#overlay'),
  frame3dPanel: document.querySelector('#frame3dPanel'),
  frame3dCanvas: document.querySelector('#frame3dCanvas'),
  labelInspectorView: document.querySelector('#labelInspectorView'),
  partDrawer: document.querySelector('#partDrawer'),
  partDrawerToggle: document.querySelector('#partDrawerToggle'),
  partDrawerContent: document.querySelector('#partDrawerContent'),
  partDrawerStatus: document.querySelector('#partDrawerStatus'),
  partDrawerModuleList: document.querySelector('#partDrawerModuleList'),
  noseBridgePartSelect: document.querySelector('#noseBridgePartSelect'),
  noseBridgePartList: document.querySelector('#noseBridgePartList'),
  noseBridgePartStatus: document.querySelector('#noseBridgePartStatus'),
  noseBridgeCompare: document.querySelector('#noseBridgeCompare'),
  noseBridgeBeforeButton: document.querySelector('#noseBridgeBeforeButton'),
  noseBridgeAfterButton: document.querySelector('#noseBridgeAfterButton'),
  noseBridgeCompareStatus: document.querySelector('#noseBridgeCompareStatus'),
  frame3dBuildProgress: document.querySelector('#frame3dBuildProgress'),
  frame3dBuildProgressLabel: document.querySelector('#frame3dBuildProgressLabel'),
  frame3dBuildProgressPercent: document.querySelector('#frame3dBuildProgressPercent'),
  frame3dBuildProgressFill: document.querySelector('#frame3dBuildProgressFill'),
  frontViewButton: document.querySelector('#frontViewButton'),
  share3dButton: document.querySelector('#share3dButton'),
  download3dButton: document.querySelector('#download3dButton'),
  labelsLayer: document.querySelector('#labelsLayer'),
  draftLayer: document.querySelector('#draftLayer'),
  selectionCount: document.querySelector('#selectionCount'),
  selectionDetails: document.querySelector('#selectionDetails'),
  groupCount: document.querySelector('#groupCount'),
  groupList: document.querySelector('#groupList'),
  labelCount: document.querySelector('#labelCount'),
  labelList: document.querySelector('#labelList'),
  undoButton: document.querySelector('#undoButton'),
};

const MAX_UNDO_STEPS = 100;
const PART_DRAWER_TYPES = ['nose_bridge', 'temple', 'temple_tip', 'nosearm', 'nose_pad'];
const PART_DRAWER_LABELS = {
  nose_bridge: 'Nose bridge',
  temple: 'Temples',
  temple_tip: 'Acetate tips',
  nosearm: 'Nosearms',
  nose_pad: 'Nose pads',
};

let project = null;
let state = null;
let mode = 'select';
let transform = { x: 24, y: 24, scale: 0.42 };
let drawing = null;
let editDrag = null;
let panStart = null;
let pointerCache = new Map();
let lastPinchDistance = 0;
let undoStack = [];
let workspaceView = 'labels';
let frame3dViewer = null;
let labelsChangedSince3DRender = false;
let noseBridgeParts = [];
let partLibrariesByType = new Map();
let selectedPartIdsByType = {};
let selectedNoseBridgePartId = null;
let renderedNoseBridgePartId = null;
let beforeNoseBridgePartId = null;
let afterNoseBridgePartId = null;
let noseBridgeCompareMode = 'after';
let isPartDrawerCollapsed = false;
let activePartDrawerType = 'nose_bridge';
let active3DBuildId = 0;

const DEFAULT_NOSE_BRIDGE_PART_BY_MODEL = {
  'VC S19000': 'nose_bridge--ss-26--vc-s5158-nb',
  'VC S19001': 'nose_bridge--ss-26--vc-s5158-nb',
  'VC S19002': 'nose_bridge--ss-26--vc-s13110-nb',
  'VC S19003': 'nose_bridge--ss-26--vc-s13110-nb',
  'VC S19004': 'nose_bridge--ss-26--vc-s13110-nb',
  'VC S19005': 'nose_bridge--ss-26--vc-s5158-nb',
};

const DEFAULT_CHILD_PART_NAME_BY_MODEL = {
  'VC S19000': { temple: 'T4', temple_tip: 'TT1-Bend' },
  'VC S19001': { temple: 'T1', temple_tip: 'TT4-Bend' },
  'VC S19002': { temple: 'T2', temple_tip: 'TT1-Bend' },
  'VC S19003': { temple: 'T5', temple_tip: 'TT3-Bend' },
  'VC S19004': { temple: 'T2', temple_tip: 'TT1-Bend' },
  'VC S19005': { temple: 'T4', temple_tip: 'TT1-Bend' },
};

init();

async function init() {
  bindEvents();
  await loadProject();
}

async function loadProject(modelId = null) {
  setSaveState('Loading');
  const projectUrl = modelId ? `/api/project?model=${encodeURIComponent(modelId)}` : '/api/project';
  project = await fetchJson(projectUrl);
  const memory = await fetchJson(project.memoryUrl);
  state = createInitialState(memory);

  resetProjectSession();
  populateModelSelect(project.models);
  populateComponentSelect(project.components);
  await loadPartDrawerLibraries();
  updateWorkspaceAvailability();
  document.title = `Netram - ${project.modelId} Labeller`;
  dom.viewport.setAttribute('aria-label', `${project.modelId} drawing workspace`);
  dom.frame3dPanel.setAttribute('aria-label', `${project.modelId} 3D frame`);
  dom.image.alt = `${project.modelId} source drawing`;
  dom.image.src = project.source.image;
  dom.configuratorLink.href = project.configuratorUrl;
  dom.partsLink.href = project.partsUrl;
  dom.matcherLink.href = project.matcherUrl;
  dom.lenskartMatcherLink.href = project.lenskartMatcherUrl;
  if (dom.image.complete && dom.image.naturalWidth) {
    onSourceImageLoad();
  }

  setSaveState('Loaded');
  render();
}

function resetProjectSession() {
  active3DBuildId += 1;
  hide3DBuildProgress();
  clearNoseBridgeCompare();
  renderedNoseBridgePartId = null;
  partLibrariesByType = new Map();
  selectedPartIdsByType = {};
  isPartDrawerCollapsed = false;
  activePartDrawerType = 'nose_bridge';
  drawing = null;
  editDrag = null;
  panStart = null;
  pointerCache.clear();
  lastPinchDistance = 0;
  undoStack = [];
  labelsChangedSince3DRender = false;
  setMode('select');
  if (frame3dViewer) {
    frame3dViewer.destroy();
    frame3dViewer = null;
  }
  if (workspaceView === '3d') {
    setWorkspaceView('labels');
  }
  updatePartDrawerShell();
}

function updateWorkspaceAvailability() {
  const threeDButton = dom.workspaceViewButtons.find((button) => button.dataset.workspaceView === '3d');
  if (!threeDButton) {
    return;
  }
  threeDButton.disabled = !project.supports3dModel;
  if (!project.supports3dModel && workspaceView === '3d') {
    setWorkspaceView('labels');
  }
}

function onSourceImageLoad() {
  const { naturalWidth, naturalHeight } = dom.image;
  dom.stage.style.width = `${naturalWidth}px`;
  dom.stage.style.height = `${naturalHeight}px`;
  dom.image.width = naturalWidth;
  dom.image.height = naturalHeight;
  dom.overlay.setAttribute('width', String(naturalWidth));
  dom.overlay.setAttribute('height', String(naturalHeight));
  dom.overlay.setAttribute('viewBox', `0 0 ${naturalWidth} ${naturalHeight}`);
  fitToViewport();
  render();
}

function populateModelSelect(models) {
  dom.modelSelect.replaceChildren(...models.map((model) => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = model.title;
    return option;
  }));
  dom.modelSelect.value = project.modelId;
}

function populateComponentSelect(components) {
  dom.componentSelect.replaceChildren(...components.map((component) => {
    const option = document.createElement('option');
    option.value = component;
    option.textContent = COMPONENT_LABELS[component] ?? component;
    return option;
  }));
  dom.componentSelect.value = 'rim';
}

function bindEvents() {
  dom.modelSelect.addEventListener('change', async () => {
    const modelId = dom.modelSelect.value;
    if (project && modelId === project.modelId) {
      return;
    }
    if (dom.saveState.textContent === 'Unsaved') {
      const saved = await saveMemory();
      if (!saved) {
        dom.modelSelect.value = project.modelId;
        return;
      }
    }
    await loadProject(modelId);
  });

  dom.image.addEventListener('load', onSourceImageLoad);
  dom.image.addEventListener('error', () => setSaveState('Source image missing'));

  dom.modeButtons.forEach((button) => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  });
  dom.workspaceViewButtons.forEach((button) => {
    button.addEventListener('click', () => setWorkspaceView(button.dataset.workspaceView));
  });

  dom.groupButton.addEventListener('click', () => {
    commitState(groupSelection(state, dom.componentSelect.value, dom.groupName.value.trim()));
  });

  dom.deleteButton.addEventListener('click', () => {
    commitState(deleteSelection(state));
  });

  dom.undoButton.addEventListener('click', undoLastChange);
  dom.saveButton.addEventListener('click', saveMemory);
  dom.frontViewButton.addEventListener('click', () => {
    if (frame3dViewer) {
      frame3dViewer.setFrontView();
    }
  });
  dom.share3dButton.addEventListener('click', share3dFrontView);
  dom.download3dButton.addEventListener('click', download3dFrontView);
  dom.noseBridgePartSelect.addEventListener('change', () => {
    selectNoseBridgePart(dom.noseBridgePartSelect.value);
  });
  dom.partDrawerToggle.addEventListener('click', () => {
    isPartDrawerCollapsed = !isPartDrawerCollapsed;
    updatePartDrawerShell();
    window.requestAnimationFrame(() => frame3dViewer?.resize());
  });
  dom.partDrawerContent.addEventListener('click', (event) => {
    const sectionToggle = event.target.closest('.part-section-toggle[data-part-type]');
    if (sectionToggle) {
      setActivePartDrawerType(sectionToggle.dataset.partType);
      return;
    }
    const card = event.target.closest('.part-card[data-part-type][data-part-id]');
    if (!card) {
      return;
    }
    selectDrawerPart(card.dataset.partType, card.dataset.partId);
  });
  dom.noseBridgeBeforeButton.addEventListener('click', () => showNoseBridgeCompareMode('before'));
  dom.noseBridgeAfterButton.addEventListener('click', () => showNoseBridgeCompareMode('after'));

  dom.viewport.addEventListener('wheel', onWheel, { passive: false });
  dom.viewport.addEventListener('pointerdown', onPointerDown);
  dom.viewport.addEventListener('pointermove', onPointerMove);
  dom.viewport.addEventListener('pointerup', onPointerUp);
  dom.viewport.addEventListener('pointercancel', onPointerUp);
  dom.viewport.addEventListener('dblclick', finishPolygon);
  dom.viewport.addEventListener('contextmenu', (event) => event.preventDefault());

  window.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
      if (!isTextEditingTarget(event.target)) {
        event.preventDefault();
        undoLastChange();
      }
      return;
    }
    if (isTextEditingTarget(event.target)) {
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      commitState(deleteSelection(state));
    }
    if (event.key === 'Escape') {
      drawing = null;
      state = clearSelection(state);
      render();
    }
    if (event.key === 'Enter' && drawing?.type === 'polygon') {
      finishPolygon(event);
    }
  });
}

function setWorkspaceView(nextView) {
  workspaceView = nextView;
  dom.viewport.hidden = workspaceView !== 'labels';
  dom.frame3dPanel.hidden = workspaceView !== '3d';
  dom.labelInspectorView.hidden = workspaceView === '3d';
  dom.partDrawer.hidden = workspaceView !== '3d';
  if (workspaceView !== '3d') {
    isPartDrawerCollapsed = false;
  }
  updatePartDrawerShell();
  dom.workspaceViewButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.workspaceView === workspaceView);
  });

  if (workspaceView === '3d') {
    if (frame3dViewer && labelsChangedSince3DRender) {
      if (confirm3DRefreshAfterLabelChange()) {
        frame3dViewer.destroy();
        frame3dViewer = null;
      }
      labelsChangedSince3DRender = false;
    }
    if (!frame3dViewer) {
      try {
        frame3dViewer = initFrame3DViewer({
          canvas: dom.frame3dCanvas,
          panel: dom.frame3dPanel,
          modelId: project.modelId,
          labelMemory: currentLabelMemoryFor3D(),
          childPartOverrides: selected3DChildPartOverrides(),
        });
        labelsChangedSince3DRender = false;
        window.__vcFrame3DError = null;
      } catch (error) {
        window.__vcFrame3DError = {
          message: error.message,
          stack: error.stack,
        };
        console.error('3D viewer failed to initialize', error);
      }
    }
    if (frame3dViewer) {
      applySelected3DChildParts();
      window.requestAnimationFrame(() => frame3dViewer.resize());
    }
  }
}

function confirm3DRefreshAfterLabelChange() {
  return window.confirm('Labels changed. Rebuild the 3D render now?');
}

function currentLabelMemoryFor3D() {
  return {
    labels: state.labels.map((label) => ({
      id: label.id,
      component: label.component,
      type: label.type,
      view: label.view,
      points: label.points.map((point) => ({ x: point.x, y: point.y })),
      groupId: label.groupId ?? null,
      notes: label.notes ?? '',
    })),
    groups: state.groups.map((group) => ({
      id: group.id,
      component: group.component,
      name: group.name,
      labelIds: [...group.labelIds],
      notes: group.notes ?? '',
    })),
  };
}

async function loadPartDrawerLibraries() {
  dom.noseBridgePartSelect.disabled = true;
  dom.noseBridgePartStatus.textContent = 'Loading';
  try {
    const libraries = await Promise.all(PART_DRAWER_TYPES.map(async (partType) => [
      partType,
      await fetchJson(`/api/child-parts?type=${encodeURIComponent(partType)}`),
    ]));
    partLibrariesByType = new Map(libraries);
    const noseBridgeLibrary = partLibrariesByType.get('nose_bridge');
    noseBridgeParts = partsForDrawer(noseBridgeLibrary).filter((part) => part.configurator?.canPreviewOnFrame);
    selectedNoseBridgePartId = DEFAULT_NOSE_BRIDGE_PART_BY_MODEL[project.modelId] ?? noseBridgeParts[0]?.id ?? null;
    selectedPartIdsByType = Object.fromEntries(PART_DRAWER_TYPES.map((partType) => {
      const parts = partsForDrawer(partLibrariesByType.get(partType));
      const selectedPartId = partType === 'nose_bridge'
        ? selectedNoseBridgePartId
        : defaultPartIdForType(partType, parts);
      return [partType, selectedPartId];
    }));
    populateNoseBridgePartSelect();
    updateNoseBridgePartStatus(selectedNoseBridgePart());
    renderPartDrawer();
  } catch (error) {
    partLibrariesByType = new Map();
    selectedPartIdsByType = {};
    noseBridgeParts = [];
    selectedNoseBridgePartId = null;
    dom.noseBridgePartSelect.replaceChildren();
    dom.noseBridgePartStatus.textContent = 'Unavailable';
    renderPartDrawer();
    console.error('Could not load nose bridge parts', error);
  }
}

function populateNoseBridgePartSelect() {
  dom.noseBridgePartSelect.replaceChildren(...noseBridgeParts.map((part) => {
    const option = document.createElement('option');
    option.value = part.id;
    option.textContent = part.name;
    return option;
  }));
  dom.noseBridgePartSelect.disabled = noseBridgeParts.length === 0 || !project.supports3dModel;
  if (selectedNoseBridgePartId) {
    dom.noseBridgePartSelect.value = selectedNoseBridgePartId;
  }
  updateNoseBridgeCompareControls();
  renderPartDrawer();
}

function renderPartDrawer() {
  if (!dom.noseBridgePartList || !dom.partDrawerModuleList) {
    return;
  }
  dom.partDrawerContent.dataset.activePartType = activePartDrawerType ?? 'none';
  updateStaticPartDrawerSection('nose_bridge');
  renderPartCardList(dom.noseBridgePartList, 'nose_bridge', noseBridgeParts);
  dom.partDrawerModuleList.replaceChildren(...PART_DRAWER_TYPES
    .filter((partType) => partType !== 'nose_bridge')
    .map((partType) => createPartDrawerSection(partType)));
  updatePartDrawerStatus();
}

function createPartDrawerSection(partType) {
  const section = document.createElement('section');
  section.className = 'part-drawer-section';
  section.classList.toggle('is-expanded', activePartDrawerType === partType);
  section.dataset.partType = partType;

  const heading = document.createElement('div');
  heading.className = 'part-section-heading';
  const title = document.createElement('button');
  title.type = 'button';
  title.className = 'part-section-toggle';
  title.dataset.partType = partType;
  title.setAttribute('aria-expanded', String(activePartDrawerType === partType));
  title.setAttribute('aria-controls', `${partType}PartList`);
  const titleText = document.createElement('span');
  titleText.textContent = PART_DRAWER_LABELS[partType] ?? partType;
  title.append(titleText);
  const count = document.createElement('span');
  const parts = partsForDrawer(partLibrariesByType.get(partType));
  count.className = 'part-count';
  count.textContent = String(parts.length);
  heading.append(title, count);

  const list = document.createElement('div');
  list.className = 'part-card-list is-compact';
  list.id = `${partType}PartList`;
  list.hidden = activePartDrawerType !== partType;
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', `${PART_DRAWER_LABELS[partType] ?? partType} parts`);
  renderPartCardList(list, partType, parts);

  section.append(heading, list);
  return section;
}

function updateStaticPartDrawerSection(partType) {
  const section = dom.partDrawerContent?.querySelector(`.part-drawer-section[data-part-type="${partType}"]`);
  if (!section) {
    return;
  }
  const expanded = activePartDrawerType === partType;
  section.classList.toggle('is-expanded', expanded);
  const toggle = section.querySelector('.part-section-toggle');
  toggle?.setAttribute('aria-expanded', String(expanded));
  const list = section.querySelector('.part-card-list');
  if (list) {
    list.hidden = !expanded;
  }
}

function setActivePartDrawerType(partType) {
  if (!PART_DRAWER_TYPES.includes(partType)) {
    return;
  }
  activePartDrawerType = activePartDrawerType === partType ? null : partType;
  renderPartDrawer();
}

function renderPartCardList(list, partType, parts) {
  list.replaceChildren(...parts.map((part) => createPartCard(partType, part)));
}

function createPartCard(partType, part) {
  const selected = selectedPartIdsByType[partType] === part.id;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'part-card';
  button.classList.toggle('is-selected', selected);
  button.dataset.partType = partType;
  button.dataset.partId = part.id;
  button.setAttribute('role', 'option');
  button.setAttribute('aria-selected', String(selected));

  const media = document.createElement('span');
  media.className = 'part-card-media';
  const fallbackPreviewUrl = generatedPartPreviewUrl(partType, part);
  const previewUrl = part.assets?.previewUrl ?? part.assets?.svgUrl ?? fallbackPreviewUrl;
  if (previewUrl) {
    media.dataset.initials = partInitials(part);
    const image = document.createElement('img');
    image.src = previewUrl;
    image.alt = '';
    image.loading = 'lazy';
    image.addEventListener('error', () => {
      if (fallbackPreviewUrl && image.src !== fallbackPreviewUrl) {
        image.src = fallbackPreviewUrl;
        return;
      }
      image.remove();
      delete media.dataset.initials;
      media.textContent = partInitials(part);
    });
    media.append(image);
  } else {
    media.textContent = partInitials(part);
  }

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

function selectDrawerPart(partType, partId) {
  activePartDrawerType = partType;
  if (partType === 'nose_bridge') {
    selectNoseBridgePart(partId);
    return;
  }
  selectedPartIdsByType = {
    ...selectedPartIdsByType,
    [partType]: partId,
  };
  renderPartDrawer();
  applySelectedDrawerPart(partType);
}

function selectNoseBridgePart(partId) {
  activePartDrawerType = 'nose_bridge';
  const previousPartId = renderedNoseBridgePartId ?? selectedNoseBridgePartId;
  selectedNoseBridgePartId = partId;
  selectedPartIdsByType = {
    ...selectedPartIdsByType,
    nose_bridge: partId,
  };
  if (previousPartId && previousPartId !== selectedNoseBridgePartId) {
    beforeNoseBridgePartId = previousPartId;
    afterNoseBridgePartId = selectedNoseBridgePartId;
    noseBridgeCompareMode = 'after';
  }
  if (dom.noseBridgePartSelect.value !== partId) {
    dom.noseBridgePartSelect.value = partId;
  }
  renderPartDrawer();
  applySelectedNoseBridgePart();
}

function partsForDrawer(library) {
  return Array.isArray(library?.parts) ? library.parts : [];
}

function defaultPartIdForType(partType, parts) {
  const defaultName = DEFAULT_CHILD_PART_NAME_BY_MODEL[project.modelId]?.[partType];
  if (!defaultName) {
    return parts[0]?.id ?? null;
  }
  return parts.find((part) => part.name === defaultName || part.name.startsWith(defaultName))?.id
    ?? parts[0]?.id
    ?? null;
}

function selectedPartByType(partType) {
  if (partType === 'nose_bridge') {
    return selectedNoseBridgePart();
  }
  const selectedPartId = selectedPartIdsByType[partType];
  return partsForDrawer(partLibrariesByType.get(partType))
    .find((part) => part.id === selectedPartId) ?? null;
}

function selected3DChildPartOverrides() {
  return Object.fromEntries(PART_DRAWER_TYPES
    .map((partType) => [partType, selectedPartByType(partType)])
    .filter(([, part]) => part?.configurator?.canPreviewOnFrame));
}

function generatedPartPreviewUrl(partType, part) {
  if (partType === 'nose_bridge') {
    return svgDataUrl(noseBridgePreviewSvg(part));
  }
  if (partType === 'temple') {
    return svgDataUrl(templePreviewSvg(part));
  }
  if (partType === 'temple_tip') {
    return svgDataUrl(templeTipPreviewSvg(part));
  }
  if (partType === 'nosearm') {
    return svgDataUrl(nosearmPreviewSvg(part));
  }
  if (partType === 'nose_pad') {
    return svgDataUrl(nosePadPreviewSvg(part));
  }
  return null;
}

function svgDataUrl(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function noseBridgePreviewSvg(part) {
  const fit = part.configurator?.fit ?? {};
  const width = Number(fit.bridgeDetailWidthMm ?? 16);
  const span = clamp(width * 4.6, 62, 104);
  const startX = 90 - span / 2;
  const endX = 90 + span / 2;
  const crestY = 34 - clamp((fit.profileDepthMm ?? 2) * 2.5, 3, 9);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="96" viewBox="0 0 180 96"><rect width="180" height="96" rx="10" fill="#f7f9f8"/><path d="M${startX.toFixed(1)} 60 C${(startX + 18).toFixed(1)} ${crestY.toFixed(1)} ${(endX - 18).toFixed(1)} ${crestY.toFixed(1)} ${endX.toFixed(1)} 60" fill="none" stroke="#6b59b5" stroke-width="8" stroke-linecap="round"/><path d="M${startX.toFixed(1)} 60 C${(startX + 18).toFixed(1)} ${crestY.toFixed(1)} ${(endX - 18).toFixed(1)} ${crestY.toFixed(1)} ${endX.toFixed(1)} 60" fill="none" stroke="#eeeaff" stroke-width="2" stroke-linecap="round" opacity=".7"/><circle cx="${startX.toFixed(1)}" cy="60" r="7" fill="#5a4aa2"/><circle cx="${endX.toFixed(1)}" cy="60" r="7" fill="#5a4aa2"/></svg>`;
}

function templePreviewSvg(part) {
  const fit = part.configurator?.fit ?? {};
  const length = Number(fit.templeLengthMm ?? 145);
  const frontHeight = Number(fit.frontHeightMm ?? 4.2);
  const rearHeight = Number(fit.rearHeightMm ?? 1.6);
  const endX = clamp(34 + length * 0.82, 128, 158);
  const frontHalf = clamp(frontHeight * 2.2, 5, 15);
  const rearHalf = clamp(rearHeight * 2.5, 3, 9);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="96" viewBox="0 0 180 96"><rect width="180" height="96" rx="10" fill="#f7f9f8"/><path d="M24 ${48 - frontHalf} C64 ${44 - frontHalf} 104 ${47 - rearHalf} ${endX.toFixed(1)} ${48 - rearHalf} L${endX.toFixed(1)} ${48 + rearHalf} C104 ${49 + rearHalf} 64 ${52 + frontHalf} 24 ${48 + frontHalf} Z" fill="#b57924" opacity=".9"/><path d="M30 48 C72 45 112 48 ${endX.toFixed(1)} 48" fill="none" stroke="#fff2df" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>`;
}

function templeTipPreviewSvg(part) {
  const fit = part.configurator?.fit ?? {};
  const angle = Number(fit.tipAngleDeg ?? 42);
  const radius = Number(fit.bendRadiusMm ?? 30);
  const length = Number(fit.tipLengthMm ?? 70);
  const bend = clamp(angle / 90, 0.25, 1);
  const endX = clamp(72 + length * 0.82, 118, 158);
  const endY = clamp(42 + bend * 34 + (30 - Math.min(radius, 30)) * 0.22, 54, 78);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="96" viewBox="0 0 180 96"><rect width="180" height="96" rx="10" fill="#f7f9f8"/><path d="M24 42 C54 42 70 42 82 45 C102 51 112 ${endY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}" fill="none" stroke="#915f1a" stroke-width="14" stroke-linecap="round"/><path d="M24 42 C54 42 70 42 82 45 C102 51 112 ${endY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}" fill="none" stroke="#ffe2c8" stroke-width="3" stroke-linecap="round" opacity=".7"/></svg>`;
}

function nosearmPreviewSvg(part) {
  const isShort = part.name.toLowerCase().includes('short');
  const startX = isShort ? 54 : 28;
  const midX = isShort ? 92 : 86;
  const endX = isShort ? 126 : 144;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="96" viewBox="0 0 180 96"><rect width="180" height="96" rx="12" fill="#f7f9f8"/><path d="M${startX} 30 C${midX} 30 ${midX - 2} 66 ${endX} 66" fill="none" stroke="#8e7f6b" stroke-width="8" stroke-linecap="round"/><path d="M${startX} 30 C${midX} 30 ${midX - 2} 66 ${endX} 66" fill="none" stroke="#f5efe7" stroke-width="2" stroke-linecap="round" opacity=".72"/><circle cx="${startX}" cy="30" r="9" fill="#8e7f6b"/><circle cx="${endX}" cy="66" r="12" fill="#b8aa92" stroke="#786d5a" stroke-width="3"/></svg>`;
}

function nosePadPreviewSvg(part) {
  const name = part.name.toLowerCase();
  const hasLogo = !name.includes('without');
  let fill = '#d9efef';
  let stroke = '#5d8f8c';
  let shine = '#ffffff';
  let logo = '#3a6f6b';
  let opacity = '.78';
  if (name.includes('black')) {
    fill = '#202124';
    stroke = '#101113';
    shine = '#f2f2f2';
    logo = '#f2f2f2';
    opacity = '.96';
  } else if (name.includes('grey') || name.includes('gray')) {
    fill = '#8b9094';
    stroke = '#5f656a';
    shine = '#edf0f2';
    logo = '#f7f8f8';
    opacity = '.9';
  }
  const logoPaths = hasLogo
    ? `<g fill="none" stroke="${logo}" stroke-width="3" stroke-linecap="round" opacity=".95"><path d="M72 48 C80 36 94 36 102 48 C94 60 80 60 72 48"/><path d="M78 48 C86 60 100 60 108 48 C100 36 86 36 78 48"/></g>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="96" viewBox="0 0 180 96"><rect width="180" height="96" rx="12" fill="#f7f9f8"/><ellipse cx="72" cy="49" rx="27" ry="34" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="4" transform="rotate(-13 72 49)"/><ellipse cx="108" cy="49" rx="27" ry="34" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="4" transform="rotate(13 108 49)"/><path d="M61 31 C69 23 84 24 91 33" fill="none" stroke="${shine}" stroke-width="4" stroke-linecap="round" opacity=".72"/><path d="M99 33 C106 24 121 23 129 31" fill="none" stroke="${shine}" stroke-width="4" stroke-linecap="round" opacity=".72"/>${logoPaths}</svg>`;
}

function partCardDetail(part) {
  if (part.type === 'nose_bridge') {
    const width = part.configurator?.fit?.bridgeDetailWidthMm;
    return width == null ? part.sourceGroup : `${width} mm - ${part.sourceGroup}`;
  }
  if (part.type === 'temple') {
    const length = part.configurator?.fit?.templeLengthMm;
    return length == null ? part.sourceGroup : `${length} mm - ${part.sourceGroup}`;
  }
  if (part.type === 'temple_tip') {
    const fit = part.configurator?.fit ?? {};
    const length = fit.tipLengthMm;
    const angle = fit.tipAngleDeg;
    if (length != null && angle != null) {
      return `${length} mm / ${angle} deg - ${part.sourceGroup}`;
    }
    return length == null ? part.sourceGroup : `${length} mm - ${part.sourceGroup}`;
  }
  const readiness = part.readiness === 'manual_only' ? 'Manual seed' : part.sourceGroup;
  return readiness ?? part.version;
}

function partInitials(part) {
  return part.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

function updatePartDrawerStatus() {
  if (!dom.partDrawerStatus) {
    return;
  }
  const selectedCount = Object.values(selectedPartIdsByType).filter(Boolean).length;
  dom.partDrawerStatus.textContent = `${selectedCount} selected`;
}

function updatePartDrawerShell() {
  const is3DMode = workspaceView === '3d';
  dom.workspace.classList.toggle('is-3d-mode', is3DMode);
  dom.workspace.classList.toggle('is-3d-drawer-collapsed', is3DMode && isPartDrawerCollapsed);
  dom.partDrawer.classList.toggle('is-collapsed', is3DMode && isPartDrawerCollapsed);
  dom.partDrawerToggle.hidden = !is3DMode;
  dom.partDrawerToggle.setAttribute('aria-expanded', String(!(is3DMode && isPartDrawerCollapsed)));
  dom.partDrawerToggle.textContent = isPartDrawerCollapsed ? 'Parts' : 'Hide';
}

function selectedNoseBridgePart() {
  return noseBridgePartById(selectedNoseBridgePartId);
}

async function applySelectedNoseBridgePart() {
  const part = selectedNoseBridgePart();
  await renderNoseBridgePart(part, 'after');
}

async function applySelectedDrawerPart(partType) {
  const part = selectedPartByType(partType);
  if (!frame3dViewer || !part?.configurator?.canPreviewOnFrame) {
    return;
  }
  await run3DRenderBuild(part, () => {
    frame3dViewer.applyChildPart(partType, part);
  });
}

async function applySelected3DChildParts() {
  const overrides = selected3DChildPartOverrides();
  const parts = Object.values(overrides);
  if (!frame3dViewer || parts.length === 0) {
    updateNoseBridgeCompareControls();
    return;
  }
  await run3DRenderBuild({ name: 'selected parts' }, () => {
    frame3dViewer.applyChildParts(overrides);
    const renderedBridge = overrides.nose_bridge;
    if (renderedBridge) {
      renderedNoseBridgePartId = renderedBridge.id;
    }
  });
}

async function showNoseBridgeCompareMode(nextMode) {
  if (!hasNoseBridgeCompare()) {
    return;
  }
  const partId = nextMode === 'before' ? beforeNoseBridgePartId : afterNoseBridgePartId;
  const part = noseBridgePartById(partId);
  if (!part) {
    return;
  }
  noseBridgeCompareMode = nextMode;
  updateNoseBridgeCompareControls();
  await renderNoseBridgePart(part, nextMode);
}

async function renderNoseBridgePart(part, compareMode = 'after') {
  updateNoseBridgePartStatus(part);
  if (!frame3dViewer || !part) {
    updateNoseBridgeCompareControls();
    return;
  }
  await run3DRenderBuild(part, () => {
    frame3dViewer.applyChildPart('nose_bridge', part);
    renderedNoseBridgePartId = part.id;
    noseBridgeCompareMode = compareMode;
  });
  updateNoseBridgePartStatus(part);
  updateNoseBridgeCompareControls();
}

function noseBridgePartById(partId) {
  return noseBridgeParts.find((part) => part.id === partId) ?? null;
}

function hasNoseBridgeCompare() {
  return Boolean(
    beforeNoseBridgePartId
    && afterNoseBridgePartId
    && beforeNoseBridgePartId !== afterNoseBridgePartId
    && noseBridgePartById(beforeNoseBridgePartId)
    && noseBridgePartById(afterNoseBridgePartId),
  );
}

function clearNoseBridgeCompare() {
  beforeNoseBridgePartId = null;
  afterNoseBridgePartId = null;
  noseBridgeCompareMode = 'after';
  updateNoseBridgeCompareControls();
}

function updateNoseBridgeCompareControls() {
  if (!dom.noseBridgeCompare) {
    return;
  }
  const canCompare = hasNoseBridgeCompare();
  dom.noseBridgeCompare.hidden = !canCompare;
  if (!canCompare) {
    dom.noseBridgeBeforeButton.disabled = true;
    dom.noseBridgeAfterButton.disabled = true;
    dom.noseBridgeCompareStatus.textContent = '';
    return;
  }

  const beforePart = noseBridgePartById(beforeNoseBridgePartId);
  const afterPart = noseBridgePartById(afterNoseBridgePartId);
  dom.noseBridgeBeforeButton.disabled = false;
  dom.noseBridgeAfterButton.disabled = false;
  dom.noseBridgeBeforeButton.classList.toggle('is-active', noseBridgeCompareMode === 'before');
  dom.noseBridgeAfterButton.classList.toggle('is-active', noseBridgeCompareMode === 'after');
  dom.noseBridgeBeforeButton.setAttribute('aria-pressed', String(noseBridgeCompareMode === 'before'));
  dom.noseBridgeAfterButton.setAttribute('aria-pressed', String(noseBridgeCompareMode === 'after'));
  dom.noseBridgeCompareStatus.textContent = `${beforePart.name} -> ${afterPart.name}`;
}

async function run3DRenderBuild(part, renderBuild) {
  const buildId = active3DBuildId + 1;
  active3DBuildId = buildId;
  if (dom.noseBridgePartSelect) {
    dom.noseBridgePartSelect.disabled = true;
  }
  setNoseBridgeCompareDisabled(true);

  try {
    set3DBuildProgress(0, 'Building 3D');
    await delay(80);
    if (buildId !== active3DBuildId) {
      return;
    }

    set3DBuildProgress(36, 'Building 3D');
    await nextAnimationFrame();
    if (buildId !== active3DBuildId) {
      return;
    }

    renderBuild();
    set3DBuildProgress(78, `Rendering ${part.name}`);
    await delay(180);
    if (buildId !== active3DBuildId) {
      return;
    }

    set3DBuildProgress(100, `Rendered ${part.name}`);
    await delay(420);
  } catch (error) {
    set3DBuildProgress(100, 'Render failed');
    console.error('3D child part render failed', error);
  } finally {
    if (buildId === active3DBuildId) {
      hide3DBuildProgress();
      populateNoseBridgePartSelect();
      setNoseBridgeCompareDisabled(false);
    }
  }
}

function setNoseBridgeCompareDisabled(disabled) {
  if (!hasNoseBridgeCompare()) {
    updateNoseBridgeCompareControls();
    return;
  }
  dom.noseBridgeBeforeButton.disabled = disabled;
  dom.noseBridgeAfterButton.disabled = disabled;
}

function set3DBuildProgress(percent, label = 'Building 3D') {
  if (!dom.frame3dBuildProgress) {
    return;
  }
  const boundedPercent = clamp(Math.round(percent), 0, 100);
  dom.frame3dBuildProgress.hidden = false;
  dom.frame3dBuildProgressLabel.textContent = label;
  dom.frame3dBuildProgressPercent.textContent = `${boundedPercent}%`;
  dom.frame3dBuildProgressFill.style.width = `${boundedPercent}%`;
}

function hide3DBuildProgress() {
  if (!dom.frame3dBuildProgress) {
    return;
  }
  dom.frame3dBuildProgress.hidden = true;
  dom.frame3dBuildProgressPercent.textContent = '0%';
  dom.frame3dBuildProgressFill.style.width = '0%';
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function nextAnimationFrame() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

function updateNoseBridgePartStatus(part) {
  if (!project?.supports3dModel) {
    dom.noseBridgePartStatus.textContent = 'No 3D';
    return;
  }
  if (!part) {
    dom.noseBridgePartStatus.textContent = 'No part';
    return;
  }
  const fit = part.configurator?.fit ?? {};
  const width = fit.bridgeDetailWidthMm == null ? 'default' : `${fit.bridgeDetailWidthMm} mm`;
  dom.noseBridgePartStatus.textContent = width;
}

function setMode(nextMode) {
  mode = nextMode;
  drawing = null;
  dom.modeButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.mode === mode);
  });
  renderDraft();
}

function onWheel(event) {
  event.preventDefault();
  if (event.ctrlKey || event.metaKey) {
    const factor = Math.exp(-event.deltaY * 0.0025);
    zoomAt(event.clientX, event.clientY, factor);
    return;
  }
  transform.x -= event.deltaX;
  transform.y -= event.deltaY;
  applyTransform();
}

function onPointerDown(event) {
  pointerCache.set(event.pointerId, { x: event.clientX, y: event.clientY });
  dom.viewport.setPointerCapture(event.pointerId);

  if (pointerCache.size === 2) {
    lastPinchDistance = pointerDistance();
    return;
  }

  if (event.target.closest('.label-hit')) {
    return;
  }
  if (event.target.closest('.resize-handle, .polygon-point-handle')) {
    return;
  }

  const point = screenToImage(event.clientX, event.clientY);
  if (mode === 'rect') {
    drawing = { type: 'rect', start: point, current: point };
    renderDraft();
    return;
  }
  if (mode === 'polygon') {
    if (!drawing || drawing.type !== 'polygon') {
      drawing = { type: 'polygon', points: [point], current: point };
    } else {
      drawing = { ...drawing, points: [...drawing.points, point], current: point };
    }
    renderDraft();
    return;
  }

  state = clearSelection(state);
  panStart = {
    clientX: event.clientX,
    clientY: event.clientY,
    x: transform.x,
    y: transform.y,
  };
  render();
}

function onPointerMove(event) {
  if (pointerCache.has(event.pointerId)) {
    pointerCache.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }

  if (editDrag) {
    const point = screenToImage(event.clientX, event.clientY);
    if (editDrag.kind === 'move') {
      const dx = point.x - editDrag.last.x;
      const dy = point.y - editDrag.last.y;
      if (hasMeaningfulMovement(dx, dy)) {
        pushPendingEditUndo();
      }
      editDrag.labelIds.forEach((labelId) => {
        state = moveLabel(state, labelId, dx, dy);
      });
      editDrag.last = point;
      markDirty();
      render();
      return;
    }
    if (editDrag.kind === 'resize') {
      if (hasMeaningfulMovement(point.x - editDrag.start.x, point.y - editDrag.start.y)) {
        pushPendingEditUndo();
      }
      state = resizeRectLabel(state, editDrag.labelId, editDrag.handle, point, 10);
      markDirty();
      render();
      return;
    }
    if (editDrag.kind === 'polygon-point') {
      if (hasMeaningfulMovement(point.x - editDrag.start.x, point.y - editDrag.start.y)) {
        pushPendingEditUndo();
      }
      state = updatePolygonPoint(state, editDrag.labelId, editDrag.pointIndex, point);
      markDirty();
      render();
      return;
    }
  }

  if (pointerCache.size === 2) {
    const distance = pointerDistance();
    if (lastPinchDistance > 0) {
      zoomAt(event.clientX, event.clientY, distance / lastPinchDistance);
    }
    lastPinchDistance = distance;
    return;
  }

  const point = screenToImage(event.clientX, event.clientY);
  if (drawing?.type === 'rect') {
    drawing = { ...drawing, current: point };
    renderDraft();
    return;
  }
  if (drawing?.type === 'polygon') {
    drawing = { ...drawing, current: point };
    renderDraft();
    return;
  }
  if (panStart) {
    transform.x = panStart.x + event.clientX - panStart.clientX;
    transform.y = panStart.y + event.clientY - panStart.clientY;
    applyTransform();
  }
}

function onPointerUp(event) {
  pointerCache.delete(event.pointerId);
  lastPinchDistance = pointerCache.size === 2 ? pointerDistance() : 0;

  if (editDrag) {
    editDrag = null;
    return;
  }

  if (drawing?.type === 'rect') {
    const bounds = normalizeRect(drawing.start, drawing.current);
    if (bounds.width > 6 && bounds.height > 6) {
      commitState(addLabel(state, {
        id: makeLabelId(),
        type: 'rect',
        component: dom.componentSelect.value,
        view: dom.viewSelect.value,
        points: [
          { x: bounds.x, y: bounds.y },
          { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        ],
        groupId: null,
        notes: 'User-created rectangle',
      }));
    }
    drawing = null;
    render();
    return;
  }

  panStart = null;
}

function finishPolygon(event) {
  event.preventDefault();
  if (!drawing || drawing.type !== 'polygon' || drawing.points.length < 3) {
    return;
  }
  commitState(addLabel(state, {
    id: makeLabelId(),
    type: 'polygon',
    component: dom.componentSelect.value,
    view: dom.viewSelect.value,
    points: drawing.points,
    groupId: null,
    notes: 'User-created polygon',
  }));
  drawing = null;
  render();
}

function render() {
  if (!state) {
    return;
  }
  applyTransform();
  renderLabels();
  renderDraft();
  renderInspector();
  dom.groupButton.disabled = state.selectedLabelIds.size < 2;
  dom.deleteButton.disabled = state.selectedLabelIds.size === 0 && state.selectedGroupIds.size === 0;
  dom.undoButton.disabled = undoStack.length === 0;
}

function renderLabels() {
  dom.labelsLayer.replaceChildren(...labelsForRendering(state).map((label) => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const selected = state.selectedLabelIds.has(label.id);
    group.dataset.labelId = label.id;

    const shape = createShape(label, false);
    shape.classList.add('label-shape', `component-${label.component}`);
    shape.classList.toggle('is-selected', selected);
    group.append(shape);

    const hit = createShape(label, true);
    hit.classList.add('label-hit');
    hit.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      if (mode !== 'select') {
        return;
      }
      const point = screenToImage(event.clientX, event.clientY);
      if (event.shiftKey) {
        state = toggleSelection(state, label.id, true);
        render();
        return;
      }
      if (!state.selectedLabelIds.has(label.id)) {
        state = toggleSelection(state, label.id, false);
        render();
      }
      editDrag = {
        kind: 'move',
        labelIds: [...state.selectedLabelIds],
        last: point,
        undoSnapshot: snapshotState(state),
        didChange: false,
      };
      dom.viewport.setPointerCapture(event.pointerId);
      render();
    });
    group.append(hit);

    const bounds = labelBounds(label);
    if (selected && label.type === 'rect') {
      group.append(...createResizeHandles(label));
    }
    if (selected && label.type === 'polygon') {
      group.append(...createPolygonPointHandles(label));
    }

    if (selected) {
      const editHint = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      editHint.classList.add('edit-hint');
      editHint.setAttribute('x', String(bounds.x + bounds.width - 4));
      editHint.setAttribute('y', String(bounds.y + bounds.height + 18));
      editHint.setAttribute('text-anchor', 'end');
      editHint.textContent = label.type === 'rect'
        ? 'drag / resize'
        : label.type === 'polygon'
          ? 'drag points / move'
          : 'drag to move';
      group.append(editHint);
    }

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.classList.add('label-text');
    text.setAttribute('x', String(bounds.x + 4));
    text.setAttribute('y', String(Math.max(14, bounds.y - 5)));
    text.textContent = COMPONENT_LABELS[label.component] ?? label.component;
    group.append(text);
    return group;
  }));
}

function createResizeHandles(label) {
  const bounds = labelBounds(label);
  const size = 42;
  const half = size / 2;
  const positions = [
    { handle: 'nw', x: bounds.x, y: bounds.y },
    { handle: 'ne', x: bounds.x + bounds.width, y: bounds.y },
    { handle: 'se', x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { handle: 'sw', x: bounds.x, y: bounds.y + bounds.height },
  ];

  return positions.map(({ handle, x, y }) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.classList.add('resize-handle', `resize-${handle}`);
    rect.dataset.handle = handle;
    rect.setAttribute('x', String(x - half));
    rect.setAttribute('y', String(y - half));
    rect.setAttribute('width', String(size));
    rect.setAttribute('height', String(size));
    rect.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      const point = screenToImage(event.clientX, event.clientY);
      editDrag = {
        kind: 'resize',
        labelId: label.id,
        handle,
        start: point,
        undoSnapshot: snapshotState(state),
        didChange: false,
      };
      dom.viewport.setPointerCapture(event.pointerId);
    });
    return rect;
  });
}

function createPolygonPointHandles(label) {
  const radius = 28;
  return label.points.map((point, pointIndex) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.classList.add('polygon-point-handle');
    circle.dataset.pointIndex = String(pointIndex);
    circle.setAttribute('cx', String(point.x));
    circle.setAttribute('cy', String(point.y));
    circle.setAttribute('r', String(radius));
    circle.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      const start = screenToImage(event.clientX, event.clientY);
      editDrag = {
        kind: 'polygon-point',
        labelId: label.id,
        pointIndex,
        start,
        undoSnapshot: snapshotState(state),
        didChange: false,
      };
      dom.viewport.setPointerCapture(event.pointerId);
    });
    return circle;
  });
}

function createShape(label, hit) {
  if (label.type === 'polygon') {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', label.points.map((point) => `${point.x},${point.y}`).join(' '));
    return polygon;
  }

  const bounds = labelBounds(label);
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', String(bounds.x));
  rect.setAttribute('y', String(bounds.y));
  rect.setAttribute('width', String(Math.max(bounds.width, hit ? 8 : 1)));
  rect.setAttribute('height', String(Math.max(bounds.height, hit ? 8 : 1)));
  return rect;
}

function renderDraft() {
  dom.draftLayer.replaceChildren();
  if (!drawing) {
    return;
  }
  if (drawing.type === 'rect') {
    const bounds = normalizeRect(drawing.start, drawing.current);
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.classList.add('draft-shape');
    rect.setAttribute('x', String(bounds.x));
    rect.setAttribute('y', String(bounds.y));
    rect.setAttribute('width', String(bounds.width));
    rect.setAttribute('height', String(bounds.height));
    dom.draftLayer.append(rect);
    return;
  }
  if (drawing.type === 'polygon') {
    const points = [...drawing.points, drawing.current];
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.classList.add('draft-shape');
    polyline.setAttribute('points', points.map((point) => `${point.x},${point.y}`).join(' '));
    dom.draftLayer.append(polyline);
  }
}

function renderInspector() {
  const selected = selectedLabels(state);
  dom.selectionCount.textContent = String(selected.length + state.selectedGroupIds.size);
  dom.labelCount.textContent = String(state.labels.length);
  dom.groupCount.textContent = String(state.groups.length);

  if (selected.length === 0 && state.selectedGroupIds.size === 0) {
    dom.selectionDetails.textContent = 'No selection';
  } else {
    const lines = selected.map((label) => `${label.id}: ${label.component} / ${label.view}`);
    const groupLines = state.groups
      .filter((group) => state.selectedGroupIds.has(group.id))
      .map((group) => `${group.id}: ${group.name}`);
    dom.selectionDetails.textContent = [...lines, ...groupLines].join('\n');
  }

  dom.groupList.replaceChildren(...state.groups.map((group) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'data-item';
    button.classList.toggle('is-selected', state.selectedGroupIds.has(group.id));
    button.innerHTML = `<strong>${escapeHtml(group.name)}</strong><span>${escapeHtml(group.component)} - ${group.labelIds.length} labels</span>`;
    button.addEventListener('click', () => {
      state = {
        ...state,
        selectedLabelIds: new Set(group.labelIds),
        selectedGroupIds: new Set([group.id]),
      };
      render();
    });
    return button;
  }));

  dom.labelList.replaceChildren(...state.labels.map((label) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'data-item';
    button.classList.toggle('is-selected', state.selectedLabelIds.has(label.id));
    button.innerHTML = `<strong>${escapeHtml(label.id)}</strong><span>${escapeHtml(label.component)} - ${escapeHtml(label.view)}</span>`;
    button.addEventListener('click', (event) => {
      state = toggleSelection(state, label.id, event.shiftKey);
      render();
    });
    return button;
  }));
}

function commitState(nextState) {
  if (nextState === state) {
    return;
  }
  pushUndoSnapshot(snapshotState(state));
  state = nextState;
  markDirty();
  render();
}

function pushPendingEditUndo() {
  if (!editDrag || editDrag.didChange) {
    return;
  }
  pushUndoSnapshot(editDrag.undoSnapshot);
  editDrag.didChange = true;
}

function pushUndoSnapshot(snapshot) {
  undoStack.push(snapshot);
  if (undoStack.length > MAX_UNDO_STEPS) {
    undoStack = undoStack.slice(-MAX_UNDO_STEPS);
  }
}

function undoLastChange() {
  const snapshot = undoStack.pop();
  if (!snapshot) {
    return;
  }
  drawing = null;
  editDrag = null;
  state = restoreSnapshot(state, snapshot);
  markDirty();
  render();
}

async function saveMemory() {
  setSaveState('Saving');
  const payload = serializeState(state, project.modelId);
  const response = await fetch(project.memoryUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Save failed' }));
    setSaveState(error.error ?? 'Save failed');
    return false;
  }
  state = createInitialState(await response.json());
  setSaveState('Saved');
  render();
  return true;
}

async function share3dFrontView() {
  if (!frame3dViewer) {
    return;
  }
  const blob = await frame3dViewer.frontViewBlob();
  const fileName = frontViewFileName(project.modelId);
  const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: `${project.modelId} front view`,
      files: [file],
    });
    return;
  }
  downloadBlob(blob, fileName);
}

async function download3dFrontView() {
  if (!frame3dViewer) {
    return;
  }
  const blob = await frame3dViewer.frontViewBlob();
  downloadBlob(blob, frontViewFileName(project.modelId));
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function markDirty() {
  if (frame3dViewer) {
    labelsChangedSince3DRender = true;
  }
  setSaveState('Unsaved');
}

function setSaveState(label) {
  dom.saveState.textContent = label;
}

function fitToViewport() {
  const width = dom.image.naturalWidth;
  const height = dom.image.naturalHeight;
  if (!width || !height) {
    return;
  }
  const viewport = dom.viewport.getBoundingClientRect();
  const scale = Math.min((viewport.width - 48) / width, (viewport.height - 48) / height);
  transform = {
    x: Math.max(16, (viewport.width - width * scale) / 2),
    y: Math.max(16, (viewport.height - height * scale) / 2),
    scale: clamp(scale, 0.16, 1.6),
  };
  applyTransform();
}

function applyTransform() {
  dom.stage.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;
}

function zoomAt(clientX, clientY, factor) {
  const before = screenToImage(clientX, clientY);
  transform.scale = clamp(transform.scale * factor, 0.08, 5);
  transform.x = clientX - dom.viewport.getBoundingClientRect().left - before.x * transform.scale;
  transform.y = clientY - dom.viewport.getBoundingClientRect().top - before.y * transform.scale;
  applyTransform();
}

function screenToImage(clientX, clientY) {
  const rect = dom.viewport.getBoundingClientRect();
  return {
    x: (clientX - rect.left - transform.x) / transform.scale,
    y: (clientY - rect.top - transform.y) / transform.scale,
  };
}

function normalizeRect(a, b) {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
}

function pointerDistance() {
  const points = [...pointerCache.values()];
  if (points.length < 2) {
    return 0;
  }
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

function makeLabelId() {
  return `label-user-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function hasMeaningfulMovement(dx, dy) {
  return Math.hypot(dx, dy) > 0.01;
}

function isTextEditingTarget(target) {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }
  return response.json();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}
