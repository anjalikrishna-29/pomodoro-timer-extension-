// DOM elements
const timerDisplay = document.getElementById('timer');
const timerLabel = document.getElementById('timerLabel');
const timerContainer = document.getElementById('timerContainer');
const progressCircle = document.getElementById('progressCircle');
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');

const focusTab = document.getElementById('focusTab');
const breakTab = document.getElementById('breakTab');

const focusMinus = document.getElementById('focusMinus');
const focusPlus = document.getElementById('focusPlus');
const focusVal = document.getElementById('focusVal');

const breakMinus = document.getElementById('breakMinus');
const breakPlus = document.getElementById('breakPlus');
const breakVal = document.getElementById('breakVal');

// Svg Circle Settings
const circumference = 565.48; // 2 * PI * r (r=90)
progressCircle.style.strokeDasharray = circumference;

// State representation
let localState = {
  focusDuration: 25 * 60,
  breakDuration: 5 * 60,
  timeLeft: 25 * 60,
  isRunning: false,
  mode: 'focus',
  endTime: null
};

let tickInterval = null;

// Sets progress ring offset based on percentage remaining
function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  progressCircle.style.strokeDashoffset = offset;
}

// Redraw UI based on localState
function updateUI() {
  let timeLeft = localState.timeLeft;

  // If running, calculate actual time left dynamically to be frame-perfect
  if (localState.isRunning && localState.endTime) {
    const diff = Math.max(0, Math.round((localState.endTime - Date.now()) / 1000));
    timeLeft = diff;
  }

  // Format MM:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Update Progress Ring
  const totalDuration = localState.mode === 'focus' ? localState.focusDuration : localState.breakDuration;
  const percent = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 100;
  setProgress(percent);

  // Sync Mode Styles
  if (localState.mode === 'focus') {
    document.body.className = 'focus-mode';
    timerLabel.textContent = 'Focusing';
    focusTab.classList.add('active');
    breakTab.classList.remove('active');
  } else {
    document.body.className = 'break-mode';
    timerLabel.textContent = 'On a Break';
    breakTab.classList.add('active');
    focusTab.classList.remove('active');
  }

  // Toggle Play/Pause Buttons
  if (localState.isRunning) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    timerContainer.classList.add('running');
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    timerContainer.classList.remove('running');
  }

  // Update Settings stepper displays
  focusVal.textContent = Math.round(localState.focusDuration / 60);
  breakVal.textContent = Math.round(localState.breakDuration / 60);
}

// Start local timer ticker
function startLocalTicker() {
  if (tickInterval) clearInterval(tickInterval);
  
  if (localState.isRunning) {
    tickInterval = setInterval(() => {
      updateUI();
    }, 200); // 200ms for smooth SVG updating
  }
}

// Stop local timer ticker
function stopLocalTicker() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

// Load current configuration and timer state
function loadStateAndSync() {
  chrome.storage.local.get(
    ["focusDuration", "breakDuration", "timeLeft", "isRunning", "mode", "endTime"],
    (data) => {
      localState.focusDuration = data.focusDuration || 25 * 60;
      localState.breakDuration = data.breakDuration || 5 * 60;
      localState.timeLeft = data.timeLeft !== undefined ? data.timeLeft : 25 * 60;
      localState.isRunning = !!data.isRunning;
      localState.mode = data.mode || 'focus';
      localState.endTime = data.endTime || null;

      updateUI();
      if (localState.isRunning) {
        startLocalTicker();
      } else {
        stopLocalTicker();
      }
    }
  );
}

// Listen for updates from the service worker via chrome storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    let stateChanged = false;
    for (let key in changes) {
      if (changes[key]) {
        localState[key] = changes[key].newValue;
        stateChanged = true;
      }
    }
    if (stateChanged) {
      updateUI();
      if (localState.isRunning) {
        startLocalTicker();
      } else {
        stopLocalTicker();
      }
    }
  }
});

// Event Listeners for Controls
startStopBtn.addEventListener('click', () => {
  const action = localState.isRunning ? "pause" : "start";
  chrome.runtime.sendMessage({ action: action });
});

resetBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "reset" });
});

focusTab.addEventListener('click', () => {
  if (localState.mode !== 'focus') {
    chrome.runtime.sendMessage({ action: "changeMode", mode: "focus" });
  }
});

breakTab.addEventListener('click', () => {
  if (localState.mode !== 'break') {
    chrome.runtime.sendMessage({ action: "changeMode", mode: "break" });
  }
});

// Settings stepper event listeners
focusPlus.addEventListener('click', () => {
  const currentMins = Math.round(localState.focusDuration / 60);
  if (currentMins < 60) {
    chrome.runtime.sendMessage({
      action: "setDurations",
      focusMinutes: currentMins + 1,
      breakMinutes: Math.round(localState.breakDuration / 60)
    });
  }
});

focusMinus.addEventListener('click', () => {
  const currentMins = Math.round(localState.focusDuration / 60);
  if (currentMins > 1) {
    chrome.runtime.sendMessage({
      action: "setDurations",
      focusMinutes: currentMins - 1,
      breakMinutes: Math.round(localState.breakDuration / 60)
    });
  }
});

breakPlus.addEventListener('click', () => {
  const currentMins = Math.round(localState.breakDuration / 60);
  if (currentMins < 30) {
    chrome.runtime.sendMessage({
      action: "setDurations",
      focusMinutes: Math.round(localState.focusDuration / 60),
      breakMinutes: currentMins + 1
    });
  }
});

breakMinus.addEventListener('click', () => {
  const currentMins = Math.round(localState.breakDuration / 60);
  if (currentMins > 1) {
    chrome.runtime.sendMessage({
      action: "setDurations",
      focusMinutes: Math.round(localState.focusDuration / 60),
      breakMinutes: currentMins - 1
    });
  }
});

// Start-up Initial Load
loadStateAndSync();
