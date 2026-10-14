// The summoning (Thỉnh quân) in 3D: a red-and-gold lacquer urn drops in,
// spins, glows in the new monster's element colour, shakes, and bursts open
// in a shower of light. Loaded on demand, only when a summon is opened, so
// three.js never weighs on the game page itself.

import * as THREE from "three";

export type SummonOptions = {
  /** Glow and sparks: the element's colour. */
  glow: string;
  /** Called once, the moment the urn bursts open. */
  onOpen: () => void;
  /** Called once, when the animation has finished. */
  onDone: () => void;
};

const DROP = 1.2;
const SHAKE = 2.3;
const OPEN = 2.4;
const END = 3.7;
const SPARKS = 220;

const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

/** Plays the summoning inside `mount`. Returns a function that stops it and frees everything. */
export function playSummon(mount: HTMLElement, { glow, onOpen, onDone }: SummonOptions): () => void {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const width = () => Math.max(1, mount.clientWidth);
  const height = () => Math.max(1, mount.clientHeight);
  renderer.setSize(width(), height());
  renderer.domElement.style.display = "block";
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width() / height(), 0.1, 100);
  camera.position.set(0, 0.5, 7);
  camera.lookAt(0, 0, 0);

  const glowColor = new THREE.Color(glow);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const key = new THREE.DirectionalLight(0xfff1d6, 1.8);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd59a, 0.8);
  rim.position.set(-4, 1, -3);
  scene.add(rim);
  const inner = new THREE.PointLight(glowColor, 0, 14);
  inner.position.set(0, 0, 1.6);
  scene.add(inner);

  // The urn: two lacquer halves with gold bands and a gold knob.
  const lacquer = new THREE.MeshStandardMaterial({ color: 0x8e1b16, roughness: 0.32, metalness: 0.12, emissive: glowColor, emissiveIntensity: 0 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9a53a, roughness: 0.28, metalness: 0.9 });
  const geometries: THREE.BufferGeometry[] = [];
  const geo = <G extends THREE.BufferGeometry>(g: G) => {
    geometries.push(g);
    return g;
  };
  const half = (up: boolean) => {
    const sign = up ? 1 : -1;
    const group = new THREE.Group();
    const dome = new THREE.Mesh(geo(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, up ? 0 : Math.PI / 2, Math.PI / 2)), lacquer);
    dome.position.y = 0.32 * sign;
    const wall = new THREE.Mesh(geo(new THREE.CylinderGeometry(1, 1, 0.32, 48, 1, true)), lacquer);
    wall.position.y = 0.16 * sign;
    const band = new THREE.Mesh(geo(new THREE.TorusGeometry(1.02, 0.055, 12, 72)), gold);
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.03 * sign;
    const stripe = new THREE.Mesh(geo(new THREE.TorusGeometry(0.72, 0.035, 10, 60)), gold);
    stripe.rotation.x = Math.PI / 2;
    stripe.position.y = 1.0 * sign;
    group.add(dome, wall, band, stripe);
    const cap = new THREE.Mesh(geo(new THREE.SphereGeometry(0.17, 18, 12)), gold);
    cap.position.y = 1.36 * sign;
    group.add(cap);
    return group;
  };
  const top = half(true);
  const bottom = half(false);
  const urn = new THREE.Group();
  urn.add(top, bottom);
  urn.rotation.x = 0.18;
  scene.add(urn);

  // The light inside, and the sparks that fly out.
  const coreMaterial = new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const core = new THREE.Mesh(geo(new THREE.SphereGeometry(0.7, 32, 16)), coreMaterial);
  core.scale.setScalar(0.01);
  scene.add(core);

  const positions = new Float32Array(SPARKS * 3);
  const velocities: THREE.Vector3[] = [];
  for (let i = 0; i < SPARKS; i++) {
    const v = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
    v.multiplyScalar(1.6 + Math.random() * 3.2);
    velocities.push(v);
  }
  const sparkGeometry = geo(new THREE.BufferGeometry());
  sparkGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const sparkMaterial = new THREE.PointsMaterial({ color: glowColor, size: 0.09, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
  scene.add(sparks);

  let frame = 0;
  let opened = false;
  let finished = false;
  const started = performance.now();

  const render = () => {
    const t = (performance.now() - started) / 1000;

    if (t < OPEN) {
      // Drop in, spin, then shake harder and glow brighter until it bursts.
      const drop = easeOut(t / DROP);
      urn.position.y = 3 * (1 - drop);
      urn.rotation.y = t * (2.2 + 3 * Math.max(0, t - DROP));
      const charge = Math.max(0, (t - DROP) / (SHAKE - DROP));
      urn.rotation.z = Math.sin(t * 46) * 0.09 * Math.min(1, charge);
      urn.position.x = Math.sin(t * 61) * 0.04 * Math.min(1, charge);
      lacquer.emissiveIntensity = 0.6 * Math.min(1, charge);
      inner.intensity = 4 * Math.min(1, charge);
    } else {
      if (!opened) {
        opened = true;
        onOpen();
      }
      // Burst: the halves fly apart, the core flares and fades, sparks spread.
      const k = (t - OPEN) / (END - OPEN);
      const out = easeOut(k * 1.4);
      top.position.y = 2.6 * out;
      top.rotation.x = -1.1 * out;
      bottom.position.y = -2.2 * out;
      bottom.rotation.x = 0.8 * out;
      urn.rotation.z = 0;
      lacquer.emissiveIntensity = 0.6 * (1 - k);
      core.scale.setScalar(0.4 + 2.6 * easeOut(k * 2));
      coreMaterial.opacity = Math.max(0, 1 - k * 1.3);
      inner.intensity = 10 * Math.max(0, 1 - k);
      sparkMaterial.opacity = Math.max(0, 1 - k);
      const travel = easeOut(k) * 1.6;
      for (let i = 0; i < SPARKS; i++) {
        positions[i * 3] = velocities[i].x * travel;
        positions[i * 3 + 1] = velocities[i].y * travel - k * k * 0.8;
        positions[i * 3 + 2] = velocities[i].z * travel;
      }
      sparkGeometry.attributes.position.needsUpdate = true;
      top.traverse((o) => {
        if (o instanceof THREE.Mesh) o.visible = k < 0.85;
      });
      bottom.traverse((o) => {
        if (o instanceof THREE.Mesh) o.visible = k < 0.85;
      });
    }

    renderer.render(scene, camera);
    if (t >= END) {
      if (!finished) {
        finished = true;
        onDone();
      }
      return;
    }
    frame = requestAnimationFrame(render);
  };
  frame = requestAnimationFrame(render);

  const resize = () => {
    camera.aspect = width() / height();
    camera.updateProjectionMatrix();
    renderer.setSize(width(), height());
  };
  window.addEventListener("resize", resize);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    for (const g of geometries) g.dispose();
    lacquer.dispose();
    gold.dispose();
    coreMaterial.dispose();
    sparkMaterial.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
