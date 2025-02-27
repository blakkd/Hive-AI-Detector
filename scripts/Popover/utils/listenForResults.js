/* locale dependent text*/
const maxCharsExceededMessage = chrome.i18n.getMessage(
  "maxCharsExceededMessage"
);
const maxCharsExceededMessageExplanation = chrome.i18n.getMessage(
  "maxCharsExceededMessageExplanation"
);

const handleRequestPayload = (request) => {
  if (request?.payload?.mediaType === MediaType.TEXT) {
    const selectedText = request?.payload?.text;
    changeTextAreaValue(selectedText);
  } else {
    const { fileUrl, mediaType } = request?.payload;
    handleFile({ url: fileUrl }, { isUrl: true, fileType: mediaType });
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "start": {
      switchToLoadingState();
      if (!isPopoverOpen) {
        togglePopover();
      }
      return;
    }
    case "finish": {
      const retryPayload = request.payload;

      if (request.payload.message === "success") {
        switchToResultsState(request.payload.data, retryPayload);
      } else {
        switchToErrorState({
          error: {
            title: "Unable to fetch result",
            details: request.payload.message,
          },
          ...(retryPayload
            ? { handleTryAgain: () => handleSubmit(retryPayload) }
            : {}),
        });
      }
      return;
    }
    case "need-to-agree-to-terms": {
      handleRequestPayload(request);
      switchToTermsAndConditionsState();
      if (!isPopoverOpen) {
        togglePopover();
      }
      return;
    }
    case "max-char-count-error": {
      switchToErrorState({
        error: {
          title: "Maxmimum number of characters exceeded.",
          details: `The maximum number of allowed characters is ${maxChars}`,
        },
      });
      if (!isPopoverOpen) {
        togglePopover();
      }
    }
  }
});
