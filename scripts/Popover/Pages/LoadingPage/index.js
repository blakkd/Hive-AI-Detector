const loadingSpinnerCircumference = 629;

/* locale dependent text */
const loadingText = chrome.i18n.getMessage("loadingText");

/* loading page */
const LoadingPageContainer = document.createElement("div");
LoadingPageContainer.id = "hvaid-loading-page-container";

let loadingPageLoaded = false;

const getLoadingPage = () => {
  removeAllChildNode(LoadingPageContainer);

  /* loading spinner */
  const LoadingSpinnerContainer = document.createElement("div");
  LoadingSpinnerContainer.id = "hvaid-loading-spinner-container";
  const LoadingSpinner = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );

  LoadingSpinner.setAttribute("viewBox", "0 0 250 250");
  LoadingSpinner.id = "hvaid-loading-spinner";
  const LoadingSpinnerCircle1 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  LoadingSpinnerCircle1.setAttribute("cx", "125");
  LoadingSpinnerCircle1.setAttribute("cy", "125");
  LoadingSpinnerCircle1.setAttribute("r", "100");
  LoadingSpinnerCircle1.setAttribute("stroke-width", "20px");
  LoadingSpinnerCircle1.id = "hvaid-loading-spinner-circle-1";

  const LoadingSpinnerCircle2 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  LoadingSpinnerCircle2.setAttribute("cx", "125");
  LoadingSpinnerCircle2.setAttribute("cy", "125");
  LoadingSpinnerCircle2.setAttribute("r", "100");
  LoadingSpinnerCircle2.setAttribute("stroke-width", "20px");
  LoadingSpinnerCircle2.setAttribute(
    "stroke-dasharray",
    loadingSpinnerCircumference
  );
  LoadingSpinnerCircle2.setAttribute(
    "stroke-dashoffset",
    loadingSpinnerCircumference * 0.75
  );
  LoadingSpinnerCircle2.id = "hvaid-loading-spinner-circle-2";

  LoadingSpinner.appendChild(LoadingSpinnerCircle1);
  LoadingSpinner.appendChild(LoadingSpinnerCircle2);

  LoadingSpinnerContainer.append(LoadingSpinner);
  LoadingPageContainer.appendChild(LoadingSpinnerContainer);

  const LoadingText = document.createElement("p");
  LoadingText.id = "hvaid-loading-text";
  LoadingText.innerHTML = loadingText;
  LoadingSpinnerContainer.appendChild(LoadingText);

  return LoadingPageContainer;
};

const switchToLoadingState = () => {
  page = { type: "loading" };
  if (!loadingPageLoaded) {
    getLoadingPage();
    loadingPageLoaded = true;
  }
  PopoverContainer.removeChild(PopoverContainer.lastChild);
  PopoverContainer.appendChild(LoadingPageContainer);
  addLoadingStyles();
};
