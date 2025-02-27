/* file upload input */
const dragOngoingClassName = "hvaid-upload-ongoing";
const parseImgSrcRegex = /<img.*?src="([^">]*\/([^">]*?))".*?>/; // https://stackoverflow.com/questions/14939296/extract-image-src-from-a-string

/* locale dependent text*/
const fileDurationError = chrome.i18n.getMessage("fileDurationError");
const fileTypeError = chrome.i18n.getMessage("fileTypeError");

const handleFile = async (file, options = { isUrl: false, fileType: null }) => {
  if (!file) {
    return;
  }

  const { isUrl } = options;
  let fileType = options.fileType;
  if (fileType == null) {
    fileType = await findFileType(file);
  }

  if (fileType == null) {
    showFileError(fileTypeError, true);
    sendAnalyticsEvent(`unsupported_file_type`, { fileType: file.type });
    return;
  }
  handleDeleteFile();

  fileMediaType = fileType;
  fileObjectUrl = isUrl ? file.url : URL.createObjectURL(file);
  fileUrlFromLocalFile = !isUrl;

  toggleAllowedToSubmit();
  setIsRenderingPreview();
  hideFileError();

  if (fileType === MediaType.IMAGE) {
    const img = new Image();
    img.onload = function () {
      if (isRenderingPreview) {
        setIsNotRenderingPreview();
      } else {
        return;
      }
      const originalWidth = this.width;
      const originalHeight = this.height;
      if (!originalWidth || !originalHeight) {
        showIcon(ImageIcon);
        return;
      }
      const [width, height] = computeDimensions(originalWidth, originalHeight);

      const UploadedImage = document.createElement("img");

      UploadedImage.id = "hvaid-image-preview";
      UploadedImage.width = `${width}`;
      UploadedImage.height = `${height}`;
      UploadedImage.setAttribute("src", fileObjectUrl);

      replaceAddNewContent(UploadedImagePreviewOuter, UploadedImage, 1);
      goToPreview(UploadedImagePreviewOuter);
    };
    img.onerror = () => {
      showIcon(ImageIcon);
    };
    img.src = fileObjectUrl;
  } else if (fileType === MediaType.AUDIO) {
    const UploadedAudio = document.createElement("audio");
    UploadedAudio.onloadedmetadata = function () {
      if (isRenderingPreview) {
        setIsNotRenderingPreview();
        if (durationNotValid(this.duration)) {
          showFileError(fileDurationError);
          handleDeleteFile();
          return;
        }
      } else {
        return;
      }
      replaceAddNewContent(UploadedAudioPreviewOuter, UploadedAudio, 1);
      goToPreview(UploadedAudioSubContainer);
    };
    UploadedAudio.onerror = () => {
      showIcon(AudioIcon);
    };
    UploadedAudio.src = fileObjectUrl;
    UploadedAudio.controls = true;
    UploadedAudio.setAttribute(
      "controlslist",
      "nofullscreen nodownload novolume noplaybackrate"
    );
  } else {
    const UploadedVideo = document.createElement("video");
    UploadedVideo.onloadedmetadata = function () {
      if (isRenderingPreview) {
        setIsNotRenderingPreview();
        if (durationNotValid(this.duration)) {
          showFileError(fileDurationError);
          handleDeleteFile();
          return;
        }
        const originalWidth = this.videoWidth;
        const originalHeight = this.videoHeight;
        if (!originalWidth || !originalHeight) {
          showIcon(VideoIcon);
          return;
        }
        const [width, height] = computeDimensions(
          originalWidth,
          originalHeight
        );
        UploadedVideo.width = width;
        UploadedVideo.height = height;
      } else {
        return;
      }
      replaceAddNewContent(UploadedVideoPreviewOuter, UploadedVideo, 1);
      goToPreview(UploadedVideoPreviewOuter);
    };
    UploadedVideo.onerror = () => {
      showIcon(VideoIcon);
    };
    UploadedVideo.src = fileObjectUrl;
    UploadedVideo.controls = true;
    UploadedVideo.setAttribute(
      "controlslist",
      "nofullscreen nodownload noplaybackrate"
    );
  }
};

const handleChangeFileInput = (e) => {
  if (e.target.files === null || !e.target.files[0]) {
    return;
  }
  const file = e.target.files[0];
  sendAnalyticsEvent(`upload_fs_${getFileTypePrefix(file)}`, {
    fileType: getFileTypeStr(file),
  });
  handleFile(file);
};
UploadInput.addEventListener("change", handleChangeFileInput);
AudioUploadInput.addEventListener("change", handleChangeFileInput);

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  UploadDropArea.addEventListener(eventName, preventDefaults, false);
  ContentContainer.addEventListener(eventName, preventDefaults, false);
  AudioUploadDropArea.addEventListener(eventName, preventDefaults, false);
});

