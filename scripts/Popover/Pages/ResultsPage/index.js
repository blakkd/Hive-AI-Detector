/* locale dependent text */
const resultPrefixText = chrome.i18n.getMessage("resultPrefixText");
const videoResultPrefixTextPreposition = chrome.i18n.getMessage(
  "videoResultPrefixTextPreposition"
);
const videoResultPrefixText = chrome.i18n.getMessage("videoResultPrefixText");
const editTextButtonText = chrome.i18n.getMessage("editTextButtonText");
const scanNewButtonText = chrome.i18n.getMessage("scanNewButtonText");
const videoPreviewNotAvailableMessage = chrome.i18n.getMessage(
  "previewNotAvailableMessage"
);
const noResultMessage = chrome.i18n.getMessage("noResultMessage");

const blueStrokeClassName = "hvaid-blue-stroke";
const redStrokeClassName = "hvaid-red-stroke";
const blueTextClassName = "hvaid-blue-text";
const redTextClassName = "hvaid-red-text";
const colorArray = [
  "#62CD2E",
  "#FF2E54",
  "#FFBD33",
  "#D44615",
  "#5499C7",
  "#5D6D7E",
  "#3B67AA",
  "#73C6B6",
  "#A569BD",
];
const resultWheelCircumference = 629;

const preferredVideoHeight = 250;
const maxWidth = 250;

const classListTitleTimeClassName = "hvaid-results-class-list-title-time";
const classListItemScoreClassName = "hvaid-results-class-list-item-score";
const classListOuterContainerClassName =
  "hvaid-results-class-list-container-outer";
const classListInnerContainerClassName =
  "hvaid-results-class-list-container-inner";
const videoResultTextTimeClassName = "hvaid-video-results-text-time";

const ResultsPageContainer = document.createElement("div");
ResultsPageContainer.id = "hvaid-results-page-container";

const ResultsPageLeftColumn = document.createElement("div");
ResultsPageLeftColumn.id = "hvaid-results-page-left-column";

const ResultsPageRightColumn = document.createElement("div");
ResultsPageRightColumn.id = "hvaid-results-page-right-column";
ResultsPageContainer.appendChild(ResultsPageRightColumn);

const ResultsPageOverallScoreContainer = document.createElement("div");
ResultsPageOverallScoreContainer.id = "hvaid-results-overall-score";
ResultsPageRightColumn.appendChild(ResultsPageOverallScoreContainer);

const ResultPercentageWheelListContainer = document.createElement("div");
ResultPercentageWheelListContainer.id =
  "hvaid-result-percentage-wheel-List-container";
ResultsPageRightColumn.appendChild(ResultPercentageWheelListContainer);

const MediaPlayerContainer = document.createElement("div");
MediaPlayerContainer.id = "hvaid-result-media-player-container";
ResultsPageRightColumn.appendChild(MediaPlayerContainer);

/* results explanation */
const ResultsExplanationContainer = document.createElement("div");
ResultsExplanationContainer.id = "hvaid-results-explanation-container";
ResultsPageRightColumn.appendChild(ResultsExplanationContainer);

const showResultExplanations = ({ id, text }) => {
  let isShown = false;
  for (const child of ResultsExplanationContainer.childNodes) {
    if (child.id === id) {
      isShown = true;
      break;
    }
  }
  removeAllChildNode(ResultsExplanationContainer);
  if (!isShown) {
    const ResultExplanationDetails = document.createElement("div");
    ResultExplanationDetails.id = id;
    ResultExplanationDetails.innerHTML = text;
    ResultExplanationDetails.className = "hvaid-results-explanation-details";
    ResultsExplanationContainer.appendChild(ResultExplanationDetails);
  }
};

