import { openFormModal } from '../../../ui/components.js';
import { bodyPartLabels } from '../../inventory/constants.js';
import { getCategoryLabel } from '../../inventory/utils.js';
import { ensureLegacyThree } from '../../../lib/legacyThree.js';
import { calcTotalWeight } from '../../../lib/calc.js';
import { formatWeight } from '../../../lib/format.js';
import { getEquipSlots } from './utils.js';

const node = (shape, size, position, rotation = null, color = null) => ({
  shape,
  size,
  position,
  rotation,
  color
});

const PART_DEFINITIONS = [
  {
    id: 'head', label: 'Testa', slots: ['head'], anchor: [0.35, 2.66, 0.28],
    nodes: [
      node('sphere', [0.3, 0.37, 0.275], [0, 2.62, 0]),
      node('sphere', [0.215, 0.185, 0.22], [0, 2.4, 0.035]),
      node('sphere', [0.298, 0.165, 0.27], [0, 2.83, -0.018], null, 0x69513d)
    ]
  },
  { id: 'eyes-right', label: 'Occhio destro', slots: ['eyes-right', 'eyes'], anchor: [-0.2, 2.67, 0.34], detail: true, nodes: [node('sphere', [0.052, 0.04, 0.025], [-0.115, 2.64, 0.275], null, 0x465255)] },
  { id: 'eyes-left', label: 'Occhio sinistro', slots: ['eyes-left', 'eyes'], anchor: [0.2, 2.67, 0.34], detail: true, nodes: [node('sphere', [0.052, 0.04, 0.025], [0.115, 2.64, 0.275], null, 0x465255)] },
  { id: 'nose', label: 'Naso', slots: ['nose'], anchor: [0, 2.56, 0.34], detail: true, nodes: [node('sphere', [0.048, 0.075, 0.068], [0, 2.56, 0.285])] },
  { id: 'mouth', label: 'Bocca', slots: ['mouth'], anchor: [0, 2.4, 0.31], detail: true, nodes: [node('sphere', [0.11, 0.025, 0.025], [0, 2.4, 0.244])] },
  { id: 'ears-right', label: 'Orecchio destro', slots: ['ears-right', 'ears'], anchor: [-0.42, 2.62, 0.08], detail: true, nodes: [node('sphere', [0.052, 0.095, 0.055], [-0.335, 2.6, 0])] },
  { id: 'ears-left', label: 'Orecchio sinistro', slots: ['ears-left', 'ears'], anchor: [0.42, 2.62, 0.08], detail: true, nodes: [node('sphere', [0.052, 0.095, 0.055], [0.335, 2.6, 0])] },
  { id: 'neck', label: 'Collo', slots: ['neck'], anchor: [0.28, 2.22, 0.25], nodes: [node('cylinder', [0.145, 0.17, 0.3], [0, 2.18, 0])] },
  {
    id: 'chest', label: 'Torso', slots: ['chest'], anchor: [0.58, 1.63, 0.35],
    nodes: [
      node('cylinder', [0.53, 0.35, 0.96], [0, 1.61, 0]),
      node('sphere', [0.48, 0.19, 0.29], [0, 1.94, 0.02]),
      node('cylinder', [0.34, 0.31, 0.3], [0, 1.08, 0])
    ]
  },
  { id: 'back', label: 'Schiena', slots: ['back'], anchor: [-0.52, 1.63, -0.34], nodes: [node('sphere', [0.42, 0.58, 0.12], [0, 1.58, -0.31])] },
  { id: 'shoulder-right', label: 'Spalla destra', slots: ['shoulder-right', 'shoulders'], anchor: [-0.68, 2, 0.28], nodes: [node('sphere', [0.25, 0.22, 0.25], [-0.57, 1.94, 0])] },
  { id: 'shoulder-left', label: 'Spalla sinistra', slots: ['shoulder-left', 'shoulders'], anchor: [0.68, 2, 0.28], nodes: [node('sphere', [0.25, 0.22, 0.25], [0.57, 1.94, 0])] },
  {
    id: 'arm-right', label: 'Braccio destro', slots: ['arm-right', 'arms'], anchor: [-0.82, 1.35, 0.25],
    nodes: [
      node('cylinder', [0.14, 0.18, 0.58], [-0.7, 1.56, 0], [0, 0, -0.13])
    ]
  },
  {
    id: 'arm-left', label: 'Braccio sinistro', slots: ['arm-left', 'arms'], anchor: [0.82, 1.35, 0.25],
    nodes: [
      node('cylinder', [0.14, 0.18, 0.58], [0.7, 1.56, 0], [0, 0, 0.13])
    ]
  },
  { id: 'elbow-right', label: 'Gomito destro', slots: ['elbow-right', 'elbows'], anchor: [-0.83, 1.24, 0.22], nodes: [node('sphere', [0.145, 0.15, 0.145], [-0.75, 1.24, 0])] },
  { id: 'elbow-left', label: 'Gomito sinistro', slots: ['elbow-left', 'elbows'], anchor: [0.83, 1.24, 0.22], nodes: [node('sphere', [0.145, 0.15, 0.145], [0.75, 1.24, 0])] },
  { id: 'forearm-right', label: 'Avambraccio destro', slots: ['forearm-right', 'forearms'], anchor: [-0.87, 0.94, 0.23], nodes: [node('cylinder', [0.11, 0.145, 0.55], [-0.79, 0.94, 0.015], [0, 0, -0.08])] },
  { id: 'forearm-left', label: 'Avambraccio sinistro', slots: ['forearm-left', 'forearms'], anchor: [0.87, 0.94, 0.23], nodes: [node('cylinder', [0.11, 0.145, 0.55], [0.79, 0.94, 0.015], [0, 0, 0.08])] },
  { id: 'wrist-right', label: 'Polso destro', slots: ['wrist-right', 'wrists'], anchor: [-0.87, 0.65, 0.22], nodes: [node('cylinder', [0.105, 0.115, 0.16], [-0.82, 0.62, 0])] },
  { id: 'wrist-left', label: 'Polso sinistro', slots: ['wrist-left', 'wrists'], anchor: [0.87, 0.65, 0.22], nodes: [node('cylinder', [0.105, 0.115, 0.16], [0.82, 0.62, 0])] },
  { id: 'hand-right', label: 'Mano destra', slots: ['hand-right', 'hands', 'main-hand', 'ring-right', 'ring'], anchor: [-0.91, 0.38, 0.24], nodes: [node('sphere', [0.135, 0.21, 0.11], [-0.84, 0.39, 0.015]), node('box', [0.14, 0.2, 0.08], [-0.84, 0.31, 0.02])] },
  { id: 'hand-left', label: 'Mano sinistra', slots: ['hand-left', 'hands', 'off-hand', 'ring-left', 'ring'], anchor: [0.91, 0.38, 0.24], nodes: [node('sphere', [0.135, 0.21, 0.11], [0.84, 0.39, 0.015]), node('box', [0.14, 0.2, 0.08], [0.84, 0.31, 0.02])] },
  {
    id: 'waist', label: 'Vita', slots: ['waist'], anchor: [0.48, 0.83, 0.28],
    nodes: [
      node('cylinder', [0.33, 0.4, 0.28], [0, 0.84, 0]),
      node('sphere', [0.43, 0.28, 0.3], [0, 0.67, 0])
    ]
  },
  {
    id: 'leg-right', label: 'Gamba destra', slots: ['leg-right', 'legs'], anchor: [-0.42, 0.02, 0.25],
    nodes: [
      node('cylinder', [0.2, 0.25, 0.68], [-0.22, 0.3, 0])
    ]
  },
  {
    id: 'leg-left', label: 'Gamba sinistra', slots: ['leg-left', 'legs'], anchor: [0.42, 0.02, 0.25],
    nodes: [
      node('cylinder', [0.2, 0.25, 0.68], [0.22, 0.3, 0])
    ]
  },
  { id: 'knee-right', label: 'Ginocchio destro', slots: ['knee-right', 'knees'], anchor: [-0.36, -0.08, 0.23], nodes: [node('sphere', [0.18, 0.16, 0.18], [-0.22, -0.08, 0])] },
  { id: 'knee-left', label: 'Ginocchio sinistro', slots: ['knee-left', 'knees'], anchor: [0.36, -0.08, 0.23], nodes: [node('sphere', [0.18, 0.16, 0.18], [0.22, -0.08, 0])] },
  { id: 'shin-right', label: 'Tibia destra', slots: ['shin-right', 'shins'], anchor: [-0.37, -0.43, 0.23], nodes: [node('cylinder', [0.14, 0.18, 0.63], [-0.22, -0.43, 0])] },
  { id: 'shin-left', label: 'Tibia sinistra', slots: ['shin-left', 'shins'], anchor: [0.37, -0.43, 0.23], nodes: [node('cylinder', [0.14, 0.18, 0.63], [0.22, -0.43, 0])] },
  { id: 'foot-right', label: 'Piede destro', slots: ['foot-right', 'feet'], anchor: [-0.37, -0.83, 0.35], nodes: [node('sphere', [0.22, 0.15, 0.37], [-0.22, -0.81, 0.14])] },
  { id: 'foot-left', label: 'Piede sinistro', slots: ['foot-left', 'feet'], anchor: [0.37, -0.83, 0.35], nodes: [node('sphere', [0.22, 0.15, 0.37], [0.22, -0.81, 0.14])] }
];

