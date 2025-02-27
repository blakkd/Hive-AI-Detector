// terms and condition container
const TermsAndConditionsContainer = document.createElement("div");
TermsAndConditionsContainer.id = "hvaid-term-of-service-container";

const TermsAndConditionsCheckbox = document.createElement("label");
TermsAndConditionsCheckbox.id = "hvaid-term-of-service-checkbox";
TermsAndConditionsContainer.appendChild(TermsAndConditionsCheckbox);

const TermsAndConditionsCheckboxInput = document.createElement("input");
TermsAndConditionsCheckboxInput.id = "hvaid-term-of-service-checkbox-input";
TermsAndConditionsCheckboxInput.type = "checkbox";
TermsAndConditionsCheckbox.appendChild(TermsAndConditionsCheckboxInput);

const TermsAndConditionsCheckboxCheckmark = document.createElement("div");
TermsAndConditionsCheckboxCheckmark.id =
  "hvaid-term-of-service-checkbox-checkmark";
TermsAndConditionsCheckbox.appendChild(TermsAndConditionsCheckboxCheckmark);

const TermsAndConditionsText = document.createElement("p");
TermsAndConditionsText.id = "hvaid-term-of-service-text";
TermsAndConditionsText.appendChild(document.createTextNode("I agree with the"));
TermsAndConditionsContainer.appendChild(TermsAndConditionsText);

const TermsAndConditionsTextLinkContainer = document.createElement("span");
TermsAndConditionsTextLinkContainer.id =
  "hvaid-term-of-service-text-link-container";
const TermsAndConditionsTextLink = document.createElement("a");
TermsAndConditionsTextLink.innerText = "Terms and Conditions";
TermsAndConditionsTextLink.id = "hvaid-term-of-service-text-link";
TermsAndConditionsTextLink.href = "https://thehive.ai/terms-of-use";
TermsAndConditionsTextLink.target = "_blank";
TermsAndConditionsTextLinkContainer.appendChild(TermsAndConditionsTextLink);
TermsAndConditionsText.appendChild(TermsAndConditionsTextLinkContainer);

const showTermsAndConditions = () => {
  chrome.storage.sync.get(AgreedTermsAndConditionsKey).then((res) => {
    if (!res[AgreedTermsAndConditionsKey]) {
      DividerLine.after(TermsAndConditionsContainer);
    }
    hasAgreedTermsAndConditions = res[AgreedTermsAndConditionsKey];
  });
};
showTermsAndConditions();
const onChangeAgreedTermsAndConditionsKey = (value) => {
  chrome.storage.sync.set({
    [AgreedTermsAndConditionsKey]: value,
  });
  hasAgreedTermsAndConditions = value;
  if (hasAgreedTermsAndConditions) {
    FormPageContainer.removeChild(TermsAndConditionsContainer);
  }
  toggleAllowedToSubmit();
};
TermsAndConditionsCheckboxInput.addEventListener("click", () => {
  onChangeAgreedTermsAndConditionsKey(TermsAndConditionsCheckboxInput.checked);
});
