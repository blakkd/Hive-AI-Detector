const maxChars = 2048;
const minChars = 1;
const disabledSubmitButtonClassName = "hvaid-submit-button-disabled";

const AgreedTermsAndConditionsKey = "agreed-terms-and-conditions";
let hasAgreedTermsAndConditions = false;
let fileObjectUrl = null;
let fileMediaType = null;
let fileUrlFromLocalFile = false;
let PreviewEle = null;
let uploadIsActive = false;

let textareaErrorMessage = false;

let isSubmitAllowed = false;

const MediaType = {
  TEXT: "text",
  IMAGE: "image",
  AUDIO: "audio",
  VIDEO: "video",
};

/* locale dependent text*/
const textAreaPlaceholder = chrome.i18n.getMessage("textAreaPlaceholder");
const charCountText = chrome.i18n.getMessage("charCountText");
const imageUploadOrPasteAreaText = chrome.i18n.getMessage(
  "imageUploadOrPasteAreaText"
);
const audioUploadOrPasteAreaText = chrome.i18n.getMessage(
  "audioUploadOrPasteAreaText"
);
const audioUploadFileRequirements = chrome.i18n.getMessage(
  "audioUploadFileRequirements"
);
const submitButtonText = chrome.i18n.getMessage("submitButtonText");

const fileTypeErrorMessage = chrome.i18n.getMessage("fileTypeErrorMessage");
const imageTypeName = chrome.i18n.getMessage("imageTypeName");
const audioTypeName = chrome.i18n.getMessage("audioTypeName");
const videoTypeName = chrome.i18n.getMessage("videoTypeName");

const previewNotAvailableMessage = chrome.i18n.getMessage(
  "previewNotAvailableMessage"
);

const supportedImageTypes = ["image/png", "image/jpeg", "image/webp"];
const supportedVideoTypes = [
  "video/mp4",
  "video/webm",
  "video/avi",
  "video/x-matroska",
  "video/x-ms-wmv",
  "video/quicktime",
];
const supportedAudioTypes = [
  "audio/flac",
  "audio/ogg",
  "audio/wav",
  "audio/mpeg",
  "audio/x-m4a",
];

const supportedImageTypeNames = supportedImageTypes.map(
  (type) => type.split("/")[1]
);
const supportedVideoTypeNames = supportedVideoTypes
  .slice(0, 3)
  .map((type) => type.split("/")[1])
  .concat(["mkv", "wmv", "mov"]);

const supportedAudioTypeNames = supportedAudioTypes
  .slice(0, 3)
  .map((type) => type.split("/")[1])
  .concat(["mp3", "m4a"]);

/* form page (first page) of Popover */
const FormPageContainer = document.createElement("div");
FormPageContainer.id = "hvaid-form-container";
PopoverContainer.appendChild(FormPageContainer);

// content container
const ContentContainer = document.createElement("div");
ContentContainer.id = "hvaid-content-container";
FormPageContainer.appendChild(ContentContainer);

const UploadedPreviewContainer = document.createElement("div");
UploadedPreviewContainer.id = "hvaid-preview-container";

const UploadedImagePreviewOuter = document.createElement("div");
UploadedImagePreviewOuter.id = "hvaid-image-preview-container";

const UploadedVideoPreviewOuter = document.createElement("div");
UploadedVideoPreviewOuter.id = "hvaid-video-preview-container";

const UploadedAudioSubContainer = document.createElement("div");
UploadedAudioSubContainer.id = "hvaid-audio-preview-container";
const UploadedAudioPreviewOuter = document.createElement("div");
UploadedAudioPreviewOuter.id = "hvaid-audio-preview-outer";
UploadedAudioSubContainer.appendChild(UploadedAudioPreviewOuter);

const IconContainerOuter = document.createElement("div");
IconContainerOuter.id = "hvaid-icon-preview-container-outer";

const IconContainer = document.createElement("div");
IconContainer.id = "hvaid-icon-preview-container-inner";
IconContainerOuter.appendChild(IconContainer);

const PreviewNotAvailableMessage = document.createElement("p");
PreviewNotAvailableMessage.id = "hvaid-icon-preview-not-available";
PreviewNotAvailableMessage.innerText = previewNotAvailableMessage;
IconContainerOuter.appendChild(PreviewNotAvailableMessage);