const BASE_COLOR = 0x86a88d;
const EQUIPPED_COLOR = 0xb66f67;
const HOVER_COLOR = 0x8291a0;
const SELECTED_COLOR = 0x6d8fb6;
const COMPATIBLE_COLOR = 0xd2b85f;
const INACTIVE_COLOR = 0xa4a19b;

const CATEGORY_COMPATIBLE_PARTS = {
  weapon: ['hand-left', 'hand-right'],
  jewelry: [
    'head', 'eyes-left', 'eyes-right', 'nose', 'mouth', 'ears-left', 'ears-right', 'neck',
    'wrist-left', 'wrist-right', 'hand-left', 'hand-right', 'waist'
  ],
  armor: [
    'head', 'chest', 'back', 'shoulder-left', 'shoulder-right', 'arm-left', 'arm-right',
    'elbow-left', 'elbow-right', 'forearm-left', 'forearm-right', 'hand-left', 'hand-right',
    'waist', 'leg-left', 'leg-right', 'knee-left', 'knee-right', 'shin-left', 'shin-right',
    'foot-left', 'foot-right'
  ],
  container: ['back', 'waist', 'hand-left', 'hand-right'],
  gear: [
    'head', 'neck', 'chest', 'back', 'shoulder-left', 'shoulder-right', 'arm-left', 'arm-right',
    'elbow-left', 'elbow-right', 'forearm-left', 'forearm-right', 'wrist-left', 'wrist-right',
    'hand-left', 'hand-right', 'waist', 'leg-left', 'leg-right', 'knee-left', 'knee-right',
    'shin-left', 'shin-right', 'foot-left', 'foot-right'
  ]
};

