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

  checks: {
    returnPolicy: {
      riskScore: 2,
      message: "Відсутня інформація про повернення товару",
      label: "Повернення",
      icon: "",
      statuses: {
        positive: "знайдено",
        negative: "не знайдено"
      }
    },
    warranty: {
      riskScore: 2,
      message: "Немає інформації про гарантію",
      label: "Гарантія",
      icon: "",
      statuses: {
        positive: "знайдено",
        negative: "не знайдено"
      }
    },
    contacts: {
      riskScore: 2,
      message: "Відсутня контактна інформація",
      label: "Контакти",
      icon: "",
      statuses: {
        positive: "присутні",
        negative: "відсутні"
      }
    },
    legalInfo: {
      riskScore: 2,
      message: "Немає юридичних даних продавця",
      label: "Юридичні дані",
      icon: "",
      statuses: {
        positive: "присутні",
        negative: "відсутні"
      }
    },
    aggressiveMarketing: {
      riskScore: 1,
      message: "Агресивні маркетингові формулювання",
      label: "Агресивний маркетинг",
      icon: "",
      statuses: {
        positive: "не виявлено",
        negative: "виявлено"
      }
    },
    nameAndPhoneOnlyForm: {
      riskScore: 2,
      message: "Форма без інформації про доставку",
      label: "Форма замовлення",
      icon: "",
      statuses: {
        positive: "повна",
        negative: "лише ім'я та телефон"
      }
    },
    domainZone: {
      riskScore: 2,
      message: "Потенційно підозріла доменна зона",
      label: "Доменна зона",
      icon: "",
      statuses: {
        positive: "типова",
        negative: "підозріла"
      }
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
        text: "-",
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
