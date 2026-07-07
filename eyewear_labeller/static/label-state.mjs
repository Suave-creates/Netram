export function createInitialState(memory) {
  return {
    modelId: memory.modelId,
    labels: cloneLabels(memory.labels ?? []),
    groups: cloneGroups(memory.groups ?? []),
    selectedLabelIds: new Set(),
    selectedGroupIds: new Set(),
    dirty: false,
  };
}

export function toggleSelection(state, labelId, additive = false) {
  const selectedLabelIds = additive ? new Set(state.selectedLabelIds) : new Set();

  if (additive && selectedLabelIds.has(labelId)) {
    selectedLabelIds.delete(labelId);
  } else {
    selectedLabelIds.add(labelId);
  }

  return {
    ...state,
    selectedLabelIds,
    selectedGroupIds: new Set(),
  };
}

export function clearSelection(state) {
  return {
    ...state,
    selectedLabelIds: new Set(),
    selectedGroupIds: new Set(),
  };
}

export function deleteSelection(state) {
  if (state.selectedLabelIds.size === 0 && state.selectedGroupIds.size === 0) {
    return state;
  }

  const selectedLabels = state.selectedLabelIds;
  const selectedGroups = state.selectedGroupIds;
  const labels = state.labels
    .filter((label) => !selectedLabels.has(label.id) && !selectedGroups.has(label.groupId))
    .map((label) => (selectedGroups.has(label.groupId) ? { ...label, groupId: null } : label));
  const remainingLabelIds = new Set(labels.map((label) => label.id));

  const groups = state.groups
    .filter((group) => !selectedGroups.has(group.id))
    .map((group) => ({
      ...group,
      labelIds: group.labelIds.filter((labelId) => remainingLabelIds.has(labelId)),
    }))
    .filter((group) => group.labelIds.length > 0);

  const remainingGroupIds = new Set(groups.map((group) => group.id));
  const normalizedLabels = labels.map((label) => (
    label.groupId && !remainingGroupIds.has(label.groupId) ? { ...label, groupId: null } : label
  ));

  return {
    ...state,
    labels: normalizedLabels,
    groups,
    selectedLabelIds: new Set(),
    selectedGroupIds: new Set(),
    dirty: true,
  };
}

export function groupSelection(state, component, groupName) {
  const selectedIds = [...state.selectedLabelIds];
  if (selectedIds.length === 0) {
    return state;
  }

  const groupId = makeId('group');
  const selectedSet = new Set(selectedIds);
  const group = {
    id: groupId,
    component,
    name: groupName || readableComponent(component),
    labelIds: selectedIds,
    notes: '',
  };
  const groups = state.groups
    .map((existingGroup) => ({
      ...existingGroup,
      labelIds: existingGroup.labelIds.filter((labelId) => !selectedSet.has(labelId)),
    }))
    .filter((existingGroup) => existingGroup.labelIds.length > 0);

  return {
    ...state,
    labels: state.labels.map((label) => (
      selectedSet.has(label.id) ? { ...label, component, groupId } : label
    )),
    groups: [...groups, group],
    selectedGroupIds: new Set([groupId]),
    dirty: true,
  };
}

export function addLabel(state, label) {
  const normalized = normalizeLabel(label);
  return {
    ...state,
    labels: [...state.labels, normalized],
    selectedLabelIds: new Set([normalized.id]),
    selectedGroupIds: new Set(),
    dirty: true,
  };
}

export function updateLabel(state, labelId, patch) {
  return {
    ...state,
    labels: state.labels.map((label) => (
      label.id === labelId ? normalizeLabel({ ...label, ...patch }) : label
    )),
    dirty: true,
  };
}

export function moveLabel(state, labelId, dx, dy) {
  return {
    ...state,
    labels: state.labels.map((label) => {
      if (label.id !== labelId) {
        return label;
      }
      return normalizeLabel({
        ...label,
        points: label.points.map((point) => ({
          x: point.x + dx,
          y: point.y + dy,
        })),
      });
    }),
    dirty: true,
  };
}

export function resizeRectLabel(state, labelId, handle, target, minSize = 8) {
  return {
    ...state,
    labels: state.labels.map((label) => {
      if (label.id !== labelId || label.type !== 'rect') {
        return label;
      }

      const bounds = labelBounds(label);
      let left = bounds.x;
      let top = bounds.y;
      let right = bounds.x + bounds.width;
      let bottom = bounds.y + bounds.height;

      if (handle.includes('w')) {
        left = Math.min(target.x, right - minSize);
      }
      if (handle.includes('e')) {
        right = Math.max(target.x, left + minSize);
      }
      if (handle.includes('n')) {
        top = Math.min(target.y, bottom - minSize);
      }
      if (handle.includes('s')) {
        bottom = Math.max(target.y, top + minSize);
      }

      return normalizeLabel({
        ...label,
        points: [
          { x: left, y: top },
          { x: right, y: bottom },
        ],
      });
    }),
    dirty: true,
  };
}

export function updatePolygonPoint(state, labelId, pointIndex, target) {
  return {
    ...state,
    labels: state.labels.map((label) => {
      if (label.id !== labelId || label.type !== 'polygon' || !label.points[pointIndex]) {
        return label;
      }

      return normalizeLabel({
        ...label,
        points: label.points.map((point, index) => (
          index === pointIndex ? { x: target.x, y: target.y } : point
        )),
      });
    }),
    dirty: true,
  };
}

export function updateGroup(state, groupId, patch) {
  return {
    ...state,
    groups: state.groups.map((group) => (
      group.id === groupId ? { ...group, ...patch } : group
    )),
    dirty: true,
  };
}

export function serializeState(state, modelId) {
  return {
    modelId,
    labels: cloneLabels(state.labels),
    groups: cloneGroups(state.groups),
    updatedAt: new Date().toISOString(),
  };
}

export function snapshotState(state) {
  return {
    labels: cloneLabels(state.labels),
    groups: cloneGroups(state.groups),
    selectedLabelIds: [...state.selectedLabelIds],
    selectedGroupIds: [...state.selectedGroupIds],
  };
}

export function restoreSnapshot(state, snapshot) {
  return {
    ...state,
    labels: cloneLabels(snapshot.labels ?? []),
    groups: cloneGroups(snapshot.groups ?? []),
    selectedLabelIds: new Set(snapshot.selectedLabelIds ?? []),
    selectedGroupIds: new Set(snapshot.selectedGroupIds ?? []),
    dirty: true,
  };
}

export function selectedLabels(state) {
  return state.labels.filter((label) => state.selectedLabelIds.has(label.id));
}

export function labelsForRendering(state) {
  return [...state.labels].sort((left, right) => (
    Number(state.selectedLabelIds.has(left.id)) - Number(state.selectedLabelIds.has(right.id))
  ));
}

export function labelBounds(label) {
  const xs = label.points.map((point) => point.x);
  const ys = label.points.map((point) => point.y);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

export function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneLabels(labels) {
  return labels.map(normalizeLabel);
}

function cloneGroups(groups) {
  return groups.map((group) => ({
    id: group.id,
    component: group.component,
    name: group.name ?? readableComponent(group.component),
    labelIds: [...(group.labelIds ?? [])],
    notes: group.notes ?? '',
  }));
}

function normalizeLabel(label) {
  return {
    id: label.id,
    type: label.type,
    component: label.component,
    view: label.view,
    points: label.points.map((point) => ({ x: point.x, y: point.y })),
    groupId: label.groupId ?? null,
    notes: label.notes ?? '',
  };
}

function readableComponent(component) {
  return component.replaceAll('_', ' ');
}
