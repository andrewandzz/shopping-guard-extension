/// <reference types="chrome" />

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "GET_PAGE_DATA") {
    const pageData = {
      text: document.body.innerText || "",
      formsData: getFormsData(),
      url: window.location.href,
    };

    sendResponse(pageData);
  }
});

function getFormsData() {
  const forms = Array.from(document.querySelectorAll("form"));

  const formsData = forms.map((form) => {
    return {
      text: form.innerText || "",
      ids: Array.from(form.querySelectorAll("input, textarea, select"))
        .map((field) => field.id)
        .filter((id) => id !== ""),
      names: Array.from(form.querySelectorAll("input, textarea, select"))
        .map((field) => field.name)
        .filter((name) => name !== ""),
      labels: Array.from(form.querySelectorAll("input, textarea, select"))
        .map(getFieldLabel)
        .filter((label) => label !== ""),
      buttons: Array.from(form.querySelectorAll("button"))
        .map((button) => button.innerText)
        .filter((button) => button !== ""),
    };
  });

  return formsData;
}

function getFieldLabel(field) {
  if (field.id) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
      return label.innerText.trim();
    }
  }

  const parentLabel = field.closest("label");
  if (parentLabel) {
    return parentLabel.innerText.trim();
  }

  return "";
}