export function getItemsForMannequinPart(items, part) {
  if (!part) return [];
  return (items || []).filter((item) => {
    const itemSlots = getEquipSlots(item);
    return itemSlots.some((slot) => part.slots.includes(slot));
  });
}

export function getMannequinEquipSlot(item, partId) {
  if (partId === 'hand-right') {
    if (item?.category === 'weapon' || item?.is_shield) return 'main-hand';
    if (item?.category === 'jewelry') return 'ring-right';
  }
  if (partId === 'hand-left') {
    if (item?.category === 'weapon' || item?.is_shield) return 'off-hand';
    if (item?.category === 'jewelry') return 'ring-left';
  }
  return partId;
}

export function getCompatibleMannequinPartIds(item) {
  const explicitSlots = Array.isArray(item?.compatible_equip_slots)
    ? item.compatible_equip_slots.filter(Boolean)
    : Array.isArray(item?.allowed_equip_slots)
      ? item.allowed_equip_slots.filter(Boolean)
      : [];
  if (explicitSlots.length) {
    return PART_DEFINITIONS
      .filter((part) => part.slots.some((slot) => explicitSlots.includes(slot)))
      .map((part) => part.id);
  }
  if (item?.is_shield) return ['hand-left', 'hand-right'];
  return [...(CATEGORY_COMPATIBLE_PARTS[item?.category] || PART_DEFINITIONS.map((part) => part.id))];
}

export function getAvailableCompatibleMannequinPartIds(item, items = []) {
  const compatiblePartIds = getCompatibleMannequinPartIds(item);
  if (item?.sovrapponibile) return compatiblePartIds;
  return compatiblePartIds.filter((partId) => {
    const part = PART_DEFINITIONS.find((definition) => definition.id === partId);
    return getItemsForMannequinPart(items, part).length === 0;
  });
}

function createGeometry(THREE, definition) {
  const [a, b, c] = definition.size;
  if (definition.shape === 'box') return new THREE.BoxGeometry(a, b, c);
  if (definition.shape === 'cylinder') return new THREE.CylinderGeometry(a, b, c, 24);
  const geometry = new THREE.SphereGeometry(1, 28, 20);
  geometry.applyMatrix(new THREE.Matrix4().makeScale(a, b, c));
  return geometry;
}

function applyTransform(mesh, definition) {
  mesh.position.set(...definition.position);
  if (definition.rotation) mesh.rotation.set(...definition.rotation);
}

function setPartMaterialState(mesh, state) {
  if (!mesh?.material) return;
  const baseColor = mesh.userData.baseColor || BASE_COLOR;
  const color = state === 'compatible-on'
    ? COMPATIBLE_COLOR
    : state === 'compatible-off'
      ? 0xac954e
      : state === 'inactive'
        ? INACTIVE_COLOR
        : state === 'selected-on'
          ? SELECTED_COLOR
          : state === 'selected-off'
            ? 0x536f8e
          : state === 'hover'
            ? HOVER_COLOR
            : mesh.userData.itemCount > 0 ? EQUIPPED_COLOR : baseColor;
  const emissive = state === 'compatible-on'
    ? 0x1a1504
    : state === 'compatible-off'
      ? 0x000000
      : state === 'selected-on'
        ? 0x0b1622
        : state === 'hover' ? 0x0b1117 : 0x000000;
  mesh.material.color.setHex(color);
  mesh.material.emissive.setHex(emissive);
}

