// app.js
// This script powers the interactive hero section with Three.js and
// orchestrates scroll‑based animations using GSAP ScrollTrigger. It
// demonstrates how modern JavaScript can create immersive, high‑performance
// experiences without relying on a heavy framework.

window.addEventListener('load', () => {
  // Get the canvas from the DOM
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  // Scene setup
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 4;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create a futuristic 3D object (icosahedron with wireframe)
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const material = new THREE.MeshPhongMaterial({
    color: 0x2194ce,
    shininess: 80,
    wireframe: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Add lighting
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);
  const ambientLight = new THREE.AmbientLight(0x404040); // soft light
  scene.add(ambientLight);

  // Star field for depth
  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 600;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 30;
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starsMaterial = new THREE.PointsMaterial({ color: 0x8888ff, size: 0.03 });
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);

  // Handle resizing
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.003;
    mesh.rotation.y += 0.005;
    stars.rotation.y += 0.0002;
    renderer.render(scene, camera);
  };
  animate();

  // GSAP animations
  gsap.registerPlugin(ScrollTrigger);

  // Text entry animations
  gsap.from('.hero-title', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out' });
  gsap.from('.hero-subtitle', {
    y: 80,
    opacity: 0,
    duration: 1.4,
    delay: 0.2,
    ease: 'power3.out',
  });
  gsap.from('.primary-btn', {
    y: 100,
    opacity: 0,
    duration: 1.6,
    delay: 0.4,
    ease: 'power3.out',
  });

  // Rotate the 3D object based on scroll position relative to the showcase section
  if (document.getElementById('showcase')) {
    gsap.to(mesh.rotation, {
      x: Math.PI * 2,
      y: Math.PI * 4,
      scrollTrigger: {
        trigger: '#showcase',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // Parallax effect for philosophy section background (optional)
  if (document.getElementById('philosophy')) {
    gsap.to('#philosophy', {
      backgroundPosition: '0% 50%',
      ease: 'none',
      scrollTrigger: {
        trigger: '#philosophy',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // Scroll reveal
  document
    .querySelectorAll('.card, .data-card, .testimonial-card')
    .forEach((item) => item.classList.add('reveal'));

  const revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }


  // CTA spotlight
  document.querySelectorAll('.cta-spotlight').forEach((spotlight) => {
    spotlight.addEventListener('mousemove', (event) => {
      const rect = spotlight.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      spotlight.style.setProperty('--spotlight-x', `${x}%`);
      spotlight.style.setProperty('--spotlight-y', `${y}%`);
    });
    spotlight.addEventListener('mouseenter', () => spotlight.classList.add('is-active'));
    spotlight.addEventListener('mouseleave', () => spotlight.classList.remove('is-active'));
  });

  // Mouse tilt on cards
  const tiltTargets = document.querySelectorAll(
    '.card, .info-card, .data-card, .testimonial-card'
  );
  tiltTargets.forEach((card) => {
    card.classList.add('tilt-card');
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -8;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.classList.add('is-tilting');
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
      card.classList.remove('is-tilting');
    });
  });

  // Testimonials carousel
  const testimonialTrack = document.getElementById('testimonialTrack');
  const testimonialDots = document.getElementById('testimonialDots');
  if (testimonialTrack && testimonialDots) {
    const cards = Array.from(testimonialTrack.querySelectorAll('.testimonial-card'));
    let index = 0;
    const renderDots = () => {
      testimonialDots.innerHTML = '';
      cards.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = 'testimonial-dot';
        if (idx === index) dot.classList.add('is-active');
        dot.addEventListener('click', () => setActive(idx));
        testimonialDots.appendChild(dot);
      });
    };

    const setActive = (nextIndex) => {
      cards[index].classList.remove('is-active');
      index = nextIndex;
      cards[index].classList.add('is-active');
      renderDots();
    };

    renderDots();
    setInterval(() => {
      const next = (index + 1) % cards.length;
      setActive(next);
    }, 5000);
  }
});
