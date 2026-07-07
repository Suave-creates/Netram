const READINESS_LABELS = {
  usable_2d: '2D ready',
  cad_only: 'CAD only',
  pdf_only: 'PDF only',
  manual_only: 'Manual',
};

const FIELD_LABELS = {
  manual_metadata: 'Manual metadata',
  material_properties: 'Material properties',
  metallurgy: 'Metallurgy',
  dimensions: 'Dimensions',
  colour_finish: 'Colour / finish',
  attachment_points: 'Attachment points',
  compatibility_rules: 'Compatibility rules',
  manufacturing_constraints: 'Manufacturing constraints',
  '3d_geometry': '3D geometry',
  '2d_cad_geometry': '2D CAD geometry',
  pdf_reference: 'PDF reference',
};

const dom = {
  pageState: document.querySelector('#pageState'),
  partSearch: document.querySelector('#partSearch'),
  typeCount: document.querySelector('#typeCount'),
  partTypeTabs: document.querySelector('#partTypeTabs'),
  partCount: document.querySelector('#partCount'),
  partList: document.querySelector('#partList'),
  partPreviewTitle: document.querySelector('#partPreviewTitle'),
  partReadiness: document.querySelector('#partReadiness'),
  partPreview: document.querySelector('#partPreview'),
  partPreviewFallback: document.querySelector('#partPreviewFallback'),
  partVersion: document.querySelector('#partVersion'),
  partSourceDetails: document.querySelector('#partSourceDetails'),
  missingCount: document.querySelector('#missingCount'),
  partMetadata: document.querySelector('#partMetadata'),
  assetCount: document.querySelector('#assetCount'),
  partAssetLinks: document.querySelector('#partAssetLinks'),
};

let library = null;
let selectedPartId = null;

init();

async function init() {
  bindEvents();
  const params = new URLSearchParams(window.location.search);
  await loadLibrary(params.get('type') || 'nose_bridge');
}

function bindEvents() {
  dom.partSearch.addEventListener('input', renderPartList);
}

async function loadLibrary(partType) {
  setPageState('Loading');
  const response = await fetch(`/api/child-parts?type=${encodeURIComponent(partType)}`);
  const payload = await response.json();
  if (!response.ok) {
    renderError(payload.error ?? `Could not load ${partType}`);
    return;
  }
  library = payload;
  selectedPartId = library.parts[0]?.id ?? null;
  document.title = `Natalia - ${selectedTypeLabel()} Library`;
  window.history.replaceState(null, '', `/parts?type=${encodeURIComponent(library.selectedType)}`);
  render();
  setPageState('Ready');
}

function render() {
  renderTypeTabs();
  renderPartList();
  renderSelectedPart();
}

function renderTypeTabs() {
  dom.typeCount.textContent = String(library.types.length);
  dom.partTypeTabs.replaceChildren(...library.types.map((type) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'data-item';
    button.classList.toggle('is-selected', type.type === library.selectedType);
    button.addEventListener('click', () => loadLibrary(type.type));

    const title = document.createElement('strong');
    title.textContent = type.label;
    const meta = document.createElement('span');
    meta.textContent = `${type.summary.total} parts - ${type.buildStatus}`;
    button.append(title, meta);
    return button;
  }));
}

function renderPartList() {
  const parts = filteredParts();
  dom.partCount.textContent = String(parts.length);
  if (!parts.some((part) => part.id === selectedPartId)) {
    selectedPartId = parts[0]?.id ?? null;
  }
  dom.partList.replaceChildren(...parts.map((part) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'data-item part-row';
    button.classList.toggle('is-selected', part.id === selectedPartId);
    button.addEventListener('click', () => {
      selectedPartId = part.id;
      renderPartList();
      renderSelectedPart();
    });

    const title = document.createElement('strong');
    title.textContent = part.name;
    const meta = document.createElement('span');
    meta.textContent = `${part.sourceGroup} - ${READINESS_LABELS[part.readiness] ?? part.readiness}`;
    button.append(title, meta);
    return button;
  }));
  if (parts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'selection-details';
    empty.textContent = 'No matching parts.';
    dom.partList.replaceChildren(empty);
  }
}

