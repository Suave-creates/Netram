import { initFrame3DViewer } from './frame-3d-viewer.mjs?v=20260620-solidtip1';

const DEFAULT_MATCHER_INDEX_PATH = '/tmp/merch_matcher_index/portfolio_index.pkl';

const dom = {
  modelSelect: document.querySelector('#modelSelect'),
  pageState: document.querySelector('#pageState'),
  labellerLink: document.querySelector('#labellerLink'),
  configuratorLink: document.querySelector('#matcherConfiguratorLink'),
  lenskartMatcherLink: document.querySelector('#lenskartMatcherLink'),
  frontViewButton: document.querySelector('#frontViewButton'),
  shareFrontViewButton: document.querySelector('#shareFrontViewButton'),
  downloadFrontViewButton: document.querySelector('#downloadFrontViewButton'),
  matcher3dPanel: document.querySelector('#matcher3dPanel'),
  matcher3dCanvas: document.querySelector('#matcher3dCanvas'),
  renderUnavailable: document.querySelector('#renderUnavailable'),
  renderModel: document.querySelector('#renderModel'),
  beautyRenderPreview: document.querySelector('#beautyRenderPreview'),
  matcherEnginePanel: document.querySelector('#matcherEnginePanel'),
  engineToggleButton: document.querySelector('#engineToggleButton'),
  engineToggleIcon: document.querySelector('#engineToggleIcon'),
  matcherEngineBody: document.querySelector('#matcherEngineBody'),
  matcherApiBase: document.querySelector('#matcherApiBase'),
  indexPath: document.querySelector('#indexPath'),
  lensMask: document.querySelector('#lensMask'),
  generatedLensMaskStatus: document.querySelector('#generatedLensMaskStatus'),
  aSize: document.querySelector('#aSize'),
  bSize: document.querySelector('#bSize'),
  dbl: document.querySelector('#dbl'),
  topK: document.querySelector('#topK'),
  generateOverlay: document.querySelector('#generateOverlay'),
  runMatchButton: document.querySelector('#runMatchButton'),
  matchCount: document.querySelector('#matchCount'),
  matchResults: document.querySelector('#matchResults'),
};

let project = null;
let frame3dViewer = null;
let beautyRenderUrl = null;
let generatedLensMaskFile = null;
let manualLensMaskFile = null;

init();

async function init() {
  bindEvents();
  setEngineCollapsed(true);
  const params = new URLSearchParams(window.location.search);
  await loadProject(params.get('model'));
}

function bindEvents() {
  dom.engineToggleButton.addEventListener('click', () => {
    setEngineCollapsed(dom.engineToggleButton.getAttribute('aria-expanded') === 'true');
  });
  dom.modelSelect.addEventListener('change', async () => {
    await loadProject(dom.modelSelect.value);
  });
  dom.frontViewButton.addEventListener('click', () => {
    if (frame3dViewer) {
      frame3dViewer.setFrontView();
      refreshGeneratedLensMask();
    }
  });
  dom.shareFrontViewButton.addEventListener('click', shareFrontView);
  dom.downloadFrontViewButton.addEventListener('click', downloadFrontView);
  dom.lensMask.addEventListener('change', () => {
    manualLensMaskFile = dom.lensMask.files[0] ?? null;
    updateGeneratedLensMaskStatus();
  });
  dom.runMatchButton.addEventListener('click', runMatch);
}

async function loadProject(modelId = null) {
  setPageState('Loading');
  const url = modelId ? `/api/matcher/project?model=${encodeURIComponent(modelId)}` : '/api/matcher/project';
  project = await fetchJson(url);

  populateModelSelect(project.models);
  dom.labellerLink.href = project.labellerUrl;
  dom.configuratorLink.href = `/configurator?model=${encodeURIComponent(project.modelId)}`;
  dom.lenskartMatcherLink.href = `/lenskart-matcher?model=${encodeURIComponent(project.modelId)}`;
  dom.renderModel.textContent = project.modelId;
  dom.matcherApiBase.value = project.engine.baseUrl;
  dom.indexPath.value = project.engine.defaultIndexPath ?? DEFAULT_MATCHER_INDEX_PATH;
  setDimensionValue(dom.aSize, project.dimensions.a_size);
  setDimensionValue(dom.bSize, project.dimensions.b_size);
  setDimensionValue(dom.dbl, project.dimensions.dbl);
  document.title = `Natalia - ${project.modelId} Matcher`;

  resetViewer();
  setPageState('Ready');
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

function setDimensionValue(input, value) {
  input.value = value == null ? '' : String(value);
}

function resetViewer() {
  if (frame3dViewer) {
    frame3dViewer.destroy();
    frame3dViewer = null;
  }
  generatedLensMaskFile = null;
  manualLensMaskFile = null;
  dom.lensMask.value = '';
  revokeBeautyRenderUrl();
  dom.beautyRenderPreview.removeAttribute('src');
  updateGeneratedLensMaskStatus('Generating front-view JPG');
  dom.renderUnavailable.hidden = project.supports3dModel;
  dom.frontViewButton.disabled = !project.supports3dModel;
  dom.shareFrontViewButton.disabled = !project.supports3dModel;
  dom.downloadFrontViewButton.disabled = !project.supports3dModel;

  if (!project.supports3dModel) {
    return;
  }

  try {
    frame3dViewer = initFrame3DViewer({
      canvas: dom.matcher3dCanvas,
      panel: dom.matcher3dPanel,
      modelId: project.modelId,
    });
    window.requestAnimationFrame(() => {
      frame3dViewer.setFrontView();
      refreshGeneratedLensMask();
    });
  } catch (error) {
    console.error('3D viewer failed to initialize', error);
    dom.renderUnavailable.hidden = false;
    dom.frontViewButton.disabled = true;
    dom.shareFrontViewButton.disabled = true;
    dom.downloadFrontViewButton.disabled = true;
  }
}

async function refreshGeneratedLensMask() {
  if (!frame3dViewer) {
    return null;
  }
  const blob = await frame3dViewer.frontViewBlob();
  generatedLensMaskFile = new File([blob], project.beautyRender.fileName, { type: blob.type || 'image/jpeg' });
  revokeBeautyRenderUrl();
  beautyRenderUrl = URL.createObjectURL(blob);
  dom.beautyRenderPreview.src = beautyRenderUrl;
  updateGeneratedLensMaskStatus();
  return blob;
}

async function shareFrontView() {
  const blob = await refreshGeneratedLensMask();
  if (!blob) {
    return;
  }
  const file = new File([blob], project.beautyRender.fileName, { type: blob.type || 'image/jpeg' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: `${project.modelId} front view`,
      files: [file],
    });
    return;
  }
  downloadBlob(blob, project.beautyRender.fileName);
}

