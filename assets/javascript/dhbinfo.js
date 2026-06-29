// === dhbinfo.js: Dynamic Browser/System Info Panel ===
// Comprehensive, extensible, and accessible info panel for diagnostics and fun
// Refactored June 2025 for optimal maintainability, speed, and ES7+ best practices

// --- Utility: Safe Getter ---
const NA_VALUE = 'N/A';

const safeGet = (getter, fallback = NA_VALUE) => {
  try { return getter(); } catch { return fallback; }
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

let batterySnapshotPromise = null;
const getBatterySnapshot = async () => {
  if (!('getBattery' in navigator)) return null;
  if (!batterySnapshotPromise) {
    batterySnapshotPromise = navigator.getBattery()
      .then((battery) => ({
        level: Math.round(battery.level * 100),
        charging: battery.charging
      }))
      .catch(() => null)
      .finally(() => {
        // Keep readings reasonably fresh while avoiding per-row repeated calls.
        setTimeout(() => {
          batterySnapshotPromise = null;
        }, 1500);
      });
  }
  return batterySnapshotPromise;
};

// --- Utility: Formatters ---
const formatBytes = bytes => {
  if (typeof bytes !== 'number' || isNaN(bytes)) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB', 'PB'];
  let u = -1;
  do { bytes /= 1024; ++u; } while (bytes >= 1024 && u < units.length - 1);
  return `${bytes.toFixed(2)} ${units[u]}`;
};
const formatBool = v => v === true ? 'Yes' : v === false ? 'No' : 'N/A';
const formatList = arr => Array.isArray(arr) ? arr.join(', ') : String(arr);

// --- Info Map: Organized, Deduped, Extensible ---
const infoMap = [
  // --- Browser ---
  { key: 'userAgent', label: 'User Agent', desc: 'Full browser user agent string', get: () => navigator.userAgent },
  { key: 'browserName', label: 'Browser Name', desc: 'Detected browser name (major engines: Chrome, Firefox, Edge, Safari, Opera)', get: () => safeGet(() => {
    const ua = navigator.userAgent;
    if (/firefox/i.test(ua)) return 'Firefox';
    if (/edg/i.test(ua)) return 'Edge';
    if (/chrome|crios/i.test(ua)) return 'Chrome';
    if (/safari/i.test(ua)) return 'Safari';
    if (/opr|opera/i.test(ua)) return 'Opera';
    return 'Unknown';
  }) },
  { key: 'browserVersion', label: 'Browser Version', desc: 'Browser version number (major engine version)', get: () => safeGet(() => {
    const ua = navigator.userAgent;
    const match = ua.match(/(firefox|edg|chrome|crios|safari|opr|opera)[\s\/]([\d.]+)/i);
    return match ? match[2] : 'Unknown';
  }) },
  { key: 'platform', label: 'Platform', desc: 'Browser platform (OS/hardware, e.g. Win32, MacIntel, Linux x86_64)', get: () => navigator.platform },
  { key: 'language', label: 'Language', desc: 'Preferred language (IETF BCP 47 code)', get: () => navigator.language },
  { key: 'languages', label: 'Languages', desc: 'All preferred languages (ordered by priority)', get: () => formatList(navigator.languages) },
  { key: 'cookieEnabled', label: 'Cookies Enabled', desc: 'Are cookies enabled in this browser?', get: () => formatBool(navigator.cookieEnabled) },
  { key: 'online', label: 'Online', desc: 'Is the browser currently online?', get: () => formatBool(navigator.onLine) },
  { key: 'doNotTrack', label: 'Do Not Track', desc: 'User DNT (Do Not Track) preference', get: () => navigator.doNotTrack },
  // --- Device ---
  { key: 'deviceMemory', label: 'Device Memory', desc: 'Approximate RAM (GB, may be rounded)', get: () => safeGet(() => navigator.deviceMemory) },
  { key: 'hardwareConcurrency', label: 'CPU Cores', desc: 'Logical processor count (hardware concurrency)', get: () => safeGet(() => navigator.hardwareConcurrency) },
  { key: 'touchSupport', label: 'Touch Support', desc: 'Touchscreen capability (touch events or maxTouchPoints)', get: () => formatBool('ontouchstart' in window || navigator.maxTouchPoints > 0) },
  { key: 'screenRes', label: 'Screen Resolution', desc: 'Screen width × height (CSS pixels)', get: () => `${screen.width} × ${screen.height}` },
  { key: 'colorDepth', label: 'Color Depth', desc: 'Screen color depth (bits per pixel)', get: () => screen.colorDepth },
  { key: 'pixelRatio', label: 'Device Pixel Ratio', desc: 'Screen pixel density (ratio of physical to CSS pixels)', get: () => window.devicePixelRatio },
  // --- APIs & Features ---
  { key: 'serviceWorker', label: 'Service Worker', desc: 'Service Worker API supported?', get: () => formatBool('serviceWorker' in navigator) },
  { key: 'webGL', label: 'WebGL', desc: 'WebGL supported (hardware-accelerated 3D graphics)?', get: () => formatBool(!!window.WebGLRenderingContext) },
  { key: 'webRTC', label: 'WebRTC', desc: 'WebRTC supported (real-time communication)?', get: () => formatBool('RTCPeerConnection' in window) },
  { key: 'webAssembly', label: 'WebAssembly', desc: 'WebAssembly supported (native code in browser)?', get: () => formatBool(typeof WebAssembly === 'object') },
  { key: 'clipboard', label: 'Clipboard API', desc: 'Clipboard API supported (read/write clipboard)?', get: () => formatBool(!!navigator.clipboard) },
  { key: 'battery', label: 'Battery API', desc: 'Battery API supported (navigator.getBattery)?', get: () => formatBool('getBattery' in navigator) },
  { key: 'bluetooth', label: 'Bluetooth API', desc: 'Bluetooth API supported (Web Bluetooth)?', get: () => formatBool('bluetooth' in navigator) },
  { key: 'usb', label: 'USB API', desc: 'USB API supported (WebUSB)?', get: () => formatBool('usb' in navigator) },
  { key: 'nfc', label: 'NFC API', desc: 'NFC API supported (Web NFC)?', get: () => formatBool('nfc' in navigator) },
  // --- CSS/Media Features ---
  { key: 'prefersDark', label: 'Prefers Dark Mode', desc: 'User prefers dark color scheme?', get: () => formatBool(window.matchMedia('(prefers-color-scheme: dark)').matches) },
  { key: 'reducedMotion', label: 'Prefers Reduced Motion', desc: 'User prefers reduced motion?', get: () => formatBool(window.matchMedia('(prefers-reduced-motion: reduce)').matches) },
  { key: 'colorGamut', label: 'Color Gamut', desc: 'Supported color gamut', get: () => safeGet(() => {
    if (window.matchMedia('(color-gamut: rec2020)').matches) return 'rec2020';
    if (window.matchMedia('(color-gamut: p3)').matches) return 'p3';
    if (window.matchMedia('(color-gamut: srgb)').matches) return 'srgb';
    return 'Unknown';
  }) },
  { key: 'cssGrid', label: 'CSS Grid', desc: 'CSS Grid supported?', get: () => formatBool(CSS.supports('display', 'grid')) },
  { key: 'cssSubgrid', label: 'CSS Subgrid', desc: 'CSS Subgrid supported?', get: () => formatBool(CSS.supports('display', 'subgrid')) },
  { key: 'cssVariables', label: 'CSS Variables', desc: 'CSS custom properties supported?', get: () => formatBool(CSS.supports('color', 'var(--x)')) },
  // --- Storage ---
  { key: 'localStorage', label: 'Local Storage', desc: 'localStorage supported?', get: () => formatBool('localStorage' in window) },
  { key: 'sessionStorage', label: 'Session Storage', desc: 'sessionStorage supported?', get: () => formatBool('sessionStorage' in window) },
  { key: 'indexedDB', label: 'IndexedDB', desc: 'IndexedDB supported?', get: () => formatBool('indexedDB' in window) },
  { key: 'quota', label: 'Storage Quota', desc: 'Estimated storage quota', get: async () => {
    if (!navigator.storage?.estimate) return NA_VALUE;
    const estimate = await navigator.storage.estimate();
    return formatBytes(estimate?.quota);
  } },
  // --- Network ---
  { key: 'connectionType', label: 'Connection Type', desc: 'Network connection type', get: () => safeGet(() => navigator.connection ? navigator.connection.effectiveType : 'N/A') },
  { key: 'downlink', label: 'Downlink', desc: 'Estimated downlink (Mbps)', get: () => safeGet(() => navigator.connection ? navigator.connection.downlink : 'N/A') },
  { key: 'rtt', label: 'RTT', desc: 'Estimated round-trip time (ms)', get: () => safeGet(() => navigator.connection ? navigator.connection.rtt : 'N/A') },
  // --- Battery ---
  { key: 'batteryLevel', label: 'Battery Level', desc: 'Battery charge level (%)', get: async () => {
    const battery = await getBatterySnapshot();
    return battery ? `${battery.level}%` : NA_VALUE;
  } },
  { key: 'batteryCharging', label: 'Battery Charging', desc: 'Is device charging?', get: async () => {
    const battery = await getBatterySnapshot();
    return battery ? formatBool(battery.charging) : NA_VALUE;
  } },
  // --- Fun/Advanced ---
  { key: 'timezone', label: 'Timezone', desc: 'IANA timezone', get: () => Intl.DateTimeFormat().resolvedOptions().timeZone },
  { key: 'date', label: 'Date', desc: 'Current date/time', get: () => new Date().toLocaleString() },
  { key: 'mathML', label: 'MathML', desc: 'MathML supported?', get: () => formatBool('MathMLElement' in window) },
  { key: 'speechSynthesis', label: 'Speech Synthesis', desc: 'Speech Synthesis API supported?', get: () => formatBool('speechSynthesis' in window) },
  { key: 'vibrate', label: 'Vibration API', desc: 'Vibration API supported?', get: () => formatBool('vibrate' in navigator) },
  { key: 'gamepads', label: 'Gamepad Support', desc: 'Gamepad API supported?', get: () => formatBool('getGamepads' in navigator) },
  // --- Diagnostics ---
  { key: 'jsHeap', label: 'JS Heap Limit', desc: 'Max JS heap size (MB)', get: () => safeGet(() => formatBytes(performance.memory.jsHeapSizeLimit)) },
  { key: 'jsHeapUsed', label: 'JS Heap Used', desc: 'Used JS heap (MB)', get: () => safeGet(() => formatBytes(performance.memory.usedJSHeapSize)) },
  { key: 'jsHeapTotal', label: 'JS Heap Total', desc: 'Total JS heap (MB)', get: () => safeGet(() => formatBytes(performance.memory.totalJSHeapSize)) },
  { key: 'paintTiming', label: 'First Paint', desc: 'First paint timing (ms)', get: () => safeGet(() => {
    const pt = performance.getEntriesByType('paint').find(e => e.name === 'first-paint');
    return pt ? pt.startTime.toFixed(2) : 'N/A';
  }) },
  { key: 'layoutShift', label: 'Cumulative Layout Shift', desc: 'CLS metric', get: () => safeGet(() => {
    const ls = performance.getEntriesByType('layout-shift');
    return ls.length ? ls.reduce((a, e) => a + e.value, 0).toFixed(4) : 'N/A';
  }) },
 { key: 'platform', label: 'Platform', desc: 'Browser platform (OS/hardware, e.g. Win32, MacIntel, Linux x86_64)', get: () => navigator.platform },
  { key: 'language', label: 'Language', desc: 'Preferred language (IETF BCP 47 code)', get: () => navigator.language },
  { key: 'languages', label: 'Languages', desc: 'All preferred languages (ordered by priority)', get: () => formatList(navigator.languages) },
  { key: 'cookieEnabled', label: 'Cookies Enabled', desc: 'Are cookies enabled in this browser?', get: () => formatBool(navigator.cookieEnabled) },
  { key: 'online', label: 'Online', desc: 'Is the browser currently online?', get: () => formatBool(navigator.onLine) },
  { key: 'doNotTrack', label: 'Do Not Track', desc: 'User DNT (Do Not Track) preference', get: () => navigator.doNotTrack },
  { key: 'vendor', label: 'Vendor', desc: 'Browser vendor string', get: () => navigator.vendor },
  { key: 'product', label: 'Product', desc: 'Browser product string', get: () => navigator.product },
  { key: 'appName', label: 'App Name', desc: 'Browser appName property', get: () => navigator.appName },
  { key: 'appVersion', label: 'App Version', desc: 'Browser appVersion property', get: () => navigator.appVersion },
  { key: 'appCodeName', label: 'App Code Name', desc: 'Browser appCodeName property', get: () => navigator.appCodeName },
  { key: 'productSub', label: 'Product Sub', desc: 'Browser productSub property', get: () => navigator.productSub },
  { key: 'buildID', label: 'Build ID', desc: 'Browser buildID (if available)', get: () => safeGet(() => navigator.buildID) },
  { key: 'webdriver', label: 'WebDriver', desc: 'Is WebDriver automation detected?', get: () => formatBool(navigator.webdriver) },
  { key: 'maxTouchPoints', label: 'Max Touch Points', desc: 'Maximum simultaneous touch points supported', get: () => safeGet(() => navigator.maxTouchPoints) },
  { key: 'mediaDevices', label: 'Media Devices', desc: 'Media devices API supported?', get: () => formatBool(!!navigator.mediaDevices) },
  { key: 'mediaCapabilities', label: 'Media Capabilities', desc: 'Media Capabilities API supported?', get: () => formatBool(!!navigator.mediaCapabilities) },
  { key: 'mediaSession', label: 'Media Session', desc: 'Media Session API supported?', get: () => formatBool(!!navigator.mediaSession) },
  { key: 'permissions', label: 'Permissions API', desc: 'Permissions API supported?', get: () => formatBool(!!navigator.permissions) },
  { key: 'presentation', label: 'Presentation API', desc: 'Presentation API supported?', get: () => formatBool(!!navigator.presentation) },
  { key: 'registerProtocolHandler', label: 'Protocol Handler', desc: 'Can register protocol handler?', get: () => formatBool(!!navigator.registerProtocolHandler) },
  { key: 'sendBeacon', label: 'Send Beacon', desc: 'SendBeacon API supported?', get: () => formatBool(!!navigator.sendBeacon) },
  { key: 'share', label: 'Web Share API', desc: 'Web Share API supported?', get: () => formatBool(!!navigator.share) },
  { key: 'wakeLock', label: 'Wake Lock API', desc: 'Wake Lock API supported?', get: () => formatBool(!!navigator.wakeLock) },
  { key: 'xr', label: 'WebXR API', desc: 'WebXR API supported?', get: () => formatBool(!!navigator.xr) },
  { key: 'userActivation', label: 'User Activation', desc: 'User Activation API supported?', get: () => formatBool(!!navigator.userActivation) },
  { key: 'devicePosture', label: 'Device Posture', desc: 'Device Posture API supported?', get: () => formatBool(!!navigator.devicePosture) },
  { key: 'keyboard', label: 'Keyboard API', desc: 'Keyboard API supported?', get: () => formatBool(!!navigator.keyboard) },
  { key: 'hid', label: 'HID API', desc: 'HID API supported?', get: () => formatBool(!!navigator.hid) },
  { key: 'serial', label: 'Serial API', desc: 'Serial API supported?', get: () => formatBool(!!navigator.serial) },
  { key: 'mediaKeySystemAccess', label: 'Media Key System', desc: 'Media Key System API supported?', get: () => formatBool(!!window.MediaKeySystemAccess) },
  { key: 'speechRecognition', label: 'Speech Recognition', desc: 'Speech Recognition API supported?', get: () => formatBool(!!window.SpeechRecognition || !!window.webkitSpeechRecognition) },
  { key: 'speechGrammarList', label: 'Speech Grammar List', desc: 'SpeechGrammarList API supported?', get: () => formatBool(!!window.SpeechGrammarList || !!window.webkitSpeechGrammarList) },
  { key: 'speechSynthesis', label: 'Speech Synthesis', desc: 'Speech Synthesis API supported?', get: () => formatBool('speechSynthesis' in window) },
  { key: 'vibrate', label: 'Vibration API', desc: 'Vibration API supported?', get: () => formatBool('vibrate' in navigator) },
  { key: 'gamepads', label: 'Gamepad Support', desc: 'Gamepad API supported?', get: () => formatBool('getGamepads' in navigator) },
  // === Device ===
  { key: 'deviceMemory', label: 'Device Memory', desc: 'Device memory (RAM) in GB', get: () => safeGet(() => navigator.deviceMemory) },
  { key: 'hardwareConcurrency', label: 'Hardware Concurrency', desc: 'Number of logical processor cores', get: () => safeGet(() => navigator.hardwareConcurrency) },
  { key: 'battery', label: 'Battery Status', desc: 'Battery status API supported?', get: () => formatBool(!!navigator.getBattery) },
  { key: 'connection', label: 'Network Information', desc: 'Network Information API supported?', get: () => formatBool(!!navigator.connection) },
  { key: 'clocks', label: 'System Clocks', desc: 'Access to system clocks API', get: () => formatBool(!!window.performance && !!window.performance.now) },
  { key: 'deviceOrientation', label: 'Device Orientation', desc: 'Device Orientation API supported?', get: () => formatBool(!!window.DeviceOrientationEvent) },
  { key: 'deviceMotion', label: 'Device Motion', desc: 'Device Motion API supported?', get: () => formatBool(!!window.DeviceMotionEvent) },
  { key: 'ambientLight', label: 'Ambient Light Sensor', desc: 'Ambient Light Sensor API supported?', get: () => formatBool(!!window.AmbientLightSensor) },
  { key: 'proximity', label: 'Proximity Sensor', desc: 'Proximity Sensor API supported?', get: () => formatBool(!!window.ProximitySensor) },
  { key: 'accelerometer', label: 'Accelerometer', desc: 'Accelerometer API supported?', get: () => formatBool(!!window.Accelerometer) },
  { key: 'gyroscope', label: 'Gyroscope', desc: 'Gyroscope API supported?', get: () => formatBool(!!window.Gyroscope) },
  { key: 'magnetometer', label: 'Magnetometer', desc: 'Magnetometer API supported?', get: () => formatBool(!!window.Magnetometer) },
  { key: 'userGesture', label: 'User Gesture', desc: 'User Gesture API supported?', get: () => formatBool(!!window.UserGesture) },
  { key: 'nfc', label: 'NFC', desc: 'NFC API supported?', get: () => formatBool(!!window.NFC) },
  { key: 'bluetooth', label: 'Bluetooth', desc: 'Bluetooth API supported?', get: () => formatBool(!!window.Bluetooth) },
  { key: 'usb', label: 'USB', desc: 'WebUSB API supported?', get: () => formatBool(!!navigator.usb) },
  { key: 'serialPort', label: 'Serial Port', desc: 'Web Serial API supported?', get: () => formatBool(!!navigator.serial) },
  { key: 'hidDevice', label: 'HID Device', desc: 'Web HID API supported?', get: () => formatBool(!!navigator.hid) },
  { key: 'vibration', label: 'Vibration', desc: 'Vibration API supported?', get: () => formatBool(!!navigator.vibrate) },
  { key: 'clipboard', label: 'Clipboard', desc: 'Clipboard API supported?', get: () => formatBool(!!navigator.clipboard) },
  { key: 'storage', label: 'Storage', desc: 'Storage API supported?', get: () => formatBool(!!navigator.storage) },
  { key: 'indexedDB', label: 'IndexedDB', desc: 'IndexedDB API supported?', get: () => formatBool(!!window.indexedDB) },
  { key: 'openDatabase', label: 'Web SQL Database', desc: 'Web SQL Database API supported?', get: () => formatBool(!!window.openDatabase) },
  { key: 'fileSystem', label: 'File System Access', desc: 'File System Access API supported?', get: () => formatBool(!!window.showOpenFilePicker) },
  { key: 'mediaDevices', label: 'Media Devices', desc: 'Media Devices API supported?', get: () => formatBool(!!navigator.mediaDevices) },
  { key: 'pictureInPicture', label: 'Picture-in-Picture', desc: 'Picture-in-Picture API supported?', get: () => formatBool(!!document.pictureInPictureEnabled) },
  { key: 'fullScreen', label: 'Full Screen', desc: 'Full Screen API supported?', get: () => formatBool(!!document.fullscreenEnabled) },
  { key: 'webShare', label: 'Web Share', desc: 'Web Share API supported?', get: () => formatBool(!!navigator.share) },
  { key: 'webPush', label: 'Web Push', desc: 'Web Push API supported?', get: () => formatBool(!!window.PushManager) },
  { key: 'webNotifications', label: 'Web Notifications', desc: 'Web Notifications API supported?', get: () => formatBool(!!window.Notification) },
  { key: 'backgroundSync', label: 'Background Sync', desc: 'Background Sync API supported?', get: () => formatBool(!!window.SyncManager) },
  { key: 'periodicSync', label: 'Periodic Sync', desc: 'Periodic Sync API supported?', get: () => formatBool(!!window.PeriodicSyncManager) },
  { key: 'credentialManagement', label: 'Credential Management', desc: 'Credential Management API supported?', get: () => formatBool(!!window.PasswordCredential) },
  { key: 'paymentRequest', label: 'Payment Request', desc: 'Payment Request API supported?', get: () => formatBool(!!window.PaymentRequest) },
  { key: 'serviceWorker', label: 'Service Worker', desc: 'Service Worker API supported?', get: () => formatBool('serviceWorker' in navigator) },
  { key: 'cache', label: 'Cache Storage', desc: 'Cache Storage API supported?', get: () => formatBool(!!caches) },
  { key: 'fetch', label: 'Fetch API', desc: 'Fetch API supported?', get: () => formatBool(!!window.fetch) },
  { key: 'xmlHttpRequest', label: 'XMLHttpRequest', desc: 'XMLHttpRequest Level 2 supported?', get: () => formatBool(!!window.XMLHttpRequest && 'withCredentials' in new XMLHttpRequest) },
  { key: 'eventSource', label: 'EventSource', desc: 'EventSource API supported?', get: () => formatBool(!!window.EventSource) },
  { key: 'webRTC', label: 'WebRTC', desc: 'WebRTC API supported?', get: () => formatBool(!!window.RTCPeerConnection) },
  { key: 'webSockets', label: 'WebSockets', desc: 'WebSockets API supported?', get: () => formatBool(!!window.WebSocket) },
  { key: 'broadcastChannel', label: 'Broadcast Channel', desc: 'Broadcast Channel API supported?', get: () => formatBool(!!window.BroadcastChannel) },
  { key: 'linkRelation', label: 'Link Relation', desc: 'Link Relation API supported?', get: () => formatBool(!!document.createElement('link').relList) },
  { key: 'metaThemeColor', label: 'Meta Theme Color', desc: 'Meta theme color support', get: () => formatBool(!!document.querySelector('meta[name="theme-color"]')) },
  { key: 'prefersColorScheme', label: 'Prefers Color Scheme', desc: 'Prefers Color Scheme media feature', get: () => formatBool(window.matchMedia && window.matchMedia('(prefers-color-scheme)').media !== 'not all') },
  { key: 'prefersReducedMotion', label: 'Prefers Reduced Motion', desc: 'Prefers Reduced Motion media feature', get: () => formatBool(window.matchMedia && window.matchMedia('(prefers-reduced-motion)').media !== 'not all') },
  { key: 'prefersContrast', label: 'Prefers Contrast', desc: 'Prefers Contrast media feature', get: () => formatBool(window.matchMedia && window.matchMedia('(prefers-contrast)').media !== 'not all') },
  { key: 'forcedColors', label: 'Forced Colors', desc: 'Forced Colors media feature', get: () => formatBool(window.matchMedia && window.matchMedia('(forced-colors)').media !== 'not all') },
  { key: 'hover', label: 'Hover Support', desc: 'Hover media feature', get: () => formatBool(window.matchMedia && window.matchMedia('(hover)').media !== 'not all') },
  { key: 'pointer', label: 'Pointer Support', desc: 'Pointer media feature', get: () => formatBool(window.matchMedia && window.matchMedia('(pointer)').media !== 'not all') },
  { key: 'reducedMotion', label: 'Reduced Motion', desc: 'Reduced Motion media feature', get: () => formatBool(window.matchMedia && window.matchMedia('(reduced-motion)').media !== 'not all') },
  { key: 'contrast', label: 'Color Contrast', desc: 'Color Contrast media feature', get: () => formatBool(window.matchMedia && window.matchMedia('(contrast)').media !== 'not all') },
  { key: 'aspectRatio', label: 'Aspect Ratio', desc: 'Aspect Ratio media feature', get: () => formatBool(window.matchMedia && window.matchMedia('(aspect-ratio)').media !== 'not all') },
  { key: 'resolution', label: 'Screen Resolution', desc: 'Screen Resolution media feature', get: () => formatBool(window.matchMedia && window.matchMedia('(resolution)').media !== 'not all') },
  { key: 'scan', label: 'Scan', desc: 'Scan media feature', get: () => formatBool(window.matchMedia && window.matchMedia('(scan)').media !== 'not all') },
  { key: 'grid', label: 'Grid', desc: 'Grid media feature', get: () => formatBool(window.matchMedia && window.matchMedia('(grid)').media !== 'not all') },
  { key: 'updateViaCache', label: 'Update via Cache', desc: 'Update via Cache HTTP header', get: () => formatBool(!!window.caches && 'update' in window.caches) },
  { key: 'crossOriginIsolated', label: 'Cross-Origin Isolated', desc: 'Is the document cross-origin isolated?', get: () => formatBool(window.isSecureContext && window.crossOriginIsolated) },
  { key: 'hasStorageAccess', label: 'Storage Access', desc: 'Has Storage Access API?', get: () => formatBool(!!document.hasStorageAccess) },
  { key: 'localization', label: 'Localization', desc: 'Localization API supported?', get: () => formatBool(!!navigator.languages) },
  { key: 'paymentHandler', label: 'Payment Handler', desc: 'Payment Handler API supported?', get: () => formatBool(!!navigator.paymentHandler) },
  { key: 'urlMarshalling', label: 'URL Marshalling', desc: 'URL Marshalling API supported?', get: () => formatBool(!!window.URLPattern) },
  { key: 'trustedTypes', label: 'Trusted Types', desc: 'Trusted Types API supported?', get: () => formatBool(!!window.TrustedTypePolicy) },
  { key: 'contentSecurityPolicy', label: 'Content Security Policy', desc: 'Content Security Policy (CSP) support', get: () => formatBool(!!window.Policy) },
  { key: 'nativeFileSystem', label: 'Native File System', desc: 'Native File System API supported?', get: () => formatBool(!!window.showOpenFilePicker) },
  { key: 'fileSystemAccess', label: 'File System Access', desc: 'File System Access API supported?', get: () => formatBool(!!window.showOpenFilePicker) },
  { key: 'fileReader', label: 'File Reader', desc: 'File Reader API supported?', get: () => formatBool(!!window.FileReader) },
  { key: 'fileWriter', label: 'File Writer', desc: 'File Writer API supported?', get: () => formatBool(!!window.FileWriter) },
  { key: 'fileHandle', label: 'File Handle', desc: 'File Handle API supported?', get: () => formatBool(!!window.FileHandle) },
  { key: 'fileSystemDirectoryEntry', label: 'File System Directory Entry', desc: 'File System Directory Entry API supported?', get: () => formatBool(!!window.FileSystemDirectoryEntry) },
  { key: 'fileSystemFileEntry', label: 'File System File Entry', desc: 'File System File Entry API supported?', get: () => formatBool(!!window.FileSystemFileEntry) },
  { key: 'fileSystemHandle', label: 'File System Handle', desc: 'File System Handle API supported?', get: () => formatBool(!!window.FileSystemHandle) },
  { key: 'fileSystemWritableFileStream', label: 'File System Writable File Stream', desc: 'File System Writable File Stream API supported?', get: () => formatBool(!!window.FileSystemWritableFileStream) },
  { key: 'fileSystemReadableFileStream', label: 'File System Readable File Stream', desc: 'File System Readable File Stream API supported?', get: () => formatBool(!!window.FileSystemReadableFileStream) },
  { key: 'fileSystemSyncAccessHandle', label: 'File System Sync Access Handle', desc: 'File System Sync Access Handle API supported?', get: () => formatBool(!!window.FileSystemSyncAccessHandle) },
  { key: 'fileSystemDirectoryHandle', label: 'File System Directory Handle', desc: 'File System Directory Handle API supported?', get: () => formatBool(!!window.FileSystemDirectoryHandle) },
  { key: 'fileSystemFileHandle', label: 'File System File Handle', desc: 'File System File Handle API supported?', get: () => formatBool(!!window.FileSystemFileHandle) },
  { key: 'fileSystemHandleType', label: 'File System Handle Type', desc: 'File System Handle Type API supported?', get: () => formatBool(!!window.FileSystemHandleType) },
  { key: 'fileSystemWritableStream', label: 'File System Writable Stream', desc: 'File System Writable Stream API supported?', get: () => formatBool(!!window.FileSystemWritableStream) },
  { key: 'fileSystemReadableStream', label: 'File System Readable Stream', desc: 'File System Readable Stream API supported?', get: () => formatBool(!!window.FileSystemReadableStream) },
  { key: 'fileSystemSyncAccessStream', label: 'File System Sync Access Stream', desc: 'File System Sync Access Stream API supported?', get: () => formatBool(!!window.FileSystemSyncAccessStream) },
  { key: 'fileSystemDirectoryStream', label: 'File System Directory Stream', desc: 'File System Directory Stream API supported?', get: () => formatBool(!!window.FileSystemDirectoryStream) },
  { key: 'fileSystemFileStream', label: 'File System File Stream', desc: 'File System File Stream API supported?', get: () => formatBool(!!window.FileSystemFileStream) },
  { key: 'fileSystemHandleStream', label: 'File System Handle Stream', desc: 'File System Handle Stream API supported?', get: () => formatBool(!!window.FileSystemHandleStream) },
  { key: 'fileSystemWritableFileStreamDefault', label: 'File System Writable File Stream (Default)', desc: 'File System Writable File Stream (Default) API supported?', get: () => formatBool(!!window.FileSystemWritableFileStreamDefault) },
  { key: 'fileSystemReadableFileStreamDefault', label: 'File System Readable File Stream (Default)', desc: 'File System Readable File Stream (Default) API supported?', get: () => formatBool(!!window.FileSystemReadableFileStreamDefault) },
  { key: 'fileSystemSyncAccessHandleDefault', label: 'File System Sync Access Handle (Default)', desc: 'File System Sync Access Handle (Default) API supported?', get: () => formatBool(!!window.FileSystemSyncAccessHandleDefault) },
  { key: 'fileSystemDirectoryHandleDefault', label: 'File System Directory Handle (Default)', desc: 'File System Directory Handle (Default) API supported?', get: () => formatBool(!!window.FileSystemDirectoryHandleDefault) },
  { key: 'fileSystemFileHandleDefault', label: 'File System File Handle (Default)', desc: 'File System File Handle (Default) API supported?', get: () => formatBool(!!window.FileSystemFileHandleDefault) },
  { key: 'fileSystemHandleTypeDefault', label: 'File System Handle Type (Default)', desc: 'File System Handle Type (Default) API supported?', get: () => formatBool(!!window.FileSystemHandleTypeDefault) },
  { key: 'fileSystemWritableStreamDefault', label: 'File System Writable Stream (Default)', desc: 'File System Writable Stream (Default) API supported?', get: () => formatBool(!!window.FileSystemWritableStreamDefault) },
  { key: 'fileSystemReadableStreamDefault', label: 'File System Readable Stream (Default)', desc: 'File System Readable Stream (Default) API supported?', get: () => formatBool(!!window.FileSystemReadableStreamDefault) },
  { key: 'fileSystemSyncAccessStreamDefault', label: 'File System Sync Access Stream (Default)', desc: 'File System Sync Access Stream (Default) API supported?', get: () => formatBool(!!window.FileSystemSyncAccessStreamDefault) },
  { key: 'fileSystemDirectoryStreamDefault', label: 'File System Directory Stream (Default)', desc: 'File System Directory Stream (Default) API supported?', get: () => formatBool(!!window.FileSystemDirectoryStreamDefault) },
  { key: 'fileSystemFileStreamDefault', label: 'File System File Stream (Default)', desc: 'File System File Stream (Default) API supported?', get: () => formatBool(!!window.FileSystemFileStreamDefault) },
  { key: 'fileSystemHandleStreamDefault', label: 'File System Handle Stream (Default)', desc: 'File System Handle Stream (Default) API supported?', get: () => formatBool(!!window.FileSystemHandleStreamDefault) },
  // === Environment ===
  { key: 'nodeVersion', label: 'Node.js Version', desc: 'Node.js version (if running in Node.js environment)', get: () => safeGet(() => process.versions.node) },
  { key: 'npmVersion', label: 'npm Version', desc: 'npm version (if running in Node.js environment)', get: () => safeGet(() => process.versions.npm) },
  { key: 'yarnVersion', label: 'Yarn Version', desc: 'Yarn version (if running in Node.js environment)', get: () => safeGet(() => process.versions.yarn) },
  {
    key: 'os', label: 'Operating System', desc: 'Operating system name and version', get: () => safeGet(() => {
      const { platform, release, version } = process.getSystemVersion();
      return `${platform} ${release} (${version})`;
    })
  },
  { key: 'arch', label: 'Architecture', desc: 'CPU architecture', get: () => safeGet(() => process.arch) },
  { key: 'env', label: 'Environment Variables', desc: 'Environment variables', get: () => safeGet(() => JSON.stringify(process.env, null, 2)) },
  { key: 'cwd', label: 'Current Working Directory', desc: 'Current working directory', get: () => safeGet(() => process.cwd()) },
  { key: 'homeDir', label: 'Home Directory', desc: 'User home directory', get: () => safeGet(() => require('os').homedir()) },
  { key: 'tempDir', label: 'Temporary Directory', desc: 'Temporary directory', get: () => safeGet(() => require('os').tmpdir()) },
  { key: 'pathSeparator', label: 'Path Separator', desc: 'Path separator character', get: () => safeGet(() => require('path').sep) },
  { key: 'pathDelimiter', label: 'Path Delimiter', desc: 'Path delimiter character', get: () => safeGet(() => require('path').delimiter) },
  {
    key: 'fileURLToPath', label: 'File URL to Path', desc: 'File URL to Path conversion', get: () => safeGet(() => {
      const { fileURLToPath } = require('url');
      return fileURLToPath('file://' + __filename);
    })
  },
  {
    key: 'pathToFileURL', label: 'Path to File URL', desc: 'Path to File URL conversion', get: () => safeGet(() => {
      const { pathToFileURL } = require('url');
      return pathToFileURL(__filename).href;
    })
  },
  {
    key: 'module', label: 'Module', desc: 'Module information', get: () => safeGet(() => {
      const { id, filename, loaded } = module;
      return `ID: ${id}, Filename: ${filename}, Loaded: ${loaded}`;
    })
  },
  { key: 'isMain', label: 'Is Main Module', desc: 'Is this the main module?', get: () => safeGet(() => require.main === module) },
  { key: 'debugPort', label: 'Debug Port', desc: 'Debugging port (if running in debug mode)', get: () => safeGet(() => process.debugPort) },
  { key: 'inspectPort', label: 'Inspect Port', desc: 'Inspect port (if running in inspect mode)', get: () => safeGet(() => process.inspectPort) },
  { key: 'execPath', label: 'Executable Path', desc: 'Path to the Node.js executable', get: () => safeGet(() => process.execPath) },
  { key: 'version', label: 'Version', desc: 'Node.js version', get: () => safeGet(() => process.version) },
  { key: 'versions', label: 'Versions', desc: 'Node.js versions', get: () => safeGet(() => JSON.stringify(process.versions, null, 2)) },
  { key: 'release', label: 'Release', desc: 'Node.js release information', get: () => safeGet(() => process.release) },
  { key: 'config', label: 'Configuration', desc: 'Node.js configuration', get: () => safeGet(() => JSON.stringify(process.config, null, 2)) },
  { key: 'memoryUsage', label: 'Memory Usage', desc: 'Memory usage statistics', get: () => safeGet(() => JSON.stringify(process.memoryUsage(), null, 2)) },
  { key: 'cpuUsage', label: 'CPU Usage', desc: 'CPU usage statistics', get: () => safeGet(() => JSON.stringify(process.cpuUsage(), null, 2)) },
  { key: 'upTime', label: 'Uptime', desc: 'System uptime in seconds', get: () => safeGet(() => process.uptime()) },
  { key: 'loadavg', label: 'Load Average', desc: 'System load average', get: () => safeGet(() => JSON.stringify(require('os').loadavg(), null, 2)) },
  { key: 'networkInterfaces', label: 'Network Interfaces', desc: 'Network interfaces', get: () => safeGet(() => JSON.stringify(require('os').networkInterfaces(), null, 2)) },
    { id: "lastupdate", label: "Last page update", description: "The last time this page was modified on the server.", value: () => safe(() => document.lastModified) },
  { id: "dhbinfo", label: "Page hostname", description: "The domain name of the current page.", value: () => safe(() => window.location.hostname) },
  { id: "dhbinfo2", label: "Full URL", description: "The full URL of the current page.", value: () => safe(() => window.location.href) },
  { id: "dhbinfo3", label: "Page path", description: "The path portion of the URL.", value: () => safe(() => window.location.pathname) },
  { id: "dhbinfo4", label: "Protocol", description: "The protocol used (http, https, etc).", value: () => safe(() => window.location.protocol) },
  { id: "dhbinfo5", label: "Cookies enabled", description: "Whether cookies are enabled in your browser.", value: () => yesNo(safe(() => navigator.cookieEnabled)) },
  { id: "dhbinfo6", label: "Page title", description: "The title of the current page.", value: () => safe(() => document.title) },
  { id: "dhbinfo7", label: "Referrer", description: "The URL of the previous page (if any).", value: () => safe(() => document.referrer || 'None') },
  { id: "dhbinfo8", label: "Charset", description: "The character encoding of the page.", value: () => safe(() => document.characterSet || document.charset) },
  { id: "dhbinfo9", label: "Viewport", description: "The viewport meta tag content.", value: () => safe(() => document.querySelector("meta[name='viewport']")?.content || 'None') },
  { id: "dhbinfo10", label: "Description", description: "The meta description of the page.", value: () => safe(() => document.querySelector("meta[name='description']")?.content || 'None') },
  { id: "dhbinfo11", label: "Keywords", description: "The meta keywords of the page.", value: () => safe(() => document.querySelector("meta[name='keywords']")?.content || 'None') },
  { id: "dhbinfo12", label: "Canonical link", description: "The canonical link for SEO.", value: () => safe(() => document.querySelector("link[rel='canonical']")?.href || 'None') },
  { id: "dhbinfo13", label: "Favicon", description: "The favicon URL.", value: () => safe(() => document.querySelector("link[rel='icon']")?.href || 'None') },
  { id: "dhbinfo14", label: "Page language", description: "The language of the page.", value: () => safe(() => document.documentElement.lang || navigator.language) },

  // === Browser/Platform ===
  { id: "dhbinfo15", label: "Browser name", description: "The name of your browser.", value: () => safe(() => navigator.appName) },
  { id: "dhbinfo16", label: "Browser version", description: "The version string of your browser.", value: () => safe(() => navigator.appVersion) },
  { id: "dhbinfo17", label: "User agent", description: "The user agent string sent by your browser.", value: () => safe(() => navigator.userAgent) },
  { id: "dhbinfo18", label: "Platform", description: "The platform your browser is running on.", value: () => safe(() => navigator.platform) },
  { id: "dhbinfo19", label: "Languages", description: "Your preferred languages.", value: () => safe(() => navigator.languages?.join(', ') || navigator.language) },
  { id: "dhbinfo20", label: "Online", description: "Whether your browser is online.", value: () => yesNo(safe(() => navigator.onLine)) },
  { id: "dhbinfo21", label: "Do Not Track", description: "Your browser's Do Not Track setting.", value: () => safe(() => navigator.doNotTrack) },
  { id: "dhbinfo22", label: "Java enabled", description: "Whether Java is enabled in your browser.", value: () => yesNo(safe(() => navigator.javaEnabled?.())) },
  { id: "dhbinfo23", label: "CPU threads", description: "Number of logical CPU threads.", value: () => safe(() => navigator.hardwareConcurrency) },
  { id: "dhbinfo24", label: "Device memory (GB)", description: "Approximate device memory in GB.", value: () => safe(() => navigator.deviceMemory) },
  { id: "dhbinfo25", label: "Max touch points", description: "Maximum number of simultaneous touch points.", value: () => safe(() => navigator.maxTouchPoints) },
  { id: "dhbinfo26", label: "Vendor", description: "Browser vendor string.", value: () => safe(() => navigator.vendor) },
  { id: "dhbinfo27", label: "ProductSub", description: "Browser productSub string.", value: () => safe(() => navigator.productSub) },
  { id: "dhbinfo28", label: "VendorSub", description: "Browser vendorSub string.", value: () => safe(() => navigator.vendorSub) },
  { id: "dhbinfo29", label: "Webdriver (automation)", description: "Is the browser under automation control?", value: () => yesNo(safe(() => navigator.webdriver)) },
  { id: "dhbinfo30", label: "Browser build ID", description: "Browser build identifier (if available).", value: () => safe(() => navigator.buildID || 'N/A') },
  { id: "dhbinfo31", label: "Browser product", description: "Browser product string.", value: () => safe(() => navigator.product) },
  { id: "dhbinfo32", label: "Browser user agent data", description: "Structured user agent data (if supported).", value: () => safe(() => JSON.stringify(navigator.userAgentData || {}, null, 2)) },

  // === Network/Connection ===
  { id: "dhbinfo33", label: "Connection type", description: "Type of network connection (if supported).", value: () => safe(() => navigator.connection?.type || 'N/A') },
  { id: "dhbinfo34", label: "Effective connection type", description: "Effective network connection type (if supported).", value: () => safe(() => navigator.connection?.effectiveType || 'N/A') },
  { id: "dhbinfo35", label: "Downlink (Mbps)", description: "Estimated effective bandwidth in megabits per second.", value: () => safe(() => navigator.connection?.downlink || 'N/A') },
  { id: "dhbinfo36", label: "RTT (ms)", description: "Estimated effective round-trip time of the current connection.", value: () => safe(() => navigator.connection?.rtt || 'N/A') },
  { id: "dhbinfo37", label: "Save data mode", description: "Is save-data mode enabled?", value: () => yesNo(safe(() => navigator.connection?.saveData)) },
  { id: "dhbinfo38", label: "Network information", description: "Detailed network information (if supported).", value: () => safe(() => JSON.stringify(navigator.connection || {}, null, 2)) },
  { id: "dhbinfo39", label: "Network downlink max (Mbps)", description: "Maximum downlink speed in megabits per second (if supported).", value: () => safe(() => navigator.connection?.downlinkMax || 'N/A') },
  { id: "dhbinfo40", label: "Network latency (ms)", description: "Estimated network latency in milliseconds (if supported).", value: () => safe(() => navigator.connection?.latency || 'N/A') },
  { id: "dhbinfo41", label: "Network effective bandwidth (Mbps)", description: "Estimated effective bandwidth in megabits per second (if supported).", value: () => safe(() => navigator.connection?.bandwidth || 'N/A') },
  { id: "dhbinfo42", label: "Network downlink speed (Mbps)", description: "Estimated downlink speed in megabits per second (if supported).", value: () => safe(() => navigator.connection?.downlinkSpeed || 'N/A') },
  { id: "dhbinfo43", label: "Network up link speed (Mbps)", description: "Estimated uplink speed in megabits per second (if supported).", value: () => safe(() => navigator.connection?.upLinkSpeed || 'N/A') },
  { id: "dhbinfo44", label: "Network connection save data mode", description: "Is save-data mode enabled for the network connection?", value: () => yesNo(safe(() => navigator.connection?.saveData)) },
  { id: "dhbinfo45", label: "Network connection type", description: "Type of network connection (if supported).", value: () => safe(() => navigator.connection?.type || 'N/A') },
  { id: "dhbinfo46", label: "Network connection effective type", description: "Effective network connection type (if supported).", value: () => safe(() => navigator.connection?.effectiveType || 'N/A') },
  { id: "dhbinfo47", label: "Network connection downlink", description: "Estimated effective bandwidth in megabits per second (if supported).", value: () => safe(() => navigator.connection?.downlink || 'N/A') },

  // === Battery ===
  { id: "dhbinfo38", label: "Battery charging", description: "Is the device charging? (if supported)", value: () => safe(() => navigator.getBattery ? navigator.getBattery().then(b => yesNo(b.charging)) : 'N/A') },
  { id: "dhbinfo39", label: "Battery level", description: "Battery level as a percentage (if supported).", value: () => safe(() => navigator.getBattery ? navigator.getBattery().then(b => `${Math.round(b.level * 100)}%`) : 'N/A') },
  { id: "dhbinfo40", label: "Battery charging time", description: "Time remaining to full charge in seconds (if supported).", value: () => safe(() => navigator.getBattery ? navigator.getBattery().then(b => b.chargingTime) : 'N/A') },
  { id: "dhbinfo41", label: "Battery discharging time", description: "Time remaining to discharge in seconds (if supported).", value: () => safe(() => navigator.getBattery ? navigator.getBattery().then(b => b.dischargingTime) : 'N/A') },

  // === Screen/Window ===
  { id: "dhbinfo42", label: "Screen resolution", description: "Screen width x height in pixels.", value: () => `${safe(() => screen.width)} x ${safe(() => screen.height)}` },
  { id: "dhbinfo43", label: "Available screen size", description: "Available screen width x height.", value: () => `${safe(() => screen.availWidth)} x ${safe(() => screen.availHeight)}` },
  { id: "dhbinfo44", label: "Color depth", description: "Number of bits used to display one color.", value: () => safe(() => screen.colorDepth) },
  { id: "dhbinfo45", label: "Pixel depth", description: "Number of bits per pixel.", value: () => safe(() => screen.pixelDepth) },
  { id: "dhbinfo46", label: "Device pixel ratio", description: "Ratio of physical to CSS pixels.", value: () => safe(() => window.devicePixelRatio) },
  { id: "dhbinfo47", label: "Window outer size", description: "Browser window outer width x height.", value: () => `${safe(() => window.outerWidth)} x ${safe(() => window.outerHeight)}` },
  { id: "dhbinfo48", label: "Window inner size", description: "Browser window inner width x height.", value: () => `${safe(() => window.innerWidth)} x ${safe(() => window.innerHeight)}` },
  { id: "dhbinfo49", label: "Page zoom (if supported)", description: "Current zoom level.", value: () => safe(() => document.body?.style.zoom || '1') },
  { id: "dhbinfo50", label: "Scroll position", description: "Current scroll X, Y.", value: () => `${safe(() => window.scrollX)}, ${safe(() => window.scrollY)}` },

  // === Permissions/Capabilities ===
  { id: "dhbinfo51", label: "Permissions API", description: "Is the Permissions API supported?", value: () => yesNo(safe(() => !!navigator.permissions)) },
  { id: "dhbinfo52", label: "Clipboard API", description: "Is the Clipboard API supported?", value: () => yesNo(safe(() => !!navigator.clipboard)) },
  { id: "dhbinfo53", label: "Geolocation API", description: "Is the Geolocation API supported?", value: () => yesNo(safe(() => !!navigator.geolocation)) },
  { id: "dhbinfo54", label: "Vibration API", description: "Is the Vibration API supported?", value: () => yesNo(safe(() => 'vibrate' in navigator)) },
  { id: "dhbinfo55", label: "Pointer events", description: "Are pointer events supported?", value: () => yesNo(safe(() => 'onpointerdown' in window)) },
  { id: "dhbinfo56", label: "Touch events", description: "Are touch events supported?", value: () => yesNo(safe(() => 'ontouchstart' in window)) },
  { id: "dhbinfo57", label: "Speech synthesis", description: "Is the Speech Synthesis API supported?", value: () => yesNo(safe(() => 'speechSynthesis' in window)) },
  { id: "dhbinfo58", label: "Speech recognition", description: "Is the Speech Recognition API supported?", value: () => yesNo(safe(() => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) },
  { id: "dhbinfo59", label: "Gamepad API", description: "Is the Gamepad API supported?", value: () => yesNo(safe(() => 'getGamepads' in navigator)) },
  { id: "dhbinfo60", label: "Battery API", description: "Is the Battery API supported?", value: () => yesNo(safe(() => 'getBattery' in navigator)) },
  { id: "dhbinfo61", label: "Media devices", description: "Are media devices supported?", value: () => yesNo(safe(() => 'mediaDevices' in navigator)) },
  { id: "dhbinfo62", label: "WebGL supported", description: "Is WebGL supported?", value: () => yesNo(safe(() => !!window.WebGLRenderingContext)) },
  { id: "dhbinfo63", label: "WebAssembly supported", description: "Is WebAssembly supported?", value: () => yesNo(safe(() => !!window.WebAssembly)) },
  { id: "dhbinfo64", label: "IndexedDB supported", description: "Is IndexedDB supported?", value: () => yesNo(safe(() => !!window.indexedDB)) },
  { id: "dhbinfo65", label: "LocalStorage supported", description: "Is LocalStorage supported?", value: () => yesNo(safe(() => !!window.localStorage)) },
  { id: "dhbinfo66", label: "SessionStorage supported", description: "Is SessionStorage supported?", value: () => yesNo(safe(() => !!window.sessionStorage)) },
  { id: "dhbinfo67", label: "ServiceWorker supported", description: "Is ServiceWorker supported?", value: () => yesNo(safe(() => 'serviceWorker' in navigator)) },
  { id: "dhbinfo68", label: "Notification API", description: "Is the Notification API supported?", value: () => yesNo(safe(() => 'Notification' in window)) },
  { id: "dhbinfo69", label: "Performance API", description: "Is the Performance API supported?", value: () => yesNo(safe(() => 'performance' in window)) },
  { id: "dhbinfo70", label: "WebSocket supported", description: "Is WebSocket supported?", value: () => yesNo(safe(() => 'WebSocket' in window)) },
  { id: "dhbinfo71", label: "History API", description: "Is the History API supported?", value: () => yesNo(safe(() => 'history' in window)) },
  { id: "dhbinfo72", label: "URL API", description: "Is the URL API supported?", value: () => yesNo(safe(() => 'URL' in window)) },
  { id: "dhbinfo73", label: "DOMParser supported", description: "Is DOMParser supported?", value: () => yesNo(safe(() => 'DOMParser' in window)) },
  { id: "dhbinfo74", label: "MutationObserver supported", description: "Is MutationObserver supported?", value: () => yesNo(safe(() => 'MutationObserver' in window)) },
  { id: "dhbinfo75", label: "Shadow DOM supported", description: "Is Shadow DOM supported?", value: () => yesNo(safe(() => 'ShadowRoot' in window)) },
  { id: "dhbinfo76", label: "Custom Elements supported", description: "Are Custom Elements supported?", value: () => yesNo(safe(() => 'customElements' in window)) },
  { id: "dhbinfo77", label: "MathML supported", description: "Is MathML supported?", value: () => yesNo(safe(() => 'MathMLElement' in window)) },
  { id: "dhbinfo78", label: "SVG supported", description: "Is SVG supported?", value: () => yesNo(safe(() => 'SVGElement' in window)) },
  { id: "dhbinfo79", label: "HTMLCollection supported", description: "Is HTMLCollection supported?", value: () => yesNo(safe(() => 'HTMLCollection' in window)) },
  { id: "dhbinfo80", label: "NodeList supported", description: "Is NodeList supported?", value: () => yesNo(safe(() => 'NodeList' in window)) },
  { id: "dhbinfo81", label: "Element supported", description: "Is Element supported?", value: () => yesNo(safe(() => 'Element' in window)) },
  { id: "dhbinfo82", label: "Document supported", description: "Is Document supported?", value: () => yesNo(safe(() => 'Document' in window)) },
  { id: "dhbinfo83", label: "Window supported", description: "Is Window supported?", value: () => yesNo(safe(() => 'Window' in window)) },
  { id: "dhbinfo84", label: "HTMLDocument supported", description: "Is HTMLDocument supported?", value: () => yesNo(safe(() => 'HTMLDocument' in window)) },

  // === CSS Features ===
  { id: "dhbinfo85", label: "Browser has CSSStyleSheet", description: "Does the browser support CSSStyleSheet?", value: () => yesNo(safe(() => 'CSSStyleSheet' in window)) },
  { id: "dhbinfo86", label: "Browser has CSSRule", description: "Does the browser support CSSRule?", value: () => yesNo(safe(() => 'CSSRule' in window)) },
  { id: "dhbinfo87", label: "Browser has CSSStyleDeclaration", description: "Does the browser support CSSStyleDeclaration?", value: () => yesNo(safe(() => 'CSSStyleDeclaration' in window)) },
  { id: "dhbinfo88", label: "Browser has CSSMediaRule", description: "Does the browser support CSSMediaRule?", value: () => yesNo(safe(() => 'CSSMediaRule' in window)) },
  { id: "dhbinfo89", label: "Browser has CSSStyleRule", description: "Does the browser support CSSStyleRule?", value: () => yesNo(safe(() => 'CSSStyleRule' in window)) },
  { id: "dhbinfo90", label: "Browser has CSSFontFaceRule", description: "Does the browser support CSSFontFaceRule?", value: () => yesNo(safe(() => 'CSSFontFaceRule' in window)) },
  { id: "dhbinfo91", label: "Browser has CSSKeyframesRule", description: "Does the browser support CSSKeyframesRule?", value: () => yesNo(safe(() => 'CSSKeyframesRule' in window)) },
  { id: "dhbinfo92", label: "Browser has CSSKeyframeRule", description: "Does the browser support CSSKeyframeRule?", value: () => yesNo(safe(() => 'CSSKeyframeRule' in window)) },
  { id: "dhbinfo93", label: "Browser has CSSSupportsRule", description: "Does the browser support CSSSupportsRule?", value: () => yesNo(safe(() => 'CSSSupportsRule' in window)) },
  { id: "dhbinfo94", label: "Browser has CSSViewportRule", description: "Does the browser support CSSViewportRule?", value: () => yesNo(safe(() => 'CSSViewportRule' in window)) },
  { id: "dhbinfo95", label: "Browser has CSSNamespaceRule", description: "Does the browser support CSSNamespaceRule?", value: () => yesNo(safe(() => 'CSSNamespaceRule' in window)) },
  { id: "dhbinfo96", label: "Browser has CSSImportRule", description: "Does the browser support CSSImportRule?", value: () => yesNo(safe(() => 'CSSImportRule' in window)) },
  { id: "dhbinfo97", label: "Browser has CSSCalc", description: "Does the browser support CSS calc() function?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('width', 'calc(1px)'))) },
  { id: "dhbinfo98", label: "Browser has CSSGrid", description: "Does the browser support CSS Grid layout?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('display', 'grid'))) },
  { id: "dhbinfo99", label: "Browser has CSSFlexbox", description: "Does the browser support CSS Flexbox layout?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('display', 'flex'))) },
  { id: "dhbinfo100", label: "Browser has CSSVariables", description: "Does the browser support CSS Variables?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('--fake-var', 'red'))) },
  { id: "dhbinfo101", label: "Browser has CSSAnimations", description: "Does the browser support CSS Animations?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('animation', '1s'))) },
  { id: "dhbinfo102", label: "Browser has CSSTransitions", description: "Does the browser support CSS Transitions?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('transition', 'all 1s'))) },
  { id: "dhbinfo103", label: "Browser has CSSTransforms", description: "Does the browser support CSS Transforms?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('transform', 'rotate(1deg)'))) },
  { id: "dhbinfo104", label: "Browser has CSSFilters", description: "Does the browser support CSS Filters?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('filter', 'blur(1px)'))) },
  { id: "dhbinfo105", label: "Browser has CSSShapes", description: "Does the browser support CSS Shapes?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('shape-outside', 'circle(50%)'))) },
  { id: "dhbinfo106", label: "Browser has CSSRegions", description: "Does the browser support CSS Regions?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('flow-into', 'region'))) },
  { id: "dhbinfo107", label: "Browser has CSSScrollSnap", description: "Does the browser support CSS Scroll Snap?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('scroll-snap-type', 'x mandatory'))) },
  { id: "dhbinfo108", label: "Browser has CSSContain", description: "Does the browser support CSS Containment?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('contain', 'layout'))) },
  { id: "dhbinfo109", label: "Browser has CSSBackdropFilter", description: "Does the browser support CSS Backdrop Filter?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('backdrop-filter', 'blur(1px)'))) },
  { id: "dhbinfo110", label: "Browser has CSSLogicalProperties", description: "Does the browser support CSS Logical Properties?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('margin-inline-start', '1px'))) },
  { id: "dhbinfo111", label: "Browser has CSSScrollBehavior", description: "Does the browser support CSS Scroll Behavior?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('scroll-behavior', 'smooth'))) },
  { id: "dhbinfo112", label: "Browser has CSSColorAdjust", description: "Does the browser support CSS Color Adjust?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('color-adjust', 'exact'))) },
  { id: "dhbinfo113", label: "Browser has CSSColorScheme", description: "Does the browser support CSS Color Scheme?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('color-scheme', 'dark light'))) },
  { id: "dhbinfo114", label: "Browser has CSSAspectRatio", description: "Does the browser support CSS Aspect Ratio?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('aspect-ratio', '1 / 1'))) },
  { id: "dhbinfo115", label: "Browser has CSSLogicalBoxModel", description: "Does the browser support CSS Logical Box Model?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('box-decoration-break', 'clone'))) },
  { id: "dhbinfo116", label: "Browser has CSSContainerQueries", description: "Does the browser support CSS Container Queries?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('container', 'size'))) },
  { id: "dhbinfo117", label: "Browser has CSSColorFunctions", description: "Does the browser support CSS Color Functions?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('color', 'color(display-p3 1 0 0)'))) },
  { id: "dhbinfo118", label: "Browser has CSSImageSet", description: "Does the browser support CSS Image Set?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('image-set', 'url(image.png) 1x, url(abandoned.png) 2x'))) },
  { id: "dhbinfo119", label: "Browser has CSSLogicalPropertiesAndValues", description: "Does the browser support CSS Logical Properties and Values?", value: () => yesNo(safe(() => 'CSS' in window && 'supports' in window.CSS && window.CSS.supports('margin-inline', '1px'))) },

  // === Fun/Diagnostics/Advanced ===
  { id: "dhbinfo120", label: "Timezone", description: "Your current timezone.", value: () => safe(() => Intl.DateTimeFormat().resolvedOptions().timeZone) },
  { id: "dhbinfo121", label: "Page visibility", description: "Is the page visible or hidden?", value: () => safe(() => document.visibilityState) },
  { id: "dhbinfo122", label: "Page focus", description: "Is the page focused?", value: () => yesNo(safe(() => document.hasFocus())) },
  { id: "dhbinfo123", label: "Page fullscreen", description: "Is the page in fullscreen mode?", value: () => yesNo(safe(() => !!document.fullscreenElement)) },
  { id: "dhbinfo124", label: "Page scrollable", description: "Is the page scrollable?", value: () => yesNo(safe(() => document.body.scrollHeight > window.innerHeight)) },
  { id: "dhbinfo125", label: "Page editable", description: "Is the page editable?", value: () => yesNo(safe(() => document.designMode === 'on' || document.body.isContentEditable)) },
  { id: "dhbinfo126", label: "Page URL hash", description: "The hash portion of the URL.", value: () => safe(() => window.location.hash) },
  { id: "dhbinfo127", label: "Page search params", description: "The search/query string of the URL.", value: () => safe(() => window.location.search) },
  { id: "dhbinfo128", label: "Page referrer policy", description: "The referrer policy for this page.", value: () => safe(() => document.referrerPolicy || 'N/A') },
  { id: "dhbinfo129", label: "Page scripts count", description: "Number of <script> tags on the page.", value: () => safe(() => document.scripts.length) },
  { id: "dhbinfo130", label: "Page links count", description: "Number of <a> tags on the page.", value: () => safe(() => document.links.length) },
  { id: "dhbinfo131", label: "Page images count", description: "Number of <img> tags on the page.", value: () => safe(() => document.images.length) },
  { id: "dhbinfo132", label: "Page forms count", description: "Number of <form> tags on the page.", value: () => safe(() => document.forms.length) },
  { id: "dhbinfo133", label: "Page anchors count", description: "Number of <a name> anchors on the page.", value: () => safe(() => document.anchors.length) },
  { id: "dhbinfo134", label: "Page styleSheets count", description: "Number of stylesheets on the page.", value: () => safe(() => document.styleSheets.length) },
  { id: "dhbinfo135", label: "Page fonts count", description: "Number of loaded fonts.", value: () => safe(() => document.fonts?.size ?? 'N/A') },
  { id: "dhbinfo136", label: "Page cookies count", description: "Number of cookies for this page.", value: () => safe(() => document.cookie ? document.cookie.split(';').length : 0) },
  { id: "dhbinfo286", label: "Page is RTL?", description: "Is the page using right-to-left text direction?", value: () => yesNo(safe(() => document.documentElement.dir === 'rtl')) },
  { id: "dhbinfo287", label: "Page scrollbars visible?", description: "Are scrollbars currently visible?", value: () => yesNo(safe(() => window.innerWidth > document.documentElement.clientWidth || window.innerHeight > document.documentElement.clientHeight)) },
  { id: "dhbinfo288", label: "Page has meta viewport?", description: "Does the page have a meta viewport tag?", value: () => yesNo(safe(() => !!document.querySelector('meta[name=viewport]'))) },
  { id: "dhbinfo289", label: "Page has meta description?", description: "Does the page have a meta description tag?", value: () => yesNo(safe(() => !!document.querySelector('meta[name=description]'))) },
  { id: "dhbinfo290", label: "Page has meta keywords?", description: "Does the page have a meta keywords tag?", value: () => yesNo(safe(() => !!document.querySelector('meta[name=keywords]'))) },
  { id: "dhbinfo291", label: "Page has canonical link?", description: "Does the page have a canonical link tag?", value: () => yesNo(safe(() => !!document.querySelector('link[rel=canonical]'))) },
  { id: "dhbinfo292", label: "Page has favicon?", description: "Does the page have a favicon link tag?", value: () => yesNo(safe(() => !!document.querySelector('link[rel=icon]'))) },
  { id: "dhbinfo293", label: "Page is in print mode?", description: "Is the page being rendered for print?", value: () => yesNo(safe(() => window.matchMedia('print').matches)) },
  { id: "dhbinfo294", label: "Page prefers reduced motion?", description: "Does the user prefer reduced motion?", value: () => yesNo(safe(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)) },
  { id: "dhbinfo295", label: "Page prefers contrast?", description: "Does the user prefer high contrast?", value: () => yesNo(safe(() => window.matchMedia('(prefers-contrast: more)').matches)) },
  { id: "dhbinfo296", label: "Page prefers color scheme?", description: "Does the user prefer a specific color scheme?", value: () => safe(() => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : window.matchMedia('(prefers-color-scheme: light)').matches ? 'Light' : 'No preference') },
  { id: "dhbinfo297", label: "Page prefers reduced data?", description: "Does the user prefer reduced data usage?", value: () => yesNo(safe(() => window.matchMedia('(prefers-reduced-data: reduce)').matches)) },
  { id: "dhbinfo298", label: "Page prefers reduced transparency?", description: "Does the user prefer reduced transparency?", value: () => yesNo(safe(() => window.matchMedia('(prefers-reduced-transparency: reduce)').matches)) },
  { id: "dhbinfo299", label: "Page prefers inverted colors?", description: "Does the user prefer inverted colors?", value: () => yesNo(safe(() => window.matchMedia('(inverted-colors: inverted)').matches)) },
  { id: "dhbinfo300", label: "Page prefers monochrome?", description: "Does the user prefer monochrome display?", value: () => yesNo(safe(() => window.matchMedia('(monochrome)').matches)) },
  { id: "dhbinfo301", label: "Page is cross-origin isolated?", description: "Is the page running in a cross-origin isolated context?", value: () => yesNo(safe(() => window.crossOriginIsolated)) },
  { id: "dhbinfo302", label: "Page is pop-up?", description: "Is this window a pop-up?", value: () => yesNo(safe(() => window.opener != null)) },
  { id: "dhbinfo303", label: "Page is top-level?", description: "Is this the top-level browsing context?", value: () => yesNo(safe(() => window.top === window.self)) },
  { id: "dhbinfo304", label: "Page pointer lock active?", description: "Is pointer lock active?", value: () => yesNo(safe(() => document.pointerLockElement != null)) },
  { id: "dhbinfo305", label: "Page has focus?", description: "Does the document have focus?", value: () => yesNo(safe(() => document.hasFocus())) },
  { id: "dhbinfo306", label: "Page hidden?", description: "Is the document hidden (not visible)?", value: () => yesNo(safe(() => document.hidden)) },
  { id: "dhbinfo307", label: "Page visibility state", description: "The visibility state of the document.", value: () => safe(() => document.visibilityState) },
  { id: "dhbinfo308", label: "Page active element tag", description: "The tag name of the currently active element.", value: () => safe(() => document.activeElement?.tagName) },
  { id: "dhbinfo309", label: "Page scroll X", description: "Current horizontal scroll position.", value: () => safe(() => window.scrollX) },
  { id: "dhbinfo310", label: "Page scroll Y", description: "Current vertical scroll position.", value: () => safe(() => window.scrollY) },
  { id: "dhbinfo311", label: "Page editable?", description: "Is the page editable?", value: () => yesNo(safe(() => document.designMode === 'on' || document.body.isContentEditable)) },
  
];


const normalizedInfoMap = (() => {
  const seen = new Set();
  const cleaned = [];

  for (const entry of infoMap) {
    if (!entry || typeof entry !== 'object') continue;
    const key = entry.key ?? entry.id;
    const getter = entry.get ?? entry.value;
    if (!key || typeof getter !== 'function' || seen.has(String(key))) continue;
    seen.add(String(key));
    cleaned.push({
      key: String(key),
      label: entry.label ?? String(key),
      desc: entry.desc ?? entry.description ?? '',
      getter
    });
  }

  return cleaned;
})();

// --- DOM: Dynamic Panel Generation ---
(function ensureDhbinfoPanel() {
  let dhbinfoPanel = document.getElementById('dhbinfo-panel');
  const details = document.querySelector('.Custom-Script-Details');
  if (details) {
    // Remove any old panel to avoid duplicates
    if (dhbinfoPanel) dhbinfoPanel.remove();
    dhbinfoPanel = document.createElement('div');
    dhbinfoPanel.id = 'dhbinfo-panel';
    dhbinfoPanel.style.margin = '1em 0';
    dhbinfoPanel.style.background = '#181818';
    dhbinfoPanel.style.color = '#e0e0e0';
    dhbinfoPanel.style.borderRadius = '8px';
    dhbinfoPanel.style.boxShadow = '0 2px 12px 0 #0008';
    dhbinfoPanel.style.overflowX = 'auto';
    dhbinfoPanel.style.padding = '0.5em 0.5em 1em 0.5em';
    dhbinfoPanel.style.fontSize = '1rem';
    // Insert after summary for best visibility
    const summary = details.querySelector('summary');
    if (summary && summary.nextSibling) {
      details.insertBefore(dhbinfoPanel, summary.nextSibling);
    } else {
      details.appendChild(dhbinfoPanel);
    }
    // Make sure panel is visible
    dhbinfoPanel.style.display = 'block';
  } else {
    // If details not found, log error
    console.error('dhbinfo: .Custom-Script-Details <details> not found in DOM');
  }
})();

const container = document.getElementById('dhbinfo-panel');
if (container) {
  container.setAttribute('role', 'region');
  container.setAttribute('aria-live', 'polite');
  container.innerHTML = '';
  // Use DocumentFragment for speed (minimize reflows)
  const frag = document.createDocumentFragment();
  // Render as a table for spreadsheet style
  const table = document.createElement('div');
  table.style.display = 'table';
  table.style.width = '100%';
  table.style.tableLayout = 'fixed';

  const headerRow = document.createElement('div');
  headerRow.className = 'dhbinfo-row dhbinfo-row-header';
  headerRow.style.display = 'table-row';

  const labelHeader = document.createElement('span');
  labelHeader.className = 'dhbinfo-label';
  labelHeader.textContent = 'Label';
  labelHeader.style.display = 'table-cell';
  labelHeader.style.fontWeight = '400';
  labelHeader.style.fontSize = '0.78rem';
  labelHeader.style.width = '22%';
  labelHeader.style.textAlign = 'left';
  labelHeader.style.padding = '0.3em 0.45em';
  labelHeader.style.whiteSpace = 'normal';
  labelHeader.style.wordBreak = 'break-word';
  labelHeader.style.overflowWrap = 'anywhere';

  const descHeader = document.createElement('span');
  descHeader.className = 'dhbinfo-description';
  descHeader.textContent = 'Description';
  descHeader.style.display = 'table-cell';
  descHeader.style.fontWeight = '400';
  descHeader.style.fontSize = '0.78rem';
  descHeader.style.width = '52%';
  descHeader.style.textAlign = 'left';
  descHeader.style.padding = '0.3em 0.45em';
  descHeader.style.whiteSpace = 'normal';
  descHeader.style.wordBreak = 'break-word';
  descHeader.style.overflowWrap = 'anywhere';

  const valueHeader = document.createElement('span');
  valueHeader.className = 'dhbinfo-value';
  valueHeader.textContent = 'Value';
  valueHeader.style.display = 'table-cell';
  valueHeader.style.fontWeight = '700';
  valueHeader.style.fontSize = '0.78rem';
  valueHeader.style.width = '26%';
  valueHeader.style.textAlign = 'left';
  valueHeader.style.padding = '0.3em 0.45em';
  valueHeader.style.setProperty('background-color', '#1f2b35', 'important');
  valueHeader.style.borderLeft = '1px solid #2f3f4d';
  valueHeader.style.whiteSpace = 'normal';
  valueHeader.style.wordBreak = 'break-word';
  valueHeader.style.overflowWrap = 'anywhere';

  headerRow.appendChild(labelHeader);
  headerRow.appendChild(descHeader);
  headerRow.appendChild(valueHeader);
  table.appendChild(headerRow);

  normalizedInfoMap.forEach((entry) => {
    const key = entry.key;
    const label = entry.label;
    const desc = entry.desc;
    const row = document.createElement('div');
    row.className = 'dhbinfo-row';
    row.style.display = 'table-row';
    const labelCell = document.createElement('span');
    labelCell.className = 'dhbinfo-label';
    labelCell.title = String(desc);
    labelCell.textContent = String(label);
    labelCell.style.display = 'table-cell';
    labelCell.style.fontSize = '0.78rem';
    labelCell.style.width = '22%';
    labelCell.style.textAlign = 'left';
    labelCell.style.padding = '0.3em 0.45em';
    labelCell.style.whiteSpace = 'normal';
    labelCell.style.wordBreak = 'break-word';
    labelCell.style.overflowWrap = 'anywhere';

    const descCell = document.createElement('span');
    descCell.className = 'dhbinfo-description';
    descCell.id = `dhbinfo-desc-${String(key)}`;
    descCell.textContent = String(desc || 'No description available.');
    descCell.style.display = 'table-cell';
    descCell.style.fontSize = '0.78rem';
    descCell.style.width = '52%';
    descCell.style.textAlign = 'left';
    descCell.style.padding = '0.3em 0.45em';
    descCell.style.whiteSpace = 'normal';
    descCell.style.wordBreak = 'break-word';
    descCell.style.overflowWrap = 'anywhere';

    const valueCell = document.createElement('span');
    valueCell.className = 'dhbinfo-value';
    valueCell.id = `dhbinfo-${String(key)}`;
    valueCell.setAttribute('aria-label', String(desc));
    valueCell.textContent = '...';
    valueCell.style.display = 'table-cell';
    valueCell.style.fontSize = '0.78rem';
    valueCell.style.width = '26%';
    valueCell.style.textAlign = 'left';
    valueCell.style.padding = '0.3em 0.45em';
    valueCell.style.setProperty('background-color', '#162028', 'important');
    valueCell.style.borderLeft = '1px solid #2a3642';
    valueCell.style.borderRadius = '3px';
    valueCell.style.whiteSpace = 'normal';
    valueCell.style.wordBreak = 'break-word';
    valueCell.style.overflowWrap = 'anywhere';

    row.appendChild(labelCell);
    row.appendChild(descCell);
    row.appendChild(valueCell);
    table.appendChild(row);
  });
  frag.appendChild(table);
  container.appendChild(frag);
  // Make sure container is visible
  container.style.display = 'block';
} else {
  // Fallback: warn if panel container is missing
  console.error('dhbinfo: #dhbinfo-panel container not found in DOM');
}

// --- Update Logic: Only Update Changed Values, Async Support ---
const prevValues = {};
let updateInProgress = false;

async function resolveEntryValue(getter) {
  try {
    const value = await Promise.resolve(getter());
    if (value === undefined || value === null || value === '') return NA_VALUE;
    return value;
  } catch {
    return NA_VALUE;
  }
}

async function updateInfoPanel() {
  if (updateInProgress) return;
  updateInProgress = true;

  try {
  for (const entry of normalizedInfoMap) {
    const key = entry.key;
    const getter = entry.getter;
    const el = document.getElementById(`dhbinfo-${key}`);
    if (!el) continue;

    const value = await resolveEntryValue(getter);
    if (prevValues[key] !== value) {
      const valueText = String(value);
      el.textContent = valueText;
      el.classList.remove('dhbinfo-yes', 'dhbinfo-no');
      if (valueText === 'Yes') {
        el.classList.add('dhbinfo-yes');
      } else if (valueText === 'No') {
        el.classList.add('dhbinfo-no');
      }
      prevValues[key] = value;
    }
  }
  } finally {
    updateInProgress = false;
  }
}

// --- Initial & Periodic Update (requestAnimationFrame for first paint) ---
if (window.requestAnimationFrame) {
  requestAnimationFrame(updateInfoPanel);
} else {
  updateInfoPanel();
}
setInterval(updateInfoPanel, 3000);

// --- Export for Extensibility ---
window.dhbinfo = Object.freeze({ infoMap: normalizedInfoMap, updateInfoPanel });

// --- HTTP Status Helper ---
const httpStatusCodes = {
  informational: [
    { code: 100, name: "Continue", description: "Request headers received, continue request body." },
    { code: 101, name: "Switching Protocols", description: "Server is switching protocols as requested." },
    { code: 102, name: "Processing", description: "Server has received and is processing the request." },
    { code: 103, name: "Early Hints", description: "Hints sent before final response, often for preload links." }
  ],
  success: [
    { code: 200, name: "OK", description: "Request succeeded." },
    { code: 201, name: "Created", description: "Request succeeded and created a new resource." },
    { code: 202, name: "Accepted", description: "Request accepted for processing, not completed yet." },
    { code: 203, name: "Non-Authoritative Information", description: "Returned metadata is from a transformed source." },
    { code: 204, name: "No Content", description: "Request succeeded with no response body." },
    { code: 205, name: "Reset Content", description: "Client should reset the view that sent the request." },
    { code: 206, name: "Partial Content", description: "Partial response to a range request." },
    { code: 207, name: "Multi-Status", description: "Multiple status values for different operations." },
    { code: 208, name: "Already Reported", description: "Members already enumerated in a previous part of the response." },
    { code: 226, name: "IM Used", description: "Server fulfilled request using instance manipulations." }
  ],
  redirection: [
    { code: 300, name: "Multiple Choices", description: "Multiple response options are available." },
    { code: 301, name: "Moved Permanently", description: "Resource permanently moved to a new URL." },
    { code: 302, name: "Found", description: "Resource temporarily found at a different URL." },
    { code: 303, name: "See Other", description: "Response should be retrieved with GET at another URI." },
    { code: 304, name: "Not Modified", description: "Cached resource is still valid." },
    { code: 305, name: "Use Proxy", description: "Requested resource must be accessed through a proxy (deprecated)." },
    { code: 306, name: "Unused", description: "Reserved status code, no longer used." },
    { code: 307, name: "Temporary Redirect", description: "Temporary redirect; repeat request with same method." },
    { code: 308, name: "Permanent Redirect", description: "Permanent redirect; repeat request with same method." }
  ],
  clientError: [
    { code: 400, name: "Bad Request", description: "Server cannot process the request due to client error." },
    { code: 401, name: "Unauthorized", description: "Authentication is required." },
    { code: 402, name: "Payment Required", description: "Reserved for future use." },
    { code: 403, name: "Forbidden", description: "Server understood request but refuses to authorize it." },
    { code: 404, name: "Not Found", description: "Requested resource was not found." },
    { code: 405, name: "Method Not Allowed", description: "Method is not allowed for this resource." },
    { code: 406, name: "Not Acceptable", description: "No acceptable representation found." },
    { code: 407, name: "Proxy Authentication Required", description: "Proxy authentication is required." },
    { code: 408, name: "Request Timeout", description: "Server timed out waiting for request." },
    { code: 409, name: "Conflict", description: "Request conflicts with current resource state." },
    { code: 410, name: "Gone", description: "Resource is no longer available and will not return." },
    { code: 411, name: "Length Required", description: "Content-Length header is required." },
    { code: 412, name: "Precondition Failed", description: "Preconditions in request headers were not met." },
    { code: 413, name: "Content Too Large", description: "Request content is too large for server limits." },
    { code: 414, name: "URI Too Long", description: "Request URI is longer than server can process." },
    { code: 415, name: "Unsupported Media Type", description: "Media type is unsupported for this resource." },
    { code: 416, name: "Range Not Satisfiable", description: "Requested range cannot be fulfilled." },
    { code: 417, name: "Expectation Failed", description: "Expectation in request headers cannot be met." },
    { code: 418, name: "I'm a Teapot", description: "Server refuses to brew coffee because it is a teapot." },
    { code: 421, name: "Misdirected Request", description: "Request directed to a server unable to produce response." },
    { code: 422, name: "Unprocessable Content", description: "Request syntax is correct but semantically invalid." },
    { code: 423, name: "Locked", description: "Resource is locked." },
    { code: 424, name: "Failed Dependency", description: "Request failed due to dependency failure." },
    { code: 425, name: "Too Early", description: "Server is unwilling to risk processing replayed request." },
    { code: 426, name: "Upgrade Required", description: "Client should switch to a different protocol." },
    { code: 428, name: "Precondition Required", description: "Origin server requires a conditional request." },
    { code: 429, name: "Too Many Requests", description: "Client sent too many requests in a given time." },
    { code: 431, name: "Request Header Fields Too Large", description: "Request header fields are too large." },
    { code: 451, name: "Unavailable For Legal Reasons", description: "Resource unavailable due to legal demand." }
  ],
  serverError: [
    { code: 500, name: "Internal Server Error", description: "Unexpected server-side error occurred." },
    { code: 501, name: "Not Implemented", description: "Server does not support requested functionality." },
    { code: 502, name: "Bad Gateway", description: "Invalid response received from upstream server." },
    { code: 503, name: "Service Unavailable", description: "Server is temporarily unable to handle request." },
    { code: 504, name: "Gateway Timeout", description: "Upstream server did not respond in time." },
    { code: 505, name: "HTTP Version Not Supported", description: "HTTP version in request is not supported." },
    { code: 506, name: "Variant Also Negotiates", description: "Server has internal content negotiation error." },
    { code: 507, name: "Insufficient Storage", description: "Server cannot store the representation needed." },
    { code: 508, name: "Loop Detected", description: "Server detected an infinite loop while processing." },
    { code: 510, name: "Not Extended", description: "Further extensions to request are required." },
    { code: 511, name: "Network Authentication Required", description: "Client must authenticate for network access." }
  ]
};

const allHttpStatusCodes = [
  ...httpStatusCodes.informational,
  ...httpStatusCodes.success,
  ...httpStatusCodes.redirection,
  ...httpStatusCodes.clientError,
  ...httpStatusCodes.serverError
];

const httpStatusCodeMap = allHttpStatusCodes.reduce((accumulator, item) => {
  accumulator[item.code] = item;
  return accumulator;
}, {});

function getHttpStatus(code) {
  return httpStatusCodeMap[Number(code)] || null;
}

function getHttpStatusName(code) {
  const status = getHttpStatus(code);
  return status ? status.name : "Unknown Status";
}

function getHttpStatusDescription(code) {
  const status = getHttpStatus(code);
  return status ? status.description : "No description available for this status code.";
}

globalThis.httpStatusCodes = httpStatusCodes;
globalThis.allHttpStatusCodes = allHttpStatusCodes;
globalThis.getHttpStatus = getHttpStatus;
globalThis.getHttpStatusName = getHttpStatusName;
globalThis.getHttpStatusDescription = getHttpStatusDescription;

function renderHttpStatusHelper() {
  const panel = document.getElementById('dhbinfo-panel');
  let host = panel ? panel.querySelector('#dhbinfo-http-status') : null;

  if (panel && !host) {
    host = document.createElement('section');
    host.id = 'dhbinfo-http-status';
    host.innerHTML = `
      <h3 id="http-status-helper-title">HTTP Status Helper</h3>
      <p id="http-status-helper-result"></p>
      <p id="http-status-helper-error" aria-live="polite"></p>
      <div id="http-status-helper-list"></div>
    `;
    panel.appendChild(host);
  }

  const result = host
    ? host.querySelector('#http-status-helper-result')
    : document.getElementById('http-status-helper-result');
  const error = host
    ? host.querySelector('#http-status-helper-error')
    : document.getElementById('http-status-helper-error');
  const list = host
    ? host.querySelector('#http-status-helper-list')
    : document.getElementById('http-status-helper-list');

  if (!result || !error || !list) {
    return;
  }

  const isPassStatus = (code) => {
    const normalizedCode = Number(code);
    return normalizedCode >= 100 && normalizedCode < 400;
  };
  const getPassLabel = (code) => (isPassStatus(code) ? 'Pass' : "Didn't Pass");
  const getPassClass = (code) => (isPassStatus(code) ? 'http-status-pass' : 'http-status-don\'t-pass');
  const getFailureReason = (item) => {
    const code = Number(item.code);
    return code >= 500
      ? 'Server-side issue while processing the request.'
      : 'Client-side request issue (invalid, unauthorized, forbidden, or missing data).';
  };
  const getHintText = (item) => {
    const code = Number(item.code);
    if (code >= 100 && code < 200) return 'Informational class (1xx).';
    if (code >= 200 && code < 300) return 'Success class (2xx).';
    if (code >= 300 && code < 400) return 'Redirection class (3xx).';
    if (code >= 400 && code < 500) return 'Client error class (4xx).';
    if (code >= 500 && code < 600) return 'Server error class (5xx).';
    return 'Unknown status class.';
  };
  const getDescriptionText = (item) => String(
    item.description
    || globalThis.getHttpStatusDescription?.(item.code)
    || 'No description was provided for this status code.'
  ).trim();
  const getPassReason = (item) => {
    const code = Number(item.code);
    if (code >= 100 && code < 200) return 'Informational response; request handling is in progress.';
    if (code >= 200 && code < 300) return 'Success response; request completed as expected.';
    if (code >= 300 && code < 400) return 'Redirection response; client should follow redirect rules.';
    return 'No hint available.';
  };

  try {
    if (typeof globalThis.getHttpStatus !== 'function' || !Array.isArray(globalThis.allHttpStatusCodes)) {
      throw new TypeError('HTTP status helpers are not available right now.');
    }

    const status = globalThis.getHttpStatus(404);
    result.textContent = status
      ? `${status.code} ${status.name} - ${status.description}`
      : 'No HTTP status data was returned.';
    error.textContent = '';

    const sortedStatuses = [...globalThis.allHttpStatusCodes].sort((a, b) => a.code - b.code);
    const tableRows = sortedStatuses
      .map(
        (item) => {
          const failed = Number(item.code) >= 400;
          const descriptionText = escapeHtml(getDescriptionText(item));
          const failReason = escapeHtml(getFailureReason(item));
          const hintText = escapeHtml(getHintText(item));
          const code = escapeHtml(item.code);
          const name = escapeHtml(item.name);
          const passReason = escapeHtml(getPassReason(item));
          const hintCell = failed
            ? `<div class="http-status-hint-side http-status-hint-side-fail">
                 <span class="http-status-hint-label">Hint:</span>
                 <span class="http-status-hint-text">${hintText}</span>
                 <span class="http-status-hint-label">Description:</span>
                 <span class="http-status-hint-text">${descriptionText}</span>
                 <span class="http-status-hint-label">Why it didn't pass:</span>
                 <span class="http-status-hint-text">${failReason}</span>
               </div>`
            : `<div class="http-status-hint-side">
                 <span class="http-status-hint-label">Hint:</span>
                 <span class="http-status-hint-text">${hintText}</span>
                 <span class="http-status-hint-label">Description:</span>
                 <span class="http-status-hint-text">${descriptionText}</span>
                 <span class="http-status-hint-label">Why it pass:</span>
                 <span class="http-status-hint-text">${passReason}</span>
               </div>`;

          return `<tr>
            <td class="http-status-code">${code}</td>
            <td>${name}</td>
            <td class="${getPassClass(item.code)}">${getPassLabel(item.code)}</td>
            <td>${hintCell}</td>
          </tr>`;
        }
      )
      .join('');

    list.innerHTML = `
      <h3>All HTTP Status Codes</h3>
      <div class="http-status-table-wrap">
        <table class="http-status-table" aria-label="HTTP status codes and pass state">
          <thead>
            <tr>
              <th scope="col">Code</th>
              <th scope="col">Status</th>
              <th scope="col">Result</th>
              <th scope="col">Hint</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    `;
  } catch (exception) {
    result.textContent = 'HTTP Status Helper';
    error.textContent = `Error: ${exception.message}`;
    list.innerHTML = '';
    console.error('HTTP Status Helper error:', exception);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderHttpStatusHelper, { once: true });
} else {
  renderHttpStatusHelper();
}
// --- Utility Functions ---
function safe(fn) {
  try {
    return fn();
  } catch (e) {
    console.warn('dhbinfo: Error in safe function', e);
    return 'N/A';
  }
};
function yesNo(value) {
  return value ? 'Yes' : 'No';
}