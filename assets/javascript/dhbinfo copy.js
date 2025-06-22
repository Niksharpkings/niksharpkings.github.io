// === dhbinfo.js: Dynamic Browser/System Info Panel ===
// Comprehensive, extensible, and accessible info panel for diagnostics and fun
// Refactored June 2025 for optimal maintainability, speed, and ES7+ best practices

// --- Utility: Safe Getter ---
const safeGet = (getter, fallback = 'N/A') => {
  try { return getter(); } catch { return fallback; }
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
  { key: 'quota', label: 'Storage Quota', desc: 'Estimated storage quota', get: () => safeGet(() => navigator.storage && navigator.storage.estimate ? formatBytes(navigator.storage.estimate().then(e => e.quota)) : 'N/A') },
  // --- Network ---
  { key: 'connectionType', label: 'Connection Type', desc: 'Network connection type', get: () => safeGet(() => navigator.connection ? navigator.connection.effectiveType : 'N/A') },
  { key: 'downlink', label: 'Downlink', desc: 'Estimated downlink (Mbps)', get: () => safeGet(() => navigator.connection ? navigator.connection.downlink : 'N/A') },
  { key: 'rtt', label: 'RTT', desc: 'Estimated round-trip time (ms)', get: () => safeGet(() => navigator.connection ? navigator.connection.rtt : 'N/A') },
  // --- Battery ---
  { key: 'batteryLevel', label: 'Battery Level', desc: 'Battery charge level (%)', get: () => safeGet(async () => {
    if (!navigator.getBattery) return 'N/A';
    const b = await navigator.getBattery();
    return `${Math.round(b.level * 100)}%`;
  }) },
  { key: 'batteryCharging', label: 'Battery Charging', desc: 'Is device charging?', get: () => safeGet(async () => {
    if (!navigator.getBattery) return 'N/A';
    const b = await navigator.getBattery();
    return formatBool(b.charging);
  }) },
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
  infoMap.forEach(({ key, label, desc }) => {
    const row = document.createElement('div');
    row.className = 'dhbinfo-row';
    row.style.display = 'table-row';
    const labelCell = document.createElement('span');
    labelCell.className = 'dhbinfo-label';
    labelCell.title = String(desc);
    labelCell.textContent = String(label);
    labelCell.style.display = 'table-cell';
    const valueCell = document.createElement('span');
    valueCell.className = 'dhbinfo-value';
    valueCell.id = `dhbinfo-${String(key)}`;
    valueCell.setAttribute('aria-label', String(desc));
    valueCell.textContent = '...';
    valueCell.style.display = 'table-cell';
    row.appendChild(labelCell);
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
async function updateInfoPanel() {
  for (const { key, get } of infoMap) {
    const el = document.getElementById(`dhbinfo-${key}`);
    if (!el) continue;
    let value = get();
    if (value instanceof Promise) value = await value;
    // Normalize undefined/null to 'N/A' for durability
    if (value === undefined || value === null) value = 'N/A';
    if (prevValues[key] !== value) {
      el.textContent = value;
      prevValues[key] = value;
    }
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
window.dhbinfo = Object.freeze({ infoMap, updateInfoPanel });
