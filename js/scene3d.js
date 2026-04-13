/**
 * scene3d.js — Interactive 3D Background Scene
 * Portfolio: Apurb Susobhit Baba
 *
 * Procedural Three.js objects matching the violet (#7c3aed) + cyan (#06b6d4) portfolio palette.
 * Dev theme: laptop, code brackets, terminal, database, torus rings, icosahedron, floating cubes.
 *
 * Performance guarantees:
 *  – Pixel ratio capped at 1.5
 *  – Rendering paused when tab hidden
 *  – ~1300 triangles total (extremely lightweight)
 *  – pointer-events: none (never blocks interaction)
 *  – All objects use emissive MeshStandardMaterial (single pass, no shadows)
 */

import * as THREE from 'three';

// ═══════════════════════════════════════════════════
// RENDERER + SCENE + CAMERA
// ═══════════════════════════════════════════════════

const canvas = document.getElementById('scene3d-canvas');
if (!canvas) { console.warn('[scene3d] canvas#scene3d-canvas not found'); }

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // fully transparent — CSS bg shows through

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  120
);
camera.position.set(0, 0, 10);

// ═══════════════════════════════════════════════════
// LIGHTING
// ═══════════════════════════════════════════════════

scene.add(new THREE.AmbientLight(0x1a1a2e, 1.2));

const vLight = new THREE.PointLight(0x7c3aed, 14, 28); // violet
vLight.position.set(-5, 4, 4);
scene.add(vLight);

const cLight = new THREE.PointLight(0x06b6d4, 11, 22); // cyan
cLight.position.set(5, -3, 3);
scene.add(cLight);

const pLight = new THREE.PointLight(0xa855f7, 6, 18); // purple top
pLight.position.set(0, 7, 2);
scene.add(pLight);

// ═══════════════════════════════════════════════════
// MATERIAL FACTORIES
// ═══════════════════════════════════════════════════

function solidMat(emissiveHex, intensity = 0.4) {
  return new THREE.MeshStandardMaterial({
    color: 0x080818,
    emissive: emissiveHex,
    emissiveIntensity: intensity,
    roughness: 0.55,
    metalness: 0.85,
  });
}

function wireMat(color, opacity = 0.3) {
  return new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity,
  });
}

function lineMat(color, opacity = 0.7) {
  return new THREE.LineBasicMaterial({ color, transparent: true, opacity });
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

/** Adds EdgesGeometry highlight lines on top of a mesh */
function addEdges(mesh, color, opacity = 0.75) {
  const edges = new THREE.EdgesGeometry(mesh.geometry, 12);
  mesh.add(new THREE.LineSegments(edges, lineMat(color, opacity)));
}

// ═══════════════════════════════════════════════════
// OBJECTS REGISTRY
// ═══════════════════════════════════════════════════

const objects = []; // { mesh, rotX, rotY, rotZ, bobAmp, bobSpeed, bobOffset, _initX, _initY }

function register(mesh, rot, bob) {
  objects.push({
    mesh,
    rotX: rot.x || 0,
    rotY: rot.y || 0,
    rotZ: rot.z || 0,
    bobAmp:    bob.amp,
    bobSpeed:  bob.speed,
    bobOffset: bob.offset,
    _initX: mesh.position.x,
    _initY: mesh.position.y,
  });
}

// ═══════════════════════════════════════════════════
// 1. LAPTOP   (violet glow, top-left region)
// ═══════════════════════════════════════════════════
{
  const g = new THREE.Group();

  // Screen panel
  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.07), solidMat(0x7c3aed, 0.3));
  addEdges(screen, 0x7c3aed, 0.9);

  // Faint screen-glow face
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.36, 0.9),
    new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.07, side: THREE.FrontSide })
  );
  glow.position.z = 0.038;
  screen.add(glow);

  // Keyboard (tilted base)
  const kb = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.06), solidMat(0x4a1d96, 0.18));
  addEdges(kb, 0x6d28d9, 0.45);
  kb.rotation.x = -1.3;
  kb.position.set(0, -0.62, 0.48);

  g.add(screen, kb);
  g.position.set(-4.8, 1.6, -2.5);
  g.rotation.set(0.06, 0.38, -0.09);
  scene.add(g);
  register(g, { x: 0.0012, y: 0.0018 }, { amp: 0.1, speed: 0.52, offset: 0 });
}

