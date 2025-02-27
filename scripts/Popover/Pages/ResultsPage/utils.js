const aggregatedScoreText = chrome.i18n.getMessage("aggregatedScoreText");
const resultExplanationGeneralText = chrome.i18n.getMessage(
  "resultExplanationGeneralText"
);
const resultExplanationByTimeForVideoText = chrome.i18n.getMessage(
  "resultExplanationByTimeForVideoText"
);
const resultExplanationByTimeForAudioText = chrome.i18n.getMessage(
  "resultExplanationByTimeForAudioText"
);
const resultExplanationAggregatedForVideoText = chrome.i18n.getMessage(
  "resultExplanationAggregatedForVideoText"
);
const aiGeneratedResultText = chrome.i18n.getMessage("aiGeneratedResultText");
const notAiGeneratedResultText = chrome.i18n.getMessage(
  "notAiGeneratedResultText"
);
const overallScoreDetails = chrome.i18n.getMessage("overallScoreDetails");

const getPercentageExplanationText = (mediaType) => {
  if (mediaType === MediaType.VIDEO) {
    return resultExplanationByTimeForVideoText;
  } else if (mediaType === MediaType.AUDIO) {
    return resultExplanationByTimeForAudioText;
  } else {
    return resultExplanationGeneralText;
  }
};

const getClassItemId = (className) => {
  return `hvaid-result-class-list-item-${className}`;
};

const getScoreFromClasses = (classes) => {
  return (classes || []).find((c) => c.class === "ai_generated").score;
};

