import { CONFIG } from "./config";
import { AnalysisResult } from "./models/analysis-result.model";
import { FormData } from "./models/form-data.model";
import { PageData } from "./models/page-data.model";
import { PageType } from "./models/page-type.model";
import { RiskLevel } from "./models/risk-level.model";
import { RiskSignal } from "./models/risk-signal.model";

function checkReturnPolicy(text: string): RiskSignal | null {
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

function checkWarranty(text: string): RiskSignal | null {
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

function checkContacts(text: string): RiskSignal | null {
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

function checkAggressiveMarketing(text: string): RiskSignal | null {
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

function checkReviews(text: string): RiskSignal | null {
  return null;
}

function checkPrice(text: string): RiskSignal | null {
  return null;
}

function checkLegalInfo(text: string): RiskSignal | null {
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
function checkFormsRequireDeliveryInfo(formsData: FormData[]): RiskSignal | null {
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

function checkDomain(url: string): RiskSignal | null {
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

function detectPageType(text: string, url: string): PageType {
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
    return PageType.NOT_PRODUCT_PAGE;
  }

  if (hasNormalShopStructure && /*!hasQuickOrderForm &&*/ !isCheckoutPage) {
    return PageType.NORMAL_SHOP_PAGE;
  }

  // if (hasQuickOrderForm) {
  //   return "quick_order_landing";
  // }

  return PageType.UNKNOWN_PRODUCT_PAGE;
}

export function analyzePageData(pageData: PageData): AnalysisResult {
  const pageType = detectPageType(pageData.text, pageData.url);

  if (pageType === PageType.NOT_PRODUCT_PAGE) {
    return {
      riskLevel: RiskLevel.NOT_ANALYZED,
      totalScore: 0,
      riskSignals: [],
      pageType,
      message: CONFIG.messages.notProductPage,
      analyzedAt: new Date().toISOString(),
    };
  }

  if (pageType === PageType.NORMAL_SHOP_PAGE) {
    return {
      riskLevel: RiskLevel.LOW,
      totalScore: 0,
      riskSignals: [],
      pageType,
      message: CONFIG.messages.normalShopPage,
      analyzedAt: new Date().toISOString(),
    };
  }

  const checks: (() => RiskSignal | null)[] = [
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

  const riskSignals = checks
    .map((check) => check())
    .filter((result) => result !== null);

  const totalScore = riskSignals.reduce((sum, signal) => sum + signal.score, 0);

  let riskLevel = RiskLevel.LOW;

  if (totalScore >= CONFIG.riskThresholds.high) {
    riskLevel = RiskLevel.HIGH;
  } else if (totalScore >= CONFIG.riskThresholds.medium) {
    riskLevel = RiskLevel.MEDIUM;
  }

  return {
    riskLevel,
    totalScore,
    riskSignals,
    pageType,
    analyzedAt: new Date().toISOString(),
  };
}
