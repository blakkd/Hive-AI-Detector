let HeadTag = document.getElementsByTagName("head")[0];
if (HeadTag) {
  var fontStylesLinkPreconnect1 = document.createElement("link");
  fontStylesLinkPreconnect1.href = "https://fonts.googleapis.com";
  fontStylesLinkPreconnect1.rel = "preconnect";
  HeadTag.appendChild(fontStylesLinkPreconnect1);

  var fontStylesLinkPreconnect2 = document.createElement("link");
  fontStylesLinkPreconnect2.href = "https://fonts.gstatic.com";
  fontStylesLinkPreconnect2.rel = "preconnect";
  fontStylesLinkPreconnect2.crossOrigin = true;
  HeadTag.appendChild(fontStylesLinkPreconnect2);

  var fontStylesLink = document.createElement("link");
  fontStylesLink.href = "https://fonts.googleapis.com/css?family=Roboto";
  fontStylesLink.type = "text/css";
  fontStylesLink.rel = "stylesheet";
  HeadTag.appendChild(fontStylesLink);
}

const hiddenClassName = "hvaid-hidden-container";
const invisibleClassName = "hvaid-invisible-container";
const showPopoverButtonKey = "show_popover_button";

const popoverButtonPositionLeftKey = "popover_button_position_left";
const popoverButtonPositionTopKey = "popover_button_position_top";

const popoverDefaultPositionRight = 45;
const popoverDefaultPositionBottom = 70;
const popoverButtonDefaultPositionRight = 80;
const popoverButtonDefaultPositionBottom = 20;

const goToDefaultPositionMessage = "set-toggle-button-to-default-position";
const DOMTypeMessage = "DOM-type-unsupported";
const getDocumentNotSupported = () => {
  return document.contentType.split("/")[1] === "xml";
};

let LogoContainer;

/* Popover container, toggle button*/
let isPopoverOpen = false;
let page = { type: "form" };

/* button to toggle whether to show the popover button*/
const TogglePopoverButton = document.createElement("div");
TogglePopoverButton.id = "hvaid-toggle-popover-icon";

const TogglePopoverButtonMover = document.createElement("div");
TogglePopoverButtonMover.id = "hvaid-toggle-popover-icon-mover";
TogglePopoverButtonMover.addEventListener("click", (e) => {
  e.stopPropagation();
});
TogglePopoverButton.addEventListener("mouseenter", () => {
  if (isPopoverOpen) {
    return;
  }
  TogglePopoverButton.appendChild(TogglePopoverButtonMover);
});
TogglePopoverButton.addEventListener("mouseleave", () => {
  if (TogglePopoverButton.contains(TogglePopoverButtonMover)) {
    TogglePopoverButton.removeChild(TogglePopoverButtonMover);
  }
});

const addPopoverButton = () => {
  if (getDocumentNotSupported()) {
    return;
  }
  document.body.appendChild(TogglePopoverButton);
};
const removePopoverButton = () => {
  document.body.removeChild(TogglePopoverButton);
};
chrome.storage.sync.get(showPopoverButtonKey).then((res) => {
  if (res[showPopoverButtonKey]) {
    addPopoverButton();
  }
});

/* this setting is stored under the key showPopoverButtonKey */
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes[showPopoverButtonKey]) {
    if (
      changes[showPopoverButtonKey]?.newValue &&
      !changes[showPopoverButtonKey]?.oldValue
    ) {
      addPopoverButton();
    } else {
      removePopoverButton();
    }
  }
  
  // Handle dark mode changes
  if (area === "sync" && changes["dark_mode_enabled"]) {
    const isDarkMode = changes["dark_mode_enabled"]?.newValue;
    if (isDarkMode) {
      PopoverContainer.classList.add("dark-mode");
    } else {
      PopoverContainer.classList.remove("dark-mode");
    }
  }
});

const changeTogglePopoverButtonPosition = ({ left, top }) => {
  if (!TogglePopoverButton.style) {
    return;
  }
  if (left != null) {
    TogglePopoverButton.style.left = left + "px";
    TogglePopoverButton.style.right = "unset";
  } else {
    TogglePopoverButton.style.left = "unset";
    TogglePopoverButton.style.right = popoverButtonDefaultPositionRight + "px";
  }
  if (top != null) {
    TogglePopoverButton.style.top = top + "px";
    TogglePopoverButton.style.bottom = "unset";
  } else {
    TogglePopoverButton.style.top = "unset";
    TogglePopoverButton.style.bottom =
      popoverButtonDefaultPositionBottom + "px";
  }
};
chrome.storage.sync
  .get([popoverButtonPositionLeftKey, popoverButtonPositionTopKey])
  .then((res) => {
    changeTogglePopoverButtonPosition({
      left: res[popoverButtonPositionLeftKey],
      top: res[popoverButtonPositionTopKey],
    });
  });

