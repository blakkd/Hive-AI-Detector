const MediaType = {
  TEXT: "text",
  IMAGE: "image",
  AUDIO: "audio",
  VIDEO: "video",
};
/* locale dependent text */
const errorMessageForFailedToParseResponse = chrome.i18n.getMessage(
  "errorMessageForFailedToParseResponse"
);
const fallbackErrorMessage = chrome.i18n.getMessage("fallbackErrorMessage");

const parseResponse = async (response) => {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    return json;
  } catch (err) {
    return {
      status_code: response.status,
      message: errorMessageForFailedToParseResponse,
    };
    // throw new Error("Did not receive JSON, instead received: " + text)
  }
};

const isStatusCodeNonSuccess = (n) => Math.floor(n / 100) !== 2;

const formatError = (e) => {
  return { message: e.message || fallbackErrorMessage };
};

async function post_data({ url = "", options, data = {} }, mediaType) {
  // TODO handle buffers
  try {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      // headers: {
      //   "Content-Type": "application/json",
      //   // 'Content-Type': 'application/x-www-form-urlencoded',
      // },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
      ...options,
    });
    const parsedResponse = await parseResponse(response);
    if (isStatusCodeNonSuccess(response.status)) {
      throw parsedResponse;
    }
    return parsedResponse;
  } catch (e) {
    return formatError(e);
  }
}
export { post_data, MediaType };
