const LoadingBackground = document.createElement("div");
LoadingBackground.id = "hvaid-loading-background";

const addLoadingStyles = () => {
  if (LogoContainer) {
    const pathCollection = LogoContainer.querySelectorAll(".hvaid-logo-path");
    const stopCollection = LogoContainer.querySelectorAll(".hvaid-logo-stop");
    pathCollection.forEach((node) =>
      node.classList.add("hvaid-logo-path-loading")
    );
    stopCollection.forEach((node) =>
      node.classList.add("hvaid-logo-stop-loading")
    );
  }
  PopoverContainer.appendChild(LoadingBackground);
};

const removeLoadingStyles = () => {
  if (LogoContainer) {
    const pathCollection = LogoContainer.querySelectorAll(".hvaid-logo-path");
    const stopCollection = LogoContainer.querySelectorAll(".hvaid-logo-stop");
    pathCollection.forEach((node) =>
      node.classList.remove("hvaid-logo-path-loading")
    );
    stopCollection.forEach((node) =>
      node.classList.remove("hvaid-logo-stop-loading")
    );
  }
  if (PopoverContainer.contains(LoadingBackground)) {
    PopoverContainer.removeChild(LoadingBackground);
  }
};
