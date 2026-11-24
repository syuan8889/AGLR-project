(() => {
  // Light / Dark theme toggle
  const rootEl = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle");
  const iconMoon = document.getElementById("theme-icon-moon");
  const iconSun = document.getElementById("theme-icon-sun");
  const themeLabel = document.getElementById("theme-label");

  function applyTheme(theme) {
    const isDark = theme === "dark";
    rootEl.setAttribute("data-theme", isDark ? "dark" : "light");
    if (iconMoon) iconMoon.style.display = isDark ? "none" : "block";
    if (iconSun) iconSun.style.display = isDark ? "block" : "none";
    if (themeLabel) themeLabel.textContent = isDark ? "Light" : "Dark";
  }

  const savedTheme = localStorage.getItem("aglr-theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = rootEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("aglr-theme", next);
    });
  }

  // Real-world Unitree G1 editing catalog
  const REAL_WORLD_GROUPS = {
    base0: {
      label: "Base 0 — Limb, Torso & Time-Varying",
      baseTitle: "Base 0 (Reference Execution)",
      baseSrc: "assets/videos/real_world/base-0.mp4",
      variants: [
        {
          id: "ra_up_pos",
          label: "Right Arm Up +0.3",
          src: "assets/videos/real_world/base-0-right_arm_up_0.3.mp4",
          desc: "Single-attribute edit: raises right-arm Up attribute by +0.3 (normalized torso-frame extent)."
        },
        {
          id: "ra_up_neg",
          label: "Right Arm Up -0.3",
          src: "assets/videos/real_world/base-0-right_arm_up_-0.3.mp4",
          desc: "Single-attribute edit: lowers right-arm Up attribute by -0.3 while preserving overall posture."
        },
        {
          id: "ra_out_pos",
          label: "Right Arm Out +0.3",
          src: "assets/videos/real_world/base-0-right_arm_out_0.3.mp4",
          desc: "Single-attribute edit: extends right arm outward (+0.3 lateral extent)."
        },
        {
          id: "ra_out_neg",
          label: "Right Arm Out -0.3",
          src: "assets/videos/real_world/base-0-right_arm_out_-0.3.mp4",
          desc: "Single-attribute edit: pulls right arm inward (-0.3 lateral extent)."
        },
        {
          id: "ra_front_pos",
          label: "Right Arm Front +0.3",
          src: "assets/videos/real_world/base-0-right_arm_front_0.3.mp4",
          desc: "Single-attribute edit: extends right arm forward (+0.3 Front offset)."
        },
        {
          id: "ra_front_neg",
          label: "Right Arm Front -0.3",
          src: "assets/videos/real_world/base-0-right_arm_front_-0.3.mp4",
          desc: "Single-attribute edit: retracts right arm backward (-0.3 Front offset)."
        },
        {
          id: "la_up_pos",
          label: "Left Arm Up +0.3",
          src: "assets/videos/real_world/base-0-left_arm_up_0.3.mp4",
          desc: "Single-attribute edit: raises left arm (+0.3 Up) while keeping right arm and lower body intact."
        },
        {
          id: "ll_out_pos",
          label: "Left Leg Out +0.2",
          src: "assets/videos/real_world/base-0-left_leg_out_0.2.mp4",
          desc: "Lower-body edit: increases left-leg lateral extent (+0.2 Out in pelvis frame)."
        },
        {
          id: "comb_ra_torso",
          label: "Right Arm +0.3 & Torso Left 0.2 rad",
          src: "assets/videos/real_world/base-0-right_arm_up_0.3_torso_left_0.2.mp4",
          desc: "Compositional edit: simultaneously raises right arm (+0.3) and tilts torso leftward (0.2 rad)."
        },
        {
          id: "comb_both_arms",
          label: "Both Arms Up +0.3",
          src: "assets/videos/real_world/base-0-both_arm_0.3.mp4",
          desc: "Compositional edit: raises both left and right arms simultaneously (+0.3 Up)."
        },
        {
          id: "tv_la_out",
          label: "Time-Varying: Left Arm Out +0.2 → -0.2",
          src: "assets/videos/real_world/base-0-left_arm_out_0.2_-0.2.mp4",
          desc: "Time-varying edit: reverses left-arm lateral offset from +0.2 to -0.2 within a single motion."
        }
      ]
    },
    base1: {
      label: "Base 1 — Root Trajectory & Composition",
      baseTitle: "Base 1 (Reference Execution)",
      baseSrc: "assets/videos/real_world/base-1.mp4",
      variants: [
        {
          id: "left_traj",
          label: "Left-Turning Root Trajectory",
          src: "assets/videos/real_world/base-1-left_traj.mp4",
          desc: "Root-trajectory edit: curves the horizontal path leftward in the initial-heading frame."
        },
        {
          id: "left_traj_ra_up",
          label: "Left Trajectory + Right Arm Up +0.3",
          src: "assets/videos/real_world/base-1-left_traj_right_arm_up_0.3.mp4",
          desc: "Global + local composition: combines left-turning root trajectory with right-arm Up +0.3."
        }
      ]
    },
    base2: {
      label: "Base 2 — Marching Heading Turns",
      baseTitle: "Base 2 (Marching Reference)",
      baseSrc: "assets/videos/real_world/base-2-march.mp4",
      variants: [
        {
          id: "march_180",
          label: "180° Turn While Marching",
          src: "assets/videos/real_world/base-2-march-180deg.mp4",
          desc: "Time-varying root-orientation edit: smooth 180° heading turn while preserving the marching gait."
        },
        {
          id: "march_360",
          label: "360° Turn While Marching",
          src: "assets/videos/real_world/base-2-march-360deg.mp4",
          desc: "Time-varying root-orientation edit: full 360° heading turn while marching."
        }
      ]
    }
  };

  let activeGroupKey = "base0";
  let activeVariantIdx = 0;
  let playbackRate = 1.0;

  const baseVideo = document.getElementById("rw-base-video");
  const editVideo = document.getElementById("rw-edit-video");
  const baseTitleEl = document.getElementById("rw-base-title");
  const editTitleEl = document.getElementById("rw-edit-title");
  const variantListEl = document.getElementById("rw-variant-list");
  const descEl = document.getElementById("rw-variant-desc");
  const playToggleBtn = document.getElementById("rw-play-toggle");
  const restartBtn = document.getElementById("rw-restart");
  const speedBtn = document.getElementById("rw-speed");

  function syncPlayBoth() {
    if (!baseVideo || !editVideo) return;
    baseVideo.playbackRate = playbackRate;
    editVideo.playbackRate = playbackRate;
    Promise.all([baseVideo.play(), editVideo.play()]).catch(() => {});
    if (playToggleBtn) playToggleBtn.textContent = "Pause Both";
  }

  function syncPauseBoth() {
    if (!baseVideo || !editVideo) return;
    baseVideo.pause();
    editVideo.pause();
    if (playToggleBtn) playToggleBtn.textContent = "Play Both";
  }

  function renderVariants() {
    const group = REAL_WORLD_GROUPS[activeGroupKey];
    if (!group || !variantListEl) return;

    variantListEl.innerHTML = "";
    group.variants.forEach((v, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "variant-pill" + (idx === activeVariantIdx ? " active" : "");
      btn.textContent = v.label;
      btn.addEventListener("click", () => {
        activeVariantIdx = idx;
        loadCurrentPair(true);
        renderVariants();
      });
      variantListEl.appendChild(btn);
    });
  }

  function loadCurrentPair(autoPlay = true) {
    const group = REAL_WORLD_GROUPS[activeGroupKey];
    const variant = group.variants[activeVariantIdx];
    if (!group || !variant || !baseVideo || !editVideo) return;

    if (baseTitleEl) baseTitleEl.textContent = group.baseTitle;
    if (editTitleEl) editTitleEl.textContent = variant.label;
    if (descEl) descEl.innerHTML = `<strong>Active Edit:</strong> ${variant.desc}`;

    const needBaseReload = baseVideo.getAttribute("data-src") !== group.baseSrc;
    if (needBaseReload) {
      baseVideo.setAttribute("data-src", group.baseSrc);
      baseVideo.src = group.baseSrc;
      baseVideo.load();
    } else {
      baseVideo.currentTime = 0;
    }

    editVideo.src = variant.src;
    editVideo.load();
    baseVideo.playbackRate = playbackRate;
    editVideo.playbackRate = playbackRate;

    if (autoPlay) {
      const startBoth = () => {
        baseVideo.currentTime = 0;
        editVideo.currentTime = 0;
        syncPlayBoth();
      };
      editVideo.addEventListener("canplay", startBoth, { once: true });
    }
  }

  // Group tabs
  document.querySelectorAll("[data-rw-group]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeGroupKey = btn.getAttribute("data-rw-group");
      activeVariantIdx = 0;
      document.querySelectorAll("[data-rw-group]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderVariants();
      loadCurrentPair(true);
    });
  });

  if (playToggleBtn) {
    playToggleBtn.addEventListener("click", () => {
      if (baseVideo.paused || editVideo.paused) {
        syncPlayBoth();
      } else {
        syncPauseBoth();
      }
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      baseVideo.currentTime = 0;
      editVideo.currentTime = 0;
      syncPlayBoth();
    });
  }

  if (speedBtn) {
    speedBtn.addEventListener("click", () => {
      playbackRate = playbackRate === 1.0 ? 0.5 : 1.0;
      baseVideo.playbackRate = playbackRate;
      editVideo.playbackRate = playbackRate;
      speedBtn.textContent = `Speed: ${playbackRate.toFixed(1)}×`;
    });
  }

  renderVariants();
  loadCurrentPair(false);

  // Results tabs
  document.querySelectorAll("[data-result-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-result-tab");
      document.querySelectorAll("[data-result-tab]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".result-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.id === target);
      });
    });
  });

  // Lightbox for figures
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  document.querySelectorAll(".zoomable").forEach((img) => {
    img.addEventListener("click", () => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "";
      lightbox.classList.add("open");
    });
  });
  if (lightbox) {
    lightbox.addEventListener("click", () => lightbox.classList.remove("open"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") lightbox.classList.remove("open");
    });
  }

  // Copy BibTeX
  const copyBtn = document.getElementById("copy-bibtex");
  const bibtexEl = document.getElementById("bibtex-code");
  if (copyBtn && bibtexEl) {
    copyBtn.addEventListener("click", async () => {
      const text = bibtexEl.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy BibTeX"), 1800);
      } catch {
        const area = document.createElement("textarea");
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy BibTeX"), 1800);
      }
    });
  }
})();
