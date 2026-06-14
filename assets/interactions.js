(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const progressBar = document.querySelector(".reading-progress span");
  const backToTop = document.querySelector(".back-to-top");
  const navLinks = [...document.querySelectorAll(".top-nav a[href^='#']")];
  const sectionLinks = [...document.querySelectorAll(".timeline a[href^='#']")];
  const allAnchorLinks = [...navLinks, ...sectionLinks];

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;

    if (progressBar) {
      progressBar.style.transform = `scaleX(${progress})`;
    }

    if (backToTop) {
      backToTop.classList.toggle("is-visible", scrollTop > 480);
    }
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  const trackedSections = allAnchorLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && trackedSections.length) {
    const setActiveLink = (id) => {
      allAnchorLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveLink(visible.target.id);
        }
      },
      {
        rootMargin: "-24% 0px -56% 0px",
        threshold: [0.1, 0.3, 0.6],
      }
    );

    trackedSections.forEach((section) => observer.observe(section));
  }

  const revealTargets = [
    ...document.querySelectorAll(
      ".episode-card, .recommend-card, .advice-card, .lifestyle-card, .lifestyle-note, .comic-scene, .insight-grid > div, .action-section"
    ),
  ];

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    revealTargets.forEach((target) => target.classList.add("reveal-on-scroll"));

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    revealTargets.forEach((target) => revealObserver.observe(target));
  }

  document.querySelectorAll(".comic-scene[id]").forEach((scene) => {
    const label = scene.querySelector(".scene-label");
    if (!label || scene.querySelector(".copy-section-link")) return;

    const button = document.createElement("button");
    button.className = "copy-section-link";
    button.type = "button";
    button.textContent = "复制链接";
    button.setAttribute("aria-label", `复制${label.textContent.trim()}的链接`);

    button.addEventListener("click", async () => {
      const url = `${window.location.origin}${window.location.pathname}#${scene.id}`;
      try {
        await navigator.clipboard.writeText(url);
        button.textContent = "已复制";
        window.setTimeout(() => {
          button.textContent = "复制链接";
        }, 1400);
      } catch {
        window.location.hash = scene.id;
      }
    });

    label.insertAdjacentElement("afterend", button);
  });
})();
