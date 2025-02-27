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
    } else {
      // console.log("files not found");
    }
  };
  xhttp.open("GET", chrome.runtime.getURL("icons/logo.htm"), true);
  xhttp.send();
};
getLogoIcon();

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
