const containers = [
  CloseIconContainer,
  FormPageContainer,
  ErrorPageContainer,
  ResultsPageContainer,
  TermsAndConditionsPageContainer,
];
const events = ["mousedown", "click", "mouseup", "mousemove"];

for (const c of containers) {
  for (const e of events) {
    c.addEventListener(e, (e) => {
      e.stopPropagation();
    });
  }
}