["dragenter", "dragover"].forEach((eventName) => {
  UploadDropArea.addEventListener(
    eventName,
    () => {
      UploadDropArea.classList.add(dragOngoingClassName);
    },
    false
  );
  ContentContainer.addEventListener(
    eventName,
    () => {
      ContentContainer.classList.add(dragOngoingClassName);
    },
    false
  );
  AudioUploadDropArea.addEventListener(
    eventName,
    () => {
      AudioUploadDropArea.classList.add(dragOngoingClassName);
    },
    false
  );
});
["dragleave", "drop"].forEach((eventName) => {
  UploadDropArea.addEventListener(
    eventName,
    () => {
      UploadDropArea.classList.remove(dragOngoingClassName);
    },
    false
  );
  ContentContainer.addEventListener(
    eventName,
    () => {
      ContentContainer.classList.remove(dragOngoingClassName);
    },
    false
  );
  AudioUploadDropArea.addEventListener(
    eventName,
    () => {
      AudioUploadDropArea.classList.remove(dragOngoingClassName);
    },
    false
  );
});

const handleDrop = (e, location) => {
  if (dropIsDisabled) {
    return;
  }
  const file = e.dataTransfer.files[0];
  if (file) {
    handleFile(file);
    sendAnalyticsEvent(`drag_drop_${getFileTypePrefix(file)}`, {
      location,
      type: "file",
      fileType: getFileTypeStr(file),
    });
  }
  const htmlStr = e.dataTransfer.getData("text/html");
  //// this approach has the url with escaped characters, with which the request to get image may fail
  // const parseRes = parseImgSrcRegex.exec(htmlStr);
  // if (parseRes) {
  //   handleFile({ url: parseRes[1] }, true);
  // }
  const htmlEle = new DOMParser().parseFromString(htmlStr, "text/html");
  let fileType = undefined;
  let srcUrl = undefined;
  const imageSrcUrl = htmlEle.querySelector("img")?.src;
  // const audioSrcUrl =
  //   htmlEle.querySelector("audio")?.src;
  if (imageSrcUrl) {
    fileType = MediaType.IMAGE;
    srcUrl = imageSrcUrl;
  }
  // else if (audioSrcUrl) {
  //   fileType = MediaType.AUDIO;
  //   srcUrl = audioSrcUrl;
  // }

  if (srcUrl) {
    handleFile({ url: srcUrl }, { isUrl: true, fileType });
    sendAnalyticsEvent(`drag_drop_${fileType}`, { location, type: "url" });
  }
};

UploadDropArea.addEventListener(
  "drop",
  (e) => {
    handleDrop(e, "Upload Area");
  },
  false
);
ContentContainer.addEventListener(
  "drop",
  (e) => {
    handleDrop(e, "Text Input");
  },
  false
);
AudioUploadDropArea.addEventListener(
  "drop",
  (e) => {
    handleDrop(e, "Upload Area");
  },
  false
);

// do not preventDefault here because the textarea needs the default paste functionality
const handlePaste = (e, location) => {
  e.stopPropagation();
  const clipboardData = e.clipboardData || window.clipboardData;
  const file = clipboardData.files[0];
  if (file) {
    e.preventDefault();
  }
  handleFile(file);
  sendAnalyticsEvent(`paste_file_${getFileTypePrefix(file)}`, {
    location,
    fileType: getFileTypeStr(file),
  });
};
UploadPasteArea.addEventListener(
  "paste",
  (e) => {
    e.preventDefault();
    handlePaste(e, "Image Upload Area");
  },
  false
);
ContentContainer.addEventListener("paste", (e) => {
  handlePaste(e, "Text Input");
});
AudioUploadPasteArea.addEventListener(
  "paste",
  (e) => {
    e.preventDefault();
    handlePaste(e, "Audio Upload Area");
  },
  false
);

const toggleContentEditable = (e) => {
  if (e.button === 2) UploadPasteArea.contentEditable = true;
  // wait just enough for 'contextmenu' to fire
  setTimeout(() => (UploadPasteArea.contentEditable = false), 20);
};
UploadPasteArea.addEventListener("mousedown", toggleContentEditable);

const toggleAudioContentEditable = (e) => {
  if (e.button === 2) AudioUploadPasteArea.contentEditable = true;
  // wait just enough for 'contextmenu' to fire
  setTimeout(() => (AudioUploadPasteArea.contentEditable = false), 20);
};
AudioUploadPasteArea.addEventListener("mousedown", toggleAudioContentEditable);