const PopoverContainer = document.createElement("div");
PopoverContainer.id = "hvaid-popover-container";

// Check for dark mode preference and apply to popover
chrome.storage.sync.get("dark_mode_enabled").then((result) => {
  if (result.dark_mode_enabled) {
    PopoverContainer.classList.add("dark-mode");
  }
});

// Listen for dark mode changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes["dark_mode_enabled"]) {
    const isDarkMode = changes["dark_mode_enabled"]?.newValue;
    if (isDarkMode) {
      PopoverContainer.classList.add("dark-mode");
    } else {
      PopoverContainer.classList.remove("dark-mode");
    }
  }
});

const makeElementDraggable = ({ element, mover, onMove }) => {
  if (!element.style) {
    return;
  }
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  mover.onmousedown = dragMouseDown;
  mover.onclick = (e) => {
    // e.stopPropagation();
    e.preventDefault();
  };

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    e.stopPropagation();
    // get the mouse cursor position at beginning:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // set the element's new position:
    const top = element.offsetTop - pos2;
    const left = element.offsetLeft - pos1;
    element.style.top = top + "px";
    element.style.left = left + "px";
    element.style.bottom = "unset";
    element.style.right = "unset";

    if (onMove) {
      onMove({ left, top });
    }
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
};
makeElementDraggable({ element: PopoverContainer, mover: PopoverContainer });

const onMoveToggleButton = debounce(({ left, top }) => {
  chrome.storage.sync.set({
    [popoverButtonPositionLeftKey]: left,
    [popoverButtonPositionTopKey]: top,
  });
}, 500);

makeElementDraggable({
  element: TogglePopoverButton,
  mover: TogglePopoverButtonMover,
  onMove: onMoveToggleButton,
});
/* header container */
const HeaderContainer = document.createElement("div");
HeaderContainer.id = "hvaid-header-container";
PopoverContainer.appendChild(HeaderContainer);

/* close icon */
const CloseIconContainer = document.createElement("div");

const CloseIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
CloseIcon.id = "hvaid-close-icon";
CloseIcon.setAttribute("viewBox", "0 0 24 24");
CloseIconContainer.id = "hvaid-close-icon-container";
CloseIconContainer.appendChild(CloseIcon);

const CloseIconPath = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
CloseIconPath.setAttribute(
  "d",
  "M 4.7070312 3.2929688 L 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 L 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 L 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 L 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z"
);
CloseIcon.appendChild(CloseIconPath);

HeaderContainer.appendChild(CloseIconContainer);

/* logo icon */
const getLogoIcon = () => {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      LogoContainer = document.createElement("div");
      LogoContainer.id = "hvaid-logo-container";
      LogoContainer.innerHTML = this.responseText;
      HeaderContainer.insertBefore(LogoContainer, HeaderContainer.firstChild);
    } else {
      // console.log("files not found");
    }
  };
  xhttp.open("GET", chrome.runtime.getURL("icons/logo.htm"), true);
  xhttp.send();
};
getLogoIcon();

/* popover icon */
const getPopoverIcon = () => {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      TogglePopoverButton.innerHTML = this.responseText;
    } else {
      // console.log("files not found");
    }
  };
  xhttp.open("GET", chrome.runtime.getURL("icons/popover-toggle.htm"), true);
  xhttp.send();
};
getPopoverIcon();

/* TogglePopoverButtonMover icon */
const getToggleButtonMoverIcon = () => {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      TogglePopoverButtonMover.innerHTML = this.responseText;
    } else {
      // console.log("files not found");
    }
  };
  xhttp.open("GET", chrome.runtime.getURL("icons/move.htm"), true);
  xhttp.send();
};
getToggleButtonMoverIcon();

// go back to default position for TogglePopoverButton
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === goToDefaultPositionMessage) {
    changeTogglePopoverButtonPosition({});
  }
  if (request.message === DOMTypeMessage) {
    sendResponse(getDocumentNotSupported());
  }
});
