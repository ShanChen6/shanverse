"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export const HERO_SPACE_CONFIG = {
  desktopStars: 520,
  mobileStars: 260,
  driftSpeed: 0.018,
  parallaxStrength: 0.32,
  maxPixelRatio: 1.5,
  mobilePixelRatio: 1.15,
  shootingStars: {
    poolSize: 2,
    intervalMin: 4.5,
    intervalMax: 9,
    speedMin: 8,
    speedMax: 12,
    tailLength: 3.2,
    brightness: 0.9,
  },
} as const;

type ShootingStar = {
  group: THREE.Group;
  head: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  tail: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  velocity: THREE.Vector3;
  age: number;
  duration: number;
  active: boolean;
};

function seededRandom(seed = 0x51a7) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function randomBetween(random: () => number, min: number, max: number) {
  return min + random() * (max - min);
}

function makeTailGeometry(length: number) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [0, 0.065, 0, 0, -0.065, 0, -length, 0, 0],
      3,
    ),
  );
  geometry.setIndex([0, 1, 2]);
  return geometry;
}

export function HeroSpaceScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const hero = mount?.closest<HTMLElement>("[data-home-hero]");
    if (!mount || !hero) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const random = seededRandom();
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      mount.dataset.webgl = "unavailable";
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "hero-space-canvas size-full";
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80);
    camera.position.z = 8;
    const starGroup = new THREE.Group();
    scene.add(starGroup);

    let starGeometry: THREE.BufferGeometry | undefined;
    const starMaterial = new THREE.PointsMaterial({
      color: 0x1d3a7d,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    let stars: THREE.Points | undefined;

    const shootingStars: ShootingStar[] = Array.from(
      { length: HERO_SPACE_CONFIG.shootingStars.poolSize },
      () => {
        const group = new THREE.Group();
        group.visible = false;
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 8, 8),
          new THREE.MeshBasicMaterial({
            color: 0xd9af62,
            transparent: true,
            opacity: HERO_SPACE_CONFIG.shootingStars.brightness,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        const tail = new THREE.Mesh(
          makeTailGeometry(HERO_SPACE_CONFIG.shootingStars.tailLength),
          new THREE.MeshBasicMaterial({
            color: 0xd9af62,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        group.add(head, tail);
        scene.add(group);
        return {
          group,
          head,
          tail,
          velocity: new THREE.Vector3(),
          age: 0,
          duration: 0,
          active: false,
        };
      },
    );

    const pointerTarget = new THREE.Vector2();
    const pointerCurrent = new THREE.Vector2();
    let width = 1;
    let height = 1;
    let isVisible = true;
    let isDocumentVisible = !document.hidden;
    let contextLost = false;
    let animationFrame = 0;
    let lastTime = performance.now();
    let nextShootingStar = randomBetween(
      random,
      HERO_SPACE_CONFIG.shootingStars.intervalMin,
      HERO_SPACE_CONFIG.shootingStars.intervalMax,
    );

    const isDark = () => document.documentElement.classList.contains("dark");

    const applyTheme = () => {
      const dark = isDark();
      starMaterial.color.set(dark ? 0xfaf7f0 : 0x1d3a7d);
      starMaterial.opacity = dark ? 0.68 : 0.34;
      starMaterial.size = dark ? 0.04 : 0.033;
      shootingStars.forEach(({ head, tail }) => {
        head.material.color.set(dark ? 0xfaf7f0 : 0xd9af62);
        tail.material.color.set(dark ? 0xd9af62 : 0x1d3a7d);
      });
    };

    const rebuildStars = () => {
      if (stars) starGroup.remove(stars);
      starGeometry?.dispose();
      const count = width < 640
        ? HERO_SPACE_CONFIG.mobileStars
        : HERO_SPACE_CONFIG.desktopStars;
      const positions = new Float32Array(count * 3);
      for (let index = 0; index < count; index += 1) {
        positions[index * 3] = randomBetween(random, -10, 10);
        positions[index * 3 + 1] = randomBetween(random, -5.5, 5.5);
        positions[index * 3 + 2] = randomBetween(random, -12, 2);
      }
      starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      stars = new THREE.Points(starGeometry, starMaterial);
      starGroup.add(stars);
    };

    const render = () => renderer.render(scene, camera);

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width));
      const nextHeight = Math.max(1, Math.round(rect.height));
      const crossedBreakpoint = (width < 640) !== (nextWidth < 640);
      width = nextWidth;
      height = nextHeight;
      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio,
          width < 640
            ? HERO_SPACE_CONFIG.mobilePixelRatio
            : HERO_SPACE_CONFIG.maxPixelRatio,
        ),
      );
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (!stars || crossedBreakpoint) rebuildStars();
      render();
    };

    const spawnShootingStar = () => {
      const star = shootingStars.find((candidate) => !candidate.active);
      if (!star) return;
      const speed = randomBetween(
        random,
        HERO_SPACE_CONFIG.shootingStars.speedMin,
        HERO_SPACE_CONFIG.shootingStars.speedMax,
      );
      star.active = true;
      star.age = 0;
      star.duration = randomBetween(random, 1.1, 1.65);
      star.group.visible = true;
      star.group.position.set(
        randomBetween(random, -5, 7),
        randomBetween(random, 1.5, 4),
        randomBetween(random, -2, 1),
      );
      star.velocity.set(-speed, -speed * randomBetween(random, 0.32, 0.48), 0);
      star.group.rotation.z = Math.atan2(star.velocity.y, star.velocity.x);
    };

    const updateShootingStars = (delta: number) => {
      nextShootingStar -= delta;
      if (nextShootingStar <= 0) {
        spawnShootingStar();
        nextShootingStar = randomBetween(
          random,
          HERO_SPACE_CONFIG.shootingStars.intervalMin,
          HERO_SPACE_CONFIG.shootingStars.intervalMax,
        );
      }
      shootingStars.forEach((star) => {
        if (!star.active) return;
        star.age += delta;
        star.group.position.addScaledVector(star.velocity, delta);
        const life = star.age / star.duration;
        star.head.material.opacity = (1 - life) * HERO_SPACE_CONFIG.shootingStars.brightness;
        star.tail.material.opacity = (1 - life) * 0.38;
        if (life >= 1) {
          star.active = false;
          star.group.visible = false;
        }
      });
    };

    const animate = (time: number) => {
      animationFrame = 0;
      if (contextLost || reducedMotion.matches || !isVisible || !isDocumentVisible) return;
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      pointerCurrent.lerp(pointerTarget, 1 - Math.exp(-delta * 4.5));
      camera.position.x = pointerCurrent.x * HERO_SPACE_CONFIG.parallaxStrength;
      camera.position.y = pointerCurrent.y * HERO_SPACE_CONFIG.parallaxStrength;
      starGroup.rotation.y += delta * HERO_SPACE_CONFIG.driftSpeed;
      starGroup.rotation.x = pointerCurrent.y * 0.025;
      updateShootingStars(delta);
      render();
      animationFrame = requestAnimationFrame(animate);
    };

    const start = () => {
      if (
        animationFrame || contextLost || reducedMotion.matches ||
        !isVisible || !isDocumentVisible
      ) return;
      lastTime = performance.now();
      animationFrame = requestAnimationFrame(animate);
    };

    const stop = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reducedMotion.matches) return;
      const rect = hero.getBoundingClientRect();
      pointerTarget.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
      );
    };
    const onPointerLeave = () => pointerTarget.set(0, 0);
    const onVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      if (isDocumentVisible) start(); else stop();
    };
    const onMotionChange = () => {
      pointerTarget.set(0, 0);
      pointerCurrent.set(0, 0);
      shootingStars.forEach((star) => {
        star.active = false;
        star.group.visible = false;
      });
      if (reducedMotion.matches) {
        stop();
        render();
      } else start();
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      mount.dataset.webgl = "lost";
      stop();
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start(); else stop();
    }, { rootMargin: "80px" });
    const themeObserver = new MutationObserver(() => {
      applyTheme();
      render();
    });

    resizeObserver.observe(mount);
    intersectionObserver.observe(hero);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.addEventListener("change", onMotionChange);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    applyTheme();
    resize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener("change", onMotionChange);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      starGeometry?.dispose();
      starMaterial.dispose();
      shootingStars.forEach(({ head, tail }) => {
        head.geometry.dispose();
        head.material.dispose();
        tail.geometry.dispose();
        tail.material.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}
