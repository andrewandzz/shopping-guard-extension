import { CONFIG } from "./config";
import { AnalysisCheck } from "./models/analysis-check.model";
import { AnalysisResult } from "./models/analysis-result.model";
import { AnalysisStatus } from "./models/analysis-status.model";
import { FormData } from "./models/form-data.model";
import { PageData } from "./models/page-data.model";
import { PageType } from "./models/page-type.model";
import { PriceData } from "./models/price-data.model";
import { RiskLevel } from "./models/risk-level.model";

/**
 * Checks whether the page text contains information about return policy.
 */
function checkReturnPolicy(text: string): AnalysisCheck {
  const hasReturnPolicy = hasAnyKeywordGroup(text.toLowerCase(), CONFIG.keywords.return);

  return {
    id: 'return_policy',
    status: hasReturnPolicy ? 'passed' : 'failed',
    riskScore: CONFIG.checks.returnPolicy.riskScore
  }
}

/**
 * Checks whether the page text contains information about warranty.
 */
function checkWarranty(text: string): AnalysisCheck {
  const hasWarrantyInfo = hasAnyKeywordGroup(text.toLowerCase(), CONFIG.keywords.warranty);

  return {
    id: 'warranty',
    status: hasWarrantyInfo ? 'passed' : 'failed',
    riskScore: CONFIG.checks.warranty.riskScore
  };
}

/**
 * Checks whether the page text contains contacts information.
 */
function checkContacts(text: string): AnalysisCheck {
  const hasContatsInfo = hasAnyKeywordGroup(text.toLowerCase(), CONFIG.keywords.contact);

  return {
    id: 'contacts',
    status: hasContatsInfo ? 'passed' : 'failed',
    riskScore: CONFIG.checks.contacts.riskScore
  }
}

/**
 * Checks whether the page text contains agressive marketing trigger words.
 */
function checkAggressiveMarketing(text: string): AnalysisCheck {
  const hasAggressiveMarketing = hasAnyKeywordGroup(text.toLowerCase(), CONFIG.keywords.aggressiveMarketing);

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
 * Checks whether the page text contains legal information. 
 */
function checkLegalInfo(text: string): AnalysisCheck {
  const hasLegalInfo = hasAnyKeywordGroup(text.toLowerCase(), CONFIG.keywords.legal);

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

    const hasNameField = hasAnyKeywordGroup(formContent, CONFIG.keywords.form.name);
    const hasPhoneField = hasAnyKeywordGroup(formContent, CONFIG.keywords.form.phone);
    const hasDeliveryField = hasAnyKeywordGroup(formContent, CONFIG.keywords.form.delivery);

    return hasNameField && hasPhoneField && !hasDeliveryField;
  });

  return {
    id: 'name_and_phone_only_form',
    status: hasSuspiciousForm ? 'failed' : 'passed',
    riskScore: CONFIG.checks.nameAndPhoneOnlyForm.riskScore,
  };
}

/**
 * Checks whether the website has a suspicious domain zone.
 */
function checkDomain(url: string): AnalysisCheck {
  const hostname = new URL(url).hostname.toLowerCase();

  const hasSuspiciousZone = CONFIG.domainZones.suspicious.some((zone) =>
    hostname.endsWith(zone),
  );

  return {
    id: 'domain_zone',
    status: hasSuspiciousZone ? 'failed' : 'passed',
    riskScore: CONFIG.checks.domainZone.riskScore,
  };
}

/**
 * Checks whether the page text contains potentially fake reviews.
 */
function checkFakeReviews(text: string): AnalysisCheck {
  const textLower = text.toLowerCase();

  const reviewKeywords = CONFIG.keywords.review;

  const positiveReviewPhrasesCount = reviewKeywords.substrings.filter((keyword) => textLower.includes(keyword)).length;

  const hasReviewSection =
    textLower.includes('відгуки') ||
    textLower.includes('відгук') ||
    textLower.includes('reviews') ||
    textLower.includes('review');

  const hasManyFiveStars =
    (textLower.match(/5\s*\/\s*5/g) || []).length >= 3 ||
    (textLower.match(/★★★★★/g) || []).length >= 3;

  const hasSuspiciousReviewPattern =
    hasReviewSection &&
    positiveReviewPhrasesCount >= 5 &&
    hasManyFiveStars;

  return {
    id: 'reviews',
    status: hasSuspiciousReviewPattern ? 'failed' : 'passed',
    riskScore: CONFIG.checks.reviews.riskScore,
  };
}

/**
 * Checks whether the page text or prices data contains suspiciously big discount.
 */
function checkSuspiciousDiscount(text: string, pricesData: PriceData[]): AnalysisCheck {
  const textLower = text.toLowerCase();

  const hasStructuredSuspiciousPriceDrop = hasSuspiciousPriceDrop(pricesData);
  const hasTextSuspiciousPriceDrop = hasNearbySuspiciousPriceDrop(textLower);

  const hasSuspiciousDiscount = hasStructuredSuspiciousPriceDrop ?? hasTextSuspiciousPriceDrop;

  return {
    id: 'discount',
    status: hasSuspiciousDiscount ? 'failed' : 'passed',
    riskScore: CONFIG.checks.discount.riskScore,
  };
}

