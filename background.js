importScripts("analysis.js", "config.js");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;

  if (!tab.url || !tab.url.startsWith("http")) return;

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
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Message error:", chrome.runtime.lastError.message);
            return;
          }

          if (!response) return;

          const pageData = {
            ...response,
            url: tab.url,
          };

          const result = analyzePageData(pageData);

          updateExtensionStatus(tabId, result);

          chrome.storage.local.set({
            [`analysis_${tabId}`]: result,
          });
        },
      );
    },
  );
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(`analysis_${tabId}`);
});

function updateExtensionStatus(tabId, result) {
  switch (result.riskLevel) {
    case "high":
      setDangerIcon(tabId);
      break;
    case "medium":
      setWarningIcon(tabId);
      break;
    case "low":
      setSafeIcon(tabId);
      break;
    default:
      setNeutralIcon(tabId);
      break;
  }
}

function setDangerIcon(tabId) {
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

function setWarningIcon(tabId) {
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

function setSafeIcon(tabId) {
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

function setNeutralIcon(tabId) {
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
