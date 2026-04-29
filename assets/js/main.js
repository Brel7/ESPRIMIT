// ================================================
//   ESPRIM-IT — Main JavaScript
//   Three.js 3D Background · Animations · UX
// ================================================

'use strict';

// ─── PAGE LOADER ──────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.querySelector('.page-loader');
    if (loader) loader.classList.add('hidden');
  }, 1600);
});

// ─── CUSTOM CURSOR ──────────────────────────────
const cursor = document.querySelector('.cursor');
const cursorRing = document.querySelector('.cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateCursor() {
  const ease = 0.12;
  ringX += (mouseX - ringX) * ease;
  ringY += (mouseY - ringY) * ease;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top = ringY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

const hoverables = document.querySelectorAll('a, button, .service-card, .team-card, .mission-card, .coaching-card, .revenue-card');
hoverables.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hover');
    cursorRing.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hover');
    cursorRing.classList.remove('hover');
  });
});

// ─── NAVIGATION ──────────────────────────────────
const nav = document.getElementById('main-nav');
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileClose = document.querySelector('.mobile-close');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

hamburger?.addEventListener('click', () => {
  mobileMenu.classList.add('open');
});

mobileClose?.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
});

mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ─── THREE.JS 3D BACKGROUND ─────────────────────
(function initThreeBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Particle field
  const particleCount = 2400;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 20;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;
    sizes[i] = Math.random() * 2.5 + 0.5;

    // Color variation: blue to cyan
    const t = Math.random();
    colors[i3]     = 0.1 + t * 0.15;   // R
    colors[i3 + 1] = 0.3 + t * 0.4;   // G
    colors[i3 + 2] = 0.8 + t * 0.2;   // B
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.025,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Grid mesh structure
  const gridGeo = new THREE.PlaneGeometry(30, 30, 30, 30);
  const gridMat = new THREE.MeshBasicMaterial({
    color: 0x1a4fd6,
    wireframe: true,
    transparent: true,
    opacity: 0.04,
  });
  const grid = new THREE.Mesh(gridGeo, gridMat);
  grid.rotation.x = -Math.PI / 2.5;
  grid.position.y = -4;
  scene.add(grid);

  // Floating geometry
  const shapes = [];
  const shapeDefs = [
    { geo: new THREE.OctahedronGeometry(0.4, 0), pos: [-3.5, 1.5, -2], speed: 0.003 },
    { geo: new THREE.TetrahedronGeometry(0.35, 0), pos: [3.8, -1.2, -1.5], speed: 0.004 },
    { geo: new THREE.OctahedronGeometry(0.25, 0), pos: [2.2, 2.5, -3], speed: 0.005 },
    { geo: new THREE.IcosahedronGeometry(0.3, 0), pos: [-2.8, -2.2, -2.5], speed: 0.003 },
  ];

  shapeDefs.forEach(def => {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x1a4fd6,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const mesh = new THREE.Mesh(def.geo, mat);
    mesh.position.set(...def.pos);
    mesh.userData = { speed: def.speed, initialY: def.pos[1] };
    scene.add(mesh);
    shapes.push(mesh);
  });

  // Mouse parallax
  let targetMouseX = 0, targetMouseY = 0;
  let currentMouseX = 0, currentMouseY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Smooth mouse follow
    currentMouseX += (targetMouseX - currentMouseX) * 0.04;
    currentMouseY += (targetMouseY - currentMouseY) * 0.04;

    // Rotate particles
    particles.rotation.y = elapsed * 0.015 + currentMouseX * 0.3;
    particles.rotation.x = Math.sin(elapsed * 0.01) * 0.1 + currentMouseY * 0.2;

    // Animate grid
    grid.position.z = (elapsed * 0.3) % 1;
    grid.rotation.z = elapsed * 0.005;

    // Animate shapes
    shapes.forEach((shape, i) => {
      shape.rotation.x += shape.userData.speed;
      shape.rotation.y += shape.userData.speed * 1.3;
      shape.position.y = shape.userData.initialY + Math.sin(elapsed * 0.5 + i * 1.5) * 0.3;
    });

    // Camera subtle movement
    camera.position.x = currentMouseX * 0.5;
    camera.position.y = -currentMouseY * 0.5;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

// ─── SCROLL REVEAL ANIMATIONS ────────────────────
const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => revealObserver.observe(el));

// ─── 3D CARD TILT EFFECT ────────────────────────
document.querySelectorAll('.service-card, .team-card, .mission-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -8;
    const rotY = ((x - cx) / cx) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ─── COUNTER ANIMATION ──────────────────────────
function animateCount(el, target, duration = 2000) {
  const isPercent = target.endsWith('%');
  const isPlus = target.endsWith('+');
  const num = parseInt(target);
  const start = performance.now();

  function update(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(ease * num);
    el.textContent = current + (isPercent ? '%' : isPlus ? '+' : '');
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = el.dataset.count;
      if (target) animateCount(el, target);
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.hero-stat-number[data-count]').forEach(el => {
  statsObserver.observe(el);
});

// ─── ACTIVE NAV HIGHLIGHTING ─────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => activeObserver.observe(s));
