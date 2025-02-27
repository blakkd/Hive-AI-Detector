const preferedImageWidth = 276; // width of TextArea
const maxImageHeight = (preferedImageWidth * (1 + Math.sqrt(5))) / 2;
const VideoAudioDuration = 30;

let isRenderingPreview = false;
let dropIsDisabled = false;

const changeContent = (newContent) => {
  if (
    ContentContainer.children[0] &&
    ContentContainer.children[0] != newContent
  ) {
    ContentContainer.removeChild(ContentContainer.children[0]);
  }
  ContentContainer.appendChild(newContent);
};

const goToTextInput = () => {
  changeContent(TextBoxContainer);
};
const goToPreview = (PreviewContent) => {
  replaceAddNewContent(UploadedPreviewContainer, PreviewContent);
  changeContent(UploadedPreviewContainer);
  changeTextAreaValue("");
};
const goToProgressOverlay = () => {
  changeContent(ContentOverlay);
};

const handleDeleteFile = () => {
  goToTextInput();
  fileObjectUrl = null;
  URL.revokeObjectURL(fileObjectUrl);
  if (PreviewEle) {
    UploadedPreviewContainer.removeChild(PreviewEle);
  }
  PreviewEle = null;
  UploadInput.value = "";
  AudioUploadInput.value = "";
  toggleAllowedToSubmit();
};

const enableInputs = () => {
  TextArea.disabled = false;
  UploadInput.disabled = false;
  AudioUploadInput.disabled = false;
  dropIsDisabled = false;
};
const disableInputs = () => {
  TextArea.disabled = true;
  UploadInput.disabled = true;
  AudioUploadInput.disabled = true;
  dropIsDisabled = true;
};
const setIsRenderingPreview = () => {
  isRenderingPreview = true;
  goToProgressOverlay();
  disableInputs();
};
const setIsNotRenderingPreview = () => {
  isRenderingPreview = false;
  ContentContainer.removeChild(ContentOverlay);
  enableInputs();
};

const showIcon = (Icon) => {
  if (isRenderingPreview) {
    setIsNotRenderingPreview();
  }
  replaceAddNewContent(IconContainer, Icon, 1);
  goToPreview(IconContainerOuter);
};

const computeDimensions = (
  originalWidth,
  originalHeight,
  _maxHeight = null,
  _preferedWidth = null
) => {
  const maxHeight = _maxHeight || maxImageHeight;
  const preferedWidth = _preferedWidth || preferedImageWidth;
  const ratio = originalHeight / originalWidth;
  const predicatedHeight = preferedWidth * ratio;
  const predicatedWidth = maxHeight / ratio;

  const shouldRespectWidth = predicatedHeight <= maxHeight;
  const width = shouldRespectWidth ? preferedWidth : predicatedWidth;
  const height = shouldRespectWidth ? predicatedHeight : maxHeight;
  return [width, height];
};

const durationNotValid = (duration) => {
  return duration != null && !isNaN(duration) && duration > VideoAudioDuration;
};

const preventDefaults = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const getFileTypeStr = (file) => {
  try {
    return file.type || "";
  } catch {
    return "";
  }
};

const getFileTypePrefix = (file) => {
  return getFileTypeStr(file).split("/")[0];
};

const videoSignatures = {
  ["1a45dfa3"]: "video/x-matroska",
};
const findFileTypeFromBytes = async (_file) => {
  try {
    const file = _file.slice(0, 4); //read the first 4 bytes of the file for performance
    const type = await new Promise((resolve, reject) => {
      var fileReader = new FileReader();
      fileReader.onloadend = function (e) {
        const arr = new Uint8Array(e.target.result);
        let header = "";
        for (var i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        header = header.toLowerCase();
        if (header in videoSignatures) {
          resolve(videoSignatures[header]);
        } else {
          reject("type not valid");
        }
      };
      fileReader.onerror = () => {
        reject("type not valid");
      };
      fileReader.readAsArrayBuffer(file);
    });
    return type;
  } catch (e) {
    return null;
  }
};

const findFileType = async (file) => {
  let mimeType = file.type;
  if (!mimeType) {
    mimeType = await findFileTypeFromBytes(file);
  }
  let fileType;
  if (mimeType) {
    if (supportedImageTypes.includes(mimeType)) {
      fileType = MediaType.IMAGE;
    } else if (supportedAudioTypes.includes(mimeType)) {
      fileType = MediaType.AUDIO;
    } else if (supportedVideoTypes.includes(mimeType)) {
      fileType = MediaType.VIDEO;
    }
  }
  return fileType;
};
