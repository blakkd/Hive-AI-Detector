const changeToTimeCommon_ = ({
  time,
  classResultsByTime,
  ClassListColumnContainer,
  changeResultTextFromScore,
  changeResultWheelTime,
}) => {
  const classListContainer = ClassListColumnContainer.getElementsByClassName(
    classListOuterContainerClassName
  )[0];

  const classList = ClassListColumnContainer.getElementsByClassName(
    classListInnerContainerClassName
  )[0];
  let classes = undefined;
  for (const result of classResultsByTime) {
    if (result.time <= time) {
      classes = result.classes;
    } else {
      break;
    }
  }
  if (classes != null) {
    changeResultTextFromScore(getScoreFromClasses(classes));

    const newList = [];
    for (const c of classes) {
      const itemId = getClassItemId(c.class);
      const Item = classList.getElementsByClassName(itemId)[0];
      Item.getElementsByClassName(classListItemScoreClassName)[0].innerText =
        c.score.toFixed(2);
      classList.removeChild(Item);
      newList.push([c.score, Item]);
    }

    newList.sort((a, b) => -(a[0] - b[0]));

    for (const [score, Item] of newList) {
      classList.appendChild(Item);
    }
  }
  const TitleTimeText = classListContainer.getElementsByClassName(
    classListTitleTimeClassName
  )[0];
  if (TitleTimeText) {
    TitleTimeText.innerHTML = `${time.toFixed(2)}s`;
  }

  changeResultWheelTime(time);
};

const changeToTimeLeft = (
  time,
  classResultsByTime,
  ClassListColumnContainer
) => {
  changeToTimeCommon_({
    time,
    classResultsByTime,
    ClassListColumnContainer,
    changeResultTextFromScore: changeResultTextFromScoreLeft,
    changeResultWheelTime: changeResultWheelTimeLeft,
  });
};
const changeToTimeRight = (
  time,
  classResultsByTime,
  ClassListColumnContainer
) => {
  changeToTimeCommon_({
    time,
    classResultsByTime,
    ClassListColumnContainer,
    changeResultTextFromScore: changeResultTextFromScoreRight,
    changeResultWheelTime: changeResultWheelTimeRight,
  });
};

const changeToTimeVideo = (
  time,
  videoClassResultsByTime,
  audioClassResultsByTime
) => {
  changeToTimeLeft(
    time,
    videoClassResultsByTime,
    ResultsClassListsContainerLeft
  );
  changeToTimeRight(
    time,
    audioClassResultsByTime,
    ResultsClassListsContainerRight
  );
};

const changeToTimeAudio = (time, classResultsByTime) => {
  changeToTimeLeft(time, classResultsByTime, ResultsClassListsContainerRight);
};

const getMediaTimeRangeWithIcon = ({
  duration,
  changeToTime,
  getIcon,
  showIcon = true,
}) => {
  const IconRangeContainer = document.createElement("div");
  IconRangeContainer.id = "hvaid-results-page-media-icon-range-container";

  const IconContainer = document.createElement("div");
  IconContainer.id = "hvaid-results-page-media-icon-container";

  IconRangeContainer.appendChild(IconContainer);

  if (showIcon) {
    const Icon = document.createElement("div");
    Icon.id = "hvaid-results-page-media-icon";
    IconContainer.appendChild(Icon);
    getIcon(Icon);
  }

  const IconText = document.createElement("p");
  IconText.innerText = videoPreviewNotAvailableMessage;
  IconContainer.appendChild(IconText);

  const Input = getRangeInput(duration, (time) => {
    changeToTime(time);
  });
  IconRangeContainer.appendChild(Input);
  return IconRangeContainer;
};

const getVideoEle = ({
  url,
  duration,
  classResultsByTimeVideo,
  classResultsByTimeAudio,
}) => {
  let animationFrameRef;
  const VideoEle = document.createElement("video");
  VideoEle.onloadedmetadata = () => {
    removeAllChildNode(VideoContainer);
    VideoContainer.appendChild(VideoEle);

    VideoEle.controls = true;
    VideoEle.setAttribute(
      "controlslist",
      "nofullscreen nodownload noplaybackrate"
    );
    VideoEle.onseeked = () => {
      changeToTimeVideo(
        VideoEle.currentTime,
        classResultsByTimeVideo,
        classResultsByTimeAudio
      );
    };
    const step = () => {
      const currentTime = VideoEle.currentTime;
      const isPlaying = !VideoEle.paused;
      const endTime = VideoEle.duration;
      if (isPlaying && currentTime < endTime) {
        changeToTimeVideo(
          currentTime,
          classResultsByTimeVideo,
          classResultsByTimeAudio
        );
        animationFrameRef = window.requestAnimationFrame(step);
      }
    };

    VideoEle.onplay = () => {
      animationFrameRef = window.requestAnimationFrame(step);
    };
    VideoEle.onpause = () => {
      if (animationFrameRef !== null) {
        window.cancelAnimationFrame(animationFrameRef);
      }
    };
  };
  VideoEle.onerror = (e) => {
    removeAllChildNode(VideoContainer);
    VideoContainer.appendChild(
      getMediaTimeRangeWithIcon({
        duration,
        changeToTime: (time) =>
          changeToTimeVideo(
            time,
            classResultsByTimeVideo,
            classResultsByTimeAudio
          ),
        getIcon: getVideoIcon,
      })
    );
  };
  VideoEle.src = url;
};

const getAudioEle = ({ url, duration, classResultsByTime }) => {
  let animationFrameRef;

  const AudioEle = document.createElement("audio");
  AudioEle.onloadedmetadata = () => {
    removeAllChildNode(AudioContainer);
    AudioContainer.appendChild(AudioEle);

    AudioEle.controls = true;

    AudioEle.onseeked = () => {
      changeToTimeAudio(AudioEle.currentTime, classResultsByTime);
    };
    const step = () => {
      const currentTime = AudioEle.currentTime;
      const isPlaying = !AudioEle.paused;
      const endTime = AudioEle.duration;
      if (isPlaying && currentTime < endTime) {
        changeToTimeAudio(currentTime, classResultsByTime);
        animationFrameRef = window.requestAnimationFrame(step);
      }
    };

    AudioEle.onplay = () => {
      animationFrameRef = window.requestAnimationFrame(step);
    };
    AudioEle.onpause = () => {
      if (animationFrameRef !== null) {
        window.cancelAnimationFrame(animationFrameRef);
      }
    };
  };
  AudioEle.onerror = (e) => {
    removeAllChildNode(AudioContainer);
    AudioContainer.appendChild(
      getMediaTimeRangeWithIcon({
        duration,
        changeToTime: (time) => changeToTimeAudio(time, classResultsByTime),
        getIcon: getAudioIcon,
        showIcon: false,
      })
    );
  };
  AudioEle.src = url;
};
