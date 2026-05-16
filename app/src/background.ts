import { analyzePageData } from "./analysis";
import { CONFIG } from "./config";
import { AnalysisResult } from "./models/analysis-result.model";
import { AnalysisStatus } from "./models/analysis-status.model";
import { RiskLevel } from "./models/risk-level.model";
import { SiteRule } from "./models/site-rule.model";

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;

  if (!tab.url || !tab.url.startsWith("http")) return;

  // const items = await chrome.storage.local.get('site_rules');
  // const rules = items['site_rules'] as SiteRule[] ?? [];

  const domain = new URL(tab.url!).hostname;

  if (await isSiteIgnored(domain)) {
    // no analysis conducted
    const analysisResult: AnalysisResult = {
      status: AnalysisStatus.NOT_ANALYZED,
      domain: domain, // TODO: maybe not needed
    };

    updateExtensionStatus(tabId, 'neutral');

    chrome.storage.local.set({
      [`analysis_${tabId}`]: analysisResult,
    });

    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId },
      files: ["content.js"],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Script injection error:",
          chrome.runtime.lastError.message,
        );
        return;
      }

      chrome.tabs.sendMessage(
        tabId,
        { action: "GET_PAGE_DATA" },
        async (response) => {
          if (chrome.runtime.lastError) {
            console.error("Message error:", chrome.runtime.lastError.message);
            return;
          }

          if (!response) return;

          const pageData = {
            ...response,
            url: tab.url,
          };

          const analysisResult = analyzePageData(pageData);

          if (await isSiteMarkedAsSafe(domain)) {
            updateExtensionStatus(tabId, 'safe');
          } else {
            switch (analysisResult.riskLevel) {
              case RiskLevel.HIGH:
                updateExtensionStatus(tabId, 'danger');
                break;
              case RiskLevel.MEDIUM:
                updateExtensionStatus(tabId, 'warning');
                break;
              case RiskLevel.LOW:
                updateExtensionStatus(tabId, 'safe');
                break;
            }
          }


          chrome.storage.local.set({
            [`analysis_${tabId}`]: analysisResult,
          });
        },
      );
    },
  );
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(`analysis_${tabId}`);
});

function updateExtensionStatus(tabId: number, status: 'danger' | 'warning' | 'safe' | 'neutral') {
  switch (status) {
    case "danger":
      return setDangerIcon(tabId);
    case "warning":
      return setWarningIcon(tabId);
    case "safe":
      return setSafeIcon(tabId);
    case 'neutral':
      return setNeutralIcon(tabId);
  }
}

function setDangerIcon(tabId: number) {
  chrome.action.setBadgeText({
    tabId,
    text: CONFIG.backgroundUi.badges.highRisk.text,
  });
  chrome.action.setBadgeBackgroundColor({
    tabId,
    color: CONFIG.backgroundUi.badges.highRisk.color,
  });
  chrome.action.setTitle({
    tabId,
    title: CONFIG.backgroundUi.titles.highRisk,
  });
  chrome.action.setIcon({
    tabId,
    path: CONFIG.backgroundUi.icons.danger,
  });
}

function setWarningIcon(tabId: number) {
  chrome.action.setBadgeText({
    tabId,
    text: CONFIG.backgroundUi.badges.mediumRisk.text,
  });
  chrome.action.setBadgeBackgroundColor({
    tabId,
    color: CONFIG.backgroundUi.badges.mediumRisk.color,
  });
  chrome.action.setTitle({
    tabId,
    title: CONFIG.backgroundUi.titles.mediumRisk,
  });
  chrome.action.setIcon({
    tabId,
    path: CONFIG.backgroundUi.icons.warning,
  });
}

function setSafeIcon(tabId: number) {
  chrome.action.setBadgeText({
    tabId,
    text: CONFIG.backgroundUi.badges.lowRisk.text,
  });
  chrome.action.setBadgeBackgroundColor({
    tabId,
    color: CONFIG.backgroundUi.badges.lowRisk.color,
  });
  chrome.action.setTitle({
    tabId,
    title: CONFIG.backgroundUi.titles.lowRisk,
  });
  chrome.action.setIcon({
    tabId,
    path: CONFIG.backgroundUi.icons.safe,
  });
}

function setNeutralIcon(tabId: number) {
  chrome.action.setBadgeText({
    tabId,
    text: CONFIG.backgroundUi.badges.notAnalyzed.text,
  });
  chrome.action.setBadgeBackgroundColor({
    tabId,
    color: CONFIG.backgroundUi.badges.notAnalyzed.color,
  });
  chrome.action.setTitle({
    tabId,
    title: CONFIG.backgroundUi.titles.notAnalyzed,
  });
  chrome.action.setIcon({
    tabId,
    path: CONFIG.backgroundUi.icons.neutral,
  });
}

async function isSiteIgnored(domain: string): Promise<boolean> {
  const items = await chrome.storage.local.get('site_rules');
  const rules = items['site_rules'] as SiteRule[] ?? [];
  return rules.some(rule => rule.domain === domain && rule.action === 'ignore');
}

async function isSiteMarkedAsSafe(domain: string): Promise<boolean> {
  const items = await chrome.storage.local.get('site_rules');
  const rules = items['site_rules'] as SiteRule[] ?? [];
  return rules.some(rule => rule.domain === domain && rule.action === 'mark_as_safe');
}