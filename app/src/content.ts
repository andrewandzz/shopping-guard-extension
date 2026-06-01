import { FormData } from "./models/form-data.model";
import { PageData } from "./models/page-data.model";
import { PriceData } from "./models/price-data.model";

type HTMLField = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "GET_PAGE_DATA") {
    const pageData: PageData = {
      text: document.body.innerText || "",
      formsData: collectFormsData(),
      pricesData: collectPricesData(),
      url: window.location.href,
    };

    sendResponse(pageData);
  }
});

function collectFormsData(): FormData[] {
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
      placeholders: Array.from(form.querySelectorAll<HTMLField>("input, textarea, select"))
        .map((field) => field.getAttribute('placeholder') || '')
        .filter((placeholder) => placeholder.trim() !== ''),
      buttons: Array.from(
        form.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
          "button, input[type='submit'], input[type='button']"
        )
      )
        .map((button) => {
          if (button instanceof HTMLInputElement) {
            return button.value || '';
          }

          return button.innerText || '';
        })
        .filter((button) => button.trim() !== ''),
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

function extractPriceValue(text: string): { value: number | null; currency: string | null } {
  const match = text.match(/(\d[\d\s.,]*)\s*(грн|₴|uah|usd|\$|eur|€)/i);

  if (!match) {
    return {
      value: null,
      currency: null,
    };
  }

  const value = Number(
    match[1]
      .replace(/\s/g, '')
      .replace(',', '.'),
  );

  return {
    value: Number.isNaN(value) ? null : value,
    currency: match[2].toLowerCase(),
  };
}

function getNearbyText(element: Element): string {
  const parent = element.parentElement;
  const container = parent?.parentElement ?? parent ?? element;

  return (container.textContent ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

function collectPricesData(): PriceData[] {
  const priceSelectors = [
    '[class*="price" i]',
    '[id*="price" i]',
    '[class*="cost" i]',
    '[id*="cost" i]',
    '[class*="amount" i]',
    '[id*="amount" i]',
    '[itemprop="price"]',
    '[property="product:price:amount"]',
    'meta[itemprop="price"]',
    'meta[property="product:price:amount"]',
  ];

  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(priceSelectors.join(',')),
  );

  return elements
    .map((element) => {
      const text =
        element instanceof HTMLMetaElement
          ? element.content
          : element.innerText || element.textContent || '';

      const extracted = extractPriceValue(text);

      return {
        text: text.trim(),
        value: extracted.value,
        currency: extracted.currency,
        className: element.className?.toString() ?? '',
        id: element.id ?? '',
        tagName: element.tagName.toLowerCase(),
        nearbyText: getNearbyText(element),
      };
    })
    .filter((price) => price.text !== '' || price.value !== null);
}