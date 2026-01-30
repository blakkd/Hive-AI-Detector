// This is the service_worker. It runs in the background
import { post_data, MediaType } from "./utils/post_data.js";
import analyticsHelper from "./scripts/google-analytics.js";

// import { uuid } from './utils/uuid.js' // can't import uuids the way I want to
const showPopoverButtonKey = "show_popover_button";
const AgreedTermsAndConditionsKey = "agreed-terms-and-conditions";
const maxChars = 2048;
let clientId;

/* locale dependent text */
const failedToGetImageText = chrome.i18n.getMessage("failedToGetImageText");
const failedToGetAudioText = chrome.i18n.getMessage("failedToGetAudioText");
const failedToGetVideoText = chrome.i18n.getMessage("failedToGetVideoText");
const contentTypeInvalidText = chrome.i18n.getMessage("contentTypeInvalidText");

const prodUrl = "https://plugin.hivemoderation.com";

//on installation of chrome extension: create client id, create contextMenuItem, show popover icon, open installation complete page
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason == "install") {
    chrome.storage.sync.set({ [showPopoverButtonKey]: true });
  }

  chrome.contextMenus.create({
    id: "OpenSN",
    title: "Hive AI Detector",
    contexts: ["selection", "image", "video", "audio", "link"], // links so if an image is a link, we can still check it
  });
});

// const blob_to_base64 = (blob) =>
//   new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(blob);
//     reader.onloadend = () => {
//       const base64data = reader.result;
//       resolve(base64data);
//     };
//   });

const fetch_blob = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    // const base64 = await blob_to_base64(blob);
    return { blob };
  } catch {
    return { error: true };
  }
};

const is_img_ai = async (img_url) => {
  // TODO: update url
  const url = `${prodUrl}/api/v1/image/ai_detection`;

  const { error, blob: imgBlob } = await fetch_blob(img_url);
  if (error) {
    return { message: failedToGetImageText };
  }
  const formData = new FormData();
  formData.append("media", imgBlob);
  formData.append("request_id", crypto.randomUUID());
  return post_data(
    {
      url,
      options: { body: formData },
    },
    MediaType.IMAGE
  );
};

const is_text_ai = async (selection_text) => {
  const url = `${prodUrl}/api/v1/text/ai_detection`;
  const text_hive_response = await post_data(
    {
      url,
      data: {
        text: selection_text,
        request_id: crypto.randomUUID(),
      },
      options: {
        headers: { "Content-Type": "application/json" },
      },
    },
    MediaType.TEXT
  );
  return text_hive_response;
};

const is_audio_ai = async (audio_url, from_local_file = false) => {
  const url = `${prodUrl}/api/v1/audio/ai_detection`;

  const formData = new FormData();
  if (from_local_file) {
    const { error, blob: audioBlob } = await fetch_blob(audio_url);
    if (error) {
      return { message: failedToGetAudioText };
    }
    formData.append("media", audioBlob);
  } else {
    formData.append("url", audio_url);
  }
  formData.append("request_id", crypto.randomUUID());
  return post_data(
    {
      url,
      options: { body: formData },
    },
    MediaType.AUDIO
  );
};

const is_video_ai = async (video_url, from_local_file = false) => {
  // TODO: update url
  const url = `${prodUrl}/api/v1/video/ai_detection`;

  const formData = new FormData();
  if (from_local_file) {
    const { error, blob: videoBlob } = await fetch_blob(video_url);
    if (error) {
      return { message: failedToGetVideoText };
    }
    formData.append("media", videoBlob);
  } else {
    formData.append("url", video_url);
  }
  formData.append("request_id", crypto.randomUUID());
  return post_data({
    url,
    options: { body: formData },
  });
};

// Service worker is only alive for 30sec after request; should be suffficent here
// Would need to chagne for long videos
chrome.contextMenus.onClicked.addListener(async function (clickData) {
  // If navigate away will still alert on the original page
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (!tab) {
    // when using the context menu on a page not in focus, tab is undefined
    return;
  }
  if (clickData.menuItemId == "OpenSN") {
    let responsePayload = {};
    if (clickData.selectionText) {
      // this worker shouldn't be doing data munging(?)
      const { selectionText } = clickData;
      responsePayload = {
        ...responsePayload,
        mediaType: MediaType.TEXT,
        text: selectionText,
      };
      if (selectionText.length > maxChars) {
        chrome.tabs.sendMessage(tab.id, {
          type: "max-char-count-error",
        });
        return;
      }
    } else if (clickData.mediaType === "image") {
      // img by click or selection, but not if image is also a link
      // Is there a way to copy the image instead of getting img url?
      const { srcUrl } = clickData;
      responsePayload = {
        ...responsePayload,
        mediaType: MediaType.IMAGE,
        fileUrl: srcUrl,
      };
    } else if (clickData.mediaType === "audio") {
      const { srcUrl } = clickData;
      responsePayload = {
        ...responsePayload,
        mediaType: MediaType.AUDIO,
        fileUrl: srcUrl,
      };
    } else if (clickData.mediaType === "video") {
      const { srcUrl } = clickData;
      responsePayload = {
        ...responsePayload,
        mediaType: MediaType.VIDEO,
        fileUrl: srcUrl,
      };
    }

    const res = await chrome.storage.sync.get(AgreedTermsAndConditionsKey);
    if (!res[AgreedTermsAndConditionsKey]) {
      chrome.tabs.sendMessage(tab.id, {
        type: "need-to-agree-to-terms",
        payload: responsePayload,
      });
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: "start" });
    analyticsHelper.fireEvent(
      `context_menu_click_${responsePayload.mediaType}`
    );

    switch (responsePayload.mediaType) {
      case MediaType.TEXT: {
        responsePayload = {
          ...responsePayload,
          ...(await is_text_ai(responsePayload.text)),
        };
        break;
      }
      case MediaType.IMAGE: {
        responsePayload = {
          ...responsePayload,
          ...(await is_img_ai(responsePayload.fileUrl)),
        };
        break;
      }
      case MediaType.AUDIO: {
        responsePayload = {
          ...responsePayload,
          ...(await is_audio_ai(responsePayload.fileUrl)),
        };
        break;
      }
      case MediaType.VIDEO: {
        responsePayload = {
          ...responsePayload,
          ...(await is_video_ai(responsePayload.fileUrl)),
        };
        break;
      }
      default: {
        responsePayload = {
          ...responsePayload,
          message: contentTypeInvalidText,
        };
      }
    }

    chrome.tabs.sendMessage(tab.id, {
      type: "finish",
      payload: responsePayload,
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.mediaType) {
    case MediaType.TEXT:
      {
        (async () => {
          const response = await is_text_ai(request.text);
          sendResponse(response);
        })();
      }
      break;
    case MediaType.IMAGE:
      {
        (async () => {
          const response = await is_img_ai(
            request.fileUrl,
            request.fromLocalFile
          );
          sendResponse(response);
        })();
      }
      break;
    case MediaType.AUDIO:
      {
        (async () => {
          const response = await is_audio_ai(
            request.fileUrl,
            request.fromLocalFile
          );
          sendResponse(response);
        })();
      }
      break;
    case MediaType.VIDEO: {
      (async () => {
        const response = await is_video_ai(
          request.fileUrl,
          request.fromLocalFile
        );
        sendResponse(response);
      })();
    }
  }
  return true;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.analyticsEventType == null) {
    return;
  }
  const { analyticsEventType, params } = request;
  analyticsHelper.fireEvent(analyticsEventType, {
    ...params,
  });
});
