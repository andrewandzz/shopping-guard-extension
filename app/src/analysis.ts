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
  if (!formsData || formsData.length === 0) {
    return {
      id: 'name_and_phone_only_form',
      status: 'passed',
      riskScore: CONFIG.checks.nameAndPhoneOnlyForm.riskScore,
    };
  }

  const hasSuspiciousForm = formsData.some((formData) => {
    const formContent = Object.values(formData)
      .flat()
      .join(' ')
      .toLowerCase();

    const hasNameField = CONFIG.keywords.form.name.some((keyword) =>
      formContent.includes(keyword),
    );

    const hasPhoneField = CONFIG.keywords.form.phone.some((keyword) =>
      formContent.includes(keyword),
    );

    const hasDeliveryField = CONFIG.keywords.form.delivery.some((keyword) =>
      formContent.includes(keyword),
    );

    return hasNameField && hasPhoneField && !hasDeliveryField;
  });

  return {
    id: 'name_and_phone_only_form',
    status: hasSuspiciousForm ? 'failed' : 'passed',
    riskScore: CONFIG.checks.nameAndPhoneOnlyForm.riskScore,
  };
}

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

function detectPageType(urlStr: string, text: string, formsData: FormData[]): PageType {
  const url = new URL(urlStr);
  const hostname = url.hostname.replace(/^www\./, '');
  const pathname = url.pathname.toLowerCase();
  const textLower = text.toLowerCase();

  if (isExcludedPlatform(hostname, pathname)) {
    console.log('is excluded platform');
    return PageType.NOT_PRODUCT_PAGE;
  }

  if (isSearchResultsPage(hostname, pathname, url.search)) {
    console.log('isSearchResultsPage');
    return PageType.NOT_PRODUCT_PAGE;
  }

  if (isVideoOrContentPlatform(hostname)) {
    console.log('isVideoOrContentPlatform');
    return PageType.NOT_PRODUCT_PAGE;
  }

  if (hasStrongProductPageSignals(textLower, formsData)) {
    console.log('hasStrongProductPageSignals');
    return PageType.SUSPICIOUS_SHOP_PAGE;
  }

  if (hasWeakProductWords(textLower)) {
    console.log('hasWeakProductWords');
    return PageType.NORMAL_SHOP_PAGE;
  }

  console.log('default');
  return PageType.NOT_PRODUCT_PAGE;
}

function isExcludedPlatform(hostname: string, pathname: string): boolean {
  const excludedDomains = [
    'google.com',
    'google.com.ua',
    'youtube.com',
    'youtu.be',
    'facebook.com',
    'instagram.com',
    'tiktok.com',
    'x.com',
    'twitter.com',
    'wikipedia.org',
    'github.com'
  ];

  return excludedDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
}

function isSearchResultsPage(hostname: string, pathname: string, search: string): boolean {
  const searchEngines = [
    'google.com',
    'google.com.ua',
    'bing.com',
    'duckduckgo.com',
    'yahoo.com'
  ];

  const isSearchEngine = searchEngines.some(domain =>
    hostname === domain || hostname.endsWith(`.${domain}`)
  );

  if (!isSearchEngine) {
    return false;
  }

  return (
    pathname.includes('/search') ||
    search.includes('q=') ||
    search.includes('query=') ||
    search.includes('p=')
  );
}

