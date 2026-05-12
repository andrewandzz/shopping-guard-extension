import { FormData } from "./models/form-data.model";
import { PageData } from "./models/page-data.model";

type HTMLField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "GET_PAGE_DATA") {
    const pageData: PageData = {
      text: document.body.innerText || "",
      formsData: getFormsData(),
      url: window.location.href,
    };

    sendResponse(pageData);
  }
});

function getFormsData(): FormData[] {
  const forms = Array.from(document.querySelectorAll("form"));

  const formsData = forms.map((form) => {
    return {
      text: form.innerText || "",
      ids: Array.from(form.querySelectorAll<HTMLField>("input, textarea, select"))
        .map((field) => field.id)
        .filter((id) => id !== ""),
      names: Array.from(form.querySelectorAll<HTMLField>("input, textarea, select"))
        .map((field) => field.name)
        .filter((name) => name !== ""),
      labels: Array.from(form.querySelectorAll<HTMLField>("input, textarea, select"))
        .map(getFieldLabel)
        .filter((label) => label !== ""),
      buttons: Array.from(form.querySelectorAll("button"))
        .map((button) => button.innerText)
        .filter((button) => button !== ""),
    };
  });

  return formsData;
}

function getFieldLabel(field: HTMLField): string {
  if (field.id) {
    const label: HTMLLabelElement | null = document.querySelector(`label[for="${field.id}"]`);

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