const {
  ResultPercentageWheelContainer: ResultPercentageWheelContainerLeft,
  showResultTextPrefix: showResultTextPrefixLeft,
  changeResultTextFromScore: changeResultTextFromScoreLeft,
  cleanupResultsWheel: cleanupResultsWheelLeft,
  changeResultWheelTime: changeResultWheelTimeLeft,
  updateResultWheel: updateResultWheelLeft,
} = getResultsWheel({
  id: "hvaid-results-wheel-container-left",
  showResultExplanations,
});

const {
  ResultPercentageWheelContainer: ResultPercentageWheelContainerRight,
  showResultTextPrefix: showResultTextPrefixRight,
  changeResultTextFromScore: changeResultTextFromScoreRight,
  cleanupResultsWheel: cleanupResultsWheelRight,
  changeResultWheelTime: changeResultWheelTimeRight,
  updateResultWheel: updateResultWheelRight,
} = getResultsWheel({
  id: "hvaid-results-wheel-container-right",
  showResultExplanations,
});

/* video container for video results */
const VideoContainer = document.createElement("div");
VideoContainer.className = "hvaid-results-media-container";
VideoContainer.id = "hvaid-results-video-container";
ResultsPageLeftColumn.appendChild(VideoContainer);

/* audio container for audio results */
const AudioContainer = document.createElement("div");
AudioContainer.className = "hvaid-results-media-container";
AudioContainer.id = "hvaid-results-audio-container";

/* class lists container */
const ResultsClassListsContainerLeft = document.createElement("div");
ResultsClassListsContainerLeft.className =
  "hvaid-results-class-lists-container";
ResultsPageLeftColumn.appendChild(ResultsClassListsContainerLeft);

const ResultsClassListsContainerRight = document.createElement("div");
ResultsClassListsContainerRight.className =
  "hvaid-results-class-lists-container";
ResultsClassListsContainerRight.id =
  "hvaid-results-class-lists-container-right";
ResultsPageRightColumn.appendChild(ResultsClassListsContainerRight);

ResultsPageRightColumn.appendChild(DividerLine.cloneNode());

/* Go back buttons */
const ResultsGoBackButtonsContainer = document.createElement("div");
ResultsGoBackButtonsContainer.id = "hvaid-results-go-back-buttons-container";
if (!getDocumentNotSupported()) {
  ResultsPageRightColumn.appendChild(ResultsGoBackButtonsContainer);
}

const ResultsGoBackButtonsInnerContainer = document.createElement("div");
ResultsGoBackButtonsInnerContainer.id =
  "hvaid-results-go-back-buttons-inner-container";
ResultsGoBackButtonsContainer.appendChild(ResultsGoBackButtonsInnerContainer);

const ResultsGoBackEditButton = document.createElement("div");
ResultsGoBackEditButton.id = "hvaid-results-go-back-edit-button";
ResultsGoBackButtonsInnerContainer.appendChild(ResultsGoBackEditButton);
ResultsGoBackEditButton.innerHTML = editTextButtonText;
ResultsGoBackEditButton.addEventListener("click", switchToFormState);

const ResultsGobackVerticalDivider = document.createElement("div");
ResultsGobackVerticalDivider.id =
  "hvaid-results-go-back-buttons-vertical-divider";
ResultsGoBackButtonsInnerContainer.appendChild(ResultsGobackVerticalDivider);

const ResultsGoBackClearButton = document.createElement("div");
ResultsGoBackClearButton.id = "hvaid-results-go-back-clear-button";
ResultsGoBackButtonsInnerContainer.appendChild(ResultsGoBackClearButton);
ResultsGoBackClearButton.innerHTML = scanNewButtonText;
ResultsGoBackClearButton.addEventListener("click", () => {
  changeTextAreaValue("");
  handleDeleteFile();
  switchToFormState();
});

