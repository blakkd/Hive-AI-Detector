/* text area input */
const onTextAreaValueChange = (_textareaValue) => {
  const textareaValue = _textareaValue;
  WordCount.innerText = `${textareaValue.length}/${maxChars} ${charCountText}`;
  if (textareaValue.length < minChars && !fileObjectUrl) {
    // if (ErrorMessageContainer.classList.contains(invisibleClassName)) {
    //   ErrorMessageContainer.classList.remove(invisibleClassName);
    // }
    if (!WordCount.classList.contains(redTextClassName)) {
      WordCount.classList.add(redTextClassName);
    }
  }
  if (textareaValue.length >= minChars) {
    // if (!ErrorMessageContainer.classList.contains(invisibleClassName)) {
    //   ErrorMessageContainer.classList.add(invisibleClassName);
    // }
    if (WordCount.classList.contains(redTextClassName)) {
      WordCount.classList.remove(redTextClassName);
    }
  }
  toggleAllowedToSubmit();
  hideFileError();
};

const changeTextAreaValue = (value) => {
  TextArea.value = value;
  onTextAreaValueChange(value);
};

const listenToTextAreaChange = () => {
  TextArea.addEventListener("input", (e) => {
    onTextAreaValueChange(e.target.value);
  });
};

listenToTextAreaChange();
