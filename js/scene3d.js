/**
 * scene3d.js — Interactive 3D Journey with GSAP & Real Models
 * Portfolio: Apurb Susobhit Baba
 *
 * This version uses GLTFLoader for real models, GSAP ScrollTrigger for 
 * scroll-driven animations, and a refined physics engine for neural nodes.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register Plugins
gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════

const COLORS = {
  cyan: new THREE.Color(0x06b6d4),
  violet: new THREE.Color(0x7c3aed),
  white: new THREE.Color(0xffffff),
};

const MODELS_CONFIG = [
  {
    id: 'helmet',
    url: 'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/c639fd3c/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
    pos: [10, -30, 0],
    scale: 4,
    section: '.about-hero'
  },
  {
    id: 'lantern',
    url: 'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/c639fd3c/2.0/Lantern/glTF-Binary/Lantern.glb',
    pos: [-10, -60, 0],
    scale: 0.1, // Lantern is huge
    section: '.services'
  }
];

function createProceduralLaptop() {
  const group = new THREE.Group();

  // Base (rounded edges look more professional)
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 0.2, 3.8),
    new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1 })
  );
  base.position.y = -0.1;
  group.add(base);

  // Keyboard Glow
  const kb = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 3.2),
    new THREE.MeshStandardMaterial({ 
      color: 0x000000, 
      emissive: COLORS.cyan, 
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.9
    })
  );
  kb.rotation.x = -Math.PI / 2;
  kb.position.y = 0.11;
  group.add(kb);

  // Hinge
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0, -1.9); // back edge
  group.add(lidGroup);

  const lid = new THREE.Mesh(
    new THREE.BoxGeometry(5.5, 0.15, 3.8),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9, roughness: 0.1 })
  );
  lid.position.set(0, 0, 1.9);
  lidGroup.add(lid);

  // Screen
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 3.5),
    new THREE.MeshStandardMaterial({ 
      color: 0x000000,
      emissive: COLORS.cyan,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.4
    })
  );
  screen.position.set(0, 0.08, 1.9);
  screen.rotation.x = -Math.PI / 2;
  lidGroup.add(screen);

  group._lid = lidGroup;
  return group;
}

// ═══════════════════════════════════════════════════
// INITIALIZATION
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

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 15);

// ═══════════════════════════════════════════════════
// LIGHTING
// ═══════════════════════════════════════════════════

scene.add(new THREE.AmbientLight(0xffffff, 0.8));

const pointLight = new THREE.PointLight(0x7c3aed, 20, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

const blueLight = new THREE.PointLight(0x06b6d4, 15, 80);
blueLight.position.set(-10, -10, 5);
scene.add(blueLight);

// ═══════════════════════════════════════════════════
// MODELS MANAGEMENT
// ═══════════════════════════════════════════════════

const loader = new GLTFLoader();
const loadedModels = {};

// ═══════════════════════════════════════════════════
// PROCEDURAL & ASSETS
// ═══════════════════════════════════════════════════

const laptop = createProceduralLaptop();
laptop.position.set(0, 0, 0); // Center of Hero
laptop.rotation.x = -0.2;
scene.add(laptop);
loadedModels.laptop = laptop;
setupModelAnimations('laptop', laptop, '.hero');

function loadModels() {
  MODELS_CONFIG.forEach(cfg => {
    loader.load(cfg.url, 
      (gltf) => {
        const model = gltf.scene;
        model.position.set(...cfg.pos);
        model.scale.setScalar(cfg.scale);
        
        model.traverse(node => {
          if (node.isMesh) {
            node.material.metalness = 0.9;
            node.material.roughness = 0.2;
            if (cfg.id === 'helmet') {
              node.material.emissive = COLORS.violet;
              node.material.emissiveIntensity = 0.2;
            }
          }
        });

        scene.add(model);
        loadedModels[cfg.id] = model;
        setupModelAnimations(cfg.id, model, cfg.section);
      },
      undefined,
      (error) => {
        console.error(`[scene3d] Error loading ${cfg.id}:`, error);
      }
    );
  });
}

function setupModelAnimations(id, model, section) {
  if (id === 'laptop') {
    // Scroll parallax for laptop
    gsap.to(model.position, {
      y: -10,
      z: -20,
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5
      }
    });
  }

  // Generic floating logic for empty spaces
  if (id === 'helmet' || id === 'lantern') {
    gsap.to(model.position, {
      y: '+=2.5',
      repeat: -1,
      yoyo: true,
      duration: 3 + Math.random() * 2,
      ease: 'sine.inOut'
    });

    gsap.to(model.rotation, {
      y: Math.PI * 2,
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2
      }
    });
  }
}

// ═══════════════════════════════════════════════════
// ROLLING PARTICLE GRID (MINIMALISTIC)
// ═══════════════════════════════════════════════════

const GRID_COLS = 55;
const GRID_ROWS = 35;
const PARTICLE_COUNT = GRID_COLS * GRID_ROWS;
const MOUSE_REPULSION = 160;
const DAMPING = 0.92;
const RETURN_FORCE = 0.015;

// Dynamic variables for scroll-based animation
let scrollIntensity = 0.5;
let scrollProgress = 0;

const particlesGeometry = new THREE.BufferGeometry();
const posArr = new Float32Array(PARTICLE_COUNT * 3);
const velArr = new Float32Array(PARTICLE_COUNT * 3);
const targetArr = new Float32Array(PARTICLE_COUNT * 3);

const spacing = 1.2;
const offsetX = (GRID_COLS * spacing) / 2;
const offsetY = (GRID_ROWS * spacing) / 2;

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const col = i % GRID_COLS;
  const row = Math.floor(i / GRID_COLS);

  const x = col * spacing - offsetX;
  const y = row * spacing - offsetY;
  const z = (Math.random() - 0.5) * 2;

  posArr[i * 3]     = targetArr[i * 3]     = x;
  posArr[i * 3 + 1] = targetArr[i * 3 + 1] = y;
  posArr[i * 3 + 2] = targetArr[i * 3 + 2] = z;

  velArr[i * 3] = velArr[i * 3 + 1] = velArr[i * 3 + 2] = 0;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArr, 3));

// Custom material for softer particles
const particleMaterial = new THREE.ShaderMaterial({
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  uniforms: {
    uColor: { value: COLORS.cyan },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      // Increased size for visibility
      gl_PointSize = 6.0 * (30.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying vec3 vPosition;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 3.0);
      // Increased brightness (strength * 0.8)
      gl_FragColor = vec4(uColor, strength * 0.8);
    }
  `
});

const particles = new THREE.Points(particlesGeometry, particleMaterial);
scene.add(particles);

// GSAP Scroll Integration for the Grid
ScrollTrigger.create({
  trigger: "body",
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => {
    // Increase wave magnitude and speed on scroll
    scrollIntensity = 0.5 + self.getVelocity() / 2000;
    scrollProgress = self.progress;
    
    // Smoothly settle back to baseline intensity
    gsap.to({ val: scrollIntensity }, {
      val: 0.5,
      duration: 1.5,
      onUpdate: function() { scrollIntensity = this.targets()[0].val; }
    });
  }
});

// ═══════════════════════════════════════════════════
// INTERACTION
// ═══════════════════════════════════════════════════

const mouse = new THREE.Vector3(-1000, -1000, 0);
const mousePos = new THREE.Vector3();

window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = -(e.clientY / window.innerHeight) * 2 + 1;
  
  mousePos.set(x, y, 0.5);
  mousePos.unproject(camera);
  const dir = mousePos.sub(camera.position).normalize();
  const dist = -camera.position.z / dir.z;
  mouse.copy(camera.position).add(dir.multiplyScalar(dist));

  if (loadedModels.laptop && loadedModels.laptop._lid) {
     const laptopPosInWorld = loadedModels.laptop.position.clone();
     const distToLaptop = mouse.distanceTo(laptopPosInWorld);
     const targetRot = (distToLaptop < 10) ? 1.45 : -0.15;
     
     gsap.to(loadedModels.laptop._lid.rotation, {
       x: targetRot,
       duration: 0.8,
       ease: 'elastic.out(1, 0.75)',
       overwrite: true
     });
  }
}, { passive: true });

// ═══════════════════════════════════════════════════
// CORE LOOP
// ═══════════════════════════════════════════════════

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  if (document.hidden) return;

  const dt = clock.getDelta();
  const time = clock.getElapsedTime();
  particleMaterial.uniforms.uTime.value = time;

  const pos = particlesGeometry.attributes.position.array;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const idx = i * 3;

    // 1. BASE GRID WAVE PATTERN
    // Soft horizontal/vertical waves that respond to scroll
    const waveX = Math.sin(time * 0.5 + targetArr[idx] * 0.2) * 0.3 * scrollIntensity;
    const waveY = Math.cos(time * 0.4 + targetArr[idx+1] * 0.2) * 0.3 * scrollIntensity;
    const waveZ = Math.sin(time + (targetArr[idx] + targetArr[idx+1]) * 0.1) * 0.8 * scrollIntensity;

    // 2. MOUSE INTERACTION (Ripple/Liquid)
    const dx = pos[idx] - mouse.x;
    const dy = pos[idx + 1] - mouse.y;
    const dz = pos[idx + 2] - mouse.z;
    const distSq = dx * dx + dy * dy + dz * dz + 0.1;
    const dist = Math.sqrt(distSq);

    if (dist < 8) {
      const forceMultiplier = (MOUSE_REPULSION / distSq) * 0.004;
      velArr[idx]     += dx * forceMultiplier;
      velArr[idx + 1] += dy * forceMultiplier;
      velArr[idx + 2] += dz * forceMultiplier;
    }

    // 3. PHYSICS: Spring Back to animated target
    const tx = (targetArr[idx] + waveX) - pos[idx];
    const ty = (targetArr[idx + 1] + waveY) - pos[idx + 1];
    const tz = (targetArr[idx + 2] + waveZ) - pos[idx + 2];
    
    velArr[idx]     += tx * RETURN_FORCE;
    velArr[idx + 1] += ty * RETURN_FORCE;
    velArr[idx + 2] += tz * RETURN_FORCE;

    // Apply and Damp
    pos[idx]     += velArr[idx];
    pos[idx + 1] += velArr[idx + 1];
    pos[idx + 2] += velArr[idx + 2];
    
    velArr[idx]     *= DAMPING;
    velArr[idx + 1] *= DAMPING;
    velArr[idx + 2] *= DAMPING;

    // Subtle parallax shift based on scroll
    pos[idx + 1] -= scrollProgress * 0.05; 
  }

  particlesGeometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

// ═══════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}, { passive: true });

function start() {
  loadModels();
  animate();
}

if (document.readyState === 'complete') {
  start();
} else {
  window.addEventListener('load', start);
}
