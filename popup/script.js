import analyticsHelper from "../scripts/google-analytics.js";

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const showPopoverButtonKey = "show_popover_button";
const popoverButtonPositionLeftKey = "popover_button_position_left";
const popoverButtonPositionTopKey = "popover_button_position_top";

const goToDefaultPositionMessage = "set-toggle-button-to-default-position";
const DOMTypeMessage = "DOM-type-unsupported";

const ToggleButton = document.getElementById("hvaid-toggle-button");
const handleTogglePopover = debounce(() => {
  analyticsHelper.fireEvent(
    `${ToggleButton.checked ? "hide" : "show"}_popover_button`
  );
  chrome.storage.sync.set({ [showPopoverButtonKey]: ToggleButton.checked });
});
ToggleButton.addEventListener("click", handleTogglePopover);

const showPopoverButtonResult = await chrome.storage.sync.get(
  showPopoverButtonKey
);
if (typeof showPopoverButtonResult[showPopoverButtonKey] != "boolean") {
  chrome.storage.sync.set({ [showPopoverButtonKey]: ToggleButton.checked });
} else {
  ToggleButton.checked = showPopoverButtonResult[showPopoverButtonKey];
}

// Dark mode setup
const darkModeKey = "dark_mode_enabled";
const DarkModeToggle = document.getElementById("hvaid-dark-mode-toggle-button");
const handleToggleDarkMode = debounce(() => {
  const isEnabled = DarkModeToggle.checked;
  chrome.storage.sync.set({ [darkModeKey]: isEnabled });
  if (isEnabled) {
    document.body.classList.add("dark-mode");
    // Also apply to popover if it exists
    const popoverContainer = document.getElementById("hvaid-popover-container");
    if (popoverContainer) {
      popoverContainer.classList.add("dark-mode");
    }
  } else {
    document.body.classList.remove("dark-mode");
    // Also remove from popover if it exists
    const popoverContainer = document.getElementById("hvaid-popover-container");
    if (popoverContainer) {
      popoverContainer.classList.remove("dark-mode");
    }
  }
});
DarkModeToggle.addEventListener("click", handleToggleDarkMode);
const darkModeResult = await chrome.storage.sync.get(darkModeKey);
if (typeof darkModeResult[darkModeKey] != "boolean") {
  chrome.storage.sync.set({ [darkModeKey]: false });
} else {
  DarkModeToggle.checked = darkModeResult[darkModeKey];
  if (darkModeResult[darkModeKey]) {
    document.body.classList.add("dark-mode");
  }
}

/* logo icon */
const TitleContainerInner = document.getElementById(
  "hvaid-title-container-inner"
);
const getLogoIcon = () => {
  let LogoContainer;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      LogoContainer = document.createElement("div");
      LogoContainer.innerHTML = this.responseText;
      TitleContainerInner.appendChild(LogoContainer);
      updateLogoColors();
    } else {
      // console.log("files not found");
    }
  };
  xhttp.open("GET", chrome.runtime.getURL("icons/logo.htm"), true);
  xhttp.send();
};
getLogoIcon();

/* Update logo colors based on theme */
const updateLogoColors = () => {
  const logoResetPaths = document.querySelectorAll('.hvaid-logo-reset-path');
  if (document.body.classList.contains('dark-mode')) {
    logoResetPaths.forEach(path => {
      path.setAttribute('fill', '#e0e0e0');
    });
  } else {
    logoResetPaths.forEach(path => {
      path.setAttribute('fill', '#313131');
    });
  }
};


const goToDefaultPosition = () => {
  analyticsHelper.fireEvent("go_to_default_popover_button_position");
  chrome.storage.sync
    .get([popoverButtonPositionLeftKey, popoverButtonPositionTopKey])
    .then((res) => {
      if (
        res[popoverButtonPositionLeftKey] == null &&
        res[popoverButtonPositionTopKey] == null
      ) {
        return;
      } else {
        chrome.storage.sync.remove([
          popoverButtonPositionLeftKey,
          popoverButtonPositionTopKey,
        ]);
        chrome.tabs.query(
          { currentWindow: true, active: true },
          function (tabs) {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {
              message: goToDefaultPositionMessage,
            });
          }
        );
      }
    });
};

const GoToDefaultPositionButton = document.getElementById(
  "hvaid-back-to-default-position-icon"
);
GoToDefaultPositionButton.addEventListener("click", goToDefaultPosition);

const showContentTypeError = (domNotSupported) => {
  if (domNotSupported) {
    const PopupContainer = document.getElementById("hvaid-popup-container");
    const error = document.createElement("div");
    error.innerText =
      "On this page, only text selection from context menu is supported.";
    error.id = "hvaid-popup-content-type-error";
    PopupContainer.appendChild(error);
  }
};

const getDOMContentType = () => {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(
        activeTab.id,
        { message: DOMTypeMessage },
        showContentTypeError
      );
    }
  );
};
getDOMContentType();
