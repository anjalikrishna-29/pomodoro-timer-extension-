# Premium Glassmorphic Pomodoro Focus Timer

A modern, highly aesthetic, and reliable Google Chrome extension built using **Manifest V3** to boost productivity using the Pomodoro technique.

---

## 🌟 Key Features

* **🎨 Glassmorphism & High Aesthetics**: A gorgeous dark UI featuring sleek backdrop blurs, responsive color gradients, and clean typography powered by the **Outfit** Google Font.
* **⏰ Manifest V3 Alarms Engine**: Engineered with the Chrome `alarms` API and local storage caching, guaranteeing the timer never pauses or freezes when the extension's service worker goes to sleep.
* **🔄 Frame-Perfect UI Sync**: Uses live state listeners to ensure the popup is always synchronized with the background script, even if you close and reopen the extension mid-session.
* **💚 Dynamic Modes**:
  * **Focus Mode**: Rich deep violet background with a crimson-coral glowing progress ring to help you focus.
  * **Break Mode**: Restful dark charcoal background with a minty-emerald accent to help you recharge.
* **⚙️ Inline Steppers**: Easily configure your desired focus and break intervals directly inside the extension popup.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: Vanilla HTML5 (Semantic Structure), CSS3 (Glassmorphism layout, SVG stroke animations, keyframe transitions), and JavaScript.
* **Extension Specifications**: Chrome Extension Manifest V3, Service Workers, Storage API, Alarms API, and Notifications API.

---

## 🚀 How to Install & Run Locally

1. **Clone/Download** this repository to your local machine.
2. Open Google Chrome and navigate to the extensions management panel:
   ```text
   chrome://extensions/
   ```
3. Toggle the **Developer mode** switch in the top-right corner to **On**.
4. Click the **Load unpacked** button in the top-left corner.
5. In the file picker, select this repository's folder:
   `c:\Users\HP\OneDrive\Apps\Documents\Desktop\vjcet\mini project\pomodoro extension`
6. Pin the **Pomodoro Focus Timer** from your extension menu (puzzle piece icon 🧩) onto your toolbar and click it to begin!

---

## 📝 GitHub Repository Details

* **Suggested Repository Name**: `pomodoro-timer-extension`
* **Suggested Description**: `A beautiful, state-synced, and reliable Manifest V3 Pomodoro Timer extension featuring elegant glassmorphism aesthetics and custom interval configurations.`
