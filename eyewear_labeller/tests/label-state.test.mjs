import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createInitialState,
  deleteSelection,
  groupSelection,
  labelsForRendering,
  moveLabel,
  resizeRectLabel,
  restoreSnapshot,
  serializeState,
  snapshotState,
  toggleSelection,
  updatePolygonPoint,
} from '../static/label-state.mjs';

const memory = {
  modelId: 'VC S19003',
  labels: [
    {
      id: 'a',
      type: 'rect',
      component: 'rim',
      view: 'front',
      points: [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
      groupId: null,
      notes: '',
    },
    {
      id: 'b',
      type: 'rect',
      component: 'rim',
      view: 'top',
      points: [
        { x: 3, y: 3 },
        { x: 4, y: 4 },
      ],
      groupId: null,
      notes: '',
    },
  ],
  groups: [],
};

test('shift-style additive selection keeps adjacent labels selected', () => {
  let state = createInitialState(memory);
  state = toggleSelection(state, 'a', false);
  state = toggleSelection(state, 'b', true);
  assert.deepEqual([...state.selectedLabelIds].sort(), ['a', 'b']);
});

test('groupSelection assigns selected labels to one physical component group', () => {
  let state = createInitialState(memory);
  state = toggleSelection(state, 'a', false);
  state = toggleSelection(state, 'b', true);
  state = groupSelection(state, 'rim', 'Left rim physical component');
  assert.equal(state.groups.length, 1);
  assert.equal(state.labels.find((label) => label.id === 'a').groupId, state.groups[0].id);
  assert.equal(state.labels.find((label) => label.id === 'b').groupId, state.groups[0].id);
});

test('groupSelection moves labels out of a previous group', () => {
  let state = createInitialState(memory);
  state = toggleSelection(state, 'a', false);
  state = groupSelection(state, 'rim', 'Original group');
  const originalGroupId = state.groups[0].id;

  state = toggleSelection(state, 'a', false);
  state = toggleSelection(state, 'b', true);
  state = groupSelection(state, 'rim', 'New group');

  assert.equal(state.groups.some((group) => group.id === originalGroupId), false);
  assert.equal(state.groups.length, 1);
  assert.deepEqual(state.groups[0].labelIds.sort(), ['a', 'b']);
});

test('deleteSelection removes selected labels and drops empty groups', () => {
  let state = createInitialState(memory);
  state = toggleSelection(state, 'a', false);
  state = toggleSelection(state, 'b', true);
  state = groupSelection(state, 'rim', 'Rim group');
  state = deleteSelection(state);
  assert.equal(state.labels.length, 0);
  assert.equal(state.groups.length, 0);
});

test('serializeState emits file-backed memory shape', () => {
  let state = createInitialState(memory);
  state = toggleSelection(state, 'a', false);
  const payload = serializeState(state, 'VC S19003');
  assert.equal(payload.modelId, 'VC S19003');
  assert.equal(payload.labels.length, 2);
  assert.match(payload.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('moveLabel translates every point on a selected box', () => {
  let state = createInitialState(memory);

  state = moveLabel(state, 'a', 10, -5);

  assert.deepEqual(state.labels.find((label) => label.id === 'a').points, [
    { x: 11, y: -4 },
    { x: 12, y: -3 },
  ]);
  assert.equal(state.dirty, true);
});

test('resizeRectLabel moves one corner while keeping the opposite corner anchored', () => {
  let state = createInitialState(memory);

  state = resizeRectLabel(state, 'a', 'se', { x: 12, y: 14 }, 2);

  assert.deepEqual(state.labels.find((label) => label.id === 'a').points, [
    { x: 1, y: 1 },
    { x: 12, y: 14 },
  ]);
  assert.equal(state.dirty, true);
});

test('resizeRectLabel enforces minimum box size', () => {
  let state = createInitialState(memory);

  state = resizeRectLabel(state, 'a', 'se', { x: 1.2, y: 1.4 }, 2);

  assert.deepEqual(state.labels.find((label) => label.id === 'a').points, [
    { x: 1, y: 1 },
    { x: 3, y: 3 },
  ]);
});

test('updatePolygonPoint moves only the selected polygon vertex', () => {
  const polygonMemory = {
    ...memory,
    labels: [
      ...memory.labels,
      {
        id: 'temple-shape',
        type: 'polygon',
        component: 'temple',
        view: 'side-left',
        points: [
          { x: 10, y: 20 },
          { x: 50, y: 20 },
          { x: 60, y: 40 },
          { x: 12, y: 44 },
        ],
        groupId: null,
        notes: '',
      },
    ],
  };
  let state = createInitialState(polygonMemory);

  state = updatePolygonPoint(state, 'temple-shape', 2, { x: 72, y: 51 });

  assert.deepEqual(state.labels.find((label) => label.id === 'temple-shape').points, [
    { x: 10, y: 20 },
    { x: 50, y: 20 },
    { x: 72, y: 51 },
    { x: 12, y: 44 },
  ]);
  assert.equal(state.dirty, true);
});

test('labelsForRendering places selected labels after overlapping unselected labels', () => {
  let state = createInitialState({
    ...memory,
    labels: [
      {
        id: 'selected-temple',
        type: 'polygon',
        component: 'temple',
        view: 'side-left',
        points: [
          { x: 0, y: 0 },
          { x: 20, y: 0 },
          { x: 20, y: 20 },
        ],
        groupId: null,
        notes: '',
      },
      {
        id: 'overlap-tip',
        type: 'rect',
        component: 'temple_tip',
        view: 'side-left',
        points: [
          { x: 10, y: 10 },
          { x: 30, y: 30 },
        ],
        groupId: null,
        notes: '',
      },
    ],
  });
  state = toggleSelection(state, 'selected-temple', false);

  assert.deepEqual(labelsForRendering(state).map((label) => label.id), ['overlap-tip', 'selected-temple']);
});

test('snapshotState and restoreSnapshot undo label geometry and selection together', () => {
  let state = createInitialState(memory);
  state = toggleSelection(state, 'a', false);
  const snapshot = snapshotState(state);

  state = moveLabel(state, 'a', 20, 30);
  state = toggleSelection(state, 'b', false);
  state = restoreSnapshot(state, snapshot);

  assert.deepEqual(state.labels.find((label) => label.id === 'a').points, [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
  ]);
  assert.deepEqual([...state.selectedLabelIds], ['a']);
  assert.equal(state.dirty, true);
});

test('restoreSnapshot can undo grouping changes', () => {
  let state = createInitialState(memory);
  state = toggleSelection(state, 'a', false);
  state = toggleSelection(state, 'b', true);
  const snapshot = snapshotState(state);

  state = groupSelection(state, 'rim', 'Grouped rim');
  state = restoreSnapshot(state, snapshot);

  assert.equal(state.groups.length, 0);
  assert.equal(state.labels.every((label) => label.groupId === null), true);
  assert.deepEqual([...state.selectedLabelIds].sort(), ['a', 'b']);
});