const ImageIcon = document.createElement("div");
ImageIcon.className = "hvaid-icon";
const AudioIcon = document.createElement("div");
AudioIcon.id = "hvaid-audio-icon";
const VideoIcon = document.createElement("div");
VideoIcon.className = "hvaid-icon";

// loading preview
const ContentOverlay = document.createElement("div");
ContentOverlay.id = "hvaid-content-overlay";
const RenderImageSpinnerOuter = document.createElement("div");
RenderImageSpinnerOuter.id = "hvaid-render-image-spinner-outer";
const RenderImageSpinnerInner = document.createElement("div");
RenderImageSpinnerInner.appendChild(document.createElement("div"));
RenderImageSpinnerInner.id = "hvaid-render-image-spinner-inner";
RenderImageSpinnerOuter.appendChild(RenderImageSpinnerInner);
ContentOverlay.appendChild(RenderImageSpinnerOuter);
ContentOverlay.appendChild(document.createTextNode("Loading preview"));

// text input box
const TextBoxContainer = document.createElement("div");
TextBoxContainer.id = "hvaid-text-box-container";
const TextArea = document.createElement("textarea");
const WordCount = document.createElement("p");

TextArea.id = "hvaid-text-area";
TextArea.setAttribute("rows", "10");
TextArea.setAttribute("maxlength", maxChars);

TextArea.setAttribute("placeholder", textAreaPlaceholder);
WordCount.id = "hvaid-word-count";
WordCount.innerText = `0/${maxChars} ${charCountText}`;

TextBoxContainer.appendChild(TextArea);
TextBoxContainer.appendChild(WordCount);
ContentContainer.append(TextBoxContainer);

const FileErrorContainer = document.createElement("div");
FileErrorContainer.id = "hvaid-file-error-container";
FormPageContainer.appendChild(FileErrorContainer);
const FileErrorMessageContainer = document.createElement("div");
FileErrorMessageContainer.id = "hvaid-file-error-message-container";
const FileErrorMessage = document.createElement("p");
FileErrorMessage.id = "hvaid-file-error-message";
FileErrorMessageContainer.appendChild(FileErrorMessage);
FileErrorContainer.appendChild(FileErrorMessageContainer);

const FileTypesContainer = document.createElement("div");
FileTypesContainer.id = "hvaid-file-types-container";
FileErrorContainer.appendChild(FileTypesContainer);

const addFileTypes = (typeName, allowedList) => {
  const FileTypeList = document.createElement("p");
  FileTypeList.className = "hvaid-file-type-list";
  FileTypeList.textContent = `${typeName}: ${allowedList.join(", ")}`;
  FileTypesContainer.appendChild(FileTypeList);
};

addFileTypes(imageTypeName, supportedImageTypeNames);
addFileTypes(audioTypeName, supportedAudioTypeNames);
addFileTypes(videoTypeName, supportedVideoTypeNames);

const showFileError = (message, showTypes) => {
  FileErrorContainer.style.visibility = "visible";
  FileErrorMessage.innerText = message;
  if (showTypes) {
    FileTypesContainer.style.display = "block";
  } else {
    FileTypesContainer.style.display = "none";
  }
};
const hideFileError = () => {
  FileErrorContainer.style.visibility = "hidden";
  FileTypesContainer.style.display = "none";
  FileErrorMessage.innerText = "";
};

// upload input
const UploadInputContainer = document.createElement("div");
UploadInputContainer.className = "hvaid-upload-input-container";
FormPageContainer.appendChild(UploadInputContainer);

const UploadInputForm = document.createElement("form");
UploadInputForm.className = "upload-input-form";
UploadInputContainer.appendChild(UploadInputForm);

const UploadInput = document.createElement("input");
UploadInput.id = "hvaid-upload-input";
UploadInput.className = "hvaid-upload-input";
UploadInput.setAttribute("type", "file");
UploadInput.setAttribute("multiple", false);
UploadInput.setAttribute(
  "accept",
  [...supportedImageTypes, ...supportedAudioTypes, ...supportedVideoTypes].join(
    ", "
  )
);
UploadInputForm.appendChild(UploadInput);

const UploadDropArea = document.createElement("label");
UploadDropArea.className = "hvaid-upload-drop-area";
UploadDropArea.setAttribute("for", UploadInput.id);
UploadInputForm.appendChild(UploadDropArea);

const UploadInputLabelTextContainer = document.createElement("div");
const UploadInputLabelText = document.createElement("p");

