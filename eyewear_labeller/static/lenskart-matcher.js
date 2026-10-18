import { initFrame3DViewer } from './frame-3d-viewer.mjs?v=20260620-solidtip1';

const dom = {
  modelSelect: document.querySelector('#modelSelect'),
  pageState: document.querySelector('#pageState'),
  labellerLink: document.querySelector('#labellerLink'),
  localMatcherLink: document.querySelector('#localMatcherLink'),
  configuratorLink: document.querySelector('#configuratorLink'),
  frontViewButton: document.querySelector('#frontViewButton'),
  downloadFrontViewButton: document.querySelector('#downloadFrontViewButton'),
  matcher3dPanel: document.querySelector('#matcher3dPanel'),
  matcher3dCanvas: document.querySelector('#matcher3dCanvas'),
  renderUnavailable: document.querySelector('#renderUnavailable'),
  renderModel: document.querySelector('#renderModel'),
  beautyRenderPreview: document.querySelector('#beautyRenderPreview'),
  cacheCount: document.querySelector('#cacheCount'),
  cacheTitle: document.querySelector('#cacheTitle'),
  cachePath: document.querySelector('#cachePath'),
  aSize: document.querySelector('#aSize'),
  bSize: document.querySelector('#bSize'),
  dbl: document.querySelector('#dbl'),
  topK: document.querySelector('#topK'),
  useVlm: document.querySelector('#useVlm'),
  runMatchButton: document.querySelector('#runMatchButton'),
  generatedLensMaskStatus: document.querySelector('#generatedLensMaskStatus'),
  matchCount: document.querySelector('#matchCount'),
  matchResults: document.querySelector('#matchResults'),
};

let project = null;
let frame3dViewer = null;
let frontViewUrl = null;
let frontViewFile = null;

init();

async function init() {
  bindEvents();
  const params = new URLSearchParams(window.location.search);
  await loadProject(params.get('model'));
}

function bindEvents() {
  dom.modelSelect.addEventListener('change', async () => {
    await loadProject(dom.modelSelect.value);
  });
  dom.frontViewButton.addEventListener('click', () => {
    if (frame3dViewer) {
      frame3dViewer.setFrontView();
      refreshFrontView();
    }
  });
  dom.downloadFrontViewButton.addEventListener('click', downloadFrontView);
  dom.runMatchButton.addEventListener('click', runMatch);
}

async function loadProject(modelId = null) {
  setPageState('Loading');
  const url = modelId ? `/api/lenskart-matcher/project?model=${encodeURIComponent(modelId)}` : '/api/lenskart-matcher/project';
  project = await fetchJson(url);

  populateModelSelect(project.models);
  dom.labellerLink.href = project.labellerUrl;
  dom.localMatcherLink.href = project.localMatcherUrl;
  dom.configuratorLink.href = project.configuratorUrl;
  dom.renderModel.textContent = project.modelId;
  dom.cacheCount.textContent = String(project.cache.count);
  dom.cacheTitle.textContent = project.cache.title ?? `${project.cache.brand} ${project.cache.category}`;
  dom.cachePath.textContent = `${project.cache.count}/${project.cache.targetCount} cached in ${project.cache.path}`;
  setDimensionValue(dom.aSize, project.dimensions.a_size);
  setDimensionValue(dom.bSize, project.dimensions.b_size);
  setDimensionValue(dom.dbl, project.dimensions.dbl);
  document.title = `Netram - ${project.modelId} Lenskart Matcher`;

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
  frontViewFile = null;
  revokeFrontViewUrl();
  dom.beautyRenderPreview.removeAttribute('src');
  dom.generatedLensMaskStatus.textContent = 'Generating front-view JPG';
  dom.renderUnavailable.hidden = project.supports3dModel;
  dom.frontViewButton.disabled = !project.supports3dModel;
  dom.downloadFrontViewButton.disabled = !project.supports3dModel;
  dom.runMatchButton.disabled = !project.supports3dModel;

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
      refreshFrontView();
    });
  } catch (error) {
    console.error('3D viewer failed to initialize', error);
    dom.renderUnavailable.hidden = false;
    dom.frontViewButton.disabled = true;
    dom.downloadFrontViewButton.disabled = true;
    dom.runMatchButton.disabled = true;
  }
}