const cleanupResultsState = () => {
  [cleanupResultsWheelLeft, cleanupResultsWheelRight].forEach(
    (cleanupResultsWheel) => {
      cleanupResultsWheel();
    }
  );
  removeAllChildNode(ResultPercentageWheelListContainer);
  if (ResultsPageContainer.contains(ResultsPageLeftColumn)) {
    ResultsPageContainer.removeChild(ResultsPageLeftColumn);
  }
  removeAllChildNode(MediaPlayerContainer);
  while (VideoContainer.children.length > 0) {
    VideoContainer.removeChild(VideoContainer.lastChild);
  }
  removeAllChildNode(ResultsClassListsContainerLeft);
  removeAllChildNode(ResultsClassListsContainerRight);
  removeAllChildNode(ResultsExplanationContainer);
  removeAllChildNode(ResultsGoBackButtonsInnerContainer);
  removeAllChildNode(ResultsPageOverallScoreContainer);
};

const addClassesList = ({
  ListsContainer,
  type,
  classes,
  title = "",
  includeTime = false,
}) => {
  const ResultsClassListContainerOuter = document.createElement("div");
  ResultsClassListContainerOuter.classList.add(
    "hvaid-results-class-list-container-outer"
  );
  ResultsClassListContainerOuter.classList.add(
    classListOuterContainerClassName
  );
  if (title) {
    const ResultsClassListContainerTitle = document.createElement("div");
    ResultsClassListContainerTitle.className = "hvaid-results-class-list-title";
    const ResultsClassListContainerTitleDivider = document.createElement("div");
    ResultsClassListContainerTitleDivider.className =
      "hvaid-results-class-list-title-divider";

    const ResultsClassListContainerTitleTextContainer =
      document.createElement("div");
    ResultsClassListContainerTitleTextContainer.className =
      "hvaid-results-class-list-title-text-container";
    const ResultsClassListContainerTitleText = document.createElement("p");
    ResultsClassListContainerTitleText.innerHTML = title;
    ResultsClassListContainerTitleText.className =
      "hvaid-results-class-list-title-text";
    ResultsClassListContainerTitleTextContainer.appendChild(
      ResultsClassListContainerTitleText
    );
    if (includeTime) {
      const ResultsClassListContainerTitleTime = document.createElement("p");
      ResultsClassListContainerTitleTime.innerHTML = "0.00s";
      ResultsClassListContainerTitleTime.className =
        classListTitleTimeClassName;
      ResultsClassListContainerTitleTextContainer.appendChild(
        ResultsClassListContainerTitleTime
      );
    }

    ResultsClassListContainerTitle.appendChild(
      ResultsClassListContainerTitleDivider.cloneNode()
    );
    ResultsClassListContainerTitle.appendChild(
      ResultsClassListContainerTitleTextContainer
    );
    ResultsClassListContainerTitle.appendChild(
      ResultsClassListContainerTitleDivider.cloneNode()
    );
    ResultsClassListContainerOuter.appendChild(ResultsClassListContainerTitle);
  }

  ListsContainer.appendChild(ResultsClassListContainerOuter);

  if (classes.length === 0) {
    const NoResultMessage = document.createElement("p");
    NoResultMessage.innerHTML = noResultMessage;
    NoResultMessage.className = "hvaid-no-result-message";
    ResultsClassListContainerOuter.appendChild(NoResultMessage);
    return;
  }

  const ResultsClassListContainerInner = document.createElement("div");
  ResultsClassListContainerInner.classList.add(
    classListInnerContainerClassName
  );

  ResultsClassListContainerOuter.appendChild(ResultsClassListContainerInner);

  classes.sort((a, b) => -(a.score - b.score));
  classes.forEach((c, i) => {
    const ClassItem = document.createElement("div");
    ClassItem.classList.add(getClassItemId(c.class));
    ClassItem.classList.add("hvaid-results-class-list-item");
    ResultsClassListContainerInner.append(ClassItem);
    const ColorSquare = document.createElement("div");
    ColorSquare.classList.add("hvaid-results-class-list-color-square");
    ColorSquare.style.backgroundColor = colorArray[i % colorArray.length];
    ClassItem.appendChild(ColorSquare);

    const ClassName = document.createElement("p");
    ClassName.classList.add("hvaid-results-class-list-class-name");
    ClassName.innerHTML = c.class;
    ClassItem.appendChild(ClassName);

    const ClassScore = document.createElement("p");
    ClassScore.classList.add(classListItemScoreClassName);
    ClassScore.innerHTML = c.score.toFixed(2);
    ClassItem.appendChild(ClassScore);
  });
};