UploadInputLabelTextContainer.className =
  "hvaid-upload-input-label-text-container";
UploadInputLabelText.className = "hvaid-upload-input-label-text";
UploadInputLabelText.innerText = imageUploadOrPasteAreaText;
UploadInputLabelTextContainer.appendChild(UploadInputLabelText);

UploadDropArea.appendChild(UploadInputLabelTextContainer);

const UploadPasteArea = document.createElement("div");
UploadPasteArea.className = "hvaid-upload-paste-area";
UploadPasteArea.contentEditable = true;
UploadPasteArea.tabIndex = -1;
UploadDropArea.appendChild(UploadPasteArea);

// audio upload input
const AudioUploadInputContainer = document.createElement("div");
AudioUploadInputContainer.className = "hvaid-upload-input-container";
FormPageContainer.appendChild(AudioUploadInputContainer);

const AudioUploadInputForm = document.createElement("form");
AudioUploadInputForm.className = "upload-input-form";
AudioUploadInputContainer.appendChild(AudioUploadInputForm);

const AudioUploadInput = document.createElement("input");
AudioUploadInput.id = "hvaid-audio-upload-input";
AudioUploadInput.className = "hvaid-upload-input";
AudioUploadInput.setAttribute("type", "file");
AudioUploadInput.setAttribute("multiple", false);
AudioUploadInput.setAttribute(
  "accept",
  [...supportedImageTypes, ...supportedAudioTypes, ...supportedVideoTypes].join(
    ", "
  )
);
AudioUploadInputForm.appendChild(AudioUploadInput);

const AudioUploadDropArea = document.createElement("label");
AudioUploadDropArea.className = "hvaid-upload-drop-area";
AudioUploadDropArea.id = "hvaid-audio-upload-drop-area";
AudioUploadDropArea.setAttribute("for", AudioUploadInput.id);
AudioUploadInputForm.appendChild(AudioUploadDropArea);

const AudioUploadInputLabelTextContainer = document.createElement("div");
const AudioUploadInputLabelText = document.createElement("p");
const AudioUploadInputLabelTextRequirements = document.createElement("p");

AudioUploadInputLabelTextContainer.className =
  "hvaid-upload-input-label-text-container";
AudioUploadInputLabelText.className = "hvaid-upload-input-label-text";
AudioUploadInputLabelText.innerText = audioUploadOrPasteAreaText;
AudioUploadInputLabelTextRequirements.className =
  "hvaid-upload-input-label-text-requirements";
AudioUploadInputLabelTextRequirements.innerText = audioUploadFileRequirements;
AudioUploadInputLabelText.appendChild(AudioUploadInputLabelTextRequirements);
AudioUploadInputLabelTextContainer.appendChild(AudioUploadInputLabelText);

AudioUploadDropArea.appendChild(AudioUploadInputLabelTextContainer);

const AudioUploadPasteArea = document.createElement("div");
AudioUploadPasteArea.className = "hvaid-upload-paste-area";
AudioUploadPasteArea.contentEditable = true;
AudioUploadPasteArea.tabIndex = -1;
AudioUploadDropArea.appendChild(AudioUploadPasteArea);

// divider line
const DividerLine = document.createElement("div");
DividerLine.id = "hvaid-divider-line";
FormPageContainer.appendChild(DividerLine);

// submit button container
const SubmitButtonContainer = document.createElement("div");
const SubmitButton = document.createElement("button");
SubmitButtonContainer.id = "hvaid-submit-button-container";
SubmitButton.innerText = submitButtonText;
SubmitButton.classList.add(disabledSubmitButtonClassName);
SubmitButtonContainer.appendChild(SubmitButton);
FormPageContainer.append(SubmitButtonContainer);

const toggleAllowedToSubmit = () => {
  if (
    hasAgreedTermsAndConditions &&
    (typeof fileObjectUrl === "string" || TextArea.value.length >= minChars)
  ) {
    isSubmitAllowed = true;
    SubmitButton.classList.remove(disabledSubmitButtonClassName);
  } else {
    isSubmitAllowed = false;
    SubmitButton.classList.add(disabledSubmitButtonClassName);
  }
};

const switchToFormState = () => {
  page = { type: "form" };
  PopoverContainer.removeChild(PopoverContainer.lastChild);
  PopoverContainer.appendChild(FormPageContainer);
};
