/* locale dependent text*/
const termsAndConditionsErrorMessage = chrome.i18n.getMessage(
  "termsAndConditionsErrorMessage"
);
const goBackFromTermsAndConditionsButtonText = chrome.i18n.getMessage(
  "goBackFromTermsAndConditionsButtonText"
);

const TermsAndConditionsPageContainer = document.createElement("div");
TermsAndConditionsPageContainer.id =
  "hvadi-terms-and-conditions-page-container";
let termsAndConditionsPageLoaded = false;

const getTermsAndConditionsPage = () => {
  removeAllChildNode(TermsAndConditionsPageContainer);

  const TermsAndConditionsPageContentContainer = document.createElement("div");
  TermsAndConditionsPageContainer.appendChild(
    TermsAndConditionsPageContentContainer
  );
  TermsAndConditionsPageContentContainer.id =
    "hvaid-terms-and-conditions-content-container";
  const TermsAndConditionsErrorMessage = document.createElement("div");
  TermsAndConditionsErrorMessage.innerText = termsAndConditionsErrorMessage;
  TermsAndConditionsErrorMessage.id =
    "hvaid-terms-and-conditions-error-message";
  TermsAndConditionsPageContentContainer.appendChild(
    TermsAndConditionsErrorMessage
  );

  const TermsAndConditionsPageCheckboxContainer =
    TermsAndConditionsContainer.cloneNode(true);

  const TermsAndConditionsPageCheckbox =
    TermsAndConditionsPageCheckboxContainer.querySelector(
      `[id=hvaid-term-of-service-checkbox-input]`
    );
  TermsAndConditionsPageContentContainer.appendChild(
    TermsAndConditionsPageCheckboxContainer
  );
  TermsAndConditionsPageCheckbox.addEventListener("click", () => {
    onChangeAgreedTermsAndConditionsKey(TermsAndConditionsPageCheckbox.checked);
    submitWithFormValue();
  });

  const TermsAndConditionsGoBackButtonContainer = document.createElement("div");
  TermsAndConditionsGoBackButtonContainer.id =
    "hvaid-terms-and-conditions-go-back-button-container";
  TermsAndConditionsPageContainer.append(
    TermsAndConditionsGoBackButtonContainer
  );
  const TermsAndConditionsGoBackButton = document.createElement("div");
  TermsAndConditionsGoBackButton.id =
    "hvaid-terms-and-conditions-go-back-button";
  TermsAndConditionsGoBackButtonContainer.appendChild(
    TermsAndConditionsGoBackButton
  );
  TermsAndConditionsGoBackButton.innerText =
    goBackFromTermsAndConditionsButtonText;
  TermsAndConditionsGoBackButton.addEventListener("click", () => {
    switchToFormState();
  });
};

const switchToTermsAndConditionsState = () => {
  page = { type: "terms-and-conditions" };
  if (!termsAndConditionsPageLoaded) {
    getTermsAndConditionsPage();
    termsAndConditionsPageLoaded = true;
  }
  PopoverContainer.removeChild(PopoverContainer.lastChild);
  PopoverContainer.appendChild(TermsAndConditionsPageContainer);
};