const getResultsWheel = ({ id, showResultExplanations }) => {
  const ResultPercentageWheelContainer = document.createElement("div");
  ResultPercentageWheelContainer.id = id;
  ResultPercentageWheelContainer.className =
    "hvaid-result-percentage-wheel-container";

  const ResultsWheelSummaryContainer = document.createElement("div");
  ResultsWheelSummaryContainer.className =
    "hvaid-result-percentage-wheel-summary-container";

  ResultPercentageWheelContainer.appendChild(ResultsWheelSummaryContainer);

  const ResultPercentageWheel = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );

  ResultPercentageWheel.setAttribute("viewBox", "0 0 240 240");
  ResultPercentageWheel.classList.add("hvaid-result-percentage-wheel");
  ResultPercentageWheelContainer.append(ResultPercentageWheel);

  const ResultPercentageWheelCircle1 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  ResultPercentageWheelCircle1.setAttribute("cx", "120");
  ResultPercentageWheelCircle1.setAttribute("cy", "120");
  ResultPercentageWheelCircle1.setAttribute("r", "100");
  ResultPercentageWheelCircle1.setAttribute("stroke-width", "20px");
  ResultPercentageWheelCircle1.classList.add(
    "hvaid-result-percentage-wheel-circle-1"
  );
  ResultPercentageWheel.appendChild(ResultPercentageWheelCircle1);

  const ResultPercentageWheelCircle2 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  ResultPercentageWheelCircle2.setAttribute("cx", "120");
  ResultPercentageWheelCircle2.setAttribute("cy", "120");
  ResultPercentageWheelCircle2.setAttribute("r", "100");
  ResultPercentageWheelCircle2.setAttribute("stroke-width", "20px");
  ResultPercentageWheelCircle2.setAttribute(
    "stroke-dasharray",
    resultWheelCircumference
  );
  ResultPercentageWheelCircle2.setAttribute(
    "stroke-dashoffset",
    resultWheelCircumference
  );
  ResultPercentageWheelCircle2.classList.add(
    "hvaid-result-percentage-wheel-circle-2"
  );
  ResultPercentageWheel.appendChild(ResultPercentageWheelCircle2);

  /* results text */
  const ResultsText = document.createElement("div");
  ResultsText.className = "hvaid-results-text";
  ResultPercentageWheelContainer.append(ResultsText);

  const ResultsPercentageContainer = document.createElement("div");
  ResultsPercentageContainer.className = "hvaid-results-percentage-container";
  ResultsText.appendChild(ResultsPercentageContainer);

  const ResultsPercentage = document.createElement("p");
  ResultsPercentage.className = "hvaid-results-percentage";
  ResultsPercentageContainer.appendChild(ResultsPercentage);

  const ResultsPercentageInfoIconContainer = document.createElement("div");
  ResultsPercentageInfoIconContainer.className =
    "hvaid-results-percentage-info-icon";

  ResultsPercentageContainer.appendChild(ResultsPercentageInfoIconContainer);

  const ResultsTextPrefix = document.createElement("p");
  ResultsTextPrefix.className = "hvaid-results-text-prefix";
  ResultsText.appendChild(ResultsTextPrefix);

  const showResultTextPrefix = (isByTime) => {
    removeAllChildNode(ResultsTextPrefix);
    if (!isByTime) {
      const Text = document.createElement("p");
      Text.innerHTML = resultPrefixText;
      Text.className = "hvaid-results-text-inner";
      ResultsTextPrefix.appendChild(Text);
    } else {
      const TimeText = document.createElement("p");
      TimeText.className = "hvaid-video-result-time-prefix";
      TimeText.style.textAlign = "center";
      TimeText.appendChild(
        document.createTextNode(`${videoResultPrefixTextPreposition} `)
      );
      const VideoResultTime = document.createElement("span");
      VideoResultTime.className = videoResultTextTimeClassName;
      VideoResultTime.innerHTML = "0.00s";
      TimeText.appendChild(VideoResultTime);
      TimeText.appendChild(document.createTextNode(", "));
      ResultsTextPrefix.appendChild(TimeText);
      ResultsTextPrefix.appendChild(
        document.createTextNode(videoResultPrefixText)
      );
    }
  };

  const changeResultTime = (time) => {
    const ResultTextTime = ResultsTextPrefix.getElementsByClassName(
      videoResultTextTimeClassName
    )[0];
    if (ResultTextTime) {
      ResultTextTime.innerHTML = `${time.toFixed(2)}s`;
    }
  };

  const ResultClass = document.createElement("p");
  ResultClass.className = "hvaid-result-class";
  ResultClass.innerHTML = "";
  ResultsText.appendChild(ResultClass);

  const changeResultTextFromScore = (score) => {
    if (score == null) {
      return;
    }
    if (score < 0.5) {
      ResultClass.innerHTML = notAiGeneratedResultText;
      ResultPercentageWheelCircle2.classList.add(blueStrokeClassName);
      ResultPercentageWheelCircle2.classList.remove(redStrokeClassName);
      ResultsText.classList.add(blueTextClassName);
      ResultsText.classList.remove(redTextClassName);
    } else {
      ResultClass.innerHTML = aiGeneratedResultText;
      ResultPercentageWheelCircle2.classList.add(redStrokeClassName);
      ResultPercentageWheelCircle2.classList.add(blueStrokeClassName);
      ResultsText.classList.add(redTextClassName);
      ResultsText.classList.remove(blueTextClassName);
    }
    setTimeout(() => {
      ResultPercentageWheelCircle2.setAttribute(
        "stroke-dashoffset",
        (1 - score) * resultWheelCircumference
      );
    }, 10);
    ResultsPercentage.innerHTML = `${(score * 100).toFixed(1)}%`;
  };

  const updateResultWheel = ({ mediaType, label, score }) => {
    removeAllChildNode(ResultsPercentageInfoIconContainer);
    const ResultsPercentageInfoIcon = InfoIcon.cloneNode(true);
    ResultsPercentageInfoIcon.addEventListener("click", () => {
      showResultExplanations({
        id: `${mediaType}-general-result`,
        text: getPercentageExplanationText(mediaType),
      });
    });
    ResultsPercentageInfoIconContainer.appendChild(ResultsPercentageInfoIcon);

    removeAllChildNode(ResultsWheelSummaryContainer);
    if (label != null && label.length > 0) {
      const ResultsMediaTypeLabel = document.createElement("p");
      ResultsMediaTypeLabel.className = "hvaid-results-media-type-label";
      ResultsMediaTypeLabel.innerHTML = label[0].toUpperCase() + label.slice(1);
      ResultsWheelSummaryContainer.appendChild(ResultsMediaTypeLabel);
    }
  };

  const cleanupResults = () => {
    ResultPercentageWheelCircle2.classList.remove(redStrokeClassName);
    ResultPercentageWheelCircle2.classList.remove(blueStrokeClassName);
    ResultPercentageWheelCircle2.setAttribute(
      "stroke-dashoffset",
      resultWheelCircumference
    );
    ResultsText.classList.remove(blueTextClassName);
    ResultsText.classList.remove(redTextClassName);
    ResultsPercentage.innerHTML = "";
    ResultClass.innerHTML = "";

    removeAllChildNode(ResultsWheelSummaryContainer);
  };
  return {
    ResultPercentageWheelContainer,
    showResultTextPrefix,
    changeResultTextFromScore,
    cleanupResultsWheel: cleanupResults,
    changeResultWheelTime: changeResultTime,
    updateResultWheel,
  };
};