function renderSelectedPart() {
  const part = selectedPart();
  if (!part) {
    renderEmptySelection();
    return;
  }

  dom.partPreviewTitle.textContent = part.name;
  dom.partReadiness.textContent = READINESS_LABELS[part.readiness] ?? part.readiness;
  dom.partVersion.textContent = part.version;
  dom.missingCount.textContent = String(part.missing.length);

  renderPreview(part);
  renderSourceDetails(part);
  renderMetadata(part);
  renderAssetLinks(part);
}

function renderPreview(part) {
  const previewUrl = part.assets.svgUrl || part.assets.pdfUrl;
  dom.partPreview.hidden = !previewUrl;
  dom.partPreviewFallback.hidden = Boolean(previewUrl);
  if (previewUrl) {
    dom.partPreview.src = previewUrl;
    return;
  }
  dom.partPreview.removeAttribute('src');
  dom.partPreviewFallback.textContent = 'No drawing asset is attached yet.';
}

function renderSourceDetails(part) {
  const rows = [
    ['Type', part.typeLabel],
    ['Slot', part.slot],
    ['Source', part.sourceGroup],
    ['Part ID', part.id],
  ];
  dom.partSourceDetails.replaceChildren(descriptionList(rows));
}

function renderMetadata(part) {
  const rows = [
    ['2D CAD', part.geometry.cad2d ? 'Available' : 'Missing'],
    ['PDF', part.geometry.drawingPdf ? 'Available' : 'Missing'],
    ['3D', part.geometry.geometry3d ? 'Available' : 'Missing'],
    ['Missing', part.missing.map((field) => FIELD_LABELS[field] ?? field).join(', ')],
  ];
  dom.partMetadata.replaceChildren(descriptionList(rows));
}

function renderAssetLinks(part) {
  const links = [
    ['DWG', part.assets.dwgUrl],
    ['PDF', part.assets.pdfUrl],
    ['SVG', part.assets.svgUrl],
  ].filter(([, url]) => Boolean(url));
  dom.assetCount.textContent = String(links.length);
  dom.partAssetLinks.replaceChildren(...links.map(([label, url]) => {
    const link = document.createElement('a');
    link.className = 'action-button toolbar-link';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = label;
    return link;
  }));
  if (links.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'selection-details';
    empty.textContent = 'No source files.';
    dom.partAssetLinks.replaceChildren(empty);
  }
}

function descriptionList(rows) {
  const dl = document.createElement('dl');
  dl.className = 'part-details';
  rows.forEach(([label, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value || '-';
    dl.append(dt, dd);
  });
  return dl;
}

function renderEmptySelection() {
  dom.partPreviewTitle.textContent = 'Preview';
  dom.partReadiness.textContent = '-';
  dom.partVersion.textContent = 'v1';
  dom.missingCount.textContent = '0';
  dom.assetCount.textContent = '0';
  dom.partPreview.hidden = true;
  dom.partPreview.removeAttribute('src');
  dom.partPreviewFallback.hidden = false;
  dom.partPreviewFallback.textContent = 'Select a part.';
  dom.partSourceDetails.textContent = '';
  dom.partMetadata.textContent = '';
  dom.partAssetLinks.textContent = '';
}

function filteredParts() {
  const query = dom.partSearch.value.trim().toLowerCase();
  if (!query) {
    return library.parts;
  }
  return library.parts.filter((part) => {
    return part.name.toLowerCase().includes(query) || part.id.toLowerCase().includes(query);
  });
}

function selectedPart() {
  return library?.parts.find((part) => part.id === selectedPartId) ?? null;
}

function selectedTypeLabel() {
  return library?.types.find((type) => type.type === library.selectedType)?.label ?? 'Child part';
}

function renderError(message) {
  setPageState('Error');
  dom.partList.replaceChildren(messageNode(message));
  dom.partTypeTabs.replaceChildren();
  renderEmptySelection();
}

function messageNode(message) {
  const node = document.createElement('div');
  node.className = 'selection-details';
  node.textContent = message;
  return node;
}

function setPageState(label) {
  dom.pageState.textContent = label;
}
