import { CONFIG } from "./config";
import { AnalysisCheck } from "./models/analysis-check.model";
import { AnalysisResult } from "./models/analysis-result.model";
import { AnalysisStatus } from "./models/analysis-status.model";
import { FormData } from "./models/form-data.model";
import { PageData } from "./models/page-data.model";
import { PageType } from "./models/page-type.model";
import { RiskLevel } from "./models/risk-level.model";

/**
 * 
 */
function checkReturnPolicy(text: string): AnalysisCheck {
  const textLower = text.toLowerCase();

  const hasReturnInfo = CONFIG.keywords.return.some((keyword) =>
    textLower.includes(keyword),
  );

  return {
    id: 'return_policy',
    status: hasReturnInfo ? 'passed' : 'failed',
    riskScore: CONFIG.checks.returnPolicy.riskScore
  }
}

/**
 * 
 */
function checkWarranty(text: string): AnalysisCheck {
  const textLower = text.toLowerCase();

  const hasWarrantyInfo = CONFIG.keywords.warranty.some((keyword) =>
    textLower.includes(keyword),
  );

  return {
    id: 'warranty',
    status: hasWarrantyInfo ? 'passed' : 'failed',
    riskScore: CONFIG.checks.warranty.riskScore
  };
}

/**
 * 
 */
function checkContacts(text: string): AnalysisCheck {
  const textLower = text.toLowerCase();

  const hasContacts = CONFIG.keywords.contact.some((keyword) =>
    textLower.includes(keyword),
  );

  return {
    id: 'contacts',
    status: hasContacts ? 'passed' : 'failed',
    riskScore: CONFIG.checks.contacts.riskScore
  }
}

/**
 * 
 */
function checkAggressiveMarketing(text: string): AnalysisCheck {
  const textLower = text.toLowerCase();

  const hasAggressiveMarketing = CONFIG.keywords.aggressiveMarketing.some(
    (keyword) => textLower.includes(keyword),
  );

  return {
    id: 'aggressive_marketing',
    status: !hasAggressiveMarketing ? 'passed' : 'failed',
    riskScore: CONFIG.checks.aggressiveMarketing.riskScore
  }
}

function checkReviews(text: string): AnalysisCheck {
  throw new Error('Not implemented');
}

function checkPrice(text: string): AnalysisCheck {
  throw new Error('Not implemented');
}

/**
 * 
 */
function checkLegalInfo(text: string): AnalysisCheck {
  const textLower = text.toLowerCase();

  const hasLegalInfo = CONFIG.keywords.legal.some((word) =>
    textLower.includes(word),
  );

  return {
    id: 'legal_info',
    status: hasLegalInfo ? 'passed' : 'failed',
    riskScore: CONFIG.checks.legalInfo.riskScore
  }
}

/**
 * Checks whether the page forms require not only name and phone data but also delivery info.
 */
function checkFormsRequireDeliveryInfo(formsData: FormData[]): AnalysisCheck {
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

  return {
    id: 'name_and_phone_only_form',
    status: hasNameField && hasPhoneField && hasDeliveryField ? 'passed' : 'failed',
    riskScore: CONFIG.checks.nameAndPhoneOnlyForm.riskScore
  }
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

function checkDomain(url: string): AnalysisCheck {
  const hostname = new URL(url).hostname.toLowerCase();

  const hasTrustedZone = CONFIG.domainZones.trusted.some((zone) =>
    hostname.endsWith(zone),
  );

  const hasSuspiciousZone = CONFIG.domainZones.suspicious.some((zone) =>
    hostname.endsWith(zone),
  );

  return {
    id: 'domain_zone',
    status: hasTrustedZone && !hasSuspiciousZone ? 'passed' : 'failed',
    riskScore: CONFIG.checks.domainZone.riskScore
  }
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
      status: AnalysisStatus.NOT_APPLICABLE,
      pageType,
      url: pageData.url,
      domain: new URL(pageData.url).hostname,
      checks: [],
    };
  }

  if (pageType === PageType.NORMAL_SHOP_PAGE) {
    return {
      status: AnalysisStatus.ANALYZED,
      pageType,
      url: pageData.url,
      domain: new URL(pageData.url).hostname,
      riskLevel: RiskLevel.LOW,
      totalScore: 1, // TODO: fix?
      checks: [],
      analyzedAt: new Date().toISOString(),
    };
  }

  const checks: AnalysisCheck[] = [
    checkReturnPolicy(pageData.text),
    checkWarranty(pageData.text),
    checkContacts(pageData.text),
    checkAggressiveMarketing(pageData.text),
    checkLegalInfo(pageData.text),
    // checkReviews(pageData.text),
    // checkPrice(pageData.text),
    checkFormsRequireDeliveryInfo(pageData.formsData),
    checkDomain(pageData.url),
    // TODO: check cart
  ];

  const riskSignals = checks.filter((result) => result.status === 'failed');

  const totalScore = riskSignals.reduce((sum, signal) => sum + signal.riskScore!, 0);

  let riskLevel = RiskLevel.LOW;

  if (totalScore >= CONFIG.riskThresholds.high) {
    riskLevel = RiskLevel.HIGH;
  } else if (totalScore >= CONFIG.riskThresholds.medium) {
    riskLevel = RiskLevel.MEDIUM;
  }

  return {
    status: AnalysisStatus.ANALYZED,
    riskLevel,
    totalScore,
    pageType,
    analyzedAt: new Date().toISOString(),
    url: pageData.url,
    domain: new URL(pageData.url).hostname,
    checks: checks,
  };

  // TODO: add ERROR status for errors
}
