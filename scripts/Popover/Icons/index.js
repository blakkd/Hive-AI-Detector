const InfoIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
InfoIcon.classList.add("hvaid-info-icon");
InfoIcon.setAttribute("viewBox", "0 0 24 24");
InfoIcon.setAttribute("focusable", false);
const InfoIconPath = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
InfoIconPath.setAttribute("fill", "currentColor");
InfoIconPath.setAttribute(
  "d",
  "M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm.25,5a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,12.25,5ZM14.5,18.5h-4a1,1,0,0,1,0-2h.75a.25.25,0,0,0,.25-.25v-4.5a.25.25,0,0,0-.25-.25H10.5a1,1,0,0,1,0-2h1a2,2,0,0,1,2,2v4.75a.25.25,0,0,0,.25.25h.75a1,1,0,1,1,0,2Z"
);
InfoIcon.appendChild(InfoIconPath);

const getImageIcon = (Container) => {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      Container.innerHTML = this.responseText;
    } else {
      // console.log("files not found");
    }
  };
  xhttp.open("GET", chrome.runtime.getURL("icons/image.htm"), true);
  xhttp.send();
};

const getAudioIcon = (Container) => {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      Container.innerHTML = this.responseText;
    } else {
      // console.log("files not found");
    }
  };
  xhttp.open("GET", chrome.runtime.getURL("icons/audio.htm"), true);
  xhttp.send();
};

const getVideoIcon = (Container) => {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      Container.innerHTML = this.responseText;
    } else {
      // console.log("files not found");
    }
  };
  xhttp.open("GET", chrome.runtime.getURL("icons/video.htm"), true);
  xhttp.send();
};

const getDeleteIcon = (Container, onClick, className) => {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const DeleteIconModel = document.createElement("div");
      DeleteIconModel.className = "hvaid-delete-icon";
      DeleteIconModel.innerHTML = this.responseText;

      if (onClick) {
        DeleteIconModel.addEventListener("click", onClick);
      }
      if (className) {
        DeleteIconModel.classList.add(className);
      }
      Container.appendChild(DeleteIconModel);
    } else {
      // console.log("files not found");
    }
  };
  xhttp.open("GET", chrome.runtime.getURL("icons/delete.htm"), true);
  xhttp.send();
};
