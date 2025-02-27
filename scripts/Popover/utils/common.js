function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

function sendAnalyticsEvent(analyticsEventType, params) {
  chrome.runtime.sendMessage({ analyticsEventType, params });
}

addEventListener("error", (e) => {
  if (e.error == null) {
    return;
  }
  sendAnalyticsEvent("error_in_content_script", { error: e.message });
});

const removeAllChildNode = (Parent, remainingCount = 0) => {
  while (Parent.children.length > remainingCount) {
    Parent.removeChild(Parent.lastChild);
  }
};

const replaceAddNewContent = (Container, NewContent, remainingCount) => {
  removeAllChildNode(Container, remainingCount);
  Container.appendChild(NewContent);
};
