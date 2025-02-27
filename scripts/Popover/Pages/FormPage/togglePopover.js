const repositionPopoverByDefault = () => {
  if (!PopoverContainer.style) {
    return;
  }
  PopoverContainer.style.top = "unset";
  PopoverContainer.style.left = "unset";
  PopoverContainer.style.right = popoverDefaultPositionRight + "px";
  PopoverContainer.style.bottom = popoverDefaultPositionBottom + "px";
};

const initializePopover = () => {
  TextArea.value = "";
  handleDeleteFile();
  toggleAllowedToSubmit();

  if (isRenderingPreview) {
    setIsNotRenderingPreview();
  }
  goToTextInput();

  switchToFormState();
  page = { type: "form" };
  textareaErrorMessage = "";
};

const togglePopover = () => {
  if (isPopoverOpen) {
    isPopoverOpen = false;
    document.body.removeChild(PopoverContainer);
    // initializePopover();
  } else {
    isPopoverOpen = true;
    document.body.appendChild(PopoverContainer);
    repositionPopoverByDefault();
  }
};
TogglePopoverButton.addEventListener("click", togglePopover);
CloseIcon.addEventListener("click", togglePopover);