async function refreshFrontView() {
  if (!frame3dViewer) {
    return null;
  }
  const blob = await frame3dViewer.frontViewBlob();
  frontViewFile = new File([blob], project.beautyRender.fileName, { type: blob.type || 'image/jpeg' });
  revokeFrontViewUrl();
  frontViewUrl = URL.createObjectURL(blob);
  dom.beautyRenderPreview.src = frontViewUrl;
  dom.generatedLensMaskStatus.textContent = `Front-view JPG ready: ${frontViewFile.name}`;
  return blob;
}

async function currentFrontViewDataUrl() {
  dom.generatedLensMaskStatus.textContent = 'Preparing current front-view JPG for Lenskart match';
  const blob = await refreshFrontView();
  if (!blob) {
    return null;
  }
  return blobToDataUrl(blob);
}

async function runMatch() {
  const frontViewDataUrl = await currentFrontViewDataUrl();
  if (!frontViewDataUrl) {
    renderMessage('Generated front-view JPG is not ready yet.');
    setPageState('Missing front view');
    return;
  }

  setPageState('Matching');
  dom.runMatchButton.disabled = true;
  try {
    const response = await fetch(project.matchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        frontViewDataUrl,
        topK: Number(dom.topK.value || 5),
        useVlm: dom.useVlm.checked,
        metadata: {
          modelId: project.modelId,
          a_size: numberOrNull(dom.aSize.value),
          b_size: numberOrNull(dom.bSize.value),
          dbl: numberOrNull(dom.dbl.value),
          shape: project.dimensions.shape,
          frame_type: project.dimensions.frame_type,
          material: project.dimensions.material,
        },
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error ?? `Matcher returned ${response.status}`);
    }
    renderMatches(payload.matches ?? [], payload);
    setPageState('Matched');
  } catch (error) {
    renderMessage(error.message);
    setPageState('Match failed');
  } finally {
    dom.runMatchButton.disabled = false;
  }
}

function renderMatches(matches, payload = null) {
  dom.matchCount.textContent = String(matches.length);
  if (matches.length === 0) {
    renderMessage('No matches returned.');
    return;
  }
  dom.matchResults.replaceChildren(...matches.map((match, index) => {
    const item = document.createElement('article');
    item.className = 'match-item lenskart-match-item';
    item.innerHTML = `
      ${match.image_front ? `<img src="${escapeHtml(match.image_front)}" alt="${escapeHtml(match.model ?? match.product_id)} front">` : ''}
      <div>
        <strong>${index + 1}. ${escapeHtml(match.model ?? match.product_id)}</strong>
        <span>${escapeHtml(match.product_id)} - ${Number(match.similarity ?? 0).toFixed(2)}%</span>
        <small>${escapeHtml(match.shape ?? 'Shape unknown')} / ${escapeHtml(match.frame_type ?? 'Type unknown')} / ${escapeHtml(match.material ?? 'Material unknown')}</small>
        <small>Visual ${formatScore(match.visual_score)} / Shape ${formatScore(match.shape_score)} / Dimensions ${formatScore(match.dimension_score)}</small>
        <small>${escapeHtml(match.reason ?? '')}</small>
        ${match.vlm_note ? `<small>${escapeHtml(match.vlm_note)}</small>` : ''}
      </div>
    `;
    if (match.product_url) {
      item.addEventListener('click', () => window.open(match.product_url, '_blank', 'noopener'));
      item.tabIndex = 0;
    }
    return item;
  }));
  if (payload?.dataset) {
    dom.cacheCount.textContent = String(payload.dataset.count);
    dom.cacheTitle.textContent = payload.dataset.title ?? `${payload.dataset.brand} ${payload.dataset.category}`;
    dom.cachePath.textContent = `${payload.dataset.count}/${payload.dataset.targetCount} cached in ${payload.dataset.path}`;
  }
}

function renderMessage(message) {
  dom.matchCount.textContent = '0';
  const item = document.createElement('div');
  item.className = 'selection-details';
  item.textContent = message;
  dom.matchResults.replaceChildren(item);
}

async function downloadFrontView() {
  const blob = await refreshFrontView();
  if (!blob) {
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = project.beautyRender.fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(blob);
  });
}

function numberOrNull(value) {
  return value === '' ? null : Number(value);
}

function formatScore(value) {
  return Number(value ?? 0).toFixed(0);
}

function setPageState(label) {
  dom.pageState.textContent = label;
}

function revokeFrontViewUrl() {
  if (frontViewUrl) {
    URL.revokeObjectURL(frontViewUrl);
    frontViewUrl = null;
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
