/* =========================
   LectureSafe
   Private static attendance calculator
   No API, no database, no cookies, no localStorage, no file access
========================= */

const form = document.getElementById("attendanceForm");

const requiredInput = document.getElementById("requiredPercentage");
const totalHeldInput = document.getElementById("totalHeld");
const attendedInput = document.getElementById("attended");

const errorBox = document.getElementById("errorBox");
const resultCard = document.getElementById("resultCard");

const currentAttendanceText = document.getElementById("currentAttendance");
const statusLine = document.getElementById("statusLine");
const zoneBadge = document.getElementById("zoneBadge");

const progressLabel = document.getElementById("progressLabel");
const progressFill = document.getElementById("progressFill");

const missedClassesText = document.getElementById("missedClasses");
const safeMissesText = document.getElementById("safeMisses");
const neededClassesText = document.getElementById("neededClasses");
const adviceBox = document.getElementById("adviceBox");

const calculateBtn = document.getElementById("calculateBtn");
const resetBtn = document.getElementById("resetBtn");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");
const dynamicFavicon = document.getElementById("dynamicFavicon");
const themeColorMeta = document.getElementById("themeColorMeta");

const startPlanningBtn = document.getElementById("startPlanningBtn");
const calculatorSection = document.getElementById("calculator");
const calculatorShell = document.getElementById("calculatorShell");

const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
let userChangedTheme = false;

// Ring circumference for r=64 (2 * PI * 64), matches stroke-dasharray in CSS.
const RING_CIRCUMFERENCE = 402;

function setRingProgress(percentage) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = RING_CIRCUMFERENCE - (clamped / 100) * RING_CIRCUMFERENCE;
  progressFill.style.strokeDashoffset = String(offset);
}

function animateCount(el, toValue, suffix, duration) {
  const from = 0;
  const start = performance.now();
  const dur = duration || 700;

  function tick(now) {
    const t = Math.min(1, (now - start) / dur);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3);
    const value = from + (toValue - from) * eased;
    el.textContent = `${value.toFixed(2)}${suffix}`;
    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = `${toValue.toFixed(2)}${suffix}`;
    }
  }

  requestAnimationFrame(tick);
}

function detectPlatform() {
  const ua = navigator.userAgent || "";
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  let platform = "desktop";
  if (/iPhone|iPad|iPod/.test(ua)) {
    platform = "ios";
  } else if (/Android/.test(ua)) {
    platform = "android";
  }

  document.documentElement.classList.add(`platform-${platform}`);
  document.documentElement.classList.toggle("is-standalone", isStandalone);
  return platform;
}

function attachRipple(selector) {
  document.querySelectorAll(selector).forEach(function (el) {
    el.addEventListener("pointerdown", function (event) {
      if (!document.documentElement.classList.contains("platform-android")) return;

      const rect = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height) * 1.4;

      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;

      el.appendChild(ripple);
      ripple.addEventListener("animationend", function () {
        ripple.remove();
      });
    });
  });
}

function isDarkMode() {
  return document.documentElement.classList.contains("dark-mode");
}

function updateThemeButton() {
  const dark = isDarkMode();

  themeIcon.textContent = dark ? "☀️" : "🌙";
  themeText.textContent = dark ? "Light" : "Dark";
  themeToggle.setAttribute("aria-pressed", dark ? "true" : "false");
}

function updateFavicon() {
  if (!dynamicFavicon) return;

  const version = "v=22";

  dynamicFavicon.href = isDarkMode()
    ? `favicon-dark.svg?${version}`
    : `favicon-light.svg?${version}`;
}

function updateThemeColor() {
  if (!themeColorMeta) return;

  // Kept in sync with the --bg token in style.css for each theme.
  themeColorMeta.setAttribute(
    "content",
    isDarkMode() ? "#0e1116" : "#f7f8fa"
  );
}

function applyTheme(isDark) {
  document.documentElement.classList.toggle("dark-mode", isDark);
  updateThemeButton();
  updateFavicon();
  updateThemeColor();
}

function toggleTheme() {
  userChangedTheme = true;
  applyTheme(!isDarkMode());
}

