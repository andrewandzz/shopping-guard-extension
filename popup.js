/// <reference types="chrome" />

document.addEventListener("DOMContentLoaded", async () => {
  setStaticPopupTexts();

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab) return;

  const key = `analysis_${tab.id}`;

  chrome.storage.local.get(key, (data) => {
    const result = data[key];

    if (!result) {
      document.getElementById("risk-level").textContent =
        `${CONFIG.ui.riskLevelLabel}: ${CONFIG.ui.riskLevelPending}`;

      document.getElementById("risk-score").textContent =
        `${CONFIG.ui.riskScoreLabel}: ${CONFIG.ui.valueUnavailable}`;

      document.getElementById("page-type").textContent =
        `${CONFIG.ui.pageTypeLabel}: ${CONFIG.ui.valueUnavailable}`;

      document.getElementById("message").textContent = CONFIG.ui.noAnalysisYet;

      return;
    }

    document.getElementById("risk-level").textContent =
      `${CONFIG.ui.riskLevelLabel}: ${formatRiskLevel(result.riskLevel)}`;

    document.getElementById("risk-score").textContent =
      `${CONFIG.ui.riskScoreLabel}: ${result.totalScore}`;

    document.getElementById("page-type").textContent =
      `${CONFIG.ui.pageTypeLabel}: ${formatPageType(result.pageType)}`;

    document.getElementById("message").textContent = result.message || "";

    const signalsList = document.getElementById("risk-signals");
    signalsList.innerHTML = "";

    if (!result.signals || result.signals.length === 0) {
      const li = document.createElement("li");
      li.textContent = CONFIG.ui.noRiskSignals;
      signalsList.appendChild(li);

      return;
    }

    result.signals.forEach((signal) => {
      const li = document.createElement("li");
      li.textContent = signal.message;
      signalsList.appendChild(li);
    });
  });
});

function setStaticPopupTexts() {
  document.getElementById("popup-title").textContent = CONFIG.ui.popupTitle;
  document.getElementById("signals-title").textContent = CONFIG.ui.signalsTitle;
}

function formatRiskLevel(riskLevel) {
  return CONFIG.ui.riskLevels[riskLevel] || CONFIG.ui.valueUnavailable;
}

function formatPageType(pageType) {
  return CONFIG.ui.pageTypes[pageType] || CONFIG.ui.valueUnavailable;
}