function hasSuspiciousPriceDrop(pricesData: PriceData[]): boolean | null {
  const oldPrices = pricesData.filter((price) => price.value !== null && isOldPrice(price));
  const newPrices = pricesData.filter((price) => price.value !== null && isNewPrice(price));

  const suspiciousDiscountThreshold = 40;

  let foundPrice = false;

  for (const oldPrice of oldPrices) {
    for (const newPrice of newPrices) {
      if (!oldPrice.value || !newPrice.value) {
        continue;
      }

      if (oldPrice.value <= newPrice.value) {
        continue;
      }

      foundPrice = true;

      const discountPercent =
        ((oldPrice.value - newPrice.value) / oldPrice.value) * 100;

      if (discountPercent >= suspiciousDiscountThreshold) {
        return true;
      }
    }
  }

  if (foundPrice) {
    return false;
  } else {
    return null;
  }
}

function isOldPrice(price: PriceData): boolean {
  const markerText = `${price.className} ${price.id} ${price.nearbyText}`.toLowerCase();
  const hasOldPriceMarker = hasAnyKeywordGroup(markerText, CONFIG.keywords.discount.oldPrice);
  return hasOldPriceMarker;
}

function isNewPrice(price: PriceData): boolean {
  const markerText = `${price.className} ${price.id} ${price.nearbyText}`.toLowerCase();
  const hasNewPriceMarker = hasAnyKeywordGroup(markerText, CONFIG.keywords.discount.newPrice);
  return hasNewPriceMarker;
}

function hasNearbySuspiciousPriceDrop(text: string): boolean {
  const prices = extractPricesFromText(text);

  const maxDistanceBetweenPrices = 20;
  const suspiciousDiscountThreshold = 40;

  for (let i = 0; i < prices.length - 1; i++) {
    const firstPrice = prices[i];
    const secondPrice = prices[i + 1];

    if (firstPrice.currency !== secondPrice.currency) {
      continue;
    }

    const distance = secondPrice.index - firstPrice.index;

    if (distance > maxDistanceBetweenPrices) {
      continue;
    }

    const oldPrice = Math.max(firstPrice.value, secondPrice.value);
    const newPrice = Math.min(firstPrice.value, secondPrice.value);

    const discountPercent = ((oldPrice - newPrice) / oldPrice) * 100;

    if (discountPercent >= suspiciousDiscountThreshold) {
      return true;
    }
  }

  return false;
}

function extractPricesFromText(text: string): { value: number; index: number; currency: string }[] {
  const priceRegex = /(\d[\d\s.,]*)\s*(грн|₴|uah|usd|\$|eur|€)/gi;

  return Array.from(text.matchAll(priceRegex))
    .map((match) => {
      const value = Number(
        match[1]
          .replace(/\s/g, '')
          .replace(',', '.'),
      );

      return {
        value,
        index: match.index ?? 0,
        currency: match[2].toLowerCase(),
      };
    })
    .filter((price) => !Number.isNaN(price.value) && price.value > 0);
}

function detectPageType(urlStr: string, text: string, formsData: FormData[]): PageType {
  const url = new URL(urlStr);
  const hostname = url.hostname.replace(/^www\./, '');
  const pathname = url.pathname.toLowerCase();
  const textLower = text.toLowerCase();

  if (isExcludedPlatform(hostname, pathname)) {
    return PageType.NOT_PRODUCT_PAGE;
  }

  if (isSearchResultsPage(hostname, pathname, url.search)) {
    return PageType.NOT_PRODUCT_PAGE;
  }

  if (isVideoOrContentPlatform(hostname)) {
    return PageType.NOT_PRODUCT_PAGE;
  }

  if (hasStrongProductPageSignals(textLower, formsData)) {
    return PageType.PRODUCT_PAGE;
  }

  if (hasWeakProductWords(textLower)) {
    return PageType.PRODUCT_PAGE;
  }

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
  const hasPrice = /\d+[\s.,]?\d*\s*(грн|₴|uah|usd|\$|eur|€)/i.test(textLower);

  const hasOrderForm = formsData.some(form => {
    const formText = [
      form.text,
      ...form.labels,
      ...form.names,
      ...form.ids,
      ...form.placeholders,
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

  const hasDeliveryOrPayment =
    textLower.includes('доставка') ||
    textLower.includes('оплата') ||
    textLower.includes('накладений платіж') ||
    textLower.includes('payment') ||
    textLower.includes('delivery');

  return (
    hasOrderForm ||
    (hasPrice && hasDeliveryOrPayment)
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
    checkFakeReviews(pageData.text),
    checkSuspiciousDiscount(pageData.text, pageData.pricesData),
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasWholeWord(text: string, word: string): boolean {
  const escapedWord = escapeRegExp(word);

  const regex = new RegExp(
    `(^|[^\\p{L}\\p{N}_])${escapedWord}($|[^\\p{L}\\p{N}_])`,
    'iu',
  );

  return regex.test(text);
}

function hasAnySubstring(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

function hasAnyWholeWord(text: string, words: string[]): boolean {
  return words.some((word) => hasWholeWord(text, word));
}

function hasAnyKeywordGroup(
  text: string,
  keywords: {
    substrings?: string[];
    wholeWords?: string[];
  },
): boolean {
  return (
    hasAnySubstring(text, keywords.substrings ?? []) ||
    hasAnyWholeWord(text, keywords.wholeWords ?? [])
  );
}