function getNumber(inputElement) {
  return Number(inputElement.value.trim());
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add("show");
  resultCard.classList.remove("result-animate");
  adviceBox.textContent = "Fix the error and calculate again.";
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.remove("show");
}

function validateInputs(requiredPercentage, totalHeld, attended) {
  if (
    Number.isNaN(requiredPercentage) ||
    Number.isNaN(totalHeld) ||
    Number.isNaN(attended)
  ) {
    return "Only numbers are allowed.";
  }

  if (requiredPercentage <= 0 || requiredPercentage > 100) {
    return "Minimum attendance percentage must be between 1 and 100.";
  }

  if (totalHeld <= 0) {
    return "Total lectures/classes held must be more than 0.";
  }

  if (attended < 0) {
    return "Attended lectures/classes cannot be negative.";
  }

  if (!Number.isInteger(totalHeld) || !Number.isInteger(attended)) {
    return "Total and attended lecture counts should be whole numbers like 10, 20, or 40.";
  }

  if (attended > totalHeld) {
    return "Attended lectures/classes cannot be more than total lectures/classes held.";
  }

  return "";
}

function getZone(currentPercentage, requiredPercentage) {
  if (currentPercentage >= requiredPercentage) {
    return {
      name: "Safe Zone",
      className: "safe",
      status: "You are above the required attendance target.",
      advice:
        "Your current attendance is equal to or above the required percentage. Keep checking before missing any class."
    };
  }

  if (currentPercentage >= requiredPercentage - 5) {
    return {
      name: "Warning Zone",
      className: "warning",
      status: "You are close to the required target.",
      advice:
        "Your attendance is close to the required percentage. Attend upcoming classes to move back into the safe zone."
    };
  }

  return {
    name: "Recovery Needed",
    className: "danger",
    status: "You are below the required attendance target.",
    advice:
      "Your attendance is below the required percentage. Regular attendance is needed to recover."
  };
}

function calculateClassesNeeded(requiredPercentage, totalHeld, attended) {
  const requiredDecimal = requiredPercentage / 100;
  const currentDecimal = attended / totalHeld;

  if (currentDecimal >= requiredDecimal) {
    return 0;
  }

  if (requiredPercentage === 100) {
    return "Not possible";
  }

  const needed = Math.ceil(
    (requiredDecimal * totalHeld - attended) / (1 - requiredDecimal)
  );

  return Math.max(0, needed);
}

function calculateSafeMissesFromNow(requiredPercentage, totalHeld, attended) {
  const requiredDecimal = requiredPercentage / 100;
  const currentDecimal = attended / totalHeld;

  if (currentDecimal < requiredDecimal) {
    return 0;
  }

  if (requiredPercentage === 100) {
    return 0;
  }

  const safeMisses = Math.floor(attended / requiredDecimal - totalHeld);

  return Math.max(0, safeMisses);
}

function getMotivationMessage(zoneName, safeMisses, classesNeeded) {
  if (zoneName === "Safe Zone") {
    if (safeMisses === 0) {
      return "You are safe right now, but very close to the boundary. Missing one class may reduce your attendance below target.";
    }

    return `You can safely miss about ${safeMisses} upcoming class(es), but always confirm with official records.`;
  }

  if (zoneName === "Warning Zone") {
    return `Attend at least ${classesNeeded} upcoming class(es) to reach your target.`;
  }

  return `Recovery is needed. You may need to attend ${classesNeeded} upcoming class(es) to reach your target.`;
}

function focusCalculatorShell() {
  if (!calculatorShell) return;

  calculatorShell.classList.remove("planner-pop");

  requestAnimationFrame(function () {
    calculatorShell.classList.add("planner-pop");

    window.setTimeout(function () {
      calculatorShell.classList.remove("planner-pop");
    }, 950);
  });
}