function buildMannequinContent({ canEdit, items = [], weightUnit = 'lb' }) {
  const content = document.createElement('div');
  content.className = 'equipment-mannequin equipment-mannequin--studio';

  const viewer = document.createElement('div');
  viewer.className = 'equipment-mannequin__viewer';
  viewer.dataset.mannequinCanvas = '';
  const loading = document.createElement('div');
  loading.className = 'equipment-mannequin__loading';
  loading.textContent = 'Preparazione del manichino 3D…';
  const guidance = document.createElement('div');
  guidance.className = 'equipment-mannequin__guidance';
  guidance.dataset.mannequinGuidance = '';
  guidance.textContent = canEdit
    ? 'Scegli un oggetto, poi tocca una parte del corpo'
    : 'Tocca una parte del corpo per vedere cosa indossa';
  const legend = document.createElement('div');
  legend.className = 'equipment-mannequin__legend';
  legend.setAttribute('aria-label', 'Legenda colori del manichino');
  const legendEntries = [
    ['free', 'Libero'],
    ['equipped', 'Equipaggiato'],
    ['selected', 'Selezionato'],
    ...(canEdit ? [['compatible', 'Compatibile']] : [])
  ];
  legendEntries.forEach(([state, label]) => {
    const entry = document.createElement('span');
    const swatch = document.createElement('i');
    swatch.className = `equipment-mannequin__legend-swatch equipment-mannequin__legend-swatch--${state}`;
    swatch.setAttribute('aria-hidden', 'true');
    entry.append(swatch, document.createTextNode(label));
    legend.appendChild(entry);
  });
  const carriedUnits = (items || []).reduce((total, item) => {
    const qty = Number(item?.qty ?? 1);
    return total + (Number.isFinite(qty) ? Math.max(0, qty) : 0);
  }, 0);
  const load = document.createElement('div');
  load.className = 'equipment-mannequin__load';
  const loadLabel = document.createElement('small');
  loadLabel.textContent = 'Carico trasportato';
  const loadValue = document.createElement('strong');
  loadValue.textContent = formatWeight(calcTotalWeight(items), weightUnit);
  const loadCount = document.createElement('span');
  loadCount.textContent = `${carriedUnits} ${carriedUnits === 1 ? 'oggetto' : 'oggetti'}`;
  load.append(loadLabel, loadValue, loadCount);
  const hud = document.createElement('div');
  hud.className = 'equipment-mannequin__hud';
  hud.append(legend, load);
  const focusControls = document.createElement('div');
  focusControls.className = 'equipment-mannequin__focus-controls';
  focusControls.setAttribute('aria-label', 'Inquadrature rapide');
  const headFocusButton = document.createElement('button');
  headFocusButton.type = 'button';
  headFocusButton.className = 'equipment-mannequin__focus-button';
  headFocusButton.dataset.mannequinFocus = 'head';
  headFocusButton.setAttribute('aria-pressed', 'false');
  headFocusButton.innerHTML = '<span aria-hidden="true">◯</span><strong>Testa</strong>';
  focusControls.appendChild(headFocusButton);
  viewer.append(loading, guidance, hud, focusControls);

  const panel = document.createElement('aside');
  panel.className = 'equipment-mannequin__panel';

  const selected = document.createElement('section');
  selected.className = 'equipment-mannequin__selection';
  const selectionEyebrow = document.createElement('small');
  selectionEyebrow.textContent = 'Punto selezionato';
  const selectionTitle = document.createElement('strong');
  selectionTitle.dataset.mannequinPartLabel = '';
  const itemList = document.createElement('ul');
  itemList.className = 'equipment-mannequin__items';
  itemList.dataset.mannequinItems = '';
  selected.append(selectionEyebrow, selectionTitle, itemList);
  panel.appendChild(selected);

  if (canEdit) {
    const wardrobe = document.createElement('section');
    wardrobe.className = 'equipment-mannequin__wardrobe';
    const wardrobeHeader = document.createElement('div');
    wardrobeHeader.className = 'equipment-mannequin__section-header';
    const wardrobeTitle = document.createElement('div');
    const wardrobeEyebrow = document.createElement('small');
    wardrobeEyebrow.textContent = 'Guardaroba';
    const wardrobeHeading = document.createElement('strong');
    wardrobeHeading.textContent = 'Pronti da equipaggiare';
    wardrobeTitle.append(wardrobeEyebrow, wardrobeHeading);
    const wardrobeCount = document.createElement('span');
    wardrobeCount.className = 'equipment-mannequin__wardrobe-count';
    wardrobeCount.dataset.mannequinWardrobeCount = '';
    wardrobeHeader.append(wardrobeTitle, wardrobeCount);

    const wardrobeList = document.createElement('div');
    wardrobeList.className = 'equipment-mannequin__wardrobe-list';
    wardrobeList.dataset.mannequinWardrobe = '';

    wardrobe.append(wardrobeHeader, wardrobeList);
    panel.appendChild(wardrobe);
  }

  const controls = document.createElement('div');
  controls.className = 'equipment-mannequin__controls';
  const hint = document.createElement('span');
  hint.textContent = 'Trascina il manichino per ruotarlo · rotella per zoom';
  controls.append(hint);
  panel.appendChild(controls);

  const liveStatus = document.createElement('p');
  liveStatus.className = 'equipment-mannequin__status';
  liveStatus.dataset.mannequinStatus = '';
  liveStatus.setAttribute('aria-live', 'polite');
  content.append(viewer, panel, liveStatus);
  return content;
}

