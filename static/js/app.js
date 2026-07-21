document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");
  const panel = document.querySelector("#orion-panel");
  const panelTrigger = document.querySelector(".orion-tag");
  const panelClose = document.querySelector(".orion-close");
  const message = document.querySelector(".orion-message");
  const tagCopy = document.querySelector(".orion-tag-copy");
  const stage = document.querySelector(".orion-stage");

  const setMenu = (open) => {
    menu?.setAttribute("aria-expanded", String(open));
    nav?.classList.toggle("open", open);
  };
  menu?.addEventListener("click", () =>
    setMenu(menu.getAttribute("aria-expanded") !== "true"),
  );
  nav
    ?.querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => setMenu(false)));

  const setPanel = (open) => {
    panel?.classList.toggle("open", open);
    panel?.setAttribute("aria-hidden", String(!open));
    panelTrigger?.setAttribute("aria-expanded", String(open));
    if (open) window.setTimeout(() => panelClose?.focus(), 50);
  };
  panelTrigger?.addEventListener("click", () =>
    setPanel(panelTrigger.getAttribute("aria-expanded") !== "true"),
  );
  panelClose?.addEventListener("click", () => {
    setPanel(false);
    panelTrigger?.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setMenu(false);
    if (panel?.classList.contains("open")) {
      setPanel(false);
      panelTrigger?.focus();
    }
  });

  document.querySelectorAll("[data-orion-reply]").forEach((link) =>
    link.addEventListener("pointerenter", () => {
      if (message) message.textContent = link.dataset.orionReply;
    }),
  );

  const contexts = [...document.querySelectorAll("[data-orion-context]")];
  if ("IntersectionObserver" in window && contexts.length) {
    const contextObserver = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!active) return;
        const copy = active.target.dataset.orionContext;
        if (message) message.textContent = copy;
        if (tagCopy)
          tagCopy.textContent =
            copy.length > 52 ? `${copy.slice(0, 49)}…` : copy;
      },
      { threshold: [0.25, 0.55] },
    );
    contexts.forEach((section) => contextObserver.observe(section));
  }

  let pointerFrame = 0;
  window.addEventListener(
    "pointermove",
    (event) => {
      if (reduceMotion || event.pointerType === "touch") return;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        root.style.setProperty("--eye-x", `${x * 3}px`);
        root.style.setProperty("--eye-y", `${y * 2}px`);
        if (stage) stage.style.translate = `${x * -7}px ${y * -4}px`;
      });
    },
    { passive: true },
  );

  document.querySelectorAll("a, button").forEach((control) => {
    control.addEventListener("pointerenter", () =>
      root.classList.add("orion-alert"),
    );
    control.addEventListener("pointerleave", () =>
      root.classList.remove("orion-alert"),
    );
  });

  const cards = [...document.querySelectorAll(".swap-card")];
  const items = [...document.querySelectorAll(".cap-item")];
  let order = cards.map((_, index) => index);
  let timer = 0;
  const placeCards = (animate = false) =>
    order.forEach((cardIndex, slot) => {
      const props = {
        x: slot * 28,
        y: slot * -22,
        z: slot * -70,
        rotateZ: slot * 1.4,
        zIndex: cards.length - slot,
        duration: 0.7,
        ease: "power3.inOut",
      };
      if (window.gsap) gsap[animate ? "to" : "set"](cards[cardIndex], props);
    });
  const activateCard = (index, animate = true) => {
    const slot = order.indexOf(index);
    if (slot < 0) return;
    order = [...order.slice(slot), ...order.slice(0, slot)];
    placeCards(animate && !reduceMotion);
    items.forEach((item, itemIndex) => {
      item.classList.toggle("active", itemIndex === index);
      item.setAttribute("aria-pressed", String(itemIndex === index));
    });
    if (message && panel?.classList.contains("open"))
      message.textContent = `${items[index]?.querySelector("h3")?.textContent}: ${items[index]?.querySelector("p")?.textContent}`;
  };
  if (cards.length) {
    placeCards();
    items.forEach((item, index) =>
      item.addEventListener("click", () => {
        window.clearInterval(timer);
        activateCard(index);
      }),
    );
    if (!reduceMotion)
      timer = window.setInterval(() => {
        if (!document.hidden) activateCard(order[1]);
      }, 5200);
  }

  if (!window.gsap || reduceMotion) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.from(".hero-copy > *", {
    y: 30,
    opacity: 0,
    duration: 0.9,
    stagger: 0.08,
    ease: "power3.out",
  });
  gsap.from(".orion-stage", {
    x: 48,
    opacity: 0,
    duration: 1.25,
    ease: "power3.out",
  });
  gsap.utils
    .toArray(".reveal")
    .forEach((element) =>
      gsap.fromTo(
        element,
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 86%", once: true },
        },
      ),
    );

  const flow = document.querySelector(".ticker-flow");
  if (flow && window.innerWidth > 560)
    gsap.to(flow, {
      x: () => -Math.max(0, flow.scrollWidth - window.innerWidth + 80),
      ease: "none",
      scrollTrigger: {
        trigger: ".ticker-section",
        start: "top top",
        end: () => `+=${Math.max(700, flow.scrollWidth - window.innerWidth)}`,
        scrub: 0.7,
        pin: ".ticker-pin",
        invalidateOnRefresh: true,
      },
    });

  const journeyLine = document.querySelector(".journey-line path");
  if (journeyLine) {
    const length = journeyLine.getTotalLength();
    gsap.set(journeyLine, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });
    gsap.to(journeyLine, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".journey",
        start: "top 70%",
        end: "bottom 75%",
        scrub: 0.8,
      },
    });
  }
  gsap.from(".network-lines path", {
    strokeDasharray: 450,
    strokeDashoffset: 450,
    scrollTrigger: {
      trigger: ".network-section",
      start: "top 65%",
      end: "center center",
      scrub: 0.8,
    },
  });
  gsap.from(".network-node:not(.node-core)", {
    scale: 0.7,
    opacity: 0,
    stagger: 0.06,
    duration: 0.55,
    ease: "back.out(1.4)",
    scrollTrigger: {
      trigger: ".network-section",
      start: "top 58%",
      once: true,
    },
  });
});