function liftResultCard() {
  resultCard.classList.remove("result-animate");

  requestAnimationFrame(function () {
    resultCard.classList.add("result-animate");

    window.setTimeout(function () {
      resultCard.classList.remove("result-animate");
    }, 500);
  });

  resultCard.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function calculateAttendance() {
  const requiredPercentage = getNumber(requiredInput);
  const totalHeld = getNumber(totalHeldInput);
  const attended = getNumber(attendedInput);

  if (
    requiredInput.value.trim() === "" ||
    totalHeldInput.value.trim() === "" ||
    attendedInput.value.trim() === ""
  ) {
    showError("Please fill all fields.");
    liftResultCard();
    return;
  }

  const validationMessage = validateInputs(
    requiredPercentage,
    totalHeld,
    attended
  );

  if (validationMessage) {
    showError(validationMessage);
    liftResultCard();
    return;
  }

  clearError();

  const currentPercentage = (attended / totalHeld) * 100;
  const alreadyMissed = totalHeld - attended;

  const safeMisses = calculateSafeMissesFromNow(
    requiredPercentage,
    totalHeld,
    attended
  );

  const classesNeeded = calculateClassesNeeded(
    requiredPercentage,
    totalHeld,
    attended
  );

  const zone = getZone(currentPercentage, requiredPercentage);

  animateCount(currentAttendanceText, currentPercentage, "%");
  statusLine.textContent = zone.status;

  progressLabel.textContent = `of ${requiredPercentage}% target`;
  setRingProgress(currentPercentage);
  // Presentational only: mirrors the badge color so the ring and the
  // status read as one system. Does not affect any calculated value.
  progressFill.className = `ring-fill ${zone.className}`;

  zoneBadge.textContent = zone.name;
  zoneBadge.className = `zone-badge ${zone.className}`;

  missedClassesText.textContent = alreadyMissed;
  safeMissesText.textContent = safeMisses;
  neededClassesText.textContent = classesNeeded;

  if (classesNeeded === "Not possible") {
    adviceBox.textContent =
      "Your target is 100%, but you have already missed one or more classes. Reaching 100% is not possible with the current record.";
  } else {
    const motivation = getMotivationMessage(
      zone.name,
      safeMisses,
      classesNeeded
    );

    adviceBox.textContent = `${zone.advice} ${motivation}`;
  }

  adviceBox.className = `advice-box ${zone.className}`;

  resultCard.classList.remove("waiting");
  liftResultCard();
}

function handleFormSubmit(event) {
  event.preventDefault();

  calculateBtn.classList.add("is-loading");
  calculateBtn.disabled = true;

  window.setTimeout(function () {
    calculateAttendance();
    calculateBtn.classList.remove("is-loading");
    calculateBtn.disabled = false;
  }, 140);
}

function resetCalculator() {
  form.reset();
  clearError();

  currentAttendanceText.textContent = "--%";
  statusLine.textContent = "Fill the form and press calculate.";

  progressLabel.textContent = "current";
  setRingProgress(0);
  progressFill.className = "ring-fill";

  zoneBadge.textContent = "Ready";
  zoneBadge.className = "zone-badge neutral";

  missedClassesText.textContent = "--";
  safeMissesText.textContent = "--";
  neededClassesText.textContent = "--";

  adviceBox.textContent =
    "Tip: Use your official attendance portal numbers for the most accurate result.";
  adviceBox.className = "advice-box";

  resultCard.classList.add("waiting");
  resultCard.classList.remove("result-animate");
}

function startPlanning() {
  focusCalculatorShell();

  calculatorSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

form.addEventListener("submit", handleFormSubmit);
resetBtn.addEventListener("click", resetCalculator);
themeToggle.addEventListener("click", toggleTheme);

if (startPlanningBtn) {
  startPlanningBtn.addEventListener("click", startPlanning);
}

systemTheme.addEventListener("change", function (event) {
  if (!userChangedTheme) {
    applyTheme(event.matches);
  }
});


applyTheme(systemTheme.matches);
detectPlatform();
attachRipple(".btn, .theme-btn, .point-card, .info-card");

// --- Custom PWA Install Prompt ---
let deferredPrompt;
const installAppBtn = document.getElementById('installAppBtn');

// Intercept the native install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (installAppBtn) {
    installAppBtn.style.display = 'inline-flex';
  }
});

// Handle custom install button click
if (installAppBtn) {
  installAppBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      installAppBtn.style.display = 'none';
    }
    deferredPrompt = null;
  });
}

// Cleanup if installed externally
window.addEventListener('appinstalled', () => {
  if (installAppBtn) {
    installAppBtn.style.display = 'none';
  }
  deferredPrompt = null;
});