const get95Percentile = (scores) => {
  const scoresSorted = [...scores];
  scoresSorted.sort();
  const index_1_indexed = Math.floor(scoresSorted.length * 0.95);
  const index = index_1_indexed - 1;
  if (!(0 <= index && index < scoresSorted.length)) {
    return 0;
  }
  return scoresSorted[index];
};

const classNameAi = "ai_generated";
const classNameDeepFake = "deepfake";
const getOverallScore = ({ videoResults = [], audioResults = [] }) => {
  const getScores = ({ results, className }) => {
    return results
      .map((item) => {
        const classObj = item.classes.find((c) => c.class === className);
        return classObj?.score;
      })
      .filter((score) => score != null);
  };
  const scoresVideoAi = getScores({
    results: videoResults,
    className: classNameAi,
  });
  const scoresAudioAi = getScores({
    results: audioResults,
    className: classNameAi,
  });
  const scoresDeepFake = getScores({
    results: videoResults,
    className: classNameDeepFake,
  });

  const percentileDeepFake = get95Percentile(scoresDeepFake);

  let consecutiveDeepFake = 0;
  for (let i = 0; i < scoresDeepFake.length - 1; i++) {
    consecutiveDeepFake = Math.max(
      consecutiveDeepFake,
      Math.min(scoresDeepFake[i], scoresDeepFake[i + 1])
    );
  }

  const scoreDeepFake = Math.max(percentileDeepFake, consecutiveDeepFake);
  const scoreVideoAi = Math.max(...scoresVideoAi);
  const scoreAudioAi = Math.max(...scoresAudioAi);

  return Math.max(scoreDeepFake, scoreVideoAi, scoreAudioAi);
};

const getOverallScoreElement = ({
  videoResults,
  audioResults,
  showResultExplanations,
}) => {
  const OverallResultContainer = document.createElement("div");
  const scoreValue = getOverallScore({ videoResults, audioResults });
  const AggregateScoreContainer = document.createElement("div");
  AggregateScoreContainer.className = "hvaid-results-aggregate-score-container";
  OverallResultContainer.appendChild(AggregateScoreContainer);

  const ScorePrefix = document.createElement("span");
  ScorePrefix.className = "hvaid-results-aggregate-score-prefix";
  ScorePrefix.innerHTML = `${aggregatedScoreText}:`;
  AggregateScoreContainer.appendChild(ScorePrefix);

  const Score = document.createElement("span");
  Score.classList.add("hvaid-results-aggregate-score");
  const isAiGenerated = scoreValue > 0.5;
  if (isAiGenerated) {
    Score.classList.add("hvaid-results-aggregate-score-ai");
  } else {
    Score.classList.add("hvaid-results-aggregate-score-not-ai");
  }
  Score.innerHTML = `${(scoreValue * 100).toFixed(1)}%`;
  AggregateScoreContainer.appendChild(Score);

  const AggregateScoreInfoIconContainer = document.createElement("span");
  const AggregateScoreInfoIcon = InfoIcon.cloneNode(true);
  AggregateScoreInfoIcon.classList.add(
    "hvaid-results-aggregate-score-info-icon"
  );
  AggregateScoreInfoIconContainer.appendChild(AggregateScoreInfoIcon);
  AggregateScoreContainer.appendChild(AggregateScoreInfoIconContainer);

  AggregateScoreInfoIcon.addEventListener("click", () => {
    showResultExplanations({
      id: `overall-score`,
      text: resultExplanationAggregatedForVideoText,
    });
  });

  const DetailsContainer = document.createElement("div");
  DetailsContainer.id = "hvaid-overall-result-details-container";
  const Details = document.createElement("span");
  Details.id = "hvaid-overall-result-details";
  Details.innerHTML = overallScoreDetails;
  DetailsContainer.appendChild(Details);

  const Label = document.createElement("span");
  Label.id = "overall-result-details-label";
  Label.innerHTML = isAiGenerated
    ? aiGeneratedResultText
    : notAiGeneratedResultText;
  if (isAiGenerated) {
    Label.classList.add("hvaid-results-aggregate-score-ai");
  } else {
    Label.classList.add("hvaid-results-aggregate-score-not-ai");
  }
  DetailsContainer.appendChild(Label);
  OverallResultContainer.appendChild(DetailsContainer);
  return OverallResultContainer;
};
