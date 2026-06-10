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
    if (i <= terminalText.length) setTimeout(write, Math.random() * 22 + 8);
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
          scrollTrigger: { trigger: el, start: "top 82%" },
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
  $$(".verdict").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".verdict").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      const [title, text] = data[button.dataset.verdict];
      panel.querySelector("h3").textContent = title;
      panel.querySelector("p:last-child").textContent = text;
      if (window.anime) {
        anime({
          targets: panel,
          translateY: [18, 0],
          opacity: [0.55, 1],
          duration: 520,
          easing: "easeOutExpo",
        });
      }
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
  const models = $$("[data-scroll-rotation]");
  if (
    !models.length ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  const updateRotation = () => {
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    const scrollProgress = window.scrollY / maxScroll;

    models.forEach((model) => {
      const direction = Number(model.dataset.rotationDirection || 1);
      const tiltX = Number(model.dataset.rotationTiltX || -7);
      const tiltZ = Number(model.dataset.rotationTiltZ || 4);
      const rotationY = scrollProgress * 1440 * direction;
      model.setAttribute(
        "orientation",
        `${tiltX}deg ${rotationY.toFixed(2)}deg ${tiltZ}deg`,
      );
    });
  };

  updateRotation();
  window.addEventListener("scroll", updateRotation, { passive: true });
  window.addEventListener("resize", updateRotation);
}

function initFog() {
  const canvas = $("#fog-canvas");
  const ctx = canvas.getContext("2d");
  let w, h, particles;

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
  addEventListener("resize", resize);
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
  initFog();
});