function initializeEquipmentManager(root, workingItems, THREE, options) {
  const {
    canEdit = false,
    onEquip,
    onUnequip,
    onChanged,
    resetButton = root.querySelector('[data-mannequin-reset]')
  } = options;
  const canvasHost = root.querySelector('[data-mannequin-canvas]');
  const detailLabel = root.querySelector('[data-mannequin-part-label]');
  const detailItems = root.querySelector('[data-mannequin-items]');
  const wardrobe = root.querySelector('[data-mannequin-wardrobe]');
  const wardrobeCount = root.querySelector('[data-mannequin-wardrobe-count]');
  const guidance = root.querySelector('[data-mannequin-guidance]');
  const status = root.querySelector('[data-mannequin-status]');
  const focusButtons = [...root.querySelectorAll('[data-mannequin-focus]')];
  if (!canvasHost || !detailLabel || !detailItems || !guidance || !status) return () => {};

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.24, 8.35);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.setAttribute('aria-label', 'Manichino umano 3D interattivo con parti del corpo selezionabili');
  renderer.domElement.setAttribute('role', 'img');
  canvasHost.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xfff1dc, 0x34484b, 1.08));
  const keyLight = new THREE.DirectionalLight(0xfff8ed, 0.76);
  keyLight.position.set(3.5, 5.5, 5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xb9d7d8, 0.43);
  fillLight.position.set(-4, 2.5, 3);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0xe7c995, 0.34);
  rimLight.position.set(2, 3, -4);
  scene.add(rimLight);

  const mannequin = new THREE.Object3D();
  mannequin.position.y = -0.72;
  scene.add(mannequin);

  const partMeshes = [];
  const meshesById = new Map();
  const itemMap = new Map();

  PART_DEFINITIONS.forEach((part) => {
    const meshes = [];
    part.nodes.forEach((partNode) => {
      const baseColor = BASE_COLOR;
      const mesh = new THREE.Mesh(
        createGeometry(THREE, partNode),
        new THREE.MeshPhongMaterial({ color: baseColor, emissive: 0x000000, shininess: part.detail ? 72 : 34 })
      );
      applyTransform(mesh, partNode);
      mesh.userData.partId = part.id;
      mesh.userData.itemCount = 0;
      mesh.userData.baseColor = baseColor;
      mannequin.add(mesh);
      partMeshes.push(mesh);
      meshes.push(mesh);
    });
    meshesById.set(part.id, meshes);
  });

  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(1.18, 1.32, 0.1, 40),
    new THREE.MeshPhongMaterial({ color: 0x5a4a38, shininess: 26 })
  );
  ground.position.y = -1.59;
  scene.add(ground);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selectedId = null;
  let hoveredId = null;
  let pendingItemId = null;
  let rotating = false;
  let dragDistance = 0;
  let lastPointer = null;
  let cameraDistance = camera.position.z;
  let viewMode = 'body';
  let frame = null;
  let disposed = false;
  let busy = false;
  let compatibilityPulseTimer = null;
  let compatibilityPulseOn = true;

  const getItem = (itemId) => workingItems.find((item) => String(item.id) === String(itemId));
  const getPart = (partId) => PART_DEFINITIONS.find((part) => part.id === partId);

  const render = () => {
    if (disposed || frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = null;
      renderer.render(scene, camera);
    });
  };

  const setBusy = (nextBusy) => {
    busy = nextBusy;
    root.classList.toggle('is-busy', busy);
    root.querySelectorAll('button, input, select').forEach((control) => {
      if (control.dataset.mannequinReset !== undefined) return;
      control.disabled = busy;
    });
  };

  const rebuildItemMap = () => {
    itemMap.clear();
    PART_DEFINITIONS.forEach((part) => itemMap.set(part.id, getItemsForMannequinPart(workingItems, part)));
  };

  const renderSlotCounts = () => {
    root.querySelectorAll('[data-mannequin-part]').forEach((button) => {
      const count = itemMap.get(button.dataset.mannequinPart)?.length || 0;
      const countEl = button.querySelector('[data-mannequin-count]');
      if (countEl) {
        countEl.textContent = count ? 'Equip.' : 'Libero';
        countEl.setAttribute('aria-label', `${count} ${count === 1 ? 'oggetto equipaggiato' : 'oggetti equipaggiati'}`);
      }
    });
  };

  const updatePartStates = () => {
    const pendingItem = getItem(pendingItemId);
    const compatibleIds = new Set(pendingItem ? getAvailableCompatibleMannequinPartIds(pendingItem, workingItems) : []);
    partMeshes.forEach((mesh) => {
      const isCompatible = compatibleIds.has(mesh.userData.partId);
      const state = pendingItem
        ? isCompatible
          ? compatibilityPulseOn ? 'compatible-on' : 'compatible-off'
          : 'inactive'
        : mesh.userData.partId === selectedId
          ? compatibilityPulseOn ? 'selected-on' : 'selected-off'
          : mesh.userData.partId === hoveredId ? 'hover' : 'default';
      setPartMaterialState(mesh, state);
    });
    root.querySelectorAll('[data-mannequin-part]').forEach((button) => {
      const partId = button.dataset.mannequinPart;
      const isSelected = partId === selectedId;
      const isCompatible = compatibleIds.has(partId);
      const isEquipped = Boolean(itemMap.get(partId)?.length);
      button.classList.toggle('is-selected', isSelected);
      button.classList.toggle('is-compatible', Boolean(pendingItem && isCompatible));
      button.classList.toggle('is-incompatible', Boolean(pendingItem && !isCompatible));
      button.classList.toggle('is-equipped', isEquipped);
      button.classList.toggle('is-free', !isEquipped);
      button.classList.toggle('is-drop-target', Boolean(pendingItem && isCompatible && partId === hoveredId));
      button.setAttribute('aria-pressed', String(isSelected));
    });
    root.classList.toggle('has-pending-item', Boolean(pendingItem));
    guidance.textContent = pendingItem
      ? `${pendingItem.name}: scegli una parte lampeggiante · tocca di nuovo l’oggetto per deselezionare`
      : canEdit
        ? 'Scegli un oggetto, poi tocca una parte del corpo'
        : 'Tocca una parte del corpo per vedere cosa indossa';
    render();
  };

  const syncCompatibilityPulse = () => {
    if (compatibilityPulseTimer) {
      window.clearInterval(compatibilityPulseTimer);
      compatibilityPulseTimer = null;
    }
    compatibilityPulseOn = true;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if ((selectedId || pendingItemId) && !reduceMotion) {
      compatibilityPulseTimer = window.setInterval(() => {
        compatibilityPulseOn = !compatibilityPulseOn;
        updatePartStates();
      }, 620);
    }
    updatePartStates();
  };

  const removeEquippedItem = async (item) => {
    if (!canEdit || !onUnequip || busy) return;
    setBusy(true);
    status.textContent = `Rimozione di ${item.name}…`;
    try {
      const updated = await onUnequip(item);
      if (updated === false || updated === null) return;
      Object.assign(item, updated || {}, { equip_slot: null, equip_slots: [] });
      pendingItemId = String(item.id);
      onChanged?.();
      refreshEquipment();
      syncCompatibilityPulse();
      status.textContent = `${item.name} rimosso: scegli una nuova destinazione se vuoi riequipaggiarlo.`;
    } finally {
      setBusy(false);
    }
  };

  const renderDetail = () => {
    const definition = getPart(selectedId);
    const selectedItems = itemMap.get(selectedId) || [];
    detailLabel.textContent = definition?.label || 'Nessuna parte selezionata';
    detailItems.innerHTML = '';
    if (!definition) {
      const empty = document.createElement('li');
      empty.className = 'equipment-mannequin__empty';
      empty.textContent = 'Tocca una parte del manichino per vedere gli oggetti equipaggiati.';
      detailItems.appendChild(empty);
      status.textContent = 'Nessuna parte del corpo selezionata.';
      return;
    }
    if (!selectedItems.length) {
      const empty = document.createElement('li');
      empty.className = 'equipment-mannequin__empty';
      empty.textContent = pendingItemId
        ? 'Punto libero: selezionalo per equipaggiare.'
        : 'Nessun oggetto equipaggiato in questo punto.';
      detailItems.appendChild(empty);
    } else {
      selectedItems.forEach((item) => {
        const row = document.createElement('li');
        row.className = 'equipment-mannequin__item';
        if (item.image_url) {
          row.classList.add('has-image');
          const image = document.createElement('img');
          image.className = 'equipment-mannequin__item-image';
          image.src = item.image_url;
          image.alt = `Immagine di ${item.name || 'oggetto equipaggiato'}`;
          row.appendChild(image);
        }
        const info = document.createElement('div');
        const name = document.createElement('strong');
        name.textContent = item.name || 'Oggetto senza nome';
        const meta = document.createElement('span');
        const slots = getEquipSlots(item).map((slot) => bodyPartLabels.get(slot) || slot).join(', ');
        meta.textContent = `${getCategoryLabel(item.category)} · ${slots}`;
        info.append(name, meta);
        row.appendChild(info);
        if (canEdit && onUnequip) {
          const removeButton = document.createElement('button');
          removeButton.type = 'button';
          removeButton.className = 'equipment-mannequin__remove';
          removeButton.textContent = 'Rimuovi';
          removeButton.setAttribute('aria-label', `Rimuovi ${item.name}`);
          removeButton.addEventListener('click', () => void removeEquippedItem(item));
          row.appendChild(removeButton);
        }
        detailItems.appendChild(row);
      });
    }
    status.textContent = selectedItems.length
      ? `${definition.label}: ${selectedItems.length} ${selectedItems.length === 1 ? 'oggetto equipaggiato' : 'oggetti equipaggiati'}`
      : `${definition.label}: nessun oggetto equipaggiato`;
  };

  const setPendingItem = (itemId) => {
    if (!canEdit || busy) return;
    const nextItemId = itemId ? String(itemId) : null;
    pendingItemId = nextItemId && nextItemId !== String(pendingItemId) ? nextItemId : null;
    renderWardrobe();
    syncCompatibilityPulse();
    const item = getItem(pendingItemId);
    status.textContent = item
      ? `${item.name} selezionato. Scegli una delle parti compatibili lampeggianti.`
      : 'Oggetto deselezionato.';
  };

  const renderWardrobe = () => {
    if (!wardrobe) return;
    const availableItems = workingItems.filter((item) => item.equipable && !getEquipSlots(item).length);
    wardrobe.innerHTML = '';
    if (wardrobeCount) wardrobeCount.textContent = String(availableItems.length);
    if (!availableItems.length) {
      const empty = document.createElement('p');
      empty.className = 'equipment-mannequin__wardrobe-empty';
      empty.textContent = 'Tutti gli oggetti equipaggiabili sono già assegnati.';
      wardrobe.appendChild(empty);
      return;
    }
    availableItems.forEach((item) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'equipment-mannequin__wardrobe-item';
      card.dataset.mannequinItem = String(item.id);
      card.draggable = true;
      card.setAttribute('aria-pressed', String(String(item.id) === String(pendingItemId)));
      card.classList.toggle('is-selected', String(item.id) === String(pendingItemId));
      const visual = document.createElement('span');
      visual.className = 'equipment-mannequin__wardrobe-visual';
      if (item.image_url) {
        const image = document.createElement('img');
        image.src = item.image_url;
        image.alt = '';
        visual.appendChild(image);
      } else {
        visual.textContent = '◇';
      }
      const info = document.createElement('span');
      info.className = 'equipment-mannequin__wardrobe-info';
      const name = document.createElement('strong');
      name.textContent = item.name || 'Oggetto senza nome';
      const category = document.createElement('small');
      category.textContent = getCategoryLabel(item.category);
      info.append(name, category);
      const handle = document.createElement('span');
      handle.className = 'equipment-mannequin__drag-handle';
      handle.textContent = '⋮⋮';
      handle.setAttribute('aria-hidden', 'true');
      card.append(visual, info, handle);
      card.addEventListener('click', () => setPendingItem(item.id));
      card.addEventListener('dragstart', (event) => {
        pendingItemId = String(item.id);
        event.dataTransfer?.setData('text/plain', String(item.id));
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
        card.classList.add('is-dragging');
        syncCompatibilityPulse();
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging');
        hoveredId = null;
        updatePartStates();
      });
      wardrobe.appendChild(card);
    });
  };

  const equipPendingToPart = async (partId, itemId = pendingItemId) => {
    const item = getItem(itemId);
    if (!canEdit || !onEquip || !item || busy) {
      if (!item) selectPart(partId, false);
      return;
    }
    if (!getAvailableCompatibleMannequinPartIds(item, workingItems).includes(partId)) {
      selectedId = partId;
      renderDetail();
      updatePartStates();
      status.textContent = `${getPart(partId)?.label || partId} non è compatibile con ${item.name}.`;
      return;
    }
    const equipSlot = getMannequinEquipSlot(item, partId);
    setBusy(true);
    status.textContent = `Equipaggiamento di ${item.name}…`;
    try {
      const updated = await onEquip(item, [equipSlot], workingItems);
      if (updated === false || updated === null) return;
      Object.assign(item, updated || {}, { equip_slot: equipSlot, equip_slots: [equipSlot] });
      pendingItemId = null;
      selectedId = partId;
      hoveredId = null;
      syncCompatibilityPulse();
      onChanged?.();
      refreshEquipment();
      status.textContent = `${item.name} equipaggiato su ${getPart(partId)?.label || partId}.`;
    } finally {
      setBusy(false);
    }
  };

  const selectPart = (partId, equipIfPending = true) => {
    if (!meshesById.has(partId) || busy) return;
    selectedId = !pendingItemId && selectedId === partId ? null : partId;
    if (pendingItemId && equipIfPending && canEdit) {
      void equipPendingToPart(partId);
      return;
    }
    renderDetail();
    updatePartStates();
  };

  const refreshEquipment = () => {
    rebuildItemMap();
    PART_DEFINITIONS.forEach((part) => {
      const count = itemMap.get(part.id)?.length || 0;
      (meshesById.get(part.id) || []).forEach((mesh) => { mesh.userData.itemCount = count; });
    });
    renderSlotCounts();
    renderDetail();
    renderWardrobe();
    updatePartStates();
  };

  const hitTest = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(partMeshes, false)[0]?.object || null;
  };

  const onPointerMove = (event) => {
    if (rotating && lastPointer) {
      const dx = event.clientX - lastPointer.x;
      const dy = event.clientY - lastPointer.y;
      dragDistance += Math.abs(dx) + Math.abs(dy);
      mannequin.rotation.y += dx * 0.012;
      mannequin.rotation.x = Math.max(-0.2, Math.min(0.2, mannequin.rotation.x + dy * 0.004));
      lastPointer = { x: event.clientX, y: event.clientY };
      render();
      return;
    }
    const hit = hitTest(event);
    const nextHovered = hit?.userData.partId || null;
    if (nextHovered === hoveredId) return;
    hoveredId = nextHovered;
    renderer.domElement.style.cursor = hoveredId ? 'pointer' : 'grab';
    updatePartStates();
  };

  const onPointerDown = (event) => {
    rotating = true;
    dragDistance = 0;
    lastPointer = { x: event.clientX, y: event.clientY };
    renderer.domElement.setPointerCapture?.(event.pointerId);
    renderer.domElement.style.cursor = 'grabbing';
  };

  const onPointerUp = (event) => {
    if (dragDistance < 8) {
      const hit = hitTest(event);
      if (hit?.userData.partId) selectPart(hit.userData.partId);
    }
    rotating = false;
    lastPointer = null;
    renderer.domElement.releasePointerCapture?.(event.pointerId);
    renderer.domElement.style.cursor = hoveredId ? 'pointer' : 'grab';
  };

  const onPointerLeave = () => {
    if (rotating) return;
    hoveredId = null;
    updatePartStates();
  };

  const onWheel = (event) => {
    event.preventDefault();
    const [minDistance, maxDistance] = viewMode === 'head' ? [2.35, 4.7] : [6.5, 10.2];
    cameraDistance = Math.max(minDistance, Math.min(maxDistance, cameraDistance + event.deltaY * 0.006));
    camera.position.z = cameraDistance;
    render();
  };

  const setViewMode = (mode) => {
    viewMode = mode === 'head' ? 'head' : 'body';
    mannequin.rotation.set(0, 0, 0);
    cameraDistance = viewMode === 'head' ? 3.1 : 8.35;
    camera.position.set(0, viewMode === 'head' ? 1.9 : 0.24, cameraDistance);
    focusButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.mannequinFocus === viewMode));
    });
    render();
  };

  const onCanvasDragOver = (event) => {
    if (!canEdit || !pendingItemId) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    const hit = hitTest(event);
    hoveredId = hit?.userData.partId || null;
    updatePartStates();
  };

  const onCanvasDrop = (event) => {
    if (!canEdit) return;
    event.preventDefault();
    const itemId = event.dataTransfer?.getData('text/plain') || pendingItemId;
    const hit = hitTest(event);
    if (hit?.userData.partId && itemId) void equipPendingToPart(hit.userData.partId, itemId);
  };

  const resize = () => {
    const width = Math.max(280, canvasHost.clientWidth);
    const height = Math.max(360, canvasHost.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };

  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(canvasHost);
  window.addEventListener('resize', resize);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', onPointerUp);
  renderer.domElement.addEventListener('pointerleave', onPointerLeave);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  renderer.domElement.addEventListener('dragover', onCanvasDragOver);
  renderer.domElement.addEventListener('drop', onCanvasDrop);

  root.querySelectorAll('[data-mannequin-part]').forEach((button) => {
    const partId = button.dataset.mannequinPart;
    button.addEventListener('click', () => selectPart(partId));
    button.addEventListener('pointerenter', () => {
      hoveredId = partId;
      updatePartStates();
    });
    button.addEventListener('pointerleave', () => {
      hoveredId = null;
      updatePartStates();
    });
    button.addEventListener('dragover', (event) => {
      if (!canEdit || !pendingItemId) return;
      event.preventDefault();
      hoveredId = partId;
      updatePartStates();
    });
    button.addEventListener('drop', (event) => {
      event.preventDefault();
      const itemId = event.dataTransfer?.getData('text/plain') || pendingItemId;
      if (itemId) void equipPendingToPart(partId, itemId);
    });
  });

  focusButtons.forEach((button) => {
    button.addEventListener('click', () => setViewMode(button.dataset.mannequinFocus));
  });

  resetButton?.addEventListener('click', () => {
    setViewMode('body');
  });

  rebuildItemMap();
  selectedId = null;
  root.classList.add('is-ready');
  refreshEquipment();
  syncCompatibilityPulse();
  resize();

  return () => {
    disposed = true;
    if (compatibilityPulseTimer) window.clearInterval(compatibilityPulseTimer);
    if (frame) window.cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    window.removeEventListener('resize', resize);
    renderer.domElement.removeEventListener('pointermove', onPointerMove);
    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    renderer.domElement.removeEventListener('pointerup', onPointerUp);
    renderer.domElement.removeEventListener('pointercancel', onPointerUp);
    renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
    renderer.domElement.removeEventListener('wheel', onWheel);
    renderer.domElement.removeEventListener('dragover', onCanvasDragOver);
    renderer.domElement.removeEventListener('drop', onCanvasDrop);
    scene.traverse((object) => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose?.());
      else object.material?.dispose?.();
    });
    renderer.dispose?.();
    renderer.domElement.remove();
  };
}