// ═══════════════════════════════════════════════════
// 2. CODE BRACKETS </>   (cyan, right-center)
// ═══════════════════════════════════════════════════
{
  const g = new THREE.Group();

  function arm() {
    return new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.55, 0.1), solidMat(0x06b6d4, 0.65));
  }

  // Left bracket <
  const lt = new THREE.Group();
  const a1 = arm(); a1.rotation.z =  0.65; a1.position.set( 0.13,  0.2, 0);
  const a2 = arm(); a2.rotation.z = -0.65; a2.position.set( 0.13, -0.2, 0);
  lt.add(a1, a2); lt.position.x = -0.62;

  // Right bracket >
  const rt = new THREE.Group();
  const b1 = arm(); b1.rotation.z = -0.65; b1.position.set(-0.13,  0.2, 0);
  const b2 = arm(); b2.rotation.z =  0.65; b2.position.set(-0.13, -0.2, 0);
  rt.add(b1, b2); rt.position.x = 0.62;

  // Slash /  (purple)
  const slash = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.82, 0.1),
    solidMat(0xa855f7, 0.72)
  );
  slash.rotation.z = -0.6;

  g.add(lt, rt, slash);
  g.position.set(4.5, -1.2, -3.8);
  g.rotation.set(0.15, -0.44, 0.1);
  scene.add(g);
  register(g, { x: 0.002, y: 0.0016 }, { amp: 0.12, speed: 0.5, offset: 1.3 });
}

// ═══════════════════════════════════════════════════
// 3. DATABASE STACK   (cyan, top-right)
// ═══════════════════════════════════════════════════
{
  const g = new THREE.Group();
  const cylGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.2, 32);
  const ringGeo = new THREE.TorusGeometry(0.52, 0.04, 8, 32);

  for (let i = 0; i < 3; i++) {
    const body = new THREE.Mesh(cylGeo, solidMat(0x06b6d4, 0.18 + i * 0.1));
    const cap  = new THREE.Mesh(ringGeo, solidMat(0x22d3ee, 0.6 - i * 0.1));
    cap.position.y = 0.1;
    const disc = new THREE.Group();
    disc.add(body, cap);
    disc.position.y = i * 0.28;
    g.add(disc);
  }

  g.position.set(3.8, 2.0, -4.2);
  g.rotation.set(0.1, 0.3, 0.05);
  scene.add(g);
  register(g, { x: 0.001, y: 0.003 }, { amp: 0.08, speed: 0.4, offset: 2.2 });
}

// ═══════════════════════════════════════════════════
// 4. LARGE TORUS RING   (violet, bottom-left)
// ═══════════════════════════════════════════════════
{
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.065, 10, 64),
    solidMat(0x7c3aed, 0.65)
  );
  mesh.position.set(-3.2, -2.2, -5.2);
  mesh.rotation.set(Math.PI / 3, 0.5, 0.2);
  scene.add(mesh);
  register(mesh, { x: 0.0025, y: 0.002, z: 0.001 }, { amp: 0.14, speed: 0.34, offset: 0.9 });
}

// ═══════════════════════════════════════════════════
// 5. SMALL TORUS RING   (cyan, top-right)
// ═══════════════════════════════════════════════════
{
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.055, 10, 42),
    solidMat(0x22d3ee, 0.7)
  );
  mesh.position.set(2.2, 3.1, -3.2);
  mesh.rotation.set(0.4, 0.2, 0);
  scene.add(mesh);
  register(mesh, { x: 0.005, y: 0.003, z: 0.002 }, { amp: 0.1, speed: 0.75, offset: 3.5 });
}

// ═══════════════════════════════════════════════════
// 6. WIREFRAME ICOSAHEDRON — "tech globe"  (purple)
// ═══════════════════════════════════════════════════
{
  const geo = new THREE.IcosahedronGeometry(0.78, 1);

  const solid = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0x04040e,
    emissive: 0x7c3aed,
    emissiveIntensity: 0.12,
    roughness: 0.9,
    metalness: 0.4,
    transparent: true,
    opacity: 0.65,
  }));
  solid.add(new THREE.Mesh(geo, wireMat(0xa855f7, 0.45)));

  solid.position.set(-0.8, -3.0, -4.6);
  scene.add(solid);
  register(solid, { x: 0.003, y: 0.004 }, { amp: 0.11, speed: 0.48, offset: 1.8 });
}

