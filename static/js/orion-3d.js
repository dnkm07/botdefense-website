import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.querySelector("#orion-canvas");
const stage = document.querySelector(".orion-stage");
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (canvas && stage && "WebGLRenderingContext" in window) {
  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.15 : 1.6),
    );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.88;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef2f3);
    scene.fog = new THREE.Fog(0xeef2f3, 10, 20);
    const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 40);
    camera.position.set(0, 1.1, 7.2);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    scene.environment = pmrem.fromScene(environment, 0.04).texture;
    environment.dispose();
    pmrem.dispose();

    const hemi = new THREE.HemisphereLight(0xffffff, 0x9daab2, 2.35);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(-4, 7, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -2;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9fe8ff, 2.1);
    rim.position.set(5, 3, -4);
    scene.add(rim);

    const ceramic = new THREE.MeshPhysicalMaterial({
      color: 0xf4f6f7,
      metalness: 0.06,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    });
    const ceramicSoft = new THREE.MeshPhysicalMaterial({
      color: 0xdde3e6,
      metalness: 0.1,
      roughness: 0.29,
      clearcoat: 0.75,
      clearcoatRoughness: 0.18,
    });
    const titanium = new THREE.MeshPhysicalMaterial({
      color: 0x10171c,
      metalness: 0.86,
      roughness: 0.24,
      clearcoat: 0.35,
    });
    const chrome = new THREE.MeshPhysicalMaterial({
      color: 0xb9c4c9,
      metalness: 1,
      roughness: 0.1,
      clearcoat: 0.7,
    });
    const visor = new THREE.MeshPhysicalMaterial({
      color: 0x02080c,
      metalness: 0.72,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
    });
    const blue = new THREE.MeshPhysicalMaterial({
      color: 0x9fe8ff,
      emissive: 0x48cfff,
      emissiveIntensity: 2.4,
      metalness: 0.08,
      roughness: 0.18,
      toneMapped: false,
    });
    const holo = new THREE.MeshPhysicalMaterial({
      color: 0x8de7ff,
      emissive: 0x2ac8f5,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0,
      roughness: 0.12,
      metalness: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const addMesh = (
      parent,
      geometry,
      material,
      position,
      scale = [1, 1, 1],
    ) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };
    const sphere = (segments = 40) =>
      new THREE.SphereGeometry(1, segments, Math.max(20, segments / 2));
    const capsule = (radius, length, segments = 12) =>
      new THREE.CapsuleGeometry(radius, length, 8, segments);
    const cylinder = (top, bottom, height, segments = 28) =>
      new THREE.CylinderGeometry(top, bottom, height, segments);
    const torsoShell = new THREE.LatheGeometry(
      [
        new THREE.Vector2(0.34, -0.72),
        new THREE.Vector2(0.46, -0.48),
        new THREE.Vector2(0.58, 0.02),
        new THREE.Vector2(0.62, 0.34),
        new THREE.Vector2(0.5, 0.7),
        new THREE.Vector2(0.36, 0.78),
      ],
      48,
    );

    const lab = new THREE.Group();
    const floorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf4f6f7,
      roughness: 0.32,
      metalness: 0.05,
      clearcoat: 0.4,
    });
    const floor = addMesh(
      lab,
      new THREE.PlaneGeometry(34, 22),
      floorMaterial,
      [0, -3.05, 0],
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    const wallMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe8edef,
      roughness: 0.5,
      metalness: 0.02,
    });
    addMesh(lab, new THREE.PlaneGeometry(28, 14), wallMaterial, [0, 2, -4.8]);
    for (let i = 0; i < 5; i += 1) {
      const arch = addMesh(
        lab,
        new THREE.TorusGeometry(4.2 + i * 0.8, 0.025, 8, 96, Math.PI),
        chrome,
        [-3 + i * 2.1, 1.6, -3.9],
      );
      arch.rotation.z = Math.PI / 2;
      arch.material = chrome.clone();
      arch.material.opacity = 0.22;
      arch.material.transparent = true;
    }
    scene.add(lab);

    const robot = new THREE.Group();
    robot.position.set(1.55, 0, 0);
    robot.rotation.y = -0.08;
    scene.add(robot);

    const pelvis = new THREE.Group();
    pelvis.position.y = -0.55;
    robot.add(pelvis);
    addMesh(pelvis, sphere(), titanium, [0, 0, 0], [0.48, 0.35, 0.3]);
    addMesh(pelvis, sphere(), ceramic, [0, 0.12, 0.17], [0.54, 0.26, 0.25]);

    const torso = new THREE.Group();
    torso.position.y = 0.18;
    pelvis.add(torso);
    addMesh(
      torso,
      capsule(0.34, 0.92, 24),
      titanium,
      [0, 0.62, 0],
      [0.92, 1, 0.7],
    );
    const chest = addMesh(
      torso,
      torsoShell,
      ceramic,
      [0, 1.0, 0.11],
      [1, 0.62, 0.55],
    );
    chest.rotation.x = -0.04;
    const leftClavicle = addMesh(
      torso,
      capsule(0.075, 0.42, 20),
      ceramicSoft,
      [-0.3, 1.27, 0.31],
      [1, 1, 0.72],
    );
    leftClavicle.rotation.z = Math.PI / 2.35;
    const rightClavicle = addMesh(
      torso,
      capsule(0.075, 0.42, 20),
      ceramicSoft,
      [0.3, 1.27, 0.31],
      [1, 1, 0.72],
    );
    rightClavicle.rotation.z = -Math.PI / 2.35;
    const core = addMesh(
      torso,
      capsule(0.055, 0.14, 18),
      blue,
      [0, 1.02, 0.44],
      [0.8, 1, 0.5],
    );

    const neck = new THREE.Group();
    neck.position.set(0, 1.55, 0);
    torso.add(neck);
    addMesh(neck, cylinder(0.17, 0.2, 0.32), titanium, [0, 0, 0]);
    addMesh(
      neck,
      new THREE.TorusGeometry(0.19, 0.035, 10, 36),
      chrome,
      [0, 0.1, 0],
    );

    const head = new THREE.Group();
    head.position.set(0, 0.38, 0);
    neck.add(head);
    addMesh(head, sphere(56), ceramic, [0, 0.15, 0], [0.35, 0.44, 0.35]);
    const face = addMesh(
      head,
      sphere(56),
      visor,
      [0, 0.13, 0.27],
      [0.28, 0.34, 0.16],
    );
    face.rotation.x = -0.03;
    addMesh(
      torso,
      capsule(0.27, 0.28, 20),
      titanium,
      [0, 0.28, 0.12],
      [1, 1, 0.72],
    );
    const leftAbdomen = addMesh(
      torso,
      capsule(0.09, 0.3, 16),
      ceramicSoft,
      [-0.15, 0.38, 0.31],
      [1, 1, 0.72],
    );
    const rightAbdomen = addMesh(
      torso,
      capsule(0.09, 0.3, 16),
      ceramicSoft,
      [0.15, 0.38, 0.31],
      [1, 1, 0.72],
    );
    leftAbdomen.rotation.z = -0.08;
    rightAbdomen.rotation.z = 0.08;
    const eyeMaterial = blue.clone();
    eyeMaterial.color.setHex(0x39d5ff);
    eyeMaterial.emissive.setHex(0x159dcc);
    eyeMaterial.emissiveIntensity = 2.6;
    const leftEye = addMesh(
      head,
      new THREE.BoxGeometry(0.18, 0.04, 0.025, 6, 2, 2),
      eyeMaterial,
      [-0.1, 0.16, 0.49],
    );
    const rightEye = addMesh(
      head,
      new THREE.BoxGeometry(0.18, 0.04, 0.025, 6, 2, 2),
      eyeMaterial,
      [0.1, 0.16, 0.49],
    );
    leftEye.rotation.z = -0.05;
    rightEye.rotation.z = 0.05;

    const shoulderRoots = [];
    const elbows = [];
    const wrists = [];
    const fingers = [[], []];
    const buildArm = (side) => {
      const sign = side === 0 ? -1 : 1;
      const shoulder = new THREE.Group();
      shoulder.position.set(sign * 0.58, 1.16, 0);
      torso.add(shoulder);
      const shoulderCap = addMesh(
        shoulder,
        capsule(0.18, 0.18, 24),
        ceramic,
        [sign * 0.1, 0, 0],
        [1, 1, 0.9],
      );
      shoulderCap.rotation.z = Math.PI / 2;
      addMesh(
        shoulder,
        sphere(),
        titanium,
        [sign * 0.11, -0.08, 0],
        [0.16, 0.18, 0.17],
      );
      const upper = new THREE.Group();
      upper.position.set(sign * 0.1, -0.2, 0);
      upper.rotation.z = sign * -0.08;
      shoulder.add(upper);
      addMesh(
        upper,
        capsule(0.135, 0.68, 20),
        ceramic,
        [0, -0.37, 0],
        [1, 1, 0.88],
      );
      addMesh(
        upper,
        capsule(0.09, 0.5, 16),
        titanium,
        [0, -0.43, -0.03],
        [0.75, 1, 0.72],
      );
      const elbow = new THREE.Group();
      elbow.position.set(0, -0.82, 0);
      upper.add(elbow);
      addMesh(elbow, sphere(), chrome, [0, 0, 0], [0.18, 0.17, 0.17]);
      const forearm = new THREE.Group();
      forearm.position.y = -0.16;
      elbow.add(forearm);
      addMesh(
        forearm,
        capsule(0.12, 0.62, 20),
        ceramic,
        [0, -0.34, 0],
        [1, 1, 0.86],
      );
      addMesh(forearm, capsule(0.075, 0.5, 14), titanium, [0, -0.36, -0.04]);
      const wrist = new THREE.Group();
      wrist.position.y = -0.74;
      forearm.add(wrist);
      addMesh(wrist, cylinder(0.105, 0.13, 0.18, 20), chrome, [0, 0, 0]);
      const palm = addMesh(
        wrist,
        sphere(),
        ceramicSoft,
        [0, -0.23, 0],
        [0.17, 0.25, 0.105],
      );
      palm.rotation.z = sign * -0.03;
      for (let i = 0; i < 5; i += 1) {
        const finger = new THREE.Group();
        const isThumb = i === 0;
        finger.position.set(
          sign * (isThumb ? 0.16 : -0.105 + (i - 1) * 0.07),
          isThumb ? -0.2 : -0.41,
          isThumb ? 0.01 : 0,
        );
        finger.rotation.z = isThumb ? sign * 0.7 : 0;
        wrist.add(finger);
        const length = isThumb ? 0.18 : 0.22 + (i === 2 || i === 3 ? 0.035 : 0);
        addMesh(finger, capsule(0.025, length, 10), ceramicSoft, [
          0,
          -length * 0.5,
          0,
        ]);
        fingers[side].push(finger);
      }
      shoulderRoots.push(shoulder);
      elbows.push(elbow);
      wrists.push(wrist);
    };
    buildArm(0);
    buildArm(1);

    const hips = [];
    const knees = [];
    const buildLeg = (side) => {
      const sign = side === 0 ? -1 : 1;
      const hip = new THREE.Group();
      hip.position.set(sign * 0.27, -0.33, 0);
      pelvis.add(hip);
      addMesh(hip, sphere(), chrome, [0, 0, 0], [0.24, 0.24, 0.23]);
      addMesh(
        hip,
        capsule(0.19, 0.86, 22),
        ceramic,
        [0, -0.58, 0],
        [1, 1, 0.82],
      );
      const knee = new THREE.Group();
      knee.position.y = -1.12;
      hip.add(knee);
      addMesh(knee, sphere(), titanium, [0, 0, 0], [0.22, 0.2, 0.19]);
      addMesh(knee, sphere(), ceramicSoft, [0, 0, 0.14], [0.16, 0.17, 0.08]);
      addMesh(
        knee,
        capsule(0.145, 0.86, 20),
        ceramic,
        [0, -0.57, 0],
        [0.92, 1, 0.78],
      );
      addMesh(knee, capsule(0.075, 0.74, 14), titanium, [0, -0.58, -0.04]);
      const ankle = new THREE.Group();
      ankle.position.y = -1.08;
      knee.add(ankle);
      addMesh(ankle, sphere(), chrome, [0, 0, 0], [0.14, 0.13, 0.13]);
      const foot = addMesh(
        ankle,
        new THREE.BoxGeometry(0.4, 0.18, 0.72, 8, 3, 10),
        ceramic,
        [0, -0.16, 0.17],
      );
      foot.geometry.translate(0, 0, 0.08);
      hips.push(hip);
      knees.push(knee);
    };
    buildLeg(0);
    buildLeg(1);

    const hologram = new THREE.Group();
    hologram.position.set(-1.4, 0.6, 0.4);
    robot.add(hologram);
    const panel = addMesh(
      hologram,
      new THREE.PlaneGeometry(1.35, 0.82, 8, 5),
      holo,
      [0, 0, 0],
    );
    const ringMaterial = holo.clone();
    const ring = addMesh(
      hologram,
      new THREE.TorusGeometry(0.23, 0.012, 8, 48),
      ringMaterial,
      [0, 0, 0.02],
    );
    const scanLines = [];
    for (let i = 0; i < 4; i += 1) {
      const lineMaterial = holo.clone();
      const line = addMesh(
        hologram,
        new THREE.PlaneGeometry(0.55 - i * 0.06, 0.012),
        lineMaterial,
        [0.15, 0.22 - i * 0.12, 0.025],
      );
      scanLines.push(line);
    }
    hologram.rotation.y = 0.2;

    const state = {
      pointerX: 0,
      pointerY: 0,
      attentionX: 0,
      attentionY: 0,
      near: 0,
      cta: 0,
      scroll: 0,
      blink: 0,
      nextBlink: 2.5,
    };
    const pointer = (event) => {
      state.pointerX = THREE.MathUtils.clamp(
        (event.clientX / window.innerWidth - 0.5) * 2,
        -1,
        1,
      );
      state.pointerY = THREE.MathUtils.clamp(
        (event.clientY / window.innerHeight - 0.5) * 2,
        -1,
        1,
      );
      state.near =
        event.clientX > window.innerWidth * 0.52 &&
        event.clientY < window.innerHeight * 0.88
          ? 1
          : 0;
    };
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener(
      "scroll",
      () => {
        state.scroll = Math.min(
          1,
          window.scrollY / Math.max(1, window.innerHeight * 1.8),
        );
      },
      { passive: true },
    );
    document
      .querySelectorAll(".hero a, .site-header a, .orion-tag")
      .forEach((control) => {
        control.addEventListener("pointerenter", (event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          state.attentionX = THREE.MathUtils.clamp(
            ((rect.left + rect.width / 2) / window.innerWidth - 0.5) * 2,
            -1,
            1,
          );
          state.attentionY = THREE.MathUtils.clamp(
            ((rect.top + rect.height / 2) / window.innerHeight - 0.5) * 2,
            -1,
            1,
          );
          state.cta = 1;
        });
        control.addEventListener("pointerleave", () => {
          state.cta = 0;
        });
      });

    let visible = true;
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.01 },
    ).observe(stage);
    const clock = new THREE.Clock();
    const lerp = THREE.MathUtils.lerp;
    const updateSize = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      camera.position.z = width < 760 ? 8.1 : 7.2;
      robot.position.x = width < 760 ? 0 : 1.55;
      robot.scale.setScalar(width < 760 ? 1 : 1.08);
    };
    new ResizeObserver(updateSize).observe(stage);
    updateSize();

    const animate = () => {
      requestAnimationFrame(animate);
      if (!visible && !reduceMotion) return;
      const dt = Math.min(clock.getDelta(), 0.04);
      const t = clock.elapsedTime;
      const speed = 1 - Math.pow(0.001, dt);
      const lookX = state.cta ? state.attentionX : state.pointerX;
      const lookY = state.cta ? state.attentionY : state.pointerY;
      const idle = reduceMotion ? 0 : 1;
      const breath = Math.sin(t * 1.35) * 0.012 * idle;
      const balance = Math.sin(t * 0.42) * 0.025 * idle;
      const headScan = Math.sin(t * 0.27) * 0.025 * idle;
      const gesture = (Math.sin(t * 0.38) + 1) * 0.5 * idle;
      const targetHeadY = THREE.MathUtils.clamp(
        lookX * 0.31 + headScan,
        -0.31,
        0.31,
      );
      const targetHeadX = THREE.MathUtils.clamp(lookY * 0.22, -0.28, 0.28);
      head.rotation.y = lerp(head.rotation.y, targetHeadY, speed * 2.1);
      head.rotation.x = lerp(
        head.rotation.x,
        targetHeadX + (state.near ? -0.025 : 0),
        speed * 2.1,
      );
      neck.rotation.y = lerp(neck.rotation.y, targetHeadY * 0.28, speed * 1.4);
      neck.rotation.x = lerp(neck.rotation.x, targetHeadX * 0.18, speed * 1.4);
      torso.rotation.y = lerp(
        torso.rotation.y,
        THREE.MathUtils.clamp(lookX * 0.11 + state.scroll * 0.08, -0.14, 0.14),
        speed * 1.2,
      );
      torso.rotation.x = lerp(
        torso.rotation.x,
        breath - state.near * 0.018,
        speed,
      );
      pelvis.rotation.z = lerp(
        pelvis.rotation.z,
        balance + state.scroll * 0.018,
        speed * 0.6,
      );
      robot.position.y = breath * 0.55;
      chest.scale.y = 0.62 + breath * 0.7;
      chest.scale.x = 1 + breath * 0.35;
      shoulderRoots[0].rotation.z = lerp(
        shoulderRoots[0].rotation.z,
        -0.02 + balance * 0.7,
        speed,
      );
      shoulderRoots[1].rotation.z = lerp(
        shoulderRoots[1].rotation.z,
        0.02 + balance * 0.7 - state.cta * 0.055,
        speed,
      );
      shoulderRoots[0].rotation.y = lerp(
        shoulderRoots[0].rotation.y,
        lookX * 0.045,
        speed,
      );
      shoulderRoots[1].rotation.y = lerp(
        shoulderRoots[1].rotation.y,
        lookX * 0.045,
        speed,
      );
      shoulderRoots[0].rotation.x = lerp(
        shoulderRoots[0].rotation.x,
        -0.035 + gesture * 0.045 + lookY * 0.025,
        speed * 0.8,
      );
      shoulderRoots[1].rotation.x = lerp(
        shoulderRoots[1].rotation.x,
        0.035 - gesture * 0.055 + lookY * 0.025,
        speed * 0.8,
      );
      elbows[0].rotation.x = lerp(
        elbows[0].rotation.x,
        0.08 + gesture * 0.12,
        speed * 0.65,
      );
      elbows[1].rotation.x = lerp(
        elbows[1].rotation.x,
        0.1 + (1 - gesture) * 0.1 + state.cta * 0.16,
        speed * 0.7,
      );
      wrists[0].rotation.z = lerp(
        wrists[0].rotation.z,
        Math.sin(t * 0.55) * 0.035,
        speed,
      );
      wrists[1].rotation.z = lerp(
        wrists[1].rotation.z,
        -Math.sin(t * 0.48) * 0.035 + state.cta * 0.12,
        speed,
      );
      fingers.forEach((hand, handIndex) =>
        hand.forEach((finger, index) => {
          const curl =
            Math.sin(t * 0.65 + index * 0.7 + handIndex) * 0.05 * idle;
          const open = handIndex === 1 ? state.cta * -0.2 : 0;
          finger.rotation.x = lerp(
            finger.rotation.x,
            0.12 + curl + open,
            speed * 0.7,
          );
        }),
      );
      hips[0].rotation.z = lerp(
        hips[0].rotation.z,
        -balance * 0.6,
        speed * 0.6,
      );
      hips[1].rotation.z = lerp(
        hips[1].rotation.z,
        -balance * 0.6,
        speed * 0.6,
      );
      camera.position.x = lerp(
        camera.position.x,
        state.scroll * -0.28,
        speed * 0.35,
      );
      camera.position.y = lerp(
        camera.position.y,
        1.1 + state.scroll * 0.08,
        speed * 0.35,
      );
      lab.position.x = lerp(lab.position.x, state.scroll * 0.16, speed * 0.3);
      rim.intensity = lerp(
        rim.intensity,
        2.1 + state.scroll * 0.8,
        speed * 0.5,
      );
      blue.emissiveIntensity = lerp(
        blue.emissiveIntensity,
        2.4 + state.near * 1.7 + state.cta * 1.1 + Math.sin(t * 2.2) * 0.2,
        speed * 2,
      );
      core.scale.y = 1 + Math.sin(t * 2.7) * 0.08;
      if (!reduceMotion && t > state.nextBlink) {
        state.blink = 1;
        state.nextBlink = t + 3.2 + Math.random() * 4.8;
      }
      state.blink = Math.max(0, state.blink - dt * 9);
      const eyeScale = state.blink > 0.35 ? 0.06 : 1;
      leftEye.scale.y = lerp(leftEye.scale.y, eyeScale, speed * 7);
      rightEye.scale.y = lerp(rightEye.scale.y, eyeScale, speed * 7);
      leftEye.position.x = -0.1 + lookX * 0.014;
      rightEye.position.x = 0.1 + lookX * 0.014;
      leftEye.position.y = 0.16 - lookY * 0.012;
      rightEye.position.y = 0.16 - lookY * 0.012;
      const holoOpacity = Math.max(
        0,
        Math.min(0.48, (state.scroll - 0.12) * 0.9),
      );
      [panel, ring, ...scanLines].forEach((item) => {
        item.material.opacity = holoOpacity;
      });
      hologram.rotation.y = 0.2 + Math.sin(t * 0.4) * 0.04;
      ring.rotation.z = t * 0.35;
      renderer.render(scene, camera);
    };

    stage.classList.add("webgl-ready");
    animate();
  } catch (error) {
    console.warn("ORION 3D fallback activated.", error);
    stage.classList.add("webgl-fallback");
  }
}
