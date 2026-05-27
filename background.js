const DEFAULT_FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const DEFAULT_BREAK_DURATION = 5 * 60; // 5 minutes in seconds

// Helper to get state
function getState(callback) {
  chrome.storage.local.get(
    ["focusDuration", "breakDuration", "timeLeft", "isRunning", "mode", "endTime"],
    (data) => {
      callback({
        focusDuration: data.focusDuration || DEFAULT_FOCUS_DURATION,
        breakDuration: data.breakDuration || DEFAULT_BREAK_DURATION,
        timeLeft: data.timeLeft !== undefined ? data.timeLeft : DEFAULT_FOCUS_DURATION,
        isRunning: !!data.isRunning,
        mode: data.mode || "focus",
        endTime: data.endTime || null
      });
    }
  );
}

// On install, set up defaults
chrome.runtime.onInstalled.addListener(() => {
  getState((state) => {
    chrome.storage.local.set(state);
  });
});

// Alarm Listener
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pomodoroAlarm") {
    handleTimerComplete();
  }
});

function handleTimerComplete() {
  getState((state) => {
    const nextMode = state.mode === "focus" ? "break" : "focus";
    const nextDuration = nextMode === "focus" ? state.focusDuration : state.breakDuration;

    const title = state.mode === "focus" ? "Focus Session Completed!" : "Break Completed!";
    const message = state.mode === "focus" 
      ? "Great job staying focused! Time to take a break." 
      : "Hope you feel refreshed! Let's get back to work.";

    // Trigger Notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: title,
      message: message,
      priority: 2
    });

    // Update state for next session
    chrome.storage.local.set({
      isRunning: false,
      mode: nextMode,
      timeLeft: nextDuration,
      endTime: null
    });
  });
}

// Message Listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start") {
    startTimer();
    sendResponse({ success: true });
  } else if (message.action === "pause") {
    pauseTimer();
    sendResponse({ success: true });
  } else if (message.action === "reset") {
    resetTimer();
    sendResponse({ success: true });
  } else if (message.action === "changeMode") {
    changeMode(message.mode);
    sendResponse({ success: true });
  } else if (message.action === "setDurations") {
    setDurations(message.focusMinutes, message.breakMinutes);
    sendResponse({ success: true });
  }
  return true;
});

function startTimer() {
  getState((state) => {
    if (state.isRunning) return;

    let duration = state.timeLeft;
    // If timer was completed or reset, use full mode duration
    if (duration <= 0) {
      duration = state.mode === "focus" ? state.focusDuration : state.breakDuration;
    }

    const endTime = Date.now() + duration * 1000;

    chrome.storage.local.set({
      isRunning: true,
      timeLeft: duration,
      endTime: endTime
    }, () => {
      chrome.alarms.create("pomodoroAlarm", { when: endTime });
    });
  });
}

function pauseTimer() {
  getState((state) => {
    if (!state.isRunning) return;

    chrome.alarms.clear("pomodoroAlarm", () => {
      const timeLeft = Math.max(0, Math.round((state.endTime - Date.now()) / 1000));
      chrome.storage.local.set({
        isRunning: false,
        timeLeft: timeLeft,
        endTime: null
      });
    });
  });
}

function resetTimer() {
  getState((state) => {
    chrome.alarms.clear("pomodoroAlarm", () => {
      const duration = state.mode === "focus" ? state.focusDuration : state.breakDuration;
      chrome.storage.local.set({
        isRunning: false,
        timeLeft: duration,
        endTime: null
      });
    });
  });
}

function changeMode(newMode) {
  getState((state) => {
    chrome.alarms.clear("pomodoroAlarm", () => {
      const duration = newMode === "focus" ? state.focusDuration : state.breakDuration;
      chrome.storage.local.set({
        mode: newMode,
        isRunning: false,
        timeLeft: duration,
        endTime: null
      });
    });
  });
}

function setDurations(focusMinutes, breakMinutes) {
  getState((state) => {
    const focusDuration = focusMinutes * 60;
    const breakDuration = breakMinutes * 60;

    chrome.alarms.clear("pomodoroAlarm", () => {
      // Determine what the new timeLeft should be
      let timeLeft = state.timeLeft;
      if (!state.isRunning) {
        timeLeft = state.mode === "focus" ? focusDuration : breakDuration;
      }

      chrome.storage.local.set({
        focusDuration: focusDuration,
        breakDuration: breakDuration,
        timeLeft: timeLeft,
        isRunning: false,
        endTime: null
      });
    });
  });
}

// On startup, synchronize and verify timers
chrome.runtime.onStartup.addListener(() => {
  syncTimerOnWake();
});

// Also run sync when the extension is initialized
syncTimerOnWake();

function syncTimerOnWake() {
  getState((state) => {
    if (state.isRunning && state.endTime) {
      const now = Date.now();
      if (now >= state.endTime) {
        // Finished while asleep
        handleTimerComplete();
      } else {
        // Recreate the alarm for the remaining time
        chrome.alarms.create("pomodoroAlarm", { when: state.endTime });
      }
    }
  });
}