function isVideoOrContentPlatform(hostname: string): boolean {
  const contentPlatforms = [
    'youtube.com',
    'youtu.be',
    'tiktok.com',
    'instagram.com',
    'facebook.com'
  ];

  return contentPlatforms.some(domain =>
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

function hasStrongProductPageSignals(textLower: string, formsData: FormData[]): boolean {
  // const text = text.toLowerCase();

  console.log(textLower);

  const hasPrice = /\d+[\s.,]?\d*\s*(грн|₴|uah|usd|\$|eur|€)/i.test(textLower);

  console.log('hasPrice' + hasPrice);

  const hasBuyButton = formsData.some(form => {
    const buttonsText = form.buttons.join(' ').toLowerCase();

    return (
      buttonsText.includes('купити') ||
      buttonsText.includes('замовити') ||
      buttonsText.includes('додати в кошик') ||
      buttonsText.includes('оформити замовлення') ||
      buttonsText.includes('buy') ||
      buttonsText.includes('order') ||
      buttonsText.includes('add to cart')
    );
  });

  console.log('hasBuyButton' + hasBuyButton);

  const hasOrderForm = formsData.some(form => {
    const formText = [
      form.text,
      ...form.labels,
      ...form.names,
      ...form.ids,
      ...form.buttons
    ].join(' ').toLowerCase();

    const hasNameField =
      formText.includes('імʼя') ||
      formText.includes("ім'я") ||
      formText.includes('name');

    const hasPhoneField =
      formText.includes('телефон') ||
      formText.includes('phone') ||
      formText.includes('номер');

    const hasOrderAction =
      formText.includes('замовити') ||
      formText.includes('купити') ||
      formText.includes('order');

    return hasNameField && hasPhoneField && hasOrderAction;
  });

  console.log('hasOrderForm' + hasOrderForm);

  const hasDeliveryOrPayment =
    textLower.includes('доставка') ||
    textLower.includes('оплата') ||
    textLower.includes('накладений платіж') ||
    textLower.includes('payment') ||
    textLower.includes('delivery');

  console.log('hasDeliveryOrPayment' + hasDeliveryOrPayment);

  return (
    hasPrice && hasBuyButton ||
    hasOrderForm ||
    hasPrice && hasDeliveryOrPayment
  );
}

function hasWeakProductWords(text: string): boolean {
  const hasPrice = /\d+[\s.,]?\d*\s*(грн|₴|uah|usd|\$|eur|€)/i.test(text);

  const productWords = [
    'купити',
    'замовити',
    'доставка',
    'оплата',
    'товар',
    'кошик',
    'гарантія'
  ];

  const matchedCount = productWords.filter(word => text.includes(word)).length;

  return hasPrice && matchedCount >= 2;
}

export function analyzePageData(pageData: PageData): AnalysisResult {
  const pageType = detectPageType(pageData.url, pageData.text, pageData.formsData);

  if (pageType === PageType.NOT_PRODUCT_PAGE) {
    return {
      status: AnalysisStatus.NOT_APPLICABLE,
      pageType,
      riskLevel: RiskLevel.LOW,
      totalScore: 0,
      domain: new URL(pageData.url).hostname,
      checks: [],
    };
  }

  const allChecks: AnalysisCheck[] = [
    checkReturnPolicy(pageData.text),
    checkWarranty(pageData.text),
    checkContacts(pageData.text),
    checkAggressiveMarketing(pageData.text),
    checkLegalInfo(pageData.text),
    checkFormsRequireDeliveryInfo(pageData.formsData),
    checkDomain(pageData.url),
  ];

  const totalScore = calculateTotalScore(allChecks);
  const riskLevel = calculateRiskLevel(totalScore);

  return {
    status: AnalysisStatus.ANALYZED,
    riskLevel,
    totalScore,
    pageType,
    analyzedAt: new Date().toISOString(),
    domain: new URL(pageData.url).hostname,
    checks: allChecks,
  };

  // TODO: add ERROR status for errors
}

function calculateTotalScore(checks: AnalysisCheck[]): number {
  const failedScore = checks
    .filter((check) => check.status === 'failed')
    .reduce((sum, check) => sum + check.riskScore, 0);

  const maxPossibleScore = checks
    .reduce((sum, check) => sum + check.riskScore, 0);

  if (maxPossibleScore === 0) {
    return 0;
  }

  const normalizedScore = (failedScore / maxPossibleScore) * 10;

  return Math.round(normalizedScore);
}

function calculateRiskLevel(totalScore: number) {
  if (totalScore >= CONFIG.riskThresholds.high) {
    return RiskLevel.HIGH;
  }

  if (totalScore >= CONFIG.riskThresholds.medium) {
    return RiskLevel.MEDIUM;
  }

  return RiskLevel.LOW;
}
