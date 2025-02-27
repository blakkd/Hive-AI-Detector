/* error page container */
const insufficientCharsError = {
  title: "Insufficient text selected",
  details:
    "To improve the accuracy of the prediction, select a longer text with a minimum of 250 characters.",
};

const isTryAgainDisabledClassName = "hvaid-try-again-button-disabled";

let tryAgainEventHandler;

/* locale dependent text */
const goToMainPageButtonText = chrome.i18n.getMessage("goToMainPageButtonText");
const tryAgainButtonText = chrome.i18n.getMessage("tryAgainButtonText");

const ErrorPageContainer = document.createElement("div");
ErrorPageContainer.id = "hvaid-error-page-container";

const ErrorTitle = document.createElement("div");
ErrorTitle.id = "hvaid-error-title";

const ErrorDetails = document.createElement("div");
ErrorDetails.id = "hvaid-error-details";

const TryAgainButton = document.createElement("div");
TryAgainButton.innerHTML = tryAgainButtonText;
TryAgainButton.id = "hvaid-try-again-button";

let errorPageLoaded = false;

const getErrorPage = () => {
  removeAllChildNode(ErrorPageContainer);

  const ErrorContentContainer = document.createElement("div");
  ErrorContentContainer.id = "hvaid-error-content-container";
  ErrorPageContainer.appendChild(ErrorContentContainer);

  const WarningIconContainer = document.createElement("div");
  const WarningIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  WarningIcon.setAttribute("viewBox", "0 0 24 24");
  WarningIcon.setAttribute("focusable", "false");
  const WarningIconPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  WarningIconPath.setAttribute("fill", "currentColor");
  WarningIconPath.setAttribute(
    "d",
    "M23.119,20,13.772,2.15h0a2,2,0,0,0-3.543,0L.881,20a2,2,0,0,0,1.772,2.928H21.347A2,2,0,0,0,23.119,20ZM11,8.423a1,1,0,0,1,2,0v6a1,1,0,1,1-2,0Zm1.05,11.51h-.028a1.528,1.528,0,0,1-1.522-1.47,1.476,1.476,0,0,1,1.448-1.53h.028A1.527,1.527,0,0,1,13.5,18.4,1.475,1.475,0,0,1,12.05,19.933Z"
  );
  WarningIconContainer.appendChild(WarningIcon);
  WarningIcon.appendChild(WarningIconPath);
  WarningIcon.id = "hvaid-warning-icon";
  ErrorContentContainer.appendChild(WarningIconContainer);

  ErrorContentContainer.appendChild(ErrorTitle);
  ErrorContentContainer.appendChild(ErrorDetails);

  const ErrorButtonsContainer = document.createElement("div");
  ErrorButtonsContainer.id = "hvaid-error-buttons-container";
  ErrorPageContainer.appendChild(ErrorButtonsContainer);

  if (!getDocumentNotSupported()) {
    const GoBackButton = document.createElement("div");
    GoBackButton.innerHTML = goToMainPageButtonText;
    GoBackButton.id = "hvaid-error-go-back-button";
    GoBackButton.addEventListener("click", () => {
      handleDeleteFile();
      changeTextAreaValue("");
      switchToFormState();
    });
    ErrorButtonsContainer.appendChild(GoBackButton);
  } else {
    ErrorButtonsContainer.classList.add(
      "hvaid-error-buttons-container-no-go-back"
    );
  }
  ErrorButtonsContainer.appendChild(TryAgainButton);
};
const switchToErrorState = ({ error, handleTryAgain }) => {
  removeLoadingStyles();
  const { title, details } = error;
  sendAnalyticsEvent("error_page_view", { errorMessage: details });
  if (tryAgainEventHandler) {
    TryAgainButton.removeEventListener("click", tryAgainEventHandler);
  }
  if (handleTryAgain != null) {
    TryAgainButton.classList.remove(isTryAgainDisabledClassName);

    tryAgainEventHandler = handleTryAgain;
    TryAgainButton.addEventListener("click", tryAgainEventHandler);
  } else {
    TryAgainButton.classList.add(isTryAgainDisabledClassName);
  }
  page = { type: "error", payload: error };
  PopoverContainer.removeChild(PopoverContainer.lastChild);
  ErrorTitle.innerHTML = title;
  ErrorDetails.innerHTML = details;

  if (!errorPageLoaded) {
    getErrorPage();
    errorPageLoaded = true;
  }

  PopoverContainer.appendChild(ErrorPageContainer);
};
