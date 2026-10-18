const dom = {
  state: document.querySelector('#menuState'),
  modelSelect: document.querySelector('#menuModelSelect'),
  modelTitle: document.querySelector('#menuModelTitle'),
  previewImage: document.querySelector('#menuPreviewImage'),
  pdfLink: document.querySelector('#menuPdfLink'),
  cadLink: document.querySelector('#menuCadLink'),
  memoryLink: document.querySelector('#menuMemoryLink'),
  physicsLink: document.querySelector('#menuPhysicsLink'),
  workbench: document.querySelector('.menu-workbench'),
  preview: document.querySelector('.menu-preview'),
  pages: document.querySelector('#menuPages'),
};

const HIDDEN_MENU_PAGE_IDS = new Set(['parts', 'matcher']);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let project = null;

init();

async function init() {
  bindPreviewInteraction();
  bindPageLinkInteractions();

  dom.modelSelect.addEventListener('change', async () => {
    const modelId = dom.modelSelect.value;
    window.history.replaceState(null, '', `/?model=${encodeURIComponent(modelId)}`);
    await loadProject(modelId);
  });

  const modelId = new URLSearchParams(window.location.search).get('model');
  await loadProject(modelId);
}

async function loadProject(modelId = null) {
  setState('Loading');
  const url = modelId ? `/api/project?model=${encodeURIComponent(modelId)}` : '/api/project';
  project = await fetchJson(url);

  populateModelSelect(project.models);
  dom.modelTitle.textContent = project.modelId;
  dom.previewImage.src = project.source.image;
  dom.previewImage.alt = `${project.modelId} source drawing`;
  dom.pdfLink.href = project.source.pdf;
  dom.cadLink.href = project.source.cad;
  dom.memoryLink.href = project.memoryUrl;
  dom.physicsLink.href = project.physicsMemoryUrl;
  renderMenuPages(project.menuPages);
  document.title = `Netram - ${project.modelId} Menu`;
  setState('Ready');
}

function bindPreviewInteraction() {
  if (reduceMotion) {
    return;
  }

  dom.preview?.addEventListener('pointermove', (event) => {
    const rect = dom.preview.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    dom.preview.style.setProperty('--glint-x', `${x}%`);
    dom.preview.style.setProperty('--glint-y', `${y}%`);
  });
}

function bindPageLinkInteractions() {
  if (reduceMotion) {
    return;
  }

  dom.pages?.querySelectorAll('.menu-page-link').forEach((link) => {
    if (link.dataset.motionBound === 'true') {
      return;
    }
    link.dataset.motionBound = 'true';
    link.addEventListener('pointermove', (event) => {
      const rect = link.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      link.style.setProperty('--tilt-x', `${(x * 5).toFixed(2)}deg`);
      link.style.setProperty('--tilt-y', `${(-y * 5).toFixed(2)}deg`);
    });
    link.addEventListener('pointerleave', () => {
      link.style.removeProperty('--tilt-x');
      link.style.removeProperty('--tilt-y');
    });
  });
}

function renderMenuPages(menuPages) {
  const visiblePages = Array.isArray(menuPages)
    ? menuPages.filter((page) => page && !HIDDEN_MENU_PAGE_IDS.has(page.id))
    : [];
  if (visiblePages.length === 0) {
    return;
  }

  dom.pages.replaceChildren(...visiblePages.map(createMenuPageLink));
  bindPageLinkInteractions();
}

function createMenuPageLink(page) {
  const link = document.createElement('a');
  link.className = `menu-page-link${page.primary ? ' is-primary' : ''}`;
  link.dataset.menuLink = page.id;
  link.href = page.href;

  const index = document.createElement('span');
  index.className = 'menu-page-index';
  index.textContent = page.badge;

  const copy = document.createElement('span');
  copy.className = 'menu-page-copy';

  const title = document.createElement('strong');
  title.textContent = page.title;

  const description = document.createElement('small');
  description.textContent = page.description;

  copy.append(title, description);
  link.append(index, copy);
  return link;
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

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function setState(value) {
  dom.state.textContent = value;
}
