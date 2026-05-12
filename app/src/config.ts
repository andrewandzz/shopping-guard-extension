export const CONFIG = {
  keywords: {
    aggressiveMarketing: [
      "тільки сьогодні",
      "залишилось",
      "встигн",
      "акці",
      "зниж",
      "останні товари",
      "обмежена пропозиція",
    ],
    contact: ["контакт", "адреса", "email", "@", "телефон"],
    discount: [
      //     "знижка",
      //     "акція",
      //     "стара ціна",
      //     "нова ціна",
      //     "ціна сьогодні",
      //     "розпродаж",
    ],
    legal: [
      "єдрпоу",
      "іпн",
      "фоп",
      "тов",
      "юридична адреса",
      "оферт",
      "політика конфіденційності",
      "умови використання",
      "реквізити",
    ],
    return: ["повернення", "обмін", "refund", "return"],
    review: [
      //     "відгук",
      //     "відгуки",
      //     "реальний покупець",
      //     "рекомендую",
      //     "замовляла",
      //     "замовляв",
      //     "отримала",
      //     "отримав",
      //     "дуже задоволена",
      //     "дуже задоволений",
    ],
    warranty: ["гарант", "warranty"],
    pageType: {
      product: ["купити", "замовити", "ціна", "грн", "₴"],
      normalShop: [
        "кошик",
        "додати в кошик",
        "особистий кабінет",
        "фільтр",
        "сортування",
      ],
      checkout: ["оформлення замовлення"],
    },
    form: {
      name: ["ім'я", "ім’я", "name"],
      phone: ["телефон", "phone", "tel"],
      submit: ["замовити", "купити", "order"],
      delivery: [
        "адрес",
        "міст",
        "відділення",
        "пошт",
        "доставк",
        "delivery",
        "address",
        "city",
      ],
    },
  },

  domainZones: {
    trusted: [
      ".ua",
      ".com",
      ".net",
      ".org",
      ".shop",
      ".store",
      ".biz",
      ".info",
    ],
    suspicious: [
      ".tk",
      ".ml",
      ".ga",
      ".cf",
      ".gq",
      ".xyz",
      ".top",
      ".site",
      ".online",
      ".click",
    ],
  },

  //   landingWords: {
  //     required: ["замовити", "акція", "відгуки"],
  //     normalShopSigns: [
  //       "каталог",
  //       "про нас",
  //       "блог",
  //       "особистий кабінет",
  //       "кошик",
  //     ],
  //   },

  riskThresholds: {
    medium: 3,
    high: 7,
  },

  riskScores: {
    noReturnPolicy: 2,
    noWarranty: 2,
    noContacts: 2,
    aggressiveMarketing: 1,
    // fakeReviews: 1,
    nameAndPhoneOnlyForm: 2,
    noLegalInfo: 2,
    // suspiciousPrice: 1,
    // onePageStructure: 1,
    nonTrustedDomainZone: 1,
    suspiciousDomainZone: 1,
  },

  //   suspiciousPrice: {
  //     maxLowPrice: 299,
  //   },

  //   reviewCheck: {
  //     minReviewWords: 4,
  //   },
  messages: {
    noReturnPolicy: "Не знайдено інформацію про повернення або обмін товару.",
    noWarranty: "Не знайдено інформацію про гарантію.",
    noContacts: "Не знайдено контактної інформації продавця.",
    aggressiveMarketing: "Виявлено ознаки агресивної реклами.",
    // fakeReviews:
    //   "На сторінці виявлено багато типових слів із відгуків. Можлива наявність шаблонних або фейкових відгуків.",
    nameAndPhoneOnlyForm:
      "У формі замовлення не знайдено полів для введення адреси або даних про доставку.",
    noLegalInfo: "Не знайдено юридичної інформації про продавця.",
    // suspiciousPrice:
    //   "Виявлено ознаки підозріло низької ціни разом з акційними формулюваннями.",
    // onePageStructure:
    //   "Сторінка схожа на односторінковий продаючий сайт без повноцінної структури інтернет-магазину.",
    suspiciousDomainZone:
      "Домен сайту має нетипову або потенційно підозрілу доменну зону.",
    notProductPage: "Сторінка не схожа на сторінку продажу товару.",
    normalShopPage:
      "Сторінка схожа на звичайний інтернет-магазин або маркетплейс.",
  },

  ui: {
    popupTitle: "Shopping Guard",
    riskLevelLabel: "Рівень ризику",
    riskScoreLabel: "Бали ризику",
    pageTypeLabel: "Тип сторінки",
    signalsTitle: "Виявлені ознаки",
    noAnalysisYet: "Результат аналізу поки що недоступний.",
    noRiskSignals: "Підозрілих ознак не виявлено.",
    riskLevelPending: "аналіз ще не виконано",
    valueUnavailable: "—",
    riskLevels: {
      high: "високий",
      medium: "середній",
      low: "низький",
      not_analyzed: "не аналізувався",
    },
    pageTypes: {
      not_product_page: "не товарна сторінка",
      normal_shop_page: "звичайний інтернет-магазин",
      // quick_order_landing: "landing page зі швидким замовленням",
      unknown_product_page: "невизначена товарна сторінка",
    },
  },

  backgroundUi: {
    titles: {
      highRisk: "Shopping Guard: Виявлено високий ризик!",
      mediumRisk: "Shopping Guard: Можливий ризик.",
      lowRisk: "Shopping Guard: Низький рівень ризику.",
      notAnalyzed: "Shopping Guard: Сторінка не підлягає аналізу.",
      default: "Shopping Guard",
    },
    badges: {
      highRisk: {
        text: "X",
        color: "#d93025",
      },
      mediumRisk: {
        text: "!",
        color: "#f9ab00",
      },
      lowRisk: {
        text: "\u2713",
        color: "#22c55e",
      },
      notAnalyzed: {
        text: "\u2014",
        color: "#f0f0f0",
      },
    },
    icons: {
      danger: {
        16: "icons/red16.png",
        48: "icons/red48.png",
      },
      warning: {
        16: "icons/amber16.png",
        48: "icons/amber48.png",
      },
      safe: {
        16: "icons/green16.png",
        48: "icons/green48.png",
      },
      neutral: {
        16: "icons/grey16.png",
        48: "icons/grey48.png",
      },
    },
  },
};
