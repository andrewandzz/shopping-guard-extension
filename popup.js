/// <reference types="chrome" />

document.addEventListener("DOMContentLoaded", async () => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  chrome.tabs.sendMessage(
    currentTab.id,
    { action: "GET_PAGE_DATA" },
    (response) => {
      // if (chrome.runtime.lastError) {
      //   console.error(chrome.runtime.lastError.message);
      //   return;
      // }

      const pageType = detectPageType(
        response.text,
        response.formsData,
        currentTab.url,
      );

      if (pageType === "not_product_page") {
        document.getElementById("risk-score").textContent =
          `Кількість балів ризику: 0`;

        document.getElementById("risk-signals").innerHTML =
          "<li>Сторінка не схожа на сторінку продажу товару.</li>";

        return;
      }

      if (pageType === "normal_shop_page") {
        document.getElementById("risk-score").textContent =
          `Кількість балів ризику: 0`;

        document.getElementById("risk-signals").innerHTML =
          "<li>Сторінка схожа на звичайний інтернет-магазин або маркетплейс.</li>";

        return;
      }

      const checks = [
        () => checkReturnPolicy(response.text),
        () => checkWarranty(response.text),
        () => checkContacts(response.text),
        () => checkAggressiveMarketing(response.text),
        () => checkLegalInfo(response.text),
        () => checkReviews(response.text),
        () => checkPrice(response.text),
        () => checkFormsRequireDeliveryInfo(response.formsData),
        () => checkDomain(currentTab.url),
        // TODO: check cart
      ];

      const signals = checks
        .map((check) => check())
        .filter((result) => result !== null);

      const totalScore = signals.reduce((sum, signal) => sum + signal.score, 0);

      document.getElementById("risk-score").textContent =
        `Кількість балів ризику: ${totalScore}`;

      document.getElementById("risk-signals").innerHTML = signals
        .map((signal) => `<li>${signal.message}</li>`)
        .join("");

      // const result = analyzePageText(response.text);

      // document.getElementById("risk-level").textContent =
      //   `Рівень ризику: ${result.riskLevel}`;

      // document.getElementById("risk-score").textContent =
      //   `Кількість балів ризику: ${result.totalScore}`;

      // document.getElementById("risk-signals").innerHTML = result.signals
      //   .map((signal) => `<li>${signal.message}</li>`)
      //   .join("");
    },
  );
});

function detectPageType(text, formsData, url) {
  const hasProductIntent =
    text.includes("купити") ||
    text.includes("замовити") ||
    text.includes("ціна") ||
    text.includes("грн") ||
    text.includes("₴");

  const hasNormalShopStructure =
    text.includes("кошик") ||
    text.includes("каталог") ||
    text.includes("додати в кошик") ||
    text.includes("особистий кабінет") ||
    text.includes("фільтр") ||
    text.includes("сортування");

  const isCheckoutPage =
    url.includes("checkout") ||
    url.includes("cart") ||
    url.includes("order") ||
    text.includes("оформлення замовлення");

  // const hasQuickOrderForm = formsData.some((formData) => {
  //   const formText = formData.searchText.toLowerCase();

  //   return (
  //     formText.includes("телефон") &&
  //     (formText.includes("ім'я") || formText.includes("ім’я")) &&
  //     (formText.includes("замовити") || formText.includes("купити"))
  //   );
  // });

  if (!hasProductIntent) {
    return "not_product_page";
  }
  8;
  if (hasNormalShopStructure && /*!hasQuickOrderForm &&*/ !isCheckoutPage) {
    return "normal_shop_page";
  }

  // if (hasQuickOrderForm) {
  //   return "quick_order_landing";
  // }

  return "unknown_product_page";
}

// function analyzePageText(pageText) {
//   const checks = [
//     checkReturnPolicy,
//     checkWarranty,
//     checkAggressiveMarketing,
//     // checkContacts,
//   ];

//   const signals = checks
//     .map((check) => check(pageText))
//     .filter((result) => result !== null);

//   const totalScore = signals.reduce((sum, signal) => sum + signal.score, 0);

//   let riskLevel = "Низький";

//   if (totalScore >= 5) {
//     riskLevel = "Високий";
//   } else if (totalScore >= 3) {
//     riskLevel = "Середній";
//   }

//   return {
//     riskLevel,
//     totalScore,
//     signals,
//   };
// }

function checkReturnPolicy(text) {
  const textLower = text.toLowerCase();

  const keywords = ["повернення", "обмін", "refund", "return"];

  const hasReturnInfo = keywords.some((keyword) => textLower.includes(keyword));

  if (!hasReturnInfo) {
    return {
      score: 2,
      message: "Не знайдено інформацію про повернення або обмін товару.",
    };
  }

  return null;
}

