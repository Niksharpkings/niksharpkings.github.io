const log = document.querySelector(".log");

const modifierKeys = {
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false
};

function handleTouchEvent(e) {
  const touch = e.touches[0];
  return {
    clientX: touch.clientX,
    clientY: touch.clientY,
    pageX: touch.pageX,
    pageY: touch.pageY,
    screenX: touch.screenX,
    screenY: touch.screenY,
    offsetX: touch.clientX - touch.target.getBoundingClientRect().left,
    offsetY: touch.clientY - touch.target.getBoundingClientRect().top
  };
}

function handleMouseEvent(e) {
  return {
    clientX: e.clientX,
    clientY: e.clientY,
    pageX: e.pageX,
    pageY: e.pageY,
    screenX: e.screenX,
    screenY: e.screenY,
    offsetX: e.offsetX,
    offsetY: e.offsetY
  };
}

function resetModifierKeys(e) {
  if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
    modifierKeys.altKey = false;
    modifierKeys.ctrlKey = false;
    modifierKeys.metaKey = false;
    modifierKeys.shiftKey = false;
  }
}

function getAdditionalInfo(element) {
  const attributes = [
    'innerText', 'title', 'alt', 'value', 'type', 'name', 'action', 'method', 'enctype', 'acceptCharset', 'accept', 
    'autocomplete', 'autofocus', 'autocapitalize', 'autocorrect', 'autosave', 'checked', 'disabled', 'form', 
    'formAction', 'formEnctype', 'formMethod', 'formNoValidate'
  ];

  const info = {};
  attributes.forEach(attr => {
    info[attr] = element[attr] || '';
  });

  return info;
}

function generateLogMessage(coords, e, element, info) {
  const tagName = element.tagName.toLowerCase();
  const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
  const id = element.id ? `#${element.id}` : '';
  const cssElement = `${id}${className}` || element.style.cssText;

  return `
    Offset   X: ${coords.offsetX},Y: ${coords.offsetY}
    Viewport X: ${coords.clientX},Y: ${coords.clientY}
    Page     X: ${coords.pageX},Y: ${coords.pageY}
    Screen   X: ${coords.screenX},Y: ${coords.screenY}
    Movement X: ${e.movementX}, Y: ${e.movementY}
    Related Target: ${e.relatedTarget ? e.relatedTarget.tagName.toLowerCase() : 'none'}
    Event X: ${e.x}, Y: ${e.y};
    Alt Key: ${modifierKeys.altKey}
    Ctrl Key: ${modifierKeys.ctrlKey}
    Meta Key: ${modifierKeys.metaKey}
    Shift Key: ${modifierKeys.shiftKey}
    Button: ${e.button}, Buttons: ${e.buttons}
    HTML Element  : ${tagName}
    CSS Element: ${cssElement}
    ${Object.entries(info).map(([key, value]) => value ? `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}` : '').filter(Boolean).join('\n')}
  `;
}

function setCoords(e) {
  const coords = e.touches ? handleTouchEvent(e) : handleMouseEvent(e);
  resetModifierKeys(e);

  const element = document.elementFromPoint(coords.clientX, coords.clientY);
  const info = getAdditionalInfo(element);

  log.innerText = generateLogMessage(coords, e, element, info);

  log.style.left = `${coords.pageX + 5}px`;
  log.style.top = `${coords.pageY + 5}px`;
}

function showClickCoords(e) {
  let pageX, pageY;

  if (e.touches) {
    const touch = e.changedTouches[0];
    pageX = touch.pageX;
    pageY = touch.pageY;
  } else {
    pageX = e.pageX;
    pageY = e.pageY;
  }

  log.innerText += `
    Clicked at Page X: ${pageX}, Y: ${pageY}`;
}

function updateModifierKeys(e) {
  modifierKeys.altKey = e.altKey;
  modifierKeys.ctrlKey = e.ctrlKey;
  modifierKeys.metaKey = e.metaKey;
  modifierKeys.shiftKey = e.shiftKey;
  setCoords(e);
}

// Event Listeners 
document.addEventListener("mousemove", setCoords);
document.addEventListener("mouseenter", setCoords);
document.addEventListener("mouseleave", setCoords);
document.addEventListener("touchmove", setCoords);
document.addEventListener("touchstart", setCoords);
document.addEventListener("touchend", setCoords);
document.addEventListener("click", showClickCoords);
document.addEventListener("touchend", showClickCoords);
document.addEventListener("keydown", (e) => {
  if (["Shift", "Alt", "Control", "Meta"].includes(e.key)) {
    updateModifierKeys(e);
  }
});
document.addEventListener("keyup", (e) => {
  if (["Shift", "Alt", "Control", "Meta"].includes(e.key)) {
    updateModifierKeys(e);
  }
});
document.addEventListener("wheel", (e) => {
  updateModifierKeys(e);
});