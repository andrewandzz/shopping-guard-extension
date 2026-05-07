importScripts("rules.js");

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
      setGreenIcon(tabId);
      break;
    default:
      setWhiteIcon(tabId);
      break;
  }
}

function setDangerIcon(tabId) {
  chrome.action.setBadgeText({ tabId, text: "X" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#d93025" });
  chrome.action.setTitle({
    tabId,
    title: "Shopping Guard: Виявлено високий ризик!",
  });
  chrome.action.setIcon({
    tabId,
    path: {
      16: "icons/red16.png",
      48: "icons/red48.png",
    },
  });
}

function setWarningIcon(tabId) {
  chrome.action.setBadgeText({ tabId, text: "!" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#f9ab00" });
  chrome.action.setTitle({
    tabId,
    title: "Shopping Guard: Можливий ризик.",
  });
  chrome.action.setIcon({
    tabId,
    path: {
      16: "icons/amber16.png",
      48: "icons/amber48.png",
    },
  });
}

function setGreenIcon(tabId) {
  chrome.action.setBadgeText({ tabId, text: "\u2713" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#22c55e" });
  chrome.action.setTitle({
    tabId,
    title: "Shopping Guard: Низький рівень ризику.",
  });
  chrome.action.setIcon({
    tabId,
    path: {
      16: "icons/green16.png",
      48: "icons/green48.png",
    },
  });
}

function setWhiteIcon(tabId) {
  chrome.action.setBadgeText({ tabId, text: "\u2014" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#f0f0f0" });
  chrome.action.setTitle({
    tabId,
    title: "Shopping Guard: Сторінка не підлягає аналізу.",
  });
  chrome.action.setIcon({
    tabId,
    path: {
      16: "icons/grey16.png",
      48: "icons/grey48.png",
    },
  });
}
