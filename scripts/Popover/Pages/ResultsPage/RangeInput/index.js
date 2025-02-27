const formatTime = (time) => {
  return (time < 10 ? "0" : "") + time.toFixed(2);
};

const getRangeInput = (duration, onChange) => {
  const InputContainer = document.createElement("div");
  InputContainer.className = "hvaid-range-input-container";
  const Input = document.createElement("input");
  Input.className = "hvaid-range-input";
  const InputTimeText = document.createElement("p");
  InputTimeText.className = "hvaid-range-input-time";
  InputTimeText.innerText = `00.00 / ${formatTime(duration)}s`;
  Input.step = 1 / 60;
  Input.min = 0;
  Input.max = duration;
  Input.value = 0;
  Input.type = "range";
  Input.oninput = (e) => {
    const newValue = Number(e.target.value);
    onChange(newValue);
    InputTimeText.innerText = `${formatTime(newValue)} / ${formatTime(
      duration
    )}s`;
  };

  InputContainer.appendChild(InputTimeText);
  InputContainer.appendChild(Input);
  return InputContainer;
};
