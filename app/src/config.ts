export const CONFIG = {
  keywords: {
    aggressiveMarketing: {
      substrings: [
        "залишилось",
        "встигн",
        "акці",
        "зниж",
        "тільки сьогодні",
        "останні товари",
        "обмежена пропозиція",
      ],
    },
    contact: {
      substrings: [
        "зв’язатися з нами", "зв'язатися з нами", "contact us", "контакт", "адрес", "телефон"
      ],
      wholeWords: [
        "email",
        "e-mail"]
    },
    discount: {
      substrings: [
        "стара ціна",
        "нова ціна",
        "ціна сьогодні",
        "знижк",
        "акці",
        "розпродаж",
      ],
    },
    legal: {
      substrings: [
        "юридична адреса",
        "політика конфіденційності",
        "умови використання",
        "публічна оферта",
        "договір оферти",
        "код єдрпоу",
        "податковий номер",
        "реквізит",
        "оферт",
      ],
      wholeWords: [
        "єдрпоу",
        "іпн",
        "рнокпп",
        "фоп",
        "тов",
      ],
    },
    return: {
      substrings: [
        "повернення товару",
        "обмін товару",
        "умови повернення",
        "return policy",
        "повернен",
        "обмін",
      ],
      wholeWords: [
        "refund",
        "return",
      ],
    },
    review: {
      substrings: [
        "реальний покупець",
        "дуже задоволена",
        "дуже задоволений",
        "відгук",
        "рекомендую",
        "замовляла",
        "замовляв",
        "отримала",
        "отримав",
      ],
    },
    warranty: {
      substrings: [
        "гарантія якості",
        "warranty period",
        "гарант",
        "гаранті",
      ],
      wholeWords: [
        "warranty",
      ],
    },
    pageType: {
      product: {
        substrings: [
          "додати в кошик",
          "оформити замовлення",
          "купити",
          "замовити",
          "₴",
          "$",
          "€",
        ],
        wholeWords: [
          "ціна",
          "грн",
          "uah",
        ],
      },
      normalShop: {
        substrings: [
          "додати в кошик",
          "особистий кабінет",
          "кошик",
          "фільтр",
          "сортування",
          "каталог",
        ],
      },
      checkout: {
        substrings: [
          "оформлення замовлення",
          "оформити замовлення",
          "checkout",
        ],
      },
    },
    form: {
      name: {
        substrings: [
          "ваше ім’я",
          "ваше ім'я",
          "your name",
        ],
        wholeWords: [
          "ім’я",
          "ім'я",
          "name",
          "fullname",
          "full-name",
          "full_name",
          "firstname",
          "first-name",
          "first_name",
        ],
      },
      phone: {
        substrings: [
          "номер телефону",
          "ваш телефон",
          "your phone",
          "phone number",
          "телефон",
        ],
        wholeWords: [
          "phone",
          "tel",
        ],
      },
      submit: {
        substrings: [
          "оформити замовлення",
          "залишити заявку",
          "відправити заявку",
          "submit order",
          "place order",
          "замовити",
          "купити",
        ],
        wholeWords: [
          "order",
          "submit",
          "buy",
        ],
      },
      delivery: {
        substrings: [
          "адреса доставки",
          "місто доставки",
          "відділення пошти",
          "нова пошта",
          "укрпошта",
          "delivery address",
          "адрес",
          "міст",
          "відділен",
          "пошт",
          "доставк",
        ],
        wholeWords: [
          "delivery",
          "address",
          "city",
        ],
      },
    },
  },

  domainZones: {
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
