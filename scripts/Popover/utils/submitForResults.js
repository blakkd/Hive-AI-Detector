const fetchResult = async (payload) => {
  const response = await chrome.runtime.sendMessage(payload);
  return response;
};

const handleSubmit = async (payload) => {
  if (isRenderingPreview) {
    setIsNotRenderingPreview(); // if user doesn't wait for the preview
  }
  switchToLoadingState();
  const response = await fetchResult(payload);
  if (response.message === "success") {
    switchToResultsState(response.data, payload);
  } else {
    switchToErrorState({
      error: {
        title: "Unable to fetch result",
        details: response.message,
      },
      handleTryAgain: () => handleSubmit(payload),
    });
  }
};

const submitWithFormValue = () => {
  if (!isSubmitAllowed) {
    return;
  }
  const submitPayload = {};
  if (typeof fileObjectUrl === "string") {
    submitPayload.fileUrl = fileObjectUrl;
    submitPayload.mediaType = fileMediaType;
    submitPayload.fromLocalFile = fileUrlFromLocalFile;
    sendAnalyticsEvent(`submit_button_click_send_${fileMediaType}`);
  } else {
    submitPayload.text = TextArea.value;
    submitPayload.mediaType = MediaType.TEXT;
    sendAnalyticsEvent(`submit_button_click_send_${MediaType.TEXT}`);
  }
  handleSubmit(submitPayload);
};

SubmitButton.addEventListener("click", submitWithFormValue);
