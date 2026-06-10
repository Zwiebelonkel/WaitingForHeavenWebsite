const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
  Array.from(root.querySelectorAll(selector));

const terminalText = `> Wake up, soul.
> You are dead.
> Reason: unknown.
> Current location: bus stop between worlds.
> Recommended action: sit down and wait.
> Warning: behaviour is being recorded.
> Bus arrival: eventually.`;

function initTypewriter() {
  const el = $("#typewriter");
  if (!el) return;

  let i = 0;

  const write = () => {
    el.textContent = terminalText.slice(0, i);
    i += 1;

    if (i <= terminalText.length) {
      setTimeout(write, Math.random() * 22 + 8);
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        write();
        observer.disconnect();
      }
    },
    { threshold: 0.35 },
  );

  observer.observe(el);
}

function initAnimations() {
  if (window.anime) {
    anime({
      targets: ".hero-title, .hero-copy, .hero-actions, .bus-card",
      translateY: [44, 0],
      opacity: [0, 1],
      delay: anime.stagger(110, { start: 180 }),
      duration: 1200,
      easing: "easeOutExpo",
    });

    anime({
      targets: ".moon",
      scale: [0.9, 1.05],
      opacity: [0.7, 1],
      direction: "alternate",
      loop: true,
      duration: 2800,
      easing: "easeInOutSine",
    });

    anime({
      targets: ".hero-bg-orb",
      translateX: () => anime.random(-22, 22),
      translateY: () => anime.random(-28, 28),
      direction: "alternate",
      loop: true,
      duration: 4200,
      easing: "easeInOutSine",
    });
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    $$(".reveal").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 50, opacity: 0, filter: "blur(10px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
          },
        },
      );
    });

    gsap.to(".hero-grid", {
      yPercent: -18,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }
}

function initCursor() {
  const cursor = $(".cursor-dot");

  if (!cursor || window.matchMedia("(pointer: coarse)").matches) return;

  window.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });
}

function initTiltCards() {
  $$(".tilt-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();

      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
  });
}

function initMagneticButtons() {
  $$(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();

      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.1}px, ${y * 0.14}px) scale(1.02)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translate(0, 0) scale(1)";
    });
  });
}

function initVerdicts() {
  const data = {
    heaven: [
      "HEAVEN",
      "You were allowed to leave. Maybe you were patient. Maybe merciful. Maybe just a little less lost than the rest.",
    ],
    limbo: [
      "LIMBO",
      "You are dropped off again. The door opens. The bench waits. The next bus will come eventually. Maybe.",
    ],
    hell: [
      "HELL",
      "The bus keeps driving. No exit. No forgiveness. Only the report and the sound of the road beneath you.",
    ],
  };

  const panel = $("#verdict-panel");
  if (!panel) return;

  $$(".verdict").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".verdict").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");

      const verdict = button.dataset.verdict;
      const [title, text] = data[verdict];

      panel.classList.remove(
        "verdict-heaven",
        "verdict-limbo",
        "verdict-hell",
        "verdict-animate-heaven",
        "verdict-animate-limbo",
        "verdict-animate-hell",
      );

      void panel.offsetWidth;

      panel.classList.add(`verdict-${verdict}`);
      panel.classList.add(`verdict-animate-${verdict}`);

      panel.querySelector("h3").textContent = title;
      panel.querySelector("p:last-child").textContent = text;
    });
  });
}

function initPersistentItemReveals() {
  $$(".item-tile").forEach((tile) => {
    const reveal = () => tile.classList.add("is-revealed");

    tile.addEventListener("mouseenter", reveal);
    tile.addEventListener("focus", reveal);
    tile.addEventListener("touchstart", reveal, { passive: true });
  });
}