export function openEquipmentMannequin(configuration = {}) {
  const options = Array.isArray(configuration) ? { items: configuration } : configuration;
  const workingItems = [...(options.items || [])];
  const content = buildMannequinContent(options);
  let changed = false;
  return openFormModal({
    title: options.canEdit ? 'Gestisci equipaggiamento' : 'Manichino equipaggiamento',
    content,
    submitLabel: 'Chiudi',
    cancelLabel: null,
    cardClass: 'modal-card--equipment-mannequin',
    closeOnOverlay: true,
    onOpen: ({ modal }) => {
      let closed = false;
      let dispose = () => {};
      const resetButton = document.createElement('button');
      resetButton.type = 'button';
      resetButton.className = 'ghost-button';
      resetButton.dataset.mannequinReset = '';
      resetButton.textContent = 'Reimposta vista';
      modal.querySelector('.modal-actions__left')?.appendChild(resetButton);
      ensureLegacyThree()
        .then((THREE) => {
          if (closed) return;
          dispose = initializeEquipmentManager(content, workingItems, THREE, {
            ...options,
            resetButton,
            onChanged: () => { changed = true; }
          });
        })
        .catch(() => {
          const loading = content.querySelector('.equipment-mannequin__loading');
          if (loading) loading.textContent = 'Impossibile avviare la visualizzazione 3D su questo dispositivo.';
        });
      return () => {
        closed = true;
        dispose();
        resetButton.remove();
      };
    }
  }).then(() => ({ changed }));
}
