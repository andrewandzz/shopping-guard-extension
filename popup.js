/// <reference types="chrome" />

document.addEventListener("DOMContentLoaded", async () => {
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
        "Рівень ризику: аналіз ще не виконано";
      document.getElementById("risk-score").textContent = "Бали ризику: —";
      document.getElementById("page-type").textContent = "Тип сторінки: —";
      document.getElementById("message").textContent =
        "Результат аналізу поки що недоступний.";
      return;
    }

    document.getElementById("risk-level").textContent =
      `Рівень ризику: ${result.riskLevel}`;

    document.getElementById("risk-score").textContent =
      `Бали ризику: ${result.totalScore}`;

    document.getElementById("page-type").textContent =
      `Тип сторінки: ${formatPageType(result.pageType)}`;

    document.getElementById("message").textContent = result.message || "";

    const signalsList = document.getElementById("risk-signals");
    signalsList.innerHTML = "";

    if (!result.signals || result.signals.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Підозрілих ознак не виявлено.";
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

function formatPageType(pageType) {
  switch (pageType) {
    case "not_product_page":
      return "не товарна сторінка";
    case "normal_shop_page":
      return "звичайний інтернет-магазин";
    // case "quick_order_landing":
    // return "landing page зі швидким замовленням";
    case "unknown_product_page":
      return "невизначена товарна сторінка";
    default:
      return "невідомо";
  }
}