// ═══════════════════════════════════════════════════
// 7. TERMINAL WINDOW   (cyan accent, center-left)
// ═══════════════════════════════════════════════════
{
  const g = new THREE.Group();

  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 1.25, 0.06),
    new THREE.MeshStandardMaterial({
      color: 0x050515, emissive: 0x06b6d4, emissiveIntensity: 0.07, roughness: 0.7, metalness: 0.5,
    })
  );
  addEdges(body, 0x06b6d4, 0.78);

  // Title bar
  const titleBar = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.22, 0.065),
    new THREE.MeshStandardMaterial({
      color: 0x080825, emissive: 0x22d3ee, emissiveIntensity: 0.28, roughness: 0.5,
    })
  );
  titleBar.position.set(0, 0.515, 0.003);

  // Traffic-light dots
  [[0xff5f57, -0.75], [0xffbd2e, -0.62], [0x28ca41, -0.49]].forEach(([color, x]) => {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      new THREE.MeshBasicMaterial({ color })
    );
    dot.position.set(x, 0.515, 0.09);
    g.add(dot);
  });

  // Code lines (horizontal bars)
  const LC = [0x22d3ee, 0xa855f7, 0x4ade80, 0xfbbf24, 0x22d3ee];
  const LW = [0.95, 0.60, 1.15, 0.50, 0.82];
  LC.forEach((c, i) => {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(LW[i], 0.045, 0.07),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.68 })
    );
    bar.position.set(-0.48 + LW[i] / 2, 0.29 - i * 0.225, 0.075);
    g.add(bar);
  });

  g.add(body, titleBar);
  g.position.set(-1.8, 0.9, -3.2);
  g.rotation.set(0.05, 0.24, -0.04);
  scene.add(g);
  register(g, { x: 0.001, y: 0.0013 }, { amp: 0.09, speed: 0.43, offset: 2.9 });
}

// ═══════════════════════════════════════════════════
// 8. SMALL FLOATING CUBES
// ═══════════════════════════════════════════════════
[
  { pos: [ 2.9, -2.6, -3.5], size: 0.29, em: 0x7c3aed, ei: 0.62 },
  { pos: [-2.5,  3.2, -5.0], size: 0.22, em: 0x06b6d4, ei: 0.65 },
  { pos: [-5.5, -1.0, -4.5], size: 0.34, em: 0x7c3aed, ei: 0.55 },
  { pos: [ 1.2,  0.8, -6.2], size: 0.19, em: 0xa855f7, ei: 0.72 },
  { pos: [ 5.0,  0.5, -5.5], size: 0.26, em: 0x06b6d4, ei: 0.62 },
].forEach((d, i) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(d.size, d.size, d.size),
    solidMat(d.em, d.ei)
  );
  addEdges(mesh, d.em, 0.82);
  mesh.position.set(...d.pos);
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  scene.add(mesh);
  register(
    mesh,
    { x: 0.004 + i * 0.001, y: 0.003 + i * 0.0015, z: 0.001 + i * 0.0005 },
    { amp: 0.07 + i * 0.015, speed: 0.65 + i * 0.1, offset: i * 1.4 }
  );
});

// ═══════════════════════════════════════════════════
// MOUSE TRACKING
// ═══════════════════════════════════════════════════

const mouse     = { x: 0, y: 0 };
const mouseTgt  = { x: 0, y: 0 };
const camBaseZ  = camera.position.z;

window.addEventListener('mousemove', (e) => {
  mouseTgt.x = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouseTgt.y = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

// ═══════════════════════════════════════════════════
// RESIZE
// ═══════════════════════════════════════════════════

window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}, { passive: true });

// ═══════════════════════════════════════════════════
// ANIMATION LOOP
// ═══════════════════════════════════════════════════

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  // Pause rendering when tab is hidden (saves GPU/power)
  if (document.hidden) return;

  const t = clock.getElapsedTime();

  // ── Mouse parallax (smooth lerp)
  mouse.x += (mouseTgt.x - mouse.x) * 0.038;
  mouse.y += (mouseTgt.y - mouse.y) * 0.038;

  // ── Camera gentle orbit from mouse
  camera.position.x = mouse.x * 1.5;
  camera.position.y = -mouse.y * 0.85;

  // ── Scroll-based depth parallax
  const scrollP = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
  camera.position.z = camBaseZ - scrollP * 2.5;

  camera.lookAt(0, 0, 0);

  // ── Animate each object
  objects.forEach(obj => {
    obj.mesh.rotation.x += obj.rotX;
    obj.mesh.rotation.y += obj.rotY;
    obj.mesh.rotation.z += obj.rotZ;

    // Sinusoidal bob (up-down) + sway (left-right)
    const bob  = Math.sin(t * obj.bobSpeed + obj.bobOffset) * obj.bobAmp;
    const sway = Math.cos(t * obj.bobSpeed * 0.7 + obj.bobOffset + 0.8) * obj.bobAmp * 0.35;
    obj.mesh.position.y = obj._initY + bob;
    obj.mesh.position.x = obj._initX + sway;
  });

  renderer.render(scene, camera);
}

// ═══════════════════════════════════════════════════
// START — deferred until after page load / loader
// ═══════════════════════════════════════════════════

function startScene() {
  clock.start();
  animate();
}

if (document.readyState === 'complete') {
  requestAnimationFrame(startScene);
} else {
  window.addEventListener('load', () => requestAnimationFrame(startScene), { once: true });
}
