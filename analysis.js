function checkReturnPolicy(text) {
  const textLower = text.toLowerCase();

  const hasReturnInfo = CONFIG.keywords.return.some((keyword) =>
    textLower.includes(keyword),
  );

  if (!hasReturnInfo) {
    return {
      score: CONFIG.riskScores.noReturnPolicy,
      message: CONFIG.messages.noReturnPolicy,
    };
  }

  return null;
}

function checkWarranty(text) {
  const textLower = text.toLowerCase();

  const hasWarrantyInfo = CONFIG.keywords.warranty.some((keyword) =>
    textLower.includes(keyword),
  );

  if (!hasWarrantyInfo) {
    return {
      score: CONFIG.riskScores.noWarranty,
      message: CONFIG.messages.noWarranty,
    };
  }

  return null;
}

function checkContacts(text) {
  const textLower = text.toLowerCase();

  const hasContacts = CONFIG.keywords.contact.some((keyword) =>
    textLower.includes(keyword),
  );

  if (!hasContacts) {
    return {
      score: CONFIG.riskScores.noContacts,
      message: CONFIG.messages.noContacts,
    };
  }

  return null;
}

function checkAggressiveMarketing(text) {
  const textLower = text.toLowerCase();

  const hasAggressiveMarketing = CONFIG.keywords.aggressiveMarketing.some(
    (keyword) => textLower.includes(keyword),
  );

  if (hasAggressiveMarketing) {
    return {
      score: CONFIG.riskScores.aggressiveMarketing,
      message: CONFIG.messages.aggressiveMarketing,
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

function checkLegalInfo(text) {
  const textLower = text.toLowerCase();

  const hasLegalInfo = CONFIG.keywords.legal.some((word) =>
    textLower.includes(word),
  );

  if (!hasLegalInfo) {
    return {
      score: CONFIG.riskScores.noLegalInfo,
      message: CONFIG.messages.noLegalInfo,
    };
  }

  return null;
}

/**
 * Checks whether the page forms require not only name and phone data but also delivery info.
 */
function checkFormsRequireDeliveryInfo(formsData) {
  const formsContent = formsData
    .map((formData) => Object.values(formData).flat().join(" ").toLowerCase())
    .join("\n---\n");

  const hasNameField = CONFIG.keywords.form.name.some((keyword) =>
    formsContent.includes(keyword),
  );
  const hasPhoneField = CONFIG.keywords.form.phone.some((keyword) =>
    formsContent.includes(keyword),
  );
  const hasDeliveryField = CONFIG.keywords.form.delivery.some((keyword) =>
    formsContent.includes(keyword),
  );

  if (hasNameField && hasPhoneField && !hasDeliveryField) {
    return {
      score: CONFIG.riskScores.nameAndPhoneOnlyForm,
      message: CONFIG.messages.nameAndPhoneOnlyForm,
    };
  }

  return null;
}

// function checkOnePageStructure(text) {
//   const lowerText = text.toLowerCase();

//   const hasLandingStructure =
//     lowerText.includes("замовити") &&
//     lowerText.includes("акція") &&
//     lowerText.includes("відгуки");

//   const hasNormalSiteSections =
//     lowerText.includes("каталог") ||
//     lowerText.includes("про нас") ||
//     lowerText.includes("блог") ||
//     lowerText.includes("особистий кабінет") ||
//     lowerText.includes("кошик");

//   if (hasLandingStructure && !hasNormalSiteSections) {
//     return {
//       found: true,
//       score: 1,
//       message:
//         "Сторінка схожа на односторінковий продаючий сайт без повноцінної структури інтернет-магазину.",
//     };
//   }

//   return null;
// }

function checkDomain(url) {
  let hostname;

  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }

  const hasTrustedZone = CONFIG.domainZones.trusted.some((zone) =>
    hostname.endsWith(zone),
  );

  const hasSuspiciousZone = CONFIG.domainZones.suspicious.some((zone) =>
    hostname.endsWith(zone),
  );

  let score = 0;

  if (!hasTrustedZone) {
    score += CONFIG.riskScores.nonTrustedDomainZone;
  }

  if (hasSuspiciousZone) {
    score += CONFIG.riskScores.suspiciousDomainZone;
  }

  if (score > 0) {
    return {
      score,
      message: CONFIG.messages.suspiciousDomainZone,
    };
  }

  return null;
}

function detectPageType(text, url) {
  const textLower = text.toLowerCase();
  const urlLower = url.toLowerCase();

  const hasProductIntent = CONFIG.keywords.pageType.product.some((word) =>
    textLower.includes(word),
  );

  const hasNormalShopStructure = CONFIG.keywords.pageType.normalShop.some(
    (word) => textLower.includes(word),
  );

  const isCheckoutPage =
    ["checkout", "cart", "order"].some((word) => urlLower.includes(word)) ||
    CONFIG.keywords.pageType.checkout.some((word) => textLower.includes(word));

  // const hasQuickOrderForm = formsData.some((formData) => {
  //   const formText = formData.searchText.toLowerCase();

  //   return (
  //     formText.includes("телефон") &&
  //     (formText.includes("ім'я") || formText.includes("ім’я")) &&
  //     (formText.includes("замовити") || formText.includes("купити"))
  //   );
  // });

  if (!hasProductIntent) {
    return "not_product_page"; // TODO: make type
  }

  if (hasNormalShopStructure && /*!hasQuickOrderForm &&*/ !isCheckoutPage) {
    return "normal_shop_page"; // TODO: make type
  }

  // if (hasQuickOrderForm) {
  //   return "quick_order_landing";
  // }

  return "unknown_product_page"; // TODO: make type
}

function analyzePageData(pageData) {
  const pageType = detectPageType(pageData.text, pageData.url);

  if (pageType === "not_product_page") {
    return {
      riskLevel: null,
      totalScore: 0,
      signals: [],
      pageType,
      message: CONFIG.messages.notProductPage,
      analyzedAt: new Date().toISOString(),
    };
  }

  if (pageType === "normal_shop_page") {
    return {
      riskLevel: "low",
      totalScore: 0,
      signals: [],
      pageType,
      message: CONFIG.messages.normalShopPage,
      analyzedAt: new Date().toISOString(),
    };
  }

  const checks = [
    () => checkReturnPolicy(pageData.text),
    () => checkWarranty(pageData.text),
    () => checkContacts(pageData.text),
    () => checkAggressiveMarketing(pageData.text),
    () => checkLegalInfo(pageData.text),
    () => checkReviews(pageData.text),
    () => checkPrice(pageData.text),
    () => checkFormsRequireDeliveryInfo(pageData.formsData),
    () => checkDomain(pageData.url),
    // TODO: check cart
  ];

  const signals = checks
    .map((check) => check())
    .filter((result) => result !== null);

  const totalScore = signals.reduce((sum, signal) => sum + signal.score, 0);

  let riskLevel = "low"; // TODO: make type

  if (totalScore >= CONFIG.riskThresholds.high) {
    riskLevel = "high";
  } else if (totalScore >= CONFIG.riskThresholds.medium) {
    riskLevel = "medium";
  }

  return {
    riskLevel,
    totalScore,
    signals,
    pageType,
    message: null,
    analyzedAt: new Date().toISOString(),
  };
}
