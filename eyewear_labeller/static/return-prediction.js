import { FRAME_3D_DIMENSIONS } from './frame-3d-model.mjs?v=20260620-solidtip1';

const FIELD_MAP = [
  ['returnFrameWidth', 'frontWidth'],
  ['returnFrameHeight', 'lensHeight'],
  ['returnASize', 'lensWidth'],
  ['returnTempleLength', 'templeLength'],
  ['returnDbl', 'bridgeWidth'],
];

const dom = {
  status: document.querySelector('#returnModelStatus'),
  heroModel: document.querySelector('#returnHeroModel'),
  modelSelect: document.querySelector('#returnModelSelect'),
  menuLink: document.querySelector('#returnMenuLink'),
  configuratorLink: document.querySelector('#returnConfiguratorLink'),
  lenskartLink: document.querySelector('#returnLenskartLink'),
  inputSource: document.querySelector('#returnInputSource'),
  useModelButton: document.querySelector('#returnUseModelButton'),
  inputs: Object.fromEntries(FIELD_MAP.map(([inputId]) => [inputId, document.querySelector(`#${inputId}`)])),
};

let project = null;

init();

async function init() {
  dom.modelSelect.addEventListener('change', async () => {
    await loadProject(dom.modelSelect.value);
  });

  dom.useModelButton.addEventListener('click', () => {
    populateInputs(project?.modelId);
  });

  const modelId = new URLSearchParams(window.location.search).get('model');
  await loadProject(modelId);
}

async function loadProject(modelId = null) {
  setStatus('Loading');
  project = location.protocol === 'file:'
    ? buildStaticProject(modelId)
    : await fetchProject(modelId);

  populateModelSelect(project.models);
  dom.modelSelect.value = project.modelId;
  dom.menuLink.href = project.menuUrl ?? `/?model=${encodeURIComponent(project.modelId)}`;
  dom.configuratorLink.href = project.configuratorUrl;
  dom.lenskartLink.href = project.lenskartMatcherUrl;
  window.history.replaceState(null, '', project.returnPredictionUrl);
  populateInputs(project.modelId);
  document.title = `Netram - ${project.modelId} Return Prediction`;
  setStatus('Ready');
}

async function fetchProject(modelId) {
  const url = modelId ? `/api/project?model=${encodeURIComponent(modelId)}` : '/api/project';
  return fetchJson(url);
}

function buildStaticProject(modelId = null) {
  const modelIds = Object.keys(FRAME_3D_DIMENSIONS).sort();
  const selectedModelId = modelIds.includes(modelId) ? modelId : 'VC S19003';
  const encodedModelId = encodeURIComponent(selectedModelId);
  return {
    modelId: selectedModelId,
    models: modelIds.map((id) => ({ id, title: id })),
    menuUrl: `menu.html?model=${encodedModelId}`,
    configuratorUrl: `configurator.html?model=${encodedModelId}`,
    lenskartMatcherUrl: `lenskart-matcher.html?model=${encodedModelId}`,
    returnPredictionUrl: `return-prediction.html?model=${encodedModelId}`,
  };
}

function populateModelSelect(models) {
  dom.modelSelect.replaceChildren(...models.map((model) => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = model.title;
    return option;
  }));
}

function populateInputs(modelId) {
  const dimensions = FRAME_3D_DIMENSIONS[modelId] || FRAME_3D_DIMENSIONS['VC S19003'];
  FIELD_MAP.forEach(([inputId, dimensionKey]) => {
    dom.inputs[inputId].value = formatNumber(dimensions[dimensionKey]);
  });
  dom.inputSource.textContent = dimensions.modelId;
  dom.heroModel.textContent = dimensions.modelId;
}

function formatNumber(value) {
  return Number.isFinite(value) ? String(value) : '';
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function setStatus(value) {
  dom.status.textContent = value;
}