function checkWarranty(text) {
  const textLower = text.toLowerCase();

  const keywords = ["гарант", "warranty"];

  const hasWarrantyInfo = keywords.some((keyword) =>
    textLower.includes(keyword),
  );

  if (!hasWarrantyInfo) {
    return {
      score: 2,
      message: "Не знайдено інформацію про гарантію.",
    };
  }

  return null;
}

function checkContacts(text) {
  const textLower = text.toLowerCase();

  const keywords = ["контакт", "адреса", "email", "@", "телефон"];

  const hasContacts = keywords.some((keyword) => textLower.includes(keyword));

  if (!hasContacts) {
    return {
      score: 2,
      message: "Не знайдено контактної інформації продавця.",
    };
  }

  return null;
}

function checkAggressiveMarketing(text) {
  const textLower = text.toLowerCase();

  const keywords = [
    "тільки сьогодні",
    "залишилось",
    "встигн",
    "акці",
    "зниж",
    "останні товари",
    "обмежена пропозиція",
  ];

  const hasAggressiveMarketing = keywords.some((keyword) =>
    textLower.includes(keyword),
  );

  if (hasAggressiveMarketing) {
    return {
      score: 1,
      message: `Виявлено ознаки агресивної реклами.`,
    };
  }

  return null;
}

function checkLegalInfo(text) {
  const textLower = text.toLowerCase();

  const legalWords = [
    "єдрпоу",
    "іпн",
    "фоп",
    "тов",
    "юридична адреса",
    "оферт",
    "політика конфіденційності",
    "умови використання",
    "реквізити",
  ];

  const hasLegalInfo = legalWords.some((word) => textLower.includes(word));

  if (!hasLegalInfo) {
    return {
      score: 2,
      message: "Не знайдено юридичної інформації про продавця.",
    };
  }

  return null;
}

function checkReviews(text) {
  return null;
}

function checkPrice(text) {
  return null;
}

/**
 * Checks whether the page forms require not only name and phone data but also delivery info.
 */
function checkFormsRequireDeliveryInfo(formsData) {
  const formsContent = formsData
    .map((formData) => Object.values(formData).flat().join(" ").toLowerCase())
    .join("\n---\n");

  const nameKeywords = ["ім'я", "name"];
  const phoneKeywords = ["телефон", "phone", "tel"];
  const deliveryKeywords = [
    "адрес",
    "міст",
    "відділення",
    "пошта",
    "доставк",
    "delivery",
    "address",
    "city",
  ];

  const hasNameField = nameKeywords.some((keyword) =>
    formsContent.includes(keyword),
  );
  const hasPhoneField = phoneKeywords.some((keyword) =>
    formsContent.includes(keyword),
  );
  const hasDeliveryField = deliveryKeywords.some((keyword) =>
    formsContent.includes(keyword),
  );

  if (hasNameField && hasPhoneField && !hasDeliveryField) {
    return {
      score: 2,
      message:
        "У формі замовлення не знайдено полів для введення адреси або даних про доставку.",
    };
  }

  return null;
}

function checkDomain(url) {
  let hostname;

  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }

  const trustedZones = [
    ".ua",
    ".com",
    ".net",
    ".org",
    ".shop",
    ".store",
    ".biz",
    ".info",
  ];

  const freeOrSuspiciousZones = [
    ".tk",
    ".ml",
    ".ga",
    ".cf",
    ".gq",
    ".xyz",
    ".top",
    ".site",
    ".online",
    ".click",
  ];

  const hasTrustedZone = trustedZones.some((zone) => hostname.endsWith(zone));

  const hasSuspiciousZone = freeOrSuspiciousZones.some((zone) =>
    hostname.endsWith(zone),
  );

  let score = 0;

  if (!hasTrustedZone) {
    score += 1;
  }

  if (hasSuspiciousZone) {
    score += 1;
  }

  if (score > 0) {
    return {
      score,
      message: `Домен сайту має нетипову або потенційно підозрілу доменну зону: .${hostname.split(".").at(-1)}.`,
    };
  }

  return null;
}

// document.getElementById("scan").addEventListener("click", async () => {
//   console.log("click");

//   const [tab] = await chrome.tabs.query({
//     active: true,
//     currentWindow: true,
//   });

//   const [response] = await chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     func: scanPage,
//   });

//   document.getElementById("result").textContent = response.result;
// });

// function scanPage() {
//   const buttons = document.querySelectorAll("button");
//   const links = document.querySelectorAll("a");
//   const inputs = document.querySelectorAll("input");
//   const res = Array.from(document.querySelectorAll("p")).find((p) => {
//     p.textContent.includes("Reserved, 2026");
//   });

//   if (res) {
//     return 'FOUND';
//   }

//   return `Знайдено: кнопок — ${buttons.length}, посилань — ${links.length}, полів вводу — ${inputs.length}`;
// }