async function downloadFrontView() {
  const blob = await refreshGeneratedLensMask();
  if (blob) {
    downloadBlob(blob, project.beautyRender.fileName);
  }
}

async function runMatch() {
  const indexPath = dom.indexPath.value.trim();
  if (!indexPath) {
    setPageState('Missing index');
    renderMessage('Portfolio index path is required before matching.');
    dom.indexPath.focus();
    return;
  }

  const mask = await lensMaskForMatch();
  if (!mask) {
    setPageState('Missing front view');
    renderMessage('Generated front-view JPG is not ready yet. Wait for the preview or upload a lens input.');
    return;
  }

  setPageState('Matching');
  dom.runMatchButton.disabled = true;
  const form = new FormData();
  form.append('index_path', indexPath);
  form.append('lens_mask', mask, mask.name);
  appendOptionalNumber(form, 'a_size', dom.aSize.value);
  appendOptionalNumber(form, 'b_size', dom.bSize.value);
  appendOptionalNumber(form, 'dbl', dom.dbl.value);
  form.append('top_k', dom.topK.value || '10');
  form.append('generate_overlay', dom.generateOverlay.checked ? 'true' : 'false');

  try {
    const response = await fetch(matchUrl(), {
      method: 'POST',
      body: form,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.detail ?? payload?.error ?? `Matcher returned ${response.status}`);
    }
    renderMatches(payload.matches ?? []);
    setPageState('Matched');
  } catch (error) {
    renderMessage(error.message);
    setPageState('Match failed');
  } finally {
    dom.runMatchButton.disabled = false;
  }
}

async function lensMaskForMatch() {
  if (manualLensMaskFile) {
    return manualLensMaskFile;
  }
  return currentGeneratedLensMaskFile();
}

async function currentGeneratedLensMaskFile() {
  updateGeneratedLensMaskStatus('Preparing current front-view JPG for match');
  await refreshGeneratedLensMask();
  return generatedLensMaskFile;
}

function updateGeneratedLensMaskStatus(label = null) {
  if (label) {
    dom.generatedLensMaskStatus.textContent = label;
    return;
  }
  if (manualLensMaskFile) {
    dom.generatedLensMaskStatus.textContent = `Manual input selected: ${manualLensMaskFile.name}`;
    return;
  }
  if (generatedLensMaskFile) {
    dom.generatedLensMaskStatus.textContent = `Generated front-view JPG ready: ${generatedLensMaskFile.name}`;
    return;
  }
  dom.generatedLensMaskStatus.textContent = 'Generating front-view JPG';
}

function appendOptionalNumber(form, name, value) {
  if (value !== '') {
    form.append(name, value);
  }
}

function matchUrl() {
  return `${dom.matcherApiBase.value.trim().replace(/\/+$/, '')}/match`;
}

function setEngineCollapsed(collapsed) {
  dom.matcherEngineBody.hidden = collapsed;
  dom.matcherEnginePanel.dataset.collapsed = collapsed ? 'true' : 'false';
  dom.engineToggleButton.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  dom.engineToggleIcon.textContent = collapsed ? '+' : '-';
}

function renderMatches(matches) {
  dom.matchCount.textContent = String(matches.length);
  if (matches.length === 0) {
    renderMessage('No matches returned.');
    return;
  }
  dom.matchResults.replaceChildren(...matches.map((match) => {
    const item = document.createElement('article');
    item.className = 'match-item';
    item.innerHTML = `
      ${match.image_front ? `<img src="${escapeHtml(match.image_front)}" alt="${escapeHtml(match.model ?? match.product_id)} front">` : ''}
      <div>
        <strong>${escapeHtml(match.model ?? match.product_id)}</strong>
        <span>${escapeHtml(match.product_id)} - ${Number(match.similarity ?? 0).toFixed(2)}%</span>
        <small>Geometry ${Number(match.geometry_score ?? 0).toFixed(2)} / Proportion ${Number(match.proportion_score ?? 0).toFixed(2)}</small>
      </div>
    `;
    if (match.product_url) {
      item.addEventListener('click', () => window.open(match.product_url, '_blank', 'noopener'));
      item.tabIndex = 0;
    }
    return item;
  }));
}

function renderMessage(message) {
  dom.matchCount.textContent = '0';
  const item = document.createElement('div');
  item.className = 'selection-details';
  item.textContent = message;
  dom.matchResults.replaceChildren(item);
}

function setPageState(label) {
  dom.pageState.textContent = label;
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

function revokeBeautyRenderUrl() {
  if (beautyRenderUrl) {
    URL.revokeObjectURL(beautyRenderUrl);
    beautyRenderUrl = null;
  }
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