const switchToResultsState = (results, requestPayload) => {
  const mediaType = requestPayload.mediaType;
  cleanupResultsState();
  removeLoadingStyles();
  page = { type: "results", payload: results };
  PopoverContainer.removeChild(PopoverContainer.lastChild);
  updateResultWheelLeft({
    mediaType,
    label: mediaType === MediaType.VIDEO ? videoTypeName : null,
    score: mediaType === MediaType.VIDEO ? 0.99 : null,
  });
  ResultPercentageWheelListContainer.appendChild(
    ResultPercentageWheelContainerLeft
  );
  if (mediaType != MediaType.TEXT) {
    if (mediaType === MediaType.VIDEO) {
      const OveralScore = getOverallScoreElement({
        videoResults: results.video,
        audioResults: results.audio,
        showResultExplanations,
      });
      ResultsPageOverallScoreContainer.append(OveralScore);
      if (results.audio.length > 0) {
        updateResultWheelRight({
          mediaType: MediaType.AUDIO,
          label: audioTypeName,
          score: 0.81,
        });
        ResultPercentageWheelListContainer.appendChild(
          ResultPercentageWheelContainerRight
        );
      } else {
        updateResultWheelLeft({ mediaType, score: 0.99 });
      }
      getVideoEle({
        url: requestPayload.fileUrl,
        duration: results.duration,
        classResultsByTimeVideo: results.video,
        classResultsByTimeAudio: results.audio,
      });
      ResultsPageContainer.appendChild(ResultsPageLeftColumn);
      addClassesList({
        ListsContainer: ResultsClassListsContainerLeft,
        type: MediaType.VIDEO,
        classes: results.video[0].classes,
        title: "Video Results",
        includeTime: true,
      });
      addClassesList({
        ListsContainer: ResultsClassListsContainerRight,
        type: MediaType.AUDIO,
        classes: (results.audio || [])[0]?.classes || [],
        title: "Audio Results",
        includeTime: true,
      });
    } else if (mediaType === MediaType.AUDIO) {
      getAudioEle({
        url: requestPayload.fileUrl,
        duration: results.duration,
        classResultsByTime: results.audio,
      });
      MediaPlayerContainer.appendChild(AudioContainer);
      addClassesList({
        ListsContainer: ResultsClassListsContainerRight,
        type: MediaType.AUDIO,
        classes: results.audio[0].classes,
        // "Results",
        // true
      });
    } else {
      addClassesList({
        ListsContainer: ResultsClassListsContainerRight,
        type: "media",
        classes: results.classes,
      });
    }
    ResultsGoBackButtonsInnerContainer.appendChild(ResultsGoBackClearButton);
  } else {
    ResultsGoBackButtonsInnerContainer.appendChild(ResultsGoBackEditButton);
    ResultsGoBackButtonsInnerContainer.appendChild(
      ResultsGobackVerticalDivider
    );
    ResultsGoBackButtonsInnerContainer.appendChild(ResultsGoBackClearButton);
  }

  showResultTextPrefixLeft(
    [MediaType.VIDEO, MediaType.AUDIO].includes(mediaType)
  );

  const score = getScoreFromClasses(
    mediaType === MediaType.VIDEO
      ? results.video[0].classes
      : mediaType === MediaType.AUDIO
      ? results.audio[0].classes
      : results.classes
  );
  changeResultTextFromScoreLeft(score);
  if (mediaType === MediaType.VIDEO && results.audio.length > 0) {
    changeResultTextFromScoreRight(
      getScoreFromClasses(results.audio[0]?.classes)
    );
    showResultTextPrefixRight(true);
  }

  PopoverContainer.appendChild(ResultsPageContainer);
};