function initScrollModelRotation() {
  const models = $("[data-scroll-rotation]")
    ? $$("[data-scroll-rotation]")
    : [];

  if (
    !models.length ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  let rotationY = 0;
  let velocity = 0;
  let targetVelocity = 0;

  const impulseStrength = 0.035;
  const maxVelocity = 14;
  const smoothness = 0.12;
  const targetFriction = 0.86;
  const velocityFriction = 0.975;

  const clamp = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
  };

  const applyRotation = () => {
    velocity += (targetVelocity - velocity) * smoothness;
    rotationY += velocity;

    targetVelocity *= targetFriction;
    velocity *= velocityFriction;

    if (Math.abs(targetVelocity) < 0.001) targetVelocity = 0;
    if (Math.abs(velocity) < 0.001) velocity = 0;

    models.forEach((model) => {
      const direction = Number(model.dataset.rotationDirection || 1);
      const tiltX = Number(model.dataset.rotationTiltX || -7);
      const tiltZ = Number(model.dataset.rotationTiltZ || 4);

      model.setAttribute(
        "orientation",
        `${tiltX}deg ${(rotationY * direction).toFixed(2)}deg ${tiltZ}deg`,
      );
    });

    requestAnimationFrame(applyRotation);
  };

  window.addEventListener(
    "wheel",
    (e) => {
      targetVelocity += e.deltaY * impulseStrength;
      targetVelocity = clamp(targetVelocity, -maxVelocity, maxVelocity);
    },
    { passive: true },
  );

  let lastScrollY = window.scrollY;

  window.addEventListener(
    "scroll",
    () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      targetVelocity += delta * impulseStrength;
      targetVelocity = clamp(targetVelocity, -maxVelocity, maxVelocity);

      lastScrollY = currentScrollY;
    },
    { passive: true },
  );

  applyRotation();
}

function initFog() {
  const canvas = $("#fog-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let w;
  let h;
  let particles;

  const resize = () => {
    w = canvas.width = innerWidth * devicePixelRatio;
    h = canvas.height = innerHeight * devicePixelRatio;

    particles = Array.from(
      { length: Math.min(90, Math.floor(innerWidth / 18)) },
      () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 120 + 60) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.1 * devicePixelRatio,
        a: Math.random() * 0.055 + 0.025,
      }),
    );
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -p.r) p.x = w + p.r;
      if (p.x > w + p.r) p.x = -p.r;
      if (p.y < -p.r) p.y = h + p.r;
      if (p.y > h + p.r) p.y = -p.r;

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);

      g.addColorStop(0, `rgba(255,255,255,${p.a})`);
      g.addColorStop(1, "rgba(255,255,255,0)");

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  };

  resize();
  draw();

  window.addEventListener("resize", resize);
}

function initBottomSoulcoinClock() {
  const coin = $(".bottom-soulcoin-model");
  if (!coin) return;

  let currentRotation = 0;
  let targetRotation = 0;

  const tick = () => {
    targetRotation += 6;
  };

  const animate = () => {
    currentRotation += (targetRotation - currentRotation) * 0.08;

    coin.setAttribute(
      "orientation",
      `-12deg ${currentRotation.toFixed(2)}deg 0deg`,
    );

    requestAnimationFrame(animate);
  };

  tick();
  setInterval(tick, 1000);
  animate();
}

window.addEventListener("DOMContentLoaded", () => {
  initCursor();
  initAnimations();
  initTypewriter();
  initTiltCards();
  initMagneticButtons();
  initVerdicts();
  initPersistentItemReveals();
  initScrollModelRotation();
  initBottomSoulcoinClock();
  initMediaLightbox();
  initFog();
});

function initMediaLightbox() {
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightbox-image");
  const closeButton = $(".lightbox-close");

  if (!lightbox || !lightboxImage) return;

  $$(".media-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const img = tile.querySelector("img");
      if (!img) return;

      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt || "";

      lightbox.classList.add("active");
      document.body.classList.add("lightbox-open");
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    document.body.classList.remove("lightbox-open");
  };

  if (closeButton) {
    closeButton.addEventListener("click", closeLightbox);
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}
